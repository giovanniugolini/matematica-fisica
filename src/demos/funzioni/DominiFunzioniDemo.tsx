/**
 * DominiFunzioniDemo - Versione Responsive (stile "DisequazioniSecondoGradoDemo")
 * Dominio step-by-step + grafico finale
 */

import React, { useState, useCallback } from "react";
import {
    Latex,
    DemoContainer,
    ProblemCard,
    NavigationButtons,
    StepCard,
    InfoBox,
    GenerateButton,
    useStepNavigation,
    GraphContainer,
    useBreakpoint,
    ResponsiveGrid,
    ResponsiveCard,
    SwipeableTabs,
    CollapsiblePanel,
} from "../../components/ui";

import {
    randomInt,
    randomNonZero,
    formatFractionLatex,
    formatNumberLatex,
    formatLinearLatex,
} from "../../utils/math";

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

type Solution = {
    type: "interval" | "point-excluded" | "all" | "none";
    left?: number;
    right?: number;
    leftOpen?: boolean;
    rightOpen?: boolean;
    excludedPoints?: number[];
};

type ConditionDef = {
    description: string;
    condition: string;
    conditionLatex?: string;
    resolution: string[];
    solution: Solution;
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

// ============ HELPERS DOMINIO (INTERSEZIONE) ============

function normalizeExcluded(points?: number[]) {
    if (!points || points.length === 0) return [];
    const uniq = Array.from(new Set(points.map((p) => +p)));
    uniq.sort((a, b) => a - b);
    return uniq;
}

function inInterval(x: number, s: Solution) {
    if (s.type !== "interval") return false;
    const L = s.left ?? -Infinity;
    const R = s.right ?? Infinity;

    const leftOk = s.leftOpen ? x > L : x >= L;
    const rightOk = s.rightOpen ? x < R : x <= R;
    return leftOk && rightOk;
}

function intersectTwo(a: Solution, b: Solution): Solution {
    if (a.type === "none" || b.type === "none") return { type: "none" };
    if (a.type === "all") return b;
    if (b.type === "all") return a;

    // point-excluded ∩ point-excluded
    if (a.type === "point-excluded" && b.type === "point-excluded") {
        return {
            type: "point-excluded",
            excludedPoints: normalizeExcluded([...(a.excludedPoints || []), ...(b.excludedPoints || [])]),
        };
    }

    // interval ∩ interval
    if (a.type === "interval" && b.type === "interval") {
        const L1 = a.left ?? -Infinity;
        const R1 = a.right ?? Infinity;
        const L2 = b.left ?? -Infinity;
        const R2 = b.right ?? Infinity;

        const left = Math.max(L1, L2);
        const right = Math.min(R1, R2);

        if (left > right) return { type: "none" };
        if (left === right) {
            // un solo punto: è ammesso solo se chiuso da entrambe
            const leftClosed =
                (left === L1 ? !a.leftOpen : true) && (left === L2 ? !b.leftOpen : true);
            const rightClosed =
                (right === R1 ? !a.rightOpen : true) && (right === R2 ? !b.rightOpen : true);
            if (leftClosed && rightClosed) {
                return { type: "interval", left, right, leftOpen: false, rightOpen: false };
            }
            return { type: "none" };
        }

        const leftOpen =
            (left === L1 ? !!a.leftOpen : false) || (left === L2 ? !!b.leftOpen : false);
        const rightOpen =
            (right === R1 ? !!a.rightOpen : false) || (right === R2 ? !!b.rightOpen : false);

        return { type: "interval", left, right, leftOpen, rightOpen };
    }

    // interval ∩ point-excluded
    if (a.type === "interval" && b.type === "point-excluded") {
        const excl = normalizeExcluded(b.excludedPoints);
        const inside = excl.filter((p) => inInterval(p, a));
        if (inside.length === 0) return a;

        // se l'intervallo è un singolo punto e quel punto viene escluso => none
        if (a.left !== undefined && a.right !== undefined && a.left === a.right) {
            return { type: "none" };
        }

        return { type: "point-excluded", excludedPoints: inside, left: a.left, right: a.right, leftOpen: a.leftOpen, rightOpen: a.rightOpen } as any;
    }
    if (a.type === "point-excluded" && b.type === "interval") return intersectTwo(b, a);

    // fallback prudente: se non riconosciamo il caso, restituiamo "none"
    return { type: "none" };
}

function intersectSolutions(list: Solution[]): Solution {
    return list.reduce((acc, s) => intersectTwo(acc, s), { type: "all" } as Solution);
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
        numerator = formatLinearLatex(c, d);
        numeratorLatex = formatLinearLatex(c, d);
    }

    const denominator = formatLinearLatex(a, b);
    const denominatorLatex = formatLinearLatex(a, b);

    const cond: ConditionDef = {
        description: "Funzione razionale fratta: il denominatore deve essere diverso da zero",
        condition: `${denominator} ≠ 0`,
        conditionLatex: `${denominatorLatex} \\neq 0`,
        resolution: [`${denominatorLatex} \\neq 0`, `${a}x \\neq ${-b}`, `x \\neq ${rootLatex}`],
        solution: { type: "point-excluded", excludedPoints: [root] },
    };

    return {
        expression: `(${numerator}) / (${denominator})`,
        latex: `\\frac{${numeratorLatex}}{${denominatorLatex}}`,
        type: "razionale",
        conditions: [cond],
        domain: cond.solution,
        domainText: `\\left\\{ x \\in \\mathbb{R} : x \\neq ${rootLatex} \\right\\}`,
        domainInterval: `\\mathbb{R} \\setminus \\left\\{${rootLatex}\\right\\}`,
    };
}

function generateRadice(_: Difficulty): FunctionDef {
    const a = randomNonZero(-5, 5);
    const b = randomInt(-10, 10);
    const root = -b / a;
    const rootLatex = formatFractionLatex(-b, a);

    const radicando = formatLinearLatex(a, b);
    const radicandoLatex = formatLinearLatex(a, b);

    const solution: Solution =
        a > 0
            ? { type: "interval", left: root, right: Infinity, leftOpen: false, rightOpen: true }
            : { type: "interval", left: -Infinity, right: root, leftOpen: true, rightOpen: false };

    const domainCondition = a > 0 ? `x \\geq ${rootLatex}` : `x \\leq ${rootLatex}`;
    const domainText = `\\left\\{ x \\in \\mathbb{R} : ${domainCondition} \\right\\}`;
    const domainInterval = a > 0 ? `\\left[${rootLatex}, +\\infty\\right)` : `\\left(-\\infty, ${rootLatex}\\right]`;

    const cond: ConditionDef = {
        description: "Radice quadrata (indice pari): il radicando deve essere ≥ 0",
        condition: `${radicando} ≥ 0`,
        conditionLatex: `${radicandoLatex} \\geq 0`,
        resolution: [
            `${radicandoLatex} \\geq 0`,
            `${a}x \\geq ${-b}`,
            a > 0 ? `x \\geq ${rootLatex}` : `x \\leq ${rootLatex} \\text{ (cambio verso)}`,
        ],
        solution,
    };

    return {
        expression: `√(${radicando})`,
        latex: `\\sqrt{${radicandoLatex}}`,
        type: "radice",
        conditions: [cond],
        domain: cond.solution,
        domainText,
        domainInterval,
    };
}

function generateLogaritmo(difficulty: Difficulty): FunctionDef {
    const a = randomNonZero(-5, 5);
    const b = randomInt(-10, 10);
    const root = -b / a;
    const rootLatex = formatFractionLatex(-b, a);

    const argomento = formatLinearLatex(a, b);
    const argomentoLatex = formatLinearLatex(a, b);

    const solution: Solution =
        a > 0
            ? { type: "interval", left: root, right: Infinity, leftOpen: true, rightOpen: true }
            : { type: "interval", left: -Infinity, right: root, leftOpen: true, rightOpen: true };

    const base = difficulty === "base" ? 0 : randomInt(2, 5);
    const logSymbol = base ? `\\log_{${base}}` : `\\ln`;

    const domainCondition = a > 0 ? `x > ${rootLatex}` : `x < ${rootLatex}`;
    const domainText = `\\left\\{ x \\in \\mathbb{R} : ${domainCondition} \\right\\}`;
    const domainInterval = a > 0 ? `\\left(${rootLatex}, +\\infty\\right)` : `\\left(-\\infty, ${rootLatex}\\right)`;

    const cond: ConditionDef = {
        description: "Funzione logaritmica: l'argomento deve essere strettamente > 0",
        condition: `${argomento} > 0`,
        conditionLatex: `${argomentoLatex} > 0`,
        resolution: [
            `${argomentoLatex} > 0`,
            `${a}x > ${-b}`,
            a > 0 ? `x > ${rootLatex}` : `x < ${rootLatex} \\text{ (cambio verso)}`,
        ],
        solution,
    };

    return {
        expression: `log${base || ""}(${argomento})`,
        latex: `${logSymbol}\\left(${argomentoLatex}\\right)`,
        type: "logaritmo",
        conditions: [cond],
        domain: cond.solution,
        domainText,
        domainInterval,
    };
}

function generateEsponenziale(_: Difficulty): FunctionDef {
    const a = randomNonZero(-3, 3);
    const b = randomInt(-5, 5);
    const base = randomInt(2, 5);

    const esponenteLatex = formatLinearLatex(a, b);

    const cond: ConditionDef = {
        description: "Funzione esponenziale (base positiva): definita per ogni x reale",
        condition: "Nessuna restrizione",
        conditionLatex: "\\text{Nessuna restrizione}",
        resolution: [
            `\\text{La base } ${base} \\text{ è positiva}`,
            `\\text{L'esponente può essere qualsiasi reale}`,
            `x \\in \\mathbb{R}`,
        ],
        solution: { type: "all" },
    };

    return {
        expression: `${base}^(${formatLinearLatex(a, b)})`,
        latex: `${base}^{${esponenteLatex}}`,
        type: "esponenziale",
        conditions: [cond],
        domain: { type: "all" },
        domainText: "\\left\\{ x \\in \\mathbb{R} \\right\\}",
        domainInterval: "\\mathbb{R}",
    };
}

function generateRazionaleRadice(_: Difficulty): FunctionDef {
    const a = randomNonZero(1, 5);
    const b = randomInt(-10, 10);
    const root = -b / a;
    const rootLatex = formatFractionLatex(-b, a);

    const radicandoLatex = formatLinearLatex(a, b);

    const c1: ConditionDef = {
        description: "Radice al denominatore: il radicando deve essere ≥ 0",
        condition: `${radicandoLatex} ≥ 0`,
        conditionLatex: `${radicandoLatex} \\geq 0`,
        resolution: [`${radicandoLatex} \\geq 0`, `x \\geq ${rootLatex}`],
        solution: { type: "interval", left: root, right: Infinity, leftOpen: false, rightOpen: true },
    };

    const c2: ConditionDef = {
        description: "Denominatore ≠ 0: la radice deve essere ≠ 0",
        condition: `\\sqrt{${radicandoLatex}} \\neq 0`,
        conditionLatex: `\\sqrt{${radicandoLatex}} \\neq 0`,
        resolution: [`${radicandoLatex} \\neq 0`, `x \\neq ${rootLatex}`],
        solution: { type: "point-excluded", excludedPoints: [root] },
    };

    const domain = intersectSolutions([c1.solution, c2.solution]);

    return {
        expression: `1 / √(${radicandoLatex})`,
        latex: `\\frac{1}{\\sqrt{${radicandoLatex}}}`,
        type: "razionale-radice",
        conditions: [c1, c2],
        domain,
        domainText: `\\left\\{ x \\in \\mathbb{R} : x > ${rootLatex} \\right\\}`,
        domainInterval: `\\left(${rootLatex}, +\\infty\\right)`,
    };
}

function generateLogaritmoRadice(_: Difficulty): FunctionDef {
    const a = randomNonZero(1, 5);
    const b = randomInt(-10, 10);
    const root = -b / a;
    const rootLatex = formatFractionLatex(-b, a);

    const argomentoLatex = formatLinearLatex(a, b);

    const c1: ConditionDef = {
        description: "Radice quadrata: il radicando deve essere ≥ 0",
        condition: `${argomentoLatex} ≥ 0`,
        conditionLatex: `${argomentoLatex} \\geq 0`,
        resolution: [`${argomentoLatex} \\geq 0`, `x \\geq ${rootLatex}`],
        solution: { type: "interval", left: root, right: Infinity, leftOpen: false, rightOpen: true },
    };

    const c2: ConditionDef = {
        description: "Logaritmo: l'argomento deve essere > 0",
        condition: `\\sqrt{${argomentoLatex}} > 0`,
        conditionLatex: `\\sqrt{${argomentoLatex}} > 0`,
        resolution: [`${argomentoLatex} > 0`, `x > ${rootLatex}`],
        solution: { type: "interval", left: root, right: Infinity, leftOpen: true, rightOpen: true },
    };

    const domain = intersectSolutions([c1.solution, c2.solution]);

    return {
        expression: `log(√(${argomentoLatex}))`,
        latex: `\\ln\\left(\\sqrt{${argomentoLatex}}\\right)`,
        type: "logaritmo-radice",
        conditions: [c1, c2],
        domain,
        domainText: `\\left\\{ x \\in \\mathbb{R} : x > ${rootLatex} \\right\\}`,
        domainInterval: `\\left(${rootLatex}, +\\infty\\right)`,
    };
}

function generateRazionaleLogaritmo(_: Difficulty): FunctionDef {
    const a = randomNonZero(1, 5);
    const b = randomInt(-10, 10);
    const root = -b / a;
    const rootLatex = formatFractionLatex(-b, a);

    const argomentoLatex = formatLinearLatex(a, b);

    const excludePoint = (1 - b) / a;
    const excludePointLatex = formatFractionLatex(1 - b, a);

    const c1: ConditionDef = {
        description: "Logaritmo: l'argomento deve essere > 0",
        condition: `${argomentoLatex} > 0`,
        conditionLatex: `${argomentoLatex} > 0`,
        resolution: [`${argomentoLatex} > 0`, `x > ${rootLatex}`],
        solution: { type: "interval", left: root, right: Infinity, leftOpen: true, rightOpen: true },
    };

    const c2: ConditionDef = {
        description: "Denominatore ≠ 0: il logaritmo deve essere ≠ 0",
        condition: `\\ln\\left(${argomentoLatex}\\right) \\neq 0`,
        conditionLatex: `\\ln\\left(${argomentoLatex}\\right) \\neq 0`,
        resolution: [
            `${argomentoLatex} \\neq 1`,
            `${a}x \\neq ${1 - b}`,
            `x \\neq ${excludePointLatex}`,
        ],
        solution: { type: "point-excluded", excludedPoints: [excludePoint] },
    };

    const domain = intersectSolutions([c1.solution, c2.solution]);

    return {
        expression: `1 / log(${argomentoLatex})`,
        latex: `\\frac{1}{\\ln\\left(${argomentoLatex}\\right)}`,
        type: "razionale-logaritmo",
        conditions: [c1, c2],
        domain,
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

// ============ COMPONENTE GRAFICO ============

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

    const excludedRegions: { x1: number; x2: number }[] = [];
    const excludedPoints: number[] = [];

    // Gestione "interval" e "point-excluded" (eventuale interval nascosto dentro point-excluded da intersect)
    const intervalLike =
        solution.type === "interval"
            ? solution
            : (solution as any).left !== undefined || (solution as any).right !== undefined
                ? ({ type: "interval", left: (solution as any).left, right: (solution as any).right, leftOpen: (solution as any).leftOpen, rightOpen: (solution as any).rightOpen } as Solution)
                : null;

    if (solution.type === "none") {
        excludedRegions.push({ x1: X_MIN, x2: X_MAX });
    } else if (intervalLike && intervalLike.type === "interval") {
        const left = intervalLike.left ?? -Infinity;
        const right = intervalLike.right ?? Infinity;

        if (left > X_MIN) excludedRegions.push({ x1: X_MIN, x2: Math.min(left, X_MAX) });
        if (right < X_MAX) excludedRegions.push({ x1: Math.max(right, X_MIN), x2: X_MAX });
    }

    if (solution.type === "point-excluded" && solution.excludedPoints) {
        excludedPoints.push(...solution.excludedPoints);
    }
    if ((solution as any).excludedPoints && (solution as any).excludedPoints.length) {
        excludedPoints.push(...(solution as any).excludedPoints);
    }

    const fmt = (n: number) =>
        formatNumberLatex(n).replace(/\\frac\{([^}]+)\}\{([^}]+)\}/, "$1/$2");

    if (!showGraph) {
        return (
            <svg
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                style={{ width: "100%", height: "auto", display: "block", margin: "0 auto" }}
            >
                <rect x={0} y={0} width={SVG_WIDTH} height={SVG_HEIGHT} fill="#fafafa" stroke="#ddd" rx={8} />
                <line x1={PADDING} y1={originY} x2={SVG_WIDTH - PADDING} y2={originY} stroke="#ccc" strokeWidth={1} />
                <line x1={originX} y1={PADDING} x2={originX} y2={SVG_HEIGHT - PADDING} stroke="#ccc" strokeWidth={1} />
                <text
                    x={SVG_WIDTH / 2}
                    y={SVG_HEIGHT / 2}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize={14}
                    fontStyle="italic"
                >
                    Completa i passaggi per vedere il grafico
                </text>
            </svg>
        );
    }

    return (
        <svg
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            style={{ width: "100%", height: "auto", display: "block", margin: "0 auto" }}
        >
            <rect x={0} y={0} width={SVG_WIDTH} height={SVG_HEIGHT} fill="#fafafa" stroke="#ddd" rx={8} />

            {/* Griglia */}
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

            {/* Zone escluse */}
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

            {/* Punti esclusi (linee) */}
            {excludedPoints.map((p, idx) => {
                const x = scaleX(p);
                if (x < PADDING || x > SVG_WIDTH - PADDING) return null;
                return (
                    <line
                        key={`excl-line-${idx}`}
                        x1={x}
                        y1={PADDING}
                        x2={x}
                        y2={SVG_HEIGHT - PADDING}
                        stroke="#ef4444"
                        strokeWidth={2}
                        strokeDasharray="8,4"
                    />
                );
            })}

            {/* Assi */}
            <line x1={PADDING} y1={originY} x2={SVG_WIDTH - PADDING} y2={originY} stroke="#374151" strokeWidth={2} />
            <line x1={originX} y1={SVG_HEIGHT - PADDING} x2={originX} y2={PADDING} stroke="#374151" strokeWidth={2} />

            {/* Frecce/etichette */}
            <polygon
                points={`${SVG_WIDTH - PADDING},${originY} ${SVG_WIDTH - PADDING - 8},${originY - 4} ${
                    SVG_WIDTH - PADDING - 8
                },${originY + 4}`}
                fill="#374151"
            />
            <text x={SVG_WIDTH - PADDING + 5} y={originY + 5} fontSize={14} fill="#374151" fontStyle="italic">
                x
            </text>
            <polygon
                points={`${originX},${PADDING} ${originX - 4},${PADDING + 8} ${originX + 4},${PADDING + 8}`}
                fill="#374151"
            />
            <text x={originX + 8} y={PADDING + 5} fontSize={14} fill="#374151" fontStyle="italic">
                y
            </text>

            {/* Tacche */}
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

            <text x={originX - 12} y={originY + 16} fontSize={11} fill="#6b7280">
                O
            </text>

            {/* Marker punto escluso */}
            {excludedPoints.map((p, idx) => {
                const x = scaleX(p);
                if (x < PADDING || x > SVG_WIDTH - PADDING) return null;
                return (
                    <g key={`excl-label-${idx}`}>
                        <circle cx={x} cy={originY} r={6} fill="#fff" stroke="#ef4444" strokeWidth={2.5} />
                        <line x1={x - 4} y1={originY - 4} x2={x + 4} y2={originY + 4} stroke="#ef4444" strokeWidth={2} />
                        <line x1={x - 4} y1={originY + 4} x2={x + 4} y2={originY - 4} stroke="#ef4444" strokeWidth={2} />
                        <text x={x} y={originY - 15} fontSize={12} textAnchor="middle" fill="#ef4444" fontWeight={600}>
                            {fmt(p)}
                        </text>
                    </g>
                );
            })}

            {/* Marker bordi intervallo */}
            {intervalLike && intervalLike.type === "interval" && (
                <>
                    {intervalLike.left !== undefined &&
                        intervalLike.left !== -Infinity &&
                        intervalLike.left >= X_MIN &&
                        intervalLike.left <= X_MAX && (
                            <g>
                                <circle
                                    cx={scaleX(intervalLike.left)}
                                    cy={originY}
                                    r={6}
                                    fill={intervalLike.leftOpen ? "#fff" : "#3b82f6"}
                                    stroke="#3b82f6"
                                    strokeWidth={2.5}
                                />
                                <text
                                    x={scaleX(intervalLike.left)}
                                    y={originY + 25}
                                    fontSize={12}
                                    textAnchor="middle"
                                    fill="#3b82f6"
                                    fontWeight={600}
                                >
                                    {fmt(intervalLike.left)}
                                </text>
                            </g>
                        )}

                    {intervalLike.right !== undefined &&
                        intervalLike.right !== Infinity &&
                        intervalLike.right >= X_MIN &&
                        intervalLike.right <= X_MAX && (
                            <g>
                                <circle
                                    cx={scaleX(intervalLike.right)}
                                    cy={originY}
                                    r={6}
                                    fill={intervalLike.rightOpen ? "#fff" : "#3b82f6"}
                                    stroke="#3b82f6"
                                    strokeWidth={2.5}
                                />
                                <text
                                    x={scaleX(intervalLike.right)}
                                    y={originY + 25}
                                    fontSize={12}
                                    textAnchor="middle"
                                    fill="#3b82f6"
                                    fontWeight={600}
                                >
                                    {fmt(intervalLike.right)}
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
    const { isMobile, isTablet } = useBreakpoint();

    const [difficulty, setDifficulty] = useState<Difficulty>("base");
    const [func, setFunc] = useState<FunctionDef>(() => generateFunction("base"));

    const totalSteps = 1 + func.conditions.length + 1; // 1 (tipo) + condizioni + 1 (dominio)
    const { currentStep, nextStep, prevStep, showAll, reset } = useStepNavigation(totalSteps);

    // currentStep 0-based, stepNumber 1-based
    const isActive = (stepNumber: number) => currentStep >= stepNumber - 1;

    const handleGenerate = useCallback(() => {
        setFunc(generateFunction(difficulty));
        reset();
    }, [difficulty, reset]);

    const handleDifficultyChange = useCallback(
        (newDiff: Difficulty) => {
            setDifficulty(newDiff);
            setFunc(generateFunction(newDiff));
            reset();
        },
        [reset]
    );

    const getTypeName = (type: FunctionType): string => {
        const names: Record<FunctionType, string> = {
            razionale: "Funzione razionale fratta",
            radice: "Funzione irrazionale (radice)",
            logaritmo: "Funzione logaritmica",
            esponenziale: "Funzione esponenziale",
            "razionale-radice": "Razionale con radice",
            "logaritmo-radice": "Logaritmo di una radice",
            "razionale-logaritmo": "Razionale con logaritmo",
        };
        return names[type];
    };

    const Controls = (
        <div
            style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
            }}
        >
            <div
                style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    alignItems: "center",
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: "10px 12px",
                }}
            >
                <span style={{ fontWeight: 600, fontSize: 13, color: "#334155", marginRight: 6 }}>Difficoltà</span>
                {(["base", "intermedio", "avanzato"] as Difficulty[]).map((d) => (
                    <button
                        key={d}
                        onClick={() => handleDifficultyChange(d)}
                        style={{
                            padding: "6px 12px",
                            borderRadius: 999,
                            border: difficulty === d ? "2px solid #3b82f6" : "1px solid #cbd5e1",
                            background: difficulty === d ? "#eff6ff" : "#fff",
                            color: difficulty === d ? "#1d4ed8" : "#334155",
                            fontWeight: 600,
                            fontSize: 13,
                            cursor: "pointer",
                            textTransform: "capitalize",
                        }}
                    >
                        {d}
                    </button>
                ))}
            </div>

            <GenerateButton onClick={handleGenerate} text={isMobile ? "Nuova" : "Nuova funzione"} emoji="🎲" />
        </div>
    );

    const StepType = (
        <StepCard title="Riconosci la tipologia" stepNumber={1} color="green" isActive={isActive(1)}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>{getTypeName(func.type)}</div>
        </StepCard>
    );

    const StepConditions = func.conditions.map((cond, idx) => (
        <StepCard
            key={idx}
            title={cond.description}
            stepNumber={2 + idx}
            color="blue"
            isActive={isActive(2 + idx)}
        >
            <div
                style={{
                    fontSize: 18,
                    color: "#334155",
                    marginBottom: 8,
                    padding: "8px 12px",
                    background: "#fff",
                    borderRadius: 8,
                    display: "inline-block",
                    overflowX: "auto",
                    maxWidth: "100%",
                }}
            >
                <Latex>{cond.conditionLatex || cond.condition}</Latex>
            </div>

            <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>Risoluzione:</div>
                {cond.resolution.map((step, i) => (
                    <div
                        key={i}
                        style={{
                            fontSize: 15,
                            color: "#475569",
                            padding: "6px 0",
                            paddingLeft: 12,
                            borderLeft: "2px solid #cbd5e1",
                            overflowX: "auto",
                        }}
                    >
                        <Latex>{step}</Latex>
                    </div>
                ))}
            </div>
        </StepCard>
    ));

    const StepDomain = (
        <StepCard title="Scrivi il dominio" stepNumber={totalSteps} color="amber" isActive={isActive(totalSteps)}>
            <div style={{ display: "grid", gap: 10 }}>
                <div>
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Forma algebrica:</div>
                    <div style={{ fontSize: isMobile ? 18 : 20, color: "#92400e", fontWeight: 600, overflowX: "auto" }}>
                        <Latex>{`D = ${func.domainText}`}</Latex>
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Notazione intervalli:</div>
                    <div style={{ fontSize: isMobile ? 18 : 20, color: "#92400e", fontWeight: 600, overflowX: "auto" }}>
                        <Latex>{`D = ${func.domainInterval}`}</Latex>
                    </div>
                </div>
            </div>
        </StepCard>
    );

    const GraphPanel = (
        <ResponsiveCard>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>📈 Grafico del dominio</div>
            <DomainGraph solution={func.domain} showGraph={isActive(totalSteps)} />
            {isActive(totalSteps) ? (
                <div style={{ marginTop: 10, fontSize: 13, color: "#475569" }}>
                    Le <strong>zone rosse</strong> sono valori di <strong>x</strong> dove la funzione <strong>non è definita</strong>.
                </div>
            ) : (
                <div style={{ marginTop: 10, fontSize: 13, color: "#64748b", fontStyle: "italic" }}>
                    Completa i passaggi per vedere il grafico.
                </div>
            )}
        </ResponsiveCard>
    );

    const Metodo = (
        <ol style={{ margin: 0, paddingLeft: 20 }}>
            <li>
                <strong>Riconosci la tipologia</strong> (razionale, radice, logaritmo, …)
            </li>
            <li>
                <strong>Scrivi le condizioni</strong> (denominatore ≠ 0, radicando ≥ 0, argomento log &gt; 0, …)
            </li>
            <li>
                <strong>Risolvi</strong> le condizioni
            </li>
            <li>
                <strong>Interseca</strong> le soluzioni se ci sono più condizioni
            </li>
            <li>
                <strong>Scrivi</strong> il dominio in forma algebrica e in intervalli
            </li>
        </ol>
    );

    // ============ MOBILE ============

    if (isMobile) {
        return (
            <DemoContainer title="Dominio delle Funzioni" description="Trova il dominio passo dopo passo.">
                {Controls}

                <ProblemCard label="Determina il dominio della funzione">
                    <div style={{ textAlign: "center" }}>
                        <Latex display>{`f(x) = ${func.latex}`}</Latex>
                    </div>
                </ProblemCard>

                <NavigationButtons
                    currentStep={currentStep}
                    totalSteps={totalSteps}
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
                                    {StepType}
                                    {StepConditions}
                                    {StepDomain}
                                </div>
                            ),
                        },
                        { id: "graph", label: "📈 Grafico", content: GraphPanel },
                    ]}
                    defaultTab="steps"
                />

                <CollapsiblePanel title="💡 Metodo" defaultOpen={false}>
                    <div style={{ fontSize: 13, color: "#334155" }}>{Metodo}</div>
                </CollapsiblePanel>
            </DemoContainer>
        );
    }

    // ============ TABLET ============

    if (isTablet) {
        return (
            <DemoContainer title="Dominio delle Funzioni" description="Trova il dominio passo dopo passo.">
                {Controls}

                <ProblemCard label="Determina il dominio della funzione">
                    <div style={{ textAlign: "center" }}>
                        <Latex display>{`f(x) = ${func.latex}`}</Latex>
                    </div>
                </ProblemCard>

                <NavigationButtons
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                    onNext={nextStep}
                    onPrev={prevStep}
                    onShowAll={showAll}
                />

                <ResponsiveGrid columns={{ tablet: 2 }} gap={12}>
                    {StepType}
                    {StepConditions[0] || null}
                </ResponsiveGrid>

                <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
                    {StepConditions.slice(1)}
                    {StepDomain}
                    {GraphPanel}
                </div>

                <div style={{ marginTop: 12 }}>
                    <CollapsiblePanel title="💡 Metodo" defaultOpen={false}>
                        <div style={{ fontSize: 14, color: "#334155" }}>{Metodo}</div>
                    </CollapsiblePanel>
                </div>
            </DemoContainer>
        );
    }

    // ============ DESKTOP ============

    return (
        <DemoContainer title="Dominio delle Funzioni" description="Trova il dominio passo dopo passo.">
            {Controls}

            <ProblemCard label="Determina il dominio della funzione">
                <div style={{ textAlign: "center" }}>
                    <Latex display>{`f(x) = ${func.latex}`}</Latex>
                </div>
            </ProblemCard>

            <NavigationButtons
                currentStep={currentStep}
                totalSteps={totalSteps}
                onNext={nextStep}
                onPrev={prevStep}
                onShowAll={showAll}
            />

            <ResponsiveGrid columns={{ desktop: 2 }} gap={12}>
                {StepType}
                {StepConditions[0] || <div />}
            </ResponsiveGrid>

            <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
                {StepConditions.slice(1)}
                {StepDomain}
            </div>

            <GraphContainer
                title="Rappresentazione grafica del dominio"
                footer={
                    isActive(totalSteps) ? (
                        <>
                            Le <strong>zone rosse</strong> indicano i valori di <strong>x</strong> dove la funzione{" "}
                            <strong>non è definita</strong>.
                        </>
                    ) : (
                        <span style={{ fontStyle: "italic" }}>Completa tutti i passaggi per vedere il grafico</span>
                    )
                }
            >
                <DomainGraph solution={func.domain} showGraph={isActive(totalSteps)} />
            </GraphContainer>

            <InfoBox title="Come determinare il dominio:" variant="blue">
                {Metodo}
            </InfoBox>
        </DemoContainer>
    );
}
