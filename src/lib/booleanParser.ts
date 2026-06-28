import type { AstNode, ParserResult } from '../types';

type OpTokenValue = 'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR' | 'XOR' | 'XNOR';

type Token =
  | { type: 'VAR'; value: string }
  | { type: 'CONST'; value: '0' | '1' }
  | { type: 'OP'; value: OpTokenValue }
  | { type: 'LPAREN'; value: '(' }
  | { type: 'RPAREN'; value: ')' }
  | { type: 'POST_NOT'; value: "'" };

const WORD_OPERATORS = new Set(['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR']);

export class BooleanParseError extends Error {
  suggestion?: string;

  constructor(message: string, suggestion?: string) {
    super(message);
    this.name = 'BooleanParseError';
    this.suggestion = suggestion;
  }
}

const normalizeInput = (expression: string) => {
  let trimmed = expression.trim();
  if (!trimmed) {
    throw new BooleanParseError('Expression is empty.', 'Type an expression like A.B + C\' or click an example.');
  }

  const equalsIndex = trimmed.indexOf('=');
  if (equalsIndex >= 0) {
    trimmed = trimmed.slice(equalsIndex + 1).trim();
  }

  return trimmed
    .replace(/[’`]/g, "'")
    .replace(/∧/g, '.')
    .replace(/∨/g, '+')
    .replace(/¬/g, '!')
    .replace(/⊕/g, ' XOR ')
    .replace(/⊙/g, ' XNOR ')
    .replace(/\s+/g, ' ')
    .trim();
};

const isAlpha = (char: string) => /^[A-Za-z]$/.test(char);
const isDigit = (char: string) => /^[0-9]$/.test(char);

export const tokenize = (expression: string): Token[] => {
  const input = normalizeInput(expression);
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const char = input[i];

    if (/\s/.test(char)) {
      i += 1;
      continue;
    }

    if (char === '(') {
      tokens.push({ type: 'LPAREN', value: '(' });
      i += 1;
      continue;
    }

    if (char === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      i += 1;
      continue;
    }

    if (char === "'") {
      tokens.push({ type: 'POST_NOT', value: "'" });
      i += 1;
      continue;
    }

    if (char === '!' || char === '~') {
      tokens.push({ type: 'OP', value: 'NOT' });
      i += 1;
      continue;
    }

    if (char === '.') {
      tokens.push({ type: 'OP', value: 'AND' });
      i += 1;
      continue;
    }

    if (char === '+') {
      tokens.push({ type: 'OP', value: 'OR' });
      i += 1;
      continue;
    }

    if (char === '&') {
      if (input[i + 1] === '&') i += 1;
      tokens.push({ type: 'OP', value: 'AND' });
      i += 1;
      continue;
    }

    if (char === '|') {
      if (input[i + 1] === '|') i += 1;
      tokens.push({ type: 'OP', value: 'OR' });
      i += 1;
      continue;
    }

    if (isDigit(char)) {
      if (char !== '0' && char !== '1') {
        throw new BooleanParseError(`Invalid constant "${char}".`, 'Only constants 0 and 1 are supported in Boolean expressions.');
      }
      tokens.push({ type: 'CONST', value: char });
      i += 1;
      continue;
    }

    if (isAlpha(char)) {
      let word = '';
      while (i < input.length && isAlpha(input[i])) {
        word += input[i];
        i += 1;
      }

      const upperWord = word.toUpperCase();
      if (WORD_OPERATORS.has(upperWord)) {
        tokens.push({ type: 'OP', value: upperWord as OpTokenValue });
      } else {
        // Digital-logic variables are usually single letters. Treat ABC as A.B.C for beginner-friendly input.
        [...upperWord].forEach((letter) => tokens.push({ type: 'VAR', value: letter }));
      }
      continue;
    }

    throw new BooleanParseError(`Unknown symbol "${char}".`, 'Use gate buttons or operators like ., +, !, NAND, XOR, and parentheses.');
  }

  return insertImplicitAnd(tokens);
};

const canEndOperand = (token: Token) => token.type === 'VAR' || token.type === 'CONST' || token.type === 'RPAREN' || token.type === 'POST_NOT';
const canStartOperand = (token: Token) => token.type === 'VAR' || token.type === 'CONST' || token.type === 'LPAREN' || (token.type === 'OP' && token.value === 'NOT');

const insertImplicitAnd = (tokens: Token[]): Token[] => {
  const out: Token[] = [];
  for (let i = 0; i < tokens.length; i += 1) {
    const current = tokens[i];
    const previous = out[out.length - 1];
    if (previous && canEndOperand(previous) && canStartOperand(current)) {
      out.push({ type: 'OP', value: 'AND' });
    }
    out.push(current);
  }
  return out;
};

class Parser {
  private index = 0;

  constructor(private readonly tokens: Token[]) {}

  parse(): AstNode {
    const node = this.parseOrLike();
    if (!this.isAtEnd()) {
      const token = this.peek();
      throw new BooleanParseError(`Unexpected token "${token?.value}".`, 'Check for missing operators or extra parentheses.');
    }
    return node;
  }

  private parseOrLike(): AstNode {
    let left = this.parseAndLike();
    while (this.matchOp(['OR', 'NOR', 'XOR', 'XNOR'])) {
      const op = this.previous().value as 'OR' | 'NOR' | 'XOR' | 'XNOR';
      const right = this.parseAndLike();
      left = { type: 'binary', op, left, right };
    }
    return left;
  }

  private parseAndLike(): AstNode {
    let left = this.parseUnary();
    while (this.matchOp(['AND', 'NAND'])) {
      const op = this.previous().value as 'AND' | 'NAND';
      const right = this.parseUnary();
      left = { type: 'binary', op, left, right };
    }
    return left;
  }

  private parseUnary(): AstNode {
    if (this.matchOp(['NOT'])) {
      return { type: 'not', child: this.parseUnary() };
    }

    let node = this.parsePrimary();
    while (this.matchType('POST_NOT')) {
      node = { type: 'not', child: node };
    }
    return node;
  }

  private parsePrimary(): AstNode {
    if (this.matchType('VAR')) {
      return { type: 'var', name: this.previous().value };
    }

    if (this.matchType('CONST')) {
      return { type: 'const', value: Number(this.previous().value) as 0 | 1 };
    }

    if (this.matchType('LPAREN')) {
      const expr = this.parseOrLike();
      if (!this.matchType('RPAREN')) {
        throw new BooleanParseError('Missing closing parenthesis.', 'Add a ) to close the grouped expression.');
      }
      return expr;
    }

    const token = this.peek();
    if (!token) {
      throw new BooleanParseError('Expression ended unexpectedly.', 'Add a variable or constant after the operator.');
    }

    if (token.type === 'RPAREN') {
      throw new BooleanParseError('Extra closing parenthesis.', 'Remove the extra ) or add a matching (.');
    }

    throw new BooleanParseError(`Expected a variable, constant, or parenthesis but found "${token.value}".`, 'Check the expression near the highlighted operator.');
  }

  private matchOp(ops: OpTokenValue[]): boolean {
    const token = this.peek();
    if (token?.type === 'OP' && ops.includes(token.value as never)) {
      this.index += 1;
      return true;
    }
    return false;
  }

  private matchType(type: Token['type']): boolean {
    if (this.peek()?.type === type) {
      this.index += 1;
      return true;
    }
    return false;
  }

  private previous(): Token {
    return this.tokens[this.index - 1];
  }

  private peek(): Token | undefined {
    return this.tokens[this.index];
  }

  private isAtEnd() {
    return this.index >= this.tokens.length;
  }
}

export const parseBooleanExpression = (expression: string): ParserResult => {
  const tokens = tokenize(expression);
  const parser = new Parser(tokens);
  const ast = parser.parse();
  const variables = Array.from(collectVariables(ast)).sort();
  if (variables.length === 0) {
    throw new BooleanParseError('No input variables found.', 'Use at least one variable such as A, B, or C.');
  }
  if (variables.length > 10) {
    throw new BooleanParseError('Too many variables for a browser truth table.', 'Use 6 variables or fewer for smooth table generation.');
  }
  return { ast, variables, normalizedExpression: stringifyAst(ast) };
};

export const collectVariables = (node: AstNode, found = new Set<string>()): Set<string> => {
  if (node.type === 'var') found.add(node.name);
  if (node.type === 'not') collectVariables(node.child, found);
  if (node.type === 'binary') {
    collectVariables(node.left, found);
    collectVariables(node.right, found);
  }
  return found;
};

const precedence = (node: AstNode): number => {
  if (node.type === 'var' || node.type === 'const') return 5;
  if (node.type === 'not') return 4;
  if (node.type === 'binary' && (node.op === 'AND' || node.op === 'NAND')) return 3;
  if (node.type === 'binary') return 2;
  return 1;
};

export const stringifyAst = (node: AstNode, parentPrecedence = 0): string => {
  if (node.type === 'var') return node.name;
  if (node.type === 'const') return String(node.value);

  if (node.type === 'not') {
    const child = stringifyAst(node.child, precedence(node));
    const needsWrap = node.child.type === 'binary';
    return `${needsWrap ? `(${child})` : child}'`;
  }

  const opLabel: Record<string, string> = {
    AND: '.',
    OR: ' + ',
    NAND: ' NAND ',
    NOR: ' NOR ',
    XOR: ' XOR ',
    XNOR: ' XNOR '
  };
  const myPrecedence = precedence(node);
  const left = stringifyAst(node.left, myPrecedence);
  const right = stringifyAst(node.right, myPrecedence + 1);
  const body = `${left}${opLabel[node.op]}${right}`;
  return myPrecedence < parentPrecedence ? `(${body})` : body;
};

export const evaluateAst = (
  node: AstNode,
  assignment: Record<string, boolean>,
  intermediate: Record<string, boolean>,
  rootLabel?: string
): boolean => {
  if (node.type === 'var') return Boolean(assignment[node.name]);
  if (node.type === 'const') return node.value === 1;

  let value: boolean;
  if (node.type === 'not') {
    value = !evaluateAst(node.child, assignment, intermediate, rootLabel);
  } else {
    const left = evaluateAst(node.left, assignment, intermediate, rootLabel);
    const right = evaluateAst(node.right, assignment, intermediate, rootLabel);
    switch (node.op) {
      case 'AND':
        value = left && right;
        break;
      case 'OR':
        value = left || right;
        break;
      case 'NAND':
        value = !(left && right);
        break;
      case 'NOR':
        value = !(left || right);
        break;
      case 'XOR':
        value = left !== right;
        break;
      case 'XNOR':
        value = left === right;
        break;
      default:
        value = false;
    }
  }

  const label = stringifyAst(node);
  if (label !== rootLabel) intermediate[label] = value;
  return value;
};

export const collectIntermediateLabels = (node: AstNode, rootLabel = stringifyAst(node), labels: string[] = []): string[] => {
  if (node.type === 'binary') {
    collectIntermediateLabels(node.left, rootLabel, labels);
    collectIntermediateLabels(node.right, rootLabel, labels);
  }
  if (node.type === 'not') collectIntermediateLabels(node.child, rootLabel, labels);
  if (node.type !== 'var' && node.type !== 'const') {
    const label = stringifyAst(node);
    if (label !== rootLabel && !labels.includes(label)) labels.push(label);
  }
  return labels;
};
