/**
 * ResistenzeSerieParalleloDemo — Laboratorio interattivo
 * Tab 1: Resistenze in serie    → Req = R1 + R2 + R3
 * Tab 2: Resistenze in parallelo → 1/Req = 1/R1 + 1/R2 + 1/R3
 *
 * Funzionalità strumenti:
 *  - Clicca "A" (amperometro) o "V" (voltmetro) nella cassetta degli attrezzi
 *  - Clicca uno slot nel circuito per posizionare/rimuovere lo strumento
 *  - Amperometro: in serie sul filo  |  Voltmetro: in parallelo al componente
 */

import React, { useState } from "react";
import {
    Latex,
    DemoContainer,
    InfoBox,
    useBreakpoint,
    SwipeableTabs,
} from "../../components/ui";
import { CollapsibleExplanation } from "../../components/ui/CollapsibleExplanation";

// ── Costanti ──────────────────────────────────────────────────────────────────

const R_MIN = 10;
const R_MAX = 500;
const R_STEP = 10;
const V_MIN = 1;
const V_MAX = 12;
const V_STEP = 0.5;

const RC = ["#3b82f6", "#22c55e", "#f59e0b"] as const;
const AM_COLOR = "#7c3aed";
const VM_COLOR = "#0891b2";

type CurrentDirection = "convention" | "reality";
type InstrumentTool = "ammeter" | "voltmeter" | null;

// ── Helpers ───────────────────────────────────────────────────────────────────

function clamp(v: number, lo: number, hi: number) { return Math.min(Math.max(v, lo), hi); }
function s3(n: number) { return parseFloat(n.toPrecision(3)).toString(); }
function fmtR(r: number) { return r >= 1000 ? `${s3(r / 1000)} kΩ` : `${s3(r)} Ω`; }
function fmtI(i: number) {
    if (!isFinite(i) || i < 0) return "—";
    if (i < 1e-3) return `${s3(i * 1e6)} μA`;
    if (i < 1)    return `${s3(i * 1e3)} mA`;
    return `${s3(i)} A`;
}
function fmtV(v: number) { return `${s3(v)} V`; }
function calcAnimDur(I: number): string {
    return `${Math.max(0.3, 1.5 - 0.6 * Math.log10(Math.max(I, 0.001) / 0.001))}s`;
}

// ── Slider ────────────────────────────────────────────────────────────────────

function Slider({ label, value, min, max, step, color, unit, onChange }: {
    label: string; value: number; min: number; max: number;
    step: number; color: string; unit: string; onChange: (v: number) => void;
}) {
    const pct = ((clamp(value, min, max) - min) / (max - min)) * 100;
    return (
        <div style={{ padding: "10px 12px", background: "#fff", borderRadius: 10, border: `2px solid ${color}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#334155", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ display: "inline-block", width: 11, height: 11, borderRadius: 3, background: color }} />
                    {label}
                </span>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{value}{unit}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={clamp(value, min, max)}
                onChange={e => onChange(parseFloat(e.target.value))}
                style={{
                    width: "100%", height: 7, borderRadius: 4, appearance: "none", outline: "none",
                    background: `linear-gradient(to right, ${color} ${pct}%, #e2e8f0 ${pct}%)`,
                    cursor: "pointer", accentColor: color,
                }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
                <span>{min}{unit}</span><span>{max}{unit}</span>
            </div>
        </div>
    );
}

// ── ResultCard ────────────────────────────────────────────────────────────────

function ResultCard({ label, value, sub, color, big }: {
    label: string; value: string; sub?: string; color?: string; big?: boolean;
}) {
    return (
        <div style={{
            background: color ? `${color}12` : "#f8fafc",
            border: color ? `2px solid ${color}` : "1px solid #e2e8f0",
            borderRadius: 8, padding: "10px 14px", textAlign: "center",
        }}>
            <div style={{ fontSize: 11, color: color ?? "#64748b", fontWeight: 700, marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: big ? 20 : 16, fontWeight: 700, color: color ?? "#0f172a" }}>{value}</div>
            {sub && <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>{sub}</div>}
        </div>
    );
}

// ── Cassetta degli attrezzi ───────────────────────────────────────────────────

function Toolbox({ selected, onSelect, isMobile }: {
    selected: InstrumentTool; onSelect: (t: InstrumentTool) => void; isMobile: boolean;
}) {
    const btn = (tool: "ammeter" | "voltmeter", label: string, sym: string, color: string) => {
        const active = selected === tool;
        return (
            <button
                onClick={() => onSelect(active ? null : tool)}
                style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: isMobile ? "8px 14px" : "9px 18px",
                    borderRadius: 10, border: `2px solid ${active ? color : "#e2e8f0"}`,
                    background: active ? `${color}15` : "#fff",
                    cursor: "pointer", fontWeight: 600, fontSize: 13,
                    color: active ? color : "#64748b",
                    boxShadow: active ? `0 0 0 3px ${color}33` : "none",
                    transition: "all 0.2s",
                }}
            >
                <svg width={28} height={28} viewBox="0 0 28 28">
                    <circle cx={14} cy={14} r={12} fill="#fff" stroke={color} strokeWidth={2} />
                    <text x={14} y={19} textAnchor="middle" fontSize={13} fontWeight="bold" fill={color}>{sym}</text>
                </svg>
                {label}
            </button>
        );
    };
    return (
        <div style={{
            background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10,
            padding: "10px 14px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
        }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>🔧 Strumenti:</span>
            {btn("ammeter", "Amperometro (in serie)", "A", AM_COLOR)}
            {btn("voltmeter", "Voltmetro (in parallelo)", "V", VM_COLOR)}
            {selected && (
                <span style={{ fontSize: 12, color: "#f59e0b", fontWeight: 600 }}>
                    ↓ Clicca uno slot nel circuito
                </span>
            )}
        </div>
    );
}

// ── SVG: zigzag orizzontale ───────────────────────────────────────────────────

function ZigzagH({ cx, y, color, halfW = 24, amp = 8 }: {
    cx: number; y: number; color: string; halfW?: number; amp?: number;
}) {
    const xs = cx - halfW, xe = cx + halfW;
    const segs = 6;
    const sw = (xe - xs) / segs;
    let d = `M ${xs} ${y}`;
    for (let i = 0; i < segs; i++) d += ` L ${xs + (i + 0.5) * sw} ${y + (i % 2 === 0 ? -amp : amp)}`;
    d += ` L ${xe} ${y}`;
    return (
        <g>
            <rect x={cx - halfW - 3} y={y - amp - 3} width={(halfW + 3) * 2} height={(amp + 3) * 2}
                rx={amp + 2} fill={`${color}20`} stroke={color} strokeWidth={1.2} strokeOpacity={0.5} />
            <path d={d} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        </g>
    );
}

// ── SVG: zigzag verticale (per ramo parallelo) ───────────────────────────────

function ZigzagV({ cx, cy, color, halfH = 26, amp = 8 }: {
    cx: number; cy: number; color: string; halfH?: number; amp?: number;
}) {
    const ys = cy - halfH, ye = cy + halfH;
    const segs = 6;
    const sh = (ye - ys) / segs;
    let d = `M ${cx} ${ys}`;
    for (let i = 0; i < segs; i++) d += ` L ${cx + (i % 2 === 0 ? amp : -amp)} ${ys + (i + 0.5) * sh}`;
    d += ` L ${cx} ${ye}`;
    return (
        <g>
            <rect x={cx - amp - 3} y={cy - halfH - 3} width={(amp + 3) * 2} height={(halfH + 3) * 2}
                rx={amp + 2} fill={`${color}20`} stroke={color} strokeWidth={1.2} strokeOpacity={0.5} />
            <path d={d} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        </g>
    );
}

// ── SVG: slot amperometro (su filo) ──────────────────────────────────────────

function AmSlot({ cx, cy, placed, value, isOn, toolActive, onClick, fs }: {
    cx: number; cy: number; placed: boolean; value: string; isOn: boolean;
    toolActive: boolean; onClick: () => void; fs: number;
}) {
    const r = 13;
    if (placed) {
        return (
            <g onClick={onClick} style={{ cursor: "pointer" }}>
                {/* blocca il filo con rettangolo bianco */}
                <rect x={cx - r - 1} y={cy - r - 1} width={(r + 1) * 2} height={(r + 1) * 2} fill="#f8fafc" />
                {/* cerchio strumento */}
                <circle cx={cx} cy={cy} r={r} fill="#fff" stroke={AM_COLOR} strokeWidth={2} />
                {/* quadrante interno */}
                <rect x={cx - r + 3} y={cy - r + 3} width={(r - 3) * 2} height={r - 2} rx={3} fill="#1e293b" />
                {/* ago */}
                {(() => {
                    const ratio = isOn ? 0.7 : 0;
                    const angle = -60 + ratio * 120;
                    const rad = (angle - 90) * Math.PI / 180;
                    const len = r - 5;
                    return <line x1={cx} y1={cy + 1} x2={cx + len * Math.cos(rad)} y2={cy + 1 + len * Math.sin(rad)}
                        stroke="#dc2626" strokeWidth={1.5} strokeLinecap="round" />;
                })()}
                <circle cx={cx} cy={cy + 1} r={2} fill="#dc2626" />
                <text x={cx} y={cy + r - 1} textAnchor="middle" fontSize={fs} fill={AM_COLOR} fontWeight="bold">A</text>
                <text x={cx} y={cy + r + 13} textAnchor="middle" fontSize={fs} fill={AM_COLOR} fontWeight="bold">
                    {isOn ? value : "0"}
                </text>
            </g>
        );
    }
    if (!toolActive) return null;
    return (
        <g onClick={onClick} style={{ cursor: "crosshair" }}>
            <circle cx={cx} cy={cy} r={r} fill={`${AM_COLOR}18`} stroke={AM_COLOR}
                strokeWidth={1.5} strokeDasharray="4,3" />
            <text x={cx} y={cy + 5} textAnchor="middle" fontSize={fs} fill={AM_COLOR} opacity={0.6}>A</text>
        </g>
    );
}

// ── SVG: slot voltmetro (in parallelo, con connessioni) ───────────────────────

function VmSlot({ cx, cy, xl, xr, topY, placed, value, isOn, toolActive, onClick, fs }: {
    cx: number; cy: number; xl: number; xr: number; topY: number;
    placed: boolean; value: string; isOn: boolean;
    toolActive: boolean; onClick: () => void; fs: number;
}) {
    const r = 13;
    if (!placed && !toolActive) return null;
    return (
        <g onClick={onClick} style={{ cursor: placed ? "pointer" : "crosshair" }}>
            {/* Fili di collegamento diagonali (solo se placed) */}
            {placed && (
                <>
                    <line x1={xl} y1={topY} x2={cx - r + 2} y2={cy} stroke={VM_COLOR} strokeWidth={1} strokeDasharray="3,2" strokeOpacity={0.7} />
                    <line x1={xr} y1={topY} x2={cx + r - 2} y2={cy} stroke={VM_COLOR} strokeWidth={1} strokeDasharray="3,2" strokeOpacity={0.7} />
                    <circle cx={xl} cy={topY} r={3} fill={VM_COLOR} opacity={0.7} />
                    <circle cx={xr} cy={topY} r={3} fill={VM_COLOR} opacity={0.7} />
                </>
            )}
            {/* Cerchio strumento */}
            <circle cx={cx} cy={cy} r={r} fill="#fff" stroke={VM_COLOR}
                strokeWidth={placed ? 2 : 1.5} strokeDasharray={placed ? undefined : "4,3"}
                fillOpacity={placed ? 1 : 0.9} />
            {placed && (
                <>
                    <rect x={cx - r + 3} y={cy - r + 3} width={(r - 3) * 2} height={r - 2} rx={3} fill="#1e293b" />
                    {(() => {
                        const ratio = isOn ? 0.65 : 0;
                        const angle = -60 + ratio * 120;
                        const rad = (angle - 90) * Math.PI / 180;
                        const len = r - 5;
                        return <line x1={cx} y1={cy + 1} x2={cx + len * Math.cos(rad)} y2={cy + 1 + len * Math.sin(rad)}
                            stroke="#dc2626" strokeWidth={1.5} strokeLinecap="round" />;
                    })()}
                    <circle cx={cx} cy={cy + 1} r={2} fill="#dc2626" />
                </>
            )}
            <text x={cx} y={cy + (placed ? r - 1 : 5)} textAnchor="middle"
                fontSize={fs} fill={VM_COLOR} fontWeight="bold" opacity={placed ? 1 : 0.6}>V</text>
            {placed && (
                <text x={cx} y={cy + r + 13} textAnchor="middle" fontSize={fs} fill={VM_COLOR} fontWeight="bold">
                    {isOn ? value : "0 V"}
                </text>
            )}
        </g>
    );
}

// ── SVG: slot voltmetro per ramo verticale (connessioni a U sul lato destro) ──

function VmSlotV({ cx, topY, botY, placed, value, isOn, toolActive, onClick, fs }: {
    cx: number; topY: number; botY: number;
    placed: boolean; value: string; isOn: boolean;
    toolActive: boolean; onClick: () => void; fs: number;
}) {
    const r = 13;
    const vmOff = 32;
    const vx = cx + vmOff;
    const vy = (topY + botY) / 2;
    if (!placed && !toolActive) return null;
    return (
        <g onClick={onClick} style={{ cursor: placed ? "pointer" : "crosshair" }}>
            {placed && (
                <>
                    <line x1={cx} y1={topY} x2={vx} y2={topY} stroke={VM_COLOR} strokeWidth={1} strokeDasharray="3,2" strokeOpacity={0.7} />
                    <line x1={vx} y1={topY} x2={vx} y2={vy - r - 1} stroke={VM_COLOR} strokeWidth={1} strokeDasharray="3,2" strokeOpacity={0.7} />
                    <line x1={cx} y1={botY} x2={vx} y2={botY} stroke={VM_COLOR} strokeWidth={1} strokeDasharray="3,2" strokeOpacity={0.7} />
                    <line x1={vx} y1={botY} x2={vx} y2={vy + r + 1} stroke={VM_COLOR} strokeWidth={1} strokeDasharray="3,2" strokeOpacity={0.7} />
                    <circle cx={cx} cy={topY} r={3} fill={VM_COLOR} opacity={0.7} />
                    <circle cx={cx} cy={botY} r={3} fill={VM_COLOR} opacity={0.7} />
                </>
            )}
            <circle cx={vx} cy={vy} r={r} fill="#fff" stroke={VM_COLOR}
                strokeWidth={placed ? 2 : 1.5} strokeDasharray={placed ? undefined : "4,3"} />
            {placed && (
                <>
                    <rect x={vx - r + 3} y={vy - r + 3} width={(r - 3) * 2} height={r - 2} rx={3} fill="#1e293b" />
                    {(() => {
                        const ratio = isOn ? 0.65 : 0;
                        const angle = -60 + ratio * 120;
                        const rad = (angle - 90) * Math.PI / 180;
                        const len = r - 5;
                        return <line x1={vx} y1={vy + 1} x2={vx + len * Math.cos(rad)} y2={vy + 1 + len * Math.sin(rad)}
                            stroke="#dc2626" strokeWidth={1.5} strokeLinecap="round" />;
                    })()}
                    <circle cx={vx} cy={vy + 1} r={2} fill="#dc2626" />
                </>
            )}
            <text x={vx} y={vy + (placed ? r - 1 : 5)} textAnchor="middle"
                fontSize={fs} fill={VM_COLOR} fontWeight="bold" opacity={placed ? 1 : 0.6}>V</text>
            {placed && (
                <text x={vx} y={vy + r + 13} textAnchor="middle" fontSize={fs} fill={VM_COLOR} fontWeight="bold">
                    {isOn ? value : "0 V"}
                </text>
            )}
        </g>
    );
}

// ── SVG: pulsante controllo circuito ─────────────────────────────────────────

function CircuitControls({ isOn, onToggle, currentDirection, onToggleDir, isMobile }: {
    isOn: boolean; onToggle: () => void;
    currentDirection: CurrentDirection; onToggleDir: () => void;
    isMobile: boolean;
}) {
    return (
        <div>
            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
                <button onClick={onToggle} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "10px 24px", borderRadius: 30, border: "none",
                    background: isOn ? "linear-gradient(135deg, #dc2626, #b91c1c)" : "linear-gradient(135deg, #22c55e, #16a34a)",
                    color: "#fff", fontWeight: 700, fontSize: isMobile ? 14 : 15,
                    cursor: "pointer",
                    boxShadow: isOn ? "0 0 16px rgba(220,38,38,0.4)" : "0 0 16px rgba(34,197,94,0.4)",
                    transition: "all 0.3s ease",
                }}>
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                        <line x1="12" y1="2" x2="12" y2="12" />
                    </svg>
                    {isOn ? "SPEGNI" : "ACCENDI"}
                </button>
                <button onClick={onToggleDir} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "10px 20px", borderRadius: 30, border: "none",
                    background: currentDirection === "convention"
                        ? "linear-gradient(135deg, #3b82f6, #1d4ed8)"
                        : "linear-gradient(135deg, #f59e0b, #d97706)",
                    color: "#fff", fontWeight: 700, fontSize: isMobile ? 12 : 13,
                    cursor: "pointer",
                    boxShadow: currentDirection === "convention"
                        ? "0 0 12px rgba(59,130,246,0.4)"
                        : "0 0 12px rgba(245,158,11,0.4)",
                    transition: "all 0.3s ease",
                }}>
                    <span style={{ fontSize: 18 }}>{currentDirection === "convention" ? "+" : "−"}</span>
                    {currentDirection === "convention" ? "Convenzione" : "Realtà"}
                </button>
            </div>
            <div style={{ textAlign: "center", marginTop: 6, fontSize: 12, color: isOn ? "#dc2626" : "#64748b", fontWeight: 600 }}>
                <span style={{
                    display: "inline-block", width: 8, height: 8, borderRadius: "50%",
                    background: isOn ? "#dc2626" : "#d1d5db", marginRight: 6,
                    boxShadow: isOn ? "0 0 8px rgba(220,38,38,0.6)" : "none",
                    transition: "all 0.3s ease",
                }} />
                {isOn ? "Circuito attivo" : "Circuito spento"}
            </div>
            <div style={{
                textAlign: "center", marginTop: 10, padding: "8px 12px",
                background: currentDirection === "convention" ? "#eff6ff" : "#fffbeb",
                borderRadius: 8,
                border: `1px solid ${currentDirection === "convention" ? "#bfdbfe" : "#fde68a"}`,
                fontSize: 12, color: currentDirection === "convention" ? "#1e40af" : "#92400e",
            }}>
                {currentDirection === "convention"
                    ? <><strong>Verso convenzionale:</strong> dal polo <strong>+</strong> al polo <strong>−</strong></>
                    : <><strong>Verso reale:</strong> gli elettroni (<strong>−</strong>) dal polo <strong>−</strong> al polo <strong>+</strong></>}
            </div>
        </div>
    );
}

// ── SVG: Circuito SERIE ───────────────────────────────────────────────────────

interface SerieCircuitProps {
    R: [number, number, number]; V: number; isOn: boolean;
    currentDirection: CurrentDirection; onToggle: () => void; isMobile: boolean;
    amPlaced: Set<string>; vmPlaced: Set<string>;
    selectedTool: InstrumentTool; onSlotClick: (id: string) => void;
}

function CircuitoSerie({ R, V, isOn, currentDirection, onToggle, isMobile,
    amPlaced, vmPlaced, selectedTool, onSlotClick }: SerieCircuitProps) {
    const Req = R[0] + R[1] + R[2];
    const I = V / Req;
    const Vr = R.map(r => I * r);

    const w = isMobile ? 370 : 540;
    // Extra height below main wire for voltmeter circles
    const vmRowH = 60;
    const h = (isMobile ? 250 : 310) + vmRowH;
    const fs = isMobile ? 9 : 11;

    const batX = 48;
    const topY = isMobile ? 50 : 62;
    const botY = h - (isMobile ? 38 : 46);
    const midY = (topY + botY) / 2;
    const rightX = w - 22;
    const span = rightX - batX;

    const cx: [number, number, number] = [
        batX + span * 0.27, batX + span * 0.52, batX + span * 0.77,
    ] as [number, number, number];
    const halfW = isMobile ? 19 : 24;
    const vmY = topY + (isMobile ? 55 : 65); // voltmeter row

    // Ammeter slot x positions (midpoints on wire)
    const amX: number[] = [
        (batX + cx[0] - halfW) / 2,
        (cx[0] + halfW + cx[1] - halfW) / 2,
        (cx[1] + halfW + cx[2] - halfW) / 2,
        (cx[2] + halfW + rightX) / 2,
    ];

    const swX = batX + span * 0.5;
    const swY = botY;
    const swGap = 18;
    const leverRad = (isOn ? 0 : -40) * Math.PI / 180;
    const swStartX = swX - swGap / 2;
    const swEndX = swStartX + (swGap + 4) * Math.cos(leverRad);
    const swEndY = swY + (swGap + 4) * Math.sin(leverRad);

    const showFlow = isOn && I > 0.0005;
    const isConv = currentDirection === "convention";
    const wireColor = showFlow
        ? (isConv ? `hsl(${Math.max(200 - I * 300, 180)}, 70%, 50%)` : `hsl(30, 85%, 50%)`)
        : "#94a3b8";
    const animName = isConv ? "sp_flowConv" : "sp_flowReal";
    const dur = showFlow ? calcAnimDur(I) : "0s";

    // Wire top (with gaps where ammeters are placed)
    // Segments: batX → am[0] → cx[0]-halfW, cx[0]+halfW → am[1] → cx[1]-halfW, etc.
    const amR = 14;
    const wireSegs: [number, number][] = [];
    const breakpoints = [
        batX,
        ...amX.flatMap((ax, i) => [ax - amR, ax + amR]),
        ...[cx[0] - halfW, cx[0] + halfW, cx[1] - halfW, cx[1] + halfW, cx[2] - halfW, cx[2] + halfW],
        rightX,
    ].sort((a, b) => a - b);

    // Build wire segments skipping resistor bodies
    const resRanges = cx.map(c => [c - halfW, c + halfW] as [number, number]);

    // Top wire segments: draw only where there's no resistor and no placed ammeter
    const topWireSegments: [number, number][] = [];
    {
        const breaks = [batX, rightX];
        // add resistor gaps
        cx.forEach(c => { breaks.push(c - halfW); breaks.push(c + halfW); });
        // add ammeter gaps
        amX.forEach((ax, i) => {
            if (amPlaced.has(`sa${i}`)) { breaks.push(ax - amR); breaks.push(ax + amR); }
        });
        breaks.sort((a, b) => a - b);
        for (let i = 0; i < breaks.length - 1; i++) {
            const x1 = breaks[i], x2 = breaks[i + 1];
            const midX = (x1 + x2) / 2;
            // skip if inside a resistor
            const inRes = resRanges.some(([a, b]) => midX >= a && midX <= b);
            // skip if inside a placed ammeter gap
            const inAm = amX.some((ax, j) => amPlaced.has(`sa${j}`) && midX >= ax - amR && midX <= ax + amR);
            if (!inRes && !inAm && x2 > x1 + 1) topWireSegments.push([x1, x2]);
        }
    }

    return (
        <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", display: "block" }}>
            <defs>
                <style>{`
                    @keyframes sp_flowConv { from { stroke-dashoffset: 24; } to { stroke-dashoffset: 0; } }
                    @keyframes sp_flowReal { from { stroke-dashoffset: 0; } to { stroke-dashoffset: 24; } }
                `}</style>
            </defs>
            <rect width={w} height={h} rx={12} fill="#f8fafc" />

            {/* Fili top */}
            {topWireSegments.map(([x1, x2], i) => (
                <line key={i} x1={x1} y1={topY} x2={x2} y2={topY} stroke="#d1d5db" strokeWidth={2.5} />
            ))}
            {/* Filo destro verticale */}
            <line x1={rightX} y1={topY} x2={rightX} y2={botY} stroke="#d1d5db" strokeWidth={2.5} />
            {/* Filo bottom con gap interruttore */}
            <line x1={batX} y1={botY} x2={swX - swGap} y2={botY} stroke="#d1d5db" strokeWidth={2.5} />
            <line x1={swX + swGap} y1={botY} x2={rightX} y2={botY} stroke="#d1d5db" strokeWidth={2.5} />
            {/* Fili batteria */}
            <line x1={batX} y1={topY} x2={batX} y2={midY - 26} stroke="#d1d5db" strokeWidth={2.5} />
            <line x1={batX} y1={midY + 26} x2={batX} y2={botY} stroke="#d1d5db" strokeWidth={2.5} />

            {/* Corrente animata */}
            {showFlow && (
                <path d={`M ${batX} ${topY} L ${rightX} ${topY} L ${rightX} ${botY} L ${batX} ${botY} L ${batX} ${topY}`}
                    fill="none" stroke={wireColor} strokeWidth={2.5} strokeDasharray="8,16"
                    style={{ animation: `${animName} ${dur} linear infinite` }} />
            )}

            {/* Batteria */}
            <rect x={batX - 16} y={midY - 25} width={32} height={50} rx={5} fill="#fff" stroke="#334155" strokeWidth={2} />
            <line x1={batX - 10} y1={midY - 10} x2={batX + 10} y2={midY - 10} stroke="#dc2626" strokeWidth={3} />
            <line x1={batX - 6} y1={midY + 6} x2={batX + 6} y2={midY + 6} stroke="#1e40af" strokeWidth={3} />
            <text x={batX - 22} y={midY - 7} fontSize={fs + 2} fill="#dc2626" fontWeight="bold" textAnchor="end">+</text>
            <text x={batX - 22} y={midY + 10} fontSize={fs + 2} fill="#1e40af" fontWeight="bold" textAnchor="end">−</text>
            <text x={batX} y={midY + 42} fontSize={fs - 1} fill="#64748b" textAnchor="middle">gen.</text>
            <text x={batX} y={midY + 55} fontSize={fs + 1} fill="#334155" fontWeight="bold" textAnchor="middle">{V.toFixed(1)} V</text>

            {/* 3 Resistori */}
            {([0, 1, 2] as const).map(i => (
                <g key={i}>
                    <ZigzagH cx={cx[i]} y={topY} color={RC[i]} halfW={halfW} />
                    <text x={cx[i]} y={topY - (halfW + 5)} textAnchor="middle" fontSize={fs} fill={RC[i]} fontWeight="bold">
                        R{i + 1}={fmtR(R[i])}
                    </text>
                </g>
            ))}

            {/* Voltmeter slots (below each resistor) */}
            {([0, 1, 2] as const).map(i => (
                <VmSlot key={`vm${i}`}
                    cx={cx[i]} cy={vmY}
                    xl={cx[i] - halfW} xr={cx[i] + halfW} topY={topY}
                    placed={vmPlaced.has(`sv${i}`)}
                    value={fmtV(Vr[i])}
                    isOn={isOn}
                    toolActive={selectedTool === "voltmeter"}
                    onClick={() => onSlotClick(`sv${i}`)}
                    fs={fs}
                />
            ))}

            {/* Ammeter slots (on top wire) */}
            {amX.map((ax, i) => (
                <AmSlot key={`am${i}`}
                    cx={ax} cy={topY}
                    placed={amPlaced.has(`sa${i}`)}
                    value={fmtI(I)}
                    isOn={isOn}
                    toolActive={selectedTool === "ammeter"}
                    onClick={() => onSlotClick(`sa${i}`)}
                    fs={fs}
                />
            ))}

            {/* Interruttore */}
            <g style={{ cursor: "pointer" }} onClick={onToggle}>
                <rect x={swX - swGap} y={swY - 30} width={swGap * 2} height={46} fill="transparent" />
                <circle cx={swX - swGap / 2} cy={swY} r={3.5} fill={isOn ? "#334155" : "#94a3b8"} />
                <circle cx={swX + swGap / 2} cy={swY} r={3.5} fill={isOn ? "#334155" : "#94a3b8"} />
                <line x1={swStartX} y1={swY} x2={swEndX} y2={swEndY}
                    stroke={isOn ? "#22c55e" : "#ef4444"} strokeWidth={3} strokeLinecap="round"
                    style={{ transition: "all 0.4s ease" }} />
                <text x={swX} y={swY + 16} fontSize={fs - 1} fill="#64748b" textAnchor="middle">interruttore</text>
            </g>

            {/* Nodi */}
            <circle cx={rightX} cy={topY} r={3} fill="#334155" />
            <circle cx={rightX} cy={botY} r={3} fill="#334155" />

            {/* Freccia corrente */}
            {isConv
                ? <polygon points={`${rightX - 5},${midY + 8} ${rightX + 5},${midY + 8} ${rightX},${midY - 2}`} fill={wireColor} />
                : <polygon points={`${rightX - 5},${midY - 8} ${rightX + 5},${midY - 8} ${rightX},${midY + 2}`} fill={wireColor} />
            }
            <text x={rightX - 8} y={midY - 16} fontSize={fs} fill="#7c3aed" fontWeight="bold" textAnchor="end">
                I={isOn ? fmtI(I) : "?"}
            </text>
        </svg>
    );
}

// ── SVG: Circuito PARALLELO ───────────────────────────────────────────────────

interface ParalleloCircuitProps {
    R: [number, number, number]; V: number; isOn: boolean;
    currentDirection: CurrentDirection; onToggle: () => void; isMobile: boolean;
    amPlaced: Set<string>; vmPlaced: Set<string>;
    selectedTool: InstrumentTool; onSlotClick: (id: string) => void;
}

function CircuitoParallelo({ R, V, isOn, currentDirection, onToggle, isMobile,
    amPlaced, vmPlaced, selectedTool, onSlotClick }: ParalleloCircuitProps) {
    const Req = 1 / (1 / R[0] + 1 / R[1] + 1 / R[2]);
    const I_tot = V / Req;
    const Ir = R.map(r => V / r);

    // Layout: batteria sinistra, barra top, barra bottom, filo chiusura destra,
    // tre rami VERTICALI con ZigzagV — identico alla figura del libro.
    const w = isMobile ? 370 : 530;
    const h = isMobile ? 240 : 300;
    const fs = isMobile ? 9 : 11;
    const amR = 13;

    const batX = 48;
    const topY = isMobile ? 50 : 62;
    const botY = h - (isMobile ? 38 : 46);
    const batMidY = (topY + botY) / 2;
    const rightX = w - 22;

    // Tre rami verticali equidistanti
    const span = rightX - batX;
    const cx: [number, number, number] = [
        batX + span * 0.30,
        batX + span * 0.55,
        batX + span * 0.80,
    ] as [number, number, number];

    const halfH = isMobile ? 20 : 26; // semi-altezza zigzag
    const midY = (topY + botY) / 2;   // centro dei rami

    // Ammeter slot principale: sul filo top tra batX e cx[0]
    const amMainX = (batX + cx[0]) / 2;
    // Ammeter slot per ogni ramo: sul tratto superiore (tra topY e inizio zigzag)
    const amBrY = (topY + (midY - halfH)) / 2;

    // Interruttore: sul filo bottom tra batX e cx[0]
    const swX = (batX + cx[0]) / 2;
    const swY = botY;
    const swGap = 14;
    const leverRad = (isOn ? 0 : -40) * Math.PI / 180;
    const swStartX = swX - swGap / 2;
    const swEndX = swStartX + (swGap + 4) * Math.cos(leverRad);
    const swEndY = swY + (swGap + 4) * Math.sin(leverRad);

    const showFlow = isOn && I_tot > 0.0005;
    const isConv = currentDirection === "convention";
    const mainColor = showFlow
        ? (isConv ? `hsl(${Math.max(200 - I_tot * 150, 180)}, 70%, 50%)` : `hsl(30, 85%, 50%)`)
        : "#94a3b8";
    const animName = isConv ? "sp_flowConv" : "sp_flowReal";

    return (
        <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", display: "block" }}>
            <defs>
                <style>{`
                    @keyframes sp_flowConv { from { stroke-dashoffset: 24; } to { stroke-dashoffset: 0; } }
                    @keyframes sp_flowReal { from { stroke-dashoffset: 0; } to { stroke-dashoffset: 24; } }
                `}</style>
            </defs>
            <rect width={w} height={h} rx={12} fill="#f8fafc" />

            {/* ── Barra TOP (batX → rightX), con gap per amperometro principale ── */}
            {amPlaced.has("pa_main") ? (
                <>
                    <line x1={batX} y1={topY} x2={amMainX - amR} y2={topY} stroke="#d1d5db" strokeWidth={2.5} />
                    <line x1={amMainX + amR} y1={topY} x2={rightX} y2={topY} stroke="#d1d5db" strokeWidth={2.5} />
                </>
            ) : (
                <line x1={batX} y1={topY} x2={rightX} y2={topY} stroke="#d1d5db" strokeWidth={2.5} />
            )}

            {/* ── Barra BOTTOM (batX → rightX), con gap per interruttore ── */}
            <line x1={batX} y1={botY} x2={swX - swGap} y2={botY} stroke="#d1d5db" strokeWidth={2.5} />
            <line x1={swX + swGap} y1={botY} x2={rightX} y2={botY} stroke="#d1d5db" strokeWidth={2.5} />

            {/* ── Filo di chiusura DESTRA ── */}
            <line x1={rightX} y1={topY} x2={rightX} y2={botY} stroke="#d1d5db" strokeWidth={2.5} />

            {/* ── Fili verticali batteria ── */}
            <line x1={batX} y1={topY} x2={batX} y2={batMidY - 26} stroke="#d1d5db" strokeWidth={2.5} />
            <line x1={batX} y1={batMidY + 26} x2={batX} y2={botY} stroke="#d1d5db" strokeWidth={2.5} />

            {/* ── Fili verticali dei rami (con gap per zigzag e ammeter) ── */}
            {([0, 1, 2] as const).map(i => (
                <g key={`bw${i}`}>
                    {/* Tratto superiore: topY → midY-halfH (con gap ammeter) */}
                    {amPlaced.has(`pa${i}`) ? (
                        <>
                            <line x1={cx[i]} y1={topY} x2={cx[i]} y2={amBrY - amR} stroke="#d1d5db" strokeWidth={2} />
                            <line x1={cx[i]} y1={amBrY + amR} x2={cx[i]} y2={midY - halfH} stroke="#d1d5db" strokeWidth={2} />
                        </>
                    ) : (
                        <line x1={cx[i]} y1={topY} x2={cx[i]} y2={midY - halfH} stroke="#d1d5db" strokeWidth={2} />
                    )}
                    {/* Tratto inferiore: midY+halfH → botY */}
                    <line x1={cx[i]} y1={midY + halfH} x2={cx[i]} y2={botY} stroke="#d1d5db" strokeWidth={2} />
                </g>
            ))}

            {/* ── Corrente animata loop esterno ── */}
            {showFlow && (
                <path d={`M ${batX} ${topY} L ${rightX} ${topY} L ${rightX} ${botY} L ${batX} ${botY} L ${batX} ${topY}`}
                    fill="none" stroke={mainColor} strokeWidth={2.5} strokeDasharray="8,16"
                    style={{ animation: `${animName} ${calcAnimDur(I_tot)} linear infinite` }} />
            )}
            {/* ── Corrente animata su ogni ramo verticale ── */}
            {showFlow && ([0, 1, 2] as const).map(i => (
                <path key={`ba${i}`}
                    d={isConv ? `M ${cx[i]} ${topY} L ${cx[i]} ${botY}` : `M ${cx[i]} ${botY} L ${cx[i]} ${topY}`}
                    fill="none" stroke={RC[i]} strokeWidth={2} strokeDasharray="6,12"
                    style={{ animation: `${animName} ${calcAnimDur(Ir[i])} linear infinite` }}
                />
            ))}

            {/* ── Batteria ── */}
            <rect x={batX - 16} y={batMidY - 25} width={32} height={50} rx={5} fill="#fff" stroke="#334155" strokeWidth={2} />
            <line x1={batX - 10} y1={batMidY - 10} x2={batX + 10} y2={batMidY - 10} stroke="#dc2626" strokeWidth={3} />
            <line x1={batX - 6} y1={batMidY + 6} x2={batX + 6} y2={batMidY + 6} stroke="#1e40af" strokeWidth={3} />
            <text x={batX - 22} y={batMidY - 7} fontSize={fs + 2} fill="#dc2626" fontWeight="bold" textAnchor="end">+</text>
            <text x={batX - 22} y={batMidY + 10} fontSize={fs + 2} fill="#1e40af" fontWeight="bold" textAnchor="end">−</text>
            <text x={batX} y={batMidY + 42} fontSize={fs - 1} fill="#64748b" textAnchor="middle">gen.</text>
            <text x={batX} y={batMidY + 55} fontSize={fs + 1} fill="#334155" fontWeight="bold" textAnchor="middle">{V.toFixed(1)} V</text>

            {/* ── Tre resistori verticali (ZigzagV) ── */}
            {([0, 1, 2] as const).map(i => (
                <g key={`r${i}`}>
                    <ZigzagV cx={cx[i]} cy={midY} color={RC[i]} halfH={halfH} />
                    {/* Etichetta Ri sopra la barra top */}
                    <text x={cx[i]} y={topY - 8} textAnchor="middle" fontSize={fs} fill={RC[i]} fontWeight="bold">
                        R{i + 1}={fmtR(R[i])}
                    </text>
                    {/* Corrente sul ramo, sotto la barra bottom */}
                    <text x={cx[i]} y={botY + 14} textAnchor="middle" fontSize={fs} fill={RC[i]} fontWeight="bold">
                        {isOn ? `I${i + 1}=${fmtI(Ir[i])}` : `I${i + 1}=?`}
                    </text>
                </g>
            ))}

            {/* ── Slot voltmetro (U sul lato destro di ogni ramo) ── */}
            {([0, 1, 2] as const).map(i => (
                <VmSlotV key={`pvm${i}`}
                    cx={cx[i]} topY={topY} botY={botY}
                    placed={vmPlaced.has(`pv${i}`)}
                    value={fmtV(V)}
                    isOn={isOn}
                    toolActive={selectedTool === "voltmeter"}
                    onClick={() => onSlotClick(`pv${i}`)}
                    fs={fs}
                />
            ))}

            {/* ── Slot amperometro principale (filo top) ── */}
            <AmSlot cx={amMainX} cy={topY}
                placed={amPlaced.has("pa_main")} value={fmtI(I_tot)} isOn={isOn}
                toolActive={selectedTool === "ammeter"} onClick={() => onSlotClick("pa_main")} fs={fs} />

            {/* ── Slot amperometro su ogni ramo ── */}
            {([0, 1, 2] as const).map(i => (
                <AmSlot key={`pam${i}`}
                    cx={cx[i]} cy={amBrY}
                    placed={amPlaced.has(`pa${i}`)} value={fmtI(Ir[i])} isOn={isOn}
                    toolActive={selectedTool === "ammeter"} onClick={() => onSlotClick(`pa${i}`)} fs={fs} />
            ))}

            {/* ── Interruttore ── */}
            <g style={{ cursor: "pointer" }} onClick={onToggle}>
                <rect x={swX - swGap} y={swY - 30} width={swGap * 2} height={46} fill="transparent" />
                <circle cx={swX - swGap / 2} cy={swY} r={3.5} fill={isOn ? "#334155" : "#94a3b8"} />
                <circle cx={swX + swGap / 2} cy={swY} r={3.5} fill={isOn ? "#334155" : "#94a3b8"} />
                <line x1={swStartX} y1={swY} x2={swEndX} y2={swEndY}
                    stroke={isOn ? "#22c55e" : "#ef4444"} strokeWidth={3} strokeLinecap="round"
                    style={{ transition: "all 0.4s ease" }} />
                <text x={swX} y={swY - 6} fontSize={fs - 1} fill="#64748b" textAnchor="middle">int.</text>
            </g>

            {/* ── Nodi di giunzione ── */}
            <circle cx={rightX} cy={topY} r={3} fill="#334155" />
            <circle cx={rightX} cy={botY} r={3} fill="#334155" />
            {([0, 1, 2] as const).map(i => (
                <g key={`nd${i}`}>
                    <circle cx={cx[i]} cy={topY} r={3} fill="#334155" />
                    <circle cx={cx[i]} cy={botY} r={3} fill="#334155" />
                </g>
            ))}

            {/* ── Freccia + etichetta corrente totale ── */}
            {isConv
                ? <polygon points={`${batX - 4},${topY + 18} ${batX + 4},${topY + 18} ${batX},${topY + 6}`} fill={mainColor} />
                : <polygon points={`${batX - 4},${batMidY + 30} ${batX + 4},${batMidY + 30} ${batX},${batMidY + 42}`} fill={mainColor} />
            }
            <text x={batX + 6} y={topY + 14} textAnchor="start" fontSize={fs} fill="#7c3aed" fontWeight="bold">
                I={isOn ? fmtI(I_tot) : "?"}
            </text>
        </svg>
    );
}

// ── SVG: Circuito SERIE equivalente ──────────────────────────────────────────

function EquivSerie({ R, V, isOn, currentDirection, onToggle, isMobile }: {
    R: [number, number, number]; V: number; isOn: boolean;
    currentDirection: CurrentDirection; onToggle: () => void; isMobile: boolean;
}) {
    const Req = R[0] + R[1] + R[2];
    const I = V / Req;

    const w = isMobile ? 370 : 540;
    const vmRowH = 60;
    const h = (isMobile ? 250 : 310) + vmRowH;
    const fs = isMobile ? 9 : 11;

    const batX = 48;
    const topY = isMobile ? 50 : 62;
    const botY = h - (isMobile ? 38 : 46);
    const midY = (topY + botY) / 2;
    const rightX = w - 22;
    const halfW = isMobile ? 34 : 44;
    const cxEq = (batX + rightX) / 2;

    const swX = (batX + rightX) / 2;
    const swY = botY;
    const swGap = 18;
    const leverRad = (isOn ? 0 : -40) * Math.PI / 180;
    const swStartX = swX - swGap / 2;
    const swEndX = swStartX + (swGap + 4) * Math.cos(leverRad);
    const swEndY = swY + (swGap + 4) * Math.sin(leverRad);

    const showFlow = isOn && I > 0.0005;
    const isConv = currentDirection === "convention";
    const wireColor = showFlow
        ? (isConv ? `hsl(${Math.max(200 - I * 300, 180)}, 70%, 50%)` : `hsl(30, 85%, 50%)`)
        : "#94a3b8";
    const animName = isConv ? "sp_flowConv" : "sp_flowReal";
    const dur = showFlow ? calcAnimDur(I) : "0s";
    const EQ = "#7c3aed";

    return (
        <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", display: "block" }}>
            <defs>
                <style>{`
                    @keyframes sp_flowConv { from { stroke-dashoffset: 24; } to { stroke-dashoffset: 0; } }
                    @keyframes sp_flowReal { from { stroke-dashoffset: 0; } to { stroke-dashoffset: 24; } }
                `}</style>
            </defs>
            <rect width={w} height={h} rx={12} fill="#fdf4ff" />
            {/* subtle background tint to distinguish equiv view */}
            <rect x={2} y={2} width={w - 4} height={h - 4} rx={11}
                fill="none" stroke={EQ} strokeWidth={1.5} strokeDasharray="6,4" strokeOpacity={0.3} />

            {/* Fili */}
            <line x1={batX} y1={topY} x2={cxEq - halfW} y2={topY} stroke="#d1d5db" strokeWidth={2.5} />
            <line x1={cxEq + halfW} y1={topY} x2={rightX} y2={topY} stroke="#d1d5db" strokeWidth={2.5} />
            <line x1={rightX} y1={topY} x2={rightX} y2={botY} stroke="#d1d5db" strokeWidth={2.5} />
            <line x1={batX} y1={botY} x2={swX - swGap} y2={botY} stroke="#d1d5db" strokeWidth={2.5} />
            <line x1={swX + swGap} y1={botY} x2={rightX} y2={botY} stroke="#d1d5db" strokeWidth={2.5} />
            <line x1={batX} y1={topY} x2={batX} y2={midY - 26} stroke="#d1d5db" strokeWidth={2.5} />
            <line x1={batX} y1={midY + 26} x2={batX} y2={botY} stroke="#d1d5db" strokeWidth={2.5} />

            {/* Corrente animata */}
            {showFlow && (
                <path d={`M ${batX} ${topY} L ${rightX} ${topY} L ${rightX} ${botY} L ${batX} ${botY} L ${batX} ${topY}`}
                    fill="none" stroke={wireColor} strokeWidth={2.5} strokeDasharray="8,16"
                    style={{ animation: `${animName} ${dur} linear infinite` }} />
            )}

            {/* Batteria */}
            <rect x={batX - 16} y={midY - 25} width={32} height={50} rx={5} fill="#fff" stroke="#334155" strokeWidth={2} />
            <line x1={batX - 10} y1={midY - 10} x2={batX + 10} y2={midY - 10} stroke="#dc2626" strokeWidth={3} />
            <line x1={batX - 6} y1={midY + 6} x2={batX + 6} y2={midY + 6} stroke="#1e40af" strokeWidth={3} />
            <text x={batX - 22} y={midY - 7} fontSize={fs + 2} fill="#dc2626" fontWeight="bold" textAnchor="end">+</text>
            <text x={batX - 22} y={midY + 10} fontSize={fs + 2} fill="#1e40af" fontWeight="bold" textAnchor="end">−</text>
            <text x={batX} y={midY + 42} fontSize={fs - 1} fill="#64748b" textAnchor="middle">gen.</text>
            <text x={batX} y={midY + 55} fontSize={fs + 1} fill="#334155" fontWeight="bold" textAnchor="middle">{V.toFixed(1)} V</text>

            {/* Resistenza equivalente */}
            <ZigzagH cx={cxEq} y={topY} color={EQ} halfW={halfW} amp={10} />
            <text x={cxEq} y={topY - 16} textAnchor="middle" fontSize={fs + 2} fill={EQ} fontWeight="bold">
                Req = {fmtR(Req)}
            </text>
            <text x={cxEq} y={topY - 30} textAnchor="middle" fontSize={fs} fill={EQ} opacity={0.75}>
                = R₁ + R₂ + R₃
            </text>

            {/* Freccia + etichetta corrente */}
            {isConv
                ? <polygon points={`${rightX - 5},${midY + 8} ${rightX + 5},${midY + 8} ${rightX},${midY - 2}`} fill={wireColor} />
                : <polygon points={`${rightX - 5},${midY - 8} ${rightX + 5},${midY - 8} ${rightX},${midY + 2}`} fill={wireColor} />
            }
            <text x={rightX - 8} y={midY - 16} fontSize={fs} fill={EQ} fontWeight="bold" textAnchor="end">
                I={isOn ? fmtI(I) : "?"}
            </text>

            {/* Interruttore */}
            <g style={{ cursor: "pointer" }} onClick={onToggle}>
                <rect x={swX - swGap} y={swY - 30} width={swGap * 2} height={46} fill="transparent" />
                <circle cx={swX - swGap / 2} cy={swY} r={3.5} fill={isOn ? "#334155" : "#94a3b8"} />
                <circle cx={swX + swGap / 2} cy={swY} r={3.5} fill={isOn ? "#334155" : "#94a3b8"} />
                <line x1={swStartX} y1={swY} x2={swEndX} y2={swEndY}
                    stroke={isOn ? "#22c55e" : "#ef4444"} strokeWidth={3} strokeLinecap="round"
                    style={{ transition: "all 0.4s ease" }} />
                <text x={swX} y={swY + 16} fontSize={fs - 1} fill="#64748b" textAnchor="middle">interruttore</text>
            </g>

            {/* Nodi */}
            <circle cx={rightX} cy={topY} r={3} fill="#334155" />
            <circle cx={rightX} cy={botY} r={3} fill="#334155" />

            {/* Annotazione */}
            <text x={cxEq} y={h - 12} textAnchor="middle" fontSize={fs} fill={EQ} fontStyle="italic" opacity={0.8}>
                Nella Req scorre la stessa corrente I
            </text>
        </svg>
    );
}

// ── SVG: Circuito PARALLELO equivalente ──────────────────────────────────────

function EquivParallelo({ R, V, isOn, currentDirection, onToggle, isMobile }: {
    R: [number, number, number]; V: number; isOn: boolean;
    currentDirection: CurrentDirection; onToggle: () => void; isMobile: boolean;
}) {
    const Req = 1 / (1 / R[0] + 1 / R[1] + 1 / R[2]);
    const I_tot = V / Req;

    const w = isMobile ? 370 : 530;
    const h = isMobile ? 240 : 300;
    const fs = isMobile ? 9 : 11;

    const batX = 48;
    const topY = isMobile ? 50 : 62;
    const botY = h - (isMobile ? 38 : 46);
    const batMidY = (topY + botY) / 2;
    const rightX = w - 22;

    const cxEq = (batX + rightX) / 2;
    const midY = (topY + botY) / 2;
    const halfH = isMobile ? 28 : 34;
    const EQ = "#7c3aed";

    const swX = (batX + cxEq) / 2;
    const swY = botY;
    const swGap = 14;
    const leverRad = (isOn ? 0 : -40) * Math.PI / 180;
    const swStartX = swX - swGap / 2;
    const swEndX = swStartX + (swGap + 4) * Math.cos(leverRad);
    const swEndY = swY + (swGap + 4) * Math.sin(leverRad);

    const showFlow = isOn && I_tot > 0.0005;
    const isConv = currentDirection === "convention";
    const mainColor = showFlow
        ? (isConv ? `hsl(${Math.max(200 - I_tot * 150, 180)}, 70%, 50%)` : `hsl(30, 85%, 50%)`)
        : "#94a3b8";
    const animName = isConv ? "sp_flowConv" : "sp_flowReal";

    return (
        <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", display: "block" }}>
            <defs>
                <style>{`
                    @keyframes sp_flowConv { from { stroke-dashoffset: 24; } to { stroke-dashoffset: 0; } }
                    @keyframes sp_flowReal { from { stroke-dashoffset: 0; } to { stroke-dashoffset: 24; } }
                `}</style>
            </defs>
            <rect width={w} height={h} rx={12} fill="#fdf4ff" />
            <rect x={2} y={2} width={w - 4} height={h - 4} rx={11}
                fill="none" stroke={EQ} strokeWidth={1.5} strokeDasharray="6,4" strokeOpacity={0.3} />

            {/* Barra top */}
            <line x1={batX} y1={topY} x2={rightX} y2={topY} stroke="#d1d5db" strokeWidth={2.5} />
            {/* Barra bottom con gap interruttore */}
            <line x1={batX} y1={botY} x2={swX - swGap} y2={botY} stroke="#d1d5db" strokeWidth={2.5} />
            <line x1={swX + swGap} y1={botY} x2={rightX} y2={botY} stroke="#d1d5db" strokeWidth={2.5} />
            {/* Filo chiusura destra */}
            <line x1={rightX} y1={topY} x2={rightX} y2={botY} stroke="#d1d5db" strokeWidth={2.5} />
            {/* Fili verticali batteria */}
            <line x1={batX} y1={topY} x2={batX} y2={batMidY - 26} stroke="#d1d5db" strokeWidth={2.5} />
            <line x1={batX} y1={batMidY + 26} x2={batX} y2={botY} stroke="#d1d5db" strokeWidth={2.5} />
            {/* Ramo equivalente singolo */}
            <line x1={cxEq} y1={topY} x2={cxEq} y2={midY - halfH} stroke="#d1d5db" strokeWidth={2.5} />
            <line x1={cxEq} y1={midY + halfH} x2={cxEq} y2={botY} stroke="#d1d5db" strokeWidth={2.5} />

            {/* Corrente animata loop esterno */}
            {showFlow && (
                <path d={`M ${batX} ${topY} L ${rightX} ${topY} L ${rightX} ${botY} L ${batX} ${botY} L ${batX} ${topY}`}
                    fill="none" stroke={mainColor} strokeWidth={2.5} strokeDasharray="8,16"
                    style={{ animation: `${animName} ${calcAnimDur(I_tot)} linear infinite` }} />
            )}
            {/* Corrente animata ramo equiv */}
            {showFlow && (
                <path d={isConv ? `M ${cxEq} ${topY} L ${cxEq} ${botY}` : `M ${cxEq} ${botY} L ${cxEq} ${topY}`}
                    fill="none" stroke={EQ} strokeWidth={2.5} strokeDasharray="8,16"
                    style={{ animation: `${animName} ${calcAnimDur(I_tot)} linear infinite` }} />
            )}

            {/* Batteria */}
            <rect x={batX - 16} y={batMidY - 25} width={32} height={50} rx={5} fill="#fff" stroke="#334155" strokeWidth={2} />
            <line x1={batX - 10} y1={batMidY - 10} x2={batX + 10} y2={batMidY - 10} stroke="#dc2626" strokeWidth={3} />
            <line x1={batX - 6} y1={batMidY + 6} x2={batX + 6} y2={batMidY + 6} stroke="#1e40af" strokeWidth={3} />
            <text x={batX - 22} y={batMidY - 7} fontSize={fs + 2} fill="#dc2626" fontWeight="bold" textAnchor="end">+</text>
            <text x={batX - 22} y={batMidY + 10} fontSize={fs + 2} fill="#1e40af" fontWeight="bold" textAnchor="end">−</text>
            <text x={batX} y={batMidY + 42} fontSize={fs - 1} fill="#64748b" textAnchor="middle">gen.</text>
            <text x={batX} y={batMidY + 55} fontSize={fs + 1} fill="#334155" fontWeight="bold" textAnchor="middle">{V.toFixed(1)} V</text>

            {/* Resistenza equivalente */}
            <ZigzagV cx={cxEq} cy={midY} color={EQ} halfH={halfH} amp={10} />
            <text x={cxEq} y={topY - 8} textAnchor="middle" fontSize={fs + 2} fill={EQ} fontWeight="bold">
                Req = {fmtR(Req)}
            </text>

            {/* Etichetta formula */}
            <text x={cxEq + halfH + 16} y={midY} textAnchor="start" fontSize={fs} fill={EQ} opacity={0.75}>
                1/Req =
            </text>
            <text x={cxEq + halfH + 16} y={midY + fs + 4} textAnchor="start" fontSize={fs} fill={EQ} opacity={0.75}>
                Σ 1/Ri
            </text>

            {/* Interruttore */}
            <g style={{ cursor: "pointer" }} onClick={onToggle}>
                <rect x={swX - swGap} y={swY - 30} width={swGap * 2} height={46} fill="transparent" />
                <circle cx={swX - swGap / 2} cy={swY} r={3.5} fill={isOn ? "#334155" : "#94a3b8"} />
                <circle cx={swX + swGap / 2} cy={swY} r={3.5} fill={isOn ? "#334155" : "#94a3b8"} />
                <line x1={swStartX} y1={swY} x2={swEndX} y2={swEndY}
                    stroke={isOn ? "#22c55e" : "#ef4444"} strokeWidth={3} strokeLinecap="round"
                    style={{ transition: "all 0.4s ease" }} />
                <text x={swX} y={swY - 6} fontSize={fs - 1} fill="#64748b" textAnchor="middle">int.</text>
            </g>

            {/* Nodi */}
            <circle cx={rightX} cy={topY} r={3} fill="#334155" />
            <circle cx={rightX} cy={botY} r={3} fill="#334155" />
            <circle cx={cxEq} cy={topY} r={3} fill="#334155" />
            <circle cx={cxEq} cy={botY} r={3} fill="#334155" />

            {/* Freccia + etichetta corrente */}
            {isConv
                ? <polygon points={`${batX - 4},${topY + 18} ${batX + 4},${topY + 18} ${batX},${topY + 6}`} fill={mainColor} />
                : <polygon points={`${batX - 4},${batMidY + 30} ${batX + 4},${batMidY + 30} ${batX},${batMidY + 42}`} fill={mainColor} />
            }
            <text x={batX + 6} y={topY + 14} textAnchor="start" fontSize={fs} fill={EQ} fontWeight="bold">
                I={isOn ? fmtI(I_tot) : "?"}
            </text>

            {/* Annotazione */}
            <text x={w / 2} y={h - 8} textAnchor="middle" fontSize={fs} fill={EQ} fontStyle="italic" opacity={0.8}>
                La Req è attraversata dalla corrente I totale
            </text>
        </svg>
    );
}

// ── Tab SERIE ─────────────────────────────────────────────────────────────────

function TabSerie({ isMobile }: { isMobile: boolean }) {
    const [V, setV] = useState(6);
    const [R1, setR1] = useState(100);
    const [R2, setR2] = useState(200);
    const [R3, setR3] = useState(300);
    const [isOn, setIsOn] = useState(false);
    const [currentDirection, setCurrentDirection] = useState<CurrentDirection>("convention");
    const [selectedTool, setSelectedTool] = useState<InstrumentTool>(null);
    const [amPlaced, setAmPlaced] = useState<Set<string>>(new Set());
    const [vmPlaced, setVmPlaced] = useState<Set<string>>(new Set());
    const [showEquiv, setShowEquiv] = useState(false);

    const R: [number, number, number] = [R1, R2, R3];
    const Req = R1 + R2 + R3;
    const I = V / Req;
    const Vr = R.map(r => I * r);
    const checkSum = Vr.reduce((a, b) => a + b, 0);

    const handleSlotClick = (id: string) => {
        if (!selectedTool) return;
        const isAm = id.startsWith("sa");
        const set = isAm ? amPlaced : vmPlaced;
        const setFn = isAm ? setAmPlaced : setVmPlaced;
        const newSet = new Set(set);
        if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
        setFn(newSet);
    };

    return (
        <div style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
                <Slider label="Tensione ε" value={V} min={V_MIN} max={V_MAX} step={V_STEP}
                    color="#7c3aed" unit=" V" onChange={setV} />
                <div style={{ display: "grid", gap: 8 }}>
                    <Slider label="R₁" value={R1} min={R_MIN} max={R_MAX} step={R_STEP} color={RC[0]} unit=" Ω" onChange={setR1} />
                    <Slider label="R₂" value={R2} min={R_MIN} max={R_MAX} step={R_STEP} color={RC[1]} unit=" Ω" onChange={setR2} />
                    <Slider label="R₃" value={R3} min={R_MIN} max={R_MAX} step={R_STEP} color={RC[2]} unit=" Ω" onChange={setR3} />
                </div>
            </div>

            {!showEquiv && <Toolbox selected={selectedTool} onSelect={setSelectedTool} isMobile={isMobile} />}

            {/* Crossfade circuito reale / equivalente */}
            <div style={{ display: "grid" }}>
                <div style={{ gridArea: "1/1", opacity: showEquiv ? 0 : 1, transition: "opacity 0.4s ease", pointerEvents: showEquiv ? "none" : "auto" }}>
                    <CircuitoSerie R={R} V={V} isOn={isOn} currentDirection={currentDirection}
                        onToggle={() => setIsOn(p => !p)} isMobile={isMobile}
                        amPlaced={amPlaced} vmPlaced={vmPlaced}
                        selectedTool={selectedTool} onSlotClick={handleSlotClick} />
                </div>
                <div style={{ gridArea: "1/1", opacity: showEquiv ? 1 : 0, transition: "opacity 0.4s ease", pointerEvents: showEquiv ? "auto" : "none" }}>
                    <EquivSerie R={R} V={V} isOn={isOn} currentDirection={currentDirection}
                        onToggle={() => setIsOn(p => !p)} isMobile={isMobile} />
                </div>
            </div>

            <div style={{ textAlign: "center", marginTop: 4 }}>
                <button onClick={() => setShowEquiv(p => !p)} style={{
                    padding: "8px 22px", borderRadius: 20, border: "none",
                    background: showEquiv
                        ? "linear-gradient(135deg, #0d9488, #0f766e)"
                        : "linear-gradient(135deg, #14b8a6, #0d9488)",
                    color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer",
                    boxShadow: "0 0 12px rgba(20,184,166,0.35)", transition: "all 0.3s ease",
                }}>
                    {showEquiv ? "← Mostra circuito reale" : "Mostra circuito equivalente →"}
                </button>
            </div>

            <CircuitControls isOn={isOn} onToggle={() => setIsOn(p => !p)}
                currentDirection={currentDirection}
                onToggleDir={() => setCurrentDirection(p => p === "convention" ? "reality" : "convention")}
                isMobile={isMobile} />

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(5, 1fr)", gap: 10 }}>
                <ResultCard label="Resistenza equivalente" value={fmtR(Req)} sub="Req = R₁ + R₂ + R₃" color="#7c3aed" big />
                <ResultCard label="Corrente (uguale ovunque)" value={isOn ? fmtI(I) : "—"} sub="I = ε / Req" color="#7c3aed" />
                <ResultCard label="Caduta su R₁" value={isOn ? fmtV(Vr[0]) : "—"} sub="ΔV₁ = I · R₁" color={RC[0]} />
                <ResultCard label="Caduta su R₂" value={isOn ? fmtV(Vr[1]) : "—"} sub="ΔV₂ = I · R₂" color={RC[1]} />
                <ResultCard label="Caduta su R₃" value={isOn ? fmtV(Vr[2]) : "—"} sub="ΔV₃ = I · R₃" color={RC[2]} />
            </div>

            {isOn && (
                <div style={{
                    background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8,
                    padding: "10px 16px", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap",
                }}>
                    <span style={{ fontSize: 12, color: "#166534", fontWeight: 700 }}>✓ Verifica:</span>
                    <Latex>{`\\Delta V_1 + \\Delta V_2 + \\Delta V_3 = ${fmtV(checkSum)} \\approx \\varepsilon = ${fmtV(V)}`}</Latex>
                </div>
            )}

            <CollapsibleExplanation title="Perché si sommano le resistenze?">
                <div style={{ fontSize: 13, lineHeight: 1.7 }}>
                    <p>In serie la <strong>stessa corrente I</strong> scorre ovunque (verifica: posiziona l'amperometro in punti diversi — legge sempre lo stesso valore!).</p>
                    <Latex display>{"\\varepsilon = \\Delta V_1 + \\Delta V_2 + \\Delta V_3 = I(R_1 + R_2 + R_3) = IR_{eq}"}</Latex>
                    <div style={{ background: "#dbeafe", borderRadius: 6, padding: "6px 12px", display: "inline-block", marginTop: 4 }}>
                        <Latex>{"R_{eq} = R_1 + R_2 + R_3"}</Latex>
                    </div>
                </div>
            </CollapsibleExplanation>
        </div>
    );
}

// ── Tab PARALLELO ─────────────────────────────────────────────────────────────

function TabParallelo({ isMobile }: { isMobile: boolean }) {
    const [V, setV] = useState(6);
    const [R1, setR1] = useState(100);
    const [R2, setR2] = useState(200);
    const [R3, setR3] = useState(300);
    const [isOn, setIsOn] = useState(false);
    const [currentDirection, setCurrentDirection] = useState<CurrentDirection>("convention");
    const [selectedTool, setSelectedTool] = useState<InstrumentTool>(null);
    const [amPlaced, setAmPlaced] = useState<Set<string>>(new Set());
    const [vmPlaced, setVmPlaced] = useState<Set<string>>(new Set());
    const [showEquiv, setShowEquiv] = useState(false);

    const R: [number, number, number] = [R1, R2, R3];
    const Req = 1 / (1 / R1 + 1 / R2 + 1 / R3);
    const I_tot = V / Req;
    const Ir = R.map(r => V / r);
    const checkSum = Ir.reduce((a, b) => a + b, 0);

    const handleSlotClick = (id: string) => {
        if (!selectedTool) return;
        const isAm = id.startsWith("pa");
        const set = isAm ? amPlaced : vmPlaced;
        const setFn = isAm ? setAmPlaced : setVmPlaced;
        const newSet = new Set(set);
        if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
        setFn(newSet);
    };

    return (
        <div style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
                <Slider label="Tensione ε" value={V} min={V_MIN} max={V_MAX} step={V_STEP}
                    color="#7c3aed" unit=" V" onChange={setV} />
                <div style={{ display: "grid", gap: 8 }}>
                    <Slider label="R₁" value={R1} min={R_MIN} max={R_MAX} step={R_STEP} color={RC[0]} unit=" Ω" onChange={setR1} />
                    <Slider label="R₂" value={R2} min={R_MIN} max={R_MAX} step={R_STEP} color={RC[1]} unit=" Ω" onChange={setR2} />
                    <Slider label="R₃" value={R3} min={R_MIN} max={R_MAX} step={R_STEP} color={RC[2]} unit=" Ω" onChange={setR3} />
                </div>
            </div>

            {!showEquiv && <Toolbox selected={selectedTool} onSelect={setSelectedTool} isMobile={isMobile} />}

            {/* Crossfade circuito reale / equivalente */}
            <div style={{ display: "grid" }}>
                <div style={{ gridArea: "1/1", opacity: showEquiv ? 0 : 1, transition: "opacity 0.4s ease", pointerEvents: showEquiv ? "none" : "auto" }}>
                    <CircuitoParallelo R={R} V={V} isOn={isOn} currentDirection={currentDirection}
                        onToggle={() => setIsOn(p => !p)} isMobile={isMobile}
                        amPlaced={amPlaced} vmPlaced={vmPlaced}
                        selectedTool={selectedTool} onSlotClick={handleSlotClick} />
                </div>
                <div style={{ gridArea: "1/1", opacity: showEquiv ? 1 : 0, transition: "opacity 0.4s ease", pointerEvents: showEquiv ? "auto" : "none" }}>
                    <EquivParallelo R={R} V={V} isOn={isOn} currentDirection={currentDirection}
                        onToggle={() => setIsOn(p => !p)} isMobile={isMobile} />
                </div>
            </div>

            <div style={{ textAlign: "center", marginTop: 4 }}>
                <button onClick={() => setShowEquiv(p => !p)} style={{
                    padding: "8px 22px", borderRadius: 20, border: "none",
                    background: showEquiv
                        ? "linear-gradient(135deg, #0d9488, #0f766e)"
                        : "linear-gradient(135deg, #14b8a6, #0d9488)",
                    color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer",
                    boxShadow: "0 0 12px rgba(20,184,166,0.35)", transition: "all 0.3s ease",
                }}>
                    {showEquiv ? "← Mostra circuito reale" : "Mostra circuito equivalente →"}
                </button>
            </div>

            <CircuitControls isOn={isOn} onToggle={() => setIsOn(p => !p)}
                currentDirection={currentDirection}
                onToggleDir={() => setCurrentDirection(p => p === "convention" ? "reality" : "convention")}
                isMobile={isMobile} />

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(5, 1fr)", gap: 10 }}>
                <ResultCard label="Resistenza equivalente" value={fmtR(Req)} sub="1/Req = Σ 1/Rᵢ" color="#7c3aed" big />
                <ResultCard label="Corrente totale" value={isOn ? fmtI(I_tot) : "—"} sub="I = ε / Req" color="#7c3aed" />
                <ResultCard label="Corrente in R₁" value={isOn ? fmtI(Ir[0]) : "—"} sub="I₁ = ε / R₁" color={RC[0]} />
                <ResultCard label="Corrente in R₂" value={isOn ? fmtI(Ir[1]) : "—"} sub="I₂ = ε / R₂" color={RC[1]} />
                <ResultCard label="Corrente in R₃" value={isOn ? fmtI(Ir[2]) : "—"} sub="I₃ = ε / R₃" color={RC[2]} />
            </div>

            {isOn && (
                <div style={{
                    background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8,
                    padding: "10px 16px", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap",
                }}>
                    <span style={{ fontSize: 12, color: "#166534", fontWeight: 700 }}>✓ Verifica:</span>
                    <Latex>{`I_1 + I_2 + I_3 = ${fmtI(checkSum)} \\approx I = ${fmtI(I_tot)}`}</Latex>
                </div>
            )}

            <CollapsibleExplanation title="Perché si sommano i reciproci?">
                <div style={{ fontSize: 13, lineHeight: 1.7 }}>
                    <p>In parallelo la <strong>stessa tensione V</strong> è ai capi di ogni resistenza (verifica: il voltmetro legge sempre lo stesso valore!).</p>
                    <Latex display>{"I = I_1 + I_2 + I_3 = V\\!\\left(\\frac{1}{R_1}+\\frac{1}{R_2}+\\frac{1}{R_3}\\right) = \\frac{V}{R_{eq}}"}</Latex>
                    <div style={{ background: "#dbeafe", borderRadius: 6, padding: "6px 12px", display: "inline-block", marginTop: 4 }}>
                        <Latex>{"\\dfrac{1}{R_{eq}} = \\dfrac{1}{R_1} + \\dfrac{1}{R_2} + \\dfrac{1}{R_3}"}</Latex>
                    </div>
                </div>
            </CollapsibleExplanation>
        </div>
    );
}

// ── Componente principale ─────────────────────────────────────────────────────

export default function ResistenzeSerieParalleloDemo() {
    const { isMobile } = useBreakpoint();

    return (
        <DemoContainer
            title="Resistenze in Serie e in Parallelo (laboratorio)"
            description="Regola tensione e resistenze, accendi il circuito, posiziona amperometro e voltmetro per fare le misure"
        >
            <SwipeableTabs
                tabs={[
                    { id: "serie", label: "⚡ Serie", content: <TabSerie isMobile={isMobile} /> },
                    { id: "parallelo", label: "⚡ Parallelo", content: <TabParallelo isMobile={isMobile} /> },
                ]}
                defaultTab="serie"
            />

            <InfoBox title="Confronto rapido">
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, fontSize: 13 }}>
                    <div>
                        <div style={{ fontWeight: 700, marginBottom: 6, color: "#1e40af" }}>Serie</div>
                        <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
                            <li>Stessa <strong>corrente I</strong> in ogni resistenza</li>
                            <li>Tensioni si <strong>sommano</strong>: <Latex>{"\\varepsilon = \\sum \\Delta V_i"}</Latex></li>
                            <li><Latex>{"R_{eq} = R_1 + R_2 + R_3"}</Latex></li>
                            <li><Latex>{"R_{eq} > R_{\\max}"}</Latex></li>
                        </ul>
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, marginBottom: 6, color: "#1e40af" }}>Parallelo</div>
                        <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
                            <li>Stessa <strong>tensione V</strong> ai capi di ogni resistenza</li>
                            <li>Correnti si <strong>sommano</strong>: <Latex>{"I = \\sum I_i"}</Latex></li>
                            <li><Latex>{"\\dfrac{1}{R_{eq}} = \\dfrac{1}{R_1} + \\dfrac{1}{R_2} + \\dfrac{1}{R_3}"}</Latex></li>
                            <li><Latex>{"R_{eq} < R_{\\min}"}</Latex></li>
                        </ul>
                    </div>
                </div>
            </InfoBox>
        </DemoContainer>
    );
}
