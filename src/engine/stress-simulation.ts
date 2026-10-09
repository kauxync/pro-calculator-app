import { calculate, CalculationResult } from './calculator';
import { AngleMode } from '../types/calculator';
import Decimal from 'decimal.js';

interface TestCase {
  id: number;
  category: string;
  expression: string;
  angleMode?: AngleMode;
  isLivePreview?: boolean;
  expectedSuccess: boolean;
  expectedErrorSubstr?: string;
  referenceValue?: Decimal | number;
  tolerance?: number;
}

interface TestResult {
  test: TestCase;
  result: CalculationResult;
  passed: boolean;
  durationUs: number; // microseconds
  failureReason?: string;
}

interface CategoryStats {
  category: string;
  total: number;
  passed: number;
  failed: number;
  crashed: number;
  totalDurationUs: number;
  minDurationUs: number;
  maxDurationUs: number;
}

function generateSuite(): TestCase[] {
  const tests: TestCase[] = [];
  let id = 1;

  // =========================================================================
  // CATEGORY 1: Basic & Arbitrary Precision Floating Point (2,000 tests)
  // =========================================================================
  // 1.1 Classic float precision edge cases (0.1 + 0.2, etc.)
  for (let i = 0; i < 200; i++) {
    const a = (0.1 * (i + 1)).toFixed(4);
    const b = (0.2 * (i + 1)).toFixed(4);
    const expected = new Decimal(a).plus(new Decimal(b));
    tests.push({
      id: id++,
      category: '1. Basic & Arbitrary Precision',
      expression: `${a} + ${b}`,
      expectedSuccess: true,
      referenceValue: expected,
      tolerance: 1e-15,
    });
  }

  // 1.2 High precision large decimals (30+ digits)
  for (let i = 0; i < 400; i++) {
    const num1 = `12345678901234567890.${(i * 997 + 1000).toString().padStart(6, '0')}`;
    const num2 = `98765432109876543210.${(i * 331 + 2000).toString().padStart(6, '0')}`;
    const op = i % 4 === 0 ? '+' : i % 4 === 1 ? '-' : i % 4 === 2 ? '*' : '/';
    let expected: Decimal;
    if (op === '+') expected = new Decimal(num1).plus(new Decimal(num2));
    else if (op === '-') expected = new Decimal(num1).minus(new Decimal(num2));
    else if (op === '*') expected = new Decimal(num1).times(new Decimal(num2));
    else expected = new Decimal(num1).dividedBy(new Decimal(num2));

    tests.push({
      id: id++,
      category: '1. Basic & Arbitrary Precision',
      expression: `${num1} ${op} ${num2}`,
      expectedSuccess: true,
      referenceValue: expected,
      tolerance: 1e-12,
    });
  }

  // 1.3 Multi-term arithmetic chains (3-7 terms with mixed operators)
  for (let i = 0; i < 600; i++) {
    const v1 = ((i * 7 + 13) % 1000) / 10;
    const v2 = ((i * 11 + 17) % 500 + 1) / 10;
    const v3 = ((i * 13 + 19) % 250 + 1) / 5;
    const v4 = ((i * 17 + 23) % 100 + 1) / 2;
    const expr = `${v1} + ${v2} * ${v3} - ${v4} / ${v2}`;
    const expected = new Decimal(v1)
      .plus(new Decimal(v2).times(new Decimal(v3)))
      .minus(new Decimal(v4).dividedBy(new Decimal(v2)));

    tests.push({
      id: id++,
      category: '1. Basic & Arbitrary Precision',
      expression: expr,
      expectedSuccess: true,
      referenceValue: expected,
      tolerance: 1e-12,
    });
  }

  // 1.4 Scientific notation & micro/macro floats
  for (let i = 0; i < 400; i++) {
    const exp1 = (i % 20) - 10;
    const exp2 = ((i * 3) % 20) - 10;
    const s1 = `1.5e${exp1}`;
    const s2 = `2.5e${exp2}`;
    const expected = new Decimal(s1).plus(new Decimal(s2));
    tests.push({
      id: id++,
      category: '1. Basic & Arbitrary Precision',
      expression: `${s1} + ${s2}`,
      expectedSuccess: true,
      referenceValue: expected,
      tolerance: 1e-10,
    });
  }

  // 1.5 Unicode operators (×, ÷, −)
  for (let i = 0; i < 400; i++) {
    const a = (i + 5) * 1.25;
    const b = (i % 50 + 2) * 0.5;
    const opSym = i % 3 === 0 ? '×' : i % 3 === 1 ? '÷' : '−';
    let expected: Decimal;
    if (opSym === '×') expected = new Decimal(a).times(new Decimal(b));
    else if (opSym === '÷') expected = new Decimal(a).dividedBy(new Decimal(b));
    else expected = new Decimal(a).minus(new Decimal(b));

    tests.push({
      id: id++,
      category: '1. Basic & Arbitrary Precision',
      expression: `${a} ${opSym} ${b}`,
      expectedSuccess: true,
      referenceValue: expected,
      tolerance: 1e-12,
    });
  }

  // =========================================================================
  // CATEGORY 2: Algebraic & Nested Expressions & Unclosed Parens (2,000 tests)
  // =========================================================================
  // 2.1 Deeply nested parentheses (depth 2 to 10)
  for (let i = 0; i < 600; i++) {
    const depth = (i % 8) + 2;
    let openStr = '('.repeat(depth);
    let inner = '2';
    let closeStr = '';
    for (let d = 1; d < depth; d++) {
      inner += ` + ${d}`;
      closeStr += ') * 2';
    }
    inner += ')';
    const expr = openStr + inner + closeStr;
    tests.push({
      id: id++,
      category: '2. Algebraic & Nested Expressions',
      expression: expr,
      expectedSuccess: true,
    });
  }

  // 2.2 Unclosed parentheses (auto-closing test)
  for (let i = 0; i < 600; i++) {
    const variants = [
      `cbrt(${125 + i}`,
      `sqrt(${144 + i}`,
      `(((${i + 5} + 3) * 2`,
      `sin(${30 + (i % 60)}`,
      `abs(-${i + 10}`,
      `exp(${i % 10}`,
    ];
    const expr = variants[i % variants.length];
    tests.push({
      id: id++,
      category: '2. Algebraic & Nested Expressions',
      expression: expr,
      expectedSuccess: true,
    });
  }

  // 2.3 Implicit multiplication (e.g. 2(3+4), (2+3)(4+5), 3sqrt(16), 5pi)
  for (let i = 0; i < 400; i++) {
    const a = (i % 20) + 2;
    const b = (i % 15) + 3;
    const c = (i % 10) + 1;
    const patterns = [
      `${a}(${b} + ${c})`,
      `(${a} + ${b})(${c} + 2)`,
      `${a}sqrt(${b * b})`,
      `${a}pi`,
      `(${a})${b}`,
    ];
    const expr = patterns[i % patterns.length];
    tests.push({
      id: id++,
      category: '2. Algebraic & Nested Expressions',
      expression: expr,
      expectedSuccess: true,
    });
  }

  // 2.4 Complex precedence & unary minus
  for (let i = 0; i < 400; i++) {
    const a = (i % 30) + 1;
    const b = (i % 10) + 2;
    const c = (i % 5) + 1;
    const expr = `-${a} + ${b} * -(${c} + 4) ^ 2 / 2`;
    tests.push({
      id: id++,
      category: '2. Algebraic & Nested Expressions',
      expression: expr,
      expectedSuccess: true,
    });
  }

  // =========================================================================
  // CATEGORY 3: Trigonometry & Inverse Trig in DEG & RAD (2,000 tests)
  // =========================================================================
  // 3.1 DEG Mode (1,000 tests)
  const degKeyAngles = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360, -30, -45, -90];
  for (let i = 0; i < 1000; i++) {
    const angle = i < degKeyAngles.length ? degKeyAngles[i] : (i * 37) % 720 - 360;
    const fnType = i % 8;
    let expr = '';
    let expectedSuccess = true;
    let expectedErrorSubstr: string | undefined;

    if (fnType === 0) {
      expr = `sin(${angle})`;
    } else if (fnType === 1) {
      expr = `cos(${angle})`;
    } else if (fnType === 2) {
      // tan asymptote at 90 + 180k
      if (Math.abs(angle % 180) === 90) {
        expectedSuccess = false;
        expectedErrorSubstr = 'asymptote';
      }
      expr = `tan(${angle})`;
    } else if (fnType === 3) {
      const val = ((i % 200) - 100) / 100; // [-1, 1]
      expr = `asin(${val})`;
    } else if (fnType === 4) {
      const val = ((i % 200) - 100) / 100; // [-1, 1]
      expr = `acos(${val})`;
    } else if (fnType === 5) {
      const val = ((i % 400) - 200) / 50;
      expr = `atan(${val})`;
    } else if (fnType === 6) {
      // sec(x)
      if (Math.abs(angle % 180) === 90) {
        expectedSuccess = false;
        expectedErrorSubstr = 'asymptote';
      }
      expr = `sec(${angle})`;
    } else {
      // csc(x)
      if (angle % 180 === 0) {
        expectedSuccess = false;
        expectedErrorSubstr = 'asymptote';
      }
      expr = `csc(${angle})`;
    }

    tests.push({
      id: id++,
      category: '3. Trigonometry (DEG & RAD)',
      expression: expr,
      angleMode: 'DEG',
      expectedSuccess,
      expectedErrorSubstr,
    });
  }

  // 3.2 RAD Mode (1,000 tests)
  for (let i = 0; i < 1000; i++) {
    const radFraction = ((i * 13) % 628) / 100 - 3.14; // approx -pi to pi
    const fnType = i % 8;
    let expr = '';
    let expectedSuccess = true;
    let expectedErrorSubstr: string | undefined;

    if (fnType === 0) {
      expr = `sin(${radFraction})`;
    } else if (fnType === 1) {
      expr = `cos(${radFraction})`;
    } else if (fnType === 2) {
      expr = `tan(${radFraction})`;
    } else if (fnType === 3) {
      const val = ((i % 190) - 95) / 100;
      expr = `asin(${val})`;
    } else if (fnType === 4) {
      const val = ((i % 190) - 95) / 100;
      expr = `acos(${val})`;
    } else if (fnType === 5) {
      const val = ((i % 300) - 150) / 30;
      expr = `atan(${val})`;
    } else if (fnType === 6) {
      expr = `sin(${radFraction}) ^ 2 + cos(${radFraction}) ^ 2`;
    } else {
      expr = `atan(tan(${radFraction / 2}))`;
    }

    tests.push({
      id: id++,
      category: '3. Trigonometry (DEG & RAD)',
      expression: expr,
      angleMode: 'RAD',
      expectedSuccess,
      expectedErrorSubstr,
    });
  }

  // =========================================================================
  // CATEGORY 4: Hyperbolic & Inverse Hyperbolic Functions (1,000 tests)
  // =========================================================================
  for (let i = 0; i < 1000; i++) {
    const type = i % 6;
    let expr = '';
    let expectedSuccess = true;
    let expectedErrorSubstr: string | undefined;

    if (type === 0) {
      const x = ((i % 200) - 100) / 20; // [-5, 5]
      expr = `sinh(${x})`;
    } else if (type === 1) {
      const x = ((i % 200) - 100) / 20;
      expr = `cosh(${x})`;
    } else if (type === 2) {
      const x = ((i % 200) - 100) / 20;
      expr = `tanh(${x})`;
    } else if (type === 3) {
      const x = ((i % 400) - 200) / 10;
      expr = `asinh(${x})`;
    } else if (type === 4) {
      // acosh requires x >= 1
      const isInvalid = i % 10 === 0;
      const x = isInvalid ? 0.5 : 1 + (i % 200) * 0.1;
      expr = `acosh(${x})`;
      if (isInvalid) {
        expectedSuccess = false;
        expectedErrorSubstr = 'Domain Error';
      }
    } else {
      // atanh requires -1 < x < 1
      const isInvalid = i % 10 === 0;
      const x = isInvalid ? (i % 2 === 0 ? 1.5 : -1.0) : ((i % 180) - 90) / 100;
      expr = `atanh(${x})`;
      if (isInvalid) {
        expectedSuccess = false;
        expectedErrorSubstr = 'Domain Error';
      }
    }

    tests.push({
      id: id++,
      category: '4. Hyperbolic Functions',
      expression: expr,
      expectedSuccess,
      expectedErrorSubstr,
    });
  }

  // =========================================================================
  // CATEGORY 5: Discrete Math, Factorials, nPr, nCr, Modulo (1,000 tests)
  // =========================================================================
  for (let i = 0; i < 1000; i++) {
    const type = i % 5;
    let expr = '';
    let expectedSuccess = true;
    let expectedErrorSubstr: string | undefined;

    if (type === 0) {
      // Factorials: n! and fact(n)
      const n = (i * 7) % 60; // 0 to 59
      const usePostfix = i % 2 === 0;
      expr = usePostfix ? `${n}!` : `fact(${n})`;
    } else if (type === 1) {
      // Permutations nPr
      const n = (i % 25) + 5;
      const r = (i % 6);
      const isInvalid = i % 20 === 0;
      const actualR = isInvalid ? n + 2 : r;
      expr = `${n} npr ${actualR}`;
      if (isInvalid) {
        expectedSuccess = false;
        expectedErrorSubstr = 'Invalid operands';
      }
    } else if (type === 2) {
      // Combinations nCr
      const n = (i % 30) + 5;
      const r = (i % 6);
      const isInvalid = i % 20 === 0;
      const actualR = isInvalid ? n + 5 : r;
      expr = `${n} ncr ${actualR}`;
      if (isInvalid) {
        expectedSuccess = false;
        expectedErrorSubstr = 'Invalid operands';
      }
    } else if (type === 3) {
      // Modulo
      const a = (i * 123) % 10000 + 10;
      const isZero = i % 25 === 0;
      const b = isZero ? 0 : (i % 30) + 1;
      expr = `${a} mod ${b}`;
      if (isZero) {
        expectedSuccess = false;
        expectedErrorSubstr = 'modulo by zero';
      }
    } else {
      // Percentages and combinations
      const val = (i % 100) + 1;
      expr = `${val}% * 200 + 50%`;
    }

    tests.push({
      id: id++,
      category: '5. Discrete & Combinatorics',
      expression: expr,
      expectedSuccess,
      expectedErrorSubstr,
    });
  }

  // =========================================================================
  // CATEGORY 6: Logarithms, Powers, Roots (1,000 tests)
  // =========================================================================
  for (let i = 0; i < 1000; i++) {
    const type = i % 5;
    let expr = '';
    let expectedSuccess = true;
    let expectedErrorSubstr: string | undefined;

    if (type === 0) {
      // Natural Log ln
      const isInvalid = i % 20 === 0;
      const x = isInvalid ? -((i % 10) + 1) : ((i * 17) % 500 + 1) / 10;
      expr = `ln(${x})`;
      if (isInvalid) {
        expectedSuccess = false;
        expectedErrorSubstr = 'Domain Error';
      }
    } else if (type === 1) {
      // Common Log log
      const isInvalid = i % 20 === 0;
      const x = isInvalid ? 0 : ((i * 19) % 1000 + 1) / 5;
      expr = `log(${x})`;
      if (isInvalid) {
        expectedSuccess = false;
        expectedErrorSubstr = 'Domain Error';
      }
    } else if (type === 2) {
      // Binary Log log2
      const isInvalid = i % 20 === 0;
      const power = (i % 16) + 1;
      const x = isInvalid ? -5 : Math.pow(2, power);
      expr = `log2(${x})`;
      if (isInvalid) {
        expectedSuccess = false;
        expectedErrorSubstr = 'Domain Error';
      }
    } else if (type === 3) {
      // Powers x ^ y
      const base = (i % 20) + 1;
      const exp = ((i % 7) - 2) * 0.5; // -1, -0.5, 0, 0.5, 1, 1.5, 2
      expr = `${base} ^ ${exp}`;
    } else {
      // Roots sqrt & cbrt
      const isNegativeSqrt = i % 20 === 0;
      const val = (i % 200) + 1;
      if (i % 2 === 0) {
        expr = isNegativeSqrt ? `sqrt(-${val})` : `sqrt(${val})`;
        if (isNegativeSqrt) {
          expectedSuccess = false;
          expectedErrorSubstr = 'Domain Error';
        }
      } else {
        expr = `cbrt(-${val})`; // cbrt of negative is valid
      }
    }

    tests.push({
      id: id++,
      category: '6. Logarithms, Powers & Roots',
      expression: expr,
      expectedSuccess,
      expectedErrorSubstr,
    });
  }

  // =========================================================================
  // CATEGORY 7: Edge Cases, Constants & Massive Chaining (1,000 tests)
  // =========================================================================
  for (let i = 0; i < 1000; i++) {
    const type = i % 5;
    let expr = '';
    let expectedSuccess = true;
    let expectedErrorSubstr: string | undefined;
    let isLivePreview = false;

    if (type === 0) {
      // Division by zero traps
      const a = (i % 50) + 1;
      const variants = [
        `${a} / 0`,
        `${a} / (5 - 5)`,
        `(${a} * 10) / (3.14 - 3.14)`,
        `100 / (sin(0))`,
      ];
      expr = variants[i % variants.length];
      expectedSuccess = false;
      expectedErrorSubstr = 'Cannot divide by zero';
    } else if (type === 1) {
      // Universal mathematical constants: pi, e, phi, tau
      const consts = ['pi', 'π', 'e', 'phi', 'φ', 'tau', 'τ', 'c'];
      const c1 = consts[i % consts.length];
      const c2 = consts[(i + 3) % consts.length];
      expr = `2 * ${c1} + ${c2} ^ 2`;
    } else if (type === 2) {
      // Massive 25-term polynomial expression
      const terms: string[] = [];
      for (let t = 1; t <= 15; t++) {
        const sign = t % 2 === 0 ? '+' : '-';
        terms.push(`${sign} (${t} * ${(i % 5) + 1}) / ${t + 1}`);
      }
      expr = `100 ${terms.join(' ')}`;
    } else if (type === 3) {
      // Live preview trailing operator tolerance
      isLivePreview = true;
      const base = `(${i + 10} * 3) + 25`;
      const trailingOps = ['+', '-', '*', '/', '^', '×', '÷'];
      expr = `${base} ${trailingOps[i % trailingOps.length]}`;
      expectedSuccess = true;
    } else {
      // Rounding and Discrete Functions: floor, ceil, round, abs, sign, gcd, lcm
      const fnList = ['floor', 'ceil', 'round', 'abs', 'sign'];
      const fn = fnList[i % fnList.length];
      const val = ((i * 37) % 200 - 100) / 7;
      expr = `${fn}(${val.toFixed(4)})`;
    }

    tests.push({
      id: id++,
      category: '7. Edge Cases & Constants',
      expression: expr,
      isLivePreview,
      expectedSuccess,
      expectedErrorSubstr,
    });
  }

  return tests;
}

export function runStressSimulation() {
  console.log('='.repeat(80));
  console.log('🚀 INITIALIZING 10,000 CALCULATION MATH ENGINE STRESS SUITE');
  console.log('='.repeat(80));

  const suite = generateSuite();
  console.log(`Generated ${suite.length} test cases across 7 functional categories.\n`);

  const categoryStatsMap = new Map<string, CategoryStats>();
  const results: TestResult[] = [];

  const suiteStartTime = performance.now();

  for (const test of suite) {
    let catStats = categoryStatsMap.get(test.category);
    if (!catStats) {
      catStats = {
        category: test.category,
        total: 0,
        passed: 0,
        failed: 0,
        crashed: 0,
        totalDurationUs: 0,
        minDurationUs: Infinity,
        maxDurationUs: 0,
      };
      categoryStatsMap.set(test.category, catStats);
    }

    catStats.total++;

    const start = performance.now();
    let res: CalculationResult;
    let crashed = false;

    try {
      res = calculate(test.expression, test.angleMode || 'DEG', test.isLivePreview || false);
    } catch (err: any) {
      crashed = true;
      res = { success: false, error: `CRASH: ${err?.message}` };
    }

    const durationUs = (performance.now() - start) * 1000;
    catStats.totalDurationUs += durationUs;
    if (durationUs < catStats.minDurationUs) catStats.minDurationUs = durationUs;
    if (durationUs > catStats.maxDurationUs) catStats.maxDurationUs = durationUs;

    let passed = false;
    let failureReason: string | undefined;

    if (crashed) {
      catStats.crashed++;
      failureReason = `Engine threw uncaught exception: ${res.error}`;
    } else if (test.expectedSuccess) {
      if (!res.success) {
        failureReason = `Expected success but got error: "${res.error}"`;
      } else if (res.formatted === undefined || res.formatted === null) {
        failureReason = 'Expected formatted string output';
      } else if (test.referenceValue !== undefined && res.value !== undefined) {
        const ref = new Decimal(test.referenceValue);
        const actual = res.value;
        const tol = test.tolerance ?? 1e-10;
        const diff = actual.minus(ref).abs();
        const denom = ref.abs().isZero() ? new Decimal(1) : ref.abs();
        const relDiff = diff.dividedBy(denom).toNumber();

        if (relDiff > tol && diff.toNumber() > tol) {
          failureReason = `Value mismatch: got ${actual.toString()}, expected ${ref.toString()} (relDiff: ${relDiff})`;
        } else {
          passed = true;
        }
      } else {
        passed = true;
      }
    } else {
      // Expected failure
      if (res.success) {
        failureReason = `Expected error but operation succeeded with value: ${res.formatted}`;
      } else if (test.expectedErrorSubstr && !res.error?.toLowerCase().includes(test.expectedErrorSubstr.toLowerCase())) {
        failureReason = `Error message "${res.error}" did not match expected substring "${test.expectedErrorSubstr}"`;
      } else {
        passed = true;
      }
    }

    if (passed) {
      catStats.passed++;
    } else {
      catStats.failed++;
    }

    results.push({
      test,
      result: res,
      passed,
      durationUs,
      failureReason,
    });
  }

  const suiteEndTime = performance.now();
  const totalDurationMs = suiteEndTime - suiteStartTime;
  const totalPassed = results.filter((r) => r.passed).length;
  const totalFailed = results.filter((r) => !r.passed).length;
  const totalCrashed = results.filter((r) => r.result.error?.startsWith('CRASH:')).length;
  const opsPerSec = (suite.length / (totalDurationMs / 1000)).toFixed(2);

  console.log('='.repeat(80));
  console.log('📊 SIMULATION RESULTS & BENCHMARK BREAKDOWN');
  console.log('='.repeat(80));

  console.log(`Total Calculations : ${suite.length.toLocaleString()}`);
  console.log(`Total Passed       : ${totalPassed.toLocaleString()} (${((totalPassed / suite.length) * 100).toFixed(2)}%)`);
  console.log(`Total Failed       : ${totalFailed.toLocaleString()}`);
  console.log(`Crashes (Uncaught) : ${totalCrashed.toLocaleString()}`);
  console.log(`Total Wall Time    : ${totalDurationMs.toFixed(2)} ms (${(totalDurationMs / 1000).toFixed(3)} s)`);
  console.log(`Throughput         : ${Number(opsPerSec).toLocaleString()} ops/second`);
  console.log(`Mean Latency       : ${(totalDurationMs / suite.length).toFixed(4)} ms/op (${((totalDurationMs * 1000) / suite.length).toFixed(1)} µs/op)`);
  console.log('-'.repeat(80));

  console.log(
    '| Category                                | Total | Passed | Failed | Crashed | Avg (µs) | Min (µs) | Max (µs) |'
  );
  console.log(
    '|-----------------------------------------|-------|--------|--------|---------|----------|----------|----------|'
  );

  for (const [name, stats] of categoryStatsMap.entries()) {
    const avgUs = (stats.totalDurationUs / stats.total).toFixed(1);
    const minUs = stats.minDurationUs.toFixed(1);
    const maxUs = stats.maxDurationUs.toFixed(1);
    const paddedName = name.padEnd(39, ' ');
    const paddedTotal = stats.total.toString().padStart(5, ' ');
    const paddedPassed = stats.passed.toString().padStart(6, ' ');
    const paddedFailed = stats.failed.toString().padStart(6, ' ');
    const paddedCrashed = stats.crashed.toString().padStart(7, ' ');
    const paddedAvg = avgUs.padStart(8, ' ');
    const paddedMin = minUs.padStart(8, ' ');
    const paddedMax = maxUs.padStart(8, ' ');

    console.log(
      `| ${paddedName} | ${paddedTotal} | ${paddedPassed} | ${paddedFailed} | ${paddedCrashed} | ${paddedAvg} | ${paddedMin} | ${paddedMax} |`
    );
  }
  console.log('='.repeat(80));

  if (totalFailed > 0) {
    console.log('\n❌ FIRST 10 FAILURE SAMPLES:');
    const failures = results.filter((r) => !r.passed).slice(0, 10);
    for (const f of failures) {
      console.log(`[Test #${f.test.id}] Category: "${f.test.category}"`);
      console.log(`  Expr: "${f.test.expression}"`);
      console.log(`  Reason: ${f.failureReason}`);
    }
  } else {
    console.log('\n✅ 100% OF 10,000 CALCULATIONS EVALUATED WITH ZERO ERRORS / ZERO CRASHES!');
  }

  return {
    total: suite.length,
    passed: totalPassed,
    failed: totalFailed,
    crashed: totalCrashed,
    totalDurationMs,
    opsPerSec: Number(opsPerSec),
    avgLatencyUs: (totalDurationMs * 1000) / suite.length,
    categoryStats: Array.from(categoryStatsMap.values()),
    sampleFailures: results.filter((r) => !r.passed).slice(0, 10),
  };
}

// Execute simulation
runStressSimulation();
