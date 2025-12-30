/**
 * LimiteFinitoPiuMenoInfinito - Versione refactorizzata
 * Limite finito per x → ±∞ (asintoti orizzontali)
 *
 * FIX: ControlButton non supporta prop "style" (vedi components.tsx).
 * Layout: mobile / tablet / desktop.
 */

import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import {
    SVG_WIDTH,
    SVG_HEIGHT,
    createTransform,
    sampleFunction,
    generatePath,
    GridPattern,
    Axes,
    FunctionCurve,
    HorizontalLine,
    ApproachPoints,
    AnimatedPoint,
    ControlButton,
    FunctionSelector,
    ResultBox,
    NoteBox,
    ConceptBox,
    cardStyle,
    ApproachPoint,
} from "./components";

// ============ FUNZIONI CON ASINTOTI ORIZZONTALI ============

type FunctionDef = {
    id: string;
    name: string;
    expr: string;
    f: (x: number) => number;
    limitPlus: number | null;
    limitMinus: number | null;
    note?: string;
};

const FUNCTIONS: FunctionDef[] = [
    {
        id: "inv",
        name: "f(x) = 1/x",
        expr: "1/x",
        f: (x) => 1 / x,
        limitPlus: 0,
        limitMinus: 0,
        note: "Asintoto orizzontale y = 0",
    },
    {
        id: "inv-plus",
        name: "f(x) = 1/x + 2",
        expr: "1/x + 2",
        f: (x) => 1 / x + 2,
        limitPlus: 2,
        limitMinus: 2,
        note: "Asintoto orizzontale y = 2",
    },
    {
        id: "rational",
        name: "f(x) = (2x+1)/(x+3)",
        expr: "(2x+1)/(x+3)",
        f: (x) => (2 * x + 1) / (x + 3),
        limitPlus: 2,
        limitMinus: 2,
        note: "Funzione razionale con asintoto y = 2",
    },
    {
        id: "arctan",
        name: "f(x) = arctan(x)",
        expr: "arctan(x)",
        f: (x) => Math.atan(x),
        limitPlus: Math.PI / 2,
        limitMinus: -Math.PI / 2,
        note: "Limiti diversi: π/2 e -π/2",
    },
    {
        id: "exp-neg",
        name: "f(x) = e⁻ˣ²",
        expr: "e⁻ˣ²",
        f: (x) => Math.exp(-x * x),
        limitPlus: 0,
        limitMinus: 0,
        note: "Gaussiana: tende a 0 da entrambi i lati",
    },
    {
        id: "rational2",
        name: "f(x) = x/(x²+1)",
        expr: "x/(x²+1)",
        f: (x) => x / (x * x + 1),
        limitPlus: 0,
        limitMinus: 0,
        note: "Tende a 0 ma con segni opposti",
    },
];

// ============ HOOK RESPONSIVE (mobile/tablet/desktop) ============

function useViewport() {
    const [w, setW] = useState<number>(() =>
        typeof window !== "undefined" ? window.innerWidth : 1200
    );

    useEffect(() => {
        const onResize = () => setW(window.innerWidth);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const isMobile = w < 640;
    const isTablet = w >= 640 && w < 1024;
    const isDesktop = w >= 1024;

    return { w, isMobile, isTablet, isDesktop };
}

// ============ COMPONENTE PRINCIPALE ============

export default function LimiteFinitoPiuMenoInfinito() {
    const { isMobile, isTablet, isDesktop } = useViewport();

    const [selectedFunc, setSelectedFunc] = useState<FunctionDef>(FUNCTIONS[0]);
    const [showPoints, setShowPoints] = useState(true);
    const [animating, setAnimating] = useState(false);
    const [animX, setAnimX] = useState<number | null>(null);
    const [manualX, setManualX] = useState<number | null>(null);
    const [manualMode, setManualMode] = useState(false);
    const [direction, setDirection] = useState<"plus" | "minus">("plus");

    // Range esteso per vedere comportamento all'infinito
    const xMin = -25,
        xMax = 25;

    // Campionamento
    const samples = useMemo(
        () => sampleFunction(selectedFunc.f, xMin, xMax, 500),
        [selectedFunc, xMin, xMax]
    );

    // Range Y dinamico ma contenuto
    const yMin = useMemo(() => {
        const ys = samples.map((p) => p.y).filter((y) => Math.abs(y) < 100);
        const minY = Math.min(...ys, selectedFunc.limitPlus ?? 0, selectedFunc.limitMinus ?? 0);
        return minY - 1;
    }, [samples, selectedFunc]);

    const yMax = useMemo(() => {
        const ys = samples.map((p) => p.y).filter((y) => Math.abs(y) < 100);
        const maxY = Math.max(...ys, selectedFunc.limitPlus ?? 0, selectedFunc.limitMinus ?? 0);
        return maxY + 1;
    }, [samples, selectedFunc]);

    const { toX, toY } = useMemo(
        () => createTransform(xMin, xMax, yMin, yMax),
        [xMin, xMax, yMin, yMax]
    );

    // Punti di avvicinamento
    const approachPlus = useMemo(() => {
        const pts: ApproachPoint[] = [];
        const positions = [xMax * 0.3, xMax * 0.5, xMax * 0.7, xMax * 0.85, xMax * 0.95];
        for (const x of positions) {
            const fx = selectedFunc.f(x);
            if (Number.isFinite(fx)) pts.push({ x, fx });
        }
        return pts;
    }, [selectedFunc, xMax]);

    const approachMinus = useMemo(() => {
        const pts: ApproachPoint[] = [];
        const positions = [xMin * 0.3, xMin * 0.5, xMin * 0.7, xMin * 0.85, xMin * 0.95];
        for (const x of positions) {
            const fx = selectedFunc.f(x);
            if (Number.isFinite(fx)) pts.push({ x, fx });
        }
        return pts;
    }, [selectedFunc, xMin]);

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
        const duration = 4000;

        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const t = Math.min(1, (timestamp - startTime) / duration);

            if (direction === "plus") {
                setAnimX(t * xMax * 0.95);
            } else {
                setAnimX(-t * Math.abs(xMin) * 0.95);
            }

            if (t >= 1) {
                setAnimating(false);
                return;
            }
            animRef.current = requestAnimationFrame(step);
        };

        animRef.current = requestAnimationFrame(step);
        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, [animating, direction, xMin, xMax]);

    // Punto attivo
    const activeX = manualMode && manualX !== null ? manualX : animX;
    const activeY = activeX !== null ? selectedFunc.f(activeX) : null;

    // Cambio funzione
    const handleFuncSelect = useCallback((id: string) => {
        const f = FUNCTIONS.find((fn) => fn.id === id);
        if (f) {
            setSelectedFunc(f);
            setAnimating(false);
            setManualMode(false);
            setManualX(null);
        }
    }, []);

    const toggleManual = useCallback(() => {
        setManualMode((m) => {
            const next = !m;
            if (next) setManualX(10);
            return next;
        });
        setAnimating(false);
    }, []);

    const formatLimit = (val: number | null) => {
        if (val === null) return "non esiste";
        if (val === Math.PI / 2) return "π/2 ≈ 1.571";
        if (val === -Math.PI / 2) return "-π/2 ≈ -1.571";
        return val.toFixed(4);
    };

    // ============ STILI LAYOUT ============

    const pageWrap: React.CSSProperties = {
        maxWidth: 1100,
        margin: "0 auto",
        padding: 16,
    };

    const topBar: React.CSSProperties = {
        display: "flex",
        justifyContent: "space-between",
        alignItems: isMobile ? "stretch" : "center",
        marginBottom: 12,
        flexWrap: "wrap",
        gap: 8,
    };

    const controlsRow: React.CSSProperties = {
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        alignItems: "center",
        width: isMobile ? "100%" : "auto",
    };

    // Wrapper per rendere i ControlButton “larghi” su mobile/tablet
    const btnWrap: React.CSSProperties = isMobile
        ? { width: "100%" }
        : isTablet
            ? { flex: 1, minWidth: 160 }
            : {};

    const bottomGrid: React.CSSProperties = isDesktop
        ? { display: "grid", gridTemplateColumns: "220px 1fr 1fr", gap: 12, marginTop: 12 }
        : isTablet
            ? { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }
            : { display: "grid", gridTemplateColumns: "1fr", gap: 12, marginTop: 12 };

    // In tablet: metto il selettore funzione a tutta larghezza sopra
    const functionPanelStyle: React.CSSProperties = isTablet
        ? { gridColumn: "1 / -1" }
        : {};

    return (
        <div style={pageWrap}>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
                Limite finito per x → ±∞
            </h1>
            <p style={{ color: "#475569", marginBottom: 12 }}>
                Studia il comportamento di funzioni con <strong>asintoti orizzontali</strong>: quando x tende a ±∞, f(x)
                tende a un valore finito L.
            </p>

            {/* Canvas principale */}
            <div style={cardStyle}>
                <div style={topBar}>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>Grafico di {selectedFunc.name}</div>

                    <div style={controlsRow}>
                        <select
                            value={direction}
                            onChange={(e) => setDirection(e.target.value as "plus" | "minus")}
                            style={{
                                padding: "6px 10px",
                                borderRadius: 8,
                                border: "1px solid #cbd5e1",
                                width: isMobile ? "100%" : "auto",
                            }}
                        >
                            <option value="plus">Verso +∞</option>
                            <option value="minus">Verso -∞</option>
                        </select>

                        <div style={btnWrap}>
                            <ControlButton onClick={() => setAnimating(true)} disabled={animating}>
                                {animating ? "Animazione..." : "▶ Anima"}
                            </ControlButton>
                        </div>

                        <div style={btnWrap}>
                            <ControlButton onClick={toggleManual} active={manualMode}>
                                Manuale
                            </ControlButton>
                        </div>

                        <label
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                fontSize: 13,
                                width: isMobile ? "100%" : "auto",
                                padding: isMobile ? "6px 0" : 0,
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={showPoints}
                                onChange={(e) => setShowPoints(e.target.checked)}
                            />
                            Punti
                        </label>
                    </div>
                </div>

                <svg
                    viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                    style={{ width: "100%", height: "auto", maxHeight: isMobile ? "56vh" : "60vh" }}
                >
                    <GridPattern id="gridLimiteFin" />
                    <rect x={0} y={0} width={SVG_WIDTH} height={SVG_HEIGHT} fill="url(#gridLimiteFin)" />

                    <Axes xMin={xMin} xMax={xMax} yMin={yMin} yMax={yMax} toX={toX} toY={toY} />

                    {/* Asintoti orizzontali */}
                    {selectedFunc.limitPlus !== null && (
                        <HorizontalLine
                            y={selectedFunc.limitPlus}
                            toY={toY}
                            color="#10b981"
                            label={`L₊ = ${formatLimit(selectedFunc.limitPlus)}`}
                        />
                    )}
                    {selectedFunc.limitMinus !== null && selectedFunc.limitMinus !== selectedFunc.limitPlus && (
                        <HorizontalLine
                            y={selectedFunc.limitMinus}
                            toY={toY}
                            color="#f59e0b"
                            label={`L₋ = ${formatLimit(selectedFunc.limitMinus)}`}
                        />
                    )}

                    <FunctionCurve pathD={pathD} />

                    {showPoints && (
                        <>
                            <ApproachPoints points={approachPlus} toX={toX} toY={toY} color="#10b981" side="right" />
                            <ApproachPoints points={approachMinus} toX={toX} toY={toY} color="#f59e0b" side="left" />
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
                            x = {manualX?.toFixed(1) ?? 0}
                            <input
                                type="range"
                                min={xMin}
                                max={xMax}
                                step={0.5}
                                value={manualX ?? 0}
                                onChange={(e) => setManualX(parseFloat(e.target.value))}
                                style={{ width: "100%", marginTop: 4 }}
                            />
                        </label>
                    </div>
                )}
            </div>

            {/* Controlli in basso (3 layout) */}
            <div style={bottomGrid}>
                {/* Selezione funzione */}
                <div style={{ ...cardStyle, ...functionPanelStyle }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Funzione</div>
                    <FunctionSelector functions={FUNCTIONS} selected={selectedFunc.id} onSelect={handleFuncSelect} />
                </div>

                {/* Risultato */}
                <ResultBox title="Limiti all'infinito">
                    <div style={{ display: "grid", gap: 8 }}>
                        <div style={{ padding: 8, background: "#dcfce7", borderRadius: 8 }}>
                            <div style={{ fontSize: 12, color: "#166534" }}>Per x → +∞</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: "#10b981" }}>
                                lim = {formatLimit(selectedFunc.limitPlus)}
                            </div>
                        </div>
                        <div style={{ padding: 8, background: "#fef3c7", borderRadius: 8 }}>
                            <div style={{ fontSize: 12, color: "#92400e" }}>Per x → -∞</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: "#f59e0b" }}>
                                lim = {formatLimit(selectedFunc.limitMinus)}
                            </div>
                        </div>
                    </div>

                    {activeX !== null && activeY !== null && (
                        <div style={{ marginTop: 12, padding: 8, background: "#f0f4f8", borderRadius: 8, fontSize: 12 }}>
                            <div>x = {activeX.toFixed(2)}</div>
                            <div>f(x) = {activeY.toFixed(6)}</div>
                        </div>
                    )}
                </ResultBox>

                {/* Tabella valori */}
                <div style={cardStyle}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Valori per x grande</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11 }}>
                        <div>
                            <div style={{ fontWeight: 600, color: "#10b981", marginBottom: 4 }}>x → +∞</div>
                            {approachPlus.map((p, i) => (
                                <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span>{p.x.toFixed(1)}</span>
                                    <span>{p.fx.toFixed(4)}</span>
                                </div>
                            ))}
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, color: "#f59e0b", marginBottom: 4 }}>x → -∞</div>
                            {approachMinus.map((p, i) => (
                                <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span>{p.x.toFixed(1)}</span>
                                    <span>{p.fx.toFixed(4)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <ConceptBox>
                Il limite per x → ±∞ è <strong>finito</strong> quando f(x) si avvicina a un valore L. La retta y = L è un{" "}
                <strong>asintoto orizzontale</strong>. I limiti per x → +∞ e x → -∞ possono essere uguali o diversi.
            </ConceptBox>
        </div>
    );
}
