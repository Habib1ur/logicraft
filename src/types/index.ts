export type Operator = 'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR' | 'XOR' | 'XNOR';

export type AstNode =
  | { type: 'var'; name: string }
  | { type: 'const'; value: 0 | 1 }
  | { type: 'not'; child: AstNode }
  | { type: 'binary'; op: Exclude<Operator, 'NOT'>; left: AstNode; right: AstNode };

export type ParserResult = {
  ast: AstNode;
  variables: string[];
  normalizedExpression: string;
};

export type TruthRow = {
  index: number;
  assignment: Record<string, boolean>;
  intermediates: Record<string, boolean>;
  output: boolean;
};

export type TruthTableResult = {
  variables: string[];
  intermediateColumns: string[];
  rows: TruthRow[];
  expressionLabel: string;
  warning?: string;
  mode: 'expression' | 'minterm' | 'maxterm';
};

export type SimplificationResult = {
  original: string;
  simplifiedSOP: string;
  simplifiedPOS: string;
  canonicalSOP: string;
  canonicalPOS: string;
  minterms: number[];
  maxterms: number[];
  mintermNotation: string;
  maxtermNotation: string;
  steps: string[];
};

export type OutputFormat = 'binary' | 'boolean';
export type ThemeMode = 'light' | 'dark' | 'system';

export type AppSettings = {
  variableOrder: string[];
  outputFormat: OutputFormat;
  showIntermediate: boolean;
  autoGenerate: boolean;
  showSopPos: boolean;
  learningMode: boolean;
  theme: ThemeMode;
  maxRowsPerPage: number;
};

export type PanelState = {
  collapsed: boolean;
  hidden: boolean;
  minimized: boolean;
};

export type SavedExpression = {
  id: string;
  expression: string;
  createdAt: string;
  favorite: boolean;
};
