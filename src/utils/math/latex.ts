/**
 * LaTeX Formatting - Funzioni per formattazione espressioni matematiche in LaTeX
 * @module utils/math/latex
 */

// ============ UTILITY DI BASE ============

/**
 * Calcola il massimo comun divisore (per numeri interi)
 */
export function gcd(a: number, b: number): number {
    a = Math.abs(Math.round(a));
    b = Math.abs(Math.round(b));
    while (b) {
        const t = b;
        b = a % b;
        a = t;
    }
    return a || 1;
}

/**
 * Calcola il GCD per numeri che potrebbero avere decimali
 * Scala internamente per gestire fino a 3 cifre decimali
 */
export function gcdDecimal(a: number, b: number): number {
    const scale = 1000;
    const scaledA = Math.abs(Math.round(a * scale));
    const scaledB = Math.abs(Math.round(b * scale));

    let x = scaledA;
    let y = scaledB;
    while (y) {
        const t = y;
        y = x % y;
        x = t;
    }
    return (x || scale) / scale;
}

/**
 * Verifica se un numero è effettivamente zero (con tolleranza)
 */
export function isZero(n: number, epsilon: number = 1e-10): boolean {
    return Math.abs(n) < epsilon;
}

// ============ FORMATTAZIONE FRAZIONI ============

/**
 * Formatta una frazione in LaTeX, semplificandola
 * Funziona sia con interi che con decimali semplici
 */
export function formatFractionLatex(num: number, den: number): string {
    if (den === 0) return "\\text{indefinito}";
    if (num === 0) return "0";

    const sign = (num < 0) !== (den < 0) ? -1 : 1;

    // Scala per gestire decimali (fino a 3 cifre)
    const scale = 1000;
    const scaledNum = Math.abs(Math.round(num * scale));
    const scaledDen = Math.abs(Math.round(den * scale));

    const divisor = gcd(scaledNum, scaledDen);
    const simplifiedNum = scaledNum / divisor;
    const simplifiedDen = scaledDen / divisor;

    if (simplifiedDen === 1) {
        return `${sign * simplifiedNum}`;
    }

    const signStr = sign < 0 ? "-" : "";
    return `${signStr}\\frac{${simplifiedNum}}{${simplifiedDen}}`;
}

/**
 * Formatta una frazione con numeri interi in LaTeX
 */
export function formatIntFractionLatex(num: number, den: number): string {
    if (den === 0) return "\\text{indefinito}";
    if (num === 0) return "0";

    const sign = (num < 0) !== (den < 0) ? -1 : 1;
    const absNum = Math.abs(Math.round(num));
    const absDen = Math.abs(Math.round(den));

    const g = gcd(absNum, absDen);
    const n = absNum / g;
    const d = absDen / g;

    if (d === 1) return `${sign * n}`;

    const signStr = sign < 0 ? "-" : "";
    return `${signStr}\\frac{${n}}{${d}}`;
}

/**
 * Converte un numero decimale in frazione LaTeX (se possibile)
 */
export function formatNumberLatex(n: number, maxDenominator: number = 12): string {
    if (!Number.isFinite(n)) return "\\text{indef.}";
    if (Number.isInteger(n)) return n.toString();

    // Prova a trovare una frazione semplice
    for (let den = 2; den <= maxDenominator; den++) {
        const num = n * den;
        if (Math.abs(num - Math.round(num)) < 0.0001) {
            return formatFractionLatex(Math.round(num), den);
        }
    }

    return n.toFixed(2).replace(/\.?0+$/, "");
}

/**
 * Formatta un rapporto tra numeri (anche decimali) come frazione semplificata
 * Gestisce correttamente numeri interi e decimali semplici
 */
export function formatRatioLatex(num: number, den: number): string {
    if (den === 0) return "\\text{indefinito}";
    if (num === 0) return "0";

    // Se entrambi sono già interi (o molto vicini), usa direttamente
    const roundedNum = Math.round(num);
    const roundedDen = Math.round(den);

    if (Math.abs(num - roundedNum) < 1e-9 && Math.abs(den - roundedDen) < 1e-9) {
        return formatIntFractionLatex(roundedNum, roundedDen);
    }

    // Per decimali, moltiplica per potenza di 10 appropriata
    // Usa un approccio più robusto che non dipende da toString()
    const scale = 1000000; // Scala sufficiente per la maggior parte dei casi
    const iNum = Math.round(num * scale);
    const iDen = Math.round(den * scale);

    return formatIntFractionLatex(iNum, iDen);
}

// ============ FORMATTAZIONE MONOMI ============

/**
 * Formatta un monomio x² in LaTeX
 */
export function monoX2Latex(a: number): string {
    if (a === 0) return "0";
    if (a === 1) return "x^2";
    if (a === -1) return "-x^2";
    return `${a}x^2`;
}

/**
 * Formatta un monomio x in LaTeX
 */
export function monoXLatex(b: number): string {
    if (b === 0) return "0";
    if (b === 1) return "x";
    if (b === -1) return "-x";
    return `${b}x`;
}

/**
 * Formatta una costante in LaTeX
 */
export function constLatex(c: number): string {
    if (c === 0) return "0";
    return c < 0 ? `-${Math.abs(c)}` : `${c}`;
}

/**
 * Restituisce il coefficiente per x² (gestisce 1 e -1)
 */
export function coefForX2Latex(a: number): string {
    if (a === 1) return "";
    if (a === -1) return "-";
    return `${a}`;
}

/**
 * Restituisce il coefficiente per x (gestisce 1 e -1)
 */
export function coefForXLatex(a: number): string {
    if (a === 1) return "";
    if (a === -1) return "-";
    return `${a}`;
}

// ============ FORMATTAZIONE POLINOMI ============

export type TermDef = {
    latex: string;
    value: number
};

/**
 * Concatena termini con segni corretti (+ e -)
 */
export function sumTermsLatex(terms: TermDef[]): string {
    const nonZero = terms.filter((t) => t.value !== 0);
    if (nonZero.length === 0) return "0";

    let out = nonZero[0].latex;
    for (let i = 1; i < nonZero.length; i++) {
        const v = nonZero[i].value;
        const raw = nonZero[i].latex;
        const absLatex = raw.startsWith("-") ? raw.slice(1) : raw;
        out += v >= 0 ? ` + ${absLatex}` : ` - ${absLatex}`;
    }
    return out;
}

/**
 * Formatta un polinomio quadratico ax² + bx + c in LaTeX
 */
export function formatQuadraticLatex(a: number, b: number, c: number): string {
    return sumTermsLatex([
        { latex: monoX2Latex(a), value: a },
        { latex: monoXLatex(b), value: b },
        { latex: constLatex(c), value: c },
    ]);
}

/**
 * Formatta un polinomio lineare ax + b in LaTeX
 */
export function formatLinearLatex(a: number, b: number): string {
    return sumTermsLatex([
        { latex: monoXLatex(a), value: a },
        { latex: constLatex(b), value: b },
    ]);
}

/**
 * Aggiunge parentesi LaTeX attorno a un'espressione
 */
export function parenLatex(expr: string): string {
    return `\\left(${expr}\\right)`;
}

/**
 * Formatta un polinomio lineare con parentesi
 */
export function parenLinearLatex(a: number, b: number): string {
    return parenLatex(formatLinearLatex(a, b));
}

// ============ SEGNI DISEQUAZIONI ============

export type InequalitySign = "<" | ">" | "<=" | ">=";

/**
 * Converte un segno di disequazione in LaTeX
 */
export function signToLatex(sign: InequalitySign): string {
    switch (sign) {
        case "<": return "<";
        case ">": return ">";
        case "<=": return "\\leq";
        case ">=": return "\\geq";
    }
}

/**
 * Converte un segno di disequazione in testo italiano
 */
export function signToText(sign: InequalitySign): string {
    switch (sign) {
        case "<": return "minore di zero";
        case ">": return "maggiore di zero";
        case "<=": return "minore o uguale a zero";
        case ">=": return "maggiore o uguale a zero";
    }
}

/**
 * Converte un segno in simbolo unicode
 */
export function signToSymbol(sign: InequalitySign): string {
    switch (sign) {
        case "<": return "<";
        case ">": return ">";
        case "<=": return "≤";
        case ">=": return "≥";
    }
}

/**
 * Verifica se la disequazione è stretta (< o >)
 */
export function isStrictInequality(sign: InequalitySign): boolean {
    return sign === "<" || sign === ">";
}

/**
 * Verifica se la disequazione cerca valori positivi (> o >=)
 */
export function isPositiveInequality(sign: InequalitySign): boolean {
    return sign === ">" || sign === ">=";
}

// ============ INSIEMI E INTERVALLI ============

/**
 * Formatta un insieme vuoto
 */
export function emptySetLatex(): string {
    return "\\emptyset";
}

/**
 * Formatta l'insieme dei reali
 */
export function realSetLatex(): string {
    return "\\mathbb{R}";
}

/**
 * Formatta un insieme di punti {x₁, x₂, ...}
 */
export function setLatex(values: number[]): string {
    if (values.length === 0) return emptySetLatex();
    const formatted = values.map(v => formatNumberLatex(v)).join(",\\; ");
    return `\\left\\{ ${formatted} \\right\\}`;
}

/**
 * Formatta un intervallo in notazione standard
 */
export function intervalLatex(
    left: number,
    right: number,
    leftOpen: boolean = false,
    rightOpen: boolean = false
): string {
    const leftBracket = leftOpen ? "(" : "[";
    const rightBracket = rightOpen ? ")" : "]";

    const leftStr = left === -Infinity ? "-\\infty" : formatNumberLatex(left);
    const rightStr = right === Infinity ? "+\\infty" : formatNumberLatex(right);

    return `\\left${leftBracket}${leftStr}, ${rightStr}\\right${rightBracket}`;
}

/**
 * Formatta un insieme con condizione {x ∈ ℝ : condizione}
 */
export function setBuilderLatex(condition: string): string {
    return `\\left\\{ x \\in \\mathbb{R} : ${condition} \\right\\}`;
}

// ============ EQUAZIONI QUADRATICHE ============

/**
 * Classifica un'equazione quadratica
 */
export function classifyQuadratic(
    a: number,
    b: number,
    c: number
): "pura" | "spuria" | "completa" {
    if (isZero(b) && !isZero(c)) return "pura";
    if (!isZero(b) && isZero(c)) return "spuria";
    if (isZero(b) && isZero(c)) return "spuria"; // x² = 0
    return "completa";
}

/**
 * Calcola il discriminante
 */
export function discriminant(a: number, b: number, c: number): number {
    return b * b - 4 * a * c;
}

/**
 * Formatta la formula del discriminante
 */
export function discriminantFormulaLatex(a: number, b: number, c: number): string {
    const delta = discriminant(a, b, c);
    return `\\Delta = ${b}^2 - 4 \\cdot ${a} \\cdot ${c} = ${delta}`;
}

// ============ NOTAZIONE SCIENTIFICA ============

/**
 * Formatta un numero in notazione scientifica LaTeX
 */
export function scientificLatex(value: number, significantDigits: number = 3): string {
    if (value === 0) return "0";

    const exponent = Math.floor(Math.log10(Math.abs(value)));
    const coefficient = value / Math.pow(10, exponent);
    const roundedCoef = parseFloat(coefficient.toPrecision(significantDigits));

    if (exponent === 0) return roundedCoef.toString();

    return `${roundedCoef} \\times 10^{${exponent}}`;
}

// ============ RADICI ============

/**
 * Formatta una radice quadrata in LaTeX
 */
export function sqrtLatex(expr: string): string {
    return `\\sqrt{${expr}}`;
}

/**
 * Formatta una radice n-esima in LaTeX
 */
export function nthRootLatex(expr: string, n: number): string {
    if (n === 2) return sqrtLatex(expr);
    return `\\sqrt[${n}]{${expr}}`;
}