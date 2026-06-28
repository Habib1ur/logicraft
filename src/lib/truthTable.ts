import { BooleanParseError, collectIntermediateLabels, evaluateAst, parseBooleanExpression, stringifyAst } from './booleanParser';
import type { AppSettings, TruthTableResult, TruthRow } from '../types';

const DEFAULT_VARIABLES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

type SpecialNotation = {
  kind: 'minterm' | 'maxterm';
  variables: string[];
  indexes: number[];
  raw: string;
};

const parseNumberList = (value: string): number[] => {
  if (!value.trim()) return [];
  return value
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((part) => {
      const n = Number(part);
      if (!Number.isInteger(n) || n < 0) {
        throw new BooleanParseError(`Invalid minterm/maxterm index "${part}".`, 'Use whole numbers such as 0, 1, 2, 3.');
      }
      return n;
    });
};

export const parseSpecialNotation = (expression: string): SpecialNotation | null => {
  const normalized = expression.trim().replace(/∑/g, 'Σ').replace(/π/g, 'Π');
  const regex = /^(?:[A-Za-z]\s*(?:\(([^)]*)\))?\s*=\s*)?([ΣΠ])\s*([mM])\s*\(([^)]*)\)$/i;
  const match = normalized.match(regex);
  if (!match) return null;

  const [, variableGroup, symbol, listType, numberGroup] = match;
  const variables = variableGroup
    ? variableGroup
        .split(/[\s,]+/)
        .join('')
        .toUpperCase()
        .split('')
        .filter(Boolean)
    : [];
  const indexes = parseNumberList(numberGroup);
  const kind = symbol === 'Σ' ? 'minterm' : 'maxterm';
  const maxIndex = Math.max(...indexes, 0);
  const inferredCount = Math.max(1, Math.ceil(Math.log2(maxIndex + 1)));
  const finalVariables = variables.length > 0 ? variables : DEFAULT_VARIABLES.slice(0, inferredCount);

  if (finalVariables.length > 10) {
    throw new BooleanParseError('Too many variables in notation.', 'Use 6 variables or fewer for a smooth browser truth table.');
  }

  const limit = 2 ** finalVariables.length;
  const invalidIndex = indexes.find((index) => index >= limit);
  if (invalidIndex !== undefined) {
    throw new BooleanParseError(
      `Index ${invalidIndex} does not fit ${finalVariables.length} variables.`,
      `For ${finalVariables.length} variables, valid indexes are 0 to ${limit - 1}.`
    );
  }

  return {
    kind,
    variables: finalVariables,
    indexes: Array.from(new Set(indexes)).sort((a, b) => a - b),
    raw: normalized
  };
};

export const orderedVariables = (detected: string[], preferred: string[]): string[] => {
  const preferredSet = new Set(preferred);
  const known = preferred.filter((variable) => detected.includes(variable));
  const remaining = detected.filter((variable) => !preferredSet.has(variable)).sort();
  return [...known, ...remaining];
};

const buildAssignment = (index: number, variables: string[]): Record<string, boolean> => {
  const assignment: Record<string, boolean> = {};
  variables.forEach((variable, position) => {
    const bitPosition = variables.length - position - 1;
    assignment[variable] = Boolean((index >> bitPosition) & 1);
  });
  return assignment;
};

export const rowIndexFromAssignment = (assignment: Record<string, boolean>, variables: string[]) => {
  return variables.reduce((value, variable) => (value << 1) | (assignment[variable] ? 1 : 0), 0);
};

export const generateTruthTable = (expression: string, settings: AppSettings): TruthTableResult => {
  const special = parseSpecialNotation(expression);

  if (special) {
    const variables = orderedVariables(special.variables, settings.variableOrder);
    const rowCount = 2 ** variables.length;
    const indexSet = new Set(special.indexes);
    const rows: TruthRow[] = Array.from({ length: rowCount }, (_, index) => {
      const assignment = buildAssignment(index, variables);
      const output = special.kind === 'minterm' ? indexSet.has(index) : !indexSet.has(index);
      return { index, assignment, intermediates: {}, output };
    });

    return {
      variables,
      rows,
      intermediateColumns: [],
      expressionLabel: 'F',
      warning: variables.length > 6 ? 'Large truth table: consider reducing variable count or using pagination.' : undefined,
      mode: special.kind
    };
  }

  const parsed = parseBooleanExpression(expression);
  const variables = orderedVariables(parsed.variables, settings.variableOrder);
  const rowCount = 2 ** variables.length;
  const rootLabel = stringifyAst(parsed.ast);
  const intermediateColumns = collectIntermediateLabels(parsed.ast, rootLabel);

  const rows = Array.from({ length: rowCount }, (_, index) => {
    const assignment = buildAssignment(index, variables);
    const intermediates: Record<string, boolean> = {};
    const output = evaluateAst(parsed.ast, assignment, intermediates, rootLabel);
    return { index, assignment, intermediates, output };
  });

  return {
    variables,
    rows,
    intermediateColumns,
    expressionLabel: rootLabel || 'F',
    warning: variables.length > 6 ? 'Large truth table: consider reducing variable count or using pagination.' : undefined,
    mode: 'expression'
  };
};

export const truthTableToCsv = (table: TruthTableResult, showIntermediate: boolean, formatValue: (value: boolean) => string) => {
  const headers = [
    ...table.variables,
    ...(showIntermediate ? table.intermediateColumns : []),
    'F'
  ];
  const lines = [headers.join(',')];
  table.rows.forEach((row) => {
    const values = [
      ...table.variables.map((variable) => formatValue(row.assignment[variable])),
      ...(showIntermediate ? table.intermediateColumns.map((column) => formatValue(row.intermediates[column])) : []),
      formatValue(row.output)
    ];
    lines.push(values.join(','));
  });
  return lines.join('\n');
};
