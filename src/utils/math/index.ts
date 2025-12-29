/**
 * Math Utilities - Esporta tutte le utility matematiche
 * @module utils/math
 */

// Random
export {
    randomInt,
    randomNonZero,
    randomChoice,
    randomUniqueInts,
    randomMaybeHalf,
    randomBool,
    shuffle,
} from "./random";

// LaTeX formatting
export {
    // Utility base
    gcd,
    gcdDecimal,
    isZero,

    // Frazioni
    formatFractionLatex,
    formatIntFractionLatex,
    formatNumberLatex,
    formatRatioLatex,

    // Monomi
    monoX2Latex,
    monoXLatex,
    constLatex,
    coefForX2Latex,
    coefForXLatex,

    // Polinomi
    sumTermsLatex,
    formatQuadraticLatex,
    formatLinearLatex,
    parenLatex,
    parenLinearLatex,

    // Segni disequazioni
    signToLatex,
    signToText,
    signToSymbol,
    isStrictInequality,
    isPositiveInequality,

    // Insiemi e intervalli
    emptySetLatex,
    realSetLatex,
    setLatex,
    intervalLatex,
    setBuilderLatex,

    // Equazioni quadratiche
    classifyQuadratic,
    discriminant,
    discriminantFormulaLatex,

    // Notazione scientifica
    scientificLatex,

    // Radici
    sqrtLatex,
    nthRootLatex,
} from "./latex";

export type { InequalitySign, TermDef } from "./latex";

// Vectors (se presente)
export * from "./vectors";

// Formatting (se presente) - escludi lerp che è già in vectors
export {
    // Costanti
    PI,
    TAU,
    E,
    DEG_TO_RAD,
    RAD_TO_DEG,

    // Conversioni angolari
    toRadians,
    toDegrees,
    normalizeAngle,
    normalizeAngleSigned,
    normalizeAngleDeg,
    normalizeAngleDegSigned,

    // Arrotondamento
    roundToDecimals,
    roundToSignificant,
    truncateDecimals,
    roundToNearest,
    ceilToNearest,
    floorToNearest,

    // Notazione scientifica
    toScientificNotation,
    formatScientific,
    formatScientificLatex,
    formatScientificHTML,
    fromScientificNotation,

    // Frazioni (formatting.ts)
    toFraction,
    formatFraction,
    formatFractionLatex as formatFractionLatexAlt,
    numberToFractionLatex,
    lcm,

    // Formattazione numeri
    formatWithThousands,
    formatFixed,
    formatClean,
    formatSI,
    formatWithUnit,

    // Conversioni unità
    convertLength,
    convertTime,
    convertMass,

    // Range e clamp
    clamp,
    mapRange,
    mapRangeClamped,
    // lerp è già esportato da vectors
    inverseLerp,

    // Validazione
    isValidNumber,
    approximately,
    isZero as isZeroValue,
    isPositive,
    isNegative,
    sign,

    // Coordinate
    formatPoint,
    formatPointLatex,
    formatVectorLatex,
} from "./formatting";

export type {
    ScientificNotation,
    Fraction,
    LengthUnit,
    TimeUnit,
    MassUnit,
} from "./formatting";