/**
 * DerivataDemo – Definizione di derivata: limite del rapporto incrementale
 * Modalità: matematica f'(x) e fisica velocità istantanea v(t)
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DemoContainer, DisplayMath, Latex } from "../../components/ui";

// ─── Tipi e funzioni ─────────────────────────────────────────────────────────

type FuncDef = {
    id: string;
    label: string;
    latexExpr: string;
    f: (x: number) => number;
    df: (x: number) => number;
    domain: [number, number];
    x0Default: number;
    hDefault: number;
};

const MATH_FUNCS: FuncDef[] = [
    {
        id: "x2", label: "f(x) = x²", latexExpr: "x^2",
        f: x => x * x, df: x => 2 * x,
        domain: [-3, 3], x0Default: 1, hDefault: 1.5,
    },
    {
        id: "x3", label: "f(x) = x³", latexExpr: "x^3",
        f: x => x ** 3, df: x => 3 * x * x,
        domain: [-2.5, 2.5], x0Default: 1, hDefault: 1,
    },
    {
        id: "sinx", label: "f(x) = sin(x)", latexExpr: "\\sin(x)",
        f: x => Math.sin(x), df: x => Math.cos(x),
        domain: [0, 2 * Math.PI], x0Default: 1, hDefault: 1,
    },
    {
        id: "sqrtx", label: "f(x) = √x", latexExpr: "\\sqrt{x}",
        f: x => Math.sqrt(Math.max(0, x)),
        df: x => x > 0 ? 1 / (2 * Math.sqrt(x)) : Infinity,
        domain: [0, 4], x0Default: 1, hDefault: 1,
    },
];

const PHYS_FUNCS: FuncDef[] = [
    {
        id: "mua", label: "s(t) = 2t²  (MUA, a = 4 m/s²)",
        latexExpr: "\\tfrac{1}{2}\\cdot 4\\cdot t^2 = 2t^2",
        f: t => 2 * t * t, df: t => 4 * t,
        domain: [0, 4], x0Default: 1, hDefault: 1.5,
    },
    {
        id: "sinmoto", label: "s(t) = 5·sin(t)",
        latexExpr: "5\\sin(t)",
        f: t => 5 * Math.sin(t), df: t => 5 * Math.cos(t),
        domain: [0, 2 * Math.PI], x0Default: 1, hDefault: 1,
    },
];

// ─── SVG layout ──────────────────────────────────────────────────────────────

const W = 800, H = 420;
const PAD = { L: 62, R: 32, T: 28, B: 50 };
const N_CURVE = 400;

function linspace(a: number, b: number, n: number): number[] {
    return Array.from({ length: n }, (_, i) => a + (i * (b - a)) / (n - 1));
}

function clamp(x: number, a: number, b: number) {
    return Math.max(a, Math.min(b, x));
}

function useViewportWidth() {
    const [w, setW] = useState(() => (typeof window !== "undefined" ? window.innerWidth : 1200));
    useEffect(() => {
        const fn = () => setW(window.innerWidth);
        window.addEventListener("resize", fn);
        return () => window.removeEventListener("resize", fn);
    }, []);
    return w;
}

const TABLE_H_VALUES = [2, 1, 0.5, 0.1, 0.05, 0.01, 0.001];

// ─── Componente principale ────────────────────────────────────────────────────

export default function DerivataDemo() {
    const vw = useViewportWidth();
    const isMobile = vw < 640;

    const [mode, setMode] = useState<"math" | "physics">("math");
    const funcs = mode === "math" ? MATH_FUNCS : PHYS_FUNCS;
    const [funcId, setFuncId] = useState<string>(MATH_FUNCS[0].id);

    useEffect(() => {
        setFuncId(mode === "math" ? MATH_FUNCS[0].id : PHYS_FUNCS[0].id);
    }, [mode]);

    const func = useMemo(() => funcs.find(f => f.id === funcId) ?? funcs[0], [funcs, funcId]);

    const [x0, setX0] = useState(func.x0Default);
    const [h, setH] = useState(func.hDefault);
    const [animating, setAnimating] = useState(false);
    const [showTangent, setShowTangent] = useState(true);

    useEffect(() => {
        setX0(func.x0Default);
        setH(func.hDefault);
        setAnimating(false);
    }, [func]);

    // Animazione h → 0
    useEffect(() => {
        if (!animating) return;
        let raf: number;
        const step = () => {
            setH(prev => {
                if (prev <= 0.008) { setAnimating(false); return 0.005; }
                return prev * 0.92;
            });
            raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [animating]);

    // Dominio e campionamento
    const [xMin, xMax] = func.domain;
    const xs = useMemo(() => linspace(xMin, xMax, N_CURVE), [xMin, xMax]);
    const ys = useMemo(() => xs.map(func.f), [xs, func]);

    const { yMin, yMax } = useMemo(() => {
        const valid = ys.filter(isFinite);
        const rawMin = Math.min(...valid);
        const rawMax = Math.max(...valid);
        const margin = Math.max(1, (rawMax - rawMin) * 0.18);
        return { yMin: rawMin - margin, yMax: rawMax + margin };
    }, [ys]);

    // Coordinate transforms
    const toSvgX = useCallback(
        (x: number) => PAD.L + ((x - xMin) / (xMax - xMin)) * (W - PAD.L - PAD.R),
        [xMin, xMax]
    );
    const toSvgY = useCallback(
        (y: number) => H - PAD.B - ((y - yMin) / (yMax - yMin)) * (H - PAD.T - PAD.B),
        [yMin, yMax]
    );
    const fromSvgX = useCallback(
        (px: number) => xMin + ((px - PAD.L) / (W - PAD.L - PAD.R)) * (xMax - xMin),
        [xMin, xMax]
    );

    // Punti chiave
    const x1 = clamp(x0, xMin, xMax - 0.001);
    const maxH = Math.max(0.01, xMax - x1 - 0.001);
    const hEff = Math.min(h, maxH);
    const x2 = x1 + hEff;
    const y1 = func.f(x1);
    const y2 = func.f(x2);
    const dy = y2 - y1;
    const rapportoInc = hEff > 1e-12 ? dy / hEff : NaN;
    const derivataEsatta = func.df(x1);

    // Posizioni SVG assi
    const axisY = clamp(toSvgY(0), PAD.T, H - PAD.B);
    const axisX = clamp(toSvgX(0), PAD.L, W - PAD.R);

    // Rette secante e tangente
    const secanteAt = (svgX: number) => toSvgY(y1 + rapportoInc * (fromSvgX(svgX) - x1));
    const tangenteAt = (svgX: number) => toSvgY(y1 + derivataEsatta * (fromSvgX(svgX) - x1));

    // Path curva
    const curvePath = useMemo(
        () => xs.map((x, i) => `${i === 0 ? "M" : "L"} ${toSvgX(x).toFixed(1)} ${toSvgY(ys[i]).toFixed(1)}`).join(" "),
        [xs, ys, toSvgX, toSvgY]
    );

    // Drag x0
    const [dragging, setDragging] = useState(false);
    const updateX0 = (clientX: number, rect: DOMRect) => {
        const px = (clientX - rect.left) * (W / rect.width);
        setX0(clamp(fromSvgX(px), xMin, xMax - 0.01));
    };

    // Ticks assi
    const xSpan = xMax - xMin;
    const xStep = xSpan <= 3 ? 0.5 : xSpan <= 7 ? 1 : 2;
    const xTicks = useMemo(() => {
        const ticks: number[] = [];
        for (let t = Math.ceil(xMin / xStep) * xStep; t <= xMax + 1e-9; t = parseFloat((t + xStep).toFixed(6))) ticks.push(t);
        return ticks;
    }, [xMin, xMax, xStep]);

    const ySpan = yMax - yMin;
    const yStep = ySpan <= 4 ? 1 : ySpan <= 10 ? 2 : ySpan <= 25 ? 5 : 10;
    const yTicks = useMemo(() => {
        const ticks: number[] = [];
        for (let t = Math.ceil(yMin / yStep) * yStep; t <= yMax + 1e-9; t = parseFloat((t + yStep).toFixed(6))) ticks.push(t);
        return ticks;
    }, [yMin, yMax, yStep]);

    // Nomenclatura per modo
    const varX   = mode === "math" ? "x" : "t";
    const varF   = mode === "math" ? "f" : "s";
    const varH   = mode === "math" ? "h" : "\\Delta t";
    const varHp  = mode === "math" ? "h" : "Δt";
    const unitX  = mode === "physics" ? " s" : "";
    const unitY  = mode === "physics" ? " m" : "";
    const unitDer = mode === "physics" ? " m/s" : "";

    // Formule LaTeX
    const formulaDef = mode === "math"
        ? `f'(x_0) = \\lim_{h \\to 0} \\dfrac{f(x_0+h) - f(x_0)}{h}`
        : `v(t_0) = \\lim_{\\Delta t \\to 0} \\dfrac{\\Delta s}{\\Delta t} = \\lim_{\\Delta t \\to 0} \\dfrac{s(t_0 + \\Delta t) - s(t_0)}{\\Delta t}`;

    const x0s  = x1.toFixed(2);
    const hs   = hEff.toFixed(3);
    const dys  = dy.toFixed(4);
    const raps = isFinite(rapportoInc) ? rapportoInc.toFixed(4) : "\\text{n/d}";

    const formulaCurr = mode === "math"
        ? `\\dfrac{f(${x0s}+${hs}) - f(${x0s})}{${hs}} = \\dfrac{${dys}}{${hs}} \\approx ${raps}`
        : `\\dfrac{s(${x0s}+${hs}) - s(${x0s})}{${hs}} = \\dfrac{${dys}}{${hs}} \\approx ${raps}`;

    // Stili
    const card: React.CSSProperties = {
        background: "#fff", borderRadius: 14, padding: 14,
        boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
    };
    const btnBase: React.CSSProperties = {
        padding: "6px 14px", borderRadius: 8,
        border: "1px solid #d1d5db", background: "#fff",
        cursor: "pointer", fontSize: 13,
    };
    const modeBtn = (active: boolean): React.CSSProperties => ({
        ...btnBase,
        background: active ? "#2563eb" : "#fff",
        color: active ? "#fff" : "#374151",
        borderColor: active ? "#2563eb" : "#d1d5db",
        fontWeight: active ? 700 : 400,
    });

    const showBrackets = hEff > 0.025;

    return (
        <DemoContainer
            title="La derivata: limite del rapporto incrementale"
            description="Visualizza geometricamente come la secante diventa tangente quando h → 0."
        >
            {/* Mode + funzione */}
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
                <button style={modeBtn(mode === "math")} onClick={() => setMode("math")}>
                    📐 Matematica
                </button>
                <button style={modeBtn(mode === "physics")} onClick={() => setMode("physics")}>
                    🏃 Fisica: velocità
                </button>
                <select
                    value={funcId}
                    onChange={e => setFuncId(e.target.value)}
                    style={{ ...btnBase, padding: "6px 10px" }}
                >
                    {funcs.map(fn => <option key={fn.id} value={fn.id}>{fn.label}</option>)}
                </select>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                    <input type="checkbox" checked={showTangent} onChange={e => setShowTangent(e.target.checked)} />
                    Tangente esatta
                </label>
            </div>

            {/* Definizione */}
            <div style={{ ...card, background: "#f8fafc", marginBottom: 12, textAlign: "center", padding: 18 }}>
                <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, fontWeight: 600 }}>
                    Definizione
                </div>
                <DisplayMath>{formulaDef}</DisplayMath>
            </div>

            {/* Grafico */}
            <div style={{ ...card, marginBottom: 12 }}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>
                    Grafico di <Latex>{`${varF}(${varX}) = ${func.latexExpr}`}</Latex>
                    <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 8, fontWeight: 400 }}>
                        (trascina sul grafico per spostare P)
                    </span>
                </div>

                <svg
                    viewBox={`0 0 ${W} ${H}`}
                    style={{ width: "100%", height: "auto", maxHeight: isMobile ? "55vh" : "58vh", cursor: dragging ? "grabbing" : "crosshair", display: "block" }}
                    onMouseDown={e => { setDragging(true); updateX0(e.clientX, e.currentTarget.getBoundingClientRect()); }}
                    onMouseMove={e => { if (dragging) updateX0(e.clientX, e.currentTarget.getBoundingClientRect()); }}
                    onMouseUp={() => setDragging(false)}
                    onMouseLeave={() => setDragging(false)}
                    onTouchStart={e => {
                        setDragging(true);
                        updateX0(e.touches[0].clientX, e.currentTarget.getBoundingClientRect());
                    }}
                    onTouchMove={e => {
                        if (!dragging) return;
                        e.preventDefault();
                        updateX0(e.touches[0].clientX, e.currentTarget.getBoundingClientRect());
                    }}
                    onTouchEnd={() => setDragging(false)}
                >
                    <rect width={W} height={H} fill="#fafafa" rx={10} />

                    {/* Griglia */}
                    {xTicks.map(t => (
                        <line key={`gx${t}`} x1={toSvgX(t)} y1={PAD.T} x2={toSvgX(t)} y2={H - PAD.B} stroke="#e5e7eb" />
                    ))}
                    {yTicks.map(t => (
                        <line key={`gy${t}`} x1={PAD.L} y1={toSvgY(t)} x2={W - PAD.R} y2={toSvgY(t)} stroke="#e5e7eb" />
                    ))}

                    {/* Assi */}
                    <line x1={PAD.L} y1={axisY} x2={W - PAD.R} y2={axisY} stroke="#374151" strokeWidth={2} />
                    <line x1={axisX} y1={PAD.T} x2={axisX} y2={H - PAD.B} stroke="#374151" strokeWidth={2} />

                    {/* Tick labels asse x */}
                    {xTicks.map(t => (
                        <g key={`tx${t}`}>
                            <line x1={toSvgX(t)} y1={axisY - 4} x2={toSvgX(t)} y2={axisY + 4} stroke="#374151" />
                            <text x={toSvgX(t)} y={axisY + 17} fontSize={11} textAnchor="middle" fill="#6b7280">
                                {xStep < 1 ? t.toFixed(1) : t}
                            </text>
                        </g>
                    ))}
                    {/* Tick labels asse y */}
                    {yTicks.map(t => (
                        <g key={`ty${t}`}>
                            <line x1={axisX - 4} y1={toSvgY(t)} x2={axisX + 4} y2={toSvgY(t)} stroke="#374151" />
                            <text x={PAD.L - 6} y={toSvgY(t) + 4} fontSize={11} textAnchor="end" fill="#6b7280">{t}</text>
                        </g>
                    ))}

                    {/* Etichette assi */}
                    <text x={(PAD.L + W - PAD.R) / 2} y={H - 8} fontSize={13} textAnchor="middle" fill="#374151">{varX}</text>
                    <text x={14} y={(PAD.T + H - PAD.B) / 2} fontSize={13} textAnchor="middle" fill="#374151"
                        transform={`rotate(-90 14 ${(PAD.T + H - PAD.B) / 2})`}>
                        {varF}({varX})
                    </text>

                    {/* Curva */}
                    <path d={curvePath} fill="none" stroke="#2563eb" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />

                    {/* Tangente (viola tratteggiata) */}
                    {showTangent && isFinite(derivataEsatta) && (
                        <line
                            x1={PAD.L} y1={tangenteAt(PAD.L)}
                            x2={W - PAD.R} y2={tangenteAt(W - PAD.R)}
                            stroke="#9333ea" strokeWidth={2} strokeDasharray="8 4"
                        />
                    )}

                    {/* Secante (verde) */}
                    {isFinite(rapportoInc) && (
                        <line
                            x1={PAD.L} y1={secanteAt(PAD.L)}
                            x2={W - PAD.R} y2={secanteAt(W - PAD.R)}
                            stroke="#10b981" strokeWidth={2.5}
                        />
                    )}

                    {/* Bracket Δx su asse x */}
                    {showBrackets && (
                        <g>
                            <line x1={toSvgX(x1)} y1={H - PAD.B + 8} x2={toSvgX(x2)} y2={H - PAD.B + 8} stroke="#10b981" strokeWidth={2} />
                            <line x1={toSvgX(x1)} y1={H - PAD.B + 4} x2={toSvgX(x1)} y2={H - PAD.B + 12} stroke="#10b981" strokeWidth={2} />
                            <line x1={toSvgX(x2)} y1={H - PAD.B + 4} x2={toSvgX(x2)} y2={H - PAD.B + 12} stroke="#10b981" strokeWidth={2} />
                            <text x={(toSvgX(x1) + toSvgX(x2)) / 2} y={H - PAD.B + 26} fontSize={11} textAnchor="middle" fill="#047857" fontWeight="bold">
                                {varHp} = {hEff.toFixed(3)}{unitX}
                            </text>
                        </g>
                    )}

                    {/* Bracket Δy verticale */}
                    {showBrackets && Math.abs(dy) > 0.05 && isFinite(rapportoInc) && (
                        <g>
                            <line x1={toSvgX(x2) + 10} y1={toSvgY(y1)} x2={toSvgX(x2) + 10} y2={toSvgY(y2)} stroke="#10b981" strokeWidth={2} />
                            <line x1={toSvgX(x2) + 6} y1={toSvgY(y1)} x2={toSvgX(x2) + 14} y2={toSvgY(y1)} stroke="#10b981" strokeWidth={2} />
                            <line x1={toSvgX(x2) + 6} y1={toSvgY(y2)} x2={toSvgX(x2) + 14} y2={toSvgY(y2)} stroke="#10b981" strokeWidth={2} />
                            <text x={toSvgX(x2) + 22} y={(toSvgY(y1) + toSvgY(y2)) / 2 + 4} fontSize={11} textAnchor="start" fill="#047857" fontWeight="bold">
                                Δ{varF === "s" ? "s" : varF} = {dy.toFixed(3)}{unitY}
                            </text>
                        </g>
                    )}

                    {/* Linee verticali trattegiate P e Q */}
                    <line x1={toSvgX(x1)} y1={toSvgY(y1)} x2={toSvgX(x1)} y2={axisY} stroke="#ef4444" strokeDasharray="4 3" strokeWidth={1.5} />
                    {showBrackets && (
                        <line x1={toSvgX(x2)} y1={toSvgY(y2)} x2={toSvgX(x2)} y2={axisY} stroke="#f59e0b" strokeDasharray="4 3" strokeWidth={1.5} />
                    )}

                    {/* Proiezioni sull'asse y */}
                    <line x1={axisX} y1={toSvgY(y1)} x2={toSvgX(x1)} y2={toSvgY(y1)} stroke="#ef4444" strokeDasharray="4 3" strokeWidth={1.5} />
                    <circle cx={axisX} cy={toSvgY(y1)} r={3} fill="#ef4444" />
                    <text
                        x={axisX - 6} y={toSvgY(y1) + 4}
                        fontSize={10} textAnchor="end" fill="#b91c1c" fontWeight="bold"
                    >
                        {varF}({varX}₀)={y1.toFixed(2)}
                    </text>
                    {showBrackets && (
                        <>
                            <line x1={axisX} y1={toSvgY(y2)} x2={toSvgX(x2)} y2={toSvgY(y2)} stroke="#f59e0b" strokeDasharray="4 3" strokeWidth={1.5} />
                            <circle cx={axisX} cy={toSvgY(y2)} r={3} fill="#f59e0b" />
                            <text
                                x={axisX - 6} y={toSvgY(y2) + 4}
                                fontSize={10} textAnchor="end" fill="#92400e" fontWeight="bold"
                            >
                                {varF}({varX}₀+{varHp})={y2.toFixed(2)}
                            </text>
                        </>
                    )}

                    {/* Punto Q */}
                    {showBrackets && (
                        <g>
                            <circle cx={toSvgX(x2)} cy={toSvgY(y2)} r={7} fill="#f59e0b" stroke="#fff" strokeWidth={2} />
                            <rect x={toSvgX(x2) - 26} y={toSvgY(y2) - 22} width={52} height={16} fill="#fffbeb" stroke="#f59e0b" rx={4} />
                            <text x={toSvgX(x2)} y={toSvgY(y2) - 9} fontSize={10} textAnchor="middle" fill="#92400e">
                                Q({varX}₀+{varHp})
                            </text>
                        </g>
                    )}

                    {/* Punto P */}
                    <circle cx={toSvgX(x1)} cy={toSvgY(y1)} r={9} fill="#ef4444" stroke="#fff" strokeWidth={2} style={{ cursor: "grab" }} />
                    <rect x={toSvgX(x1) - 30} y={toSvgY(y1) - 24} width={60} height={17} fill="#fef2f2" stroke="#ef4444" rx={4} />
                    <text x={toSvgX(x1)} y={toSvgY(y1) - 11} fontSize={10} textAnchor="middle" fill="#991b1c">
                        P({varX}₀={x1.toFixed(2)})
                    </text>

                    {/* Legenda */}
                    <g transform={`translate(${W - PAD.R - 180}, ${PAD.T + 4})`}>
                        <rect width={175} height={showTangent ? 60 : 42} fill="white" fillOpacity={0.9} rx={6} stroke="#e5e7eb" />
                        <line x1={8} y1={14} x2={28} y2={14} stroke="#10b981" strokeWidth={2.5} />
                        <text x={34} y={18} fontSize={11} fill="#374151">secante (rapp. inc.)</text>
                        {showTangent && (
                            <>
                                <line x1={8} y1={32} x2={28} y2={32} stroke="#9333ea" strokeWidth={2} strokeDasharray="6 3" />
                                <text x={34} y={36} fontSize={11} fill="#374151">tangente (derivata)</text>
                            </>
                        )}
                        <line x1={8} y1={showTangent ? 50 : 32} x2={28} y2={showTangent ? 50 : 32} stroke="#2563eb" strokeWidth={2.5} />
                        <text x={34} y={(showTangent ? 50 : 32) + 4} fontSize={11} fill="#374151">
                            {varF}({varX})
                        </text>
                    </g>
                </svg>
            </div>

            {/* Pannelli inferiori */}
            <div style={{
                display: "grid", gap: 12,
                gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(260px, 1fr))",
            }}>

                {/* Controlli */}
                <div style={card}>
                    <div style={{ fontWeight: 600, marginBottom: 10 }}>Controlli</div>

                    <label style={{ display: "block", fontSize: 13, marginBottom: 10 }}>
                        <span style={{ color: "#ef4444", fontWeight: 600 }}>
                            <Latex>{`${varX}_0`}</Latex>
                        </span>{" "}= {x1.toFixed(3)}{unitX}
                        <input
                            type="range" min={xMin} max={xMax - 0.01} step={0.01} value={x0}
                            onChange={e => setX0(+e.target.value)}
                            style={{ width: "100%", accentColor: "#ef4444", marginTop: 4 }}
                        />
                    </label>

                    <label style={{ display: "block", fontSize: 13, marginBottom: 12 }}>
                        <span style={{ color: "#f59e0b", fontWeight: 600 }}>
                            <Latex>{varH}</Latex>
                        </span>{" "}= {hEff.toFixed(4)}{unitX}
                        <input
                            type="range" min={0.005} max={Math.max(0.01, maxH)} step={0.005} value={Math.min(h, maxH)}
                            onChange={e => { setH(+e.target.value); setAnimating(false); }}
                            style={{ width: "100%", accentColor: "#f59e0b", marginTop: 4 }}
                        />
                    </label>

                    <div style={{ display: "flex", gap: 8 }}>
                        <button
                            onClick={() => setAnimating(true)}
                            disabled={animating}
                            style={{
                                ...btnBase, flex: 1,
                                background: animating ? "#e5e7eb" : "#2563eb",
                                color: animating ? "#9ca3af" : "#fff",
                                borderColor: animating ? "#e5e7eb" : "#2563eb",
                            }}
                        >
                            ▶ Anima {varHp}→0
                        </button>
                        <button onClick={() => { setH(func.hDefault); setAnimating(false); }} style={{ ...btnBase, flex: 1 }}>
                            Reset
                        </button>
                    </div>
                </div>

                {/* Rapporto incrementale corrente */}
                <div style={{ ...card, background: "#f0fdf4" }}>
                    <div style={{ fontWeight: 600, marginBottom: 8, color: "#166534" }}>📊 Rapporto incrementale</div>
                    <div style={{ marginBottom: 10, overflowX: "auto" }}>
                        <DisplayMath>{formulaCurr}</DisplayMath>
                    </div>
                    <div style={{ borderTop: "1px solid #bbf7d0", paddingTop: 8, display: "grid", gap: 5, fontSize: 13 }}>
                        <div>
                            Rapp. inc. ={" "}
                            <strong style={{ color: "#10b981" }}>
                                {isFinite(rapportoInc) ? rapportoInc.toFixed(5) : "—"}{unitDer}
                            </strong>
                        </div>
                        <div>
                            {mode === "math" ? "f′(x₀)" : "v(t₀)"} ={" "}
                            <strong style={{ color: "#9333ea" }}>
                                {isFinite(derivataEsatta) ? derivataEsatta.toFixed(5) : "—"}{unitDer}
                            </strong>
                        </div>
                        <div style={{ color: "#6b7280", fontSize: 12 }}>
                            Errore:{" "}
                            {isFinite(rapportoInc) && isFinite(derivataEsatta)
                                ? Math.abs(rapportoInc - derivataEsatta).toFixed(6)
                                : "—"}
                        </div>
                    </div>
                </div>

                {/* Tabella convergenza */}
                <div style={card}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>
                        Convergenza per{" "}<Latex>{`${varX}_0 = ${x1.toFixed(2)}`}</Latex>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                            <thead>
                                <tr style={{ background: "#f3f4f6" }}>
                                    <th style={{ padding: "4px 8px", textAlign: "left" }}>
                                        <Latex>{varH}</Latex>
                                    </th>
                                    <th style={{ padding: "4px 8px", textAlign: "right" }}>Rapp. inc.</th>
                                    <th style={{ padding: "4px 8px", textAlign: "right" }}>Errore</th>
                                </tr>
                            </thead>
                            <tbody>
                                {TABLE_H_VALUES.map(hv => {
                                    const rap = (func.f(x1 + hv) - y1) / hv;
                                    const err = isFinite(derivataEsatta) && isFinite(rap)
                                        ? Math.abs(rap - derivataEsatta) : NaN;
                                    const highlight = Math.abs(Math.log10(hv) - Math.log10(hEff)) < 0.4;
                                    return (
                                        <tr key={hv} style={{ background: highlight ? "#fef3c7" : "transparent" }}>
                                            <td style={{ padding: "3px 8px", fontWeight: highlight ? 700 : 400 }}>{hv}</td>
                                            <td style={{ padding: "3px 8px", textAlign: "right", color: "#10b981", fontWeight: highlight ? 700 : 400 }}>
                                                {isFinite(rap) ? rap.toFixed(5) : "—"}
                                            </td>
                                            <td style={{ padding: "3px 8px", textAlign: "right", color: "#6b7280" }}>
                                                {isFinite(err) ? err.toFixed(5) : "—"}
                                            </td>
                                        </tr>
                                    );
                                })}
                                <tr style={{ borderTop: "2px solid #9333ea", background: "#fdf4ff" }}>
                                    <td style={{ padding: "4px 8px", fontWeight: 700, color: "#9333ea" }}>→ 0</td>
                                    <td style={{ padding: "4px 8px", textAlign: "right", fontWeight: 700, color: "#9333ea" }}>
                                        {isFinite(derivataEsatta) ? derivataEsatta.toFixed(5) : "—"}
                                    </td>
                                    <td style={{ padding: "4px 8px", textAlign: "right", color: "#9333ea", fontWeight: 700 }}>0</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Concetto chiave */}
            <div style={{ marginTop: 12, background: "#eff6ff", borderRadius: 12, padding: 14, fontSize: 13, color: "#1e40af" }}>
                {mode === "math" ? (
                    <>
                        <strong>💡 Concetto chiave:</strong> La <strong>secante</strong> (verde) passa per P = (x₀, f(x₀)) e Q = (x₀+h, f(x₀+h)).
                        La sua pendenza è il <strong>rapporto incrementale</strong>{" "}
                        <Latex>{"\\dfrac{f(x_0+h)-f(x_0)}{h}"}</Latex>.
                        Quando h → 0, Q → P e la secante tende alla <strong>tangente</strong> (viola tratteggiata), la cui pendenza è la <strong>derivata</strong> f′(x₀).
                    </>
                ) : (
                    <>
                        <strong>💡 Concetto chiave:</strong> La <strong>velocità media</strong> nel tratto [t₀, t₀+Δt] è{" "}
                        <Latex>{"\\bar{v} = \\dfrac{\\Delta s}{\\Delta t}"}</Latex> (pendenza della secante verde).
                        Quando Δt → 0, la secante tende alla <strong>tangente</strong> (viola) e la velocità media converge alla <strong>velocità istantanea</strong>{" "}
                        v(t₀) = s′(t₀).
                    </>
                )}
            </div>
        </DemoContainer>
    );
}
