/**
 * SistemiDisequazioniDemo - Versione refactorizzata con helpers
 */

import React, { useState, useCallback, useMemo } from "react";

// Componenti UI
import {
    DemoContainer,
    InfoBox,
    GenerateButton,
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

const SVG_WIDTH = 800;
const ROW_HEIGHT = 50;
const PAD_LEFT = 60;
const PAD_RIGHT = 60;

interface SolutionRowProps {
    sol: Solution;
    y: number;
    color: string;
    label: string;
    ineq?: Inequality;
    toX: (v: number) => number;
    viewRange: { min: number; max: number };
}

function SolutionRow({ sol, y, color, label, ineq, toX, viewRange }: SolutionRowProps) {
    const { min, max } = viewRange;

    if (sol.type === "none") {
        return (
            <g>
                <text x={PAD_LEFT - 10} y={y + 5} fontSize={12} textAnchor="end" fill={color} fontWeight={600}>{label}</text>
                <text x={SVG_WIDTH / 2} y={y + 5} fontSize={12} textAnchor="middle" fill="#94a3b8">(nessuna soluzione)</text>
            </g>
        );
    }

    if (sol.type === "all") {
        return (
            <g>
                <text x={PAD_LEFT - 10} y={y + 5} fontSize={12} textAnchor="end" fill={color} fontWeight={600}>{label}</text>
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
            <text x={PAD_LEFT - 10} y={y + 5} fontSize={12} textAnchor="end" fill={color} fontWeight={600}>{label}</text>
            <line x1={leftX} y1={y} x2={rightX} y2={y} stroke={color} strokeWidth={4} />

            {left === -Infinity && <polygon points={`${toX(min)},${y} ${toX(min) + 10},${y - 5} ${toX(min) + 10},${y + 5}`} fill={color} />}
            {right === Infinity && <polygon points={`${toX(max)},${y} ${toX(max) - 10},${y - 5} ${toX(max) - 10},${y + 5}`} fill={color} />}

            {left !== -Infinity && (
                <>
                    <circle cx={leftX} cy={y} r={6} fill={leftOpen ? "#fff" : color} stroke={color} strokeWidth={2.5} />
                    {boundaryLabel && <text x={leftX} y={y - 12} fontSize={10} textAnchor="middle" fill={color}>{boundaryLabel}</text>}
                </>
            )}
            {right !== Infinity && (
                <>
                    <circle cx={rightX} cy={y} r={6} fill={rightOpen ? "#fff" : color} stroke={color} strokeWidth={2.5} />
                    {boundaryLabel && <text x={rightX} y={y - 12} fontSize={10} textAnchor="middle" fill={color}>{boundaryLabel}</text>}
                </>
            )}
        </g>
    );
}

// ============ COMPONENTE PRINCIPALE ============

export default function SistemiDisequazioniDemo() {
    const [numInequalities, setNumInequalities] = useState(2);
    const [inequalities, setInequalities] = useState<Inequality[]>(() =>
        Array.from({ length: 2 }, generateRandomInequality)
    );
    const [showSteps, setShowSteps] = useState(false);
    const [showGraph, setShowGraph] = useState(false);

    const handleGenerate = useCallback(() => {
        setInequalities(Array.from({ length: numInequalities }, generateRandomInequality));
    }, [numInequalities]);

    const handleNumChange = (newNum: number) => {
        setNumInequalities(newNum);
        if (newNum > inequalities.length) {
            setInequalities([...inequalities, ...Array.from({ length: newNum - inequalities.length }, generateRandomInequality)]);
        } else {
            setInequalities(inequalities.slice(0, newNum));
        }
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
        const step = Math.max(1, Math.floor((viewRange.max - viewRange.min) / 10));
        for (let v = Math.ceil(viewRange.min); v <= Math.floor(viewRange.max); v += step) result.push(v);
        return result;
    }, [viewRange]);

    const intersectionBounds = useMemo(() => {
        if (intersection.type === "none") return null;
        if (intersection.type === "all") return { left: viewRange.min, right: viewRange.max };
        return {
            left: intersection.left === -Infinity ? viewRange.min : intersection.left!,
            right: intersection.right === Infinity ? viewRange.max : intersection.right!
        };
    }, [intersection, viewRange]);

    return (
        <DemoContainer
            title="Sistemi di Disequazioni Lineari"
            description="Risolvi graficamente sistemi di disequazioni lineari in una variabile."
            maxWidth={1100}
        >
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                {/* Pannello controlli */}
                <div style={{ flex: "0 0 380px", display: "flex", flexDirection: "column", gap: 12 }}>
                    {/* Generazione */}
                    <div style={{ background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
                        <div style={{ fontWeight: 600, marginBottom: 12 }}>Genera sistema casuale</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                            <label style={{ fontSize: 14 }}>Numero di disequazioni:</label>
                            <input
                                type="number" min={2} max={6} value={numInequalities}
                                onChange={(e) => handleNumChange(Math.max(2, Math.min(6, parseInt(e.target.value) || 2)))}
                                style={{ width: 60, padding: "6px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 14 }}
                            />
                        </div>
                        <GenerateButton text="Genera sistema casuale" onClick={handleGenerate} />
                    </div>

                    {/* Sistema */}
                    <div style={{ background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
                        <div style={{ fontWeight: 600, marginBottom: 12 }}>Sistema di disequazioni</div>
                        <div style={{ display: "flex", alignItems: "stretch", gap: 8 }}>
                            <svg width="20" height={inequalities.length * 52 + 10} style={{ flexShrink: 0 }}>
                                <path
                                    d={`M 18 5 Q 10 5, 10 15 L 10 ${(inequalities.length * 52) / 2 - 10} Q 10 ${(inequalities.length * 52) / 2}, 2 ${(inequalities.length * 52) / 2 + 5} Q 10 ${(inequalities.length * 52) / 2 + 10}, 10 ${(inequalities.length * 52) / 2 + 20} L 10 ${inequalities.length * 52 - 5} Q 10 ${inequalities.length * 52 + 5}, 18 ${inequalities.length * 52 + 5}`}
                                    fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round"
                                />
                            </svg>
                            <div style={{ flex: 1 }}>
                                {inequalities.map((ineq, index) => (
                                    <div key={index} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, padding: 10, background: "#f8fafc", borderRadius: 8, borderLeft: `4px solid ${COLORS[index % COLORS.length]}` }}>
                                        <input type="number" value={ineq.a} onChange={(e) => updateInequality(index, "a", parseInt(e.target.value) || 0)} style={{ width: 45, padding: "4px 6px", borderRadius: 4, border: "1px solid #cbd5e1", fontSize: 13, textAlign: "center" }} />
                                        <span style={{ fontSize: 14, fontWeight: 500 }}>x +</span>
                                        <input type="number" value={ineq.b} onChange={(e) => updateInequality(index, "b", parseInt(e.target.value) || 0)} style={{ width: 45, padding: "4px 6px", borderRadius: 4, border: "1px solid #cbd5e1", fontSize: 13, textAlign: "center" }} />
                                        <select value={ineq.sign} onChange={(e) => updateInequality(index, "sign", e.target.value as InequalitySign)} style={{ padding: "4px 6px", borderRadius: 4, border: "1px solid #cbd5e1", fontSize: 13, background: "#fff" }}>
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
                    </div>

                    {/* Toggle buttons */}
                    <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={() => setShowSteps(!showSteps)} style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: showSteps ? "2px solid #3b82f6" : "1px solid #cbd5e1", background: showSteps ? "#eff6ff" : "#fff", color: showSteps ? "#1d4ed8" : "#334155", fontWeight: 500, fontSize: 13, cursor: "pointer" }}>
                            {showSteps ? "✓ " : ""}Passaggi risolutivi
                        </button>
                        <button onClick={() => setShowGraph(!showGraph)} style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: showGraph ? "2px solid #3b82f6" : "1px solid #cbd5e1", background: showGraph ? "#eff6ff" : "#fff", color: showGraph ? "#1d4ed8" : "#334155", fontWeight: 500, fontSize: 13, cursor: "pointer" }}>
                            {showGraph ? "✓ " : ""}Rappresentazione grafica
                        </button>
                    </div>

                    {/* Soluzione */}
                    <div style={{ background: intersection.type === "none" ? "#fee2e2" : "#dcfce7", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
                        <div style={{ fontWeight: 600, marginBottom: 8, color: intersection.type === "none" ? "#991b1b" : "#166534" }}>
                            {intersection.type === "none" ? "✗ Sistema impossibile" : "✓ Soluzione del sistema"}
                        </div>
                        <div style={{ fontSize: 18, fontFamily: "Georgia, serif", color: intersection.type === "none" ? "#991b1b" : "#166534", fontWeight: 500, marginBottom: 4 }}>
                            {solutionFormatted.inequality}
                        </div>
                        <div style={{ fontSize: 14, color: intersection.type === "none" ? "#b91c1c" : "#15803d" }}>
                            Intervallo: {solutionFormatted.interval}
                        </div>
                    </div>

                    {/* Legenda */}
                    <div style={{ background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
                        <div style={{ fontWeight: 600, marginBottom: 10 }}>Legenda</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, fontSize: 13 }}>
                            <svg width={30} height={20}><circle cx={15} cy={10} r={6} fill="#fff" stroke="#334155" strokeWidth={2.5} /></svg>
                            <span>Pallino vuoto: estremo <strong>escluso</strong></span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, fontSize: 13 }}>
                            <svg width={30} height={20}><circle cx={15} cy={10} r={6} fill="#334155" stroke="#334155" strokeWidth={2.5} /></svg>
                            <span>Pallino pieno: estremo <strong>incluso</strong></span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, fontSize: 13 }}>
                            <svg width={30} height={20}><polygon points="5,10 15,5 15,15" fill="#334155" /></svg>
                            <span>Freccia: intervallo illimitato</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                            <svg width={30} height={20}><rect x={2} y={2} width={26} height={16} fill="rgba(34, 197, 94, 0.3)" stroke="#22c55e" strokeWidth={1} rx={2} /></svg>
                            <span>Area verde: <strong>intersezione</strong></span>
                        </div>
                    </div>
                </div>

                {/* Colonna destra */}
                <div style={{ flex: 1, minWidth: 450, display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Passaggi */}
                    {showSteps && (
                        <div style={{ background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
                            <div style={{ fontWeight: 600, marginBottom: 12 }}>Passaggi risolutivi</div>
                            {inequalities.map((ineq, index) => {
                                const sol = solutions[index];
                                const boundaryFrac = ineq.a !== 0 ? formatFraction(-ineq.b, ineq.a) : "";
                                return (
                                    <div key={index} style={{ marginBottom: 16, paddingLeft: 12, borderLeft: `3px solid ${COLORS[index % COLORS.length]}` }}>
                                        <div style={{ fontWeight: 600, color: COLORS[index % COLORS.length], marginBottom: 6 }}>
                                            Disequazione {index + 1}: {formatInequality(ineq)}
                                        </div>
                                        {ineq.a === 0 ? (
                                            <div style={{ fontSize: 14, color: "#64748b" }}>
                                                {sol.type === "all" ? "Sempre vera" : "Mai vera"} (il coefficiente di x è 0)
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: 14, color: "#64748b" }}>
                                                <div>Isolando x: x {ineq.a > 0 === (ineq.sign === ">" || ineq.sign === ">=") ? (sol.leftOpen ? ">" : "≥") : (sol.rightOpen ? "<" : "≤")} {boundaryFrac}</div>
                                                <div>Soluzione: {sol.type === "interval" && sol.left === -Infinity ? `(−∞, ${boundaryFrac}${sol.rightOpen ? ")" : "]"}` : `${sol.leftOpen ? "(" : "["}${boundaryFrac}, +∞)`}</div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Grafico */}
                    {showGraph && (
                        <div style={{ background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
                            <div style={{ fontWeight: 600, marginBottom: 12 }}>Rappresentazione grafica</div>
                            <svg width={SVG_WIDTH} height={SVG_HEIGHT} style={{ maxWidth: "100%", display: "block" }}>
                                <rect x={0} y={0} width={SVG_WIDTH} height={SVG_HEIGHT} fill="#fafafa" rx={8} />

                                {/* Intersezione */}
                                {intersectionBounds && (
                                    <rect
                                        x={toX(intersectionBounds.left)}
                                        y={ROW_HEIGHT}
                                        width={toX(intersectionBounds.right) - toX(intersectionBounds.left)}
                                        height={(inequalities.length + 1) * ROW_HEIGHT}
                                        fill="rgba(34, 197, 94, 0.2)"
                                    />
                                )}

                                {/* Righe singole disequazioni */}
                                {inequalities.map((ineq, index) => (
                                    <SolutionRow
                                        key={index}
                                        sol={solutions[index]}
                                        y={ROW_HEIGHT * (index + 1) + 25}
                                        color={COLORS[index % COLORS.length]}
                                        label={`D${index + 1}`}
                                        ineq={ineq}
                                        toX={toX}
                                        viewRange={viewRange}
                                    />
                                ))}

                                {/* Asse x */}
                                <line x1={PAD_LEFT} y1={SVG_HEIGHT - 50} x2={SVG_WIDTH - PAD_RIGHT} y2={SVG_HEIGHT - 50} stroke="#374151" strokeWidth={2} />
                                {ticks.map((v) => (
                                    <g key={v}>
                                        <line x1={toX(v)} y1={SVG_HEIGHT - 54} x2={toX(v)} y2={SVG_HEIGHT - 46} stroke="#374151" strokeWidth={1} />
                                        <text x={toX(v)} y={SVG_HEIGHT - 32} fontSize={11} textAnchor="middle" fill="#64748b">{v}</text>
                                    </g>
                                ))}

                                {/* Riga intersezione */}
                                <SolutionRow
                                    sol={intersection}
                                    y={SVG_HEIGHT - 80}
                                    color="#166534"
                                    label="∩"
                                    toX={toX}
                                    viewRange={viewRange}
                                />
                            </svg>
                        </div>
                    )}
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