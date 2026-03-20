/**
 * FunzioneEsponenzialeDemo — Crescita e decadimento esponenziale
 * Osserva come y = aˣ cambia al variare della base a
 */

import React, { useState } from "react";
import { Latex, DemoContainer, InfoBox, useBreakpoint } from "../../components/ui";
import { CollapsibleExplanation } from "../../components/ui/CollapsibleExplanation";

// ── Costanti ──────────────────────────────────────────────────────────────────

const E = Math.E;
const X_MIN = -4.5, X_MAX = 4.5;
const Y_MIN = -0.4, Y_MAX = 8.4;

// ── Helpers ───────────────────────────────────────────────────────────────────

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }
function s3(n: number) { return parseFloat(n.toPrecision(3)).toString(); }

function colorFor(a: number) {
    if (Math.abs(a - 1) < 0.04) return "#94a3b8";
    return a > 1 ? "#22c55e" : "#ef4444";
}

// ── Trasformazione coordinate ─────────────────────────────────────────────────

function makeTransform(w: number, h: number) {
    const padL = 42, padR = 18, padT = 20, padB = 30;
    const gw = w - padL - padR, gh = h - padT - padB;
    const toX = (x: number) => padL + (x - X_MIN) / (X_MAX - X_MIN) * gw;
    const toY = (y: number) => padT + (1 - (y - Y_MIN) / (Y_MAX - Y_MIN)) * gh;
    const fromSvgX = (sx: number) => X_MIN + (sx - padL) / gw * (X_MAX - X_MIN);
    return { toX, toY, fromSvgX, padL, padR, padT, padB, gw, gh };
}

// ── Percorso SVG della curva ──────────────────────────────────────────────────

function buildPath(a: number, toX: (x: number) => number, toY: (y: number) => number): string {
    let d = "", penDown = false;
    for (let i = 0; i <= 600; i++) {
        const x = X_MIN + (X_MAX - X_MIN) * i / 600;
        const y = Math.pow(a, x);
        if (y >= Y_MIN - 0.5 && y <= Y_MAX + 1) {
            d += `${penDown ? "L" : "M"} ${toX(x).toFixed(1)} ${toY(y).toFixed(1)} `;
            penDown = true;
        } else {
            penDown = false;
        }
    }
    return d;
}

// ── Grafico SVG ───────────────────────────────────────────────────────────────

function ExpoGraph({ a, showMirror, hoverX, onMouseMove, onMouseLeave, isMobile }: {
    a: number; showMirror: boolean;
    hoverX: number | null;
    onMouseMove: (x: number) => void;
    onMouseLeave: () => void;
    isMobile: boolean;
}) {
    const w = isMobile ? 340 : 500, h = isMobile ? 270 : 360;
    const fs = isMobile ? 9 : 11;
    const { toX, toY, fromSvgX, padL, padT, gw, gh } = makeTransform(w, h);

    const color = colorFor(a);
    const mirrorA = 1 / a;
    const mirrorColor = colorFor(mirrorA);

    const ax0 = toX(0), ay0 = toY(0);

    const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const sx = (e.clientX - rect.left) * (w / rect.width);
        onMouseMove(clamp(fromSvgX(sx), X_MIN, X_MAX));
    };

    const hoverY = hoverX !== null ? Math.pow(a, hoverX) : null;
    const hoverSvgX = hoverX !== null ? toX(hoverX) : null;
    const hoverInRange = hoverY !== null && hoverY >= Y_MIN + 0.1 && hoverY <= Y_MAX - 0.2;
    const hoverSvgY = hoverInRange ? toY(hoverY!) : null;
    const tooltipFlip = hoverSvgX !== null && hoverSvgX > w - 115;

    // Punti chiave
    const p01x = toX(0), p01y = toY(1);         // (0,1) — sempre
    const p1ax = toX(1), p1ay = toY(a);          // (1, a)
    const pm1x = toX(-1), pm1y = toY(1 / a);    // (−1, 1/a)
    const p1aVisible = p1ay >= padT && p1ay <= padT + gh;
    const pm1Visible = pm1y >= padT && pm1y <= padT + gh && Math.abs(a - 1) > 0.05;

    // Label curva simmetrica
    const mirrorLabelX = a > 1 ? 2 : -2;
    const mirrorLabelY = Math.pow(mirrorA, mirrorLabelX);
    const mirrorLabelVisible = mirrorLabelY > Y_MIN + 0.3 && mirrorLabelY < Y_MAX - 0.3;

    return (
        <svg viewBox={`0 0 ${w} ${h}`}
            style={{ width: "100%", display: "block", cursor: "crosshair", borderRadius: 10 }}
            onMouseMove={handleMove} onMouseLeave={onMouseLeave}>
            <rect width={w} height={h} rx={10} fill="#f8fafc" />

            {/* Griglia */}
            {Array.from({ length: 9 }, (_, i) => i - 4).map(x => (
                <line key={`gx${x}`} x1={toX(x)} y1={padT} x2={toX(x)} y2={padT + gh}
                    stroke="#e2e8f0" strokeWidth={1} />
            ))}
            {Array.from({ length: 9 }, (_, i) => i).map(y => (
                <line key={`gy${y}`} x1={padL} y1={toY(y)} x2={padL + gw} y2={toY(y)}
                    stroke="#e2e8f0" strokeWidth={1} />
            ))}

            {/* Asintoto y=0 */}
            <line x1={padL} y1={ay0} x2={padL + gw} y2={ay0}
                stroke="#a855f7" strokeWidth={2} strokeDasharray="7,4" opacity={0.6} />
            <text x={padL + 6} y={ay0 - 5} fontSize={fs - 1} fill="#a855f7" opacity={0.8} fontStyle="italic">
                asintoto y = 0
            </text>

            {/* Assi */}
            <line x1={padL} y1={ay0} x2={padL + gw + 5} y2={ay0} stroke="#475569" strokeWidth={2} />
            <line x1={ax0} y1={padT - 5} x2={ax0} y2={padT + gh} stroke="#475569" strokeWidth={2} />
            <polygon points={`${padL + gw + 5},${ay0} ${padL + gw - 2},${ay0 - 4} ${padL + gw - 2},${ay0 + 4}`} fill="#475569" />
            <polygon points={`${ax0},${padT - 5} ${ax0 - 4},${padT + 3} ${ax0 + 4},${padT + 3}`} fill="#475569" />
            <text x={padL + gw + 9} y={ay0 + 4} fontSize={fs} fill="#334155" fontWeight="bold">x</text>
            <text x={ax0 + 5} y={padT - 8} fontSize={fs} fill="#334155" fontWeight="bold">y</text>

            {/* Etichette assi */}
            {[-4, -3, -2, -1, 1, 2, 3, 4].map(x => (
                <text key={`lx${x}`} x={toX(x)} y={ay0 + 14} textAnchor="middle" fontSize={fs - 1} fill="#94a3b8">{x}</text>
            ))}
            {[1, 2, 3, 4, 5, 6, 7].map(y => (
                <text key={`ly${y}`} x={ax0 - 5} y={toY(y) + 4} textAnchor="end" fontSize={fs - 1} fill="#94a3b8">{y}</text>
            ))}
            <text x={ax0 - 5} y={ay0 + 14} textAnchor="end" fontSize={fs - 1} fill="#94a3b8">0</text>

            {/* Curva simmetrica */}
            {showMirror && Math.abs(a - 1) > 0.04 && (
                <>
                    <path d={buildPath(mirrorA, toX, toY)} fill="none"
                        stroke={mirrorColor} strokeWidth={2} strokeDasharray="6,3" opacity={0.5} />
                    {mirrorLabelVisible && (
                        <text x={toX(mirrorLabelX)} y={toY(mirrorLabelY) - 8}
                            textAnchor="middle" fontSize={fs} fill={mirrorColor} opacity={0.75} fontWeight="bold">
                            y = (1/a)ˣ
                        </text>
                    )}
                </>
            )}

            {/* Curva principale */}
            <path d={buildPath(a, toX, toY)} fill="none" stroke={color} strokeWidth={2.8}
                strokeLinecap="round" strokeLinejoin="round" />
            {/* Etichetta curva */}
            {(() => {
                const lx = a >= 1 ? 2.2 : -2.2;
                const ly = Math.pow(a, lx);
                if (ly < Y_MIN + 0.3 || ly > Y_MAX - 0.5) return null;
                return (
                    <text x={toX(lx)} y={toY(ly) - 10} textAnchor="middle"
                        fontSize={fs + 1} fill={color} fontWeight="bold">
                        y = {s3(a)}ˣ
                    </text>
                );
            })()}

            {/* Punto (0,1) — sempre visibile */}
            <circle cx={p01x} cy={p01y} r={5.5} fill="#fff" stroke="#334155" strokeWidth={2.2} />
            <text x={p01x + 9} y={p01y - 8} fontSize={fs} fill="#334155" fontWeight="bold">(0, 1)</text>

            {/* Punto (1, a) */}
            {p1aVisible && (
                <g>
                    <line x1={toX(1)} y1={ay0} x2={toX(1)} y2={p1ay}
                        stroke={color} strokeWidth={1} strokeDasharray="3,2" opacity={0.45} />
                    <line x1={ax0} y1={p1ay} x2={toX(1)} y2={p1ay}
                        stroke={color} strokeWidth={1} strokeDasharray="3,2" opacity={0.45} />
                    <circle cx={p1ax} cy={p1ay} r={5} fill={color} stroke="#fff" strokeWidth={1.8} />
                    <text x={p1ax + 9} y={p1ay + 4} fontSize={fs} fill={color} fontWeight="bold">
                        (1, {s3(a)})
                    </text>
                </g>
            )}

            {/* Punto (−1, 1/a) */}
            {pm1Visible && (
                <g>
                    <circle cx={pm1x} cy={pm1y} r={4} fill={color} stroke="#fff" strokeWidth={1.5} opacity={0.75} />
                    <text x={pm1x - 9} y={pm1y - 7} textAnchor="end" fontSize={fs} fill={color} opacity={0.85} fontWeight="bold">
                        (−1, {s3(1 / a)})
                    </text>
                </g>
            )}

            {/* Hover */}
            {hoverX !== null && hoverSvgY !== null && (
                <g>
                    <line x1={hoverSvgX!} y1={padT} x2={hoverSvgX!} y2={padT + gh}
                        stroke="#64748b" strokeWidth={1} strokeDasharray="4,3" opacity={0.55} />
                    <circle cx={hoverSvgX!} cy={hoverSvgY} r={5.5} fill={color} stroke="#fff" strokeWidth={2} />
                    <rect
                        x={tooltipFlip ? hoverSvgX! - 98 : hoverSvgX! + 10}
                        y={hoverSvgY - 25}
                        width={88} height={22} rx={5}
                        fill="rgba(255,255,255,0.96)" stroke={color} strokeWidth={1.3} />
                    <text
                        x={(tooltipFlip ? hoverSvgX! - 98 : hoverSvgX! + 10) + 44}
                        y={hoverSvgY - 10}
                        textAnchor="middle" fontSize={fs} fill={color} fontWeight="bold">
                        ({s3(hoverX)}, {s3(hoverY!)})
                    </text>
                </g>
            )}
        </svg>
    );
}

// ── Slider base a ─────────────────────────────────────────────────────────────

function BaseSlider({ a, onChange }: { a: number; onChange: (v: number) => void }) {
    const color = colorFor(a);
    const pct = ((clamp(a, 0.1, 5) - 0.1) / 4.9) * 100;

    const presets: { label: string; value: number; sup?: string }[] = [
        { label: "2", value: 2 },
        { label: "e", value: E, sup: "≈2.72" },
        { label: "10", value: 10 },
        { label: "½", value: 0.5 },
        { label: "1/e", value: 1 / E, sup: "≈0.37" },
        { label: "0.1", value: 0.1 },
    ];

    return (
        <div style={{ background: "#fff", border: "2px solid #e2e8f0", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>
                    Base <Latex>{"a"}</Latex>
                </span>
                <span style={{
                    fontSize: 20, fontWeight: 800, color,
                    background: `${color}15`, borderRadius: 8, padding: "2px 12px",
                    border: `1.5px solid ${color}`,
                    transition: "color 0.3s",
                }}>
                    a = {s3(a)}
                </span>
            </div>
            <input type="range" min={0.1} max={5} step={0.05} value={clamp(a, 0.1, 5)}
                onChange={e => onChange(parseFloat(e.target.value))}
                style={{
                    width: "100%", height: 8, borderRadius: 4,
                    appearance: "none", outline: "none",
                    background: `linear-gradient(to right, ${color} ${pct}%, #e2e8f0 ${pct}%)`,
                    cursor: "pointer", accentColor: color,
                }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#94a3b8", marginTop: 3 }}>
                <span>0.1 — decadimento</span>
                <span style={{ color: "#475569", fontWeight: 600 }}>a = 1</span>
                <span>5 — crescita</span>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 12, alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Valori notevoli:</span>
                {presets.map(p => {
                    const active = Math.abs(a - p.value) < 0.03;
                    const c = colorFor(p.value);
                    return (
                        <button key={p.label} onClick={() => onChange(p.value)} style={{
                            padding: "4px 13px", borderRadius: 18,
                            border: `1.5px solid ${active ? c : "#e2e8f0"}`,
                            background: active ? `${c}18` : "#fff",
                            color: active ? c : "#64748b",
                            fontWeight: 700, fontSize: 13, cursor: "pointer",
                            transition: "all 0.2s",
                        }}>
                            {p.label}
                            {p.sup && <sup style={{ fontSize: 9, fontWeight: 400 }}>{p.sup}</sup>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ── Card proprietà ────────────────────────────────────────────────────────────

function PropertiesPanel({ a, isMobile }: { a: number; isMobile: boolean }) {
    const color = colorFor(a);
    const isGrowth = a > 1.04;
    const isDecay = a < 0.96;
    const isConst = !isGrowth && !isDecay;

    const tableXs = [-3, -2, -1, 0, 1, 2, 3];

    return (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
            {/* Proprietà */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 10, letterSpacing: 1 }}>
                    PROPRIETÀ
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <tbody>
                        {[
                            ["Dominio", "ℝ"],
                            ["Codominio", "(0, +∞)"],
                            ["f(0)", "1  (sempre)"],
                            ["f(1)", s3(a)],
                            ["f(−1)", s3(1 / a)],
                            ["Monotonia", isGrowth ? "crescente ↑" : isDecay ? "decrescente ↓" : "costante →"],
                            ["Asintoto", "y = 0"],
                        ].map(([k, v]) => (
                            <tr key={k} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                <td style={{ padding: "5px 0", color: "#64748b", fontWeight: 600, fontSize: 12 }}>{k}</td>
                                <td style={{ padding: "5px 0", color: isConst ? "#64748b" : color, fontWeight: 700, textAlign: "right" }}>
                                    {v}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Tavola valori */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 10, letterSpacing: 1 }}>
                    TAVOLA DEI VALORI
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: "left", padding: "3px 2px", color: "#64748b", fontWeight: 600 }}>x</th>
                            {tableXs.map(x => (
                                <th key={x} style={{
                                    textAlign: "center", padding: "3px 2px",
                                    color: x === 0 ? "#334155" : "#94a3b8", fontWeight: 600,
                                }}>{x}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ color: "#64748b", fontWeight: 600, padding: "3px 2px" }}>aˣ</td>
                            {tableXs.map(x => {
                                const y = Math.pow(a, x);
                                const disp = y < 0.001 ? "≈0" : y > 9999 ? "↑∞" : s3(y);
                                return (
                                    <td key={x} style={{
                                        textAlign: "center", padding: "3px 2px",
                                        fontWeight: 700, fontSize: 11,
                                        color: x === 0 ? "#334155" : color,
                                    }}>
                                        {disp}
                                    </td>
                                );
                            })}
                        </tr>
                    </tbody>
                </table>
                <div style={{ marginTop: 10, fontSize: 11, color: "#94a3b8" }}>
                    Nota: a⁰ = 1 qualunque sia la base a
                </div>
            </div>
        </div>
    );
}

// ── Componente principale ─────────────────────────────────────────────────────

export default function FunzioneEsponenzialeDemo() {
    const { isMobile } = useBreakpoint();
    const [a, setA] = useState(2);
    const [showMirror, setShowMirror] = useState(false);
    const [hoverX, setHoverX] = useState<number | null>(null);

    const color = colorFor(a);
    const isGrowth = a > 1.04;
    const isDecay = a < 0.96;
    const isConst = !isGrowth && !isDecay;

    return (
        <DemoContainer
            title="La funzione esponenziale  y = aˣ"
            description="Modifica la base a e osserva la differenza tra crescita (a > 1) e decadimento (0 < a < 1)"
        >
            <div style={{ display: "grid", gap: 16 }}>
                {/* Badge tipo */}
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 10, alignSelf: "start",
                    padding: "10px 22px", borderRadius: 30,
                    background: isConst ? "#f1f5f9" : isGrowth ? "#dcfce7" : "#fee2e2",
                    border: `2px solid ${color}`,
                    fontSize: 15, fontWeight: 700, color,
                    transition: "all 0.3s",
                }}>
                    <span style={{ fontSize: 22 }}>{isGrowth ? "📈" : isDecay ? "📉" : "➡️"}</span>
                    {isGrowth ? "Crescita esponenziale" : isDecay ? "Decadimento esponenziale" : "Funzione costante (a = 1)"}
                </div>

                {/* Grafico */}
                <ExpoGraph
                    a={a} showMirror={showMirror} hoverX={hoverX}
                    onMouseMove={setHoverX} onMouseLeave={() => setHoverX(null)}
                    isMobile={isMobile}
                />

                {/* Pulsante curva simmetrica */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <button onClick={() => setShowMirror(p => !p)} style={{
                        padding: "7px 20px", borderRadius: 20,
                        border: `2px solid ${showMirror ? "#8b5cf6" : "#e2e8f0"}`,
                        background: showMirror ? "#f5f3ff" : "#fff",
                        color: showMirror ? "#8b5cf6" : "#64748b",
                        fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.2s",
                    }}>
                        {showMirror ? "✓ Nascondi curva simmetrica" : "Mostra curva simmetrica  (a ↔ 1/a)"}
                    </button>
                </div>

                {/* Nota simmetria */}
                {showMirror && !isConst && (
                    <div style={{
                        background: "#faf5ff", border: "1px solid #e9d5ff",
                        borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#6b21a8",
                    }}>
                        <strong>Simmetria rispetto all'asse y:</strong>{" "}
                        le curve y = {s3(a)}ˣ e y = {s3(1 / a)}ˣ sono speculari perché{" "}
                        {s3(1 / a)} = 1 / {s3(a)}, quindi{" "}
                        <Latex>{"(1/a)^x = a^{-x}"}</Latex>
                    </div>
                )}

                {/* Slider */}
                <BaseSlider a={a} onChange={setA} />

                {/* Proprietà + tavola */}
                <PropertiesPanel a={a} isMobile={isMobile} />

                {/* Teoria */}
                <CollapsibleExplanation title="Proprietà della funzione esponenziale">
                    <div style={{ fontSize: 13, lineHeight: 1.8 }}>
                        <p>
                            La funzione <strong>y = aˣ</strong> è definita per ogni{" "}
                            <Latex>{"a > 0,\\ a \\neq 1"}</Latex> e per ogni{" "}
                            <Latex>{"x \\in \\mathbb{R}"}</Latex>.
                        </p>
                        <Latex display>{"a > 1 \\Rightarrow \\lim_{x \\to +\\infty} a^x = +\\infty, \\quad \\lim_{x \\to -\\infty} a^x = 0"}</Latex>
                        <Latex display>{"0 < a < 1 \\Rightarrow \\lim_{x \\to +\\infty} a^x = 0, \\quad \\lim_{x \\to -\\infty} a^x = +\\infty"}</Latex>
                        <p>Proprietà delle potenze:</p>
                        <Latex display>{"a^0 = 1 \\qquad a^{x+y} = a^x \\cdot a^y \\qquad (a^x)^y = a^{xy} \\qquad a^{-x} = \\frac{1}{a^x}"}</Latex>
                        <p>
                            Il numero <strong>e ≈ 2.718</strong> (numero di Eulero) è la base
                            dell'esponenziale naturale: compare naturalmente in fisica (decadimento
                            radioattivo), biologia (crescita batterica) e finanza (interesse composto).
                        </p>
                    </div>
                </CollapsibleExplanation>
            </div>

            <InfoBox title="Crescita vs Decadimento — confronto rapido">
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, fontSize: 13 }}>
                    <div>
                        <div style={{ fontWeight: 700, marginBottom: 6, color: "#16a34a" }}>📈 Crescita  (a &gt; 1)</div>
                        <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.9 }}>
                            <li>La curva cresce da sinistra a destra</li>
                            <li>Per <Latex>{"x \\to +\\infty"}</Latex>: <Latex>{"a^x \\to +\\infty"}</Latex></li>
                            <li>Per <Latex>{"x \\to -\\infty"}</Latex>: <Latex>{"a^x \\to 0"}</Latex></li>
                            <li>Tanto più ripida quanto più <Latex>{"a"}</Latex> è grande</li>
                        </ul>
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, marginBottom: 6, color: "#dc2626" }}>📉 Decadimento  (0 &lt; a &lt; 1)</div>
                        <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.9 }}>
                            <li>La curva decresce da sinistra a destra</li>
                            <li>Per <Latex>{"x \\to +\\infty"}</Latex>: <Latex>{"a^x \\to 0"}</Latex></li>
                            <li>Per <Latex>{"x \\to -\\infty"}</Latex>: <Latex>{"a^x \\to +\\infty"}</Latex></li>
                            <li>È la stessa curva ma "ribaltata": <Latex>{"(1/a)^x = a^{-x}"}</Latex></li>
                        </ul>
                    </div>
                    <div style={{ gridColumn: isMobile ? "1" : "1 / -1", paddingTop: 8, borderTop: "1px solid #e2e8f0" }}>
                        <strong>In entrambi i casi:</strong> la curva passa sempre per{" "}
                        <Latex>{"(0,\\,1)"}</Latex>, il dominio è <Latex>{"\\mathbb{R}"}</Latex>,
                        il codominio è <Latex>{"(0, +\\infty)"}</Latex> e l'asse x è asintoto orizzontale.
                    </div>
                </div>
            </InfoBox>
        </DemoContainer>
    );
}
