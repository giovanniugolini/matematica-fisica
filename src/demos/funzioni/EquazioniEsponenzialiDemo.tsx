/**
 * EquazioniEsponenzialiDemo – Interpretazione grafica delle equazioni esponenziali elementari
 * Soluzione di a^x = b come intersezione tra y = a^x e la retta y = b.
 */

import React, { useState, useCallback, useMemo } from "react";
import { DemoContainer, Latex, DisplayMath } from "../../components/ui";

// ─── SVG layout ──────────────────────────────────────────────────────────────

const W = 720, H = 400;
const PAD = { L: 52, R: 32, T: 28, B: 50 };
const X_MIN = -4.5, X_MAX = 4.5;
const Y_MIN = -1.5, Y_MAX = 9.5;
const N = 500;

function linspace(a: number, b: number, n: number): number[] {
    return Array.from({ length: n }, (_, i) => a + (i * (b - a)) / (n - 1));
}
function clamp(x: number, lo: number, hi: number) {
    return Math.max(lo, Math.min(hi, x));
}

// ─── Basi disponibili ─────────────────────────────────────────────────────────

const BASES = [
    { label: "2",   value: 2,       latex: "2" },
    { label: "3",   value: 3,       latex: "3" },
    { label: "½",   value: 0.5,     latex: "\\tfrac{1}{2}" },
    { label: "⅓",   value: 1 / 3,   latex: "\\tfrac{1}{3}" },
];

// ─── Componente principale ────────────────────────────────────────────────────

export default function EquazioniEsponenzialiDemo() {
    const [baseIdx, setBaseIdx] = useState(0);
    const [b, setB] = useState(4);
    const [dragging, setDragging] = useState(false);

    const base = BASES[baseIdx];
    const a = base.value;

    // Coordinate transforms
    const toSvgX = useCallback(
        (x: number) => PAD.L + ((x - X_MIN) / (X_MAX - X_MIN)) * (W - PAD.L - PAD.R),
        []
    );
    const toSvgY = useCallback(
        (y: number) => H - PAD.B - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * (H - PAD.T - PAD.B),
        []
    );
    const fromSvgY = useCallback(
        (py: number) => Y_MIN + ((H - PAD.B - py) / (H - PAD.T - PAD.B)) * (Y_MAX - Y_MIN),
        []
    );

    const axisY = clamp(toSvgY(0), PAD.T, H - PAD.B);
    const axisX = clamp(toSvgX(0), PAD.L, W - PAD.R);

    // Curva esponenziale
    const xs = useMemo(() => linspace(X_MIN, X_MAX, N), []);
    const curvePath = useMemo(() => {
        const pts: string[] = [];
        xs.forEach((x, i) => {
            const y = Math.pow(a, x);
            if (!isFinite(y) || y > Y_MAX + 3 || y < Y_MIN - 1) return;
            pts.push(`${i === 0 || pts.length === 0 ? "M" : "L"} ${toSvgX(x).toFixed(1)} ${toSvgY(y).toFixed(1)}`);
        });
        return pts.join(" ");
    }, [xs, a, toSvgX, toSvgY]);

    // Soluzione
    const hasSolution = b > 0;
    const xSol = hasSolution ? Math.log(b) / Math.log(a) : NaN;
    const solInView = hasSolution && isFinite(xSol) && xSol >= X_MIN && xSol <= X_MAX;
    const bInView = b >= Y_MIN && b <= Y_MAX;

    // Case
    type BCase = "positive" | "zero" | "negative";
    const bCase: BCase = b > 0 ? "positive" : b === 0 ? "zero" : "negative";

    // Drag retta
    const updateB = (clientY: number, rect: DOMRect) => {
        const py = (clientY - rect.top) * (H / rect.height);
        setB(parseFloat(clamp(fromSvgY(py), -1.4, 9.4).toFixed(2)));
    };

    // Stili
    const card: React.CSSProperties = {
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        overflow: "hidden",
        marginBottom: 12,
    };
    const btnBase: React.CSSProperties = {
        padding: "6px 14px",
        borderRadius: 6,
        border: "1px solid #d1d5db",
        background: "#fff",
        cursor: "pointer",
        fontSize: 13,
        fontFamily: "system-ui, sans-serif",
    };
    const activeBtn = (active: boolean): React.CSSProperties => ({
        ...btnBase,
        background: active ? "#0d7070" : "#f0fdfa",
        color: active ? "#fff" : "#0f766e",
        borderColor: active ? "#0d7070" : "#c2e0e0",
        fontWeight: active ? 700 : 400,
    });

    // Ticks
    const xTicks = [-4, -3, -2, -1, 1, 2, 3, 4];
    const yTicks = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    // Colore retta
    const lineColor = bCase === "positive" ? "#10b981" : "#ef4444";

    return (
        <DemoContainer
            title="Equazioni esponenziali elementari"
            description="La soluzione di aˣ = b è l'ascissa del punto di intersezione tra y = aˣ e la retta y = b."
            maxWidth={1000}
        >
            {/* Selezione base */}
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#6b7280", fontFamily: "system-ui, sans-serif" }}>
                    Base <Latex>{"a"}</Latex>:
                </span>
                {BASES.map((opt, i) => (
                    <button
                        key={opt.label}
                        style={activeBtn(baseIdx === i)}
                        onClick={() => setBaseIdx(i)}
                    >
                        <Latex>{opt.latex}</Latex>
                    </button>
                ))}
            </div>

            {/* Layout principale */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 12, alignItems: "start" }}>

                {/* ── Grafico ── */}
                <div style={{ ...card }}>
                    <div style={{
                        padding: "10px 16px",
                        borderBottom: "1px solid #e5e7eb",
                        fontSize: 13,
                        fontFamily: "system-ui, sans-serif",
                        color: "#374151",
                    }}>
                        <strong>Grafico</strong> di{" "}
                        <Latex>{`y = ${base.latex}^x`}</Latex>{" "}
                        e retta{" "}
                        <Latex>{`y = b`}</Latex>
                        <span style={{ color: "#9ca3af", marginLeft: 8, fontSize: 12 }}>
                            (trascina la retta per cambiare b)
                        </span>
                    </div>

                    <svg
                        viewBox={`0 0 ${W} ${H}`}
                        style={{
                            width: "100%", height: "auto", display: "block",
                            cursor: dragging ? "ns-resize" : "crosshair",
                        }}
                        onMouseDown={(e) => {
                            setDragging(true);
                            updateB(e.clientY, e.currentTarget.getBoundingClientRect());
                        }}
                        onMouseMove={(e) => {
                            if (dragging) updateB(e.clientY, e.currentTarget.getBoundingClientRect());
                        }}
                        onMouseUp={() => setDragging(false)}
                        onMouseLeave={() => setDragging(false)}
                        onTouchStart={(e) => {
                            setDragging(true);
                            updateB(e.touches[0].clientY, e.currentTarget.getBoundingClientRect());
                        }}
                        onTouchMove={(e) => {
                            if (!dragging) return;
                            e.preventDefault();
                            updateB(e.touches[0].clientY, e.currentTarget.getBoundingClientRect());
                        }}
                        onTouchEnd={() => setDragging(false)}
                    >
                        <rect width={W} height={H} fill="#fafafa" />

                        {/* Griglia */}
                        {xTicks.map(t => (
                            <line key={`gx${t}`} x1={toSvgX(t)} y1={PAD.T} x2={toSvgX(t)} y2={H - PAD.B}
                                stroke="#e5e7eb" />
                        ))}
                        {yTicks.map(t => (
                            <line key={`gy${t}`} x1={PAD.L} y1={toSvgY(t)} x2={W - PAD.R} y2={toSvgY(t)}
                                stroke="#e5e7eb" />
                        ))}

                        {/* Assi */}
                        <line x1={PAD.L} y1={axisY} x2={W - PAD.R} y2={axisY} stroke="#374151" strokeWidth={2} />
                        <line x1={axisX} y1={PAD.T} x2={axisX} y2={H - PAD.B} stroke="#374151" strokeWidth={2} />
                        {/* Frecce assi */}
                        <polygon points={`${W - PAD.R},${axisY} ${W - PAD.R - 8},${axisY - 4} ${W - PAD.R - 8},${axisY + 4}`} fill="#374151" />
                        <polygon points={`${axisX},${PAD.T} ${axisX - 4},${PAD.T + 8} ${axisX + 4},${PAD.T + 8}`} fill="#374151" />

                        {/* Ticks e label asse x */}
                        {xTicks.map(t => (
                            <g key={`tx${t}`}>
                                <line x1={toSvgX(t)} y1={axisY - 4} x2={toSvgX(t)} y2={axisY + 4} stroke="#374151" />
                                <text x={toSvgX(t)} y={axisY + 17} fontSize={11} textAnchor="middle" fill="#6b7280">
                                    {t}
                                </text>
                            </g>
                        ))}
                        {/* Ticks e label asse y */}
                        {yTicks.map(t => (
                            <g key={`ty${t}`}>
                                <line x1={axisX - 4} y1={toSvgY(t)} x2={axisX + 4} y2={toSvgY(t)} stroke="#374151" />
                                <text x={PAD.L - 7} y={toSvgY(t) + 4} fontSize={11} textAnchor="end" fill="#6b7280">
                                    {t}
                                </text>
                            </g>
                        ))}
                        {/* Label assi */}
                        <text x={W - PAD.R + 4} y={axisY + 4} fontSize={13} fill="#374151" fontStyle="italic">x</text>
                        <text x={axisX + 6} y={PAD.T - 6} fontSize={13} fill="#374151" fontStyle="italic">y</text>

                        {/* Curva esponenziale */}
                        <path d={curvePath} fill="none" stroke="#2563eb" strokeWidth={3}
                            strokeLinecap="round" strokeLinejoin="round" />

                        {/* Label curva */}
                        {(() => {
                            const labelX = a > 1 ? 2.8 : -3.2;
                            const labelY = Math.pow(a, labelX);
                            if (labelY < Y_MIN || labelY > Y_MAX) return null;
                            return (
                                <text
                                    x={toSvgX(labelX) + (a > 1 ? -38 : 8)}
                                    y={toSvgY(labelY) - 8}
                                    fontSize={12} fill="#2563eb" fontWeight="bold"
                                >
                                    y = a
                                    <tspan dy="-5" fontSize={9}>x</tspan>
                                </text>
                            );
                        })()}

                        {/* Asintoto y = 0 */}
                        <text x={W - PAD.R - 4} y={axisY - 5} fontSize={10} textAnchor="end" fill="#9ca3af">
                            asintoto y = 0
                        </text>

                        {/* Retta y = b */}
                        {bInView && (
                            <g>
                                <line
                                    x1={PAD.L} y1={toSvgY(b)}
                                    x2={W - PAD.R} y2={toSvgY(b)}
                                    stroke={lineColor} strokeWidth={2.5}
                                    strokeDasharray={bCase !== "positive" ? "8 5" : undefined}
                                />
                                {/* Grip indicator */}
                                <rect
                                    x={PAD.L} y={toSvgY(b) - 6}
                                    width={W - PAD.L - PAD.R} height={12}
                                    fill="transparent"
                                    style={{ cursor: "ns-resize" }}
                                />
                                {/* Label retta */}
                                <rect
                                    x={W - PAD.R - 60} y={toSvgY(b) - 18}
                                    width={56} height={16} rx={3}
                                    fill="white" fillOpacity={0.85}
                                />
                                <text
                                    x={W - PAD.R - 32} y={toSvgY(b) - 6}
                                    fontSize={11} textAnchor="middle"
                                    fill={lineColor} fontWeight="bold"
                                >
                                    y = {b.toFixed(2)}
                                </text>
                            </g>
                        )}

                        {/* Linee tratteggiate proiezione soluzione */}
                        {solInView && (
                            <g>
                                {/* Verticale: intersezione → asse x */}
                                <line
                                    x1={toSvgX(xSol)} y1={toSvgY(b)}
                                    x2={toSvgX(xSol)} y2={axisY}
                                    stroke="#f59e0b" strokeWidth={1.8} strokeDasharray="6 4"
                                />
                                {/* Orizzontale: asse y → intersezione */}
                                <line
                                    x1={axisX} y1={toSvgY(b)}
                                    x2={toSvgX(xSol)} y2={toSvgY(b)}
                                    stroke="#f59e0b" strokeWidth={1.8} strokeDasharray="6 4"
                                />
                                {/* Punto intersezione */}
                                <circle
                                    cx={toSvgX(xSol)} cy={toSvgY(b)}
                                    r={8} fill="#f59e0b" stroke="#fff" strokeWidth={2}
                                />
                                {/* Punto sull'asse x */}
                                <circle cx={toSvgX(xSol)} cy={axisY} r={4} fill="#b45309" />
                                {/* Label soluzione sull'asse x */}
                                <rect
                                    x={toSvgX(xSol) - 28} y={axisY + 8}
                                    width={56} height={16} rx={3}
                                    fill="#fef3c7" stroke="#f59e0b"
                                />
                                <text
                                    x={toSvgX(xSol)} y={axisY + 20}
                                    fontSize={11} textAnchor="middle"
                                    fill="#b45309" fontWeight="bold"
                                >
                                    x ≈ {xSol.toFixed(3)}
                                </text>
                            </g>
                        )}

                        {/* Messaggio "fuori vista" se la soluzione c'è ma è fuori dal range */}
                        {hasSolution && !solInView && isFinite(xSol) && (
                            <text
                                x={xSol < X_MIN ? PAD.L + 4 : W - PAD.R - 4}
                                y={axisY - 18}
                                fontSize={11}
                                textAnchor={xSol < X_MIN ? "start" : "end"}
                                fill="#b45309"
                            >
                                {xSol < X_MIN ? "◀" : "▶"} x ≈ {xSol.toFixed(3)} (fuori vista)
                            </text>
                        )}
                    </svg>
                </div>

                {/* ── Pannello laterale ── */}
                <div>
                    {/* Equazione corrente */}
                    <div style={{ ...card, background: "#f8fafc", textAlign: "center", padding: 16 }}>
                        <div style={{
                            fontSize: 11, color: "#9ca3af", textTransform: "uppercase",
                            letterSpacing: 1, marginBottom: 8, fontFamily: "system-ui, sans-serif",
                        }}>
                            Equazione
                        </div>
                        <DisplayMath>{`${base.latex}^{\\,x} = ${b >= 0 ? b.toFixed(2) : `(${b.toFixed(2)})`}`}</DisplayMath>
                    </div>

                    {/* Risultato */}
                    <div style={{
                        ...card,
                        padding: 16,
                        background: bCase === "positive" ? "#f0fdf4" : "#fef2f2",
                        border: `1px solid ${bCase === "positive" ? "#86efac" : "#fecaca"}`,
                    }}>
                        <div style={{
                            fontWeight: 700, fontSize: 13, marginBottom: 8,
                            fontFamily: "system-ui, sans-serif",
                            color: bCase === "positive" ? "#166534" : "#991b1b",
                        }}>
                            {bCase === "positive" ? "✓ Soluzione unica" : "✗ Impossibile"}
                        </div>

                        {bCase === "positive" ? (
                            <>
                                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 10, fontFamily: "system-ui, sans-serif" }}>
                                    <Latex>{"b = " + b.toFixed(2)}</Latex> &gt; 0
                                    &nbsp;→ la retta interseca il grafico
                                </div>
                                <DisplayMath>
                                    {`x = \\log_{${base.latex}} ${b.toFixed(2)} \\approx ${xSol.toFixed(4)}`}
                                </DisplayMath>
                            </>
                        ) : (
                            <div style={{ fontSize: 12, color: "#9ca3af", fontFamily: "system-ui, sans-serif", lineHeight: 1.5 }}>
                                {bCase === "zero"
                                    ? <>b = 0: la retta y = 0 è l'asintoto di <Latex>{`${base.latex}^x`}</Latex>, non la interseca mai.</>
                                    : <>b = {b.toFixed(2)} &lt; 0: il grafico di <Latex>{`${base.latex}^x`}</Latex> è sempre positivo, non tocca mai la retta.</>
                                }
                            </div>
                        )}
                    </div>

                    {/* Slider b */}
                    <div style={{ ...card, padding: 16 }}>
                        <div style={{ fontSize: 13, fontFamily: "system-ui, sans-serif", marginBottom: 8 }}>
                            Valore di <Latex>{"b"}</Latex>:{" "}
                            <strong style={{ color: lineColor }}>{b.toFixed(2)}</strong>
                        </div>
                        <input
                            type="range" min={-1.4} max={9.4} step={0.05} value={b}
                            onChange={(e) => setB(+e.target.value)}
                            style={{ width: "100%", accentColor: "#10b981" }}
                        />
                        <div style={{
                            display: "flex", justifyContent: "space-between",
                            fontSize: 10, color: "#9ca3af",
                            fontFamily: "system-ui, sans-serif", marginTop: 2,
                        }}>
                            <span>−1.4</span><span style={{ color: "#ef4444" }}>0</span><span>9.4</span>
                        </div>

                        {/* Valori rapidi */}
                        <div style={{ marginTop: 10 }}>
                            <div style={{ fontSize: 11, color: "#9ca3af", fontFamily: "system-ui, sans-serif", marginBottom: 6 }}>
                                Valori rapidi:
                            </div>
                            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                {[-1, 0, 1, 2, 4, 8].map((v) => (
                                    <button
                                        key={v}
                                        onClick={() => setB(v)}
                                        style={{
                                            ...btnBase,
                                            padding: "3px 9px",
                                            fontSize: 12,
                                            background: b === v ? "#fef3c7" : "#f8fafc",
                                            borderColor: b === v ? "#f59e0b" : "#e5e7eb",
                                            fontWeight: b === v ? 700 : 400,
                                        }}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Schema decisionale */}
                    <div style={{ ...card, padding: 14, background: "#f0fdfa" }}>
                        <div style={{
                            fontSize: 11, color: "#0f766e", fontWeight: 700,
                            textTransform: "uppercase", letterSpacing: "0.07em",
                            fontFamily: "system-ui, sans-serif", marginBottom: 8,
                        }}>
                            Schema
                        </div>
                        <div style={{ fontFamily: "system-ui, sans-serif", fontSize: 13, lineHeight: 2 }}>
                            <Latex>{`${base.latex}^x = b`}</Latex>
                            <div style={{ marginLeft: 16 }}>
                                <div style={{
                                    color: bCase === "negative" ? "#b45309" : "#6b7280",
                                    fontWeight: bCase === "negative" ? 700 : 400,
                                }}>
                                    ├ b &lt; 0 → <span style={{ color: "#ef4444" }}>impossibile</span>
                                </div>
                                <div style={{
                                    color: bCase === "zero" ? "#b45309" : "#6b7280",
                                    fontWeight: bCase === "zero" ? 700 : 400,
                                }}>
                                    ├ b = 0 → <span style={{ color: "#ef4444" }}>impossibile</span>
                                </div>
                                <div style={{
                                    color: bCase === "positive" ? "#166534" : "#6b7280",
                                    fontWeight: bCase === "positive" ? 700 : 400,
                                }}>
                                    └ b &gt; 0 → <Latex>{`x = \\log_{${base.latex}} b`}</Latex>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Tabella riassuntiva ── */}
            <div style={{ ...card, padding: 0, marginBottom: 0 }}>
                <div style={{
                    background: "#2a2a2a", color: "#fff",
                    padding: "8px 16px", fontSize: 12, fontWeight: 700,
                    letterSpacing: "0.09em", textTransform: "uppercase",
                    fontFamily: "system-ui, sans-serif",
                }}>
                    Interpretazione grafica — riepilogo
                </div>

                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                            <tr>
                                {["Equazione", "Condizione", "Grafico", "Soluzione"].map((h) => (
                                    <th key={h} style={{
                                        padding: "8px 14px", textAlign: "left",
                                        background: "#f1f5f9", borderBottom: "2px solid #cbd5e1",
                                        fontFamily: "system-ui, sans-serif", fontSize: 12,
                                        color: "#475569", letterSpacing: "0.04em",
                                    }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                {
                                    eq: `${base.latex}^x = b`,
                                    cond: "b > 0",
                                    grafico: "La retta y = b interseca il grafico in un punto",
                                    sol: `x = \\log_{${base.latex}} b`,
                                    highlight: bCase === "positive",
                                    ok: true,
                                },
                                {
                                    eq: `${base.latex}^x = 0`,
                                    cond: "b = 0",
                                    grafico: "La retta y = 0 è l'asintoto orizzontale, nessuna intersezione",
                                    sol: "\\text{impossibile}",
                                    highlight: bCase === "zero",
                                    ok: false,
                                },
                                {
                                    eq: `${base.latex}^x = b`,
                                    cond: "b < 0",
                                    grafico: "La retta y = b è sotto l'asse x, nessuna intersezione",
                                    sol: "\\text{impossibile}",
                                    highlight: bCase === "negative",
                                    ok: false,
                                },
                            ].map((row, i) => (
                                <tr key={i} style={{
                                    background: row.highlight ? "#fffbe6" : "transparent",
                                    transition: "background 0.2s",
                                }}>
                                    <td style={{
                                        padding: "10px 14px", borderBottom: "1px solid #e5e7eb",
                                        borderLeft: `3px solid ${row.highlight ? "#e8a020" : "transparent"}`,
                                    }}>
                                        <Latex>{row.eq}</Latex>
                                    </td>
                                    <td style={{ padding: "10px 14px", borderBottom: "1px solid #e5e7eb" }}>
                                        <span style={{
                                            background: row.ok ? "#dcfce7" : "#fee2e2",
                                            color: row.ok ? "#166534" : "#991b1b",
                                            padding: "2px 8px", borderRadius: 4,
                                            fontSize: 12, fontFamily: "system-ui, sans-serif",
                                            fontWeight: 600,
                                        }}>
                                            {row.cond}
                                        </span>
                                    </td>
                                    <td style={{
                                        padding: "10px 14px", borderBottom: "1px solid #e5e7eb",
                                        fontSize: 12, color: "#6b7280",
                                        fontFamily: "system-ui, sans-serif",
                                    }}>
                                        {row.grafico}
                                    </td>
                                    <td style={{ padding: "10px 14px", borderBottom: "1px solid #e5e7eb" }}>
                                        <Latex>{row.sol}</Latex>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{
                    padding: "10px 16px", background: "#eff6ff",
                    fontSize: 13, color: "#1e40af",
                    fontFamily: "system-ui, sans-serif", lineHeight: 1.6,
                }}>
                    <strong>Proprietà chiave:</strong> La funzione{" "}
                    <Latex>{`y = ${base.latex}^x`}</Latex> è sempre <strong>strettamente positiva</strong>{" "}
                    (<Latex>{`${base.latex}^x > 0`}</Latex> per ogni <Latex>{"x \\in \\mathbb{R}"}</Latex>)
                    e <strong>monotona</strong> {a > 1 ? "crescente" : "decrescente"}.
                    Per questo l'equazione <Latex>{`${base.latex}^x = b`}</Latex>{" "}
                    ha soluzione se e solo se <Latex>{"b > 0"}</Latex>.
                </div>
            </div>
        </DemoContainer>
    );
}
