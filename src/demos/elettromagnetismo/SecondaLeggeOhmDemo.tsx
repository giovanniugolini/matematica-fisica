/**
 * SecondaLeggeOhmDemo - Demo interattiva sulla Seconda Legge di Ohm
 * R = ρ · l / A  —  l'utente regola lunghezza, sezione e materiale del conduttore
 */

import React, { useState, useCallback } from "react";
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

// ============ MATERIALI ============

interface ConductorMaterial {
    name: string;
    rho: number;   // resistività in Ω·m a 20 °C
    color: string;
    emoji: string;
}

// ρ in Ω·m a 20 °C (fonte: tabelle standard)
const MATERIALS: ConductorMaterial[] = [
    { name: "Argento",    rho: 1.59e-8, color: "#c8c8c8", emoji: "🥈" },
    { name: "Rame",       rho: 1.68e-8, color: "#b87333", emoji: "🟤" },
    { name: "Oro",        rho: 2.44e-8, color: "#d4a800", emoji: "🥇" },
    { name: "Alluminio",  rho: 2.65e-8, color: "#9da5b0", emoji: "⬜" },
    { name: "Tungsteno",  rho: 5.60e-8, color: "#6b7280", emoji: "⬛" },
    { name: "Ferro",      rho: 1.00e-7, color: "#9c7b6b", emoji: "🔩" },
    { name: "Costantana", rho: 4.90e-7, color: "#9b7b5a", emoji: "🟫" },
    { name: "Nichrome",   rho: 1.10e-6, color: "#b8b8c0", emoji: "⚙️"  },
];

const CUSTOM_MAT: ConductorMaterial = {
    name: "Personalizzato",
    rho: 0,
    color: "#6b7280",
    emoji: "🔧",
};

// ============ COSTANTI SLIDER ============

const RHO_MIN_1E8 = 1.0;   // 1 × 10⁻⁸ Ω·m
const RHO_MAX_1E8 = 200.0; // 200 × 10⁻⁸ Ω·m
const RHO_STEP_1E8 = 0.1;
const RHO_DEFAULT_1E8 = 1.68; // Rame

const L_MIN = 0.1;   // m
const L_MAX = 100.0; // m
const L_STEP = 0.1;
const L_DEFAULT = 10.0;

const A_MIN = 0.10;  // mm²
const A_MAX = 10.0;  // mm²
const A_STEP = 0.05;
const A_DEFAULT = 1.0;

// ============ HELPER ============

function clamp(v: number, lo: number, hi: number) {
    return Math.min(Math.max(v, lo), hi);
}

/** Resistività in unità di 10⁻⁸ Ω·m */
function rhoTo1e8(rho: number): number {
    return rho / 1e-8;
}

/** Formatta R con unità automatica */
function formatR(R: number): string {
    if (!isFinite(R) || R <= 0) return "—";
    if (R < 1e-3) return `${(R * 1e6).toFixed(2)} μΩ`;
    if (R < 1)    return `${(R * 1e3).toFixed(3)} mΩ`;
    if (R < 1e3)  return `${R.toFixed(4)} Ω`;
    if (R < 1e6)  return `${(R / 1e3).toFixed(3)} kΩ`;
    return `${(R / 1e6).toFixed(2)} MΩ`;
}

/** Schiarisce/scurisce un colore hex */
function shadeColor(hex: string, pct: number): string {
    const cleaned = hex.replace("#", "").padStart(6, "0");
    const num = parseInt(cleaned, 16);
    const r = clamp((num >> 16) + pct, 0, 255);
    const g = clamp(((num >> 8) & 0xff) + pct, 0, 255);
    const b = clamp((num & 0xff) + pct, 0, 255);
    return "#" + [r, g, b].map(x => Math.round(x).toString(16).padStart(2, "0")).join("");
}

// ============ GRIGLIA ATOMI (golden ratio, calcolata una sola volta) ============

// Posizioni pseudo-casuali deterministiche (sin-hash): non cambiano tra render
const ATOMS_POOL: { tx: number; ty: number }[] = (() => {
    const pts: { tx: number; ty: number }[] = [];
    for (let i = 0; i < 200; i++) {
        // Due serie hash indipendenti per x e y
        const rawX = Math.sin(i * 127.1 + 311.7) * 43758.5453123;
        const rawY = Math.sin(i * 269.5 + 183.3) * 43758.5453123;
        pts.push({
            tx: Math.abs(rawX - Math.floor(rawX)),
            ty: Math.abs(rawY - Math.floor(rawY)),
        });
    }
    return pts;
})();

// ============ SVG CONDUTTORE ============

interface ConductorSVGProps {
    length_m: number;
    area_mm2: number;
    mat: ConductorMaterial;
    rho_SI: number;   // valore effettivo di ρ (può differire da mat.rho per materiale personalizzato)
    R: number;
    isMobile?: boolean;
}

function ConductorSVG({ length_m, area_mm2, mat, rho_SI, R, isMobile = false }: ConductorSVGProps) {
    const svgW = isMobile ? 340 : 520;
    const svgH = isMobile ? 220 : 270;

    // Lunghezza visiva: scala logaritmica
    const logL    = Math.log10(clamp(length_m, L_MIN, L_MAX));
    const logLMin = Math.log10(L_MIN);
    const logLMax = Math.log10(L_MAX);
    const t_l = (logL - logLMin) / (logLMax - logLMin);
    const cylW = 50 + t_l * (svgW * 0.72 - 50);

    // Raggio visivo: proporzionale a √A
    const sqA    = Math.sqrt(clamp(area_mm2, A_MIN, A_MAX));
    const sqAMin = Math.sqrt(A_MIN);
    const sqAMax = Math.sqrt(A_MAX);
    const t_a = (sqA - sqAMin) / (sqAMax - sqAMin);
    const cylR = 14 + t_a * 32;

    const cx  = svgW / 2;
    const cy  = svgH / 2 - 14;
    const x0  = cx - cylW / 2;
    const x1  = cx + cylW / 2;
    const eRx = cylR * 0.22;

    const col  = mat.color;
    const colL = shadeColor(col, 45);
    const colD = shadeColor(col, -45);
    const colM = shadeColor(col, 20);

    // Numero ioni: proporzionale a ρ × l visivo (NON a A).
    // Con A più grande, gli stessi ioni si distribuiscono su più spazio → "spazio libero" visivo.
    const rho1e8Val  = clamp(rho_SI / 1e-8, RHO_MIN_1E8, RHO_MAX_1E8);
    const rhoFactor  = 1 + 3 * (rho1e8Val - RHO_MIN_1E8) / (RHO_MAX_1E8 - RHO_MIN_1E8); // 1..4
    const numAtoms   = Math.min(Math.floor(rhoFactor * cylW * 0.12), 120);
    const fs         = isMobile ? 10 : 12;
    const fsTitle    = isMobile ? 11 : 13;

    return (
        <svg
            width="100%"
            viewBox={`0 0 ${svgW} ${svgH}`}
            style={{ maxWidth: svgW, display: "block", margin: "0 auto" }}
        >
            <defs>
                <linearGradient id="sg2ohm-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={colL} />
                    <stop offset="45%"  stopColor={col} />
                    <stop offset="100%" stopColor={colD} />
                </linearGradient>
                <clipPath id="sg2ohm-clip">
                    <rect x={x0} y={cy - cylR} width={cylW} height={cylR * 2} />
                </clipPath>
            </defs>

            <rect x={0} y={0} width={svgW} height={svgH} rx={12} fill="#f8fafc" />

            {/* Corpo cilindrico */}
            <rect
                x={x0} y={cy - cylR}
                width={cylW} height={cylR * 2}
                fill="url(#sg2ohm-grad)"
                style={{ transition: "all 0.3s ease" }}
            />

            {/* Ioni positivi — distribuiti casualmente, più numerosi per ρ alta e l lunga;
                  con A grande si estendono su più spazio verticale → spazio libero visibile */}
            <g clipPath="url(#sg2ohm-clip)" opacity={0.6}>
                {ATOMS_POOL.slice(0, numAtoms).map((a, i) => (
                    <circle
                        key={i}
                        cx={x0 + a.tx * cylW}
                        cy={cy - cylR * 0.88 + a.ty * cylR * 1.76}
                        r={2.2}
                        fill="#1e293b"
                    />
                ))}
            </g>

            {/* Riflesso di luce */}
            <rect
                x={x0 + 4} y={cy - cylR + 4}
                width={cylW - 8} height={cylR * 0.28}
                rx={cylR * 0.14}
                fill="rgba(255,255,255,0.35)"
                clipPath="url(#sg2ohm-clip)"
                style={{ transition: "all 0.3s ease" }}
            />

            {/* Faccia sinistra */}
            <ellipse
                cx={x0} cy={cy}
                rx={eRx} ry={cylR}
                fill={colD}
                style={{ transition: "all 0.3s ease" }}
            />

            {/* Faccia destra */}
            <ellipse
                cx={x1} cy={cy}
                rx={eRx} ry={cylR}
                fill={colM}
                stroke={colD} strokeWidth={1}
                style={{ transition: "all 0.3s ease" }}
            />

            {/* Frecce corrente */}
            {[0.22, 0.5, 0.78].map((t, i) => {
                const ax = x0 + t * cylW;
                return (
                    <g key={i} opacity={0.8}>
                        <line
                            x1={ax - 8} y1={cy}
                            x2={ax + 2} y2={cy}
                            stroke="#ef4444" strokeWidth={1.5}
                        />
                        <polygon
                            points={`${ax + 2},${cy - 4} ${ax + 9},${cy} ${ax + 2},${cy + 4}`}
                            fill="#ef4444"
                        />
                    </g>
                );
            })}

            {/* Cotazione lunghezza */}
            {(() => {
                const dimY = cy + cylR + 14;
                return (
                    <g>
                        <line
                            x1={x0} y1={dimY} x2={x1} y2={dimY}
                            stroke="#64748b" strokeWidth={1.5} strokeDasharray="4,2"
                        />
                        <line x1={x0} y1={dimY - 5} x2={x0} y2={dimY + 5} stroke="#64748b" strokeWidth={1.5} />
                        <line x1={x1} y1={dimY - 5} x2={x1} y2={dimY + 5} stroke="#64748b" strokeWidth={1.5} />
                        <text
                            x={(x0 + x1) / 2} y={dimY + 14}
                            fontSize={fs} fill="#334155" fontWeight="bold" textAnchor="middle"
                        >
                            l = {length_m < 1 ? `${(length_m * 100).toFixed(0)} cm` : `${length_m.toFixed(1)} m`}
                        </text>
                    </g>
                );
            })()}

            {/* Label sezione */}
            <text
                x={x1 + eRx + 10} y={cy - cylR * 0.25}
                fontSize={fs} fill="#334155" textAnchor="start"
            >
                A = {area_mm2.toFixed(2)} mm²
            </text>

            {/* Label materiale */}
            <text
                x={svgW / 2} y={18}
                fontSize={fsTitle} fill="#334155" fontWeight="bold" textAnchor="middle"
            >
                {mat.emoji} {mat.name}  —  ρ = {(rho_SI / 1e-8).toFixed(2)} × 10⁻⁸ Ω·m
            </text>

            {/* Resistenza risultante */}
            <text
                x={svgW / 2} y={svgH - 8}
                fontSize={isMobile ? 14 : 16}
                fill="#dc2626" fontWeight="bold" textAnchor="middle"
            >
                R = {formatR(R)}
            </text>
        </svg>
    );
}

// ============ LAB SLIDER ============

interface LabSliderProps {
    label: string;
    symbol: string;
    unit: string;
    displayValue: string;
    value: number;
    min: number;
    max: number;
    step: number;
    color: string;
    disabled?: boolean;
    onChange: (v: number) => void;
}

function LabSlider({
    label, symbol, unit, displayValue,
    value, min, max, step,
    color, disabled = false, onChange,
}: LabSliderProps) {
    const pct = ((clamp(value, min, max) - min) / (max - min)) * 100;
    return (
        <div style={{
            padding: "12px 16px",
            background: "#fff",
            borderRadius: 10,
            border: `2px solid ${disabled ? "#e2e8f0" : color}`,
            opacity: disabled ? 0.5 : 1,
            transition: "all 0.2s ease",
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 28, height: 28, borderRadius: "50%",
                        background: color, color: "#fff",
                        fontWeight: 700, fontSize: 14,
                    }}>
                        {symbol}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#334155" }}>{label}</span>
                </div>
                <span style={{ fontSize: 17, fontWeight: 700, color: "#0f172a" }}>
                    {displayValue}
                </span>
            </div>
            <input
                type="range"
                min={min} max={max} step={step}
                value={clamp(value, min, max)}
                onChange={e => onChange(parseFloat(e.target.value))}
                disabled={disabled}
                style={{
                    width: "100%", height: 8, borderRadius: 4,
                    appearance: "none",
                    background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, #e2e8f0 ${pct}%, #e2e8f0 100%)`,
                    outline: "none",
                    cursor: disabled ? "not-allowed" : "pointer",
                    accentColor: color,
                }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                <span>{min} {unit}</span>
                <span>{max} {unit}</span>
            </div>
        </div>
    );
}

// ============ GRAFICO R vs l ============

interface ResistanceChartProps {
    rho_SI: number;
    length_m: number;
    area_mm2: number;
    isMobile?: boolean;
}

// ─── Costanti di riferimento per il grafico ───
// Il Ferro (10×10⁻⁸ Ω·m) è usato come riferimento della scala Y:
// tutti i metalli (Ag…W) hanno una pendenza visibile; le leghe (Co, Ni-Cr) escono
// dal grafico in alto, segnalate da una freccia, indicando pendenza molto più alta.
const RHO_SILVER = 1.59e-8;  // Argento — guida bassa (ρ min della lista)
const RHO_IRON   = 10e-8;    // Ferro   — riferimento scala Y  (100% del grafico a l=L_MAX)
const RHO_NIFE   = 1.10e-6;  // Nichrome — guida alta (ρ max della lista)

function fmtK(kVal: number): string {
    if (kVal < 1e-3) return `${(kVal * 1e6).toFixed(2)} μΩ/m`;
    if (kVal < 1)    return `${(kVal * 1e3).toFixed(4)} mΩ/m`;
    if (kVal < 1e3)  return `${kVal.toFixed(4)} Ω/m`;
    if (kVal < 1e6)  return `${(kVal / 1e3).toFixed(3)} kΩ/m`;
    return `${(kVal / 1e6).toFixed(2)} MΩ/m`;
}

function ResistanceChart({ rho_SI, length_m, area_mm2, isMobile = false }: ResistanceChartProps) {
    const w   = isMobile ? 310 : 390;
    const h   = isMobile ? 205 : 255;
    const pad = { top: 24, right: 32, bottom: 40, left: 60 };

    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;
    const fs    = isMobile ? 10 : 12;

    const A_m2 = area_mm2 * 1e-6;

    // ── SCALA Y: ancorata al FERRO (10×10⁻⁸ Ω·m), varia solo con A ──
    // Metalli (Ag…W): pendenza visibile (16%…100%).
    // Leghe (Co, Ni-Cr) e cursore oltre ferro: retta esce in cima, freccia ↑.
    const yMax = RHO_IRON * L_MAX / A_m2;

    const scaleX = (l: number) => pad.left + (l / L_MAX) * plotW;
    const scaleY = (R: number) => pad.top + plotH - clamp(R / yMax, 0, 1) * plotH;

    // ── Costante k = ρ/A [Ω/m] ──
    const k_slope = rho_SI / A_m2;

    const fmtYLabel = (R: number) => {
        if (R <= 0)   return "0";
        if (R < 1e-3) return `${(R * 1e6).toFixed(0)}μΩ`;
        if (R < 1)    return `${(R * 1e3).toFixed(0)}mΩ`;
        if (R < 1e3)  return `${R.toFixed(1)}Ω`;
        if (R < 1e6)  return `${(R / 1e3).toFixed(1)}kΩ`;
        return `${(R / 1e6).toFixed(1)}MΩ`;
    };

    // ── Retta corrente: esce da yMax se ρ > RHO_IRON ──
    const isClipped   = rho_SI > RHO_IRON;
    // l a cui R = yMax (punto di uscita dal grafico)
    const exitL       = isClipped ? (RHO_IRON / rho_SI) * L_MAX : L_MAX;
    const exitR       = Math.min(yMax, rho_SI * exitL / A_m2);
    const curLine     = `${scaleX(0)},${scaleY(0)} ${scaleX(exitL)},${scaleY(exitR)}`;

    // ── Linea guida Argento (piatta, ρ min) ──
    const silverEndR = RHO_SILVER * L_MAX / A_m2;   // sempre < yMax
    const silverLine = `${scaleX(0)},${scaleY(0)} ${scaleX(L_MAX)},${scaleY(silverEndR)}`;

    // ── Linea guida Nichrome (ripida, ρ max lista) ──
    const niIsClipped = RHO_NIFE > RHO_IRON;
    const niExitL     = niIsClipped ? (RHO_IRON / RHO_NIFE) * L_MAX : L_MAX;
    const niExitR     = Math.min(yMax, RHO_NIFE * niExitL / A_m2);
    const nichromeLine = `${scaleX(0)},${scaleY(0)} ${scaleX(niExitL)},${scaleY(niExitR)}`;

    // ── Label k sulla retta corrente ──
    const kLblL   = exitL * 0.6;
    const kLblR   = rho_SI * kLblL / A_m2;
    const kFrac   = kLblR / yMax;
    // Mostra l'etichetta solo se la retta è abbastanza visibile (>5% altezza)
    const showLbl = kFrac > 0.05 && kFrac < 0.90;

    // ── Punto corrente (solo se dentro scala) ──
    const curR         = rho_SI * length_m / A_m2;
    const pointVisible = curR <= yMax;

    // ── Punto fuori scala: mostra freccia rossa sul bordo superiore ──
    const offChartX = scaleX(clamp(length_m, 0, exitL));

    const numGridY = 5;
    const numGridX = 5;

    return (
        <>
            <svg
                width="100%"
                viewBox={`0 0 ${w} ${h}`}
                style={{ maxWidth: w, display: "block", margin: "0 auto" }}
            >
                <rect x={0} y={0} width={w} height={h} rx={8} fill="#fafafa" />

                {/* Griglia verticale */}
                {Array.from({ length: numGridX + 1 }).map((_, i) => {
                    const l = (i / numGridX) * L_MAX;
                    const x = scaleX(l);
                    return (
                        <g key={`gx-${i}`}>
                            <line x1={x} y1={pad.top} x2={x} y2={pad.top + plotH} stroke="#e5e7eb" strokeWidth={1} />
                            <text x={x} y={h - 4} fontSize={fs} fill="#64748b" textAnchor="middle">{l.toFixed(0)}</text>
                        </g>
                    );
                })}

                {/* Griglia orizzontale */}
                {Array.from({ length: numGridY + 1 }).map((_, i) => {
                    const R = (i / numGridY) * yMax;
                    const y = scaleY(R);
                    return (
                        <g key={`gy-${i}`}>
                            <line x1={pad.left} y1={y} x2={pad.left + plotW} y2={y} stroke="#e5e7eb" strokeWidth={1} />
                            <text x={pad.left - 4} y={y + 4} fontSize={fs - 1} fill="#64748b" textAnchor="end">
                                {fmtYLabel(R)}
                            </text>
                        </g>
                    );
                })}

                {/* Assi */}
                <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + plotH} stroke="#334155" strokeWidth={2} />
                <line x1={pad.left} y1={pad.top + plotH} x2={pad.left + plotW} y2={pad.top + plotH} stroke="#334155" strokeWidth={2} />

                {/* Label assi */}
                <text x={w / 2} y={h - 1} fontSize={fs} fill="#334155" fontWeight="bold" textAnchor="middle">l (m)</text>
                <text x={10} y={h / 2} fontSize={fs} fill="#334155" fontWeight="bold" textAnchor="middle"
                    transform={`rotate(-90, 10, ${h / 2})`}>R</text>

                {/* Nota scala Y */}
                <text x={pad.left + 2} y={pad.top - 6} fontSize={fs - 2} fill="#94a3b8" textAnchor="start">
                    scala: Fe (l = {L_MAX} m)
                </text>

                {/* ── Guida Argento — retta piatta (ρ min) ── */}
                <polyline points={silverLine}
                    fill="none" stroke="#94a3b8" strokeWidth={1.2} strokeDasharray="5,3" opacity={0.6} />
                <text x={scaleX(L_MAX) + 3} y={scaleY(silverEndR) + 4}
                    fontSize={fs - 2} fill="#94a3b8" textAnchor="start" fontStyle="italic">Ag</text>

                {/* ── Guida Nichrome — retta ripida (esce in alto) ── */}
                <polyline points={nichromeLine}
                    fill="none" stroke="#94a3b8" strokeWidth={1.2} strokeDasharray="5,3" opacity={0.6} />
                {niIsClipped && (
                    <polygon
                        points={`${scaleX(niExitL) - 4},${pad.top + 9} ${scaleX(niExitL) + 4},${pad.top + 9} ${scaleX(niExitL)},${pad.top + 1}`}
                        fill="#94a3b8" opacity={0.6}
                    />
                )}
                <text x={scaleX(niExitL) + 3} y={niIsClipped ? pad.top + 11 : scaleY(niExitR) - 3}
                    fontSize={fs - 2} fill="#94a3b8" textAnchor="start" fontStyle="italic">Ni-Cr</text>

                {/* ── Retta corrente R = k · l ── */}
                <polyline points={curLine}
                    fill="none" stroke="#2563eb" strokeWidth={2.8} strokeLinecap="round" />

                {/* Freccia ↑ se la retta esce dal grafico */}
                {isClipped && (
                    <polygon
                        points={`${scaleX(exitL) - 5},${pad.top + 10} ${scaleX(exitL) + 5},${pad.top + 10} ${scaleX(exitL)},${pad.top + 1}`}
                        fill="#2563eb"
                    />
                )}

                {/* Label k sulla retta (se visibile) */}
                {showLbl && (
                    <text x={scaleX(kLblL) + 6} y={scaleY(kLblR) - 7}
                        fontSize={fs - 1} fill="#2563eb" fontWeight="bold">
                        k = {fmtK(k_slope)}
                    </text>
                )}

                {/* ── Punto corrente (se dentro scala) ── */}
                {pointVisible && (
                    <g>
                        <line x1={scaleX(length_m)} y1={pad.top + plotH}
                            x2={scaleX(length_m)} y2={scaleY(curR)}
                            stroke="#ef4444" strokeWidth={1} strokeDasharray="4,3" />
                        <line x1={pad.left} y1={scaleY(curR)}
                            x2={scaleX(length_m)} y2={scaleY(curR)}
                            stroke="#ef4444" strokeWidth={1} strokeDasharray="4,3" />
                        <circle cx={scaleX(length_m)} cy={scaleY(curR)}
                            r={6} fill="#ef4444" stroke="#fff" strokeWidth={2} />
                    </g>
                )}

                {/* ── Punto fuori scala: freccia rossa sul bordo superiore ── */}
                {!pointVisible && length_m > 0 && (
                    <g>
                        <line x1={offChartX} y1={pad.top + plotH}
                            x2={offChartX} y2={pad.top + 12}
                            stroke="#ef4444" strokeWidth={1} strokeDasharray="4,3" />
                        <polygon
                            points={`${offChartX - 5},${pad.top + 12} ${offChartX + 5},${pad.top + 12} ${offChartX},${pad.top + 3}`}
                            fill="#ef4444"
                        />
                    </g>
                )}
            </svg>

            {/* ── Box costante di proporzionalità k ── */}
            <div style={{
                marginTop: 10,
                padding: "12px 16px",
                background: "#eff6ff",
                borderRadius: 8,
                border: "2px solid #bfdbfe",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
            }}>
                <div>
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>
                        Costante di proporzionalità — <em>R = <strong>k</strong> · l</em>
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>
                        k = ρ / A &nbsp;[Ω/m] — pendenza della retta
                    </div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#2563eb", whiteSpace: "nowrap" }}>
                    k = {fmtK(k_slope)}
                </div>
            </div>
        </>
    );
}

// ============ GRAFICO R vs A (iperbole) ============

interface AreaChartProps {
    rho_SI: number;
    length_m: number;
    area_mm2: number;
    isMobile?: boolean;
}

function fmtKinv(kMM: number): string {
    // kMM = ρ·l × 10⁶ in Ω·mm²  (con A in mm², R [Ω] = kMM / A [mm²])
    if (kMM < 1e-3) return `${(kMM * 1e6).toFixed(2)} nΩ·mm²`;
    if (kMM < 1)    return `${(kMM * 1e3).toFixed(3)} mΩ·mm²`;
    if (kMM < 1e3)  return `${kMM.toFixed(4)} Ω·mm²`;
    return `${(kMM / 1e3).toFixed(3)} kΩ·mm²`;
}

function AreaResistanceChart({ rho_SI, length_m, area_mm2, isMobile = false }: AreaChartProps) {
    const w   = isMobile ? 310 : 390;
    const h   = isMobile ? 205 : 255;
    const pad = { top: 24, right: 20, bottom: 40, left: 60 };

    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;
    const fs    = isMobile ? 10 : 12;

    // Costante di proporzionalità inversa
    const K_SI = rho_SI * length_m;          // [Ω·m²]
    const K_mm = K_SI * 1e6;                 // [Ω·mm²]  ← R[Ω] = K_mm / A[mm²]

    // Scala Y: adattata a K (cambia con ρ e l, non con A)
    const yMax = K_SI / (A_MIN * 1e-6);      // R massima = R all'area minima

    const scaleX = (A: number) => pad.left + ((A - A_MIN) / (A_MAX - A_MIN)) * plotW;
    const scaleY = (R: number) => pad.top + plotH - clamp(R / yMax, 0, 1) * plotH;

    const fmtYLabel = (R: number) => {
        if (R <= 0)   return "0";
        if (R < 1e-3) return `${(R * 1e6).toFixed(0)}μΩ`;
        if (R < 1)    return `${(R * 1e3).toFixed(0)}mΩ`;
        if (R < 1e3)  return `${R.toFixed(1)}Ω`;
        if (R < 1e6)  return `${(R / 1e3).toFixed(1)}kΩ`;
        return `${(R / 1e6).toFixed(1)}MΩ`;
    };

    // Curva iperbole: punti più densi a sinistra (dove la curva è più ripida)
    const curvePoints: string[] = [];
    const N = 150;
    for (let i = 0; i <= N; i++) {
        // Distribuzione non lineare: t² porta più punti vicino ad A_MIN
        const t    = i / N;
        const A_mm = A_MIN + (t * t) * (A_MAX - A_MIN);
        const R    = K_SI / (A_mm * 1e-6);
        curvePoints.push(`${scaleX(A_mm)},${scaleY(R)}`);
    }

    // Punto corrente
    const curR = K_SI / (area_mm2 * 1e-6);

    // Posizione label "R ∝ 1/A" sulla curva (~60% lungo la X)
    const lblA = A_MIN + 0.6 * (A_MAX - A_MIN);
    const lblR = K_SI / (lblA * 1e-6);

    const numGridX = 5;
    const numGridY = 4;

    return (
        <>
            <svg
                width="100%"
                viewBox={`0 0 ${w} ${h}`}
                style={{ maxWidth: w, display: "block", margin: "0 auto" }}
            >
                <rect x={0} y={0} width={w} height={h} rx={8} fill="#fafafa" />

                {/* Griglia verticale (A) */}
                {Array.from({ length: numGridX + 1 }).map((_, i) => {
                    const A = A_MIN + (i / numGridX) * (A_MAX - A_MIN);
                    const x = scaleX(A);
                    return (
                        <g key={`ax-${i}`}>
                            <line x1={x} y1={pad.top} x2={x} y2={pad.top + plotH} stroke="#e5e7eb" strokeWidth={1} />
                            <text x={x} y={h - 4} fontSize={fs} fill="#64748b" textAnchor="middle">
                                {A.toFixed(1)}
                            </text>
                        </g>
                    );
                })}

                {/* Griglia orizzontale (R) */}
                {Array.from({ length: numGridY + 1 }).map((_, i) => {
                    const R = (i / numGridY) * yMax;
                    const y = scaleY(R);
                    return (
                        <g key={`ay-${i}`}>
                            <line x1={pad.left} y1={y} x2={pad.left + plotW} y2={y} stroke="#e5e7eb" strokeWidth={1} />
                            <text x={pad.left - 4} y={y + 4} fontSize={fs - 1} fill="#64748b" textAnchor="end">
                                {fmtYLabel(R)}
                            </text>
                        </g>
                    );
                })}

                {/* Assi */}
                <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + plotH} stroke="#334155" strokeWidth={2} />
                <line x1={pad.left} y1={pad.top + plotH} x2={pad.left + plotW} y2={pad.top + plotH} stroke="#334155" strokeWidth={2} />

                {/* Freccia verso sinistra (asintoto A→0) */}
                <polygon
                    points={`${pad.left},${pad.top + 2} ${pad.left + 8},${pad.top - 3} ${pad.left + 8},${pad.top + 7}`}
                    fill="#334155" opacity={0.4}
                />
                <text x={pad.left + 10} y={pad.top + 6} fontSize={fs - 2} fill="#94a3b8" fontStyle="italic">→ ∞</text>

                {/* Label assi */}
                <text x={w / 2} y={h - 1} fontSize={fs} fill="#334155" fontWeight="bold" textAnchor="middle">A (mm²)</text>
                <text x={10} y={h / 2} fontSize={fs} fill="#334155" fontWeight="bold" textAnchor="middle"
                    transform={`rotate(-90, 10, ${h / 2})`}>R (Ω)</text>

                {/* Curva iperbole R = K / A */}
                <polyline
                    points={curvePoints.join(" ")}
                    fill="none" stroke="#7c3aed" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round"
                />

                {/* Label "R ∝ 1/A" sulla curva */}
                {lblR < yMax * 0.85 && (
                    <text
                        x={scaleX(lblA) + 6} y={scaleY(lblR) - 7}
                        fontSize={fs - 1} fill="#7c3aed" fontWeight="bold"
                    >
                        R ∝ 1/A
                    </text>
                )}

                {/* Punto corrente */}
                <g>
                    <line x1={scaleX(area_mm2)} y1={pad.top + plotH}
                        x2={scaleX(area_mm2)} y2={scaleY(curR)}
                        stroke="#ef4444" strokeWidth={1} strokeDasharray="4,3" />
                    <line x1={pad.left} y1={scaleY(curR)}
                        x2={scaleX(area_mm2)} y2={scaleY(curR)}
                        stroke="#ef4444" strokeWidth={1} strokeDasharray="4,3" />
                    <circle cx={scaleX(area_mm2)} cy={scaleY(curR)}
                        r={6} fill="#ef4444" stroke="#fff" strokeWidth={2} />
                </g>
            </svg>

            {/* Box costante di proporzionalità inversa */}
            <div style={{
                marginTop: 10,
                padding: "12px 16px",
                background: "#fdf4ff",
                borderRadius: 8,
                border: "2px solid #e9d5ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
            }}>
                <div>
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>
                        Costante di proporzionalità inversa — <em>R = <strong>K</strong> / A</em>
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>
                        K = ρ · l &nbsp;[Ω·mm²] — R · A = K = costante
                    </div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#7c3aed", whiteSpace: "nowrap" }}>
                    K = {fmtKinv(K_mm)}
                </div>
            </div>
        </>
    );
}

// ============ COMPONENTE PRINCIPALE ============

export default function SecondaLeggeOhmDemo() {
    const { isMobile, isTablet } = useBreakpoint();

    const [rho1e8, setRho1e8]         = useState(RHO_DEFAULT_1E8);
    const [length_m, setLength]        = useState(L_DEFAULT);
    const [area_mm2, setArea]          = useState(A_DEFAULT);
    const [selectedMatName, setSelectedMatName] = useState<string | null>("Rame");

    const rho_SI   = rho1e8 * 1e-8;
    const A_m2     = area_mm2 * 1e-6;
    const resistance = rho_SI * length_m / A_m2;

    const mat: ConductorMaterial = selectedMatName
        ? (MATERIALS.find(m => m.name === selectedMatName) ?? MATERIALS[1])
        : { ...CUSTOM_MAT, rho: rho_SI };

    const handleMaterialSelect = useCallback((name: string) => {
        const found = MATERIALS.find(m => m.name === name);
        if (found) {
            setSelectedMatName(name);
            setRho1e8(rhoTo1e8(found.rho));
        }
    }, []);

    const handleRhoChange = useCallback((v: number) => {
        setRho1e8(v);
        const match = MATERIALS.find(m => Math.abs(rhoTo1e8(m.rho) - v) < 0.06);
        setSelectedMatName(match ? match.name : null);
    }, []);

    // ─── Stili riutilizzabili ───
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

    // ─── FormulaCard ───
    const FormulaCard = (
        <div style={sectionStyle}>
            <div style={sectionTitleStyle}>📐 La Seconda Legge di Ohm</div>
            <CollapsibleExplanation title="Spiegazione">
                <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                    <p>La seconda legge di Ohm descrive come la resistenza di un conduttore dipende dalla sua <strong>forma</strong> e dal <strong>materiale</strong>:</p>
                    <ul>
                        <li><strong>ρ (rho)</strong> = resistività del materiale [Ω·m] — dipende solo dal materiale e dalla temperatura</li>
                        <li><strong>l</strong> = lunghezza del conduttore [m] — R cresce proporzionalmente a l</li>
                        <li><strong>A</strong> = sezione trasversale [m²] — R decresce al crescere di A</li>
                    </ul>
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
                <Latex display>{`R = \\frac{\\rho \\cdot l}{A}`}</Latex>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, fontSize: 12 }}>
                <div style={{ textAlign: "center", padding: "8px 6px", background: "#fef3c7", borderRadius: 6 }}>
                    <div style={{ fontWeight: 700, color: "#92400e", marginBottom: 4 }}>ρ (resistività)</div>
                    <div style={{ color: "#64748b", fontSize: 11 }}>proprietà del<br />materiale</div>
                    <div style={{ color: "#92400e", fontWeight: 600, marginTop: 4 }}>Ω·m</div>
                </div>
                <div style={{ textAlign: "center", padding: "8px 6px", background: "#f0fdf4", borderRadius: 6 }}>
                    <div style={{ fontWeight: 700, color: "#14532d", marginBottom: 4 }}>l (lunghezza)</div>
                    <div style={{ color: "#64748b", fontSize: 11 }}>R ∝ l<br />(diretta)</div>
                    <div style={{ color: "#14532d", fontWeight: 600, marginTop: 4 }}>m</div>
                </div>
                <div style={{ textAlign: "center", padding: "8px 6px", background: "#fdf4ff", borderRadius: 6 }}>
                    <div style={{ fontWeight: 700, color: "#6b21a8", marginBottom: 4 }}>A (sezione)</div>
                    <div style={{ color: "#64748b", fontSize: 11 }}>R ∝ 1/A<br />(inversa)</div>
                    <div style={{ color: "#6b21a8", fontWeight: 600, marginTop: 4 }}>m²</div>
                </div>
            </div>
        </div>
    );

    // ─── Selettore materiale ───
    const MaterialSelector = (
        <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8, fontWeight: 600 }}>
                Materiale del conduttore:
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {MATERIALS.map(m => {
                    const sel = selectedMatName === m.name;
                    return (
                        <button
                            key={m.name}
                            onClick={() => handleMaterialSelect(m.name)}
                            style={{
                                padding: "7px 10px",
                                borderRadius: 8,
                                border: `2px solid ${sel ? "#2563eb" : "#e2e8f0"}`,
                                background: sel ? "#eff6ff" : "#fff",
                                color: "#334155",
                                fontSize: 12,
                                fontWeight: sel ? 700 : 500,
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                            }}
                        >
                            <span style={{
                                display: "inline-block",
                                width: 10, height: 10,
                                borderRadius: "50%",
                                background: m.color,
                                border: "1px solid #94a3b8",
                                flexShrink: 0,
                            }} />
                            {m.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );

    // ─── Sliders ───
    const SlidersPanel = (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <LabSlider
                label="Resistività"
                symbol="ρ"
                unit=""
                displayValue={`${rho1e8.toFixed(2)} ×10⁻⁸ Ω·m`}
                value={rho1e8}
                min={RHO_MIN_1E8}
                max={RHO_MAX_1E8}
                step={RHO_STEP_1E8}
                color="#d97706"
                onChange={handleRhoChange}
            />
            <LabSlider
                label="Lunghezza"
                symbol="l"
                unit="m"
                displayValue={length_m < 1 ? `${(length_m * 100).toFixed(0)} cm` : `${length_m.toFixed(1)} m`}
                value={length_m}
                min={L_MIN}
                max={L_MAX}
                step={L_STEP}
                color="#16a34a"
                onChange={setLength}
            />
            <LabSlider
                label="Sezione"
                symbol="A"
                unit="mm²"
                displayValue={`${area_mm2.toFixed(2)} mm²`}
                value={area_mm2}
                min={A_MIN}
                max={A_MAX}
                step={A_STEP}
                color="#7c3aed"
                onChange={setArea}
            />
        </div>
    );

    const ControlsCard = (
        <div style={sectionStyle}>
            <div style={sectionTitleStyle}>🎛️ Pannello di controllo</div>
            {MaterialSelector}
            {SlidersPanel}
        </div>
    );

    // ─── Conduttore Card ───
    const ConductorCard = (
        <div style={sectionStyle}>
            <div style={sectionTitleStyle}>🔧 Conduttore</div>
            <ConductorSVG
                length_m={length_m}
                area_mm2={area_mm2}
                mat={mat}
                rho_SI={rho_SI}
                R={resistance}
                isMobile={isMobile}
            />
            {/* Box risultato */}
            <div style={{
                marginTop: 12,
                padding: "14px 16px",
                background: "#fef2f2",
                borderRadius: 10,
                border: "2px solid #fca5a5",
            }}>
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8, textAlign: "center" }}>
                    Resistenza calcolata con R = ρ · l / A
                </div>
                <div style={{ textAlign: "center", marginBottom: 10 }}>
                    <Latex display>
                        {`R = \\frac{${rho1e8.toFixed(2)} \\times 10^{-8} \\times ${length_m.toFixed(1)}}{${area_mm2.toFixed(2)} \\times 10^{-6}}`}
                    </Latex>
                </div>
                <div style={{
                    textAlign: "center",
                    fontSize: 26,
                    fontWeight: 800,
                    color: "#dc2626",
                    padding: "4px 0",
                }}>
                    R = {formatR(resistance)}
                </div>
            </div>
        </div>
    );

    // ─── ChartCard ───
    const ChartCard = (
        <div style={sectionStyle}>
            <div style={sectionTitleStyle}>📈 Grafico R vs lunghezza</div>
            <CollapsibleExplanation title="Come si legge il grafico">
                <div style={{ fontSize: 13 }}>
                    <p>
                        La <strong>scala Y è fissa</strong>, ancorata al <strong>Ferro</strong> (ρ = 10×10⁻⁸ Ω·m)
                        per la sezione A = {area_mm2.toFixed(2)} mm²: varia ρ e vedi la retta ruotare.
                    </p>
                    <p>
                        Tutti i <strong>metalli</strong> (Ag → W) hanno pendenza visibile: da ~16% (Argento) a ~56% (Tungsteno) dell'altezza del grafico.
                        Le <strong>leghe</strong> (Costantana, Nichrome) escono dal grafico in cima — la freccia ↑ indica che la resistenza supera la scala.
                    </p>
                    <p>
                        La <strong>pendenza k = ρ/A</strong> è la costante di proporzionalità diretta fra R e l.
                        Cambia ρ o A e osserva come k varia nel box sotto.
                    </p>
                </div>
            </CollapsibleExplanation>
            <ResistanceChart
                rho_SI={rho_SI}
                length_m={length_m}
                area_mm2={area_mm2}
                isMobile={isMobile}
            />
            <div style={{
                marginTop: 10,
                padding: "10px 14px",
                background: "#eff6ff",
                borderRadius: 8,
                border: "1px solid #bfdbfe",
                fontSize: 13,
                color: "#1e40af",
            }}>
                La <strong>pendenza</strong> della retta è ρ/A: materiali più resistivi o sezioni più piccole producono rette più ripide.
            </div>
        </div>
    );

    // ─── AreaChartCard ───
    const AreaChartCard = (
        <div style={sectionStyle}>
            <div style={sectionTitleStyle}>📉 Grafico R vs sezione</div>
            <CollapsibleExplanation title="Come si legge il grafico">
                <div style={{ fontSize: 13 }}>
                    <p>
                        La curva è un <strong>ramo di iperbole</strong>: R = K / A dove K = ρ·l è una costante.
                        All'aumentare della sezione A, la resistenza cala rapidamente (proporzionalità inversa).
                    </p>
                    <p>
                        <strong>K = ρ·l</strong> è la costante di proporzionalità inversa tra R e A.
                        Varia solo con ρ e l; il punto rosso si muove sulla curva al variare di A.
                    </p>
                    <p>
                        Il grafico mostra perché i cavi elettrici spessi hanno meno resistenza di quelli sottili.
                    </p>
                </div>
            </CollapsibleExplanation>
            <AreaResistanceChart
                rho_SI={rho_SI}
                length_m={length_m}
                area_mm2={area_mm2}
                isMobile={isMobile}
            />
            <div style={{
                marginTop: 10,
                padding: "10px 14px",
                background: "#fdf4ff",
                borderRadius: 8,
                border: "1px solid #e9d5ff",
                fontSize: 13,
                color: "#6b21a8",
            }}>
                La <strong>sezione A</strong> e la resistenza R sono in <strong>proporzione inversa</strong>: raddoppiare la sezione dimezza R.
            </div>
        </div>
    );

    // ─── Tabella comparativa ───
    const ComparisonCard = (
        <div style={sectionStyle}>
            <div style={sectionTitleStyle}>📊 Confronto materiali</div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>
                R calcolata per l = {length_m.toFixed(1)} m, A = {area_mm2.toFixed(2)} mm²
            </div>
            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: isMobile ? 11 : 13 }}>
                    <thead>
                        <tr style={{ background: "#f1f5f9" }}>
                            <th style={{ padding: "8px 10px", textAlign: "left",  color: "#334155", fontWeight: 700 }}>Materiale</th>
                            <th style={{ padding: "8px 10px", textAlign: "right", color: "#92400e", fontWeight: 700 }}>ρ (×10⁻⁸ Ω·m)</th>
                            <th style={{ padding: "8px 10px", textAlign: "right", color: "#dc2626", fontWeight: 700 }}>R</th>
                        </tr>
                    </thead>
                    <tbody>
                        {MATERIALS.map((m, i) => {
                            const R   = m.rho * length_m / A_m2;
                            const sel = m.name === selectedMatName;
                            return (
                                <tr
                                    key={m.name}
                                    onClick={() => handleMaterialSelect(m.name)}
                                    style={{
                                        background: sel ? "#eff6ff" : i % 2 === 0 ? "#fff" : "#f8fafc",
                                        cursor: "pointer",
                                        fontWeight: sel ? 700 : 400,
                                        transition: "background 0.15s",
                                    }}
                                >
                                    <td style={{ padding: "7px 10px" }}>
                                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            <span style={{
                                                display: "inline-block",
                                                width: 10, height: 10,
                                                borderRadius: "50%",
                                                background: m.color,
                                                border: "1px solid #94a3b8",
                                                flexShrink: 0,
                                            }} />
                                            {m.name}
                                        </span>
                                    </td>
                                    <td style={{ padding: "7px 10px", textAlign: "right", color: "#92400e" }}>
                                        {rhoTo1e8(m.rho).toFixed(2)}
                                    </td>
                                    <td style={{ padding: "7px 10px", textAlign: "right", color: "#dc2626", fontWeight: 600 }}>
                                        {formatR(R)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>
                Clicca su una riga per selezionare il materiale. Valori a 20 °C.
            </div>
        </div>
    );

    // ─── Teoria ───
    const TheoryContent = (
        <div style={{ fontSize: 13, lineHeight: 1.6 }}>
            <div style={{ marginBottom: 10 }}>
                <strong>Analogia con le tubature:</strong>
            </div>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
                <li style={{ marginBottom: 6 }}>
                    <strong>Lunghezza (l)</strong>: come la lunghezza di un tubo — più è lungo, più l'acqua incontra attrito → R cresce con l.
                </li>
                <li style={{ marginBottom: 6 }}>
                    <strong>Sezione (A)</strong>: come il diametro del tubo — più è largo, più l'acqua scorre → R diminuisce con A.
                </li>
                <li style={{ marginBottom: 6 }}>
                    <strong>Resistività (ρ)</strong>: come il materiale delle pareti — alcuni conducono meglio di altri.
                </li>
            </ul>
            <div style={{
                marginTop: 10,
                padding: "10px 14px",
                background: "#f8fafc",
                borderRadius: 8,
                fontSize: 12,
            }}>
                <strong>Proporzionalità:</strong>
                <ul style={{ paddingLeft: 16, margin: "6px 0 0 0" }}>
                    <li>Se l raddoppia → R raddoppia (diretta)</li>
                    <li>Se A raddoppia → R dimezza (inversa)</li>
                    <li>Se ρ raddoppia → R raddoppia (diretta)</li>
                </ul>
            </div>
        </div>
    );

    // ─── MOBILE ───
    if (isMobile) {
        return (
            <DemoContainer title="Seconda Legge di Ohm" description="R = ρ · l / A — regola lunghezza, sezione e materiale">
                <SwipeableTabs
                    tabs={[
                        {
                            id: "lab",
                            label: "🔬 Lab",
                            content: (
                                <div style={{ display: "grid", gap: 12 }}>
                                    {ControlsCard}
                                    {ConductorCard}
                                </div>
                            ),
                        },
                        {
                            id: "grafici",
                            label: "📈 Grafici",
                            content: (
                                <div style={{ display: "grid", gap: 12 }}>
                                    {ChartCard}
                                    {AreaChartCard}
                                    {ComparisonCard}
                                </div>
                            ),
                        },
                        {
                            id: "teoria",
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

    // ─── TABLET ───
    if (isTablet) {
        return (
            <DemoContainer title="Seconda Legge di Ohm" description="R = ρ · l / A">
                <ResponsiveGrid columns={{ tablet: 2 }} gap={12}>
                    {FormulaCard}
                    {ControlsCard}
                </ResponsiveGrid>
                <div style={{ marginTop: 12 }}>{ConductorCard}</div>
                <ResponsiveGrid columns={{ tablet: 2 }} gap={12}>
                    <div style={{ marginTop: 12 }}>{ChartCard}</div>
                    <div style={{ marginTop: 12 }}>{AreaChartCard}</div>
                </ResponsiveGrid>
                <div style={{ marginTop: 12 }}>{ComparisonCard}</div>
                <div style={{ marginTop: 16 }}>
                    <CollapsiblePanel title="📖 Analogia idraulica" defaultOpen={false}>
                        {TheoryContent}
                    </CollapsiblePanel>
                </div>
            </DemoContainer>
        );
    }

    // ─── DESKTOP ───
    return (
        <DemoContainer title="Seconda Legge di Ohm" description="R = ρ · l / A">
            <ResponsiveGrid columns={{ desktop: 2 }} gap={12}>
                {FormulaCard}
                {ControlsCard}
            </ResponsiveGrid>
            <div style={{ marginTop: 12 }}>{ConductorCard}</div>
            <ResponsiveGrid columns={{ desktop: 2 }} gap={12}>
                <div style={{ marginTop: 12 }}>{ChartCard}</div>
                <div style={{ marginTop: 12 }}>{AreaChartCard}</div>
            </ResponsiveGrid>
            <div style={{ marginTop: 12 }}>{ComparisonCard}</div>
            <InfoBox title="📖 Analogia idraulica">
                {TheoryContent}
            </InfoBox>
        </DemoContainer>
    );
}
