import { calculate } from './calculator';

const tests = [
  { expr: '0.1 + 0.2', expected: '0.3', desc: 'Precision test: 0.1 + 0.2 == 0.3' },
  { expr: '2 + 3 * 4', expected: '14', desc: 'Precedence: 2 + 3 * 4' },
  { expr: '(2 + 3) * 4', expected: '20', desc: 'Parentheses: (2 + 3) * 4' },
  { expr: '2(3 + 4)', expected: '14', desc: 'Implicit multiplication: 2(3 + 4)' },
  { expr: '-5 + 3', expected: '-2', desc: 'Unary minus leading: -5 + 3' },
  { expr: '5 * -2', expected: '-10', desc: 'Unary minus intermediate: 5 * -2' },
  { expr: '2^3', expected: '8', desc: 'Exponentiation: 2^3' },
  { expr: '5!', expected: '120', desc: 'Factorial: 5!' },
  { expr: 'sqrt(16)', expected: '4', desc: 'Square root: sqrt(16)' },
  { expr: 'cbrt(27)', expected: '3', desc: 'Cube root: cbrt(27)' },
  { expr: 'cbrt(125', expected: '5', desc: 'Unclosed function: cbrt(125 == 5' },
  { expr: 'sqrt(144', expected: '12', desc: 'Unclosed function: sqrt(144 == 12' },
  { expr: 'sin(30', mode: 'DEG' as const, expected: '0.5', desc: 'Unclosed trig: sin(30 == 0.5' },
  { expr: '(2 + 3', expected: '5', desc: 'Unclosed bracket: (2 + 3 == 5' },
  { expr: '((2 + 3) * 4', expected: '20', desc: 'Nested unclosed: ((2 + 3) * 4 == 20' },
  { expr: 'cos(0)', mode: 'DEG' as const, expected: '1', desc: 'Trig DEG: cos(0) == 1' },
  { expr: 'tan(45)', mode: 'DEG' as const, expected: '1', desc: 'Trig DEG: tan(45) == 1' },
  { expr: 'asin(0.5)', mode: 'DEG' as const, expected: '30', desc: 'Inverse Trig DEG: asin(0.5) == 30' },
  { expr: 'atan(1)', mode: 'DEG' as const, expected: '45', desc: 'Inverse Trig DEG: atan(1) == 45' },
  { expr: 'sinh(0)', expected: '0', desc: 'Hyperbolic: sinh(0) == 0' },
  { expr: 'cosh(0)', expected: '1', desc: 'Hyperbolic: cosh(0) == 1' },
  { expr: 'log2(8)', expected: '3', desc: 'Base-2 Log: log2(8) == 3' },
  { expr: 'log(1000)', expected: '3', desc: 'Base-10 Log: log(1000) == 3' },
  { expr: '5 ncr 2', expected: '10', desc: 'Combinations: 5 nCr 2 == 10' },
  { expr: '5 npr 2', expected: '20', desc: 'Permutations: 5 nPr 2 == 20' },
  { expr: '17 mod 5', expected: '2', desc: 'Modulo: 17 mod 5 == 2' },
  { expr: 'floor(4.9)', expected: '4', desc: 'Floor: floor(4.9) == 4' },
  { expr: 'ceil(4.1)', expected: '5', desc: 'Ceil: ceil(4.1) == 5' },
  { expr: '1 / 0', expectedError: true, desc: 'Division by zero' },
];

let allPassed = true;
console.log('--- RUNNING EXTENDED MATH ENGINE TESTS WITH UNCLOSED PARENTHESES ---');

for (const t of tests) {
  const res = calculate(t.expr, t.mode ?? 'DEG');
  if (t.expectedError) {
    if (!res.success) {
      console.log(`✓ PASS: ${t.desc} -> Expected error: "${res.error}"`);
    } else {
      console.error(`✗ FAIL: ${t.desc} -> Expected error but got ${res.formatted}`);
      allPassed = false;
    }
  } else {
    if (res.success && res.formatted === t.expected) {
      console.log(`✓ PASS: ${t.desc} -> ${res.formatted}`);
    } else {
      console.error(`✗ FAIL: ${t.desc} -> Expected "${t.expected}" but got "${res.formatted}" (error: ${res.error})`);
      allPassed = false;
    }
  }
}

if (allPassed) {
  console.log('All tests with unclosed parentheses passed successfully!');
} else {
  console.error('Some tests failed.');
  process.exit(1);
}
