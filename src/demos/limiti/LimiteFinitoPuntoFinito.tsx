import React, { useMemo, useState, useEffect, useRef } from "react";

// Definizione delle funzioni predefinite
type FunctionDef = {
    id: string;
    name: string;
    expr: string;
    f: (x: number) => number;
    domain?: { min: number; max: number };
    x0Default: number;
    limitValue: (x0: number) => number;
    note?: string;
};

const FUNCTIONS: FunctionDef[] = [
    {
        id: "quad",
        name: "f(x) = x²",
        expr: "x²",
        f: (x) => x * x,
        x0Default: 2,
        limitValue: (x0) => x0 * x0,
    },
    {
        id: "sin",
        name: "f(x) = sin(x)",
        expr: "sin(x)",
        f: (x) => Math.sin(x),
        x0Default: Math.PI / 2,
        limitValue: (x0) => Math.sin(x0),
    },
    {
        id: "removable",
        name: "f(x) = (x²-4)/(x-2)",
        expr: "(x²-4)/(x-2)",
        f: (x) => (Math.abs(x - 2) < 0.001 ? NaN : (x * x - 4) / (x - 2)),
        x0Default: 2,
        limitValue: (x0) => 2 * x0,
        note: "Punto rimovibile in x=2",
    },
    {
        id: "sinc",
        name: "f(x) = sin(x)/x",
        expr: "sin(x)/x",
        f: (x) => (Math.abs(x) < 0.001 ? NaN : Math.sin(x) / x),
        x0Default: 0,
        limitValue: (x0) => (x0 === 0 ? 1 : Math.sin(x0) / x0),
        note: "Limite notevole: lim(x→0) sin(x)/x = 1",
    },
    {
        id: "cubic",
        name: "f(x) = x³ - 2x",
        expr: "x³ - 2x",
        f: (x) => x * x * x - 2 * x,
        x0Default: 1,
        limitValue: (x0) => x0 * x0 * x0 - 2 * x0,
    },
    {
        id: "exp",
        name: "f(x) = eˣ",
        expr: "eˣ",
        f: (x) => Math.exp(x),
        domain: { min: -3, max: 3 },
        x0Default: 0,
        limitValue: (x0) => Math.exp(x0),
    },
];

const SVG_WIDTH = 800;
const SVG_HEIGHT = 500;
const PAD_L = 60;
const PAD_R = 30;
const PAD_T = 30;
const PAD_B = 60;

function clamp(v: number, a: number, b: number) {
    return Math.max(a, Math.min(b, v));
}

export default function LimiteFinito() {
    const [selectedFunc, setSelectedFunc] = useState<FunctionDef>(FUNCTIONS[0]);
    const [x0, setX0] = useState(selectedFunc.x0Default);
    const [showLeftRight, setShowLeftRight] = useState(true);
    const [showTable, setShowTable] = useState(true);
    const [animating, setAnimating] = useState(false);
    const [animX, setAnimX] = useState<number | null>(null);
    const [manualX, setManualX] = useState<number | null>(null);
    const [manualMode, setManualMode] = useState(false);

    // Range del grafico
    const xMin = selectedFunc.domain?.min ?? -5;
    const xMax = selectedFunc.domain?.max ?? 5;
    const x0Clamped = clamp(x0, xMin + 0.5, xMax - 0.5);

    // Campionamento della funzione
    const samples = useMemo(() => {
        const points: { x: number; y: number }[] = [];
        const n = 400;
        for (let i = 0; i <= n; i++) {
            const x = xMin + (i / n) * (xMax - xMin);
            const y = selectedFunc.f(x);
            if (Number.isFinite(y)) {
                points.push({ x, y });
            }
        }
        return points;
    }, [selectedFunc, xMin, xMax]);

    // Range verticale dinamico
    const yValues = samples.map((p) => p.y);
    const yMinRaw = Math.min(...yValues);
    const yMaxRaw = Math.max(...yValues);
    const yPad = Math.max(1, (yMaxRaw - yMinRaw) * 0.15);
    const yMin = yMinRaw - yPad;
    const yMax = yMaxRaw + yPad;

    // Trasformazioni coordinate
    const toX = (x: number) =>
        PAD_L + ((x - xMin) / (xMax - xMin)) * (SVG_WIDTH - PAD_L - PAD_R);
    const toY = (y: number) =>
        SVG_HEIGHT - PAD_B - ((y - yMin) / (yMax - yMin)) * (SVG_HEIGHT - PAD_T - PAD_B);

    // Calcolo limiti
    const limitValue = selectedFunc.limitValue(x0Clamped);
    const leftApproach = useMemo(() => {
        const delta = 0.1;
        const steps = 5;
        const vals: { x: number; fx: number }[] = [];
        for (let i = steps; i >= 1; i--) {
            const x = x0Clamped - (delta * i) / steps;
            const fx = selectedFunc.f(x);
            if (Number.isFinite(fx)) vals.push({ x, fx });
        }
        return vals;
    }, [selectedFunc, x0Clamped]);

    const rightApproach = useMemo(() => {
        const delta = 0.1;
        const steps = 5;
        const vals: { x: number; fx: number }[] = [];
        for (let i = 1; i <= steps; i++) {
            const x = x0Clamped + (delta * i) / steps;
            const fx = selectedFunc.f(x);
            if (Number.isFinite(fx)) vals.push({ x, fx });
        }
        return vals;
    }, [selectedFunc, x0Clamped]);

    // Path SVG della funzione
    const pathD = useMemo(() => {
        if (samples.length === 0) return "";
        let d = `M ${toX(samples[0].x)} ${toY(samples[0].y)}`;
        for (let i = 1; i < samples.length; i++) {
            d += ` L ${toX(samples[i].x)} ${toY(samples[i].y)}`;
        }
        return d;
    }, [samples, toX, toY]);

    // Animazione avvicinamento
    const animRef = useRef<number | null>(null);
    useEffect(() => {
        if (!animating) {
            setAnimX(null);
            return;
        }

        let direction: "left" | "right" = "left";
        let t = 0;
        const duration = 2500; // ms per direzione
        let startTime: number | null = null;

        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            t = Math.min(1, elapsed / duration);

            if (direction === "left") {
                // Parte da sinistra lontano e si avvicina a x₀
                const xStart = Math.max(xMin, x0Clamped - 2);
                const x = xStart + t * (x0Clamped - xStart - 0.01);
                setAnimX(x);
                if (t >= 1) {
                    direction = "right";
                    startTime = timestamp;
                    t = 0;
                }
            } else {
                // Parte da destra lontano e si avvicina a x₀
                const xStart = Math.min(xMax, x0Clamped + 2);
                const x = xStart - t * (xStart - x0Clamped - 0.01);
                setAnimX(x);
                if (t >= 1) {
                    setAnimating(false);
                    return;
                }
            }

            animRef.current = requestAnimationFrame(step);
        };

        animRef.current = requestAnimationFrame(step);
        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, [animating, x0Clamped, xMin, xMax]);

    const animY = animX !== null ? selectedFunc.f(animX) : null;

    // Modalità manuale
    const activeX = manualMode && manualX !== null ? manualX : animX;
    const activeY = activeX !== null ? selectedFunc.f(activeX) : null;
    const distanceToX0 = activeX !== null ? Math.abs(activeX - x0Clamped) : null;

    // Ticks assi
    const xTicks = useMemo(() => {
        const ticks: number[] = [];
        const step = (xMax - xMin) / 10;
        for (let i = 0; i <= 10; i++) {
            ticks.push(xMin + i * step);
        }
        return ticks;
    }, [xMin, xMax]);

    const yTicks = useMemo(() => {
        const ticks: number[] = [];
        const step = (yMax - yMin) / 8;
        for (let i = 0; i <= 8; i++) {
            ticks.push(yMin + i * step);
        }
        return ticks;
    }, [yMin, yMax]);

    return (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
                Limite finito per x → x₀ finito
            </h1>
            <p style={{ color: "#475569", marginBottom: 12 }}>
                Studia il comportamento di una funzione quando x si avvicina a un punto x₀.
                Il limite è <strong>finito</strong> quando f(x) tende a un valore L finito.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12 }}>
                {/* GRAFICO */}
                <div
                    style={{
                        background: "#fff",
                        borderRadius: 16,
                        padding: 12,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 8,
                            flexWrap: "wrap",
                            gap: 8,
                        }}
                    >
                        <div style={{ fontWeight: 600 }}>Grafico della funzione</div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <button
                                onClick={() => setAnimating(true)}
                                disabled={animating}
                                style={{
                                    padding: "6px 10px",
                                    borderRadius: 8,
                                    border: "1px solid #cbd5e1",
                                    background: animating ? "#e5e7eb" : "#fff",
                                    cursor: animating ? "not-allowed" : "pointer",
                                }}
                            >
                                {animating ? "Animazione..." : "Anima avvicinamento"}
                            </button>
                            <button
                                onClick={() => {
                                    setManualMode(!manualMode);
                                    if (!manualMode) {
                                        setManualX(x0Clamped - 1);
                                        setAnimating(false);
                                    }
                                }}
                                style={{
                                    padding: "6px 10px",
                                    borderRadius: 8,
                                    border: "1px solid #cbd5e1",
                                    background: manualMode ? "#dbeafe" : "#fff",
                                    cursor: "pointer",
                                    fontWeight: manualMode ? 600 : 400,
                                }}
                            >
                                {manualMode ? "Modalità manuale ON" : "Modalità manuale"}
                            </button>
                            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <input
                                    type="checkbox"
                                    checked={showLeftRight}
                                    onChange={(e) => setShowLeftRight(e.target.checked)}
                                />
                                Limiti dx/sx
                            </label>
                        </div>
                    </div>

                    <svg
                        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                        style={{ width: "100%", height: "auto" }}
                    >
                        {/* Sfondo quadrettato */}
                        <defs>
                            <pattern
                                id="gridLimite"
                                width="20"
                                height="20"
                                patternUnits="userSpaceOnUse"
                            >
                                <rect width="20" height="20" fill="#fafafa" />
                                <path
                                    d="M20 0 H0 V20"
                                    fill="none"
                                    stroke="#e0e0e0"
                                    strokeWidth={1}
                                />
                            </pattern>
                        </defs>
                        <rect
                            x={0}
                            y={0}
                            width={SVG_WIDTH}
                            height={SVG_HEIGHT}
                            fill="url(#gridLimite)"
                        />

                        {/* Griglia */}
                        {xTicks.map((x, i) => (
                            <line
                                key={`xg-${i}`}
                                x1={toX(x)}
                                y1={PAD_T}
                                x2={toX(x)}
                                y2={SVG_HEIGHT - PAD_B}
                                stroke="#e5e7eb"
                            />
                        ))}
                        {yTicks.map((y, i) => (
                            <line
                                key={`yg-${i}`}
                                x1={PAD_L}
                                y1={toY(y)}
                                x2={SVG_WIDTH - PAD_R}
                                y2={toY(y)}
                                stroke="#e5e7eb"
                            />
                        ))}

                        {/* Assi */}
                        <line
                            x1={PAD_L}
                            y1={toY(0)}
                            x2={SVG_WIDTH - PAD_R}
                            y2={toY(0)}
                            stroke="#111827"
                            strokeWidth={2}
                        />
                        <line
                            x1={toX(0)}
                            y1={PAD_T}
                            x2={toX(0)}
                            y2={SVG_HEIGHT - PAD_B}
                            stroke="#111827"
                            strokeWidth={2}
                        />

                        {/* Ticks e labels */}
                        {xTicks.map((x, i) => (
                            <text
                                key={`xl-${i}`}
                                x={toX(x)}
                                y={SVG_HEIGHT - PAD_B + 20}
                                fontSize={10}
                                textAnchor="middle"
                                fill="#374151"
                            >
                                {x.toFixed(1)}
                            </text>
                        ))}
                        {yTicks.map((y, i) => (
                            <text
                                key={`yl-${i}`}
                                x={PAD_L - 10}
                                y={toY(y) + 4}
                                fontSize={10}
                                textAnchor="end"
                                fill="#374151"
                            >
                                {y.toFixed(1)}
                            </text>
                        ))}

                        {/* Linea verticale a x₀ */}
                        <line
                            x1={toX(x0Clamped)}
                            y1={PAD_T}
                            x2={toX(x0Clamped)}
                            y2={SVG_HEIGHT - PAD_B}
                            stroke="#ef4444"
                            strokeWidth={2}
                            strokeDasharray="6 4"
                        />

                        {/* Linea orizzontale al limite L */}
                        {Number.isFinite(limitValue) && (
                            <line
                                x1={PAD_L}
                                y1={toY(limitValue)}
                                x2={SVG_WIDTH - PAD_R}
                                y2={toY(limitValue)}
                                stroke="#10b981"
                                strokeWidth={2}
                                strokeDasharray="6 4"
                            />
                        )}

                        {/* Curva della funzione */}
                        <path d={pathD} fill="none" stroke="#2563eb" strokeWidth={3} />

                        {/* Punto limite (se esiste) */}
                        {Number.isFinite(limitValue) && (
                            <circle
                                cx={toX(x0Clamped)}
                                cy={toY(limitValue)}
                                r={6}
                                fill="#10b981"
                                stroke="#065f46"
                                strokeWidth={2}
                            />
                        )}

                        {/* Punti di avvicinamento sinistra/destra */}
                        {showLeftRight && (
                            <>
                                {leftApproach.map((p, i) => (
                                    <circle
                                        key={`left-${i}`}
                                        cx={toX(p.x)}
                                        cy={toY(p.fx)}
                                        r={3}
                                        fill="#f97316"
                                        opacity={0.6 + i * 0.08}
                                    />
                                ))}
                                {rightApproach.map((p, i) => (
                                    <circle
                                        key={`right-${i}`}
                                        cx={toX(p.x)}
                                        cy={toY(p.fx)}
                                        r={3}
                                        fill="#8b5cf6"
                                        opacity={0.6 + i * 0.08}
                                    />
                                ))}
                            </>
                        )}

                        {/* Pallina animata o manuale */}
                        {activeX !== null && activeY !== null && Number.isFinite(activeY) && (
                            <>
                                <circle
                                    cx={toX(activeX)}
                                    cy={toY(activeY)}
                                    r={8}
                                    fill="#fbbf24"
                                    stroke="#92400e"
                                    strokeWidth={2}
                                />
                                {/* Linee guida dalla pallina agli assi */}
                                <line
                                    x1={toX(activeX)}
                                    y1={toY(activeY)}
                                    x2={toX(activeX)}
                                    y2={SVG_HEIGHT - PAD_B}
                                    stroke="#fbbf24"
                                    strokeWidth={1.5}
                                    strokeDasharray="3 3"
                                    opacity={0.6}
                                />
                                <line
                                    x1={toX(activeX)}
                                    y1={toY(activeY)}
                                    x2={PAD_L}
                                    y2={toY(activeY)}
                                    stroke="#fbbf24"
                                    strokeWidth={1.5}
                                    strokeDasharray="3 3"
                                    opacity={0.6}
                                />
                                {/* Etichette sui valori correnti */}
                                <g>
                                    <rect
                                        x={toX(activeX) - 35}
                                        y={SVG_HEIGHT - PAD_B + 25}
                                        width={70}
                                        height={20}
                                        fill="#fef3c7"
                                        stroke="#f59e0b"
                                        rx={4}
                                    />
                                    <text
                                        x={toX(activeX)}
                                        y={SVG_HEIGHT - PAD_B + 38}
                                        fontSize={11}
                                        textAnchor="middle"
                                        fill="#92400e"
                                        fontWeight={600}
                                    >
                                        x = {activeX.toFixed(3)}
                                    </text>
                                </g>
                                <g>
                                    <rect
                                        x={PAD_L - 70}
                                        y={toY(activeY) - 10}
                                        width={60}
                                        height={20}
                                        fill="#fef3c7"
                                        stroke="#f59e0b"
                                        rx={4}
                                    />
                                    <text
                                        x={PAD_L - 40}
                                        y={toY(activeY) + 3}
                                        fontSize={11}
                                        textAnchor="middle"
                                        fill="#92400e"
                                        fontWeight={600}
                                    >
                                        f(x) = {activeY.toFixed(3)}
                                    </text>
                                </g>
                            </>
                        )}

                        {/* Labels */}
                        <text
                            x={toX(x0Clamped) + 10}
                            y={PAD_T + 15}
                            fontSize={12}
                            fill="#991b1b"
                            fontWeight={600}
                        >
                            x₀ = {x0Clamped.toFixed(2)}
                        </text>

                        {Number.isFinite(limitValue) && (
                            <text
                                x={SVG_WIDTH - PAD_R - 10}
                                y={toY(limitValue) - 8}
                                fontSize={12}
                                fill="#065f46"
                                fontWeight={600}
                                textAnchor="end"
                            >
                                L = {limitValue.toFixed(3)}
                            </text>
                        )}
                    </svg>

                    {selectedFunc.note && (
                        <div
                            style={{
                                marginTop: 8,
                                padding: 8,
                                background: "#fef3c7",
                                borderRadius: 8,
                                fontSize: 13,
                                color: "#78350f",
                            }}
                        >
                            ℹ️ {selectedFunc.note}
                        </div>
                    )}
                </div>

                {/* PANNELLO CONTROLLI */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                    }}
                >
                    {/* Selezione funzione */}
                    <div
                        style={{
                            background: "#fff",
                            borderRadius: 16,
                            padding: 12,
                            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                        }}
                    >
                        <div style={{ fontWeight: 600, marginBottom: 8 }}>
                            Scegli la funzione
                        </div>
                        <select
                            value={selectedFunc.id}
                            onChange={(e) => {
                                const func = FUNCTIONS.find((f) => f.id === e.target.value)!;
                                setSelectedFunc(func);
                                setX0(func.x0Default);
                                setAnimating(false);
                            }}
                            style={{
                                width: "100%",
                                padding: 8,
                                borderRadius: 8,
                                border: "1px solid #cbd5e1",
                            }}
                        >
                            {FUNCTIONS.map((f) => (
                                <option key={f.id} value={f.id}>
                                    {f.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Controllo x₀ */}
                    <div
                        style={{
                            background: "#fff",
                            borderRadius: 16,
                            padding: 12,
                            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                        }}
                    >
                        <div style={{ fontWeight: 600, marginBottom: 8 }}>
                            Punto x₀ (dove calcolare il limite)
                        </div>
                        <input
                            type="range"
                            min={xMin + 0.5}
                            max={xMax - 0.5}
                            step={0.01}
                            value={x0}
                            onChange={(e) => {
                                setX0(parseFloat(e.target.value));
                                setAnimating(false);
                            }}
                            style={{ width: "100%" }}
                        />
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "auto 1fr",
                                gap: 8,
                                marginTop: 8,
                            }}
                        >
                            <label>x₀:</label>
                            <input
                                type="number"
                                step={0.1}
                                value={x0.toFixed(2)}
                                onChange={(e) => {
                                    setX0(parseFloat(e.target.value) || 0);
                                    setAnimating(false);
                                }}
                                style={{
                                    padding: 4,
                                    borderRadius: 4,
                                    border: "1px solid #cbd5e1",
                                }}
                            />
                        </div>
                    </div>

                    {/* Controllo manuale x */}
                    {manualMode && (
                        <div
                            style={{
                                background: "#dbeafe",
                                borderRadius: 16,
                                padding: 12,
                                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                                border: "2px solid #3b82f6",
                            }}
                        >
                            <div style={{ fontWeight: 600, marginBottom: 8, color: "#1e3a8a" }}>
                                🎯 Esplora manualmente l'avvicinamento
                            </div>
                            <div style={{ fontSize: 13, color: "#1e40af", marginBottom: 8 }}>
                                Muovi il cursore per avvicinare x a x₀ = {x0Clamped.toFixed(2)}
                            </div>
                            <input
                                type="range"
                                min={xMin}
                                max={xMax}
                                step={0.001}
                                value={manualX ?? x0Clamped}
                                onChange={(e) => setManualX(parseFloat(e.target.value))}
                                style={{ width: "100%" }}
                            />
                            <div style={{ marginTop: 8, fontSize: 13, color: "#1e40af" }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                    <div>
                                        <strong>x corrente:</strong> {manualX?.toFixed(4) ?? "—"}
                                    </div>
                                    <div>
                                        <strong>f(x):</strong> {activeY?.toFixed(4) ?? "—"}
                                    </div>
                                    <div>
                                        <strong>Distanza da x₀:</strong>{" "}
                                        {distanceToX0 !== null ? distanceToX0.toFixed(4) : "—"}
                                    </div>
                                    <div>
                                        <strong>Distanza da L:</strong>{" "}
                                        {activeY !== null && Number.isFinite(limitValue)
                                            ? Math.abs(activeY - limitValue).toFixed(4)
                                            : "—"}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                                <button
                                    onClick={() => setManualX(x0Clamped - 0.5)}
                                    style={{
                                        flex: 1,
                                        padding: "6px",
                                        borderRadius: 6,
                                        border: "1px solid #3b82f6",
                                        background: "#fff",
                                        fontSize: 12,
                                    }}
                                >
                                    x₀ - 0.5
                                </button>
                                <button
                                    onClick={() => setManualX(x0Clamped - 0.1)}
                                    style={{
                                        flex: 1,
                                        padding: "6px",
                                        borderRadius: 6,
                                        border: "1px solid #3b82f6",
                                        background: "#fff",
                                        fontSize: 12,
                                    }}
                                >
                                    x₀ - 0.1
                                </button>
                                <button
                                    onClick={() => setManualX(x0Clamped + 0.1)}
                                    style={{
                                        flex: 1,
                                        padding: "6px",
                                        borderRadius: 6,
                                        border: "1px solid #3b82f6",
                                        background: "#fff",
                                        fontSize: 12,
                                    }}
                                >
                                    x₀ + 0.1
                                </button>
                                <button
                                    onClick={() => setManualX(x0Clamped + 0.5)}
                                    style={{
                                        flex: 1,
                                        padding: "6px",
                                        borderRadius: 6,
                                        border: "1px solid #3b82f6",
                                        background: "#fff",
                                        fontSize: 12,
                                    }}
                                >
                                    x₀ + 0.5
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Risultato limite */}
                    <div
                        style={{
                            background: "#fff",
                            borderRadius: 16,
                            padding: 12,
                            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                        }}
                    >
                        <div style={{ fontWeight: 600, marginBottom: 8 }}>
                            Risultato del limite
                        </div>
                        <div style={{ fontSize: 14, color: "#334155" }}>
                            <div style={{ marginBottom: 6 }}>
                                lim<sub style={{ fontSize: 11 }}>x → {x0Clamped.toFixed(2)}</sub>{" "}
                                {selectedFunc.expr} ={" "}
                                <strong style={{ color: "#059669", fontSize: 16 }}>
                                    {Number.isFinite(limitValue)
                                        ? limitValue.toFixed(4)
                                        : "non definito"}
                                </strong>
                            </div>
                            {showLeftRight && (
                                <>
                                    <div style={{ fontSize: 12, color: "#f97316" }}>
                                        • Da sinistra (x → x₀⁻):{" "}
                                        {leftApproach.length > 0
                                            ? leftApproach[leftApproach.length - 1].fx.toFixed(4)
                                            : "—"}
                                    </div>
                                    <div style={{ fontSize: 12, color: "#8b5cf6" }}>
                                        • Da destra (x → x₀⁺):{" "}
                                        {rightApproach.length > 0
                                            ? rightApproach[0].fx.toFixed(4)
                                            : "—"}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Tabella valori */}
                    {showTable && (
                        <div
                            style={{
                                background: "#fff",
                                borderRadius: 16,
                                padding: 12,
                                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: 8,
                                }}
                            >
                                <div style={{ fontWeight: 600 }}>Tabella di avvicinamento</div>
                                <button
                                    onClick={() => setShowTable(false)}
                                    style={{
                                        padding: "4px 8px",
                                        borderRadius: 6,
                                        border: "1px solid #cbd5e1",
                                        background: "#fff",
                                        fontSize: 11,
                                    }}
                                >
                                    Nascondi
                                </button>
                            </div>
                            <div
                                style={{
                                    maxHeight: 200,
                                    overflowY: "auto",
                                    fontSize: 12,
                                }}
                            >
                                <table
                                    style={{
                                        width: "100%",
                                        borderCollapse: "collapse",
                                    }}
                                >
                                    <thead style={{ background: "#f1f5f9", position: "sticky", top: 0 }}>
                                    <tr>
                                        <th style={{ padding: 4, textAlign: "left" }}>x</th>
                                        <th style={{ padding: 4, textAlign: "right" }}>f(x)</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {leftApproach.map((p, i) => (
                                        <tr key={`tl-${i}`} style={{ background: "#fff7ed" }}>
                                            <td style={{ padding: 4 }}>{p.x.toFixed(4)}</td>
                                            <td style={{ padding: 4, textAlign: "right" }}>
                                                {p.fx.toFixed(4)}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr style={{ background: "#dcfce7", fontWeight: 600 }}>
                                        <td style={{ padding: 4 }}>x₀ = {x0Clamped.toFixed(4)}</td>
                                        <td style={{ padding: 4, textAlign: "right" }}>
                                            L = {limitValue.toFixed(4)}
                                        </td>
                                    </tr>
                                    {rightApproach.map((p, i) => (
                                        <tr key={`tr-${i}`} style={{ background: "#f5f3ff" }}>
                                            <td style={{ padding: 4 }}>{p.x.toFixed(4)}</td>
                                            <td style={{ padding: 4, textAlign: "right" }}>
                                                {p.fx.toFixed(4)}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {!showTable && (
                        <button
                            onClick={() => setShowTable(true)}
                            style={{
                                padding: "8px 12px",
                                borderRadius: 8,
                                border: "1px solid #cbd5e1",
                                background: "#fff",
                            }}
                        >
                            Mostra tabella
                        </button>
                    )}
                </div>
            </div>

            {/* Spiegazione concettuale */}
            <div
                style={{
                    marginTop: 12,
                    background: "#eff6ff",
                    borderRadius: 12,
                    padding: 12,
                    fontSize: 13,
                    color: "#1e3a8a",
                }}
            >
                <strong>Concetto:</strong> Il limite finito per x → x₀ finito esiste quando,
                avvicinandosi a x₀ da sinistra e da destra, i valori di f(x) si avvicinano
                allo stesso numero L. Formalmente: ∀ε {"> 0"}, ∃δ {"> 0"} tale che se |x - x₀| {"< δ"}{" "}
                allora |f(x) - L| {"< ε"}.
            </div>
        </div>
    );
}