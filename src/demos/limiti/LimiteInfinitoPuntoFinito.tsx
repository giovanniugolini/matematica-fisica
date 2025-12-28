import React, { useMemo, useState, useEffect, useRef } from "react";

// Definizione delle funzioni con asintoti verticali
type FunctionDef = {
    id: string;
    name: string;
    expr: string;
    f: (x: number) => number;
    x0Default: number;
    leftLimit: string; // "+∞", "-∞", o valore
    rightLimit: string;
    note?: string;
};

const FUNCTIONS: FunctionDef[] = [
    {
        id: "inv",
        name: "f(x) = 1/x",
        expr: "1/x",
        f: (x) => 1 / x,
        x0Default: 0,
        leftLimit: "-∞",
        rightLimit: "+∞",
        note: "Asintoto verticale in x=0",
    },
    {
        id: "inv-square",
        name: "f(x) = 1/x²",
        expr: "1/x²",
        f: (x) => 1 / (x * x),
        x0Default: 0,
        leftLimit: "+∞",
        rightLimit: "+∞",
        note: "Entrambi i limiti tendono a +∞",
    },
    {
        id: "inv-shifted",
        name: "f(x) = 1/(x-2)",
        expr: "1/(x-2)",
        f: (x) => 1 / (x - 2),
        x0Default: 2,
        leftLimit: "-∞",
        rightLimit: "+∞",
        note: "Asintoto verticale in x=2",
    },
    {
        id: "inv-square-shifted",
        name: "f(x) = 1/(x-1)²",
        expr: "1/(x-1)²",
        f: (x) => {
            const d = x - 1;
            return 1 / (d * d);
        },
        x0Default: 1,
        leftLimit: "+∞",
        rightLimit: "+∞",
        note: "Asintoto verticale in x=1, sempre positivo",
    },
    {
        id: "neg-inv-square",
        name: "f(x) = -1/(x+1)²",
        expr: "-1/(x+1)²",
        f: (x) => {
            const d = x + 1;
            return -1 / (d * d);
        },
        x0Default: -1,
        leftLimit: "-∞",
        rightLimit: "-∞",
        note: "Asintoto verticale in x=-1, sempre negativo",
    },
    {
        id: "tan",
        name: "f(x) = tan(x)",
        expr: "tan(x)",
        f: (x) => Math.tan(x),
        x0Default: Math.PI / 2,
        leftLimit: "+∞",
        rightLimit: "-∞",
        note: "Asintoti verticali in x = π/2 + kπ",
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

export default function LimiteInfinitoFinito() {
    const [selectedFunc, setSelectedFunc] = useState<FunctionDef>(FUNCTIONS[0]);
    const [x0, setX0] = useState(selectedFunc.x0Default);
    const [showLeftRight, setShowLeftRight] = useState(true);
    const [animating, setAnimating] = useState(false);
    const [animX, setAnimX] = useState<number | null>(null);
    const [manualX, setManualX] = useState<number | null>(null);
    const [manualMode, setManualMode] = useState(false);

    // Range del grafico - più stretto verticalmente per vedere meglio gli asintoti
    const xMin = -5;
    const xMax = 5;
    const yMin = -10;
    const yMax = 10;
    const x0Clamped = clamp(x0, xMin + 0.5, xMax - 0.5);

    // Campionamento della funzione (diviso in due parti per evitare l'asintoto)
    const samples = useMemo(() => {
        const points: { x: number; y: number }[] = [];
        const n = 400;
        const epsilon = 0.05; // distanza minima dall'asintoto

        for (let i = 0; i <= n; i++) {
            const x = xMin + (i / n) * (xMax - xMin);

            // Salta i punti molto vicini all'asintoto
            if (Math.abs(x - x0Clamped) < epsilon) continue;

            const y = selectedFunc.f(x);

            // Filtra valori infiniti o fuori range
            if (Number.isFinite(y) && Math.abs(y) < 1000) {
                points.push({ x, y: clamp(y, yMin - 5, yMax + 5) });
            }
        }
        return points;
    }, [selectedFunc, x0Clamped, xMin, xMax, yMin, yMax]);

    // Trasformazioni coordinate
    const toX = (x: number) =>
        PAD_L + ((x - xMin) / (xMax - xMin)) * (SVG_WIDTH - PAD_L - PAD_R);
    const toY = (y: number) =>
        SVG_HEIGHT - PAD_B - ((y - yMin) / (yMax - yMin)) * (SVG_HEIGHT - PAD_T - PAD_B);

    // Valori di avvicinamento
    const leftApproach = useMemo(() => {
        const vals: { x: number; fx: number }[] = [];
        const distances = [1, 0.5, 0.1, 0.05, 0.01];
        for (const d of distances) {
            const x = x0Clamped - d;
            const fx = selectedFunc.f(x);
            if (Number.isFinite(fx)) vals.push({ x, fx });
        }
        return vals;
    }, [selectedFunc, x0Clamped]);

    const rightApproach = useMemo(() => {
        const vals: { x: number; fx: number }[] = [];
        const distances = [1, 0.5, 0.1, 0.05, 0.01];
        for (const d of distances) {
            const x = x0Clamped + d;
            const fx = selectedFunc.f(x);
            if (Number.isFinite(fx)) vals.push({ x, fx });
        }
        return vals;
    }, [selectedFunc, x0Clamped]);

    // Path SVG della funzione (diviso in segmenti)
    const pathSegments = useMemo(() => {
        if (samples.length === 0) return [];

        const segments: string[] = [];
        let currentPath = `M ${toX(samples[0].x)} ${toY(samples[0].y)}`;

        for (let i = 1; i < samples.length; i++) {
            const dx = samples[i].x - samples[i - 1].x;

            // Se c'è un gap grande, inizia un nuovo segmento
            if (dx > 0.2) {
                segments.push(currentPath);
                currentPath = `M ${toX(samples[i].x)} ${toY(samples[i].y)}`;
            } else {
                currentPath += ` L ${toX(samples[i].x)} ${toY(samples[i].y)}`;
            }
        }
        segments.push(currentPath);

        return segments;
    }, [samples]);

    // Modalità manuale/animazione
    const activeX = manualMode && manualX !== null ? manualX : animX;
    const activeY = activeX !== null ? selectedFunc.f(activeX) : null;
    const distanceToX0 = activeX !== null ? Math.abs(activeX - x0Clamped) : null;

    // Animazione avvicinamento
    const animRef = useRef<number | null>(null);
    useEffect(() => {
        if (!animating) {
            setAnimX(null);
            return;
        }

        let direction: "left" | "right" = "left";
        let t = 0;
        const duration = 2500;
        let startTime: number | null = null;

        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            t = Math.min(1, elapsed / duration);

            if (direction === "left") {
                const xStart = Math.max(xMin, x0Clamped - 2);
                const x = xStart + t * (x0Clamped - xStart - 0.05);
                setAnimX(x);
                if (t >= 1) {
                    direction = "right";
                    startTime = timestamp;
                    t = 0;
                }
            } else {
                const xStart = Math.min(xMax, x0Clamped + 2);
                const x = xStart - t * (xStart - x0Clamped - 0.05);
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

    // Ticks assi
    const xTicks = useMemo(() => {
        const ticks: number[] = [];
        for (let i = Math.ceil(xMin); i <= Math.floor(xMax); i++) {
            ticks.push(i);
        }
        return ticks;
    }, [xMin, xMax]);

    const yTicks = useMemo(() => {
        const ticks: number[] = [];
        for (let i = Math.ceil(yMin); i <= Math.floor(yMax); i += 2) {
            ticks.push(i);
        }
        return ticks;
    }, [yMin, yMax]);

    return (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
                Limite infinito per x → x₀ finito
            </h1>
            <p style={{ color: "#475569", marginBottom: 12 }}>
                Studia gli <strong>asintoti verticali</strong>: quando x si avvicina a x₀,
                la funzione tende a +∞ o -∞. La retta x = x₀ è un asintoto verticale.
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
                                id="gridLimiteInf"
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
                            fill="url(#gridLimiteInf)"
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
                                {x.toFixed(0)}
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
                                {y.toFixed(0)}
                            </text>
                        ))}

                        {/* Asintoto verticale in x₀ (linea rossa spessa) */}
                        <line
                            x1={toX(x0Clamped)}
                            y1={PAD_T}
                            x2={toX(x0Clamped)}
                            y2={SVG_HEIGHT - PAD_B}
                            stroke="#ef4444"
                            strokeWidth={3}
                            strokeDasharray="8 4"
                        />

                        {/* Curva della funzione (segmenti) */}
                        {pathSegments.map((d, i) => (
                            <path key={`seg-${i}`} d={d} fill="none" stroke="#2563eb" strokeWidth={3} />
                        ))}

                        {/* Punti di avvicinamento sinistra/destra */}
                        {showLeftRight && (
                            <>
                                {leftApproach.map((p, i) => {
                                    const py = toY(clamp(p.fx, yMin, yMax));
                                    return (
                                        <circle
                                            key={`left-${i}`}
                                            cx={toX(p.x)}
                                            cy={py}
                                            r={3}
                                            fill="#f97316"
                                            opacity={0.5 + i * 0.1}
                                        />
                                    );
                                })}
                                {rightApproach.map((p, i) => {
                                    const py = toY(clamp(p.fx, yMin, yMax));
                                    return (
                                        <circle
                                            key={`right-${i}`}
                                            cx={toX(p.x)}
                                            cy={py}
                                            r={3}
                                            fill="#8b5cf6"
                                            opacity={0.5 + i * 0.1}
                                        />
                                    );
                                })}
                            </>
                        )}

                        {/* Pallina animata o manuale */}
                        {activeX !== null && activeY !== null && Number.isFinite(activeY) && Math.abs(activeY) < 100 && (
                            <>
                                <circle
                                    cx={toX(activeX)}
                                    cy={toY(clamp(activeY, yMin, yMax))}
                                    r={8}
                                    fill="#fbbf24"
                                    stroke="#92400e"
                                    strokeWidth={2}
                                />
                                {/* Linee guida */}
                                <line
                                    x1={toX(activeX)}
                                    y1={toY(clamp(activeY, yMin, yMax))}
                                    x2={toX(activeX)}
                                    y2={SVG_HEIGHT - PAD_B}
                                    stroke="#fbbf24"
                                    strokeWidth={1.5}
                                    strokeDasharray="3 3"
                                    opacity={0.6}
                                />
                                {/* Etichette */}
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
                                        x={PAD_L - 80}
                                        y={toY(clamp(activeY, yMin, yMax)) - 10}
                                        width={70}
                                        height={20}
                                        fill="#fef3c7"
                                        stroke="#f59e0b"
                                        rx={4}
                                    />
                                    <text
                                        x={PAD_L - 45}
                                        y={toY(clamp(activeY, yMin, yMax)) + 3}
                                        fontSize={11}
                                        textAnchor="middle"
                                        fill="#92400e"
                                        fontWeight={600}
                                    >
                                        {Math.abs(activeY) > 1000 ? "±∞" : `f(x) = ${activeY.toFixed(1)}`}
                                    </text>
                                </g>
                            </>
                        )}

                        {/* Labels asintoto */}
                        <text
                            x={toX(x0Clamped) + 10}
                            y={PAD_T + 15}
                            fontSize={12}
                            fill="#991b1b"
                            fontWeight={600}
                        >
                            x₀ = {x0Clamped.toFixed(2)}
                        </text>
                        <text
                            x={toX(x0Clamped) + 10}
                            y={PAD_T + 30}
                            fontSize={11}
                            fill="#991b1b"
                        >
                            (asintoto verticale)
                        </text>
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
                                setManualMode(false);
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
                            Punto x₀ (asintoto verticale)
                        </div>
                        <input
                            type="range"
                            min={xMin + 0.5}
                            max={xMax - 0.5}
                            step={0.1}
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
                                Osserva come f(x) diverge avvicinandosi all'asintoto
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
                                        <strong>x:</strong> {manualX?.toFixed(4) ?? "—"}
                                    </div>
                                    <div>
                                        <strong>f(x):</strong>{" "}
                                        {activeY !== null && Math.abs(activeY) > 1000
                                            ? "→ ±∞"
                                            : activeY?.toFixed(2) ?? "—"}
                                    </div>
                                    <div>
                                        <strong>Distanza da x₀:</strong>{" "}
                                        {distanceToX0 !== null ? distanceToX0.toFixed(4) : "—"}
                                    </div>
                                    <div>
                                        <strong>|f(x)|:</strong>{" "}
                                        {activeY !== null ? Math.abs(activeY).toFixed(2) : "—"}
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

                    {/* Tabella di avvicinamento */}
                    <div
                        style={{
                            background: "#fff",
                            borderRadius: 16,
                            padding: 12,
                            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                        }}
                    >
                        <div style={{ fontWeight: 600, marginBottom: 8 }}>
                            Tabella di avvicinamento
                        </div>
                        <div
                            style={{
                                maxHeight: 220,
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
                                {leftApproach.reverse().map((p, i) => (
                                    <tr key={`tl-${i}`} style={{ background: "#fff7ed" }}>
                                        <td style={{ padding: 4 }}>{p.x.toFixed(4)}</td>
                                        <td style={{ padding: 4, textAlign: "right" }}>
                                            {Math.abs(p.fx) > 1000 ? "→ ∞" : p.fx.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                                <tr style={{ background: "#fee2e2", fontWeight: 600 }}>
                                    <td style={{ padding: 4 }}>x → x₀⁻</td>
                                    <td style={{ padding: 4, textAlign: "right" }}>
                                        {selectedFunc.leftLimit}
                                    </td>
                                </tr>
                                <tr style={{ background: "#fecaca", fontWeight: 700, fontSize: 13 }}>
                                    <td style={{ padding: 6, textAlign: "center" }} colSpan={2}>
                                        x₀ = {x0Clamped.toFixed(2)} (asintoto)
                                    </td>
                                </tr>
                                <tr style={{ background: "#f3e8ff", fontWeight: 600 }}>
                                    <td style={{ padding: 4 }}>x → x₀⁺</td>
                                    <td style={{ padding: 4, textAlign: "right" }}>
                                        {selectedFunc.rightLimit}
                                    </td>
                                </tr>
                                {rightApproach.map((p, i) => (
                                    <tr key={`tr-${i}`} style={{ background: "#faf5ff" }}>
                                        <td style={{ padding: 4 }}>{p.x.toFixed(4)}</td>
                                        <td style={{ padding: 4, textAlign: "right" }}>
                                            {Math.abs(p.fx) > 1000 ? "→ ∞" : p.fx.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Risultato limiti */}
                    <div
                        style={{
                            background: "#fff",
                            borderRadius: 16,
                            padding: 12,
                            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                        }}
                    >
                        <div style={{ fontWeight: 600, marginBottom: 8 }}>
                            Limiti agli estremi
                        </div>
                        <div style={{ fontSize: 14, color: "#334155" }}>
                            <div style={{ marginBottom: 6 }}>
                                <div style={{ fontSize: 12, color: "#f97316", marginBottom: 4 }}>
                                    • Limite sinistro (x → x₀⁻):
                                </div>
                                <div style={{ fontSize: 16, fontWeight: 600, color: "#991b1b", marginLeft: 12 }}>
                                    {selectedFunc.leftLimit}
                                </div>
                            </div>
                            <div style={{ marginBottom: 6 }}>
                                <div style={{ fontSize: 12, color: "#8b5cf6", marginBottom: 4 }}>
                                    • Limite destro (x → x₀⁺):
                                </div>
                                <div style={{ fontSize: 16, fontWeight: 600, color: "#991b1b", marginLeft: 12 }}>
                                    {selectedFunc.rightLimit}
                                </div>
                            </div>
                            {selectedFunc.leftLimit === selectedFunc.rightLimit ? (
                                <div style={{ marginTop: 8, fontSize: 13, color: "#059669" }}>
                                    ✓ I limiti coincidono: la funzione diverge allo stesso modo da entrambi i lati
                                </div>
                            ) : (
                                <div style={{ marginTop: 8, fontSize: 13, color: "#ea580c" }}>
                                    ⚠ I limiti sono diversi: comportamento asimmetrico
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Spiegazione concettuale */}
            <div
                style={{
                    marginTop: 12,
                    background: "#fef2f2",
                    borderRadius: 12,
                    padding: 12,
                    fontSize: 13,
                    color: "#991b1b",
                }}
            >
                <strong>Concetto:</strong> Un asintoto verticale in x = x₀ si ha quando la
                funzione diverge (tende a ±∞) avvicinandosi a x₀. Questo accade tipicamente
                quando il denominatore di una frazione tende a zero. I limiti destro e sinistro
                possono tendere entrambi a +∞, entrambi a -∞, oppure uno a +∞ e l'altro a -∞.
            </div>
        </div>
    );
}