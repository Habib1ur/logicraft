import { collectIntermediateLabels, evaluateAst, parseBooleanExpression, parseNotationInput } from './booleanParser';
import { simplifyFromTruthTable } from './simplifier';
import type { AppSettings, BooleanValue, IntermediateColumn, NotationInput, ParseFailure, SimplificationResultType, TruthRow, TruthTableResult } from '../types';

export interface GenerateResult {
  ok: true;
  table: TruthTableResult;
  simplification: SimplificationResultType;
  warning?: string;
}

export interface GenerateError {
  ok: false;
  error: string;
  suggestion: string;
}

export type GenerateTruthTableResult = GenerateResult | GenerateError;

function isParseFailure(value: NotationInput | ParseFailure | null): value is ParseFailure {
  return Boolean(value && 'ok' in value && value.ok === false);
}

export function generateTruthTable(expression: string, settings: AppSettings): GenerateTruthTableResult {
  const trimmed = expression.trim();
  if (!trimmed) {
    return {
      ok: false,
      error: 'Expression is empty.',
      suggestion: 'Try A + B, A.B + C\', or Σm(0,2,4,6).',
    };
  }

  const notation = parseNotationInput(trimmed);
  if (isParseFailure(notation)) {
    return {
      ok: false,
      error: notation.error,
      suggestion: notation.suggestion,
    };
  }

  if (notation) {
    const variables = applyVariableOrder(notation.variables, settings.variableOrder);
    if (variables.length > settings.maxVariables) return tooManyVariables(variables.length, settings.maxVariables);
    const rows = buildRowsFromNotation(variables, notation.indices, notation.source);
    const table: TruthTableResult = {
      expression: notation.normalizedExpression,
      variables,
      rows,
      intermediateColumns: [],
      source: notation.source,
    };
    return {
      ok: true,
      table,
      simplification: simplifyFromTruthTable(table),
      warning: largeTableWarning(variables.length),
    };
  }

  const parsed = parseBooleanExpression(trimmed);
  if (!parsed.ok) {
    return {
      ok: false,
      error: parsed.error,
      suggestion: parsed.suggestion,
    };
  }

  const variables = applyVariableOrder(parsed.variables, settings.variableOrder);
  if (variables.length > settings.maxVariables) return tooManyVariables(variables.length, settings.maxVariables);

  const intermediateLabels = settings.showIntermediateColumns ? collectIntermediateLabels(parsed.ast) : [];
  const rows = buildRowsFromExpression(variables, parsed.ast, settings.showIntermediateColumns);
  const columns: IntermediateColumn[] = intermediateLabels
    .filter((label) => label !== parsed.ast.display)
    .map((label) => ({ key: label, label }));

  const table: TruthTableResult = {
    expression: parsed.normalizedExpression,
    variables,
    rows,
    intermediateColumns: columns,
    source: 'expression',
  };

  return {
    ok: true,
    table,
    simplification: simplifyFromTruthTable(table),
    warning: largeTableWarning(variables.length),
  };
}

function buildRowsFromExpression(variables: string[], ast: Parameters<typeof evaluateAst>[0], showIntermediate: boolean): TruthRow[] {
  const rowCount = 2 ** variables.length;
  const rows: TruthRow[] = [];

  for (let index = 0; index < rowCount; index += 1) {
    const values = rowValuesFromIndex(index, variables);
    const intermediates: Record<string, BooleanValue> = {};
    const output = evaluateAst(ast, values, showIntermediate ? intermediates : undefined);
    rows.push({ index, values, intermediates, output });
  }

  return rows;
}

function buildRowsFromNotation(variables: string[], indices: number[], source: 'minterm' | 'maxterm'): TruthRow[] {
  const selected = new Set(indices);
  const rowCount = 2 ** variables.length;
  const rows: TruthRow[] = [];

  for (let index = 0; index < rowCount; index += 1) {
    const values = rowValuesFromIndex(index, variables);
    const output: BooleanValue = source === 'minterm' ? (selected.has(index) ? 1 : 0) : selected.has(index) ? 0 : 1;
    rows.push({ index, values, intermediates: {}, output });
  }

  return rows;
}

export function rowValuesFromIndex(index: number, variables: string[]): Record<string, BooleanValue> {
  const values: Record<string, BooleanValue> = {};
  variables.forEach((variable, position) => {
    const shift = variables.length - position - 1;
    values[variable] = ((index >> shift) & 1) as BooleanValue;
  });
  return values;
}

function applyVariableOrder(variables: string[], order: string[]): string[] {
  const known = order.filter((variable) => variables.includes(variable));
  const remaining = variables.filter((variable) => !known.includes(variable));
  return [...known, ...remaining];
}

function largeTableWarning(variableCount: number): string | undefined {
  if (variableCount >= 6) return `${variableCount} variables produce ${2 ** variableCount} rows. Use pagination if the table feels large.`;
  return undefined;
}

function tooManyVariables(count: number, max: number): GenerateError {
  return {
    ok: false,
    error: `Too many variables: ${count}.`,
    suggestion: `TruthCraft currently allows up to ${max} variables for smooth browser performance. Reduce variables or increase the limit in Settings.`,
  };
}

export function truthTableToCsv(table: TruthTableResult, outputFormatter: (value: BooleanValue) => string): string {
  const headers = [...table.variables, ...table.intermediateColumns.map((column) => column.label), 'F'];
  const body = table.rows.map((row) => {
    const variableValues = table.variables.map((variable) => outputFormatter(row.values[variable]));
    const intermediateValues = table.intermediateColumns.map((column) => outputFormatter(row.intermediates[column.key] ?? row.output));
    return [...variableValues, ...intermediateValues, outputFormatter(row.output)].join(',');
  });
  return [headers.join(','), ...body].join('\n');
}

export function truthTableToText(table: TruthTableResult, simplification: SimplificationResultType, outputFormatter: (value: BooleanValue) => string): string {
  const headers = [...table.variables, ...table.intermediateColumns.map((column) => column.label), 'F'];
  const rows = table.rows.map((row) => {
    const values = [
      ...table.variables.map((variable) => outputFormatter(row.values[variable])),
      ...table.intermediateColumns.map((column) => outputFormatter(row.intermediates[column.key] ?? row.output)),
      outputFormatter(row.output),
    ];
    return values.join(' | ');
  });

  return [
    'TruthCraft Solution',
    `Expression: ${table.expression}`,
    '',
    'Truth Table',
    headers.join(' | '),
    '-'.repeat(headers.join(' | ').length),
    ...rows,
    '',
    'Simplification',
    `Simplified SOP: ${simplification.simplifiedSop}`,
    `Simplified POS: ${simplification.simplifiedPos}`,
    `Canonical SOP: ${simplification.canonicalSop}`,
    `Canonical POS: ${simplification.canonicalPos}`,
    `Minterms: ${simplification.mintermNotation}`,
    `Maxterms: ${simplification.maxtermNotation}`,
  ].join('\n');
}
