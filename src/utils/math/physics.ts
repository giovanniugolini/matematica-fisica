/**
 * Physics Utilities - Costanti fisiche e formule
 * @module utils/math/physics
 */

// ============ COSTANTI FISICHE ============

/** Costante di Coulomb (N·m²/C²) */
export const K_COULOMB = 8.9875517923e9;

/** Costante gravitazionale (N·m²/kg²) */
export const G_GRAVITATIONAL = 6.67430e-11;

/** Velocità della luce (m/s) */
export const C_LIGHT = 299792458;

/** Carica elementare (C) */
export const E_CHARGE = 1.602176634e-19;

/** Massa dell'elettrone (kg) */
export const M_ELECTRON = 9.1093837015e-31;

/** Massa del protone (kg) */
export const M_PROTON = 1.67262192369e-27;

/** Costante di Planck (J·s) */
export const H_PLANCK = 6.62607015e-34;

/** Costante di Boltzmann (J/K) */
export const K_BOLTZMANN = 1.380649e-23;

/** Accelerazione gravitazionale terrestre (m/s²) */
export const G_EARTH = 9.80665;

/** Permittività del vuoto (F/m) */
export const EPSILON_0 = 8.8541878128e-12;

/** Permeabilità del vuoto (H/m) */
export const MU_0 = 1.25663706212e-6;

// ============ CONVERSIONI UNITÀ ============

/** Conversione microCoulomb → Coulomb */
export function microCoulombToC(uC: number): number {
    return uC * 1e-6;
}

/** Conversione nanoCoulomb → Coulomb */
export function nanoCoulombToC(nC: number): number {
    return nC * 1e-9;
}

/** Conversione Coulomb → microCoulomb */
export function cToMicroCoulomb(C: number): number {
    return C * 1e6;
}

/** Conversione Coulomb → nanoCoulomb */
export function cToNanoCoulomb(C: number): number {
    return C * 1e9;
}

// ============ TIPI VETTORIALI ============

export type Vec2 = { x: number; y: number };
export type Vec3 = { x: number; y: number; z: number };

// ============ OPERAZIONI VETTORIALI 2D ============

/** Lunghezza (modulo) di un vettore 2D */
export function vecLength(v: Vec2): number {
    return Math.hypot(v.x, v.y);
}

/** Normalizza un vettore 2D (versore) */
export function vecNormalize(v: Vec2): Vec2 {
    const L = vecLength(v);
    return L === 0 ? { x: 0, y: 0 } : { x: v.x / L, y: v.y / L };
}

/** Somma di due vettori 2D */
export function vecAdd(a: Vec2, b: Vec2): Vec2 {
    return { x: a.x + b.x, y: a.y + b.y };
}

/** Differenza di due vettori 2D */
export function vecSub(a: Vec2, b: Vec2): Vec2 {
    return { x: a.x - b.x, y: a.y - b.y };
}

/** Moltiplica un vettore per uno scalare */
export function vecScale(v: Vec2, s: number): Vec2 {
    return { x: v.x * s, y: v.y * s };
}

/** Prodotto scalare di due vettori 2D */
export function vecDot(a: Vec2, b: Vec2): number {
    return a.x * b.x + a.y * b.y;
}

/** Distanza tra due punti 2D */
export function vecDistance(a: Vec2, b: Vec2): number {
    return Math.hypot(b.x - a.x, b.y - a.y);
}

/** Vincola un punto a stare entro un raggio da un centro */
export function constrainWithinRadius(p: Vec2, center: Vec2, radius: number): Vec2 {
    const dx = p.x - center.x;
    const dy = p.y - center.y;
    const d = Math.hypot(dx, dy);
    if (d <= radius || d === 0) return p;
    const f = radius / d;
    return { x: center.x + dx * f, y: center.y + dy * f };
}

// ============ CAMPO ELETTRICO ============

export type EField = {
    Ex: number;  // Componente x del campo (N/C)
    Ey: number;  // Componente y del campo (N/C)
    Emag: number; // Modulo del campo (N/C)
};

/**
 * Calcola il campo elettrico in un punto dovuto a una carica puntiforme
 * @param point Punto dove calcolare il campo
 * @param source Posizione della carica sorgente
 * @param qCoulomb Carica sorgente in Coulomb
 * @param softening Distanza minima per evitare singolarità (default 0.05 m)
 */
export function electricFieldAt(point: Vec2, source: Vec2, qCoulomb: number, softening: number = 0.05): EField {
    const r = { x: point.x - source.x, y: point.y - source.y };
    let r2 = r.x * r.x + r.y * r.y;
    r2 = Math.max(r2, softening * softening);

    const Emag = K_COULOMB * Math.abs(qCoulomb) / r2;
    const dir = vecNormalize(r);
    const sign = qCoulomb >= 0 ? 1 : -1;

    return {
        Ex: sign * Emag * dir.x,
        Ey: sign * Emag * dir.y,
        Emag
    };
}

/**
 * Calcola la forza elettrica su una carica di prova
 * @param E Campo elettrico nel punto
 * @param qTest Carica di prova in Coulomb
 */
export function electricForce(E: EField, qTest: number): { Fx: number; Fy: number; Fmag: number } {
    const Fx = qTest * E.Ex;
    const Fy = qTest * E.Ey;
    return { Fx, Fy, Fmag: Math.hypot(Fx, Fy) };
}

// ============ FORZA DI COULOMB ============

/**
 * Calcola la forza di Coulomb tra due cariche
 * @param q1 Prima carica (C)
 * @param q2 Seconda carica (C)
 * @param r Distanza (m)
 * @returns Modulo della forza (N), positivo = repulsione, negativo = attrazione
 */
export function coulombForce(q1: number, q2: number, r: number): number {
    if (r === 0) return Infinity;
    return K_COULOMB * q1 * q2 / (r * r);
}

// ============ FORMATTAZIONE SCIENTIFICA ============

/**
 * Formatta un numero in notazione scientifica
 */
export function formatScientific(n: number, decimals: number = 3): string {
    return n.toExponential(decimals);
}

/**
 * Formatta un numero in notazione scientifica LaTeX
 */
export function formatScientificLatex(n: number, decimals: number = 3): string {
    if (n === 0) return "0";
    const exp = Math.floor(Math.log10(Math.abs(n)));
    const mantissa = n / Math.pow(10, exp);
    return `${mantissa.toFixed(decimals)} \\times 10^{${exp}}`;
}

// ============ WORLD-TO-PIXEL MAPPING ============

export type WorldBounds = {
    xmin: number;
    xmax: number;
    ymin: number;
    ymax: number;
};

export type CoordinateMapper = {
    toX: (x: number) => number;
    toY: (y: number) => number;
    fromX: (px: number) => number;
    fromY: (py: number) => number;
    scale: number;
    offsetX: number;
    offsetY: number;
};

/**
 * Crea un mapper tra coordinate mondo e pixel SVG (preserveAspectRatio="xMidYMid meet")
 * @param svgWidth Larghezza del viewBox SVG
 * @param svgHeight Altezza del viewBox SVG
 * @param world Limiti del mondo
 * @param flipY Se true, Y cresce verso l'alto (default: true per coordinate fisiche)
 */
export function createCoordinateMapper(
    svgWidth: number,
    svgHeight: number,
    world: WorldBounds,
    flipY: boolean = true
): CoordinateMapper {
    const worldW = world.xmax - world.xmin;
    const worldH = world.ymax - world.ymin;
    const scale = Math.min(svgWidth / worldW, svgHeight / worldH);
    const offsetX = (svgWidth - scale * worldW) / 2;
    const offsetY = (svgHeight - scale * worldH) / 2;

    return {
        toX: (x: number) => offsetX + (x - world.xmin) * scale,
        toY: (y: number) => flipY
            ? svgHeight - (offsetY + (y - world.ymin) * scale)
            : offsetY + (y - world.ymin) * scale,
        fromX: (px: number) => world.xmin + (px - offsetX) / scale,
        fromY: (py: number) => flipY
            ? world.ymin + (svgHeight - py - offsetY) / scale
            : world.ymin + (py - offsetY) / scale,
        scale,
        offsetX,
        offsetY,
    };
}

/**
 * Converte coordinate client (mouse) in coordinate viewBox SVG
 */
export function clientToViewBox(
    clientX: number,
    clientY: number,
    svgRect: DOMRect,
    viewBoxWidth: number,
    viewBoxHeight: number
): { x: number; y: number } {
    return {
        x: (clientX - svgRect.left) * (viewBoxWidth / svgRect.width),
        y: (clientY - svgRect.top) * (viewBoxHeight / svgRect.height),
    };
}