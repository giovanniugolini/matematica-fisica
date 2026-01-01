/**
 * ScomposizionePolinomiDemo - Scomposizione di polinomi step-by-step
 *
 * Metodi supportati:
 * 1. Raccoglimento totale (MCD)
 * 2. Raccoglimento parziale (a gruppi)
 * 3. Prodotti notevoli (differenza quadrati, quadrato binomio, cubo, somma/diff cubi)
 * 4. Trinomio speciale (secondo grado)
 * 5. Metodo di Ruffini (con teorema del resto)
 */

import React, { useState, useCallback } from "react";

import {
    Latex,
    DemoContainer,
    GenerateButton,
    NavigationButtons,
    StepCard,
    InfoBox,
    useStepNavigation,
    useBreakpoint,
    ResponsiveCard,
    ResponsiveGrid,
    CollapsiblePanel,
    SwipeableTabs,
} from "../../components/ui";

import { randomInt, randomNonZero, gcd } from "../../utils/math";

// ============ TIPI ============

type MethodType =
    | "raccoglimento-totale"
    | "raccoglimento-parziale"
    | "differenza-quadrati"
    | "quadrato-binomio"
    | "cubo-binomio"
    | "somma-diff-cubi"
    | "trinomio-speciale"
    | "ruffini";

interface Problem {
    method: MethodType;
    latex: string;           // Polinomio in LaTeX
    steps: Step[];           // Passaggi risolutivi
    result: string;          // Risultato finale in LaTeX
    description: string;     // Descrizione del metodo
}

interface Step {
    title: string;
    content: string;         // LaTeX o testo
    explanation: string;     // Spiegazione
}

// ============ COSTANTI ============

const METHOD_NAMES: Record<MethodType, string> = {
    "raccoglimento-totale": "Raccoglimento totale",
    "raccoglimento-parziale": "Raccoglimento parziale",
    "differenza-quadrati": "Differenza di quadrati",
    "quadrato-binomio": "Quadrato di binomio",
    "cubo-binomio": "Cubo di binomio",
    "somma-diff-cubi": "Somma/Differenza di cubi",
    "trinomio-speciale": "Trinomio speciale",
    "ruffini": "Metodo di Ruffini",
};

const METHOD_COLORS: Record<MethodType, string> = {
    "raccoglimento-totale": "#22c55e",
    "raccoglimento-parziale": "#3b82f6",
    "differenza-quadrati": "#8b5cf6",
    "quadrato-binomio": "#f59e0b",
    "cubo-binomio": "#ef4444",
    "somma-diff-cubi": "#06b6d4",
    "trinomio-speciale": "#14b8a6",
    "ruffini": "#6366f1",
};

// ============ HELPERS LATEX ============

function formatTerm(coeff: number, variable: string, exp: number, isFirst: boolean = false): string {
    if (coeff === 0) return "";

    let result = "";

    // Segno e coefficiente
    if (coeff === 1 && exp > 0) {
        result = isFirst ? "" : "+";
    } else if (coeff === -1 && exp > 0) {
        result = "-";
    } else if (coeff > 0 && !isFirst) {
        result = `+${coeff}`;
    } else {
        result = `${coeff}`;
    }

    // Variabile e esponente
    if (exp === 0) {
        if (coeff === 1 || coeff === -1) result += "1";
    } else if (exp === 1) {
        result += variable;
    } else {
        result += `${variable}^{${exp}}`;
    }

    return result;
}

function polyToLatex(coeffs: number[], variable: string = "x"): string {
    const degree = coeffs.length - 1;
    let terms: string[] = [];

    for (let i = 0; i <= degree; i++) {
        const exp = degree - i;
        const term = formatTerm(coeffs[i], variable, exp, terms.length === 0);
        if (term) terms.push(term);
    }

    return terms.length > 0 ? terms.join("") : "0";
}

function formatMonomial(coeff: number, vars: { v: string; exp: number }[]): string {
    if (coeff === 0) return "0";

    let result = "";

    // Coefficiente
    const absCoeff = Math.abs(coeff);
    const hasVars = vars.some(v => v.exp > 0);

    if (absCoeff !== 1 || !hasVars) {
        result = `${absCoeff}`;
    }

    // Variabili
    for (const { v, exp } of vars) {
        if (exp === 1) result += v;
        else if (exp > 1) result += `${v}^{${exp}}`;
    }

    return coeff < 0 ? `-${result}` : result;
}

// ============ GENERATORI ============

function gcdArray(arr: number[]): number {
    return arr.reduce((a, b) => gcd(Math.abs(a), Math.abs(b)));
}

function generateRaccoglimentoTotale(): Problem {
    // Genera un polinomio con fattore comune
    const factor = randomNonZero(-5, 5);
    const xExp = randomInt(1, 3); // x^1, x^2, o x^3

    // Polinomio interno: ax² + bx + c oppure ax + b
    const numTerms = randomInt(2, 3);
    const innerCoeffs: number[] = [];
    for (let i = 0; i < numTerms; i++) {
        innerCoeffs.push(randomNonZero(-6, 6));
    }

    // Coefficienti espansi
    const expandedCoeffs = innerCoeffs.map(c => c * factor);

    // Costruisci il polinomio con la x in comune
    const degree = innerCoeffs.length - 1 + xExp;
    const fullCoeffs: number[] = new Array(degree + 1).fill(0);

    for (let i = 0; i < innerCoeffs.length; i++) {
        fullCoeffs[i] = expandedCoeffs[i];
    }

    const latex = polyToLatex(fullCoeffs);

    // MCD dei coefficienti
    const mcdCoeff = gcdArray(expandedCoeffs.map(Math.abs));
    const signFactor = expandedCoeffs[0] < 0 ? -1 : 1;
    const mcd = mcdCoeff * signFactor;

    // Fattore comune completo
    const factorLatex = formatMonomial(mcd, [{ v: "x", exp: xExp }]);
    const innerLatex = polyToLatex(innerCoeffs.map(c => (c * factor) / mcd));

    const steps: Step[] = [
        {
            title: "Identifico il MCD dei coefficienti",
            content: `\\text{MCD}(${expandedCoeffs.map(Math.abs).join(", ")}) = ${mcdCoeff}`,
            explanation: "Trovo il massimo comune divisore di tutti i coefficienti numerici."
        },
        {
            title: "Identifico la potenza minima di x",
            content: `x^{${xExp}}`,
            explanation: `La potenza più bassa di x presente in tutti i termini è x^${xExp}.`
        },
        {
            title: "Fattore comune",
            content: factorLatex,
            explanation: "Il fattore comune è il prodotto del MCD per la potenza minima di x."
        },
        {
            title: "Raccolgo",
            content: `${latex} = ${factorLatex}(${innerLatex})`,
            explanation: "Divido ogni termine per il fattore comune e lo metto fuori parentesi."
        }
    ];

    return {
        method: "raccoglimento-totale",
        latex,
        steps,
        result: `${factorLatex}(${innerLatex})`,
        description: "Raccogli il massimo fattore comune a tutti i termini."
    };
}

function generateDifferenzaQuadrati(): Problem {
    // a²x² - b² oppure a² - b²x²
    const a = randomNonZero(1, 6);
    const b = randomNonZero(1, 6);
    const useX = Math.random() < 0.5;

    let latex: string;
    let result: string;
    let aSquared: string;
    let bSquared: string;
    let aBase: string;
    let bBase: string;

    if (useX) {
        // (ax)² - b²
        const aCoeff = a * a;
        aSquared = aCoeff === 1 ? "x^2" : `${aCoeff}x^2`;
        bSquared = `${b * b}`;
        aBase = a === 1 ? "x" : `${a}x`;
        bBase = `${b}`;
        latex = `${aSquared} - ${bSquared}`;
        result = `(${aBase} + ${bBase})(${aBase} - ${bBase})`;
    } else {
        // a² - (bx)²
        const bCoeff = b * b;
        aSquared = `${a * a}`;
        bSquared = bCoeff === 1 ? "x^2" : `${bCoeff}x^2`;
        aBase = `${a}`;
        bBase = b === 1 ? "x" : `${b}x`;
        latex = `${aSquared} - ${bSquared}`;
        result = `(${aBase} + ${bBase})(${aBase} - ${bBase})`;
    }

    const steps: Step[] = [
        {
            title: "Riconosco la differenza di quadrati",
            content: `A^2 - B^2`,
            explanation: "La forma è A² - B², un prodotto notevole."
        },
        {
            title: "Identifico A e B",
            content: `A = ${aBase}, \\quad B = ${bBase}`,
            explanation: `Poiché A² = ${aSquared} e B² = ${bSquared}.`
        },
        {
            title: "Applico la formula",
            content: `A^2 - B^2 = (A + B)(A - B)`,
            explanation: "La differenza di quadrati si scompone nel prodotto di somma per differenza."
        },
        {
            title: "Sostituisco",
            content: `${latex} = ${result}`,
            explanation: "Sostituisco A e B nella formula."
        }
    ];

    return {
        method: "differenza-quadrati",
        latex,
        steps,
        result,
        description: "Applica la formula A² - B² = (A + B)(A - B)"
    };
}

function generateQuadratoBinomio(): Problem {
    // (a ± b)² = a² ± 2ab + b²
    const a = randomNonZero(1, 5);
    const b = randomNonZero(1, 6);
    const isPlus = Math.random() < 0.5;
    const useX = Math.random() < 0.7;

    let aBase: string;
    let bBase: string;
    let aSquared: string;
    let bSquared: string;
    let doubleProduct: string;

    if (useX) {
        aBase = a === 1 ? "x" : `${a}x`;
        bBase = `${b}`;
        aSquared = a * a === 1 ? "x^2" : `${a * a}x^2`;
        bSquared = `${b * b}`;
        doubleProduct = 2 * a * b === 1 ? "x" : `${2 * a * b}x`;
    } else {
        aBase = `${a}`;
        bBase = b === 1 ? "x" : `${b}x`;
        aSquared = `${a * a}`;
        bSquared = b * b === 1 ? "x^2" : `${b * b}x^2`;
        doubleProduct = 2 * a * b === 1 ? "x" : `${2 * a * b}x`;
    }

    const sign = isPlus ? "+" : "-";
    const latex = useX
        ? `${aSquared} ${sign} ${doubleProduct} + ${bSquared}`
        : `${aSquared} ${sign} ${doubleProduct} + ${bSquared}`;

    const result = `(${aBase} ${sign} ${bBase})^2`;

    const steps: Step[] = [
        {
            title: "Riconosco il quadrato di binomio",
            content: `A^2 ${sign} 2AB + B^2`,
            explanation: `La forma è A² ${sign} 2AB + B², un quadrato di binomio.`
        },
        {
            title: "Verifico la struttura",
            content: `\\sqrt{${aSquared}} = ${aBase}, \\quad \\sqrt{${bSquared}} = ${bBase}`,
            explanation: "Controllo che il primo e l'ultimo termine siano quadrati perfetti."
        },
        {
            title: "Verifico il doppio prodotto",
            content: `2 \\cdot ${aBase} \\cdot ${bBase} = ${doubleProduct}`,
            explanation: "Il termine centrale deve essere il doppio prodotto di A e B."
        },
        {
            title: "Applico la formula",
            content: `${latex} = ${result}`,
            explanation: `A² ${sign} 2AB + B² = (A ${sign} B)²`
        }
    ];

    return {
        method: "quadrato-binomio",
        latex,
        steps,
        result,
        description: `Applica la formula A² ${sign} 2AB + B² = (A ${sign} B)²`
    };
}

function generateCuboBinomio(): Problem {
    // (a ± b)³ = a³ ± 3a²b + 3ab² ± b³
    // Esempio: (2x + y)³ = 8x³ + 12x²y + 6xy² + y³

    const a = randomInt(1, 3); // coefficiente di x (piccolo per evitare numeri enormi)
    const b = randomInt(1, 3); // coefficiente/termine costante
    const isPlus = Math.random() < 0.5;

    // Calcoliamo i coefficienti espansi
    // (ax + b)³ = a³x³ + 3a²bx² + 3ab²x + b³   (se +)
    // (ax - b)³ = a³x³ - 3a²bx² + 3ab²x - b³   (se -)

    const a3 = a * a * a;           // a³
    const coeff1 = a3;              // coefficiente di x³

    const a2b = a * a * b;
    const coeff2 = 3 * a2b;         // 3a²b, coefficiente di x²

    const ab2 = a * b * b;
    const coeff3 = 3 * ab2;         // 3ab², coefficiente di x

    const b3 = b * b * b;           // b³
    const coeff4 = b3;              // termine noto

    // Costruisco il polinomio con i segni corretti
    let latex: string;
    if (isPlus) {
        // a³x³ + 3a²bx² + 3ab²x + b³
        latex = `${coeff1}x^3 + ${coeff2}x^2 + ${coeff3}x + ${coeff4}`;
    } else {
        // a³x³ - 3a²bx² + 3ab²x - b³
        latex = `${coeff1}x^3 - ${coeff2}x^2 + ${coeff3}x - ${coeff4}`;
    }

    // Pulizia: 1x³ -> x³
    latex = latex.replace(/\b1x/g, "x");

    // Base del binomio
    const aBase = a === 1 ? "x" : `${a}x`;
    const sign = isPlus ? "+" : "-";
    const result = `(${aBase} ${sign} ${b})^3`;

    // Steps
    const steps: Step[] = [
        {
            title: "Riconosco il cubo di binomio",
            content: `A^3 ${isPlus ? "+" : "-"} 3A^2B + 3AB^2 ${isPlus ? "+" : "-"} B^3`,
            explanation: `La forma è A³ ${isPlus ? "+" : "-"} 3A²B + 3AB² ${isPlus ? "+" : "-"} B³, un cubo di binomio.`
        },
        {
            title: "Identifico A (radice cubica del primo termine)",
            content: `\\sqrt[3]{${coeff1}x^3} = ${aBase}`,
            explanation: `A = ${aBase} perché A³ = ${coeff1}x³.`
        },
        {
            title: "Identifico B (radice cubica dell'ultimo termine)",
            content: `\\sqrt[3]{${coeff4}} = ${b}`,
            explanation: `B = ${b} perché B³ = ${coeff4}.`
        },
        {
            title: "Verifico i tripli prodotti",
            content: `3A^2B = 3 \\cdot (${aBase})^2 \\cdot ${b} = ${coeff2}x^2 \\quad \\checkmark`,
            explanation: `3A²B = 3 · ${a}² · ${b} = ${coeff2}, che corrisponde al secondo termine.`
        },
        {
            title: "Verifico il secondo triplo prodotto",
            content: `3AB^2 = 3 \\cdot ${aBase} \\cdot ${b}^2 = ${coeff3}x \\quad \\checkmark`,
            explanation: `3AB² = 3 · ${a} · ${b}² = ${coeff3}, che corrisponde al terzo termine.`
        },
        {
            title: "Scompongo",
            content: `${latex} = ${result}`,
            explanation: `Il polinomio è il cubo di (${aBase} ${sign} ${b}).`
        }
    ];

    return {
        method: "cubo-binomio",
        latex,
        steps,
        result,
        description: `Applica la formula (A ${sign} B)³ = A³ ${isPlus ? "+" : "-"} 3A²B + 3AB² ${isPlus ? "+" : "-"} B³`
    };
}

function generateTrinomioSpeciale(): Problem {
    // x² + (p+q)x + pq = (x + p)(x + q)
    const p = randomNonZero(-8, 8);
    let q = randomNonZero(-8, 8);
    // Evita p = q per varietà
    while (q === p) q = randomNonZero(-8, 8);

    const sum = p + q;
    const product = p * q;

    const latex = polyToLatex([1, sum, product]);

    // Formatta i fattori
    const factor1 = p >= 0 ? `(x + ${p})` : `(x - ${Math.abs(p)})`;
    const factor2 = q >= 0 ? `(x + ${q})` : `(x - ${Math.abs(q)})`;
    const result = `${factor1}${factor2}`;

    const steps: Step[] = [
        {
            title: "Riconosco il trinomio di secondo grado",
            content: `x^2 + sx + p \\quad \\text{con } s = ${sum}, \\; p = ${product}`,
            explanation: "È un trinomio con coefficiente di x² uguale a 1. Qui s è la somma e p il prodotto."
        },
        {
            title: "Cerco due numeri α₁ e α₂ tali che",
            content: `\\alpha_1 + \\alpha_2 = s = ${sum}, \\quad \\alpha_1 \\cdot \\alpha_2 = p = ${product}`,
            explanation: "La somma deve dare il coefficiente di x, il prodotto il termine noto."
        },
        {
            title: "Trovo α₁ e α₂",
            content: `\\alpha_1 = ${p}, \\quad \\alpha_2 = ${q}`,
            explanation: `Infatti ${p} + (${q}) = ${sum} e ${p} × (${q}) = ${product}.`
        },
        {
            title: "Scompongo",
            content: `${latex} = ${result}`,
            explanation: "x² + sx + p = (x + α₁)(x + α₂)"
        }
    ];

    return {
        method: "trinomio-speciale",
        latex,
        steps,
        result,
        description: "Trova due numeri la cui somma è il coefficiente di x e il cui prodotto è il termine noto."
    };
}

function generateRaccoglimentoParziale(): Problem {
    // Pattern: genero (ax^n + by^m)(x + y) e lo espando
    // Esempio: (x² - 2y)(x + y) = x³ + x²y - 2xy - 2y²
    // Poi si scompone: x²(x + y) - 2y(x + y) = (x² - 2y)(x + y)

    // Coefficienti per il primo fattore: ax^n + by^m
    const a = randomNonZero(-4, 4);
    const b = randomNonZero(-4, 4);
    const nExp = randomInt(1, 2); // esponente di x nel primo termine
    const mExp = randomInt(1, 2); // esponente di y nel secondo termine

    // Il secondo fattore è sempre (x + y) o (x - y)
    const sign2 = Math.random() < 0.5 ? 1 : -1;

    // Espando (ax^n + by^m)(x + sign2*y)
    // = ax^(n+1) + sign2*ax^n*y + bx*y^m + sign2*by^(m+1)

    // Termine 1: ax^(n+1)
    const c1 = a;
    const t1xExp = nExp + 1;
    const t1yExp = 0;

    // Termine 2: sign2 * a * x^n * y
    const c2 = sign2 * a;
    const t2xExp = nExp;
    const t2yExp = 1;

    // Termine 3: b * x * y^m
    const c3 = b;
    const t3xExp = 1;
    const t3yExp = mExp;

    // Termine 4: sign2 * b * y^(m+1)
    const c4 = sign2 * b;
    const t4xExp = 0;
    const t4yExp = mExp + 1;

    // Funzione per formattare un termine con x e y
    function formatXYTerm(coeff: number, xExp: number, yExp: number, isFirst: boolean): string {
        if (coeff === 0) return "";

        let result = "";
        const absCoeff = Math.abs(coeff);

        // Segno
        if (coeff > 0 && !isFirst) result += "+";
        else if (coeff < 0) result += "-";

        // Coefficiente (solo se != 1 o se non ci sono variabili)
        if (absCoeff !== 1 || (xExp === 0 && yExp === 0)) {
            result += absCoeff;
        }

        // Variabili
        if (xExp === 1) result += "x";
        else if (xExp > 1) result += `x^{${xExp}}`;

        if (yExp === 1) result += "y";
        else if (yExp > 1) result += `y^{${yExp}}`;

        return result;
    }

    // Costruisco il polinomio espanso
    const term1 = formatXYTerm(c1, t1xExp, t1yExp, true);
    const term2 = formatXYTerm(c2, t2xExp, t2yExp, false);
    const term3 = formatXYTerm(c3, t3xExp, t3yExp, false);
    const term4 = formatXYTerm(c4, t4xExp, t4yExp, false);

    const latex = `${term1}${term2}${term3}${term4}`;

    // Fattore comune che emergerà: (x + sign2*y)
    const commonFactor = sign2 === 1 ? "(x + y)" : "(x - y)";

    // Primo fattore raccolto: ax^n
    const factor1 = formatXYTerm(a, nExp, 0, true);

    // Secondo fattore raccolto: by^m
    const factor2 = formatXYTerm(b, 0, mExp, true);
    const factor2WithSign = b > 0 ? `+ ${factor2}` : `- ${formatXYTerm(Math.abs(b), 0, mExp, true)}`;

    // Risultato finale: (ax^n + by^m)(x ± y)
    const firstBracket = `(${factor1} ${factor2WithSign})`;
    const result = `${firstBracket}${commonFactor}`;

    // Steps
    const steps: Step[] = [
        {
            title: "Verifico che non ci sia un fattore comune totale",
            content: latex,
            explanation: "Non c'è un fattore comune a tutti i termini, quindi provo il raccoglimento parziale."
        },
        {
            title: "Raggruppo i termini a coppie",
            content: `(${term1}${term2}) + (${formatXYTerm(c3, t3xExp, t3yExp, true)}${term4})`,
            explanation: "Raggruppo i primi due termini e gli ultimi due."
        },
        {
            title: "Raccolgo dal primo gruppo",
            content: `${factor1}${commonFactor}`,
            explanation: `Dal primo gruppo raccolgo ${factor1}.`
        },
        {
            title: "Raccolgo dal secondo gruppo",
            content: `${factor1}${commonFactor} ${factor2WithSign}${commonFactor}`,
            explanation: `Dal secondo gruppo raccolgo ${factor2}.`
        },
        {
            title: "Raccolgo il fattore comune",
            content: `${latex} = ${result}`,
            explanation: `Il fattore comune ${commonFactor} si può raccogliere.`
        }
    ];

    return {
        method: "raccoglimento-parziale",
        latex,
        steps,
        result,
        description: "Raggruppa i termini a coppie e raccogli i fattori comuni da ciascun gruppo."
    };
}

function generateSommaDifferenzaCubi(): Problem {
    // a³ ± b³ = (a ± b)(a² ∓ ab + b²)
    const a = randomNonZero(1, 4);
    const b = randomNonZero(1, 4);
    const isSum = Math.random() < 0.5;
    const useX = Math.random() < 0.7;

    let aBase: string;
    let bBase: string;
    let aCubed: string;
    let bCubed: string;

    if (useX) {
        aBase = a === 1 ? "x" : `${a}x`;
        bBase = `${b}`;
        aCubed = a === 1 ? "x^3" : `${a * a * a}x^3`;
        bCubed = `${b * b * b}`;
    } else {
        aBase = `${a}`;
        bBase = b === 1 ? "x" : `${b}x`;
        aCubed = `${a * a * a}`;
        bCubed = b === 1 ? "x^3" : `${b * b * b}x^3`;
    }

    const sign1 = isSum ? "+" : "-";
    const sign2 = isSum ? "-" : "+";

    const latex = `${aCubed} ${sign1} ${bCubed}`;

    // (a ± b)(a² ∓ ab + b²)
    const aSquared = useX ? (a === 1 ? "x^2" : `${a * a}x^2`) : `${a * a}`;
    const bSquaredTerm = useX ? `${b * b}` : (b === 1 ? "x^2" : `${b * b}x^2`);
    const abTerm = useX ? (a * b === 1 ? "x" : `${a * b}x`) : (a * b === 1 ? "x" : `${a * b}x`);

    const trinomial = `${aSquared} ${sign2} ${abTerm} + ${bSquaredTerm}`;
    const result = `(${aBase} ${sign1} ${bBase})(${trinomial})`;

    const method: MethodType = "somma-diff-cubi";
    const formulaName = isSum ? "somma di cubi" : "differenza di cubi";

    const steps: Step[] = [
        {
            title: `Riconosco la ${formulaName}`,
            content: `A^3 ${sign1} B^3`,
            explanation: `La forma è A³ ${sign1} B³, un prodotto notevole.`
        },
        {
            title: "Identifico A e B",
            content: `A = ${aBase}, \\quad B = ${bBase}`,
            explanation: `Poiché A³ = ${aCubed} e B³ = ${bCubed}.`
        },
        {
            title: "Applico la formula",
            content: `A^3 ${sign1} B^3 = (A ${sign1} B)(A^2 ${sign2} AB + B^2)`,
            explanation: `La ${formulaName} si scompone con questa formula.`
        },
        {
            title: "Sostituisco",
            content: `${latex} = ${result}`,
            explanation: "Sostituisco A e B nella formula."
        }
    ];

    return {
        method,
        latex,
        steps,
        result,
        description: `Applica la formula A³ ${sign1} B³ = (A ${sign1} B)(A² ${sign2} AB + B²)`
    };
}

function generateRuffini(): Problem {
    // Genero un polinomio con radice nota
    // (x - r)(ax² + bx + c) oppure (x - r)(ax + b)
    const r = randomNonZero(-4, 4); // radice
    const degree = randomInt(2, 3);

    // Coefficienti del quoziente
    const quotientCoeffs: number[] = [];
    quotientCoeffs.push(randomNonZero(1, 3)); // Coefficiente direttivo
    for (let i = 1; i < degree; i++) {
        quotientCoeffs.push(randomInt(-5, 5));
    }

    // Moltiplico (x - r) per il quoziente
    // (x - r)(a_n x^n + ... + a_0) = a_n x^{n+1} + ... - r*a_0
    const expandedCoeffs: number[] = new Array(degree + 1).fill(0);

    for (let i = 0; i < quotientCoeffs.length; i++) {
        expandedCoeffs[i] += quotientCoeffs[i];
        expandedCoeffs[i + 1] -= r * quotientCoeffs[i];
    }

    const latex = polyToLatex(expandedCoeffs);

    // Divisori del termine noto
    const termineNoto = Math.abs(expandedCoeffs[expandedCoeffs.length - 1]);
    const divisori: number[] = [];
    for (let i = 1; i <= termineNoto; i++) {
        if (termineNoto % i === 0) {
            divisori.push(i);
            divisori.push(-i);
        }
    }

    // Schema di Ruffini
    let resultCoeffs: number[] = [expandedCoeffs[0]];

    for (let i = 1; i < expandedCoeffs.length; i++) {
        const newVal = expandedCoeffs[i] + r * resultCoeffs[resultCoeffs.length - 1];
        resultCoeffs.push(newVal);
    }

    // Il risultato è (x - r) * quoziente
    const factorLatex = r > 0 ? `(x - ${r})` : `(x + ${Math.abs(r)})`;
    const quotientLatex = polyToLatex(quotientCoeffs);
    const result = `${factorLatex}(${quotientLatex})`;

    // Costruisco la tabella Ruffini in LaTeX con barra verticale sull'ultima colonna
    const numCols = expandedCoeffs.length;
    const colSpec = "c".repeat(numCols - 1) + "|c"; // ultima colonna separata
    const coeffStr = expandedCoeffs.join(" & ");
    const multRow = [""].concat(expandedCoeffs.slice(1).map((_, i) => `${r * resultCoeffs[i]}`)).join(" & ");
    const resultRow = resultCoeffs.join(" & ");

    const ruffiniTable = `\\begin{array}{c|${colSpec}}
${r} & ${coeffStr} \\\\
& ${multRow} \\\\
\\hline
& ${resultRow}
\\end{array}`;

    const steps: Step[] = [
        {
            title: "Cerco le possibili radici razionali",
            content: `\\text{Divisori di } ${termineNoto}: \\pm${divisori.filter(d => d > 0).join(", \\pm")}`,
            explanation: "Per il teorema delle radici razionali, le possibili radici sono i divisori del termine noto diviso i divisori del coefficiente direttivo."
        },
        {
            title: "Verifico x = " + r,
            content: `P(${r}) = ${expandedCoeffs.map((c, i) => {
                const exp = expandedCoeffs.length - 1 - i;
                return exp > 0 ? `${c} \\cdot ${r}^{${exp}}` : `${c}`;
            }).join(" + ")} = 0`,
            explanation: `Sostituisco x = ${r} nel polinomio e verifico che il risultato sia 0.`
        },
        {
            title: "Applico lo schema di Ruffini",
            content: ruffiniTable,
            explanation: "Uso lo schema di Ruffini per dividere il polinomio per (x - r)."
        },
        {
            title: "Leggo il quoziente",
            content: `${latex} = ${result}`,
            explanation: "L'ultima riga (escluso lo 0 finale) dà i coefficienti del quoziente."
        }
    ];

    return {
        method: "ruffini",
        latex,
        steps,
        result,
        description: "Trova una radice razionale e usa lo schema di Ruffini per abbassare il grado."
    };
}

// ============ GENERATORE PRINCIPALE ============

function generateProblem(method?: MethodType): Problem {
    const methods: MethodType[] = [
        "raccoglimento-totale",
        "raccoglimento-parziale",
        "differenza-quadrati",
        "quadrato-binomio",
        "cubo-binomio",
        "trinomio-speciale",
        "somma-diff-cubi",
        "ruffini"
    ];

    const selectedMethod = method || methods[randomInt(0, methods.length - 1)];

    switch (selectedMethod) {
        case "raccoglimento-totale":
            return generateRaccoglimentoTotale();
        case "raccoglimento-parziale":
            return generateRaccoglimentoParziale();
        case "differenza-quadrati":
            return generateDifferenzaQuadrati();
        case "quadrato-binomio":
            return generateQuadratoBinomio();
        case "cubo-binomio":
            return generateCuboBinomio();
        case "trinomio-speciale":
            return generateTrinomioSpeciale();
        case "somma-diff-cubi":
            return generateSommaDifferenzaCubi();
        case "ruffini":
            return generateRuffini();
        default:
            return generateRaccoglimentoTotale();
    }
}

// ============ GENERATORI AVANZATI (combinati) ============

function generateAdvanced1_RaccoltoPiuTrinomio(): Problem {
    // Tipo: ax³ + bx² + cx = x(ax² + bx + c) = x(x + p)(x + q) oppure con coeff != 1
    // Esempio: 2x³ + 2x² - 4x = 2x(x² + x - 2) = 2x(x + 2)(x - 1)

    const commonFactor = randomNonZero(1, 3) * (Math.random() < 0.5 ? 1 : -1);
    const xPower = randomInt(1, 2);

    // Trinomio interno: x² + (p+q)x + pq
    const p = randomNonZero(-5, 5);
    let q = randomNonZero(-5, 5);
    while (q === p) q = randomNonZero(-5, 5);

    const sum = p + q;
    const product = p * q;

    // Espando: commonFactor * x^xPower * (x² + sum*x + product)
    const coeff3 = commonFactor; // x^(xPower+2)
    const coeff2 = commonFactor * sum; // x^(xPower+1)
    const coeff1 = commonFactor * product; // x^xPower

    const degree = xPower + 2;

    // Costruisco il latex
    let latex = "";
    if (degree === 3) {
        latex = `${coeff3}x^3 ${coeff2 >= 0 ? "+" : ""} ${coeff2}x^2 ${coeff1 >= 0 ? "+" : ""} ${coeff1}x`;
    } else {
        latex = `${coeff3}x^4 ${coeff2 >= 0 ? "+" : ""} ${coeff2}x^3 ${coeff1 >= 0 ? "+" : ""} ${coeff1}x^2`;
    }
    latex = latex.replace(/\+ -/g, "- ").replace(/\b1x/g, "x").replace(/ {2,}/g, " ");

    const commonFactorLatex = commonFactor === 1
        ? (xPower === 1 ? "x" : `x^${xPower}`)
        : (xPower === 1 ? `${commonFactor}x` : `${commonFactor}x^${xPower}`);

    const trinomioLatex = `x^2 ${sum >= 0 ? "+" : ""} ${sum}x ${product >= 0 ? "+" : ""} ${product}`;
    const cleanTrinomio = trinomioLatex.replace(/\+ -/g, "- ").replace(/\b1x/g, "x").replace(/\+ 0x/g, "");

    const factor1 = p >= 0 ? `(x + ${p})` : `(x - ${Math.abs(p)})`;
    const factor2 = q >= 0 ? `(x + ${q})` : `(x - ${Math.abs(q)})`;

    const result = `${commonFactorLatex}${factor1}${factor2}`;

    const steps: Step[] = [
        {
            title: "Cerco un fattore comune",
            content: `${latex}`,
            explanation: `Tutti i termini hanno in comune ${commonFactorLatex}.`
        },
        {
            title: "Raccolgo il fattore comune",
            content: `${commonFactorLatex}(${cleanTrinomio})`,
            explanation: `Raccolgo ${commonFactorLatex} e ottengo un trinomio di secondo grado.`
        },
        {
            title: "Scompongo il trinomio",
            content: `${cleanTrinomio}`,
            explanation: `Cerco due numeri p e q tali che p + q = ${sum} e p · q = ${product}.`
        },
        {
            title: "Trovo p e q",
            content: `p = ${p}, \\quad q = ${q}`,
            explanation: `Infatti ${p} + (${q}) = ${sum} e ${p} × (${q}) = ${product}.`
        },
        {
            title: "Risultato finale",
            content: `${latex} = ${result}`,
            explanation: "Combino il fattore raccolto con la scomposizione del trinomio."
        }
    ];

    return {
        method: "raccoglimento-totale", // Il primo metodo usato
        latex: latex.trim(),
        steps,
        result,
        description: "Prima raccogli il fattore comune, poi scomponi il trinomio."
    };
}

function generateAdvanced2_RaccoltoPiuDifferenzaQuadrati(): Problem {
    // Tipo: ax³ - ab²x = ax(x² - b²) = ax(x+b)(x-b)
    // Esempio: 3x³ - 12x = 3x(x² - 4) = 3x(x + 2)(x - 2)

    const a = randomNonZero(1, 4);
    const b = randomInt(2, 5);
    const bSquared = b * b;

    const coeff1 = a;
    const coeff2 = a * bSquared;

    const latex = `${coeff1}x^3 - ${coeff2}x`;
    const cleanLatex = latex.replace(/\b1x/g, "x");

    const commonFactorLatex = a === 1 ? "x" : `${a}x`;
    const result = `${commonFactorLatex}(x + ${b})(x - ${b})`;

    const steps: Step[] = [
        {
            title: "Cerco un fattore comune",
            content: cleanLatex,
            explanation: `Tutti i termini hanno in comune ${commonFactorLatex}.`
        },
        {
            title: "Raccolgo il fattore comune",
            content: `${commonFactorLatex}(x^2 - ${bSquared})`,
            explanation: `Raccolgo ${commonFactorLatex} e ottengo una differenza.`
        },
        {
            title: "Riconosco la differenza di quadrati",
            content: `x^2 - ${bSquared} = x^2 - ${b}^2`,
            explanation: `${bSquared} = ${b}², quindi è una differenza di quadrati.`
        },
        {
            title: "Applico A² - B² = (A+B)(A-B)",
            content: `x^2 - ${b}^2 = (x + ${b})(x - ${b})`,
            explanation: `Con A = x e B = ${b}.`
        },
        {
            title: "Risultato finale",
            content: `${cleanLatex} = ${result}`,
            explanation: "Combino il fattore raccolto con la scomposizione."
        }
    ];

    return {
        method: "raccoglimento-totale",
        latex: cleanLatex,
        steps,
        result,
        description: "Prima raccogli il fattore comune, poi applica la differenza di quadrati."
    };
}

function generateAdvanced3_RaccoltoParzialePiuProdottoNotevole(): Problem {
    // Tipo: x³ + x² - x - 1 = x²(x+1) - 1(x+1) = (x² - 1)(x + 1) = (x+1)(x-1)(x+1) = (x+1)²(x-1)
    // Oppure: ax² + ay + bx² + by = (a+b)x² + (a+b)y = ...

    const a = randomInt(1, 3);

    // Genero (x² - a²)(x + a) = x³ + ax² - a²x - a³
    const aSquared = a * a;
    const aCubed = a * a * a;

    const latex = `x^3 + ${a}x^2 - ${aSquared}x - ${aCubed}`;
    const cleanLatex = latex.replace(/\b1x/g, "x").replace(/\+ -/g, "- ");

    const result = `(x + ${a})^2(x - ${a})`;

    const steps: Step[] = [
        {
            title: "Raggruppo i termini",
            content: `(x^3 + ${a}x^2) + (-${aSquared}x - ${aCubed})`,
            explanation: "Raggruppo i primi due e gli ultimi due termini."
        },
        {
            title: "Raccolgo dal primo gruppo",
            content: `x^2(x + ${a})`,
            explanation: `Dal primo gruppo raccolgo x².`
        },
        {
            title: "Raccolgo dal secondo gruppo",
            content: `x^2(x + ${a}) - ${aSquared}(x + ${a})`,
            explanation: `Dal secondo gruppo raccolgo -${aSquared}.`
        },
        {
            title: "Raccolgo il fattore comune (x + a)",
            content: `(x + ${a})(x^2 - ${aSquared})`,
            explanation: `Raccolgo (x + ${a}).`
        },
        {
            title: "Riconosco la differenza di quadrati",
            content: `(x + ${a})(x + ${a})(x - ${a})`,
            explanation: `x² - ${aSquared} = (x + ${a})(x - ${a}).`
        },
        {
            title: "Risultato finale",
            content: `${cleanLatex} = ${result}`,
            explanation: "Semplifico i fattori uguali."
        }
    ];

    return {
        method: "raccoglimento-parziale",
        latex: cleanLatex,
        steps,
        result,
        description: "Raccoglimento parziale seguito da differenza di quadrati."
    };
}

function generateAdvanced4_RaccoltoPiuCubi(): Problem {
    // Tipo: 2x³ + 16 = 2(x³ + 8) = 2(x + 2)(x² - 2x + 4)

    const a = randomInt(1, 3);
    const b = randomInt(1, 3);
    const bCubed = b * b * b;
    const isSum = Math.random() < 0.5;

    const coeff1 = a;
    const coeff2 = a * bCubed;

    const sign = isSum ? "+" : "-";
    const latex = `${coeff1}x^3 ${sign} ${coeff2}`;
    const cleanLatex = latex.replace(/\b1x/g, "x");

    const innerLatex = isSum ? `x^3 + ${bCubed}` : `x^3 - ${bCubed}`;

    const sign2 = isSum ? "-" : "+";
    const trinomial = `x^2 ${sign2} ${b}x + ${b * b}`;
    const factor1 = isSum ? `(x + ${b})` : `(x - ${b})`;

    const result = a === 1
        ? `${factor1}(${trinomial})`
        : `${a}${factor1}(${trinomial})`;

    const steps: Step[] = [
        {
            title: "Cerco un fattore comune",
            content: cleanLatex,
            explanation: a === 1
                ? "Non c'è un fattore comune numerico."
                : `Entrambi i termini sono divisibili per ${a}.`
        },
        ...(a !== 1 ? [{
            title: "Raccolgo il fattore comune",
            content: `${a}(${innerLatex})`,
            explanation: `Raccolgo ${a}.`
        }] : []),
        {
            title: `Riconosco la ${isSum ? "somma" : "differenza"} di cubi`,
            content: `${innerLatex} = x^3 ${sign} ${b}^3`,
            explanation: `${bCubed} = ${b}³, quindi è una ${isSum ? "somma" : "differenza"} di cubi.`
        },
        {
            title: "Applico la formula A³ ± B³",
            content: `x^3 ${sign} ${b}^3 = ${factor1}(${trinomial})`,
            explanation: `Con A = x e B = ${b}.`
        },
        {
            title: "Risultato finale",
            content: `${cleanLatex} = ${result}`,
            explanation: a === 1
                ? "Scomposizione completata."
                : "Combino il fattore raccolto con la scomposizione."
        }
    ];

    return {
        method: "somma-diff-cubi",
        latex: cleanLatex,
        steps,
        result,
        description: a === 1
            ? `Applica la formula della ${isSum ? "somma" : "differenza"} di cubi.`
            : `Prima raccogli, poi applica la ${isSum ? "somma" : "differenza"} di cubi.`
    };
}

function generateAdvancedProblem(): Problem {
    const generators = [
        generateAdvanced1_RaccoltoPiuTrinomio,
        generateAdvanced2_RaccoltoPiuDifferenzaQuadrati,
        generateAdvanced3_RaccoltoParzialePiuProdottoNotevole,
        generateAdvanced4_RaccoltoPiuCubi,
    ];

    const generator = generators[randomInt(0, generators.length - 1)];
    return generator();
}

// ============ COMPONENTE PRINCIPALE ============

export default function ScomposizionePolinomiDemo() {
    const { isMobile, isTablet } = useBreakpoint();

    const [difficulty, setDifficulty] = useState<"base" | "avanzata">("base");
    const [selectedMethod, setSelectedMethod] = useState<MethodType | "random">("random");
    const [problem, setProblem] = useState<Problem>(() => generateProblem());

    const totalSteps = problem.steps.length;
    // +1 per permettere di mostrare il risultato finale come step aggiuntivo
    const { currentStep, nextStep, prevStep, showAll, reset } = useStepNavigation(totalSteps + 1);
    // Step nascosto inizialmente: currentStep parte da 0, ma step 1 si vede solo quando currentStep >= 1
    const isStepActive = (step: number) => currentStep >= step;

    const handleGenerate = useCallback(() => {
        if (difficulty === "avanzata") {
            setProblem(generateAdvancedProblem());
        } else {
            const method = selectedMethod === "random" ? undefined : selectedMethod;
            setProblem(generateProblem(method));
        }
        reset();
    }, [difficulty, selectedMethod, reset]);

    const methodColor = METHOD_COLORS[problem.method];

    // ============ PANNELLI ============

    const DifficultySelector = (
        <div style={{
            display: "flex",
            gap: 8,
            marginBottom: 16,
            padding: "4px",
            background: "#f1f5f9",
            borderRadius: 12,
        }}>
            <button
                onClick={() => setDifficulty("base")}
                style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: 8,
                    border: "none",
                    background: difficulty === "base" ? "#fff" : "transparent",
                    boxShadow: difficulty === "base" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: difficulty === "base" ? 600 : 400,
                    color: difficulty === "base" ? "#1e40af" : "#64748b",
                    transition: "all 0.2s",
                }}
            >
                📘 Base
            </button>
            <button
                onClick={() => setDifficulty("avanzata")}
                style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: 8,
                    border: "none",
                    background: difficulty === "avanzata" ? "#fff" : "transparent",
                    boxShadow: difficulty === "avanzata" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: difficulty === "avanzata" ? 600 : 400,
                    color: difficulty === "avanzata" ? "#dc2626" : "#64748b",
                    transition: "all 0.2s",
                }}
            >
                🔥 Avanzata
            </button>
        </div>
    );

    const MethodSelector = (
        <ResponsiveCard>
            {DifficultySelector}

            {difficulty === "base" ? (
                <>
                    <div style={{ fontWeight: 600, marginBottom: 12 }}>🎯 Tipo di scomposizione</div>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
                        gap: 8
                    }}>
                        <button
                            onClick={() => setSelectedMethod("random")}
                            style={{
                                padding: "10px 12px",
                                borderRadius: 8,
                                border: selectedMethod === "random" ? "2px solid #3b82f6" : "1px solid #d1d5db",
                                background: selectedMethod === "random" ? "#eff6ff" : "#fff",
                                cursor: "pointer",
                                fontSize: 13,
                                fontWeight: selectedMethod === "random" ? 600 : 400,
                                color: selectedMethod === "random" ? "#1d4ed8" : "#475569",
                            }}
                        >
                            🎲 Casuale
                        </button>
                        {Object.entries(METHOD_NAMES).map(([key, name]) => (
                            <button
                                key={key}
                                onClick={() => setSelectedMethod(key as MethodType)}
                                style={{
                                    padding: "10px 12px",
                                    borderRadius: 8,
                                    border: selectedMethod === key ? `2px solid ${METHOD_COLORS[key as MethodType]}` : "1px solid #d1d5db",
                                    background: selectedMethod === key ? `${METHOD_COLORS[key as MethodType]}15` : "#fff",
                                    cursor: "pointer",
                                    fontSize: 13,
                                    fontWeight: selectedMethod === key ? 600 : 400,
                                    color: selectedMethod === key ? METHOD_COLORS[key as MethodType] : "#475569",
                                    textAlign: "left",
                                }}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                </>
            ) : (
                <div style={{
                    padding: 16,
                    background: "#fef2f2",
                    borderRadius: 12,
                    border: "1px solid #fecaca",
                }}>
                    <div style={{ fontWeight: 600, color: "#dc2626", marginBottom: 8 }}>
                        🔥 Modalità Avanzata
                    </div>
                    <div style={{ fontSize: 13, color: "#7f1d1d" }}>
                        Esercizi combinati che richiedono più passaggi:
                    </div>
                    <ul style={{ fontSize: 13, color: "#991b1b", margin: "8px 0 0 0", paddingLeft: 20 }}>
                        <li>Raccoglimento + Trinomio speciale</li>
                        <li>Raccoglimento + Differenza di quadrati</li>
                        <li>Raccoglimento parziale + Prodotto notevole</li>
                        <li>Raccoglimento + Somma/differenza di cubi</li>
                    </ul>
                </div>
            )}

            <div style={{ marginTop: 16 }}>
                <GenerateButton text="Genera nuovo esercizio" onClick={handleGenerate} />
            </div>
        </ResponsiveCard>
    );

    const ProblemPanel = (
        <ResponsiveCard style={{ borderLeft: `4px solid ${methodColor}` }}>
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
                flexWrap: "wrap"
            }}>
                <span style={{
                    padding: "4px 12px",
                    background: `${methodColor}20`,
                    color: methodColor,
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                }}>
                    {METHOD_NAMES[problem.method]}
                </span>
            </div>
            <div style={{ fontWeight: 600, marginBottom: 8, color: "#64748b", fontSize: 13 }}>
                Scomponi il polinomio:
            </div>
            <div style={{
                fontSize: isMobile ? 20 : 24,
                padding: "16px",
                background: "#f8fafc",
                borderRadius: 12,
                textAlign: "center",
            }}>
                <Latex>{problem.latex}</Latex>
            </div>
            <div style={{ marginTop: 12, fontSize: 13, color: "#64748b", fontStyle: "italic" }}>
                💡 {problem.description}
            </div>
        </ResponsiveCard>
    );

    const StepsPanel = (
        <div style={{ display: "grid", gap: 12 }}>
            {problem.steps.map((step, index) => (
                <StepCard
                    key={index}
                    stepNumber={index + 1}
                    title={step.title}
                    color={index === 0 ? "blue" : index === 1 ? "green" : index === 2 ? "amber" : "purple"}
                    isActive={isStepActive(index + 1)}
                >
                    <div style={{
                        fontSize: isMobile ? 16 : 18,
                        padding: "12px",
                        background: "#fff",
                        borderRadius: 8,
                        marginBottom: 8,
                        overflowX: "auto",
                    }}>
                        <Latex>{step.content}</Latex>
                    </div>
                    <div style={{ fontSize: 13, color: "#64748b" }}>
                        {step.explanation}
                    </div>
                </StepCard>
            ))}

            {/* Risultato finale - appare insieme all'ultimo step */}
            {currentStep >= totalSteps && (
                <div style={{
                    padding: 16,
                    background: "#dcfce7",
                    borderRadius: 12,
                    border: "2px solid #22c55e",
                }}>
                    <div style={{ fontWeight: 600, color: "#166534", marginBottom: 8 }}>
                        ✓ Risultato finale
                    </div>
                    <div style={{ fontSize: isMobile ? 18 : 22, color: "#166534" }}>
                        <Latex>{`${problem.latex} = ${problem.result}`}</Latex>
                    </div>
                </div>
            )}
        </div>
    );

    const FormulaReference = (
        <CollapsiblePanel title="📖 Formule di riferimento" defaultOpen={!isMobile}>
            <div style={{ fontSize: 13, display: "grid", gap: 12 }}>
                <div>
                    <div style={{ fontWeight: 600, marginBottom: 4, color: METHOD_COLORS["differenza-quadrati"] }}>
                        Differenza di quadrati
                    </div>
                    <Latex>{"A^2 - B^2 = (A+B)(A-B)"}</Latex>
                </div>
                <div>
                    <div style={{ fontWeight: 600, marginBottom: 4, color: METHOD_COLORS["quadrato-binomio"] }}>
                        Quadrato di binomio
                    </div>
                    <Latex>{"A^2 \\pm 2AB + B^2 = (A \\pm B)^2"}</Latex>
                </div>
                <div>
                    <div style={{ fontWeight: 600, marginBottom: 4, color: METHOD_COLORS["cubo-binomio"] }}>
                        Cubo di binomio
                    </div>
                    <Latex>{"A^3 \\pm 3A^2B + 3AB^2 \\pm B^3 = (A \\pm B)^3"}</Latex>
                </div>
                <div>
                    <div style={{ fontWeight: 600, marginBottom: 4, color: METHOD_COLORS["somma-diff-cubi"] }}>
                        Somma/differenza di cubi
                    </div>
                    <Latex>{"A^3 \\pm B^3 = (A \\pm B)(A^2 \\mp AB + B^2)"}</Latex>
                </div>
                <div>
                    <div style={{ fontWeight: 600, marginBottom: 4, color: METHOD_COLORS["trinomio-speciale"] }}>
                        Trinomio speciale
                    </div>
                    <Latex>{"x^2 + sx + p = (x+\\alpha_1)(x+\\alpha_2)"}</Latex>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                        con α₁ + α₂ = s e α₁ · α₂ = p
                    </div>
                </div>
                <div>
                    <div style={{ fontWeight: 600, marginBottom: 4, color: METHOD_COLORS["ruffini"] }}>
                        Teorema del resto
                    </div>
                    <div style={{ color: "#64748b" }}>
                        Se P(r) = 0, allora (x - r) è un fattore di P(x)
                    </div>
                </div>
            </div>
        </CollapsiblePanel>
    );

    // ============ LAYOUT MOBILE ============

    if (isMobile) {
        return (
            <DemoContainer
                title="Scomposizione polinomi"
                description="Step-by-step con vari metodi"
            >
                {ProblemPanel}

                <div style={{ marginTop: 12 }}>
                    <NavigationButtons
                        currentStep={currentStep}
                        totalSteps={totalSteps + 1}
                        onNext={nextStep}
                        onPrev={prevStep}
                        onShowAll={showAll}
                    />
                </div>

                <SwipeableTabs
                    tabs={[
                        { id: "steps", label: "📝 Soluzione", content: StepsPanel },
                        { id: "method", label: "🎯 Metodo", content: MethodSelector },
                        { id: "formulas", label: "📖 Formule", content: FormulaReference },
                    ]}
                    defaultTab="method"
                />
            </DemoContainer>
        );
    }

    // ============ LAYOUT TABLET ============

    if (isTablet) {
        return (
            <DemoContainer
                title="Scomposizione di Polinomi"
                description="Risoluzione guidata step-by-step"
            >
                <ResponsiveGrid columns={{ tablet: 2 }} gap={12}>
                    {MethodSelector}
                    {FormulaReference}
                </ResponsiveGrid>

                <div style={{ marginTop: 16 }}>
                    {ProblemPanel}
                </div>

                <div style={{ marginTop: 16 }}>
                    <NavigationButtons
                        currentStep={currentStep}
                        totalSteps={totalSteps + 1}
                        onNext={nextStep}
                        onPrev={prevStep}
                        onShowAll={showAll}
                    />
                </div>

                <div style={{ marginTop: 12 }}>
                    {StepsPanel}
                </div>
            </DemoContainer>
        );
    }

    // ============ LAYOUT DESKTOP ============

    return (
        <DemoContainer
            title="Scomposizione di Polinomi"
            description="Scomponi polinomi con raccoglimento, prodotti notevoli, trinomio speciale e Ruffini"
            maxWidth={1200}
        >
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                {/* Colonna sinistra - Controlli */}
                <div style={{ flex: "0 0 380px", display: "flex", flexDirection: "column", gap: 12 }}>
                    {MethodSelector}
                    {FormulaReference}
                </div>

                {/* Colonna destra - Problema e Soluzione */}
                <div style={{ flex: 1, minWidth: 500, display: "flex", flexDirection: "column", gap: 12 }}>
                    {ProblemPanel}
                    <NavigationButtons
                        currentStep={currentStep}
                        totalSteps={totalSteps + 1}
                        onNext={nextStep}
                        onPrev={prevStep}
                        onShowAll={showAll}
                    />
                    {StepsPanel}
                </div>
            </div>

            <InfoBox title="Strategia generale">
                <ol style={{ margin: "8px 0 0 0", paddingLeft: 20, fontSize: 14 }}>
                    <li><strong>Raccoglimento totale:</strong> Cerca sempre prima un fattore comune a tutti i termini</li>
                    <li><strong>Riconosci i prodotti notevoli:</strong> Differenza di quadrati, quadrati/cubi di binomio</li>
                    <li><strong>Trinomio speciale:</strong> Per trinomi di 2° grado con coeff. di x² = 1</li>
                    <li><strong>Raccoglimento parziale:</strong> Raggruppa i termini se hanno fattori comuni a coppie</li>
                    <li><strong>Ruffini:</strong> Cerca radici razionali tra i divisori del termine noto</li>
                </ol>
            </InfoBox>
        </DemoContainer>
    );
}