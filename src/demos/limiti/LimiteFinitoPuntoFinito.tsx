/**
 * LimiteFinitoPuntoFinito - Versione refactorizzata
 * Limite finito per x → x₀ finito (3 layout: mobile/tablet/desktop)
 */

import React, { useMemo, useState, useEffect, useRef } from "react";
import {
    SVG_WIDTH, SVG_HEIGHT,
    clamp, createTransform, sampleFunction, calculateYRange, generatePath,
    GridPattern, Axes, FunctionCurve, VerticalLine, HorizontalLine,
    ApproachPoints, AnimatedPoint, LimitPoint,
    ControlButton, FunctionSelector, ApproachTable, ResultBox, NoteBox, ConceptBox,
    cardStyle, ApproachPoint
} from "./components";

// ============ FUNZIONI PREDEFINITE ============

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
    { id: "quad", name: "f(x) = x²", expr: "x²", f: (x) => x * x, x0Default: 2, limitValue: (x0) => x0 * x0 },
    { id: "sin", name: "f(x) = sin(x)", expr: "sin(x)", f: (x) => Math.sin(x), x0Default: Math.PI / 2, limitValue: (x0) => Math.sin(x0) },
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
    { id: "cubic", name: "f(x) = x³ - 2x", expr: "x³ - 2x", f: (x) => x * x * x - 2 * x, x0Default: 1, limitValue: (x0) => x0 * x0 * x0 - 2 * x0 },
    { id: "exp", name: "f(x) = eˣ", expr: "eˣ", f: (x) => Math.exp(x), domain: { min: -3, max: 3 }, x0Default: 0, limitValue: (x0) => Math.exp(x0) },
];

// ============ HOOK viewport (3 layout) ============

function useViewportWidth() {
    const [w, setW] = useState<number>(() => (typeof window !== "undefined" ? window.innerWidth : 1200));
    useEffect(() => {
        const onResize = () => setW(window.innerWidth);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);
    return w;
}

// ============ COMPONENTE PRINCIPALE ============

export default function LimiteFinitoPuntoFinito() {
    const vw = useViewportWidth();
    const isMobile = vw < 640;
    const isTablet = vw >= 640 && vw < 1024;
    const isDesktop = vw >= 1024;

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

    // Campionamento e range
    const samples = useMemo(() => sampleFunction(selectedFunc.f, xMin, xMax, 400), [selectedFunc, xMin, xMax]);
    const { yMin, yMax } = useMemo(() => calculateYRange(samples), [samples]);
    const { toX, toY } = useMemo(() => createTransform(xMin, xMax, yMin, yMax), [xMin, xMax, yMin, yMax]);

    // Limite e avvicinamenti
    const limitValue = selectedFunc.limitValue(x0Clamped);

    const leftApproach = useMemo(() => {
        const vals: ApproachPoint[] = [];
        const delta = 0.1;
        for (let i = 5; i >= 1; i--) {
            const x = x0Clamped - (delta * i) / 5;
            const fx = selectedFunc.f(x);
            if (Number.isFinite(fx)) vals.push({ x, fx });
        }
        return vals;
    }, [selectedFunc, x0Clamped]);

    const rightApproach = useMemo(() => {
        const vals: ApproachPoint[] = [];
        const delta = 0.1;
        for (let i = 1; i <= 5; i++) {
            const x = x0Clamped + (delta * i) / 5;
            const fx = selectedFunc.f(x);
            if (Number.isFinite(fx)) vals.push({ x, fx });
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

        let direction: "left" | "right" = "left";
        let startTime: number | null = null;
        const duration = 2500;

        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const t = Math.min(1, (timestamp - startTime) / duration);

            if (direction === "left") {
                const xStart = Math.max(xMin, x0Clamped - 2);
                setAnimX(xStart + t * (x0Clamped - xStart - 0.01));
                if (t >= 1) {
                    direction = "right";
                    startTime = timestamp;
                }
            } else {
                const xStart = Math.min(xMax, x0Clamped + 2);
                setAnimX(xStart - t * (xStart - x0Clamped - 0.01));
                if (t >= 1) {
                    setAnimating(false);
                    return;
                }
            }
            animRef.current = requestAnimationFrame(step);
        };

        animRef.current = requestAnimationFrame(step);
        return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
    }, [animating, x0Clamped, xMin, xMax]);

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

    const toggleManual = () => {
        setManualMode((m) => {
            const next = !m;
            if (next) {
                setManualX(x0Clamped - 1);
                setAnimating(false);
            }
            return next;
        });
    };

    // ============ STILI RESPONSIVE ============

    const headerControlsStyle: React.CSSProperties = {
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        alignItems: "center",
        ...(isMobile ? { width: "100%", flexDirection: "column", alignItems: "stretch" } : {}),
    };

    const btnFull: React.CSSProperties | undefined = isMobile ? { width: "100%", justifyContent: "center" } : undefined;

    const bottomGridStyle: React.CSSProperties = {
        display: "grid",
        gap: 12,
        marginTop: 12,
        ...(isDesktop
            ? { gridTemplateColumns: "200px 1fr 1fr" }
            : isTablet
                ? { gridTemplateColumns: "1fr 1fr" }
                : { gridTemplateColumns: "1fr" }),
    };

    const functionPanelStyle: React.CSSProperties =
        isTablet ? { gridColumn: "1 / -1" } : {};

    return (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
                Limite finito per x → x₀ finito
            </h1>
            <p style={{ color: "#475569", marginBottom: 12 }}>
                Studia il comportamento di una funzione quando x si avvicina a un punto x₀.
                Il limite è <strong>finito</strong> quando f(x) tende a un valore L finito.
            </p>

            {/* Canvas grande sopra */}
            <div style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>Grafico di {selectedFunc.name}</div>

                    <div style={headerControlsStyle}>
                        <ControlButton
                            onClick={() => setAnimating(true)}
                            disabled={animating}
                            style={btnFull}
                        >
                            {animating ? "Animazione..." : "▶ Anima"}
                        </ControlButton>

                        <ControlButton
                            onClick={toggleManual}
                            active={manualMode}
                            style={btnFull}
                        >
                            {manualMode ? "Manuale ON" : "Manuale"}
                        </ControlButton>

                        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, ...(isMobile ? { width: "100%", justifyContent: "flex-start" } : {}) }}>
                            <input type="checkbox" checked={showLeftRight} onChange={(e) => setShowLeftRight(e.target.checked)} />
                            Limiti dx/sx
                        </label>
                    </div>
                </div>

                <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} style={{ width: "100%", height: "auto", maxHeight: isMobile ? "55vh" : "60vh" }}>
                    <GridPattern id="gridLimite" />
                    <rect x={0} y={0} width={SVG_WIDTH} height={SVG_HEIGHT} fill="url(#gridLimite)" />

                    <Axes xMin={xMin} xMax={xMax} yMin={yMin} yMax={yMax} toX={toX} toY={toY} />

                    <VerticalLine x={x0Clamped} toX={toX} color="#ef4444" label={`x₀ = ${x0Clamped.toFixed(2)}`} />
                    {Number.isFinite(limitValue) && (
                        <HorizontalLine y={limitValue} toY={toY} color="#10b981" label={`L = ${limitValue.toFixed(3)}`} />
                    )}

                    <FunctionCurve pathD={pathD} />

                    {Number.isFinite(limitValue) && <LimitPoint x={x0Clamped} y={limitValue} toX={toX} toY={toY} />}

                    {showLeftRight && (
                        <>
                            <ApproachPoints points={leftApproach} toX={toX} toY={toY} color="#f97316" side="left" />
                            <ApproachPoints points={rightApproach} toX={toX} toY={toY} color="#8b5cf6" side="right" />
                        </>
                    )}

                    {activeX !== null && activeY !== null && Number.isFinite(activeY) && (
                        <AnimatedPoint x={activeX} y={activeY} toX={toX} toY={toY} />
                    )}
                </svg>

                {selectedFunc.note && <NoteBox note={selectedFunc.note} />}

                {/* Slider manuale */}
                {manualMode && (
                    <div style={{ marginTop: 12, padding: 12, background: "#f0f9ff", borderRadius: 8 }}>
                        <label style={{ fontSize: 13 }}>
                            x = {manualX?.toFixed(3) ?? x0Clamped.toFixed(3)}
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

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: isMobile ? "repeat(3, 1fr)" : "repeat(6, 1fr)",
                                gap: 6,
                                marginTop: 8,
                            }}
                        >
                            {[-0.5, -0.1, -0.01, 0.01, 0.1, 0.5].map((delta) => (
                                <button
                                    key={delta}
                                    onClick={() => setManualX(x0Clamped + delta)}
                                    style={{
                                        padding: 6,
                                        borderRadius: 6,
                                        border: "1px solid #3b82f6",
                                        background: "#fff",
                                        fontSize: 11,
                                        cursor: "pointer",
                                    }}
                                >
                                    {delta > 0 ? "+" : ""}{delta}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Sotto: 3 layout */}
            <div style={bottomGridStyle}>
                {/* Selezione funzione */}
                <div style={{ ...cardStyle, ...(functionPanelStyle as any) }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Funzione</div>
                    <FunctionSelector functions={FUNCTIONS} selected={selectedFunc.id} onSelect={handleFuncSelect} />

                    <div style={{ marginTop: 12 }}>
                        <label style={{ fontSize: 13 }}>
                            x₀ = {x0Clamped.toFixed(2)}
                            <input
                                type="range"
                                min={xMin + 0.5}
                                max={xMax - 0.5}
                                step={0.1}
                                value={x0}
                                onChange={(e) => setX0(parseFloat(e.target.value))}
                                style={{ width: "100%", marginTop: 4 }}
                            />
                        </label>
                    </div>
                </div>

                {/* Risultato */}
                <ResultBox title="Risultato del limite">
                    <div style={{ marginBottom: 6 }}>
                        lim<sub style={{ fontSize: 11 }}>x → {x0Clamped.toFixed(2)}</sub> {selectedFunc.expr} ={" "}
                        <strong style={{ color: "#059669", fontSize: 16 }}>
                            {Number.isFinite(limitValue) ? limitValue.toFixed(4) : "non definito"}
                        </strong>
                    </div>

                    {showLeftRight && (
                        <>
                            <div style={{ fontSize: 12, color: "#f97316" }}>
                                • Da sinistra (x → x₀⁻): {leftApproach.length > 0 ? leftApproach[leftApproach.length - 1].fx.toFixed(4) : "—"}
                            </div>
                            <div style={{ fontSize: 12, color: "#8b5cf6" }}>
                                • Da destra (x → x₀⁺): {rightApproach.length > 0 ? rightApproach[0].fx.toFixed(4) : "—"}
                            </div>
                        </>
                    )}

                    {activeX !== null && activeY !== null && (
                        <div style={{ marginTop: 12, padding: 8, background: "#fef3c7", borderRadius: 8, fontSize: 12 }}>
                            <div>x = {activeX.toFixed(4)}</div>
                            <div>f(x) = {Number.isFinite(activeY) ? activeY.toFixed(4) : "non definito"}</div>
                            <div>|x - x₀| = {Math.abs(activeX - x0Clamped).toFixed(4)}</div>
                        </div>
                    )}
                </ResultBox>

                {/* Tabella */}
                {showTable ? (
                    <ApproachTable
                        leftPoints={leftApproach}
                        rightPoints={rightApproach}
                        x0={x0Clamped}
                        limitValue={limitValue}
                        onClose={() => setShowTable(false)}
                    />
                ) : (
                    <div style={cardStyle}>
                        <button
                            onClick={() => setShowTable(true)}
                            style={{
                                width: "100%",
                                padding: "10px 12px",
                                borderRadius: 10,
                                border: "1px solid #cbd5e1",
                                background: "#fff",
                                cursor: "pointer",
                                fontWeight: 600,
                            }}
                        >
                            Mostra tabella
                        </button>
                    </div>
                )}
            </div>

            <ConceptBox>
                Il limite finito per x → x₀ finito esiste quando, avvicinandosi a x₀ da sinistra e da destra,
                i valori di f(x) si avvicinano allo stesso numero L. Formalmente: ∀ε {">"} 0, ∃δ {">"} 0 tale che
                se |x - x₀| {"<"} δ allora |f(x) - L| {"<"} ε.
            </ConceptBox>
        </div>
    );
}
