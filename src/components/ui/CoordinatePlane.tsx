import React, { useMemo } from "react";

// ============================================================================
// TYPES
// ============================================================================

export type PointMarker = "circle" | "square" | "diamond" | "cross" | "none";
export type LineStyle = "solid" | "dashed" | "dotted";

export interface PlanePoint {
    x: number;
    y: number;
    label?: string;
    labelPosition?: "top" | "bottom" | "left" | "right" | "auto";
    marker?: PointMarker;
    color?: string;
    radius?: number;
}

export interface PlaneLine {
    // Linea definita da due punti
    p1?: { x: number; y: number };
    p2?: { x: number; y: number };
    // Oppure da equazione y = mx + q
    slope?: number;
    intercept?: number;
    // Oppure linea verticale x = k
    vertical?: number;
    // Oppure linea orizzontale y = k
    horizontal?: number;
    // Stile
    color?: string;
    strokeWidth?: number;
    style?: LineStyle;
    label?: string;
    // Extend to edges
    extend?: boolean;
}

export interface PlaneFunction {
    // Funzione f(x) → y
    fn: (x: number) => number;
    // Range di definizione
    domain?: { min: number; max: number };
    // Punti da escludere (asintoti verticali)
    exclude?: number[];
    // Stile
    color?: string;
    strokeWidth?: number;
    style?: LineStyle;
    label?: string;
    // Risoluzione (numero di punti)
    resolution?: number;
}

export interface PlaneRegion {
    // Definita da inequazione: above/below linea y = mx + q
    type: "above" | "below" | "left" | "right";
    boundary: {
        slope?: number;
        intercept?: number;
        vertical?: number;
        horizontal?: number;
    };
    color?: string;
    opacity?: number;
    includeBoundary?: boolean;
}

export interface PlaneVector {
    origin: { x: number; y: number };
    end: { x: number; y: number };
    color?: string;
    strokeWidth?: number;
    label?: string;
    labelPosition?: "middle" | "end";
}

export interface PlaneArc {
    center: { x: number; y: number };
    radius: number;
    startAngle: number; // in gradi
    endAngle: number;   // in gradi
    color?: string;
    strokeWidth?: number;
    fill?: string;
    label?: string;
}

export interface PlanePolygon {
    vertices: Array<{ x: number; y: number }>;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    opacity?: number;
}

export interface CoordinatePlaneProps {
    // Dimensioni
    width?: number;
    height?: number;
    padding?: { left: number; right: number; top: number; bottom: number };

    // Range assi
    xMin?: number;
    xMax?: number;
    yMin?: number;
    yMax?: number;

    // Aspetto assi
    axisColor?: string;
    axisStrokeWidth?: number;
    showArrows?: boolean;

    // Griglia
    showGrid?: boolean;
    gridColor?: string;
    gridOpacity?: number;
    xGridStep?: number;
    yGridStep?: number;
    showMinorGrid?: boolean;
    minorGridColor?: string;
    minorGridOpacity?: number;

    // Tacche
    xTickStep?: number;
    yTickStep?: number;
    tickSize?: number;
    showTickLabels?: boolean;
    tickLabelFontSize?: number;
    tickLabelColor?: string;

    // Label assi
    xAxisLabel?: string;
    yAxisLabel?: string;
    showOriginLabel?: boolean;

    // Elementi
    points?: PlanePoint[];
    lines?: PlaneLine[];
    functions?: PlaneFunction[];
    regions?: PlaneRegion[];
    vectors?: PlaneVector[];
    arcs?: PlaneArc[];
    polygons?: PlanePolygon[];

    // Stili default
    defaultPointColor?: string;
    defaultLineColor?: string;
    defaultFunctionColor?: string;

    // Responsive
    className?: string;
    style?: React.CSSProperties;

    // Children per contenuto custom
    children?: React.ReactNode;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const DEFAULT_PADDING = { left: 50, right: 30, top: 30, bottom: 50 };

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatAxisLabel(value: number): string {
    if (Math.abs(value) < 0.001) return "0";
    if (Number.isInteger(value)) return value.toString();
    return (Math.round(value * 100) / 100).toString();
}

function getLineStrokeDasharray(style: LineStyle): string | undefined {
    switch (style) {
        case "dashed": return "8,4";
        case "dotted": return "2,4";
        default: return undefined;
    }
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
        x: cx + r * Math.cos(angleRad),
        y: cy - r * Math.sin(angleRad), // SVG y è invertito
    };
}

/**
 * Costruisce un arco come polyline (serie di segmenti) invece del comando SVG "A".
 * Motivo: evitare ambiguità dei flag large-arc/sweep e gestire bene angoli negativi.
 */
function buildArcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number, steps: number = 48): string {
    const total = endAngle - startAngle;
    const n = Math.max(8, Math.min(256, steps));
    let d = "";

    for (let i = 0; i <= n; i++) {
        const t = i / n;
        const a = startAngle + total * t;
        const p = polarToCartesian(cx, cy, r, a);
        d += (i === 0) ? `M ${p.x} ${p.y} ` : `L ${p.x} ${p.y} `;
    }
    return d.trim();
}

// ============================================================================
// COMPONENT
// ============================================================================

export const CoordinatePlane: React.FC<CoordinatePlaneProps> = ({
                                                                    width = 500,
                                                                    height = 500,
                                                                    padding = DEFAULT_PADDING,
                                                                    xMin = -5,
                                                                    xMax = 5,
                                                                    yMin = -5,
                                                                    yMax = 5,
                                                                    axisColor = "#374151",
                                                                    axisStrokeWidth = 2,
                                                                    showArrows = true,
                                                                    showGrid = true,
                                                                    gridColor = "#e5e7eb",
                                                                    gridOpacity = 0.7,
                                                                    xGridStep,
                                                                    yGridStep,
                                                                    showMinorGrid = false,
                                                                    minorGridColor = "#f3f4f6",
                                                                    minorGridOpacity = 0.5,
                                                                    xTickStep = 1,
                                                                    yTickStep = 1,
                                                                    tickSize = 6,
                                                                    showTickLabels = true,
                                                                    tickLabelFontSize = 11,
                                                                    tickLabelColor = "#6b7280",
                                                                    xAxisLabel = "x",
                                                                    yAxisLabel = "y",
                                                                    showOriginLabel = true,
                                                                    points = [],
                                                                    lines = [],
                                                                    functions = [],
                                                                    regions = [],
                                                                    vectors = [],
                                                                    arcs = [],
                                                                    polygons = [],
                                                                    defaultPointColor = "#3b82f6",
                                                                    defaultLineColor = "#ef4444",
                                                                    defaultFunctionColor = "#10b981",
                                                                    className = "",
                                                                    style = {},
                                                                    children,
                                                                }) => {
    // Calcola dimensioni area di disegno
    const drawWidth = width - padding.left - padding.right;
    const drawHeight = height - padding.top - padding.bottom;

    // Grid steps (default = tick steps)
    const actualXGridStep = xGridStep ?? xTickStep;
    const actualYGridStep = yGridStep ?? yTickStep;

    // Funzioni di trasformazione
    const toSvgX = (x: number): number => {
        return padding.left + ((x - xMin) / (xMax - xMin)) * drawWidth;
    };

    const toSvgY = (y: number): number => {
        return padding.top + ((yMax - y) / (yMax - yMin)) * drawHeight;
    };

    // Posizione origine
    const originX = toSvgX(0);
    const originY = toSvgY(0);

    // Genera tick arrays
    const xTicks = useMemo(() => {
        const ticks: number[] = [];
        const start = Math.ceil(xMin / xTickStep) * xTickStep;
        for (let t = start; t <= xMax; t += xTickStep) {
            if (Math.abs(t) > 0.001) ticks.push(Math.round(t * 1000) / 1000);
        }
        return ticks;
    }, [xMin, xMax, xTickStep]);

    const yTicks = useMemo(() => {
        const ticks: number[] = [];
        const start = Math.ceil(yMin / yTickStep) * yTickStep;
        for (let t = start; t <= yMax; t += yTickStep) {
            if (Math.abs(t) > 0.001) ticks.push(Math.round(t * 1000) / 1000);
        }
        return ticks;
    }, [yMin, yMax, yTickStep]);

    // Genera grid lines
    const xGridLines = useMemo(() => {
        const lines: number[] = [];
        const start = Math.ceil(xMin / actualXGridStep) * actualXGridStep;
        for (let t = start; t <= xMax; t += actualXGridStep) {
            lines.push(Math.round(t * 1000) / 1000);
        }
        return lines;
    }, [xMin, xMax, actualXGridStep]);

    const yGridLines = useMemo(() => {
        const lines: number[] = [];
        const start = Math.ceil(yMin / actualYGridStep) * actualYGridStep;
        for (let t = start; t <= yMax; t += actualYGridStep) {
            lines.push(Math.round(t * 1000) / 1000);
        }
        return lines;
    }, [yMin, yMax, actualYGridStep]);

    // Dimensione frecce
    const arrowSize = 10;

    // Genera path per funzione
    const generateFunctionPath = (func: PlaneFunction): string => {
        const resolution = func.resolution || 200;
        const domainMin = func.domain?.min ?? xMin;
        const domainMax = func.domain?.max ?? xMax;
        const excludeSet = new Set(func.exclude || []);

        const pathSegments: string[] = [];
        let currentSegment: string[] = [];

        for (let i = 0; i <= resolution; i++) {
            const x = domainMin + (i / resolution) * (domainMax - domainMin);

            // Skip punti esclusi
            if (excludeSet.has(x)) {
                if (currentSegment.length > 0) {
                    pathSegments.push(currentSegment.join(" "));
                    currentSegment = [];
                }
                continue;
            }

            try {
                const y = func.fn(x);

                // Skip valori non finiti o fuori range
                if (!isFinite(y) || y < yMin - 10 || y > yMax + 10) {
                    if (currentSegment.length > 0) {
                        pathSegments.push(currentSegment.join(" "));
                        currentSegment = [];
                    }
                    continue;
                }

                const svgX = toSvgX(x);
                const svgY = toSvgY(y);

                if (currentSegment.length === 0) {
                    currentSegment.push(`M ${svgX} ${svgY}`);
                } else {
                    currentSegment.push(`L ${svgX} ${svgY}`);
                }
            } catch {
                if (currentSegment.length > 0) {
                    pathSegments.push(currentSegment.join(" "));
                    currentSegment = [];
                }
            }
        }

        if (currentSegment.length > 0) {
            pathSegments.push(currentSegment.join(" "));
        }

        return pathSegments.join(" ");
    };

    // Calcola punti intersezione linea con bordi
    const getLineEndpoints = (line: PlaneLine): { x1: number; y1: number; x2: number; y2: number } | null => {
        if (line.vertical !== undefined) {
            return {
                x1: toSvgX(line.vertical),
                y1: padding.top,
                x2: toSvgX(line.vertical),
                y2: height - padding.bottom,
            };
        }

        if (line.horizontal !== undefined) {
            return {
                x1: padding.left,
                y1: toSvgY(line.horizontal),
                x2: width - padding.right,
                y2: toSvgY(line.horizontal),
            };
        }

        if (line.p1 && line.p2) {
            if (line.extend) {
                // Calcola slope e intercept
                const dx = line.p2.x - line.p1.x;
                if (Math.abs(dx) < 0.0001) {
                    // Linea verticale
                    return {
                        x1: toSvgX(line.p1.x),
                        y1: padding.top,
                        x2: toSvgX(line.p1.x),
                        y2: height - padding.bottom,
                    };
                }
                const m = (line.p2.y - line.p1.y) / dx;
                const q = line.p1.y - m * line.p1.x;
                return getLineEndpoints({ slope: m, intercept: q, extend: true });
            }
            return {
                x1: toSvgX(line.p1.x),
                y1: toSvgY(line.p1.y),
                x2: toSvgX(line.p2.x),
                y2: toSvgY(line.p2.y),
            };
        }

        if (line.slope !== undefined && line.intercept !== undefined) {
            const m = line.slope;
            const q = line.intercept;

            // Trova intersezioni con i bordi del viewport
            const yAtXMin = m * xMin + q;
            const yAtXMax = m * xMax + q;
            const xAtYMin = (yMin - q) / m;
            const xAtYMax = (yMax - q) / m;

            const intersections: Array<{ x: number; y: number }> = [];

            if (yAtXMin >= yMin && yAtXMin <= yMax) {
                intersections.push({ x: xMin, y: yAtXMin });
            }
            if (yAtXMax >= yMin && yAtXMax <= yMax) {
                intersections.push({ x: xMax, y: yAtXMax });
            }
            if (isFinite(xAtYMin) && xAtYMin >= xMin && xAtYMin <= xMax) {
                intersections.push({ x: xAtYMin, y: yMin });
            }
            if (isFinite(xAtYMax) && xAtYMax >= xMin && xAtYMax <= xMax) {
                intersections.push({ x: xAtYMax, y: yMax });
            }

            // Rimuovi duplicati
            const unique = intersections.filter((p, i, arr) =>
                arr.findIndex(q => Math.abs(q.x - p.x) < 0.001 && Math.abs(q.y - p.y) < 0.001) === i
            );

            if (unique.length >= 2) {
                return {
                    x1: toSvgX(unique[0].x),
                    y1: toSvgY(unique[0].y),
                    x2: toSvgX(unique[1].x),
                    y2: toSvgY(unique[1].y),
                };
            }
        }

        return null;
    };

    // Renderizza marker punto
    const renderPointMarker = (point: PlanePoint, index: number) => {
        const x = toSvgX(point.x);
        const y = toSvgY(point.y);
        const color = point.color || defaultPointColor;
        const radius = point.radius || 5;
        const marker = point.marker || "circle";

        const labelOffsets = {
            top: { dx: 0, dy: -radius - 8, anchor: "middle" as const },
            bottom: { dx: 0, dy: radius + 14, anchor: "middle" as const },
            left: { dx: -radius - 8, dy: 4, anchor: "end" as const },
            right: { dx: radius + 8, dy: 4, anchor: "start" as const },
            auto: { dx: radius + 6, dy: -radius - 4, anchor: "start" as const },
        };

        const labelPos = point.labelPosition || "auto";
        const offset = labelOffsets[labelPos];

        let markerElement: React.ReactNode;

        switch (marker) {
            case "square":
                markerElement = (
                    <rect
                        x={x - radius}
                        y={y - radius}
                        width={radius * 2}
                        height={radius * 2}
                        fill={color}
                    />
                );
                break;
            case "diamond":
                markerElement = (
                    <polygon
                        points={`${x},${y - radius} ${x + radius},${y} ${x},${y + radius} ${x - radius},${y}`}
                        fill={color}
                    />
                );
                break;
            case "cross":
                markerElement = (
                    <g stroke={color} strokeWidth={2}>
                        <line x1={x - radius} y1={y} x2={x + radius} y2={y} />
                        <line x1={x} y1={y - radius} x2={x} y2={y + radius} />
                    </g>
                );
                break;
            case "none":
                markerElement = null;
                break;
            default:
                markerElement = <circle cx={x} cy={y} r={radius} fill={color} />;
        }

        return (
            <g key={`point-${index}`}>
                {markerElement}
                {point.label && (
                    <text
                        x={x + offset.dx}
                        y={y + offset.dy}
                        textAnchor={offset.anchor}
                        fontSize={12}
                        fontWeight="500"
                        fill={color}
                    >
                        {point.label}
                    </text>
                )}
            </g>
        );
    };

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className={className}
            style={style}
        >
            {/* Definizioni (markers, gradients, etc.) */}
            <defs>
                <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                >
                    <polygon points="0 0, 10 3.5, 0 7" fill={axisColor} />
                </marker>
                <marker
                    id="vector-arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                >
                    <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
                </marker>
            </defs>

            {/* Griglia minore */}
            {showMinorGrid && (
                <g stroke={minorGridColor} strokeWidth={0.5} opacity={minorGridOpacity}>
                    {xGridLines.flatMap((x, i) => {
                        const minorStep = actualXGridStep / 5;
                        return [1, 2, 3, 4].map(j => {
                            const minorX = x + j * minorStep;
                            if (minorX <= xMax) {
                                return (
                                    <line
                                        key={`minor-x-${i}-${j}`}
                                        x1={toSvgX(minorX)}
                                        y1={padding.top}
                                        x2={toSvgX(minorX)}
                                        y2={height - padding.bottom}
                                    />
                                );
                            }
                            return null;
                        });
                    })}
                    {yGridLines.flatMap((y, i) => {
                        const minorStep = actualYGridStep / 5;
                        return [1, 2, 3, 4].map(j => {
                            const minorY = y + j * minorStep;
                            if (minorY <= yMax) {
                                return (
                                    <line
                                        key={`minor-y-${i}-${j}`}
                                        x1={padding.left}
                                        y1={toSvgY(minorY)}
                                        x2={width - padding.right}
                                        y2={toSvgY(minorY)}
                                    />
                                );
                            }
                            return null;
                        });
                    })}
                </g>
            )}

            {/* Griglia principale */}
            {showGrid && (
                <g stroke={gridColor} strokeWidth={1} opacity={gridOpacity}>
                    {xGridLines.map((x, i) => (
                        <line
                            key={`grid-x-${i}`}
                            x1={toSvgX(x)}
                            y1={padding.top}
                            x2={toSvgX(x)}
                            y2={height - padding.bottom}
                        />
                    ))}
                    {yGridLines.map((y, i) => (
                        <line
                            key={`grid-y-${i}`}
                            x1={padding.left}
                            y1={toSvgY(y)}
                            x2={width - padding.right}
                            y2={toSvgY(y)}
                        />
                    ))}
                </g>
            )}

            {/* Regioni (aree colorate) */}
            {regions.map((region, i) => {
                const regionColor = region.color || defaultFunctionColor;
                const opacity = region.opacity ?? 0.2;

                // Semplificazione: solo regioni above/below linea orizzontale
                if (region.boundary.horizontal !== undefined) {
                    const boundaryY = toSvgY(region.boundary.horizontal);
                    const y1 = region.type === "above" ? padding.top : boundaryY;
                    const y2 = region.type === "above" ? boundaryY : height - padding.bottom;
                    const rectHeight = y2 - y1;

                    return (
                        <rect
                            key={`region-${i}`}
                            x={padding.left}
                            y={y1}
                            width={drawWidth}
                            height={rectHeight}
                            fill={regionColor}
                            opacity={opacity}
                        />
                    );
                }

                // TODO: implementare altre regioni (slope + intercept, etc.)
                return null;
            })}

            {/* Poligoni */}
            {polygons.map((poly, i) => (
                <polygon
                    key={`polygon-${i}`}
                    points={poly.vertices.map(v => `${toSvgX(v.x)},${toSvgY(v.y)}`).join(" ")}
                    fill={poly.fill || "transparent"}
                    stroke={poly.stroke || defaultLineColor}
                    strokeWidth={poly.strokeWidth || 1}
                    opacity={poly.opacity ?? 1}
                />
            ))}

            {/* Linee */}
            {lines.map((line, i) => {
                const endpoints = getLineEndpoints(line);
                if (!endpoints) return null;

                const lineColor = line.color || defaultLineColor;
                const strokeWidth = line.strokeWidth || 2;
                const dasharray = getLineStrokeDasharray(line.style || "solid");

                return (
                    <g key={`line-${i}`}>
                        <line
                            x1={endpoints.x1}
                            y1={endpoints.y1}
                            x2={endpoints.x2}
                            y2={endpoints.y2}
                            stroke={lineColor}
                            strokeWidth={strokeWidth}
                            strokeDasharray={dasharray}
                        />
                        {line.label && (
                            <text
                                x={(endpoints.x1 + endpoints.x2) / 2 + 10}
                                y={(endpoints.y1 + endpoints.y2) / 2 - 10}
                                fontSize={12}
                                fill={lineColor}
                            >
                                {line.label}
                            </text>
                        )}
                    </g>
                );
            })}

            {/* Funzioni */}
            {functions.map((func, i) => {
                const path = generateFunctionPath(func);
                const funcColor = func.color || defaultFunctionColor;
                const strokeWidth = func.strokeWidth || 2;
                const dasharray = getLineStrokeDasharray(func.style || "solid");

                return (
                    <g key={`function-${i}`}>
                        <path
                            d={path}
                            fill="none"
                            stroke={funcColor}
                            strokeWidth={strokeWidth}
                            strokeDasharray={dasharray}
                        />
                        {func.label && (
                            <text
                                x={width - padding.right - 50}
                                y={padding.top + 20 + i * 20}
                                fontSize={12}
                                fill={funcColor}
                            >
                                {func.label}
                            </text>
                        )}
                    </g>
                );
            })}

            {/* Archi */}
            {arcs.map((arc, i) => {
                const cx = toSvgX(arc.center.x);
                const cy = toSvgY(arc.center.y);
                // Raggio in pixel (scala x)
                const radiusPx = (arc.radius / (xMax - xMin)) * drawWidth;

                const path = buildArcPath(cx, cy, radiusPx, arc.startAngle, arc.endAngle);

                // Posizione label: circa sulla bisettrice dell'arco (più naturale e "centrata")
                const midAngle = (arc.startAngle + arc.endAngle) / 2;
                const labelPos = polarToCartesian(cx, cy, radiusPx * 0.85, midAngle);

                return (
                    <g key={`arc-${i}`}>
                        <path
                            d={path}
                            fill={arc.fill || "none"}
                            stroke={arc.color || defaultLineColor}
                            strokeWidth={arc.strokeWidth || 2}
                        />
                        {arc.label && (
                            <text
                                x={labelPos.x + 4}
                                y={labelPos.y - 4}
                                fontSize={11}
                                fill={arc.color || defaultLineColor}
                            >
                                {arc.label}
                            </text>
                        )}
                    </g>
                );
            })}

            {/* Vettori */}
            {vectors.map((vec, i) => {
                const x1 = toSvgX(vec.origin.x);
                const y1 = toSvgY(vec.origin.y);
                const x2 = toSvgX(vec.end.x);
                const y2 = toSvgY(vec.end.y);
                const vecColor = vec.color || defaultPointColor;

                // Punto della freccia leggermente prima della fine
                const dx = x2 - x1;
                const dy = y2 - y1;
                const len = Math.sqrt(dx * dx + dy * dy);
                const arrowLen = 12;
                const x2Adj = len > arrowLen ? x2 - (dx / len) * arrowLen : x2;
                const y2Adj = len > arrowLen ? y2 - (dy / len) * arrowLen : y2;

                return (
                    <g key={`vector-${i}`} style={{ color: vecColor }}>
                        <line
                            x1={x1}
                            y1={y1}
                            x2={x2Adj}
                            y2={y2Adj}
                            stroke={vecColor}
                            strokeWidth={vec.strokeWidth || 2}
                            markerEnd="url(#vector-arrowhead)"
                        />
                        {/* Punta freccia triangolare */}
                        <polygon
                            points={(() => {
                                const angle = Math.atan2(dy, dx);
                                const tipX = x2;
                                const tipY = y2;
                                const baseX1 = tipX - arrowLen * Math.cos(angle - 0.3);
                                const baseY1 = tipY - arrowLen * Math.sin(angle - 0.3);
                                const baseX2 = tipX - arrowLen * Math.cos(angle + 0.3);
                                const baseY2 = tipY - arrowLen * Math.sin(angle + 0.3);
                                return `${tipX},${tipY} ${baseX1},${baseY1} ${baseX2},${baseY2}`;
                            })()}
                            fill={vecColor}
                        />
                        {vec.label && (
                            <text
                                x={vec.labelPosition === "middle" ? (x1 + x2) / 2 + 10 : x2 + 10}
                                y={vec.labelPosition === "middle" ? (y1 + y2) / 2 - 10 : y2 - 10}
                                fontSize={12}
                                fontWeight="bold"
                                fill={vecColor}
                            >
                                {vec.label}
                            </text>
                        )}
                    </g>
                );
            })}

            {/* Asse X */}
            <line
                x1={padding.left}
                y1={originY}
                x2={width - padding.right}
                y2={originY}
                stroke={axisColor}
                strokeWidth={axisStrokeWidth}
            />

            {/* Asse Y */}
            <line
                x1={originX}
                y1={padding.top}
                x2={originX}
                y2={height - padding.bottom}
                stroke={axisColor}
                strokeWidth={axisStrokeWidth}
            />

            {/* Frecce assi */}
            {showArrows && (
                <>
                    {/* Freccia asse X (destra) */}
                    <polygon
                        points={`${width - padding.right},${originY} ${width - padding.right - arrowSize},${originY - arrowSize / 2} ${width - padding.right - arrowSize},${originY + arrowSize / 2}`}
                        fill={axisColor}
                    />
                    {/* Freccia asse Y (alto) */}
                    <polygon
                        points={`${originX},${padding.top} ${originX - arrowSize / 2},${padding.top + arrowSize} ${originX + arrowSize / 2},${padding.top + arrowSize}`}
                        fill={axisColor}
                    />
                </>
            )}

            {/* Tacche e label asse X */}
            {xTicks.map((t, i) => (
                <g key={`xtick-${i}`}>
                    <line
                        x1={toSvgX(t)}
                        y1={originY - tickSize / 2}
                        x2={toSvgX(t)}
                        y2={originY + tickSize / 2}
                        stroke={axisColor}
                        strokeWidth={1.5}
                    />
                    {showTickLabels && (
                        <text
                            x={toSvgX(t)}
                            y={originY + tickSize + 14}
                            textAnchor="middle"
                            fontSize={tickLabelFontSize}
                            fill={tickLabelColor}
                        >
                            {formatAxisLabel(t)}
                        </text>
                    )}
                </g>
            ))}

            {/* Tacche e label asse Y */}
            {yTicks.map((t, i) => (
                <g key={`ytick-${i}`}>
                    <line
                        x1={originX - tickSize / 2}
                        y1={toSvgY(t)}
                        x2={originX + tickSize / 2}
                        y2={toSvgY(t)}
                        stroke={axisColor}
                        strokeWidth={1.5}
                    />
                    {showTickLabels && (
                        <text
                            x={originX - tickSize - 6}
                            y={toSvgY(t) + 4}
                            textAnchor="end"
                            fontSize={tickLabelFontSize}
                            fill={tickLabelColor}
                        >
                            {formatAxisLabel(t)}
                        </text>
                    )}
                </g>
            ))}

            {/* Label origine */}
            {showOriginLabel && (
                <text
                    x={originX - 12}
                    y={originY + 18}
                    textAnchor="end"
                    fontSize={tickLabelFontSize}
                    fill={tickLabelColor}
                >
                    O
                </text>
            )}

            {/* Label assi */}
            {xAxisLabel && (
                <text
                    x={width - padding.right + 15}
                    y={originY + 5}
                    fontSize={14}
                    fontStyle="italic"
                    fill={axisColor}
                >
                    {xAxisLabel}
                </text>
            )}
            {yAxisLabel && (
                <text
                    x={originX + 8}
                    y={padding.top - 8}
                    fontSize={14}
                    fontStyle="italic"
                    fill={axisColor}
                >
                    {yAxisLabel}
                </text>
            )}

            {/* Punti */}
            {points.map((point, i) => renderPointMarker(point, i))}

            {/* Children custom */}
            {children}
        </svg>
    );
};

// ============================================================================
// PRESET CONFIGURATIONS
// ============================================================================

/** Preset per grafici di funzioni */
export const functionGraphPreset: Partial<CoordinatePlaneProps> = {
    showGrid: true,
    showMinorGrid: true,
    showArrows: true,
    defaultFunctionColor: "#2563eb",
};

/** Preset per geometria/vettori */
export const geometryPreset: Partial<CoordinatePlaneProps> = {
    showGrid: true,
    showMinorGrid: false,
    gridOpacity: 0.5,
    showArrows: true,
};

/** Preset minimalista */
export const minimalPreset: Partial<CoordinatePlaneProps> = {
    showGrid: false,
    showMinorGrid: false,
    showArrows: true,
    showTickLabels: false,
    xAxisLabel: "",
    yAxisLabel: "",
    showOriginLabel: false,
};

/** Preset per limiti */
export const limitsPreset: Partial<CoordinatePlaneProps> = {
    showGrid: true,
    gridOpacity: 0.4,
    showMinorGrid: false,
    defaultFunctionColor: "#059669",
    defaultLineColor: "#dc2626",
};

// ============================================================================
// HOOK per trasformazioni (utile per children custom)
// ============================================================================

export function useCoordinateTransform(props: {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
    width: number;
    height: number;
    padding: { left: number; right: number; top: number; bottom: number };
}) {
    const { xMin, xMax, yMin, yMax, width, height, padding } = props;
    const drawWidth = width - padding.left - padding.right;
    const drawHeight = height - padding.top - padding.bottom;

    const toSvgX = (x: number) => padding.left + ((x - xMin) / (xMax - xMin)) * drawWidth;
    const toSvgY = (y: number) => padding.top + ((yMax - y) / (yMax - yMin)) * drawHeight;
    const toMathX = (svgX: number) => xMin + ((svgX - padding.left) / drawWidth) * (xMax - xMin);
    const toMathY = (svgY: number) => yMax - ((svgY - padding.top) / drawHeight) * (yMax - yMin);

    return { toSvgX, toSvgY, toMathX, toMathY };
}

export default CoordinatePlane;