/**
 * ScalarMultiplicationDemo - Prodotto Vettore-Scalare
 * Versione migliorata con slider, animazione e responsive (3 layout)
 * + toggle per nascondere/mostrare il vettore originale
 */

import React, { useEffect, useMemo, useState } from "react";
import {
    DemoContainer,
    useBreakpoint,
    ResponsiveGrid,
    ResponsiveCard,
    ResponsiveSvg,
    TouchButton,
    ResponsiveSlider,
} from "../../components/ui";
import { Vector2D, vec, scale, magnitude, angleDeg } from "../../utils/math/vectors";

// ============ COSTANTI ============
const COLORS = {
    original: "#3b82f6", // Blu
    scaled: "#ef4444", // Rosso
    grid: "#e5e7eb",
    axis: "#374151",
};

// Casi speciali per pulsanti rapidi
const SCALAR_PRESETS = [
    { value: -2, label: "-2" },
    { value: -1, label: "-1" },
    { value: 0, label: "0" },
    { value: 0.5, label: "½" },
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
];

// ============ UTILITY ============
const randomVector = (): Vector2D => {
    const angle = Math.random() * 2 * Math.PI;
    const mag = 1.5 + Math.random() * 2.5;
    return vec(
        Math.round(mag * Math.cos(angle) * 10) / 10,
        Math.round(mag * Math.sin(angle) * 10) / 10
    );
};

// ============ COMPONENTE FRECCIA ============
const Arrow = ({
                   start = { x: 0, y: 0 },
                   end,
                   color,
                   label,
                   dashed = false,
                   toSvgX,
                   toSvgY,
                   headSize = 10,
               }: {
    start?: Vector2D;
    end: Vector2D;
    color: string;
    label?: string;
    dashed?: boolean;
    toSvgX: (x: number) => number;
    toSvgY: (y: number) => number;
    headSize?: number;
}) => {
    const sx0 = toSvgX(start.x),
        sy0 = toSvgY(start.y);
    const sx1 = toSvgX(end.x),
        sy1 = toSvgY(end.y);

    // Evita frecce troppo piccole
    const len = Math.sqrt((sx1 - sx0) ** 2 + (sy1 - sy0) ** 2);
    if (len < 5) return null;

    const ang = Math.atan2(sy1 - sy0, sx1 - sx0);
    const hx1 = sx1 - headSize * Math.cos(ang - Math.PI / 6);
    const hy1 = sy1 - headSize * Math.sin(ang - Math.PI / 6);
    const hx2 = sx1 - headSize * Math.cos(ang + Math.PI / 6);
    const hy2 = sy1 - headSize * Math.sin(ang + Math.PI / 6);

    return (
        <g>
            <line
                x1={sx0}
                y1={sy0}
                x2={sx1}
                y2={sy1}
                stroke={color}
                strokeWidth={3}
                strokeDasharray={dashed ? "8 4" : undefined}
                strokeLinecap="round"
            />
            <polygon points={`${sx1},${sy1} ${hx1},${hy1} ${hx2},${hy2}`} fill={color} />
            {label && (
                <text
                    x={sx1 + 12 * Math.cos(ang - Math.PI / 4)}
                    y={sy1 + 12 * Math.sin(ang - Math.PI / 4)}
                    fontSize={14}
                    fill={color}
                    fontWeight={700}
                    textAnchor="middle"
                >
                    {label}
                </text>
            )}
        </g>
    );
};

// ============ COMPONENTE PRINCIPALE ============
export default function ScalarMultiplicationDemo() {
    const { isMobile, isTablet } = useBreakpoint();

    // Stato
    const [vector, setVector] = useState<Vector2D>(vec(3, 2));
    const [scalar, setScalar] = useState(2);
    const [showResult, setShowResult] = useState(true);
    const [showOriginal, setShowOriginal] = useState(true); // ✅ nuovo toggle
    const [animating, setAnimating] = useState(false);
    const [animatedScalar, setAnimatedScalar] = useState(scalar);

    // Dimensioni SVG responsive
    const svgW = isMobile ? 350 : isTablet ? 500 : 600;
    const svgH = isMobile ? 300 : isTablet ? 400 : 450;
    const SCALE = isMobile ? 30 : 35;

    // memo delle trasformazioni
    const toSvgX = useMemo(() => (x: number) => svgW / 2 + x * SCALE, [svgW, SCALE]);
    const toSvgY = useMemo(() => (y: number) => svgH / 2 - y * SCALE, [svgH, SCALE]);

    // Vettore scalato (usa animatedScalar durante animazione)
    const displayScalar = animating ? animatedScalar : scalar;
    const scaledVector = useMemo(() => scale(vector, displayScalar), [vector, displayScalar]);

    // Animazione
    useEffect(() => {
        if (!animating) return;

        const startScalar = 1;
        const endScalar = scalar;
        const duration = 800;
        const startTime = Date.now();

        let raf = 0;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = startScalar + (endScalar - startScalar) * eased;

            setAnimatedScalar(current);

            if (progress < 1) raf = requestAnimationFrame(animate);
            else setAnimating(false);
        };

        raf = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(raf);
    }, [animating, scalar]);

    // Handlers
    const handleVectorChange = (field: "x" | "y", value: number) => {
        setVector((prev) => ({ ...prev, [field]: value }));
    };

    const randomize = () => {
        setVector(randomVector());
        setScalar(SCALAR_PRESETS[Math.floor(Math.random() * SCALAR_PRESETS.length)].value);
    };

    const playAnimation = () => {
        setAnimatedScalar(1);
        setAnimating(true);
        setShowResult(true);
    };

    // Range per la griglia
    const gridRange = isMobile ? 5 : isTablet ? 6 : 7;
    const ticks = useMemo(
        () => Array.from({ length: gridRange * 2 + 1 }, (_, i) => i - gridRange).filter((v) => v !== 0),
        [gridRange]
    );

    // 3 layout risultati
    const resultCols = isMobile ? "1fr" : isTablet ? "1fr 1fr" : "1fr 1fr 1fr";

    return (
        <DemoContainer
            title="Prodotto Vettore × Scalare"
            description="Moltiplica un vettore per uno scalare e osserva come cambia modulo e direzione."
        >
            {/* Controlli */}
            <ResponsiveGrid columns={{ mobile: 1, tablet: 2, desktop: 2 }} gap={12}>
                {/* Vettore */}
                <ResponsiveCard>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <span style={{ fontWeight: 600, color: COLORS.original }}>📐 Vettore v</span>
                        <TouchButton variant="ghost" size="sm" onClick={randomize}>
                            🎲 Casuale
                        </TouchButton>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div>
                            <label style={{ fontSize: 12, color: "#6b7280" }}>x =</label>
                            <input
                                type="number"
                                step={0.5}
                                value={vector.x}
                                onChange={(e) => handleVectorChange("x", parseFloat(e.target.value) || 0)}
                                style={{
                                    width: "100%",
                                    padding: isMobile ? "12px" : "8px",
                                    borderRadius: 8,
                                    border: "1px solid #d1d5db",
                                    fontSize: 16,
                                    marginTop: 4,
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: 12, color: "#6b7280" }}>y =</label>
                            <input
                                type="number"
                                step={0.5}
                                value={vector.y}
                                onChange={(e) => handleVectorChange("y", parseFloat(e.target.value) || 0)}
                                style={{
                                    width: "100%",
                                    padding: isMobile ? "12px" : "8px",
                                    borderRadius: 8,
                                    border: "1px solid #d1d5db",
                                    fontSize: 16,
                                    marginTop: 4,
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: 12, padding: 10, background: "#eff6ff", borderRadius: 8, fontSize: 13 }}>
                        <strong>|v|</strong> = {magnitude(vector).toFixed(2)} &nbsp;&nbsp;
                        <strong>θ</strong> = {angleDeg(vector).toFixed(1)}°
                    </div>
                </ResponsiveCard>

                {/* Scalare */}
                <ResponsiveCard>
                    <div style={{ fontWeight: 600, color: "#22c55e", marginBottom: 12 }}>✖️ Scalare k</div>

                    <ResponsiveSlider
                        value={scalar}
                        onChange={setScalar}
                        min={-3}
                        max={3}
                        step={0.5}
                        formatValue={(v) => v.toString()}
                    />

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
                        {SCALAR_PRESETS.map((p) => (
                            <button
                                key={p.value}
                                onClick={() => setScalar(p.value)}
                                style={{
                                    padding: isMobile ? "10px 14px" : "6px 12px",
                                    borderRadius: 6,
                                    border: scalar === p.value ? "2px solid #22c55e" : "1px solid #d1d5db",
                                    background: scalar === p.value ? "#dcfce7" : "#fff",
                                    cursor: "pointer",
                                    fontWeight: scalar === p.value ? 600 : 400,
                                    fontSize: 14,
                                    minWidth: 40,
                                }}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    <div
                        style={{
                            marginTop: 12,
                            padding: 10,
                            background: scalar < 0 ? "#fef2f2" : scalar === 0 ? "#f8fafc" : "#f0fdf4",
                            borderRadius: 8,
                            fontSize: 12,
                            color: scalar < 0 ? "#991b1b" : scalar === 0 ? "#64748b" : "#166534",
                        }}
                    >
                        {scalar < 0 && "⚠️ k < 0: direzione opposta"}
                        {scalar === 0 && "⚠️ k = 0: vettore nullo"}
                        {scalar > 0 && scalar < 1 && "📉 0 < k < 1: vettore ridotto"}
                        {scalar === 1 && "➡️ k = 1: vettore invariato"}
                        {scalar > 1 && "📈 k > 1: vettore amplificato"}
                    </div>
                </ResponsiveCard>
            </ResponsiveGrid>

            {/* Azioni */}
            <div
                style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 12,
                    flexWrap: "wrap",
                    justifyContent: isMobile ? "stretch" : "flex-start",
                }}
            >
                <TouchButton
                    variant={showOriginal ? "secondary" : "primary"}
                    onClick={() => setShowOriginal(!showOriginal)}
                    fullWidth={isMobile}
                >
                    {showOriginal ? "👁️ Nascondi v" : "👁️ Mostra v"}
                </TouchButton>

                <TouchButton
                    variant={showResult ? "secondary" : "primary"}
                    onClick={() => setShowResult(!showResult)}
                    fullWidth={isMobile}
                >
                    {showResult ? "👁️ Nascondi k·v" : "👁️ Mostra k·v"}
                </TouchButton>

                <TouchButton variant="outline" onClick={playAnimation} disabled={animating} fullWidth={isMobile}>
                    ▶️ Anima
                </TouchButton>
            </div>

            {/* Visualizzazione */}
            <ResponsiveCard style={{ marginTop: 12 }}>
                <ResponsiveSvg width={svgW} height={svgH} maxHeight={{ mobile: "50vh", tablet: "55vh", desktop: "60vh" }}>
                    <rect x={0} y={0} width={svgW} height={svgH} fill="#fafafa" rx={8} />

                    {/* Griglia */}
                    {ticks.map((v) => (
                        <g key={`grid-${v}`}>
                            <line x1={toSvgX(v)} y1={0} x2={toSvgX(v)} y2={svgH} stroke={COLORS.grid} strokeWidth={1} />
                            <line x1={0} y1={toSvgY(v)} x2={svgW} y2={toSvgY(v)} stroke={COLORS.grid} strokeWidth={1} />
                        </g>
                    ))}

                    {/* Assi */}
                    <line x1={0} y1={toSvgY(0)} x2={svgW} y2={toSvgY(0)} stroke={COLORS.axis} strokeWidth={2} />
                    <line x1={toSvgX(0)} y1={0} x2={toSvgX(0)} y2={svgH} stroke={COLORS.axis} strokeWidth={2} />

                    {/* Labels assi */}
                    <text x={svgW - 15} y={toSvgY(0) - 8} fontSize={14} fill={COLORS.axis} fontWeight={600}>
                        x
                    </text>
                    <text x={toSvgX(0) + 8} y={18} fontSize={14} fill={COLORS.axis} fontWeight={600}>
                        y
                    </text>

                    {/* Ticks numerici */}
                    {ticks
                        .filter((v) => v % 2 === 0)
                        .map((v) => (
                            <g key={`tick-${v}`}>
                                <text x={toSvgX(v)} y={toSvgY(0) + 16} fontSize={10} textAnchor="middle" fill="#6b7280">
                                    {v}
                                </text>
                                <text x={toSvgX(0) - 8} y={toSvgY(v) + 4} fontSize={10} textAnchor="end" fill="#6b7280">
                                    {v}
                                </text>
                            </g>
                        ))}

                    {/* Vettore scalato (sotto) */}
                    {showResult && displayScalar !== 0 && (
                        <Arrow
                            end={scaledVector}
                            color={COLORS.scaled}
                            label="k·v"
                            dashed={displayScalar < 0}
                            toSvgX={toSvgX}
                            toSvgY={toSvgY}
                        />
                    )}

                    {/* Vettore originale (sopra) */}
                    {showOriginal && (
                        <Arrow end={vector} color={COLORS.original} label="v" toSvgX={toSvgX} toSvgY={toSvgY} />
                    )}

                    {/* Origine */}
                    <circle cx={toSvgX(0)} cy={toSvgY(0)} r={4} fill={COLORS.axis} />
                </ResponsiveSvg>

                {/* Legenda */}
                <div
                    style={{
                        marginTop: 12,
                        display: "flex",
                        gap: isMobile ? 12 : 20,
                        fontSize: isMobile ? 11 : 12,
                        flexWrap: "wrap",
                        justifyContent: "center",
                    }}
                >
                    {showOriginal && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 16, height: 4, background: COLORS.original, borderRadius: 2 }} />
                            <span>
                <strong>v</strong> = ({vector.x.toFixed(1)}, {vector.y.toFixed(1)})
              </span>
                        </div>
                    )}
                    {showResult && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 16, height: 4, background: COLORS.scaled, borderRadius: 2 }} />
                            <span>
                <strong>k·v</strong> = ({scaledVector.x.toFixed(1)}, {scaledVector.y.toFixed(1)})
              </span>
                        </div>
                    )}
                </div>
            </ResponsiveCard>

            {/* Risultati */}
            {showResult && (
                <ResponsiveCard style={{ marginTop: 12, background: "#f0fdf4" }}>
                    <div style={{ fontWeight: 600, marginBottom: 8, color: "#166534" }}>📊 Risultato</div>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: resultCols,
                            gap: 12,
                            fontSize: 14,
                        }}
                    >
                        <div>
                            <div style={{ color: "#6b7280", fontSize: 12 }}>Formula</div>
                            <div>
                                <strong>k · v</strong> = {scalar} · ({vector.x}, {vector.y})
                            </div>
                        </div>
                        <div>
                            <div style={{ color: "#6b7280", fontSize: 12 }}>Risultato</div>
                            <div>
                                <strong>k · v</strong> = ({scaledVector.x.toFixed(2)}, {scaledVector.y.toFixed(2)})
                            </div>
                        </div>
                        <div>
                            <div style={{ color: "#6b7280", fontSize: 12 }}>Moduli</div>
                            <div>
                                |v| = {magnitude(vector).toFixed(2)} → |k·v| = {magnitude(scaledVector).toFixed(2)}
                            </div>
                        </div>
                    </div>
                </ResponsiveCard>
            )}

            {/* Teoria */}
            <div style={{ marginTop: 12, background: "#eff6ff", borderRadius: 12, padding: 16, fontSize: 13, color: "#1e3a8a" }}>
                <strong>💡 Prodotto vettore × scalare:</strong>
                <ul style={{ paddingLeft: 20, margin: "8px 0 0 0" }}>
                    <li>
                        <strong>k · v = (k·vₓ, k·vᵧ)</strong> – moltiplica ogni componente
                    </li>
                    <li>
                        <strong>|k·v| = |k| · |v|</strong> – il modulo viene scalato
                    </li>
                    <li>
                        <strong>k &gt; 0</strong>: stessa direzione di v
                    </li>
                    <li>
                        <strong>k &lt; 0</strong>: direzione opposta (tratteggiato)
                    </li>
                </ul>
            </div>
        </DemoContainer>
    );
}
