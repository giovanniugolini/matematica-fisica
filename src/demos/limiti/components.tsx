/**
 * Componenti condivisi per le demo sui limiti
 * @module demos/limiti/components
 */

import React, { useMemo } from "react";

// ============ TIPI ============

export type Point = { x: number; y: number };
export type ApproachPoint = { x: number; fx: number };

// ============ COSTANTI SVG ============

export const SVG_WIDTH = 800;
export const SVG_HEIGHT = 500;
export const PAD_L = 60;
export const PAD_R = 30;
export const PAD_T = 30;
export const PAD_B = 60;

// ============ UTILITY ============

export function clamp(v: number, a: number, b: number): number {
    return Math.max(a, Math.min(b, v));
}

/**
 * Crea funzioni di trasformazione coordinate per il grafico
 */
export function createTransform(xMin: number, xMax: number, yMin: number, yMax: number) {
    const toX = (x: number) => PAD_L + ((x - xMin) / (xMax - xMin)) * (SVG_WIDTH - PAD_L - PAD_R);
    const toY = (y: number) => SVG_HEIGHT - PAD_B - ((y - yMin) / (yMax - yMin)) * (SVG_HEIGHT - PAD_T - PAD_B);
    return { toX, toY };
}

/**
 * Campiona una funzione su un intervallo
 */
export function sampleFunction(
    f: (x: number) => number,
    xMin: number,
    xMax: number,
    n: number = 400
): Point[] {
    const points: Point[] = [];
    for (let i = 0; i <= n; i++) {
        const x = xMin + (i / n) * (xMax - xMin);
        const y = f(x);
        if (Number.isFinite(y)) {
            points.push({ x, y });
        }
    }
    return points;
}

/**
 * Calcola il range Y dinamico basato sui campioni
 */
export function calculateYRange(samples: Point[], padding: number = 0.15): { yMin: number; yMax: number } {
    if (samples.length === 0) return { yMin: -5, yMax: 5 };

    const yValues = samples.map(p => p.y);
    const yMinRaw = Math.min(...yValues);
    const yMaxRaw = Math.max(...yValues);
    const yPad = Math.max(1, (yMaxRaw - yMinRaw) * padding);

    return {
        yMin: yMinRaw - yPad,
        yMax: yMaxRaw + yPad
    };
}

/**
 * Genera i tick per gli assi
 */
export function generateTicks(min: number, max: number, count: number): number[] {
    const ticks: number[] = [];
    const step = (max - min) / count;
    for (let i = 0; i <= count; i++) {
        ticks.push(min + i * step);
    }
    return ticks;
}

/**
 * Genera il path SVG per una curva
 */
export function generatePath(samples: Point[], toX: (x: number) => number, toY: (y: number) => number): string {
    if (samples.length === 0) return "";

    // Raggruppa punti contigui per gestire discontinuità
    const segments: Point[][] = [];
    let currentSegment: Point[] = [];

    for (let i = 0; i < samples.length; i++) {
        const p = samples[i];
        if (i > 0) {
            const prev = samples[i - 1];
            // Se c'è un salto grande in Y, inizia un nuovo segmento
            const yJump = Math.abs(toY(p.y) - toY(prev.y));
            if (yJump > SVG_HEIGHT * 0.5) {
                if (currentSegment.length > 0) {
                    segments.push(currentSegment);
                }
                currentSegment = [];
            }
        }
        currentSegment.push(p);
    }
    if (currentSegment.length > 0) {
        segments.push(currentSegment);
    }

    // Genera path per ogni segmento
    return segments.map(seg => {
        let d = `M ${toX(seg[0].x)} ${toY(seg[0].y)}`;
        for (let i = 1; i < seg.length; i++) {
            d += ` L ${toX(seg[i].x)} ${toY(seg[i].y)}`;
        }
        return d;
    }).join(" ");
}

// ============ COMPONENTI ============

interface GridPatternProps {
    id: string;
}

export function GridPattern({ id }: GridPatternProps) {
    return (
        <defs>
            <pattern id={id} width="20" height="20" patternUnits="userSpaceOnUse">
                <rect width="20" height="20" fill="#fafafa" />
                <path d="M20 0 H0 V20" fill="none" stroke="#e0e0e0" strokeWidth={1} />
            </pattern>
        </defs>
    );
}

interface AxesProps {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
    toX: (x: number) => number;
    toY: (y: number) => number;
}

export function Axes({ xMin, xMax, yMin, yMax, toX, toY }: AxesProps) {
    const xTicks = useMemo(() => generateTicks(xMin, xMax, 10), [xMin, xMax]);
    const yTicks = useMemo(() => generateTicks(yMin, yMax, 8), [yMin, yMax]);

    // Posizione degli assi (clamped al viewport)
    const xAxisY = clamp(toY(0), PAD_T, SVG_HEIGHT - PAD_B);
    const yAxisX = clamp(toX(0), PAD_L, SVG_WIDTH - PAD_R);

    return (
        <g>
            {/* Griglia */}
            {xTicks.map((x, i) => (
                <line key={`xg-${i}`} x1={toX(x)} y1={PAD_T} x2={toX(x)} y2={SVG_HEIGHT - PAD_B} stroke="#e5e7eb" />
            ))}
            {yTicks.map((y, i) => (
                <line key={`yg-${i}`} x1={PAD_L} y1={toY(y)} x2={SVG_WIDTH - PAD_R} y2={toY(y)} stroke="#e5e7eb" />
            ))}

            {/* Assi */}
            <line x1={PAD_L} y1={xAxisY} x2={SVG_WIDTH - PAD_R} y2={xAxisY} stroke="#111827" strokeWidth={2} />
            <line x1={yAxisX} y1={PAD_T} x2={yAxisX} y2={SVG_HEIGHT - PAD_B} stroke="#111827" strokeWidth={2} />

            {/* Labels */}
            {xTicks.map((x, i) => (
                <text key={`xl-${i}`} x={toX(x)} y={SVG_HEIGHT - PAD_B + 20} fontSize={10} textAnchor="middle" fill="#374151">
                    {x.toFixed(1)}
                </text>
            ))}
            {yTicks.map((y, i) => (
                <text key={`yl-${i}`} x={PAD_L - 10} y={toY(y) + 4} fontSize={10} textAnchor="end" fill="#374151">
                    {y.toFixed(1)}
                </text>
            ))}
        </g>
    );
}

interface FunctionCurveProps {
    pathD: string;
    color?: string;
}

export function FunctionCurve({ pathD, color = "#2563eb" }: FunctionCurveProps) {
    return <path d={pathD} fill="none" stroke={color} strokeWidth={3} />;
}

interface VerticalLineProps {
    x: number;
    toX: (x: number) => number;
    color?: string;
    dashed?: boolean;
    label?: string;
}

export function VerticalLine({ x, toX, color = "#ef4444", dashed = true, label }: VerticalLineProps) {
    const xPos = toX(x);
    return (
        <g>
            <line
                x1={xPos}
                y1={PAD_T}
                x2={xPos}
                y2={SVG_HEIGHT - PAD_B}
                stroke={color}
                strokeWidth={2}
                strokeDasharray={dashed ? "6 4" : undefined}
            />
            {label && (
                <text x={xPos + 10} y={PAD_T + 15} fontSize={12} fill={color} fontWeight={600}>
                    {label}
                </text>
            )}
        </g>
    );
}

interface HorizontalLineProps {
    y: number;
    toY: (y: number) => number;
    color?: string;
    dashed?: boolean;
    label?: string;
}

export function HorizontalLine({ y, toY, color = "#10b981", dashed = true, label }: HorizontalLineProps) {
    const yPos = toY(y);
    return (
        <g>
            <line
                x1={PAD_L}
                y1={yPos}
                x2={SVG_WIDTH - PAD_R}
                y2={yPos}
                stroke={color}
                strokeWidth={2}
                strokeDasharray={dashed ? "6 4" : undefined}
            />
            {label && (
                <text x={SVG_WIDTH - PAD_R - 10} y={yPos - 8} fontSize={12} fill={color} fontWeight={600} textAnchor="end">
                    {label}
                </text>
            )}
        </g>
    );
}

interface ApproachPointsProps {
    points: ApproachPoint[];
    toX: (x: number) => number;
    toY: (y: number) => number;
    color: string;
    side: "left" | "right";
}

export function ApproachPoints({ points, toX, toY, color, side }: ApproachPointsProps) {
    return (
        <g>
            {points.map((p, i) => {
                const yPos = toY(p.fx);
                // Clamp per evitare punti fuori dal viewport
                if (yPos < PAD_T - 20 || yPos > SVG_HEIGHT - PAD_B + 20) return null;
                return (
                    <circle
                        key={`${side}-${i}`}
                        cx={toX(p.x)}
                        cy={yPos}
                        r={3}
                        fill={color}
                        opacity={0.6 + i * 0.08}
                    />
                );
            })}
        </g>
    );
}

interface AnimatedPointProps {
    x: number;
    y: number;
    toX: (x: number) => number;
    toY: (y: number) => number;
    showGuides?: boolean;
}

export function AnimatedPoint({ x, y, toX, toY, showGuides = true }: AnimatedPointProps) {
    const xPos = toX(x);
    const yPos = toY(y);

    // Clamp per verificare visibilità
    if (yPos < PAD_T - 50 || yPos > SVG_HEIGHT - PAD_B + 50) {
        return null;
    }

    return (
        <g>
            {showGuides && (
                <>
                    <line x1={xPos} y1={yPos} x2={xPos} y2={SVG_HEIGHT - PAD_B} stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="3 3" opacity={0.6} />
                    <line x1={xPos} y1={yPos} x2={PAD_L} y2={yPos} stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="3 3" opacity={0.6} />
                </>
            )}
            <circle cx={xPos} cy={yPos} r={8} fill="#fbbf24" stroke="#92400e" strokeWidth={2} />

            {/* Label X */}
            <g>
                <rect x={xPos - 35} y={SVG_HEIGHT - PAD_B + 25} width={70} height={20} fill="#fef3c7" stroke="#f59e0b" rx={4} />
                <text x={xPos} y={SVG_HEIGHT - PAD_B + 38} fontSize={11} textAnchor="middle" fill="#92400e" fontWeight={600}>
                    x = {x.toFixed(3)}
                </text>
            </g>

            {/* Label Y */}
            <g>
                <rect x={PAD_L - 70} y={yPos - 10} width={60} height={20} fill="#fef3c7" stroke="#f59e0b" rx={4} />
                <text x={PAD_L - 40} y={yPos + 3} fontSize={11} textAnchor="middle" fill="#92400e" fontWeight={600}>
                    f(x) = {y.toFixed(3)}
                </text>
            </g>
        </g>
    );
}

interface LimitPointProps {
    x: number;
    y: number;
    toX: (x: number) => number;
    toY: (y: number) => number;
}

export function LimitPoint({ x, y, toX, toY }: LimitPointProps) {
    const yPos = toY(y);
    if (yPos < PAD_T - 10 || yPos > SVG_HEIGHT - PAD_B + 10) return null;

    return (
        <circle
            cx={toX(x)}
            cy={yPos}
            r={6}
            fill="#10b981"
            stroke="#065f46"
            strokeWidth={2}
        />
    );
}

// ============ PANNELLI UI ============

interface ControlButtonProps {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    style?: React.CSSProperties; // ✅ AGGIUNTO
}

export function ControlButton({ onClick, active, disabled, children, style }: ControlButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                padding: "6px 12px",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                background: active ? "#dbeafe" : disabled ? "#e5e7eb" : "#fff",
                cursor: disabled ? "not-allowed" : "pointer",
                fontWeight: active ? 600 : 400,
                fontSize: 13,
                ...style, // ✅ AGGIUNTO (merge finale)
            }}
        >
            {children}
        </button>
    );
}

interface FunctionSelectorProps {
    functions: { id: string; name: string; note?: string }[];
    selected: string;
    onSelect: (id: string) => void;
}

export function FunctionSelector({ functions, selected, onSelect }: FunctionSelectorProps) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {functions.map((f) => (
                <button
                    key={f.id}
                    onClick={() => onSelect(f.id)}
                    style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: selected === f.id ? "2px solid #3b82f6" : "1px solid #e5e7eb",
                        background: selected === f.id ? "#dbeafe" : "#fff",
                        cursor: "pointer",
                        textAlign: "left",
                        fontSize: 13,
                    }}
                >
                    {f.name}
                </button>
            ))}
        </div>
    );
}

interface ApproachTableProps {
    leftPoints: ApproachPoint[];
    rightPoints: ApproachPoint[];
    x0: number;
    limitValue: number | string;
    onClose: () => void;
}

export function ApproachTable({ leftPoints, rightPoints, x0, limitValue, onClose }: ApproachTableProps) {
    return (
        <div style={{ background: "#fff", borderRadius: 16, padding: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontWeight: 600 }}>Tabella di avvicinamento</div>
                <button onClick={onClose} style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", fontSize: 11, cursor: "pointer" }}>
                    Nascondi
                </button>
            </div>
            <div style={{ maxHeight: 200, overflowY: "auto", fontSize: 12 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={{ background: "#f1f5f9", position: "sticky", top: 0 }}>
                    <tr>
                        <th style={{ padding: 4, textAlign: "left" }}>x</th>
                        <th style={{ padding: 4, textAlign: "right" }}>f(x)</th>
                    </tr>
                    </thead>
                    <tbody>
                    {leftPoints.map((p, i) => (
                        <tr key={`tl-${i}`} style={{ background: "#fff7ed" }}>
                            <td style={{ padding: 4 }}>{p.x.toFixed(4)}</td>
                            <td style={{ padding: 4, textAlign: "right" }}>{p.fx.toFixed(4)}</td>
                        </tr>
                    ))}
                    <tr style={{ background: "#dcfce7", fontWeight: 600 }}>
                        <td style={{ padding: 4 }}>x₀ = {typeof x0 === "number" ? x0.toFixed(4) : x0}</td>
                        <td style={{ padding: 4, textAlign: "right" }}>L = {typeof limitValue === "number" ? limitValue.toFixed(4) : limitValue}</td>
                    </tr>
                    {rightPoints.map((p, i) => (
                        <tr key={`tr-${i}`} style={{ background: "#f5f3ff" }}>
                            <td style={{ padding: 4 }}>{p.x.toFixed(4)}</td>
                            <td style={{ padding: 4, textAlign: "right" }}>{p.fx.toFixed(4)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

interface ResultBoxProps {
    title: string;
    children: React.ReactNode;
}

export function ResultBox({ title, children }: ResultBoxProps) {
    return (
        <div style={{ background: "#fff", borderRadius: 16, padding: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{title}</div>
            <div style={{ fontSize: 14, color: "#334155" }}>{children}</div>
        </div>
    );
}

interface NoteBoxProps {
    note: string;
}

export function NoteBox({ note }: NoteBoxProps) {
    return (
        <div style={{ marginTop: 8, padding: 8, background: "#fef3c7", borderRadius: 8, fontSize: 13, color: "#78350f" }}>
            ℹ️ {note}
        </div>
    );
}

interface ConceptBoxProps {
    children: React.ReactNode;
}

export function ConceptBox({ children }: ConceptBoxProps) {
    return (
        <div style={{ marginTop: 12, background: "#eff6ff", borderRadius: 12, padding: 12, fontSize: 13, color: "#1e3a8a" }}>
            <strong>Concetto:</strong> {children}
        </div>
    );
}

// ============ CARD STYLE ============

export const cardStyle: React.CSSProperties = {
    background: "#fff",
    borderRadius: 16,
    padding: 12,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)"
};