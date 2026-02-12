/**
 * EquazioniGoniometricheDemo - Equazioni goniometriche elementari
 *
 * Tipi: sin x = m, cos x = m, tan x = m
 * Livelli: Elementare (sin/cos/tan x = m) | Con sostituzione (sin f(x) = m)
 *
 * Step:
 *   1. Tipo e condizioni (|m| ≤ 1 per sin/cos, sempre per tan)
 *   2. Angolo α (soluzione principale)
 *   3. Formula risolutiva generale
 *   4. Visualizzazione sulla circonferenza goniometrica
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
    CollapsiblePanel,
} from "../../components/ui";
import { ResponsiveButtonGroup } from "../../components/ui/ResponsiveButtonGroup";
import { CollapsibleExplanation } from "../../components/ui/CollapsibleExplanation";

import { randomChoice } from "../../utils/math";

// ============ TIPI ============

type FuncType = "sin" | "cos" | "tan";
type Difficulty = "elementare" | "sostituzione";

interface TrigEq {
    funcType: FuncType;
    /** Argomento: ax, con eventuale sfasamento (bNum/bDen)π */
    argA: number;        // coefficiente di x (1 = elementare)
    argBNum: number;     // numeratore della costante additiva / π
    argBDen: number;     // denominatore
    /** Valore m */
    m: number;
    mLatex: string;
    /** Soluzione */
    impossible: boolean;
    alpha: number;       // valore numerico di α (radianti)
    alphaLatex: string;  // LaTeX di α
    isNotable: boolean;  // α è un angolo notevole
    /** Se non notevole: valore approssimato */
    approx: number | null;
}

// ============ COSTANTI ============

const PI = Math.PI;
const SQRT2_2 = Math.SQRT2 / 2;
const SQRT3_2 = Math.sqrt(3) / 2;
const SQRT3_3 = Math.sqrt(3) / 3;
const SQRT3 = Math.sqrt(3);

function gcd(a: number, b: number): number {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { const t = b; b = a % b; a = t; }
    return a || 1;
}

/** Formatta una frazione di π: (num/den)π */
function fmtPiFrac(num: number, den: number): string {
    if (num === 0) return "0";
    const g = gcd(Math.abs(num), den);
    const n = num / g;
    const d = den / g;
    const sign = n < 0 ? "-" : "";
    const an = Math.abs(n);
    if (d === 1) {
        if (an === 1) return `${sign}\\pi`;
        return `${sign}${an}\\pi`;
    }
    if (an === 1) return `${sign}\\frac{\\pi}{${d}}`;
    return `${sign}\\frac{${an}\\pi}{${d}}`;
}

/** Somma due frazioni di π: (n1/d1 + n2/d2)π, restituisce [num, den] */
function addFrac(n1: number, d1: number, n2: number, d2: number): [number, number] {
    const num = n1 * d2 + n2 * d1;
    const den = d1 * d2;
    if (num === 0) return [0, 1];
    const g = gcd(Math.abs(num), den);
    return [num / g, den / g];
}

/** π - α come frazione di π. Se α = (n/d)π → (d-n)/d · π */
function piMinusFrac(n: number, d: number): [number, number] {
    return addFrac(1, 1, -n, d); // 1·π - (n/d)·π = (d - n)/d · π
}

// ============ VALORI NOTEVOLI ============

interface NotableVal {
    m: number;
    mL: string;
    /** Per sin: α in [-π/2, π/2], per cos: α in [0, π], per tan: α in (-π/2, π/2) */
    aN: number; // numeratore di α/π
    aD: number; // denominatore
}

// sin x = m → α = arcsin(m) ∈ [-π/2, π/2]
const SIN_NOTABLE: NotableVal[] = [
    { m: 0, mL: "0", aN: 0, aD: 1 },
    { m: 0.5, mL: "\\frac{1}{2}", aN: 1, aD: 6 },
    { m: SQRT2_2, mL: "\\frac{\\sqrt{2}}{2}", aN: 1, aD: 4 },
    { m: SQRT3_2, mL: "\\frac{\\sqrt{3}}{2}", aN: 1, aD: 3 },
    { m: 1, mL: "1", aN: 1, aD: 2 },
    { m: -0.5, mL: "-\\frac{1}{2}", aN: -1, aD: 6 },
    { m: -SQRT2_2, mL: "-\\frac{\\sqrt{2}}{2}", aN: -1, aD: 4 },
    { m: -SQRT3_2, mL: "-\\frac{\\sqrt{3}}{2}", aN: -1, aD: 3 },
    { m: -1, mL: "-1", aN: -1, aD: 2 },
];

// cos x = m → α = arccos(m) ∈ [0, π]
const COS_NOTABLE: NotableVal[] = [
    { m: 1, mL: "1", aN: 0, aD: 1 },
    { m: SQRT3_2, mL: "\\frac{\\sqrt{3}}{2}", aN: 1, aD: 6 },
    { m: SQRT2_2, mL: "\\frac{\\sqrt{2}}{2}", aN: 1, aD: 4 },
    { m: 0.5, mL: "\\frac{1}{2}", aN: 1, aD: 3 },
    { m: 0, mL: "0", aN: 1, aD: 2 },
    { m: -0.5, mL: "-\\frac{1}{2}", aN: 2, aD: 3 },
    { m: -SQRT2_2, mL: "-\\frac{\\sqrt{2}}{2}", aN: 3, aD: 4 },
    { m: -SQRT3_2, mL: "-\\frac{\\sqrt{3}}{2}", aN: 5, aD: 6 },
    { m: -1, mL: "-1", aN: 1, aD: 1 },
];

// tan x = m → α = arctan(m) ∈ (-π/2, π/2)
const TAN_NOTABLE: NotableVal[] = [
    { m: 0, mL: "0", aN: 0, aD: 1 },
    { m: SQRT3_3, mL: "\\frac{\\sqrt{3}}{3}", aN: 1, aD: 6 },
    { m: 1, mL: "1", aN: 1, aD: 4 },
    { m: SQRT3, mL: "\\sqrt{3}", aN: 1, aD: 3 },
    { m: -SQRT3_3, mL: "-\\frac{\\sqrt{3}}{3}", aN: -1, aD: 6 },
    { m: -1, mL: "-1", aN: -1, aD: 4 },
    { m: -SQRT3, mL: "-\\sqrt{3}", aN: -1, aD: 3 },
];

// Valori non notevoli (con arcsin/arccos/arctan)
interface NonNotableVal {
    m: number;
    mL: string;
}
const NON_NOTABLE: NonNotableVal[] = [
    { m: 1 / 3, mL: "\\frac{1}{3}" },
    { m: 1 / 4, mL: "\\frac{1}{4}" },
    { m: 2 / 3, mL: "\\frac{2}{3}" },
    { m: -1 / 3, mL: "-\\frac{1}{3}" },
    { m: -1 / 4, mL: "-\\frac{1}{4}" },
    { m: -2 / 3, mL: "-\\frac{2}{3}" },
];

const TAN_NON_NOTABLE: NonNotableVal[] = [
    { m: 2, mL: "2" },
    { m: -2, mL: "-2" },
    { m: 3, mL: "3" },
    { m: 0.5, mL: "\\frac{1}{2}" },
    { m: -0.5, mL: "-\\frac{1}{2}" },
];

// Impossibili per sin/cos
const IMPOSSIBLE_VALS: NonNotableVal[] = [
    { m: 2, mL: "2" },
    { m: -2, mL: "-2" },
    { m: 3, mL: "3" },
    { m: 1.5, mL: "\\frac{3}{2}" },
    { m: -1.5, mL: "-\\frac{3}{2}" },
];

// ============ GENERATORE ============

function generateTrigEq(funcType: FuncType, difficulty: Difficulty): TrigEq {
    const isCompound = difficulty === "sostituzione";

    // Argomento composto: ax oppure x ± (b/d)π
    let argA = 1;
    let argBNum = 0;
    let argBDen = 1;

    if (isCompound) {
        const compoundType = Math.random();
        if (compoundType < 0.5) {
            // ax: coefficiente 2 o 3
            argA = randomChoice([2, 3]);
        } else {
            // x ± fase
            const phases: [number, number][] = [[1, 6], [1, 4], [1, 3], [1, 2], [-1, 6], [-1, 4], [-1, 3]];
            const [bn, bd] = randomChoice(phases);
            argBNum = bn;
            argBDen = bd;
        }
    }

    // ~10% probabilità di equazione impossibile (solo sin/cos)
    if (funcType !== "tan" && Math.random() < 0.1) {
        const imp = randomChoice(IMPOSSIBLE_VALS);
        return {
            funcType, argA, argBNum, argBDen,
            m: imp.m, mLatex: imp.mL,
            impossible: true, alpha: 0, alphaLatex: "", isNotable: false, approx: null,
        };
    }

    // ~20% probabilità di valore non notevole (per elementare)
    if (!isCompound && Math.random() < 0.2) {
        if (funcType === "tan") {
            const nn = randomChoice(TAN_NON_NOTABLE);
            const alpha = Math.atan(nn.m);
            const funcName = "\\arctan";
            return {
                funcType, argA, argBNum, argBDen,
                m: nn.m, mLatex: nn.mL,
                impossible: false, alpha,
                alphaLatex: `${funcName} ${nn.mL}`,
                isNotable: false, approx: alpha,
            };
        } else {
            const nn = randomChoice(NON_NOTABLE);
            const funcName = funcType === "sin" ? "\\arcsin" : "\\arccos";
            const alpha = funcType === "sin" ? Math.asin(nn.m) : Math.acos(nn.m);
            return {
                funcType, argA, argBNum, argBDen,
                m: nn.m, mLatex: nn.mL,
                impossible: false, alpha,
                alphaLatex: `${funcName} ${nn.mL}`,
                isNotable: false, approx: alpha,
            };
        }
    }

    // Valore notevole
    const pool = funcType === "sin" ? SIN_NOTABLE : funcType === "cos" ? COS_NOTABLE : TAN_NOTABLE;
    const val = randomChoice(pool);

    return {
        funcType, argA, argBNum, argBDen,
        m: val.m, mLatex: val.mL,
        impossible: false,
        alpha: (val.aN / val.aD) * PI,
        alphaLatex: fmtPiFrac(val.aN, val.aD),
        isNotable: true, approx: null,
    };
}

// ============ COSTRUZIONE LATEX ============

function buildEquationLatex(eq: TrigEq): string {
    const func = `\\${eq.funcType}`;
    const arg = buildArgLatex(eq);
    return `${func} ${arg} = ${eq.mLatex}`;
}

function buildArgLatex(eq: TrigEq): string {
    if (eq.argA === 1 && eq.argBNum === 0) return "x";
    if (eq.argBNum === 0) return `${eq.argA}x`;
    const phase = fmtPiFrac(eq.argBNum, eq.argBDen);
    if (eq.argA === 1) {
        return eq.argBNum > 0
            ? `\\left(x + ${phase}\\right)`
            : `\\left(x - ${fmtPiFrac(-eq.argBNum, eq.argBDen)}\\right)`;
    }
    return eq.argBNum > 0
        ? `\\left(${eq.argA}x + ${phase}\\right)`
        : `\\left(${eq.argA}x - ${fmtPiFrac(-eq.argBNum, eq.argBDen)}\\right)`;
}

function buildArgLetterLatex(eq: TrigEq): string {
    // "t" per sostituzione, "x" per elementare
    return (eq.argA !== 1 || eq.argBNum !== 0) ? "t" : "x";
}

/** Soluzione generale: restituisce le due famiglie (o una se caso speciale) */
function buildSolutionSteps(eq: TrigEq): {
    step1Latex: string;    // tipo e condizioni
    step2Latex: string;    // angolo α
    step3Latex: string;    // formula risolutiva in t (o x)
    step4Latex: string;    // soluzioni finali in x
    formulaRef: string;    // riferimento formula [3.x]
    hasSubstitution: boolean;
    substLatex: string;    // sostituzione t = ...
} {
    const t = buildArgLetterLatex(eq);
    const hasSubst = t === "t";
    const func = `\\${eq.funcType}`;
    const argDesc = hasSubst ? buildArgLatex(eq).replace("x", "x") : "x";

    let substLatex = "";
    if (hasSubst) {
        substLatex = `t = ${argDesc.replace(/\\left\(|\\right\)/g, "")}`;
    }

    // Step 1: tipo e condizioni
    let step1Latex: string;
    if (eq.funcType === "tan") {
        step1Latex = `\\text{Equazione del tipo } \\tan ${t} = m \\text{ con } m = ${eq.mLatex}`;
        step1Latex += `\\\\[4pt] \\text{L'equazione ammette sempre soluzioni per ogni } m \\in \\mathbb{R}`;
    } else {
        step1Latex = `\\text{Equazione del tipo } ${func}\\, ${t} = m \\text{ con } m = ${eq.mLatex}`;
        if (eq.impossible) {
            step1Latex += `\\\\[4pt] |m| = ${Math.abs(eq.m)} > 1 \\Rightarrow \\textbf{equazione impossibile}`;
        } else {
            step1Latex += `\\\\[4pt] |m| = ${eq.m === 0 ? "0" : (Math.abs(eq.m) === 1 ? "1" : `|${eq.mLatex}|`)} \\leq 1 \\;\\checkmark`;
        }
    }

    if (eq.impossible) {
        return {
            step1Latex, step2Latex: "", step3Latex: "",
            step4Latex: "\\text{Nessuna soluzione: } S = \\emptyset",
            formulaRef: "", hasSubstitution: hasSubst, substLatex,
        };
    }

    // Step 2: angolo α
    let step2Latex: string;
    const alphaL = eq.alphaLatex;
    if (eq.funcType === "sin") {
        step2Latex = `\\alpha = \\arcsin\\left(${eq.mLatex}\\right) = ${alphaL}`;
        if (!eq.isNotable && eq.approx !== null) {
            step2Latex += ` \\approx ${eq.approx.toFixed(4)} \\text{ rad}`;
        }
    } else if (eq.funcType === "cos") {
        step2Latex = `\\alpha = \\arccos\\left(${eq.mLatex}\\right) = ${alphaL}`;
        if (!eq.isNotable && eq.approx !== null) {
            step2Latex += ` \\approx ${eq.approx.toFixed(4)} \\text{ rad}`;
        }
    } else {
        step2Latex = `\\alpha = \\arctan\\left(${eq.mLatex}\\right) = ${alphaL}`;
        if (!eq.isNotable && eq.approx !== null) {
            step2Latex += ` \\approx ${eq.approx.toFixed(4)} \\text{ rad}`;
        }
    }

    // Step 3: formula risolutiva
    let step3Latex: string;
    let formulaRef: string;

    if (eq.funcType === "sin") {
        formulaRef = "[3.2]";
        // Casi speciali sin
        if (eq.m === 0) {
            step3Latex = `${t} = k\\pi, \\quad k \\in \\mathbb{Z}`;
        } else if (eq.m === 1) {
            step3Latex = `${t} = \\frac{\\pi}{2} + 2k\\pi, \\quad k \\in \\mathbb{Z}`;
        } else if (eq.m === -1) {
            step3Latex = `${t} = -\\frac{\\pi}{2} + 2k\\pi, \\quad k \\in \\mathbb{Z}`;
        } else {
            // Caso generale: t = α + 2kπ ∨ t = π - α + 2kπ
            const piMinusAlpha = eq.isNotable
                ? (() => {
                    // Cerchiamo aN, aD dall'alpha
                    const pool = SIN_NOTABLE.find(v => Math.abs(v.m - eq.m) < 1e-9);
                    if (pool) {
                        const [pn, pd] = piMinusFrac(pool.aN, pool.aD);
                        return fmtPiFrac(pn, pd);
                    }
                    return `\\pi - ${alphaL}`;
                })()
                : `\\pi - ${alphaL}`;

            step3Latex = `${t} = ${alphaL} + 2k\\pi \\;\\lor\\; ${t} = ${piMinusAlpha} + 2k\\pi, \\quad k \\in \\mathbb{Z}`;
        }
    } else if (eq.funcType === "cos") {
        formulaRef = "[3.4]";
        // Casi speciali cos
        if (eq.m === 1) {
            step3Latex = `${t} = 2k\\pi, \\quad k \\in \\mathbb{Z}`;
        } else if (eq.m === -1) {
            step3Latex = `${t} = \\pi + 2k\\pi, \\quad k \\in \\mathbb{Z}`;
        } else if (eq.m === 0) {
            step3Latex = `${t} = \\frac{\\pi}{2} + k\\pi, \\quad k \\in \\mathbb{Z}`;
        } else {
            // Caso generale: t = ±α + 2kπ
            step3Latex = `${t} = \\pm ${eq.isNotable ? alphaL : `\\left(${alphaL}\\right)`} + 2k\\pi, \\quad k \\in \\mathbb{Z}`;
        }
    } else {
        formulaRef = "[3.6]";
        // tan: sempre t = α + kπ
        if (eq.m === 0) {
            step3Latex = `${t} = k\\pi, \\quad k \\in \\mathbb{Z}`;
        } else {
            step3Latex = `${t} = ${alphaL} + k\\pi, \\quad k \\in \\mathbb{Z}`;
        }
    }

    // Step 4: se c'è sostituzione, risolvi per x
    let step4Latex: string;

    if (!hasSubst) {
        step4Latex = step3Latex.replace(new RegExp(`\\b${t}\\b`, "g"), "x");
        // Già espresso in x
    } else {
        // Risolvi t = argA·x + (bNum/bDen)π per x
        step4Latex = buildBackSubstitution(eq, step3Latex);
    }

    return { step1Latex, step2Latex, step3Latex, step4Latex, formulaRef, hasSubstitution: hasSubst, substLatex };
}

function buildBackSubstitution(eq: TrigEq, tSolutionLatex: string): string {
    // Parsing semplificato: genera le soluzioni in x da quelle in t
    // t = argA·x + (bNum/bDen)π → x = (t - phase) / argA

    const a = eq.argA;
    const bN = eq.argBNum;
    const bD = eq.argBDen;

    // Per semplicità mostriamo il passaggio diretto
    const tExpr = buildArgLatex(eq).replace(/\\left\(|\\right\)/g, "");

    let lines = `\\text{Sostituendo } t = ${tExpr} \\text{:}\\\\[6pt]`;

    // Genera le soluzioni per ciascuna famiglia
    // Questo è complesso in generale; mostriamo la formula e il risultato
    if (eq.funcType === "sin") {
        if (eq.m === 0) {
            lines += buildXFromT(a, bN, bD, 0, 1, 1, 1); // t = kπ → period π
        } else if (Math.abs(eq.m) === 1) {
            const pool = SIN_NOTABLE.find(v => Math.abs(v.m - eq.m) < 1e-9)!;
            lines += buildXFromT(a, bN, bD, pool.aN, pool.aD, 2, 1); // t = α + 2kπ
        } else {
            const pool = SIN_NOTABLE.find(v => Math.abs(v.m - eq.m) < 1e-9);
            if (pool) {
                const [pn, pd] = piMinusFrac(pool.aN, pool.aD);
                lines += buildXFromT(a, bN, bD, pool.aN, pool.aD, 2, 1);
                lines += `\\\\[4pt] `;
                lines += buildXFromT(a, bN, bD, pn, pd, 2, 1);
            } else {
                // Non notevole
                lines += `x = \\frac{${eq.alphaLatex} - ${fmtPiFrac(bN, bD)}}{${a}} + \\frac{2k\\pi}{${a}}`;
                lines += ` \\;\\lor\\; x = \\frac{\\pi - ${eq.alphaLatex} - ${fmtPiFrac(bN, bD)}}{${a}} + \\frac{2k\\pi}{${a}}`;
            }
        }
    } else if (eq.funcType === "cos") {
        if (eq.m === 1) {
            lines += buildXFromT(a, bN, bD, 0, 1, 2, 1);
        } else if (eq.m === -1) {
            lines += buildXFromT(a, bN, bD, 1, 1, 2, 1);
        } else if (eq.m === 0) {
            lines += buildXFromT(a, bN, bD, 1, 2, 1, 1);
        } else {
            const pool = COS_NOTABLE.find(v => Math.abs(v.m - eq.m) < 1e-9);
            if (pool) {
                lines += buildXFromT(a, bN, bD, pool.aN, pool.aD, 2, 1);
                lines += `\\\\[4pt] `;
                lines += buildXFromT(a, bN, bD, -pool.aN, pool.aD, 2, 1);
            } else {
                lines += `x = \\frac{\\pm\\left(${eq.alphaLatex}\\right) - ${fmtPiFrac(bN, bD)}}{${a}} + \\frac{2k\\pi}{${a}}`;
            }
        }
    } else {
        // tan
        if (eq.m === 0) {
            lines += buildXFromT(a, bN, bD, 0, 1, 1, 1);
        } else {
            const pool = TAN_NOTABLE.find(v => Math.abs(v.m - eq.m) < 1e-9);
            if (pool) {
                lines += buildXFromT(a, bN, bD, pool.aN, pool.aD, 1, 1);
            } else {
                lines += `x = \\frac{${eq.alphaLatex} - ${fmtPiFrac(bN, bD)}}{${a}} + \\frac{k\\pi}{${a}}`;
            }
        }
    }

    lines += `, \\quad k \\in \\mathbb{Z}`;
    return lines;
}

/**
 * Da t = (alphaN/alphaD)π + (periodN/periodD)·kπ, con t = a·x + (bN/bD)π,
 * ricava x e formatta in LaTeX.
 */
function buildXFromT(a: number, bN: number, bD: number, alphaN: number, alphaD: number, periodN: number, periodD: number): string {
    // x = ((alphaN/alphaD)π - (bN/bD)π) / a + (periodN / periodD)·kπ / a
    // = ((alphaN/alphaD - bN/bD) / a)π + (periodN / (periodD·a))·kπ

    const [numN, numD] = addFrac(alphaN, alphaD, -bN, bD);
    // xConst = (numN / numD) / a = numN / (numD · a)
    const xConstN = numN;
    const xConstD = numD * a;
    const g1 = gcd(Math.abs(xConstN), xConstD);
    const xcn = xConstN / g1;
    const xcd = xConstD / g1;

    // xPeriod = periodN / (periodD · a)
    const xpn = periodN;
    const xpd = periodD * a;
    const g2 = gcd(xpn, xpd);
    const xPN = xpn / g2;
    const xPD = xpd / g2;

    const constPart = fmtPiFrac(xcn, xcd);
    const periodPart = xPD === 1
        ? (xPN === 1 ? "k\\pi" : `${xPN}k\\pi`)
        : (xPN === 1 ? `\\frac{k\\pi}{${xPD}}` : `\\frac{${xPN}k\\pi}{${xPD}}`);

    if (xcn === 0) {
        return `x = ${periodPart}`;
    }
    return `x = ${constPart} + ${periodPart}`;
}

// ============ CIRCONFERENZA GONIOMETRICA ============

function UnitCircle({ eq, width, height }: { eq: TrigEq; width: number; height: number }) {
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.min(width, height) * 0.36;
    const fs = width < 300 ? 10 : 12;

    if (eq.impossible) {
        // Mostra il cerchio con la linea che non interseca
        const lineVal = eq.m;
        return (
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
                <rect width={width} height={height} fill="#fafbfc" rx={8} />
                {/* Assi */}
                <line x1={20} y1={cy} x2={width - 20} y2={cy} stroke="#cbd5e1" strokeWidth={1} />
                <line x1={cx} y1={20} x2={cx} y2={height - 20} stroke="#cbd5e1" strokeWidth={1} />
                <text x={width - 16} y={cy - 6} fontSize={fs} fill="#64748b" fontStyle="italic">X</text>
                <text x={cx + 8} y={26} fontSize={fs} fill="#64748b" fontStyle="italic">Y</text>
                {/* Cerchio */}
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#334155" strokeWidth={1.5} />
                {/* Linea impossibile */}
                {eq.funcType === "sin" ? (
                    <line x1={20} y1={cy - lineVal * r} x2={width - 20} y2={cy - lineVal * r}
                          stroke="#dc2626" strokeWidth={1.5} strokeDasharray="6,4" />
                ) : (
                    <line x1={cx + lineVal * r} y1={20} x2={cx + lineVal * r} y2={height - 20}
                          stroke="#dc2626" strokeWidth={1.5} strokeDasharray="6,4" />
                )}
                <text x={cx} y={height - 8} fontSize={fs} fill="#dc2626" fontWeight={700} textAnchor="middle">
                    Nessuna intersezione
                </text>
            </svg>
        );
    }

    const alpha = eq.alpha;
    // Punti di intersezione sulla circonferenza
    let points: { x: number; y: number; angle: number; label: string }[] = [];
    let guideLine: React.ReactNode = null;

    if (eq.funcType === "sin") {
        const m = eq.m;
        const yLine = cy - m * r;
        guideLine = (
            <line x1={20} y1={yLine} x2={width - 20} y2={yLine}
                  stroke="#3b82f6" strokeWidth={1.2} strokeDasharray="5,4" opacity={0.7} />
        );

        if (m === 0) {
            points = [
                { x: cx + r, y: cy, angle: 0, label: "P_1" },
                { x: cx - r, y: cy, angle: PI, label: "P_2" },
            ];
        } else if (Math.abs(m) === 1) {
            const angle = m > 0 ? PI / 2 : -PI / 2;
            points = [{ x: cx + r * Math.cos(angle), y: cy - r * Math.sin(angle), angle, label: "P" }];
        } else {
            const a1 = alpha; // arcsin(m)
            const a2 = PI - alpha;
            points = [
                { x: cx + r * Math.cos(a1), y: cy - r * Math.sin(a1), angle: a1, label: "P_1" },
                { x: cx + r * Math.cos(a2), y: cy - r * Math.sin(a2), angle: a2, label: "P_2" },
            ];
        }
        // Label Y = m
        const labelY = Math.max(24, Math.min(height - 24, yLine));
        guideLine = (
            <>
                {guideLine}
                <text x={width - 22} y={labelY - 6} fontSize={fs - 1} fill="#3b82f6" textAnchor="end">
                    Y = {eq.mLatex.length < 5 ? eq.mLatex.replace(/\\frac/g, '') : 'm'}
                </text>
            </>
        );
    } else if (eq.funcType === "cos") {
        const m = eq.m;
        const xLine = cx + m * r;
        guideLine = (
            <line x1={xLine} y1={20} x2={xLine} y2={height - 20}
                  stroke="#3b82f6" strokeWidth={1.2} strokeDasharray="5,4" opacity={0.7} />
        );

        if (Math.abs(m) === 1) {
            const angle = m > 0 ? 0 : PI;
            points = [{ x: cx + r * Math.cos(angle), y: cy - r * Math.sin(angle), angle, label: "P" }];
        } else if (m === 0) {
            points = [
                { x: cx, y: cy - r, angle: PI / 2, label: "P_1" },
                { x: cx, y: cy + r, angle: -PI / 2, label: "P_2" },
            ];
        } else {
            const a1 = alpha; // arccos(m)
            const a2 = -alpha;
            points = [
                { x: cx + r * Math.cos(a1), y: cy - r * Math.sin(a1), angle: a1, label: "P_1" },
                { x: cx + r * Math.cos(a2), y: cy - r * Math.sin(a2), angle: a2, label: "P_2" },
            ];
        }
        guideLine = (
            <>
                {guideLine}
                <text x={xLine + 6} y={26} fontSize={fs - 1} fill="#3b82f6">X = m</text>
            </>
        );
    } else {
        // tan: retta Y = mX passante per l'origine
        const m = eq.m;
        // Disegna la retta tagliata al rettangolo del grafico
        const ext = r * 1.6;
        const x1 = cx - ext;
        const y1 = cy + m * ext; // Y invertito per SVG
        const x2 = cx + ext;
        const y2 = cy - m * ext;

        guideLine = (
            <>
                <line x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke="#3b82f6" strokeWidth={1.2} strokeDasharray="5,4" opacity={0.7} />
                <text x={x2 - 4} y={y2 - 6} fontSize={fs - 1} fill="#3b82f6">Y = mX</text>
            </>
        );

        if (m === 0) {
            points = [
                { x: cx + r, y: cy, angle: 0, label: "P_1" },
                { x: cx - r, y: cy, angle: PI, label: "P_2" },
            ];
        } else {
            const a1 = alpha;
            const a2 = alpha + PI;
            points = [
                { x: cx + r * Math.cos(a1), y: cy - r * Math.sin(a1), angle: a1, label: "P_1" },
                { x: cx + r * Math.cos(a2), y: cy - r * Math.sin(a2), angle: a2, label: "P_2" },
            ];
        }
    }

    // Arco per l'angolo α dal punto (1,0)
    const arcRadius = r * 0.3;
    const drawArc = (startAngle: number, endAngle: number, color: string) => {
        if (Math.abs(endAngle - startAngle) < 0.01) return null;
        const sa = Math.min(startAngle, endAngle);
        const ea = Math.max(startAngle, endAngle);
        const x1 = cx + arcRadius * Math.cos(sa);
        const y1 = cy - arcRadius * Math.sin(sa);
        const x2 = cx + arcRadius * Math.cos(ea);
        const y2 = cy - arcRadius * Math.sin(ea);
        const largeArc = (ea - sa) > PI ? 1 : 0;
        return (
            <path
                d={`M ${x1} ${y1} A ${arcRadius} ${arcRadius} 0 ${largeArc} 0 ${x2} ${y2}`}
                fill="none" stroke={color} strokeWidth={1.5}
            />
        );
    };

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
            <rect width={width} height={height} fill="#fafbfc" rx={8} />

            {/* Assi */}
            <line x1={20} y1={cy} x2={width - 20} y2={cy} stroke="#cbd5e1" strokeWidth={1} />
            <line x1={cx} y1={20} x2={cx} y2={height - 20} stroke="#cbd5e1" strokeWidth={1} />
            <text x={width - 16} y={cy - 6} fontSize={fs} fill="#64748b" fontStyle="italic">X</text>
            <text x={cx + 8} y={26} fontSize={fs} fill="#64748b" fontStyle="italic">Y</text>
            <text x={cx - 10} y={cy + 14} fontSize={fs - 1} fill="#94a3b8">O</text>

            {/* Cerchio */}
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#334155" strokeWidth={1.5} />

            {/* Punti cardinali */}
            <circle cx={cx + r} cy={cy} r={2} fill="#94a3b8" />
            <circle cx={cx - r} cy={cy} r={2} fill="#94a3b8" />
            <circle cx={cx} cy={cy - r} r={2} fill="#94a3b8" />
            <circle cx={cx} cy={cy + r} r={2} fill="#94a3b8" />

            {/* Linea guida */}
            {guideLine}

            {/* Archi angolari */}
            {points.length > 0 && drawArc(0, points[0].angle, "#dc2626")}
            {points.length > 1 && points[1].angle !== points[0].angle && drawArc(0, points[1].angle, "#2563eb")}

            {/* Raggi ai punti */}
            {points.map((pt, i) => (
                <line key={`ray-${i}`} x1={cx} y1={cy} x2={pt.x} y2={pt.y}
                      stroke={i === 0 ? "#dc2626" : "#2563eb"} strokeWidth={1.5} opacity={0.6} />
            ))}

            {/* Punti di intersezione */}
            {points.map((pt, i) => (
                <g key={`pt-${i}`}>
                    <circle cx={pt.x} cy={pt.y} r={5}
                            fill={i === 0 ? "#dc2626" : "#2563eb"} stroke="#fff" strokeWidth={1.5} />
                    <text
                        x={pt.x + (pt.x > cx ? 10 : -10)}
                        y={pt.y + (pt.y > cy ? 16 : -8)}
                        fontSize={fs}
                        fill={i === 0 ? "#dc2626" : "#2563eb"}
                        fontWeight={700}
                        textAnchor={pt.x > cx ? "start" : "end"}
                        fontStyle="italic"
                    >
                        {pt.label}
                    </text>
                </g>
            ))}

            {/* Label angolo α */}
            {points.length > 0 && Math.abs(points[0].angle) > 0.05 && (
                <text
                    x={cx + arcRadius * 1.4 * Math.cos(points[0].angle / 2)}
                    y={cy - arcRadius * 1.4 * Math.sin(points[0].angle / 2)}
                    fontSize={fs - 1} fill="#dc2626" fontStyle="italic" fontWeight={600}
                    textAnchor="middle"
                >
                    α
                </text>
            )}
        </svg>
    );
}

// ============ ESPLORATORE TEORICO INTERATTIVO ============

function TheoryExplorer({ isMobile }: { isMobile: boolean }) {
    const [thFunc, setThFunc] = useState<FuncType>("sin");
    const [mValue, setMValue] = useState(0.5);

    const w = isMobile ? 280 : 340;
    const h = w;
    const cx = w / 2;
    const cy = h / 2;
    const r = w * 0.32;
    const fs = isMobile ? 10 : 12;

    const isSinCos = thFunc === "sin" || thFunc === "cos";
    const mMin = isSinCos ? -2 : -5;
    const mMax = isSinCos ? 2 : 5;
    const mStep = 0.05;

    // Classificazione caso
    const caseType: "impossible_low" | "impossible_high" | "boundary_neg" | "boundary_pos" | "has_solutions" | "always" = (() => {
        if (thFunc === "tan") return "always";
        if (mValue < -1) return "impossible_low";
        if (mValue > 1) return "impossible_high";
        if (Math.abs(mValue - 1) < 0.01) return "boundary_pos";
        if (Math.abs(mValue + 1) < 0.01) return "boundary_neg";
        return "has_solutions";
    })();

    const isImpossible = caseType === "impossible_low" || caseType === "impossible_high";
    const isBoundary = caseType === "boundary_pos" || caseType === "boundary_neg";

    // Punti di intersezione
    let pts: { x: number; y: number; label: string }[] = [];
    let alpha = 0;

    if (!isImpossible || thFunc === "tan") {
        if (thFunc === "sin") {
            const clampedM = Math.max(-1, Math.min(1, mValue));
            alpha = Math.asin(clampedM);
            const a1 = alpha;
            const a2 = Math.PI - alpha;
            pts.push({ x: cx + r * Math.cos(a1), y: cy - r * Math.sin(a1), label: "P₁" });
            if (!isBoundary) {
                pts.push({ x: cx + r * Math.cos(a2), y: cy - r * Math.sin(a2), label: "P₂" });
            }
        } else if (thFunc === "cos") {
            const clampedM = Math.max(-1, Math.min(1, mValue));
            alpha = Math.acos(clampedM);
            const a1 = alpha;
            const a2 = -alpha;
            pts.push({ x: cx + r * Math.cos(a1), y: cy - r * Math.sin(a1), label: "P₁" });
            if (!isBoundary) {
                pts.push({ x: cx + r * Math.cos(a2), y: cy - r * Math.sin(a2), label: "P₂" });
            }
        } else {
            alpha = Math.atan(mValue);
            const a1 = alpha;
            const a2 = alpha + Math.PI;
            pts.push({ x: cx + r * Math.cos(a1), y: cy - r * Math.sin(a1), label: "P₁" });
            pts.push({ x: cx + r * Math.cos(a2), y: cy - r * Math.sin(a2), label: "P₂" });
        }
    }

    // Colore linea guida
    const guideColor = isImpossible ? "#dc2626" : "#3b82f6";

    // SVG della circonferenza
    const CircleSVG = (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}
             style={{ display: "block", margin: "0 auto", maxWidth: w }}>
            <rect width={w} height={h} fill="#fafbfc" rx={8} />

            {/* Assi */}
            <line x1={16} y1={cy} x2={w - 16} y2={cy} stroke="#cbd5e1" strokeWidth={1} />
            <line x1={cx} y1={16} x2={cx} y2={h - 16} stroke="#cbd5e1" strokeWidth={1} />
            <text x={w - 14} y={cy - 6} fontSize={fs} fill="#64748b" fontStyle="italic">X</text>
            <text x={cx + 8} y={22} fontSize={fs} fill="#64748b" fontStyle="italic">Y</text>
            <text x={cx - 10} y={cy + 14} fontSize={fs - 1} fill="#94a3b8">O</text>

            {/* Cerchio */}
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#334155" strokeWidth={1.5} />

            {/* Linea guida */}
            {thFunc === "sin" && (
                <>
                    <line x1={16} y1={cy - mValue * r} x2={w - 16} y2={cy - mValue * r}
                          stroke={guideColor} strokeWidth={2} strokeDasharray={isImpossible ? "6,4" : "none"} />
                    <text x={w - 18} y={cy - mValue * r - 6} fontSize={fs}
                          fill={guideColor} textAnchor="end" fontWeight={600}>
                        Y = {mValue.toFixed(2)}
                    </text>
                </>
            )}
            {thFunc === "cos" && (
                <>
                    <line x1={cx + mValue * r} y1={16} x2={cx + mValue * r} y2={h - 16}
                          stroke={guideColor} strokeWidth={2} strokeDasharray={isImpossible ? "6,4" : "none"} />
                    <text x={cx + mValue * r + (mValue >= 0 ? 6 : -6)} y={22} fontSize={fs}
                          fill={guideColor} textAnchor={mValue >= 0 ? "start" : "end"} fontWeight={600}>
                        X = {mValue.toFixed(2)}
                    </text>
                </>
            )}
            {thFunc === "tan" && (() => {
                // Retta Y = mX, clippata al box
                const ext = r * 1.5;
                return (
                    <>
                        <line x1={cx - ext} y1={cy + mValue * ext}
                              x2={cx + ext} y2={cy - mValue * ext}
                              stroke={guideColor} strokeWidth={2} />
                        <text x={cx + ext - 4} y={cy - mValue * ext - 6} fontSize={fs}
                              fill={guideColor} textAnchor="end" fontWeight={600}>
                            Y = {mValue.toFixed(1)}·X
                        </text>
                    </>
                );
            })()}

            {/* Archi angolari */}
            {pts.length > 0 && !isImpossible && (() => {
                const arcR = r * 0.25;
                const arcs: React.ReactNode[] = [];
                const angles = thFunc === "sin"
                    ? [alpha, Math.PI - alpha]
                    : thFunc === "cos"
                        ? [alpha, -alpha]
                        : [alpha, alpha + Math.PI];

                const colors = ["#dc2626", "#2563eb"];
                angles.slice(0, pts.length).forEach((angle, i) => {
                    if (Math.abs(angle) < 0.02) return;
                    const sa = Math.min(0, angle);
                    const ea = Math.max(0, angle);
                    if (ea - sa < 0.02) return;
                    const x1 = cx + arcR * Math.cos(sa);
                    const y1 = cy - arcR * Math.sin(sa);
                    const x2 = cx + arcR * Math.cos(ea);
                    const y2 = cy - arcR * Math.sin(ea);
                    const large = (ea - sa) > Math.PI ? 1 : 0;
                    arcs.push(
                        <path key={`arc-${i}`}
                              d={`M ${x1} ${y1} A ${arcR} ${arcR} 0 ${large} 0 ${x2} ${y2}`}
                              fill="none" stroke={colors[i]} strokeWidth={1.5} opacity={0.7} />
                    );
                });
                return arcs;
            })()}

            {/* Raggi ai punti */}
            {pts.map((pt, i) => (
                <line key={`ray-${i}`} x1={cx} y1={cy} x2={pt.x} y2={pt.y}
                      stroke={i === 0 ? "#dc2626" : "#2563eb"} strokeWidth={1.5} opacity={0.5}
                      strokeDasharray="4,3" />
            ))}

            {/* Punti P₁, P₂ */}
            {pts.map((pt, i) => (
                <g key={`pt-${i}`}>
                    <circle cx={pt.x} cy={pt.y} r={5}
                            fill={i === 0 ? "#dc2626" : "#2563eb"} stroke="#fff" strokeWidth={1.5} />
                    <text
                        x={pt.x + (pt.x >= cx ? 10 : -10)}
                        y={pt.y + (pt.y >= cy ? 16 : -8)}
                        fontSize={fs + 1} fill={i === 0 ? "#dc2626" : "#2563eb"}
                        fontWeight={700} textAnchor={pt.x >= cx ? "start" : "end"}>
                        {pt.label}
                    </text>
                </g>
            ))}

            {/* Angolo labels */}
            {pts.length > 0 && !isImpossible && thFunc === "sin" && Math.abs(alpha) > 0.1 && (
                <>
                    <text x={cx + r * 0.2 * Math.cos(alpha / 2) + 2}
                          y={cy - r * 0.2 * Math.sin(alpha / 2)}
                          fontSize={fs - 1} fill="#dc2626" fontStyle="italic" fontWeight={600}>α</text>
                    {!isBoundary && Math.abs(Math.PI - alpha - alpha) > 0.1 && (
                        <text x={cx + r * 0.2 * Math.cos((Math.PI + alpha) / 2) - 2}
                              y={cy - r * 0.2 * Math.sin((Math.PI + alpha) / 2)}
                              fontSize={fs - 1} fill="#2563eb" fontStyle="italic" fontWeight={600}>π−α</text>
                    )}
                </>
            )}
            {pts.length > 0 && !isImpossible && thFunc === "cos" && Math.abs(alpha) > 0.1 && (
                <>
                    <text x={cx + r * 0.22 * Math.cos(alpha / 2) + 2}
                          y={cy - r * 0.22 * Math.sin(alpha / 2)}
                          fontSize={fs - 1} fill="#dc2626" fontStyle="italic" fontWeight={600}>α</text>
                    {!isBoundary && (
                        <text x={cx + r * 0.22 * Math.cos(-alpha / 2) + 2}
                              y={cy - r * 0.22 * Math.sin(-alpha / 2)}
                              fontSize={fs - 1} fill="#2563eb" fontStyle="italic" fontWeight={600}>−α</text>
                    )}
                </>
            )}
            {thFunc === "tan" && Math.abs(alpha) > 0.1 && (
                <>
                    <text x={cx + r * 0.22 * Math.cos(alpha / 2) + 2}
                          y={cy - r * 0.22 * Math.sin(alpha / 2)}
                          fontSize={fs - 1} fill="#dc2626" fontStyle="italic" fontWeight={600}>α</text>
                    <text x={cx + r * 0.22 * Math.cos(alpha / 2 + Math.PI / 2)}
                          y={cy - r * 0.22 * Math.sin(alpha / 2 + Math.PI / 2)}
                          fontSize={fs - 1} fill="#2563eb" fontStyle="italic" fontWeight={600}>π+α</text>
                </>
            )}
        </svg>
    );

    // Classificazione testuale
    const caseLabel = (() => {
        if (thFunc === "tan") return { text: "L'equazione ammette sempre soluzioni", color: "#16a34a", bg: "#f0fdf4", border: "#86efac" };
        if (isImpossible) return {
            text: `|m| = ${Math.abs(mValue).toFixed(2)} > 1 → equazione impossibile`,
            color: "#dc2626", bg: "#fef2f2", border: "#fecaca"
        };
        if (isBoundary) return {
            text: `m = ${mValue > 0 ? "1" : "−1"} → caso particolare (una sola famiglia)`,
            color: "#d97706", bg: "#fffbeb", border: "#fde68a"
        };
        return {
            text: `|m| = ${Math.abs(mValue).toFixed(2)} ≤ 1 → due famiglie di soluzioni`,
            color: "#16a34a", bg: "#f0fdf4", border: "#86efac"
        };
    })();

    // Formula risolutiva
    const formulaLatex = (() => {
        if (thFunc === "sin") {
            if (isImpossible) return "S = \\emptyset";
            if (Math.abs(mValue) < 0.01) return "x = k\\pi";
            if (Math.abs(mValue - 1) < 0.01) return "x = \\frac{\\pi}{2} + 2k\\pi";
            if (Math.abs(mValue + 1) < 0.01) return "x = -\\frac{\\pi}{2} + 2k\\pi";
            return "x = \\alpha + 2k\\pi \\;\\lor\\; x = \\pi - \\alpha + 2k\\pi";
        } else if (thFunc === "cos") {
            if (isImpossible) return "S = \\emptyset";
            if (Math.abs(mValue - 1) < 0.01) return "x = 2k\\pi";
            if (Math.abs(mValue + 1) < 0.01) return "x = \\pi + 2k\\pi";
            if (Math.abs(mValue) < 0.01) return "x = \\frac{\\pi}{2} + k\\pi";
            return "x = \\pm\\alpha + 2k\\pi";
        } else {
            if (Math.abs(mValue) < 0.01) return "x = k\\pi";
            return "x = \\alpha + k\\pi";
        }
    })();

    // Descrizione geometrica
    const geoDesc = (() => {
        if (thFunc === "sin") {
            if (isImpossible) return `La retta orizzontale Y = ${mValue.toFixed(2)} non interseca la circonferenza goniometrica.`;
            if (isBoundary) return `La retta Y = ${mValue > 0 ? "1" : "−1"} è tangente alla circonferenza: un solo punto di contatto.`;
            return `La retta Y = ${mValue.toFixed(2)} interseca la circonferenza in due punti P₁ e P₂, associati agli angoli α e π − α.`;
        } else if (thFunc === "cos") {
            if (isImpossible) return `La retta verticale X = ${mValue.toFixed(2)} non interseca la circonferenza goniometrica.`;
            if (isBoundary) return `La retta X = ${mValue > 0 ? "1" : "−1"} è tangente alla circonferenza: un solo punto di contatto.`;
            return `La retta X = ${mValue.toFixed(2)} interseca la circonferenza in due punti P₁ e P₂, associati agli angoli α e −α.`;
        } else {
            return `La retta Y = ${mValue.toFixed(1)}·X passante per l'origine interseca sempre la circonferenza in due punti P₁ e P₂, associati agli angoli α e π + α.`;
        }
    })();

    // Slider percentage per colore
    const mRange = mMax - mMin;
    const pct = ((mValue - mMin) / mRange) * 100;
    const sliderColor = isImpossible ? "#dc2626" : "#3b82f6";

    return (
        <div style={{ display: "grid", gap: 14 }}>
            {/* Selettore funzione */}
            <div>
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6, fontWeight: 600 }}>
                    Tipo di equazione:
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    {(["sin", "cos", "tan"] as FuncType[]).map(f => (
                        <button key={f} onClick={() => { setThFunc(f); if (f === "tan" && Math.abs(mValue) > 1) { /* ok, tan allows all */ } }}
                                style={{
                                    flex: 1, padding: "10px 0", borderRadius: 8,
                                    border: `2px solid ${thFunc === f ? "#3b82f6" : "#e2e8f0"}`,
                                    background: thFunc === f ? "#3b82f6" : "#fff",
                                    color: thFunc === f ? "#fff" : "#334155",
                                    fontWeight: 700, fontSize: 14, cursor: "pointer",
                                    transition: "all 0.2s ease",
                                }}>
                            {f} x = m
                        </button>
                    ))}
                </div>
            </div>

            {/* Slider m */}
            <div style={{
                padding: "14px 16px", background: "#fff", borderRadius: 10,
                border: `2px solid ${isImpossible ? "#fecaca" : "#bfdbfe"}`,
                transition: "border-color 0.3s ease",
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#334155" }}>
                        Valore di m
                    </span>
                    <span style={{
                        fontSize: 22, fontWeight: 800,
                        color: isImpossible ? "#dc2626" : "#0f172a",
                        transition: "color 0.3s ease",
                        fontVariantNumeric: "tabular-nums",
                    }}>
                        {mValue >= 0 ? "" : "−"}{Math.abs(mValue).toFixed(2)}
                    </span>
                </div>
                <input
                    type="range" min={mMin} max={mMax} step={mStep}
                    value={mValue}
                    onChange={e => setMValue(parseFloat(e.target.value))}
                    style={{
                        width: "100%", height: 8, borderRadius: 4,
                        appearance: "none",
                        background: `linear-gradient(to right, ${sliderColor} 0%, ${sliderColor} ${pct}%, #e2e8f0 ${pct}%, #e2e8f0 100%)`,
                        outline: "none", cursor: "pointer",
                    }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                    <span>{mMin}</span>
                    {isSinCos && <>
                        <span style={{ color: "#dc2626", fontWeight: 600 }}>−1</span>
                        <span style={{ color: "#16a34a", fontWeight: 600 }}>0</span>
                        <span style={{ color: "#dc2626", fontWeight: 600 }}>1</span>
                    </>}
                    <span>{mMax}</span>
                </div>
            </div>

            {/* Caso */}
            <div style={{
                padding: "10px 14px", borderRadius: 8,
                background: caseLabel.bg, border: `2px solid ${caseLabel.border}`,
                transition: "all 0.3s ease",
            }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: caseLabel.color, marginBottom: 4 }}>
                    {caseLabel.text}
                </div>
                <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
                    {geoDesc}
                </div>
            </div>

            {/* Circonferenza */}
            {CircleSVG}

            {/* Formula */}
            <div style={{
                padding: "12px 16px", background: "#eff6ff", borderRadius: 8,
                border: "1px solid #bfdbfe", textAlign: "center",
            }}>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4, fontWeight: 600 }}>FORMULA RISOLUTIVA</div>
                <div style={{ fontSize: isMobile ? 16 : 18 }}>
                    <Latex display>{formulaLatex}</Latex>
                </div>
                {!isImpossible && thFunc !== "tan" && (
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                        con <Latex>{thFunc === "sin"
                        ? `\\alpha = \\arcsin(${mValue.toFixed(2)}) \\approx ${alpha.toFixed(4)} \\text{ rad}`
                        : `\\alpha = \\arccos(${mValue.toFixed(2)}) \\approx ${alpha.toFixed(4)} \\text{ rad}`
                    }</Latex>
                    </div>
                )}
                {thFunc === "tan" && (
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                        con <Latex>{`\\alpha = \\arctan(${mValue.toFixed(2)}) \\approx ${alpha.toFixed(4)} \\text{ rad}`}</Latex>
                    </div>
                )}
            </div>

            {/* Riepilogo 3 casi (solo sin/cos) */}
            {isSinCos && (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 6, fontSize: 11, lineHeight: 1.4,
                }}>
                    <div style={{
                        padding: "8px 6px", borderRadius: 6, textAlign: "center",
                        background: caseType === "impossible_low" ? "#fef2f2" : "#f8fafc",
                        border: `2px solid ${caseType === "impossible_low" ? "#dc2626" : "#e2e8f0"}`,
                        transition: "all 0.3s ease",
                    }}>
                        <div style={{ fontWeight: 700, color: "#dc2626" }}>m &lt; −1</div>
                        <div style={{ color: "#64748b" }}>impossibile</div>
                    </div>
                    <div style={{
                        padding: "8px 6px", borderRadius: 6, textAlign: "center",
                        background: (caseType === "has_solutions" || isBoundary) ? "#f0fdf4" : "#f8fafc",
                        border: `2px solid ${(caseType === "has_solutions" || isBoundary) ? "#16a34a" : "#e2e8f0"}`,
                        transition: "all 0.3s ease",
                    }}>
                        <div style={{ fontWeight: 700, color: "#16a34a" }}>−1 ≤ m ≤ 1</div>
                        <div style={{ color: "#64748b" }}>soluzioni</div>
                    </div>
                    <div style={{
                        padding: "8px 6px", borderRadius: 6, textAlign: "center",
                        background: caseType === "impossible_high" ? "#fef2f2" : "#f8fafc",
                        border: `2px solid ${caseType === "impossible_high" ? "#dc2626" : "#e2e8f0"}`,
                        transition: "all 0.3s ease",
                    }}>
                        <div style={{ fontWeight: 700, color: "#dc2626" }}>m &gt; 1</div>
                        <div style={{ color: "#64748b" }}>impossibile</div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ============ COMPONENTE PRINCIPALE ============

export default function EquazioniGoniometricheDemo() {
    const { isMobile, isTablet } = useBreakpoint();

    const [funcType, setFuncType] = useState<FuncType>("sin");
    const [difficulty, setDifficulty] = useState<Difficulty>("elementare");
    const [eq, setEq] = useState<TrigEq>(() => generateTrigEq("sin", "elementare"));

    const { currentStep, nextStep, prevStep, showAll, reset } = useStepNavigation(4);
    const isActive = (n: number) => currentStep >= n - 1;

    const handleGenerate = useCallback(() => {
        setEq(generateTrigEq(funcType, difficulty));
        reset();
    }, [funcType, difficulty, reset]);

    const handleFuncChange = useCallback((v: string) => {
        const f = v as FuncType;
        setFuncType(f);
        setEq(generateTrigEq(f, difficulty));
        reset();
    }, [difficulty, reset]);

    const handleDifficultyChange = useCallback((v: string) => {
        const d = v as Difficulty;
        setDifficulty(d);
        setEq(generateTrigEq(funcType, d));
        reset();
    }, [funcType, reset]);

    const steps = useMemo(() => buildSolutionSteps(eq), [eq]);
    const equationLatex = useMemo(() => buildEquationLatex(eq), [eq]);

    const circleW = isMobile ? 260 : isTablet ? 300 : 320;
    const circleH = circleW;

    // ── STEP CARDS ──

    const Step1 = (
        <StepCard stepNumber={1} title="Tipo e condizioni" color="green" isActive={isActive(1)}>
            <CollapsibleExplanation title="Quando l'equazione ha soluzioni?">
                <div style={{ fontSize: 13, lineHeight: 1.7 }}>
                    {eq.funcType === "tan" ? (
                        <p>L'equazione <Latex>{"\\tan x = m"}</Latex> ammette <strong>sempre</strong> soluzioni per ogni valore di <Latex>{"m \\in \\mathbb{R}"}</Latex>, perché la tangente assume tutti i valori reali.</p>
                    ) : (
                        <>
                            <p>Poiché <Latex>{`-1 \\leq \\${eq.funcType}\\, x \\leq 1`}</Latex>, l'equazione <Latex>{`\\${eq.funcType}\\, x = m`}</Latex> ha soluzioni solo se <Latex>{"|m| \\leq 1"}</Latex>.</p>
                            <p>Se <Latex>{"|m| > 1"}</Latex>, l'equazione è <strong>impossibile</strong>.</p>
                        </>
                    )}
                </div>
            </CollapsibleExplanation>
            <div style={{
                padding: "10px 14px", background: "#fff", borderRadius: 8,
                border: "1px solid #e2e8f0", fontSize: isMobile ? 14 : 16,
            }}>
                <Latex display>{steps.step1Latex}</Latex>
            </div>
            {steps.hasSubstitution && (
                <div style={{
                    marginTop: 8, padding: "8px 12px", background: "#eff6ff", borderRadius: 6,
                    border: "1px solid #bfdbfe", fontSize: 13,
                }}>
                    <strong>Sostituzione:</strong> <Latex>{`${steps.substLatex}`}</Latex>
                    {" → "}<Latex>{`\\${eq.funcType}\\, t = ${eq.mLatex}`}</Latex>
                </div>
            )}
        </StepCard>
    );

    const Step2 = (
        <StepCard stepNumber={2} title="Angolo α" color="blue" isActive={isActive(2)}>
            {!eq.impossible ? (
                <>
                    <CollapsibleExplanation title="Come si trova α?">
                        <div style={{ fontSize: 13, lineHeight: 1.7 }}>
                            {eq.funcType === "sin" && (
                                <p><Latex>{"\\alpha"}</Latex> è la soluzione di <Latex>{"\\sin x = m"}</Latex> nell'intervallo <Latex>{"\\left[-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right]"}</Latex>, cioè <Latex>{"\\alpha = \\arcsin(m)"}</Latex>.</p>
                            )}
                            {eq.funcType === "cos" && (
                                <p><Latex>{"\\alpha"}</Latex> è la soluzione di <Latex>{"\\cos x = m"}</Latex> nell'intervallo <Latex>{"[0, \\pi]"}</Latex>, cioè <Latex>{"\\alpha = \\arccos(m)"}</Latex>.</p>
                            )}
                            {eq.funcType === "tan" && (
                                <p><Latex>{"\\alpha"}</Latex> è la soluzione di <Latex>{"\\tan x = m"}</Latex> nell'intervallo <Latex>{"\\left(-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right)"}</Latex>, cioè <Latex>{"\\alpha = \\arctan(m)"}</Latex>.</p>
                            )}
                            {!eq.isNotable && eq.approx !== null && (
                                <p>Poiché <Latex>{eq.mLatex}</Latex> non corrisponde a un angolo notevole, si lascia indicato il simbolo della funzione inversa.</p>
                            )}
                        </div>
                    </CollapsibleExplanation>
                    <div style={{
                        padding: "10px 14px", background: "#fff", borderRadius: 8,
                        border: "1px solid #e2e8f0", fontSize: isMobile ? 15 : 17,
                        textAlign: "center",
                    }}>
                        <Latex display>{steps.step2Latex}</Latex>
                    </div>
                </>
            ) : (
                <div style={{ fontSize: 14, color: "#dc2626", fontWeight: 600, padding: 12 }}>
                    Equazione impossibile: non serve calcolare α.
                </div>
            )}
        </StepCard>
    );

    const Step3 = (
        <StepCard stepNumber={3} title="Formula risolutiva" color="amber" isActive={isActive(3)}>
            {!eq.impossible ? (
                <>
                    <CollapsibleExplanation title={`Formula ${steps.formulaRef}`}>
                        <div style={{ fontSize: 13, lineHeight: 1.7 }}>
                            {eq.funcType === "sin" && (
                                <>
                                    <p><strong>Caso generale</strong> (<Latex>{"|m| < 1, m \\neq 0"}</Latex>):</p>
                                    <Latex display>{"\\sin x = m \\;\\Leftrightarrow\\; x = \\alpha + 2k\\pi \\;\\lor\\; x = \\pi - \\alpha + 2k\\pi"}</Latex>
                                    <p><strong>Casi particolari:</strong></p>
                                    <Latex display>{"\\sin x = 0 \\;\\Leftrightarrow\\; x = k\\pi"}</Latex>
                                    <Latex display>{"\\sin x = 1 \\;\\Leftrightarrow\\; x = \\frac{\\pi}{2} + 2k\\pi"}</Latex>
                                    <Latex display>{"\\sin x = -1 \\;\\Leftrightarrow\\; x = -\\frac{\\pi}{2} + 2k\\pi"}</Latex>
                                </>
                            )}
                            {eq.funcType === "cos" && (
                                <>
                                    <p><strong>Caso generale</strong> (<Latex>{"|m| < 1, m \\neq 0"}</Latex>):</p>
                                    <Latex display>{"\\cos x = m \\;\\Leftrightarrow\\; x = \\pm\\alpha + 2k\\pi"}</Latex>
                                    <p><strong>Casi particolari:</strong></p>
                                    <Latex display>{"\\cos x = 0 \\;\\Leftrightarrow\\; x = \\frac{\\pi}{2} + k\\pi"}</Latex>
                                    <Latex display>{"\\cos x = 1 \\;\\Leftrightarrow\\; x = 2k\\pi"}</Latex>
                                    <Latex display>{"\\cos x = -1 \\;\\Leftrightarrow\\; x = \\pi + 2k\\pi"}</Latex>
                                </>
                            )}
                            {eq.funcType === "tan" && (
                                <>
                                    <p><strong>Caso generale</strong>:</p>
                                    <Latex display>{"\\tan x = m \\;\\Leftrightarrow\\; x = \\alpha + k\\pi"}</Latex>
                                    <p><strong>Caso particolare:</strong></p>
                                    <Latex display>{"\\tan x = 0 \\;\\Leftrightarrow\\; x = k\\pi"}</Latex>
                                    <p>La tangente ha periodo <Latex>{"\\pi"}</Latex>, quindi basta un unico parametro <Latex>{"k"}</Latex>.</p>
                                </>
                            )}
                        </div>
                    </CollapsibleExplanation>
                    <div style={{
                        padding: "10px 14px", background: "#fff7ed", borderRadius: 8,
                        border: "1px solid #fed7aa", fontSize: isMobile ? 14 : 16,
                        textAlign: "center",
                    }}>
                        <Latex display>{steps.step3Latex}</Latex>
                    </div>
                </>
            ) : (
                <div style={{ fontSize: 14, color: "#dc2626", fontWeight: 600, padding: 12 }}>
                    Nessuna formula da applicare.
                </div>
            )}
        </StepCard>
    );

    const Step4 = (
        <StepCard stepNumber={4} title={steps.hasSubstitution ? "Soluzioni in x" : "Soluzioni"} color="purple" isActive={isActive(4)}>
            <div style={{
                padding: "12px 16px",
                background: eq.impossible ? "#fef2f2" : "#f0fdf4",
                borderRadius: 8,
                border: `2px solid ${eq.impossible ? "#fecaca" : "#86efac"}`,
                textAlign: "center",
                fontSize: isMobile ? 15 : 17,
            }}>
                <Latex display>{steps.step4Latex}</Latex>
            </div>

            {/* Circonferenza goniometrica */}
            <div style={{ marginTop: 14, display: "flex", justifyContent: "center" }}>
                <UnitCircle eq={eq} width={circleW} height={circleH} />
            </div>
        </StepCard>
    );

    // ── PANNELLO FORMULE ──

    const FormulasContent = (
        <div style={{ fontSize: 13, lineHeight: 2 }}>
            <div style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 700, color: "#1e40af", marginBottom: 4 }}>Equazione sin x = m</div>
                <Latex display>{"\\sin x = m, \\; |m| \\leq 1 \\;\\Rightarrow\\; x = \\alpha + 2k\\pi \\;\\lor\\; x = \\pi - \\alpha + 2k\\pi"}</Latex>
                <div style={{ fontSize: 11, color: "#64748b" }}>con <Latex>{"\\alpha = \\arcsin(m) \\in \\left[-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right]"}</Latex></div>
            </div>
            <div style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 700, color: "#1e40af", marginBottom: 4 }}>Equazione cos x = m</div>
                <Latex display>{"\\cos x = m, \\; |m| \\leq 1 \\;\\Rightarrow\\; x = \\pm\\alpha + 2k\\pi"}</Latex>
                <div style={{ fontSize: 11, color: "#64748b" }}>con <Latex>{"\\alpha = \\arccos(m) \\in [0, \\pi]"}</Latex></div>
            </div>
            <div>
                <div style={{ fontWeight: 700, color: "#1e40af", marginBottom: 4 }}>Equazione tan x = m</div>
                <Latex display>{"\\tan x = m, \\; m \\in \\mathbb{R} \\;\\Rightarrow\\; x = \\alpha + k\\pi"}</Latex>
                <div style={{ fontSize: 11, color: "#64748b" }}>con <Latex>{"\\alpha = \\arctan(m) \\in \\left(-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right)"}</Latex></div>
            </div>
        </div>
    );

    // ── TABELLA ANGOLI NOTEVOLI ──

    const NotableAnglesTable = (
        <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                <tr style={{ background: "#f1f5f9" }}>
                    <th style={{ padding: "6px 8px", borderBottom: "2px solid #cbd5e1", textAlign: "center" }}>
                        <Latex>{"\\alpha"}</Latex>
                    </th>
                    {["0", "\\frac{\\pi}{6}", "\\frac{\\pi}{4}", "\\frac{\\pi}{3}", "\\frac{\\pi}{2}"].map((a, i) => (
                        <th key={i} style={{ padding: "6px 8px", borderBottom: "2px solid #cbd5e1", textAlign: "center" }}>
                            <Latex>{a}</Latex>
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td style={{ padding: "6px 8px", borderBottom: "1px solid #e2e8f0", fontWeight: 700, textAlign: "center" }}>
                        <Latex>{"\\sin"}</Latex>
                    </td>
                    {["0", "\\frac{1}{2}", "\\frac{\\sqrt{2}}{2}", "\\frac{\\sqrt{3}}{2}", "1"].map((v, i) => (
                        <td key={i} style={{ padding: "6px 8px", borderBottom: "1px solid #e2e8f0", textAlign: "center" }}>
                            <Latex>{v}</Latex>
                        </td>
                    ))}
                </tr>
                <tr>
                    <td style={{ padding: "6px 8px", borderBottom: "1px solid #e2e8f0", fontWeight: 700, textAlign: "center" }}>
                        <Latex>{"\\cos"}</Latex>
                    </td>
                    {["1", "\\frac{\\sqrt{3}}{2}", "\\frac{\\sqrt{2}}{2}", "\\frac{1}{2}", "0"].map((v, i) => (
                        <td key={i} style={{ padding: "6px 8px", borderBottom: "1px solid #e2e8f0", textAlign: "center" }}>
                            <Latex>{v}</Latex>
                        </td>
                    ))}
                </tr>
                <tr>
                    <td style={{ padding: "6px 8px", fontWeight: 700, textAlign: "center" }}>
                        <Latex>{"\\tan"}</Latex>
                    </td>
                    {["0", "\\frac{\\sqrt{3}}{3}", "1", "\\sqrt{3}", "\\nexists"].map((v, i) => (
                        <td key={i} style={{ padding: "6px 8px", textAlign: "center" }}>
                            <Latex>{v}</Latex>
                        </td>
                    ))}
                </tr>
                </tbody>
            </table>
        </div>
    );

    // ── LAYOUT ──

    // Contenuto tab ESERCIZI
    const ExercisesContent = (
        <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <ResponsiveButtonGroup
                    options={[
                        { label: isMobile ? "sin" : "sin x = m", value: "sin" },
                        { label: isMobile ? "cos" : "cos x = m", value: "cos" },
                        { label: isMobile ? "tan" : "tan x = m", value: "tan" },
                    ]}
                    selectedValue={funcType}
                    onChange={handleFuncChange}
                />
                <ResponsiveButtonGroup
                    options={[
                        { label: "Elementare", value: "elementare" },
                        { label: isMobile ? "Sostituzione" : "Con sostituzione", value: "sostituzione" },
                    ]}
                    selectedValue={difficulty}
                    onChange={handleDifficultyChange}
                />
            </div>

            <GenerateButton text={isMobile ? "Nuova" : "Nuova equazione"} onClick={handleGenerate} />

            <ProblemCard label={isMobile ? "Risolvi:" : "Risolvi l'equazione:"}>
                <div style={{ textAlign: "center", fontSize: isMobile ? 18 : 20 }}>
                    <Latex display>{equationLatex}</Latex>
                </div>
                {steps.hasSubstitution && (
                    <div style={{ textAlign: "center", fontSize: 12, color: "#64748b", marginTop: 4 }}>
                        Equazione con argomento composto → sostituzione
                    </div>
                )}
            </ProblemCard>

            <NavigationButtons currentStep={currentStep} totalSteps={4} onNext={nextStep} onPrev={prevStep} onShowAll={showAll} />

            {isMobile ? (
                <>
                    {Step1}{Step2}{Step3}{Step4}
                </>
            ) : (
                <>
                    <ResponsiveGrid columns={{ tablet: 2, desktop: 2 }} gap={12}>
                        {Step1}
                        {Step2}
                    </ResponsiveGrid>
                    <div>{Step3}</div>
                    <div>{Step4}</div>
                </>
            )}
        </div>
    );

    // Contenuto tab TEORIA
    const TheoryContent = (
        <div style={{ display: "grid", gap: 14 }}>
            <TheoryExplorer isMobile={isMobile} />

            {isMobile ? (
                <>
                    <CollapsiblePanel title="📐 Formule risolutive" defaultOpen={false}>
                        {FormulasContent}
                    </CollapsiblePanel>
                    <CollapsiblePanel title="📊 Angoli notevoli" defaultOpen={false}>
                        {NotableAnglesTable}
                    </CollapsiblePanel>
                </>
            ) : (
                <ResponsiveGrid columns={{ tablet: 2, desktop: 2 }} gap={12}>
                    <InfoBox title="📐 Formule risolutive">{FormulasContent}</InfoBox>
                    <InfoBox title="📊 Angoli notevoli">{NotableAnglesTable}</InfoBox>
                </ResponsiveGrid>
            )}
        </div>
    );

    // Tab top-level style
    const [activeTab, setActiveTab] = useState<"teoria" | "esercizi">("teoria");

    const tabStyle = (tab: "teoria" | "esercizi") => ({
        flex: 1,
        padding: isMobile ? "12px 0" : "14px 0",
        fontSize: isMobile ? 15 : 16,
        fontWeight: 700 as const,
        border: "none",
        borderBottom: `3px solid ${activeTab === tab ? "#3b82f6" : "transparent"}`,
        background: activeTab === tab ? "#eff6ff" : "transparent",
        color: activeTab === tab ? "#1e40af" : "#64748b",
        cursor: "pointer" as const,
        transition: "all 0.2s ease",
        borderRadius: "8px 8px 0 0",
    });

    return (
        <DemoContainer
            title="Equazioni goniometriche elementari"
            description={isMobile ? "sin x = m, cos x = m, tan x = m" : "Risolvi equazioni del tipo sin x = m, cos x = m, tan x = m"}
        >
            {/* Tab selector */}
            <div style={{
                display: "flex", gap: 0, marginBottom: 16,
                borderBottom: "2px solid #e2e8f0",
            }}>
                <button style={tabStyle("teoria")} onClick={() => setActiveTab("teoria")}>
                    📖 Teoria
                </button>
                <button style={tabStyle("esercizi")} onClick={() => setActiveTab("esercizi")}>
                    ✏️ Esercizi
                </button>
            </div>

            {activeTab === "teoria" ? TheoryContent : ExercisesContent}
        </DemoContainer>
    );
}