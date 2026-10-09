import Decimal from 'decimal.js';
import { AngleMode, Token } from '../types/calculator';

// Configure high precision
Decimal.set({ precision: 36, rounding: Decimal.ROUND_HALF_UP });

const PI = new Decimal('3.1415926535897932384626433832795028841971693993751');
const E = new Decimal('2.71828182845904523536028747135266249775724709369995');
const PHI = new Decimal('1.61803398874989484820458683436563811772030917980576');
const TAU = new Decimal('6.28318530717958647692528676655900576839433879875021');
const SPEED_OF_LIGHT = new Decimal('299792458');

function toRadians(val: Decimal, mode: AngleMode): Decimal {
  if (mode === 'RAD') return val;
  return val.times(PI).dividedBy(180);
}

function fromRadians(val: Decimal, mode: AngleMode): Decimal {
  if (mode === 'RAD') return val;
  return val.times(180).dividedBy(PI);
}

function factorial(n: Decimal): Decimal {
  if (!n.isInteger() || n.isNegative()) {
    throw new Error('Factorial only defined for non-negative integers');
  }
  if (n.greaterThan(170)) {
    throw new Error('Overflow: Factorial > 170!');
  }
  const intVal = n.toNumber();
  let result = new Decimal(1);
  for (let i = 2; i <= intVal; i++) {
    result = result.times(i);
  }
  return result;
}

function combinations(n: Decimal, r: Decimal): Decimal {
  if (!n.isInteger() || !r.isInteger() || n.isNegative() || r.isNegative() || r.greaterThan(n)) {
    throw new Error('Invalid operands for nCr (require 0 <= r <= n, integers)');
  }
  return factorial(n).dividedBy(factorial(r).times(factorial(n.minus(r))));
}

function permutations(n: Decimal, r: Decimal): Decimal {
  if (!n.isInteger() || !r.isInteger() || n.isNegative() || r.isNegative() || r.greaterThan(n)) {
    throw new Error('Invalid operands for nPr (require 0 <= r <= n, integers)');
  }
  return factorial(n).dividedBy(factorial(n.minus(r)));
}

function gcd(a: Decimal, b: Decimal): Decimal {
  let x = a.abs().round();
  let y = b.abs().round();
  while (!y.isZero()) {
    const temp = y;
    y = x.modulo(y);
    x = temp;
  }
  return x;
}

function lcm(a: Decimal, b: Decimal): Decimal {
  if (a.isZero() || b.isZero()) return new Decimal(0);
  return a.times(b).abs().dividedBy(gcd(a, b));
}

export function evaluateRPN(postfixTokens: Token[], angleMode: AngleMode = 'DEG'): Decimal {
  const stack: Decimal[] = [];

  for (const token of postfixTokens) {
    switch (token.type) {
      case 'NUMBER':
        stack.push(new Decimal(token.value));
        break;

      case 'CONSTANT':
        if (token.value === 'PI') stack.push(PI);
        else if (token.value === 'E') stack.push(E);
        else if (token.value === 'PHI') stack.push(PHI);
        else if (token.value === 'TAU') stack.push(TAU);
        else if (token.value === 'C') stack.push(SPEED_OF_LIGHT);
        else if (token.value === 'RAND') stack.push(new Decimal(Math.random()));
        else throw new Error(`Unknown constant: ${token.value}`);
        break;

      case 'OPERATOR': {
        if (token.value === 'NEG') {
          if (stack.length < 1) throw new Error('Invalid syntax for unary minus');
          const operand = stack.pop()!;
          stack.push(operand.negated());
          break;
        }

        if (token.value === '!') {
          if (stack.length < 1) throw new Error('Invalid syntax for factorial');
          const operand = stack.pop()!;
          stack.push(factorial(operand));
          break;
        }

        if (token.value === '%') {
          if (stack.length < 1) throw new Error('Invalid syntax for percent');
          const operand = stack.pop()!;
          stack.push(operand.dividedBy(100));
          break;
        }

        if (stack.length < 2) {
          throw new Error(`Insufficient operands for operator "${token.value}"`);
        }

        const b = stack.pop()!;
        const a = stack.pop()!;

        switch (token.value) {
          case '+':
            stack.push(a.plus(b));
            break;
          case '-':
            stack.push(a.minus(b));
            break;
          case '*':
            stack.push(a.times(b));
            break;
          case '/':
            if (b.isZero()) throw new Error('Cannot divide by zero');
            stack.push(a.dividedBy(b));
            break;
          case '^':
            stack.push(a.pow(b));
            break;
          case 'mod':
            if (b.isZero()) throw new Error('Cannot modulo by zero');
            stack.push(a.modulo(b));
            break;
          case 'ncr':
            stack.push(combinations(a, b));
            break;
          case 'npr':
            stack.push(permutations(a, b));
            break;
          default:
            throw new Error(`Unsupported operator: ${token.value}`);
        }
        break;
      }

      case 'FUNCTION': {
        if (stack.length < 1) {
          throw new Error(`Missing argument for function "${token.value}"`);
        }
        const arg = stack.pop()!;

        switch (token.value) {
          // Standard Trigonometry
          case 'sin': {
            const rad = toRadians(arg, angleMode);
            const num = Math.sin(rad.toNumber());
            const cleanVal = Math.abs(num) < 1e-15 ? 0 : num;
            stack.push(new Decimal(cleanVal));
            break;
          }
          case 'cos': {
            const rad = toRadians(arg, angleMode);
            const num = Math.cos(rad.toNumber());
            const cleanVal = Math.abs(num) < 1e-15 ? 0 : num;
            stack.push(new Decimal(cleanVal));
            break;
          }
          case 'tan': {
            const rad = toRadians(arg, angleMode);
            const cosVal = Math.cos(rad.toNumber());
            if (Math.abs(cosVal) < 1e-15) throw new Error('Undefined (tan asymptote)');
            const num = Math.tan(rad.toNumber());
            const cleanVal = Math.abs(num) < 1e-15 ? 0 : num;
            stack.push(new Decimal(cleanVal));
            break;
          }
          case 'asin': {
            if (arg.lessThan(-1) || arg.greaterThan(1)) {
              throw new Error('Domain Error for asin [-1, 1]');
            }
            const rad = new Decimal(Math.asin(arg.toNumber()));
            stack.push(fromRadians(rad, angleMode));
            break;
          }
          case 'acos': {
            if (arg.lessThan(-1) || arg.greaterThan(1)) {
              throw new Error('Domain Error for acos [-1, 1]');
            }
            const rad = new Decimal(Math.acos(arg.toNumber()));
            stack.push(fromRadians(rad, angleMode));
            break;
          }
          case 'atan': {
            const rad = new Decimal(Math.atan(arg.toNumber()));
            stack.push(fromRadians(rad, angleMode));
            break;
          }

          // Reciprocal Trigonometry
          case 'sec': {
            const rad = toRadians(arg, angleMode);
            const cosVal = Math.cos(rad.toNumber());
            if (Math.abs(cosVal) < 1e-15) throw new Error('Undefined: sec asymptote');
            stack.push(new Decimal(1 / cosVal));
            break;
          }
          case 'csc': {
            const rad = toRadians(arg, angleMode);
            const sinVal = Math.sin(rad.toNumber());
            if (Math.abs(sinVal) < 1e-15) throw new Error('Undefined: csc asymptote');
            stack.push(new Decimal(1 / sinVal));
            break;
          }
          case 'cot': {
            const rad = toRadians(arg, angleMode);
            const sinVal = Math.sin(rad.toNumber());
            if (Math.abs(sinVal) < 1e-15) throw new Error('Undefined: cot asymptote');
            stack.push(new Decimal(Math.cos(rad.toNumber()) / sinVal));
            break;
          }

          // Hyperbolic Functions
          case 'sinh':
            stack.push(new Decimal(Math.sinh(arg.toNumber())));
            break;
          case 'cosh':
            stack.push(new Decimal(Math.cosh(arg.toNumber())));
            break;
          case 'tanh':
            stack.push(new Decimal(Math.tanh(arg.toNumber())));
            break;
          case 'asinh':
            stack.push(new Decimal(Math.asinh(arg.toNumber())));
            break;
          case 'acosh':
            if (arg.lessThan(1)) throw new Error('Domain Error: acosh(x) requires x >= 1');
            stack.push(new Decimal(Math.acosh(arg.toNumber())));
            break;
          case 'atanh':
            if (arg.lessThanOrEqualTo(-1) || arg.greaterThanOrEqualTo(1)) {
              throw new Error('Domain Error: atanh(x) requires -1 < x < 1');
            }
            stack.push(new Decimal(Math.atanh(arg.toNumber())));
            break;

          // Exponentials & Roots
          case 'sqrt':
            if (arg.isNegative()) throw new Error('Domain Error: sqrt of negative number');
            stack.push(arg.sqrt());
            break;
          case 'cbrt':
            stack.push(arg.cbrt());
            break;
          case 'ln':
            if (arg.lessThanOrEqualTo(0)) throw new Error('Domain Error: ln(x) for x <= 0');
            stack.push(arg.ln());
            break;
          case 'log':
            if (arg.lessThanOrEqualTo(0)) throw new Error('Domain Error: log(x) for x <= 0');
            stack.push(arg.log(10));
            break;
          case 'log2':
            if (arg.lessThanOrEqualTo(0)) throw new Error('Domain Error: log2(x) for x <= 0');
            stack.push(arg.log(2));
            break;
          case 'exp':
            stack.push(arg.exp());
            break;

          // Discrete, Rounding & Absolute
          case 'abs':
            stack.push(arg.abs());
            break;
          case 'floor':
            stack.push(arg.floor());
            break;
          case 'ceil':
            stack.push(arg.ceil());
            break;
          case 'round':
            stack.push(arg.round());
            break;
          case 'sign':
            stack.push(new Decimal(arg.isZero() ? 0 : arg.isPositive() ? 1 : -1));
            break;
          case 'fact':
            stack.push(factorial(arg));
            break;
          case 'rand':
            stack.push(new Decimal(Math.random()));
            break;

          default:
            throw new Error(`Unknown function: ${token.value}`);
        }
        break;
      }

      default:
        throw new Error(`Unexpected token type: ${token.type}`);
    }
  }

  if (stack.length !== 1) {
    throw new Error('Malformed expression');
  }

  return stack[0];
}

/**
 * Cleanly formats a Decimal result into human-readable string.
 */
export function formatResult(decimal: Decimal, maxSignificantDigits = 14): string {
  if (decimal.isNaN()) return 'NaN';
  if (!decimal.isFinite()) return 'Infinity';

  const absVal = decimal.abs();
  if (
    (!absVal.isZero() && absVal.greaterThanOrEqualTo(1e14)) ||
    (!absVal.isZero() && absVal.lessThan(1e-7))
  ) {
    return decimal.toExponential(7).replace(/e\+?/, 'e');
  }

  return decimal.toSignificantDigits(maxSignificantDigits).toString();
}
