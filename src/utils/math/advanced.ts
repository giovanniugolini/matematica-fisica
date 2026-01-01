// src/utils/math/advanced.ts
import { formatLinearLatex, formatQuadraticLatex, formatNumberLatex, isZero } from "./latex";

// Tipi base
export type Linear = { a: number; b: number };
export type Quadratic = { a: number; b: number; c: number };
export type Polynomial = Linear | Quadratic;

// --- radici ---
export function getRoots(poly: Polynomial): number[] {
    // lineare: ax + b = 0
    if (!("c" in poly)) {
        if (isZero(poly.a)) return [];
        return [-poly.b / poly.a];
    }

    // quadratica: ax^2 + bx + c = 0
    const { a, b, c } = poly;
    if (isZero(a)) {
        // degrada a lineare
        if (isZero(b)) return [];
        return [-c / b];
    }

    const disc = b * b - 4 * a * c;
    if (disc < 0) return [];
    if (isZero(disc)) return [-b / (2 * a)];

    const s = Math.sqrt(disc);
    const r1 = (-b - s) / (2 * a);
    const r2 = (-b + s) / (2 * a);
    return [r1, r2].sort((u, v) => u - v);
}

// --- latex denominatori/numeratori (NO "1x") ---
export function formatDenominatorLatex(poly: Polynomial): string {
    if ("c" in poly) return formatQuadraticLatex(poly.a, poly.b, poly.c);
    return formatLinearLatex(poly.a, poly.b);
}

export function factorizeDenominatorLatex(poly: Polynomial): string {
    const roots = getRoots(poly);
    if (roots.length === 0) return `(${formatDenominatorLatex(poly)})`;
    if (roots.length === 1) return `(${linearFactorLatex(roots[0])})`;
    return `(${linearFactorLatex(roots[0])})(${linearFactorLatex(roots[1])})`;
}

export type Const = { k: number };
export type Num = Const | Linear | Quadratic;

export function formatNumeratorLatex(num: Num): string {
    if ("k" in num) return `${num.k}`;
    if ("c" in num) return formatQuadraticLatex(num.a, num.b, num.c);
    return formatLinearLatex(num.a, num.b);
}

// --- m.c.m. corretto: fattori distinti (radici uniche) ---
export function getDenominatorRoots(polys: Polynomial[]): number[] {
    const eps = 1e-9;
    const roots: number[] = [];
    for (const p of polys) roots.push(...getRoots(p));

    const uniq: number[] = [];
    for (const r of roots) {
        if (!uniq.some((u) => Math.abs(u - r) < eps)) uniq.push(r);
    }
    return uniq.sort((a, b) => a - b);
}

export function mcmLatexFromDenominators(polys: Polynomial[]): string {
    const roots = getDenominatorRoots(polys);
    if (roots.length === 0) return "1";
    return roots.map((r) => `(${linearFactorLatex(r)})`).join("");
}

export function multiplierLatexForDenominator(den: Polynomial, allDenoms: Polynomial[]): string {
    const eps = 1e-9;
    const mcmRoots = getDenominatorRoots(allDenoms);
    const denRoots = getRoots(den);
    const missing = mcmRoots.filter((r) => !denRoots.some((d) => Math.abs(d - r) < eps));
    if (missing.length === 0) return "1";
    return missing.map((r) => `(${linearFactorLatex(r)})`).join("");
}

// --- helper: (x - r) in forma "x ± ..."
function linearFactorLatex(root: number): string {
    if (isZero(root)) return "x";
    const abs = Math.abs(root);
    const n = formatNumberLatex(abs);
    return `x ${root > 0 ? "-" : "+"} ${n}`;
}
