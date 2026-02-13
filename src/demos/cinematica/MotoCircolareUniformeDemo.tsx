/**
 * MottoCircolareUniformeDemo - Moto Circolare Uniforme
 *
 * Caratteristiche aggiornate:
 * - Sfondo bianco per migliore visibilità
 * - Angolo corretto e centrato
 * - Un solo oggetto con selezione migliorata
 * - Formule semplificate senza componenti cartesiane
 * - Rimossa unità RPM
 * - Aggiunto tasto per calcolo periodo
 * - Osservazioni migliorate con definizioni di periodo e frequenza
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
    Latex,
    DemoContainer,
    ResponsiveCard,
    CollapsiblePanel,
    useBreakpoint,
} from "../../components/ui";
import {
    toRadians,
    toDegrees,
    normalizeAngle,
} from "../../utils/math";

// ============ TIPI ============

interface CircularMotionState {
    t: number;            // tempo (s)
    theta: number;        // angolo (rad) - posizione angolare
    x: number;           // posizione x (m)
    y: number;           // posizione y (m)
    vx: number;          // velocità x (m/s) - componente tangenziale
    vy: number;          // velocità y (m/s)
    ax: number;          // accelerazione x (m/s²) - componente centripeta
    ay: number;          // accelerazione y (m/s²)
    v: number;           // velocità lineare (m/s) - magnitudine costante
    a: number;           // accelerazione centripeta (m/s²) - magnitudine costante
    omega: number;       // velocità angolare (rad/s)
    alpha: number;       // accelerazione angolare (rad/s²) - zero per uniforme
    period: number;      // periodo (s)
    frequency: number;   // frequenza (Hz)
    completedRevolutions: number; // numero di rivoluzioni completate
}

interface CircularMotionParams {
    radius: number;       // raggio (m)
    omega0: number;       // velocità angolare iniziale (rad/s)
    theta0: number;       // angolo iniziale (rad)
}

interface CircularObject {
    name: string;
    icon: string;
    size: number;        // dimensione emoji
    typicalRadius: number; // raggio tipico in m (per scala)
    color: string;
    description: string;
}

// ============ COSTANTI ============

const TAU = 2 * Math.PI;

const COLORS = {
    position: "#8b5cf6",    // viola - posizione angolare
    velocity: "#22c55e",    // verde - velocità
    acceleration: "#ef4444", // rosso - accelerazione
    xComponent: "#3b82f6",   // blu - componente x
    yComponent: "#f59e0b",   // arancione - componente y
    object1: "#3b82f6",      // blu - oggetto
    text: "#334155",
    grid: "#e2e8f0",
    axis: "#64748b",
    angleArc: "#8b5cf6",     // viola per arco angolo
    angleText: "#8b5cf6",    // viola per testo angolo
};

// Oggetti per il moto circolare (nuova selezione)
const CIRCULAR_OBJECTS: CircularObject[] = [
    { name: "Palla", icon: "⚽", size: 32, typicalRadius: 0.11, color: "#8b5cf6", description: "Palla che ruota" },
    { name: "Terra", icon: "🌍", size: 36, typicalRadius: 6.371e6, color: "#3b82f6", description: "Rotazione terrestre" },
    { name: "Elettrone", icon: "⚡", size: 24, typicalRadius: 5.29e-11, color: "#f59e0b", description: "Elettrone in atomo di Bohr" },
    { name: "Giostra", icon: "🎠", size: 40, typicalRadius: 5, color: "#10b981", description: "Cavallo della giostra" },
    { name: "Satellite", icon: "🛰️", size: 36, typicalRadius: 10000, color: "#3b82f6", description: "Satellite artificiale in orbita" },
    { name: "Luna", icon: "🌕", size: 38, typicalRadius: 1.737e6, color: "#94a3b8", description: "Orbita lunare" },
];

// ============ UTILITÀ ============

function formatNumber(n: number, decimals: number = 2): string {
    if (Math.abs(n) < 0.001) return "0";
    if (Math.abs(n) >= 1e6) return n.toExponential(decimals);
    if (Math.abs(n) < 0.01) return n.toExponential(decimals);
    return n.toFixed(decimals);
}

function radPerSecToHz(rads: number): number {
    return rads / TAU;
}

function hzToRadPerSec(hz: number): number {
    return hz * TAU;
}

function FormulaRow({
                        title,
                        color,
                        formula,
                        numeric,
                        note,
                    }: {
    title: string;
    color: string;
    formula: React.ReactNode;
    numeric: React.ReactNode;
    note?: React.ReactNode;
}) {
    return (
        <div>
            <div style={{ fontWeight: 600, color, marginBottom: 4 }}>{title}</div>

            <div
                style={{
                    background: "#f8fafc",
                    padding: 10,
                    borderRadius: 8,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                    alignItems: "start",
                }}
            >
                <div>{formula}</div>
                <div
                    style={{
                        paddingLeft: 10,
                        borderLeft: "2px solid #e2e8f0",
                        color: "#0f172a",
                    }}
                >
                    {numeric}
                </div>
            </div>

            {note && (
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>
                    {note}
                </div>
            )}
        </div>
    );
}


// Calcola lo stato del moto circolare a un dato istante
function calculateCircularMotion(params: CircularMotionParams, t: number): CircularMotionState {
    const { radius, omega0, theta0 } = params;

    // Angolo al tempo t: θ(t) = θ₀ + ωt
    const theta = normalizeAngle(theta0 + omega0 * t);

    // Posizione: x = r·cos(θ), y = r·sin(θ)
    const x = radius * Math.cos(theta);
    const y = radius * Math.sin(theta);

    // Velocità lineare: v = ωr
    const v = Math.abs(omega0) * radius;

    // Componenti velocità: v_x = -ωr·sin(θ), v_y = ωr·cos(θ)
    const vx = -omega0 * radius * Math.sin(theta);
    const vy = omega0 * radius * Math.cos(theta);

    // Accelerazione centripeta: a = ω²r = v²/r
    const a = omega0 * omega0 * radius;

    // Componenti accelerazione: a_x = -ω²r·cos(θ), a_y = -ω²r·sin(θ)
    const ax = -omega0 * omega0 * radius * Math.cos(theta);
    const ay = -omega0 * omega0 * radius * Math.sin(theta);

    // Periodo e frequenza
    const period = Math.abs(omega0) > 0 ? TAU / Math.abs(omega0) : Infinity;
    const frequency = period !== Infinity ? 1 / period : 0;

    // Numero di rivoluzioni completate
    const completedRevolutions = Math.floor((theta0 + omega0 * t) / TAU);

    return {
        t,
        theta,
        x,
        y,
        vx,
        vy,
        ax,
        ay,
        v,
        a,
        omega: omega0,
        alpha: 0,
        period,
        frequency,
        completedRevolutions,
    };
}

// ============ COMPONENTE ANIMAZIONE ============

interface AnimationCircularProps {
    params1: CircularMotionParams;
    currentT: number;
    maxT: number;
    width: number;
    height: number;
    object1: CircularObject;
    showVelocity: boolean;
    showAcceleration: boolean;
    showTrajectory: boolean;
}

function AnimationCircular({ params1, currentT, maxT, width, height, object1, showVelocity, showAcceleration, showTrajectory }: AnimationCircularProps) {
    const state1 = calculateCircularMotion(params1, currentT);

    // Calcola dimensioni
    const centerX = width / 2;
    const centerY = height / 2;

    // Raggio massimo per la visualizzazione
    const maxRadius = Math.max(params1.radius, 1);
    const scale = Math.min(width, height) * 0.35 / maxRadius;

    // Posizioni
    const x1 = centerX + state1.x * scale;
    const y1 = centerY + state1.y * scale;

    // Lunghezza vettori
    const vScale = 0.8 * scale; // Scala per vettori velocità
    const aScale = 0.6 * scale; // Scala per vettori accelerazione

    // Angolo θ: calcola il punto sull'arco di raggio più piccolo
    const angleRadius = 30; // Raggio fisso per l'arco dell'angolo
    const angleStartX = centerX + angleRadius;
    const angleStartY = centerY;

    // L'angolo deve seguire il senso del moto (antiorario per ω positivo)
    const angleEndX = centerX + angleRadius * Math.cos(state1.theta);
    const angleEndY = centerY - angleRadius * Math.sin(state1.theta);

    // Calcola se l'angolo è maggiore di 180° per il flag large-arc
    const largeArcFlag = state1.theta > Math.PI ? 1 : 0;

    // Posizione per l'etichetta dell'angolo (a metà arco)
    const midAngle = state1.theta / 2;
    const labelRadius = angleRadius * 1.4;
    const labelX = centerX + labelRadius * Math.cos(midAngle);
    const labelY = centerY - labelRadius * Math.sin(midAngle);

    return (
        <svg width={width} height={height} style={{ display: 'block' }}>
            {/* Sfondo bianco */}
            <rect x={0} y={0} width={width} height={height} fill="white" />

            {/* Traiettoria oggetto */}
            {showTrajectory && (
                <circle
                    cx={centerX}
                    cy={centerY}
                    r={params1.radius * scale}
                    fill="none"
                    stroke="rgba(59, 130, 246, 0.3)"
                    strokeWidth={2}
                    strokeDasharray="4,4"
                />
            )}

            {/* Raggio oggetto */}
            <line
                x1={centerX}
                y1={centerY}
                x2={x1}
                y2={y1}
                stroke="#94a3b8"
                strokeWidth={1.5}
                strokeDasharray="6,3"
            />
            <text
                x={(centerX + x1) / 2}
                y={(centerY + y1) / 2 - 10}
                textAnchor="middle"
                fontSize={11}
                fill="#64748b"
            >
                r = {formatNumber(params1.radius, 2)} m
            </text>

            {/* Centro */}
            <circle cx={centerX} cy={centerY} r={6} fill="#ef4444" />
            <text x={centerX + 10} y={centerY - 10} fontSize={12} fill="#ef4444" fontWeight={600}>
                Centro
            </text>

            {/* Vettore velocità (tangente) - mostrato solo se showVelocity è true */}
            {showVelocity && (
                <>
                    <defs>
                        <marker id="arrowV1" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill={COLORS.velocity} />
                        </marker>
                    </defs>
                    <line
                        x1={x1}
                        y1={y1}
                        x2={x1 + state1.vx * vScale}
                        y2={y1 + state1.vy * vScale}
                        stroke={COLORS.velocity}
                        strokeWidth={3}
                        markerEnd="url(#arrowV1)"
                    />
                    <text
                        x={x1 + state1.vx * vScale / 2 + 15}
                        y={y1 + state1.vy * vScale / 2}
                        fontSize={11}
                        fill={COLORS.velocity}
                        fontWeight={600}
                    >
                        v = {formatNumber(state1.v, 2)} m/s
                    </text>
                </>
            )}

            {/* Vettore accelerazione (centripeta, verso il centro) - mostrato solo se showAcceleration è true */}
            {showAcceleration && (
                <>
                    <defs>
                        <marker id="arrowA1" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill={COLORS.acceleration} />
                        </marker>
                    </defs>
                    <line
                        x1={x1}
                        y1={y1}
                        x2={x1 + state1.ax * aScale}
                        y2={y1 + state1.ay * aScale}
                        stroke={COLORS.acceleration}
                        strokeWidth={3}
                        markerEnd="url(#arrowA1)"
                    />
                    <text
                        x={x1 + state1.ax * aScale / 2 - 15}
                        y={y1 + state1.ay * aScale / 2 - 15}
                        fontSize={11}
                        fill={COLORS.acceleration}
                        fontWeight={600}
                    >
                        a = {formatNumber(state1.a, 2)} m/s²
                    </text>
                </>
            )}

            {/* Oggetto */}
            <g>
                <circle cx={x1} cy={y1} r={object1.size / 2} fill={object1.color} opacity={0.2} />
                <text
                    x={x1}
                    y={y1 + object1.size * 0.35}
                    textAnchor="middle"
                    fontSize={object1.size}
                    style={{ userSelect: "none" }}
                >
                    {object1.icon}
                </text>
                <text
                    x={x1}
                    y={y1 + object1.size + 15}
                    textAnchor="middle"
                    fontSize={12}
                    fill={object1.color}
                    fontWeight={600}
                >
                    {object1.name}
                </text>
            </g>

            {/* Visualizzazione angolo θ - CORRETTA e centrata */}
            <g>
                {/* Linea orizzontale di riferimento (asse x positivo) */}
                <line
                    x1={centerX}
                    y1={centerY}
                    x2={centerX + angleRadius}
                    y2={centerY}
                    stroke="#94a3b8"
                    strokeWidth={1.5}
                    strokeDasharray="3,3"
                />

                {/* Arco dell'angolo - sweep-flag=0 per senso antiorario (standard matematico) */}
                <path
                    d={`
                        M ${angleStartX} ${angleStartY}
                        A ${angleRadius} ${angleRadius} 0 ${largeArcFlag} 0 ${angleEndX} ${angleEndY}
                    `}
                    fill="none"
                    stroke={COLORS.angleArc}
                    strokeWidth={2}
                />

                {/* Linea dal centro al punto sull'arco */}
                <line
                    x1={centerX}
                    y1={centerY}
                    x2={angleEndX}
                    y2={angleEndY}
                    stroke="#94a3b8"
                    strokeWidth={1.5}
                    strokeDasharray="3,3"
                />

                {/* Etichetta dell'angolo */}
                <text
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    fontSize={12}
                    fill={COLORS.angleText}
                    fontWeight={600}
                >
                    θ = {formatNumber(toDegrees(state1.theta), 1)}°
                </text>
            </g>

            {/* Info tempo e velocità */}
            <g transform={`translate(20, 30)`}>
                <text fontSize={14} fontWeight={600} fill={COLORS.text}>
                    t = {formatNumber(currentT, 2)} s
                </text>
                <text y={20} fontSize={13} fill={COLORS.text}>
                    ω = {formatNumber(state1.omega, 3)} rad/s
                </text>
                <text y={40} fontSize={13} fill={COLORS.text}>
                    T = {formatNumber(state1.period, 2)} s
                </text>
            </g>
        </svg>
    );
}

// ============ COMPONENTE PRINCIPALE ============

export default function MottoCircolareUniformeDemo() {
    const { isMobile, isTablet } = useBreakpoint();

    // Parametri simulazione
    const [radius, setRadius] = useState(5);
    const [omega, setOmega] = useState(2); // rad/s
    const [theta0, setTheta0] = useState(0); // rad
    const [selectedObject, setSelectedObject] = useState(0);
    const [currentT, setCurrentT] = useState(0);
    const [maxT, setMaxT] = useState(10);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showVelocity, setShowVelocity] = useState(false);
    const [showAcceleration, setShowAcceleration] = useState(false);
    const [showTrajectory, setShowTrajectory] = useState(true);
    const [omegaUnit, setOmegaUnit] = useState<"rad/s" | "hz">("rad/s");
    const [showPeriodExplanation, setShowPeriodExplanation] = useState(false);

    const object1 = CIRCULAR_OBJECTS[selectedObject];

    const animationRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);

    // Converti omega in unità correnti
    const omegaInRadPerSec = useMemo(() => {
        switch (omegaUnit) {
            case "hz": return hzToRadPerSec(omega);
            default: return omega;
        }
    }, [omega, omegaUnit]);

    // Params per oggetto
    const params1: CircularMotionParams = useMemo(() => ({
        radius,
        omega0: omegaInRadPerSec,
        theta0: toRadians(theta0),
    }), [radius, omegaInRadPerSec, theta0]);

    // Stato corrente oggetto
    const currentState1 = useMemo(() => calculateCircularMotion(params1, currentT), [params1, currentT]);

    // Calcola periodo massimo per impostare maxT
    useEffect(() => {
        const period = currentState1.period;
        if (period > 0 && period < 60) {
            setMaxT(Math.max(10, period * 2));
        }
    }, [currentState1.period]);

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
                        return 0; // Reset al completamento
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

    // Reset
    const handleReset = useCallback(() => {
        setCurrentT(0);
        setIsPlaying(false);
    }, []);

    // Preset scenari (rimossi RPM)
    const presets = [
        { name: "Orbita lenta", radius: 10, omega: 0.5, unit: "rad/s" as const },
        { name: "Ruota media", radius: 5, omega: 2, unit: "rad/s" as const },
        { name: "Ventola veloce", radius: 0.3, omega: 20, unit: "rad/s" as const },
        { name: "1 Hz", radius: 2, omega: 1, unit: "hz" as const },
        { name: "0.1 Hz", radius: 3, omega: 0.1, unit: "hz" as const },
    ];

    const applyPreset = (preset: typeof presets[0]) => {
        setRadius(preset.radius);
        setOmega(preset.omega);
        setOmegaUnit(preset.unit);
        handleReset();
    };

    // Tasto per spiegare il periodo
    const handlePeriodExplanation = () => {
        setShowPeriodExplanation(!showPeriodExplanation);
    };

    // Dimensioni responsive
    const animationWidth = isMobile ? 320 : isTablet ? 400 : 400;
    const animationHeight = isMobile ? 320 : isTablet ? 400 : 400;

    // ============ PANNELLI UI ============

    const ControlsPanel = (
        <ResponsiveCard>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: COLORS.text }}>
                ⚙️ Parametri di controllo
            </div>

            {/* Selezione oggetto */}
            <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
                    Seleziona oggetto:
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {CIRCULAR_OBJECTS.map((obj, i) => (
                        <button
                            key={i}
                            onClick={() => { setSelectedObject(i); handleReset(); }}
                            title={`${obj.name}\nr tipico = ${obj.typicalRadius.toExponential(2)} m`}
                            style={{
                                padding: "6px 10px",
                                fontSize: 20,
                                background: selectedObject === i ? "#dbeafe" : "#f1f5f9",
                                border: selectedObject === i ? `2px solid ${obj.color}` : "2px solid transparent",
                                borderRadius: 8,
                                cursor: "pointer",
                                transition: "all 0.2s",
                            }}
                        >
                            {obj.icon}
                        </button>
                    ))}
                </div>
                <div style={{ fontSize: 11, color: object1.color, marginTop: 4 }}>
                    {object1.icon} <strong>{object1.name}</strong>
                </div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                    {object1.description}
                </div>
            </div>

            {/* Preset */}
            <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>Scenari tipici:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {presets.map((preset, i) => (
                        <button
                            key={i}
                            onClick={() => applyPreset(preset)}
                            style={{
                                padding: "6px 10px",
                                fontSize: 11,
                                background: "#f1f5f9",
                                border: "1px solid #e2e8f0",
                                borderRadius: 6,
                                cursor: "pointer",
                            }}
                        >
                            {preset.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Raggio */}
            <div style={{ marginBottom: 12 }}>
                <label style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                    <span>Raggio r</span>
                    <span style={{ color: COLORS.position, fontWeight: 600 }}>{formatNumber(radius, 2)} m</span>
                </label>
                <input
                    type="range"
                    min={0.1}
                    max={50}
                    step={0.1}
                    value={radius}
                    onChange={e => { setRadius(Number(e.target.value)); handleReset(); }}
                    style={{ width: "100%", accentColor: COLORS.position }}
                />
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2, display: "flex", justifyContent: "space-between" }}>
                    <span>0.1 m</span>
                    <span>25 m</span>
                    <span>50 m</span>
                </div>
            </div>

            {/* Velocità angolare */}
            <div style={{ marginBottom: 12 }}>
                <label style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                    <span>Velocità angolare ω</span>
                    <span style={{ color: COLORS.velocity, fontWeight: 600 }}>
                        {formatNumber(omega, 2)} {omegaUnit}
                    </span>
                </label>
                <input
                    type="range"
                    min={0.1}
                    max={omegaUnit === "rad/s" ? 10 : 5}
                    step={omegaUnit === "rad/s" ? 0.1 : 0.1}
                    value={omega}
                    onChange={e => { setOmega(Number(e.target.value)); handleReset(); }}
                    style={{ width: "100%", accentColor: COLORS.velocity }}
                />
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2, display: "flex", justifyContent: "space-between" }}>
                    <span>0.1 {omegaUnit}</span>
                    <span>
                        {omegaUnit === "rad/s" ? "5 rad/s" : "2.5 Hz"}
                    </span>
                    <span>
                        {omegaUnit === "rad/s" ? "10 rad/s" : "5 Hz"}
                    </span>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    {(["rad/s", "hz"] as const).map(unit => (
                        <button
                            key={unit}
                            onClick={() => {
                                // Converti il valore corrente nella nuova unità
                                let newOmega = omega;
                                if (omegaUnit === "rad/s" && unit === "hz") newOmega = radPerSecToHz(omega);
                                if (omegaUnit === "hz" && unit === "rad/s") newOmega = hzToRadPerSec(omega);
                                setOmega(newOmega);
                                setOmegaUnit(unit);
                                handleReset();
                            }}
                            style={{
                                padding: "4px 8px",
                                fontSize: 11,
                                background: omegaUnit === unit ? "#dbeafe" : "#f1f5f9",
                                border: omegaUnit === unit ? "1px solid #3b82f6" : "1px solid #e2e8f0",
                                borderRadius: 4,
                                cursor: "pointer",
                            }}
                        >
                            {unit === "rad/s" ? "rad/s" : "Hz"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Angolo iniziale */}
            <div style={{ marginBottom: 12 }}>
                <label style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                    <span>Angolo iniziale θ₀</span>
                    <span style={{ color: "#8b5cf6", fontWeight: 600 }}>{theta0}°</span>
                </label>
                <input
                    type="range"
                    min={0}
                    max={360}
                    step={1}
                    value={theta0}
                    onChange={e => { setTheta0(Number(e.target.value)); handleReset(); }}
                    style={{ width: "100%", accentColor: "#8b5cf6" }}
                />
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2, display: "flex", justifyContent: "space-between" }}>
                    <span>0°</span>
                    <span>180°</span>
                    <span>360°</span>
                </div>
            </div>

            {/* Checkbox separate per vettori */}
            <div style={{ display: "grid", gap: 8, marginTop: 16 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                    <input
                        type="checkbox"
                        checked={showVelocity}
                        onChange={e => setShowVelocity(e.target.checked)}
                    />
                    Mostra vettore velocità (v)
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                    <input
                        type="checkbox"
                        checked={showAcceleration}
                        onChange={e => setShowAcceleration(e.target.checked)}
                    />
                    Mostra vettore accelerazione (a)
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                    <input
                        type="checkbox"
                        checked={showTrajectory}
                        onChange={e => setShowTrajectory(e.target.checked)}
                    />
                    Mostra traiettoria circolare
                </label>
            </div>

            {/* Tasto per spiegare il periodo */}
            <div style={{ marginTop: 16 }}>
                <button
                    onClick={handlePeriodExplanation}
                    style={{
                        width: "100%",
                        padding: "8px 12px",
                        fontSize: 13,
                        background: showPeriodExplanation ? "#e0f2fe" : "#f0f9ff",
                        border: "1px solid #0ea5e9",
                        borderRadius: 8,
                        color: "#0369a1",
                        cursor: "pointer",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    <span style={{ fontSize: 16 }}>⏱️</span>
                    <span style={{ flex: 1 }}>
                        <strong>Come si calcola il periodo T?</strong>
                    </span>
                    <span>{showPeriodExplanation ? "▼" : "▶"}</span>
                </button>

                {showPeriodExplanation && (
                    <div style={{
                        marginTop: 10,
                        padding: "12px",
                        background: "#f0f9ff",
                        border: "1px solid #bae6fd",
                        borderRadius: 8,
                        fontSize: 12,
                        color: "#0c4a6e",
                    }}>
                        <div style={{ marginBottom: 8 }}>
                            <strong>Il periodo T è il tempo necessario per compiere un giro completo (360°).</strong>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                            Se l'oggetto impiega {formatNumber(currentState1.period, 2)} secondi per fare un giro, significa che:
                        </div>
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                            <li>Dopo {formatNumber(currentState1.period, 2)} s, l'angolo θ aumenta di 360° (2π rad)</li>
                            <li>La frequenza f = 1/T = {formatNumber(currentState1.frequency, 3)} Hz</li>
                            <li>Formula: T = 2π/ω = 2π/{formatNumber(currentState1.omega, 3)} = {formatNumber(currentState1.period, 2)} s</li>
                        </ul>
                        <div style={{ marginTop: 8, fontStyle: "italic" }}>
                            Prova a far compiere un giro completo all'oggetto e misura il tempo impiegato!
                        </div>
                    </div>
                )}
            </div>
        </ResponsiveCard>
    );

    const ValuesPanel = (
        <ResponsiveCard>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: COLORS.text }}>
                📊 Valori istantanei
            </div>

            <div style={{ display: "grid", gap: 10 }}>
                {/* Tempo e periodo */}
                <div style={{ padding: 10, background: "#f8fafc", borderRadius: 8, borderLeft: `4px solid ${COLORS.text}` }}>
                    <div style={{ fontSize: 11, color: "#64748b" }}>Parametri temporali</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 6 }}>
                        <div>
                            <div style={{ fontSize: 12, color: "#64748b" }}>Tempo</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.text }}>
                                t = {formatNumber(currentState1.t, 2)} s
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: 12, color: "#64748b" }}>Periodo</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.position }}>
                                T = {formatNumber(currentState1.period, 2)} s
                            </div>
                        </div>
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>
                        Frequenza: f = {formatNumber(currentState1.frequency, 3)} Hz
                        <br />
                        Rivoluzioni: {currentState1.completedRevolutions}
                    </div>
                </div>

                {/* Oggetto - Posizione e angolo */}
                <div style={{ padding: 10, background: "#dbeafe", borderRadius: 8, borderLeft: "4px solid #3b82f6" }}>
                    <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>
                        {object1.icon} {object1.name} - Posizione
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <div>
                            <div style={{ fontSize: 12, color: "#64748b" }}>Angolo θ</div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: "#8b5cf6" }}>
                                {formatNumber(toDegrees(currentState1.theta), 1)}°
                            </div>
                            <div style={{ fontSize: 10, color: "#94a3b8" }}>
                                {formatNumber(currentState1.theta, 3)} rad
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: 12, color: "#64748b" }}>Coordinate</div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: "#3b82f6" }}>
                                ({formatNumber(currentState1.x, 2)}, {formatNumber(currentState1.y, 2)})
                            </div>
                        </div>
                    </div>
                </div>

                {/* Oggetto - Velocità */}
                <div style={{ padding: 10, background: "#f0fdf4", borderRadius: 8, borderLeft: "4px solid #22c55e" }}>
                    <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>
                        {object1.icon} {object1.name} - Velocità
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <div>
                            <div style={{ fontSize: 12, color: "#64748b" }}>Lineare v</div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.velocity }}>
                                {formatNumber(currentState1.v, 2)} m/s
                            </div>
                            <div style={{ fontSize: 10, color: "#94a3b8" }}>
                                ω = {formatNumber(currentState1.omega, 3)} rad/s
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: 12, color: "#64748b" }}>Tangenziale</div>
                            <div style={{ fontSize: 12, color: "#3b82f6" }}>
                                v = ω·r
                            </div>
                            <div style={{ fontSize: 10, color: "#94a3b8" }}>
                                Diretta lungo la tangente
                            </div>
                        </div>
                    </div>
                </div>

                {/* Oggetto - Accelerazione */}
                <div style={{ padding: 10, background: "#fef2f2", borderRadius: 8, borderLeft: "4px solid #ef4444" }}>
                    <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>
                        {object1.icon} {object1.name} - Accelerazione
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <div>
                            <div style={{ fontSize: 12, color: "#64748b" }}>Centripeta a</div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.acceleration }}>
                                {formatNumber(currentState1.a, 2)} m/s²
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: 12, color: "#64748b" }}>Verso il centro</div>
                            <div style={{ fontSize: 12, color: "#3b82f6" }}>
                                a = ω²·r
                            </div>
                            <div style={{ fontSize: 10, color: "#94a3b8" }}>
                                Cambia direzione di v
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ResponsiveCard>
    );

    const FormulasPanel = (
        <ResponsiveCard>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: COLORS.text }}>
                📐 Formule del moto circolare uniforme
            </div>

            <div style={{ display: "grid", gap: 16, fontSize: 13 }}>
                {/* Definizione */}
                <div style={{ padding: 12, background: "#f0fdfa", borderRadius: 8 }}>
                    <div style={{ fontWeight: 600, color: "#0f766e", marginBottom: 8 }}>
                        🎯 Definizione
                    </div>
                    <div style={{ fontSize: 12, color: "#475569" }}>
                        Nel <strong>moto circolare uniforme</strong> un punto si muove su una circonferenza con{" "}
                        <strong>velocità angolare costante</strong> (ω = costante).
                    </div>
                </div>

                {/* 1. Legge oraria */}
                <div>
                    <div style={{ fontWeight: 600, color: COLORS.position, marginBottom: 4 }}>
                        1. Legge oraria angolare
                    </div>
                    <div style={{ background: "#f8fafc", padding: 12, borderRadius: 8 }}>
                        <Latex>{"\\theta(t) = \\theta_0 + \\omega t"}</Latex>
                    </div>

                    {/* valori sotto come nel MUA */}
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
                        <Latex>{`
            \\theta(${formatNumber(currentState1.t, 2)}) =
            ${formatNumber(params1.theta0, 3)} +
            ${formatNumber(currentState1.omega, 3)}\\cdot ${formatNumber(currentState1.t, 2)}
            = ${formatNumber(currentState1.theta, 3)}\\ \\text{rad}
            \\;\\;\\Big(\\approx ${formatNumber(toDegrees(currentState1.theta), 1)}^{\\circ}\\Big)
          `}</Latex>
                    </div>
                </div>

                {/* 2. Periodo e frequenza */}
                <div>
                    <div style={{ fontWeight: 600, color: "#8b5cf6", marginBottom: 4 }}>
                        2. Periodo e frequenza
                    </div>
                    <div style={{ background: "#f8fafc", padding: 12, borderRadius: 8, display: "grid", gap: 6 }}>
                        <Latex>{`T = \\frac{2\\pi}{\\omega}`}</Latex>
                        <Latex>{`f = \\frac{1}{T} = \\frac{\\omega}{2\\pi}`}</Latex>
                    </div>

                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 6, display: "grid", gap: 6 }}>
                        <Latex>{`
            T = \\frac{2\\pi}{${formatNumber(currentState1.omega, 3)}} =
            ${formatNumber(currentState1.period, 2)}\\ \\text{s}
          `}</Latex>
                        <Latex>{`
            f = \\frac{1}{T} =
            ${formatNumber(currentState1.frequency, 3)}\\ \\text{Hz}
          `}</Latex>
                    </div>
                </div>

                {/* 3. Velocità lineare */}
                <div>
                    <div style={{ fontWeight: 600, color: COLORS.velocity, marginBottom: 4 }}>
                        3. Velocità lineare e angolare
                    </div>
                    <div style={{ background: "#f8fafc", padding: 12, borderRadius: 8 }}>
                        <Latex>{`v = \\omega r`}</Latex>
                    </div>

                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
                        <Latex>{`
            v =
            ${formatNumber(currentState1.omega, 3)}\\cdot ${formatNumber(params1.radius, 2)}
            = ${formatNumber(currentState1.v, 2)}\\ \\text{m/s}
            \\;\\;\\Big(= ${formatNumber(currentState1.v * 3.6, 1)}\\ \\text{km/h}\\Big)
          `}</Latex>
                    </div>
                </div>

                {/* 4. Accelerazione centripeta */}
                <div>
                    <div style={{ fontWeight: 600, color: COLORS.acceleration, marginBottom: 4 }}>
                        4. Accelerazione centripeta
                    </div>
                    <div style={{ background: "#f8fafc", padding: 12, borderRadius: 8, display: "grid", gap: 6 }}>
                        <Latex>{`a_c = \\frac{v^2}{r} = \\omega^2 r`}</Latex>
                    </div>

                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 6, display: "grid", gap: 6 }}>
                        <Latex>{`
            a_c = \\frac{(${formatNumber(currentState1.v, 2)})^2}{${formatNumber(params1.radius, 2)}}
            = ${formatNumber((currentState1.v * currentState1.v) / params1.radius, 2)}\\ \\text{m/s}^2
          `}</Latex>
                        <Latex>{`
            a_c = (${formatNumber(currentState1.omega, 3)})^2\\cdot ${formatNumber(params1.radius, 2)}
            = ${formatNumber(currentState1.a, 2)}\\ \\text{m/s}^2
          `}</Latex>
                    </div>
                </div>

                {/* Note importanti */}
                <div style={{ padding: 12, background: "#fef3c7", borderRadius: 8 }}>
                    <div style={{ fontWeight: 600, color: "#92400e", marginBottom: 8 }}>
                        💡 Osservazioni importanti
                    </div>
                    <div style={{ fontSize: 12, color: "#78716c" }}>
                        1. <strong>Periodo (T)</strong>: tempo necessario per un giro completo.<br />
                        2. <strong>Frequenza (f)</strong>: numero di giri al secondo (f = 1/T).<br />
                        3. La <strong>velocità</strong> è tangente alla traiettoria.<br />
                        4. L’<strong>accelerazione</strong> è sempre verso il centro.<br />
                        5. <strong>v ⟂ a</strong>.
                    </div>
                </div>
            </div>
        </ResponsiveCard>
    );



    const ConversionPanel = (
        <CollapsiblePanel title="🔄 Conversioni unità" defaultOpen={false}>
            <div style={{ display: "grid", gap: 10, fontSize: 12 }}>
                <div style={{ padding: 8, background: "#f8fafc", borderRadius: 6 }}>
                    <Latex>{"1 \\text{ rad/s} = \\frac{1}{2\\pi} \\text{ Hz} \\approx 0.159 \\text{ Hz}"}</Latex>
                </div>
                <div style={{ padding: 8, background: "#f8fafc", borderRadius: 6 }}>
                    <Latex>{"1 \\text{ Hz} = 2\\pi \\text{ rad/s} \\approx 6.283 \\text{ rad/s}"}</Latex>
                </div>
                <div style={{ padding: 8, background: "#f8fafc", borderRadius: 6 }}>
                    <Latex>{`\\omega = ${formatNumber(omegaInRadPerSec, 3)} \\text{ rad/s} = ${formatNumber(radPerSecToHz(omegaInRadPerSec), 3)} \\text{ Hz}`}</Latex>
                </div>
                <div style={{ padding: 8, background: "#f0fdf4", borderRadius: 6 }}>
                    <div style={{ fontWeight: 600, color: "#166534" }}>Velocità lineare:</div>
                    <Latex>{`v = ${formatNumber(currentState1.v, 2)} \\text{ m/s} = ${formatNumber(currentState1.v * 3.6, 1)} \\text{ km/h}`}</Latex>
                </div>
            </div>
        </CollapsiblePanel>
    );

    const AnimationPanel = (
        <ResponsiveCard>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12, color: COLORS.text }}>
                🎯 Animazione moto circolare
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
                <AnimationCircular
                    params1={params1}
                    currentT={currentT}
                    maxT={maxT}
                    width={animationWidth}
                    height={animationHeight}
                    object1={object1}
                    showVelocity={showVelocity}
                    showAcceleration={showAcceleration}
                    showTrajectory={showTrajectory}
                />
            </div>
        </ResponsiveCard>
    );

    const PlaybackControls = (
        <ResponsiveCard>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    style={{
                        padding: "10px 20px",
                        fontSize: 15,
                        fontWeight: 600,
                        background: isPlaying ? "#ef4444" : "#22c55e",
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        cursor: "pointer",
                        minWidth: 100,
                    }}
                >
                    {isPlaying ? "⏸ Pausa" : "▶ Play"}
                </button>

                <button
                    onClick={handleReset}
                    style={{
                        padding: "10px 20px",
                        fontSize: 15,
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

                <div style={{ flex: 1, minWidth: 150 }}>
                    <label style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 2 }}>
                        <span>Tempo</span>
                        <span style={{ fontWeight: 600 }}>{formatNumber(currentT, 2)} s</span>
                    </label>
                    <input
                        type="range"
                        min={0}
                        max={maxT}
                        step={0.01}
                        value={currentT}
                        onChange={e => { setCurrentT(Number(e.target.value)); setIsPlaying(false); }}
                        style={{ width: "100%", accentColor: COLORS.position }}
                    />
                </div>
            </div>
        </ResponsiveCard>
    );

    // ============ RENDER ============

    return (
        <DemoContainer
            title="Moto Circolare Uniforme"
            description="Simulazione interattiva con vettori velocità e accelerazione centripeta"
            maxWidth={1300}
        >
            {/* Controlli Play */}
            {PlaybackControls}

            {/* ============ LAYOUT MOBILE ============ */}
            {isMobile && (
                <div style={{ display: "grid", gap: 12 }}>
                    {AnimationPanel}
                    {ControlsPanel}
                    {ValuesPanel}
                    {FormulasPanel}
                    {ConversionPanel}
                </div>
            )}

            {/* ============ LAYOUT TABLET ============ */}
            {isTablet && (
                <div style={{ display: "grid", gap: 16 }}>
                    {/* Riga 1: Animazione e Controlli */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        {AnimationPanel}
                        <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
                            {ControlsPanel}
                            {ValuesPanel}
                        </div>
                    </div>

                    {/* Riga 2: Formule */}
                    <div style={{ display: "grid", gap: 12 }}>
                        {FormulasPanel}
                        {ConversionPanel}
                    </div>
                </div>
            )}

            {/* ============ LAYOUT DESKTOP ============ */}
            {!isMobile && !isTablet && (
                <div style={{ display: "grid", gridTemplateColumns: "400px 1fr 1fr", gap: 16 }}>
                    {/* Colonna 1: Animazione */}
                    <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
                        {AnimationPanel}
                    </div>

                    {/* Colonna 2: Controlli + Valori */}
                    <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
                        {ControlsPanel}
                        {ValuesPanel}
                        {ConversionPanel}
                    </div>

                    {/* Colonna 3: Formule in evidenza */}
                    <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
                        {FormulasPanel}
                    </div>
                </div>
            )}
        </DemoContainer>
    );
}