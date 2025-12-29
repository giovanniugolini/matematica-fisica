/**
 * VectorTailToHeadDemo - Versione refactorizzata
 * Somma di vettori con metodo punta-coda
 */

import React, { useRef, useState } from "react";
import { DemoContainer } from "../../components/ui";

// ============ TIPI ============

type Vector = {
    x0: number;
    y0: number;
    dx: number;
    dy: number;
};

type DrawMode = "none" | "A" | "B";

// ============ COSTANTI ============

const WIDTH = 600;
const HEIGHT = 500;
const SCALE = 25;

// Colori
const COLOR_A = "#3b82f6"; // blu
const COLOR_B = "#22c55e"; // verde
const COLOR_SUM = "#ef4444"; // rosso

// ============ UTILITY ============

const toSvgX = (x: number) => WIDTH / 2 + x * SCALE;
const toSvgY = (y: number) => HEIGHT / 2 - y * SCALE;
const fromSvgX = (sx: number) => (sx - WIDTH / 2) / SCALE;
const fromSvgY = (sy: number) => (HEIGHT / 2 - sy) / SCALE;

const randComp = () => {
    const v = Math.round((Math.random() * 8 - 4) * 2) / 2;
    return v === 0 ? 1 : v;
};

const randCoord = () => Math.round((Math.random() * 6 - 3) * 2) / 2;

// ============ COMPONENTE FRECCIA ============

function Arrow({ x0, y0, dx, dy, color, strokeWidth = 3, dashed = false }: {
    x0: number; y0: number; dx: number; dy: number;
    color: string; strokeWidth?: number; dashed?: boolean;
}) {
    const sx0 = toSvgX(x0), sy0 = toSvgY(y0);
    const sx1 = toSvgX(x0 + dx), sy1 = toSvgY(y0 + dy);

    const angle = Math.atan2(sy1 - sy0, sx1 - sx0);
    const headLen = 12;
    const hx1 = sx1 - headLen * Math.cos(angle - Math.PI / 6);
    const hy1 = sy1 - headLen * Math.sin(angle - Math.PI / 6);
    const hx2 = sx1 - headLen * Math.cos(angle + Math.PI / 6);
    const hy2 = sy1 - headLen * Math.sin(angle + Math.PI / 6);

    return (
        <g>
            <line x1={sx0} y1={sy0} x2={sx1} y2={sy1} stroke={color} strokeWidth={strokeWidth} strokeDasharray={dashed ? "6 4" : undefined} />
            <polygon points={`${sx1},${sy1} ${hx1},${hy1} ${hx2},${hy2}`} fill={color} />
        </g>
    );
}

// ============ COMPONENTE PRINCIPALE ============

export default function VectorTailToHeadDemo() {
    const [vecA, setVecA] = useState<Vector>({ x0: 0, y0: 0, dx: 4, dy: 2 });
    const [vecB, setVecB] = useState<Vector>({ x0: 0, y0: 0, dx: 2, dy: 3 });
    const [showSum, setShowSum] = useState(false);
    const [originMode, setOriginMode] = useState(false);
    const [drawMode, setDrawMode] = useState<DrawMode>("none");
    const [pendingStart, setPendingStart] = useState<{ x: number; y: number } | null>(null);

    const isAnimatingRef = useRef(false);

    // Vettore somma
    const sumVector: Vector = originMode
        ? { x0: 0, y0: 0, dx: vecA.dx + vecB.dx, dy: vecA.dy + vecB.dy }
        : { x0: vecA.x0, y0: vecA.y0, dx: vecB.x0 + vecB.dx - vecA.x0, dy: vecB.y0 + vecB.dy - vecA.y0 };

    // Handlers
    const handleChange = (vec: "A" | "B", field: keyof Vector) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value) || 0;
        setShowSum(false);
        setOriginMode(false);
        setDrawMode("none");
        setPendingStart(null);

        if (vec === "A") setVecA(prev => ({ ...prev, [field]: value }));
        else setVecB(prev => ({ ...prev, [field]: value }));
    };

    const randomize = () => {
        setVecA({ x0: randCoord(), y0: randCoord(), dx: randComp(), dy: randComp() });
        setVecB({ x0: randCoord(), y0: randCoord(), dx: randComp(), dy: randComp() });
        setShowSum(false);
        setOriginMode(false);
        setDrawMode("none");
        setPendingStart(null);
    };

    const reset = () => {
        setVecA({ x0: 0, y0: 0, dx: 4, dy: 2 });
        setVecB({ x0: 0, y0: 0, dx: 2, dy: 3 });
        setShowSum(false);
        setOriginMode(false);
        setDrawMode("none");
        setPendingStart(null);
    };

    // Animazione punta-coda
    const animateTailToHead = () => {
        if (isAnimatingRef.current) return;
        isAnimatingRef.current = true;
        setShowSum(false);
        setOriginMode(false);
        setDrawMode("none");

        const startX0 = vecB.x0, startY0 = vecB.y0;
        const endX0 = vecA.x0 + vecA.dx, endY0 = vecA.y0 + vecA.dy;
        const duration = 800;
        let startTime: number | null = null;

        const step = (ts: number) => {
            if (!startTime) startTime = ts;
            const t = Math.min(1, (ts - startTime) / duration);

            setVecB(prev => ({
                ...prev,
                x0: startX0 + (endX0 - startX0) * t,
                y0: startY0 + (endY0 - startY0) * t,
            }));

            if (t < 1) requestAnimationFrame(step);
            else {
                isAnimatingRef.current = false;
                setShowSum(true);
            }
        };
        requestAnimationFrame(step);
    };

    // Traslazione all'origine
    const bringToOrigin = () => {
        if (isAnimatingRef.current) return;
        isAnimatingRef.current = true;
        setShowSum(true);
        setOriginMode(true);
        setDrawMode("none");

        const startAx0 = vecA.x0, startAy0 = vecA.y0;
        const startBx0 = vecB.x0, startBy0 = vecB.y0;
        const duration = 800;
        let startTime: number | null = null;

        const step = (ts: number) => {
            if (!startTime) startTime = ts;
            const t = Math.min(1, (ts - startTime) / duration);

            setVecA(prev => ({ ...prev, x0: startAx0 * (1 - t), y0: startAy0 * (1 - t) }));
            setVecB(prev => ({ ...prev, x0: startBx0 * (1 - t), y0: startBy0 * (1 - t) }));

            if (t < 1) requestAnimationFrame(step);
            else {
                setVecA(prev => ({ ...prev, x0: 0, y0: 0 }));
                setVecB(prev => ({ ...prev, x0: 0, y0: 0 }));
                isAnimatingRef.current = false;
            }
        };
        requestAnimationFrame(step);
    };

    // Click sul canvas per disegnare
    const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
        if (isAnimatingRef.current || drawMode === "none") return;

        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();

        // Coordinate client relative al SVG
        const clientX = e.clientX - rect.left;
        const clientY = e.clientY - rect.top;

        // Scala dal client al viewBox
        const scaleX = WIDTH / rect.width;
        const scaleY = HEIGHT / rect.height;

        // Coordinate nel viewBox
        const svgX = clientX * scaleX;
        const svgY = clientY * scaleY;

        // Converti da SVG a coordinate matematiche
        const x = (svgX - WIDTH / 2) / SCALE;
        const y = (HEIGHT / 2 - svgY) / SCALE;

        if (!pendingStart) {
            setPendingStart({ x, y });
            return;
        }

        const dx = x - pendingStart.x;
        const dy = y - pendingStart.y;

        if (drawMode === "A") setVecA({ x0: pendingStart.x, y0: pendingStart.y, dx, dy });
        else setVecB({ x0: pendingStart.x, y0: pendingStart.y, dx, dy });

        setPendingStart(null);
        setDrawMode("none");
        setShowSum(false);
        setOriginMode(false);
    };

    // Stili
    const cardStyle: React.CSSProperties = {
        background: "#fff",
        borderRadius: 12,
        padding: 12,
        boxShadow: "0 1px 4px rgba(0,0,0,0.1)"
    };

    const btnStyle: React.CSSProperties = {
        padding: "8px 14px",
        borderRadius: 8,
        border: "1px solid #d1d5db",
        background: "#fff",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 500
    };

    const drawHint = drawMode !== "none"
        ? `Disegna vettore ${drawMode}: clicca la coda, poi la punta`
        : null;

    return (
        <DemoContainer
            title="Somma vettoriale – metodo punta-coda"
            description="Genera vettori casuali o disegnali nel piano. Anima il metodo punta-coda per visualizzare la somma."
        >
            {/* Canvas principale */}
            <div style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>Piano cartesiano</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button onClick={randomize} style={btnStyle}>🎲 Casuali</button>
                        <button onClick={animateTailToHead} style={{ ...btnStyle, background: "#dbeafe", borderColor: "#3b82f6" }}>
                            ▶ Punta-coda
                        </button>
                        <button onClick={bringToOrigin} style={btnStyle}>📍 All'origine</button>
                        <button onClick={reset} style={btnStyle}>Reset</button>
                    </div>
                </div>

                <svg
                    width="100%"
                    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                    style={{ maxHeight: "60vh", cursor: drawMode !== "none" ? "crosshair" : "default" }}
                    onClick={handleSvgClick}
                >
                    {/* Sfondo quadrettato */}
                    <defs>
                        <pattern id="gridVec" width="25" height="25" patternUnits="userSpaceOnUse">
                            <rect width="25" height="25" fill="#fafafa" />
                            <path d="M25 0 H0 V25" fill="none" stroke="#e5e7eb" strokeWidth={1} />
                        </pattern>
                    </defs>
                    <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="url(#gridVec)" />

                    {/* Assi */}
                    <line x1={0} y1={toSvgY(0)} x2={WIDTH} y2={toSvgY(0)} stroke="#374151" strokeWidth={1.5} />
                    <line x1={toSvgX(0)} y1={0} x2={toSvgX(0)} y2={HEIGHT} stroke="#374151" strokeWidth={1.5} />
                    <text x={WIDTH - 15} y={toSvgY(0) - 8} fontSize={14} fill="#374151">x</text>
                    <text x={toSvgX(0) + 8} y={18} fontSize={14} fill="#374151">y</text>

                    {/* Tick labels */}
                    {[-8, -4, 4, 8].map(v => (
                        <g key={`tick-${v}`}>
                            <text x={toSvgX(v)} y={toSvgY(0) + 16} fontSize={10} textAnchor="middle" fill="#6b7280">{v}</text>
                            <text x={toSvgX(0) - 12} y={toSvgY(v) + 4} fontSize={10} textAnchor="end" fill="#6b7280">{v}</text>
                        </g>
                    ))}

                    {/* Vettore A */}
                    <Arrow x0={vecA.x0} y0={vecA.y0} dx={vecA.dx} dy={vecA.dy} color={COLOR_A} />
                    <text x={toSvgX(vecA.x0 + vecA.dx / 2) + 10} y={toSvgY(vecA.y0 + vecA.dy / 2) - 10} fontSize={14} fill={COLOR_A} fontWeight={600}>A</text>

                    {/* Vettore B */}
                    <Arrow x0={vecB.x0} y0={vecB.y0} dx={vecB.dx} dy={vecB.dy} color={COLOR_B} />
                    <text x={toSvgX(vecB.x0 + vecB.dx / 2) + 10} y={toSvgY(vecB.y0 + vecB.dy / 2) - 10} fontSize={14} fill={COLOR_B} fontWeight={600}>B</text>

                    {/* Vettore somma */}
                    {showSum && (
                        <>
                            <Arrow x0={sumVector.x0} y0={sumVector.y0} dx={sumVector.dx} dy={sumVector.dy} color={COLOR_SUM} dashed />
                            <text x={toSvgX(sumVector.x0 + sumVector.dx / 2) - 20} y={toSvgY(sumVector.y0 + sumVector.dy / 2) + 20} fontSize={14} fill={COLOR_SUM} fontWeight={600}>A+B</text>
                        </>
                    )}

                    {/* Punto in attesa durante il disegno */}
                    {pendingStart && (
                        <circle cx={toSvgX(pendingStart.x)} cy={toSvgY(pendingStart.y)} r={6} fill={drawMode === "A" ? COLOR_A : COLOR_B} />
                    )}
                </svg>

                {drawHint && (
                    <div style={{ marginTop: 8, padding: 8, background: "#fef3c7", borderRadius: 8, fontSize: 13, color: "#92400e" }}>
                        {drawHint} {pendingStart && `(coda posizionata in ${pendingStart.x.toFixed(1)}, ${pendingStart.y.toFixed(1)})`}
                    </div>
                )}
            </div>

            {/* Controlli in basso */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 12 }}>
                {/* Vettore A */}
                <div style={{ ...cardStyle, borderLeft: `4px solid ${COLOR_A}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ fontWeight: 600, color: COLOR_A }}>Vettore A</div>
                        <button onClick={() => { setDrawMode("A"); setPendingStart(null); }} style={{ ...btnStyle, padding: "4px 10px", fontSize: 12, background: drawMode === "A" ? "#dbeafe" : "#fff" }}>
                            ✏️ Disegna
                        </button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6 }}>
                        {(["x0", "y0", "dx", "dy"] as const).map(field => (
                            <label key={field} style={{ fontSize: 12 }}>
                                <span style={{ color: "#64748b" }}>{field === "x0" ? "x₀" : field === "y0" ? "y₀" : field === "dx" ? "Δx" : "Δy"}</span>
                                <input type="number" step={0.5} value={vecA[field]} onChange={handleChange("A", field)} style={{ width: "100%", padding: 6, borderRadius: 6, border: "1px solid #d1d5db", marginTop: 2 }} />
                            </label>
                        ))}
                    </div>
                </div>

                {/* Vettore B */}
                <div style={{ ...cardStyle, borderLeft: `4px solid ${COLOR_B}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ fontWeight: 600, color: COLOR_B }}>Vettore B</div>
                        <button onClick={() => { setDrawMode("B"); setPendingStart(null); }} style={{ ...btnStyle, padding: "4px 10px", fontSize: 12, background: drawMode === "B" ? "#dcfce7" : "#fff" }}>
                            ✏️ Disegna
                        </button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6 }}>
                        {(["x0", "y0", "dx", "dy"] as const).map(field => (
                            <label key={field} style={{ fontSize: 12 }}>
                                <span style={{ color: "#64748b" }}>{field === "x0" ? "x₀" : field === "y0" ? "y₀" : field === "dx" ? "Δx" : "Δy"}</span>
                                <input type="number" step={0.5} value={vecB[field]} onChange={handleChange("B", field)} style={{ width: "100%", padding: 6, borderRadius: 6, border: "1px solid #d1d5db", marginTop: 2 }} />
                            </label>
                        ))}
                    </div>
                </div>

                {/* Risultato */}
                <div style={{ ...cardStyle, background: "#fef2f2", borderLeft: `4px solid ${COLOR_SUM}` }}>
                    <div style={{ fontWeight: 600, color: COLOR_SUM, marginBottom: 8 }}>Risultato</div>
                    <div style={{ fontSize: 13, display: "grid", gap: 4 }}>
                        <div><span style={{ color: COLOR_A, fontWeight: 600 }}>A</span> = ({vecA.dx.toFixed(1)}, {vecA.dy.toFixed(1)})</div>
                        <div><span style={{ color: COLOR_B, fontWeight: 600 }}>B</span> = ({vecB.dx.toFixed(1)}, {vecB.dy.toFixed(1)})</div>
                        <div style={{ borderTop: "1px solid #fecaca", paddingTop: 6, marginTop: 4 }}>
                            <span style={{ color: COLOR_SUM, fontWeight: 700 }}>A + B</span> = ({(vecA.dx + vecB.dx).toFixed(1)}, {(vecA.dy + vecB.dy).toFixed(1)})
                        </div>
                        {showSum && (
                            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                                |A + B| = {Math.hypot(vecA.dx + vecB.dx, vecA.dy + vecB.dy).toFixed(2)}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Spiegazione */}
            <div style={{ marginTop: 12, background: "#eff6ff", borderRadius: 12, padding: 12, fontSize: 13, color: "#1e3a8a" }}>
                <strong>Metodo punta-coda:</strong> Per sommare due vettori, si trasla il secondo vettore in modo che la sua coda coincida con la punta del primo.
                Il vettore somma va dalla coda del primo alla punta del secondo. Clicca "▶ Punta-coda" per vedere l'animazione.
            </div>
        </DemoContainer>
    );
}