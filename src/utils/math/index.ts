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

// Formatting utilities
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

    // Formattazione angoli
    formatRadiansPi,
    formatRadiansPiLatex,
    NOTABLE_ANGLES_DEG,
    snapToNotableAngle,

    // Range e clamp
    clamp,
    mapRange,
    lerp,
    inverseLerp,

    // Formattazione numeri
    formatWithThousands,
    formatFixed,
    formatClean,
    roundToSignificant,
    roundToDecimals,

    // Coordinate
    polarToCartesian,
    polarToCartesianSVG,
    cartesianToPolar,
    distance,

    // SVG helpers
    svgArcPath,
    svgSectorPath,
} from "./formatting";

// Physics utilities
export {
    // Costanti fisiche
    K_COULOMB,
    G_GRAVITATIONAL,
    C_LIGHT,
    E_CHARGE,
    M_ELECTRON,
    M_PROTON,
    H_PLANCK,
    K_BOLTZMANN,
    G_EARTH,
    EPSILON_0,
    MU_0,

    // Conversioni unità elettriche
    microCoulombToC,
    nanoCoulombToC,
    cToMicroCoulomb,
    cToNanoCoulomb,

    // Operazioni vettoriali
    vecLength,
    vecNormalize,
    vecAdd,
    vecSub,
    vecScale,
    vecDot,
    vecDistance,
    constrainWithinRadius,

    // Campo elettrico
    electricFieldAt,
    electricForce,
    coulombForce,

    // Formattazione scientifica
    formatScientific,
    formatScientificLatex,

    // Coordinate mapping
    createCoordinateMapper,
    clientToViewBox,
} from "./physics";

export type { Vec2, Vec3, EField, WorldBounds, CoordinateMapper } from "./physics";