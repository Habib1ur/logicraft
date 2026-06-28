export type BooleanValue = 0 | 1;
export type OutputFormat = 'binary' | 'boolean';
export type ThemeMode = 'light' | 'dark' | 'system';
export type GenerateMode = 'auto' | 'manual';

export type TokenType =
  | 'VAR'
  | 'CONST'
  | 'NOT'
  | 'AND'
  | 'OR'
  | 'NAND'
  | 'NOR'
  | 'XOR'
  | 'XNOR'
  | 'LPAREN'
  | 'RPAREN'
  | 'POST_NOT';

export interface Token {
  type: TokenType;
  value: string;
  position: number;
}

export type AstNode =
  | { id: string; type: 'var'; name: string; display: string }
  | { id: string; type: 'const'; value: BooleanValue; display: string }
  | { id: string; type: 'not'; child: AstNode; display: string }
  | { id: string; type: 'binary'; op: BinaryOperator; left: AstNode; right: AstNode; display: string };

export type BinaryOperator = 'AND' | 'OR' | 'NAND' | 'NOR' | 'XOR' | 'XNOR';

export interface ParseSuccess {
  ok: true;
  ast: AstNode;
  variables: string[];
  source: 'expression';
  normalizedExpression: string;
}

export interface NotationInput {
  variables: string[];
  indices: number[];
  source: 'minterm' | 'maxterm';
  normalizedExpression: string;
}

export interface ParseFailure {
  ok: false;
  error: string;
  suggestion: string;
  position?: number;
}

export type ParseResult = ParseSuccess | ParseFailure;

export interface TruthRow {
  index: number;
  values: Record<string, BooleanValue>;
  intermediates: Record<string, BooleanValue>;
  output: BooleanValue;
}

export interface IntermediateColumn {
  key: string;
  label: string;
}

export interface TruthTableResult {
  expression: string;
  variables: string[];
  rows: TruthRow[];
  intermediateColumns: IntermediateColumn[];
  source: 'expression' | 'minterm' | 'maxterm';
}

export interface SimplificationResultType {
  original: string;
  simplifiedSop: string;
  simplifiedPos: string;
  canonicalSop: string;
  canonicalPos: string;
  mintermNotation: string;
  maxtermNotation: string;
  minterms: number[];
  maxterms: number[];
  variables: string[];
  isTautology: boolean;
  isContradiction: boolean;
  steps: string[];
}

export interface PanelState {
  collapsed: boolean;
  hidden: boolean;
  minimized: boolean;
}

export interface AppSettings {
  variableOrder: string[];
  outputFormat: OutputFormat;
  showIntermediateColumns: boolean;
  generateMode: GenerateMode;
  showSopPos: boolean;
  learningMode: boolean;
  maxVariables: number;
  rowsPerPage: number;
}

export interface HistoryItem {
  id: string;
  expression: string;
  createdAt: string;
  favorite: boolean;
}

export interface SavedProject {
  expression: string;
  settings: AppSettings;
  history: HistoryItem[];
}
