// src/utils/math/index.ts

// =====================
// RANDOM
// =====================
export {
    randomInt,
    randomNonZero,
    randomChoice,
    randomUniqueInts,
    randomMaybeHalf,
    randomBool,
    shuffle,
} from "./random";

// =====================
// LATEX / ALGEBRA
// =====================
export * from "./latex";

// =====================
// FORMAT
// =====================
export * from "./formatting";

// =====================
// FISICA
// =====================
export * from "./physics";

// =====================
// EQUAZIONI FRAZIONARIE
// =====================
export type {
    Linear,
    Quadratic,
    Polynomial,
    Const,
    Num,
} from "./advanced";

export {
    getRoots,
    formatDenominatorLatex,
    factorizeDenominatorLatex,
    formatNumeratorLatex,
    getDenominatorRoots,
    mcmLatexFromDenominators,
    multiplierLatexForDenominator,
} from "./advanced";
