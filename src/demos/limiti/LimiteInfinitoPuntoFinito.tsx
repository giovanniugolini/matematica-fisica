/**
 * LimiteInfinitoPuntoFinito - Versione refactorizzata
 * Limite infinito per x → x₀ finito (asintoti verticali)
 */

import React, { useMemo, useState, useEffect, useRef } from "react";
import {
    SVG_WIDTH, SVG_HEIGHT, PAD_L, PAD_R, PAD_T, PAD_B,
    clamp, createTransform, sampleFunction, generatePath,
    GridPattern, Axes, FunctionCurve, VerticalLine,
    ApproachPoints, AnimatedPoint,
    ControlButton, FunctionSelector, ResultBox, NoteBox, ConceptBox,
    cardStyle, ApproachPoint
} from "./components";

// ============ FUNZIONI CON ASINTOTI VERTICALI ============

type FunctionDef = {
    id: string;
    name: string;
    expr: string;
    f: (x: number) => number;
    x0Default: number;
    leftLimit: string;
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
        f: (x) => 1 / ((x - 1) * (x - 1)),
        x0Default: 1,
        leftLimit: "+∞",
        rightLimit: "+∞",
        note: "Asintoto verticale in x=1, sempre positivo",
    },
    {
        id: "neg-inv-square",
        name: "f(x) = -1/(x+1)²",
        expr: "-1/(x+1)²",
        f: (x) => -1 / ((x + 1) * (x + 1)),
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

// ============ COMPONENTE PRINCIPALE ============

export default function LimiteInfinitoPuntoFinito() {
    const [selectedFunc, setSelectedFunc] = useState<FunctionDef>(FUNCTIONS[0]);
    const [x0, setX0] = useState(selectedFunc.x0Default);
    const [showLeftRight, setShowLeftRight] = useState(true);
    const [animating, setAnimating] = useState(false);
    const [animX, setAnimX] = useState<number | null>(null);
    const [manualX, setManualX] = useState<number | null>(null);
    const [manualMode, setManualMode] = useState(false);
    const [approachDir, setApproachDir] = useState<"left" | "right">("left");

    // Range del grafico
    const xMin = -5, xMax = 5;
    const x0Clamped = clamp(x0, xMin + 0.5, xMax - 0.5);

    // Campionamento con clipping verticale per asintoti
    const samples = useMemo(() => {
        const yClip = 20;
        const pts = sampleFunction(selectedFunc.f, xMin, xMax, 500);
        return pts.filter(p => Math.abs(p.y) < yClip);
    }, [selectedFunc, xMin, xMax]);

    const yMin = -10, yMax = 10;
    const { toX, toY } = useMemo(() => createTransform(xMin, xMax, yMin, yMax), [xMin, xMax, yMin, yMax]);

    // Avvicinamenti
    const leftApproach = useMemo(() => {
        const vals: ApproachPoint[] = [];
        const deltas = [0.5, 0.2, 0.1, 0.05, 0.01];
        for (const d of deltas) {
            const x = x0Clamped - d;
            const fx = selectedFunc.f(x);
            if (Number.isFinite(fx) && Math.abs(fx) < 1000) vals.push({ x, fx });
        }
        return vals;
    }, [selectedFunc, x0Clamped]);

    const rightApproach = useMemo(() => {
        const vals: ApproachPoint[] = [];
        const deltas = [0.01, 0.05, 0.1, 0.2, 0.5];
        for (const d of deltas) {
            const x = x0Clamped + d;
            const fx = selectedFunc.f(x);
            if (Number.isFinite(fx) && Math.abs(fx) < 1000) vals.push({ x, fx });
        }
        return vals;
    }, [selectedFunc, x0Clamped]);

    // Path SVG
    const pathD = useMemo(() => generatePath(samples, toX, toY), [samples, toX, toY]);

    // Animazione
    const animRef = useRef<number | null>(null);
    useEffect(() => {
        if (!animating) {
            setAnimX(null);
            return;
        }

        let startTime: number | null = null;
        const duration = 3000;

        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const t = Math.min(1, (timestamp - startTime) / duration);

            // Avvicinamento esponenziale per effetto "rallentamento"
            const delta = 2 * Math.pow(1 - t, 2) + 0.01;

            if (approachDir === "left") {
                setAnimX(x0Clamped - delta);
            } else {
                setAnimX(x0Clamped + delta);
            }

            if (t >= 1) {
                setAnimating(false);
                return;
            }
            animRef.current = requestAnimationFrame(step);
        };

        animRef.current = requestAnimationFrame(step);
        return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
    }, [animating, x0Clamped, approachDir]);

    // Punto attivo
    const activeX = manualMode && manualX !== null ? manualX : animX;
    const activeY = activeX !== null ? selectedFunc.f(activeX) : null;

    // Cambio funzione
    const handleFuncSelect = (id: string) => {
        const f = FUNCTIONS.find(fn => fn.id === id);
        if (f) {
            setSelectedFunc(f);
            setX0(f.x0Default);
            setAnimating(false);
            setManualMode(false);
        }
    };

    return (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
                Limite infinito per x → x₀ finito
            </h1>
            <p style={{ color: "#475569", marginBottom: 12 }}>
                Studia il comportamento di funzioni con <strong>asintoti verticali</strong>:
                quando x si avvicina a x₀, f(x) tende a ±∞.
            </p>

            {/* Canvas principale */}
            <div style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>Grafico di {selectedFunc.name}</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                        <select
                            value={approachDir}
                            onChange={(e) => setApproachDir(e.target.value as "left" | "right")}
                            style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                        >
                            <option value="left">Da sinistra (x⁻)</option>
                            <option value="right">Da destra (x⁺)</option>
                        </select>
                        <ControlButton onClick={() => setAnimating(true)} disabled={animating}>
                            {animating ? "Animazione..." : "▶ Anima"}
                        </ControlButton>
                        <ControlButton onClick={() => { setManualMode(!manualMode); if (!manualMode) setManualX(x0Clamped - 0.5); }} active={manualMode}>
                            Manuale
                        </ControlButton>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                            <input type="checkbox" checked={showLeftRight} onChange={(e) => setShowLeftRight(e.target.checked)} />
                            Punti
                        </label>
                    </div>
                </div>

                <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} style={{ width: "100%", height: "auto", maxHeight: "60vh" }}>
                    <GridPattern id="gridLimiteInf" />
                    <rect x={0} y={0} width={SVG_WIDTH} height={SVG_HEIGHT} fill="url(#gridLimiteInf)" />

                    <Axes xMin={xMin} xMax={xMax} yMin={yMin} yMax={yMax} toX={toX} toY={toY} />

                    <VerticalLine x={x0Clamped} toX={toX} color="#ef4444" label={`x₀ = ${x0Clamped.toFixed(2)}`} />

                    <FunctionCurve pathD={pathD} />

                    {showLeftRight && (
                        <>
                            <ApproachPoints points={leftApproach} toX={toX} toY={toY} color="#f97316" side="left" />
                            <ApproachPoints points={rightApproach} toX={toX} toY={toY} color="#8b5cf6" side="right" />
                        </>
                    )}

                    {activeX !== null && activeY !== null && Number.isFinite(activeY) && Math.abs(activeY) < 50 && (
                        <AnimatedPoint x={activeX} y={activeY} toX={toX} toY={toY} />
                    )}

                    {/* Frecce indicanti ±∞ */}
                    <text x={toX(x0Clamped) - 20} y={PAD_T + 20} fontSize={14} fill="#f97316" fontWeight={600}>
                        {selectedFunc.leftLimit}
                    </text>
                    <text x={toX(x0Clamped) + 10} y={PAD_T + 20} fontSize={14} fill="#8b5cf6" fontWeight={600}>
                        {selectedFunc.rightLimit}
                    </text>
                </svg>

                {selectedFunc.note && <NoteBox note={selectedFunc.note} />}

                {/* Slider manuale */}
                {manualMode && (
                    <div style={{ marginTop: 12, padding: 12, background: "#f0f9ff", borderRadius: 8 }}>
                        <label style={{ fontSize: 13 }}>
                            x = {manualX?.toFixed(4) ?? x0Clamped.toFixed(4)}
                            <input
                                type="range"
                                min={xMin}
                                max={xMax}
                                step={0.01}
                                value={manualX ?? x0Clamped}
                                onChange={(e) => setManualX(parseFloat(e.target.value))}
                                style={{ width: "100%", marginTop: 4 }}
                            />
                        </label>
                        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                            {[-0.5, -0.1, -0.01, 0.01, 0.1, 0.5].map(delta => (
                                <button
                                    key={delta}
                                    onClick={() => setManualX(x0Clamped + delta)}
                                    style={{ flex: 1, padding: 4, borderRadius: 4, border: "1px solid #3b82f6", background: "#fff", fontSize: 11, cursor: "pointer" }}
                                >
                                    x₀{delta > 0 ? "+" : ""}{delta}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Controlli in basso */}
            <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 1fr", gap: 12, marginTop: 12 }}>
                {/* Selezione funzione */}
                <div style={cardStyle}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Funzione</div>
                    <FunctionSelector functions={FUNCTIONS} selected={selectedFunc.id} onSelect={handleFuncSelect} />
                </div>

                {/* Risultato */}
                <ResultBox title="Limiti laterali">
                    <div style={{ display: "grid", gap: 8 }}>
                        <div style={{ padding: 8, background: "#fff7ed", borderRadius: 8 }}>
                            <div style={{ fontSize: 12, color: "#9a3412" }}>Da sinistra (x → x₀⁻)</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: "#f97316" }}>
                                lim = {selectedFunc.leftLimit}
                            </div>
                        </div>
                        <div style={{ padding: 8, background: "#f5f3ff", borderRadius: 8 }}>
                            <div style={{ fontSize: 12, color: "#5b21b6" }}>Da destra (x → x₀⁺)</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: "#8b5cf6" }}>
                                lim = {selectedFunc.rightLimit}
                            </div>
                        </div>
                    </div>

                    {activeX !== null && activeY !== null && (
                        <div style={{ marginTop: 12, padding: 8, background: "#fef3c7", borderRadius: 8, fontSize: 12 }}>
                            <div>x = {activeX.toFixed(4)}</div>
                            <div>f(x) = {Number.isFinite(activeY) ? activeY.toFixed(4) : "±∞"}</div>
                            <div>|x - x₀| = {Math.abs(activeX - x0Clamped).toFixed(4)}</div>
                        </div>
                    )}
                </ResultBox>

                {/* Tabella avvicinamento */}
                <div style={cardStyle}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Valori di avvicinamento</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11 }}>
                        <div>
                            <div style={{ fontWeight: 600, color: "#f97316", marginBottom: 4 }}>Da sinistra</div>
                            {leftApproach.map((p, i) => (
                                <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span>{p.x.toFixed(3)}</span>
                                    <span>{p.fx.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, color: "#8b5cf6", marginBottom: 4 }}>Da destra</div>
                            {rightApproach.map((p, i) => (
                                <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span>{p.x.toFixed(3)}</span>
                                    <span>{p.fx.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <ConceptBox>
                Il limite è <strong>infinito</strong> quando, avvicinandosi a x₀, i valori di f(x) crescono
                (o decrescono) senza limite. La retta x = x₀ è un <strong>asintoto verticale</strong>.
                I limiti da sinistra e da destra possono essere diversi (+∞ o -∞).
            </ConceptBox>
        </div>
    );
}