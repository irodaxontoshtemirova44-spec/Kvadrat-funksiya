import { ParabolaAnalysis, QuadraticParams } from '../types';

export const EPSILON = 0.000001;

/**
 * Format a number cleanly: e.g. 2, -3.5, 0.25 (no trailing zeroes).
 */
export function formatNum(val: number, maxDecimals: number = 2): string {
  if (Math.abs(val) < EPSILON) return '0';
  const rounded = Number(val.toFixed(maxDecimals));
  return String(rounded);
}

/**
 * Check if two numbers are approximately equal within tolerance.
 */
export function approxEqual(a: number, b: number, tol: number = 0.05): boolean {
  return Math.abs(a - b) <= tol;
}

/**
 * Parse student input string that might be fraction "1/2", decimal "0.5" or "0,5".
 */
export function parseStudentNumber(str: string): number | null {
  if (!str) return null;
  const clean = str.trim().replace(',', '.');
  if (clean.includes('/')) {
    const parts = clean.split('/');
    if (parts.length === 2) {
      const num = parseFloat(parts[0]);
      const den = parseFloat(parts[1]);
      if (!isNaN(num) && !isNaN(den) && Math.abs(den) > EPSILON) {
        return num / den;
      }
    }
  }
  const val = parseFloat(clean);
  return isNaN(val) ? null : val;
}

/**
 * Formats y = ax^2 + bx + c nicely
 */
export function formatQuadraticFormula(a: number, b: number, c: number): string {
  let res = 'y = ';
  
  // a term
  if (a === 1) res += 'x²';
  else if (a === -1) res += '-x²';
  else res += `${formatNum(a)}x²`;

  // b term
  if (Math.abs(b) > EPSILON) {
    if (b > 0) {
      res += (b === 1 ? ' + x' : ` + ${formatNum(b)}x`);
    } else {
      res += (b === -1 ? ' - x' : ` - ${formatNum(Math.abs(b))}x`);
    }
  }

  // c term
  if (Math.abs(c) > EPSILON) {
    if (c > 0) {
      res += ` + ${formatNum(c)}`;
    } else {
      res += ` - ${formatNum(Math.abs(c))}`;
    }
  } else if (Math.abs(b) < EPSILON && Math.abs(a - 1) < EPSILON) {
    // y = x^2
  }

  return res;
}

/**
 * Formats y = a(x - m)^2 + n
 */
export function formatVertexForm(a: number, m: number, n: number): string {
  let res = 'y = ';
  if (a === 1) {
    // nothing
  } else if (a === -1) {
    res += '-';
  } else {
    res += `${formatNum(a)}`;
  }

  if (Math.abs(m) < EPSILON) {
    res += 'x²';
  } else if (m > 0) {
    res += `(x - ${formatNum(m)})²`;
  } else {
    res += `(x + ${formatNum(Math.abs(m))})²`;
  }

  if (Math.abs(n) > EPSILON) {
    if (n > 0) res += ` + ${formatNum(n)}`;
    else res += ` - ${formatNum(Math.abs(n))}`;
  }

  return res;
}

/**
 * Complete mathematical analysis of y = ax^2 + bx + c
 */
export function analyzeParabola(params: QuadraticParams): ParabolaAnalysis {
  const { a, b, c } = params;
  const safeA = Math.abs(a) < EPSILON ? 1 : a;

  // Vertex
  const x0 = -b / (2 * safeA);
  const y0 = safeA * x0 * x0 + b * x0 + c;

  // Direction
  const direction: 'up' | 'down' = safeA > 0 ? 'up' : 'down';

  // Discriminant
  const discriminant = b * b - 4 * safeA * c;

  // Roots
  const roots: number[] = [];
  if (discriminant > EPSILON) {
    const r1 = (-b - Math.sqrt(discriminant)) / (2 * safeA);
    const r2 = (-b + Math.sqrt(discriminant)) / (2 * safeA);
    roots.push(Math.min(r1, r2), Math.max(r1, r2));
  } else if (Math.abs(discriminant) <= EPSILON) {
    roots.push(-b / (2 * safeA));
  }

  // Domain: always (-infinity, +infinity)
  const domain = '(-∞; +∞)';

  // Range
  const range = direction === 'up'
    ? `[${formatNum(y0)}; +∞)`
    : `(-∞; ${formatNum(y0)}]`;

  // Intervals of increase and decrease
  let increasingInterval: string;
  let decreasingInterval: string;

  if (direction === 'up') {
    increasingInterval = `[${formatNum(x0)}; +∞)`;
    decreasingInterval = `(-∞; ${formatNum(x0)}]`;
  } else {
    increasingInterval = `(-∞; ${formatNum(x0)}]`;
    decreasingInterval = `[${formatNum(x0)}; +∞)`;
  }

  // Parity
  // Quadratic function y = ax^2 + bx + c
  // f(-x) = a(-x)^2 + b(-x) + c = ax^2 - bx + c
  // f(-x) = f(x) <=> -bx = bx <=> 2bx = 0 <=> b = 0.
  // Quadratic can never be odd because f(-x) = -f(x) would require ax^2 - bx + c = -ax^2 - bx - c => 2ax^2 + 2c = 0 for all x, impossible for a != 0.
  let parity: 'even' | 'odd' | 'neither' = 'neither';
  if (Math.abs(b) < EPSILON) {
    parity = 'even';
  }

  return {
    a: safeA,
    b,
    c,
    x0,
    y0,
    direction,
    discriminant,
    roots,
    yIntercept: c,
    domain,
    range,
    increasingInterval,
    decreasingInterval,
    parity,
    standardFormString: formatQuadraticFormula(safeA, b, c),
    vertexFormString: formatVertexForm(safeA, x0, y0),
  };
}

/**
 * Calculate function value f(x)
 */
export function evaluateQuadratic(params: QuadraticParams, x: number): number {
  return params.a * x * x + params.b * x + params.c;
}
