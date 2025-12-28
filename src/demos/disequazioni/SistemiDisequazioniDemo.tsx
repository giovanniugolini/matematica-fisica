import React, { useState, useMemo, useCallback } from "react";

type InequalitySign = "<" | ">" | "<=" | ">=";

type Inequality = {
    a: number;
    b: number;
    sign: InequalitySign;
};

type Solution = {
    type: "all" | "none" | "interval";
    left?: number;
    right?: number;
    leftOpen?: boolean;
    rightOpen?: boolean;
};

const COLORS = [
    "#ef4444",
    "#3b82f6",
    "#22c55e",
    "#a855f7",
    "#f97316",
    "#14b8a6",
];

const SIGNS: InequalitySign[] = ["<", ">", "<=", ">="];

function gcd(a: number, b: number): number {
    a = Math.abs(Math.round(a));
    b = Math.abs(Math.round(b));
    while (b) {
        const t = b;
        b = a % b;
        a = t;
    }
    return a;
}

function formatFraction(num: number, den: number): string {
    if (den === 0) return "indefinito";
    if (num === 0) return "0";

    const sign = (num < 0) !== (den < 0) ? "−" : "";
    num = Math.abs(num);
    den = Math.abs(den);

    const divisor = gcd(num, den);
    num = num / divisor;
    den = den / divisor;

    if (den === 1) {
        return `${sign}${num}`;
    }
    return `${sign}${num}/${den}`;
}

function formatSign(sign: InequalitySign): string {
    switch (sign) {
        case "<": return "<";
        case ">": return ">";
        case "<=": return "≤";
        case ">=": return "≥";
    }
}

function formatInequality(ineq: Inequality): string {
    const { a, b, sign } = ineq;

    let lhs = "";
    if (a === 1) lhs = "x";
    else if (a === -1) lhs = "−x";
    else if (a > 0) lhs = `${a}x`;
    else lhs = `−${Math.abs(a)}x`;

    let rhs = "";
    if (b > 0) rhs = ` + ${b}`;
    else if (b < 0) rhs = ` − ${Math.abs(b)}`;

    return `${lhs}${rhs} ${formatSign(sign)} 0`;
}

function solveInequality(ineq: Inequality): Solution {
    const { a, b, sign } = ineq;

    if (a === 0) {
        const satisfied =
            (sign === "<" && b < 0) ||
            (sign === "<=" && b <= 0) ||
            (sign === ">" && b > 0) ||
            (sign === ">=" && b >= 0);

        return { type: satisfied ? "all" : "none" };
    }

    const boundary = -b / a;
    const isStrict = sign === "<" || sign === ">";
    const isGreater = sign === ">" || sign === ">=";
    const solutionIsGreater = a > 0 ? isGreater : !isGreater;

    if (solutionIsGreater) {
        return {
            type: "interval",
            left: boundary,
            leftOpen: isStrict,
            right: Infinity,
            rightOpen: true
        };
    } else {
        return {
            type: "interval",
            left: -Infinity,
            leftOpen: true,
            right: boundary,
            rightOpen: isStrict
        };
    }
}

function intersectSolutions(solutions: Solution[]): Solution {
    let left = -Infinity;
    let right = Infinity;
    let leftOpen = true;
    let rightOpen = true;

    for (const sol of solutions) {
        if (sol.type === "none") {
            return { type: "none" };
        }
        if (sol.type === "all") {
            continue;
        }

        if (sol.left !== undefined && sol.left !== -Infinity) {
            if (sol.left > left) {
                left = sol.left;
                leftOpen = sol.leftOpen ?? true;
            } else if (sol.left === left) {
                leftOpen = leftOpen || (sol.leftOpen ?? true);
            }
        }

        if (sol.right !== undefined && sol.right !== Infinity) {
            if (sol.right < right) {
                right = sol.right;
                rightOpen = sol.rightOpen ?? true;
            } else if (sol.right === right) {
                rightOpen = rightOpen || (sol.rightOpen ?? true);
            }
        }
    }

    if (left > right) {
        return { type: "none" };
    }
    if (left === right && (leftOpen || rightOpen)) {
        return { type: "none" };
    }

    if (left === -Infinity && right === Infinity) {
        return { type: "all" };
    }

    return {
        type: "interval",
        left,
        right,
        leftOpen,
        rightOpen
    };
}

function formatSolutionAlgebraic(sol: Solution, inequalities: Inequality[]): { inequality: string; interval: string } {
    if (sol.type === "none") {
        return { inequality: "∅", interval: "∅ (nessuna soluzione)" };
    }
    if (sol.type === "all") {
        return { inequality: "∀x ∈ ℝ", interval: "ℝ (tutti i numeri reali)" };
    }

    const { left, right, leftOpen, rightOpen } = sol;

    // Trova i valori originali per le frazioni
    let leftFrac = "";
    let rightFrac = "";

    for (const ineq of inequalities) {
        if (ineq.a !== 0) {
            const boundary = -ineq.b / ineq.a;
            if (left !== -Infinity && Math.abs(boundary - left!) < 0.0001) {
                leftFrac = formatFraction(-ineq.b, ineq.a);
            }
            if (right !== Infinity && Math.abs(boundary - right!) < 0.0001) {
                rightFrac = formatFraction(-ineq.b, ineq.a);
            }
        }
    }

    if (!leftFrac && left !== -Infinity) leftFrac = left!.toString();
    if (!rightFrac && right !== Infinity) rightFrac = right!.toString();

    if (left === -Infinity) {
        const bracket = rightOpen ? ")" : "]";
        return {
            inequality: `x ${rightOpen ? "<" : "≤"} ${rightFrac}`,
            interval: `(−∞, ${rightFrac}${bracket}`
        };
    }

    if (right === Infinity) {
        const bracket = leftOpen ? "(" : "[";
        return {
            inequality: `x ${leftOpen ? ">" : "≥"} ${leftFrac}`,
            interval: `${bracket}${leftFrac}, +∞)`
        };
    }

    const leftBracket = leftOpen ? "(" : "[";
    const rightBracket = rightOpen ? ")" : "]";
    const leftSign = leftOpen ? "<" : "≤";
    const rightSign = rightOpen ? "<" : "≤";

    return {
        inequality: `${leftFrac} ${leftSign} x ${rightSign} ${rightFrac}`,
        interval: `${leftBracket}${leftFrac}, ${rightFrac}${rightBracket}`
    };
}

function generateRandomInequality(): Inequality {
    let a = 0;
    while (a === 0) {
        a = Math.floor(Math.random() * 11) - 5;
    }
    const b = Math.floor(Math.random() * 21) - 10;
    const sign = SIGNS[Math.floor(Math.random() * SIGNS.length)];

    return { a, b, sign };
}

function generateRandomSystem(count: number): Inequality[] {
    return Array.from({ length: count }, () => generateRandomInequality());
}

const SVG_WIDTH = 800;
const ROW_HEIGHT = 50;
const PAD_LEFT = 60;
const PAD_RIGHT = 60;
const AXIS_Y = 25;

export default function SistemiDisequazioniDemo() {
    const [numInequalities, setNumInequalities] = useState(2);
    const [inequalities, setInequalities] = useState<Inequality[]>(() =>
        generateRandomSystem(2)
    );
    const [showSteps, setShowSteps] = useState(false);
    const [showGraph, setShowGraph] = useState(false);

    const handleGenerate = useCallback(() => {
        setInequalities(generateRandomSystem(numInequalities));
    }, [numInequalities]);

    const handleNumChange = (newNum: number) => {
        setNumInequalities(newNum);
        if (newNum > inequalities.length) {
            const newIneqs = [...inequalities];
            for (let i = inequalities.length; i < newNum; i++) {
                newIneqs.push(generateRandomInequality());
            }
            setInequalities(newIneqs);
        } else if (newNum < inequalities.length) {
            setInequalities(inequalities.slice(0, newNum));
        }
    };

    const updateInequality = (index: number, field: keyof Inequality, value: any) => {
        const newIneqs = [...inequalities];
        newIneqs[index] = { ...newIneqs[index], [field]: value };
        setInequalities(newIneqs);
    };

    const solutions = useMemo(() =>
            inequalities.map(ineq => solveInequality(ineq)),
        [inequalities]
    );

    const intersection = useMemo(() =>
            intersectSolutions(solutions),
        [solutions]
    );

    const solutionFormatted = useMemo(() =>
            formatSolutionAlgebraic(intersection, inequalities),
        [intersection, inequalities]
    );

    const viewRange = useMemo(() => {
        let min = -10;
        let max = 10;

        for (const sol of solutions) {
            if (sol.type === "interval") {
                if (sol.left !== undefined && sol.left !== -Infinity) {
                    min = Math.min(min, sol.left - 3);
                    max = Math.max(max, sol.left + 3);
                }
                if (sol.right !== undefined && sol.right !== Infinity) {
                    min = Math.min(min, sol.right - 3);
                    max = Math.max(max, sol.right + 3);
                }
            }
        }

        min = Math.floor(min);
        max = Math.ceil(max);

        return { min, max };
    }, [solutions]);

    const toX = (value: number) => {
        const { min, max } = viewRange;
        return PAD_LEFT + ((value - min) / (max - min)) * (SVG_WIDTH - PAD_LEFT - PAD_RIGHT);
    };

    const SVG_HEIGHT = (inequalities.length + 2) * ROW_HEIGHT + 40;

    const ticks = useMemo(() => {
        const { min, max } = viewRange;
        const result: number[] = [];
        const step = Math.max(1, Math.floor((max - min) / 10));
        for (let v = Math.ceil(min); v <= Math.floor(max); v += step) {
            result.push(v);
        }
        return result;
    }, [viewRange]);

    // Calcola i bounds dell'intersezione per il rettangolo verde
    const intersectionBounds = useMemo(() => {
        if (intersection.type === "none") return null;
        if (intersection.type === "all") {
            return { left: viewRange.min, right: viewRange.max };
        }
        return {
            left: intersection.left === -Infinity ? viewRange.min : intersection.left!,
            right: intersection.right === Infinity ? viewRange.max : intersection.right!
        };
    }, [intersection, viewRange]);

    const SolutionRow = ({
                             sol,
                             y,
                             color,
                             label,
                             ineq
                         }: {
        sol: Solution;
        y: number;
        color: string;
        label: string;
        ineq?: Inequality;
    }) => {
        const { min, max } = viewRange;

        if (sol.type === "none") {
            return (
                <g>
                    <text x={PAD_LEFT - 10} y={y + 5} fontSize={12} textAnchor="end" fill={color} fontWeight={600}>
                        {label}
                    </text>
                    <text x={SVG_WIDTH / 2} y={y + 5} fontSize={12} textAnchor="middle" fill="#94a3b8">
                        (nessuna soluzione)
                    </text>
                </g>
            );
        }

        if (sol.type === "all") {
            return (
                <g>
                    <text x={PAD_LEFT - 10} y={y + 5} fontSize={12} textAnchor="end" fill={color} fontWeight={600}>
                        {label}
                    </text>
                    <line
                        x1={toX(min)}
                        y1={y}
                        x2={toX(max)}
                        y2={y}
                        stroke={color}
                        strokeWidth={4}
                    />
                    <polygon
                        points={`${toX(min)},${y} ${toX(min) + 10},${y - 5} ${toX(min) + 10},${y + 5}`}
                        fill={color}
                    />
                    <polygon
                        points={`${toX(max)},${y} ${toX(max) - 10},${y - 5} ${toX(max) - 10},${y + 5}`}
                        fill={color}
                    />
                </g>
            );
        }

        const { left, right, leftOpen, rightOpen } = sol;
        const leftX = left === -Infinity ? toX(min) : toX(left!);
        const rightX = right === Infinity ? toX(max) : toX(right!);

        // Calcola la frazione per l'etichetta
        let boundaryLabel = "";
        if (ineq && ineq.a !== 0) {
            boundaryLabel = formatFraction(-ineq.b, ineq.a);
        }

        return (
            <g>
                <text x={PAD_LEFT - 10} y={y + 5} fontSize={12} textAnchor="end" fill={color} fontWeight={600}>
                    {label}
                </text>

                <line
                    x1={leftX}
                    y1={y}
                    x2={rightX}
                    y2={y}
                    stroke={color}
                    strokeWidth={4}
                />

                {left === -Infinity && (
                    <polygon
                        points={`${toX(min)},${y} ${toX(min) + 10},${y - 5} ${toX(min) + 10},${y + 5}`}
                        fill={color}
                    />
                )}

                {right === Infinity && (
                    <polygon
                        points={`${toX(max)},${y} ${toX(max) - 10},${y - 5} ${toX(max) - 10},${y + 5}`}
                        fill={color}
                    />
                )}

                {left !== -Infinity && (
                    <>
                        <circle
                            cx={leftX}
                            cy={y}
                            r={6}
                            fill={leftOpen ? "#fff" : color}
                            stroke={color}
                            strokeWidth={2.5}
                        />
                        {boundaryLabel && (
                            <text x={leftX} y={y - 12} fontSize={10} textAnchor="middle" fill={color}>
                                {boundaryLabel}
                            </text>
                        )}
                    </>
                )}

                {right !== Infinity && (
                    <>
                        <circle
                            cx={rightX}
                            cy={y}
                            r={6}
                            fill={rightOpen ? "#fff" : color}
                            stroke={color}
                            strokeWidth={2.5}
                        />
                        {boundaryLabel && (
                            <text x={rightX} y={y - 12} fontSize={10} textAnchor="middle" fill={color}>
                                {boundaryLabel}
                            </text>
                        )}
                    </>
                )}
            </g>
        );
    };

    return (
        <div style={{
            maxWidth: 1100,
            margin: "auto",
            padding: 16,
            fontFamily: "system-ui, sans-serif"
        }}>
            {/* Header */}
            <div style={{ marginBottom: 16 }}>
                <a href="#/" style={{ color: "#3b82f6", textDecoration: "none", fontSize: 14 }}>
                    ← Torna alla home
                </a>
                <h1 style={{ margin: "8px 0", fontSize: 24 }}>
                    Sistemi di Disequazioni Lineari
                </h1>
                <p style={{ color: "#64748b", margin: 0, fontSize: 14 }}>
                    Risolvi graficamente sistemi di disequazioni lineari in una variabile.
                </p>
            </div>

            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                {/* Pannello controlli */}
                <div style={{
                    flex: "0 0 380px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12
                }}>
                    {/* Controlli generazione */}
                    <div style={{
                        background: "#fff",
                        borderRadius: 12,
                        padding: 16,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.1)"
                    }}>
                        <div style={{ fontWeight: 600, marginBottom: 12 }}>
                            Genera sistema casuale
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                            <label style={{ fontSize: 14 }}>
                                Numero di disequazioni:
                            </label>
                            <input
                                type="number"
                                min={2}
                                max={6}
                                value={numInequalities}
                                onChange={(e) => handleNumChange(Math.max(2, Math.min(6, parseInt(e.target.value) || 2)))}
                                style={{
                                    width: 60,
                                    padding: "6px 10px",
                                    borderRadius: 6,
                                    border: "1px solid #cbd5e1",
                                    fontSize: 14
                                }}
                            />
                        </div>

                        <button
                            onClick={handleGenerate}
                            style={{
                                width: "100%",
                                padding: "10px 16px",
                                borderRadius: 8,
                                border: "none",
                                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                                color: "#fff",
                                fontWeight: 600,
                                fontSize: 14,
                                cursor: "pointer",
                                transition: "transform 0.1s"
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                            onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                        >
                            🎲 Genera sistema casuale
                        </button>
                    </div>

                    {/* Sistema con parentesi graffa */}
                    <div style={{
                        background: "#fff",
                        borderRadius: 12,
                        padding: 16,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.1)"
                    }}>
                        <div style={{ fontWeight: 600, marginBottom: 12 }}>
                            Sistema di disequazioni
                        </div>

                        <div style={{ display: "flex", alignItems: "stretch", gap: 8 }}>
                            {/* Parentesi graffa SVG */}
                            <svg
                                width="20"
                                height={inequalities.length * 52 + 10}
                                style={{ flexShrink: 0 }}
                            >
                                <path
                                    d={`M 18 5 
                                        Q 10 5, 10 15 
                                        L 10 ${(inequalities.length * 52) / 2 - 10}
                                        Q 10 ${(inequalities.length * 52) / 2}, 2 ${(inequalities.length * 52) / 2 + 5}
                                        Q 10 ${(inequalities.length * 52) / 2 + 10}, 10 ${(inequalities.length * 52) / 2 + 20}
                                        L 10 ${inequalities.length * 52 - 5}
                                        Q 10 ${inequalities.length * 52 + 5}, 18 ${inequalities.length * 52 + 5}`}
                                    fill="none"
                                    stroke="#334155"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </svg>

                            {/* Disequazioni */}
                            <div style={{ flex: 1 }}>
                                {inequalities.map((ineq, index) => (
                                    <div key={index} style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                        marginBottom: 8,
                                        padding: 10,
                                        background: "#f8fafc",
                                        borderRadius: 8,
                                        borderLeft: `4px solid ${COLORS[index % COLORS.length]}`
                                    }}>
                                        <input
                                            type="number"
                                            value={ineq.a}
                                            onChange={(e) => updateInequality(index, "a", parseInt(e.target.value) || 0)}
                                            style={{
                                                width: 45,
                                                padding: "4px 6px",
                                                borderRadius: 4,
                                                border: "1px solid #cbd5e1",
                                                fontSize: 13,
                                                textAlign: "center"
                                            }}
                                        />
                                        <span style={{ fontSize: 14, fontWeight: 500 }}>x</span>
                                        <span style={{ fontSize: 14 }}>+</span>

                                        <input
                                            type="number"
                                            value={ineq.b}
                                            onChange={(e) => updateInequality(index, "b", parseInt(e.target.value) || 0)}
                                            style={{
                                                width: 45,
                                                padding: "4px 6px",
                                                borderRadius: 4,
                                                border: "1px solid #cbd5e1",
                                                fontSize: 13,
                                                textAlign: "center"
                                            }}
                                        />

                                        <select
                                            value={ineq.sign}
                                            onChange={(e) => updateInequality(index, "sign", e.target.value)}
                                            style={{
                                                padding: "4px 6px",
                                                borderRadius: 4,
                                                border: "1px solid #cbd5e1",
                                                fontSize: 13,
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
                    </div>

                    {/* Pulsanti mostra/nascondi */}
                    <div style={{
                        display: "flex",
                        gap: 10
                    }}>
                        <button
                            onClick={() => setShowSteps(!showSteps)}
                            style={{
                                flex: 1,
                                padding: "10px 12px",
                                borderRadius: 8,
                                border: showSteps ? "2px solid #3b82f6" : "1px solid #cbd5e1",
                                background: showSteps ? "#eff6ff" : "#fff",
                                color: showSteps ? "#1d4ed8" : "#334155",
                                fontWeight: 500,
                                fontSize: 13,
                                cursor: "pointer"
                            }}
                        >
                            {showSteps ? "✓ " : ""}Passaggi risolutivi
                        </button>
                        <button
                            onClick={() => setShowGraph(!showGraph)}
                            style={{
                                flex: 1,
                                padding: "10px 12px",
                                borderRadius: 8,
                                border: showGraph ? "2px solid #3b82f6" : "1px solid #cbd5e1",
                                background: showGraph ? "#eff6ff" : "#fff",
                                color: showGraph ? "#1d4ed8" : "#334155",
                                fontWeight: 500,
                                fontSize: 13,
                                cursor: "pointer"
                            }}
                        >
                            {showGraph ? "✓ " : ""}Rappresentazione grafica
                        </button>
                    </div>

                    {/* Soluzione algebrica */}
                    <div style={{
                        background: intersection.type === "none" ? "#fee2e2" : "#dcfce7",
                        borderRadius: 12,
                        padding: 16,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.1)"
                    }}>
                        <div style={{
                            fontWeight: 600,
                            marginBottom: 8,
                            color: intersection.type === "none" ? "#991b1b" : "#166534"
                        }}>
                            {intersection.type === "none" ? "✗ Sistema impossibile" : "✓ Soluzione del sistema"}
                        </div>
                        <div style={{
                            fontSize: 18,
                            fontFamily: "Georgia, serif",
                            color: intersection.type === "none" ? "#991b1b" : "#166534",
                            fontWeight: 500,
                            marginBottom: 4
                        }}>
                            {solutionFormatted.inequality}
                        </div>
                        <div style={{
                            fontSize: 14,
                            color: intersection.type === "none" ? "#b91c1c" : "#15803d"
                        }}>
                            Intervallo: {solutionFormatted.interval}
                        </div>
                    </div>

                    {/* Legenda */}
                    <div style={{
                        background: "#fff",
                        borderRadius: 12,
                        padding: 16,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.1)"
                    }}>
                        <div style={{ fontWeight: 600, marginBottom: 10 }}>
                            Legenda
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, fontSize: 13 }}>
                            <svg width={30} height={20}>
                                <circle cx={15} cy={10} r={6} fill="#fff" stroke="#334155" strokeWidth={2.5} />
                            </svg>
                            <span>Pallino vuoto: estremo <strong>escluso</strong> (&lt; o &gt;)</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, fontSize: 13 }}>
                            <svg width={30} height={20}>
                                <circle cx={15} cy={10} r={6} fill="#334155" stroke="#334155" strokeWidth={2.5} />
                            </svg>
                            <span>Pallino pieno: estremo <strong>incluso</strong> (≤ o ≥)</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, fontSize: 13 }}>
                            <svg width={30} height={20}>
                                <polygon points="5,10 15,5 15,15" fill="#334155" />
                            </svg>
                            <span>Freccia: intervallo illimitato (−∞ o +∞)</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                            <svg width={30} height={20}>
                                <rect x={2} y={2} width={26} height={16} fill="rgba(34, 197, 94, 0.3)" stroke="#22c55e" strokeWidth={1} rx={2} />
                            </svg>
                            <span>Area verde: <strong>intersezione</strong> (soluzione)</span>
                        </div>
                    </div>
                </div>

                {/* Colonna destra */}
                <div style={{
                    flex: 1,
                    minWidth: 450,
                    display: "flex",
                    flexDirection: "column",
                    gap: 16
                }}>
                    {/* Passaggi risolutivi */}
                    {showSteps && (
                        <div style={{
                            background: "#fff",
                            borderRadius: 12,
                            padding: 16,
                            boxShadow: "0 1px 4px rgba(0,0,0,0.1)"
                        }}>
                            <div style={{ fontWeight: 600, marginBottom: 12 }}>
                                Passaggi risolutivi
                            </div>
                            {inequalities.map((ineq, index) => {
                                const sol = solutions[index];
                                const boundaryFrac = ineq.a !== 0 ? formatFraction(-ineq.b, ineq.a) : "";
                                const invertedSign = ineq.sign === "<" ? ">" : ineq.sign === ">" ? "<" : ineq.sign === "<=" ? ">=" : "<=";

                                return (
                                    <div key={index} style={{
                                        marginBottom: 16,
                                        paddingLeft: 12,
                                        borderLeft: `3px solid ${COLORS[index % COLORS.length]}`
                                    }}>
                                        <div style={{ fontWeight: 600, color: COLORS[index % COLORS.length], marginBottom: 6 }}>
                                            Disequazione {index + 1}: {formatInequality(ineq)}
                                        </div>

                                        {ineq.a !== 0 ? (
                                            <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.8 }}>
                                                <div>
                                                    <span style={{ color: "#64748b" }}>1.</span> Isoliamo x: {ineq.a > 0 ? ineq.a : `(${ineq.a})`}x {formatSign(ineq.sign)} {-ineq.b}
                                                </div>
                                                <div>
                                                    <span style={{ color: "#64748b" }}>2.</span> Dividiamo per {ineq.a}
                                                    {ineq.a < 0 && <span style={{ color: "#dc2626", fontWeight: 500 }}> (cambio verso!)</span>}
                                                </div>
                                                <div style={{
                                                    marginTop: 4,
                                                    padding: "6px 10px",
                                                    background: "#f1f5f9",
                                                    borderRadius: 6,
                                                    fontFamily: "Georgia, serif",
                                                    fontSize: 15
                                                }}>
                                                    x {formatSign(ineq.a > 0 ? ineq.sign : invertedSign)} {boundaryFrac}
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: 14, color: "#475569" }}>
                                                <div>
                                                    <span style={{ color: "#64748b" }}>1.</span> La disequazione diventa: {ineq.b} {formatSign(ineq.sign)} 0
                                                </div>
                                                <div style={{
                                                    marginTop: 4,
                                                    padding: "6px 10px",
                                                    background: sol.type === "all" ? "#dcfce7" : "#fee2e2",
                                                    borderRadius: 6,
                                                    color: sol.type === "all" ? "#166534" : "#991b1b"
                                                }}>
                                                    {sol.type === "all" ? "Sempre verificata (∀x ∈ ℝ)" : "Mai verificata (∅)"}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Conclusione */}
                            <div style={{
                                marginTop: 8,
                                padding: 12,
                                background: intersection.type === "none" ? "#fee2e2" : "#dcfce7",
                                borderRadius: 8,
                                borderLeft: `4px solid ${intersection.type === "none" ? "#dc2626" : "#22c55e"}`
                            }}>
                                <div style={{ fontWeight: 600, marginBottom: 4, color: intersection.type === "none" ? "#991b1b" : "#166534" }}>
                                    Intersezione delle soluzioni:
                                </div>
                                <div style={{
                                    fontFamily: "Georgia, serif",
                                    fontSize: 16,
                                    color: intersection.type === "none" ? "#991b1b" : "#166534"
                                }}>
                                    S = {solutionFormatted.interval}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Grafico */}
                    {showGraph && (
                        <div style={{
                            background: "#fff",
                            borderRadius: 12,
                            padding: 16,
                            boxShadow: "0 1px 4px rgba(0,0,0,0.1)"
                        }}>
                            <div style={{ fontWeight: 600, marginBottom: 12 }}>
                                Rappresentazione grafica
                            </div>

                            <svg
                                width="100%"
                                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                                style={{ background: "#fafafa", borderRadius: 8 }}
                            >
                                {/* Rettangolo verde dell'intersezione */}
                                {intersectionBounds && (
                                    <rect
                                        x={toX(intersectionBounds.left)}
                                        y={AXIS_Y + 30}
                                        width={toX(intersectionBounds.right) - toX(intersectionBounds.left)}
                                        height={ROW_HEIGHT * inequalities.length + 30}
                                        fill="rgba(34, 197, 94, 0.25)"
                                        stroke="rgba(34, 197, 94, 0.5)"
                                        strokeWidth={1}
                                    />
                                )}

                                {/* Retta reale principale */}
                                <g>
                                    <text x={PAD_LEFT - 10} y={AXIS_Y + 5} fontSize={12} textAnchor="end" fill="#334155" fontWeight={600}>
                                        ℝ
                                    </text>
                                    <line
                                        x1={toX(viewRange.min)}
                                        y1={AXIS_Y}
                                        x2={toX(viewRange.max)}
                                        y2={AXIS_Y}
                                        stroke="#334155"
                                        strokeWidth={2}
                                    />
                                    <polygon
                                        points={`${toX(viewRange.min)},${AXIS_Y} ${toX(viewRange.min) + 8},${AXIS_Y - 4} ${toX(viewRange.min) + 8},${AXIS_Y + 4}`}
                                        fill="#334155"
                                    />
                                    <polygon
                                        points={`${toX(viewRange.max)},${AXIS_Y} ${toX(viewRange.max) - 8},${AXIS_Y - 4} ${toX(viewRange.max) - 8},${AXIS_Y + 4}`}
                                        fill="#334155"
                                    />

                                    {ticks.map(v => (
                                        <g key={v}>
                                            <line
                                                x1={toX(v)}
                                                y1={AXIS_Y - 5}
                                                x2={toX(v)}
                                                y2={AXIS_Y + 5}
                                                stroke="#334155"
                                                strokeWidth={1.5}
                                            />
                                            <text
                                                x={toX(v)}
                                                y={AXIS_Y + 18}
                                                fontSize={11}
                                                textAnchor="middle"
                                                fill="#64748b"
                                            >
                                                {v}
                                            </text>
                                        </g>
                                    ))}
                                </g>

                                {/* Linee guida verticali */}
                                {solutions.map((sol, index) => {
                                    if (sol.type !== "interval") return null;
                                    const points: number[] = [];
                                    if (sol.left !== undefined && sol.left !== -Infinity) points.push(sol.left);
                                    if (sol.right !== undefined && sol.right !== Infinity) points.push(sol.right);

                                    return points.map((p, i) => (
                                        <line
                                            key={`guide-${index}-${i}`}
                                            x1={toX(p)}
                                            y1={AXIS_Y + 25}
                                            x2={toX(p)}
                                            y2={ROW_HEIGHT * (inequalities.length + 1) + 20}
                                            stroke="#cbd5e1"
                                            strokeWidth={1}
                                            strokeDasharray="4,4"
                                        />
                                    ));
                                })}

                                {/* Soluzioni singole */}
                                {solutions.map((sol, index) => (
                                    <SolutionRow
                                        key={index}
                                        sol={sol}
                                        y={ROW_HEIGHT * (index + 1) + AXIS_Y}
                                        color={COLORS[index % COLORS.length]}
                                        label={`D${index + 1}`}
                                        ineq={inequalities[index]}
                                    />
                                ))}

                                {/* Separatore */}
                                <line
                                    x1={PAD_LEFT}
                                    y1={ROW_HEIGHT * (inequalities.length + 1) + 10}
                                    x2={SVG_WIDTH - PAD_RIGHT}
                                    y2={ROW_HEIGHT * (inequalities.length + 1) + 10}
                                    stroke="#94a3b8"
                                    strokeWidth={1}
                                    strokeDasharray="8,4"
                                />

                                <text
                                    x={SVG_WIDTH / 2}
                                    y={ROW_HEIGHT * (inequalities.length + 1) + 8}
                                    fontSize={11}
                                    textAnchor="middle"
                                    fill="#64748b"
                                >
                                    INTERSEZIONE
                                </text>

                                {/* Soluzione finale */}
                                <SolutionRow
                                    sol={intersection}
                                    y={ROW_HEIGHT * (inequalities.length + 1) + 35}
                                    color="#166534"
                                    label="S"
                                />
                            </svg>
                        </div>
                    )}
                </div>
            </div>

            {/* Spiegazione */}
            <div style={{
                marginTop: 16,
                background: "#eff6ff",
                borderRadius: 12,
                padding: 16,
                fontSize: 13,
                color: "#1e3a8a"
            }}>
                <strong>Metodo risolutivo:</strong> Per risolvere un sistema di disequazioni lineari in una variabile:
                <ol style={{ margin: "8px 0 0 0", paddingLeft: 20 }}>
                    <li>Si risolve <em>separatamente</em> ogni disequazione, trovando l'insieme delle soluzioni</li>
                    <li>Si rappresentano le soluzioni sulla retta reale (pallino pieno = incluso, vuoto = escluso)</li>
                    <li>La soluzione del sistema è l'<strong>intersezione</strong> di tutte le soluzioni individuali</li>
                    <li>Se l'intersezione è vuota, il sistema è <em>impossibile</em></li>
                </ol>
            </div>
        </div>
    );
}