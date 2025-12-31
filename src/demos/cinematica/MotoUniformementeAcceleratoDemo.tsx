/**
 * MotoUniformementeAcceleratoDemo - Moto Uniformemente Accelerato (MUA)
 *
 * Caratteristiche:
 * - Animazione orizzontale del mobile
 * - Grafici x(t), v(t), a(t) in tempo reale
 * - Slider tempo interattivo
 * - Conversione unità m/s ↔ km/h
 * - Gestione frenata (a < 0) con arresto quando v = 0
 * - Step-by-step delle formule
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";

import {
    Latex,
    DemoContainer,
    ResponsiveCard,
    CollapsiblePanel,
    useBreakpoint,
} from "../../components/ui";

// ============ TIPI ============

interface MotionState {
    t: number;      // tempo (s)
    x: number;      // posizione (m)
    v: number;      // velocità (m/s)
    a: number;      // accelerazione (m/s²)
    stopped: boolean; // true se il mobile si è fermato
    tStop: number | null; // tempo di arresto (se frenata)
}

interface SimulationParams {
    x0: number;     // posizione iniziale (m)
    v0: number;     // velocità iniziale (m/s)
    a: number;      // accelerazione (m/s²)
}

// ============ COSTANTI ============

const COLORS = {
    position: "#3b82f6",    // blu
    velocity: "#22c55e",    // verde
    acceleration: "#f59e0b", // ambra
    vehicle: "#6366f1",     // indigo
    track: "#e2e8f0",       // grigio chiaro
    grid: "#f1f5f9",
    text: "#334155",
    accent: "#8b5cf6",
};

// ============ UTILITÀ ============

function msToKmh(ms: number): number {
    return ms * 3.6;
}

function kmhToMs(kmh: number): number {
    return kmh / 3.6;
}

function mToKm(m: number): number {
    return m / 1000;
}

function sToH(s: number): number {
    return s / 3600;
}

function formatNumber(n: number, decimals: number = 2): string {
    return n.toFixed(decimals);
}

function formatTime(s: number): string {
    if (s < 60) return `${formatNumber(s, 1)} s`;
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min} min ${formatNumber(sec, 1)} s`;
}

// Calcola lo stato del moto a un dato istante
function calculateMotion(params: SimulationParams, t: number): MotionState {
    const { x0, v0, a } = params;

    // Se c'è frenata (a < 0 con v0 > 0), calcola quando si ferma
    let tStop: number | null = null;
    let stopped = false;
    let effectiveT = t;

    if (a < 0 && v0 > 0) {
        tStop = -v0 / a; // tempo di arresto: v = v0 + at = 0 → t = -v0/a
        if (t >= tStop) {
            effectiveT = tStop;
            stopped = true;
        }
    } else if (a > 0 && v0 < 0) {
        tStop = -v0 / a;
        if (t >= tStop) {
            effectiveT = tStop;
            stopped = true;
        }
    }

    // Formule MUA
    const x = x0 + v0 * effectiveT + 0.5 * a * effectiveT * effectiveT;
    const v = stopped ? 0 : v0 + a * effectiveT;

    return { t, x, v, a: stopped ? 0 : a, stopped, tStop };
}

// Genera punti per i grafici
function generateGraphData(params: SimulationParams, maxT: number, points: number = 100): MotionState[] {
    const data: MotionState[] = [];
    for (let i = 0; i <= points; i++) {
        const t = (i / points) * maxT;
        data.push(calculateMotion(params, t));
    }
    return data;
}

// ============ COMPONENTI GRAFICI ============

interface GraphProps {
    data: MotionState[];
    currentT: number;
    width: number;
    height: number;
    dataKey: 'x' | 'v' | 'a';
    color: string;
    label: string;
    unit: string;
    maxT: number;
}

function Graph({ data, currentT, width, height, dataKey, color, label, unit, maxT }: GraphProps) {
    const padding = { top: 20, right: 20, bottom: 35, left: 50 };
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    // Trova min/max per la scala Y
    const values = data.map(d => d[dataKey]);
    let minY = Math.min(...values, 0);
    let maxY = Math.max(...values, 0);

    // Aggiungi margine
    const range = maxY - minY || 1;
    minY -= range * 0.1;
    maxY += range * 0.1;

    // Funzioni di scala
    const scaleX = (t: number) => padding.left + (t / maxT) * graphWidth;
    const scaleY = (y: number) => padding.top + graphHeight - ((y - minY) / (maxY - minY)) * graphHeight;

    // Genera il path
    const pathD = data.map((d, i) => {
        const x = scaleX(d.t);
        const y = scaleY(d[dataKey]);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    // Punto corrente
    const currentData = calculateMotion({ x0: data[0]?.x || 0, v0: data[0]?.v || 0, a: data[0]?.a || 0 }, currentT);
    // Ricalcola con i parametri originali
    const currentPoint = data.find(d => d.t >= currentT) || data[data.length - 1];
    const currentX = scaleX(currentT);
    const currentY = scaleY(currentPoint[dataKey]);

    // Tick Y
    const yTicks = 5;
    const yTickValues = Array.from({ length: yTicks }, (_, i) => minY + (i / (yTicks - 1)) * (maxY - minY));

    // Tick X
    const xTicks = 5;
    const xTickValues = Array.from({ length: xTicks }, (_, i) => (i / (xTicks - 1)) * maxT);

    return (
        <svg width={width} height={height} style={{ display: 'block' }}>
    {/* Sfondo */}
    <rect x={padding.left} y={padding.top} width={graphWidth} height={graphHeight} fill={COLORS.grid} rx={4} />

    {/* Griglia orizzontale */}
    {yTickValues.map((val, i) => (
        <line
            key={`h-${i}`}
        x1={padding.left}
        y1={scaleY(val)}
        x2={width - padding.right}
        y2={scaleY(val)}
        stroke="#cbd5e1"
        strokeWidth={1}
        strokeDasharray={val === 0 ? "none" : "4,4"}
        />
    ))}

    {/* Griglia verticale */}
    {xTickValues.map((val, i) => (
        <line
            key={`v-${i}`}
        x1={scaleX(val)}
        y1={padding.top}
        x2={scaleX(val)}
        y2={height - padding.bottom}
        stroke="#cbd5e1"
        strokeWidth={1}
        strokeDasharray="4,4"
            />
    ))}

    {/* Linea dello zero se visibile */}
    {minY < 0 && maxY > 0 && (
        <line
            x1={padding.left}
        y1={scaleY(0)}
        x2={width - padding.right}
        y2={scaleY(0)}
        stroke="#94a3b8"
        strokeWidth={2}
        />
    )}

    {/* Curva */}
    <path d={pathD} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" />

        {/* Linea verticale tempo corrente */}
        <line
    x1={currentX}
    y1={padding.top}
    x2={currentX}
    y2={height - padding.bottom}
    stroke={color}
    strokeWidth={1}
    strokeDasharray="4,4"
    opacity={0.5}
    />

    {/* Punto corrente */}
    <circle cx={currentX} cy={currentY} r={6} fill={color} stroke="white" strokeWidth={2} />

    {/* Label asse Y */}
    <text
        x={padding.left - 8}
    y={padding.top - 8}
    textAnchor="end"
    fontSize={11}
    fontWeight={600}
    fill={color}
        >
        {label} ({unit})
        </text>

    {/* Tick labels Y */}
    {yTickValues.map((val, i) => (
        <text
            key={`yl-${i}`}
        x={padding.left - 8}
        y={scaleY(val) + 4}
        textAnchor="end"
        fontSize={10}
        fill={COLORS.text}
            >
            {formatNumber(val, 1)}
        </text>
    ))}

    {/* Tick labels X */}
    {xTickValues.map((val, i) => (
        <text
            key={`xl-${i}`}
        x={scaleX(val)}
        y={height - padding.bottom + 15}
        textAnchor="middle"
        fontSize={10}
        fill={COLORS.text}
            >
            {formatNumber(val, 1)}
        </text>
    ))}

    {/* Label asse X */}
    <text
        x={width - padding.right}
    y={height - 5}
    textAnchor="end"
    fontSize={11}
    fill={COLORS.text}
        >
        t (s)
        </text>
        </svg>
);
}

// ============ COMPONENTE ANIMAZIONE ============

interface AnimationProps {
    params: SimulationParams;
    currentT: number;
    maxT: number;
    width: number;
    height: number;
}

function Animation({ params, currentT, maxT, width, height }: AnimationProps) {
    const state = calculateMotion(params, currentT);
    const graphData = generateGraphData(params, maxT);

    // Calcola range X per la visualizzazione
    const allX = graphData.map(d => d.x);
    const minX = Math.min(...allX, 0);
    const maxX = Math.max(...allX, 10);
    const rangeX = maxX - minX || 10;

    const padding = 40;
    const trackY = height / 2;
    const trackWidth = width - 2 * padding;

    // Posizione del veicolo sulla traccia
    const vehicleX = padding + ((state.x - minX) / rangeX) * trackWidth;

    // Dimensioni veicolo
    const vehicleWidth = 60;
    const vehicleHeight = 24;
    const wheelRadius = 6;

    // Calcola tick per la scala
    const numTicks = 6;
    const tickStep = rangeX / (numTicks - 1);
    const ticks = Array.from({ length: numTicks }, (_, i) => minX + i * tickStep);

    // Freccia velocità (proporzionale a v)
    const maxV = Math.max(...graphData.map(d => Math.abs(d.v)), 1);
    const arrowLength = (state.v / maxV) * 50;

    return (
        <svg width={width} height={height} style={{ display: 'block', background: 'linear-gradient(180deg, #e0f2fe 0%, #f0f9ff 100%)' }}>
    {/* Cielo con nuvole stilizzate */}
    <ellipse cx={width * 0.2} cy={30} rx={40} ry={15} fill="white" opacity={0.8} />
    <ellipse cx={width * 0.25} cy={28} rx={30} ry={12} fill="white" opacity={0.8} />
    <ellipse cx={width * 0.7} cy={40} rx={50} ry={18} fill="white" opacity={0.7} />
    <ellipse cx={width * 0.75} cy={38} rx={35} ry={14} fill="white" opacity={0.7} />

    {/* Terreno */}
    <rect x={0} y={trackY + 20} width={width} height={height - trackY - 20} fill="#86efac" />

        {/* Strada */}
        <rect x={padding - 20} y={trackY - 15} width={trackWidth + 40} height={35} fill="#475569" rx={4} />

    {/* Linea tratteggiata centrale strada */}
    <line
        x1={padding - 10}
    y1={trackY + 2}
    x2={width - padding + 10}
    y2={trackY + 2}
    stroke="#fbbf24"
    strokeWidth={3}
    strokeDasharray="20,15"
        />

        {/* Scala metrica */}
        <line x1={padding} y1={trackY + 40} x2={width - padding} y2={trackY + 40} stroke="#64748b" strokeWidth={2} />
    {ticks.map((val, i) => {
        const tickX = padding + (i / (numTicks - 1)) * trackWidth;
        return (
            <g key={i}>
            <line x1={tickX} y1={trackY + 35} x2={tickX} y2={trackY + 45} stroke="#64748b" strokeWidth={2} />
        <text x={tickX} y={trackY + 60} textAnchor="middle" fontSize={11} fill="#475569" fontWeight={500}>
            {formatNumber(val, 0)} m
        </text>
        </g>
    );
    })}

    {/* Posizione iniziale marker */}
    <g transform={`translate(${padding + ((params.x0 - minX) / rangeX) * trackWidth}, ${trackY - 25})`}>
    <line x1={0} y1={0} x2={0} y2={-20} stroke="#94a3b8" strokeWidth={2} strokeDasharray="4,2" />
    <text x={0} y={-25} textAnchor="middle" fontSize={10} fill="#64748b">x₀</text>
    </g>

    {/* Veicolo */}
    <g transform={`translate(${vehicleX - vehicleWidth/2}, ${trackY - vehicleHeight - wheelRadius})`}>
    {/* Carrozzeria */}
    <rect x={0} y={8} width={vehicleWidth} height={vehicleHeight - 8} fill={COLORS.vehicle} rx={4} />
    <rect x={8} y={0} width={vehicleWidth - 20} height={12} fill={COLORS.vehicle} rx={3} />

    {/* Finestrini */}
    <rect x={12} y={2} width={15} height={8} fill="#bfdbfe" rx={2} />
    <rect x={30} y={2} width={15} height={8} fill="#bfdbfe" rx={2} />

    {/* Ruote */}
    <circle cx={12} cy={vehicleHeight} r={wheelRadius} fill="#1e293b" />
    <circle cx={12} cy={vehicleHeight} r={3} fill="#64748b" />
    <circle cx={vehicleWidth - 12} cy={vehicleHeight} r={wheelRadius} fill="#1e293b" />
    <circle cx={vehicleWidth - 12} cy={vehicleHeight} r={3} fill="#64748b" />

        {/* Fari */}
    {state.v >= 0 ? (
        <rect x={vehicleWidth - 3} y={14} width={4} height={6} fill="#fef08a" rx={1} />
    ) : (
        <rect x={-1} y={14} width={4} height={6} fill="#fef08a" rx={1} />
    )}
    </g>

    {/* Freccia velocità */}
    {Math.abs(state.v) > 0.1 && (
        <g transform={`translate(${vehicleX}, ${trackY - vehicleHeight - wheelRadius - 20})`}>
        <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
    <polygon points="0 0, 10 3.5, 0 7" fill={COLORS.velocity} />
    </marker>
    </defs>
    <line
        x1={0}
        y1={0}
        x2={arrowLength}
        y2={0}
        stroke={COLORS.velocity}
        strokeWidth={3}
        markerEnd="url(#arrowhead)"
        />
        <text
            x={arrowLength / 2}
        y={-8}
        textAnchor="middle"
        fontSize={11}
        fontWeight={600}
        fill={COLORS.velocity}
            >
            v
            </text>
            </g>
    )}

    {/* Indicatore STOP se fermo */}
    {state.stopped && (
        <g transform={`translate(${vehicleX}, ${trackY - vehicleHeight - wheelRadius - 50})`}>
        <rect x={-25} y={-12} width={50} height={24} fill="#ef4444" rx={4} />
    <text x={0} y={5} textAnchor="middle" fontSize={12} fontWeight={700} fill="white">STOP</text>
        </g>
    )}

    {/* Info tempo e posizione */}
    <g transform={`translate(${width - 10}, 20)`}>
    <text textAnchor="end" fontSize={14} fontWeight={600} fill={COLORS.text}>
    t = {formatNumber(currentT, 2)} s
    </text>
    <text y={20} textAnchor="end" fontSize={14} fontWeight={600} fill={COLORS.position}>
    x = {formatNumber(state.x, 2)} m
    </text>
    <text y={40} textAnchor="end" fontSize={14} fontWeight={600} fill={COLORS.velocity}>
    v = {formatNumber(state.v, 2)} m/s
    </text>
    </g>
    </svg>
);
}

// ============ COMPONENTE PRINCIPALE ============

export default function MotoUniformementeAcceleratoDemo() {
    const { isMobile, isTablet } = useBreakpoint();

    // Parametri simulazione
    const [x0, setX0] = useState(0);
    const [v0, setV0] = useState(10);
    const [acceleration, setAcceleration] = useState(2);
    const [currentT, setCurrentT] = useState(0);
    const [maxT, setMaxT] = useState(10);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showKmH, setShowKmH] = useState(false);

    const animationRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);

    const params: SimulationParams = useMemo(() => ({
        x0,
        v0,
        a: acceleration
    }), [x0, v0, acceleration]);

    // Stato corrente
    const currentState = useMemo(() => calculateMotion(params, currentT), [params, currentT]);

    // Dati grafici
    const graphData = useMemo(() => generateGraphData(params, maxT), [params, maxT]);

    // Animazione play/pause
    useEffect(() => {
        if (isPlaying) {
            lastTimeRef.current = performance.now();

            const animate = (timestamp: number) => {
                const delta = (timestamp - lastTimeRef.current) / 1000;
                lastTimeRef.current = timestamp;

                setCurrentT(prev => {
                    const newT = prev + delta;
                    if (newT >= maxT) {
                        setIsPlaying(false);
                        return maxT;
                    }
                    return newT;
                });

                animationRef.current = requestAnimationFrame(animate);
            };

            animationRef.current = requestAnimationFrame(animate);
        } else {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isPlaying, maxT]);

    // Reset quando cambiano i parametri
    const handleReset = useCallback(() => {
        setCurrentT(0);
        setIsPlaying(false);
    }, []);

    // Preset scenari
    const presets = [
        { name: "Accelerazione", x0: 0, v0: 0, a: 3, maxT: 10 },
        { name: "Frenata", x0: 0, v0: 20, a: -4, maxT: 8 },
        { name: "Moto uniforme", x0: 0, v0: 15, a: 0, maxT: 10 },
        { name: "Partenza lanciata", x0: 5, v0: 10, a: 2, maxT: 8 },
    ];

    const applyPreset = (preset: typeof presets[0]) => {
        setX0(preset.x0);
        setV0(preset.v0);
        setAcceleration(preset.a);
        setMaxT(preset.maxT);
        setCurrentT(0);
        setIsPlaying(false);
    };

    // Dimensioni grafici
    const graphWidth = isMobile ? 320 : isTablet ? 380 : 350;
    const graphHeight = isMobile ? 180 : 200;
    const animationWidth = isMobile ? 340 : isTablet ? 700 : 800;
    const animationHeight = isMobile ? 180 : 200;

    // ============ PANNELLI UI ============

    const ControlsPanel = (
        <ResponsiveCard>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: COLORS.text }}>
⚙️ Parametri
    </div>

    {/* Preset */}
    <div style={{ marginBottom: 16 }}>
    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>Scenari preset:</div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
    {presets.map((preset, i) => (
        <button
            key={i}
        onClick={() => applyPreset(preset)}
        style={{
        padding: "6px 12px",
            fontSize: 12,
            background: "#f1f5f9",
            border: "1px solid #e2e8f0",
            borderRadius: 6,
            cursor: "pointer",
            transition: "all 0.2s",
    }}
        onMouseOver={e => {
        e.currentTarget.style.background = "#e2e8f0";
    }}
        onMouseOut={e => {
        e.currentTarget.style.background = "#f1f5f9";
    }}
    >
        {preset.name}
        </button>
    ))}
    </div>
    </div>

    {/* Posizione iniziale */}
    <div style={{ marginBottom: 12 }}>
    <label style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
    <span>Posizione iniziale x₀</span>
    <span style={{ color: COLORS.position, fontWeight: 600 }}>{x0} m</span>
    </label>
    <input
    type="range"
    min={-20}
    max={50}
    step={1}
    value={x0}
    onChange={e => { setX0(Number(e.target.value)); handleReset(); }}
    style={{ width: "100%", accentColor: COLORS.position }}
    />
    </div>

    {/* Velocità iniziale */}
    <div style={{ marginBottom: 12 }}>
    <label style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
    <span>Velocità iniziale v₀</span>
    <span style={{ color: COLORS.velocity, fontWeight: 600 }}>
    {v0} m/s {showKmH && <span style={{ color: "#94a3b8" }}>({formatNumber(msToKmh(v0), 1)} km/h)</span>}
    </span>
    </label>
    <input
        type="range"
        min={-20}
        max={30}
        step={0.5}
        value={v0}
        onChange={e => { setV0(Number(e.target.value)); handleReset(); }}
        style={{ width: "100%", accentColor: COLORS.velocity }}
        />
        </div>

        {/* Accelerazione */}
        <div style={{ marginBottom: 12 }}>
        <label style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
        <span>Accelerazione a</span>
        <span style={{ color: COLORS.acceleration, fontWeight: 600 }}>{acceleration} m/s²</span>
        </label>
        <input
        type="range"
        min={-10}
        max={10}
        step={0.5}
        value={acceleration}
        onChange={e => { setAcceleration(Number(e.target.value)); handleReset(); }}
        style={{ width: "100%", accentColor: COLORS.acceleration }}
        />
        </div>

        {/* Tempo massimo */}
        <div style={{ marginBottom: 16 }}>
        <label style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
        <span>Durata simulazione</span>
        <span style={{ fontWeight: 600 }}>{maxT} s</span>
        </label>
        <input
        type="range"
        min={2}
        max={30}
        step={1}
        value={maxT}
        onChange={e => { setMaxT(Number(e.target.value)); if (currentT > Number(e.target.value)) setCurrentT(Number(e.target.value)); }}
        style={{ width: "100%" }}
        />
        </div>

        {/* Toggle unità */}
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
        <input
            type="checkbox"
        checked={showKmH}
        onChange={e => setShowKmH(e.target.checked)}
        />
        Mostra anche km/h
        </label>
        </ResponsiveCard>
    );

        const ValuesPanel = (
            <ResponsiveCard>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: COLORS.text }}>
    📊 Valori istantanei
        </div>

        <div style={{ display: "grid", gap: 12 }}>
        {/* Tempo */}
        <div style={{ padding: 12, background: "#f8fafc", borderRadius: 8, borderLeft: `4px solid ${COLORS.text}` }}>
        <div style={{ fontSize: 12, color: "#64748b" }}>Tempo</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.text }}>
        t = {formatNumber(currentT, 2)} s
        </div>
        {showKmH && (
            <div style={{ fontSize: 12, color: "#94a3b8" }}>
            = {formatTime(currentT)}
                </div>
        )}
        </div>

        {/* Posizione */}
        <div style={{ padding: 12, background: `${COLORS.position}10`, borderRadius: 8, borderLeft: `4px solid ${COLORS.position}` }}>
        <div style={{ fontSize: 12, color: "#64748b" }}>Posizione</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.position }}>
        x = {formatNumber(currentState.x, 2)} m
        </div>
        {showKmH && (
            <div style={{ fontSize: 12, color: "#94a3b8" }}>
            = {formatNumber(mToKm(currentState.x), 4)} km
        </div>
        )}
        </div>

        {/* Velocità */}
        <div style={{ padding: 12, background: `${COLORS.velocity}10`, borderRadius: 8, borderLeft: `4px solid ${COLORS.velocity}` }}>
        <div style={{ fontSize: 12, color: "#64748b" }}>Velocità</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.velocity }}>
        v = {formatNumber(currentState.v, 2)} m/s
        </div>
        {showKmH && (
            <div style={{ fontSize: 12, color: "#94a3b8" }}>
            = {formatNumber(msToKmh(currentState.v), 2)} km/h
        </div>
        )}
        </div>

        {/* Accelerazione */}
        <div style={{ padding: 12, background: `${COLORS.acceleration}10`, borderRadius: 8, borderLeft: `4px solid ${COLORS.acceleration}` }}>
        <div style={{ fontSize: 12, color: "#64748b" }}>Accelerazione</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.acceleration }}>
        a = {formatNumber(currentState.a, 2)} m/s²
                    </div>
        {currentState.stopped && (
            <div style={{ fontSize: 12, color: "#ef4444", fontWeight: 600 }}>
        ⚠️ Veicolo fermo (t_stop = {formatNumber(currentState.tStop || 0, 2)} s)
            </div>
        )}
        </div>
        </div>
        </ResponsiveCard>
    );

        const FormulasPanel = (
            <CollapsiblePanel title="📐 Formule MUA" defaultOpen={!isMobile}>
        <div style={{ display: "grid", gap: 16, fontSize: 14 }}>
        <div>
            <div style={{ fontWeight: 600, color: COLORS.position, marginBottom: 4 }}>Legge oraria</div>
        <div style={{ background: "#f8fafc", padding: 12, borderRadius: 8 }}>
        <Latex>{"x(t) = x_0 + v_0 t + \\frac{1}{2}at^2"}</Latex>
        </div>
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
        <Latex>{`x(${formatNumber(currentT)}) = ${x0} + ${v0} \\cdot ${formatNumber(currentT)} + \\frac{1}{2} \\cdot ${acceleration} \\cdot ${formatNumber(currentT)}^2 = ${formatNumber(currentState.x)} \\text{ m}`}</Latex>
        </div>
        </div>

        <div>
        <div style={{ fontWeight: 600, color: COLORS.velocity, marginBottom: 4 }}>Legge della velocità</div>
        <div style={{ background: "#f8fafc", padding: 12, borderRadius: 8 }}>
        <Latex>{"v(t) = v_0 + at"}</Latex>
        </div>
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
        <Latex>{`v(${formatNumber(currentT)}) = ${v0} + ${acceleration} \\cdot ${formatNumber(currentT)} = ${formatNumber(currentState.v)} \\text{ m/s}`}</Latex>
        </div>
        </div>

        <div>
        <div style={{ fontWeight: 600, color: COLORS.acceleration, marginBottom: 4 }}>Accelerazione</div>
        <div style={{ background: "#f8fafc", padding: 12, borderRadius: 8 }}>
        <Latex>{"a = \\text{costante}"}</Latex>
        </div>
        </div>

        {currentState.tStop !== null && (
            <div>
                <div style={{ fontWeight: 600, color: "#ef4444", marginBottom: 4 }}>Tempo di arresto</div>
        <div style={{ background: "#fef2f2", padding: 12, borderRadius: 8 }}>
            <Latex>{"t_{stop} = -\\frac{v_0}{a}"}</Latex>
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
            <Latex>{`t_{stop} = -\\frac{${v0}}{${acceleration}} = ${formatNumber(currentState.tStop)} \\text{ s}`}</Latex>
        </div>
        </div>
        )}
        </div>
        </CollapsiblePanel>
    );

        const ConversionPanel = (
            <CollapsiblePanel title="🔄 Conversione unità" defaultOpen={false}>
        <div style={{ display: "grid", gap: 12, fontSize: 13 }}>
        <div style={{ padding: 10, background: "#f8fafc", borderRadius: 6 }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Velocità</div>
        <Latex>{"1 \\text{ m/s} = 3.6 \\text{ km/h}"}</Latex>
        <div style={{ marginTop: 8, color: "#64748b" }}>
        <Latex>{`v = ${formatNumber(currentState.v)} \\text{ m/s} = ${formatNumber(currentState.v)} \\times 3.6 = ${formatNumber(msToKmh(currentState.v))} \\text{ km/h}`}</Latex>
        </div>
        </div>

        <div style={{ padding: 10, background: "#f8fafc", borderRadius: 6 }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Distanza</div>
        <Latex>{"1 \\text{ km} = 1000 \\text{ m}"}</Latex>
        <div style={{ marginTop: 8, color: "#64748b" }}>
        <Latex>{`x = ${formatNumber(currentState.x)} \\text{ m} = ${formatNumber(mToKm(currentState.x), 4)} \\text{ km}`}</Latex>
        </div>
        </div>

        <div style={{ padding: 10, background: "#f8fafc", borderRadius: 6 }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Tempo</div>
        <Latex>{"1 \\text{ h} = 3600 \\text{ s}"}</Latex>
        <div style={{ marginTop: 8, color: "#64748b" }}>
        <Latex>{`t = ${formatNumber(currentT)} \\text{ s} = ${formatNumber(sToH(currentT), 6)} \\text{ h}`}</Latex>
        </div>
        </div>
        </div>
        </CollapsiblePanel>
    );

        // ============ RENDER ============

        return (
            <DemoContainer
                title="Moto Uniformemente Accelerato"
        description="Simulazione interattiva con grafici x(t), v(t), a(t)"
        maxWidth={1300}
        >
        {/* Controlli Play/Pause e Slider tempo */}
        <ResponsiveCard>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <button
            onClick={() => setIsPlaying(!isPlaying)}
        style={{
            padding: "12px 24px",
                fontSize: 16,
                fontWeight: 600,
                background: isPlaying ? "#ef4444" : "#22c55e",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                minWidth: 120,
                justifyContent: "center",
        }}
    >
        {isPlaying ? "⏸ Pausa" : "▶ Play"}
        </button>

        <button
        onClick={handleReset}
        style={{
            padding: "12px 24px",
                fontSize: 16,
                fontWeight: 600,
                background: "#f1f5f9",
                color: "#475569",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                cursor: "pointer",
        }}
    >
    ↺ Reset
        </button>

        <div style={{ flex: 1, minWidth: 200 }}>
        <label style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
        <span>Tempo</span>
        <span style={{ fontWeight: 600 }}>{formatNumber(currentT, 2)} s / {maxT} s</span>
        </label>
        <input
        type="range"
        min={0}
        max={maxT}
        step={0.01}
        value={currentT}
        onChange={e => { setCurrentT(Number(e.target.value)); setIsPlaying(false); }}
        style={{ width: "100%", accentColor: COLORS.accent }}
        />
        </div>
        </div>
        </ResponsiveCard>

        {/* Animazione */}
        <ResponsiveCard>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12, color: COLORS.text }}>
    🚗 Animazione
        </div>
        <div style={{ overflowX: "auto" }}>
        <Animation
            params={params}
        currentT={currentT}
        maxT={maxT}
        width={animationWidth}
        height={animationHeight}
        />
        </div>
        </ResponsiveCard>

        {/* ============ LAYOUT MOBILE ============ */}
        {isMobile && (
            <div style={{ display: "grid", gap: 12 }}>
            {ControlsPanel}
            {ValuesPanel}
            {FormulasPanel}
            {ConversionPanel}

            {/* Grafici impilati verticalmente */}
            <ResponsiveCard>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>📈 Grafici</div>
        <div style={{ display: "grid", gap: 16 }}>
            <div>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, color: COLORS.position }}>Posizione x(t)</div>
        <Graph
            data={graphData}
            currentT={currentT}
            width={graphWidth}
            height={graphHeight}
            dataKey="x"
            color={COLORS.position}
            label="x"
            unit="m"
            maxT={maxT}
            />
            </div>
            <div>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, color: COLORS.velocity }}>Velocità v(t)</div>
        <Graph
            data={graphData}
            currentT={currentT}
            width={graphWidth}
            height={graphHeight}
            dataKey="v"
            color={COLORS.velocity}
            label="v"
            unit="m/s"
            maxT={maxT}
            />
            </div>
            <div>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, color: COLORS.acceleration }}>Accelerazione a(t)</div>
        <Graph
            data={graphData}
            currentT={currentT}
            width={graphWidth}
            height={graphHeight}
            dataKey="a"
            color={COLORS.acceleration}
            label="a"
            unit="m/s²"
            maxT={maxT}
            />
            </div>
            </div>
            </ResponsiveCard>
            </div>
        )}

        {/* ============ LAYOUT TABLET ============ */}
        {isTablet && (
            <div style={{ display: "grid", gap: 16 }}>
            {/* Riga 1: Controlli e Valori affiancati */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {ControlsPanel}
            {ValuesPanel}
            </div>

            {/* Riga 2: Formule e Conversioni affiancate */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {FormulasPanel}
            {ConversionPanel}
            </div>

            {/* Riga 3: Grafici in griglia 2x2 */}
            <ResponsiveCard>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>📈 Grafici</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, color: COLORS.position }}>Posizione x(t)</div>
        <Graph
            data={graphData}
            currentT={currentT}
            width={graphWidth}
            height={graphHeight}
            dataKey="x"
            color={COLORS.position}
            label="x"
            unit="m"
            maxT={maxT}
            />
            </div>
            <div>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, color: COLORS.velocity }}>Velocità v(t)</div>
        <Graph
            data={graphData}
            currentT={currentT}
            width={graphWidth}
            height={graphHeight}
            dataKey="v"
            color={COLORS.velocity}
            label="v"
            unit="m/s"
            maxT={maxT}
            />
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "center" }}>
            <div>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, color: COLORS.acceleration }}>Accelerazione a(t)</div>
        <Graph
            data={graphData}
            currentT={currentT}
            width={graphWidth}
            height={graphHeight}
            dataKey="a"
            color={COLORS.acceleration}
            label="a"
            unit="m/s²"
            maxT={maxT}
            />
            </div>
            </div>
            </div>
            </ResponsiveCard>
            </div>
        )}

        {/* ============ LAYOUT DESKTOP ============ */}
        {!isMobile && !isTablet && (
            <div style={{ display: "grid", gridTemplateColumns: "320px 1fr 1fr", gap: 16 }}>
            {/* Colonna 1: Controlli + Formule + Conversioni */}
            <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
            {ControlsPanel}
            {FormulasPanel}
            {ConversionPanel}
            </div>

            {/* Colonna 2: Valori + Grafico posizione */}
            <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
            {ValuesPanel}
            <ResponsiveCard>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, color: COLORS.position }}>
        📈 Grafico x(t) - Posizione
        </div>
        <Graph
            data={graphData}
            currentT={currentT}
            width={graphWidth}
            height={graphHeight}
            dataKey="x"
            color={COLORS.position}
            label="x"
            unit="m"
            maxT={maxT}
            />
            </ResponsiveCard>
            </div>

            {/* Colonna 3: Grafici velocità e accelerazione */}
            <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
            <ResponsiveCard>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, color: COLORS.velocity }}>
        📈 Grafico v(t) - Velocità
        </div>
        <Graph
            data={graphData}
            currentT={currentT}
            width={graphWidth}
            height={graphHeight}
            dataKey="v"
            color={COLORS.velocity}
            label="v"
            unit="m/s"
            maxT={maxT}
            />
            </ResponsiveCard>
            <ResponsiveCard>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, color: COLORS.acceleration }}>
        📈 Grafico a(t) - Accelerazione
        </div>
        <Graph
            data={graphData}
            currentT={currentT}
            width={graphWidth}
            height={graphHeight}
            dataKey="a"
            color={COLORS.acceleration}
            label="a"
            unit="m/s²"
            maxT={maxT}
            />
            </ResponsiveCard>
            </div>
            </div>
        )}
        </DemoContainer>
    );
    }