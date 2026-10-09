export type AngleMode = 'DEG' | 'RAD';

export type CalculatorMode = 'standard' | 'scientific';

export type TokenType =
  | 'NUMBER'
  | 'OPERATOR'
  | 'FUNCTION'
  | 'CONSTANT'
  | 'LPAREN'
  | 'RPAREN'
  | 'COMMA';

export interface Token {
  type: TokenType;
  value: string;
  precedence?: number;
  associativity?: 'LEFT' | 'RIGHT';
  isUnary?: boolean;
}

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export interface CalculatorState {
  expression: string;
  displayValue: string;
  cursorPosition: number; // Cursor index for inserting / deleting anywhere
  previewResult: string | null;
  angleMode: AngleMode;
  mode: CalculatorMode;
  memory: string; // Stored memory value (Decimal string)
  history: HistoryItem[];
  isHistoryOpen: boolean;
  error: string | null;
}
