/**
 * SistemiSecondoGradoDemo - Risoluzione step-by-step di sistemi di secondo grado
 * Metodo: sostituzione (ricava variabile da eq. lineare, sostituisci in eq. quadratica)
 * Tipi: parabola+retta, iperbole(xy=k)+retta, cerchio+retta
 */

import React, { useState, useCallback, useMemo } from "react";

import {
    Latex,
    DemoContainer,
    ProblemCard,
    NavigationButtons,
    StepCard,
    InfoBox,
    GenerateButton,
    useStepNavigation,
    useBreakpoint,
    ResponsiveGrid,
    SwipeableTabs,
    CollapsiblePanel,
} from "../../components/ui";
import { CollapsibleExplanation } from "../../components/ui/CollapsibleExplanation";

import {
    randomInt,
    randomNonZero,
    randomChoice,
    formatNumberLatex,
    isZero,
} from "../../utils/math";

// ============ TIPI ============

type SystemType = "parabola" | "hyperbola" | "circle";
type NatureType = "distinct" | "double" | "impossible";

interface Solution {
    x: number;
    y: number;
}

interface SystemDef {
    type: SystemType;
    eq1Latex: string;
    eq2Latex: string;

    // Step 1: variabile ricavata
    solveVar: "x" | "y";
    step1ExprLatex: string; // es. "y = 3 - 2x"

    // Step 2: equazione risolvente
    step2WorkLatex: string;
    rA: number;
    rB: number;
    rC: number;
    risolventeLatex: string;
    risolventeVar: "x" | "y";

    // Step 3: risoluzione
    delta: number;
    step3WorkLatex: string;

    // Step 4: soluzioni
    nature: NatureType;
    solutions: Solution[];
    step4WorkLatex: string;
    solutionSetLatex: string;
    // Coefficienti dell'espressione lineare y = linM*x + linN (per back-substitution)
    linM: number;
    linN: number;
}

// ============ HELPERS LATEX ============

/** Formatta ax² + bx + c (per l'equazione risolvente) */
function fmtQuad(a: number, b: number, c: number, v: string): string {
    const parts: string[] = [];

    // Termine x²
    if (a !== 0) {
        if (a === 1) parts.push(`${v}^2`);
        else if (a === -1) parts.push(`-${v}^2`);
        else parts.push(`${a}${v}^2`);
    }

    // Termine x
    if (b !== 0) {
        const sign = b > 0 && parts.length > 0 ? "+" : "";
        if (b === 1) parts.push(`${sign}${v}`);
        else if (b === -1) parts.push(`-${v}`);
        else parts.push(`${sign}${b}${v}`);
    }

    // Costante
    if (c !== 0 || parts.length === 0) {
        const sign = c > 0 && parts.length > 0 ? "+" : "";
        parts.push(`${sign}${c}`);
    }

    return parts.join(" ");
}

/** Formatta un numero come intero o frazione semplice */
function fmtNum(n: number): string {
    if (Number.isInteger(n)) return String(n);
    // Prova frazioni semplici
    for (let d = 2; d <= 20; d++) {
        const num = n * d;
        if (Math.abs(num - Math.round(num)) < 1e-9) {
            const nn = Math.round(num);
            const sign = (nn < 0) !== (d < 0) ? "-" : "";
            return `${sign}\\frac{${Math.abs(nn)}}{${Math.abs(d)}}`;
        }
    }
    return formatNumberLatex(n);
}

/** Formatta una soluzione (x,y) in LaTeX */
function fmtPair(s: Solution): string {
    return `\\left(${fmtNum(s.x)},\\; ${fmtNum(s.y)}\\right)`;
}

/**
 * Costruisce la sostituzione y = linM·(xVal) + linN = yVal in LaTeX
 * Mostra l'espressione aritmetica come nel libro
 */
function buildSubExpr(linM: number, linN: number, xVal: number): string {
    // Costruisce "y = <espressione con xVal sostituito>"
    const xStr = fmtNum(xVal);
    const xInParens = (xVal < 0 || !Number.isInteger(xVal)) ? `\\left(${xStr}\\right)` : xStr;

    if (linM === 0) {
        return `y = ${fmtNum(linN)}`;
    }

    // Parte con il coefficiente di x
    let mPart: string;
    if (linM === 1) {
        mPart = xInParens;
    } else if (linM === -1) {
        mPart = `-${xInParens}`;
    } else {
        mPart = `${linM} \\cdot ${xInParens}`;
    }

    // Aggiungi la costante
    if (linN === 0) {
        return `y = ${mPart}`;
    }

    // Ordine: se |linN| viene prima (es. y = 3 - 2x → "3 - 2·(xVal)")
    // Nel libro: y = 3 - 2·(1/5) → costante prima, poi mx
    // Però dipende da come è scritta la retta. Per semplicità: linN + linM·x
    if (linM > 0) {
        return `y = ${fmtNum(linN)} + ${mPart}`;
    } else {
        // linM < 0: mostra come "linN - |linM|·x"
        const absMpart = linM === -1 ? xInParens : `${Math.abs(linM)} \\cdot ${xInParens}`;
        return `y = ${fmtNum(linN)} - ${absMpart}`;
    }
}

/**
 * Costruisce step4WorkLatex come sistemi \begin{cases} con \lor
 */
function buildStep4Cases(
    solutions: Solution[],
    linM: number,
    linN: number,
): string {
    if (solutions.length === 0) {
        return "\\text{Sistema impossibile: nessuna soluzione.}";
    }

    const cases = solutions.map(s => {
        const subExpr = buildSubExpr(linM, linN, s.x);
        return `\\begin{cases} x = ${fmtNum(s.x)} \\\\ ${subExpr} = ${fmtNum(s.y)} \\end{cases}`;
    });

    return cases.join(" \\;\\lor\\; ");
}

// ============ GENERATORI ============

function generateParabola(): SystemDef {
    // {y = x² + px + q, y = mx + n}
    // Risolvente: x² + (p-m)x + (q-n) = 0 con radici x1, x2

    const wantImpossible = Math.random() < 0.15;
    const wantDouble = !wantImpossible && Math.random() < 0.15;

    let x1: number, x2: number;
    if (wantDouble) {
        x1 = randomInt(-3, 3);
        x2 = x1;
    } else {
        x1 = randomInt(-4, 4);
        x2 = randomInt(-4, 4);
        while (x2 === x1) x2 = randomInt(-4, 4);
    }

    const m = randomInt(-2, 2);
    const n = randomInt(-4, 4);

    let p: number, q: number;
    let rA: number, rB: number, rC: number;

    if (wantImpossible) {
        // Forziamo Δ < 0
        rA = 1;
        rB = randomInt(-3, 3);
        // rC tale che rB²-4rC < 0
        rC = Math.floor(rB * rB / 4) + randomInt(1, 4);
        p = rB + m;
        q = rC + n;
    } else {
        p = m - (x1 + x2);
        q = n + x1 * x2;
        rA = 1;
        rB = -(x1 + x2);
        rC = x1 * x2;
    }

    const delta = rB * rB - 4 * rA * rC;

    // Display: sempre forme esplicite e pulite
    const eq1Latex = `y = ${fmtQuad(1, p, q, "x")}`;

    let eq2Latex: string;
    if (m === 0) {
        eq2Latex = `y = ${n}`;
    } else {
        eq2Latex = `y = ${fmtQuad(0, m, n, "x")}`;
    }

    // Step 1: ricava y dalla lineare
    const step1ExprLatex = eq2Latex;

    // Step 2: sostituzione
    const quadExpr = fmtQuad(1, p, q, "x");
    const linExpr = fmtQuad(0, m, n, "x");
    const risolventeStr = fmtQuad(rA, rB, rC, "x");

    const step2WorkLatex = [
        `${quadExpr} = ${linExpr}`,
        `${fmtQuad(1, p - m, q - n, "x")} = 0`,
    ].join(" \\\\ ");

    const risolventeLatex = `${risolventeStr} = 0`;

    // Step 3: risoluzione
    let step3WorkLatex: string;
    let nature: NatureType;
    const solutions: Solution[] = [];

    if (delta < 0) {
        nature = "impossible";
        step3WorkLatex = [
            `\\Delta = (${rB})^2 - 4 \\cdot ${rA} \\cdot (${rC})`,
            `\\Delta = ${rB * rB} ${rC >= 0 ? "-" : "+"} ${Math.abs(4 * rA * rC)} = ${delta}`,
            `\\Delta < 0 \\;\\Rightarrow\\; \\text{nessuna soluzione reale}`,
        ].join(" \\\\ ");
    } else if (isZero(delta)) {
        nature = "double";
        const xSol = -rB / (2 * rA);
        const ySol = m * xSol + n;
        solutions.push({ x: xSol, y: ySol });
        step3WorkLatex = [
            `\\Delta = (${rB})^2 - 4 \\cdot ${rA} \\cdot (${rC}) = 0`,
            `x = -\\frac{${rB}}{${2 * rA}} = ${fmtNum(xSol)}`,
        ].join(" \\\\ ");
    } else {
        nature = "distinct";
        const sqrtD = Math.sqrt(delta);
        const sol1x = Math.min(x1, x2);
        const sol2x = Math.max(x1, x2);
        const sol1y = m * sol1x + n;
        const sol2y = m * sol2x + n;
        solutions.push({ x: sol1x, y: sol1y }, { x: sol2x, y: sol2y });

        const sqrtStr = Number.isInteger(sqrtD) ? String(sqrtD) : `\\sqrt{${delta}}`;

        step3WorkLatex = [
            `\\Delta = (${rB})^2 - 4 \\cdot ${rA} \\cdot (${rC}) = ${delta}`,
            `x = \\frac{${-rB} \\pm ${sqrtStr}}{${2 * rA}}`,
            `x_1 = ${fmtNum(sol1x)}, \\quad x_2 = ${fmtNum(sol2x)}`,
        ].join(" \\\\ ");
    }

    // Step 4: back-substitution (formato \begin{cases} con \lor)
    const step4WorkLatex = buildStep4Cases(solutions, m, n);
    const solutionSetLatex = nature === "impossible"
        ? "S = \\emptyset"
        : `S = \\left\\{ ${solutions.map(fmtPair).join(";\\; ")} \\right\\}`;

    return {
        type: "parabola",
        eq1Latex,
        eq2Latex,
        solveVar: "y",
        step1ExprLatex,
        step2WorkLatex,
        rA,
        rB,
        rC,
        risolventeLatex,
        risolventeVar: "x",
        delta,
        step3WorkLatex,
        nature,
        solutions,
        step4WorkLatex,
        solutionSetLatex,
        linM: m,
        linN: n,
    };
}

function generateHyperbola(): SystemDef {
    // {xy = k, ax + y = c} → y = c - ax → x(c-ax)=k → ax²-cx+k=0
    const wantImpossible = Math.random() < 0.15;
    const aLin = randomChoice([1, 1, 1, 2]);
    let kFinal: number, cFinal: number;
    let rA: number, rB: number, rC: number;
    let solutions: Solution[] = [];
    let nature: NatureType;

    if (wantImpossible) {
        rA = aLin;
        cFinal = randomInt(-4, 4);
        rB = -cFinal;
        rC = Math.floor(cFinal * cFinal / (4 * aLin)) + randomInt(1, 3);
        kFinal = rC;
        nature = "impossible";
    } else {
        const x1 = randomNonZero(-4, 4);
        let x2 = randomNonZero(-4, 4);
        while (x2 === x1) x2 = randomNonZero(-4, 4);
        cFinal = aLin * (x1 + x2);
        kFinal = aLin * x1 * x2;
        rA = aLin;
        rB = -cFinal;
        rC = kFinal;
        const y1 = cFinal - aLin * x1;
        const y2 = cFinal - aLin * x2;
        const s1x = Math.min(x1, x2);
        const s2x = Math.max(x1, x2);
        solutions = [
            { x: s1x, y: s1x === x1 ? y1 : y2 },
            { x: s2x, y: s2x === x1 ? y1 : y2 },
        ];
        nature = "distinct";
    }

    const delta = rB * rB - 4 * rA * rC;

    const eq1Latex = `xy = ${kFinal}`;
    const eq2Latex = aLin === 1 ? `x + y = ${cFinal}` : `${aLin}x + y = ${cFinal}`;
    const step1ExprLatex = aLin === 1 ? `y = ${cFinal} - x` : `y = ${cFinal} - ${aLin}x`;

    // Step 2
    const subExpr = aLin === 1 ? `${cFinal} - x` : `${cFinal} - ${aLin}x`;
    const step2WorkLatex = [
        `x \\cdot (${subExpr}) = ${kFinal}`,
        `${cFinal}x - ${aLin}x^2 = ${kFinal}`,
        `${fmtQuad(rA, rB, rC, "x")} = 0`,
    ].join(" \\\\ ");

    const risolventeLatex = `${fmtQuad(rA, rB, rC, "x")} = 0`;

    // Step 3
    let step3WorkLatex: string;
    if (delta < 0) {
        step3WorkLatex = [
            `\\Delta = (${rB})^2 - 4 \\cdot ${rA} \\cdot (${rC})`,
            `\\Delta = ${rB * rB} - ${4 * rA * rC} = ${delta}`,
            `\\Delta < 0 \\;\\Rightarrow\\; \\text{nessuna soluzione reale}`,
        ].join(" \\\\ ");
    } else {
        const sqrtD = Math.sqrt(delta);
        const sqrtStr = Number.isInteger(sqrtD) ? String(Math.round(sqrtD)) : `\\sqrt{${delta}}`;
        step3WorkLatex = [
            `\\Delta = (${rB})^2 - 4 \\cdot ${rA} \\cdot (${rC}) = ${delta}`,
            `x = \\frac{${-rB} \\pm ${sqrtStr}}{${2 * rA}}`,
            `x_1 = ${fmtNum(solutions[0].x)}, \\quad x_2 = ${fmtNum(solutions[1].x)}`,
        ].join(" \\\\ ");
    }

    // Step 4 (formato \begin{cases} con \lor)
    // y = cFinal - aLin*x → linM = -aLin, linN = cFinal
    const linM = -aLin;
    const linN = cFinal;
    const step4WorkLatex = buildStep4Cases(solutions, linM, linN);
    const solutionSetLatex = nature === "impossible"
        ? "S = \\emptyset"
        : `S = \\left\\{ ${solutions.map(fmtPair).join(";\\; ")} \\right\\}`;

    return {
        type: "hyperbola",
        eq1Latex,
        eq2Latex,
        solveVar: "y",
        step1ExprLatex,
        step2WorkLatex,
        rA, rB, rC,
        risolventeLatex,
        risolventeVar: "x",
        delta,
        step3WorkLatex,
        nature,
        solutions,
        step4WorkLatex,
        solutionSetLatex,
        linM,
        linN,
    };
}


function generateCircle(): SystemDef {
    // {x² + y² = r², y = mx + q}
    // Risolvente: (1+m²)x² + 2mqx + (q²-r²) = 0

    // Casi noti con numeri puliti:
    // m=0: x² = r²-q² → facile se r²-q² è quadrato perfetto
    // m=1, r=5: 2x² + 2qx + q²-25 = 0

    const wantImpossible = Math.random() < 0.2;

    let m: number, q: number, r2: number;
    let solutions: Solution[] = [];
    let nature: NatureType;

    if (wantImpossible) {
        // Retta troppo lontana dal cerchio
        r2 = randomChoice([4, 5, 9, 13, 25]);
        m = randomChoice([0, 1, -1]);
        // |q| > r * sqrt(1+m²) per impossibile
        const rVal = Math.sqrt(r2);
        const minQ = Math.ceil(rVal * Math.sqrt(1 + m * m)) + 1;
        q = randomChoice([minQ, -minQ]);
        nature = "impossible";
    } else {
        // Genera da soluzioni note (punti su cerchio con coordinate intere)
        // Terne pitagoriche: (3,4,5), (5,12,13), (0,r,r), (r,0,r)
        const configs = [
            { x1: 3, y1: 4, x2: -3, y2: 4, r2: 25 },
            { x1: 4, y1: 3, x2: -4, y2: 3, r2: 25 },
            { x1: 3, y1: -4, x2: -3, y2: -4, r2: 25 },
            { x1: 0, y1: 5, x2: -4, y2: 3, r2: 25 },
            { x1: 0, y1: 3, x2: -3, y2: 0, r2: 9 },
            { x1: 1, y1: 0, x2: 0, y2: 1, r2: 1 },
            { x1: 0, y1: 2, x2: 2, y2: 0, r2: 4 },
            { x1: 1, y1: 2, x2: -1, y2: 2, r2: 5 },
            { x1: 2, y1: 1, x2: -2, y2: 1, r2: 5 },
            { x1: 1, y1: -2, x2: -1, y2: -2, r2: 5 },
        ];

        const cfg = randomChoice(configs);
        r2 = cfg.r2;

        // Retta per (x1,y1) e (x2,y2)
        if (cfg.x1 === cfg.x2) {
            // retta verticale y = cost (caso speciale, usiamo m=0)
            m = 0;
            q = cfg.y1;
            solutions = [{ x: cfg.x1, y: cfg.y1 }];
            nature = "double";
        } else {
            m = (cfg.y2 - cfg.y1) / (cfg.x2 - cfg.x1);
            q = cfg.y1 - m * cfg.x1;

            if (!Number.isInteger(m) || !Number.isInteger(q)) {
                // Fallback: usa m=0
                m = 0;
                q = cfg.y1;
                const xSq = r2 - q * q;
                if (xSq > 0) {
                    const xv = Math.sqrt(xSq);
                    if (Number.isInteger(xv)) {
                        solutions = [{ x: -xv, y: q }, { x: xv, y: q }];
                        nature = "distinct";
                    } else {
                        nature = "impossible"; // fallback
                    }
                } else if (xSq === 0) {
                    solutions = [{ x: 0, y: q }];
                    nature = "double";
                } else {
                    nature = "impossible";
                }
            } else {
                const s1x = Math.min(cfg.x1, cfg.x2);
                const s2x = Math.max(cfg.x1, cfg.x2);
                solutions = [
                    { x: s1x, y: m * s1x + q },
                    { x: s2x, y: m * s2x + q },
                ];
                nature = cfg.x1 === cfg.x2 ? "double" : "distinct";
            }
        }
    }

    const rA = 1 + m * m;
    const rB = 2 * m * q;
    const rC = q * q - r2;
    const delta = rB * rB - 4 * rA * rC;

    const eq1Latex = `x^2 + y^2 = ${r2}`;
    const eq2Latex = m === 0
        ? `y = ${q}`
        : `y = ${fmtQuad(0, m, q, "x")}`;

    const step1ExprLatex = eq2Latex;

    // Step 2
    const yExpr = m === 0 ? String(q) : `${m === 1 ? "" : m === -1 ? "-" : m}x ${q >= 0 ? "+" : "-"} ${Math.abs(q)}`;
    const expandedParts: string[] = [];
    expandedParts.push(`x^2 + (${yExpr})^2 = ${r2}`);
    if (m === 0) {
        expandedParts.push(`x^2 + ${q * q} = ${r2}`);
        expandedParts.push(`x^2 = ${r2 - q * q}`);
    } else {
        expandedParts.push(`x^2 + ${m * m !== 1 ? `${m * m}` : ""}x^2 ${rB !== 0 ? `${rB > 0 ? "+" : ""}${rB}x` : ""} + ${q * q} = ${r2}`);
        expandedParts.push(`${fmtQuad(rA, rB, rC, "x")} = 0`);
    }

    const step2WorkLatex = expandedParts.join(" \\\\ ");
    const risolventeLatex = m === 0
        ? `x^2 = ${r2 - q * q}`
        : `${fmtQuad(rA, rB, rC, "x")} = 0`;

    // Step 3
    let step3WorkLatex: string;

    if (nature === "impossible") {
        if (m === 0) {
            step3WorkLatex = [
                `x^2 = ${r2 - q * q}`,
                `${r2 - q * q} < 0 \\;\\Rightarrow\\; \\text{nessuna soluzione reale}`,
            ].join(" \\\\ ");
        } else {
            step3WorkLatex = [
                `\\Delta = (${rB})^2 - 4 \\cdot ${rA} \\cdot (${rC}) = ${delta}`,
                `\\Delta < 0 \\;\\Rightarrow\\; \\text{nessuna soluzione reale}`,
            ].join(" \\\\ ");
        }
    } else if (nature === "double") {
        const s = solutions[0];
        step3WorkLatex = m === 0
            ? `x^2 = 0 \\;\\Rightarrow\\; x = ${fmtNum(s.x)}`
            : [
                `\\Delta = 0`,
                `x = ${fmtNum(s.x)}`,
            ].join(" \\\\ ");
    } else {
        if (m === 0) {
            const xv = solutions[1].x;
            step3WorkLatex = [
                `x^2 = ${r2 - q * q}`,
                `x = \\pm ${xv}`,
                `x_1 = ${fmtNum(solutions[0].x)}, \\quad x_2 = ${fmtNum(solutions[1].x)}`,
            ].join(" \\\\ ");
        } else {
            const sqrtD = Math.sqrt(delta);
            const sqrtStr = Number.isInteger(sqrtD) ? String(Math.round(sqrtD)) : `\\sqrt{${delta}}`;
            step3WorkLatex = [
                `\\Delta = (${rB})^2 - 4 \\cdot ${rA} \\cdot (${rC}) = ${delta}`,
                `x = \\frac{${-rB} \\pm ${sqrtStr}}{${2 * rA}}`,
                `x_1 = ${fmtNum(solutions[0].x)}, \\quad x_2 = ${fmtNum(solutions[1].x)}`,
            ].join(" \\\\ ");
        }
    }

    // Step 4 (formato \begin{cases} con \lor)
    const step4WorkLatex = buildStep4Cases(solutions, m, q);
    const solutionSetLatex = nature === "impossible"
        ? "S = \\emptyset"
        : `S = \\left\\{ ${solutions.map(fmtPair).join(";\\; ")} \\right\\}`;

    return {
        type: "circle",
        eq1Latex,
        eq2Latex,
        solveVar: "y",
        step1ExprLatex,
        step2WorkLatex,
        rA,
        rB,
        rC,
        risolventeLatex,
        risolventeVar: "x",
        delta,
        step3WorkLatex,
        nature,
        solutions,
        step4WorkLatex,
        solutionSetLatex,
        linM: m,
        linN: q,
    };
}

// ============ GENERATORE PRINCIPALE ============

function generateSystem(): SystemDef {
    const type = randomChoice<SystemType>(["parabola", "parabola", "hyperbola", "hyperbola", "circle"]);
    switch (type) {
        case "parabola":
            return generateParabola();
        case "hyperbola":
            return generateHyperbola();
        case "circle":
            return generateCircle();
    }
}

// ============ COMPONENTE PRINCIPALE ============

export default function SistemiSecondoGradoDemo() {
    const { isMobile, isTablet } = useBreakpoint();

    const [sys, setSys] = useState<SystemDef>(() => generateSystem());
    const { currentStep, nextStep, prevStep, showAll, reset } = useStepNavigation(4);

    const isActive = (stepNumber: number) => currentStep >= stepNumber - 1;

    const handleGenerate = useCallback(() => {
        setSys(generateSystem());
        reset();
    }, [reset]);

    // Equazione in formato \begin{cases}
    const systemLatex = `\\begin{cases} ${sys.eq1Latex} \\\\ ${sys.eq2Latex} \\end{cases}`;

    const typeLabel =
        sys.type === "parabola"
            ? "Parabola + Retta"
            : sys.type === "hyperbola"
                ? "Iperbole (xy = k) + Retta"
                : "Cerchio + Retta";

    // ============ STEP CARDS ============

    const Step1 = (
        <StepCard stepNumber={1} title="Ricava la variabile" color="green" isActive={isActive(1)}>
            <CollapsibleExplanation title="Spiegazione">
                <div>
                    <p>Il primo passo è <strong>ricavare</strong> una variabile dall'equazione di <strong>primo grado</strong>.</p>
                    <p>Si sceglie la variabile che permette di evitare frazioni, solitamente <Latex>{"y"}</Latex>.</p>
                </div>
            </CollapsibleExplanation>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
                Dall'equazione di primo grado ricaviamo <strong>{sys.solveVar}</strong>:
            </div>
            <div style={{
                fontSize: isMobile ? 16 : 18,
                padding: "10px 14px",
                background: "#fff",
                borderRadius: 8,
                display: "inline-block",
                border: "1px solid #e2e8f0",
            }}>
                <Latex>{sys.step1ExprLatex}</Latex>
            </div>
        </StepCard>
    );

    const Step2 = (
        <StepCard stepNumber={2} title="Equazione risolvente" color="blue" isActive={isActive(2)} fullWidth>
            <CollapsibleExplanation title="Spiegazione">
                <div>
                    <p>Si <strong>sostituisce</strong> l'espressione trovata nell'equazione di <strong>secondo grado</strong>.</p>
                    <p>Si ottiene un'equazione in una sola incognita, detta <strong>equazione risolvente</strong>.</p>
                </div>
            </CollapsibleExplanation>
            <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: 12,
            }}>
                <div style={{ background: "#fff", borderRadius: 8, padding: 12, border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>Sostituisco nell'eq. di 2° grado:</div>
                    <div style={{ fontSize: isMobile ? 14 : 16, lineHeight: 2, overflowX: "auto" }}>
                        <Latex display>{`\\begin{aligned} ${sys.step2WorkLatex} \\end{aligned}`}</Latex>
                    </div>
                </div>

                <div style={{
                    background: "#eff6ff",
                    borderRadius: 8,
                    padding: 12,
                    border: "1px solid #bfdbfe",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                }}>
                    <div style={{ fontSize: 12, color: "#1e40af", marginBottom: 8, fontWeight: 700 }}>
                        Equazione risolvente:
                    </div>
                    <div style={{ fontSize: isMobile ? 16 : 20 }}>
                        <Latex>{sys.risolventeLatex}</Latex>
                    </div>
                </div>
            </div>
        </StepCard>
    );

    const Step3 = (
        <StepCard stepNumber={3} title="Risolvi la risolvente" color="amber" isActive={isActive(3)} fullWidth>
            <CollapsibleExplanation title="Spiegazione">
                <div>
                    <p>Si risolve l'equazione risolvente come una normale equazione di secondo grado.</p>
                    <p>Il <strong>discriminante</strong> <Latex>{"\\Delta = b^2 - 4ac"}</Latex> determina il numero di soluzioni.</p>
                </div>
            </CollapsibleExplanation>
            <div style={{ background: "#fff", borderRadius: 8, padding: 12, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: isMobile ? 14 : 16, lineHeight: 2, overflowX: "auto" }}>
                    <Latex display>{`\\begin{aligned} ${sys.step3WorkLatex} \\end{aligned}`}</Latex>
                </div>
            </div>
        </StepCard>
    );

    const Step4 = (
        <StepCard
            stepNumber={4}
            title="Soluzioni del sistema"
            color={sys.nature !== "impossible" ? "green" : "red"}
            isActive={isActive(4)}
            fullWidth
        >
            <CollapsibleExplanation title="Spiegazione">
                <div>
                    <p>Per ogni valore di <Latex>{sys.risolventeVar}</Latex> trovato, si <strong>sostituisce</strong> nell'espressione del passo 1 per trovare l'altra variabile.</p>
                    <p>Le soluzioni si scrivono come <strong>coppie ordinate</strong> (x, y).</p>
                </div>
            </CollapsibleExplanation>

            <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: 12,
            }}>
                {/* Back-substitution */}
                <div style={{ background: "#fff", borderRadius: 8, padding: 12, border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>Ricavo y dai valori di x trovati:</div>
                    <div style={{ fontSize: isMobile ? 14 : 16, lineHeight: 2, overflowX: "auto" }}>
                        <Latex display>{sys.step4WorkLatex}</Latex>
                    </div>
                </div>

                {/* Risultato */}
                <div style={{
                    background: sys.nature !== "impossible" ? "#f0fdf4" : "#fef2f2",
                    borderRadius: 8,
                    padding: 12,
                    border: `1px solid ${sys.nature !== "impossible" ? "#bbf7d0" : "#fecaca"}`,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                }}>
                    <div style={{
                        fontWeight: 700,
                        marginBottom: 10,
                        color: sys.nature !== "impossible" ? "#166534" : "#991b1b",
                        fontSize: isMobile ? 14 : 16,
                    }}>
                        {sys.nature === "impossible"
                            ? "✗ Sistema impossibile"
                            : sys.nature === "double"
                                ? "✓ Una soluzione (doppia)"
                                : "✓ Due soluzioni distinte"}
                    </div>
                    <div style={{
                        fontSize: isMobile ? 16 : 20,
                        padding: "8px 14px",
                        background: "#fff",
                        borderRadius: 8,
                        border: "1px solid #e2e8f0",
                        overflowX: "auto",
                    }}>
                        <Latex>{sys.solutionSetLatex}</Latex>
                    </div>
                    {sys.type === "parabola" && (
                        <div style={{ marginTop: 8, fontSize: 11, color: "#64748b" }}>
                            Intersezione parabola-retta
                        </div>
                    )}
                    {sys.type === "circle" && (
                        <div style={{ marginTop: 8, fontSize: 11, color: "#64748b" }}>
                            Intersezione cerchio-retta
                        </div>
                    )}
                    {sys.type === "hyperbola" && (
                        <div style={{ marginTop: 8, fontSize: 11, color: "#64748b" }}>
                            Intersezione iperbole-retta
                        </div>
                    )}
                </div>
            </div>
        </StepCard>
    );

    const MethodContent = (
        <div style={{ fontSize: 13, lineHeight: 1.7 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Metodo di sostituzione:</div>
            <ol style={{ margin: 0, paddingLeft: 20 }}>
                <li style={{ marginBottom: 4 }}>
                    <strong>Ricava</strong> <Latex>{"y"}</Latex> (o <Latex>{"x"}</Latex>) dall'equazione di <strong>primo grado</strong>
                </li>
                <li style={{ marginBottom: 4 }}>
                    <strong>Sostituisci</strong> nell'equazione di <strong>secondo grado</strong> → ottieni l'<strong>equazione risolvente</strong>
                </li>
                <li style={{ marginBottom: 4 }}>
                    <strong>Risolvi</strong> l'equazione risolvente (calcola <Latex>{"\\Delta"}</Latex>)
                </li>
                <li style={{ marginBottom: 4 }}>
                    <strong>Determina</strong> le coppie <Latex>{"(x, y)"}</Latex> sostituendo i valori trovati
                </li>
            </ol>
            <div style={{
                marginTop: 12,
                padding: 10,
                background: "#fefce8",
                borderRadius: 6,
                border: "1px solid #fde68a",
                fontSize: 12,
            }}>
                <strong>Natura del sistema:</strong> dipende dal <Latex>{"\\Delta"}</Latex> della risolvente:
                <div style={{ marginTop: 4 }}>
                    • <Latex>{"\\Delta > 0"}</Latex>: due soluzioni distinte
                    <br />
                    • <Latex>{"\\Delta = 0"}</Latex>: una soluzione doppia
                    <br />
                    • <Latex>{"\\Delta < 0"}</Latex>: sistema impossibile
                </div>
            </div>
        </div>
    );

    // ============ MOBILE ============

    if (isMobile) {
        return (
            <DemoContainer title="Sistemi 2° grado" description="Risolvi per sostituzione">
                <div style={{ marginBottom: 12 }}>
                    <GenerateButton text="Nuovo" onClick={handleGenerate} />
                </div>

                <ProblemCard label="Risolvi il sistema:">
                    <div style={{ textAlign: "center", fontSize: 18 }}>
                        <Latex display>{systemLatex}</Latex>
                    </div>
                    <div style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                        {typeLabel}
                    </div>
                </ProblemCard>

                <NavigationButtons
                    currentStep={currentStep}
                    totalSteps={4}
                    onNext={nextStep}
                    onPrev={prevStep}
                    onShowAll={showAll}
                />

                <SwipeableTabs
                    tabs={[
                        {
                            id: "steps",
                            label: "📝 Steps",
                            content: (
                                <div style={{ display: "grid", gap: 12 }}>
                                    {Step1}
                                    {Step2}
                                    {Step3}
                                    {Step4}
                                </div>
                            ),
                        },
                        {
                            id: "method",
                            label: "💡 Metodo",
                            content: (
                                <CollapsiblePanel title="Metodo di sostituzione" defaultOpen>
                                    {MethodContent}
                                </CollapsiblePanel>
                            ),
                        },
                    ]}
                    defaultTab="steps"
                />
            </DemoContainer>
        );
    }

    // ============ TABLET ============

    if (isTablet) {
        return (
            <DemoContainer title="Sistemi di Secondo Grado" description="Risolvi sistemi con il metodo di sostituzione">
                <div style={{ marginBottom: 16 }}>
                    <GenerateButton text="Nuovo sistema" onClick={handleGenerate} />
                </div>

                <ProblemCard label="Risolvi il sistema:">
                    <div style={{ textAlign: "center" }}>
                        <Latex display>{systemLatex}</Latex>
                    </div>
                    <div style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                        {typeLabel}
                    </div>
                </ProblemCard>

                <NavigationButtons
                    currentStep={currentStep}
                    totalSteps={4}
                    onNext={nextStep}
                    onPrev={prevStep}
                    onShowAll={showAll}
                />

                <ResponsiveGrid columns={{ tablet: 2 }} gap={12}>
                    {Step1}
                    <div>{/* placeholder for alignment */}</div>
                </ResponsiveGrid>

                <div style={{ marginTop: 12 }}>{Step2}</div>
                <div style={{ marginTop: 12 }}>{Step3}</div>
                <div style={{ marginTop: 12 }}>{Step4}</div>

                <div style={{ marginTop: 16 }}>
                    <CollapsiblePanel title="💡 Metodo di sostituzione" defaultOpen={false}>
                        {MethodContent}
                    </CollapsiblePanel>
                </div>
            </DemoContainer>
        );
    }

    // ============ DESKTOP ============

    return (
        <DemoContainer title="Sistemi di Secondo Grado" description="Risolvi sistemi con il metodo di sostituzione">
            <div style={{ marginBottom: 20 }}>
                <GenerateButton text="Nuovo sistema" onClick={handleGenerate} />
            </div>

            <ProblemCard label="Risolvi il sistema:">
                <div style={{ textAlign: "center" }}>
                    <Latex display>{systemLatex}</Latex>
                </div>
                <div style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                    {typeLabel}
                </div>
            </ProblemCard>

            <NavigationButtons
                currentStep={currentStep}
                totalSteps={4}
                onNext={nextStep}
                onPrev={prevStep}
                onShowAll={showAll}
            />

            <div style={{ marginTop: 12 }}>{Step1}</div>
            <div style={{ marginTop: 12 }}>{Step2}</div>
            <div style={{ marginTop: 12 }}>{Step3}</div>
            <div style={{ marginTop: 12 }}>{Step4}</div>

            <InfoBox title="📋 Metodo di sostituzione">{MethodContent}</InfoBox>
        </DemoContainer>
    );
}