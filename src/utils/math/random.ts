/**
 * Random - Funzioni per generazione numeri casuali
 * @module utils/math/random
 */

/**
 * Genera un intero casuale nell'intervallo [min, max] inclusi
 */
export function randomInt(min: number, max: number): number {
    return min + Math.floor(Math.random() * (max - min + 1));
}

/**
 * Genera un intero casuale non zero nell'intervallo [min, max]
 */
export function randomNonZero(min: number, max: number): number {
    let n = 0;
    while (n === 0) {
        n = randomInt(min, max);
    }
    return n;
}

/**
 * Sceglie un elemento casuale da un array
 */
export function randomChoice<T>(arr: T[]): T {
    return arr[randomInt(0, arr.length - 1)];
}

/**
 * Genera un array di n interi casuali unici nell'intervallo [min, max]
 */
export function randomUniqueInts(min: number, max: number, n: number): number[] {
    const range = max - min + 1;
    if (n > range) {
        throw new Error(`Cannot generate ${n} unique integers in range [${min}, ${max}]`);
    }

    const result: number[] = [];
    const used = new Set<number>();

    while (result.length < n) {
        const num = randomInt(min, max);
        if (!used.has(num)) {
            used.add(num);
            result.push(num);
        }
    }

    return result;
}

/**
 * Genera un numero casuale con possibilità di essere frazionario (±0.5)
 */
export function randomMaybeHalf(base: number, probability: number = 0.4): number {
    if (Math.random() < probability) {
        const delta = Math.random() < 0.5 ? -0.5 : 0.5;
        return base + delta;
    }
    return base;
}

/**
 * Genera un booleano casuale con probabilità specificata per true
 */
export function randomBool(probabilityTrue: number = 0.5): boolean {
    return Math.random() < probabilityTrue;
}

/**
 * Mescola un array (Fisher-Yates shuffle)
 */
export function shuffle<T>(arr: T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
        const j = randomInt(0, i);
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}