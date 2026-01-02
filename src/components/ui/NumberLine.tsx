import React from "react";

// ============================================================================
// TYPES
// ============================================================================

export type PointStyle = "solid" | "hollow" | "none";
export type IntervalType = "open" | "closed" | "open-closed" | "closed-open";

export interface NumberLinePoint {
    x: number;
    label?: string;
    style?: PointStyle;
    color?: string;
    showLabel?: boolean;
}

export interface NumberLineInterval {
    start: number | "-inf";
    end: number | "+inf";
    type: IntervalType;
    color?: string;
    opacity?: number;
}

export interface NumberLineSegment {
    start: number;
    end: number;
    color?: string;
    strokeWidth?: number;
    dashed?: boolean;
}

export interface NumberLineArrow {
    x: number;
    direction: "left" | "right";
    color?: string;
    label?: string;
}

export interface NumberLineProps {
    // Dimensioni
    width?: number;
    height?: number;
    padding?: { left: number; right: number; top: number; bottom: number };

    // Range asse
    min?: number;
    max?: number;

    // Aspetto asse
    axisColor?: string;
    axisStrokeWidth?: number;
    showArrows?: boolean;

    // Tacche (ticks)
    tickStep?: number;
    tickHeight?: number;
    showTickLabels?: boolean;
    tickLabelOffset?: number;
    tickLabelFontSize?: number;
    tickLabelColor?: string;

    // Griglia
    showGrid?: boolean;
    gridColor?: string;
    gridOpacity?: number;

    // Elementi
    points?: NumberLinePoint[];
    intervals?: NumberLineInterval[];
    segments?: NumberLineSegment[];
    arrows?: NumberLineArrow[];

    // Stile punti default
    pointRadius?: number;
    pointColor?: string;

    // Label asse
    axisLabel?: string;

    // Responsive
    className?: string;
    style?: React.CSSProperties;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const DEFAULT_PADDING = { left: 40, right: 40, top: 30, bottom: 40 };
const DEFAULT_POINT_RADIUS = 6;
const DEFAULT_TICK_HEIGHT = 8;
const DEFAULT_TICK_LABEL_OFFSET = 20;
const DEFAULT_TICK_LABEL_FONT_SIZE = 12;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatTickLabel(value: number): string {
    if (Number.isInteger(value)) return value.toString();
    const rounded = Math.round(value * 100) / 100;
    return rounded.toString();
}

// ============================================================================
// COMPONENT
// ============================================================================

export const NumberLine: React.FC<NumberLineProps> = ({
                                                          width = 600,
                                                          height = 100,
                                                          padding = DEFAULT_PADDING,
                                                          min = -5,
                                                          max = 5,
                                                          axisColor = "#374151",
                                                          axisStrokeWidth = 2,
                                                          showArrows = true,
                                                          tickStep = 1,
                                                          tickHeight = DEFAULT_TICK_HEIGHT,
                                                          showTickLabels = true,
                                                          tickLabelOffset = DEFAULT_TICK_LABEL_OFFSET,
                                                          tickLabelFontSize = DEFAULT_TICK_LABEL_FONT_SIZE,
                                                          tickLabelColor = "#6b7280",
                                                          showGrid = false,
                                                          gridColor = "#e5e7eb",
                                                          gridOpacity = 0.5,
                                                          points = [],
                                                          intervals = [],
                                                          segments = [],
                                                          arrows = [],
                                                          pointRadius = DEFAULT_POINT_RADIUS,
                                                          pointColor = "#3b82f6",
                                                          axisLabel = "x",
                                                          className = "",
                                                          style = {},
                                                      }) => {
    // Calcola dimensioni area di disegno
    const drawWidth = width - padding.left - padding.right;
    const drawHeight = height - padding.top - padding.bottom;
    const axisY = padding.top + drawHeight / 2;

    // Funzione di trasformazione: valore matematico → coordinata SVG
    const toSvgX = (value: number): number => {
        const ratio = (value - min) / (max - min);
        return padding.left + ratio * drawWidth;
    };

    // Genera le tacche
    const ticks: number[] = [];
    const startTick = Math.ceil(min / tickStep) * tickStep;
    for (let t = startTick; t <= max; t += tickStep) {
        if (t >= min && t <= max) {
            ticks.push(Math.round(t * 1000) / 1000); // Evita errori floating point
        }
    }

    // Dimensione frecce
    const arrowSize = 10;

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className={className}
            style={style}
        >
            {/* Griglia verticale */}
            {showGrid && ticks.map((t, i) => (
                <line
                    key={`grid-${i}`}
                    x1={toSvgX(t)}
                    y1={padding.top}
                    x2={toSvgX(t)}
                    y2={height - padding.bottom}
                    stroke={gridColor}
                    strokeWidth={1}
                    opacity={gridOpacity}
                />
            ))}

            {/* Intervalli colorati */}
            {intervals.map((interval, i) => {
                const startX = interval.start === "-inf" ? padding.left : toSvgX(interval.start);
                const endX = interval.end === "+inf" ? width - padding.right : toSvgX(interval.end);
                const intervalColor = interval.color || pointColor;
                const intervalOpacity = interval.opacity ?? 0.3;

                return (
                    <g key={`interval-${i}`}>
                        {/* Barra colorata */}
                        <line
                            x1={startX}
                            y1={axisY}
                            x2={endX}
                            y2={axisY}
                            stroke={intervalColor}
                            strokeWidth={6}
                            opacity={intervalOpacity}
                            strokeLinecap="round"
                        />

                        {/* Punto inizio (se non infinito) */}
                        {interval.start !== "-inf" && (
                            <circle
                                cx={toSvgX(interval.start)}
                                cy={axisY}
                                r={pointRadius - 1}
                                fill={interval.type === "closed" || interval.type === "closed-open" ? intervalColor : "white"}
                                stroke={intervalColor}
                                strokeWidth={2}
                            />
                        )}

                        {/* Punto fine (se non infinito) */}
                        {interval.end !== "+inf" && (
                            <circle
                                cx={toSvgX(interval.end)}
                                cy={axisY}
                                r={pointRadius - 1}
                                fill={interval.type === "closed" || interval.type === "open-closed" ? intervalColor : "white"}
                                stroke={intervalColor}
                                strokeWidth={2}
                            />
                        )}

                        {/* Freccia sinistra per -∞ */}
                        {interval.start === "-inf" && (
                            <polygon
                                points={`${padding.left},${axisY} ${padding.left + 8},${axisY - 4} ${padding.left + 8},${axisY + 4}`}
                                fill={intervalColor}
                                opacity={intervalOpacity + 0.3}
                            />
                        )}

                        {/* Freccia destra per +∞ */}
                        {interval.end === "+inf" && (
                            <polygon
                                points={`${width - padding.right},${axisY} ${width - padding.right - 8},${axisY - 4} ${width - padding.right - 8},${axisY + 4}`}
                                fill={intervalColor}
                                opacity={intervalOpacity + 0.3}
                            />
                        )}
                    </g>
                );
            })}

            {/* Segmenti custom */}
            {segments.map((seg, i) => (
                <line
                    key={`segment-${i}`}
                    x1={toSvgX(seg.start)}
                    y1={axisY}
                    x2={toSvgX(seg.end)}
                    y2={axisY}
                    stroke={seg.color || pointColor}
                    strokeWidth={seg.strokeWidth || 3}
                    strokeDasharray={seg.dashed ? "5,3" : undefined}
                />
            ))}

            {/* Asse principale */}
            <line
                x1={padding.left}
                y1={axisY}
                x2={width - padding.right}
                y2={axisY}
                stroke={axisColor}
                strokeWidth={axisStrokeWidth}
            />

            {/* Frecce asse */}
            {showArrows && (
                <>
                    {/* Freccia sinistra */}
                    <polygon
                        points={`${padding.left},${axisY} ${padding.left + arrowSize},${axisY - arrowSize / 2} ${padding.left + arrowSize},${axisY + arrowSize / 2}`}
                        fill={axisColor}
                    />
                    {/* Freccia destra */}
                    <polygon
                        points={`${width - padding.right},${axisY} ${width - padding.right - arrowSize},${axisY - arrowSize / 2} ${width - padding.right - arrowSize},${axisY + arrowSize / 2}`}
                        fill={axisColor}
                    />
                </>
            )}

            {/* Tacche e label */}
            {ticks.map((t, i) => (
                <g key={`tick-${i}`}>
                    <line
                        x1={toSvgX(t)}
                        y1={axisY - tickHeight / 2}
                        x2={toSvgX(t)}
                        y2={axisY + tickHeight / 2}
                        stroke={axisColor}
                        strokeWidth={1.5}
                    />
                    {showTickLabels && (
                        <text
                            x={toSvgX(t)}
                            y={axisY + tickLabelOffset}
                            textAnchor="middle"
                            fontSize={tickLabelFontSize}
                            fill={tickLabelColor}
                        >
                            {formatTickLabel(t)}
                        </text>
                    )}
                </g>
            ))}

            {/* Label asse (es. "x") */}
            {axisLabel && (
                <text
                    x={width - padding.right + 15}
                    y={axisY + 5}
                    fontSize={14}
                    fontStyle="italic"
                    fill={axisColor}
                >
                    {axisLabel}
                </text>
            )}

            {/* Frecce direzionali custom */}
            {arrows.map((arrow, i) => {
                const x = toSvgX(arrow.x);
                const arrowColor = arrow.color || pointColor;
                const dx = arrow.direction === "right" ? 20 : -20;

                return (
                    <g key={`arrow-${i}`}>
                        <line
                            x1={x}
                            y1={axisY}
                            x2={x + dx}
                            y2={axisY}
                            stroke={arrowColor}
                            strokeWidth={3}
                            markerEnd={`url(#arrowhead-${i})`}
                        />
                        <defs>
                            <marker
                                id={`arrowhead-${i}`}
                                markerWidth="10"
                                markerHeight="7"
                                refX="9"
                                refY="3.5"
                                orient="auto"
                            >
                                <polygon
                                    points="0 0, 10 3.5, 0 7"
                                    fill={arrowColor}
                                />
                            </marker>
                        </defs>
                        {arrow.label && (
                            <text
                                x={x + dx / 2}
                                y={axisY - 12}
                                textAnchor="middle"
                                fontSize={12}
                                fill={arrowColor}
                            >
                                {arrow.label}
                            </text>
                        )}
                    </g>
                );
            })}

            {/* Punti */}
            {points.map((point, i) => {
                const x = toSvgX(point.x);
                const pColor = point.color || pointColor;
                const pStyle = point.style || "solid";
                const showLabel = point.showLabel !== false;

                return (
                    <g key={`point-${i}`}>
                        {pStyle !== "none" && (
                            <circle
                                cx={x}
                                cy={axisY}
                                r={pointRadius}
                                fill={pStyle === "solid" ? pColor : "white"}
                                stroke={pColor}
                                strokeWidth={2}
                            />
                        )}
                        {showLabel && point.label && (
                            <text
                                x={x}
                                y={axisY - pointRadius - 8}
                                textAnchor="middle"
                                fontSize={12}
                                fontWeight="500"
                                fill={pColor}
                            >
                                {point.label}
                            </text>
                        )}
                    </g>
                );
            })}
        </svg>
    );
};

// ============================================================================
// PRESET CONFIGURATIONS
// ============================================================================

/** Configurazione per disequazioni (intervalli colorati) */
export const inequalityPreset: Partial<NumberLineProps> = {
    height: 80,
    showGrid: false,
    showArrows: true,
    pointRadius: 7,
};

/** Configurazione per intervalli in ℝ */
export const intervalsPreset: Partial<NumberLineProps> = {
    height: 100,
    showGrid: true,
    gridOpacity: 0.3,
    showArrows: true,
};

/** Configurazione minimalista */
export const minimalPreset: Partial<NumberLineProps> = {
    height: 60,
    showGrid: false,
    showArrows: false,
    showTickLabels: false,
    axisLabel: "",
};

export default NumberLine;