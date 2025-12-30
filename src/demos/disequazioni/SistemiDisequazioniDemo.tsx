/**
 * SistemiDisequazioniDemo - Versione Responsive con Step-by-Step
 * Risoluzione guidata di sistemi di disequazioni lineari
 * Ottimizzato per mobile, tablet e desktop
 */

import React, { useState, useCallback, useMemo } from "react";

// Componenti UI
import {
    DemoContainer,
    InfoBox,
    GenerateButton,
    useBreakpoint,
    ResponsiveGrid,
    ResponsiveCard,
    TouchButton,
    CollapsiblePanel,
    SwipeableTabs,
    NavigationButtons,
    StepCard,
    useStepNavigation,
} from "../../components/ui";

// Utility matematiche
import {
    randomInt,
    randomChoice,
    gcd,
    InequalitySign,
    signToSymbol,
} from "../../utils/math";

// ============ TIPI ============

interface Inequality {
    a: number;
    b: number;
    sign: InequalitySign;
}

interface Solution {
    type: "all" | "none" | "interval";
    left?: number;
    right?: number;
    leftOpen?: boolean;
    rightOpen?: boolean;
}

// ============ COSTANTI ============

const COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#a855f7", "#f97316", "#14b8a6"];
const SIGNS: InequalitySign[] = ["<", ">", "<=", ">="];

// ============ HELPERS ============

function formatFraction(num: number, den: number): string {
    if (den === 0) return "indefinito";
    if (num === 0) return "0";

    const sign = (num < 0) !== (den < 0) ? "−" : "";
    const n = Math.abs(num);
    const d = Math.abs(den);
    const g = gcd(n, d);

    if (d / g === 1) return `${sign}${n / g}`;
    return `${sign}${n / g}/${d / g}`;
}

function formatInequality(ineq: Inequality): string {
    const { a, b, sign } = ineq;
    let lhs = a === 1 ? "x" : a === -1 ? "−x" : a > 0 ? `${a}x` : `−${Math.abs(a)}x`;
    let rhs = b > 0 ? ` + ${b}` : b < 0 ? ` − ${Math.abs(b)}` : "";
    return `${lhs}${rhs} ${signToSymbol(sign)} 0`;
}

function solveInequality(ineq: Inequality): Solution {
    const { a, b, sign } = ineq;

    if (a === 0) {
        const satisfied =
            (sign === "<" && b < 0) || (sign === "<=" && b <= 0) ||
            (sign === ">" && b > 0) || (sign === ">=" && b >= 0);
        return { type: satisfied ? "all" : "none" };
    }

    const boundary = -b / a;
    const isStrict = sign === "<" || sign === ">";
    const isGreater = sign === ">" || sign === ">=";
    const solutionIsGreater = a > 0 ? isGreater : !isGreater;

    if (solutionIsGreater) {
        return { type: "interval", left: boundary, leftOpen: isStrict, right: Infinity, rightOpen: true };
    }
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

function formatSolutionAlgebraic(sol: Solution, inequalities: Inequality[]): { inequality: string; interval: string } {
    if (sol.type === "none") return { inequality: "∅", interval: "∅ (nessuna soluzione)" };
    if (sol.type === "all") return { inequality: "∀x ∈ ℝ", interval: "ℝ (tutti i numeri reali)" };

    const { left, right, leftOpen, rightOpen } = sol;

    let leftFrac = "", rightFrac = "";
    for (const ineq of inequalities) {
        if (ineq.a !== 0) {
            const boundary = -ineq.b / ineq.a;
            if (left !== -Infinity && Math.abs(boundary - left!) < 0.0001) leftFrac = formatFraction(-ineq.b, ineq.a);
            if (right !== Infinity && Math.abs(boundary - right!) < 0.0001) rightFrac = formatFraction(-ineq.b, ineq.a);
        }
    }

    if (!leftFrac && left !== -Infinity) leftFrac = left!.toString();
    if (!rightFrac && right !== Infinity) rightFrac = right!.toString();

    if (left === -Infinity) {
        return {
            inequality: `x ${rightOpen ? "<" : "≤"} ${rightFrac}`,
            interval: `(−∞, ${rightFrac}${rightOpen ? ")" : "]"}`
        };
    }
    if (right === Infinity) {
        return {
            inequality: `x ${leftOpen ? ">" : "≥"} ${leftFrac}`,
            interval: `${leftOpen ? "(" : "["}${leftFrac}, +∞)`
        };
    }

    return {
        inequality: `${leftFrac} ${leftOpen ? "<" : "≤"} x ${rightOpen ? "<" : "≤"} ${rightFrac}`,
        interval: `${leftOpen ? "(" : "["}${leftFrac}, ${rightFrac}${rightOpen ? ")" : "]"}`
    };
}

function generateRandomInequality(): Inequality {
    let a = 0;
    while (a === 0) a = randomInt(-5, 5);
    return { a, b: randomInt(-10, 10), sign: randomChoice(SIGNS) };
}

// ============ COMPONENTE GRAFICO ============

const SVG_WIDTH = 700;
const ROW_HEIGHT = 50;
const PAD_LEFT = 50;
const PAD_RIGHT = 50;

interface SolutionRowProps {
    sol: Solution;
    y: number;
    color: string;
    label: string;
    ineq?: Inequality;
    toX: (v: number) => number;
    viewRange: { min: number; max: number };
    isMobile?: boolean;
}

function SolutionRow({ sol, y, color, label, ineq, toX, viewRange, isMobile }: SolutionRowProps) {
    const { min, max } = viewRange;
    const circleR = isMobile ? 8 : 6;

    if (sol.type === "none") {
        return (
            <g>
                <text x={PAD_LEFT - 10} y={y + 5} fontSize={isMobile ? 14 : 12} textAnchor="end" fill={color} fontWeight={600}>{label}</text>
                <text x={SVG_WIDTH / 2} y={y + 5} fontSize={isMobile ? 13 : 12} textAnchor="middle" fill="#94a3b8">(nessuna soluzione)</text>
            </g>
        );
    }

    if (sol.type === "all") {
        return (
            <g>
                <text x={PAD_LEFT - 10} y={y + 5} fontSize={isMobile ? 14 : 12} textAnchor="end" fill={color} fontWeight={600}>{label}</text>
                <line x1={toX(min)} y1={y} x2={toX(max)} y2={y} stroke={color} strokeWidth={4} />
                <polygon points={`${toX(min)},${y} ${toX(min) + 10},${y - 5} ${toX(min) + 10},${y + 5}`} fill={color} />
                <polygon points={`${toX(max)},${y} ${toX(max) - 10},${y - 5} ${toX(max) - 10},${y + 5}`} fill={color} />
            </g>
        );
    }

    const { left, right, leftOpen, rightOpen } = sol;
    const leftX = left === -Infinity ? toX(min) : toX(left!);
    const rightX = right === Infinity ? toX(max) : toX(right!);
    const boundaryLabel = ineq && ineq.a !== 0 ? formatFraction(-ineq.b, ineq.a) : "";

    return (
        <g>
            <text x={PAD_LEFT - 10} y={y + 5} fontSize={isMobile ? 14 : 12} textAnchor="end" fill={color} fontWeight={600}>{label}</text>
            <line x1={leftX} y1={y} x2={rightX} y2={y} stroke={color} strokeWidth={4} />

            {left === -Infinity && <polygon points={`${toX(min)},${y} ${toX(min) + 10},${y - 5} ${toX(min) + 10},${y + 5}`} fill={color} />}
            {right === Infinity && <polygon points={`${toX(max)},${y} ${toX(max) - 10},${y - 5} ${toX(max) - 10},${y + 5}`} fill={color} />}

            {left !== -Infinity && (
                <>
                    <circle cx={leftX} cy={y} r={circleR} fill={leftOpen ? "#fff" : color} stroke={color} strokeWidth={2.5} />
                    {boundaryLabel && <text x={leftX} y={y - 14} fontSize={isMobile ? 11 : 10} textAnchor="middle" fill={color}>{boundaryLabel}</text>}
                </>
            )}
            {right !== Infinity && (
                <>
                    <circle cx={rightX} cy={y} r={circleR} fill={rightOpen ? "#fff" : color} stroke={color} strokeWidth={2.5} />
                    {boundaryLabel && <text x={rightX} y={y - 14} fontSize={isMobile ? 11 : 10} textAnchor="middle" fill={color}>{boundaryLabel}</text>}
                </>
            )}
        </g>
    );
}

// ============ COMPONENTE PRINCIPALE ============

export default function SistemiDisequazioniDemo() {
    const { isMobile, isTablet } = useBreakpoint();

    const [numInequalities, setNumInequalities] = useState(2);
    const [inequalities, setInequalities] = useState<Inequality[]>(() =>
        Array.from({ length: 2 }, generateRandomInequality)
    );

    // Step navigation: 1 per ogni disequazione + 1 per intersezione + 1 per soluzione finale
    const totalSteps = inequalities.length + 2;
    const { currentStep, nextStep, prevStep, showAll, reset } = useStepNavigation(totalSteps);

    // isStepActive: step è 1-indexed, currentStep è 0-indexed
    const isStepActive = (step: number) => currentStep >= step - 1;

    const handleGenerate = useCallback(() => {
        setInequalities(Array.from({ length: numInequalities }, generateRandomInequality));
        reset();
    }, [numInequalities, reset]);

    const handleNumChange = (newNum: number) => {
        setNumInequalities(newNum);
        if (newNum > inequalities.length) {
            setInequalities([...inequalities, ...Array.from({ length: newNum - inequalities.length }, generateRandomInequality)]);
        } else {
            setInequalities(inequalities.slice(0, newNum));
        }
        reset();
    };

    const updateInequality = (index: number, field: keyof Inequality, value: number | InequalitySign) => {
        const newIneqs = [...inequalities];
        newIneqs[index] = { ...newIneqs[index], [field]: value };
        setInequalities(newIneqs);
    };

    const solutions = useMemo(() => inequalities.map(solveInequality), [inequalities]);
    const intersection = useMemo(() => intersectSolutions(solutions), [solutions]);
    const solutionFormatted = useMemo(() => formatSolutionAlgebraic(intersection, inequalities), [intersection, inequalities]);

    const viewRange = useMemo(() => {
        let min = -10, max = 10;
        for (const sol of solutions) {
            if (sol.type === "interval") {
                if (sol.left !== undefined && sol.left !== -Infinity) { min = Math.min(min, sol.left - 3); max = Math.max(max, sol.left + 3); }
                if (sol.right !== undefined && sol.right !== Infinity) { min = Math.min(min, sol.right - 3); max = Math.max(max, sol.right + 3); }
            }
        }
        return { min: Math.floor(min), max: Math.ceil(max) };
    }, [solutions]);

    const toX = (value: number) => PAD_LEFT + ((value - viewRange.min) / (viewRange.max - viewRange.min)) * (SVG_WIDTH - PAD_LEFT - PAD_RIGHT);

    const SVG_HEIGHT = (inequalities.length + 2) * ROW_HEIGHT + 40;

    const ticks = useMemo(() => {
        const result: number[] = [];
        const step = Math.max(1, Math.floor((viewRange.max - viewRange.min) / (isMobile ? 6 : 10)));
        for (let v = Math.ceil(viewRange.min); v <= Math.floor(viewRange.max); v += step) result.push(v);
        return result;
    }, [viewRange, isMobile]);

    const intersectionBounds = useMemo(() => {
        if (intersection.type === "none") return null;
        if (intersection.type === "all") return { left: viewRange.min, right: viewRange.max };
        return {
            left: intersection.left === -Infinity ? viewRange.min : intersection.left!,
            right: intersection.right === Infinity ? viewRange.max : intersection.right!
        };
    }, [intersection, viewRange]);

    // ============ COMPONENTI PANNELLI ============

    // Sistema input
    const SystemInputPanel = (
        <ResponsiveCard>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>📝 Sistema di disequazioni</div>
            <div style={{ display: "flex", alignItems: "stretch", gap: 8 }}>
                {/* Parentesi graffa */}
                <svg width="20" height={inequalities.length * 52 + 10} style={{ flexShrink: 0 }}>
                    <path
                        d={`M 18 5 Q 10 5, 10 15 L 10 ${(inequalities.length * 52) / 2 - 10} Q 10 ${(inequalities.length * 52) / 2}, 2 ${(inequalities.length * 52) / 2 + 5} Q 10 ${(inequalities.length * 52) / 2 + 10}, 10 ${(inequalities.length * 52) / 2 + 20} L 10 ${inequalities.length * 52 - 5} Q 10 ${inequalities.length * 52 + 5}, 18 ${inequalities.length * 52 + 5}`}
                        fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round"
                    />
                </svg>
                <div style={{ flex: 1 }}>
                    {inequalities.map((ineq, index) => (
                        <div key={index} style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginBottom: 8,
                            padding: isMobile ? 12 : 10,
                            background: "#f8fafc",
                            borderRadius: 8,
                            borderLeft: `4px solid ${COLORS[index % COLORS.length]}`,
                            flexWrap: isMobile ? "wrap" : "nowrap"
                        }}>
                            <input
                                type="number"
                                value={ineq.a}
                                onChange={(e) => updateInequality(index, "a", parseInt(e.target.value) || 0)}
                                style={{
                                    width: isMobile ? 50 : 45,
                                    padding: isMobile ? "8px 6px" : "4px 6px",
                                    borderRadius: 4,
                                    border: "1px solid #cbd5e1",
                                    fontSize: 16,
                                    textAlign: "center"
                                }}
                            />
                            <span style={{ fontSize: 14, fontWeight: 500 }}>x +</span>
                            <input
                                type="number"
                                value={ineq.b}
                                onChange={(e) => updateInequality(index, "b", parseInt(e.target.value) || 0)}
                                style={{
                                    width: isMobile ? 50 : 45,
                                    padding: isMobile ? "8px 6px" : "4px 6px",
                                    borderRadius: 4,
                                    border: "1px solid #cbd5e1",
                                    fontSize: 16,
                                    textAlign: "center"
                                }}
                            />
                            <select
                                value={ineq.sign}
                                onChange={(e) => updateInequality(index, "sign", e.target.value as InequalitySign)}
                                style={{
                                    padding: isMobile ? "8px 10px" : "4px 6px",
                                    borderRadius: 4,
                                    border: "1px solid #cbd5e1",
                                    fontSize: 16,
                                    background: "#fff"
                                }}
                            >
                                <option value="<">&lt;</option>
                                <option value=">">&gt;</option>
                                <option value="<=">≤</option>
                                <option value=">=">≥</option>
                            </select>
                            <span style={{ fontSize: 14 }}>0</span>
                        </div>
                    ))}
                </div>
            </div>
        </ResponsiveCard>
    );

    // Controlli generazione
    const ControlsPanel = (
        <ResponsiveCard>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>🎲 Genera sistema</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
                <label style={{ fontSize: 14 }}>Disequazioni:</label>
                <div style={{ display: "flex", gap: 4 }}>
                    {[2, 3, 4, 5].map(n => (
                        <TouchButton
                            key={n}
                            variant={numInequalities === n ? "primary" : "outline"}
                            onClick={() => handleNumChange(n)}
                            size="sm"
                        >
                            {n}
                        </TouchButton>
                    ))}
                </div>
            </div>
            <GenerateButton text="Nuovo sistema" onClick={handleGenerate} />
        </ResponsiveCard>
    );

    // Step cards per ogni disequazione
    const StepCards = inequalities.map((ineq, index) => {
        const sol = solutions[index];
        const boundaryFrac = ineq.a !== 0 ? formatFraction(-ineq.b, ineq.a) : "";
        const color = COLORS[index % COLORS.length];

        return (
            <StepCard
                key={index}
                stepNumber={index + 1}
                title={`Disequazione ${index + 1}`}
                color={index === 0 ? "red" : index === 1 ? "blue" : index === 2 ? "green" : "purple"}
                isActive={isStepActive(index + 1)}
            >
                <div style={{
                    fontSize: isMobile ? 16 : 18,
                    fontWeight: 600,
                    color: color,
                    marginBottom: 8,
                    padding: "8px 12px",
                    background: "#f8fafc",
                    borderRadius: 6,
                    display: "inline-block"
                }}>
                    {formatInequality(ineq)}
                </div>

                {ineq.a === 0 ? (
                    <div style={{ fontSize: 14, color: "#64748b", marginTop: 8 }}>
                        {sol.type === "all" ? "✓ Sempre vera (coefficiente di x = 0)" : "✗ Mai vera (coefficiente di x = 0)"}
                    </div>
                ) : (
                    <div style={{ fontSize: 14, color: "#475569", marginTop: 8 }}>
                        <div style={{ marginBottom: 4 }}>
                            <strong>Risoluzione:</strong> Isolando x:
                        </div>
                        <div style={{
                            padding: "6px 12px",
                            background: "#fff",
                            borderRadius: 6,
                            borderLeft: `3px solid ${color}`,
                            marginBottom: 4
                        }}>
                            x {(ineq.a > 0) === (ineq.sign === ">" || ineq.sign === ">=") ? (sol.leftOpen ? ">" : "≥") : (sol.rightOpen ? "<" : "≤")} {boundaryFrac}
                            {ineq.a < 0 && <span style={{ color: "#94a3b8", marginLeft: 8 }}>(cambio verso)</span>}
                        </div>
                        <div style={{ fontSize: 13, color: "#64748b" }}>
                            Soluzione: {sol.type === "interval" && sol.left === -Infinity
                            ? `(−∞, ${boundaryFrac}${sol.rightOpen ? ")" : "]"}`
                            : `${sol.leftOpen ? "(" : "["}${boundaryFrac}, +∞)`
                        }
                        </div>
                    </div>
                )}
            </StepCard>
        );
    });

    // Step intersezione
    const IntersectionStep = (
        <StepCard
            stepNumber={inequalities.length + 1}
            title="Intersezione delle soluzioni"
            color="amber"
            isActive={isStepActive(inequalities.length + 1)}
        >
            <div style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}>
                La soluzione del sistema è l'intersezione (∩) di tutte le singole soluzioni:
            </div>
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
                padding: "8px 12px",
                background: "#fff",
                borderRadius: 6
            }}>
                {solutions.map((sol, i) => (
                    <React.Fragment key={i}>
                        <span style={{
                            color: COLORS[i % COLORS.length],
                            fontWeight: 600,
                            fontSize: isMobile ? 14 : 16
                        }}>
                            S{i + 1}
                        </span>
                        {i < solutions.length - 1 && <span style={{ color: "#94a3b8" }}>∩</span>}
                    </React.Fragment>
                ))}
                <span style={{ color: "#94a3b8" }}>=</span>
                <span style={{ fontWeight: 600, color: "#166534" }}>S</span>
            </div>
        </StepCard>
    );

    // Step soluzione finale
    const SolutionStep = (
        <StepCard
            stepNumber={inequalities.length + 2}
            title="Soluzione del sistema"
            color={intersection.type === "none" ? "red" : "green"}
            isActive={isStepActive(inequalities.length + 2)}
        >
            <div style={{
                background: intersection.type === "none" ? "#fef2f2" : "#f0fdf4",
                borderRadius: 8,
                padding: 12
            }}>
                <div style={{
                    fontWeight: 600,
                    marginBottom: 8,
                    color: intersection.type === "none" ? "#991b1b" : "#166534",
                    fontSize: isMobile ? 16 : 18
                }}>
                    {intersection.type === "none" ? "✗ Sistema impossibile" : "✓ Soluzione"}
                </div>
                <div style={{
                    fontSize: isMobile ? 20 : 22,
                    fontFamily: "Georgia, serif",
                    color: intersection.type === "none" ? "#991b1b" : "#166534",
                    fontWeight: 500,
                    marginBottom: 4
                }}>
                    {solutionFormatted.inequality}
                </div>
                <div style={{ fontSize: 14, color: intersection.type === "none" ? "#b91c1c" : "#15803d" }}>
                    Intervallo: {solutionFormatted.interval}
                </div>
            </div>
        </StepCard>
    );

    // Grafico
    const GraphPanel = (
        <ResponsiveCard>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>📊 Rappresentazione grafica</div>
            <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} style={{ width: "100%", height: "auto" }}>
                <rect x={0} y={0} width={SVG_WIDTH} height={SVG_HEIGHT} fill="#fafafa" rx={8} />

                {/* Intersezione - mostrata solo all'ultimo step */}
                {isStepActive(inequalities.length + 2) && intersectionBounds && (
                    <rect
                        x={toX(intersectionBounds.left)}
                        y={ROW_HEIGHT}
                        width={toX(intersectionBounds.right) - toX(intersectionBounds.left)}
                        height={(inequalities.length + 1) * ROW_HEIGHT}
                        fill="rgba(34, 197, 94, 0.2)"
                    />
                )}

                {/* Righe singole disequazioni - mostrate progressivamente */}
                {inequalities.map((ineq, index) => (
                    isStepActive(index + 1) && (
                        <SolutionRow
                            key={index}
                            sol={solutions[index]}
                            y={ROW_HEIGHT * (index + 1) + 25}
                            color={COLORS[index % COLORS.length]}
                            label={`D${index + 1}`}
                            ineq={ineq}
                            toX={toX}
                            viewRange={viewRange}
                            isMobile={isMobile}
                        />
                    )
                ))}

                {/* Asse x */}
                <line x1={PAD_LEFT} y1={SVG_HEIGHT - 50} x2={SVG_WIDTH - PAD_RIGHT} y2={SVG_HEIGHT - 50} stroke="#374151" strokeWidth={2} />
                {ticks.map((v) => (
                    <g key={v}>
                        <line x1={toX(v)} y1={SVG_HEIGHT - 54} x2={toX(v)} y2={SVG_HEIGHT - 46} stroke="#374151" strokeWidth={1} />
                        <text x={toX(v)} y={SVG_HEIGHT - 32} fontSize={isMobile ? 12 : 11} textAnchor="middle" fill="#64748b">{v}</text>
                    </g>
                ))}

                {/* Riga intersezione - mostrata solo all'ultimo step */}
                {isStepActive(inequalities.length + 2) && (
                    <SolutionRow
                        sol={intersection}
                        y={SVG_HEIGHT - 80}
                        color="#166534"
                        label="∩"
                        toX={toX}
                        viewRange={viewRange}
                        isMobile={isMobile}
                    />
                )}
            </svg>
        </ResponsiveCard>
    );

    // Legenda
    const LegendPanel = (
        <div style={{ display: "flex", flexWrap: "wrap", gap: isMobile ? 12 : 16, fontSize: isMobile ? 12 : 13 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width={24} height={16}><circle cx={12} cy={8} r={5} fill="#fff" stroke="#334155" strokeWidth={2} /></svg>
                <span>Escluso</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width={24} height={16}><circle cx={12} cy={8} r={5} fill="#334155" /></svg>
                <span>Incluso</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width={24} height={16}><polygon points="5,8 15,4 15,12" fill="#334155" /></svg>
                <span>Infinito</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width={24} height={16}><rect x={2} y={2} width={20} height={12} fill="rgba(34, 197, 94, 0.3)" rx={2} /></svg>
                <span>Intersezione</span>
            </div>
        </div>
    );

    // ============ LAYOUT MOBILE ============

    if (isMobile) {
        return (
            <DemoContainer
                title="Sistemi disequazioni"
                description="Risoluzione guidata step-by-step"
            >
                {/* Controlli */}
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    <TouchButton variant="primary" onClick={handleGenerate} fullWidth>
                        🎲 Nuovo sistema
                    </TouchButton>
                    <div style={{ display: "flex", gap: 4 }}>
                        {[2, 3, 4].map(n => (
                            <TouchButton
                                key={n}
                                variant={numInequalities === n ? "primary" : "outline"}
                                onClick={() => handleNumChange(n)}
                                size="sm"
                            >
                                {n}
                            </TouchButton>
                        ))}
                    </div>
                </div>

                {/* Sistema input */}
                {SystemInputPanel}

                {/* Navigazione step */}
                <NavigationButtons
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                    onNext={nextStep}
                    onPrev={prevStep}
                    onShowAll={showAll}
                />

                {/* Tabs per steps e grafico */}
                <SwipeableTabs
                    tabs={[
                        {
                            id: "steps",
                            label: "📝 Steps",
                            content: (
                                <div style={{ display: "grid", gap: 12 }}>
                                    {StepCards}
                                    {IntersectionStep}
                                    {SolutionStep}
                                </div>
                            )
                        },
                        { id: "graph", label: "📊 Grafico", content: GraphPanel },
                    ]}
                    defaultTab="steps"
                />

                {/* Legenda collapsible */}
                <CollapsiblePanel title="📖 Legenda" defaultOpen={false}>
                    {LegendPanel}
                </CollapsiblePanel>
            </DemoContainer>
        );
    }

    // ============ LAYOUT TABLET ============

    if (isTablet) {
        return (
            <DemoContainer
                title="Sistemi di Disequazioni Lineari"
                description="Risoluzione guidata step-by-step"
            >
                <ResponsiveGrid columns={{ tablet: 2 }} gap={12}>
                    {ControlsPanel}
                    {SystemInputPanel}
                </ResponsiveGrid>

                {/* Navigazione step */}
                <div style={{ marginTop: 16 }}>
                    <NavigationButtons
                        currentStep={currentStep}
                        totalSteps={totalSteps}
                        onNext={nextStep}
                        onPrev={prevStep}
                        onShowAll={showAll}
                    />
                </div>

                {/* Steps */}
                <ResponsiveGrid columns={{ tablet: 2 }} gap={12}>
                    {StepCards}
                </ResponsiveGrid>

                {IntersectionStep}
                {SolutionStep}

                {/* Grafico */}
                <div style={{ marginTop: 16 }}>
                    {GraphPanel}
                </div>

                <CollapsiblePanel title="📖 Legenda" defaultOpen={false}>
                    {LegendPanel}
                </CollapsiblePanel>

                <InfoBox title="Come funziona:">
                    <ol style={{ margin: "8px 0 0 0", paddingLeft: 20 }}>
                        <li>Ogni disequazione viene risolta singolarmente</li>
                        <li>Le soluzioni vengono rappresentate su una retta numerica</li>
                        <li>La soluzione del sistema è l'<strong>intersezione</strong> di tutte le soluzioni</li>
                    </ol>
                </InfoBox>
            </DemoContainer>
        );
    }

    // ============ LAYOUT DESKTOP ============

    return (
        <DemoContainer
            title="Sistemi di Disequazioni Lineari"
            description="Risoluzione guidata step-by-step con rappresentazione grafica"
            maxWidth={1200}
        >
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                {/* Colonna sinistra: controlli e sistema */}
                <div style={{ flex: "0 0 380px", display: "flex", flexDirection: "column", gap: 12 }}>
                    {ControlsPanel}
                    {SystemInputPanel}

                    {/* Legenda */}
                    <ResponsiveCard>
                        <div style={{ fontWeight: 600, marginBottom: 10 }}>📖 Legenda</div>
                        {LegendPanel}
                    </ResponsiveCard>
                </div>

                {/* Colonna destra: steps e grafico */}
                <div style={{ flex: 1, minWidth: 500, display: "flex", flexDirection: "column", gap: 12 }}>
                    {/* Navigazione step */}
                    <NavigationButtons
                        currentStep={currentStep}
                        totalSteps={totalSteps}
                        onNext={nextStep}
                        onPrev={prevStep}
                        onShowAll={showAll}
                    />

                    {/* Steps in grid */}
                    <ResponsiveGrid columns={{ desktop: 2 }} gap={12}>
                        {StepCards}
                    </ResponsiveGrid>

                    {IntersectionStep}
                    {SolutionStep}

                    {/* Grafico */}
                    {GraphPanel}
                </div>
            </div>

            <InfoBox title="Come funziona:">
                <ol style={{ margin: "8px 0 0 0", paddingLeft: 20 }}>
                    <li>Ogni disequazione viene risolta singolarmente</li>
                    <li>Le soluzioni vengono rappresentate su una retta numerica</li>
                    <li>La soluzione del sistema è l'<strong>intersezione</strong> di tutte le soluzioni</li>
                </ol>
            </InfoBox>
        </DemoContainer>
    );
}