/**
 * ForzeDemo - Le Forze
 *
 * Tab: Le Forze (generale) | Forza Peso | Forza Elastica | Forza d'Attrito
 */

import React, { useState, useMemo } from "react";

import {
    DemoContainer,
    InfoBox,
    useBreakpoint,
    ResponsiveGrid,
    CollapsiblePanel,
} from "../../components/ui";

// ============ TIPI ============

interface Planet {
    name: string;
    g: number;
    color: string;
    icon: string;
    radius: number;
}

interface ForceExample {
    name: string;
    val: string;
}

interface MassPreset {
    label: string;
    mass: number;
    icon: string;
}

type ForceTab = "forze" | "peso" | "elastica" | "attrito";
type ForceType = "contatto" | "distanza";

// ============ COSTANTI ============

const PLANETS: Planet[] = [
    { name: "Mercurio", g: 3.7, color: "#9e9e9e", icon: "☿", radius: 18 },
    { name: "Venere", g: 8.87, color: "#e8a735", icon: "♀", radius: 22 },
    { name: "Terra", g: 9.81, color: "#4a90d9", icon: "🜨", radius: 24 },
    { name: "Luna", g: 1.62, color: "#bbb", icon: "☽", radius: 14 },
    { name: "Marte", g: 3.69, color: "#c1440e", icon: "♂", radius: 20 },
    { name: "Giove", g: 24.79, color: "#c4a46c", icon: "♃", radius: 38 },
    { name: "Saturno", g: 10.44, color: "#d4b876", icon: "♄", radius: 34 },
    { name: "Urano", g: 8.69, color: "#5bb5a6", icon: "♅", radius: 28 },
    { name: "Nettuno", g: 11.15, color: "#3f54ba", icon: "♆", radius: 27 },
];

const FORCE_EXAMPLES: ForceExample[] = [
    { name: "Motori navicella", val: "3,1 × 10⁷" },
    { name: "Locomotiva", val: "2,5 × 10⁵" },
    { name: "Motore jet", val: "7,5 × 10⁴" },
    { name: "Automobile", val: "7,0 × 10³" },
    { name: "Peso adulto", val: "7,0 × 10²" },
    { name: "Peso mela", val: "1,0 × 10⁰" },
    { name: "Peso formica", val: "1,0 × 10⁻³" },
];

const MASS_PRESETS: MassPreset[] = [
    { label: "Mela", mass: 0.1, icon: "🍎" },
    { label: "Libro", mass: 0.5, icon: "📕" },
    { label: "Persona", mass: 70, icon: "🧑" },
    { label: "Auto", mass: 1200, icon: "🚗" },
    { label: "Perseverance", mass: 1025, icon: "🤖" },
];

const TAB_CONFIG: { id: ForceTab; label: string; mobileLabel: string; disabled?: boolean }[] = [
    { id: "forze", label: "Le Forze", mobileLabel: "Forze" },
    { id: "peso", label: "Forza Peso", mobileLabel: "Peso" },
    { id: "elastica", label: "Forza Elastica", mobileLabel: "Elastica" },
    { id: "attrito", label: "Forza d'Attrito", mobileLabel: "Attrito" },
];

// ============ HELPER: SLIDER CON FILL ============

function sliderFillStyle(val: number, min: number, max: number, color: string): React.CSSProperties {
    const pct = ((val - min) / (max - min)) * 100;
    return {
        width: "100%", height: 8, borderRadius: 4,
        appearance: "none" as const, outline: "none", cursor: "pointer",
        background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, #e2e8f0 ${pct}%, #e2e8f0 100%)`,
    };
}

// ============ DINAMOMETRO SVG ============

function Dynamometer({ mass, numWeights, width }: { mass: number; numWeights?: number; width: number }) {
    const force = mass * 9.81;
    const maxForce = 30;
    const SVG_H = 310;
    const numCoils = 8;
    const coilWidth = 13;
    const springTop = 48;

    const springRestBottom = springTop + 80;
    const maxExtensionPx = 100;
    const extensionPx = (Math.min(force, maxForce) / maxForce) * maxExtensionPx;
    const springBottom = springRestBottom + extensionPx;

    const scaleZeroY = springRestBottom;
    const scaleMaxY = springRestBottom + maxExtensionPx;
    const scaleLen = scaleMaxY - scaleZeroY;
    const numMainTicks = 6;

    const springPath = useMemo(() => {
        let d = `M 50 ${springTop}`;
        const ch = (springBottom - springTop) / numCoils;
        for (let i = 0; i < numCoils; i++) {
            const y1 = springTop + i * ch + ch * 0.25;
            const y2 = springTop + i * ch + ch * 0.75;
            d += ` L ${50 + coilWidth} ${y1} L ${50 - coilWidth} ${y2}`;
        }
        d += ` L 50 ${springBottom}`;
        return d;
    }, [springBottom]);

    const weightW = 22;
    const weightH = 16;
    const hookLen = 6;
    // Quanti blocchetti discreti disegnare (0 se massa personalizzata)
    const nBlocks = numWeights ?? 0;
    const isCustom = numWeights === undefined || numWeights === null;

    return (
        <svg viewBox={`0 0 100 ${SVG_H}`} style={{ width, height: SVG_H * (width / 100), display: "block", margin: "0 auto" }}>
            <line x1="50" y1="5" x2="50" y2="12" stroke="#888" strokeWidth="1.5" />
            <circle cx="50" cy="4" r="2" fill="none" stroke="#888" strokeWidth="1.2" />

            <rect x="30" y="12" width="40" height="24" rx="4" fill="#4a6fa5" stroke="#3d5f8f" strokeWidth="1" />
            <rect x="36" y="15" width="28" height="18" rx="2" fill="#1a2a3a" />
            <text x="50" y="27" textAnchor="middle" fill="#4fd1c5" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                {force.toFixed(1)}
            </text>
            <text x="50" y="34" textAnchor="middle" fill="#7ec8c0" fontSize="4.5" fontFamily="monospace">{"N"}</text>

            <path d={springPath} fill="none" stroke="#e05a3a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

            {/* === SCALA FISSA ANALOGICA === */}
            <line x1="76" y1={scaleZeroY - 4} x2="76" y2={scaleMaxY + 4} stroke="#cbd5e1" strokeWidth="0.6" />
            {Array.from({ length: numMainTicks + 1 }, (_, i) => {
                const val = (maxForce / numMainTicks) * i;
                const y = scaleZeroY + (i / numMainTicks) * scaleLen;
                return (
                    <g key={"maj" + i}>
                        <line x1="68" y1={y} x2="76" y2={y} stroke="#94a3b8" strokeWidth="0.8" />
                        <text x="81" y={y + 2} fill="#94a3b8" fontSize="5" fontFamily="monospace">{val.toFixed(0)}</text>
                    </g>
                );
            })}
            {Array.from({ length: numMainTicks * 5 + 1 }, (_, i) => {
                if (i % 5 === 0) return null;
                const y = scaleZeroY + (i / (numMainTicks * 5)) * scaleLen;
                return <line key={"min" + i} x1="72" y1={y} x2="76" y2={y} stroke="#ddd" strokeWidth="0.4" />;
            })}
            {force > 0 && (
                <polygon points={`67,${springBottom - 2.5} 67,${springBottom + 2.5} 62,${springBottom}`} fill="#e05a3a" />
            )}

            {/* === GANCIO INFERIORE === */}
            <line x1="50" y1={springBottom} x2="50" y2={springBottom + hookLen} stroke="#888" strokeWidth="1.2" />
            {mass === 0 && (
                <circle cx="50" cy={springBottom + hookLen + 2} r="2" fill="none" stroke="#888" strokeWidth="1" />
            )}

            {/* === PESI DISCRETI (1kg ciascuno) === */}
            {!isCustom && Array.from({ length: nBlocks }, (_, i) => {
                const wy = springBottom + hookLen + i * (weightH + 3);
                return (
                    <g key={"w" + i}>
                        {i === 0 && (
                            <line x1="50" y1={springBottom + hookLen} x2="50" y2={wy + 1} stroke="#888" strokeWidth="0.8" />
                        )}
                        <rect x={50 - weightW / 2} y={wy} width={weightW} height={weightH} rx="2"
                              fill="#4a6fa5" stroke="#3d5f8f" strokeWidth="1" />
                        <text x="50" y={wy + weightH / 2 + 3} textAnchor="middle" fill="#fff" fontSize="6" fontFamily="monospace" fontWeight="bold">
                            {"1 kg"}
                        </text>
                        {i < nBlocks - 1 && (
                            <line x1="50" y1={wy + weightH} x2="50" y2={wy + weightH + 3} stroke="#888" strokeWidth="0.8" />
                        )}
                    </g>
                );
            })}

            {/* === BLOCCO MASSA PERSONALIZZATA === */}
            {isCustom && mass > 0 && (() => {
                const bw = 26;
                const bh = 20;
                const by = springBottom + hookLen;
                return (
                    <g>
                        <rect x={50 - bw / 2} y={by} width={bw} height={bh} rx="3" fill="#4a6fa5" stroke="#3d5f8f" strokeWidth="1" />
                        <text x="50" y={by + bh / 2 + 2} textAnchor="middle" fill="#fff" fontSize="5.5" fontFamily="monospace" fontWeight="bold">
                            {mass < 10 ? mass.toFixed(1) : mass.toFixed(0)}
                        </text>
                        <text x="50" y={by + bh / 2 + 8} textAnchor="middle" fill="#c0d0e0" fontSize="4" fontFamily="monospace">{"kg"}</text>
                    </g>
                );
            })()}

            {/* === FRECCIA P === */}
            {mass > 0 && (() => {
                const bottomY = isCustom
                    ? springBottom + hookLen + 20
                    : springBottom + hookLen + nBlocks * (weightH + 3) - 3;
                return (
                    <>
                        <defs>
                            <marker id="arrowP" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                                <path d="M0,0 L8,3 L0,6" fill="#e05a3a" />
                            </marker>
                        </defs>
                        <line x1="50" y1={bottomY} x2="50" y2={bottomY + 18} stroke="#e05a3a" strokeWidth="2" markerEnd="url(#arrowP)" />
                        <text x="50" y={bottomY + 30} textAnchor="middle" fill="#e05a3a" fontSize="8" fontWeight="bold" fontStyle="italic">{"P"}</text>
                    </>
                );
            })()}
        </svg>
    );
}

// ============ RISULTANTE DI DUE FORZE ============

function ForceVectorDemo({ isMobile }: { isMobile: boolean }) {
    const [f1, setF1] = useState<number>(30);
    const [f2, setF2] = useState<number>(40);
    const [angle, setAngle] = useState<number>(90);

    const aRad = (angle * Math.PI) / 180;
    const rx = f1 + f2 * Math.cos(aRad);
    const ry = f2 * Math.sin(aRad);
    const R = Math.sqrt(rx * rx + ry * ry);
    const theta = Math.atan2(ry, rx) * (180 / Math.PI);

    const svgSize = isMobile ? 260 : 300;
    const sc = svgSize / 140;
    const ox = svgSize / 2, oy = svgSize / 2;

    const sliders = [
        { label: "F₁", val: f1, set: setF1, color: "#3b82f6", unit: " N", min: 5, max: 60 },
        { label: "F₂", val: f2, set: setF2, color: "#f59e0b", unit: " N", min: 5, max: 60 },
        { label: "Angolo θ", val: angle, set: setAngle, color: "#64748b", unit: "°", min: 0, max: 180 },
    ];

    return (
        <div style={{ display: "grid", gap: 14 }}>
            <div style={{
                padding: "12px 16px", background: "#f0f7ff", borderRadius: 10,
                border: "1px solid #d0e3f7", fontSize: 13, color: "#2c5282", lineHeight: 1.7,
            }}>
                👉 La forza totale o <strong>risultante</strong> è la somma vettoriale delle singole forze. Quando due forze formano un angolo, si usa la <strong>regola del parallelogramma</strong>.
            </div>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
                <svg viewBox={`0 0 ${svgSize} ${svgSize}`}
                     style={{ width: svgSize, height: svgSize, display: "block", background: "#fafbfc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                    {Array.from({ length: Math.floor(svgSize / 20) + 1 }, (_, i) => (
                        <g key={i}>
                            <line x1={i * 20} y1={0} x2={i * 20} y2={svgSize} stroke="#f0f0f0" strokeWidth={0.5} />
                            <line x1={0} y1={i * 20} x2={svgSize} y2={i * 20} stroke="#f0f0f0" strokeWidth={0.5} />
                        </g>
                    ))}
                    <line x1={ox} y1={10} x2={ox} y2={svgSize - 10} stroke="#ddd" strokeWidth={1} />
                    <line x1={10} y1={oy} x2={svgSize - 10} y2={oy} stroke="#ddd" strokeWidth={1} />
                    <line x1={ox + f1 * sc} y1={oy} x2={ox + rx * sc} y2={oy - ry * sc} stroke="#ccc" strokeWidth={0.8} strokeDasharray="4,3" />
                    <line x1={ox + f2 * Math.cos(aRad) * sc} y1={oy - f2 * Math.sin(aRad) * sc} x2={ox + rx * sc} y2={oy - ry * sc} stroke="#ccc" strokeWidth={0.8} strokeDasharray="4,3" />
                    <defs>
                        <marker id="aF1" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#3b82f6" /></marker>
                        <marker id="aF2" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#f59e0b" /></marker>
                        <marker id="aR" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><path d="M0,0 L10,3.5 L0,7" fill="#dc2626" /></marker>
                    </defs>
                    <line x1={ox} y1={oy} x2={ox + f1 * sc} y2={oy} stroke="#3b82f6" strokeWidth={2.5} markerEnd="url(#aF1)" />
                    <text x={ox + f1 * sc / 2} y={oy + 16} textAnchor="middle" fill="#3b82f6" fontSize="12" fontWeight="bold">{"F₁"}</text>
                    <line x1={ox} y1={oy} x2={ox + f2 * Math.cos(aRad) * sc} y2={oy - f2 * Math.sin(aRad) * sc} stroke="#f59e0b" strokeWidth={2.5} markerEnd="url(#aF2)" />
                    <text x={ox + f2 * Math.cos(aRad) * sc / 2 - 14} y={oy - f2 * Math.sin(aRad) * sc / 2 - 6} fill="#f59e0b" fontSize="12" fontWeight="bold">{"F₂"}</text>
                    <line x1={ox} y1={oy} x2={ox + rx * sc} y2={oy - ry * sc} stroke="#dc2626" strokeWidth={3} markerEnd="url(#aR)" />
                    <g transform={`translate(${ox + rx * sc / 2 + 12}, ${oy - ry * sc / 2})`}>
                        <text x={0} y={0} fill="#dc2626" fontSize="13" fontWeight="bold" fontStyle="italic">R</text>
                        <line x1={-1} y1={-12} x2={10} y2={-12} stroke="#dc2626" strokeWidth="1.5" markerEnd="url(#aR)" />
                    </g>
                    {angle > 0 && angle < 360 && (
                        <path d={`M ${ox + 22} ${oy} A 22 22 0 ${angle > 180 ? 1 : 0} 0 ${ox + 22 * Math.cos(aRad)} ${oy - 22 * Math.sin(aRad)}`}
                              fill="none" stroke="#94a3b8" strokeWidth={1} strokeDasharray="2,2" />
                    )}
                    <text x={ox + 28} y={oy - 6} fill="#94a3b8" fontSize="10">{"θ"}</text>
                </svg>

                <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1, minWidth: 180 }}>
                    {sliders.map((s, i) => (
                        <div key={i}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4, color: "#334155" }}>
                                <span style={{ fontWeight: 600 }}>{s.label}</span>
                                <span style={{ color: s.color, fontFamily: "monospace", fontWeight: 700 }}>{s.val}{s.unit}</span>
                            </div>
                            <input type="range" min={s.min} max={s.max} value={s.val}
                                   onChange={e => s.set(+e.target.value)}
                                   style={sliderFillStyle(s.val, s.min, s.max, s.color)} />
                        </div>
                    ))}
                    <div style={{
                        padding: "12px 14px", background: "#fef2f2", borderRadius: 10,
                        border: "1px solid #fecaca", marginTop: 4,
                    }}>
                        <div style={{ color: "#dc2626", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                            {"Risultante "}
                            <span style={{ textDecoration: "overline", fontStyle: "italic" }}>R</span>
                        </div>
                        <div style={{ fontFamily: "monospace", fontSize: 13, lineHeight: 2, color: "#334155" }}>
                            {"|"}<span style={{ fontStyle: "italic" }}>R</span>{"| = "}
                            <span>{"√"}</span>
                            <span style={{ textDecoration: "overline", textDecorationColor: "#334155" }}>
                                {"(F₁² + F₂² + 2F₁F₂cos θ)"}
                            </span>
                            <br />
                            {"|"}<span style={{ fontStyle: "italic" }}>R</span>{"| = "}<strong style={{ color: "#dc2626" }}>{R.toFixed(1)} N</strong><br />
                            <span style={{ fontStyle: "italic" }}>{"α"}</span>{" = "}<strong style={{ color: "#dc2626" }}>{theta.toFixed(1)}°</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============ GRAFICO BARRE SISTEMA SOLARE ============

function PlanetBarChart({ mass, isMobile }: { mass: number; isMobile: boolean }) {
    const maxW = mass * 24.79;
    return (
        <div style={{ display: "flex", gap: isMobile ? 4 : 6, alignItems: "flex-end", height: 180, padding: "0 4px" }}>
            {PLANETS.map((p, i) => {
                const w = mass * p.g;
                const barH = Math.max((w / maxW) * 150, 4);
                return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <div style={{ color: "#475569", fontFamily: "monospace", fontSize: isMobile ? 8 : 10, whiteSpace: "nowrap" }}>
                            {w < 100 ? w.toFixed(1) : w.toFixed(0)}
                        </div>
                        <div style={{
                            width: "100%", maxWidth: isMobile ? 28 : 36, height: barH,
                            borderRadius: "6px 6px 2px 2px",
                            background: `linear-gradient(to top, ${p.color}77, ${p.color}cc)`,
                            transition: "height 0.4s ease",
                        }} />
                        <div style={{ color: "#64748b", fontSize: isMobile ? 8 : 9, textAlign: "center", lineHeight: 1.2 }}>
                            {p.icon}<br /><span style={{ fontSize: isMobile ? 7 : 8 }}>{p.name}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ============ ESERCIZIO "PROVA TU" ============

function ExercisePeso() {
    const [showSolution, setShowSolution] = useState<boolean>(false);
    const [userAnswer, setUserAnswer] = useState<string>("");
    const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

    const checkAnswer = (): void => {
        const val = parseFloat(userAnswer.replace(",", "."));
        if (Math.abs(val - 8.0) < 0.2) setFeedback("correct");
        else if (!isNaN(val)) setFeedback("wrong");
    };

    const btnBase: React.CSSProperties = {
        padding: "8px 18px", borderRadius: 8, cursor: "pointer",
        fontWeight: 600, fontSize: 13, transition: "all 0.2s",
    };

    return (
        <div style={{
            padding: "16px 18px", background: "#f0fdf4", borderRadius: 12,
            border: "2px solid #86efac",
        }}>
            <div style={{
                display: "inline-block", background: "#16a34a", color: "#fff",
                padding: "3px 10px", borderRadius: 6, fontSize: 11,
                fontWeight: 700, letterSpacing: 1, marginBottom: 12,
            }}>
                PROVA TU
            </div>
            <p style={{ color: "#1a3a2a", margin: "0 0 14px", fontSize: 14, lineHeight: 1.75 }}>
                {"Su un pianeta lontano, un astronauta raccoglie una roccia. La roccia ha una massa di "}
                <strong style={{ color: "#1e40af" }}>{"5,00 kg"}</strong>{" e su quel particolare pianeta il suo peso è di "}
                <strong style={{ color: "#dc2626" }}>{"40,0 N"}</strong>{": qual è l'accelerazione di gravità sul pianeta?"}
            </p>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <input
                    type="text" placeholder="g = ? N/kg" value={userAnswer}
                    onChange={e => { setUserAnswer(e.target.value); setFeedback(null); }}
                    onKeyDown={e => e.key === "Enter" && checkAnswer()}
                    style={{
                        padding: "8px 14px", borderRadius: 8, fontSize: 14, fontFamily: "monospace", width: 140,
                        border: `2px solid ${feedback === "correct" ? "#16a34a" : feedback === "wrong" ? "#dc2626" : "#e2e8f0"}`,
                        background: "#fff", color: "#0f172a", outline: "none",
                        transition: "border-color 0.2s",
                    }}
                />
                <button onClick={checkAnswer}
                        style={{ ...btnBase, background: "#3b82f6", color: "#fff", border: "none" }}>
                    Verifica
                </button>
                <button onClick={() => setShowSolution(!showSolution)}
                        style={{ ...btnBase, background: "#fff", color: "#64748b", border: "1px solid #cbd5e1" }}>
                    {showSolution ? "Nascondi" : "Soluzione"}
                </button>
            </div>

            {feedback === "correct" && (
                <div style={{ color: "#16a34a", fontSize: 13, fontWeight: 600, marginTop: 10 }}>{"✓ Corretto! g = 8,0 N/kg"}</div>
            )}
            {feedback === "wrong" && (
                <div style={{ color: "#dc2626", fontSize: 13, marginTop: 10 }}>{"✗ Riprova. Ricorda: P = mg, quindi g = P/m"}</div>
            )}

            {showSolution && (
                <div style={{ background: "#fff", borderRadius: 10, padding: 14, marginTop: 12, border: "1px solid #bbf7d0" }}>
                    <div style={{ fontFamily: "monospace", fontSize: 14, lineHeight: 2.2, color: "#334155" }}>
                        <div>{"P = m · g"}</div>
                        <div>{"g = P / m"}</div>
                        <div>{"g = 40,0 N / 5,00 kg"}</div>
                        <div style={{ color: "#16a34a", fontWeight: 700 }}>{"g = 8,0 N/kg"}</div>
                    </div>
                    <div style={{ marginTop: 8, color: "#16a34a", fontWeight: 600, fontSize: 13 }}>{"✓ La formula è verificata!"}</div>
                </div>
            )}
        </div>
    );
}

// ============ TAB: LE FORZE ============

function TabForze({ isMobile }: { isMobile: boolean }) {
    const [mass, setMass] = useState<number>(1);
    const [mode, setMode] = useState<"preset" | "custom">("preset");
    const [numWeights, setNumWeights] = useState<number>(1);
    const [forceType, setForceType] = useState<ForceType>("contatto");

    const activeMass = mode === "preset" ? numWeights : mass;
    const force = activeMass * 9.81;
    const dynWidth = isMobile ? 90 : 110;

    const DynamometerSection = (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <Dynamometer
                mass={activeMass}
                numWeights={mode === "preset" ? numWeights : undefined}
                width={dynWidth}
            />

            {/* Selezione modalità */}
            <div style={{ display: "flex", gap: 4, width: "100%" }}>
                {(["preset", "custom"] as const).map(m => (
                    <button key={m} onClick={() => setMode(m)} style={{
                        flex: 1, padding: "6px 8px", borderRadius: 6, cursor: "pointer",
                        fontSize: 11, fontWeight: 600, transition: "all 0.2s",
                        border: `2px solid ${mode === m ? "#3b82f6" : "#e2e8f0"}`,
                        background: mode === m ? "#eff6ff" : "#fff",
                        color: mode === m ? "#1e40af" : "#94a3b8",
                    }}>
                        {m === "preset" ? "Pesi 1 kg" : "Personalizzata"}
                    </button>
                ))}
            </div>

            {/* Bottoni pesi discreti */}
            {mode === "preset" && (
                <div style={{ display: "flex", gap: 5, justifyContent: "center", flexWrap: "wrap" }}>
                    {[0, 1, 2, 3].map(n => (
                        <button key={n} onClick={() => setNumWeights(n)} style={{
                            padding: "6px 10px", borderRadius: 8, cursor: "pointer",
                            fontSize: 11, fontWeight: 700, transition: "all 0.2s",
                            border: `2px solid ${numWeights === n ? "#3b82f6" : "#e2e8f0"}`,
                            background: numWeights === n ? "#eff6ff" : "#fff",
                            color: numWeights === n ? "#1e40af" : "#64748b",
                            minWidth: 36,
                        }}>
                            {n === 0 ? "0" : n + " kg"}
                        </button>
                    ))}
                </div>
            )}

            {/* Slider massa personalizzata */}
            {mode === "custom" && (
                <div style={{ width: "100%", maxWidth: 170 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3, color: "#475569" }}>
                        <span>{"Massa"}</span>
                        <span style={{ color: "#1e40af", fontFamily: "monospace", fontWeight: 700 }}>{mass.toFixed(1) + " kg"}</span>
                    </div>
                    <input type="range" min={0.1} max={3} step={0.1} value={mass}
                           onChange={e => setMass(+e.target.value)}
                           style={sliderFillStyle(mass, 0.1, 3, "#3b82f6")} />
                </div>
            )}

            {activeMass > 0 && (
                <div style={{
                    fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "#dc2626",
                    background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "5px 12px",
                    textAlign: "center",
                }}>
                    {"P = " + activeMass.toFixed(1) + " × 9,81 = " + force.toFixed(1) + " N"}
                </div>
            )}
        </div>
    );

    const ForceExplanation = (
        <div style={{ display: "grid", gap: 12 }}>
            <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.75 }}>
                {"Una forza è un'azione che un corpo esercita su un altro. Le forze modificano lo "}
                <strong style={{ color: "#1e40af" }}>{"stato di moto"}</strong>{" dei corpi o producono "}
                <strong style={{ color: "#1e40af" }}>{"deformazioni"}</strong>.
            </div>
            <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.75 }}>
                {"Ogni forza è una "}<strong style={{ color: "#d97706" }}>{"grandezza vettoriale"}</strong>{": ha un modulo (intensità), una direzione e un verso."}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
                {(["contatto", "distanza"] as ForceType[]).map(t => (
                    <button key={t} onClick={() => setForceType(t)} style={{
                        flex: 1, padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                        fontWeight: 600, fontSize: 13, transition: "all 0.2s ease",
                        border: `2px solid ${forceType === t ? "#3b82f6" : "#e2e8f0"}`,
                        background: forceType === t ? "#eff6ff" : "#fff",
                        color: forceType === t ? "#1e40af" : "#64748b",
                    }}>
                        {t === "contatto" ? "Per contatto" : "A distanza"}
                    </button>
                ))}
            </div>
            <div style={{
                padding: "12px 16px", background: "#f0f7ff", borderRadius: 10,
                border: "1px solid #d0e3f7", fontSize: 13, color: "#2c5282", lineHeight: 1.7,
            }}>
                {forceType === "contatto"
                    ? <>{"Colpire una palla con una racchetta, spingere un carrello, piantare un chiodo. Richiedono il "}<strong>{"contatto diretto"}</strong>{" tra i corpi."}</>
                    : <>{"La forza di gravità, la forza magnetica, la forza elettrica. Agiscono "}<strong>{"senza contatto"}</strong>{" tra i corpi coinvolti."}</>
                }
            </div>
        </div>
    );

    const ForceScale = (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {FORCE_EXAMPLES.map((f, i) => (
                <div key={i} style={{
                    flex: "1 1 80px", background: "#f8fafc", borderRadius: 8, padding: "8px 6px",
                    border: "1px solid #e2e8f0", textAlign: "center", minWidth: isMobile ? 75 : 85,
                }}>
                    <div style={{ color: "#64748b", fontSize: 9, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.6 }}>{f.name}</div>
                    <div style={{ color: "#1e40af", fontFamily: "monospace", fontSize: isMobile ? 12 : 14, fontWeight: 700 }}>{f.val}</div>
                    <div style={{ color: "#94a3b8", fontSize: 9 }}>N</div>
                </div>
            ))}
        </div>
    );

    const NewtonDef = (
        <div style={{
            padding: "12px 16px", background: "#f0f7ff", borderRadius: 10,
            border: "1px solid #d0e3f7", fontSize: 13, color: "#2c5282", lineHeight: 1.7,
        }}>
            <strong>{"📏 Il Newton (N)"}</strong>{" — Un newton è la forza che produce un allungamento della molla di un dinamometro uguale a quello prodotto da una massa appesa di "}<strong>{"1/9,81 kg"}</strong>{" (circa 102 g)."}
        </div>
    );

    return (
        <div style={{ display: "grid", gap: 14 }}>
            {isMobile ? (
                <>
                    <InfoBox title="💡 Che cos'è una forza?">{ForceExplanation}</InfoBox>
                    <InfoBox title="🔧 Dinamometro">{DynamometerSection}</InfoBox>
                </>
            ) : (
                <ResponsiveGrid columns={{ tablet: 2, desktop: 2 }} gap={14}>
                    <InfoBox title="💡 Che cos'è una forza?">{ForceExplanation}</InfoBox>
                    <InfoBox title="🔧 Dinamometro">{DynamometerSection}</InfoBox>
                </ResponsiveGrid>
            )}

            {isMobile ? (
                <CollapsiblePanel title="📊 Scala delle forze" defaultOpen={false}>
                    {ForceScale}
                </CollapsiblePanel>
            ) : (
                <InfoBox title="📊 Scala delle forze">{ForceScale}</InfoBox>
            )}

            {NewtonDef}

            <InfoBox title="📐 Risultante di due forze">
                <ForceVectorDemo isMobile={isMobile} />
            </InfoBox>
        </div>
    );
}

// ============ TAB: FORZA PESO ============

function TabPeso({ isMobile }: { isMobile: boolean }) {
    const [mass, setMass] = useState<number>(70);
    const [selectedPlanet, setSelectedPlanet] = useState<number>(2);
    const [comparePlanet, setComparePlanet] = useState<number>(3);

    const planet = PLANETS[selectedPlanet];
    const compare = PLANETS[comparePlanet];

    const FormulaCard = (
        <div style={{
            padding: "16px 20px", background: "#fef2f2", borderRadius: 12,
            border: "2px solid #fecaca", textAlign: "center",
        }}>
            <div style={{ fontSize: isMobile ? 28 : 34, fontWeight: 700, color: "#dc2626", fontFamily: "serif", fontStyle: "italic" }}>
                {"P = mg"}
            </div>
            <div style={{
                display: "flex", justifyContent: "center", gap: isMobile ? 16 : 28,
                marginTop: 10, fontSize: 13, color: "#64748b", flexWrap: "wrap",
            }}>
                <span><strong style={{ color: "#dc2626" }}>P</strong>{" = peso (N)"}</span>
                <span><strong style={{ color: "#1e40af" }}>m</strong>{" = massa (kg)"}</span>
                <span><strong style={{ color: "#d97706" }}>g</strong>{" = acc. gravità (N/kg)"}</span>
            </div>
        </div>
    );

    const MassSelector = (
        <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {MASS_PRESETS.map((p, i) => (
                    <button key={i} onClick={() => setMass(p.mass)} style={{
                        padding: "7px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13,
                        display: "flex", alignItems: "center", gap: 5, transition: "all 0.2s",
                        border: `2px solid ${mass === p.mass ? "#3b82f6" : "#e2e8f0"}`,
                        background: mass === p.mass ? "#eff6ff" : "#fff",
                        color: mass === p.mass ? "#1e40af" : "#475569",
                        fontWeight: mass === p.mass ? 700 : 400,
                    }}>
                        <span>{p.icon}</span> {p.label}
                        <span style={{ fontSize: 10, opacity: 0.6 }}>{p.mass} kg</span>
                    </button>
                ))}
            </div>
            <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4, color: "#334155" }}>
                    <span style={{ fontWeight: 600 }}>{"Massa personalizzata"}</span>
                    <span style={{ fontFamily: "monospace", color: "#1e40af", fontWeight: 700 }}>{mass} kg</span>
                </div>
                <input type="range" min={0.01} max={2000} step={mass < 10 ? 0.1 : 1}
                       value={mass} onChange={e => setMass(+e.target.value)}
                       style={sliderFillStyle(mass, 0.01, 2000, "#3b82f6")} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#94a3b8", marginTop: 3 }}>
                    <span>{"0,01 kg"}</span><span>{"2000 kg"}</span>
                </div>
            </div>
            <div style={{
                padding: "12px 16px", background: "#fffbeb", borderRadius: 10,
                border: "1px solid #fde68a", fontSize: 13, color: "#92400e", lineHeight: 1.7,
            }}>
                <strong>{"⚠️ Peso ≠ Massa"}</strong>
                <p style={{ margin: "8px 0 4px" }}>
                    {"La "}<strong style={{ color: "#1e40af" }}>{"massa"}</strong>{" è una proprietà intrinseca del corpo (kg). Resta invariata ovunque."}
                </p>
                <p style={{ margin: 0 }}>
                    {"Il "}<strong style={{ color: "#dc2626" }}>{"peso"}</strong>{" è una forza (N). Dipende dal valore di "}<em>g</em>{" e quindi dal corpo celeste."}
                </p>
            </div>
        </div>
    );

    const PlanetSelector = ({ idx, set }: { idx: number; set: (v: number) => void }) => {
        const p = PLANETS[idx];
        const w = mass * p.g;
        return (
            <div style={{ flex: 1, textAlign: "center" }}>
                <select value={idx} onChange={e => set(+e.target.value)} style={{
                    width: "100%", padding: 8, borderRadius: 8, border: "1px solid #e2e8f0",
                    background: "#f8fafc", color: "#334155", fontSize: 13, marginBottom: 10, outline: "none",
                }}>
                    {PLANETS.map((pl, i) => <option key={i} value={i}>{pl.icon + " " + pl.name}</option>)}
                </select>
                <div style={{
                    width: p.radius * 1.6, height: p.radius * 1.6, borderRadius: "50%", margin: "0 auto 8px",
                    background: `radial-gradient(circle at 35% 35%, ${p.color}dd, ${p.color}66)`,
                    boxShadow: `0 0 14px ${p.color}22`,
                }} />
                <div style={{ color: "#64748b", fontFamily: "monospace", fontSize: 12 }}>{"g = " + p.g + " N/kg"}</div>
                <div style={{ color: "#dc2626", fontFamily: "monospace", fontSize: isMobile ? 18 : 22, fontWeight: 700, margin: "4px 0" }}>
                    {(w < 100 ? w.toFixed(2) : w.toFixed(0)) + " N"}
                </div>
                <div style={{ color: "#94a3b8", fontSize: 11 }}>{"P = " + mass + " × " + p.g}</div>
            </div>
        );
    };

    const PlanetComparison = (
        <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "flex", gap: 14 }}>
                <PlanetSelector idx={selectedPlanet} set={setSelectedPlanet} />
                <PlanetSelector idx={comparePlanet} set={setComparePlanet} />
            </div>
            <div style={{ background: "#f8fafc", borderRadius: 10, padding: 12, border: "1px solid #e2e8f0", textAlign: "center" }}>
                <div style={{ color: "#64748b", fontSize: 12, marginBottom: 6 }}>{"Rapporto pesi"}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ color: planet.color, fontWeight: 700, fontSize: 13 }}>{planet.name}</span>
                    <div style={{ width: 80, height: 8, background: "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{
                            height: "100%", borderRadius: 4, transition: "width 0.3s ease",
                            width: `${(planet.g / Math.max(planet.g, compare.g)) * 100}%`,
                            background: planet.color,
                        }} />
                    </div>
                    <span style={{ color: "#475569", fontFamily: "monospace", fontSize: 13, fontWeight: 700 }}>
                        {(planet.g / compare.g).toFixed(2) + "×"}
                    </span>
                    <div style={{ width: 80, height: 8, background: "#e2e8f0", borderRadius: 4, overflow: "hidden", direction: "rtl" as const }}>
                        <div style={{
                            height: "100%", borderRadius: 4, transition: "width 0.3s ease",
                            width: `${(compare.g / Math.max(planet.g, compare.g)) * 100}%`,
                            background: compare.color,
                        }} />
                    </div>
                    <span style={{ color: compare.color, fontWeight: 700, fontSize: 13 }}>{compare.name}</span>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ display: "grid", gap: 14 }}>
            {FormulaCard}

            {isMobile ? (
                <>
                    <InfoBox title="⚖️ Scegli un oggetto">{MassSelector}</InfoBox>
                    <InfoBox title="🪐 Confronta pianeti">{PlanetComparison}</InfoBox>
                </>
            ) : (
                <ResponsiveGrid columns={{ tablet: 2, desktop: 2 }} gap={14}>
                    <InfoBox title="⚖️ Scegli un oggetto">{MassSelector}</InfoBox>
                    <InfoBox title="🪐 Confronta pianeti">{PlanetComparison}</InfoBox>
                </ResponsiveGrid>
            )}

            <InfoBox title={"📊 Peso di " + mass + " kg nel sistema solare"}>
                <PlanetBarChart mass={mass} isMobile={isMobile} />
            </InfoBox>

            <ExercisePeso />
        </div>
    );
}

// ============ TAB: FORZA ELASTICA ============

const FRICTION_MATERIALS = [
    { material: "Gomma su cemento (asciutto)", mud: 0.80, mus: 1.00 },
    { material: "Acciaio su acciaio",          mud: 0.57, mus: 0.74 },
    { material: "Vetro su vetro",              mud: 0.40, mus: 0.94 },
    { material: "Legno su pelle",              mud: 0.40, mus: 0.50 },
    { material: "Gomma su cemento (bagnato)",  mud: 0.25, mus: 0.30 },
    { material: "Sci sciolinati su neve",      mud: 0.05, mus: 0.10 },
    { material: "Articolazione ginocchio",     mud: 0.003, mus: 0.01 },
];

function SpringSVG({ k, x, isMobile }: { k: number; x: number; isMobile: boolean }) {
    const W = isMobile ? 300 : 420;
    const H = 140;
    const wallX = 30;
    const restX = wallX + 60;
    const isCompressed = x < 0;
    const maxExtRight = W - restX - 70;
    const maxExtLeft = restX - wallX - 16;
    const maxAllowed = isCompressed ? maxExtLeft : maxExtRight;
    const extPx = Math.min(Math.abs(x) * 300, maxAllowed);
    const tipX = isCompressed ? restX - extPx : restX + extPx;
    const numCoils = 7;
    const coilH = 12;
    const springY = H / 2;

    const force = k * Math.abs(x);

    const springStart = wallX + 6;
    const springEnd = tipX - 12;
    const springLen = springEnd - springStart;
    let path = `M ${springStart} ${springY}`;
    for (let i = 0; i < numCoils; i++) {
        const xm = springStart + ((i + 0.25) / numCoils) * springLen;
        const x2 = springStart + ((i + 0.75) / numCoils) * springLen;
        const x3 = springStart + ((i + 1) / numCoils) * springLen;
        path += ` L ${xm} ${springY - coilH} L ${x2} ${springY + coilH} L ${x3} ${springY}`;
    }

    const arrowColor = isCompressed ? "#7c3aed" : "#16a34a";

    // Lunghezza freccia: proporzionale allo spostamento visivo (extPx),
    // così anche con k piccoli le frecce sono ben visibili
    const maxArrowLen = W * 0.25;
    const arrowLen = x !== 0 ? Math.min(Math.max(extPx * 0.6, 14), maxArrowLen) : 0;

    // Forza elastica: opposta allo spostamento, dal lato molla del blocco
    const elX1 = isCompressed ? tipX + 12 : tipX - 12;
    const elX2 = isCompressed ? elX1 + arrowLen : elX1 - arrowLen;

    // Forza applicata: nella direzione dello spostamento, dal lato opposto alla molla
    const appX1 = isCompressed ? tipX - 12 : tipX + 12;
    const appX2 = isCompressed ? appX1 - arrowLen : appX1 + arrowLen;

    const forceLabel = "Fel = " + force.toFixed(1) + " N";
    const appLabel = "Fapp";
    const xLabel = "x = " + (x > 0 ? "+" : "") + x.toFixed(2) + " m";

    return (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H, display: "block", background: "#fafbfc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
            <defs>
                <marker id="aEl" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill={arrowColor} /></marker>
                <marker id="aApp" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#3b82f6" /></marker>
                <marker id="aDisp" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto"><path d="M0,0 L7,2.5 L0,5" fill="#64748b" /></marker>
            </defs>

            {/* Wall */}
            {Array.from({ length: 6 }, (_, i) => (
                <line key={i} x1={wallX} y1={i * 14} x2={wallX - 10} y2={i * 14 + 14} stroke="#94a3b8" strokeWidth={1.5} />
            ))}
            <line x1={wallX} y1={0} x2={wallX} y2={H} stroke="#64748b" strokeWidth={2} />

            {/* Equilibrium dashed line */}
            <line x1={restX} y1={10} x2={restX} y2={H - 10} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="4,3" />
            <text x={restX} y={8} textAnchor="middle" fill="#94a3b8" fontSize="8">{"eq"}</text>

            {/* Spring */}
            <path d={path} fill="none" stroke="#e05a3a" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

            {/* Mass block */}
            <rect x={tipX - 12} y={springY - 16} width={24} height={32} rx={4} fill="#4a6fa5" stroke="#3d5f8f" strokeWidth={1} />
            <text x={tipX} y={springY + 5} textAnchor="middle" fill="#fff" fontSize="9">{"m"}</text>

            {/* Ground line */}
            <line x1={wallX} y1={springY + 16} x2={W - 10} y2={springY + 16} stroke="#94a3b8" strokeWidth={1} strokeDasharray="3,2" />

            {/* Displacement arrow (x) */}
            {x !== 0 && (
                <>
                    <line x1={restX} y1={springY + 44}
                          x2={isCompressed ? tipX + 5 : tipX - 5} y2={springY + 44}
                          stroke="#64748b" strokeWidth={1.5}
                          markerEnd="url(#aDisp)" />
                    <text x={(restX + tipX) / 2} y={springY + 56} textAnchor="middle" fill="#64748b" fontSize="9" fontStyle="italic">
                        {xLabel}
                    </text>
                </>
            )}

            {/* FORZA ELASTICA — opposta allo spostamento */}
            {x !== 0 && arrowLen > 0 && (
                <>
                    <line x1={elX1} y1={springY - 24} x2={elX2} y2={springY - 24}
                          stroke={arrowColor} strokeWidth={2.5} markerEnd="url(#aEl)" />
                    <text x={(elX1 + elX2) / 2} y={springY - 28}
                          textAnchor="middle" fill={arrowColor} fontSize="8" fontWeight="bold">
                        {forceLabel}
                    </text>
                </>
            )}

            {/* FORZA APPLICATA — nella direzione dello spostamento */}
            {x !== 0 && arrowLen > 0 && (
                <>
                    <line x1={appX1} y1={springY + 24} x2={appX2} y2={springY + 24}
                          stroke="#3b82f6" strokeWidth={2.5} markerEnd="url(#aApp)" />
                    <text x={(appX1 + appX2) / 2} y={springY + 36}
                          textAnchor="middle" fill="#3b82f6" fontSize="8" fontWeight="bold">
                        {appLabel}
                    </text>
                </>
            )}

            {/* Legend */}
            <text x={8} y={H - 6} fill="#94a3b8" fontSize="7">
                {x > 0 ? "Allungamento" : x < 0 ? "Compressione" : "Equilibrio"}
            </text>
        </svg>
    );
}

function HookeChart({ k, x, isMobile }: { k: number; x: number; isMobile: boolean }) {
    const W = isMobile ? 240 : 300;
    const H = 180;
    const pad = { l: 40, r: 16, t: 16, b: 36 };
    const gW = W - pad.l - pad.r;
    const gH = H - pad.t - pad.b;
    const xMax = 0.5;
    // Asse Y fisso: fMax basato sulla costante elastica massima (200 N/m * 0.5 m)
    const fMax = 100;
    const toSvgX = (xv: number) => pad.l + (xv / xMax) * gW;
    const toSvgY = (fv: number) => pad.t + gH - (fv / fMax) * gH;
    const xTicks = [0, 0.1, 0.2, 0.3, 0.4, 0.5];
    const fTicks = [0, 25, 50, 75, 100];
    const currentX = Math.abs(x);
    const currentF = k * currentX;

    // Punto finale della retta F=kx (clampato se esce dall'area)
    const lineEndX = Math.min(xMax, fMax / k);
    const lineEndF = k * lineEndX;

    return (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W, height: H, display: "block" }}>
            {xTicks.map((v, i) => (
                <line key={"xg" + i} x1={toSvgX(v)} y1={pad.t} x2={toSvgX(v)} y2={H - pad.b} stroke="#f0f0f0" strokeWidth={0.8} />
            ))}
            {fTicks.map((v, i) => (
                <line key={"fg" + i} x1={pad.l} y1={toSvgY(v)} x2={W - pad.r} y2={toSvgY(v)} stroke="#f0f0f0" strokeWidth={0.8} />
            ))}
            <line x1={pad.l} y1={pad.t} x2={pad.l} y2={H - pad.b} stroke="#475569" strokeWidth={1.5} />
            <line x1={pad.l} y1={H - pad.b} x2={W - pad.r} y2={H - pad.b} stroke="#475569" strokeWidth={1.5} />
            <text x={W / 2} y={H - 4} textAnchor="middle" fill="#475569" fontSize="9" fontStyle="italic">{"x (m)"}</text>
            <text x={12} y={H / 2} textAnchor="middle" fill="#475569" fontSize="9" fontStyle="italic" transform={`rotate(-90, 12, ${H/2})`}>{"F (N)"}</text>
            {xTicks.map((v, i) => (
                <g key={"xt" + i}>
                    <line x1={toSvgX(v)} y1={H - pad.b} x2={toSvgX(v)} y2={H - pad.b + 4} stroke="#475569" strokeWidth={1} />
                    <text x={toSvgX(v)} y={H - pad.b + 13} textAnchor="middle" fill="#64748b" fontSize="7">{v.toFixed(1)}</text>
                </g>
            ))}
            {fTicks.map((v, i) => (
                <g key={"ft" + i}>
                    <line x1={pad.l - 4} y1={toSvgY(v)} x2={pad.l} y2={toSvgY(v)} stroke="#475569" strokeWidth={1} />
                    <text x={pad.l - 6} y={toSvgY(v) + 3} textAnchor="end" fill="#64748b" fontSize="7">{v}</text>
                </g>
            ))}
            {/* Retta F = kx — la pendenza cambia visivamente con k */}
            <line x1={toSvgX(0)} y1={toSvgY(0)} x2={toSvgX(lineEndX)} y2={toSvgY(lineEndF)} stroke="#16a34a" strokeWidth={2} />
            <text x={toSvgX(lineEndX) + 4} y={toSvgY(lineEndF) - 4} fill="#16a34a" fontSize="9" fontWeight="bold">{"F = " + k + "x"}</text>
            {/* Punto corrente */}
            {currentX > 0 && currentX <= xMax && currentF <= fMax && (
                <>
                    <line x1={toSvgX(currentX)} y1={H - pad.b} x2={toSvgX(currentX)} y2={toSvgY(currentF)} stroke="#dc2626" strokeWidth={1} strokeDasharray="3,2" />
                    <line x1={pad.l} y1={toSvgY(currentF)} x2={toSvgX(currentX)} y2={toSvgY(currentF)} stroke="#dc2626" strokeWidth={1} strokeDasharray="3,2" />
                    <circle cx={toSvgX(currentX)} cy={toSvgY(currentF)} r={4} fill="#dc2626" />
                    <text x={toSvgX(currentX) + 5} y={toSvgY(currentF) - 4} fill="#dc2626" fontSize="8" fontWeight="bold">{currentF.toFixed(1) + " N"}</text>
                </>
            )}
            {/* Indicazione se il punto esce dal grafico */}
            {currentX > 0 && currentF > fMax && (
                <text x={W / 2} y={pad.t + 12} textAnchor="middle" fill="#dc2626" fontSize="8">
                    {"F = " + currentF.toFixed(1) + " N (fuori scala)"}
                </text>
            )}
        </svg>
    );
}

function ExerciseElastica() {
    const [showSol, setShowSol] = useState(false);
    const [ans, setAns] = useState("");
    const [fb, setFb] = useState<"correct"|"wrong"|null>(null);
    const check = () => {
        const v = parseFloat(ans.replace(",","."));
        if (Math.abs(v - 85) < 2) setFb("correct");
        else if (!isNaN(v)) setFb("wrong");
    };
    const btnBase: React.CSSProperties = { padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 };
    return (
        <div style={{ padding: "16px 18px", background: "#f0fdf4", borderRadius: 12, border: "2px solid #86efac" }}>
            <div style={{ display: "inline-block", background: "#16a34a", color: "#fff", padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
                {"PROVA TU"}
            </div>
            <p style={{ color: "#1a3a2a", margin: "0 0 14px", fontSize: 14, lineHeight: 1.75 }}>
                {"Giulio sta giocando con una fionda: tirando l'elastico con una forza di "}
                <strong style={{ color: "#dc2626" }}>{"8,5 N"}</strong>{" riesce ad allungarlo di "}
                <strong style={{ color: "#1e40af" }}>{"10 cm"}</strong>{". Qual è la costante elastica dell'elastico?"}
            </p>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <input type="text" placeholder="k = ? N/m" value={ans} onChange={e => { setAns(e.target.value); setFb(null); }} onKeyDown={e => e.key === "Enter" && check()} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 14, fontFamily: "monospace", width: 140, border: `2px solid ${fb === "correct" ? "#16a34a" : fb === "wrong" ? "#dc2626" : "#e2e8f0"}`, background: "#fff", color: "#0f172a", outline: "none" }} />
                <button onClick={check} style={{ ...btnBase, background: "#3b82f6", color: "#fff", border: "none" }}>{"Verifica"}</button>
                <button onClick={() => setShowSol(!showSol)} style={{ ...btnBase, background: "#fff", color: "#64748b", border: "1px solid #cbd5e1" }}>{showSol ? "Nascondi" : "Soluzione"}</button>
            </div>
            {fb === "correct" && <div style={{ color: "#16a34a", fontSize: 13, fontWeight: 600, marginTop: 10 }}>{"✓ Corretto! k = 85 N/m"}</div>}
            {fb === "wrong" && <div style={{ color: "#dc2626", fontSize: 13, marginTop: 10 }}>{"✗ Riprova. Ricorda: F = kx, quindi k = F/x"}</div>}
            {showSol && (
                <div style={{ background: "#fff", borderRadius: 10, padding: 14, marginTop: 12, border: "1px solid #bbf7d0" }}>
                    <div style={{ fontFamily: "monospace", fontSize: 14, lineHeight: 2.2, color: "#334155" }}>
                        <div>{"F = k · x"}</div>
                        <div>{"k = F / x"}</div>
                        <div>{"x = 10 cm = 0,10 m"}</div>
                        <div>{"k = 8,5 N / 0,10 m"}</div>
                        <div style={{ color: "#16a34a", fontWeight: 700 }}>{"k = 85 N/m"}</div>
                    </div>
                </div>
            )}
        </div>
    );
}

function TabElastica({ isMobile }: { isMobile: boolean }) {
    const [k, setK] = useState<number>(50);
    const [x, setX] = useState<number>(0.20);
    const force = k * Math.abs(x);

    const FormulaCard = (
        <div style={{ padding: "14px 18px", background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", borderRadius: 12, border: "2px solid #86efac" }}>
            <div style={{ fontWeight: 700, color: "#15803d", fontSize: 14, marginBottom: 10 }}>{"Legge di Hooke"}</div>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ fontFamily: "monospace", fontSize: isMobile ? 16 : 20, fontWeight: 700, color: "#15803d" }}>
                    {"F = k · x"}
                </div>
                <div style={{ fontFamily: "monospace", fontSize: isMobile ? 14 : 17, fontWeight: 700, color: "#7c3aed" }}>
                    <span style={{ textDecoration: "overline", fontStyle: "italic" }}>F</span>
                    {" = \u2212k"}
                    <span style={{ textDecoration: "overline", fontStyle: "italic" }}>x</span>
                    {" "}
                    <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 400 }}>{"(forma vettoriale)"}</span>
                </div>
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: "#475569", lineHeight: 1.7 }}>
                {"Il segno "}<strong>{"−"}</strong>{" esprime che la forza elastica è sempre "}<strong>{"opposta allo spostamento"}</strong>{" dalla posizione di equilibrio."}
            </div>
            <div style={{ display: "flex", gap: 14, marginTop: 10, flexWrap: "wrap" }}>
                {[
                    { sym: "F", desc: "modulo della forza elastica", unit: "N", color: "#15803d" },
                    { sym: "k", desc: "costante elastica della molla", unit: "N/m", color: "#d97706" },
                    { sym: "x", desc: "allungamento o compressione", unit: "m", color: "#2563eb" },
                ].map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12, color: "#334155" }}>
                        <span style={{ fontStyle: "italic", fontWeight: 700, color: item.color, fontFamily: "monospace", fontSize: 14 }}>{item.sym}</span>
                        <span>{item.desc + " (" + item.unit + ")"}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    const Controls = (
        <div style={{ display: "grid", gap: 14 }}>
            <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4, color: "#334155" }}>
                    <span style={{ fontWeight: 600 }}>{"Costante elastica k"}</span>
                    <span style={{ color: "#d97706", fontFamily: "monospace", fontWeight: 700 }}>{k + " N/m"}</span>
                </div>
                <input type="range" min={10} max={200} step={5} value={k} onChange={e => setK(+e.target.value)} style={sliderFillStyle(k, 10, 200, "#d97706")} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
                    <span>{"10 N/m (molla morbida)"}</span><span>{"200 N/m (molla rigida)"}</span>
                </div>
            </div>
            <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4, color: "#334155" }}>
                    <span style={{ fontWeight: 600 }}>{"Spostamento x"}</span>
                    <span style={{ color: x >= 0 ? "#16a34a" : "#7c3aed", fontFamily: "monospace", fontWeight: 700 }}>
                        {(x >= 0 ? "+" : "") + x.toFixed(2) + " m (" + (x >= 0 ? "allungamento" : "compressione") + ")"}
                    </span>
                </div>
                <input type="range" min={-0.40} max={0.40} step={0.02} value={x} onChange={e => setX(+e.target.value)} style={sliderFillStyle(x, -0.40, 0.40, x >= 0 ? "#16a34a" : "#7c3aed")} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
                    <span>{"← Compressione"}</span><span>{"Allungamento →"}</span>
                </div>
            </div>
            <div style={{ padding: "12px 16px", background: "#fef2f2", borderRadius: 10, border: "1px solid #fecaca" }}>
                <div style={{ color: "#dc2626", fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{"Risultato"}</div>
                <div style={{ fontFamily: "monospace", fontSize: 13, lineHeight: 2, color: "#334155" }}>
                    {"F = k · |x| = " + k + " · " + Math.abs(x).toFixed(2) + " = "}
                    <strong style={{ color: "#dc2626" }}>{force.toFixed(1) + " N"}</strong>
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                    {"Direzione: opposta allo spostamento (" + (x >= 0 ? "← verso sinistra" : "→ verso destra") + ")"}
                </div>
            </div>
        </div>
    );

    const InfoLegge = (
        <div style={{ padding: "12px 16px", background: "#fffbeb", borderRadius: 10, border: "1px solid #fde68a", fontSize: 13, color: "#92400e", lineHeight: 1.7 }}>
            <strong>{"📌 Nota importante"}</strong>
            <p style={{ margin: "8px 0 0" }}>
                {"La legge di Hooke è "}<strong>{"empirica"}</strong>{", non universale. Vale per allungamenti e compressioni piccoli. Oltre un certo limite, la molla si deforma permanentemente. Si parla di "}<strong>{"molle ideali"}</strong>{" per quelle che obbediscono esattamente alla legge di Hooke."}
            </p>
        </div>
    );

    return (
        <div style={{ display: "grid", gap: 14 }}>
            {FormulaCard}
            <InfoBox title="🧲 Visualizzazione interattiva della molla">
                <SpringSVG k={k} x={x} isMobile={isMobile} />
            </InfoBox>
            {isMobile ? (
                <>
                    <InfoBox title="🎛️ Parametri">{Controls}</InfoBox>
                    <InfoBox title="📈 Grafico F vs x"><HookeChart k={k} x={x} isMobile={isMobile} /></InfoBox>
                </>
            ) : (
                <ResponsiveGrid columns={{ tablet: 2, desktop: 2 }} gap={14}>
                    <InfoBox title="🎛️ Parametri">{Controls}</InfoBox>
                    <InfoBox title="📈 Grafico F vs x"><HookeChart k={k} x={x} isMobile={isMobile} /></InfoBox>
                </ResponsiveGrid>
            )}
            {InfoLegge}
            <ExerciseElastica />
        </div>
    );
}

// ============ TAB: FORZA D'ATTRITO ============

function FrictionSVG({ mass, appliedF, mud, mus, isMobile }: { mass: number; appliedF: number; mud: number; mus: number; isMobile: boolean }) {
    const W = isMobile ? 300 : 440;
    const H = 140;
    const g = 9.81;
    const weight = mass * g;
    const Fperp = weight;
    const Fs_max = mus * Fperp;
    const Fd = mud * Fperp;
    const isMoving = appliedF > Fs_max;
    const frictionMag = isMoving ? Fd : Math.min(appliedF, Fs_max);
    const blockX = W / 2 - 24;
    const blockY = 50;
    const blockW = 48;
    const blockH = 34;
    const groundY = blockY + blockH;
    const arrowScale = 1.8;
    const maxArrow = 90;
    const appArrowLen = Math.min(appliedF * arrowScale, maxArrow);
    const frArrowLen = Math.min(frictionMag * arrowScale, maxArrow);
    const weightArrowLen = Math.min(weight * 0.3, 50);
    const normalArrowLen = weightArrowLen;

    return (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H, display: "block", background: "#fafbfc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
            <defs>
                <marker id="aFA" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#3b82f6" /></marker>
                <marker id="aFF" markerWidth="8" markerHeight="6" refX="1" refY="3" orient="auto"><path d="M8,0 L0,3 L8,6" fill={isMoving ? "#dc2626" : "#f59e0b"} /></marker>
                <marker id="aFW" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto"><path d="M0,0 L7,2.5 L0,5" fill="#6b7280" /></marker>
                <marker id="aFN" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto"><path d="M0,0 L7,2.5 L0,5" fill="#8b5cf6" /></marker>
            </defs>

            {/* Ground */}
            <rect x={0} y={groundY} width={W} height={H - groundY} fill="#e2e8f0" />
            {Array.from({ length: 12 }, (_, i) => (
                <line key={i} x1={i * 36 + 4} y1={groundY} x2={i * 36 - 8} y2={groundY + 12} stroke="#cbd5e1" strokeWidth={1} />
            ))}

            {/* Block */}
            <rect x={blockX} y={blockY} width={blockW} height={blockH} rx={4}
                  fill={isMoving ? "#fef3c7" : "#dbeafe"} stroke={isMoving ? "#d97706" : "#3b82f6"} strokeWidth={1.5} />
            <text x={blockX + blockW/2} y={blockY + blockH/2 + 5} textAnchor="middle" fill="#1e293b" fontSize="11" fontWeight="bold">{"m"}</text>

            {/* Motion indicator */}
            {isMoving && (
                <>
                    {[8, 16, 24].map((d, i) => (
                        <line key={i} x1={blockX - d} y1={blockY + 8 + i * 6} x2={blockX - d - 12} y2={blockY + 8 + i * 6} stroke="#d97706" strokeWidth={1.5} strokeDasharray="2,2" />
                    ))}
                    <text x={blockX + blockW / 2} y={blockY - 8} textAnchor="middle" fill="#d97706" fontSize="9" fontWeight="bold">{"IN MOTO →"}</text>
                </>
            )}

            {/* Applied force */}
            {appArrowLen > 0 && (
                <>
                    <line x1={blockX + blockW} y1={blockY + blockH/2} x2={blockX + blockW + appArrowLen} y2={blockY + blockH/2} stroke="#3b82f6" strokeWidth={2.5} markerEnd="url(#aFA)" />
                    <text x={blockX + blockW + appArrowLen/2} y={blockY + blockH/2 - 6} textAnchor="middle" fill="#3b82f6" fontSize="9" fontWeight="bold">{"F=" + appliedF.toFixed(0) + "N"}</text>
                </>
            )}

            {/* Friction force */}
            {frArrowLen > 0 && (
                <>
                    <line x1={blockX} y1={blockY + blockH/2} x2={blockX - frArrowLen} y2={blockY + blockH/2} stroke={isMoving ? "#dc2626" : "#f59e0b"} strokeWidth={2.5} markerEnd="url(#aFF)" />
                    <text x={blockX - frArrowLen/2} y={blockY + blockH/2 - 6} textAnchor="middle" fill={isMoving ? "#dc2626" : "#f59e0b"} fontSize="9" fontWeight="bold">
                        {(isMoving ? "Fd" : "Fs") + "=" + frictionMag.toFixed(0) + "N"}
                    </text>
                </>
            )}

            {/* Weight */}
            <line x1={blockX + blockW/2} y1={blockY + blockH} x2={blockX + blockW/2} y2={blockY + blockH + weightArrowLen} stroke="#6b7280" strokeWidth={2} markerEnd="url(#aFW)" />
            <text x={blockX + blockW/2 + 6} y={blockY + blockH + weightArrowLen/2} fill="#6b7280" fontSize="8" fontStyle="italic">{"P"}</text>

            {/* Normal */}
            <line x1={blockX + blockW/2} y1={blockY} x2={blockX + blockW/2} y2={blockY - normalArrowLen} stroke="#8b5cf6" strokeWidth={2} markerEnd="url(#aFN)" />
            <text x={blockX + blockW/2 + 6} y={blockY - normalArrowLen/2} fill="#8b5cf6" fontSize="8" fontStyle="italic">{"N"}</text>

            {/* Legend */}
            <text x={8} y={H - 14} fill="#64748b" fontSize="8">
                {isMoving
                    ? "Attrito dinamico Fd = \u03BCd\u00B7N = " + Fd.toFixed(1) + " N"
                    : "Attrito statico Fs \u2264 Fs,max = \u03BCs\u00B7N = " + Fs_max.toFixed(1) + " N"
                }
            </text>
        </svg>
    );
}

function ExerciseAttrito() {
    const [showSol, setShowSol] = useState(false);
    const [ans, setAns] = useState("");
    const [fb, setFb] = useState<"correct"|"wrong"|null>(null);
    const check = () => {
        const v = parseFloat(ans.replace(",","."));
        if (Math.abs(v - 0.41) < 0.02) setFb("correct");
        else if (!isNaN(v)) setFb("wrong");
    };
    const btnBase: React.CSSProperties = { padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 };
    return (
        <div style={{ padding: "16px 18px", background: "#f0fdf4", borderRadius: 12, border: "2px solid #86efac" }}>
            <div style={{ display: "inline-block", background: "#16a34a", color: "#fff", padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
                {"PROVA TU"}
            </div>
            <p style={{ color: "#1a3a2a", margin: "0 0 14px", fontSize: 14, lineHeight: 1.75 }}>
                {"Devi spostare un baule che pesa "}<strong style={{ color: "#dc2626" }}>{"1100 N"}</strong>{" lungo il corridoio di casa. Applicando una forza di "}
                <strong style={{ color: "#1e40af" }}>{"450 N"}</strong>{" riesci a stento a metterlo in moto. Qual è il coefficiente di attrito statico fra il baule e il pavimento?"}
            </p>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <input type="text" placeholder={"μs = ?"} value={ans} onChange={e => { setAns(e.target.value); setFb(null); }} onKeyDown={e => e.key === "Enter" && check()} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 14, fontFamily: "monospace", width: 140, border: `2px solid ${fb === "correct" ? "#16a34a" : fb === "wrong" ? "#dc2626" : "#e2e8f0"}`, background: "#fff", color: "#0f172a", outline: "none" }} />
                <button onClick={check} style={{ ...btnBase, background: "#3b82f6", color: "#fff", border: "none" }}>{"Verifica"}</button>
                <button onClick={() => setShowSol(!showSol)} style={{ ...btnBase, background: "#fff", color: "#64748b", border: "1px solid #cbd5e1" }}>{showSol ? "Nascondi" : "Soluzione"}</button>
            </div>
            {fb === "correct" && <div style={{ color: "#16a34a", fontSize: 13, fontWeight: 600, marginTop: 10 }}>{"✓ Corretto! μs ≈ 0,41"}</div>}
            {fb === "wrong" && <div style={{ color: "#dc2626", fontSize: 13, marginTop: 10 }}>{"✗ Riprova. Ricorda: Fs,max = μs · F⊥, quindi μs = F / P"}</div>}
            {showSol && (
                <div style={{ background: "#fff", borderRadius: 10, padding: 14, marginTop: 12, border: "1px solid #bbf7d0" }}>
                    <div style={{ fontFamily: "monospace", fontSize: 14, lineHeight: 2.2, color: "#334155" }}>
                        <div>{"Fs,max = μs · F⊥"}</div>
                        <div>{"F⊥ = P = 1100 N"}</div>
                        <div>{"μs = Fs,max / F⊥"}</div>
                        <div>{"μs = 450 N / 1100 N"}</div>
                        <div style={{ color: "#16a34a", fontWeight: 700 }}>{"μs ≈ 0,41"}</div>
                    </div>
                </div>
            )}
        </div>
    );
}

function TabAttrito({ isMobile }: { isMobile: boolean }) {
    const [selectedMat, setSelectedMat] = useState(0);
    const [mass, setMass] = useState(5);
    const [appliedF, setAppliedF] = useState(0);

    const mat = FRICTION_MATERIALS[selectedMat];
    const g = 9.81;
    const weight = mass * g;
    const Fs_max = mat.mus * weight;
    const Fd = mat.mud * weight;
    const isMoving = appliedF > Fs_max;

    const FormuleDinamico = (
        <div style={{ padding: "14px 18px", background: "linear-gradient(135deg, #fef2f2, #fee2e2)", borderRadius: 12, border: "2px solid #fca5a5" }}>
            <div style={{ fontWeight: 700, color: "#dc2626", fontSize: 14, marginBottom: 10 }}>{"Attrito Dinamico"}</div>
            <div style={{ fontFamily: "monospace", fontSize: isMobile ? 16 : 19, fontWeight: 700, color: "#dc2626", marginBottom: 10 }}>
                {"Fd = μd · F⊥"}
            </div>
            <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.7 }}>
                {"Agisce quando il corpo è "}<strong>{"in scorrimento"}</strong>{" sulla superficie. È parallela alla superficie e opposta al moto. Non dipende né dall'area di contatto né dalla velocità."}
            </div>
        </div>
    );

    const FormuleStatico = (
        <div style={{ padding: "14px 18px", background: "linear-gradient(135deg, #fffbeb, #fef3c7)", borderRadius: 12, border: "2px solid #fcd34d" }}>
            <div style={{ fontWeight: 700, color: "#d97706", fontSize: 14, marginBottom: 10 }}>{"Attrito Statico"}</div>
            <div style={{ fontFamily: "monospace", fontSize: isMobile ? 16 : 19, fontWeight: 700, color: "#d97706", marginBottom: 10 }}>
                {"Fs,max = μs · F⊥"}
            </div>
            <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.7 }}>
                {"Si oppone all'inizio del moto. Può assumere qualsiasi valore tra 0 e Fs,max. In genere μs > μd: è più difficile avviare il moto che mantenerlo."}
            </div>
        </div>
    );

    const Controls = (
        <div style={{ display: "grid", gap: 14 }}>
            <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 }}>{"Materiale a contatto"}</div>
                <select value={selectedMat} onChange={e => setSelectedMat(+e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#334155", fontSize: 13, outline: "none" }}>
                    {FRICTION_MATERIALS.map((m, i) => (
                        <option key={i} value={i}>{m.material}</option>
                    ))}
                </select>
                <div style={{ display: "flex", gap: 10, marginTop: 8, fontSize: 12, fontFamily: "monospace" }}>
                    <div style={{ flex: 1, padding: "6px 10px", background: "#fef3c7", borderRadius: 8, textAlign: "center" }}>
                        {"μs = "}<strong style={{ color: "#d97706" }}>{mat.mus}</strong>
                    </div>
                    <div style={{ flex: 1, padding: "6px 10px", background: "#fef2f2", borderRadius: 8, textAlign: "center" }}>
                        {"μd = "}<strong style={{ color: "#dc2626" }}>{mat.mud}</strong>
                    </div>
                </div>
            </div>
            <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4, color: "#334155" }}>
                    <span style={{ fontWeight: 600 }}>{"Massa del corpo"}</span>
                    <span style={{ color: "#1e40af", fontFamily: "monospace", fontWeight: 700 }}>{mass + " kg → P = " + weight.toFixed(0) + " N"}</span>
                </div>
                <input type="range" min={1} max={50} step={1} value={mass} onChange={e => setMass(+e.target.value)} style={sliderFillStyle(mass, 1, 50, "#3b82f6")} />
            </div>
            <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4, color: "#334155" }}>
                    <span style={{ fontWeight: 600 }}>{"Forza applicata"}</span>
                    <span style={{ color: "#3b82f6", fontFamily: "monospace", fontWeight: 700 }}>{appliedF.toFixed(0) + " N"}</span>
                </div>
                <input type="range" min={0} max={Math.max(Math.ceil(Fs_max * 1.5), 50)} step={1} value={appliedF} onChange={e => setAppliedF(+e.target.value)} style={sliderFillStyle(appliedF, 0, Math.max(Math.ceil(Fs_max * 1.5), 50), "#3b82f6")} />
            </div>
            <div style={{ padding: "12px 14px", background: isMoving ? "#fef2f2" : "#f0fdf4", borderRadius: 10, border: `1px solid ${isMoving ? "#fca5a5" : "#86efac"}` }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: isMoving ? "#dc2626" : "#16a34a", marginBottom: 6 }}>
                    {isMoving ? "🏃 Il corpo È IN MOTO" : "🛑 Il corpo RIMANE FERMO"}
                </div>
                <div style={{ fontFamily: "monospace", fontSize: 12, lineHeight: 1.9, color: "#334155" }}>
                    <div>{"Fs,max = " + mat.mus + " · " + weight.toFixed(0) + " = "}<strong style={{ color: "#d97706" }}>{Fs_max.toFixed(1) + " N"}</strong></div>
                    <div>{"Fd = " + mat.mud + " · " + weight.toFixed(0) + " = "}<strong style={{ color: "#dc2626" }}>{Fd.toFixed(1) + " N"}</strong></div>
                    <div>{"F applicata = "}<strong style={{ color: "#3b82f6" }}>{appliedF.toFixed(0) + " N"}</strong></div>
                    {isMoving
                        ? <div style={{ color: "#dc2626" }}>{"F > Fs,max → il corpo si muove con attrito Fd"}</div>
                        : <div style={{ color: "#16a34a" }}>{"F ≤ Fs,max → il corpo non si muove"}</div>
                    }
                </div>
            </div>
        </div>
    );

    const MaterialTable = (
        <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: isMobile ? 11 : 13 }}>
                <thead>
                <tr style={{ background: "#f1f5f9" }}>
                    <th style={{ padding: "8px 10px", textAlign: "left", color: "#475569", fontWeight: 600 }}>{"Materiale"}</th>
                    <th style={{ padding: "8px 10px", textAlign: "center", color: "#dc2626", fontWeight: 600 }}>{"μd"}</th>
                    <th style={{ padding: "8px 10px", textAlign: "center", color: "#d97706", fontWeight: 600 }}>{"μs"}</th>
                </tr>
                </thead>
                <tbody>
                {FRICTION_MATERIALS.map((m, i) => (
                    <tr key={i} onClick={() => setSelectedMat(i)} style={{ cursor: "pointer", background: selectedMat === i ? "#eff6ff" : i % 2 === 0 ? "#fff" : "#f8fafc", transition: "background 0.15s" }}>
                        <td style={{ padding: "7px 10px", color: "#334155", borderBottom: "1px solid #f1f5f9", fontWeight: selectedMat === i ? 600 : 400 }}>{m.material}</td>
                        <td style={{ padding: "7px 10px", textAlign: "center", color: "#dc2626", fontFamily: "monospace", borderBottom: "1px solid #f1f5f9" }}>{m.mud.toFixed(3).replace(/\.?0+$/, "")}</td>
                        <td style={{ padding: "7px 10px", textAlign: "center", color: "#d97706", fontFamily: "monospace", borderBottom: "1px solid #f1f5f9" }}>{m.mus.toFixed(2).replace(/\.?0+$/, "")}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6, textAlign: "right" }}>{"Clicca una riga per selezionarla"}</div>
        </div>
    );

    return (
        <div style={{ display: "grid", gap: 14 }}>
            {isMobile ? (
                <>
                    {FormuleDinamico}
                    {FormuleStatico}
                </>
            ) : (
                <ResponsiveGrid columns={{ tablet: 2, desktop: 2 }} gap={14}>
                    {FormuleDinamico}
                    {FormuleStatico}
                </ResponsiveGrid>
            )}

            <InfoBox title="🧱 Simulazione interattiva">
                <FrictionSVG mass={mass} appliedF={appliedF} mud={mat.mud} mus={mat.mus} isMobile={isMobile} />
            </InfoBox>

            {isMobile ? (
                <>
                    <InfoBox title="🎛️ Parametri">{Controls}</InfoBox>
                    <InfoBox title="📊 Coefficienti di attrito (Tabella 2)">{MaterialTable}</InfoBox>
                </>
            ) : (
                <ResponsiveGrid columns={{ tablet: 2, desktop: 2 }} gap={14}>
                    <InfoBox title="🎛️ Parametri">{Controls}</InfoBox>
                    <InfoBox title="📊 Coefficienti di attrito (Tabella 2)">{MaterialTable}</InfoBox>
                </ResponsiveGrid>
            )}

            <ExerciseAttrito />
        </div>
    );
}

// ============ COMPONENTE PRINCIPALE ============

export default function ForzeDemo() {
    const { isMobile, isTablet } = useBreakpoint();
    const [activeTab, setActiveTab] = useState<ForceTab>("forze");

    const tabStyle = (tab: ForceTab): React.CSSProperties => ({
        flex: 1,
        padding: isMobile ? "10px 4px" : "12px 8px",
        fontSize: isMobile ? 13 : 14,
        fontWeight: 700,
        border: "none",
        borderBottom: `3px solid ${activeTab === tab ? "#3b82f6" : "transparent"}`,
        background: activeTab === tab ? "#eff6ff" : "transparent",
        color: activeTab === tab ? "#1e40af" : "#64748b",
        cursor: "pointer",
        transition: "all 0.2s ease",
        borderRadius: "8px 8px 0 0",
        whiteSpace: "nowrap",
    });

    return (
        <DemoContainer
            title="Le Forze"
            description={isMobile
                ? "Dinamometro, forza peso, risultante"
                : "Dinamometro, forza peso e risultante di forze"
            }
        >
            <div style={{
                display: "flex", gap: 0, marginBottom: 16,
                borderBottom: "2px solid #e2e8f0",
            }}>
                {TAB_CONFIG.map(tab => (
                    <button
                        key={tab.id}
                        style={tabStyle(tab.id)}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {isMobile ? tab.mobileLabel : tab.label}
                    </button>
                ))}
            </div>

            {activeTab === "forze" && <TabForze isMobile={isMobile} />}
            {activeTab === "peso" && <TabPeso isMobile={isMobile} />}
            {activeTab === "elastica" && <TabElastica isMobile={isMobile} />}
            {activeTab === "attrito" && <TabAttrito isMobile={isMobile} />}
        </DemoContainer>
    );
}