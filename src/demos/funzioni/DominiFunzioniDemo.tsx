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
} from "../../components/ui";
import {
    randomInt,
    randomNonZero,
    formatFractionLatex,
    formatNumberLatex,
    formatLinearLatex,
    intervalLatex,
    setLatex,
    emptySetLatex,
    realSetLatex,
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

    return {
        expression: `(${numerator}) / (${denominator})`,
        latex: `\\frac{${numeratorLatex}}{${denominatorLatex}}`,
        type: "razionale",
        conditions: [
            {
                description: "Funzione razionale fratta: il denominatore deve essere diverso da zero",
                condition: `${denominator} ≠ 0`,
                conditionLatex: `${denominatorLatex} \\neq 0`,
                resolution: [
                    `${denominatorLatex} \\neq 0`,
                    `${a}x \\neq ${-b}`,
                    `x \\neq ${rootLatex}`,
                ],
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

    const radicando = formatLinearLatex(a, b);
    const radicandoLatex = formatLinearLatex(a, b);

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

    const esponente = formatLinearLatex(a, b);
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
    const a = randomNonZero(1, 5);
    const b = randomInt(-10, 10);
    const root = -b / a;
    const rootLatex = formatFractionLatex(-b, a);

    const radicando = formatLinearLatex(a, b);
    const radicandoLatex = formatLinearLatex(a, b);

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

    const argomento = formatLinearLatex(a, b);
    const argomentoLatex = formatLinearLatex(a, b);

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

    const argomento = formatLinearLatex(a, b);
    const argomentoLatex = formatLinearLatex(a, b);

    const excludePoint = (1 - b) / a;
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
            {/* Sfondo e griglia */}
            <rect x={0} y={0} width={SVG_WIDTH} height={SVG_HEIGHT} fill="#fafafa" stroke="#ddd" rx={8} />
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

            {/* Assi */}
            <line x1={PADDING} y1={originY} x2={SVG_WIDTH - PADDING} y2={originY} stroke="#374151" strokeWidth={2} />
            <line x1={originX} y1={SVG_HEIGHT - PADDING} x2={originX} y2={PADDING} stroke="#374151" strokeWidth={2} />

            {/* Frecce e etichette assi */}
            <polygon
                points={`${SVG_WIDTH - PADDING},${originY} ${SVG_WIDTH - PADDING - 8},${originY - 4} ${SVG_WIDTH - PADDING - 8},${originY + 4}`}
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

            {/* Tacche assi */}
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

    const totalSteps = 2 + func.conditions.length + 1;
    const { currentStep, nextStep, prevStep, showAll, reset } = useStepNavigation(totalSteps);

    const handleGenerate = useCallback(() => {
        setFunc(generateFunction(difficulty));
        reset(); // Resetta lo step corrente a 0
    }, [difficulty, reset]);

    const handleDifficultyChange = (newDiff: Difficulty) => {
        setDifficulty(newDiff);
        setFunc(generateFunction(newDiff));
        reset(); // Resetta anche quando cambia la difficoltà
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
        <DemoContainer
            title="Dominio delle Funzioni"
            description="Impara a determinare il dominio di una funzione passo dopo passo."
        >
            {/* Controlli */}
            <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ background: "#fff", borderRadius: 12, padding: "12px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
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
                <GenerateButton onClick={handleGenerate} text="Nuova funzione" emoji="🎲" />
            </div>

            {/* Funzione */}
            <ProblemCard label="Determina il dominio della funzione">
                <Latex display>{`f(x) = ${func.latex}`}</Latex>
            </ProblemCard>

            {/* Passaggi */}
            <div style={{ background: "#fff", borderRadius: 12, padding: 20, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
                <NavigationButtons
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                    onNext={nextStep}
                    onPrev={prevStep}
                    onShowAll={showAll}
                />

                {/* Step 1: Tipologia */}
                <StepCard
                    title="Riconosci la tipologia"
                    stepNumber={1}
                    color="green"
                    isActive={currentStep >= 1}
                >
                    {getTypeName(func.type)}
                </StepCard>

                {/* Step 2+: Condizioni */}
                {func.conditions.map((cond, idx) => (
                    <StepCard
                        key={idx}
                        title={cond.description}
                        stepNumber={2 + idx}
                        color="blue"
                        isActive={currentStep >= 2 + idx}
                    >
                        <div style={{ fontSize: 18, color: "#334155", marginBottom: 8, padding: "8px 12px", background: "#fff", borderRadius: 6, display: "inline-block" }}>
                            <Latex>{cond.conditionLatex || cond.condition}</Latex>
                        </div>
                        <div style={{ marginTop: 8 }}>
                            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>Risoluzione:</div>
                            {cond.resolution.map((step, i) => (
                                <div key={i} style={{ fontSize: 15, color: "#475569", padding: "6px 0", paddingLeft: 12, borderLeft: "2px solid #cbd5e1" }}>
                                    <Latex>{step}</Latex>
                                </div>
                            ))}
                        </div>
                    </StepCard>
                ))}

                {/* Step finale: Dominio */}
                <StepCard
                    title="Scrivi il dominio"
                    stepNumber={totalSteps}
                    color="amber"
                    isActive={currentStep >= totalSteps - 1}
                >
                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
                        <div>
                            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Forma algebrica:</div>
                            <div style={{ fontSize: 20, color: "#92400e", fontWeight: 500 }}>
                                <Latex>{`D = ${func.domainText}`}</Latex>
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Notazione intervalli:</div>
                            <div style={{ fontSize: 20, color: "#92400e", fontWeight: 500 }}>
                                <Latex>{`D = ${func.domainInterval}`}</Latex>
                            </div>
                        </div>
                    </div>
                </StepCard>
            </div>

            {/* Grafico */}
            <GraphContainer
                title="Rappresentazione grafica del dominio"
                footer={
                    currentStep >= totalSteps - 1 ? (
                        <>
                            Le <strong>zone rosse</strong> indicano i valori di x dove la funzione <strong>non è definita</strong>.
                        </>
                    ) : (
                        <span style={{ fontStyle: "italic" }}>Completa tutti i passaggi per vedere il grafico</span>
                    )
                }
            >
                <DomainGraph solution={func.domain} showGraph={currentStep >= totalSteps - 1} />
            </GraphContainer>

            {/* Spiegazione */}
            <InfoBox title="Come determinare il dominio:" variant="blue">
                <ol style={{ margin: "8px 0 0 0", paddingLeft: 20 }}>
                    <li><strong>Riconosci la tipologia</strong> della funzione (razionale, irrazionale, logaritmica, ecc.)</li>
                    <li><strong>Scrivi le condizioni</strong> di esistenza (denominatore ≠ 0, radicando ≥ 0, argomento log {">"} 0, ecc.)</li>
                    <li><strong>Risolvi</strong> le disequazioni o equazioni associate</li>
                    <li><strong>Interseca</strong> le soluzioni se ci sono più condizioni</li>
                    <li><strong>Scrivi</strong> il dominio in forma algebrica e come intervallo</li>
                </ol>
            </InfoBox>
        </DemoContainer>
    );
}
