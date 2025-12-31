/**
 * SistemiDisequazioniDemo - Versione con Esercizi Predefiniti
 * Risoluzione guidata di sistemi di disequazioni lineari
 */

import React, { useState, useCallback, useMemo } from "react";

import {
    DemoContainer,
    InfoBox,
    useBreakpoint,
    ResponsiveGrid,
    ResponsiveCard,
    TouchButton,
    SwipeableTabs,
    NavigationButtons,
    StepCard,
    useStepNavigation,
    Latex,
} from "../../components/ui";

import { randomChoice, gcd, InequalitySign, signToSymbol } from "../../utils/math";

// ============ TIPI ============

interface RawInequality {
    original: string;
    simplified: string;
    a: number;
    b: number;
    sign: InequalitySign;
}

interface Exercise {
    id: number;
    level: "base" | "intermedio" | "avanzato";
    inequalities: RawInequality[];
    solution: string;
}

interface Solution {
    type: "all" | "none" | "interval";
    left?: number;
    right?: number;
    leftOpen?: boolean;
    rightOpen?: boolean;
}

// ============ ESERCIZI PREDEFINITI ============

const EXERCISES: Exercise[] = [
    // BASE
    {
        id: 118, level: "base",
        inequalities: [
            { original: "x - 1 > 0", simplified: "x - 1 > 0", a: 1, b: -1, sign: ">" },
            { original: "x - 6 > 0", simplified: "x - 6 > 0", a: 1, b: -6, sign: ">" },
        ],
        solution: "x > 6"
    },
    {
        id: 119, level: "base",
        inequalities: [
            { original: "4x + 6 < 0", simplified: "4x + 6 < 0", a: 4, b: 6, sign: "<" },
            { original: "6x \\geq 0", simplified: "6x \\geq 0", a: 6, b: 0, sign: ">=" },
        ],
        solution: "impossibile"
    },
    {
        id: 120, level: "base",
        inequalities: [
            { original: "x + 4 < 0", simplified: "x + 4 < 0", a: 1, b: 4, sign: "<" },
            { original: "3x < 1", simplified: "3x - 1 < 0", a: 3, b: -1, sign: "<" },
        ],
        solution: "x < -4"
    },
    {
        id: 121, level: "base",
        inequalities: [
            { original: "x + 1 > 0", simplified: "x + 1 > 0", a: 1, b: 1, sign: ">" },
            { original: "-2x \\geq 0", simplified: "-2x \\geq 0", a: -2, b: 0, sign: ">=" },
            { original: "3x + 2 > 0", simplified: "3x + 2 > 0", a: 3, b: 2, sign: ">" },
        ],
        solution: "-2/3 < x ≤ 0"
    },
    {
        id: 1001, level: "base",
        inequalities: [
            { original: "2x - 4 > 0", simplified: "2x - 4 > 0", a: 2, b: -4, sign: ">" },
            { original: "x + 3 < 10", simplified: "x - 7 < 0", a: 1, b: -7, sign: "<" },
        ],
        solution: "2 < x < 7"
    },
    {
        id: 1002, level: "base",
        inequalities: [
            { original: "5x \\leq 15", simplified: "5x - 15 \\leq 0", a: 5, b: -15, sign: "<=" },
            { original: "x - 1 \\geq 0", simplified: "x - 1 \\geq 0", a: 1, b: -1, sign: ">=" },
        ],
        solution: "1 ≤ x ≤ 3"
    },
    // INTERMEDIO
    {
        id: 122, level: "intermedio",
        inequalities: [
            { original: "x - 4 < 0", simplified: "x - 4 < 0", a: 1, b: -4, sign: "<" },
            { original: "2 - x > 0", simplified: "-x + 2 > 0", a: -1, b: 2, sign: ">" },
            { original: "x + 3 > 0", simplified: "x + 3 > 0", a: 1, b: 3, sign: ">" },
        ],
        solution: "-3 < x < 2"
    },
    {
        id: 123, level: "intermedio",
        inequalities: [
            { original: "3x + 9 + 2 < x - 1", simplified: "2x + 12 < 0", a: 2, b: 12, sign: "<" },
            { original: "2x - 3 > x + 7", simplified: "x - 10 > 0", a: 1, b: -10, sign: ">" },
        ],
        solution: "impossibile"
    },
    {
        id: 125, level: "intermedio",
        inequalities: [
            { original: "x + 7 - 3x \\geq -x(x+1) + x^2 - 3 - 2x", simplified: "x + 10 \\geq 0", a: 1, b: 10, sign: ">=" },
            { original: "2x + 3 < 7", simplified: "2x - 4 < 0", a: 2, b: -4, sign: "<" },
        ],
        solution: "-10 ≤ x < 2"
    },
    {
        id: 126, level: "intermedio",
        inequalities: [
            { original: "\\frac{1}{3}(9x + 12) - 10 > 12", simplified: "3x - 18 > 0", a: 3, b: -18, sign: ">" },
            { original: "4x(x-1) + 10 < 4x(x+1) - 6", simplified: "-8x + 16 < 0", a: -8, b: 16, sign: "<" },
        ],
        solution: "x > 6"
    },
    {
        id: 127, level: "intermedio",
        inequalities: [
            { original: "2x(x-1) - 2x^2 + x < 2 - x", simplified: "2x - 2 < 0", a: 2, b: -2, sign: "<" },
            { original: "7x - 1 - 6x > x - 3", simplified: "2 > 0", a: 0, b: 2, sign: ">" },
        ],
        solution: "∀x ∈ ℝ"
    },
    // AVANZATO
    {
        id: 136, level: "avanzato",
        inequalities: [
            { original: "2x - 3 < (x+1)^2 - x(x-1)", simplified: "-4 < 0", a: 0, b: -4, sign: "<" },
            { original: "x + 3 - 2x \\geq 4", simplified: "-x - 1 \\geq 0", a: -1, b: -1, sign: ">=" },
        ],
        solution: "x ≤ -1"
    },
    {
        id: 137, level: "avanzato",
        inequalities: [
            { original: "(x-1)^2 + 2x - 7 < 1 + x^2", simplified: "-6 < 0", a: 0, b: -6, sign: "<" },
            { original: "7x + 1 < 7 + x(x-2) - x^2 + 9x", simplified: "-6 < 0", a: 0, b: -6, sign: "<" },
        ],
        solution: "∀x ∈ ℝ"
    },
    {
        id: 138, level: "avanzato",
        inequalities: [
            { original: "x^2 + 6x - 3 < 2x(x+2) - x^2", simplified: "2x - 3 < 0", a: 2, b: -3, sign: "<" },
            { original: "(x-2)^2 + 3x - 3 > -2x + 1 + x^2", simplified: "x - 8 > 0", a: 1, b: -8, sign: ">" },
        ],
        solution: "impossibile"
    },
    {
        id: 139, level: "avanzato",
        inequalities: [
            { original: "(x+3)^2 - x^2 - 7 < x + 2", simplified: "5x < 0", a: 5, b: 0, sign: "<" },
            { original: "2x > x(x+1) + 4 - x^2", simplified: "x - 4 > 0", a: 1, b: -4, sign: ">" },
        ],
        solution: "impossibile"
    },
    {
        id: 141, level: "avanzato",
        inequalities: [
            { original: "4(\\frac{1}{8}x - 2) - \\frac{x}{4} \\leq -\\frac{x+3}{4}", simplified: "x - 20 \\leq 0", a: 1, b: -20, sign: "<=" },
            { original: "\\frac{1}{3}x + 2 > \\frac{1}{2}x - \\frac{x-5}{6} + 1", simplified: "1 > 0", a: 0, b: 1, sign: ">" },
        ],
        solution: "x ≤ 20"
    },
];

// ============ COSTANTI ============

const COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#a855f7", "#f97316"];
const SVG_WIDTH = 700;
const ROW_HEIGHT = 50;
const PAD_LEFT = 50;
const PAD_RIGHT = 50;

// ============ HELPERS ============

function formatFraction(num: number, den: number): string {
    if (den === 0) return "?";
    if (num === 0) return "0";
    const sign = (num < 0) !== (den < 0) ? "-" : "";
    const n = Math.abs(num);
    const d = Math.abs(den);
    const g = gcd(n, d);
    if (d / g === 1) return `${sign}${n / g}`;
    return `${sign}\\frac{${n / g}}{${d / g}}`;
}

function formatInequalityNormal(ineq: RawInequality): string {
    const { a, b, sign } = ineq;
    if (a === 0) return `${b} ${signToSymbol(sign)} 0`;
    let lhs = a === 1 ? "x" : a === -1 ? "-x" : `${a}x`;
    let rhs = b > 0 ? ` + ${b}` : b < 0 ? ` ${b}` : "";
    return `${lhs}${rhs} ${signToSymbol(sign)} 0`;
}

function solveInequality(ineq: RawInequality): Solution {
    const { a, b, sign } = ineq;
    if (a === 0) {
        const ok = (sign === "<" && b < 0) || (sign === "<=" && b <= 0) ||
            (sign === ">" && b > 0) || (sign === ">=" && b >= 0);
        return { type: ok ? "all" : "none" };
    }
    const boundary = -b / a;
    const isStrict = sign === "<" || sign === ">";
    const isGreater = sign === ">" || sign === ">=";
    const solGreater = a > 0 ? isGreater : !isGreater;
    if (solGreater) return { type: "interval", left: boundary, leftOpen: isStrict, right: Infinity, rightOpen: true };
    return { type: "interval", left: -Infinity, leftOpen: true, right: boundary, rightOpen: isStrict };
}

function intersectSolutions(solutions: Solution[]): Solution {
    let left = -Infinity, right = Infinity;
    let leftOpen = true, rightOpen = true;
    for (const sol of solutions) {
        if (sol.type === "none") return { type: "none" };
        if (sol.type === "all") continue;
        if (sol.left !== undefined && sol.left !== -Infinity) {
            if (sol.left > left) { left = sol.left; leftOpen = sol.leftOpen ?? true; }
            else if (sol.left === left) leftOpen = leftOpen || (sol.leftOpen ?? true);
        }
        if (sol.right !== undefined && sol.right !== Infinity) {
            if (sol.right < right) { right = sol.right; rightOpen = sol.rightOpen ?? true; }
            else if (sol.right === right) rightOpen = rightOpen || (sol.rightOpen ?? true);
        }
    }
    if (left > right || (left === right && (leftOpen || rightOpen))) return { type: "none" };
    if (left === -Infinity && right === Infinity) return { type: "all" };
    return { type: "interval", left, right, leftOpen, rightOpen };
}

function formatSolutionAlgebraic(sol: Solution, inequalities: RawInequality[]): { inequality: string; interval: string } {
    if (sol.type === "none") return { inequality: "\\emptyset", interval: "\\text{impossibile}" };
    if (sol.type === "all") return { inequality: "\\forall x \\in \\mathbb{R}", interval: "\\mathbb{R}" };
    const { left, right, leftOpen, rightOpen } = sol;
    let leftFrac = "", rightFrac = "";
    for (const ineq of inequalities) {
        if (ineq.a !== 0) {
            const b = -ineq.b / ineq.a;
            if (left !== -Infinity && Math.abs(b - left!) < 0.0001) leftFrac = formatFraction(-ineq.b, ineq.a);
            if (right !== Infinity && Math.abs(b - right!) < 0.0001) rightFrac = formatFraction(-ineq.b, ineq.a);
        }
    }
    if (!leftFrac && left !== -Infinity) leftFrac = String(left);
    if (!rightFrac && right !== Infinity) rightFrac = String(right);
    if (left === -Infinity) return {
        inequality: `x ${rightOpen ? "<" : "\\leq"} ${rightFrac}`,
        interval: `(-\\infty, ${rightFrac}${rightOpen ? ")" : "]"}`
    };
    if (right === Infinity) return {
        inequality: `x ${leftOpen ? ">" : "\\geq"} ${leftFrac}`,
        interval: `${leftOpen ? "(" : "["}${leftFrac}, +\\infty)`
    };
    return {
        inequality: `${leftFrac} ${leftOpen ? "<" : "\\leq"} x ${rightOpen ? "<" : "\\leq"} ${rightFrac}`,
        interval: `${leftOpen ? "(" : "["}${leftFrac}, ${rightFrac}${rightOpen ? ")" : "]"}`
    };
}

// ============ COMPONENTE GRAFICO ============

interface SolutionRowProps {
    sol: Solution; y: number; color: string; label: string;
    ineq?: RawInequality; toX: (v: number) => number;
    viewRange: { min: number; max: number }; isMobile?: boolean;
}

function SolutionRow({ sol, y, color, label, ineq, toX, viewRange, isMobile }: SolutionRowProps) {
    const { min, max } = viewRange;
    const r = isMobile ? 8 : 6;
    if (sol.type === "none") return (
        <g>
            <text x={PAD_LEFT - 10} y={y + 5} fontSize={12} textAnchor="end" fill={color} fontWeight={600}>{label}</text>
            <text x={SVG_WIDTH / 2} y={y + 5} fontSize={12} textAnchor="middle" fill="#94a3b8">(∅)</text>
        </g>
    );
    if (sol.type === "all") return (
        <g>
            <text x={PAD_LEFT - 10} y={y + 5} fontSize={12} textAnchor="end" fill={color} fontWeight={600}>{label}</text>
            <line x1={toX(min)} y1={y} x2={toX(max)} y2={y} stroke={color} strokeWidth={4} />
            <polygon points={`${toX(min)},${y} ${toX(min)+10},${y-5} ${toX(min)+10},${y+5}`} fill={color} />
            <polygon points={`${toX(max)},${y} ${toX(max)-10},${y-5} ${toX(max)-10},${y+5}`} fill={color} />
        </g>
    );
    const { left, right, leftOpen, rightOpen } = sol;
    const lx = left === -Infinity ? toX(min) : toX(left!);
    const rx = right === Infinity ? toX(max) : toX(right!);
    const lbl = ineq && ineq.a !== 0 ? formatFraction(-ineq.b, ineq.a).replace(/\\frac\{(\d+)\}\{(\d+)\}/g, "$1/$2") : "";
    return (
        <g>
            <text x={PAD_LEFT - 10} y={y + 5} fontSize={12} textAnchor="end" fill={color} fontWeight={600}>{label}</text>
            <line x1={lx} y1={y} x2={rx} y2={y} stroke={color} strokeWidth={4} />
            {left === -Infinity && <polygon points={`${toX(min)},${y} ${toX(min)+10},${y-5} ${toX(min)+10},${y+5}`} fill={color} />}
            {right === Infinity && <polygon points={`${toX(max)},${y} ${toX(max)-10},${y-5} ${toX(max)-10},${y+5}`} fill={color} />}
            {left !== -Infinity && <>
                <circle cx={lx} cy={y} r={r} fill={leftOpen ? "#fff" : color} stroke={color} strokeWidth={2.5} />
                {lbl && <text x={lx} y={y - 14} fontSize={10} textAnchor="middle" fill={color}>{lbl}</text>}
            </>}
            {right !== Infinity && <>
                <circle cx={rx} cy={y} r={r} fill={rightOpen ? "#fff" : color} stroke={color} strokeWidth={2.5} />
                {lbl && <text x={rx} y={y - 14} fontSize={10} textAnchor="middle" fill={color}>{lbl}</text>}
            </>}
        </g>
    );
}

// ============ COMPONENTE PRINCIPALE ============

export default function SistemiDisequazioniDemo() {
    const { isMobile, isTablet } = useBreakpoint();
    const [selectedLevel, setSelectedLevel] = useState<"base" | "intermedio" | "avanzato">("base");
    const [currentExercise, setCurrentExercise] = useState<Exercise>(() => EXERCISES.filter(e => e.level === "base")[0]);

    const totalSteps = currentExercise.inequalities.length + 3;
    const { currentStep, nextStep, prevStep, showAll, reset } = useStepNavigation(totalSteps);

    const solutions = useMemo(() => currentExercise.inequalities.map(solveInequality), [currentExercise]);
    const intersection = useMemo(() => intersectSolutions(solutions), [solutions]);
    const solutionFormatted = useMemo(() => formatSolutionAlgebraic(intersection, currentExercise.inequalities), [intersection, currentExercise]);

    const handleLevelChange = useCallback((level: "base" | "intermedio" | "avanzato") => {
        setSelectedLevel(level);
        setCurrentExercise(EXERCISES.filter(e => e.level === level)[0]);
        reset();
    }, [reset]);

    const handleNewExercise = useCallback(() => {
        const exs = EXERCISES.filter(e => e.level === selectedLevel && e.id !== currentExercise.id);
        setCurrentExercise(exs.length ? randomChoice(exs) : currentExercise);
        reset();
    }, [selectedLevel, currentExercise, reset]);

    const viewRange = useMemo(() => {
        let min = -10, max = 10;
        for (const sol of solutions) {
            if (sol.type === "interval") {
                if (sol.left !== -Infinity) { min = Math.min(min, sol.left! - 3); max = Math.max(max, sol.left! + 3); }
                if (sol.right !== Infinity) { min = Math.min(min, sol.right! - 3); max = Math.max(max, sol.right! + 3); }
            }
        }
        return { min: Math.floor(min), max: Math.ceil(max) };
    }, [solutions]);

    const toX = (v: number) => PAD_LEFT + ((v - viewRange.min) / (viewRange.max - viewRange.min)) * (SVG_WIDTH - PAD_LEFT - PAD_RIGHT);
    const SVG_HEIGHT = (currentExercise.inequalities.length + 2) * ROW_HEIGHT + 40;
    const ticks = useMemo(() => {
        const r: number[] = [];
        const step = Math.max(1, Math.floor((viewRange.max - viewRange.min) / 10));
        for (let v = Math.ceil(viewRange.min); v <= Math.floor(viewRange.max); v += step) r.push(v);
        return r;
    }, [viewRange]);

    const intersectionBounds = useMemo(() => {
        if (intersection.type === "none") return null;
        if (intersection.type === "all") return { left: viewRange.min, right: viewRange.max };
        return {
            left: intersection.left === -Infinity ? viewRange.min : intersection.left!,
            right: intersection.right === Infinity ? viewRange.max : intersection.right!
        };
    }, [intersection, viewRange]);

    // ============ UI COMPONENTS ============

    const LevelSelector = (
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {(["base", "intermedio", "avanzato"] as const).map(level => (
                <TouchButton key={level} variant={selectedLevel === level ? "primary" : "outline"}
                             onClick={() => handleLevelChange(level)} size={isMobile ? "md" : "sm"}>
                    {level === "base" ? "📗 Base" : level === "intermedio" ? "📙 Intermedio" : "📕 Avanzato"}
                </TouchButton>
            ))}
            <TouchButton variant="outline" onClick={handleNewExercise} size={isMobile ? "md" : "sm"}>
                🎲 Nuovo
            </TouchButton>
        </div>
    );

    const SystemStep = (
        <StepCard stepNumber={0} title="Sistema di disequazioni" color="blue" isActive={true}>
            <div style={{ display: "flex", alignItems: "stretch", gap: 8, padding: "12px 0" }}>
                <svg width="20" height={currentExercise.inequalities.length * 40 + 10} style={{ flexShrink: 0 }}>
                    <path d={`M 18 5 Q 10 5, 10 15 L 10 ${(currentExercise.inequalities.length * 40) / 2 - 10} Q 10 ${(currentExercise.inequalities.length * 40) / 2}, 2 ${(currentExercise.inequalities.length * 40) / 2 + 5} Q 10 ${(currentExercise.inequalities.length * 40) / 2 + 10}, 10 ${(currentExercise.inequalities.length * 40) / 2 + 20} L 10 ${currentExercise.inequalities.length * 40 - 5} Q 10 ${currentExercise.inequalities.length * 40 + 5}, 18 ${currentExercise.inequalities.length * 40 + 5}`}
                          fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <div style={{ flex: 1 }}>
                    {currentExercise.inequalities.map((ineq, i) => (
                        <div key={i} style={{ padding: "8px 0", fontSize: 18, borderLeft: `4px solid ${COLORS[i]}`, paddingLeft: 12, marginBottom: 4 }}>
                            <Latex>{ineq.original}</Latex>
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ fontSize: 12, color: "#64748b" }}>Es. #{currentExercise.id} • {currentExercise.level}</div>
        </StepCard>
    );

    const NormalFormStep = (
        <StepCard stepNumber={1} title="Forma normale" color="amber" isActive={currentStep >= 1}>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
                Riduci alla forma <Latex>{"ax + b \\lessgtr 0"}</Latex>
            </div>
            <div style={{ display: "flex", alignItems: "stretch", gap: 8 }}>
                <svg width="20" height={currentExercise.inequalities.length * 40 + 10} style={{ flexShrink: 0 }}>
                    <path d={`M 18 5 Q 10 5, 10 15 L 10 ${(currentExercise.inequalities.length * 40) / 2 - 10} Q 10 ${(currentExercise.inequalities.length * 40) / 2}, 2 ${(currentExercise.inequalities.length * 40) / 2 + 5} Q 10 ${(currentExercise.inequalities.length * 40) / 2 + 10}, 10 ${(currentExercise.inequalities.length * 40) / 2 + 20} L 10 ${currentExercise.inequalities.length * 40 - 5} Q 10 ${currentExercise.inequalities.length * 40 + 5}, 18 ${currentExercise.inequalities.length * 40 + 5}`}
                          fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <div style={{ flex: 1 }}>
                    {currentExercise.inequalities.map((ineq, i) => (
                        <div key={i} style={{ padding: "8px 12px", fontSize: 16, background: "#f8fafc", borderRadius: 6, borderLeft: `4px solid ${COLORS[i]}`, marginBottom: 6 }}>
                            <Latex>{formatInequalityNormal(ineq)}</Latex>
                        </div>
                    ))}
                </div>
            </div>
        </StepCard>
    );

    const InequalitySteps = currentExercise.inequalities.map((ineq, i) => {
        const sol = solutions[i];
        const frac = ineq.a !== 0 ? formatFraction(-ineq.b, ineq.a) : "";
        return (
            <StepCard key={i} stepNumber={i + 2} title={`Disequazione ${i + 1}`}
                      color={i === 0 ? "red" : i === 1 ? "blue" : "green"} isActive={currentStep >= i + 2}>
                <div style={{ fontSize: 18, fontWeight: 600, color: COLORS[i], marginBottom: 8, padding: "8px 12px", background: "#f8fafc", borderRadius: 6, display: "inline-block" }}>
                    <Latex>{formatInequalityNormal(ineq)}</Latex>
                </div>
                {ineq.a === 0 ? (
                    <div style={{ fontSize: 14, color: "#64748b", marginTop: 8 }}>
                        {sol.type === "all" ? "✓ Sempre vera" : "✗ Mai vera"}
                    </div>
                ) : (
                    <div style={{ fontSize: 14, color: "#475569", marginTop: 8 }}>
                        <div style={{ marginBottom: 4 }}><strong>Isolo x:</strong></div>
                        <div style={{ padding: "8px 12px", background: "#fff", borderRadius: 6, borderLeft: `3px solid ${COLORS[i]}`, marginBottom: 8, fontSize: 18 }}>
                            <Latex>{`x ${(ineq.a > 0) === (ineq.sign === ">" || ineq.sign === ">=") ? (sol.leftOpen ? ">" : "\\geq") : (sol.rightOpen ? "<" : "\\leq")} ${frac}`}</Latex>
                            {ineq.a < 0 && <span style={{ color: "#dc2626", marginLeft: 12, fontSize: 12 }}>⚠️ cambio verso!</span>}
                        </div>
                        <div style={{ fontSize: 13, color: "#64748b" }}>
                            <strong>S{i + 1}:</strong> {sol.type === "interval" && sol.left === -Infinity
                            ? <Latex>{`(-\\infty, ${frac}${sol.rightOpen ? ")" : "]"}`}</Latex>
                            : <Latex>{`${sol.leftOpen ? "(" : "["}${frac}, +\\infty)`}</Latex>}
                        </div>
                    </div>
                )}
            </StepCard>
        );
    });

    const FinalStep = (
        <StepCard stepNumber={currentExercise.inequalities.length + 2} title="Soluzione"
                  color={intersection.type === "none" ? "red" : "green"} isActive={currentStep >= currentExercise.inequalities.length + 2}>
            <div style={{ fontSize: 14, color: "#64748b", marginBottom: 12 }}>
                Intersezione: {solutions.map((_, i) => <span key={i} style={{ color: COLORS[i], fontWeight: 600 }}>S{i + 1}</span>).reduce((a, b, i) => <>{a} ∩ {b}</> as any)}
            </div>
            <div style={{ background: intersection.type === "none" ? "#fef2f2" : "#f0fdf4", borderRadius: 8, padding: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 8, color: intersection.type === "none" ? "#991b1b" : "#166534", fontSize: 18 }}>
                    {intersection.type === "none" ? "✗ Impossibile" : "✓ Soluzione"}
                </div>
                <div style={{ fontSize: 22, color: intersection.type === "none" ? "#991b1b" : "#166534", fontWeight: 500, marginBottom: 4 }}>
                    <Latex>{solutionFormatted.inequality}</Latex>
                </div>
                <div style={{ fontSize: 14, color: intersection.type === "none" ? "#b91c1c" : "#15803d" }}>
                    <Latex>{solutionFormatted.interval}</Latex>
                </div>
            </div>
        </StepCard>
    );

    const GraphPanel = (
        <ResponsiveCard>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>📊 Grafico</div>
            <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} style={{ width: "100%", height: "auto" }}>
                <rect x={0} y={0} width={SVG_WIDTH} height={SVG_HEIGHT} fill="#fafafa" rx={8} />
                {currentStep >= currentExercise.inequalities.length + 2 && intersectionBounds && (
                    <rect x={toX(intersectionBounds.left)} y={ROW_HEIGHT} width={toX(intersectionBounds.right) - toX(intersectionBounds.left)}
                          height={(currentExercise.inequalities.length + 1) * ROW_HEIGHT} fill="rgba(34, 197, 94, 0.2)" />
                )}
                {currentExercise.inequalities.map((ineq, i) => currentStep >= i + 2 && (
                    <SolutionRow key={i} sol={solutions[i]} y={ROW_HEIGHT * (i + 1) + 25} color={COLORS[i]}
                                 label={`D${i + 1}`} ineq={ineq} toX={toX} viewRange={viewRange} isMobile={isMobile} />
                ))}
                <line x1={PAD_LEFT} y1={SVG_HEIGHT - 50} x2={SVG_WIDTH - PAD_RIGHT} y2={SVG_HEIGHT - 50} stroke="#374151" strokeWidth={2} />
                {ticks.map(v => (
                    <g key={v}>
                        <line x1={toX(v)} y1={SVG_HEIGHT - 54} x2={toX(v)} y2={SVG_HEIGHT - 46} stroke="#374151" strokeWidth={1} />
                        <text x={toX(v)} y={SVG_HEIGHT - 32} fontSize={11} textAnchor="middle" fill="#64748b">{v}</text>
                    </g>
                ))}
                {currentStep >= currentExercise.inequalities.length + 2 && (
                    <SolutionRow sol={intersection} y={SVG_HEIGHT - 80} color="#166534" label="∩" toX={toX} viewRange={viewRange} isMobile={isMobile} />
                )}
            </svg>
        </ResponsiveCard>
    );

    const StepsColumn = (
        <div style={{ display: "grid", gap: 12 }}>
            {SystemStep}
            {currentStep >= 1 && NormalFormStep}
            {InequalitySteps.map((s, i) => currentStep >= i + 2 && <React.Fragment key={i}>{s}</React.Fragment>)}
            {currentStep >= currentExercise.inequalities.length + 2 && FinalStep}
        </div>
    );

    // ============ LAYOUTS ============

    if (isMobile) {
        return (
            <DemoContainer title="Sistemi disequazioni" description="Risoluzione guidata">
                {LevelSelector}
                <NavigationButtons currentStep={currentStep} totalSteps={totalSteps} onNext={nextStep} onPrev={prevStep} onShowAll={showAll} />
                <SwipeableTabs tabs={[
                    { id: "steps", label: "📝 Procedimento", content: StepsColumn },
                    { id: "graph", label: "📊 Grafico", content: GraphPanel },
                ]} defaultTab="steps" />
            </DemoContainer>
        );
    }

    if (isTablet) {
        return (
            <DemoContainer title="Sistemi di Disequazioni" description="Risoluzione guidata step-by-step">
                {LevelSelector}
                <NavigationButtons currentStep={currentStep} totalSteps={totalSteps} onNext={nextStep} onPrev={prevStep} onShowAll={showAll} />
                <ResponsiveGrid columns={{ tablet: 2 }} gap={16}>
                    <div>{StepsColumn}</div>
                    <div>{GraphPanel}</div>
                </ResponsiveGrid>
            </DemoContainer>
        );
    }

    return (
        <DemoContainer title="Sistemi di Disequazioni Lineari" description="Risoluzione guidata step-by-step" maxWidth={1300}>
            {LevelSelector}
            <NavigationButtons currentStep={currentStep} totalSteps={totalSteps} onNext={nextStep} onPrev={prevStep} onShowAll={showAll} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>{StepsColumn}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {GraphPanel}
                    <InfoBox title="Come funziona:">
                        <ol style={{ margin: "8px 0 0 0", paddingLeft: 20 }}>
                            <li>Riduci ogni disequazione in <strong>forma normale</strong></li>
                            <li>Risolvi ogni disequazione singolarmente</li>
                            <li>Rappresenta le soluzioni sulla retta</li>
                            <li>La soluzione è l'<strong>intersezione</strong></li>
                        </ol>
                    </InfoBox>
                </div>
            </div>
        </DemoContainer>
    );
}