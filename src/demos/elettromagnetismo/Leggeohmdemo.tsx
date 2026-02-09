/**
 * LeggeOhmDemo - Laboratorio interattivo sulla Prima Legge di Ohm
 * Gli studenti modificano V, R, I e verificano che V = R · I
 * Stile laboratoriale con circuito animato e grafici
 */

import React, { useState, useMemo, useCallback } from "react";
import {
    Latex,
    DemoContainer,
    InfoBox,
    useBreakpoint,
    ResponsiveGrid,
    SwipeableTabs,
    CollapsiblePanel,
} from "../../components/ui";
import { CollapsibleExplanation } from "../../components/ui/CollapsibleExplanation";

// ============ TIPI ============

type SolveFor = "V" | "R" | "I";

interface LabState {
    voltage: number;     // V (Volt)
    resistance: number;  // R (Ohm)
    current: number;     // I (Ampere)
    solveFor: SolveFor;
}

// ============ COSTANTI ============

const V_MIN = 0;
const V_MAX = 24;
const V_STEP = 0.5;

const R_MIN = 1;
const R_MAX = 100;
const R_STEP = 1;

const I_MIN = 0;
const I_MAX = 5;
const I_STEP = 0.01;

// ============ HELPER ============

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

function formatValue(value: number, decimals: number = 2): string {
    if (Number.isFinite(value)) {
        const rounded = Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
        return rounded.toString();
    }
    return "—";
}

// ============ MATERIALI OHMICI ============

interface OhmicMaterial {
    name: string;
    resistance: number; // Ω (valori tipici per un filo di ~1m, sezione ~1mm²)
    color: string;
    emoji: string;
}

const OHMIC_MATERIALS: OhmicMaterial[] = [
    { name: "Argento", resistance: 2, color: "#c0c0c0", emoji: "🥈" },
    { name: "Rame", resistance: 2, color: "#b87333", emoji: "🟤" },
    { name: "Alluminio", resistance: 3, color: "#a8a9ad", emoji: "⬜" },
    { name: "Ferro", resistance: 12, color: "#434343", emoji: "⬛" },
    { name: "Costantana", resistance: 50, color: "#8b7355", emoji: "🟫" },
    { name: "Nicromo", resistance: 100, color: "#555555", emoji: "🔘" },
];

// ============ COMPONENTE CIRCUITO SVG ============

interface CircuitDiagramProps {
    voltage: number;
    current: number;
    resistance: number;
    isOn: boolean;
    onToggle?: () => void;
    materialName?: string | null;
    materialColor?: string | null;
    isMobile?: boolean;
}

function CircuitDiagram({ voltage, current, resistance, isOn, onToggle, materialName, materialColor, isMobile = false }: CircuitDiagramProps) {
    const w = isMobile ? 340 : 480;
    const h = isMobile ? 260 : 320;

    // Animazione corrente solo se acceso
    const showFlow = isOn && current > 0.01;
    // Scala logaritmica: anche correnti piccole sono visibili
    // current=0.05A → ~2.5s, current=0.5A → ~1.0s, current=5A → ~0.3s
    const animDuration = showFlow
        ? `${Math.max(0.25, 1.2 - 0.5 * Math.log10(Math.max(current, 0.01) / 0.01))}s`
        : "0s";
    const wireColor = showFlow
        ? `hsl(${Math.max(200 - current * 40, 0)}, 70%, 50%)`
        : "#94a3b8";

    const fs = isMobile ? 10 : 12;
    const fsLabel = isMobile ? 9 : 11;
    const fsValue = isMobile ? 11 : 13;

    // ── Coordinate principali ──
    // Batteria a sinistra (verticale), centro del circuito
    const batX = isMobile ? 40 : 55;
    const topY = isMobile ? 40 : 50;
    const botY = h - (isMobile ? 35 : 45);
    const midY = (topY + botY) / 2;

    // Nodo destro dove si biforca voltmetro
    const nodeRightX = isMobile ? 210 : 300;
    // Voltmetro ancora più a destra
    const vmX = isMobile ? 285 : 405;

    // Amperometro centrato sul tratto superiore
    const ampX = (batX + nodeRightX) / 2;
    const ampR = isMobile ? 18 : 22;

    // Resistore centrato sul tratto verticale destro
    const resY = midY;
    const resW = isMobile ? 24 : 28;
    const resH = isMobile ? 50 : 60;

    // Interruttore sul tratto inferiore
    const switchX = (batX + nodeRightX) / 2;
    const switchY = botY;
    const switchGap = isMobile ? 14 : 18; // distanza tra i due contatti

    // ── Path del circuito principale ──
    const mainPath = [
        `M ${batX} ${topY}`,
        `L ${ampX - ampR - 4} ${topY}`,
        `M ${ampX + ampR + 4} ${topY}`,
        `L ${nodeRightX} ${topY}`,
        `L ${nodeRightX} ${resY - resH / 2 - 4}`,
        `M ${nodeRightX} ${resY + resH / 2 + 4}`,
        `L ${nodeRightX} ${botY}`,
        `L ${batX} ${botY}`,
    ].join(" ");

    // Path continuo CHIUSO per animazione (intero anello, incluso lato batteria)
    const animPath = [
        `M ${batX} ${topY}`,
        `L ${nodeRightX} ${topY}`,
        `L ${nodeRightX} ${botY}`,
        `L ${batX} ${botY}`,
        `L ${batX} ${topY}`,  // chiude il loop sul lato generatore
    ].join(" ");

    // ── Path voltmetro in parallelo ──
    const vmTopY = topY;
    const vmBotY = botY;
    const vmMidY = (vmTopY + vmBotY) / 2;
    const vmR = isMobile ? 18 : 22;

    return (
        <svg
            width="100%"
            viewBox={`0 0 ${w} ${h}`}
            style={{ maxWidth: w, display: "block", margin: "0 auto" }}
        >
            <defs>
                <style>{`
                    @keyframes flowCurrent {
                        from { stroke-dashoffset: 24; }
                        to { stroke-dashoffset: 0; }
                    }
                `}</style>
            </defs>

            {/* Sfondo */}
            <rect x={0} y={0} width={w} height={h} rx={12} fill="#f8fafc" />

            {/* ══ FILI PRINCIPALI (sfondo) ══ */}
            {/* Tratto superiore */}
            <line x1={batX} y1={topY} x2={nodeRightX} y2={topY} stroke="#d1d5db" strokeWidth={2.5} />
            {/* Tratto destro verticale */}
            <line x1={nodeRightX} y1={topY} x2={nodeRightX} y2={botY} stroke="#d1d5db" strokeWidth={2.5} />
            {/* Tratto inferiore (due segmenti con gap per interruttore) */}
            <line x1={nodeRightX} y1={botY} x2={switchX + switchGap / 2} y2={botY} stroke="#d1d5db" strokeWidth={2.5} />
            <line x1={switchX - switchGap / 2} y1={botY} x2={batX} y2={botY} stroke="#d1d5db" strokeWidth={2.5} />

            {/* Fili voltmetro (parallelo) */}
            <line x1={nodeRightX} y1={topY} x2={vmX} y2={topY} stroke="#d1d5db" strokeWidth={1.5} />
            <line x1={vmX} y1={topY} x2={vmX} y2={vmMidY - vmR - 4} stroke="#d1d5db" strokeWidth={1.5} />
            <line x1={vmX} y1={vmMidY + vmR + 4} x2={vmX} y2={botY} stroke="#d1d5db" strokeWidth={1.5} />
            <line x1={vmX} y1={botY} x2={nodeRightX} y2={botY} stroke="#d1d5db" strokeWidth={1.5} />

            {/* ══ INTERRUTTORE ══ */}
            <g style={{ cursor: "pointer" }} onClick={onToggle}>
                {/* Hit area invisibile per click facile */}
                <rect
                    x={switchX - switchGap}
                    y={switchY - 30}
                    width={switchGap * 2}
                    height={46}
                    fill="transparent"
                />
                {/* Contatto fisso sinistro (pallino) */}
                <circle cx={switchX - switchGap / 2} cy={switchY} r={3.5} fill={isOn ? "#334155" : "#94a3b8"} />
                {/* Contatto fisso destro (pallino) */}
                <circle cx={switchX + switchGap / 2} cy={switchY} r={3.5} fill={isOn ? "#334155" : "#94a3b8"} />
                {/* Leva mobile: ruota dal contatto sinistro */}
                {(() => {
                    const leverLen = switchGap + 4;
                    const angle = isOn ? 0 : -40; // gradi, negativo = verso l'alto
                    const rad = (angle) * Math.PI / 180;
                    const startX = switchX - switchGap / 2;
                    const endX = startX + leverLen * Math.cos(rad);
                    const endY = switchY + leverLen * Math.sin(rad);
                    return (
                        <line
                            x1={startX}
                            y1={switchY}
                            x2={endX}
                            y2={endY}
                            stroke={isOn ? "#22c55e" : "#ef4444"}
                            strokeWidth={3}
                            strokeLinecap="round"
                            style={{ transition: "all 0.4s ease" }}
                        />
                    );
                })()}
                {/* Label */}
                <text
                    x={switchX}
                    y={switchY + 16}
                    fontSize={fsLabel}
                    fill="#64748b"
                    textAnchor="middle"
                >
                    interruttore
                </text>
            </g>

            {/* ══ CORRENTE ANIMATA ══ */}
            {showFlow && (
                <path
                    d={animPath}
                    fill="none"
                    stroke={wireColor}
                    strokeWidth={2.5}
                    strokeDasharray="8,16"
                    style={{ animation: `flowCurrent ${animDuration} linear infinite` }}
                />
            )}

            {/* ══ BATTERIA (sinistra, verticale) ══ */}
            <g>
                {/* Filo dalla batteria su fino a topY e giù fino a botY */}
                <line x1={batX} y1={topY} x2={batX} y2={midY - 26} stroke="#d1d5db" strokeWidth={2.5} />
                <line x1={batX} y1={midY + 26} x2={batX} y2={botY} stroke="#d1d5db" strokeWidth={2.5} />

                {/* Corrente animata sui fili del lato generatore */}
                {showFlow && (
                    <>
                        <line
                            x1={batX} y1={midY - 26} x2={batX} y2={topY}
                            stroke={wireColor}
                            strokeWidth={2.5}
                            strokeDasharray="8,16"
                            style={{ animation: `flowCurrent ${animDuration} linear infinite` }}
                        />
                        <line
                            x1={batX} y1={botY} x2={batX} y2={midY + 26}
                            stroke={wireColor}
                            strokeWidth={2.5}
                            strokeDasharray="8,16"
                            style={{ animation: `flowCurrent ${animDuration} linear infinite` }}
                        />
                    </>
                )}

                {/* Corpo */}
                <rect
                    x={batX - 16}
                    y={midY - 25}
                    width={32}
                    height={50}
                    rx={5}
                    fill="#fff"
                    stroke="#334155"
                    strokeWidth={2}
                />
                {/* Polo + (linea lunga, in alto) */}
                <line x1={batX - 10} y1={midY - 10} x2={batX + 10} y2={midY - 10} stroke="#dc2626" strokeWidth={3} />
                {/* Polo − (linea corta, in basso) */}
                <line x1={batX - 6} y1={midY + 6} x2={batX + 6} y2={midY + 6} stroke="#1e40af" strokeWidth={3} />
                {/* Simboli */}
                <text x={batX - 22} y={midY - 7} fontSize={fs + 2} fill="#dc2626" fontWeight="bold" textAnchor="end">+</text>
                <text x={batX - 22} y={midY + 10} fontSize={fs + 2} fill="#1e40af" fontWeight="bold" textAnchor="end">−</text>
                {/* Label */}
                <text x={batX} y={midY + 42} fontSize={fsLabel} fill="#64748b" textAnchor="middle">generatore</text>
                <text x={batX} y={midY + 54} fontSize={fsValue} fill="#334155" fontWeight="bold" textAnchor="middle">
                    {formatValue(voltage, 1)} V
                </text>
            </g>

            {/* ══ AMPEROMETRO (in serie, tratto superiore) ══ */}
            <g>
                {/* Rettangolo strumento */}
                <rect
                    x={ampX - ampR - 6}
                    y={topY - ampR - 2}
                    width={(ampR + 6) * 2}
                    height={(ampR + 2) * 2}
                    rx={6}
                    fill="#fff"
                    stroke="#334155"
                    strokeWidth={2}
                />
                {/* Sfondo quadrante */}
                <rect
                    x={ampX - ampR + 2}
                    y={topY - ampR + 4}
                    width={(ampR - 2) * 2}
                    height={ampR * 1.2}
                    rx={4}
                    fill="#1e293b"
                />
                {/* Arco scala */}
                <path
                    d={`M ${ampX - ampR + 8} ${topY + 2} Q ${ampX} ${topY - ampR + 6} ${ampX + ampR - 8} ${topY + 2}`}
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth={1}
                />
                {/* Ago (angolo proporzionale alla corrente) */}
                {(() => {
                    const maxAngle = 70; // gradi
                    const ratio = isOn ? Math.min(current / (I_MAX * 0.8), 1) : 0;
                    const angle = -maxAngle + ratio * (2 * maxAngle);
                    const needleLen = ampR * 0.8;
                    const rad = (angle - 90) * Math.PI / 180;
                    const nx = ampX + needleLen * Math.cos(rad);
                    const ny = (topY + 3) + needleLen * Math.sin(rad);
                    return (
                        <line
                            x1={ampX}
                            y1={topY + 3}
                            x2={nx}
                            y2={ny}
                            stroke="#dc2626"
                            strokeWidth={1.5}
                            strokeLinecap="round"
                        />
                    );
                })()}
                {/* Perno ago */}
                <circle cx={ampX} cy={topY + 3} r={2} fill="#dc2626" />
                {/* Lettera A */}
                <text
                    x={ampX}
                    y={topY + ampR - 2}
                    fontSize={fs}
                    fill="#334155"
                    fontWeight="bold"
                    textAnchor="middle"
                >
                    A
                </text>
                {/* Label sopra */}
                <text x={ampX} y={topY - ampR - 8} fontSize={fsLabel} fill="#64748b" textAnchor="middle">
                    amperometro
                </text>
                {/* Valore sotto */}
                <text x={ampX} y={topY + ampR + 16} fontSize={fsValue} fill="#334155" fontWeight="bold" textAnchor="middle">
                    {isOn ? `${formatValue(current)} A` : "0 A"}
                </text>
            </g>

            {/* ══ RESISTORE (tratto verticale destro) ══ */}
            <g>
                {/* Corpo cilindrico trasparente */}
                <rect
                    x={nodeRightX - resW / 2 - 4}
                    y={resY - resH / 2 - 6}
                    width={resW + 8}
                    height={resH + 12}
                    rx={resW / 2 + 2}
                    ry={resW / 2 + 2}
                    fill={materialColor ? `${materialColor}44` : "rgba(254, 243, 199, 0.35)"}
                    stroke={materialColor || "#d97706"}
                    strokeWidth={1.5}
                    strokeOpacity={0.5}
                    style={{ transition: "all 0.3s ease" }}
                />
                {/* Riflesso luce sul cilindro */}
                <rect
                    x={nodeRightX - resW / 2 - 1}
                    y={resY - resH / 2 - 3}
                    width={4}
                    height={resH + 6}
                    rx={2}
                    fill="rgba(255,255,255,0.5)"
                />
                {/* Zigzag interno */}
                {(() => {
                    const x = nodeRightX;
                    const yStart = resY - resH / 2;
                    const yEnd = resY + resH / 2;
                    const zigW = resW / 2;
                    const segments = 6;
                    const segH = (yEnd - yStart) / segments;
                    let d = `M ${x} ${yStart}`;
                    for (let i = 0; i < segments; i++) {
                        const dir = i % 2 === 0 ? 1 : -1;
                        d += ` L ${x + dir * zigW} ${yStart + (i + 0.5) * segH}`;
                    }
                    d += ` L ${x} ${yEnd}`;
                    return (
                        <path
                            d={d}
                            fill="none"
                            stroke={materialColor || "#d97706"}
                            strokeWidth={2.5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ transition: "stroke 0.3s ease" }}
                        />
                    );
                })()}
                {/* Label R */}
                <text
                    x={nodeRightX - resW / 2 - 10}
                    y={resY + 4}
                    fontSize={fs + 2}
                    fill={materialColor || "#92400e"}
                    fontWeight="bold"
                    textAnchor="end"
                >
                    R
                </text>
                {/* Label valore */}
                <text
                    x={nodeRightX - resW / 2 - 10}
                    y={resY + 18}
                    fontSize={fsLabel}
                    fill="#64748b"
                    textAnchor="end"
                >
                    {materialName || "resistore"}
                </text>
                <text
                    x={nodeRightX - resW / 2 - 10}
                    y={resY + 30}
                    fontSize={fsValue}
                    fill="#334155"
                    fontWeight="bold"
                    textAnchor="end"
                >
                    {formatValue(resistance, 0)} Ω
                </text>
            </g>

            {/* ══ VOLTMETRO (in parallelo, a destra) ══ */}
            <g>
                {/* Rettangolo strumento */}
                <rect
                    x={vmX - vmR - 6}
                    y={vmMidY - vmR - 2}
                    width={(vmR + 6) * 2}
                    height={(vmR + 2) * 2}
                    rx={6}
                    fill="#fff"
                    stroke="#334155"
                    strokeWidth={2}
                />
                {/* Sfondo quadrante */}
                <rect
                    x={vmX - vmR + 2}
                    y={vmMidY - vmR + 4}
                    width={(vmR - 2) * 2}
                    height={vmR * 1.2}
                    rx={4}
                    fill="#1e293b"
                />
                {/* Arco scala */}
                <path
                    d={`M ${vmX - vmR + 8} ${vmMidY + 2} Q ${vmX} ${vmMidY - vmR + 6} ${vmX + vmR - 8} ${vmMidY + 2}`}
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth={1}
                />
                {/* Ago voltmetro (proporzionale alla tensione) */}
                {(() => {
                    const maxAngle = 70;
                    const ratio = isOn ? Math.min(voltage / V_MAX, 1) : 0;
                    const angle = -maxAngle + ratio * (2 * maxAngle);
                    const needleLen = vmR * 0.8;
                    const rad = (angle - 90) * Math.PI / 180;
                    const nx = vmX + needleLen * Math.cos(rad);
                    const ny = (vmMidY + 3) + needleLen * Math.sin(rad);
                    return (
                        <line
                            x1={vmX}
                            y1={vmMidY + 3}
                            x2={nx}
                            y2={ny}
                            stroke="#dc2626"
                            strokeWidth={1.5}
                            strokeLinecap="round"
                        />
                    );
                })()}
                {/* Perno ago */}
                <circle cx={vmX} cy={vmMidY + 3} r={2} fill="#dc2626" />
                {/* Lettera V */}
                <text
                    x={vmX}
                    y={vmMidY + vmR - 2}
                    fontSize={fs}
                    fill="#334155"
                    fontWeight="bold"
                    textAnchor="middle"
                >
                    V
                </text>
                {/* Label */}
                <text x={vmX} y={vmMidY - vmR - 8} fontSize={fsLabel} fill="#64748b" textAnchor="middle">
                    voltmetro
                </text>
                {/* Valore */}
                <text x={vmX} y={vmMidY + vmR + 16} fontSize={fsValue} fill="#334155" fontWeight="bold" textAnchor="middle">
                    {isOn ? `${formatValue(voltage, 1)} V` : "0 V"}
                </text>
            </g>

            {/* ══ NODI DI COLLEGAMENTO ══ */}
            <circle cx={nodeRightX} cy={topY} r={3} fill="#334155" />
            <circle cx={nodeRightX} cy={botY} r={3} fill="#334155" />

            {/* ══ FRECCIA CORRENTE ══ */}
            <g>
                <polygon
                    points={`${ampX + ampR + 20},${topY - 5} ${ampX + ampR + 28},${topY} ${ampX + ampR + 20},${topY + 5}`}
                    fill={wireColor}
                />
                <text
                    x={ampX + ampR + 24}
                    y={topY + ampR + 16}
                    fontSize={fsLabel}
                    fill="#64748b"
                    fontWeight="bold"
                    textAnchor="middle"
                >
                    I
                </text>
            </g>
        </svg>
    );
}

// ============ COMPONENTE SLIDER LABORATORIO ============

interface LabSliderProps {
    label: string;
    symbol: string;
    unit: string;
    value: number;
    min: number;
    max: number;
    step: number;
    color: string;
    disabled?: boolean;
    computed?: boolean;
    onChange: (value: number) => void;
}

function LabSlider({
                       label,
                       symbol,
                       unit,
                       value,
                       min,
                       max,
                       step,
                       color,
                       disabled = false,
                       computed = false,
                       onChange,
                   }: LabSliderProps) {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div
            style={{
                padding: "12px 16px",
                background: computed ? "#f0fdf4" : "#fff",
                borderRadius: 10,
                border: `2px solid ${computed ? "#86efac" : disabled ? "#e2e8f0" : color}`,
                opacity: disabled ? 0.5 : 1,
                transition: "all 0.2s ease",
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: color,
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: 14,
                        }}
                    >
                        {symbol}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#334155" }}>{label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    {computed && (
                        <span style={{ fontSize: 10, color: "#16a34a", fontWeight: 600, marginRight: 4 }}>
                            CALCOLATA
                        </span>
                    )}
                    <span style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>
                        {formatValue(value, symbol === "R" ? 0 : 2)}
                    </span>
                    <span style={{ fontSize: 13, color: "#64748b" }}>{unit}</span>
                </div>
            </div>

            <div style={{ position: "relative" }}>
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={clamp(value, min, max)}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    disabled={disabled || computed}
                    style={{
                        width: "100%",
                        height: 8,
                        borderRadius: 4,
                        appearance: "none",
                        background: `linear-gradient(to right, ${color} 0%, ${color} ${percentage}%, #e2e8f0 ${percentage}%, #e2e8f0 100%)`,
                        outline: "none",
                        cursor: disabled || computed ? "not-allowed" : "pointer",
                        accentColor: color,
                    }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                    <span>{min} {unit}</span>
                    <span>{max} {unit}</span>
                </div>
            </div>
        </div>
    );
}

// ============ COMPONENTE GRAFICO V-I ============

interface VIChartProps {
    resistance: number;
    currentPoint: { v: number; i: number };
    isMobile?: boolean;
}

function VIChart({ resistance, currentPoint, isMobile = false }: VIChartProps) {
    const w = isMobile ? 300 : 380;
    const h = isMobile ? 220 : 260;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };

    const plotW = w - padding.left - padding.right;
    const plotH = h - padding.top - padding.bottom;

    // Assi FISSI: così la pendenza cambia visivamente al variare di R
    const maxI = I_MAX;   // 5 A
    const maxV = V_MAX;   // 24 V

    const scaleX = (i: number) => padding.left + (i / maxI) * plotW;
    const scaleY = (v: number) => padding.top + plotH - (v / maxV) * plotH;

    // Linea della legge di Ohm: V = R * I (si ferma quando V > maxV)
    const linePoints: string[] = [];
    const steps = 100;
    for (let k = 0; k <= steps; k++) {
        const i = (k / steps) * maxI;
        const v = resistance * i;
        if (v <= maxV) {
            linePoints.push(`${scaleX(i)},${scaleY(v)}`);
        }
    }
    const linePath = linePoints.join(" ");

    // Griglia
    const gridLinesI = 5;
    const gridLinesV = 6;
    const stepI = maxI / gridLinesI;
    const stepV = maxV / gridLinesV;

    const fontSize = isMobile ? 10 : 12;

    // Posizione label R sulla retta (al 40% del range visibile)
    const labelI = Math.min(maxI * 0.4, maxV / resistance * 0.7);
    const labelV = resistance * labelI;

    return (
        <svg
            width="100%"
            viewBox={`0 0 ${w} ${h}`}
            style={{ maxWidth: w, display: "block", margin: "0 auto" }}
        >
            <rect x={0} y={0} width={w} height={h} rx={8} fill="#fafafa" />

            {/* Griglia */}
            {Array.from({ length: gridLinesI + 1 }).map((_, idx) => {
                const i = idx * stepI;
                const x = scaleX(i);
                return (
                    <g key={`grid-i-${idx}`}>
                        <line x1={x} y1={padding.top} x2={x} y2={padding.top + plotH} stroke="#e5e7eb" strokeWidth={1} />
                        <text x={x} y={h - 8} fontSize={fontSize} fill="#64748b" textAnchor="middle">
                            {formatValue(i, 1)}
                        </text>
                    </g>
                );
            })}
            {Array.from({ length: gridLinesV + 1 }).map((_, idx) => {
                const v = idx * stepV;
                const y = scaleY(v);
                return (
                    <g key={`grid-v-${idx}`}>
                        <line x1={padding.left} y1={y} x2={padding.left + plotW} y2={y} stroke="#e5e7eb" strokeWidth={1} />
                        <text x={padding.left - 8} y={y + 4} fontSize={fontSize} fill="#64748b" textAnchor="end">
                            {formatValue(v, 0)}
                        </text>
                    </g>
                );
            })}

            {/* Assi */}
            <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + plotH} stroke="#334155" strokeWidth={2} />
            <line x1={padding.left} y1={padding.top + plotH} x2={padding.left + plotW} y2={padding.top + plotH} stroke="#334155" strokeWidth={2} />

            {/* Label assi */}
            <text x={w / 2} y={h - 0} fontSize={fontSize} fill="#334155" fontWeight="bold" textAnchor="middle">
                I (A)
            </text>
            <text
                x={12}
                y={h / 2 - 20}
                fontSize={fontSize}
                fill="#334155"
                fontWeight="bold"
                textAnchor="middle"
                transform={`rotate(-90, 12, ${h / 2 - 20})`}
            >
                ΔV (Volt)
            </text>

            {/* Retta V = R · I (conduttore ohmico) */}
            <polyline
                points={linePath}
                fill="none"
                stroke="#2563eb"
                strokeWidth={2.5}
                strokeLinecap="round"
            />

            {/* Label R sulla retta */}
            {linePoints.length > 2 && labelV <= maxV && (
                <text
                    x={scaleX(labelI) + 6}
                    y={scaleY(labelV) - 8}
                    fontSize={fontSize}
                    fill="#2563eb"
                    fontWeight="bold"
                >
                    R = {formatValue(resistance, 0)} Ω
                </text>
            )}

            {/* Punto corrente */}
            {currentPoint.i >= 0 && currentPoint.v >= 0 &&
                currentPoint.i <= maxI && currentPoint.v <= maxV && (
                    <g>
                        <line
                            x1={scaleX(currentPoint.i)}
                            y1={padding.top + plotH}
                            x2={scaleX(currentPoint.i)}
                            y2={scaleY(currentPoint.v)}
                            stroke="#ef4444"
                            strokeWidth={1}
                            strokeDasharray="4,3"
                        />
                        <line
                            x1={padding.left}
                            y1={scaleY(currentPoint.v)}
                            x2={scaleX(currentPoint.i)}
                            y2={scaleY(currentPoint.v)}
                            stroke="#ef4444"
                            strokeWidth={1}
                            strokeDasharray="4,3"
                        />
                        <circle
                            cx={scaleX(currentPoint.i)}
                            cy={scaleY(currentPoint.v)}
                            r={6}
                            fill="#ef4444"
                            stroke="#fff"
                            strokeWidth={2}
                        />
                    </g>
                )}
        </svg>
    );
}

// ============ COMPONENTE GRAFICO OHMICO VS NON OHMICO ============

interface OhmicComparisonChartProps {
    isMobile?: boolean;
}

function OhmicComparisonChart({ isMobile = false }: OhmicComparisonChartProps) {
    const w = isMobile ? 280 : 340;
    const h = isMobile ? 200 : 230;
    const padding = { top: 20, right: 20, bottom: 35, left: 45 };

    const plotW = w - padding.left - padding.right;
    const plotH = h - padding.top - padding.bottom;

    const scaleX = (x: number) => padding.left + x * plotW;
    const scaleY = (y: number) => padding.top + plotH - y * plotH;

    const fontSize = isMobile ? 10 : 12;

    // Retta ohmica (lineare)
    const ohmicPoints: string[] = [];
    for (let t = 0; t <= 1; t += 0.02) {
        ohmicPoints.push(`${scaleX(t)},${scaleY(t * 0.85)}`);
    }

    // Curva non ohmica (esponenziale-like)
    const nonOhmicPoints: string[] = [];
    for (let t = 0; t <= 1; t += 0.02) {
        const v = Math.pow(t, 2.2) * 0.95;
        nonOhmicPoints.push(`${scaleX(t)},${scaleY(Math.min(v, 1))}`);
    }

    return (
        <svg
            width="100%"
            viewBox={`0 0 ${w} ${h}`}
            style={{ maxWidth: w, display: "block", margin: "0 auto" }}
        >
            <rect x={0} y={0} width={w} height={h} rx={8} fill="#fafafa" />

            {/* Assi */}
            <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + plotH} stroke="#334155" strokeWidth={2} />
            <line x1={padding.left} y1={padding.top + plotH} x2={padding.left + plotW} y2={padding.top + plotH} stroke="#334155" strokeWidth={2} />

            {/* Label assi */}
            <text x={w / 2} y={h - 4} fontSize={fontSize} fill="#334155" fontWeight="bold" textAnchor="middle">I</text>
            <text
                x={14}
                y={h / 2 - 15}
                fontSize={fontSize}
                fill="#334155"
                fontWeight="bold"
                textAnchor="middle"
                transform={`rotate(-90, 14, ${h / 2 - 15})`}
            >
                ΔV
            </text>

            {/* Retta conduttore ohmico */}
            <polyline
                points={ohmicPoints.join(" ")}
                fill="none"
                stroke="#2563eb"
                strokeWidth={2.5}
                strokeLinecap="round"
            />
            <text
                x={scaleX(0.75)}
                y={scaleY(0.75 * 0.85) + 16}
                fontSize={fontSize}
                fill="#2563eb"
                fontWeight="bold"
            >
                Conduttore Ohmico
            </text>

            {/* Curva conduttore non ohmico */}
            <polyline
                points={nonOhmicPoints.join(" ")}
                fill="none"
                stroke="#dc2626"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeDasharray="6,3"
            />
            <text
                x={scaleX(0.55)}
                y={scaleY(Math.pow(0.55, 2.2) * 0.95) - 10}
                fontSize={fontSize}
                fill="#dc2626"
                fontWeight="bold"
            >
                Conduttore
            </text>
            <text
                x={scaleX(0.55)}
                y={scaleY(Math.pow(0.55, 2.2) * 0.95) + 2}
                fontSize={fontSize}
                fill="#dc2626"
                fontWeight="bold"
            >
                Non Ohmico
            </text>
        </svg>
    );
}

// ============ COMPONENTE VERIFICA ============

interface VerificationBoxProps {
    voltage: number;
    resistance: number;
    current: number;
    solveFor: SolveFor;
}

function VerificationBox({ voltage, resistance, current, solveFor }: VerificationBoxProps) {
    const computed = resistance * current;
    const isBalanced = Math.abs(voltage - computed) < 0.05;

    return (
        <div
            style={{
                padding: 16,
                borderRadius: 10,
                background: isBalanced ? "#f0fdf4" : "#fefce8",
                border: `2px solid ${isBalanced ? "#86efac" : "#fde68a"}`,
            }}
        >
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: "#334155" }}>
                Verifica della legge di Ohm
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {/* Formula */}
                <div style={{
                    textAlign: "center",
                    fontSize: 18,
                    padding: "8px 12px",
                    background: "#fff",
                    borderRadius: 6,
                }}>
                    <Latex display>{`V = R \\cdot I`}</Latex>
                </div>

                {/* Sostituzione */}
                <div style={{
                    textAlign: "center",
                    fontSize: 16,
                    padding: "8px 12px",
                    background: "#fff",
                    borderRadius: 6,
                }}>
                    <Latex display>
                        {`${formatValue(voltage, 2)} \\text{ V} = ${formatValue(resistance, 0)} \\; \\Omega \\cdot ${formatValue(current, 2)} \\text{ A}`}
                    </Latex>
                </div>

                {/* Risultato */}
                <div style={{
                    textAlign: "center",
                    fontSize: 16,
                    padding: "8px 12px",
                    background: "#fff",
                    borderRadius: 6,
                }}>
                    <Latex display>
                        {`${formatValue(voltage, 2)} \\text{ V} = ${formatValue(computed, 2)} \\text{ V}`}
                    </Latex>
                </div>

                {/* Stato */}
                <div style={{
                    textAlign: "center",
                    fontSize: 14,
                    fontWeight: 700,
                    color: isBalanced ? "#16a34a" : "#ca8a04",
                    padding: "4px 0",
                }}>
                    {isBalanced ? "✓ La legge di Ohm è verificata!" : "⚠ I valori non sono coerenti con la legge di Ohm"}
                </div>
            </div>
        </div>
    );
}

// ============ COMPONENTE PRINCIPALE ============

export default function LeggeOhmDemo() {
    const { isMobile, isTablet } = useBreakpoint();

    const [state, setState] = useState<LabState>({
        voltage: 12,
        resistance: 20,
        current: 0.6,
        solveFor: "I",
    });

    const [isOn, setIsOn] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);

    // Ricalcola la grandezza selezionata
    const computedState = useMemo(() => {
        const s = { ...state };
        switch (s.solveFor) {
            case "V":
                s.voltage = clamp(s.resistance * s.current, V_MIN, V_MAX);
                break;
            case "R":
                s.resistance = s.current > 0.01
                    ? clamp(s.voltage / s.current, R_MIN, R_MAX)
                    : R_MAX;
                break;
            case "I":
                s.current = s.resistance > 0
                    ? clamp(s.voltage / s.resistance, I_MIN, I_MAX)
                    : 0;
                break;
        }
        return s;
    }, [state]);

    const handleSolveForChange = useCallback((sf: SolveFor) => {
        setState(prev => {
            // Ricalcola i valori coerenti per il nuovo modo
            const next = { ...prev, solveFor: sf };
            return next;
        });
    }, []);

    const handleVoltageChange = useCallback((v: number) => {
        setState(prev => ({ ...prev, voltage: v }));
    }, []);

    const handleResistanceChange = useCallback((r: number) => {
        setState(prev => ({ ...prev, resistance: r }));
    }, []);

    const handleCurrentChange = useCallback((i: number) => {
        setState(prev => ({ ...prev, current: i }));
    }, []);

    const handleMaterialSelect = useCallback((material: OhmicMaterial | null) => {
        if (material) {
            setSelectedMaterial(material.name);
            setState(prev => ({ ...prev, resistance: material.resistance }));
        } else {
            setSelectedMaterial(null);
        }
    }, []);

    const handleResistanceChangeWithClear = useCallback((r: number) => {
        setSelectedMaterial(null);
        handleResistanceChange(r);
    }, [handleResistanceChange]);

    // ============ SEZIONI ============

    const SolveForSelector = (
        <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8, fontWeight: 600 }}>
                Quale grandezza vuoi calcolare?
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {([
                    { key: "V" as SolveFor, label: "Tensione (V)", color: "#dc2626" },
                    { key: "R" as SolveFor, label: "Resistenza (R)", color: "#d97706" },
                    { key: "I" as SolveFor, label: "Corrente (I)", color: "#2563eb" },
                ]).map(({ key, label, color }) => (
                    <button
                        key={key}
                        onClick={() => handleSolveForChange(key)}
                        style={{
                            flex: 1,
                            minWidth: 90,
                            padding: "10px 12px",
                            borderRadius: 8,
                            border: `2px solid ${state.solveFor === key ? color : "#e2e8f0"}`,
                            background: state.solveFor === key ? color : "#fff",
                            color: state.solveFor === key ? "#fff" : "#334155",
                            fontWeight: 600,
                            fontSize: 13,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                        }}
                    >
                        {label}
                    </button>
                ))}
            </div>
        </div>
    );

    const Sliders = (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <LabSlider
                label="Tensione"
                symbol="V"
                unit="V"
                value={computedState.voltage}
                min={V_MIN}
                max={V_MAX}
                step={V_STEP}
                color="#dc2626"
                computed={state.solveFor === "V"}
                onChange={handleVoltageChange}
            />
            <LabSlider
                label="Resistenza"
                symbol="R"
                unit="Ω"
                value={computedState.resistance}
                min={R_MIN}
                max={R_MAX}
                step={R_STEP}
                color="#d97706"
                computed={state.solveFor === "R"}
                onChange={handleResistanceChangeWithClear}
            />
            <LabSlider
                label="Corrente"
                symbol="I"
                unit="A"
                value={computedState.current}
                min={I_MIN}
                max={I_MAX}
                step={I_STEP}
                color="#2563eb"
                computed={state.solveFor === "I"}
                onChange={handleCurrentChange}
            />
        </div>
    );

    // ── Helper per section card senza step numerati ──
    const sectionStyle = {
        background: "#fff",
        borderRadius: 12,
        border: "1px solid #e2e8f0",
        padding: 16,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    } as const;

    const sectionTitleStyle = {
        fontSize: 15,
        fontWeight: 700 as const,
        color: "#334155",
        marginBottom: 12,
    };

    const FormulaCard = (
        <div style={sectionStyle}>
            <div style={sectionTitleStyle}>📐 La Prima Legge di Ohm</div>
            <CollapsibleExplanation title="Spiegazione">
                <div>
                    <p>La prima legge di Ohm stabilisce la relazione tra le tre grandezze fondamentali di un circuito elettrico:</p>
                    <ul>
                        <li><strong>V</strong> = tensione (differenza di potenziale), misurata in <strong>Volt</strong> (V)</li>
                        <li><strong>R</strong> = resistenza, misurata in <strong>Ohm</strong> (Ω)</li>
                        <li><strong>I</strong> = intensità di corrente, misurata in <strong>Ampere</strong> (A)</li>
                    </ul>
                    <p>La legge afferma che la tensione è direttamente proporzionale alla corrente, con costante di proporzionalità pari alla resistenza.</p>
                </div>
            </CollapsibleExplanation>

            <div style={{
                textAlign: "center",
                padding: "16px 12px",
                background: "#eff6ff",
                borderRadius: 8,
                border: "1px solid #bfdbfe",
                marginBottom: 12,
            }}>
                <Latex display>{`V = R \\cdot I`}</Latex>
            </div>

            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6, fontWeight: 600 }}>Formule inverse:</div>
            <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                fontSize: 12,
            }}>
                <div style={{ textAlign: "center", padding: "8px 4px", background: "#fefce8", borderRadius: 6 }}>
                    <Latex>{`R = \\dfrac{V}{I}`}</Latex>
                </div>
                <div style={{ textAlign: "center", padding: "8px 4px", background: "#eff6ff", borderRadius: 6 }}>
                    <Latex>{`I = \\dfrac{V}{R}`}</Latex>
                </div>
            </div>
        </div>
    );

    const CircuitCard = (
        <div style={sectionStyle}>
            <div style={sectionTitleStyle}>⚡ Circuito</div>
            <CollapsibleExplanation title="Come si collegano gli strumenti">
                <div>
                    <p><strong>Amperometro (A)</strong>: si collega <strong>in serie</strong> al circuito, cioè il filo viene "interrotto" e l'amperometro viene inserito nel percorso della corrente. Così tutta la corrente che attraversa il circuito passa anche attraverso lo strumento.</p>
                    <p><strong>Voltmetro (V)</strong>: si collega <strong>in parallelo</strong> al componente di cui si vuole misurare la tensione (in questo caso il resistore). Si creano due fili aggiuntivi che collegano i morsetti del voltmetro ai due estremi del resistore.</p>
                </div>
            </CollapsibleExplanation>
            <div style={{ position: "relative" }}>
                <CircuitDiagram
                    voltage={computedState.voltage}
                    current={computedState.current}
                    resistance={computedState.resistance}
                    isOn={isOn}
                    onToggle={() => setIsOn(prev => !prev)}
                    materialName={selectedMaterial}
                    materialColor={OHMIC_MATERIALS.find(m => m.name === selectedMaterial)?.color || null}
                    isMobile={isMobile}
                />
                {/* Pulsante accendi/spegni */}
                <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
                    <button
                        onClick={() => setIsOn(prev => !prev)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "10px 24px",
                            borderRadius: 30,
                            border: "none",
                            background: isOn
                                ? "linear-gradient(135deg, #dc2626, #b91c1c)"
                                : "linear-gradient(135deg, #22c55e, #16a34a)",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: isMobile ? 14 : 15,
                            cursor: "pointer",
                            boxShadow: isOn
                                ? "0 0 16px rgba(220, 38, 38, 0.4)"
                                : "0 0 16px rgba(34, 197, 94, 0.4)",
                            transition: "all 0.3s ease",
                            letterSpacing: 0.5,
                        }}
                    >
                        {/* Icona power */}
                        <svg
                            width={isMobile ? 18 : 20}
                            height={isMobile ? 18 : 20}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                            <line x1="12" y1="2" x2="12" y2="12" />
                        </svg>
                        {isOn ? "SPEGNI" : "ACCENDI"}
                    </button>
                </div>
                {/* Indicatore stato */}
                <div style={{
                    textAlign: "center",
                    marginTop: 6,
                    fontSize: 12,
                    color: isOn ? "#dc2626" : "#64748b",
                    fontWeight: 600,
                }}>
                    <span style={{
                        display: "inline-block",
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: isOn ? "#dc2626" : "#d1d5db",
                        marginRight: 6,
                        boxShadow: isOn ? "0 0 8px rgba(220,38,38,0.6)" : "none",
                        transition: "all 0.3s ease",
                    }} />
                    {isOn ? "Circuito attivo" : "Circuito spento"}
                </div>
            </div>
        </div>
    );

    const MaterialSelector = (
        <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8, fontWeight: 600 }}>
                Materiale del resistore:
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {OHMIC_MATERIALS.map((mat) => {
                    const isSelected = selectedMaterial === mat.name;
                    return (
                        <button
                            key={mat.name}
                            onClick={() => handleMaterialSelect(isSelected ? null : mat)}
                            style={{
                                padding: "7px 12px",
                                borderRadius: 8,
                                border: `2px solid ${isSelected ? "#d97706" : "#e2e8f0"}`,
                                background: isSelected ? "#fffbeb" : "#fff",
                                color: "#334155",
                                fontSize: 12,
                                fontWeight: isSelected ? 700 : 500,
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                            }}
                        >
                            <span>{mat.emoji}</span>
                            <span>{mat.name}</span>
                            <span style={{
                                fontSize: 10,
                                color: "#d97706",
                                fontWeight: 700,
                            }}>
                                {mat.resistance} Ω
                            </span>
                        </button>
                    );
                })}
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>
                Valori indicativi per un filo di 1 m e sezione 1 mm²
            </div>
        </div>
    );

    const ControlsCard = (
        <div style={sectionStyle}>
            <div style={sectionTitleStyle}>🎛️ Pannello di controllo</div>
            {SolveForSelector}
            {Sliders}
            {MaterialSelector}
        </div>
    );

    const VerifCard = (
        <div style={sectionStyle}>
            <div style={sectionTitleStyle}>✓ Verifica</div>
            <VerificationBox
                voltage={computedState.voltage}
                resistance={computedState.resistance}
                current={computedState.current}
                solveFor={state.solveFor}
            />
        </div>
    );

    const ChartCard = (
        <div style={sectionStyle}>
            <div style={sectionTitleStyle}>📈 Grafico V-I</div>
            <CollapsibleExplanation title="Come si legge il grafico">
                <div>
                    <p>Il grafico mostra la relazione lineare tra corrente (I) e tensione (V) per la resistenza selezionata.</p>
                    <p>La <strong>pendenza</strong> della retta è uguale alla resistenza R: più è ripida, maggiore è la resistenza.</p>
                    <p>Il <strong>punto rosso</strong> rappresenta la condizione attuale del circuito.</p>
                </div>
            </CollapsibleExplanation>
            <VIChart
                resistance={computedState.resistance}
                currentPoint={{ v: computedState.voltage, i: computedState.current }}
                isMobile={isMobile}
            />
            <div style={{
                marginTop: 12,
                padding: "10px 14px",
                background: "#eff6ff",
                borderRadius: 8,
                border: "1px solid #bfdbfe",
                fontSize: 13,
                color: "#1e40af",
                lineHeight: 1.5,
            }}>
                Nei <strong>materiali ohmici</strong> (come i metalli), la tensione ΔV e la corrente I sono <strong>direttamente proporzionali</strong>: il grafico è una retta passante per l'origine. Il coefficiente angolare della retta è la resistenza R.
            </div>
        </div>
    );

    const NonOhmicCard = (
        <div style={sectionStyle}>
            <div style={sectionTitleStyle}>🔬 Conduttori ohmici e non ohmici</div>
            <OhmicComparisonChart isMobile={isMobile} />
            <div style={{ marginTop: 12, fontSize: 13, lineHeight: 1.6 }}>
                <div style={{
                    padding: "10px 14px",
                    background: "#eff6ff",
                    borderRadius: 8,
                    border: "1px solid #bfdbfe",
                    marginBottom: 10,
                }}>
                    <strong style={{ color: "#2563eb" }}>Conduttori ohmici</strong> — La relazione tra ΔV e I è <strong>lineare</strong> (retta). La resistenza R è costante e non dipende dalla tensione applicata. Esempi: fili metallici, resistori.
                </div>
                <div style={{
                    padding: "10px 14px",
                    background: "#fef2f2",
                    borderRadius: 8,
                    border: "1px solid #fecaca",
                }}>
                    <strong style={{ color: "#dc2626" }}>Conduttori non ohmici</strong> — La relazione tra ΔV e I <strong>non è lineare</strong> (curva). La resistenza varia al variare della tensione o della corrente. Esempi: diodi, lampadine a incandescenza, transistor.
                </div>
            </div>
        </div>
    );

    const TheoryContent = (
        <div style={{ fontSize: 13 }}>
            <div style={{ marginBottom: 12 }}>
                <strong>Analogia idraulica:</strong> immagina l'acqua in un tubo.
            </div>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
                <li style={{ marginBottom: 6 }}>
                    <strong>Tensione (V)</strong> = la pressione dell'acqua. Più pressione → più acqua scorre.
                </li>
                <li style={{ marginBottom: 6 }}>
                    <strong>Resistenza (R)</strong> = il diametro del tubo. Tubo stretto → meno acqua passa.
                </li>
                <li style={{ marginBottom: 6 }}>
                    <strong>Corrente (I)</strong> = la quantità d'acqua che scorre. Dipende da pressione e diametro.
                </li>
            </ul>
            <div style={{
                marginTop: 12,
                padding: 10,
                background: "#f8fafc",
                borderRadius: 6,
                fontSize: 12,
            }}>
                <strong>Proporzionalità:</strong>
                <ul style={{ paddingLeft: 16, margin: "6px 0 0 0" }}>
                    <li>A parità di R, se V raddoppia → I raddoppia (proporzionalità diretta)</li>
                    <li>A parità di V, se R raddoppia → I dimezza (proporzionalità inversa)</li>
                </ul>
            </div>
        </div>
    );

    // ============ MOBILE ============

    if (isMobile) {
        return (
            <DemoContainer title="Prima Legge di Ohm" description="Laboratorio interattivo: V = R · I">
                <SwipeableTabs
                    tabs={[
                        {
                            id: "lab",
                            label: "🔬 Lab",
                            content: (
                                <div style={{ display: "grid", gap: 12 }}>
                                    {ControlsCard}
                                    {CircuitCard}
                                    {VerifCard}
                                </div>
                            ),
                        },
                        {
                            id: "chart",
                            label: "📈 Grafico",
                            content: (
                                <div style={{ display: "grid", gap: 12 }}>
                                    {ChartCard}
                                    {NonOhmicCard}
                                </div>
                            ),
                        },
                        {
                            id: "theory",
                            label: "📖 Teoria",
                            content: (
                                <div style={{ display: "grid", gap: 12 }}>
                                    {FormulaCard}
                                    <CollapsiblePanel title="Analogia idraulica" defaultOpen>
                                        {TheoryContent}
                                    </CollapsiblePanel>
                                </div>
                            ),
                        },
                    ]}
                    defaultTab="lab"
                />
            </DemoContainer>
        );
    }

    // ============ TABLET ============

    if (isTablet) {
        return (
            <DemoContainer title="Prima Legge di Ohm" description="Laboratorio interattivo: V = R · I">
                <ResponsiveGrid columns={{ tablet: 2 }} gap={12}>
                    {FormulaCard}
                    {ControlsCard}
                </ResponsiveGrid>

                <div style={{ marginTop: 12 }}>
                    {CircuitCard}
                </div>

                <ResponsiveGrid columns={{ tablet: 2 }} gap={12}>
                    <div style={{ marginTop: 12 }}>
                        {VerifCard}
                    </div>
                    <div style={{ marginTop: 12 }}>
                        {ChartCard}
                    </div>
                </ResponsiveGrid>

                <div style={{ marginTop: 12 }}>
                    {NonOhmicCard}
                </div>

                <div style={{ marginTop: 16 }}>
                    <CollapsiblePanel title="📖 Analogia idraulica" defaultOpen={false}>
                        {TheoryContent}
                    </CollapsiblePanel>
                </div>
            </DemoContainer>
        );
    }

    // ============ DESKTOP ============

    return (
        <DemoContainer title="Prima Legge di Ohm" description="Laboratorio interattivo: V = R · I">
            <ResponsiveGrid columns={{ desktop: 2 }} gap={12}>
                {FormulaCard}
                {ControlsCard}
            </ResponsiveGrid>

            <div style={{ marginTop: 12 }}>
                {CircuitCard}
            </div>

            <ResponsiveGrid columns={{ desktop: 2 }} gap={12}>
                <div style={{ marginTop: 12 }}>
                    {VerifCard}
                </div>
                <div style={{ marginTop: 12 }}>
                    {ChartCard}
                </div>
            </ResponsiveGrid>

            <div style={{ marginTop: 12 }}>
                {NonOhmicCard}
            </div>

            <InfoBox title="📖 Analogia idraulica">
                {TheoryContent}
            </InfoBox>
        </DemoContainer>
    );
}