import Decimal from 'decimal.js';
import { AngleMode } from '../types/calculator';
import { tokenize } from './lexer';
import { infixToPostfix } from './parser';
import { evaluateRPN, formatResult } from './evaluator';

export interface CalculationResult {
  success: boolean;
  value?: Decimal;
  formatted?: string;
  error?: string;
}

/**
 * Automatically balance any unclosed parentheses for both live preview and final execution
 */
export function autoCloseParentheses(expr: string): string {
  let openCount = 0;
  for (const char of expr) {
    if (char === '(') openCount++;
    if (char === ')') openCount = Math.max(0, openCount - 1);
  }
  return expr + ')'.repeat(openCount);
}

/**
 * Evaluates an expression string completely and returns structured result
 */
export function calculate(
  rawExpression: string,
  angleMode: AngleMode = 'DEG',
  isLivePreview = false
): CalculationResult {
  if (!rawExpression || rawExpression.trim() === '') {
    return { success: true, formatted: '0' };
  }

  try {
    let expr = rawExpression.trim();

    // If live preview, trim trailing operators that would cause premature syntax errors
    if (isLivePreview) {
      expr = expr.replace(/[+\-×*÷/^]+$/, '');
      if (!expr) return { success: true, formatted: '0' };
    }

    // Auto-close any unclosed parentheses (e.g. cbrt(125 -> cbrt(125))
    expr = autoCloseParentheses(expr);

    const tokens = tokenize(expr);
    if (tokens.length === 0) {
      return { success: true, formatted: '0' };
    }

    const postfix = infixToPostfix(tokens);
    const resultDecimal = evaluateRPN(postfix, angleMode);
    const formatted = formatResult(resultDecimal);

    return {
      success: true,
      value: resultDecimal,
      formatted,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Error',
    };
  }
}
