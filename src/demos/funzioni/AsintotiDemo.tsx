/**
 * AsintotiDemo — Asintoti Orizzontali, Verticali e Obliqui
 * Tre tab con definizione ed esempi interattivi
 */

import React, { useMemo, useState } from "react";
import {
    SVG_WIDTH, SVG_HEIGHT, PAD_T,
    createTransform, sampleFunction, generatePath,
    GridPattern, Axes, FunctionCurve, HorizontalLine, VerticalLine,
    FunctionSelector, NoteBox, ConceptBox, cardStyle,
} from "../limiti/components";

// ============ TIPI ============

type TabId = "orizzontali" | "verticali" | "obliqui";

// ============ HELPER ============

function formatLine(m: number, q: number): string {
    const mStr = m === 1 ? "x" : m === -1 ? "−x" : `${m}x`;
    if (q === 0) return `y = ${mStr}`;
    if (q > 0) return `y = ${mStr} + ${q}`;
    return `y = ${mStr} − ${Math.abs(q)}`;
}

// ============ SVG: RETTA OBLIQUA ============

function ObliqueLine({ m, q, toX, toY, xMin, xMax, color = "#f59e0b", label }: {
    m: number; q: number;
    toX: (x: number) => number; toY: (y: number) => number;
    xMin: number; xMax: number;
    color?: string; label?: string;
}) {
    const x1 = xMin, y1 = m * xMin + q;
    const x2 = xMax, y2 = m * xMax + q;
    const labelX = xMin + (xMax - xMin) * 0.72;
    const labelY = m * labelX + q;
    return (
        <g>
            <line x1={toX(x1)} y1={toY(y1)} x2={toX(x2)} y2={toY(y2)}
                stroke={color} strokeWidth={2} strokeDasharray="8 4" />
            {label && (
                <text x={toX(labelX)} y={toY(labelY) - 10} fontSize={12} fill={color}
                    fontWeight={600} textAnchor="middle">{label}</text>
            )}
        </g>
    );
}

// ============ DEFINIZIONE BOX ============

function DefBox({ bg, title, formula, description, method }: {
    bg: string; title: string; formula: string;
    description: string; method: string;
}) {
    return (
        <div style={{ background: bg, borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{title}</div>
            <div style={{
                fontFamily: "monospace", fontSize: 14, background: "rgba(255,255,255,0.65)",
                borderRadius: 8, padding: "8px 14px", marginBottom: 8, letterSpacing: "0.01em"
            }}>
                {formula}
            </div>
            <p style={{ fontSize: 13, color: "#334155", margin: "0 0 6px" }}>{description}</p>
            <p style={{ fontSize: 12, color: "#475569", margin: 0 }}>
                <strong>Come trovarlo:</strong> {method}
            </p>
        </div>
    );
}

// ============ STEP-BY-STEP PANEL ============

type Step = {
    title: string;
    calc?: string;
    result: string;
};

type Exercise = {
    id: string;
    label: string;
    question: string;
    steps: Step[];
    answer: string;
};

const STEP_BG  = ["#dbeafe", "#fef3c7", "#f3e8ff", "#dcfce7", "#e0f2fe"];
const STEP_BD  = ["#3b82f6", "#f59e0b", "#a855f7", "#22c55e", "#0ea5e9"];

function StepByStepPanel({ exercises, accentColor = "#3b82f6" }: {
    exercises: Exercise[];
    accentColor?: string;
}) {
    const [sel, setSel] = useState<Exercise>(exercises[0]);
    const [revealed, setRevealed] = useState(0);

    const selectEx = (ex: Exercise) => { setSel(ex); setRevealed(0); };
    const done = revealed === sel.steps.length;

    return (
        <div style={{ marginTop: 24, borderTop: "2px solid #e5e7eb", paddingTop: 20 }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{
                    background: accentColor, color: "#fff",
                    borderRadius: 8, padding: "3px 12px", fontSize: 12, fontWeight: 700,
                    letterSpacing: "0.03em", textTransform: "uppercase",
                }}>
                    Esercizi guidati
                </span>
                <span style={{ fontWeight: 600, fontSize: 15, color: "#1e293b" }}>
                    Calcolo passo per passo
                </span>
            </div>

            {/* Selettore esercizio */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                {exercises.map(ex => (
                    <button key={ex.id} onClick={() => selectEx(ex)} style={{
                        padding: "7px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13,
                        border: sel.id === ex.id ? `2px solid ${accentColor}` : "2px solid #e5e7eb",
                        background: sel.id === ex.id ? accentColor : "#f9fafb",
                        color: sel.id === ex.id ? "#fff" : "#374151",
                        fontWeight: sel.id === ex.id ? 600 : 400,
                        transition: "all 0.15s",
                    }}>
                        {ex.label}
                    </button>
                ))}
            </div>

            {/* Domanda */}
            <div style={{
                padding: "12px 16px", background: "#f8fafc", borderRadius: 10,
                marginBottom: 14, fontSize: 14, borderLeft: `3px solid ${accentColor}`,
            }}>
                <span style={{ fontWeight: 600, color: "#475569", fontSize: 12, marginRight: 8 }}>
                    Trovare gli asintoti di:
                </span>
                <span style={{ fontFamily: "monospace" }}>{sel.question}</span>
            </div>

            {/* Steps rivelati */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {sel.steps.slice(0, revealed).map((step, i) => (
                    <div key={i} style={{
                        padding: "12px 14px",
                        background: STEP_BG[i % STEP_BG.length],
                        borderRadius: 10,
                        borderLeft: `4px solid ${STEP_BD[i % STEP_BD.length]}`,
                    }}>
                        <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4, color: "#1e293b" }}>
                            Passo {i + 1} — {step.title}
                        </div>
                        {step.calc && (
                            <div style={{
                                fontFamily: "monospace", fontSize: 12, color: "#334155",
                                marginBottom: 5, paddingLeft: 8, lineHeight: 1.6,
                            }}>
                                {step.calc}
                            </div>
                        )}
                        <div style={{ color: STEP_BD[i % STEP_BD.length], fontWeight: 700, fontSize: 13 }}>
                            → {step.result}
                        </div>
                    </div>
                ))}
            </div>

            {/* Soluzione finale */}
            {done && (
                <div style={{
                    marginTop: 10, padding: "12px 16px",
                    background: "#dcfce7", borderRadius: 10, borderLeft: "4px solid #16a34a",
                }}>
                    <div style={{ fontWeight: 700, color: "#166534", marginBottom: 4, fontSize: 13 }}>
                        ✓ Soluzione completa
                    </div>
                    <div style={{ fontFamily: "monospace", fontSize: 13, color: "#15803d" }}>
                        {sel.answer}
                    </div>
                </div>
            )}

            {/* Pulsanti di navigazione */}
            <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                {!done && (
                    <>
                        <button onClick={() => setRevealed(r => r + 1)} style={{
                            padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13,
                            background: accentColor, color: "#fff", border: "none", fontWeight: 600,
                        }}>
                            {revealed === 0 ? "▶ Inizia" : `Passo ${revealed + 1} ›`}
                        </button>
                        <button onClick={() => setRevealed(sel.steps.length)} style={{
                            padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13,
                            background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0",
                        }}>
                            Mostra tutto
                        </button>
                    </>
                )}
                {revealed > 0 && (
                    <button onClick={() => setRevealed(0)} style={{
                        padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13,
                        background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0",
                    }}>
                        ↺ Ricomincia
                    </button>
                )}
                {!done && revealed > 0 && (
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>
                        {revealed} / {sel.steps.length} passi
                    </span>
                )}
            </div>
        </div>
    );
}

// ============ TAB 1 — ASINTOTI ORIZZONTALI ============

type HFuncDef = {
    id: string; name: string;
    f: (x: number) => number;
    limitPlus: number | null; limitMinus: number | null;
    note?: string;
};

const H_FUNCTIONS: HFuncDef[] = [
    {
        id: "inv", name: "f(x) = 1/x",
        f: x => 1 / x, limitPlus: 0, limitMinus: 0,
        note: "Asintoto orizzontale y = 0 per x → +∞ e per x → −∞",
    },
    {
        id: "rational", name: "f(x) = (2x+1)/(x−3)",
        f: x => (2 * x + 1) / (x - 3), limitPlus: 2, limitMinus: 2,
        note: "Asintoto y = 2 per x → ±∞.  Asintoto verticale in x = 3.",
    },
    {
        id: "arctan", name: "f(x) = arctan(x)",
        f: x => Math.atan(x), limitPlus: Math.PI / 2, limitMinus: -Math.PI / 2,
        note: "Due asintoti distinti: y = π/2 per x → +∞ e y = −π/2 per x → −∞",
    },
    {
        id: "gauss", name: "f(x) = e⁻ˣ²",
        f: x => Math.exp(-x * x), limitPlus: 0, limitMinus: 0,
        note: "Gaussiana: tende a y = 0 da entrambi i lati",
    },
    {
        id: "rational2", name: "f(x) = (x²+1)/(x²−1)",
        f: x => (x * x + 1) / (x * x - 1), limitPlus: 1, limitMinus: 1,
        note: "Asintoto y = 1. Attenzione: asintoti verticali in x = ±1",
    },
];

const H_EXERCISES: Exercise[] = [
    {
        id: "h1", label: "Esercizio 1",
        question: "f(x) = (3x² + 2) / (x² − 1)",
        steps: [
            {
                title: "Individua il dominio",
                calc: "x² − 1 ≠ 0  →  (x−1)(x+1) ≠ 0  →  x ≠ ±1",
                result: "Dom = ℝ \\ {−1, 1}",
            },
            {
                title: "Limite per x → +∞",
                calc: "lim (3x²+2)/(x²−1)  =  lim x²(3 + 2/x²) / x²(1 − 1/x²)  =  3 / 1",
                result: "lim = 3",
            },
            {
                title: "Limite per x → −∞",
                calc: "Stessa funzione razionale con stessi gradi al numeratore e denominatore",
                result: "lim = 3  (uguale al precedente)",
            },
            {
                title: "Asintoto orizzontale trovato",
                calc: "La curva si avvicina a y = 3 sia per x → +∞ che per x → −∞",
                result: "Asintoto orizzontale:  y = 3",
            },
        ],
        answer: "Asintoto orizzontale: y = 3  (unico, uguale per x → +∞ e x → −∞)",
    },
    {
        id: "h2", label: "Esercizio 2",
        question: "f(x) = x / √(x² + 4)",
        steps: [
            {
                title: "Individua il dominio",
                calc: "x² + 4 > 0 per ogni x ∈ ℝ  (sempre positivo)",
                result: "Dom = ℝ",
            },
            {
                title: "Limite per x → +∞  (x > 0)",
                calc: "f(x) = x / √(x²+4)  con x > 0: √(x²+4) = x·√(1+4/x²)\n→  f(x) = x / (x·√(1+4/x²)) = 1 / √(1+4/x²)",
                result: "lim = 1 / √1 = 1",
            },
            {
                title: "Limite per x → −∞  (x < 0)",
                calc: "con x < 0: √(x²+4) = |x|·√(1+4/x²) = −x·√(1+4/x²)\n→  f(x) = x / (−x·√(1+4/x²)) = −1 / √(1+4/x²)",
                result: "lim = −1 / √1 = −1",
            },
            {
                title: "Due asintoti distinti!",
                calc: "I due limiti sono diversi → la curva ha due rette asintotiche orizzontali",
                result: "Asintoto destro: y = 1   |   Asintoto sinistro: y = −1",
            },
        ],
        answer: "Asintoto orizzontale destro: y = 1  |  Asintoto orizzontale sinistro: y = −1",
    },
];

function AsintotiOrizzontali() {
    const [sel, setSel] = useState<HFuncDef>(H_FUNCTIONS[0]);
    const xMin = -20, xMax = 20;

    const samples = useMemo(() => {
        return sampleFunction(sel.f, xMin, xMax, 600).filter(p => Math.abs(p.y) < 50);
    }, [sel]);

    const { yMin, yMax } = useMemo(() => {
        const ys = samples.map(p => p.y);
        const extras = [sel.limitPlus ?? 0, sel.limitMinus ?? 0].filter(v => v !== null) as number[];
        const all = [...ys, ...extras];
        return { yMin: Math.min(...all) - 1, yMax: Math.max(...all) + 1 };
    }, [samples, sel]);

    const { toX, toY } = useMemo(() => createTransform(xMin, xMax, yMin, yMax), [xMin, xMax, yMin, yMax]);
    const pathD = useMemo(() => generatePath(samples, toX, toY), [samples, toX, toY]);

    const fmtL = (v: number | null) => {
        if (v === null) return "non esiste";
        if (Math.abs(v - Math.PI / 2) < 0.001) return "π/2 ≈ 1.571";
        if (Math.abs(v + Math.PI / 2) < 0.001) return "−π/2 ≈ −1.571";
        return v.toFixed(3);
    };

    return (
        <div>
            <DefBox
                bg="#dcfce7"
                title="Definizione — Asintoto Orizzontale"
                formula={"La retta  y = L  è asintoto orizzontale se  lim f(x) = L  (x → +∞ o x → −∞)"}
                description="La curva si avvicina indefinitamente alla retta orizzontale y = L, senza mai toccarla (o toccandola al più in un numero finito di punti)."
                method="Calcola lim f(x) per x → +∞ e per x → −∞. Se il risultato è un numero finito L, allora y = L è un asintoto orizzontale."
            />

            <div style={cardStyle}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>Grafico — {sel.name}</div>
                <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} style={{ width: "100%", height: "auto" }}>
                    <GridPattern id="gh-asin" />
                    <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="url(#gh-asin)" />
                    <Axes xMin={xMin} xMax={xMax} yMin={yMin} yMax={yMax} toX={toX} toY={toY} />
                    {sel.limitPlus !== null && (
                        <HorizontalLine y={sel.limitPlus} toY={toY} color="#10b981"
                            label={`y = ${fmtL(sel.limitPlus)}  (x→+∞)`} />
                    )}
                    {sel.limitMinus !== null && sel.limitMinus !== sel.limitPlus && (
                        <HorizontalLine y={sel.limitMinus} toY={toY} color="#f59e0b"
                            label={`y = ${fmtL(sel.limitMinus)}  (x→−∞)`} />
                    )}
                    <FunctionCurve pathD={pathD} />
                </svg>
                {sel.note && <NoteBox note={sel.note} />}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 12, marginTop: 12 }}>
                <div style={cardStyle}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Esempi</div>
                    <FunctionSelector functions={H_FUNCTIONS} selected={sel.id}
                        onSelect={id => { const f = H_FUNCTIONS.find(fn => fn.id === id); if (f) setSel(f); }} />
                </div>
                <div style={cardStyle}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Asintoti trovati</div>
                    <div style={{ display: "grid", gap: 8 }}>
                        <div style={{ padding: 10, background: "#dcfce7", borderRadius: 8 }}>
                            <div style={{ fontSize: 11, color: "#166534" }}>Per x → +∞</div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: "#10b981" }}>
                                y = {fmtL(sel.limitPlus)}
                            </div>
                        </div>
                        <div style={{ padding: 10, background: "#fef3c7", borderRadius: 8 }}>
                            <div style={{ fontSize: 11, color: "#92400e" }}>Per x → −∞</div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: "#f59e0b" }}>
                                y = {fmtL(sel.limitMinus)}
                            </div>
                        </div>
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 4 }}>
                            f(x) per x grande (converge verso l'asintoto):
                        </div>
                        {[5, 10, 50, 100, 1000].map(x => {
                            const val = sel.f(x);
                            return (
                                <div key={x} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "2px 0", borderTop: "1px solid #f1f5f9" }}>
                                    <span>x = {x}</span>
                                    <span style={{ fontFamily: "monospace" }}>f(x) = {Number.isFinite(val) ? val.toFixed(5) : "—"}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <StepByStepPanel exercises={H_EXERCISES} accentColor="#10b981" />
        </div>
    );
}

// ============ TAB 2 — ASINTOTI VERTICALI ============

type VFuncDef = {
    id: string; name: string;
    f: (x: number) => number;
    x0: number; leftLimit: string; rightLimit: string;
    note?: string;
};

const V_FUNCTIONS: VFuncDef[] = [
    {
        id: "inv", name: "f(x) = 1/x",
        f: x => 1 / x, x0: 0, leftLimit: "−∞", rightLimit: "+∞",
        note: "Asintoto verticale in x = 0. I due limiti laterali sono infiniti di segno opposto.",
    },
    {
        id: "inv-sq", name: "f(x) = 1/x²",
        f: x => 1 / (x * x), x0: 0, leftLimit: "+∞", rightLimit: "+∞",
        note: "Asintoto in x = 0. Essendo x² > 0, entrambi i limiti tendono a +∞.",
    },
    {
        id: "inv-sh", name: "f(x) = 1/(x−2)",
        f: x => 1 / (x - 2), x0: 2, leftLimit: "−∞", rightLimit: "+∞",
        note: "Asintoto verticale in x = 2 (il denominatore si annulla in x = 2).",
    },
    {
        id: "ln", name: "f(x) = ln(x)",
        f: x => Math.log(x), x0: 0, leftLimit: "n.d.", rightLimit: "−∞",
        note: "ln(x) non è definita per x ≤ 0. Asintoto verticale x = 0 (da destra: lim = −∞).",
    },
    {
        id: "tan", name: "f(x) = tan(x)",
        f: x => Math.tan(x), x0: Math.PI / 2, leftLimit: "+∞", rightLimit: "−∞",
        note: "Asintoti verticali in x = π/2 + kπ. Qui: x = π/2 ≈ 1.571.",
    },
];

const V_EXERCISES: Exercise[] = [
    {
        id: "v1", label: "Esercizio 1",
        question: "f(x) = (x + 1) / (x² − 3x + 2)",
        steps: [
            {
                title: "Fattorizza il denominatore",
                calc: "x² − 3x + 2 = (x − 1)(x − 2)",
                result: "Zeri del denominatore: x = 1  e  x = 2",
            },
            {
                title: "Dominio",
                calc: "Escludi i punti che annullano il denominatore",
                result: "Dom = ℝ \\ {1, 2}",
            },
            {
                title: "Limite in x = 1",
                calc: "Num → 1+1 = 2 ≠ 0.  Denom = (x−1)(x−2) → 0·(1−2) = 0·(−1)\nSegno: neg. per x < 1, pos. per x > 1",
                result: "lim_{x→1⁻} = −∞   e   lim_{x→1⁺} = +∞",
            },
            {
                title: "Limite in x = 2",
                calc: "Num → 2+1 = 3 ≠ 0.  Denom = (x−1)(x−2) → 1·0\nSegno: neg. per x < 2, pos. per x > 2",
                result: "lim_{x→2⁻} = −∞   e   lim_{x→2⁺} = +∞",
            },
            {
                title: "Asintoti verticali trovati",
                calc: "Due punti di discontinuità a salto infinito",
                result: "Asintoti verticali:  x = 1  e  x = 2",
            },
        ],
        answer: "Asintoti verticali: x = 1  e  x = 2",
    },
    {
        id: "v2", label: "Esercizio 2",
        question: "f(x) = ln(3 − x)",
        steps: [
            {
                title: "Condizione di esistenza del logaritmo",
                calc: "3 − x > 0  →  x < 3",
                result: "Dom = (−∞, 3)",
            },
            {
                title: "Punto di frontiera del dominio",
                calc: "Il dominio è limitato a destra in x = 3. Non è definita per x ≥ 3.",
                result: "Candidato asintoto verticale: x = 3",
            },
            {
                title: "Calcola il limite nel punto di frontiera",
                calc: "lim_{x→3⁻} ln(3−x)  con  3−x → 0⁺  →  ln(0⁺) = ?",
                result: "lim = −∞",
            },
            {
                title: "Asintoto verticale trovato",
                calc: "f(x) → −∞ avvicinandosi a x = 3 da sinistra",
                result: "Asintoto verticale: x = 3  (solo da sinistra)",
            },
        ],
        answer: "Asintoto verticale: x = 3  (la funzione è definita solo per x < 3)",
    },
];

function AsintotiVerticali() {
    const [sel, setSel] = useState<VFuncDef>(V_FUNCTIONS[0]);
    const xMin = -6, xMax = 6;
    const yMin = -12, yMax = 12;

    const samples = useMemo(() => {
        return sampleFunction(sel.f, xMin, xMax, 600).filter(p => Math.abs(p.y) < 20);
    }, [sel]);

    const { toX, toY } = useMemo(() => createTransform(xMin, xMax, yMin, yMax), [xMin, xMax, yMin, yMax]);
    const pathD = useMemo(() => generatePath(samples, toX, toY), [samples, toX, toY]);

    const x0Label = Math.abs(sel.x0 - Math.PI / 2) < 0.001 ? "x₀ = π/2" : `x₀ = ${sel.x0}`;

    const leftApproach = useMemo(() =>
        [0.5, 0.2, 0.1, 0.05, 0.01].map(d => {
            const x = sel.x0 - d;
            const fx = sel.f(x);
            return { x, fx: Number.isFinite(fx) ? fx : null };
        }).filter(p => p.fx !== null),
        [sel]);

    const rightApproach = useMemo(() =>
        [0.01, 0.05, 0.1, 0.2, 0.5].map(d => {
            const x = sel.x0 + d;
            const fx = sel.f(x);
            return { x, fx: Number.isFinite(fx) ? fx : null };
        }).filter(p => p.fx !== null),
        [sel]);

    const fmtVal = (v: number) =>
        Math.abs(v) > 999 ? (v > 0 ? "+∞" : "−∞") : v.toFixed(2);

    return (
        <div>
            <DefBox
                bg="#fee2e2"
                title="Definizione — Asintoto Verticale"
                formula={"La retta  x = x₀  è asintoto verticale se  lim f(x) = ±∞  (x → x₀⁻ o x → x₀⁺)"}
                description="Basta che uno dei due limiti laterali sia infinito (±∞). La curva si avvicina alla retta verticale x = x₀, 'fuggendo' verso l'alto o verso il basso."
                method="Trovare i punti dove la funzione non è definita: denominatore = 0, argomento del logaritmo = 0, ecc. Poi verificare che almeno un limite laterale sia ±∞."
            />

            <div style={cardStyle}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>Grafico — {sel.name}</div>
                <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} style={{ width: "100%", height: "auto" }}>
                    <GridPattern id="gv-asin" />
                    <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="url(#gv-asin)" />
                    <Axes xMin={xMin} xMax={xMax} yMin={yMin} yMax={yMax} toX={toX} toY={toY} />
                    <VerticalLine x={sel.x0} toX={toX} color="#ef4444" label={x0Label} />
                    <FunctionCurve pathD={pathD} />
                    <text x={toX(sel.x0) - 24} y={PAD_T + 22} fontSize={14} fill="#f97316" fontWeight={700}>
                        {sel.leftLimit}
                    </text>
                    <text x={toX(sel.x0) + 10} y={PAD_T + 22} fontSize={14} fill="#8b5cf6" fontWeight={700}>
                        {sel.rightLimit}
                    </text>
                </svg>
                {sel.note && <NoteBox note={sel.note} />}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 1fr", gap: 12, marginTop: 12 }}>
                <div style={cardStyle}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Esempi</div>
                    <FunctionSelector functions={V_FUNCTIONS} selected={sel.id}
                        onSelect={id => { const f = V_FUNCTIONS.find(fn => fn.id === id); if (f) setSel(f); }} />
                </div>
                <div style={cardStyle}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Limiti laterali</div>
                    <div style={{ display: "grid", gap: 8 }}>
                        <div style={{ padding: 10, background: "#fff7ed", borderRadius: 8 }}>
                            <div style={{ fontSize: 11, color: "#9a3412" }}>Da sinistra  (x → x₀⁻)</div>
                            <div style={{ fontSize: 22, fontWeight: 700, color: "#f97316" }}>{sel.leftLimit}</div>
                        </div>
                        <div style={{ padding: 10, background: "#f5f3ff", borderRadius: 8 }}>
                            <div style={{ fontSize: 11, color: "#5b21b6" }}>Da destra  (x → x₀⁺)</div>
                            <div style={{ fontSize: 22, fontWeight: 700, color: "#8b5cf6" }}>{sel.rightLimit}</div>
                        </div>
                    </div>
                </div>
                <div style={cardStyle}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Valori di avvicinamento</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11 }}>
                        <div>
                            <div style={{ fontWeight: 600, color: "#f97316", marginBottom: 4 }}>← Da sinistra</div>
                            {leftApproach.length === 0
                                ? <div style={{ color: "#9ca3af" }}>Non definita</div>
                                : leftApproach.map((p, i) => (
                                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "1px 0" }}>
                                        <span>{p.x.toFixed(3)}</span>
                                        <span style={{ fontFamily: "monospace", color: "#ef4444" }}>
                                            {fmtVal(p.fx as number)}
                                        </span>
                                    </div>
                                ))}
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, color: "#8b5cf6", marginBottom: 4 }}>Da destra →</div>
                            {rightApproach.length === 0
                                ? <div style={{ color: "#9ca3af" }}>Non definita</div>
                                : rightApproach.map((p, i) => (
                                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "1px 0" }}>
                                        <span>{p.x.toFixed(3)}</span>
                                        <span style={{ fontFamily: "monospace", color: "#8b5cf6" }}>
                                            {fmtVal(p.fx as number)}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>

            <StepByStepPanel exercises={V_EXERCISES} accentColor="#ef4444" />
        </div>
    );
}

// ============ TAB 3 — ASINTOTI OBLIQUI ============

type OFuncDef = {
    id: string; name: string;
    f: (x: number) => number;
    m: number; q: number;           // asintoto per x → +∞
    mLeft?: number; qLeft?: number; // asintoto per x → −∞ (se diverso)
    verticalX?: number;
    note?: string;
};

const O_FUNCTIONS: OFuncDef[] = [
    {
        id: "xp1x", name: "f(x) = (x²+1)/x",
        f: x => (x * x + 1) / x, m: 1, q: 0, verticalX: 0,
        note: "f(x) = x + 1/x → asintoto y = x uguale per x → +∞ e x → −∞ (più asintoto verticale x = 0)",
    },
    {
        id: "rat1", name: "f(x) = (x²+1)/(x+2)",
        f: x => (x * x + 1) / (x + 2), m: 1, q: -2, verticalX: -2,
        note: "Divisione: x − 2 + 5/(x+2) → asintoto y = x − 2, asintoto verticale x = −2",
    },
    {
        id: "rat2", name: "f(x) = (2x²+x+1)/(x−1)",
        f: x => (2 * x * x + x + 1) / (x - 1), m: 2, q: 3, verticalX: 1,
        note: "Divisione: 2x + 3 + 4/(x−1) → asintoto y = 2x + 3, asintoto verticale x = 1",
    },
    {
        id: "sqrt4", name: "f(x) = √(4x²+1)",
        f: x => Math.sqrt(4 * x * x + 1), m: 2, q: 0, mLeft: -2, qLeft: 0,
        note: "Asintoti DIVERSI: y = 2x per x → +∞  e  y = −2x per x → −∞  (stessa formula, segni opposti)",
    },
];

const O_EXERCISES: Exercise[] = [
    {
        id: "o1", label: "Esercizio 1",
        question: "f(x) = (x² + 3x − 1) / (x + 2)",
        steps: [
            {
                title: "Individua il dominio",
                calc: "x + 2 ≠ 0  →  x ≠ −2",
                result: "Dom = ℝ \\ {−2}",
            },
            {
                title: "Calcola m = lim f(x) / x  per x → ±∞",
                calc: "lim (x²+3x−1) / (x·(x+2))  =  lim (1 + 3/x − 1/x²) / (1 + 2/x)",
                result: "m = 1 / 1 = 1  (≠ 0 → asintoto obliquo esiste)",
            },
            {
                title: "Calcola q = lim [f(x) − mx]  per x → ±∞",
                calc: "lim [(x²+3x−1)/(x+2) − x]  =  lim [(x²+3x−1 − x(x+2)) / (x+2)]\n=  lim [(x²+3x−1 − x²−2x) / (x+2)]  =  lim [(x−1) / (x+2)]",
                result: "q = 1",
            },
            {
                title: "Verifica con la divisione polinomiale",
                calc: "x²+3x−1  =  (x+2)(x+1) − 3\n→  f(x)  =  x + 1 − 3/(x+2)",
                result: "Il quoziente x+1 conferma m=1, q=1. Il resto −3/(x+2) → 0 ✓",
            },
            {
                title: "Asintoti trovati",
                calc: "Asintoto obliquo: y = x + 1.  Asintoto verticale: x = −2",
                result: "y = x + 1  (obliquo)   |   x = −2  (verticale)",
            },
        ],
        answer: "Asintoto obliquo: y = x + 1  |  Asintoto verticale: x = −2",
    },
    {
        id: "o2", label: "Esercizio 2",
        question: "f(x) = (2x² − x + 3) / (x − 2)",
        steps: [
            {
                title: "Individua il dominio",
                calc: "x − 2 ≠ 0  →  x ≠ 2",
                result: "Dom = ℝ \\ {2}",
            },
            {
                title: "Calcola m = lim f(x) / x  per x → ±∞",
                calc: "lim (2x²−x+3) / (x·(x−2))  =  lim (2 − 1/x + 3/x²) / (1 − 2/x)",
                result: "m = 2 / 1 = 2",
            },
            {
                title: "Calcola q = lim [f(x) − 2x]  per x → ±∞",
                calc: "lim [(2x²−x+3)/(x−2) − 2x]  =  lim [(2x²−x+3 − 2x(x−2)) / (x−2)]\n=  lim [(2x²−x+3 − 2x²+4x) / (x−2)]  =  lim [(3x+3) / (x−2)]",
                result: "q = 3",
            },
            {
                title: "Verifica con la divisione polinomiale",
                calc: "2x²−x+3  =  (x−2)(2x+3) + 9\n→  f(x)  =  2x + 3 + 9/(x−2)",
                result: "Il quoziente 2x+3 conferma m=2, q=3. Il resto 9/(x−2) → 0 ✓",
            },
            {
                title: "Asintoti trovati",
                calc: "Asintoto obliquo: y = 2x + 3.  Asintoto verticale: x = 2",
                result: "y = 2x + 3  (obliquo)   |   x = 2  (verticale)",
            },
        ],
        answer: "Asintoto obliquo: y = 2x + 3  |  Asintoto verticale: x = 2",
    },
];

function AsintotiObliqui() {
    const [sel, setSel] = useState<OFuncDef>(O_FUNCTIONS[0]);
    const xMin = -10, xMax = 10;

    const hasDifferentLeft = sel.mLeft !== undefined && (sel.mLeft !== sel.m || sel.qLeft !== sel.q);
    const mL = sel.mLeft ?? sel.m;
    const qL = sel.qLeft ?? sel.q;

    const samples = useMemo(() => {
        return sampleFunction(sel.f, xMin, xMax, 700).filter(p => Math.abs(p.y) < 50);
    }, [sel]);

    const { yMin, yMax } = useMemo(() => {
        const ys = samples.map(p => p.y);
        const corners = [
            sel.m * xMax + sel.q,
            mL * xMin + qL,
        ];
        const all = [...ys, ...corners];
        const raw_min = Math.min(...all), raw_max = Math.max(...all);
        return { yMin: Math.max(raw_min - 2, -28), yMax: Math.min(raw_max + 2, 28) };
    }, [samples, sel, xMin, xMax, mL, qL]);

    const { toX, toY } = useMemo(() => createTransform(xMin, xMax, yMin, yMax), [xMin, xMax, yMin, yMax]);
    const pathD = useMemo(() => generatePath(samples, toX, toY), [samples, toX, toY]);

    // Residui per x → +∞ (asintoto destro)
    const residualsRight = useMemo(() =>
        [2, 5, 10, 50, 100].map(x => {
            const fx = sel.f(x);
            const asym = sel.m * x + sel.q;
            return { x, fx, asym, res: fx - asym };
        }).filter(r => Number.isFinite(r.fx)),
        [sel]);

    // Residui per x → −∞ (asintoto sinistro)
    const residualsLeft = useMemo(() =>
        [-2, -5, -10, -50, -100].map(x => {
            const fx = sel.f(x);
            const asym = mL * x + qL;
            return { x, fx, asym, res: fx - asym };
        }).filter(r => Number.isFinite(r.fx)),
        [sel, mL, qL]);

    const labelRight = formatLine(sel.m, sel.q);
    const labelLeft = formatLine(mL, qL);

    return (
        <div>
            <DefBox
                bg="#ede9fe"
                title="Definizione — Asintoto Obliquo  (Teorema)"
                formula={"m = lim f(x)/x   poi   q = lim [f(x) − mx]   (x → +∞ oppure x → −∞)"}
                description="La retta y = mx + q è asintoto obliquo se entrambi i limiti esistono finiti con m ≠ 0. L'asintoto destro (x → +∞) e l'asintoto sinistro (x → −∞) si calcolano separatamente e possono essere diversi."
                method="1) Controlla se esistono asintoti orizzontali. Se no, calcola m = lim f(x)/x. Se m è finito e ≠ 0, calcola q = lim [f(x) − mx]. La retta y = mx + q è l'asintoto obliquo."
            />

            <div style={cardStyle}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>Grafico — {sel.name}</div>
                <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} style={{ width: "100%", height: "auto" }}>
                    <GridPattern id="go-asin" />
                    <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="url(#go-asin)" />
                    <Axes xMin={xMin} xMax={xMax} yMin={yMin} yMax={yMax} toX={toX} toY={toY} />

                    {/* Asintoto destro (x → +∞) — arancione */}
                    <ObliqueLine m={sel.m} q={sel.q} toX={toX} toY={toY}
                        xMin={0} xMax={xMax} color="#f59e0b"
                        label={hasDifferentLeft ? `${labelRight} (x→+∞)` : labelRight} />

                    {/* Asintoto sinistro (x → −∞) — viola, solo se diverso */}
                    {hasDifferentLeft && (
                        <ObliqueLine m={mL} q={qL} toX={toX} toY={toY}
                            xMin={xMin} xMax={0} color="#a855f7"
                            label={`${labelLeft} (x→−∞)`} />
                    )}

                    {sel.verticalX !== undefined && (
                        <VerticalLine x={sel.verticalX} toX={toX} color="#ef4444"
                            label={`x = ${sel.verticalX}`} />
                    )}
                    <FunctionCurve pathD={pathD} />
                </svg>
                {sel.note && <NoteBox note={sel.note} />}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 1fr", gap: 12, marginTop: 12 }}>
                <div style={cardStyle}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Esempi</div>
                    <FunctionSelector functions={O_FUNCTIONS} selected={sel.id}
                        onSelect={id => { const f = O_FUNCTIONS.find(fn => fn.id === id); if (f) setSel(f); }} />
                </div>

                <div style={cardStyle}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Asintoti trovati</div>

                    {/* Destro */}
                    <div style={{ padding: 10, background: "#fef3c7", borderRadius: 8, marginBottom: 8 }}>
                        <div style={{ fontSize: 11, color: "#92400e", marginBottom: 2 }}>
                            Per x → +∞  (asintoto destro)
                        </div>
                        <div style={{ fontSize: 19, fontWeight: 700, color: "#f59e0b", fontFamily: "monospace" }}>
                            {labelRight}
                        </div>
                        <div style={{ fontSize: 11, color: "#78350f", marginTop: 4 }}>
                            m = {sel.m} &nbsp;|&nbsp; q = {sel.q}
                        </div>
                    </div>

                    {/* Sinistro */}
                    <div style={{ padding: 10, background: hasDifferentLeft ? "#f3e8ff" : "#f9fafb", borderRadius: 8 }}>
                        <div style={{ fontSize: 11, color: "#6b21a8", marginBottom: 2 }}>
                            Per x → −∞  (asintoto sinistro)
                        </div>
                        <div style={{ fontSize: 19, fontWeight: 700, color: hasDifferentLeft ? "#a855f7" : "#9ca3af", fontFamily: "monospace" }}>
                            {labelLeft}
                        </div>
                        <div style={{ fontSize: 11, color: hasDifferentLeft ? "#7e22ce" : "#9ca3af", marginTop: 4 }}>
                            m = {mL} &nbsp;|&nbsp; q = {qL}
                            {!hasDifferentLeft && "  (uguale al destro)"}
                        </div>
                    </div>
                </div>

                <div style={cardStyle}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Verifica: residuo → 0</div>
                    <div style={{ fontSize: 11 }}>
                        {/* Tabella destra */}
                        <div style={{ fontWeight: 600, color: "#f59e0b", marginBottom: 3 }}>
                            x → +∞  &nbsp;  f(x) − ({labelRight})
                        </div>
                        {residualsRight.map((r, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", borderTop: "1px solid #f1f5f9" }}>
                                <span style={{ color: "#6b7280" }}>x = {r.x}</span>
                                <span style={{
                                    fontFamily: "monospace", fontWeight: 600,
                                    color: Math.abs(r.res) < 0.05 ? "#10b981" : Math.abs(r.res) < 0.5 ? "#f59e0b" : "#ef4444"
                                }}>
                                    {r.res.toFixed(4)}
                                </span>
                            </div>
                        ))}

                        {/* Tabella sinistra */}
                        <div style={{ fontWeight: 600, color: hasDifferentLeft ? "#a855f7" : "#9ca3af", marginTop: 10, marginBottom: 3 }}>
                            x → −∞  &nbsp;  f(x) − ({labelLeft})
                        </div>
                        {residualsLeft.map((r, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", borderTop: "1px solid #f1f5f9" }}>
                                <span style={{ color: "#6b7280" }}>x = {r.x}</span>
                                <span style={{
                                    fontFamily: "monospace", fontWeight: 600,
                                    color: Math.abs(r.res) < 0.05 ? "#10b981" : Math.abs(r.res) < 0.5 ? "#f59e0b" : "#ef4444"
                                }}>
                                    {r.res.toFixed(4)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <StepByStepPanel exercises={O_EXERCISES} accentColor="#7c3aed" />
        </div>
    );
}

// ============ COMPONENTE PRINCIPALE ============

const TABS: { id: TabId; label: string; color: string; activeColor: string }[] = [
    { id: "orizzontali", label: "Asintoti Orizzontali", color: "#10b981", activeColor: "#059669" },
    { id: "verticali",   label: "Asintoti Verticali",   color: "#ef4444", activeColor: "#dc2626" },
    { id: "obliqui",     label: "Asintoti Obliqui",     color: "#7c3aed", activeColor: "#6d28d9" },
];

export default function AsintotiDemo() {
    const [activeTab, setActiveTab] = useState<TabId>("orizzontali");

    return (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
            <a href="#/" style={{ color: "#3b82f6", textDecoration: "none", fontSize: 14 }}>← Torna alla home</a>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, marginTop: 8 }}>Asintoti</h1>
            <p style={{ color: "#475569", marginBottom: 16 }}>
                Un <strong>asintoto</strong> è una retta a cui la curva si avvicina indefinitamente.
                Esistono tre tipi: orizzontali, verticali e obliqui.
            </p>

            {/* Tab bar */}
            <div style={{ display: "flex", gap: 4, marginBottom: 20, flexWrap: "wrap" }}>
                {TABS.map(tab => {
                    const active = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: "10px 20px",
                                borderRadius: 10,
                                border: active ? `2px solid ${tab.activeColor}` : "2px solid #e5e7eb",
                                background: active ? tab.color : "#f9fafb",
                                color: active ? "#fff" : "#374151",
                                fontWeight: active ? 700 : 400,
                                cursor: "pointer",
                                fontSize: 14,
                                transition: "all 0.15s",
                            }}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {activeTab === "orizzontali" && <AsintotiOrizzontali />}
            {activeTab === "verticali"   && <AsintotiVerticali />}
            {activeTab === "obliqui"     && <AsintotiObliqui />}

            <ConceptBox>
                <strong>Riepilogo:</strong>{" "}
                Asintoti <strong>orizzontali</strong> y = L → calcola lim f(x) per x → ±∞.{" "}
                Asintoti <strong>verticali</strong> x = x₀ → cerca dove f(x) diverge.{" "}
                Asintoti <strong>obliqui</strong> y = mx + q → m = lim f(x)/x, poi q = lim [f(x) − mx].
            </ConceptBox>
        </div>
    );
}
