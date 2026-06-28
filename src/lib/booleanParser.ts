import type { AstNode, BinaryOperator, BooleanValue, NotationInput, ParseFailure, ParseResult, Token, TokenType } from '../types';

let nodeCounter = 0;
const VARIABLE_PATTERN = /^[A-Z][A-Z0-9_]*$/;
const DEFAULT_VARIABLES = ['A', 'B', 'C', 'D', 'E', 'F'];

function isParseFailure(value: AstNode | ParseFailure): value is ParseFailure {
  return 'ok' in value && value.ok === false;
}

function nextId(prefix = 'n'): string {
  nodeCounter += 1;
  return `${prefix}_${nodeCounter}`;
}

function makeVar(name: string): AstNode {
  return { id: nextId('v'), type: 'var', name, display: name };
}

function makeConst(value: BooleanValue): AstNode {
  return { id: nextId('c'), type: 'const', value, display: String(value) };
}

function makeNot(child: AstNode): AstNode {
  const display = child.type === 'var' || child.type === 'const' ? `${child.display}'` : `(${child.display})'`;
  return { id: nextId('not'), type: 'not', child, display };
}

function makeBinary(op: BinaryOperator, left: AstNode, right: AstNode): AstNode {
  const symbolMap: Record<BinaryOperator, string> = {
    AND: '.',
    OR: '+',
    NAND: ' NAND ',
    NOR: ' NOR ',
    XOR: ' XOR ',
    XNOR: ' XNOR ',
  };
  const compactOps: BinaryOperator[] = ['AND', 'OR'];
  const sep = compactOps.includes(op) ? symbolMap[op] : symbolMap[op];
  return {
    id: nextId('bin'),
    type: 'binary',
    op,
    left,
    right,
    display: `${wrapIfNeeded(left, op, 'left')}${sep}${wrapIfNeeded(right, op, 'right')}`,
  };
}

function precedenceOfNode(node: AstNode): number {
  if (node.type === 'var' || node.type === 'const') return 5;
  if (node.type === 'not') return 4;
  if (node.type !== 'binary') return 0;
  if (node.op === 'AND' || node.op === 'NAND') return 3;
  if (node.op === 'XOR' || node.op === 'XNOR') return 2;
  return 1;
}

function precedenceOfOp(op: BinaryOperator): number {
  if (op === 'AND' || op === 'NAND') return 3;
  if (op === 'XOR' || op === 'XNOR') return 2;
  return 1;
}

function wrapIfNeeded(node: AstNode, parentOp: BinaryOperator, side: 'left' | 'right'): string {
  if (node.type !== 'binary') return node.display;
  const childPrec = precedenceOfNode(node);
  const parentPrec = precedenceOfOp(parentOp);
  const needsWrap = childPrec < parentPrec || (side === 'right' && childPrec === parentPrec && node.op !== parentOp);
  return needsWrap ? `(${node.display})` : node.display;
}

function stripAssignment(input: string): string {
  const assignmentIndex = input.indexOf('=');
  return assignmentIndex >= 0 ? input.slice(assignmentIndex + 1) : input;
}

function isOperandEnd(type: TokenType): boolean {
  return type === 'VAR' || type === 'CONST' || type === 'RPAREN' || type === 'POST_NOT';
}

function isOperandStart(type: TokenType): boolean {
  return type === 'VAR' || type === 'CONST' || type === 'LPAREN' || type === 'NOT';
}

export function tokenize(input: string): Token[] | ParseFailure {
  const source = stripAssignment(input);
  const tokens: Token[] = [];
  let i = 0;

  const push = (type: TokenType, value: string, position: number) => {
    const previous = tokens[tokens.length - 1];
    if (previous && isOperandEnd(previous.type) && isOperandStart(type)) {
      tokens.push({ type: 'AND', value: '.', position });
    }
    tokens.push({ type, value, position });
  };

  while (i < source.length) {
    const char = source[i];
    if (/\s/.test(char)) {
      i += 1;
      continue;
    }

    const two = source.slice(i, i + 2);
    if (two === '&&') {
      push('AND', '&&', i);
      i += 2;
      continue;
    }
    if (two === '||') {
      push('OR', '||', i);
      i += 2;
      continue;
    }
    if (two === '!=') {
      push('XNOR', '!=', i);
      i += 2;
      continue;
    }

    if (char === '(') {
      push('LPAREN', char, i);
      i += 1;
      continue;
    }
    if (char === ')') {
      push('RPAREN', char, i);
      i += 1;
      continue;
    }
    if (char === '0' || char === '1') {
      push('CONST', char, i);
      i += 1;
      continue;
    }
    if (char === '!' || char === '~' || char === '¬') {
      push('NOT', char, i);
      i += 1;
      continue;
    }
    if (char === "'" || char === '’') {
      tokens.push({ type: 'POST_NOT', value: char, position: i });
      i += 1;
      continue;
    }
    if (char === '.' || char === '*' || char === '·' || char === '&') {
      push('AND', char, i);
      i += 1;
      continue;
    }
    if (char === '+' || char === '|') {
      push('OR', char, i);
      i += 1;
      continue;
    }
    if (char === '^' || char === '⊕') {
      push('XOR', char, i);
      i += 1;
      continue;
    }
    if (char === '↑') {
      push('NAND', char, i);
      i += 1;
      continue;
    }
    if (char === '↓') {
      push('NOR', char, i);
      i += 1;
      continue;
    }
    if (char === '≡' || char === '↔') {
      push('XNOR', char, i);
      i += 1;
      continue;
    }

    if (/[A-Za-z]/.test(char)) {
      let end = i + 1;
      while (end < source.length && /[A-Za-z0-9_]/.test(source[end])) end += 1;
      const raw = source.slice(i, end);
      const upper = raw.toUpperCase();
      const operatorWords: Record<string, TokenType> = {
        AND: 'AND',
        OR: 'OR',
        NOT: 'NOT',
        NAND: 'NAND',
        NOR: 'NOR',
        XOR: 'XOR',
        XNOR: 'XNOR',
      };
      if (operatorWords[upper]) {
        push(operatorWords[upper], upper, i);
      } else {
        const variableName = upper;
        if (!VARIABLE_PATTERN.test(variableName)) {
          return {
            ok: false,
            error: `Invalid variable name "${raw}".`,
            suggestion: 'Use variables like A, B, C, X, Y, Z, or names beginning with a letter.',
            position: i,
          };
        }
        push('VAR', variableName, i);
      }
      i = end;
      continue;
    }

    return {
      ok: false,
      error: `Unknown symbol "${char}" found.`,
      suggestion: 'Use supported operators: ., +, !, ~, AND, OR, NOT, NAND, NOR, XOR, XNOR, parentheses, and apostrophe complement.',
      position: i,
    };
  }

  return tokens;
}

class Parser {
  private index = 0;

  constructor(private readonly tokens: Token[]) {}

  parse(): AstNode | ParseFailure {
    if (this.tokens.length === 0) {
      return {
        ok: false,
        error: 'Expression is empty.',
        suggestion: 'Type an expression like A.B + C\' or click an example button.',
      };
    }
    const expression = this.parseOrNor();
    if (isParseFailure(expression)) return expression;
    const token = this.peek();
    if (token) {
      return {
        ok: false,
        error: `Unexpected token "${token.value}".`,
        suggestion: 'Check for a missing operator or an extra closing parenthesis.',
        position: token.position,
      };
    }
    return expression;
  }

  private peek(): Token | undefined {
    return this.tokens[this.index];
  }

  private consume(): Token | undefined {
    const token = this.tokens[this.index];
    this.index += 1;
    return token;
  }

  private match(...types: TokenType[]): Token | undefined {
    const token = this.peek();
    if (token && types.includes(token.type)) {
      return this.consume();
    }
    return undefined;
  }

  private parseOrNor(): AstNode | ParseFailure {
    let left = this.parseXorXnor();
    if (isParseFailure(left)) return left;

    while (this.peek()?.type === 'OR' || this.peek()?.type === 'NOR') {
      const op = this.consume()!.type as BinaryOperator;
      const right = this.parseXorXnor();
      if (isParseFailure(right)) return right;
      left = makeBinary(op, left, right);
    }
    return left;
  }

  private parseXorXnor(): AstNode | ParseFailure {
    let left = this.parseAndNand();
    if (isParseFailure(left)) return left;

    while (this.peek()?.type === 'XOR' || this.peek()?.type === 'XNOR') {
      const op = this.consume()!.type as BinaryOperator;
      const right = this.parseAndNand();
      if (isParseFailure(right)) return right;
      left = makeBinary(op, left, right);
    }
    return left;
  }

  private parseAndNand(): AstNode | ParseFailure {
    let left = this.parseUnary();
    if (isParseFailure(left)) return left;

    while (this.peek()?.type === 'AND' || this.peek()?.type === 'NAND') {
      const op = this.consume()!.type as BinaryOperator;
      const right = this.parseUnary();
      if (isParseFailure(right)) return right;
      left = makeBinary(op, left, right);
    }
    return left;
  }

  private parseUnary(): AstNode | ParseFailure {
    if (this.match('NOT')) {
      const child = this.parseUnary();
      if (isParseFailure(child)) return child;
      return makeNot(child);
    }

    let primary = this.parsePrimary();
    if (isParseFailure(primary)) return primary;

    while (this.match('POST_NOT')) {
      primary = makeNot(primary);
    }

    return primary;
  }

  private parsePrimary(): AstNode | ParseFailure {
    const token = this.peek();
    if (!token) {
      return {
        ok: false,
        error: 'Expression ended too early.',
        suggestion: 'Add a variable, constant, or closing part after the last operator.',
      };
    }

    if (this.match('VAR')) return makeVar(token.value);
    if (this.match('CONST')) return makeConst(token.value === '1' ? 1 : 0);

    if (this.match('LPAREN')) {
      const expr = this.parseOrNor();
      if (isParseFailure(expr)) return expr;
      const close = this.match('RPAREN');
      if (!close) {
        return {
          ok: false,
          error: 'Missing closing parenthesis.',
          suggestion: 'Add a ) to close the opened parenthesis.',
          position: token.position,
        };
      }
      return expr;
    }

    return {
      ok: false,
      error: `Unexpected "${token.value}" here.`,
      suggestion: 'An expression part should start with a variable, 0, 1, NOT, or an opening parenthesis.',
      position: token.position,
    };
  }
}

export function parseBooleanExpression(input: string): ParseResult {
  nodeCounter = 0;
  const tokens = tokenize(input);
  if (!Array.isArray(tokens)) return tokens;
  const parser = new Parser(tokens);
  const ast = parser.parse();
  if (isParseFailure(ast)) return ast;
  const variables = collectVariables(ast);
  return {
    ok: true,
    ast,
    variables,
    source: 'expression',
    normalizedExpression: ast.display,
  };
}

export function collectVariables(node: AstNode): string[] {
  const set = new Set<string>();
  const visit = (current: AstNode): void => {
    if (current.type === 'var') set.add(current.name);
    if (current.type === 'not') visit(current.child);
    if (current.type === 'binary') {
      visit(current.left);
      visit(current.right);
    }
  };
  visit(node);
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export function parseNotationInput(input: string): NotationInput | ParseFailure | null {
  const text = input.trim();
  if (!text) return null;
  const compact = text.replace(/\s+/g, '');
  const hasMinterm = /[Σ∑]/.test(compact) || /sigma|sum/i.test(compact) || /^m\(/.test(compact);
  const hasMaxterm = /[Π∏]/.test(compact) || /pi|prod/i.test(compact) || /^M\(/.test(compact);
  if (!hasMinterm && !hasMaxterm) return null;

  const source: 'minterm' | 'maxterm' = hasMaxterm ? 'maxterm' : 'minterm';
  const varMatch = compact.match(/^[A-Za-z]+\(([^)]*)\)=/);
  let variables = varMatch?.[1]
    ? varMatch[1]
        .split(',')
        .map((item) => item.toUpperCase())
        .filter(Boolean)
    : [];

  if (variables.some((variable) => !VARIABLE_PATTERN.test(variable))) {
    return {
      ok: false,
      error: 'Invalid variable list in notation.',
      suggestion: 'Use a notation like F(A,B,C)=Σm(0,2,4,6).',
    };
  }

  const allParens = [...compact.matchAll(/\(([^()]*)\)/g)];
  const indexText = allParens[allParens.length - 1]?.[1] ?? '';
  if (!indexText.length) {
    return {
      ok: false,
      error: source === 'minterm' ? 'Minterm list is empty.' : 'Maxterm list is empty.',
      suggestion: 'Write comma-separated indices, for example Σm(0,2,4,6).',
    };
  }

  const rawIndices = indexText.split(',').filter((item) => item.length > 0);
  if (rawIndices.some((item) => !/^\d+$/.test(item))) {
    return {
      ok: false,
      error: 'Invalid index found in notation.',
      suggestion: 'Minterms and maxterms must be non-negative integers separated by commas.',
    };
  }

  const indices = Array.from(new Set(rawIndices.map((item) => Number(item)))).sort((a, b) => a - b);
  const largest = Math.max(...indices, 0);
  if (variables.length === 0) {
    const bitCount = Math.max(1, Math.ceil(Math.log2(largest + 1)));
    variables = DEFAULT_VARIABLES.slice(0, bitCount);
  }

  const maxIndex = 2 ** variables.length - 1;
  const invalid = indices.find((index) => index < 0 || index > maxIndex);
  if (invalid !== undefined) {
    return {
      ok: false,
      error: `Index ${invalid} is outside the valid range for ${variables.length} variables.`,
      suggestion: `For ${variables.length} variables, valid indices are 0 to ${maxIndex}.`,
    };
  }

  return {
    variables,
    indices,
    source,
    normalizedExpression: `${source === 'minterm' ? 'Σm' : 'ΠM'}(${indices.join(',')})`,
  };
}

export function evaluateAst(node: AstNode, values: Record<string, BooleanValue>, intermediates?: Record<string, BooleanValue>): BooleanValue {
  const result = evaluateNode(node, values, intermediates);
  return result;
}

function evaluateNode(node: AstNode, values: Record<string, BooleanValue>, intermediates?: Record<string, BooleanValue>): BooleanValue {
  let value: BooleanValue;
  if (node.type === 'var') value = values[node.name] ?? 0;
  else if (node.type === 'const') value = node.value;
  else if (node.type === 'not') value = invert(evaluateNode(node.child, values, intermediates));
  else {
    const left = evaluateNode(node.left, values, intermediates);
    const right = evaluateNode(node.right, values, intermediates);
    value = evaluateBinary(node.op, left, right);
  }

  if (intermediates && (node.type === 'not' || node.type === 'binary')) {
    intermediates[node.display] = value;
  }
  return value;
}

function evaluateBinary(op: BinaryOperator, left: BooleanValue, right: BooleanValue): BooleanValue {
  switch (op) {
    case 'AND':
      return left && right ? 1 : 0;
    case 'OR':
      return left || right ? 1 : 0;
    case 'NAND':
      return left && right ? 0 : 1;
    case 'NOR':
      return left || right ? 0 : 1;
    case 'XOR':
      return left !== right ? 1 : 0;
    case 'XNOR':
      return left === right ? 1 : 0;
  }
}

function invert(value: BooleanValue): BooleanValue {
  return value === 1 ? 0 : 1;
}

export function collectIntermediateLabels(node: AstNode): string[] {
  const labels: string[] = [];
  const visit = (current: AstNode): void => {
    if (current.type === 'not') {
      visit(current.child);
      labels.push(current.display);
    }
    if (current.type === 'binary') {
      visit(current.left);
      visit(current.right);
      labels.push(current.display);
    }
  };
  visit(node);
  return Array.from(new Set(labels));
}
