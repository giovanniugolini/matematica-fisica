/**
 * CadutaLiberaDemo - Caduta Libera e Lancio Verticale
 *
 * Caratteristiche:
 * - Animazione verticale dell'oggetto
 * - Grafici y(t), v(t), a(t) in tempo reale
 * - Slider tempo interattivo
 * - Conversione unità m/s ↔ km/h
 * - Supporto lancio verso l'alto (v₀ > 0)
 * - Selezione gravità (Terra, Luna, Marte, Giove)
 * - Rilevamento impatto al suolo
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
    y: number;      // altezza (m)
    v: number;      // velocità (m/s) - positiva verso l'alto
    a: number;      // accelerazione (m/s²)
    landed: boolean; // true se ha toccato il suolo
    tLand: number | null; // tempo di atterraggio
    tApex: number | null; // tempo al punto più alto (se lanciato verso l'alto)
    yMax: number | null;  // altezza massima raggiunta
}

interface SimulationParams {
    y0: number;     // altezza iniziale (m)
    v0: number;     // velocità iniziale (m/s) - positiva verso l'alto
    g: number;      // accelerazione di gravità (m/s²)
    hasAtmosphere: boolean; // se simulare resistenza aria
    mass: number;   // massa oggetto (kg)
    CdA: number;    // coefficiente drag * area (m²)
}

interface Planet {
    name: string;
    g: number;
    icon: string;
    color: string;
    hasAtmosphere: boolean;
    // Colori ambiente
    skyTop: string;
    skyBottom: string;
    groundColor: string;
    groundAccent: string;
    groundType: "grass" | "rock" | "dust" | "gas";
}

// ============ COSTANTI ============

const PLANETS: Planet[] = [
    {
        name: "Terra", g: 9.81, icon: "🌍", color: "#3b82f6", hasAtmosphere: true,
        skyTop: "#0ea5e9", skyBottom: "#e0f2fe",
        groundColor: "#65a30d", groundAccent: "#4ade80",
        groundType: "grass"
    },
    {
        name: "Luna", g: 1.62, icon: "🌙", color: "#94a3b8", hasAtmosphere: false,
        skyTop: "#0f172a", skyBottom: "#1e293b",
        groundColor: "#6b7280", groundAccent: "#9ca3af",
        groundType: "rock"
    },
    {
        name: "Marte", g: 3.72, icon: "🔴", color: "#ef4444", hasAtmosphere: false,
        skyTop: "#fecaca", skyBottom: "#fef2f2",
        groundColor: "#dc2626", groundAccent: "#f87171",
        groundType: "dust"
    },
    {
        name: "Giove", g: 24.79, icon: "🟠", color: "#f59e0b", hasAtmosphere: false,
        skyTop: "#fed7aa", skyBottom: "#ffedd5",
        groundColor: "#d97706", groundAccent: "#fbbf24",
        groundType: "gas"
    },
];

interface FallingObject {
    name: string;
    icon: string;
    size: number;      // dimensione emoji
    mass: number;      // massa in kg
    CdA: number;       // coefficiente di drag * area frontale (m²)
    // v_t viene calcolato: v_t = sqrt(2mg / (ρ * CdA))
}

// Densità aria a livello del mare (kg/m³)
const RHO_AIR = 1.225;

// Calcola velocità terminale: v_t = sqrt(2mg / (ρ * CdA))
function calculateTerminalVelocity(mass: number, CdA: number, g: number = 9.81): number {
    return Math.sqrt((2 * mass * g) / (RHO_AIR * CdA));
}

// Oggetti con parametri fisici realistici
// CdA = Cd * A dove Cd è il coefficiente di drag e A l'area frontale
const OBJECTS: FallingObject[] = [
    // Sfere: Cd ≈ 0.47
    { name: "Palla da calcio", icon: "⚽", size: 36, mass: 0.43, CdA: 0.47 * 0.038 },      // A = π*0.11²
    { name: "Palla da basket", icon: "🏀", size: 38, mass: 0.62, CdA: 0.47 * 0.045 },     // A = π*0.12²

    // Oggetti irregolari: Cd ≈ 1.0-1.3
    { name: "Mela", icon: "🍎", size: 32, mass: 0.2, CdA: 0.8 * 0.005 },                   // piccola, tonda
    { name: "Mattone", icon: "🧱", size: 34, mass: 3.5, CdA: 1.0 * 0.023 },                // 23x11 cm
    { name: "Sasso", icon: "🪨", size: 32, mass: 2.0, CdA: 0.8 * 0.008 },                  // irregolare

    // Animali/persone: Cd ≈ 1.0-1.2
    { name: "Pinguino", icon: "🐧", size: 36, mass: 30, CdA: 0.9 * 0.12 },                 // aerodinamico
    { name: "Persona", icon: "🧍", size: 40, mass: 75, CdA: 1.0 * 0.7 },                   // in piedi, A ≈ 0.7m²
    { name: "Elefante", icon: "🐘", size: 46, mass: 5000, CdA: 1.1 * 6.0 },                // grande, A ≈ 6m²

    // Veicoli/macchine
    { name: "Robot sonda", icon: "🤖", size: 38, mass: 150, CdA: 1.2 * 0.8 },              // compatto
    { name: "Auto", icon: "🚗", size: 42, mass: 1500, CdA: 0.35 * 2.5 },                   // Cd auto ≈ 0.3-0.4

    // Paracadute: Cd ≈ 1.3-1.5, area grande
    { name: "Paracadutista", icon: "🪂", size: 40, mass: 80, CdA: 1.4 * 30 },              // paracadute ~30m²
];

const COLORS = {
    position: "#8b5cf6",    // viola
    velocity: "#22c55e",    // verde
    acceleration: "#ef4444", // rosso
    object: "#f59e0b",      // arancio
    ground: "#65a30d",      // verde scuro
    sky: "#0ea5e9",         // celeste
    text: "#334155",
};

// ============ UTILITÀ ============

function msToKmh(ms: number): number {
    return ms * 3.6;
}

function formatNumber(n: number, decimals: number = 2): string {
    return n.toFixed(decimals);
}

// Calcola lo stato del moto a un dato istante (senza resistenza aria)
function calculateMotionNoAir(params: SimulationParams, t: number): MotionState {
    const { y0, v0, g } = params;

    // Tempo di atterraggio: y = 0
    // y0 + v0*t - 0.5*g*t² = 0
    // Caso v0 = 0: t = sqrt(2*y0/g)
    // Caso generale: t = (v0 + sqrt(v0² + 2*g*y0)) / g
    let tLand: number | null = null;

    if (v0 === 0 && y0 > 0) {
        // Caduta da fermo: t = sqrt(2h/g)
        tLand = Math.sqrt(2 * y0 / g);
    } else {
        const discriminant = v0 * v0 + 2 * g * y0;
        if (discriminant >= 0) {
            tLand = (v0 + Math.sqrt(discriminant)) / g;
        }
    }

    // Tempo al punto più alto (se v0 > 0): v = 0 → v0 - g*t = 0 → t = v0/g
    let tApex: number | null = null;
    let yMax: number | null = null;

    if (v0 > 0) {
        tApex = v0 / g;
        yMax = y0 + v0 * tApex - 0.5 * g * tApex * tApex;
    }

    // Verifica se ha toccato il suolo
    let landed = false;
    let effectiveT = t;

    if (tLand !== null && t >= tLand) {
        effectiveT = tLand;
        landed = true;
    }

    // Formule caduta libera
    const y = Math.max(0, y0 + v0 * effectiveT - 0.5 * g * effectiveT * effectiveT);
    const v = landed ? 0 : v0 - g * effectiveT;
    const a = landed ? 0 : -g;

    return { t, y, v, a, landed, tLand, tApex, yMax };
}

// Calcola lo stato del moto con resistenza dell'aria (integrazione numerica)
// Fisica: F_drag = ½ρCdA·v² (opposta al moto)
// Accelerazione: a = -g - (F_drag/m) * sign(v) = -g - (ρCdA·v²)/(2m) * sign(v)
function calculateMotionWithAir(params: SimulationParams, t: number): MotionState {
    const { y0, v0, g, mass, CdA } = params;

    // Coefficiente per il calcolo della resistenza: k = ρCdA/(2m)
    // a_drag = k * v² (sempre opposta al moto)
    const k = (RHO_AIR * CdA) / (2 * mass);

    // Integrazione numerica con step piccoli
    const dt = 0.001; // 1ms step
    let y = y0;
    let v = v0;
    let currentT = 0;
    let landed = false;
    let tLand: number | null = null;
    let tApex: number | null = null;
    let yMax = y0;

    while (currentT < t && !landed) {
        // Accelerazione totale:
        // - Gravità: -g (sempre verso il basso)
        // - Resistenza aria: -sign(v) * k * v² (sempre opposta al moto)
        //
        // Usando k * v * |v| otteniamo il segno corretto automaticamente:
        // - Se v > 0 (salita): resistenza = -k*v² (verso il basso, frena la salita)
        // - Se v < 0 (discesa): resistenza = +k*v² (verso l'alto, frena la caduta)
        const dragAcceleration = k * v * Math.abs(v);
        const a = -g - dragAcceleration;

        // Euler integration
        v = v + a * dt;
        y = y + v * dt;
        currentT += dt;

        // Traccia punto più alto
        if (y > yMax) {
            yMax = y;
            tApex = currentT;
        }

        // Controlla atterraggio
        if (y <= 0) {
            y = 0;
            landed = true;
            tLand = currentT;
        }
    }

    const finalA = landed ? 0 : -g - k * v * Math.abs(v);

    return {
        t,
        y,
        v: landed ? 0 : v,
        a: finalA,
        landed,
        tLand,
        tApex: v0 > 0 ? tApex : null,
        yMax: v0 > 0 ? yMax : null
    };
}

// Funzione wrapper che sceglie il metodo corretto
function calculateMotion(params: SimulationParams, t: number): MotionState {
    if (params.hasAtmosphere) {
        return calculateMotionWithAir(params, t);
    } else {
        return calculateMotionNoAir(params, t);
    }
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
    dataKey: 'y' | 'v' | 'a';
    color: string;
    label: string;
    unit: string;
    maxT: number;
}

function Graph({ data, currentT, width, height, dataKey, color, label, unit, maxT }: GraphProps) {
    const padding = { top: 20, right: 20, bottom: 35, left: 55 };
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
            <rect x={padding.left} y={padding.top} width={graphWidth} height={graphHeight} fill="#f8fafc" rx={4} />

            {/* Griglia orizzontale */}
            {yTickValues.map((val, i) => (
                <line
                    key={`h-${i}`}
                    x1={padding.left}
                    y1={scaleY(val)}
                    x2={width - padding.right}
                    y2={scaleY(val)}
                    stroke="#e2e8f0"
                    strokeWidth={1}
                    strokeDasharray={val === 0 ? "none" : "4,4"}
                />
            ))}

            {/* Linea dello zero */}
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
    params1: SimulationParams;
    params2: SimulationParams | null;
    currentT: number;
    maxT: number;
    width: number;
    height: number;
    planet: Planet;
    fallingObject1: FallingObject;
    fallingObject2: FallingObject | null;
}

function Animation({ params1, params2, currentT, maxT, width, height, planet, fallingObject1, fallingObject2 }: AnimationProps) {
    const state1 = calculateMotion(params1, currentT);
    const state2 = params2 ? calculateMotion(params2, currentT) : null;

    const graphData1 = generateGraphData(params1, maxT);
    const graphData2 = params2 ? generateGraphData(params2, maxT) : null;

    // Calcola range Y per la visualizzazione (considera entrambi)
    const allY1 = graphData1.map(d => d.y);
    const allY2 = graphData2 ? graphData2.map(d => d.y) : [];
    const maxY = Math.max(...allY1, ...allY2, params1.y0, 10);

    const padding = { top: 30, bottom: 50, left: 60, right: 30 };
    const viewHeight = height - padding.top - padding.bottom;
    const groundY = height - padding.bottom;

    // Posizione oggetto 1
    const object1Y = groundY - (state1.y / maxY) * viewHeight;
    const object1X = fallingObject2 ? width / 2 - 40 : width / 2;

    // Posizione oggetto 2
    const object2Y = state2 ? groundY - (state2.y / maxY) * viewHeight : 0;
    const object2X = width / 2 + 40;

    // Scala verticale
    const numTicks = 5;
    const tickStep = maxY / (numTicks - 1);
    const ticks = Array.from({ length: numTicks }, (_, i) => i * tickStep);

    // Freccia velocità oggetto 1
    const maxV = Math.max(...graphData1.map(d => Math.abs(d.v)), state2 ? Math.max(...(graphData2?.map(d => Math.abs(d.v)) || [1])) : 1, 1);
    const arrowLength1 = (Math.abs(state1.v) / maxV) * 50;
    const arrowDirection1 = state1.v >= 0 ? -1 : 1;

    // Freccia velocità oggetto 2
    const arrowLength2 = state2 ? (Math.abs(state2.v) / maxV) * 50 : 0;
    const arrowDirection2 = state2 ? (state2.v >= 0 ? -1 : 1) : 1;

    return (
        <svg width={width} height={height} style={{ display: 'block' }}>
            {/* Sfondo cielo */}
            <defs>
                <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={planet.skyTop} />
                    <stop offset="100%" stopColor={planet.skyBottom} />
                </linearGradient>
            </defs>
            <rect x={0} y={0} width={width} height={groundY} fill="url(#skyGrad)" />

            {/* Stelle per Luna */}
            {planet.name === "Luna" && (
                <>
                    {Array.from({ length: 30 }, (_, i) => (
                        <circle
                            key={i}
                            cx={30 + (i * 37) % (width - 60)}
                            cy={20 + (i * 23) % (groundY - 40)}
                            r={1 + (i % 2)}
                            fill="white"
                            opacity={0.6 + (i % 3) * 0.2}
                        />
                    ))}
                    {/* Terra vista dalla Luna */}
                    <circle cx={width - 60} cy={50} r={20} fill="#3b82f6" opacity={0.8} />
                    <circle cx={width - 55} cy={45} r={8} fill="#22c55e" opacity={0.6} />
                </>
            )}

            {/* Terreno base */}
            <rect x={0} y={groundY} width={width} height={padding.bottom} fill={planet.groundColor} />
            <rect x={0} y={groundY} width={width} height={4} fill={planet.groundAccent} />

            {/* Dettagli terreno specifici per pianeta */}
            {planet.groundType === "grass" && (
                /* Erba stilizzata - Terra */
                <>
                    {Array.from({ length: Math.floor(width / 15) }, (_, i) => (
                        <path
                            key={i}
                            d={`M ${i * 15 + 7} ${groundY} Q ${i * 15 + 5} ${groundY - 8} ${i * 15 + 7} ${groundY - 12} Q ${i * 15 + 9} ${groundY - 8} ${i * 15 + 7} ${groundY}`}
                            fill="#4ade80"
                        />
                    ))}
                </>
            )}

            {planet.groundType === "rock" && (
                /* Rocce e crateri - Luna */
                <>
                    {Array.from({ length: 8 }, (_, i) => (
                        <g key={i}>
                            <ellipse
                                cx={40 + i * 45}
                                cy={groundY + 15}
                                rx={12 + (i % 3) * 5}
                                ry={6 + (i % 2) * 3}
                                fill="#4b5563"
                                opacity={0.5}
                            />
                            <circle
                                cx={30 + i * 50}
                                cy={groundY + 25}
                                r={3 + (i % 3)}
                                fill="#374151"
                            />
                        </g>
                    ))}
                </>
            )}

            {planet.groundType === "dust" && (
                /* Polvere e rocce rosse - Marte */
                <>
                    {Array.from({ length: 12 }, (_, i) => (
                        <g key={i}>
                            <circle
                                cx={20 + i * 30}
                                cy={groundY + 10 + (i % 3) * 8}
                                r={2 + (i % 4)}
                                fill="#b91c1c"
                                opacity={0.6}
                            />
                            <rect
                                x={35 + i * 35}
                                y={groundY + 5}
                                width={8 + (i % 3) * 4}
                                height={4 + (i % 2) * 2}
                                fill="#991b1b"
                                rx={2}
                                opacity={0.4}
                            />
                        </g>
                    ))}
                </>
            )}

            {planet.groundType === "gas" && (
                /* Bande di gas - Giove */
                <>
                    {Array.from({ length: 5 }, (_, i) => (
                        <rect
                            key={i}
                            x={0}
                            y={groundY + i * 10}
                            width={width}
                            height={6}
                            fill={i % 2 === 0 ? "#f59e0b" : "#d97706"}
                            opacity={0.5 + (i % 2) * 0.2}
                        />
                    ))}
                    <text x={width / 2} y={groundY + 30} textAnchor="middle" fontSize={10} fill="#fff" opacity={0.7}>
                        (superficie gassosa)
                    </text>
                </>
            )}

            {/* Scala altezza */}
            <line x1={padding.left - 10} y1={padding.top} x2={padding.left - 10} y2={groundY} stroke="#64748b" strokeWidth={2} />
            {ticks.map((val, i) => {
                const tickY = groundY - (val / maxY) * viewHeight;
                return (
                    <g key={i}>
                        <line x1={padding.left - 15} y1={tickY} x2={padding.left - 5} y2={tickY} stroke="#64748b" strokeWidth={2} />
                        <text x={padding.left - 20} y={tickY + 4} textAnchor="end" fontSize={11} fill="#475569" fontWeight={500}>
                            {formatNumber(val, 0)} m
                        </text>
                    </g>
                );
            })}

            {/* Altezza iniziale marker */}
            <line
                x1={padding.left}
                y1={groundY - (params1.y0 / maxY) * viewHeight}
                x2={width - padding.right}
                y2={groundY - (params1.y0 / maxY) * viewHeight}
                stroke="#94a3b8"
                strokeWidth={1}
                strokeDasharray="8,4"
            />
            <text
                x={width - padding.right + 5}
                y={groundY - (params1.y0 / maxY) * viewHeight + 4}
                fontSize={10}
                fill="#64748b"
            >
                y₀
            </text>

            {/* Altezza massima marker (se lanciato verso l'alto) - oggetto 1 */}
            {state1.yMax !== null && state1.yMax > params1.y0 && (
                <>
                    <line
                        x1={padding.left}
                        y1={groundY - (state1.yMax / maxY) * viewHeight}
                        x2={width - padding.right}
                        y2={groundY - (state1.yMax / maxY) * viewHeight}
                        stroke="#8b5cf6"
                        strokeWidth={1}
                        strokeDasharray="4,4"
                    />
                    <text
                        x={width - padding.right + 5}
                        y={groundY - (state1.yMax / maxY) * viewHeight + 4}
                        fontSize={10}
                        fill="#8b5cf6"
                    >
                        y_max
                    </text>
                </>
            )}

            {/* Oggetto 1 che cade */}
            <g transform={`translate(${object1X}, ${object1Y})`}>
                {/* Ombra */}
                <ellipse
                    cx={0}
                    cy={groundY - object1Y + 5}
                    rx={fallingObject1.size * 0.6 * (1 - state1.y / maxY * 0.5)}
                    ry={4}
                    fill="rgba(0,0,0,0.2)"
                />

                {/* Oggetto (emoji) */}
                <text
                    x={0}
                    y={fallingObject1.size * 0.35}
                    textAnchor="middle"
                    fontSize={fallingObject1.size}
                    style={{ userSelect: "none" }}
                >
                    {fallingObject1.icon}
                </text>

                {/* Freccia velocità */}
                {Math.abs(state1.v) > 0.5 && !state1.landed && (
                    <g>
                        <defs>
                            <marker id="arrowV1" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill={COLORS.velocity} />
                            </marker>
                        </defs>
                        <line
                            x1={fallingObject1.size * 0.6 + 5}
                            y1={0}
                            x2={fallingObject1.size * 0.6 + 5}
                            y2={arrowDirection1 * arrowLength1}
                            stroke={COLORS.velocity}
                            strokeWidth={3}
                            markerEnd="url(#arrowV1)"
                        />
                    </g>
                )}
            </g>

            {/* Oggetto 2 che cade (se presente) */}
            {fallingObject2 && state2 && (
                <g transform={`translate(${object2X}, ${object2Y})`}>
                    {/* Ombra */}
                    <ellipse
                        cx={0}
                        cy={groundY - object2Y + 5}
                        rx={fallingObject2.size * 0.6 * (1 - state2.y / maxY * 0.5)}
                        ry={4}
                        fill="rgba(0,0,0,0.2)"
                    />

                    {/* Oggetto (emoji) */}
                    <text
                        x={0}
                        y={fallingObject2.size * 0.35}
                        textAnchor="middle"
                        fontSize={fallingObject2.size}
                        style={{ userSelect: "none" }}
                    >
                        {fallingObject2.icon}
                    </text>

                    {/* Freccia velocità */}
                    {Math.abs(state2.v) > 0.5 && !state2.landed && (
                        <g>
                            <defs>
                                <marker id="arrowV2" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                    <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
                                </marker>
                            </defs>
                            <line
                                x1={fallingObject2.size * 0.6 + 5}
                                y1={0}
                                x2={fallingObject2.size * 0.6 + 5}
                                y2={arrowDirection2 * arrowLength2}
                                stroke="#f59e0b"
                                strokeWidth={3}
                                markerEnd="url(#arrowV2)"
                            />
                        </g>
                    )}
                </g>
            )}

            {/* Indicatore IMPATTO oggetto 1 */}
            {state1.landed && (
                <g transform={`translate(${object1X}, ${groundY - 40})`}>
                    <rect x={-30} y={-10} width={60} height={20} fill="#ef4444" rx={4} />
                    <text x={0} y={5} textAnchor="middle" fontSize={10} fontWeight={700} fill="white">IMPATTO!</text>
                </g>
            )}

            {/* Indicatore IMPATTO oggetto 2 */}
            {state2 && state2.landed && (
                <g transform={`translate(${object2X}, ${groundY - 40})`}>
                    <rect x={-30} y={-10} width={60} height={20} fill="#f59e0b" rx={4} />
                    <text x={0} y={5} textAnchor="middle" fontSize={10} fontWeight={700} fill="white">IMPATTO!</text>
                </g>
            )}

            {/* Info pianeta */}
            <g transform={`translate(${width - 100}, 25)`}>
                <text textAnchor="end" fontSize={20}>{planet.icon}</text>
                <text x={-30} y={0} textAnchor="end" fontSize={12} fontWeight={600} fill={planet.color}>
                    {planet.name}
                </text>
                <text x={0} y={18} textAnchor="end" fontSize={11} fill="#64748b">
                    g = {planet.g} m/s²
                </text>
                {params1.hasAtmosphere && (
                    <text x={0} y={34} textAnchor="end" fontSize={10} fill="#0ea5e9">
                        🌫️ Resistenza aria attiva
                    </text>
                )}
            </g>

            {/* Info correnti */}
            <g transform={`translate(15, 25)`}>
                <text fontSize={13} fontWeight={600} fill={COLORS.text}>
                    t = {formatNumber(currentT, 2)} s
                </text>
                {/* Info oggetto 1 */}
                <text y={20} fontSize={11} fill={COLORS.text}>
                    {fallingObject1.icon}
                </text>
                <text x={20} y={20} fontSize={12} fontWeight={600} fill={COLORS.position}>
                    y={formatNumber(state1.y, 1)}m
                </text>
                <text x={80} y={20} fontSize={12} fontWeight={600} fill={COLORS.velocity}>
                    v={formatNumber(Math.abs(state1.v), 1)}m/s
                </text>
                {/* Info oggetto 2 */}
                {fallingObject2 && state2 && (
                    <>
                        <text y={38} fontSize={11} fill={COLORS.text}>
                            {fallingObject2.icon}
                        </text>
                        <text x={20} y={38} fontSize={12} fontWeight={600} fill="#f59e0b">
                            y={formatNumber(state2.y, 1)}m
                        </text>
                        <text x={80} y={38} fontSize={12} fontWeight={600} fill="#f59e0b">
                            v={formatNumber(Math.abs(state2.v), 1)}m/s
                        </text>
                    </>
                )}
            </g>
        </svg>
    );
}

// ============ COMPONENTE PRINCIPALE ============

export default function CadutaLiberaDemo() {
    const { isMobile, isTablet } = useBreakpoint();

    // Parametri simulazione
    const [y0, setY0] = useState(50);
    const [v0, setV0] = useState(0);
    const [selectedPlanet, setSelectedPlanet] = useState(0);
    const [selectedObject1, setSelectedObject1] = useState(0);
    const [enableSecondObject, setEnableSecondObject] = useState(false); // checkbox per abilitare
    const [selectedObject2, setSelectedObject2] = useState<number | null>(1); // default secondo oggetto
    const [currentT, setCurrentT] = useState(0);
    const [maxT, setMaxT] = useState(5);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showKmH, setShowKmH] = useState(false);
    const [atmosphereEnabled, setAtmosphereEnabled] = useState(false);

    const planet = PLANETS[selectedPlanet];
    const fallingObject1 = OBJECTS[selectedObject1];
    // Oggetto 2 è attivo solo se enableSecondObject è true E c'è una selezione
    const fallingObject2 = (enableSecondObject && selectedObject2 !== null) ? OBJECTS[selectedObject2] : null;

    // L'atmosfera è disponibile solo sulla Terra
    const canHaveAtmosphere = planet.hasAtmosphere;
    const hasAtmosphere = canHaveAtmosphere && atmosphereEnabled;

    const animationRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);

    // Params per oggetto 1
    const params1: SimulationParams = useMemo(() => ({
        y0,
        v0,
        g: planet.g,
        hasAtmosphere,
        mass: fallingObject1.mass,
        CdA: fallingObject1.CdA
    }), [y0, v0, planet.g, hasAtmosphere, fallingObject1.mass, fallingObject1.CdA]);

    // Params per oggetto 2 (se presente)
    const params2: SimulationParams | null = useMemo(() => {
        if (!fallingObject2) return null;
        return {
            y0,
            v0,
            g: planet.g,
            hasAtmosphere,
            mass: fallingObject2.mass,
            CdA: fallingObject2.CdA
        };
    }, [y0, v0, planet.g, hasAtmosphere, fallingObject2]);

    // Stato corrente oggetto 1
    const currentState1 = useMemo(() => calculateMotion(params1, currentT), [params1, currentT]);

    // Stato corrente oggetto 2
    const currentState2 = useMemo(() => {
        if (!params2) return null;
        return calculateMotion(params2, currentT);
    }, [params2, currentT]);

    // Dati grafici oggetto 1
    const graphData1 = useMemo(() => generateGraphData(params1, maxT), [params1, maxT]);

    // Se l'oggetto 2 è uguale all'oggetto 1, seleziona il prossimo disponibile
    useEffect(() => {
        if (enableSecondObject && selectedObject2 === selectedObject1) {
            // Trova il primo oggetto diverso
            const nextObj = OBJECTS.findIndex((_, i) => i !== selectedObject1);
            if (nextObj !== -1) {
                setSelectedObject2(nextObj);
            }
        }
    }, [selectedObject1, selectedObject2, enableSecondObject]);

    // Calcola tempo di volo ottimale per maxT (considera entrambi gli oggetti)
    useEffect(() => {
        let maxLandTime = 0;

        const state1 = calculateMotion(params1, 0);
        if (state1.tLand !== null) {
            maxLandTime = state1.tLand;
        }

        if (params2) {
            const state2 = calculateMotion(params2, 0);
            if (state2.tLand !== null && state2.tLand > maxLandTime) {
                maxLandTime = state2.tLand;
            }
        }

        if (maxLandTime > 0) {
            const suggestedMax = Math.ceil(maxLandTime * 1.2);
            if (suggestedMax > 1 && suggestedMax < 60) {
                setMaxT(suggestedMax);
            }
        }
    }, [params1, params2]);

    // Animazione play/pause
    useEffect(() => {
        if (isPlaying) {
            lastTimeRef.current = performance.now();

            const animate = (timestamp: number) => {
                const delta = (timestamp - lastTimeRef.current) / 1000;
                lastTimeRef.current = timestamp;

                setCurrentT(prev => {
                    const newT = prev + delta;
                    // Ferma quando entrambi sono atterrati o supera maxT
                    const state1 = calculateMotion(params1, newT);
                    const state2 = params2 ? calculateMotion(params2, newT) : null;

                    const allLanded = state1.landed && (!state2 || state2.landed);

                    if (allLanded || newT >= maxT) {
                        setIsPlaying(false);
                        // Ritorna il tempo massimo tra i due atterraggi
                        let maxLandT = state1.tLand || maxT;
                        if (state2 && state2.tLand && state2.tLand > maxLandT) {
                            maxLandT = state2.tLand;
                        }
                        return Math.min(maxLandT, maxT);
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
    }, [isPlaying, maxT, params1, params2]);

    // Reset
    const handleReset = useCallback(() => {
        setCurrentT(0);
        setIsPlaying(false);
    }, []);

    // Preset scenari
    const presets = [
        { name: "Caduta libera", y0: 50, v0: 0 },
        { name: "Lancio verso l'alto", y0: 10, v0: 20 },
        { name: "Lancio forte", y0: 0, v0: 30 },
    ];

    const applyPreset = (preset: typeof presets[0]) => {
        setY0(preset.y0);
        setV0(preset.v0);
        setCurrentT(0);
        setIsPlaying(false);
    };

    // Dimensioni grafici
    const graphWidth = isMobile ? 320 : isTablet ? 340 : 320;
    const graphHeight = isMobile ? 160 : 180;
    const animationWidth = isMobile ? 320 : isTablet ? 400 : 350;
    const animationHeight = isMobile ? 350 : 400;

    // ============ PANNELLI UI ============

    const ControlsPanel = (
        <ResponsiveCard>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: COLORS.text }}>
                ⚙️ Parametri
            </div>

            {/* Selezione pianeta */}
            <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>Pianeta:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {PLANETS.map((p, i) => (
                        <button
                            key={i}
                            onClick={() => { setSelectedPlanet(i); handleReset(); }}
                            style={{
                                padding: "8px 12px",
                                fontSize: 12,
                                background: selectedPlanet === i ? p.color : "#f1f5f9",
                                color: selectedPlanet === i ? "white" : "#475569",
                                border: "none",
                                borderRadius: 8,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                transition: "all 0.2s",
                            }}
                        >
                            <span>{p.icon}</span>
                            <span>{p.name}</span>
                        </button>
                    ))}
                </div>

                {/* Checkbox atmosfera - solo per Terra */}
                {canHaveAtmosphere && (
                    <label style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 13,
                        cursor: "pointer",
                        marginTop: 10,
                        padding: "8px 12px",
                        background: atmosphereEnabled ? "#dbeafe" : "#f8fafc",
                        borderRadius: 8,
                        border: atmosphereEnabled ? "2px solid #3b82f6" : "2px solid #e2e8f0",
                        transition: "all 0.2s",
                    }}>
                        <input
                            type="checkbox"
                            checked={atmosphereEnabled}
                            onChange={e => { setAtmosphereEnabled(e.target.checked); handleReset(); }}
                            style={{ width: 18, height: 18 }}
                        />
                        <span>🌫️ Resistenza dell'aria</span>
                    </label>
                )}
            </div>

            {/* Selezione oggetto 1 */}
            <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
                    Oggetto 1 (principale):
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {OBJECTS.map((obj, i) => {
                        const vt = calculateTerminalVelocity(obj.mass, obj.CdA, planet.g);
                        return (
                            <button
                                key={i}
                                onClick={() => { setSelectedObject1(i); handleReset(); }}
                                title={`${obj.name}\nm = ${obj.mass} kg\nCdA = ${obj.CdA.toFixed(4)} m²\nv_t = ${vt.toFixed(1)} m/s`}
                                style={{
                                    padding: "6px 10px",
                                    fontSize: 20,
                                    background: selectedObject1 === i ? "#dbeafe" : "#f1f5f9",
                                    border: selectedObject1 === i ? "2px solid #3b82f6" : "2px solid transparent",
                                    borderRadius: 8,
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                }}
                            >
                                {obj.icon}
                            </button>
                        );
                    })}
                </div>
                <div style={{ fontSize: 11, color: "#3b82f6", marginTop: 4 }}>
                    {fallingObject1.icon} <strong>{fallingObject1.name}</strong>
                </div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2, display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <span>m = {fallingObject1.mass < 1 ? (fallingObject1.mass * 1000).toFixed(0) + " g" : fallingObject1.mass.toFixed(1) + " kg"}</span>
                    <span>P = {formatNumber(fallingObject1.mass * planet.g, 1)} N</span>
                    {hasAtmosphere && <span>v_t = {formatNumber(calculateTerminalVelocity(fallingObject1.mass, fallingObject1.CdA, planet.g), 1)} m/s</span>}
                </div>
            </div>

            {/* Selezione oggetto 2 (opzionale) */}
            <div style={{ marginBottom: 16 }}>
                {/* Checkbox per abilitare secondo oggetto */}
                <label style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                    cursor: "pointer",
                    marginBottom: 10,
                    padding: "8px 12px",
                    background: enableSecondObject ? "#fef3c7" : "#f8fafc",
                    borderRadius: 8,
                    border: enableSecondObject ? "2px solid #f59e0b" : "2px solid #e2e8f0",
                    transition: "all 0.2s",
                }}>
                    <input
                        type="checkbox"
                        checked={enableSecondObject}
                        onChange={e => { setEnableSecondObject(e.target.checked); handleReset(); }}
                        style={{ width: 18, height: 18 }}
                    />
                    <span>🆚 Confronta con secondo oggetto</span>
                </label>

                {/* Pannello selezione secondo oggetto - visibile solo se abilitato */}
                {enableSecondObject && (
                    <>
                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
                            Oggetto 2 (confronto):
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {OBJECTS.map((obj, i) => {
                                const vt = calculateTerminalVelocity(obj.mass, obj.CdA, planet.g);
                                return (
                                    <button
                                        key={i}
                                        onClick={() => { setSelectedObject2(i); handleReset(); }}
                                        title={`${obj.name}\nm = ${obj.mass} kg\nCdA = ${obj.CdA.toFixed(4)} m²\nv_t = ${vt.toFixed(1)} m/s`}
                                        style={{
                                            padding: "6px 10px",
                                            fontSize: 20,
                                            background: selectedObject2 === i ? "#fef3c7" : "#f1f5f9",
                                            border: selectedObject2 === i ? "2px solid #f59e0b" : "2px solid transparent",
                                            borderRadius: 8,
                                            cursor: i === selectedObject1 ? "not-allowed" : "pointer",
                                            transition: "all 0.2s",
                                            opacity: i === selectedObject1 ? 0.4 : 1,
                                        }}
                                        disabled={i === selectedObject1}
                                    >
                                        {obj.icon}
                                    </button>
                                );
                            })}
                        </div>
                        {fallingObject2 && (
                            <>
                                <div style={{ fontSize: 11, color: "#f59e0b", marginTop: 4 }}>
                                    {fallingObject2.icon} <strong>{fallingObject2.name}</strong>
                                </div>
                                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2, display: "flex", gap: 12, flexWrap: "wrap" }}>
                                    <span>m = {fallingObject2.mass < 1 ? (fallingObject2.mass * 1000).toFixed(0) + " g" : fallingObject2.mass.toFixed(1) + " kg"}</span>
                                    <span>P = {formatNumber(fallingObject2.mass * planet.g, 1)} N</span>
                                    {hasAtmosphere && <span>v_t = {formatNumber(calculateTerminalVelocity(fallingObject2.mass, fallingObject2.CdA, planet.g), 1)} m/s</span>}
                                </div>
                            </>
                        )}
                    </>
                )}
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

            {/* Altezza iniziale */}
            <div style={{ marginBottom: 12 }}>
                <label style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                    <span>Altezza iniziale y₀</span>
                    <span style={{ color: COLORS.position, fontWeight: 600 }}>{y0} m</span>
                </label>
                <input
                    type="range"
                    min={0}
                    max={200}
                    step={1}
                    value={y0}
                    onChange={e => { setY0(Number(e.target.value)); handleReset(); }}
                    style={{ width: "100%", accentColor: COLORS.position }}
                />
            </div>

            {/* Velocità iniziale */}
            <div style={{ marginBottom: 12 }}>
                <label style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                    <span>Velocità iniziale v₀</span>
                    <span style={{ color: COLORS.velocity, fontWeight: 600 }}>
                        {v0} m/s {v0 > 0 ? "↑" : v0 < 0 ? "↓" : ""}
                    </span>
                </label>
                <input
                    type="range"
                    min={-20}
                    max={40}
                    step={1}
                    value={v0}
                    onChange={e => { setV0(Number(e.target.value)); handleReset(); }}
                    style={{ width: "100%", accentColor: COLORS.velocity }}
                />
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                    Positivo = lancio verso l'alto, Negativo = lancio verso il basso
                </div>
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

            <div style={{ display: "grid", gap: 10 }}>
                {/* Tempo */}
                <div style={{ padding: 10, background: "#f8fafc", borderRadius: 8, borderLeft: `4px solid ${COLORS.text}` }}>
                    <div style={{ fontSize: 11, color: "#64748b" }}>Tempo</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.text }}>
                        t = {formatNumber(currentT, 2)} s
                    </div>
                </div>

                {/* Oggetto 1 */}
                <div style={{ padding: 10, background: "#dbeafe", borderRadius: 8, borderLeft: "4px solid #3b82f6" }}>
                    <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>
                        {fallingObject1.icon} {fallingObject1.name}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <div>
                            <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.position }}>
                                y = {formatNumber(currentState1.y, 2)} m
                            </span>
                        </div>
                        <div>
                            <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.velocity }}>
                                v = {formatNumber(currentState1.v, 2)} m/s
                            </span>
                            {showKmH && (
                                <span style={{ fontSize: 10, color: "#94a3b8", marginLeft: 4 }}>
                                    ({formatNumber(msToKmh(Math.abs(currentState1.v)), 0)} km/h)
                                </span>
                            )}
                        </div>
                    </div>
                    {currentState1.landed && (
                        <div style={{ fontSize: 11, color: "#dc2626", fontWeight: 600, marginTop: 4 }}>
                            ⚠️ Impatto a t = {formatNumber(currentState1.tLand || 0, 2)} s
                        </div>
                    )}
                </div>

                {/* Oggetto 2 (se presente) */}
                {fallingObject2 && currentState2 && (
                    <div style={{ padding: 10, background: "#fef3c7", borderRadius: 8, borderLeft: "4px solid #f59e0b" }}>
                        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>
                            {fallingObject2.icon} {fallingObject2.name}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                            <div>
                                <span style={{ fontSize: 14, fontWeight: 700, color: "#f59e0b" }}>
                                    y = {formatNumber(currentState2.y, 2)} m
                                </span>
                            </div>
                            <div>
                                <span style={{ fontSize: 14, fontWeight: 700, color: "#f59e0b" }}>
                                    v = {formatNumber(currentState2.v, 2)} m/s
                                </span>
                                {showKmH && (
                                    <span style={{ fontSize: 10, color: "#94a3b8", marginLeft: 4 }}>
                                        ({formatNumber(msToKmh(Math.abs(currentState2.v)), 0)} km/h)
                                    </span>
                                )}
                            </div>
                        </div>
                        {currentState2.landed && (
                            <div style={{ fontSize: 11, color: "#dc2626", fontWeight: 600, marginTop: 4 }}>
                                ⚠️ Impatto a t = {formatNumber(currentState2.tLand || 0, 2)} s
                            </div>
                        )}
                    </div>
                )}

                {/* Confronto tempi di atterraggio */}
                {fallingObject2 && currentState1.tLand && currentState2 && currentState2.tLand && (
                    <div style={{ padding: 10, background: "#f0fdf4", borderRadius: 8, fontSize: 12 }}>
                        <div style={{ fontWeight: 600, color: "#166534", marginBottom: 4 }}>📊 Confronto</div>
                        <div>
                            Differenza tempo: <strong>{formatNumber(Math.abs(currentState1.tLand - currentState2.tLand), 2)} s</strong>
                        </div>
                        {hasAtmosphere && (
                            <div style={{ color: "#64748b", marginTop: 4 }}>
                                {currentState1.tLand < currentState2.tLand
                                    ? `${fallingObject1.icon} atterra prima (v_t più alta)`
                                    : currentState1.tLand > currentState2.tLand
                                        ? `${fallingObject2.icon} atterra prima (v_t più alta)`
                                        : "Atterrano insieme!"
                                }
                            </div>
                        )}
                    </div>
                )}
            </div>
        </ResponsiveCard>
    );

    const FormulasPanel = (
        <CollapsiblePanel title="📐 Formule" defaultOpen={!isMobile}>
            <div style={{ display: "grid", gap: 14, fontSize: 13 }}>
                {!hasAtmosphere ? (
                    // Formule senza resistenza aria
                    <>
                        <div>
                            <div style={{ fontWeight: 600, color: COLORS.position, marginBottom: 4 }}>Legge oraria</div>
                            <div style={{ background: "#f8fafc", padding: 10, borderRadius: 8 }}>
                                <Latex>{"y(t) = y_0 + v_0 t - \\frac{1}{2}gt^2"}</Latex>
                            </div>
                        </div>

                        <div>
                            <div style={{ fontWeight: 600, color: COLORS.velocity, marginBottom: 4 }}>Legge della velocità</div>
                            <div style={{ background: "#f8fafc", padding: 10, borderRadius: 8 }}>
                                <Latex>{"v(t) = v_0 - gt"}</Latex>
                            </div>
                        </div>

                        <div>
                            <div style={{ fontWeight: 600, color: COLORS.acceleration, marginBottom: 4 }}>Accelerazione</div>
                            <div style={{ background: "#f8fafc", padding: 10, borderRadius: 8 }}>
                                <Latex>{`a = -g = -${planet.g} \\text{ m/s}^2`}</Latex>
                            </div>
                        </div>

                        {v0 === 0 && y0 > 0 && (
                            <div>
                                <div style={{ fontWeight: 600, color: "#f59e0b", marginBottom: 4 }}>Tempo di caduta (v₀ = 0)</div>
                                <div style={{ background: "#f8fafc", padding: 10, borderRadius: 8 }}>
                                    <Latex>{"t = \\sqrt{\\frac{2h}{g}}"}</Latex>
                                </div>
                                <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                                    <Latex>{`t = \\sqrt{\\frac{2 \\cdot ${y0}}{${planet.g}}} \\approx ${formatNumber(Math.sqrt(2 * y0 / planet.g), 2)} \\text{ s}`}</Latex>
                                </div>
                            </div>
                        )}

                        {v0 > 0 && (
                            <>
                                <div>
                                    <div style={{ fontWeight: 600, color: "#8b5cf6", marginBottom: 4 }}>Tempo di salita</div>
                                    <div style={{ background: "#f8fafc", padding: 10, borderRadius: 8 }}>
                                        <Latex>{"t_{salita} = \\frac{v_0}{g}"}</Latex>
                                    </div>
                                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                                        <Latex>{`t_{salita} = \\frac{${v0}}{${planet.g}} \\approx ${formatNumber(v0 / planet.g, 2)} \\text{ s}`}</Latex>
                                    </div>
                                </div>

                                {y0 === 0 && (
                                    <div>
                                        <div style={{ fontWeight: 600, color: "#f59e0b", marginBottom: 4 }}>Tempo totale di volo (y₀ = 0)</div>
                                        <div style={{ background: "#f8fafc", padding: 10, borderRadius: 8 }}>
                                            <Latex>{"t_{volo} = 2 \\times t_{salita} = \\frac{2v_0}{g}"}</Latex>
                                        </div>
                                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                                            (simmetria del moto)
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                ) : (
                    // Info con resistenza aria - NO formule
                    <div style={{ padding: 12, background: "#fef3c7", borderRadius: 8 }}>
                        <div style={{ fontWeight: 600, color: "#92400e", marginBottom: 8 }}>
                            🌫️ Resistenza dell'aria attiva
                        </div>
                        <div style={{ fontSize: 12, color: "#78716c", marginBottom: 12 }}>
                            Le formule della caduta libera non sono applicabili. La simulazione usa integrazione numerica.
                        </div>

                        <div style={{ fontWeight: 600, color: "#0e7490", marginBottom: 8 }}>
                            Proprietà oggetti:
                        </div>
                        <div style={{ display: "grid", gap: 6 }}>
                            <div style={{ padding: 8, background: "#dbeafe", borderRadius: 6, fontSize: 11 }}>
                                <div><strong>{fallingObject1.icon} {fallingObject1.name}</strong></div>
                                <div style={{ display: "flex", gap: 12, marginTop: 4, flexWrap: "wrap" }}>
                                    <span>m = {fallingObject1.mass < 1 ? (fallingObject1.mass * 1000).toFixed(0) + " g" : fallingObject1.mass + " kg"}</span>
                                    <span>P = {formatNumber(fallingObject1.mass * planet.g, 1)} N</span>
                                    <span>C_dA = {fallingObject1.CdA.toFixed(4)} m²</span>
                                    <span>v_t = {formatNumber(calculateTerminalVelocity(fallingObject1.mass, fallingObject1.CdA, planet.g), 1)} m/s</span>
                                </div>
                            </div>
                            {fallingObject2 && (
                                <div style={{ padding: 8, background: "#fef3c7", borderRadius: 6, fontSize: 11 }}>
                                    <div><strong>{fallingObject2.icon} {fallingObject2.name}</strong></div>
                                    <div style={{ display: "flex", gap: 12, marginTop: 4, flexWrap: "wrap" }}>
                                        <span>m = {fallingObject2.mass < 1 ? (fallingObject2.mass * 1000).toFixed(0) + " g" : fallingObject2.mass + " kg"}</span>
                                        <span>P = {formatNumber(fallingObject2.mass * planet.g, 1)} N</span>
                                        <span>C_dA = {fallingObject2.CdA.toFixed(4)} m²</span>
                                        <span>v_t = {formatNumber(calculateTerminalVelocity(fallingObject2.mass, fallingObject2.CdA, planet.g), 1)} m/s</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 10 }}>
                            💡 <strong>Velocità terminale:</strong> v_t = √(2mg / ρC_dA). A questa velocità, peso e resistenza si bilanciano.
                        </div>

                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>
                            💡 <strong>Accelerazione:</strong> a = -g - (ρC_dA·v²)/(2m). La massa influenza quanto la resistenza rallenta l'oggetto!
                        </div>

                        {v0 > 0 && fallingObject2 && (
                            <div style={{ fontSize: 11, color: "#b45309", marginTop: 10, padding: 8, background: "#fff7ed", borderRadius: 6 }}>
                                ⚠️ <strong>Nel lancio verso l'alto:</strong> oggetti più pesanti (a parità di forma) subiscono meno decelerazione dalla resistenza e salgono più in alto.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </CollapsiblePanel>
    );

    const ConversionPanel = (
        <CollapsiblePanel title="🔄 Conversioni" defaultOpen={false}>
            <div style={{ display: "grid", gap: 10, fontSize: 12 }}>
                <div style={{ padding: 8, background: "#f8fafc", borderRadius: 6 }}>
                    <Latex>{"1 \\text{ m/s} = 3.6 \\text{ km/h}"}</Latex>
                </div>
                <div style={{ padding: 8, background: "#f8fafc", borderRadius: 6 }}>
                    <Latex>{`|v_1| = ${formatNumber(Math.abs(currentState1.v))} \\text{ m/s} = ${formatNumber(msToKmh(Math.abs(currentState1.v)), 1)} \\text{ km/h}`}</Latex>
                </div>
                {currentState2 && (
                    <div style={{ padding: 8, background: "#fef3c7", borderRadius: 6 }}>
                        <Latex>{`|v_2| = ${formatNumber(Math.abs(currentState2.v))} \\text{ m/s} = ${formatNumber(msToKmh(Math.abs(currentState2.v)), 1)} \\text{ km/h}`}</Latex>
                    </div>
                )}
            </div>
        </CollapsiblePanel>
    );

    const AnimationPanel = (
        <ResponsiveCard>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12, color: COLORS.text }}>
                🎯 Animazione
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
                <Animation
                    params1={params1}
                    params2={params2}
                    currentT={currentT}
                    maxT={maxT}
                    width={animationWidth}
                    height={animationHeight}
                    planet={planet}
                    fallingObject1={fallingObject1}
                    fallingObject2={fallingObject2}
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
            title="Caduta Libera"
            description="Simulazione interattiva con diversi pianeti"
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

                    {/* Grafici */}
                    <ResponsiveCard>
                        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>📈 Grafici</div>
                        <div style={{ display: "grid", gap: 16 }}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 4, color: COLORS.position }}>Altezza y(t)</div>
                                <Graph data={graphData1} currentT={currentT} width={graphWidth} height={graphHeight} dataKey="y" color={COLORS.position} label="y" unit="m" maxT={maxT} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 4, color: COLORS.velocity }}>Velocità v(t)</div>
                                <Graph data={graphData1} currentT={currentT} width={graphWidth} height={graphHeight} dataKey="v" color={COLORS.velocity} label="v" unit="m/s" maxT={maxT} />
                            </div>
                        </div>
                    </ResponsiveCard>
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

                    {/* Riga 2: Formule e Grafici */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <div style={{ display: "grid", gap: 12 }}>
                            {FormulasPanel}
                            {ConversionPanel}
                        </div>
                        <ResponsiveCard>
                            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>📈 Grafici</div>
                            <div style={{ display: "grid", gap: 12 }}>
                                <Graph data={graphData1} currentT={currentT} width={graphWidth} height={graphHeight} dataKey="y" color={COLORS.position} label="y" unit="m" maxT={maxT} />
                                <Graph data={graphData1} currentT={currentT} width={graphWidth} height={graphHeight} dataKey="v" color={COLORS.velocity} label="v" unit="m/s" maxT={maxT} />
                            </div>
                        </ResponsiveCard>
                    </div>
                </div>
            )}

            {/* ============ LAYOUT DESKTOP ============ */}
            {!isMobile && !isTablet && (
                <div style={{ display: "grid", gridTemplateColumns: "350px 1fr 1fr", gap: 16 }}>
                    {/* Colonna 1: Animazione */}
                    <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
                        {AnimationPanel}
                    </div>

                    {/* Colonna 2: Controlli + Valori + Formule */}
                    <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
                        {ControlsPanel}
                        {ValuesPanel}
                        {FormulasPanel}
                        {ConversionPanel}
                    </div>

                    {/* Colonna 3: Grafici */}
                    <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
                        <ResponsiveCard>
                            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, color: COLORS.position }}>
                                📈 Grafico y(t) - Altezza
                            </div>
                            <Graph data={graphData1} currentT={currentT} width={graphWidth} height={graphHeight} dataKey="y" color={COLORS.position} label="y" unit="m" maxT={maxT} />
                        </ResponsiveCard>
                        <ResponsiveCard>
                            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, color: COLORS.velocity }}>
                                📈 Grafico v(t) - Velocità
                            </div>
                            <Graph data={graphData1} currentT={currentT} width={graphWidth} height={graphHeight} dataKey="v" color={COLORS.velocity} label="v" unit="m/s" maxT={maxT} />
                        </ResponsiveCard>
                        <ResponsiveCard>
                            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, color: COLORS.acceleration }}>
                                📈 Grafico a(t) - Accelerazione
                            </div>
                            <Graph data={graphData1} currentT={currentT} width={graphWidth} height={graphHeight} dataKey="a" color={COLORS.acceleration} label="a" unit="m/s²" maxT={maxT} />
                        </ResponsiveCard>
                    </div>
                </div>
            )}
        </DemoContainer>
    );
}