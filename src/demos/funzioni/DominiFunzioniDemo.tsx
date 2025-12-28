import React, { useState, useMemo, useCallback } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

// ============ COMPONENTE LATEX ============

function Latex({ children, display = false }: { children: string; display?: boolean }) {
    const html = useMemo(() => {
        try {
            return katex.renderToString(children, {
                throwOnError: false,
                displayMode: display,
            });
        } catch (e) {
            return children;
        }
    }, [children, display]);

    return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

// ============ TIPI ============

type FunctionType =
    | "razionale"
    | "radice"
    | "logaritmo"
    | "esponenziale"
    | "razionale-radice"
    | "logaritmo-radice"
    | "razionale-logaritmo";

type Difficulty = "base" | "intermedio" | "avanzato";

type Condition = {
    type: "diverso" | "maggiore" | "maggioreuguale" | "minore" | "minoreuguale";
    expression: string;
    solutions: Solution[];
};

type ConditionDef = {
    description: string;
    condition: string;
    conditionLatex?: string;
    resolution: string[];
    solution: Solution;
};

type Solution = {
    type: "interval" | "point-excluded" | "all" | "none";
    left?: number;
    right?: number;
    leftOpen?: boolean;
    rightOpen?: boolean;
    excludedPoints?: number[];
};

type FunctionDef = {
    expression: string;
    latex: string;
    type: FunctionType;
    conditions: ConditionDef[];
    domain: Solution;
    domainText: string;
    domainInterval: string;
};

// ============ UTILITÀ ============

function randomInt(min: number, max: number): number {
    return min + Math.floor(Math.random() * (max - min + 1));
}

function randomNonZero(min: number, max: number): number {
    let n = 0;
    while (n === 0) {
        n = randomInt(min, max);
    }
    return n;
}

function formatNumber(n: number): string {
    if (Number.isInteger(n)) return n.toString();
    // Gestione frazioni semplici
    const fractions: { [key: number]: string } = {
        0.5: "1/2",
        [-0.5]: "-1/2",
        0.25: "1/4",
        [-0.25]: "-1/4",
        0.75: "3/4",
        [-0.75]: "-3/4",
        [1 / 3]: "1/3",
        [-1 / 3]: "-1/3",
        [2 / 3]: "2/3",
        [-2 / 3]: "-2/3",
    };
    if (fractions[n]) return fractions[n];
    return n.toFixed(2).replace(/\.?0+$/, "");
}

/**
 * ✅ FIX FRAZIONI:
 * - niente più scaling fisso a /1000
 * - trasformiamo num/den (anche decimali) in interi equivalenti
 * - semplifichiamo con MCD su interi
 */

function gcdInt(a: number, b: number): number {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
        const t = a % b;
        a = b;
        b = t;
    }
    return a;
}

// quante cifre decimali “reali” ha un numero (gestisce anche notazione scientifica)
function decimalPlaces(n: number): number {
    if (!Number.isFinite(n)) return 0;
    const s = n.toString();
    if (s.includes("e-")) {
        const [base, exp] = s.split("e-");
        const e = parseInt(exp, 10);
        const dp = (base.split(".")[1] || "").length;
        return e + dp;
    }
    const parts = s.split(".");
    return parts.length === 2 ? parts[1].length : 0;
}

// Trasforma (num/den) in una frazione ridotta con num,den interi
function toFraction(num: number, den: number): { num: number; den: number } {
    if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) return { num: 0, den: 1 };

    // porta il segno sul numeratore
    const sign = (num < 0) !== (den < 0) ? -1 : 1;
    num = Math.abs(num);
    den = Math.abs(den);

    // scala per eliminare i decimali (se presenti)
    const k = Math.max(decimalPlaces(num), decimalPlaces(den));
    const scale = Math.pow(10, k);

    const nInt = Math.round(num * scale);
    const dInt = Math.round(den * scale);

    const g = gcdInt(nInt, dInt) || 1;
    return { num: sign * (nInt / g), den: dInt / g };
}

function formatFractionLatex(num: number, den: number): string {
    if (den === 0) return "\\text{indefinito}";
    if (num === 0) return "0";

    const frac = toFraction(num, den);

    // se viene un intero
    if (frac.den === 1) return `${frac.num}`;

    const sign = frac.num < 0 ? "-" : "";
    return `${sign}\\frac{${Math.abs(frac.num)}}{${Math.abs(frac.den)}}`;
}

function formatNumberLatex(n: number): string {
    if (Number.isInteger(n)) return n.toString();

    // Prova a trovare una frazione semplice
    for (let den = 2; den <= 10; den++) {
        const num = n * den;
        if (Math.abs(num - Math.round(num)) < 0.0001) {
            return formatFractionLatex(Math.round(num), den);
        }
    }

    return n.toFixed(2).replace(/\.?0+$/, "");
}

function formatCoeff(n: number, showPlus: boolean = false): string {
    if (n === 1) return showPlus ? "+ " : "";
    if (n === -1) return "− ";
    if (n > 0) return showPlus ? `+ ${n}` : `${n}`;
    return `− ${Math.abs(n)}`;
}

function formatLinear(a: number, b: number): string {
    let result = "";
    if (a === 1) result = "x";
    else if (a === -1) result = "-x";
    else result = `${a}x`;

    if (b > 0) result += ` + ${b}`;
    else if (b < 0) result += ` - ${Math.abs(b)}`;

    return result;
}

function formatLinearLatex(a: number, b: number): string {
    let result = "";
    if (a === 1) result = "x";
    else if (a === -1) result = "-x";
    else result = `${a}x`;

    if (b > 0) result += ` + ${b}`;
    else if (b < 0) result += ` - ${Math.abs(b)}`;

    return result;
}

function solutionToText(sol: Solution): string {
    if (sol.type === "all") return "ℝ";
    if (sol.type === "none") return "∅";

    if (sol.type === "point-excluded" && sol.excludedPoints) {
        const points = sol.excludedPoints.map((p) => formatNumber(p)).join(", ");
        return `ℝ \\ {${points}}`;
    }

    if (sol.type === "interval") {
        const { left, right, leftOpen, rightOpen } = sol;

        if (left === -Infinity && right === Infinity) {
            return "ℝ";
        }

        if (left === -Infinity) {
            const bracket = rightOpen ? ")" : "]";
            return `(−∞, ${formatNumber(right!)}${bracket}`;
        }

        if (right === Infinity) {
            const bracket = leftOpen ? "(" : "[";
            return `${bracket}${formatNumber(left!)}, +∞)`;
        }

        const leftBracket = leftOpen ? "(" : "[";
        const rightBracket = rightOpen ? ")" : "]";
        return `${leftBracket}${formatNumber(left!)}, ${formatNumber(right!)}${rightBracket}`;
    }

    return "";
}

function solutionToAlgebraic(sol: Solution): string {
    if (sol.type === "all") return "∀x ∈ ℝ";
    if (sol.type === "none") return "nessuna soluzione";

    if (sol.type === "point-excluded" && sol.excludedPoints) {
        const points = sol.excludedPoints.map((p) => `x ≠ ${formatNumber(p)}`).join(" e ");
        return points;
    }

    if (sol.type === "interval") {
        const { left, right, leftOpen, rightOpen } = sol;

        if (left === -Infinity && right === Infinity) {
            return "∀x ∈ ℝ";
        }

        if (left === -Infinity) {
            return `x ${rightOpen ? "<" : "≤"} ${formatNumber(right!)}`;
        }

        if (right === Infinity) {
            return `x ${leftOpen ? ">" : "≥"} ${formatNumber(left!)}`;
        }

        const leftSign = leftOpen ? "<" : "≤";
        const rightSign = rightOpen ? "<" : "≤";
        return `${formatNumber(left!)} ${leftSign} x ${rightSign} ${formatNumber(right!)}`;
    }

    return "";
}

// ============ GENERATORI DI FUNZIONI ============

function generateRazionale(difficulty: Difficulty): FunctionDef {
    const a = randomNonZero(-5, 5);
    const b = randomInt(-10, 10);
    const root = -b / a;
    const rootLatex = formatFractionLatex(-b, a);

    let numerator = "1";
    let numeratorLatex = "1";
    if (difficulty !== "base") {
        const c = randomNonZero(-3, 3);
        const d = randomInt(-5, 5);
        numerator = formatLinear(c, d);
        numeratorLatex = formatLinearLatex(c, d);
    }

    const denominator = formatLinear(a, b);
    const denominatorLatex = formatLinearLatex(a, b);

    return {
        expression: `(${numerator}) / (${denominator})`,
        latex: `\\frac{${numeratorLatex}}{${denominatorLatex}}`,
        type: "razionale",
        conditions: [
            {
                description: "Funzione razionale fratta: il denominatore deve essere diverso da zero",
                condition: `${denominator} ≠ 0`,
                conditionLatex: `${denominatorLatex} \\neq 0`,
                resolution: [`${formatLinearLatex(a, b)} \\neq 0`, `${a}x \\neq ${-b}`, `x \\neq ${rootLatex}`],
                solution: {
                    type: "point-excluded",
                    excludedPoints: [root],
                },
            },
        ],
        domain: {
            type: "point-excluded",
            excludedPoints: [root],
        },
        domainText: `\\left\\{ x \\in \\mathbb{R} : x \\neq ${rootLatex} \\right\\}`,
        domainInterval: `\\mathbb{R} \\setminus \\left\\{${rootLatex}\\right\\}`,
    };
}

function generateRadice(difficulty: Difficulty): FunctionDef {
    const a = randomNonZero(-5, 5);
    const b = randomInt(-10, 10);
    const root = -b / a;
    const rootLatex = formatFractionLatex(-b, a);

    const radicando = formatLinear(a, b);
    const radicandoLatex = formatLinearLatex(a, b);

    // Per radice pari: radicando ≥ 0
    const solution: Solution =
        a > 0
            ? { type: "interval", left: root, right: Infinity, leftOpen: false, rightOpen: true }
            : { type: "interval", left: -Infinity, right: root, leftOpen: true, rightOpen: false };

    const domainCondition = a > 0 ? `x \\geq ${rootLatex}` : `x \\leq ${rootLatex}`;
    const domainText = `\\left\\{ x \\in \\mathbb{R} : ${domainCondition} \\right\\}`;
    const domainInterval =
        a > 0 ? `\\left[${rootLatex}, +\\infty\\right)` : `\\left(-\\infty, ${rootLatex}\\right]`;

    return {
        expression: `√(${radicando})`,
        latex: `\\sqrt{${radicandoLatex}}`,
        type: "radice",
        conditions: [
            {
                description: "Radice quadrata (indice pari): il radicando deve essere maggiore o uguale a zero",
                condition: `${radicando} ≥ 0`,
                conditionLatex: `${radicandoLatex} \\geq 0`,
                resolution: [
                    `${radicandoLatex} \\geq 0`,
                    `${a}x \\geq ${-b}`,
                    a > 0 ? `x \\geq ${rootLatex}` : `x \\leq ${rootLatex} \\text{ (cambio verso)}`,
                ],
                solution,
            },
        ],
        domain: solution,
        domainText,
        domainInterval,
    };
}

function generateLogaritmo(difficulty: Difficulty): FunctionDef {
    const a = randomNonZero(-5, 5);
    const b = randomInt(-10, 10);
    const root = -b / a;
    const rootLatex = formatFractionLatex(-b, a);

    const argomento = formatLinear(a, b);
    const argomentoLatex = formatLinearLatex(a, b);

    // Per logaritmo: argomento > 0
    const solution: Solution =
        a > 0
            ? { type: "interval", left: root, right: Infinity, leftOpen: true, rightOpen: true }
            : { type: "interval", left: -Infinity, right: root, leftOpen: true, rightOpen: true };

    const base = difficulty === "base" ? 0 : randomInt(2, 5);
    const logSymbol = base ? `\\log_{${base}}` : `\\ln`;

    const domainCondition = a > 0 ? `x > ${rootLatex}` : `x < ${rootLatex}`;
    const domainText = `\\left\\{ x \\in \\mathbb{R} : ${domainCondition} \\right\\}`;
    const domainInterval =
        a > 0 ? `\\left(${rootLatex}, +\\infty\\right)` : `\\left(-\\infty, ${rootLatex}\\right)`;

    return {
        expression: `log${base || ""}(${argomento})`,
        latex: `${logSymbol}\\left(${argomentoLatex}\\right)`,
        type: "logaritmo",
        conditions: [
            {
                description: "Funzione logaritmica: l'argomento deve essere strettamente maggiore di zero",
                condition: `${argomento} > 0`,
                conditionLatex: `${argomentoLatex} > 0`,
                resolution: [
                    `${argomentoLatex} > 0`,
                    `${a}x > ${-b}`,
                    a > 0 ? `x > ${rootLatex}` : `x < ${rootLatex} \\text{ (cambio verso)}`,
                ],
                solution,
            },
        ],
        domain: solution,
        domainText,
        domainInterval,
    };
}

function generateEsponenziale(difficulty: Difficulty): FunctionDef {
    const a = randomNonZero(-3, 3);
    const b = randomInt(-5, 5);
    const base = randomInt(2, 5);

    const esponente = formatLinear(a, b);
    const esponenteLatex = formatLinearLatex(a, b);

    return {
        expression: `${base}^(${esponente})`,
        latex: `${base}^{${esponenteLatex}}`,
        type: "esponenziale",
        conditions: [
            {
                description: "Funzione esponenziale con base positiva: è definita per ogni valore reale di x",
                condition: "Nessuna restrizione",
                conditionLatex: "\\text{Nessuna restrizione}",
                resolution: [
                    `\\text{La base } ${base} \\text{ è positiva}`,
                    `\\text{L'esponente può assumere qualsiasi valore reale}`,
                    `x \\in \\mathbb{R}`,
                ],
                solution: { type: "all" },
            },
        ],
        domain: { type: "all" },
        domainText: "\\left\\{ x \\in \\mathbb{R} \\right\\}",
        domainInterval: "\\mathbb{R}",
    };
}

function generateRazionaleRadice(difficulty: Difficulty): FunctionDef {
    // Radice al denominatore
    const a = randomNonZero(1, 5); // positivo per semplicità
    const b = randomInt(-10, 10);
    const root = -b / a;
    const rootLatex = formatFractionLatex(-b, a);

    const radicando = formatLinear(a, b);
    const radicandoLatex = formatLinearLatex(a, b);

    // Condizione: radicando > 0 (non ≥ perché è al denominatore)
    const solution: Solution = { type: "interval", left: root, right: Infinity, leftOpen: true, rightOpen: true };

    return {
        expression: `1 / √(${radicando})`,
        latex: `\\frac{1}{\\sqrt{${radicandoLatex}}}`,
        type: "razionale-radice",
        conditions: [
            {
                description: "Radice quadrata al denominatore: il radicando deve essere ≥ 0",
                condition: `${radicando} ≥ 0`,
                conditionLatex: `${radicandoLatex} \\geq 0`,
                resolution: [`${radicandoLatex} \\geq 0`, `x \\geq ${rootLatex}`],
                solution: { type: "interval", left: root, right: Infinity, leftOpen: false, rightOpen: true },
            },
            {
                description: "Denominatore diverso da zero: la radice deve essere ≠ 0",
                condition: `√(${radicando}) ≠ 0`,
                conditionLatex: `\\sqrt{${radicandoLatex}} \\neq 0`,
                resolution: [`${radicandoLatex} \\neq 0`, `x \\neq ${rootLatex}`],
                solution: { type: "point-excluded", excludedPoints: [root] },
            },
        ],
        domain: solution,
        domainText: `\\left\\{ x \\in \\mathbb{R} : x > ${rootLatex} \\right\\}`,
        domainInterval: `\\left(${rootLatex}, +\\infty\\right)`,
    };
}

function generateLogaritmoRadice(difficulty: Difficulty): FunctionDef {
    const a = randomNonZero(1, 5);
    const b = randomInt(-10, 10);
    const root = -b / a;
    const rootLatex = formatFractionLatex(-b, a);

    const argomento = formatLinear(a, b);
    const argomentoLatex = formatLinearLatex(a, b);

    // log(√(...)) = (1/2)log(...), quindi argomento > 0
    const solution: Solution = { type: "interval", left: root, right: Infinity, leftOpen: true, rightOpen: true };

    return {
        expression: `log(√(${argomento}))`,
        latex: `\\ln\\left(\\sqrt{${argomentoLatex}}\\right)`,
        type: "logaritmo-radice",
        conditions: [
            {
                description: "Radice quadrata: il radicando deve essere ≥ 0",
                condition: `${argomento} ≥ 0`,
                conditionLatex: `${argomentoLatex} \\geq 0`,
                resolution: [`${argomentoLatex} \\geq 0`, `x \\geq ${rootLatex}`],
                solution: { type: "interval", left: root, right: Infinity, leftOpen: false, rightOpen: true },
            },
            {
                description: "Logaritmo: l'argomento deve essere > 0",
                condition: `√(${argomento}) > 0`,
                conditionLatex: `\\sqrt{${argomentoLatex}} > 0`,
                resolution: [`${argomentoLatex} > 0`, `x > ${rootLatex}`],
                solution: { type: "interval", left: root, right: Infinity, leftOpen: true, rightOpen: true },
            },
        ],
        domain: solution,
        domainText: `\\left\\{ x \\in \\mathbb{R} : x > ${rootLatex} \\right\\}`,
        domainInterval: `\\left(${rootLatex}, +\\infty\\right)`,
    };
}

function generateRazionaleLogaritmo(difficulty: Difficulty): FunctionDef {
    const a = randomNonZero(1, 5);
    const b = randomInt(-10, 10);
    const root = -b / a;
    const rootLatex = formatFractionLatex(-b, a);

    const argomento = formatLinear(a, b);
    const argomentoLatex = formatLinearLatex(a, b);

    // 1 / log(...): argomento > 0 e log ≠ 0 (cioè argomento ≠ 1)
    const excludePoint = (1 - b) / a; // quando argomento = 1
    const excludePointLatex = formatFractionLatex(1 - b, a);

    return {
        expression: `1 / log(${argomento})`,
        latex: `\\frac{1}{\\ln\\left(${argomentoLatex}\\right)}`,
        type: "razionale-logaritmo",
        conditions: [
            {
                description: "Logaritmo: l'argomento deve essere > 0",
                condition: `${argomento} > 0`,
                conditionLatex: `${argomentoLatex} > 0`,
                resolution: [`${argomentoLatex} > 0`, `x > ${rootLatex}`],
                solution: { type: "interval", left: root, right: Infinity, leftOpen: true, rightOpen: true },
            },
            {
                description: "Denominatore ≠ 0: il logaritmo deve essere ≠ 0",
                condition: `log(${argomento}) ≠ 0`,
                conditionLatex: `\\ln\\left(${argomentoLatex}\\right) \\neq 0`,
                resolution: [`${argomentoLatex} \\neq 1`, `${a}x \\neq ${1 - b}`, `x \\neq ${excludePointLatex}`],
                solution: { type: "point-excluded", excludedPoints: [excludePoint] },
            },
        ],
        domain: {
            type: "interval",
            left: root,
            right: Infinity,
            leftOpen: true,
            rightOpen: true,
        },
        domainText: `\\left\\{ x \\in \\mathbb{R} : x > ${rootLatex} \\land x \\neq ${excludePointLatex} \\right\\}`,
        domainInterval: `\\left(${rootLatex}, ${excludePointLatex}\\right) \\cup \\left(${excludePointLatex}, +\\infty\\right)`,
    };
}

function generateFunction(difficulty: Difficulty): FunctionDef {
    const types: FunctionType[] =
        difficulty === "base"
            ? ["razionale", "radice", "logaritmo", "esponenziale"]
            : difficulty === "intermedio"
                ? ["razionale", "radice", "logaritmo", "esponenziale", "razionale-radice"]
                : [
                    "razionale",
                    "radice",
                    "logaritmo",
                    "esponenziale",
                    "razionale-radice",
                    "logaritmo-radice",
                    "razionale-logaritmo",
                ];

    const type = types[randomInt(0, types.length - 1)];

    switch (type) {
        case "razionale":
            return generateRazionale(difficulty);
        case "radice":
            return generateRadice(difficulty);
        case "logaritmo":
            return generateLogaritmo(difficulty);
        case "esponenziale":
            return generateEsponenziale(difficulty);
        case "razionale-radice":
            return generateRazionaleRadice(difficulty);
        case "logaritmo-radice":
            return generateLogaritmoRadice(difficulty);
        case "razionale-logaritmo":
            return generateRazionaleLogaritmo(difficulty);
        default:
            return generateRazionale(difficulty);
    }
}

// ============ COMPONENTI GRAFICI ============

const SVG_WIDTH = 500;
const SVG_HEIGHT = 400;
const X_MIN = -8;
const X_MAX = 8;
const Y_MIN = -6;
const Y_MAX = 6;
const PADDING = 40;

function scaleX(x: number): number {
    const t = (x - X_MIN) / (X_MAX - X_MIN);
    return PADDING + t * (SVG_WIDTH - 2 * PADDING);
}

function scaleY(y: number): number {
    const t = (y - Y_MIN) / (Y_MAX - Y_MIN);
    return SVG_HEIGHT - PADDING - t * (SVG_HEIGHT - 2 * PADDING);
}

function DomainGraph({ solution, showGraph }: { solution: Solution; showGraph: boolean }) {
    const originX = scaleX(0);
    const originY = scaleY(0);

    // Calcola le regioni escluse
    const excludedRegions: { x1: number; x2: number }[] = [];
    const excludedPoints: number[] = [];

    if (solution.type === "none") {
        excludedRegions.push({ x1: X_MIN, x2: X_MAX });
    } else if (solution.type === "interval") {
        const left = solution.left ?? -Infinity;
        const right = solution.right ?? Infinity;

        if (left > X_MIN) {
            excludedRegions.push({ x1: X_MIN, x2: Math.min(left, X_MAX) });
        }
        if (right < X_MAX) {
            excludedRegions.push({ x1: Math.max(right, X_MIN), x2: X_MAX });
        }
    } else if (solution.type === "point-excluded" && solution.excludedPoints) {
        excludedPoints.push(...solution.excludedPoints);
    }

    if (!showGraph) {
        return (
            <svg width={SVG_WIDTH} height={SVG_HEIGHT} style={{ maxWidth: "100%", display: "block", margin: "0 auto" }}>
                <rect x={0} y={0} width={SVG_WIDTH} height={SVG_HEIGHT} fill="#fafafa" stroke="#ddd" rx={8} />
                {/* Assi grigi */}
                <line x1={PADDING} y1={originY} x2={SVG_WIDTH - PADDING} y2={originY} stroke="#ccc" strokeWidth={1} />
                <line x1={originX} y1={PADDING} x2={originX} y2={SVG_HEIGHT - PADDING} stroke="#ccc" strokeWidth={1} />
                <text x={SVG_WIDTH / 2} y={SVG_HEIGHT / 2} textAnchor="middle" fill="#94a3b8" fontSize={14} fontStyle="italic">
                    Completa i passaggi per vedere il grafico
                </text>
            </svg>
        );
    }

    return (
        <svg width={SVG_WIDTH} height={SVG_HEIGHT} style={{ maxWidth: "100%", display: "block", margin: "0 auto" }}>
            {/* Sfondo */}
            <rect x={0} y={0} width={SVG_WIDTH} height={SVG_HEIGHT} fill="#fafafa" stroke="#ddd" rx={8} />

            {/* Griglia leggera */}
            {Array.from({ length: X_MAX - X_MIN + 1 }, (_, i) => {
                const x = X_MIN + i;
                if (x === 0) return null;
                return (
                    <line
                        key={`vgrid-${x}`}
                        x1={scaleX(x)}
                        y1={PADDING}
                        x2={scaleX(x)}
                        y2={SVG_HEIGHT - PADDING}
                        stroke="#e5e7eb"
                        strokeWidth={1}
                    />
                );
            })}
            {Array.from({ length: Y_MAX - Y_MIN + 1 }, (_, i) => {
                const y = Y_MIN + i;
                if (y === 0) return null;
                return (
                    <line
                        key={`hgrid-${y}`}
                        x1={PADDING}
                        y1={scaleY(y)}
                        x2={SVG_WIDTH - PADDING}
                        y2={scaleY(y)}
                        stroke="#e5e7eb"
                        strokeWidth={1}
                    />
                );
            })}

            {/* Zone escluse (rettangoli rossi semitrasparenti) */}
            {excludedRegions.map((region, idx) => (
                <rect
                    key={`excluded-${idx}`}
                    x={scaleX(region.x1)}
                    y={PADDING}
                    width={scaleX(region.x2) - scaleX(region.x1)}
                    height={SVG_HEIGHT - 2 * PADDING}
                    fill="rgba(239, 68, 68, 0.15)"
                    stroke="rgba(239, 68, 68, 0.3)"
                    strokeWidth={1}
                />
            ))}

            {/* Linee verticali per punti esclusi */}
            {excludedPoints.map((point, idx) => {
                const x = scaleX(point);
                if (x < PADDING || x > SVG_WIDTH - PADDING) return null;
                return (
                    <g key={`excl-line-${idx}`}>
                        <line
                            x1={x}
                            y1={PADDING}
                            x2={x}
                            y2={SVG_HEIGHT - PADDING}
                            stroke="#ef4444"
                            strokeWidth={2}
                            strokeDasharray="8,4"
                        />
                    </g>
                );
            })}

            {/* Asse X */}
            <line x1={PADDING} y1={originY} x2={SVG_WIDTH - PADDING} y2={originY} stroke="#374151" strokeWidth={2} />
            {/* Freccia asse X */}
            <polygon
                points={`${SVG_WIDTH - PADDING},${originY} ${SVG_WIDTH - PADDING - 8},${originY - 4} ${
                    SVG_WIDTH - PADDING - 8
                },${originY + 4}`}
                fill="#374151"
            />
            <text x={SVG_WIDTH - PADDING + 5} y={originY + 5} fontSize={14} fill="#374151" fontStyle="italic">
                x
            </text>

            {/* Asse Y */}
            <line x1={originX} y1={SVG_HEIGHT - PADDING} x2={originX} y2={PADDING} stroke="#374151" strokeWidth={2} />
            {/* Freccia asse Y */}
            <polygon
                points={`${originX},${PADDING} ${originX - 4},${PADDING + 8} ${originX + 4},${PADDING + 8}`}
                fill="#374151"
            />
            <text x={originX + 8} y={PADDING + 5} fontSize={14} fill="#374151" fontStyle="italic">
                y
            </text>

            {/* Tacche e numeri asse X */}
            {Array.from({ length: X_MAX - X_MIN + 1 }, (_, i) => {
                const x = X_MIN + i;
                if (x === 0) return null;
                const xPos = scaleX(x);
                return (
                    <g key={`xtick-${x}`}>
                        <line x1={xPos} y1={originY - 4} x2={xPos} y2={originY + 4} stroke="#374151" strokeWidth={1} />
                        {x % 2 === 0 && (
                            <text x={xPos} y={originY + 18} fontSize={11} textAnchor="middle" fill="#6b7280">
                                {x}
                            </text>
                        )}
                    </g>
                );
            })}

            {/* Tacche e numeri asse Y */}
            {Array.from({ length: Y_MAX - Y_MIN + 1 }, (_, i) => {
                const y = Y_MIN + i;
                if (y === 0) return null;
                const yPos = scaleY(y);
                return (
                    <g key={`ytick-${y}`}>
                        <line x1={originX - 4} y1={yPos} x2={originX + 4} y2={yPos} stroke="#374151" strokeWidth={1} />
                        {y % 2 === 0 && (
                            <text x={originX - 12} y={yPos + 4} fontSize={11} textAnchor="end" fill="#6b7280">
                                {y}
                            </text>
                        )}
                    </g>
                );
            })}

            {/* Origine */}
            <text x={originX - 12} y={originY + 16} fontSize={11} fill="#6b7280">
                O
            </text>

            {/* Etichette per punti esclusi */}
            {excludedPoints.map((point, idx) => {
                const x = scaleX(point);
                if (x < PADDING || x > SVG_WIDTH - PADDING) return null;
                return (
                    <g key={`excl-label-${idx}`}>
                        <circle cx={x} cy={originY} r={6} fill="#fff" stroke="#ef4444" strokeWidth={2.5} />
                        <line x1={x - 4} y1={originY - 4} x2={x + 4} y2={originY + 4} stroke="#ef4444" strokeWidth={2} />
                        <line x1={x - 4} y1={originY + 4} x2={x + 4} y2={originY - 4} stroke="#ef4444" strokeWidth={2} />
                        <text x={x} y={originY - 15} fontSize={12} textAnchor="middle" fill="#ef4444" fontWeight={600}>
                            {formatNumberLatex(point).replace(/\\frac\{([^}]+)\}\{([^}]+)\}/, "$1/$2")}
                        </text>
                    </g>
                );
            })}

            {/* Etichette per i bordi del dominio */}
            {solution.type === "interval" && (
                <>
                    {solution.left !== undefined &&
                        solution.left !== -Infinity &&
                        solution.left >= X_MIN &&
                        solution.left <= X_MAX && (
                            <g>
                                <circle
                                    cx={scaleX(solution.left)}
                                    cy={originY}
                                    r={6}
                                    fill={solution.leftOpen ? "#fff" : "#3b82f6"}
                                    stroke="#3b82f6"
                                    strokeWidth={2.5}
                                />
                                <text
                                    x={scaleX(solution.left)}
                                    y={originY + 25}
                                    fontSize={12}
                                    textAnchor="middle"
                                    fill="#3b82f6"
                                    fontWeight={600}
                                >
                                    {formatNumberLatex(solution.left).replace(/\\frac\{([^}]+)\}\{([^}]+)\}/, "$1/$2")}
                                </text>
                            </g>
                        )}
                    {solution.right !== undefined &&
                        solution.right !== Infinity &&
                        solution.right >= X_MIN &&
                        solution.right <= X_MAX && (
                            <g>
                                <circle
                                    cx={scaleX(solution.right)}
                                    cy={originY}
                                    r={6}
                                    fill={solution.rightOpen ? "#fff" : "#3b82f6"}
                                    stroke="#3b82f6"
                                    strokeWidth={2.5}
                                />
                                <text
                                    x={scaleX(solution.right)}
                                    y={originY + 25}
                                    fontSize={12}
                                    textAnchor="middle"
                                    fill="#3b82f6"
                                    fontWeight={600}
                                >
                                    {formatNumberLatex(solution.right).replace(/\\frac\{([^}]+)\}\{([^}]+)\}/, "$1/$2")}
                                </text>
                            </g>
                        )}
                </>
            )}

            {/* Legenda */}
            <g transform={`translate(${SVG_WIDTH - 150}, ${SVG_HEIGHT - 60})`}>
                <rect x={0} y={0} width={140} height={50} fill="#fff" stroke="#e5e7eb" rx={6} />
                <rect x={10} y={10} width={20} height={12} fill="rgba(239, 68, 68, 0.15)" stroke="rgba(239, 68, 68, 0.3)" />
                <text x={35} y={20} fontSize={11} fill="#6b7280">
                    Zona esclusa
                </text>
                <line x1={10} y1={35} x2={30} y2={35} stroke="#ef4444" strokeWidth={2} strokeDasharray="4,2" />
                <text x={35} y={38} fontSize={11} fill="#6b7280">
                    Punto escluso
                </text>
            </g>
        </svg>
    );
}

// ============ COMPONENTE PRINCIPALE ============

export default function DominiFunzioniDemo() {
    const [difficulty, setDifficulty] = useState<Difficulty>("base");
    const [func, setFunc] = useState<FunctionDef>(() => generateFunction("base"));
    const [currentStep, setCurrentStep] = useState(0);

    // Steps: 0 = funzione, 1 = tipologia, 2+ = condizioni, ultimo = grafico
    const totalSteps = 2 + func.conditions.length + 1;

    const handleGenerate = useCallback(() => {
        setFunc(generateFunction(difficulty));
        setCurrentStep(0);
    }, [difficulty]);

    const handleDifficultyChange = (newDiff: Difficulty) => {
        setDifficulty(newDiff);
        setFunc(generateFunction(newDiff));
        setCurrentStep(0);
    };

    const nextStep = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const showAll = () => {
        setCurrentStep(totalSteps - 1);
    };

    const getTypeName = (type: FunctionType): string => {
        const names: { [key in FunctionType]: string } = {
            razionale: "Funzione razionale fratta",
            radice: "Funzione irrazionale (radice)",
            logaritmo: "Funzione logaritmica",
            esponenziale: "Funzione esponenziale",
            "razionale-radice": "Funzione razionale con radice",
            "logaritmo-radice": "Funzione logaritmo di radice",
            "razionale-logaritmo": "Funzione razionale con logaritmo",
        };
        return names[type];
    };

    return (
        <div
            style={{
                maxWidth: 900,
                margin: "auto",
                padding: 16,
                fontFamily: "system-ui, sans-serif",
            }}
        >
            {/* Header */}
            <div style={{ marginBottom: 16 }}>
                <a href="#/" style={{ color: "#3b82f6", textDecoration: "none", fontSize: 14 }}>
                    ← Torna alla home
                </a>
                <h1 style={{ margin: "8px 0", fontSize: 24 }}>
                    Dominio delle Funzioni
                </h1>
                <p style={{ color: "#64748b", margin: 0, fontSize: 14 }}>
                    Impara a determinare il dominio di una funzione passo dopo passo.
                </p>
            </div>

            {/* Controlli */}
            <div
                style={{
                    display: "flex",
                    gap: 16,
                    marginBottom: 20,
                    flexWrap: "wrap",
                    alignItems: "center",
                }}
            >
                {/* Difficoltà */}
                <div
                    style={{
                        background: "#fff",
                        borderRadius: 12,
                        padding: "12px 16px",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                    }}
                >
                    <span style={{ fontWeight: 500, fontSize: 14 }}>Difficoltà:</span>
                    {(["base", "intermedio", "avanzato"] as Difficulty[]).map((d) => (
                        <button
                            key={d}
                            onClick={() => handleDifficultyChange(d)}
                            style={{
                                padding: "6px 12px",
                                borderRadius: 6,
                                border: difficulty === d ? "2px solid #3b82f6" : "1px solid #cbd5e1",
                                background: difficulty === d ? "#eff6ff" : "#fff",
                                color: difficulty === d ? "#1d4ed8" : "#334155",
                                fontWeight: 500,
                                fontSize: 13,
                                cursor: "pointer",
                                textTransform: "capitalize",
                            }}
                        >
                            {d}
                        </button>
                    ))}
                </div>

                {/* Pulsante genera */}
                <button
                    onClick={handleGenerate}
                    style={{
                        padding: "10px 20px",
                        borderRadius: 8,
                        border: "none",
                        background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: "pointer",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                    }}
                >
                    🎲 Nuova funzione
                </button>
            </div>

            {/* Funzione */}
            <div
                style={{
                    background: "#fff",
                    borderRadius: 12,
                    padding: 20,
                    marginBottom: 16,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                    textAlign: "center",
                }}
            >
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
                    Determina il dominio della funzione:
                </div>
                <div style={{ fontSize: 28, color: "#1e293b" }}>
                    <Latex display>{`f(x) = ${func.latex}`}</Latex>
                </div>
            </div>

            {/* Passaggi */}
            <div
                style={{
                    background: "#fff",
                    borderRadius: 12,
                    padding: 20,
                    marginBottom: 16,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                }}
            >
                {/* Barra progressione */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 16,
                    }}
                >
                    <div style={{ fontWeight: 600, fontSize: 16 }}>Procedimento</div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            style={{
                                padding: "6px 12px",
                                borderRadius: 6,
                                border: "1px solid #cbd5e1",
                                background: currentStep === 0 ? "#f1f5f9" : "#fff",
                                color: currentStep === 0 ? "#94a3b8" : "#334155",
                                cursor: currentStep === 0 ? "not-allowed" : "pointer",
                                fontSize: 13,
                            }}
                        >
                            ← Indietro
                        </button>
                        <button
                            onClick={nextStep}
                            disabled={currentStep === totalSteps - 1}
                            style={{
                                padding: "6px 12px",
                                borderRadius: 6,
                                border: "none",
                                background: currentStep === totalSteps - 1 ? "#94a3b8" : "#3b82f6",
                                color: "#fff",
                                cursor: currentStep === totalSteps - 1 ? "not-allowed" : "pointer",
                                fontSize: 13,
                                fontWeight: 500,
                            }}
                        >
                            Avanti →
                        </button>
                        <button
                            onClick={showAll}
                            style={{
                                padding: "6px 12px",
                                borderRadius: 6,
                                border: "1px solid #22c55e",
                                background: "#dcfce7",
                                color: "#166534",
                                cursor: "pointer",
                                fontSize: 13,
                                fontWeight: 500,
                            }}
                        >
                            Mostra tutto
                        </button>
                    </div>
                </div>

                {/* Step 1: Tipologia */}
                <div
                    style={{
                        padding: 16,
                        background: currentStep >= 1 ? "#f0fdf4" : "#f8fafc",
                        borderRadius: 8,
                        marginBottom: 12,
                        borderLeft: `4px solid ${currentStep >= 1 ? "#22c55e" : "#cbd5e1"}`,
                        opacity: currentStep >= 1 ? 1 : 0.5,
                    }}
                >
                    <div style={{ fontWeight: 600, color: "#166534", marginBottom: 6 }}>
                        Step 1: Riconosci la tipologia
                    </div>
                    {currentStep >= 1 && (
                        <div style={{ fontSize: 15, color: "#334155" }}>{getTypeName(func.type)}</div>
                    )}
                </div>

                {/* Step 2+: Condizioni */}
                {func.conditions.map((cond, idx) => (
                    <div
                        key={idx}
                        style={{
                            padding: 16,
                            background: currentStep >= 2 + idx ? "#eff6ff" : "#f8fafc",
                            borderRadius: 8,
                            marginBottom: 12,
                            borderLeft: `4px solid ${currentStep >= 2 + idx ? "#3b82f6" : "#cbd5e1"}`,
                            opacity: currentStep >= 2 + idx ? 1 : 0.5,
                        }}
                    >
                        <div style={{ fontWeight: 600, color: "#1d4ed8", marginBottom: 6 }}>
                            Step {2 + idx}: {cond.description}
                        </div>
                        {currentStep >= 2 + idx && (
                            <>
                                <div
                                    style={{
                                        fontSize: 18,
                                        color: "#334155",
                                        marginBottom: 8,
                                        padding: "8px 12px",
                                        background: "#fff",
                                        borderRadius: 6,
                                        display: "inline-block",
                                    }}
                                >
                                    <Latex>{cond.conditionLatex || cond.condition}</Latex>
                                </div>
                                <div style={{ marginTop: 8 }}>
                                    <div style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>
                                        Risoluzione:
                                    </div>
                                    {cond.resolution.map((step, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                fontSize: 15,
                                                color: "#475569",
                                                padding: "6px 0",
                                                paddingLeft: 12,
                                                borderLeft: "2px solid #cbd5e1",
                                            }}
                                        >
                                            <Latex>{step}</Latex>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                ))}

                {/* Step finale: Dominio */}
                <div
                    style={{
                        padding: 16,
                        background: currentStep >= totalSteps - 1 ? "#fef3c7" : "#f8fafc",
                        borderRadius: 8,
                        marginBottom: 12,
                        borderLeft: `4px solid ${currentStep >= totalSteps - 1 ? "#f59e0b" : "#cbd5e1"}`,
                        opacity: currentStep >= totalSteps - 1 ? 1 : 0.5,
                    }}
                >
                    <div style={{ fontWeight: 600, color: "#b45309", marginBottom: 6 }}>
                        Step {totalSteps}: Scrivi il dominio
                    </div>
                    {currentStep >= totalSteps - 1 && (
                        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
                            <div>
                                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                                    Forma algebrica:
                                </div>
                                <div style={{ fontSize: 20, color: "#92400e", fontWeight: 500 }}>
                                    <Latex>{`D = ${func.domainText}`}</Latex>
                                </div>

                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                                    Notazione intervalli:
                                </div>
                                <div style={{ fontSize: 20, color: "#92400e", fontWeight: 500 }}>
                                    <Latex>{`D = ${func.domainInterval}`}</Latex>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Grafico */}
            <div
                style={{
                    background: "#fff",
                    borderRadius: 12,
                    padding: 16,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                }}
            >
                <div style={{ fontWeight: 600, marginBottom: 12 }}>
                    Rappresentazione grafica del dominio
                </div>
                <DomainGraph solution={func.domain} showGraph={currentStep >= totalSteps - 1} />
                <div
                    style={{
                        marginTop: 10,
                        fontSize: 13,
                        color: "#64748b",
                        textAlign: "center",
                    }}
                >
                    {currentStep >= totalSteps - 1 ? (
                        <>
                            Le <strong>zone rosse</strong> indicano i valori di x dove la funzione{" "}
                            <strong>non è definita</strong>.
                        </>
                    ) : (
                        <span style={{ fontStyle: "italic" }}>
              Completa tutti i passaggi per vedere il grafico
            </span>
                    )}
                </div>
            </div>

            {/* Spiegazione */}
            <div
                style={{
                    marginTop: 16,
                    background: "#eff6ff",
                    borderRadius: 12,
                    padding: 16,
                    fontSize: 13,
                    color: "#1e3a8a",
                }}
            >
                <strong>Come determinare il dominio:</strong>
                <ol style={{ margin: "8px 0 0 0", paddingLeft: 20 }}>
                    <li>
                        <strong>Riconosci la tipologia</strong> della funzione (razionale, irrazionale, logaritmica, ecc.)
                    </li>
                    <li>
                        <strong>Scrivi le condizioni</strong> di esistenza (denominatore ≠ 0, radicando ≥ 0, argomento log {">"} 0, ecc.)
                    </li>
                    <li>
                        <strong>Risolvi</strong> le disequazioni o equazioni associate
                    </li>
                    <li>
                        <strong>Interseca</strong> le soluzioni se ci sono più condizioni
                    </li>
                    <li>
                        <strong>Scrivi</strong> il dominio in forma algebrica e come intervallo
                    </li>
                </ol>
            </div>
        </div>
    );
}
