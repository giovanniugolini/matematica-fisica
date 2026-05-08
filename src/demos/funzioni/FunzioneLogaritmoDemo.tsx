/**
 * FunzioneLogaritmoDemo — La funzione logaritmo y = log_a(x)
 * Slider per la base a, con visualizzazione della funzione inversa (esponenziale)
 * e simmetria rispetto alla bisettrice y = x.
 */

import React, { useState } from "react";
import { Latex, DisplayMath, DemoContainer, CollapsiblePanel, useBreakpoint } from "../../components/ui";

// ── Viewport ─────────────────────────────────────────────────────────────────

const X_MIN = -2.4, X_MAX = 5.4;
const Y_MIN = -3.8, Y_MAX = 5.4;

// ── Helpers ───────────────────────────────────────────────────────────────────

function clamp(v: number, lo: number, hi: number) {
    return Math.max(lo, Math.min(hi, v));
}

function makeTransform(w: number, h: number) {
    const padL = 46, padR = 22, padT = 22, padB = 34;
    const gw = w - padL - padR, gh = h - padT - padB;
    const toX = (x: number) => padL + (x - X_MIN) / (X_MAX - X_MIN) * gw;
    const toY = (y: number) => padT + (1 - (y - Y_MIN) / (Y_MAX - Y_MIN)) * gh;
    const fromSvgX = (sx: number) => X_MIN + (sx - padL) / gw * (X_MAX - X_MIN);
    return { toX, toY, fromSvgX, padL, padR, padT, padB, gw, gh };
}

function buildPath(
    fn: (x: number) => number,
    xStart: number, xEnd: number, steps: number,
    toX: (x: number) => number, toY: (y: number) => number,
): string {
    let d = "", penDown = false;
    for (let i = 0; i <= steps; i++) {
        const x = xStart + (xEnd - xStart) * i / steps;
        const y = fn(x);
        if (isFinite(y) && y >= Y_MIN - 1.2 && y <= Y_MAX + 1.2) {
            d += `${penDown ? "L" : "M"} ${toX(x).toFixed(1)} ${toY(y).toFixed(1)} `;
            penDown = true;
        } else {
            penDown = false;
        }
    }
    return d;
}

function colorForBase(a: number): string {
    return a > 1 ? "#6366f1" : "#f59e0b";
}

function fmtBase(a: number): string {
    if (Math.abs(a - Math.E) < 0.04) return "e";
    const fracs: [number, string][] = [
        [0.5, "1/2"], [1 / 3, "1/3"], [0.25, "1/4"], [0.2, "1/5"],
        [2, "2"], [3, "3"], [4, "4"], [5, "5"], [10, "10"],
    ];
    for (const [val, label] of fracs) {
        if (Math.abs(a - val) < 0.03) return label;
    }
    return (Math.round(a * 100) / 100).toString();
}

function fmtLatex(a: number): string {
    if (Math.abs(a - Math.E) < 0.04) return "e";
    const fracs: [number, string][] = [
        [0.5, "\\tfrac{1}{2}"], [1 / 3, "\\tfrac{1}{3}"],
        [0.25, "\\tfrac{1}{4}"], [0.2, "\\tfrac{1}{5}"],
    ];
    for (const [val, label] of fracs) {
        if (Math.abs(a - val) < 0.03) return label;
    }
    return (Math.round(a * 100) / 100).toString();
}

// ── Graph ─────────────────────────────────────────────────────────────────────

function LogGraph({
    a, showExp, hoverX,
    onHover, onLeave, isMobile,
}: {
    a: number;
    showExp: boolean;
    hoverX: number | null;
    onHover: (x: number) => void;
    onLeave: () => void;
    isMobile: boolean;
}) {
    const w = isMobile ? 340 : 500;
    const h = isMobile ? 310 : 420;
    const fs = isMobile ? 9 : 11;

    const { toX, toY, fromSvgX, padL, padT, padB, gw, gh } = makeTransform(w, h);

    const valid = Math.abs(a - 1) > 0.09;
    const logFn = (x: number) => Math.log(x) / Math.log(a);
    const expFn = (x: number) => Math.pow(a, x);

    const logPath = valid ? buildPath(logFn, 0.003, X_MAX, 900, toX, toY) : "";
    const expPath = valid ? buildPath(expFn, X_MIN, X_MAX, 700, toX, toY) : "";

    const ax0 = toX(0), ay0 = toY(0);

    const LOG_C = colorForBase(a);
    const EXP_C = "#16a34a";
    const BIS_C = "#94a3b8";

    const gridXs = [-2, -1, 1, 2, 3, 4, 5].filter(x => x > X_MIN + 0.1 && x < X_MAX - 0.1);
    const gridYs = [-3, -2, -1, 1, 2, 3, 4, 5].filter(y => y > Y_MIN + 0.1 && y < Y_MAX - 0.1);

    // Hover
    const hValid = hoverX !== null && hoverX > 0.015 && valid;
    const hY = hValid ? logFn(hoverX!) : null;
    const hInView = hY !== null && hY > Y_MIN + 0.1 && hY < Y_MAX - 0.1;
    const hSvgX = hoverX !== null ? toX(hoverX) : null;
    const hSvgY = hInView && hY !== null ? toY(hY) : null;
    const ttFlip = hSvgX !== null && hSvgX > padL + gw - 110;

    const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const sx = (e.clientX - rect.left) * (w / rect.width);
        onHover(clamp(fromSvgX(sx), X_MIN, X_MAX));
    };

    // Bisettrice: from max(X_MIN, Y_MIN) to min(X_MAX, Y_MAX)
    const bisStart = Math.max(X_MIN, Y_MIN);
    const bisEnd = Math.min(X_MAX, Y_MAX);

    // Key point (a, 1): visible if a ∈ (0.02, X_MAX]
    const kpVisible = valid && a > 0.02 && a <= X_MAX;
    // Point (1/a, -1) also interesting: log_a(1/a) = -1
    const kp2Visible = valid && a < X_MAX && 1 / a > 0.02 && 1 / a < X_MAX;

    return (
        <svg
            viewBox={`0 0 ${w} ${h}`}
            style={{ width: "100%", display: "block", cursor: "crosshair", borderRadius: 10, userSelect: "none" }}
            onMouseMove={handleMove}
            onMouseLeave={onLeave}
        >
            <rect width={w} height={h} rx={10} fill="#f8fafc" />

            {/* Domain shading x > 0 */}
            <rect x={ax0} y={padT} width={padL + gw - ax0} height={gh}
                fill="#eef2ff" opacity={0.45} />

            {/* Grid */}
            {gridXs.map(x => (
                <line key={`gx${x}`} x1={toX(x)} y1={padT} x2={toX(x)} y2={padT + gh}
                    stroke="#e2e8f0" strokeWidth={1} />
            ))}
            {gridYs.map(y => (
                <line key={`gy${y}`} x1={padL} y1={toY(y)} x2={padL + gw} y2={toY(y)}
                    stroke="#e2e8f0" strokeWidth={1} />
            ))}

            {/* Bisettrice y = x */}
            {showExp && valid && (
                <path
                    d={`M ${toX(bisStart).toFixed(1)} ${toY(bisStart).toFixed(1)} L ${toX(bisEnd).toFixed(1)} ${toY(bisEnd).toFixed(1)}`}
                    fill="none" stroke={BIS_C} strokeWidth={1.5} strokeDasharray="9,5"
                />
            )}
            {showExp && valid && (
                <text
                    x={toX(Math.min(bisEnd - 0.4, X_MAX - 0.8))}
                    y={toY(Math.min(bisEnd - 0.4, Y_MAX - 0.8)) - 10}
                    fontSize={fs} fill={BIS_C} fontWeight="bold" textAnchor="middle"
                >
                    y = x
                </text>
            )}

            {/* Exponential y = aˣ */}
            {showExp && valid && (
                <>
                    <path d={expPath} fill="none" stroke={EXP_C} strokeWidth={2.5}
                        strokeLinecap="round" strokeLinejoin="round" />
                    {(() => {
                        const lx = a > 1 ? -1.5 : 2.5;
                        const ly = expFn(lx);
                        if (ly < Y_MIN + 0.3 || ly > Y_MAX - 0.5) return null;
                        return (
                            <text x={toX(lx) - 6} y={toY(ly) - 8} textAnchor="end"
                                fontSize={fs} fill={EXP_C} fontWeight="bold">
                                y = a<tspan baselineShift="super" fontSize={fs - 2}>x</tspan>
                            </text>
                        );
                    })()}
                </>
            )}

            {/* Logarithm y = log_a(x) */}
            {valid && (
                <>
                    <path d={logPath} fill="none" stroke={LOG_C} strokeWidth={2.8}
                        strokeLinecap="round" strokeLinejoin="round" />
                    {(() => {
                        const lx = a > 1 ? 3.5 : 4.5;
                        const ly = logFn(lx);
                        if (ly < Y_MIN + 0.3 || ly > Y_MAX - 0.5) return null;
                        return (
                            <text x={toX(lx)} y={toY(ly) - 10} textAnchor="middle"
                                fontSize={fs + 1} fill={LOG_C} fontWeight="bold">
                                y = log
                                <tspan baselineShift="sub" fontSize={fs - 1}>a</tspan>
                                (x)
                            </text>
                        );
                    })()}
                </>
            )}

            {/* Asymptote label */}
            {valid && (
                <text x={ax0 + 5} y={padT + 18} fontSize={fs - 1} fill="#ef4444" opacity={0.75} fontStyle="italic">
                    asint. x = 0
                </text>
            )}

            {/* Axes */}
            <line x1={padL} y1={ay0} x2={padL + gw + 6} y2={ay0} stroke="#475569" strokeWidth={2} />
            <line x1={ax0} y1={padT - 6} x2={ax0} y2={padT + gh} stroke="#475569" strokeWidth={2} />
            <polygon
                points={`${padL + gw + 6},${ay0} ${padL + gw - 2},${ay0 - 4} ${padL + gw - 2},${ay0 + 4}`}
                fill="#475569"
            />
            <polygon
                points={`${ax0},${padT - 6} ${ax0 - 4},${padT + 4} ${ax0 + 4},${padT + 4}`}
                fill="#475569"
            />
            <text x={padL + gw + 10} y={ay0 + 4} fontSize={fs} fill="#334155" fontWeight="bold">x</text>
            <text x={ax0 + 6} y={padT - 8} fontSize={fs} fill="#334155" fontWeight="bold">y</text>

            {/* Tick labels */}
            {gridXs.map(x => (
                <text key={`lx${x}`} x={toX(x)} y={ay0 + 14} textAnchor="middle"
                    fontSize={fs - 1} fill="#94a3b8">{x}</text>
            ))}
            {gridYs.map(y => (
                <text key={`ly${y}`} x={ax0 - 5} y={toY(y) + 4} textAnchor="end"
                    fontSize={fs - 1} fill="#94a3b8">{y}</text>
            ))}
            <text x={ax0 - 5} y={ay0 + 14} textAnchor="end" fontSize={fs - 1} fill="#94a3b8">0</text>

            {/* Key point (1, 0) */}
            {valid && (
                <g>
                    <circle cx={toX(1)} cy={toY(0)} r={5} fill={LOG_C} stroke="white" strokeWidth={1.8} />
                    <text x={toX(1) + 8} y={toY(0) - 7} fontSize={fs} fill={LOG_C} fontWeight="bold">(1, 0)</text>
                </g>
            )}

            {/* Key point (a, 1) */}
            {kpVisible && (
                <g>
                    <line x1={toX(a)} y1={ay0} x2={toX(a)} y2={toY(1)}
                        stroke={LOG_C} strokeWidth={1} strokeDasharray="3,2" opacity={0.5} />
                    <line x1={padL} y1={toY(1)} x2={toX(a)} y2={toY(1)}
                        stroke={LOG_C} strokeWidth={1} strokeDasharray="3,2" opacity={0.5} />
                    <circle cx={toX(a)} cy={toY(1)} r={4.5} fill={LOG_C} stroke="white" strokeWidth={1.8} />
                    <text
                        x={toX(a) + (a < 1 ? -8 : 8)}
                        y={toY(1) - 7}
                        textAnchor={a < 1 ? "end" : "start"}
                        fontSize={fs} fill={LOG_C} fontWeight="bold"
                    >
                        (a, 1)
                    </text>
                </g>
            )}

            {/* Key point (1/a, -1) — log_a(1/a) = -1 */}
            {kp2Visible && 1 / a < X_MAX && Math.abs(1 / a - 1) > 0.1 && (
                <g>
                    <circle cx={toX(1 / a)} cy={toY(-1)} r={3.5} fill={LOG_C} stroke="white" strokeWidth={1.5} opacity={0.65} />
                </g>
            )}

            {/* Hover */}
            {hValid && hInView && hSvgX !== null && hSvgY !== null && hY !== null && hoverX !== null && (
                <g>
                    <line x1={hSvgX} y1={padT} x2={hSvgX} y2={padT + gh}
                        stroke={LOG_C} strokeWidth={1} strokeDasharray="4,3" opacity={0.4} />
                    <line x1={padL} y1={hSvgY} x2={padL + gw} y2={hSvgY}
                        stroke={LOG_C} strokeWidth={1} strokeDasharray="4,3" opacity={0.4} />
                    <circle cx={hSvgX} cy={hSvgY} r={5} fill={LOG_C} stroke="white" strokeWidth={2} />
                    <rect
                        x={ttFlip ? hSvgX - 100 : hSvgX + 8}
                        y={hSvgY - 26}
                        width={94} height={22} rx={4}
                        fill="white" stroke={LOG_C} strokeWidth={1} opacity={0.93}
                    />
                    <text
                        x={ttFlip ? hSvgX - 96 : hSvgX + 12}
                        y={hSvgY - 10}
                        fontSize={fs} fill={LOG_C} fontWeight="bold"
                    >
                        ({hoverX.toFixed(2)},&nbsp;{hY.toFixed(2)})
                    </text>
                </g>
            )}

            {/* Legend */}
            {valid && (
                <g transform={`translate(${padL + 8}, ${padT + gh - (showExp ? 66 : 28)})`}>
                    <rect x={-4} y={-16} width={172} height={showExp ? 72 : 32} rx={4}
                        fill="white" stroke="#e2e8f0" strokeWidth={1} opacity={0.92} />
                    <line x1={0} y1={0} x2={22} y2={0} stroke={LOG_C} strokeWidth={2.8} strokeLinecap="round" />
                    <text x={26} y={4} fontSize={fs} fill={LOG_C} fontWeight="bold">
                        y = log{a > 1 ? "" : ""} <tspan dy={3} fontSize={fs - 2}>a</tspan>
                        <tspan dy={-3}>(x), a = {fmtBase(a)}</tspan>
                    </text>
                    {showExp && (
                        <>
                            <line x1={0} y1={20} x2={22} y2={20} stroke={EXP_C} strokeWidth={2.5} strokeLinecap="round" />
                            <text x={26} y={24} fontSize={fs} fill={EXP_C} fontWeight="bold">
                                y = a<tspan baselineShift="super" fontSize={fs - 2}>x</tspan>
                            </text>
                            <line x1={0} y1={40} x2={22} y2={40} stroke={BIS_C} strokeWidth={1.5} strokeDasharray="6,4" />
                            <text x={26} y={44} fontSize={fs} fill="#64748b" fontWeight="bold">y = x (bisettrice)</text>
                        </>
                    )}
                </g>
            )}
        </svg>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function FunzioneLogaritmoDemo() {
    const [sliderVal, setSliderVal] = useState(40); // 40 → a = 2.0 (mapped below)
    const [showExp, setShowExp] = useState(false);
    const [hoverX, setHoverX] = useState<number | null>(null);
    const bp = useBreakpoint();
    const isMobile = bp.isMobile;

    // Slider 1..95 → a 0.10..0.95, 96..190 → a 1.05..5.00
    // (95 values per side, gap represents a=1)
    function sliderToA(v: number): number {
        if (v <= 95) {
            // 1..95 → 0.10..0.95 linear
            return 0.10 + (v - 1) * (0.95 - 0.10) / 94;
        } else {
            // 96..190 → 1.05..5.00 linear
            return 1.05 + (v - 96) * (5.00 - 1.05) / 94;
        }
    }

    const a = sliderToA(sliderVal);
    const aGt1 = a > 1;
    const logColor = colorForBase(a);
    const baseLabel = fmtBase(a);
    const baseLatex = fmtLatex(a);

    return (
        <DemoContainer title="La funzione logaritmo: y = log_a(x)">

            {/* Slider */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 600, color: "#334155", fontSize: 15, minWidth: 70 }}>
                        Base <Latex>{"a"}</Latex>:
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 180 }}>
                        <span style={{ fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap" }}>
                            0 &lt; a &lt; 1
                        </span>
                        <input
                            type="range" min={1} max={190} step={1}
                            value={sliderVal}
                            onChange={e => setSliderVal(Number(e.target.value))}
                            style={{ flex: 1 }}
                        />
                        <span style={{ fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap" }}>
                            a &gt; 1
                        </span>
                    </div>
                    <div style={{
                        minWidth: 80, textAlign: "center",
                        padding: "4px 14px",
                        borderRadius: 8,
                        background: logColor + "18",
                        border: `2px solid ${logColor}`,
                        fontWeight: 700, fontSize: 17,
                        color: logColor,
                        fontFamily: "monospace",
                    }}>
                        a = {baseLabel}
                    </div>
                </div>

                {/* Presets */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {[
                        { label: "1/5", v: 5 },
                        { label: "1/4", v: 22 },
                        { label: "1/3", v: 39 },
                        { label: "1/2", v: 57 },
                        { label: "2", v: 97 },
                        { label: "3", v: 117 },
                        { label: "e", v: Math.round(96 + (Math.E - 1.05) / (5.00 - 1.05) * 94) },
                        { label: "4", v: 137 },
                        { label: "5", v: 190 },
                    ].map(({ label, v }) => (
                        <button
                            key={label}
                            onClick={() => setSliderVal(v)}
                            style={{
                                padding: "3px 10px", borderRadius: 6, fontSize: 13,
                                border: `1.5px solid ${Math.abs(sliderVal - v) < 2 ? logColor : "#cbd5e1"}`,
                                background: Math.abs(sliderVal - v) < 2 ? logColor + "18" : "#f8fafc",
                                color: Math.abs(sliderVal - v) < 2 ? logColor : "#475569",
                                fontWeight: Math.abs(sliderVal - v) < 2 ? 700 : 400,
                                cursor: "pointer",
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Checkbox: mostra esponenziale + bisettrice */}
                <label style={{
                    display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                    fontWeight: 500, color: "#334155", fontSize: 14,
                    padding: "6px 12px", borderRadius: 8,
                    border: "1.5px solid " + (showExp ? "#16a34a" : "#e2e8f0"),
                    background: showExp ? "#f0fdf4" : "#f8fafc",
                    width: "fit-content",
                }}>
                    <input
                        type="checkbox"
                        checked={showExp}
                        onChange={e => setShowExp(e.target.checked)}
                        style={{ width: 16, height: 16, cursor: "pointer" }}
                    />
                    Mostra anche{" "}
                    <Latex>{"y = a^x"}</Latex>
                    {" "}e la simmetria rispetto alla bisettrice{" "}
                    <Latex>{"y = x"}</Latex>
                </label>
            </div>

            {/* Graph */}
            <LogGraph
                a={a}
                showExp={showExp}
                hoverX={hoverX}
                onHover={setHoverX}
                onLeave={() => setHoverX(null)}
                isMobile={isMobile}
            />

            {/* Properties panel */}
            <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: 10, marginTop: 14,
            }}>
                <div style={{
                    background: "#fff", borderRadius: 10, padding: "12px 16px",
                    border: `1.5px solid ${logColor}30`,
                }}>
                    <div style={{ fontWeight: 700, color: logColor, marginBottom: 8, fontSize: 14 }}>
                        Caratteristiche — a = {baseLabel}
                        {aGt1 ? " > 1" : " < 1"}
                    </div>
                    <table style={{ fontSize: 13, color: "#334155", borderCollapse: "collapse", width: "100%" }}>
                        <tbody>
                            <tr>
                                <td style={{ paddingRight: 10, paddingBottom: 5, color: "#64748b", whiteSpace: "nowrap" }}>Dominio</td>
                                <td><Latex>{"(0,\\,+\\infty)"}</Latex></td>
                            </tr>
                            <tr>
                                <td style={{ paddingRight: 10, paddingBottom: 5, color: "#64748b" }}>Immagine</td>
                                <td><Latex>{"\\mathbb{R}"}</Latex></td>
                            </tr>
                            <tr>
                                <td style={{ paddingRight: 10, paddingBottom: 5, color: "#64748b" }}>Monotonia</td>
                                <td style={{ fontWeight: 600, color: aGt1 ? "#6366f1" : "#f59e0b" }}>
                                    {aGt1 ? "crescente" : "decrescente"}
                                </td>
                            </tr>
                            <tr>
                                <td style={{ paddingRight: 10, paddingBottom: 5, color: "#64748b" }}>Asintoto</td>
                                <td><Latex>{"x = 0"}</Latex> (verticale)</td>
                            </tr>
                            <tr>
                                <td style={{ paddingRight: 10, paddingBottom: 5, color: "#64748b" }}>Zero</td>
                                <td><Latex>{"x = 1"}</Latex> → punto (1, 0)</td>
                            </tr>
                            <tr>
                                <td style={{ paddingRight: 10, color: "#64748b" }}>Punto (a, 1)</td>
                                <td><Latex>{`\\log_{${baseLatex}} ${baseLatex} = 1`}</Latex></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div style={{
                    background: "#fff", borderRadius: 10, padding: "12px 16px",
                    border: "1.5px solid #e2e8f0",
                }}>
                    <div style={{ fontWeight: 700, color: "#334155", marginBottom: 8, fontSize: 14 }}>
                        Limiti agli estremi del dominio
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{
                            background: "#f8fafc", borderRadius: 6, padding: "6px 10px",
                            fontSize: 13, display: "flex", alignItems: "center", gap: 6,
                        }}>
                            <Latex>{`\\lim_{x \\to 0^+} \\log_{${baseLatex}} x = ${aGt1 ? "-\\infty" : "+\\infty"}`}</Latex>
                        </div>
                        <div style={{
                            background: "#f8fafc", borderRadius: 6, padding: "6px 10px",
                            fontSize: 13, display: "flex", alignItems: "center", gap: 6,
                        }}>
                            <Latex>{`\\lim_{x \\to +\\infty} \\log_{${baseLatex}} x = ${aGt1 ? "+\\infty" : "-\\infty"}`}</Latex>
                        </div>
                    </div>
                    {showExp && (
                        <div style={{
                            marginTop: 10, padding: "8px 10px",
                            background: "#f0fdf4", borderRadius: 6,
                            border: "1px solid #bbf7d0",
                            fontSize: 13, color: "#166534", lineHeight: 1.6,
                        }}>
                            <strong>Funzione inversa:</strong>{" "}
                            <Latex>{"y = \\log_a x"}</Latex> e <Latex>{"y = a^x"}</Latex> sono
                            inverse l'una dell'altra: i loro grafici sono simmetrici rispetto alla retta{" "}
                            <Latex>{"y = x"}</Latex>.
                        </div>
                    )}
                </div>
            </div>

            {/* Collapsible theory */}
            <CollapsiblePanel title="Definizione e proprietà fondamentali">
                <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 14, color: "#334155" }}>
                    <p style={{ margin: 0 }}>
                        Il <strong>logaritmo in base <Latex>{"a"}</Latex></strong> di un numero{" "}
                        <Latex>{"x > 0"}</Latex> è l'esponente a cui occorre elevare{" "}
                        <Latex>{"a"}</Latex> per ottenere <Latex>{"x"}</Latex>:
                    </p>
                    <div style={{ textAlign: "center", padding: "8px 0" }}>
                        <DisplayMath>{`y = \\log_a x \\iff a^y = x \\qquad (a > 0,\\, a \\neq 1,\\, x > 0)`}</DisplayMath>
                    </div>
                    <div>
                        <strong>Proprietà dei logaritmi:</strong>
                        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                            <DisplayMath>{"\\log_a(xy) = \\log_a x + \\log_a y"}</DisplayMath>
                            <DisplayMath>{"\\log_a\\!\\left(\\frac{x}{y}\\right) = \\log_a x - \\log_a y"}</DisplayMath>
                            <DisplayMath>{"\\log_a(x^n) = n \\cdot \\log_a x"}</DisplayMath>
                            <DisplayMath>{"\\log_a x = \\frac{\\ln x}{\\ln a} \\quad \\text{(cambio di base)}"}</DisplayMath>
                        </div>
                    </div>
                </div>
            </CollapsiblePanel>
        </DemoContainer>
    );
}
