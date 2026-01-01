/**
 * SistemiDisequazioniDemo - Versione con Esercizi Predefiniti
 * Risoluzione guidata di sistemi di disequazioni lineari
 * + CollapsibleExplanation con passaggi algebrici completi
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
    CollapsibleExplanation,
} from "../../components/ui";

import { randomChoice, gcd, signToSymbol } from "../../utils/math";
import { SistemiDisequazioniexExercises, RawInequality, Exercise } from "./sistemiDisequazioniexExercises";

// ============ TIPI ============

interface Solution {
    type: "all" | "none" | "interval";
    left?: number;
    right?: number;
    leftOpen?: boolean;
    rightOpen?: boolean;
}

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
            <polygon points={`${toX(min)},${y} ${toX(min) + 10},${y - 5} ${toX(min) + 10},${y + 5}`} fill={color} />
            <polygon points={`${toX(max)},${y} ${toX(max) - 10},${y - 5} ${toX(max) - 10},${y + 5}`} fill={color} />
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
            {left === -Infinity && <polygon points={`${toX(min)},${y} ${toX(min) + 10},${y - 5} ${toX(min) + 10},${y + 5}`} fill={color} />}
            {right === Infinity && <polygon points={`${toX(max)},${y} ${toX(max) - 10},${y - 5} ${toX(max) - 10},${y + 5}`} fill={color} />}
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
    const [currentExercise, setCurrentExercise] = useState<Exercise>(() => SistemiDisequazioniexExercises.filter(e => e.level === "base")[0]);

    const totalSteps = currentExercise.inequalities.length + 2;
    const { currentStep, nextStep, prevStep, showAll, reset } = useStepNavigation(totalSteps);

    const solutions = useMemo(() => currentExercise.inequalities.map(solveInequality), [currentExercise]);
    const intersection = useMemo(() => intersectSolutions(solutions), [solutions]);
    const solutionFormatted = useMemo(
        () => formatSolutionAlgebraic(intersection, currentExercise.inequalities),
        [intersection, currentExercise]
    );

    const handleLevelChange = useCallback((level: "base" | "intermedio" | "avanzato") => {
        setSelectedLevel(level);
        setCurrentExercise(SistemiDisequazioniexExercises.filter(e => e.level === level)[0]);
        reset();
    }, [reset]);

    const handleNewExercise = useCallback(() => {
        const exs = SistemiDisequazioniexExercises.filter(e => e.level === selectedLevel && e.id !== currentExercise.id);
        setCurrentExercise(randomChoice(exs.length ? exs : SistemiDisequazioniexExercises.filter(e => e.level === selectedLevel)));
        reset();
    }, [selectedLevel, currentExercise.id, reset]);

    // ============ VIEW RANGE & TICKS ============

    const viewRange = useMemo(() => {
        const bounds = solutions
            .flatMap((s) => (s.type === "interval" ? [s.left!, s.right!] : []))
            .filter((x) => x !== Infinity && x !== -Infinity && !Number.isNaN(x));

        const minB = bounds.length ? Math.min(...bounds) : -5;
        const maxB = bounds.length ? Math.max(...bounds) : 5;

        const pad = Math.max(2, (maxB - minB) * 0.25);
        return { min: Math.floor(minB - pad), max: Math.ceil(maxB + pad) };
    }, [solutions]);

    const toX = useCallback((v: number) => {
        const { min, max } = viewRange;
        const span = max - min;
        return PAD_LEFT + ((v - min) / span) * (SVG_WIDTH - PAD_LEFT - PAD_RIGHT);
    }, [viewRange]);

    const ticks = useMemo(() => {
        const { min, max } = viewRange;
        const step = Math.max(1, Math.round((max - min) / 8));
        const arr: number[] = [];
        for (let v = min; v <= max; v += step) arr.push(v);
        return arr;
    }, [viewRange]);

    const SVG_HEIGHT = useMemo(() => {
        const rows = currentExercise.inequalities.length + 2;
        return rows * ROW_HEIGHT + 70;
    }, [currentExercise]);

    const intersectionBounds = useMemo(() => {
        if (intersection.type !== "interval") return null;
        return {
            left: intersection.left === -Infinity ? viewRange.min : intersection.left!,
            right: intersection.right === Infinity ? viewRange.max : intersection.right!,
        };
    }, [intersection, viewRange]);

    // ============ UI ============

    const LevelSelector = (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {(["base", "intermedio", "avanzato"] as const).map(level => (
                <TouchButton key={level} variant={selectedLevel === level ? "primary" : "outline"} onClick={() => handleLevelChange(level)} size={isMobile ? "md" : "sm"}>
                    {level === "base" ? "📗 Base" : level === "intermedio" ? "📙 Intermedio" : "📕 Avanzato"}
                </TouchButton>
            ))}
            <TouchButton variant="outline" onClick={handleNewExercise} size={isMobile ? "md" : "sm"}>🎲 Nuovo</TouchButton>
        </div>
    );

    const SystemStep = (
        <StepCard stepNumber={0} title="Sistema di disequazioni" color="blue" isActive={true}>
            <div style={{ display: "flex", alignItems: "stretch", gap: 8, padding: "12px 0" }}>
                <svg width="20" height={currentExercise.inequalities.length * 40 + 10} style={{ flexShrink: 0 }}>
                    <path d={`M 18 5 Q 10 5, 10 15 L 10 ${(currentExercise.inequalities.length * 40) / 2 - 10} Q 10 ${(currentExercise.inequalities.length * 40) / 2}, 2 ${(currentExercise.inequalities.length * 40) / 2 + 5} Q 10 ${(currentExercise.inequalities.length * 40) / 2 + 10}, 10 ${(currentExercise.inequalities.length * 40) / 2 + 20} L 10 ${currentExercise.inequalities.length * 40 - 5} Q 10 ${currentExercise.inequalities.length * 40 + 5}, 18 ${currentExercise.inequalities.length * 40 + 5}`} fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <div style={{ flex: 1 }}>
                    {currentExercise.inequalities.map((ineq, i) => (
                        <div key={i} style={{ padding: "8px 0", fontSize: 18, borderLeft: `4px solid ${COLORS[i]}`, paddingLeft: 12, marginBottom: 4 }}>
                            <Latex>{ineq.original}</Latex>
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>Es. #{currentExercise.id} • {currentExercise.level}</div>
            <CollapsibleExplanation title="Cos'è un sistema di disequazioni?">
                <p style={{ margin: "0 0 8px 0" }}>Un <strong>sistema di disequazioni</strong> è un insieme di disequazioni che devono essere verificate <em>contemporaneamente</em>.</p>
                <p style={{ margin: "0 0 8px 0" }}>La soluzione è l'<strong>intersezione</strong> (∩) delle soluzioni di ciascuna disequazione.</p>
                <p style={{ margin: 0 }}><strong>Procedimento:</strong> risolvi ogni disequazione separatamente, poi trova i valori comuni.</p>
            </CollapsibleExplanation>
        </StepCard>
    );

    // ✅ QUI: CollapsibleExplanation dentro lo StepCard, tra prima e ultima riga
    const InequalitySteps = currentExercise.inequalities.map((ineq, i) => {
        const sol = solutions[i];
        const frac = ineq.a !== 0 ? formatFraction(-ineq.b, ineq.a) : "";

        // Segno della soluzione in forma x ⋚ valore (tenendo conto del cambio verso se a < 0)
        const resultSign =
            (ineq.a > 0) === (ineq.sign === ">" || ineq.sign === ">=")
                ? (sol.type === "interval" ? (sol.leftOpen ? ">" : "\\geq") : ">")
                : (sol.type === "interval" ? (sol.rightOpen ? "<" : "\\leq") : "<");

        const steps = ineq.steps ?? [];
        const lastStep = steps.length > 0 ? steps[steps.length - 1] : null;
        const intermediateSteps = steps.length > 1 ? steps.slice(0, -1) : [];

        return (
            <StepCard
                key={i}
                stepNumber={i + 1}
                title={`Disequazione ${i + 1}`}
                color={i === 0 ? "red" : i === 1 ? "blue" : "green"}
                isActive={currentStep >= i + 1}
            >
                {/* 1) Prima riga: disequazione di partenza */}
                <div
                    style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: COLORS[i],
                        marginBottom: 10,
                        padding: "8px 12px",
                        background: "#f8fafc",
                        borderRadius: 6,
                        display: "inline-block",
                    }}
                >
                    <Latex>{ineq.original}</Latex>
                </div>

                {/* 2) Spiegazione estendibile (dentro lo step, tra prima e ultima riga) */}
                {currentStep >= i + 1 && (
                    <CollapsibleExplanation title={`Passaggi algebrici - Disequazione ${i + 1}`}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {intermediateSteps.length > 0 ? (
                                intermediateSteps.map((s, j) => (
                                    <div
                                        key={j}
                                        style={{
                                            padding: "6px 10px",
                                            background: "#fff",
                                            borderRadius: 4,
                                            borderLeft: "3px solid #e2e8f0",
                                            fontSize: 16,
                                        }}
                                    >
                                        <Latex>{s}</Latex>
                                    </div>
                                ))
                            ) : (
                                <div style={{ fontSize: 13, color: "#64748b" }}>
                                    Nessun passaggio intermedio (si passa direttamente al risultato).
                                </div>
                            )}
                        </div>
                    </CollapsibleExplanation>
                )}

                {/* 3) Ultima riga: risultato + insieme soluzione */}
                {ineq.a === 0 ? (
                    <div
                        style={{
                            fontSize: 14,
                            padding: "8px 12px",
                            background: sol.type === "all" ? "#f0fdf4" : "#fef2f2",
                            borderRadius: 6,
                            color: sol.type === "all" ? "#166534" : "#991b1b",
                            fontWeight: 600,
                            marginTop: 8,
                        }}
                    >
                        {sol.type === "all" ? "✓ Sempre vera → S = ℝ" : "✗ Mai vera → S = ∅"}
                    </div>
                ) : (
                    <div style={{ fontSize: 14, color: "#475569", marginTop: 8 }}>
                        <div
                            style={{
                                padding: "8px 12px",
                                background: "#fff",
                                borderRadius: 6,
                                borderLeft: `3px solid ${COLORS[i]}`,
                                marginBottom: 8,
                                fontSize: 18,
                            }}
                        >
                            {/* Se ho i passaggi, mostro come ultima riga l'ultimo passaggio;
                                altrimenti mostro la soluzione sintetica */}
                            <Latex>{lastStep ?? `x ${resultSign} ${frac}`}</Latex>
                            {ineq.a < 0 && (
                                <span style={{ color: "#dc2626", marginLeft: 12, fontSize: 12 }}>
                                    ⚠️ verso invertito
                                </span>
                            )}
                        </div>

                        <div style={{ fontSize: 13, color: "#64748b" }}>
                            <strong>
                                S<sub>{i + 1}</sub>:
                            </strong>{" "}
                            {sol.type === "interval" && sol.left === -Infinity ? (
                                <Latex>{`(-\\infty, ${frac}${sol.rightOpen ? ")" : "]"}`}</Latex>
                            ) : sol.type === "interval" ? (
                                <Latex>{`${sol.leftOpen ? "(" : "["}${frac}, +\\infty)`}</Latex>
                            ) : (
                                <Latex>{"\\emptyset"}</Latex>
                            )}
                        </div>
                    </div>
                )}
            </StepCard>
        );
    });

    const FinalStep = (
        <StepCard stepNumber={currentExercise.inequalities.length + 1} title="Soluzione" color={intersection.type === "none" ? "red" : "green"} isActive={currentStep >= currentExercise.inequalities.length + 1}>
            <div style={{ fontSize: 14, color: "#64748b", marginBottom: 12 }}>
                Intersezione: {solutions.map((_, i) => <span key={i} style={{ color: COLORS[i], fontWeight: 600 }}>S<sub>{i + 1}</sub></span>).reduce((a, b) => <>{a} ∩ {b}</> as any)}
            </div>
            <div style={{ background: intersection.type === "none" ? "#fef2f2" : "#f0fdf4", borderRadius: 8, padding: 16, marginBottom: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 8, color: intersection.type === "none" ? "#991b1b" : "#166534", fontSize: 18 }}>
                    {intersection.type === "none" ? "✗ Impossibile" : intersection.type === "all" ? "✓ Sempre verificato" : "✓ Soluzione"}
                </div>
                <div style={{ fontSize: 22, color: intersection.type === "none" ? "#991b1b" : "#166534", fontWeight: 500, marginBottom: 4 }}>
                    <Latex>{solutionFormatted.inequality}</Latex>
                </div>
                <div style={{ fontSize: 14, color: intersection.type === "none" ? "#b91c1c" : "#15803d" }}>
                    <Latex>{solutionFormatted.interval}</Latex>
                </div>
            </div>
            <CollapsibleExplanation title="Come si trova l'intersezione?">
                {intersection.type === "none" ? (
                    <p style={{ margin: 0 }}><strong>Sistema impossibile:</strong> le soluzioni non hanno valori in comune.</p>
                ) : intersection.type === "all" ? (
                    <p style={{ margin: 0 }}><strong>Sempre verificato:</strong> tutte le disequazioni sono "sempre vere".</p>
                ) : (
                    <>
                        <p style={{ margin: "0 0 8px 0" }}>L'<strong>intersezione</strong> è dove tutti gli intervalli si sovrappongono.</p>
                        <p style={{ margin: "0 0 4px 0" }}>• <strong>Estremo sinistro:</strong> il più grande tra gli estremi sinistri</p>
                        <p style={{ margin: "0 0 4px 0" }}>• <strong>Estremo destro:</strong> il più piccolo tra gli estremi destri</p>
                        <p style={{ margin: 0 }}>• <strong>Parentesi:</strong> tonda se escluso, quadra se incluso</p>
                    </>
                )}
            </CollapsibleExplanation>
        </StepCard>
    );

    const GraphPanel = (
        <ResponsiveCard>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>📊 Grafico</div>
            <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} style={{ width: "100%", height: "auto" }}>
                <rect x={0} y={0} width={SVG_WIDTH} height={SVG_HEIGHT} fill="#fafafa" rx={8} />
                {currentStep >= currentExercise.inequalities.length + 1 && intersectionBounds && (
                    <rect x={toX(intersectionBounds.left)} y={ROW_HEIGHT} width={toX(intersectionBounds.right) - toX(intersectionBounds.left)} height={(currentExercise.inequalities.length + 1) * ROW_HEIGHT} fill="rgba(34, 197, 94, 0.2)" />
                )}
                {currentExercise.inequalities.map((ineq, i) => currentStep >= i + 1 && (
                    <SolutionRow key={i} sol={solutions[i]} y={ROW_HEIGHT * (i + 1) + 25} color={COLORS[i]} label={`D${i + 1}`} ineq={ineq} toX={toX} viewRange={viewRange} isMobile={isMobile} />
                ))}
                <line x1={PAD_LEFT} y1={SVG_HEIGHT - 50} x2={SVG_WIDTH - PAD_RIGHT} y2={SVG_HEIGHT - 50} stroke="#374151" strokeWidth={2} />
                {ticks.map(v => (
                    <g key={v}>
                        <line x1={toX(v)} y1={SVG_HEIGHT - 54} x2={toX(v)} y2={SVG_HEIGHT - 46} stroke="#374151" strokeWidth={1} />
                        <text x={toX(v)} y={SVG_HEIGHT - 32} fontSize={11} textAnchor="middle" fill="#64748b">{v}</text>
                    </g>
                ))}
                {currentStep >= currentExercise.inequalities.length + 1 && (
                    <SolutionRow sol={intersection} y={SVG_HEIGHT - 80} color="#166534" label="∩" toX={toX} viewRange={viewRange} isMobile={isMobile} />
                )}
            </svg>
        </ResponsiveCard>
    );

    const StepsColumn = (
        <div style={{ display: "grid", gap: 12 }}>
            {SystemStep}
            {InequalitySteps.map((s, i) => currentStep >= i + 1 && <React.Fragment key={i}>{s}</React.Fragment>)}
            {currentStep >= currentExercise.inequalities.length + 1 && FinalStep}
        </div>
    );

    // ============ LAYOUTS ============

    if (isMobile) {
        return (
            <DemoContainer title="Sistemi disequazioni" description="Risoluzione guidata">
                {LevelSelector}
                <NavigationButtons currentStep={currentStep} totalSteps={totalSteps} onNext={nextStep} onPrev={prevStep} onShowAll={showAll} />
                <SwipeableTabs tabs={[{ id: "steps", label: "📝 Procedimento", content: StepsColumn }, { id: "graph", label: "📊 Grafico", content: GraphPanel }]} defaultTab="steps" />
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
