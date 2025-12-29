/**
 * Vector2D - Libreria per operazioni su vettori bidimensionali
 * @module utils/math/vectors
 */

export interface Vector2D {
    x: number;
    y: number;
}

export interface PolarVector {
    magnitude: number;
    angle: number; // in radianti
}

// ============ CREAZIONE ============

/**
 * Crea un vettore 2D dalle coordinate cartesiane
 */
export function vec(x: number, y: number): Vector2D {
    return { x, y };
}

/**
 * Crea un vettore 2D dalle coordinate polari
 */
export function fromPolar(magnitude: number, angleRad: number): Vector2D {
    return {
        x: magnitude * Math.cos(angleRad),
        y: magnitude * Math.sin(angleRad),
    };
}

/**
 * Crea un vettore nullo
 */
export function zero(): Vector2D {
    return { x: 0, y: 0 };
}

/**
 * Crea un vettore unitario nella direzione specificata (in radianti)
 */
export function unit(angleRad: number): Vector2D {
    return fromPolar(1, angleRad);
}

/**
 * Crea un vettore unitario lungo l'asse X
 */
export function unitX(): Vector2D {
    return { x: 1, y: 0 };
}

/**
 * Crea un vettore unitario lungo l'asse Y
 */
export function unitY(): Vector2D {
    return { x: 0, y: 1 };
}

// ============ OPERAZIONI BASE ============

/**
 * Somma due vettori
 */
export function add(a: Vector2D, b: Vector2D): Vector2D {
    return { x: a.x + b.x, y: a.y + b.y };
}

/**
 * Somma multipli vettori
 */
export function addAll(...vectors: Vector2D[]): Vector2D {
    return vectors.reduce((acc, v) => add(acc, v), zero());
}

/**
 * Sottrae il secondo vettore dal primo (a - b)
 */
export function subtract(a: Vector2D, b: Vector2D): Vector2D {
    return { x: a.x - b.x, y: a.y - b.y };
}

/**
 * Moltiplica un vettore per uno scalare
 */
export function scale(v: Vector2D, scalar: number): Vector2D {
    return { x: v.x * scalar, y: v.y * scalar };
}

/**
 * Divide un vettore per uno scalare
 */
export function divide(v: Vector2D, scalar: number): Vector2D {
    if (scalar === 0) {
        throw new Error("Division by zero");
    }
    return { x: v.x / scalar, y: v.y / scalar };
}

/**
 * Inverte la direzione del vettore
 */
export function negate(v: Vector2D): Vector2D {
    return { x: -v.x, y: -v.y };
}

// ============ PRODOTTI ============

/**
 * Prodotto scalare (dot product) tra due vettori
 */
export function dot(a: Vector2D, b: Vector2D): number {
    return a.x * b.x + a.y * b.y;
}

/**
 * Prodotto vettoriale 2D (restituisce lo scalare z del vettore risultante)
 * Utile per determinare l'orientamento (positivo = antiorario)
 */
export function cross(a: Vector2D, b: Vector2D): number {
    return a.x * b.y - a.y * b.x;
}

/**
 * Prodotto componente per componente (Hadamard)
 */
export function hadamard(a: Vector2D, b: Vector2D): Vector2D {
    return { x: a.x * b.x, y: a.y * b.y };
}

// ============ MAGNITUDINE E NORMALIZZAZIONE ============

/**
 * Calcola la magnitudine (modulo) del vettore
 */
export function magnitude(v: Vector2D): number {
    return Math.sqrt(v.x * v.x + v.y * v.y);
}

/**
 * Alias per magnitude
 */
export const length = magnitude;
export const norm = magnitude;

/**
 * Calcola la magnitudine al quadrato (più efficiente quando non serve la radice)
 */
export function magnitudeSquared(v: Vector2D): number {
    return v.x * v.x + v.y * v.y;
}

/**
 * Normalizza il vettore (restituisce un vettore unitario nella stessa direzione)
 */
export function normalize(v: Vector2D): Vector2D {
    const mag = magnitude(v);
    if (mag === 0) {
        return zero();
    }
    return divide(v, mag);
}

/**
 * Imposta la magnitudine del vettore mantenendo la direzione
 */
export function setMagnitude(v: Vector2D, newMagnitude: number): Vector2D {
    return scale(normalize(v), newMagnitude);
}

/**
 * Limita la magnitudine del vettore a un valore massimo
 */
export function limit(v: Vector2D, maxMagnitude: number): Vector2D {
    const mag = magnitude(v);
    if (mag > maxMagnitude) {
        return setMagnitude(v, maxMagnitude);
    }
    return v;
}

// ============ ANGOLI ============

/**
 * Calcola l'angolo del vettore rispetto all'asse X positivo (in radianti)
 * Range: [-π, π]
 */
export function angle(v: Vector2D): number {
    return Math.atan2(v.y, v.x);
}

/**
 * Calcola l'angolo del vettore in gradi
 * Range: [-180, 180]
 */
export function angleDeg(v: Vector2D): number {
    return angle(v) * (180 / Math.PI);
}

/**
 * Calcola l'angolo tra due vettori (in radianti)
 * Range: [0, π]
 */
export function angleBetween(a: Vector2D, b: Vector2D): number {
    const magA = magnitude(a);
    const magB = magnitude(b);
    if (magA === 0 || magB === 0) {
        return 0;
    }
    const cosAngle = dot(a, b) / (magA * magB);
    // Clamp per evitare errori numerici con acos
    return Math.acos(Math.max(-1, Math.min(1, cosAngle)));
}

/**
 * Calcola l'angolo tra due vettori in gradi
 */
export function angleBetweenDeg(a: Vector2D, b: Vector2D): number {
    return angleBetween(a, b) * (180 / Math.PI);
}

/**
 * Calcola l'angolo con segno tra due vettori (positivo = antiorario)
 */
export function signedAngleBetween(a: Vector2D, b: Vector2D): number {
    return Math.atan2(cross(a, b), dot(a, b));
}

// ============ TRASFORMAZIONI ============

/**
 * Ruota il vettore di un angolo (in radianti)
 */
export function rotate(v: Vector2D, angleRad: number): Vector2D {
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    return {
        x: v.x * cos - v.y * sin,
        y: v.x * sin + v.y * cos,
    };
}

/**
 * Ruota il vettore di un angolo (in gradi)
 */
export function rotateDeg(v: Vector2D, angleDeg: number): Vector2D {
    return rotate(v, angleDeg * (Math.PI / 180));
}

/**
 * Ruota il vettore di 90° in senso antiorario
 */
export function perpendicular(v: Vector2D): Vector2D {
    return { x: -v.y, y: v.x };
}

/**
 * Ruota il vettore di 90° in senso orario
 */
export function perpendicularCW(v: Vector2D): Vector2D {
    return { x: v.y, y: -v.x };
}

/**
 * Riflette il vettore rispetto a un asse definito da un vettore normale
 */
export function reflect(v: Vector2D, normal: Vector2D): Vector2D {
    const n = normalize(normal);
    const d = 2 * dot(v, n);
    return subtract(v, scale(n, d));
}

/**
 * Proietta il vettore a su b
 */
export function project(a: Vector2D, b: Vector2D): Vector2D {
    const magBSq = magnitudeSquared(b);
    if (magBSq === 0) {
        return zero();
    }
    const scalar = dot(a, b) / magBSq;
    return scale(b, scalar);
}

/**
 * Componente scalare della proiezione di a su b
 */
export function scalarProjection(a: Vector2D, b: Vector2D): number {
    const magB = magnitude(b);
    if (magB === 0) {
        return 0;
    }
    return dot(a, b) / magB;
}

// ============ DISTANZE ============

/**
 * Calcola la distanza tra due punti (vettori posizione)
 */
export function distance(a: Vector2D, b: Vector2D): number {
    return magnitude(subtract(b, a));
}

/**
 * Calcola la distanza al quadrato tra due punti
 */
export function distanceSquared(a: Vector2D, b: Vector2D): number {
    return magnitudeSquared(subtract(b, a));
}

/**
 * Calcola la distanza di Manhattan tra due punti
 */
export function manhattanDistance(a: Vector2D, b: Vector2D): number {
    return Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
}

// ============ INTERPOLAZIONE ============

/**
 * Interpolazione lineare tra due vettori
 * t = 0 restituisce a, t = 1 restituisce b
 */
export function lerp(a: Vector2D, b: Vector2D, t: number): Vector2D {
    return {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
    };
}

/**
 * Interpolazione lineare con clamping di t in [0, 1]
 */
export function lerpClamped(a: Vector2D, b: Vector2D, t: number): Vector2D {
    return lerp(a, b, Math.max(0, Math.min(1, t)));
}

/**
 * Punto medio tra due vettori
 */
export function midpoint(a: Vector2D, b: Vector2D): Vector2D {
    return lerp(a, b, 0.5);
}

// ============ CONFRONTI ============

/**
 * Verifica se due vettori sono uguali (con tolleranza opzionale)
 */
export function equals(a: Vector2D, b: Vector2D, epsilon: number = 1e-10): boolean {
    return Math.abs(a.x - b.x) < epsilon && Math.abs(a.y - b.y) < epsilon;
}

/**
 * Verifica se il vettore è nullo (con tolleranza opzionale)
 */
export function isZero(v: Vector2D, epsilon: number = 1e-10): boolean {
    return magnitude(v) < epsilon;
}

/**
 * Verifica se due vettori sono paralleli
 */
export function isParallel(a: Vector2D, b: Vector2D, epsilon: number = 1e-10): boolean {
    return Math.abs(cross(a, b)) < epsilon;
}

/**
 * Verifica se due vettori sono perpendicolari
 */
export function isPerpendicular(a: Vector2D, b: Vector2D, epsilon: number = 1e-10): boolean {
    return Math.abs(dot(a, b)) < epsilon;
}

// ============ CONVERSIONI ============

/**
 * Converte in coordinate polari
 */
export function toPolar(v: Vector2D): PolarVector {
    return {
        magnitude: magnitude(v),
        angle: angle(v),
    };
}

/**
 * Converte in array [x, y]
 */
export function toArray(v: Vector2D): [number, number] {
    return [v.x, v.y];
}

/**
 * Crea un vettore da un array
 */
export function fromArray(arr: [number, number]): Vector2D {
    return { x: arr[0], y: arr[1] };
}

/**
 * Clona un vettore
 */
export function clone(v: Vector2D): Vector2D {
    return { x: v.x, y: v.y };
}

// ============ UTILITY FISICHE ============

/**
 * Calcola il vettore forza elettrica tra due cariche (legge di Coulomb)
 * @param q1 - Prima carica (C)
 * @param q2 - Seconda carica (C)
 * @param r1 - Posizione della prima carica
 * @param r2 - Posizione della seconda carica
 * @param k - Costante di Coulomb (default: 8.99e9 N·m²/C²)
 * @returns Forza su q2 dovuta a q1
 */
export function coulombForce(
    q1: number,
    q2: number,
    r1: Vector2D,
    r2: Vector2D,
    k: number = 8.99e9
): Vector2D {
    const r = subtract(r2, r1);
    const dist = magnitude(r);
    if (dist === 0) {
        return zero();
    }
    const forceMag = (k * q1 * q2) / (dist * dist);
    return scale(normalize(r), forceMag);
}

/**
 * Calcola il campo elettrico generato da una carica puntiforme
 * @param q - Carica sorgente (C)
 * @param source - Posizione della carica
 * @param point - Punto dove calcolare il campo
 * @param k - Costante di Coulomb
 * @returns Vettore campo elettrico (N/C)
 */
export function electricField(
    q: number,
    source: Vector2D,
    point: Vector2D,
    k: number = 8.99e9
): Vector2D {
    const r = subtract(point, source);
    const dist = magnitude(r);
    if (dist === 0) {
        return zero();
    }
    const fieldMag = (k * Math.abs(q)) / (dist * dist);
    const direction = q >= 0 ? normalize(r) : negate(normalize(r));
    return scale(direction, fieldMag);
}

/**
 * Calcola la velocità risultante dopo un urto elastico 2D
 */
export function elasticCollisionVelocity(
    v1: Vector2D,
    v2: Vector2D,
    m1: number,
    m2: number,
    p1: Vector2D,
    p2: Vector2D
): Vector2D {
    const dp = subtract(p1, p2);
    const dv = subtract(v1, v2);
    const distSq = magnitudeSquared(dp);
    if (distSq === 0) {
        return v1;
    }
    const scalar = (2 * m2 / (m1 + m2)) * (dot(dv, dp) / distSq);
    return subtract(v1, scale(dp, scalar));
}

// ============ CLASSE WRAPPER (opzionale) ============

/**
 * Classe wrapper per operazioni fluent/chainable sui vettori
 */
export class Vec2 implements Vector2D {
    constructor(public x: number = 0, public y: number = 0) {}

    static from(v: Vector2D): Vec2 {
        return new Vec2(v.x, v.y);
    }

    static fromPolar(mag: number, angle: number): Vec2 {
        return Vec2.from(fromPolar(mag, angle));
    }

    static zero(): Vec2 {
        return new Vec2(0, 0);
    }

    static unit(angle: number): Vec2 {
        return Vec2.from(unit(angle));
    }

    clone(): Vec2 {
        return new Vec2(this.x, this.y);
    }

    add(v: Vector2D): Vec2 {
        return Vec2.from(add(this, v));
    }

    subtract(v: Vector2D): Vec2 {
        return Vec2.from(subtract(this, v));
    }

    scale(s: number): Vec2 {
        return Vec2.from(scale(this, s));
    }

    normalize(): Vec2 {
        return Vec2.from(normalize(this));
    }

    rotate(angleRad: number): Vec2 {
        return Vec2.from(rotate(this, angleRad));
    }

    get magnitude(): number {
        return magnitude(this);
    }

    get angle(): number {
        return angle(this);
    }

    dot(v: Vector2D): number {
        return dot(this, v);
    }

    cross(v: Vector2D): number {
        return cross(this, v);
    }

    distanceTo(v: Vector2D): number {
        return distance(this, v);
    }

    equals(v: Vector2D, epsilon?: number): boolean {
        return equals(this, v, epsilon);
    }

    toArray(): [number, number] {
        return [this.x, this.y];
    }

    toString(decimals: number = 2): string {
        return `(${this.x.toFixed(decimals)}, ${this.y.toFixed(decimals)})`;
    }
}