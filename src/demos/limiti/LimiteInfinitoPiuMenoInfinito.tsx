/**
 * LimiteInfinitoPiuMenoInfinito - Versione refactorizzata
 * Limite infinito per x → ±∞ (3 layout: mobile/tablet/desktop)
 */

import React, { useMemo, useState, useEffect, useRef } from "react";
import {
    SVG_WIDTH, SVG_HEIGHT,
    clamp, createTransform, sampleFunction, generatePath,
    GridPattern, Axes, FunctionCurve,
    ApproachPoints, AnimatedPoint,
    ControlButton, FunctionSelector, ResultBox, NoteBox, ConceptBox,
    cardStyle, ApproachPoint
} from "./components";

// ============ FUNZIONI CHE DIVERGONO ============

type FunctionDef = {
    id: string;
    name: string;
    expr: string;
    f: (x: number) => number;
    limitPlus: string;
    limitMinus: string;
    note?: string;
};

const FUNCTIONS: FunctionDef[] = [
    { id: "x", name: "f(x) = x", expr: "x", f: (x) => x, limitPlus: "+∞", limitMinus: "-∞", note: "Funzione lineare: cresce/decresce linearmente" },
    { id: "x2", name: "f(x) = x²", expr: "x²", f: (x) => x * x, limitPlus: "+∞", limitMinus: "+∞", note: "Parabola: tende a +∞ da entrambi i lati" },
    { id: "x3", name: "f(x) = x³", expr: "x³", f: (x) => x * x * x, limitPlus: "+∞", limitMinus: "-∞", note: "Cubica: comportamento opposto agli estremi" },
    { id: "negx2", name: "f(x) = -x²", expr: "-x²", f: (x) => -(x * x), limitPlus: "-∞", limitMinus: "-∞", note: "Parabola rivolta verso il basso" },
    { id: "exp", name: "f(x) = eˣ", expr: "eˣ", f: (x) => Math.exp(clamp(x, -10, 10)), limitPlus: "+∞", limitMinus: "0", note: "Esponenziale: diverge a +∞, tende a 0 per x → -∞" },
    { id: "negexp", name: "f(x) = -eˣ", expr: "-eˣ", f: (x) => -Math.exp(clamp(x, -10, 10)), limitPlus: "-∞", limitMinus: "0", note: "Esponenziale negativo" },
    { id: "poly", name: "f(x) = x⁴ - 5x²", expr: "x⁴ - 5x²", f: (x) => x ** 4 - 5 * x * x, limitPlus: "+∞", limitMinus: "+∞", note: "Polinomio di grado pari: stesso comportamento" },
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

export default function LimiteInfinitoPiuMenoInfinito() {
    const vw = useViewportWidth();
    const isMobile = vw < 640;
    const isTablet = vw >= 640 && vw < 1024;
    const isDesktop = vw >= 1024;

    const [selectedFunc, setSelectedFunc] = useState<FunctionDef>(FUNCTIONS[0]);
    const [showPoints, setShowPoints] = useState(true);
    const [animating, setAnimating] = useState(false);
    const [animX, setAnimX] = useState<number | null>(null);
    const [manualX, setManualX] = useState<number | null>(null);
    const [manualMode, setManualMode] = useState(false);
    const [direction, setDirection] = useState<"plus" | "minus">("plus");

    const xMin = -10, xMax = 10;

    // Campionamento con clipping
    const samples = useMemo(() => {
        const pts = sampleFunction(selectedFunc.f, xMin, xMax, 400);
        return pts.filter(p => Math.abs(p.y) < 500);
    }, [selectedFunc, xMin, xMax]);

    // Range Y dinamico
    const yMin = useMemo(() => {
        const ys = samples.map(p => p.y);
        return Math.max(-50, Math.min(...ys) - 5);
    }, [samples]);

    const yMax = useMemo(() => {
        const ys = samples.map(p => p.y);
        return Math.min(50, Math.max(...ys) + 5);
    }, [samples]);

    const { toX, toY } = useMemo(
        () => createTransform(xMin, xMax, yMin, yMax),
        [xMin, xMax, yMin, yMax]
    );

    // Punti di avvicinamento
    const approachPlus = useMemo(() => {
        const pts: ApproachPoint[] = [];
        for (const x of [2, 4, 6, 8, 9.5]) {
            const fx = selectedFunc.f(x);
            if (Number.isFinite(fx) && Math.abs(fx) < 200) pts.push({ x, fx });
        }
        return pts;
    }, [selectedFunc]);

    const approachMinus = useMemo(() => {
        const pts: ApproachPoint[] = [];
        for (const x of [-2, -4, -6, -8, -9.5]) {
            const fx = selectedFunc.f(x);
            if (Number.isFinite(fx) && Math.abs(fx) < 200) pts.push({ x, fx });
        }
        return pts;
    }, [selectedFunc]);

    const pathD = useMemo(() => generatePath(samples, toX, toY), [samples, toX, toY]);

    // Animazione
    const animRef = useRef<number | null>(null);
    useEffect(() => {
        if (!animating) { setAnimX(null); return; }
        let startTime: number | null = null;
        const duration = 3000;

        const step = (ts: number) => {
            if (!startTime) startTime = ts;
            const t = Math.min(1, (ts - startTime) / duration);

            setAnimX(direction === "plus" ? t * xMax * 0.95 : -t * Math.abs(xMin) * 0.95);

            if (t >= 1) { setAnimating(false); return; }
            animRef.current = requestAnimationFrame(step);
        };

        animRef.current = requestAnimationFrame(step);
        return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
    }, [animating, direction, xMin, xMax]);

    const activeX = manualMode && manualX !== null ? manualX : animX;
    const activeY = activeX !== null ? selectedFunc.f(activeX) : null;

    const handleFuncSelect = (id: string) => {
        const f = FUNCTIONS.find(fn => fn.id === id);
        if (f) { setSelectedFunc(f); setAnimating(false); setManualMode(false); }
    };

    const getLimitColor = (limit: string) =>
        limit === "+∞" ? "#10b981" : limit === "-∞" ? "#ef4444" : "#f59e0b";

    // ===== layout styles =====

    const headerControlsStyle: React.CSSProperties = {
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        alignItems: "center",
        ...(isMobile ? { width: "100%", flexDirection: "column", alignItems: "stretch" } : {}),
    };

    const btnFull: React.CSSProperties | undefined =
        isMobile ? { width: "100%", justifyContent: "center" } : undefined;

    const bottomGridStyle: React.CSSProperties = {
        display: "grid",
        gap: 12,
        marginTop: 12,
        ...(isDesktop
            ? { gridTemplateColumns: "220px 1fr 1fr" }
            : isTablet
                ? { gridTemplateColumns: "1fr 1fr" }
                : { gridTemplateColumns: "1fr" }),
    };

    const functionPanelStyle: React.CSSProperties =
        isTablet ? { gridColumn: "1 / -1" } : {};

    return (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Limite infinito per x → ±∞</h1>
            <p style={{ color: "#475569", marginBottom: 12 }}>
                Funzioni che <strong>divergono</strong> quando x tende a ±∞. Non ci sono asintoti.
            </p>

            <div style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>Grafico di {selectedFunc.name}</div>

                    <div style={headerControlsStyle}>
                        <select
                            value={direction}
                            onChange={(e) => setDirection(e.target.value as "plus" | "minus")}
                            style={{
                                padding: "6px 10px",
                                borderRadius: 8,
                                border: "1px solid #cbd5e1",
                                ...(isMobile ? { width: "100%" } : {})
                            }}
                        >
                            <option value="plus">Verso +∞</option>
                            <option value="minus">Verso -∞</option>
                        </select>

                        <ControlButton
                            onClick={() => setAnimating(true)}
                            disabled={animating}
                            style={btnFull}
                        >
                            {animating ? "..." : "▶ Anima"}
                        </ControlButton>

                        <ControlButton
                            onClick={() => {
                                setManualMode(!manualMode);
                                if (!manualMode) setManualX(5);
                                if (!manualMode) setAnimating(false);
                            }}
                            active={manualMode}
                            style={btnFull}
                        >
                            Manuale
                        </ControlButton>

                        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, ...(isMobile ? { width: "100%" } : {}) }}>
                            <input type="checkbox" checked={showPoints} onChange={(e) => setShowPoints(e.target.checked)} /> Punti
                        </label>
                    </div>
                </div>

                <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} style={{ width: "100%", height: "auto", maxHeight: isMobile ? "55vh" : "60vh" }}>
                    <GridPattern id="gridInfInf" />
                    <rect x={0} y={0} width={SVG_WIDTH} height={SVG_HEIGHT} fill="url(#gridInfInf)" />

                    <Axes xMin={xMin} xMax={xMax} yMin={yMin} yMax={yMax} toX={toX} toY={toY} />
                    <FunctionCurve pathD={pathD} />

                    {showPoints && (
                        <>
                            <ApproachPoints points={approachPlus} toX={toX} toY={toY} color="#10b981" side="right" />
                            <ApproachPoints points={approachMinus} toX={toX} toY={toY} color="#f59e0b" side="left" />
                        </>
                    )}

                    {activeX !== null && activeY !== null && Number.isFinite(activeY) && Math.abs(activeY) < 100 && (
                        <AnimatedPoint x={activeX} y={activeY} toX={toX} toY={toY} />
                    )}

                    <text x={SVG_WIDTH - 50} y={30} fontSize={16} fill={getLimitColor(selectedFunc.limitPlus)} fontWeight={700}>
                        → {selectedFunc.limitPlus}
                    </text>
                    <text x={30} y={30} fontSize={16} fill={getLimitColor(selectedFunc.limitMinus)} fontWeight={700}>
                        ← {selectedFunc.limitMinus}
                    </text>
                </svg>

                {selectedFunc.note && <NoteBox note={selectedFunc.note} />}

                {manualMode && (
                    <div style={{ marginTop: 12, padding: 12, background: "#f0f9ff", borderRadius: 8 }}>
                        <label style={{ fontSize: 13 }}>
                            x = {manualX?.toFixed(1) ?? 0}
                            <input
                                type="range"
                                min={xMin}
                                max={xMax}
                                step={0.2}
                                value={manualX ?? 0}
                                onChange={(e) => setManualX(parseFloat(e.target.value))}
                                style={{ width: "100%", marginTop: 4 }}
                            />
                        </label>
                    </div>
                )}
            </div>

            {/* Sotto: 3 layout */}
            <div style={bottomGridStyle}>
                <div style={{ ...cardStyle, ...(functionPanelStyle as any) }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Funzione</div>
                    <FunctionSelector functions={FUNCTIONS} selected={selectedFunc.id} onSelect={handleFuncSelect} />
                </div>

                <ResultBox title="Limiti all'infinito">
                    <div style={{ display: "grid", gap: 8 }}>
                        <div style={{ padding: 12, background: "#f0fdf4", borderRadius: 8, border: `2px solid ${getLimitColor(selectedFunc.limitPlus)}` }}>
                            <div style={{ fontSize: 12, color: "#166534" }}>Per x → +∞</div>
                            <div style={{ fontSize: 24, fontWeight: 700, color: getLimitColor(selectedFunc.limitPlus) }}>
                                lim = {selectedFunc.limitPlus}
                            </div>
                        </div>

                        <div style={{ padding: 12, background: "#fffbeb", borderRadius: 8, border: `2px solid ${getLimitColor(selectedFunc.limitMinus)}` }}>
                            <div style={{ fontSize: 12, color: "#92400e" }}>Per x → -∞</div>
                            <div style={{ fontSize: 24, fontWeight: 700, color: getLimitColor(selectedFunc.limitMinus) }}>
                                lim = {selectedFunc.limitMinus}
                            </div>
                        </div>
                    </div>

                    {activeX !== null && activeY !== null && (
                        <div style={{ marginTop: 12, padding: 8, background: "#f0f4f8", borderRadius: 8, fontSize: 12 }}>
                            <div>
                                x = {activeX.toFixed(2)}, f(x) = {Number.isFinite(activeY) ? activeY.toFixed(2) : "grande"}
                            </div>
                        </div>
                    )}
                </ResultBox>

                <div style={cardStyle}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Valori per |x| grande</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11 }}>
                        <div>
                            <div style={{ fontWeight: 600, color: "#10b981", marginBottom: 4 }}>x → +∞</div>
                            {approachPlus.map((p, i) => (
                                <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span>{p.x.toFixed(1)}</span>
                                    <span>{p.fx.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div>
                            <div style={{ fontWeight: 600, color: "#f59e0b", marginBottom: 4 }}>x → -∞</div>
                            {approachMinus.map((p, i) => (
                                <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span>{p.x.toFixed(1)}</span>
                                    <span>{p.fx.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <ConceptBox>
                Quando f(x) <strong>diverge</strong> per x → ±∞, il limite è ±∞.
                Polinomi di grado pari hanno lo stesso limite, quelli di grado dispari hanno limiti opposti.
            </ConceptBox>
        </div>
    );
}
