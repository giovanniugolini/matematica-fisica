/**
 * IntervalliRDemo - Versione refactorizzata
 * Visualizzazione interattiva di intervalli sulla retta reale
 * con pallina che rimbalza sugli estremi
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { DemoContainer } from "../../components/ui";

// ============ TIPI ============

type IntervalType = {
    id: string;
    notation: string;
    name: string;
    hasA: boolean;
    hasB: boolean;
    includesA: boolean;
    includesB: boolean;
    bounded: "both" | "left" | "right" | "none";
};

const INTERVAL_TYPES: IntervalType[] = [
    { id: "closed", notation: "[a, b]", name: "Chiuso", hasA: true, hasB: true, includesA: true, includesB: true, bounded: "both" },
    { id: "open", notation: "(a, b)", name: "Aperto", hasA: true, hasB: true, includesA: false, includesB: false, bounded: "both" },
    { id: "leftOpen", notation: "(a, b]", name: "Aperto a sinistra", hasA: true, hasB: true, includesA: false, includesB: true, bounded: "both" },
    { id: "rightOpen", notation: "[a, b)", name: "Aperto a destra", hasA: true, hasB: true, includesA: true, includesB: false, bounded: "both" },
    { id: "rayRightClosed", notation: "[a, +∞)", name: "Semiretta destra chiusa", hasA: true, hasB: false, includesA: true, includesB: false, bounded: "left" },
    { id: "rayRightOpen", notation: "(a, +∞)", name: "Semiretta destra aperta", hasA: true, hasB: false, includesA: false, includesB: false, bounded: "left" },
    { id: "rayLeftClosed", notation: "(-∞, b]", name: "Semiretta sinistra chiusa", hasA: false, hasB: true, includesA: false, includesB: true, bounded: "right" },
    { id: "rayLeftOpen", notation: "(-∞, b)", name: "Semiretta sinistra aperta", hasA: false, hasB: true, includesA: false, includesB: false, bounded: "right" },
    { id: "whole", notation: "(-∞, +∞)", name: "Retta reale ℝ", hasA: false, hasB: false, includesA: false, includesB: false, bounded: "none" },
];

// ============ COMPONENTE PRINCIPALE ============

export default function IntervalliRDemo() {
    const [intervalType, setIntervalType] = useState<IntervalType>(INTERVAL_TYPES[0]);
    const [a, setA] = useState(-3);
    const [b, setB] = useState(4);
    const [speed, setSpeed] = useState(0.8);
    const [playing, setPlaying] = useState(true);

    // Posizione pallina
    const [ballX, setBallX] = useState(0);
    const [direction, setDirection] = useState<1 | -1>(1);
    const lastTimeRef = useRef<number | null>(null);

    // Geometria linea
    const lineRef = useRef<HTMLDivElement>(null);
    const [lineWidth, setLineWidth] = useState(600);

    useEffect(() => {
        const updateWidth = () => {
            if (lineRef.current) setLineWidth(lineRef.current.offsetWidth);
        };
        updateWidth();
        window.addEventListener("resize", updateWidth);
        return () => window.removeEventListener("resize", updateWidth);
    }, []);

    // Range visuale
    const view = useMemo(() => {
        let minX: number, maxX: number;
        if (intervalType.bounded === "both") {
            const pad = Math.max(2, (b - a) * 0.3);
            minX = a - pad;
            maxX = b + pad;
        } else if (intervalType.bounded === "left") {
            minX = a - 3;
            maxX = a + 12;
        } else if (intervalType.bounded === "right") {
            minX = b - 12;
            maxX = b + 3;
        } else {
            minX = -8;
            maxX = 8;
        }
        const scale = (lineWidth - 60) / (maxX - minX);
        const toPx = (x: number) => 30 + (x - minX) * scale;
        const fromPx = (px: number) => minX + (px - 30) / scale;
        return { minX, maxX, scale, toPx, fromPx };
    }, [lineWidth, intervalType, a, b]);

    // Reset pallina quando cambia intervallo
    useEffect(() => {
        let startX = 0;
        if (intervalType.hasA && intervalType.hasB) startX = (a + b) / 2;
        else if (intervalType.hasA) startX = a + 2;
        else if (intervalType.hasB) startX = b - 2;
        setBallX(startX);
        setDirection(1);
    }, [intervalType, a, b]);

    // Animazione pallina
    useEffect(() => {
        if (!playing) { lastTimeRef.current = null; return; }

        let raf: number;
        const tick = (t: number) => {
            if (!lastTimeRef.current) lastTimeRef.current = t;
            const dt = t - lastTimeRef.current;
            lastTimeRef.current = t;

            const velocity = speed / view.scale;
            let newX = ballX + direction * velocity * dt;

            const lowerBound = intervalType.hasA ? a : -Infinity;
            const upperBound = intervalType.hasB ? b : Infinity;

            // Rimbalzo o wrap
            if (newX <= lowerBound && Number.isFinite(lowerBound)) {
                newX = lowerBound;
                setDirection(1);
            } else if (newX >= upperBound && Number.isFinite(upperBound)) {
                newX = upperBound;
                setDirection(-1);
            } else if (!Number.isFinite(upperBound) && newX > view.maxX + 2) {
                newX = view.minX - 1;
            } else if (!Number.isFinite(lowerBound) && newX < view.minX - 2) {
                newX = view.maxX + 1;
            }

            setBallX(newX);
            raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [playing, speed, view, ballX, direction, intervalType, a, b]);

    // Proprietà matematiche
    const properties = useMemo(() => {
        const lowerBounded = intervalType.bounded === "both" || intervalType.bounded === "left";
        const upperBounded = intervalType.bounded === "both" || intervalType.bounded === "right";
        const inf = lowerBounded ? a : "-∞";
        const sup = upperBounded ? b : "+∞";
        const hasMin = lowerBounded && intervalType.includesA;
        const hasMax = upperBounded && intervalType.includesB;
        return { lowerBounded, upperBounded, inf, sup, hasMin, hasMax };
    }, [intervalType, a, b]);

    // Stili
    const cardStyle: React.CSSProperties = { background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" };

    return (
        <DemoContainer
            title="Intervalli sulla retta reale"
            description="Visualizza intervalli aperti, chiusi e semirette. La pallina rimbalza sugli estremi inclusi."
        >
            {/* Selezione intervallo - cards cliccabili */}
            <div style={cardStyle}>
                <div style={{ fontWeight: 600, marginBottom: 12 }}>Tipo di intervallo</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
                    {INTERVAL_TYPES.map(type => (
                        <button
                            key={type.id}
                            onClick={() => setIntervalType(type)}
                            style={{
                                padding: "10px 12px",
                                borderRadius: 8,
                                border: intervalType.id === type.id ? "2px solid #3b82f6" : "1px solid #e5e7eb",
                                background: intervalType.id === type.id ? "#dbeafe" : "#fff",
                                cursor: "pointer",
                                textAlign: "left"
                            }}
                        >
                            <div style={{ fontWeight: 600, fontSize: 16, fontFamily: "monospace" }}>{type.notation}</div>
                            <div style={{ fontSize: 11, color: "#6b7280" }}>{type.name}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Visualizzazione intervallo */}
            <div ref={lineRef} style={{ ...cardStyle, marginTop: 16, position: "relative", height: 140, overflow: "hidden" }}>
                {/* Linea base */}
                <div style={{ position: "absolute", left: 30, right: 30, top: "50%", height: 3, background: "#374151", borderRadius: 2 }} />

                {/* Frecce infinito */}
                {!properties.lowerBounded && (
                    <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 20 }}>←</div>
                )}
                {!properties.upperBounded && (
                    <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 20 }}>→</div>
                )}

                {/* Zona colorata dell'intervallo */}
                {(() => {
                    const leftPx = intervalType.hasA ? view.toPx(a) : 30;
                    const rightPx = intervalType.hasB ? view.toPx(b) : lineWidth - 30;
                    return (
                        <div style={{
                            position: "absolute",
                            left: leftPx,
                            width: rightPx - leftPx,
                            top: "calc(50% - 15px)",
                            height: 30,
                            background: "rgba(59, 130, 246, 0.15)",
                            borderRadius: 4
                        }} />
                    );
                })()}

                {/* Estremo a */}
                {intervalType.hasA && (
                    <div style={{ position: "absolute", left: view.toPx(a), top: "50%", transform: "translate(-50%, -50%)" }}>
                        <div style={{
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            border: "3px solid #3b82f6",
                            background: intervalType.includesA ? "#3b82f6" : "#fff"
                        }} />
                        <div style={{ position: "absolute", top: 24, left: "50%", transform: "translateX(-50%)", fontSize: 13, fontWeight: 600 }}>
                            a={a}
                        </div>
                        {properties.hasMin && (
                            <div style={{ position: "absolute", top: 42, left: "50%", transform: "translateX(-50%)", fontSize: 11, color: "#059669", whiteSpace: "nowrap" }}>
                                = min
                            </div>
                        )}
                    </div>
                )}

                {/* Estremo b */}
                {intervalType.hasB && (
                    <div style={{ position: "absolute", left: view.toPx(b), top: "50%", transform: "translate(-50%, -50%)" }}>
                        <div style={{
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            border: "3px solid #f59e0b",
                            background: intervalType.includesB ? "#f59e0b" : "#fff"
                        }} />
                        <div style={{ position: "absolute", top: 24, left: "50%", transform: "translateX(-50%)", fontSize: 13, fontWeight: 600 }}>
                            b={b}
                        </div>
                        {properties.hasMax && (
                            <div style={{ position: "absolute", top: 42, left: "50%", transform: "translateX(-50%)", fontSize: 11, color: "#059669", whiteSpace: "nowrap" }}>
                                = max
                            </div>
                        )}
                    </div>
                )}

                {/* Pallina */}
                <div style={{
                    position: "absolute",
                    left: view.toPx(ballX),
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "#ef4444",
                    boxShadow: "0 2px 8px rgba(239, 68, 68, 0.4)",
                    transition: playing ? "none" : "left 0.1s"
                }} />

                {/* Scala numerica */}
                <div style={{ position: "absolute", bottom: 8, left: 30, right: 30, display: "flex", justifyContent: "space-between", fontSize: 10, color: "#9ca3af" }}>
                    <span>{view.minX.toFixed(0)}</span>
                    <span>0</span>
                    <span>{view.maxX.toFixed(0)}</span>
                </div>
            </div>

            {/* Controlli e proprietà */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 16 }}>
                {/* Valori estremi */}
                <div style={cardStyle}>
                    <div style={{ fontWeight: 600, marginBottom: 12 }}>Estremi</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div>
                            <label style={{ fontSize: 12, color: "#6b7280" }}>a =</label>
                            <input
                                type="number"
                                value={a}
                                step={0.5}
                                onChange={e => setA(Math.min(+e.target.value, b - 1))}
                                disabled={!intervalType.hasA}
                                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #d1d5db", marginTop: 4 }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: 12, color: "#6b7280" }}>b =</label>
                            <input
                                type="number"
                                value={b}
                                step={0.5}
                                onChange={e => setB(Math.max(+e.target.value, a + 1))}
                                disabled={!intervalType.hasB}
                                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #d1d5db", marginTop: 4 }}
                            />
                        </div>
                    </div>
                </div>

                {/* Controlli animazione */}
                <div style={cardStyle}>
                    <div style={{ fontWeight: 600, marginBottom: 12 }}>Animazione</div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                        <button
                            onClick={() => setPlaying(!playing)}
                            style={{
                                flex: 1,
                                padding: "10px 16px",
                                borderRadius: 8,
                                border: "none",
                                background: playing ? "#ef4444" : "#22c55e",
                                color: "#fff",
                                cursor: "pointer",
                                fontWeight: 600
                            }}
                        >
                            {playing ? "⏸ Pausa" : "▶ Play"}
                        </button>
                    </div>
                    <label style={{ fontSize: 12, color: "#6b7280" }}>
                        Velocità
                        <input
                            type="range"
                            min={0.2}
                            max={2}
                            step={0.1}
                            value={speed}
                            onChange={e => setSpeed(+e.target.value)}
                            style={{ width: "100%", marginTop: 4 }}
                        />
                    </label>
                </div>

                {/* Proprietà */}
                <div style={{ ...cardStyle, background: "#f8fafc" }}>
                    <div style={{ fontWeight: 600, marginBottom: 12 }}>Proprietà</div>
                    <div style={{ fontSize: 13, display: "grid", gap: 6 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>Limitato inf.:</span>
                            <strong style={{ color: properties.lowerBounded ? "#059669" : "#dc2626" }}>{properties.lowerBounded ? "Sì" : "No"}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>Limitato sup.:</span>
                            <strong style={{ color: properties.upperBounded ? "#059669" : "#dc2626" }}>{properties.upperBounded ? "Sì" : "No"}</strong>
                        </div>
                        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 6, marginTop: 4 }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span>inf =</span>
                                <strong>{properties.inf}</strong>
                                {properties.hasMin && <span style={{ color: "#059669", fontSize: 11 }}>(= min)</span>}
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span>sup =</span>
                                <strong>{properties.sup}</strong>
                                {properties.hasMax && <span style={{ color: "#059669", fontSize: 11 }}>(= max)</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Legenda */}
            <div style={{ marginTop: 16, background: "#eff6ff", borderRadius: 12, padding: 16, fontSize: 13, color: "#1e40af" }}>
                <strong>💡 Legenda:</strong>
                <ul style={{ margin: "8px 0 0 0", paddingLeft: 20 }}>
                    <li><strong>Punto pieno</strong> = estremo incluso (la pallina può toccarlo e rimbalza)</li>
                    <li><strong>Punto vuoto</strong> = estremo escluso (la pallina si avvicina ma non lo raggiunge mai)</li>
                    <li><strong>Frecce</strong> = intervallo illimitato (la pallina prosegue all'infinito)</li>
                    <li><strong>inf ≠ min</strong> quando l'estremo esiste ma non appartiene all'insieme</li>
                </ul>
            </div>
        </DemoContainer>
    );
}