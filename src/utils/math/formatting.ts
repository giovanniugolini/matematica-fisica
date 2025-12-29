/**
 * Formatting - Libreria per formattazione numeri e conversioni
 * @module utils/math/formatting
 */

// ============ COSTANTI ============

export const PI = Math.PI;
export const TAU = 2 * Math.PI;
export const E = Math.E;
export const DEG_TO_RAD = PI / 180;
export const RAD_TO_DEG = 180 / PI;

// ============ CONVERSIONI ANGOLARI ============

/**
 * Converte gradi in radianti
 */
export function toRadians(degrees: number): number {
    return degrees * DEG_TO_RAD;
}

/**
 * Converte radianti in gradi
 */
export function toDegrees(radians: number): number {
    return radians * RAD_TO_DEG;
}

/**
 * Normalizza un angolo in radianti nell'intervallo [0, 2π)
 */
export function normalizeAngle(radians: number): number {
    const result = radians % TAU;
    return result < 0 ? result + TAU : result;
}

/**
 * Normalizza un angolo in radianti nell'intervallo [-π, π)
 */
export function normalizeAngleSigned(radians: number): number {
    let result = normalizeAngle(radians);
    if (result >= PI) {
        result -= TAU;
    }
    return result;
}

/**
 * Normalizza un angolo in gradi nell'intervallo [0, 360)
 */
export function normalizeAngleDeg(degrees: number): number {
    const result = degrees % 360;
    return result < 0 ? result + 360 : result;
}

/**
 * Normalizza un angolo in gradi nell'intervallo [-180, 180)
 */
export function normalizeAngleDegSigned(degrees: number): number {
    let result = normalizeAngleDeg(degrees);
    if (result >= 180) {
        result -= 360;
    }
    return result;
}

// ============ ARROTONDAMENTO ============

/**
 * Arrotonda a un numero specifico di decimali
 */
export function roundToDecimals(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}

/**
 * Arrotonda a cifre significative
 */
export function roundToSignificant(value: number, significantDigits: number): number {
    if (value === 0) return 0;
    const magnitude = Math.floor(Math.log10(Math.abs(value)));
    const factor = Math.pow(10, significantDigits - magnitude - 1);
    return Math.round(value * factor) / factor;
}

/**
 * Tronca a un numero specifico di decimali (senza arrotondare)
 */
export function truncateDecimals(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.trunc(value * factor) / factor;
}

/**
 * Arrotonda al multiplo più vicino
 */
export function roundToNearest(value: number, nearest: number): number {
    return Math.round(value / nearest) * nearest;
}

/**
 * Arrotonda per eccesso al multiplo più vicino
 */
export function ceilToNearest(value: number, nearest: number): number {
    return Math.ceil(value / nearest) * nearest;
}

/**
 * Arrotonda per difetto al multiplo più vicino
 */
export function floorToNearest(value: number, nearest: number): number {
    return Math.floor(value / nearest) * nearest;
}

// ============ NOTAZIONE SCIENTIFICA ============

export interface ScientificNotation {
    coefficient: number;
    exponent: number;
}

/**
 * Converte un numero in notazione scientifica
 */
export function toScientificNotation(value: number, significantDigits: number = 3): ScientificNotation {
    if (value === 0) {
        return { coefficient: 0, exponent: 0 };
    }

    const exponent = Math.floor(Math.log10(Math.abs(value)));
    const coefficient = roundToDecimals(value / Math.pow(10, exponent), significantDigits - 1);

    return { coefficient, exponent };
}

/**
 * Formatta un numero in notazione scientifica come stringa
 */
export function formatScientific(value: number, significantDigits: number = 3): string {
    const { coefficient, exponent } = toScientificNotation(value, significantDigits);

    if (exponent === 0) {
        return coefficient.toString();
    }

    return `${coefficient} × 10^${exponent}`;
}

/**
 * Formatta un numero in notazione scientifica per LaTeX
 */
export function formatScientificLatex(value: number, significantDigits: number = 3): string {
    const { coefficient, exponent } = toScientificNotation(value, significantDigits);

    if (exponent === 0) {
        return coefficient.toString();
    }

    return `${coefficient} \\times 10^{${exponent}}`;
}

/**
 * Formatta un numero in notazione scientifica per HTML
 */
export function formatScientificHTML(value: number, significantDigits: number = 3): string {
    const { coefficient, exponent } = toScientificNotation(value, significantDigits);

    if (exponent === 0) {
        return coefficient.toString();
    }

    return `${coefficient} × 10<sup>${exponent}</sup>`;
}

/**
 * Converte dalla notazione scientifica a numero
 */
export function fromScientificNotation(coefficient: number, exponent: number): number {
    return coefficient * Math.pow(10, exponent);
}

// ============ FRAZIONI ============

export interface Fraction {
    numerator: number;
    denominator: number;
    sign: 1 | -1;
}

/**
 * Calcola il massimo comun divisore
 */
export function gcd(a: number, b: number): number {
    a = Math.abs(Math.round(a));
    b = Math.abs(Math.round(b));
    while (b !== 0) {
        const t = b;
        b = a % b;
        a = t;
    }
    return a;
}

/**
 * Calcola il minimo comune multiplo
 */
export function lcm(a: number, b: number): number {
    return Math.abs(a * b) / gcd(a, b);
}

/**
 * Converte un decimale in frazione approssimata
 */
export function toFraction(value: number, maxDenominator: number = 1000): Fraction {
    const sign = value < 0 ? -1 : 1;
    value = Math.abs(value);

    if (Number.isInteger(value)) {
        return { numerator: value, denominator: 1, sign };
    }

    let bestNumerator = Math.round(value);
    let bestDenominator = 1;
    let bestError = Math.abs(value - bestNumerator);

    for (let den = 2; den <= maxDenominator; den++) {
        const num = Math.round(value * den);
        const error = Math.abs(value - num / den);

        if (error < bestError) {
            bestError = error;
            bestNumerator = num;
            bestDenominator = den;

            if (error < 1e-10) break;
        }
    }

    // Semplifica
    const divisor = gcd(bestNumerator, bestDenominator);

    return {
        numerator: bestNumerator / divisor,
        denominator: bestDenominator / divisor,
        sign,
    };
}

/**
 * Formatta una frazione come stringa
 */
export function formatFraction(fraction: Fraction): string {
    const { numerator, denominator, sign } = fraction;
    const signStr = sign < 0 ? "-" : "";

    if (denominator === 1) {
        return `${signStr}${numerator}`;
    }

    return `${signStr}${numerator}/${denominator}`;
}

/**
 * Formatta una frazione per LaTeX
 */
export function formatFractionLatex(fraction: Fraction): string {
    const { numerator, denominator, sign } = fraction;
    const signStr = sign < 0 ? "-" : "";

    if (denominator === 1) {
        return `${signStr}${numerator}`;
    }

    return `${signStr}\\frac{${numerator}}{${denominator}}`;
}

/**
 * Formatta un numero come frazione LaTeX (utility combinata)
 */
export function numberToFractionLatex(value: number, maxDenominator: number = 100): string {
    if (Number.isInteger(value)) {
        return value.toString();
    }

    const fraction = toFraction(value, maxDenominator);

    // Se la frazione non è precisa, usa il decimale
    const reconstructed = (fraction.sign * fraction.numerator) / fraction.denominator;
    if (Math.abs(reconstructed - value) > 0.001) {
        return roundToDecimals(value, 3).toString();
    }

    return formatFractionLatex(fraction);
}

// ============ FORMATTAZIONE NUMERI ============

/**
 * Formatta un numero con separatore delle migliaia
 */
export function formatWithThousands(value: number, locale: string = "it-IT"): string {
    return value.toLocaleString(locale);
}

/**
 * Formatta un numero con un numero fisso di decimali
 */
export function formatFixed(value: number, decimals: number): string {
    return value.toFixed(decimals);
}

/**
 * Formatta un numero rimuovendo zeri finali non significativi
 */
export function formatClean(value: number, maxDecimals: number = 10): string {
    return parseFloat(value.toFixed(maxDecimals)).toString();
}

/**
 * Formatta un numero con prefisso SI (k, M, G, etc.)
 */
export function formatSI(value: number, decimals: number = 2): string {
    const prefixes = [
        { value: 1e24, symbol: "Y" },
        { value: 1e21, symbol: "Z" },
        { value: 1e18, symbol: "E" },
        { value: 1e15, symbol: "P" },
        { value: 1e12, symbol: "T" },
        { value: 1e9, symbol: "G" },
        { value: 1e6, symbol: "M" },
        { value: 1e3, symbol: "k" },
        { value: 1, symbol: "" },
        { value: 1e-3, symbol: "m" },
        { value: 1e-6, symbol: "μ" },
        { value: 1e-9, symbol: "n" },
        { value: 1e-12, symbol: "p" },
        { value: 1e-15, symbol: "f" },
        { value: 1e-18, symbol: "a" },
        { value: 1e-21, symbol: "z" },
        { value: 1e-24, symbol: "y" },
    ];

    const absValue = Math.abs(value);

    for (const prefix of prefixes) {
        if (absValue >= prefix.value) {
            return (value / prefix.value).toFixed(decimals) + " " + prefix.symbol;
        }
    }

    return value.toFixed(decimals);
}

/**
 * Formatta un numero con unità di misura
 */
export function formatWithUnit(value: number, unit: string, decimals: number = 2): string {
    return `${roundToDecimals(value, decimals)} ${unit}`;
}

// ============ CONVERSIONI UNITÀ ============

export type LengthUnit = "m" | "km" | "cm" | "mm" | "μm" | "nm" | "mi" | "ft" | "in";
export type TimeUnit = "s" | "ms" | "μs" | "ns" | "min" | "h" | "d";
export type MassUnit = "kg" | "g" | "mg" | "μg" | "t" | "lb" | "oz";

const lengthFactors: Record<LengthUnit, number> = {
    m: 1,
    km: 1000,
    cm: 0.01,
    mm: 0.001,
    μm: 1e-6,
    nm: 1e-9,
    mi: 1609.344,
    ft: 0.3048,
    in: 0.0254,
};

const timeFactors: Record<TimeUnit, number> = {
    s: 1,
    ms: 0.001,
    μs: 1e-6,
    ns: 1e-9,
    min: 60,
    h: 3600,
    d: 86400,
};

const massFactors: Record<MassUnit, number> = {
    kg: 1,
    g: 0.001,
    mg: 1e-6,
    μg: 1e-9,
    t: 1000,
    lb: 0.453592,
    oz: 0.0283495,
};

/**
 * Converte una lunghezza tra unità
 */
export function convertLength(value: number, from: LengthUnit, to: LengthUnit): number {
    const inMeters = value * lengthFactors[from];
    return inMeters / lengthFactors[to];
}

/**
 * Converte un tempo tra unità
 */
export function convertTime(value: number, from: TimeUnit, to: TimeUnit): number {
    const inSeconds = value * timeFactors[from];
    return inSeconds / timeFactors[to];
}

/**
 * Converte una massa tra unità
 */
export function convertMass(value: number, from: MassUnit, to: MassUnit): number {
    const inKg = value * massFactors[from];
    return inKg / massFactors[to];
}

// ============ RANGE E CLAMP ============

/**
 * Limita un valore in un intervallo
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

/**
 * Mappa un valore da un range a un altro
 */
export function mapRange(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
): number {
    return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
}

/**
 * Mappa un valore da un range a un altro con clamping
 */
export function mapRangeClamped(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
): number {
    const clamped = clamp(value, inMin, inMax);
    return mapRange(clamped, inMin, inMax, outMin, outMax);
}

/**
 * Interpolazione lineare
 */
export function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

/**
 * Interpolazione lineare inversa (trova t dato il valore)
 */
export function inverseLerp(a: number, b: number, value: number): number {
    if (a === b) return 0;
    return (value - a) / (b - a);
}

// ============ VALIDAZIONE ============

/**
 * Verifica se un numero è valido (non NaN e finito)
 */
export function isValidNumber(value: unknown): value is number {
    return typeof value === "number" && !isNaN(value) && isFinite(value);
}

/**
 * Verifica se due numeri sono approssimativamente uguali
 */
export function approximately(a: number, b: number, epsilon: number = 1e-10): boolean {
    return Math.abs(a - b) < epsilon;
}

/**
 * Verifica se un numero è approssimativamente zero
 */
export function isZero(value: number, epsilon: number = 1e-10): boolean {
    return Math.abs(value) < epsilon;
}

/**
 * Verifica se un numero è positivo
 */
export function isPositive(value: number): boolean {
    return value > 0;
}

/**
 * Verifica se un numero è negativo
 */
export function isNegative(value: number): boolean {
    return value < 0;
}

/**
 * Restituisce il segno del numero (-1, 0, 1)
 */
export function sign(value: number): -1 | 0 | 1 {
    if (value > 0) return 1;
    if (value < 0) return -1;
    return 0;
}

// ============ FORMATTAZIONE COORDINATE ============

/**
 * Formatta le coordinate di un punto
 */
export function formatPoint(x: number, y: number, decimals: number = 2): string {
    return `(${roundToDecimals(x, decimals)}, ${roundToDecimals(y, decimals)})`;
}

/**
 * Formatta le coordinate per LaTeX
 */
export function formatPointLatex(x: number, y: number, decimals: number = 2): string {
    return `\\left(${roundToDecimals(x, decimals)}, ${roundToDecimals(y, decimals)}\\right)`;
}

/**
 * Formatta un vettore in notazione con cappello
 */
export function formatVectorLatex(
    x: number,
    y: number,
    decimals: number = 2,
    unitVectors: { i: string; j: string } = { i: "\\hat{i}", j: "\\hat{j}" }
): string {
    const xRound = roundToDecimals(x, decimals);
    const yRound = roundToDecimals(y, decimals);

    let result = "";

    if (xRound !== 0) {
        result += `${xRound}${unitVectors.i}`;
    }

    if (yRound !== 0) {
        if (result && yRound > 0) result += " + ";
        else if (result && yRound < 0) result += " - ";

        const yAbs = yRound < 0 && result ? Math.abs(yRound) : yRound;
        result += `${yAbs}${unitVectors.j}`;
    }

    if (!result) result = "\\vec{0}";

    return result;
}