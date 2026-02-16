/**
 * ProprietaFunzioniContinueDemo
 *
 * Tre teoremi sulle funzioni continue in [a,b]:
 *   Tab 1 – Teorema di esistenza degli zeri (Bolzano)
 *   Tab 2 – Teorema di Weierstrass
 *   Tab 3 – Teorema dei valori intermedi (Darboux)
 *
 * Per ciascun teorema l'utente esplora:
 *   • Esempi che confermano il teorema
 *   • Controesempi dove un'ipotesi viene meno
 */

import React, { useState, useMemo } from "react";
import {
    Latex,
    DemoContainer,
    InfoBox,
    CollapsiblePanel,
    useBreakpoint,
} from "../../components/ui";

// ============ TIPI ============

interface Segment {
    fn: (x: number) => number;
    from: number;
    to: number;
    leftClosed: boolean;
    rightClosed: boolean;
}

interface Scenario {
    id: string;
    label: string;
    latexFn: string;
    type: "conferma" | "controesempio" | "nota";
    segments: Segment[];
    a: number;
    b: number;
    aClosed: boolean;
    bClosed: boolean;
    description: string;
    ipotesi: string[];
    maxExists?: boolean; // default true
    minExists?: boolean; // default true
    asymptoteX?: number; // vertical asymptote to draw
}

// ============ UTILITÀ NUMERICHE ============

function sampleSeg(seg: Segment, n: number, yClip: number): ({ x: number; y: number | null })[] {
    const pts: { x: number; y: number | null }[] = [];
    const dx = (seg.to - seg.from) / n;
    for (let i = 0; i <= n; i++) {
        const x = seg.from + i * dx;
        let y: number | null = seg.fn(x);
        if (!isFinite(y as number) || Math.abs(y as number) > yClip) y = null;
        pts.push({ x, y });
    }
    return pts;
}

function findZeros(fn: (x: number) => number, from: number, to: number): number[] {
    const zeros: number[] = [];
    const n = 2000;
    const dx = (to - from) / n;
    let prevY = fn(from);
    for (let i = 1; i <= n; i++) {
        const x = from + i * dx;
        const y = fn(x);
        if (!isFinite(prevY) || !isFinite(y)) { prevY = y; continue; }
        if (prevY * y < 0) {
            let lo = x - dx, hi = x;
            for (let j = 0; j < 30; j++) {
                const mid = (lo + hi) / 2;
                if (fn(lo) * fn(mid) <= 0) hi = mid; else lo = mid;
            }
            zeros.push((lo + hi) / 2);
        } else if (Math.abs(y) < 1e-10) {
            zeros.push(x);
        }
        prevY = y;
    }
    return zeros;
}

function findExtrema(segs: Segment[], yClip: number) {
    let maxVal = -Infinity, maxX = 0, minVal = Infinity, minX = 0;
    for (const seg of segs) {
        const n = 1000;
        const dx = (seg.to - seg.from) / n;
        for (let i = 0; i <= n; i++) {
            const x = seg.from + i * dx;
            const y = seg.fn(x);
            if (!isFinite(y) || Math.abs(y) > yClip) continue;
            if (y > maxVal) { maxVal = y; maxX = x; }
            if (y < minVal) { minVal = y; minX = x; }
        }
    }
    return { maxVal, maxX, minVal, minX };
}

function findIntersections(segs: Segment[], k: number): number[] {
    const res: number[] = [];
    for (const seg of segs) {
        const n = 2000;
        const dx = (seg.to - seg.from) / n;
        let prevY = seg.fn(seg.from) - k;
        for (let i = 1; i <= n; i++) {
            const x = seg.from + i * dx;
            const y = seg.fn(x) - k;
            if (!isFinite(prevY) || !isFinite(y)) { prevY = y; continue; }
            if (prevY * y < 0) {
                let lo = x - dx, hi = x;
                for (let j = 0; j < 30; j++) {
                    const mid = (lo + hi) / 2;
                    if ((seg.fn(lo) - k) * (seg.fn(mid) - k) <= 0) hi = mid; else lo = mid;
                }
                res.push((lo + hi) / 2);
            } else if (Math.abs(y) < 1e-10) {
                res.push(x);
            }
            prevY = y;
        }
    }
    return res;
}

// ============ GRAPH COMPONENT ============

interface GraphProps {
    segments: Segment[];
    a: number;
    b: number;
    aClosed: boolean;
    bClosed: boolean;
    width: number;
    height: number;
    yClip?: number;
    specialPoints?: { x: number; y: number; color: string; label: string; labelPos?: "above" | "below" | "left" | "right" }[];
    hLines?: { y: number; color: string; label: string; dashed?: boolean }[];
    projections?: { x: number; y: number; color: string; label: string }[];
    showZeroLine?: boolean;
    highlightZeros?: boolean;
    asymptoteX?: number;
    infinityLabel?: string; // e.g. "→ +∞"
}

function FunctionGraph({
                           segments, a, b, aClosed, bClosed, width, height,
                           yClip = 12,
                           specialPoints = [],
                           hLines = [],
                           projections = [],
                           showZeroLine = false,
                           highlightZeros = false,
                           asymptoteX,
                           infinityLabel,
                       }: GraphProps) {
    const ml = 42, mr = 20, mt = 24, mb = 32;
    const pw = width - ml - mr;
    const ph = height - mt - mb;

    // Sample all segments to find y range
    const allSamples: { x: number; y: number }[] = [];
    for (const seg of segments) {
        for (const pt of sampleSeg(seg, 200, yClip)) {
            if (pt.y !== null) allSamples.push({ x: pt.x, y: pt.y });
        }
    }
    for (const sp of specialPoints) allSamples.push({ x: sp.x, y: sp.y });
    for (const hl of hLines) allSamples.push({ x: a, y: hl.y });

    let yMin = Math.min(...allSamples.map(p => p.y), 0);
    let yMax = Math.max(...allSamples.map(p => p.y), 0);
    const yPad = Math.max((yMax - yMin) * 0.15, 0.5);
    yMin -= yPad;
    yMax += yPad;

    const sx = (x: number) => ml + ((x - a) / (b - a)) * pw;
    const sy = (y: number) => mt + ((yMax - y) / (yMax - yMin)) * ph;

    // Build paths for segments
    const pathEls: React.ReactNode[] = [];
    const endpointEls: React.ReactNode[] = [];

    segments.forEach((seg, si) => {
        const pts = sampleSeg(seg, 300, yClip);
        let d = "";
        let inPath = false;
        for (const pt of pts) {
            if (pt.y === null) { inPath = false; continue; }
            const px = sx(pt.x), py = sy(pt.y);
            if (!inPath) { d += `M ${px} ${py} `; inPath = true; }
            else d += `L ${px} ${py} `;
        }
        pathEls.push(
            <path key={`seg-${si}`} d={d} fill="none" stroke="#3b82f6" strokeWidth={2.5} />
        );

        // Endpoint markers
        const leftY = seg.fn(seg.from);
        const rightY = seg.fn(seg.to);
        if (isFinite(leftY) && Math.abs(leftY) <= yClip) {
            const filled = seg.leftClosed;
            endpointEls.push(
                <circle key={`ep-l-${si}`} cx={sx(seg.from)} cy={sy(leftY)} r={4.5}
                        fill={filled ? "#3b82f6" : "#fff"} stroke="#3b82f6" strokeWidth={2} />
            );
        }
        if (isFinite(rightY) && Math.abs(rightY) <= yClip) {
            const filled = seg.rightClosed;
            endpointEls.push(
                <circle key={`ep-r-${si}`} cx={sx(seg.to)} cy={sy(rightY)} r={4.5}
                        fill={filled ? "#3b82f6" : "#fff"} stroke="#3b82f6" strokeWidth={2} />
            );
        }
    });

    // Zeros
    const zeroEls: React.ReactNode[] = [];
    if (highlightZeros) {
        for (const seg of segments) {
            const zeros = findZeros(seg.fn, seg.from, seg.to);
            zeros.forEach((z, i) => {
                zeroEls.push(
                    <g key={`z-${i}`}>
                        <line x1={sx(z)} y1={sy(0) - 8} x2={sx(z)} y2={sy(0) + 8}
                              stroke="#dc2626" strokeWidth={1.5} strokeDasharray="3,2" />
                        <circle cx={sx(z)} cy={sy(0)} r={5} fill="#dc2626" stroke="#fff" strokeWidth={1.5} />
                        <text x={sx(z)} y={sy(0) + 20} textAnchor="middle" fontSize={10}
                              fill="#dc2626" fontWeight={700}>
                            x₀{zeros.length > 1 ? `₊${i}` : ""}
                        </text>
                    </g>
                );
            });
        }
    }

    // y=0 axis origin marker
    const xAxisY = sy(0);
    const yAxisX = sx(0);

    // Tick labels
    const xTicks: number[] = [a, b];
    if (a < 0 && b > 0 && Math.abs(a) > 0.01 && Math.abs(b) > 0.01) xTicks.push(0);
    const yTicks: number[] = [];
    const yRange = yMax - yMin;
    const yStep = Math.pow(10, Math.floor(Math.log10(yRange))) / 2;
    for (let v = Math.ceil(yMin / yStep) * yStep; v <= yMax; v += yStep) {
        if (Math.abs(v) > 0.01) yTicks.push(Math.round(v * 100) / 100);
    }

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}
             style={{ display: "block", margin: "0 auto", maxWidth: width }}>
            <rect width={width} height={height} fill="#fafbfc" rx={8} />

            {/* Grid */}
            {yTicks.map((v, i) => (
                <line key={`gy-${i}`} x1={ml} y1={sy(v)} x2={width - mr} y2={sy(v)}
                      stroke="#f1f5f9" strokeWidth={1} />
            ))}

            {/* Axes */}
            <line x1={ml} y1={xAxisY} x2={width - mr} y2={xAxisY} stroke="#94a3b8" strokeWidth={1} />
            {a <= 0 && b >= 0 && (
                <line x1={yAxisX} y1={mt} x2={yAxisX} y2={height - mb} stroke="#94a3b8" strokeWidth={1} />
            )}

            {/* Axis labels */}
            <text x={width - mr + 4} y={xAxisY + 4} fontSize={11} fill="#64748b" fontStyle="italic">x</text>
            {a <= 0 && b >= 0 && (
                <text x={yAxisX + 6} y={mt - 4} fontSize={11} fill="#64748b" fontStyle="italic">y</text>
            )}

            {/* x tick labels */}
            {xTicks.map((v, i) => (
                <g key={`xt-${i}`}>
                    <line x1={sx(v)} y1={xAxisY - 3} x2={sx(v)} y2={xAxisY + 3} stroke="#94a3b8" strokeWidth={1} />
                    <text x={sx(v)} y={xAxisY + 16} textAnchor="middle" fontSize={10} fill="#64748b">
                        {Math.abs(v) < 0.01 ? "O" : v % 1 === 0 ? v : v.toFixed(1)}
                    </text>
                </g>
            ))}

            {/* y tick labels */}
            {yTicks.slice(0, 6).map((v, i) => (
                <text key={`yt-${i}`} x={ml - 6} y={sy(v) + 4} textAnchor="end" fontSize={9} fill="#94a3b8">
                    {v % 1 === 0 ? v : v.toFixed(1)}
                </text>
            ))}

            {/* Interval boundary markers */}
            <line x1={sx(a)} y1={mt} x2={sx(a)} y2={height - mb}
                  stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4,3" />
            <line x1={sx(b)} y1={mt} x2={sx(b)} y2={height - mb}
                  stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4,3" />
            <text x={sx(a)} y={height - mb + 26} textAnchor="middle" fontSize={11} fill="#475569" fontWeight={700}
                  fontStyle="italic">a</text>
            <text x={sx(b)} y={height - mb + 26} textAnchor="middle" fontSize={11} fill="#475569" fontWeight={700}
                  fontStyle="italic">b</text>

            {/* Horizontal lines */}
            {hLines.map((hl, i) => (
                <g key={`hl-${i}`}>
                    <line x1={ml} y1={sy(hl.y)} x2={width - mr} y2={sy(hl.y)}
                          stroke={hl.color} strokeWidth={1.5}
                          strokeDasharray={hl.dashed !== false ? "6,4" : "none"} />
                    <text x={width - mr - 4} y={sy(hl.y) - 6}
                          textAnchor="end" fontSize={10} fill={hl.color} fontWeight={600}>
                        {hl.label}
                    </text>
                </g>
            ))}

            {/* y=0 highlight */}
            {showZeroLine && (
                <line x1={ml} y1={xAxisY} x2={width - mr} y2={xAxisY}
                      stroke="#94a3b8" strokeWidth={1.5} />
            )}

            {/* Function paths */}
            {pathEls}
            {endpointEls}
            {zeroEls}

            {/* Special points */}
            {specialPoints.map((sp, i) => {
                const px = sx(sp.x), py = sy(sp.y);
                const lpos = sp.labelPos || "above";
                const tx = lpos === "left" ? px - 10 : lpos === "right" ? px + 10 : px;
                const ty = lpos === "below" ? py + 18 : py - 10;
                const anchor = lpos === "left" ? "end" : lpos === "right" ? "start" : "middle";
                return (
                    <g key={`sp-${i}`}>
                        <circle cx={px} cy={py} r={5} fill={sp.color} stroke="#fff" strokeWidth={1.5} />
                        <text x={tx} y={ty} textAnchor={anchor} fontSize={11}
                              fill={sp.color} fontWeight={700}>
                            {sp.label}
                        </text>
                    </g>
                );
            })}

            {/* Projections: vertical dashed line from x-axis to curve point, label on x-axis */}
            {projections.map((proj, i) => {
                const px = sx(proj.x);
                const pyAxis = sy(0);
                const pyCurve = sy(proj.y);
                return (
                    <g key={`proj-${i}`}>
                        {/* Vertical dashed line from x-axis to curve */}
                        <line x1={px} y1={pyAxis} x2={px} y2={pyCurve}
                              stroke={proj.color} strokeWidth={1.5} strokeDasharray="5,4" />
                        {/* Dot on the curve at (x₀, k) */}
                        <circle cx={px} cy={pyCurve} r={5}
                                fill={proj.color} stroke="#fff" strokeWidth={1.5} />
                        {/* Label on x-axis */}
                        <text x={px} y={pyAxis + 16} textAnchor="middle" fontSize={11}
                              fill={proj.color} fontWeight={700}>
                            {proj.label}
                        </text>
                    </g>
                );
            })}

            {/* Vertical asymptote */}
            {asymptoteX !== undefined && (() => {
                const ax = sx(asymptoteX);
                return (
                    <g>
                        <line x1={ax} y1={mt} x2={ax} y2={height - mb}
                              stroke="#dc2626" strokeWidth={1.5} strokeDasharray="6,4" />
                        {/* Upward arrow on curve near asymptote */}
                        <polygon
                            points={`${ax + 12},${mt + 2} ${ax + 6},${mt + 16} ${ax + 18},${mt + 16}`}
                            fill="#dc2626" />
                        {infinityLabel && (
                            <text x={ax + 22} y={mt + 18} fontSize={12}
                                  fill="#dc2626" fontWeight={700} fontStyle="italic">
                                {infinityLabel}
                            </text>
                        )}
                    </g>
                );
            })()}
        </svg>
    );
}

// ============ SCENARI ============

// ── TEOREMA DEGLI ZERI ──

const zeriScenarios: Scenario[] = [
    {
        id: "z1", label: "x² − 2 su [0, 2]",
        latexFn: "f(x) = x^2 - 2",
        type: "conferma",
        segments: [{ fn: x => x * x - 2, from: 0, to: 2, leftClosed: true, rightClosed: true }],
        a: 0, b: 2, aClosed: true, bClosed: true,
        description: "La funzione è continua in [0, 2]. Si ha f(0) = −2 < 0 e f(2) = 2 > 0, quindi f(a)·f(b) < 0. Per il teorema esiste almeno uno zero: x₀ = √2 ≈ 1.41.",
        ipotesi: ["f continua in [a, b] ✓", "f(a) · f(b) < 0 ✓"],
    },
    {
        id: "z2", label: "cos x su [0, π]",
        latexFn: "f(x) = \\cos x",
        type: "conferma",
        segments: [{ fn: x => Math.cos(x), from: 0, to: Math.PI, leftClosed: true, rightClosed: true }],
        a: 0, b: Math.PI, aClosed: true, bClosed: true,
        description: "La funzione è continua in [0, π]. Si ha f(0) = 1 > 0 e f(π) = −1 < 0, quindi f(a)·f(b) < 0. Lo zero è x₀ = π/2 ≈ 1.57.",
        ipotesi: ["f continua in [a, b] ✓", "f(a) · f(b) < 0 ✓"],
    },
    {
        id: "z3", label: "(x − 1)² su [0, 2]",
        latexFn: "f(x) = (x-1)^2",
        type: "nota",
        segments: [{ fn: x => (x - 1) * (x - 1), from: 0, to: 2, leftClosed: true, rightClosed: true }],
        a: 0, b: 2, aClosed: true, bClosed: true,
        description: "La funzione è continua ma f(0) = 1 > 0 e f(2) = 1 > 0, quindi f(a)·f(b) > 0: l'ipotesi NON è soddisfatta. Eppure lo zero x₀ = 1 esiste! La condizione del teorema è sufficiente ma non necessaria.",
        ipotesi: ["f continua in [a, b] ✓", "f(a) · f(b) < 0 ✗ (entrambi positivi)"],
    },
    {
        id: "z4", label: "Gradino su [−1, 1]",
        latexFn: "f(x) = \\begin{cases} -1 & x < 0 \\\\ 1 & x \\geq 0 \\end{cases}",
        type: "controesempio",
        segments: [
            { fn: () => -1, from: -1, to: 0, leftClosed: true, rightClosed: false },
            { fn: () => 1, from: 0, to: 1, leftClosed: true, rightClosed: true },
        ],
        a: -1, b: 1, aClosed: true, bClosed: true,
        description: "Si ha f(−1) = −1 e f(1) = 1, dunque f(a)·f(b) < 0. Ma la funzione è discontinua in x = 0 e NON esiste alcun punto in cui f(x₀) = 0. L'ipotesi di continuità è essenziale.",
        ipotesi: ["f continua in [a, b] ✗ (salto in x = 0)", "f(a) · f(b) < 0 ✓"],
    },
    {
        id: "z5", label: "x² + 1 su [−2, 2]",
        latexFn: "f(x) = x^2 + 1",
        type: "controesempio",
        segments: [{ fn: x => x * x + 1, from: -2, to: 2, leftClosed: true, rightClosed: true }],
        a: -2, b: 2, aClosed: true, bClosed: true,
        description: "La funzione è continua ma f(−2) = 5 > 0 e f(2) = 5 > 0, quindi f(a)·f(b) > 0. L'ipotesi non è soddisfatta e, in effetti, la funzione non ha zeri (sempre ≥ 1).",
        ipotesi: ["f continua in [a, b] ✓", "f(a) · f(b) < 0 ✗ (entrambi > 0)"],
    },
];

// ── TEOREMA DI WEIERSTRASS ──

const weierstrassScenarios: Scenario[] = [
    {
        id: "w1", label: "−x² + 4x su [0, 5]",
        latexFn: "f(x) = -x^2 + 4x",
        type: "conferma",
        segments: [{ fn: x => -x * x + 4 * x, from: 0, to: 5, leftClosed: true, rightClosed: true }],
        a: 0, b: 5, aClosed: true, bClosed: true,
        description: "Funzione continua su intervallo chiuso e limitato. Il massimo M = 4 si raggiunge in x = 2 (punto interno), il minimo m = −5 si raggiunge in x = 5 (estremo destro).",
        ipotesi: ["f continua in [a, b] ✓", "Intervallo chiuso e limitato ✓"],
    },
    {
        id: "w2", label: "sin x su [0, 2π]",
        latexFn: "f(x) = \\sin x",
        type: "conferma",
        segments: [{ fn: x => Math.sin(x), from: 0, to: 2 * Math.PI, leftClosed: true, rightClosed: true }],
        a: 0, b: 2 * Math.PI, aClosed: true, bClosed: true,
        description: "Funzione continua su intervallo chiuso e limitato. Il massimo M = 1 si raggiunge in x = π/2, il minimo m = −1 in x = 3π/2.",
        ipotesi: ["f continua in [a, b] ✓", "Intervallo chiuso e limitato ✓"],
    },
    {
        id: "w3", label: "x³ − 3x su [−2, 2]",
        latexFn: "f(x) = x^3 - 3x",
        type: "conferma",
        segments: [{ fn: x => x * x * x - 3 * x, from: -2, to: 2, leftClosed: true, rightClosed: true }],
        a: -2, b: 2, aClosed: true, bClosed: true,
        description: "Funzione continua su intervallo chiuso e limitato. Il massimo e il minimo sono attinti, come garantisce il teorema (M = 2, m = −2).",
        ipotesi: ["f continua in [a, b] ✓", "Intervallo chiuso e limitato ✓"],
    },
    {
        id: "w4", label: "1/x su (0, 2]",
        latexFn: "f(x) = \\frac{1}{x} \\text{ su } (0, 2]",
        type: "controesempio",
        segments: [{ fn: x => 1 / x, from: 0.005, to: 2, leftClosed: false, rightClosed: true }],
        a: 0, b: 2, aClosed: false, bClosed: true,
        description: "La funzione è continua in (0, 2], ma l'intervallo NON è chiuso a sinistra. Per x → 0⁺, f(x) → +∞: il massimo non viene raggiunto. Manca l'ipotesi di intervallo chiuso.",
        ipotesi: ["f continua ✓", "Intervallo chiuso e limitato ✗ (aperto a sinistra)"],
        maxExists: false,
        asymptoteX: 0,
    },
    {
        id: "w5", label: "x su [0, 1) — aperto a destra",
        latexFn: "f(x) = x \\text{ su } [0, 1)",
        type: "controesempio",
        segments: [{ fn: x => x, from: 0, to: 1, leftClosed: true, rightClosed: false }],
        a: 0, b: 1, aClosed: true, bClosed: false,
        description: "La funzione è continua ma l'intervallo NON è chiuso a destra. Il sup f = 1, ma questo valore non è mai raggiunto (x = 1 non appartiene al dominio). Il massimo non esiste.",
        ipotesi: ["f continua ✓", "Intervallo chiuso e limitato ✗ (aperto a destra)"],
        maxExists: false,
    },
    {
        id: "w6", label: "Discontinua su [0, 1]",
        latexFn: "f(x) = \\begin{cases} x & 0 \\leq x < 1 \\\\ 0 & x = 1 \\end{cases}",
        type: "controesempio",
        segments: [
            { fn: x => x, from: 0, to: 1, leftClosed: true, rightClosed: false },
            { fn: () => 0, from: 1, to: 1, leftClosed: true, rightClosed: true },
        ],
        a: 0, b: 1, aClosed: true, bClosed: true,
        description: "L'intervallo è chiuso ma la funzione è DISCONTINUA in x = 1 (salto da 1 a 0). Il sup f = 1, ma questo valore non è mai raggiunto. Manca l'ipotesi di continuità.",
        ipotesi: ["f continua ✗ (salto in x = 1)", "Intervallo chiuso e limitato ✓"],
        maxExists: false,
    },
];

// ── TEOREMA DEI VALORI INTERMEDI (DARBOUX) ──

const darbouxScenarios: Scenario[] = [
    {
        id: "d1", label: "x² su [0, 2]",
        latexFn: "f(x) = x^2",
        type: "conferma",
        segments: [{ fn: x => x * x, from: 0, to: 2, leftClosed: true, rightClosed: true }],
        a: 0, b: 2, aClosed: true, bClosed: true,
        description: "Funzione continua su [0, 2]. Il minimo è m = 0, il massimo è M = 4. Per ogni k ∈ (0, 4) la retta y = k interseca il grafico: tutti i valori intermedi sono assunti.",
        ipotesi: ["f continua in [a, b] ✓", "Intervallo chiuso e limitato ✓"],
    },
    {
        id: "d2", label: "sin x su [0, π]",
        latexFn: "f(x) = \\sin x",
        type: "conferma",
        segments: [{ fn: x => Math.sin(x), from: 0, to: Math.PI, leftClosed: true, rightClosed: true }],
        a: 0, b: Math.PI, aClosed: true, bClosed: true,
        description: "Funzione continua su [0, π]. Minimo m = 0 (agli estremi), massimo M = 1 (in x = π/2). Ogni valore k ∈ (0, 1) viene assunto almeno in due punti.",
        ipotesi: ["f continua in [a, b] ✓", "Intervallo chiuso e limitato ✓"],
    },
    {
        id: "d3", label: "Gradino su [0, 2]",
        latexFn: "f(x) = \\begin{cases} 0 & 0 \\leq x < 1 \\\\ 2 & 1 \\leq x \\leq 2 \\end{cases}",
        type: "controesempio",
        segments: [
            { fn: () => 0, from: 0, to: 1, leftClosed: true, rightClosed: false },
            { fn: () => 2, from: 1, to: 2, leftClosed: true, rightClosed: true },
        ],
        a: 0, b: 2, aClosed: true, bClosed: true,
        description: "La funzione è discontinua in x = 1. Il minimo è m = 0, il massimo è M = 2, ma il valore k = 1 (ad esempio) non viene mai assunto. La funzione «salta» i valori intermedi.",
        ipotesi: ["f continua in [a, b] ✗ (salto in x = 1)", "Intervallo chiuso e limitato ✓"],
    },
    {
        id: "d4", label: "⌊x⌋ su [0, 3]",
        latexFn: "f(x) = \\lfloor x \\rfloor \\text{ (parte intera)}",
        type: "controesempio",
        segments: [
            { fn: () => 0, from: 0, to: 1, leftClosed: true, rightClosed: false },
            { fn: () => 1, from: 1, to: 2, leftClosed: true, rightClosed: false },
            { fn: () => 2, from: 2, to: 3, leftClosed: true, rightClosed: false },
            { fn: () => 3, from: 3, to: 3, leftClosed: true, rightClosed: true },
        ],
        a: 0, b: 3, aClosed: true, bClosed: true,
        description: "La funzione parte intera è discontinua in ogni intero. I valori assunti sono solo {0, 1, 2, 3}: i valori intermedi come k = 0.5, k = 1.5 non sono mai raggiunti.",
        ipotesi: ["f continua in [a, b] ✗ (salti in 1, 2, 3)", "Intervallo chiuso e limitato ✓"],
    },
];

// ============ THEOREM STATEMENT BOX ============

function TheoremBox({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{
            borderRadius: 8, overflow: "hidden",
            border: "2px solid #0e7490", marginBottom: 14,
        }}>
            <div style={{
                display: "flex", alignItems: "center", gap: 0,
            }}>
                <div style={{
                    padding: "10px 14px", background: "#0e7490", color: "#fff",
                    fontWeight: 700, fontSize: 12, letterSpacing: "0.05em",
                    whiteSpace: "nowrap",
                }}>
                    TEOREMA
                </div>
                <div style={{
                    flex: 1, padding: "10px 14px", background: "#e0f2fe",
                    fontWeight: 700, fontSize: 14, color: "#0e7490",
                }}>
                    {title}
                </div>
            </div>
            <div style={{
                padding: "12px 16px", background: "#f0fdfa",
                fontSize: 14, lineHeight: 1.7,
            }}>
                {children}
            </div>
        </div>
    );
}

// ============ SCENARIO SELECTOR ============

function ScenarioSelector({ scenarios, selectedId, onSelect, isMobile }: {
    scenarios: Scenario[];
    selectedId: string;
    onSelect: (id: string) => void;
    isMobile: boolean;
}) {
    const conferma = scenarios.filter(s => s.type === "conferma");
    const nota = scenarios.filter(s => s.type === "nota");
    const contro = scenarios.filter(s => s.type === "controesempio");

    const renderGroup = (label: string, items: Scenario[], badgeColor: string, badgeBg: string) => {
        if (items.length === 0) return null;
        return (
            <div style={{ marginBottom: 10 }}>
                <div style={{
                    fontSize: 11, fontWeight: 700, color: badgeColor,
                    marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5,
                }}>
                    {label}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {items.map(s => {
                        const active = s.id === selectedId;
                        return (
                            <button key={s.id} onClick={() => onSelect(s.id)} style={{
                                padding: isMobile ? "6px 10px" : "7px 12px",
                                fontSize: isMobile ? 12 : 13,
                                fontWeight: active ? 700 : 500,
                                borderRadius: 6,
                                border: `2px solid ${active ? badgeColor : "#e2e8f0"}`,
                                background: active ? badgeBg : "#fff",
                                color: active ? badgeColor : "#475569",
                                cursor: "pointer",
                                transition: "all 0.2s",
                            }}>
                                {s.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div>
            {renderGroup("✓ Conferma", conferma, "#16a34a", "#f0fdf4")}
            {renderGroup("⚠ Nota bene", nota, "#d97706", "#fffbeb")}
            {renderGroup("✗ Controesempio", contro, "#dc2626", "#fef2f2")}
        </div>
    );
}

// ============ HYPOTHESIS BADGES ============

function IpotesiBadges({ ipotesi }: { ipotesi: string[] }) {
    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
            {ipotesi.map((ip, i) => {
                const ok = ip.includes("✓");
                const fail = ip.includes("✗");
                return (
                    <span key={i} style={{
                        padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                        background: ok ? "#dcfce7" : fail ? "#fef2f2" : "#f1f5f9",
                        color: ok ? "#166534" : fail ? "#991b1b" : "#475569",
                        border: `1px solid ${ok ? "#86efac" : fail ? "#fecaca" : "#e2e8f0"}`,
                    }}>
                        {ip}
                    </span>
                );
            })}
        </div>
    );
}

// ============ TAB: TEOREMA DEGLI ZERI ============

function TabZeri({ isMobile }: { isMobile: boolean }) {
    const [selId, setSelId] = useState("z1");
    const sc = zeriScenarios.find(s => s.id === selId)!;
    const gw = isMobile ? 300 : 480;
    const gh = isMobile ? 220 : 300;

    // Compute f(a), f(b)
    const fA = sc.segments[0].fn(sc.a);
    const fB = sc.segments[sc.segments.length - 1].fn(sc.b);
    const fAfinite = isFinite(fA);
    const fBfinite = isFinite(fB);

    const specialPts: GraphProps["specialPoints"] = [];
    if (fAfinite) specialPts.push({ x: sc.a, y: fA, color: fA < 0 ? "#dc2626" : "#16a34a", label: `f(a)=${Math.round(fA * 100) / 100}`, labelPos: fA < 0 ? "below" : "above" });
    if (fBfinite) specialPts.push({ x: sc.b, y: fB, color: fB < 0 ? "#dc2626" : "#16a34a", label: `f(b)=${Math.round(fB * 100) / 100}`, labelPos: fB < 0 ? "below" : "above" });

    return (
        <div style={{ display: "grid", gap: 14 }}>
            <TheoremBox title="di esistenza degli zeri">
                Sia <Latex>{"f"}</Latex> una funzione definita e <strong>continua</strong> in un intervallo chiuso e limitato <Latex>{"[a, b]"}</Latex>.
                {" "}Se <Latex>{"f(a) \\cdot f(b) < 0"}</Latex>, allora la funzione ammette <strong>almeno uno zero</strong> in <Latex>{"(a, b)"}</Latex>,
                {" "}ossia esiste <Latex>{"x_0 \\in (a, b)"}</Latex> tale che <Latex>{"f(x_0) = 0"}</Latex>.
            </TheoremBox>

            <ScenarioSelector scenarios={zeriScenarios} selectedId={selId} onSelect={setSelId} isMobile={isMobile} />

            {/* Equazione */}
            <div style={{ textAlign: "center", padding: "8px 0" }}>
                <Latex display>{sc.latexFn}</Latex>
            </div>

            {/* Grafico */}
            <FunctionGraph
                segments={sc.segments} a={sc.a} b={sc.b} aClosed={sc.aClosed} bClosed={sc.bClosed}
                width={gw} height={gh}
                showZeroLine
                highlightZeros
                specialPoints={specialPts}
            />

            {/* Analisi */}
            <IpotesiBadges ipotesi={sc.ipotesi} />
            <div style={{
                padding: "12px 16px", borderRadius: 8, fontSize: 14, lineHeight: 1.7,
                background: sc.type === "conferma" ? "#f0fdf4" : sc.type === "nota" ? "#fffbeb" : "#fef2f2",
                border: `2px solid ${sc.type === "conferma" ? "#86efac" : sc.type === "nota" ? "#fde68a" : "#fecaca"}`,
            }}>
                {sc.description}
            </div>
        </div>
    );
}

// ============ TAB: TEOREMA DI WEIERSTRASS ============

function TabWeierstrass({ isMobile }: { isMobile: boolean }) {
    const [selId, setSelId] = useState("w1");
    const sc = weierstrassScenarios.find(s => s.id === selId)!;
    const gw = isMobile ? 300 : 480;
    const gh = isMobile ? 220 : 300;

    const ext = useMemo(() => findExtrema(sc.segments, 12), [sc]);

    const specialPts: GraphProps["specialPoints"] = [];
    const hLines: GraphProps["hLines"] = [];

    if (sc.maxExists !== false && isFinite(ext.maxVal) && ext.maxVal < 12) {
        specialPts.push({ x: ext.maxX, y: ext.maxVal, color: "#dc2626", label: `M = ${Math.round(ext.maxVal * 100) / 100}`, labelPos: "above" });
        hLines.push({ y: ext.maxVal, color: "#dc2626", label: "M", dashed: true });
    }
    if (sc.minExists !== false && isFinite(ext.minVal) && ext.minVal > -12) {
        specialPts.push({ x: ext.minX, y: ext.minVal, color: "#2563eb", label: `m = ${Math.round(ext.minVal * 100) / 100}`, labelPos: "below" });
        hLines.push({ y: ext.minVal, color: "#2563eb", label: "m", dashed: true });
    }

    return (
        <div style={{ display: "grid", gap: 14 }}>
            <TheoremBox title="di Weierstrass">
                Sia <Latex>{"f"}</Latex> una funzione <strong>continua</strong> in un <strong>intervallo chiuso e limitato</strong> <Latex>{"[a, b]"}</Latex>;
                {" "}allora <Latex>{"f"}</Latex> ammette <strong>massimo</strong> <Latex>{"M"}</Latex> e <strong>minimo</strong> <Latex>{"m"}</Latex> in <Latex>{"[a, b]"}</Latex>,
                {" "}ossia esistono <Latex>{"x_1, x_2 \\in [a, b]"}</Latex> tali che:
                <div style={{ textAlign: "center", margin: "6px 0" }}>
                    <Latex display>{"f(x_1) \\leq f(x) \\leq f(x_2) \\quad \\forall x \\in [a, b]"}</Latex>
                </div>
            </TheoremBox>

            <ScenarioSelector scenarios={weierstrassScenarios} selectedId={selId} onSelect={setSelId} isMobile={isMobile} />

            <div style={{ textAlign: "center", padding: "8px 0" }}>
                <Latex display>{sc.latexFn}</Latex>
            </div>

            <FunctionGraph
                segments={sc.segments} a={sc.a} b={sc.b} aClosed={sc.aClosed} bClosed={sc.bClosed}
                width={gw} height={gh}
                specialPoints={specialPts}
                hLines={hLines}
                asymptoteX={sc.asymptoteX}
                infinityLabel={sc.asymptoteX !== undefined ? "→ +∞" : undefined}
            />

            <IpotesiBadges ipotesi={sc.ipotesi} />
            <div style={{
                padding: "12px 16px", borderRadius: 8, fontSize: 14, lineHeight: 1.7,
                background: sc.type === "conferma" ? "#f0fdf4" : "#fef2f2",
                border: `2px solid ${sc.type === "conferma" ? "#86efac" : "#fecaca"}`,
            }}>
                {sc.description}
            </div>
        </div>
    );
}

// ============ TAB: TEOREMA DI DARBOUX ============

function TabDarboux({ isMobile }: { isMobile: boolean }) {
    const [selId, setSelId] = useState("d1");
    const sc = darbouxScenarios.find(s => s.id === selId)!;
    const gw = isMobile ? 300 : 480;
    const gh = isMobile ? 240 : 300;

    const ext = useMemo(() => findExtrema(sc.segments, 12), [sc]);
    const m = ext.minVal;
    const M = ext.maxVal;
    const kRange = M - m;
    const [kPct, setKPct] = useState(50);
    const k = m + (kPct / 100) * kRange;

    // Reset slider when scenario changes
    const [prevId, setPrevId] = useState(selId);
    if (selId !== prevId) {
        setPrevId(selId);
        // Can't call setKPct here directly in render — use effect or just let it be
    }

    const intersections = useMemo(() => findIntersections(sc.segments, k), [sc, k]);

    const specialPts: GraphProps["specialPoints"] = [];
    specialPts.push({ x: ext.maxX, y: M, color: "#dc2626", label: `M`, labelPos: "above" });
    specialPts.push({ x: ext.minX, y: m, color: "#2563eb", label: `m`, labelPos: "below" });

    const projections: GraphProps["projections"] = [];
    for (let i = 0; i < intersections.length; i++) {
        projections.push({
            x: intersections[i], y: k,
            color: "#9333ea",
            label: intersections.length === 1 ? "x₀" : `x${i + 1}`,
        });
    }

    const hLines: GraphProps["hLines"] = [
        { y: M, color: "#dc2626", label: `M = ${Math.round(M * 100) / 100}`, dashed: true },
        { y: m, color: "#2563eb", label: `m = ${Math.round(m * 100) / 100}`, dashed: true },
        { y: k, color: "#9333ea", label: `k = ${Math.round(k * 100) / 100}`, dashed: false },
    ];

    const hasIntersection = intersections.length > 0;
    const kSliderColor = hasIntersection ? "#9333ea" : "#dc2626";

    return (
        <div style={{ display: "grid", gap: 14 }}>
            <TheoremBox title="dei valori intermedi (Darboux)">
                Una funzione <Latex>{"f"}</Latex> <strong>continua</strong> in un intervallo <strong>chiuso e limitato</strong> <Latex>{"[a, b]"}</Latex> assume
                {" "}tutti i valori compresi fra il suo minimo <Latex>{"m"}</Latex> e il suo massimo <Latex>{"M"}</Latex> in <Latex>{"[a, b]"}</Latex>.
                <br />
                In altre parole, per ogni <Latex>{"k \\in (m, M)"}</Latex> esiste <Latex>{"x_0 \\in [a, b]"}</Latex> tale che <Latex>{"f(x_0) = k"}</Latex>.
            </TheoremBox>

            <ScenarioSelector scenarios={darbouxScenarios} selectedId={selId} onSelect={setSelId} isMobile={isMobile} />

            <div style={{ textAlign: "center", padding: "8px 0" }}>
                <Latex display>{sc.latexFn}</Latex>
            </div>

            {/* Slider k */}
            <div style={{
                padding: "12px 16px", background: "#fff", borderRadius: 10,
                border: `2px solid ${hasIntersection ? "#c084fc" : "#fecaca"}`,
                transition: "border-color 0.3s ease",
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#334155" }}>
                        Valore di <Latex>{"k"}</Latex>
                    </span>
                    <span style={{
                        fontSize: 20, fontWeight: 800,
                        color: kSliderColor,
                        fontVariantNumeric: "tabular-nums",
                        transition: "color 0.3s ease",
                    }}>
                        {k >= 0 ? "" : "−"}{Math.abs(k).toFixed(2)}
                    </span>
                </div>
                <input
                    type="range" min={2} max={98} step={1}
                    value={kPct}
                    onChange={e => setKPct(parseInt(e.target.value))}
                    style={{
                        width: "100%", height: 8, borderRadius: 4,
                        appearance: "none",
                        background: `linear-gradient(to right, ${kSliderColor} 0%, ${kSliderColor} ${kPct}%, #e2e8f0 ${kPct}%, #e2e8f0 100%)`,
                        outline: "none", cursor: "pointer",
                    }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                    <span>m = {m.toFixed(2)}</span>
                    <span>M = {M.toFixed(2)}</span>
                </div>
                {hasIntersection ? (
                    <div style={{ marginTop: 8, fontSize: 13, color: "#7c3aed", fontWeight: 600 }}>
                        ✓ La retta y = {k.toFixed(2)} interseca il grafico in {intersections.length} punt{intersections.length === 1 ? "o" : "i"}
                    </div>
                ) : (
                    <div style={{ marginTop: 8, fontSize: 13, color: "#dc2626", fontWeight: 600 }}>
                        ✗ La retta y = {k.toFixed(2)} NON interseca il grafico — il valore non è assunto
                    </div>
                )}
            </div>

            <FunctionGraph
                segments={sc.segments} a={sc.a} b={sc.b} aClosed={sc.aClosed} bClosed={sc.bClosed}
                width={gw} height={gh}
                specialPoints={specialPts}
                hLines={hLines}
                projections={projections}
            />

            <IpotesiBadges ipotesi={sc.ipotesi} />
            <div style={{
                padding: "12px 16px", borderRadius: 8, fontSize: 14, lineHeight: 1.7,
                background: sc.type === "conferma" ? "#f0fdf4" : "#fef2f2",
                border: `2px solid ${sc.type === "conferma" ? "#86efac" : "#fecaca"}`,
            }}>
                {sc.description}
            </div>
        </div>
    );
}

// ============ COMPONENTE PRINCIPALE ============

type ThTab = "zeri" | "weierstrass" | "darboux";

export default function ProprietaFunzioniContinueDemo() {
    const { isMobile } = useBreakpoint();
    const [activeTab, setActiveTab] = useState<ThTab>("zeri");

    const tabs: { id: ThTab; label: string; shortLabel: string }[] = [
        { id: "zeri", label: "Esistenza degli zeri", shortLabel: "Zeri" },
        { id: "weierstrass", label: "Weierstrass", shortLabel: "Weierstrass" },
        { id: "darboux", label: "Valori intermedi", shortLabel: "Darboux" },
    ];

    const tabStyle = (id: ThTab) => ({
        flex: 1,
        padding: isMobile ? "10px 4px" : "12px 8px",
        fontSize: isMobile ? 13 : 14,
        fontWeight: 700 as const,
        border: "none",
        borderBottom: `3px solid ${activeTab === id ? "#0e7490" : "transparent"}`,
        background: activeTab === id ? "#ecfeff" : "transparent",
        color: activeTab === id ? "#0e7490" : "#64748b",
        cursor: "pointer" as const,
        transition: "all 0.2s ease",
        borderRadius: "8px 8px 0 0",
        whiteSpace: "nowrap" as const,
    });

    return (
        <DemoContainer
            title="Proprietà delle funzioni continue"
            description="Teoremi sulle funzioni continue in un intervallo chiuso e limitato [a, b]"
        >
            {/* Tab selector */}
            <div style={{
                display: "flex", gap: 0, marginBottom: 16,
                borderBottom: "2px solid #e2e8f0",
            }}>
                {tabs.map(t => (
                    <button key={t.id} style={tabStyle(t.id)} onClick={() => setActiveTab(t.id)}>
                        {isMobile ? t.shortLabel : t.label}
                    </button>
                ))}
            </div>

            {activeTab === "zeri" && <TabZeri isMobile={isMobile} />}
            {activeTab === "weierstrass" && <TabWeierstrass isMobile={isMobile} />}
            {activeTab === "darboux" && <TabDarboux isMobile={isMobile} />}
        </DemoContainer>
    );
}