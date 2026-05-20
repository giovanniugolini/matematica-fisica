import React, { useState, useRef, useCallback } from "react";
import { DemoContainer, CollapsiblePanel } from "../../components/ui";
import { Latex, DisplayMath } from "../../components/ui/Latex";

// SVG geometry
const W = 400;
const H = 400;
const CX = W / 2;
const CY = H / 2;
const WIRE_R = 24;
const FIELD_RADII = [52, 82, 112, 145];
const ARROWS_PER_CIRCLE = [4, 6, 6, 8];
const COMPASS_R = 26;
const CM_PER_PX = 0.12; // scale: 1 pixel = 0.12 cm

// B in μT = 20 * I[A] / r[cm]
function bFieldMicroT(I: number, r_cm: number): number {
    return (20 * I) / r_cm;
}

// Arrow head component pointing "up" before rotation transform
function ArrowHead({ x, y, angle, color }: { x: number; y: number; angle: number; color: string }) {
    return (
        <g transform={`translate(${x},${y}) rotate(${angle})`}>
            <polygon points="0,-7 5,5 -5,5" fill={color} opacity={0.85} />
        </g>
    );
}

export default function OerstedDemo() {
    const [currentA, setCurrentA] = useState(8);
    const [entrante, setEntrante] = useState(true); // true = × (into page), false = • (out of page)
    const [compassX, setCompassX] = useState(CX + 90);
    const [compassY, setCompassY] = useState(CY);
    const [dragging, setDragging] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);
    const dragOffset = useRef({ dx: 0, dy: 0 });

    // Distance and B field
    const ddx = compassX - CX;
    const ddy = compassY - CY;
    const distPx = Math.sqrt(ddx * ddx + ddy * ddy);
    const distCm = Math.max(distPx * CM_PER_PX, 0.5);
    const B_uT = bFieldMicroT(currentA, distCm);

    // Compass needle angle: tangent to field circle at compass position
    const radialAngleDeg = Math.atan2(ddy, ddx) * (180 / Math.PI);
    // N pole points in direction of B:
    // Entrante (×): CW field → B direction = radialAngle + 90° → needleAngleDeg = radialAngle + 180
    // Uscente (•): CCW field → B direction = radialAngle - 90° → needleAngleDeg = radialAngle
    const needleAngleDeg = entrante ? radialAngleDeg + 180 : radialAngleDeg;

    // Arrows on field circles
    const fieldColor = entrante ? "#2563eb" : "#dc2626";

    // Convert SVG coords from mouse/touch event
    function svgCoords(clientX: number, clientY: number): { x: number; y: number } {
        const svg = svgRef.current;
        if (!svg) return { x: clientX, y: clientY };
        const rect = svg.getBoundingClientRect();
        return {
            x: (clientX - rect.left) * (W / rect.width),
            y: (clientY - rect.top) * (H / rect.height),
        };
    }

    const handleMouseDownCompass = (e: React.MouseEvent) => {
        e.preventDefault();
        const { x, y } = svgCoords(e.clientX, e.clientY);
        dragOffset.current = { dx: x - compassX, dy: y - compassY };
        setDragging(true);
    };

    const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
        if (!dragging) return;
        const { x, y } = svgCoords(e.clientX, e.clientY);
        const nx = Math.max(COMPASS_R, Math.min(W - COMPASS_R, x - dragOffset.current.dx));
        const ny = Math.max(COMPASS_R, Math.min(H - COMPASS_R, y - dragOffset.current.dy));
        setCompassX(nx);
        setCompassY(ny);
    }, [dragging]);

    const handleMouseUp = useCallback(() => setDragging(false), []);

    const handleTouchStartCompass = (e: React.TouchEvent) => {
        e.preventDefault();
        const touch = e.touches[0];
        const { x, y } = svgCoords(touch.clientX, touch.clientY);
        dragOffset.current = { dx: x - compassX, dy: y - compassY };
        setDragging(true);
    };

    const handleTouchMove = useCallback((e: React.TouchEvent<SVGSVGElement>) => {
        if (!dragging) return;
        e.preventDefault();
        const touch = e.touches[0];
        const { x, y } = svgCoords(touch.clientX, touch.clientY);
        const nx = Math.max(COMPASS_R, Math.min(W - COMPASS_R, x - dragOffset.current.dx));
        const ny = Math.max(COMPASS_R, Math.min(H - COMPASS_R, y - dragOffset.current.dy));
        setCompassX(nx);
        setCompassY(ny);
    }, [dragging]);

    return (
        <DemoContainer title="Esperimento di Oersted: campo magnetico di un filo">

            {/* Wire direction toggle + current slider */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 600, color: "#334155", fontSize: 15 }}>Direzione corrente:</span>
                    <button
                        onClick={() => setEntrante(true)}
                        style={{
                            padding: "6px 16px", borderRadius: 8, border: "2px solid",
                            borderColor: entrante ? "#2563eb" : "#cbd5e1",
                            background: entrante ? "#2563eb" : "#f8fafc",
                            color: entrante ? "#fff" : "#475569",
                            fontWeight: 600, cursor: "pointer", fontSize: 15,
                        }}
                    >
                        × entrante (in pagina)
                    </button>
                    <button
                        onClick={() => setEntrante(false)}
                        style={{
                            padding: "6px 16px", borderRadius: 8, border: "2px solid",
                            borderColor: !entrante ? "#dc2626" : "#cbd5e1",
                            background: !entrante ? "#dc2626" : "#f8fafc",
                            color: !entrante ? "#fff" : "#475569",
                            fontWeight: 600, cursor: "pointer", fontSize: 15,
                        }}
                    >
                        • uscente (fuori pagina)
                    </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 600, color: "#334155", fontSize: 15 }}>
                        Corrente:
                    </span>
                    <input
                        type="range" min={1} max={20} step={1} value={currentA}
                        onChange={e => setCurrentA(Number(e.target.value))}
                        style={{ flex: 1, minWidth: 120, maxWidth: 220 }}
                    />
                    <span style={{
                        fontFamily: "monospace", fontSize: 16, fontWeight: 700,
                        color: "#0f172a", minWidth: 60,
                    }}>
                        I = {currentA} A
                    </span>
                </div>
            </div>

            {/* Main SVG */}
            <svg
                ref={svgRef}
                width="100%"
                viewBox={`0 0 ${W} ${H}`}
                style={{
                    display: "block",
                    margin: "0 auto",
                    maxWidth: W,
                    borderRadius: 14,
                    border: "1.5px solid #e2e8f0",
                    background: "#f0f4ff",
                    cursor: dragging ? "grabbing" : "default",
                    touchAction: "none",
                    userSelect: "none",
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
            >
                {/* Field circles */}
                {FIELD_RADII.map((r, i) => (
                    <circle
                        key={i}
                        cx={CX} cy={CY} r={r}
                        fill="none"
                        stroke={fieldColor}
                        strokeWidth={1.5}
                        opacity={0.35}
                    />
                ))}

                {/* Directional arrows on field circles */}
                {FIELD_RADII.flatMap((r, ri) => {
                    const n = ARROWS_PER_CIRCLE[ri];
                    return Array.from({ length: n }, (_, i) => {
                        const theta = (i / n) * 2 * Math.PI;
                        const ax = CX + r * Math.cos(theta);
                        const ay = CY + r * Math.sin(theta);
                        const thetaDeg = theta * (180 / Math.PI);
                        const arrowAngle = entrante ? thetaDeg + 180 : thetaDeg;
                        return (
                            <ArrowHead
                                key={`${ri}-${i}`}
                                x={ax} y={ay}
                                angle={arrowAngle}
                                color={fieldColor}
                            />
                        );
                    });
                })}

                {/* Dashed distance line */}
                <line
                    x1={CX} y1={CY}
                    x2={compassX} y2={compassY}
                    stroke="#94a3b8" strokeWidth={1.5}
                    strokeDasharray="5,4"
                    opacity={0.7}
                />

                {/* Distance label */}
                {distPx > 30 && (
                    <text
                        x={(CX + compassX) / 2 + (ddy > 0 ? -10 : 10)}
                        y={(CY + compassY) / 2 + (ddx > 0 ? -8 : 8)}
                        textAnchor="middle"
                        fill="#475569"
                        fontSize={12}
                        fontFamily="monospace"
                        fontWeight={600}
                    >
                        r = {distCm.toFixed(1)} cm
                    </text>
                )}

                {/* Wire cross-section */}
                <circle cx={CX} cy={CY} r={WIRE_R} fill="#fbbf24" stroke="#d97706" strokeWidth={2.5} />
                {entrante ? (
                    <>
                        <line x1={CX - 11} y1={CY - 11} x2={CX + 11} y2={CY + 11}
                            stroke="#1e293b" strokeWidth={3.5} strokeLinecap="round" />
                        <line x1={CX + 11} y1={CY - 11} x2={CX - 11} y2={CY + 11}
                            stroke="#1e293b" strokeWidth={3.5} strokeLinecap="round" />
                    </>
                ) : (
                    <circle cx={CX} cy={CY} r={8} fill="#1e293b" />
                )}
                <text x={CX} y={CY + WIRE_R + 14} textAnchor="middle"
                    fill="#475569" fontSize={11} fontWeight={600}>
                    filo
                </text>

                {/* Draggable compass */}
                <g
                    onMouseDown={handleMouseDownCompass}
                    onTouchStart={handleTouchStartCompass}
                    style={{ cursor: "grab" }}
                >
                    {/* Shadow */}
                    <circle cx={compassX + 2} cy={compassY + 2} r={COMPASS_R}
                        fill="rgba(0,0,0,0.12)" />
                    {/* Body */}
                    <circle cx={compassX} cy={compassY} r={COMPASS_R}
                        fill="white" stroke="#94a3b8" strokeWidth={2} />
                    {/* N/S/E/O marks */}
                    {[
                        { label: "N", angle: needleAngleDeg },
                        { label: "S", angle: needleAngleDeg + 180 },
                    ].map(({ label, angle }) => {
                        const rad = (angle - 90) * (Math.PI / 180);
                        return (
                            <text
                                key={label}
                                x={compassX + (COMPASS_R - 9) * Math.cos(rad)}
                                y={compassY + (COMPASS_R - 9) * Math.sin(rad) + 4}
                                textAnchor="middle"
                                fontSize={9}
                                fontWeight={700}
                                fill={label === "N" ? "#dc2626" : "#1e293b"}
                            >
                                {label}
                            </text>
                        );
                    })}
                    {/* Needle - red half (N pole, points toward N) */}
                    {(() => {
                        const rad = (needleAngleDeg - 90) * (Math.PI / 180);
                        const rN = COMPASS_R - 7;
                        const rS = COMPASS_R - 7;
                        return (
                            <>
                                <line
                                    x1={compassX}
                                    y1={compassY}
                                    x2={compassX + rN * Math.cos(rad)}
                                    y2={compassY + rN * Math.sin(rad)}
                                    stroke="#dc2626"
                                    strokeWidth={4}
                                    strokeLinecap="round"
                                />
                                <line
                                    x1={compassX}
                                    y1={compassY}
                                    x2={compassX - rS * Math.cos(rad)}
                                    y2={compassY - rS * Math.sin(rad)}
                                    stroke="#1e293b"
                                    strokeWidth={4}
                                    strokeLinecap="round"
                                />
                            </>
                        );
                    })()}
                    {/* Center pivot */}
                    <circle cx={compassX} cy={compassY} r={3.5} fill="#475569" />
                    {/* Drag hint text */}
                    <text x={compassX} y={compassY + COMPASS_R + 14}
                        textAnchor="middle" fontSize={10} fill="#64748b">
                        trascina
                    </text>
                </g>

                {/* Scale bar (bottom-left) */}
                <g transform={`translate(12, ${H - 28})`}>
                    <line x1={0} y1={0} x2={Math.round(1 / CM_PER_PX * 5)} y2={0}
                        stroke="#64748b" strokeWidth={2} />
                    <line x1={0} y1={-4} x2={0} y2={4} stroke="#64748b" strokeWidth={1.5} />
                    <line x1={Math.round(1 / CM_PER_PX * 5)} y1={-4}
                        x2={Math.round(1 / CM_PER_PX * 5)} y2={4}
                        stroke="#64748b" strokeWidth={1.5} />
                    <text x={Math.round(1 / CM_PER_PX * 5) / 2} y={-8}
                        textAnchor="middle" fontSize={10} fill="#64748b">
                        5 cm
                    </text>
                </g>
            </svg>

            {/* B field readout */}
            <div style={{
                marginTop: 14,
                padding: "12px 18px",
                background: "#fff",
                borderRadius: 10,
                border: "1.5px solid #e2e8f0",
                display: "flex",
                flexWrap: "wrap",
                gap: 20,
                alignItems: "center",
                justifyContent: "center",
            }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 2 }}>
                        Distanza dal filo
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "monospace", color: "#0f172a" }}>
                        r = {distCm.toFixed(1)} cm
                    </div>
                </div>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 2 }}>
                        Corrente
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "monospace", color: "#0f172a" }}>
                        I = {currentA} A
                    </div>
                </div>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 2 }}>
                        Campo magnetico
                    </div>
                    <div style={{
                        fontSize: 22, fontWeight: 700, fontFamily: "monospace",
                        color: fieldColor,
                    }}>
                        B = {B_uT.toFixed(1)} μT
                    </div>
                </div>
            </div>

            {/* Formula panel */}
            <CollapsiblePanel title="Formula e teoria">
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                        <p style={{ fontWeight: 600, margin: "0 0 6px", color: "#334155" }}>
                            Campo magnetico generato da un filo rettilineo infinito:
                        </p>
                        <DisplayMath>
                            {"B = \\frac{\\mu_0 I}{2\\pi r}"}
                        </DisplayMath>
                        <ul style={{ color: "#475569", lineHeight: 1.8, marginTop: 8 }}>
                            <li><Latex>{"\\mu_0 = 4\\pi \\times 10^{-7}\\,\\text{T}\\cdot\\text{m/A}"}</Latex> (permeabilità del vuoto)</li>
                            <li><Latex>{"I"}</Latex> = intensità di corrente [A]</li>
                            <li><Latex>{"r"}</Latex> = distanza dal filo [m]</li>
                        </ul>
                        <p style={{ color: "#475569", marginTop: 8 }}>
                            In forma pratica: <Latex>{"B\\,[\\mu\\text{T}] = \\dfrac{20 \\cdot I\\,[\\text{A}]}{r\\,[\\text{cm}]}"}</Latex>
                        </p>
                    </div>

                    <div>
                        <p style={{ fontWeight: 600, margin: "0 0 6px", color: "#334155" }}>
                            Regola della mano destra (o della vite di Maxwell):
                        </p>
                        <div style={{
                            background: "#f8fafc", borderRadius: 8, padding: "10px 14px",
                            border: "1px solid #e2e8f0", color: "#334155", lineHeight: 1.7,
                        }}>
                            <div style={{ marginBottom: 6 }}>
                                <strong style={{ color: "#dc2626" }}>× corrente entrante</strong>
                                {" → "}le linee di campo girano in senso <strong>orario</strong>
                            </div>
                            <div>
                                <strong style={{ color: "#2563eb" }}>• corrente uscente</strong>
                                {" → "}le linee di campo girano in senso <strong>antiorario</strong>
                            </div>
                        </div>
                        <p style={{ color: "#475569", marginTop: 8, lineHeight: 1.6 }}>
                            Il polo nord dell'ago della bussola si orienta nella direzione del campo <Latex>{"\\vec{B}"}</Latex>,
                            cioè tangente alle linee di campo.
                        </p>
                    </div>
                </div>
            </CollapsiblePanel>
        </DemoContainer>
    );
}
