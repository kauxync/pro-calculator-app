import { Token } from '../types/calculator';

const OPERATORS: Record<string, { precedence: number; associativity: 'LEFT' | 'RIGHT' }> = {
  '+': { precedence: 2, associativity: 'LEFT' },
  '-': { precedence: 2, associativity: 'LEFT' },
  '−': { precedence: 2, associativity: 'LEFT' }, // unicode minus
  '×': { precedence: 3, associativity: 'LEFT' },
  '*': { precedence: 3, associativity: 'LEFT' },
  '÷': { precedence: 3, associativity: 'LEFT' },
  '/': { precedence: 3, associativity: 'LEFT' },
  '%': { precedence: 3, associativity: 'LEFT' },
  'mod': { precedence: 3, associativity: 'LEFT' },
  'ncr': { precedence: 3, associativity: 'LEFT' },
  'npr': { precedence: 3, associativity: 'LEFT' },
  '^': { precedence: 4, associativity: 'RIGHT' },
  '!': { precedence: 5, associativity: 'LEFT' }, // postfix factorial
};

const FUNCTIONS = new Set([
  'sin',
  'cos',
  'tan',
  'asin',
  'acos',
  'atan',
  'sinh',
  'cosh',
  'tanh',
  'asinh',
  'acosh',
  'atanh',
  'sec',
  'csc',
  'cot',
  'ln',
  'log',
  'log2',
  'sqrt',
  '√',
  'cbrt',
  'abs',
  'exp',
  'floor',
  'ceil',
  'round',
  'sign',
  'fact',
  'gcd',
  'lcm',
  'rand',
]);

const CONSTANTS: Record<string, string> = {
  'π': 'PI',
  'pi': 'PI',
  'e': 'E',
  'phi': 'PHI',
  'φ': 'PHI',
  'tau': 'TAU',
  'τ': 'TAU',
  'c': 'C',
  'rand': 'RAND',
};

export function tokenize(rawInput: string): Token[] {
  // Normalize symbols
  const input = rawInput
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/√/g, 'sqrt')
    .replace(/π/g, 'pi')
    .replace(/φ/g, 'phi')
    .replace(/τ/g, 'tau');

  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const char = input[i];

    // Skip whitespace
    if (/\s/.test(char)) {
      i++;
      continue;
    }

    // Numbers (including floating point and scientific notation like 1e5 or 2.5E-3)
    if (/[0-9]/.test(char) || (char === '.' && i + 1 < input.length && /[0-9]/.test(input[i + 1]))) {
      let numStr = '';
      let hasDot = false;

      while (i < input.length && (/[0-9]/.test(input[i]) || input[i] === '.')) {
        if (input[i] === '.') {
          if (hasDot) break;
          hasDot = true;
        }
        numStr += input[i];
        i++;
      }

      // Check for scientific notation exponent like E+3 or e-5
      if (
        i < input.length &&
        (input[i] === 'e' || input[i] === 'E') &&
        i + 1 < input.length &&
        (/[0-9]/.test(input[i + 1]) ||
          ((input[i + 1] === '+' || input[i + 1] === '-') &&
            i + 2 < input.length &&
            /[0-9]/.test(input[i + 2])))
      ) {
        numStr += input[i];
        i++;
        if (input[i] === '+' || input[i] === '-') {
          numStr += input[i];
          i++;
        }
        while (i < input.length && /[0-9]/.test(input[i])) {
          numStr += input[i];
          i++;
        }
      }

      // Check for implicit multiplication before inserting number (e.g. )2 or π2)
      if (tokens.length > 0) {
        const prevToken = tokens[tokens.length - 1];
        if (prevToken.type === 'RPAREN' || prevToken.type === 'CONSTANT') {
          tokens.push({
            type: 'OPERATOR',
            value: '*',
            precedence: 3,
            associativity: 'LEFT',
          });
        }
      }

      tokens.push({ type: 'NUMBER', value: numStr });
      continue;
    }

    // Parentheses
    if (char === '(') {
      if (tokens.length > 0) {
        const prevToken = tokens[tokens.length - 1];
        if (
          prevToken.type === 'NUMBER' ||
          prevToken.type === 'RPAREN' ||
          prevToken.type === 'CONSTANT'
        ) {
          tokens.push({
            type: 'OPERATOR',
            value: '*',
            precedence: 3,
            associativity: 'LEFT',
          });
        }
      }
      tokens.push({ type: 'LPAREN', value: '(' });
      i++;
      continue;
    }

    if (char === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      i++;
      continue;
    }

    if (char === ',') {
      tokens.push({ type: 'COMMA', value: ',' });
      i++;
      continue;
    }

    // Check for unary minus vs binary minus
    if (char === '-') {
      const isUnary =
        tokens.length === 0 ||
        tokens[tokens.length - 1].type === 'LPAREN' ||
        tokens[tokens.length - 1].type === 'OPERATOR' ||
        tokens[tokens.length - 1].type === 'COMMA';

      if (isUnary) {
        tokens.push({
          type: 'OPERATOR',
          value: 'NEG',
          precedence: 4,
          associativity: 'RIGHT',
          isUnary: true,
        });
        i++;
        continue;
      }
    }

    // Operators
    if (OPERATORS[char]) {
      tokens.push({
        type: 'OPERATOR',
        value: char,
        precedence: OPERATORS[char].precedence,
        associativity: OPERATORS[char].associativity,
      });
      i++;
      continue;
    }

    // Word tokens (Functions & Constants & Named Operators)
    if (/[a-zA-Z]/.test(char)) {
      let word = '';
      while (i < input.length && /[a-zA-Z0-9]/.test(input[i])) {
        word += input[i];
        i++;
      }

      const lowerWord = word.toLowerCase();

      // Check named operators: mod, ncr, npr
      if (OPERATORS[lowerWord]) {
        tokens.push({
          type: 'OPERATOR',
          value: lowerWord,
          precedence: OPERATORS[lowerWord].precedence,
          associativity: OPERATORS[lowerWord].associativity,
        });
        continue;
      }

      if (FUNCTIONS.has(lowerWord)) {
        if (tokens.length > 0) {
          const prevToken = tokens[tokens.length - 1];
          if (
            prevToken.type === 'NUMBER' ||
            prevToken.type === 'RPAREN' ||
            prevToken.type === 'CONSTANT'
          ) {
            tokens.push({
              type: 'OPERATOR',
              value: '*',
              precedence: 3,
              associativity: 'LEFT',
            });
          }
        }
        tokens.push({ type: 'FUNCTION', value: lowerWord });
        continue;
      }

      if (CONSTANTS[lowerWord]) {
        if (tokens.length > 0) {
          const prevToken = tokens[tokens.length - 1];
          if (
            prevToken.type === 'NUMBER' ||
            prevToken.type === 'RPAREN' ||
            prevToken.type === 'CONSTANT'
          ) {
            tokens.push({
              type: 'OPERATOR',
              value: '*',
              precedence: 3,
              associativity: 'LEFT',
            });
          }
        }
        tokens.push({ type: 'CONSTANT', value: CONSTANTS[lowerWord] });
        continue;
      }

      throw new Error(`Unknown token: "${word}"`);
    }

    throw new Error(`Unexpected character: "${char}"`);
  }

  return tokens;
}
