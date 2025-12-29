/**
 * Formatting Utilities - Funzioni per formattazione numeri, angoli e coordinate
 * @module utils/math/formatting
 */

// ============ COSTANTI ============

export const PI = Math.PI;
export const TAU = 2 * Math.PI;
export const E = Math.E;
export const DEG_TO_RAD = Math.PI / 180;
export const RAD_TO_DEG = 180 / Math.PI;

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
    let r = radians % TAU;
    if (r < 0) r += TAU;
    return r;
}

/**
 * Normalizza un angolo in radianti nell'intervallo [-π, π)
 */
export function normalizeAngleSigned(radians: number): number {
    let r = ((radians + PI) % TAU + TAU) % TAU - PI;
    if (r === -PI) r = PI;
    return r;
}

/**
 * Normalizza un angolo in gradi nell'intervallo [0, 360)
 */
export function normalizeAngleDeg(degrees: number): number {
    let d = degrees % 360;
    if (d < 0) d += 360;
    return d;
}

/**
 * Normalizza un angolo in gradi nell'intervallo [-180, 180)
 * (angolo principale)
 */
export function normalizeAngleDegSigned(degrees: number): number {
    let d = ((degrees + 180) % 360 + 360) % 360 - 180;
    if (d === -180) d = 180;
    return d;
}

/**
 * Formatta un angolo in radianti come multiplo di π
 * Es: π/2, 2π/3, 3π/4, etc.
 */
export function formatRadiansPi(radians: number): string {
    const k = radians / PI;
    const denominators = [1, 2, 3, 4, 6, 8, 12, 16];

    for (const d of denominators) {
        const n = Math.round(k * d);
        if (Math.abs(k - n / d) < 1e-3) {
            if (n === 0) return "0";
            if (d === 1) {
                if (n === 1) return "π";
                if (n === -1) return "-π";
                return `${n}π`;
            }
            if (n === 1) return `π/${d}`;
            if (n === -1) return `-π/${d}`;
            return `${n}π/${d}`;
        }
    }
    return radians.toFixed(3);
}

/**
 * Formatta un angolo in radianti come multiplo di π in LaTeX
 */
export function formatRadiansPiLatex(radians: number): string {
    const k = radians / PI;
    const denominators = [1, 2, 3, 4, 6, 8, 12, 16];

    for (const d of denominators) {
        const n = Math.round(k * d);
        if (Math.abs(k - n / d) < 1e-3) {
            if (n === 0) return "0";
            if (d === 1) {
                if (n === 1) return "\\pi";
                if (n === -1) return "-\\pi";
                return `${n}\\pi`;
            }
            if (n === 1) return `\\frac{\\pi}{${d}}`;
            if (n === -1) return `-\\frac{\\pi}{${d}}`;
            return `\\frac{${n}\\pi}{${d}}`;
        }
    }
    return radians.toFixed(3);
}

/**
 * Angoli notevoli in gradi (0°, 30°, 45°, 60°, 90°, ...)
 */
export const NOTABLE_ANGLES_DEG = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];

/**
 * Snap a un angolo notevole se vicino entro una tolleranza
 */
export function snapToNotableAngle(degrees: number, tolerance: number = 3): number {
    const d = degrees === 360 ? 0 : degrees;
    let best = d;
    let bestErr = Infinity;

    for (const v of NOTABLE_ANGLES_DEG) {
        const t = v === 360 ? 0 : v;
        const err = Math.abs(((d - t + 540) % 360) - 180);
        if (err < bestErr) {
            bestErr = err;
            best = t;
        }
    }

    if (bestErr <= tolerance) {
        return best === 0 && degrees > 359 ? 360 : best;
    }
    return degrees;
}

// ============ CLAMP E RANGE ============

/**
 * Limita un valore in un range [min, max]
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

/**
 * Mappa un valore da un range a un altro
 */
export function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
    return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

/**
 * Interpolazione lineare tra due valori
 */
export function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

/**
 * Interpolazione lineare inversa (trova t dato il valore)
 */
export function inverseLerp(a: number, b: number, value: number): number {
    return (value - a) / (b - a);
}

// ============ FORMATTAZIONE NUMERI ============

/**
 * Formatta un numero con separatore migliaia
 */
export function formatWithThousands(n: number, separator: string = "."): string {
    const parts = n.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return parts.join(",");
}

/**
 * Formatta un numero con un numero fisso di decimali
 */
export function formatFixed(n: number, decimals: number = 2): string {
    return n.toFixed(decimals);
}

/**
 * Formatta un numero rimuovendo zeri finali inutili
 */
export function formatClean(n: number, maxDecimals: number = 4): string {
    return parseFloat(n.toFixed(maxDecimals)).toString();
}

/**
 * Arrotonda a un numero specifico di cifre significative
 */
export function roundToSignificant(n: number, digits: number): number {
    if (n === 0) return 0;
    const d = Math.ceil(Math.log10(Math.abs(n)));
    const power = digits - d;
    const magnitude = Math.pow(10, power);
    return Math.round(n * magnitude) / magnitude;
}

/**
 * Arrotonda a un numero specifico di decimali
 */
export function roundToDecimals(n: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.round(n * factor) / factor;
}

// ============ COORDINATE ============

/**
 * Converte coordinate polari in cartesiane
 */
export function polarToCartesian(r: number, angleRad: number, cx: number = 0, cy: number = 0): { x: number; y: number } {
    return {
        x: cx + r * Math.cos(angleRad),
        y: cy + r * Math.sin(angleRad)
    };
}

/**
 * Converte coordinate polari in cartesiane (SVG: Y invertita)
 */
export function polarToCartesianSVG(r: number, angleRad: number, cx: number, cy: number): { x: number; y: number } {
    return {
        x: cx + r * Math.cos(angleRad),
        y: cy - r * Math.sin(angleRad)  // Y invertita per SVG
    };
}

/**
 * Converte coordinate cartesiane in polari
 */
export function cartesianToPolar(x: number, y: number, cx: number = 0, cy: number = 0): { r: number; angle: number } {
    const dx = x - cx;
    const dy = y - cy;
    return {
        r: Math.sqrt(dx * dx + dy * dy),
        angle: Math.atan2(dy, dx)
    };
}

/**
 * Calcola la distanza tra due punti
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

// ============ SVG HELPERS ============

/**
 * Crea un path SVG per un arco
 */
export function svgArcPath(
    cx: number,
    cy: number,
    r: number,
    startAngleRad: number,
    endAngleRad: number,
    counterClockwise: boolean = false
): string {
    const start = polarToCartesianSVG(r, startAngleRad, cx, cy);
    const end = polarToCartesianSVG(r, endAngleRad, cx, cy);

    let angleDiff = endAngleRad - startAngleRad;
    if (counterClockwise) angleDiff = -angleDiff;
    angleDiff = normalizeAngle(angleDiff);

    const largeArc = angleDiff > PI ? 1 : 0;
    const sweep = counterClockwise ? 1 : 0;

    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} ${sweep} ${end.x} ${end.y}`;
}

/**
 * Crea un path SVG per un settore circolare
 */
export function svgSectorPath(
    cx: number,
    cy: number,
    r: number,
    startAngleRad: number,
    endAngleRad: number,
    counterClockwise: boolean = false
): string {
    const arcPath = svgArcPath(cx, cy, r, startAngleRad, endAngleRad, counterClockwise);
    const start = polarToCartesianSVG(r, startAngleRad, cx, cy);
    return `M ${cx} ${cy} L ${start.x} ${start.y} ${arcPath.substring(arcPath.indexOf('A'))} Z`;
}