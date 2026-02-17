/**
 * ForzeDemo - Le Forze
 *
 * Tab: Le Forze (generale) | Forza Peso | Forza Elastica (soon) | Forza d'Attrito (soon)
 *
 * Contenuti:
 *   - Dinamometro interattivo
 *   - Forze per contatto e a distanza
 *   - Risultante di due forze (parallelogramma)
 *   - Forza peso: P = mg con confronto tra pianeti
 *   - Esercizio interattivo "Prova tu"
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
    { id: "elastica", label: "Forza Elastica", mobileLabel: "Elastica", disabled: true },
    { id: "attrito", label: "Forza d'Attrito", mobileLabel: "Attrito", disabled: true },
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

function Dynamometer({ force, maxForce = 50, width }: { force: number; maxForce?: number; width: number }) {
    // Altezza SVG fissa: il dinamometro si estende/comprime dentro uno spazio costante
    const SVG_H = 280;
    const clampedForce = Math.min(force, maxForce);
    const springExtension = (clampedForce / maxForce) * 100;
    const numCoils = 8;
    const springTop = 48;
    const springBottom = springTop + 80 + springExtension;
    const coilWidth = 13;

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

    const scaleMarks = useMemo(() => {
        const marks: { y: number; val: number }[] = [];
        for (let i = 0; i <= 5; i++) {
            marks.push({
                y: springTop + (i / 5) * (80 + springExtension),
                val: (maxForce / 5) * i,
            });
        }
        return marks;
    }, [springExtension, maxForce]);

    return (
        <svg viewBox={`0 0 100 ${SVG_H}`} style={{ width, height: SVG_H * (width / 100), display: "block", margin: "0 auto" }}>
            <rect x="30" y="12" width="40" height="24" rx="4" fill="#4a6fa5" stroke="#3d5f8f" strokeWidth="1" />
            <rect x="36" y="15" width="28" height="18" rx="2" fill="#1a2a3a" />
            <text x="50" y="27" textAnchor="middle" fill="#4fd1c5" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                {force.toFixed(1)}
            </text>
            <text x="50" y="34" textAnchor="middle" fill="#7ec8c0" fontSize="4.5" fontFamily="monospace">N</text>
            <line x1="50" y1="5" x2="50" y2="12" stroke="#888" strokeWidth="1.5" />
            <circle cx="50" cy="4" r="2" fill="none" stroke="#888" strokeWidth="1.2" />
            <path d={springPath} fill="none" stroke="#e05a3a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {scaleMarks.map((m, i) => (
                <g key={i}>
                    <line x1="70" y1={m.y} x2="76" y2={m.y} stroke="#bbb" strokeWidth="0.7" />
                    <text x="80" y={m.y + 2.5} fill="#999" fontSize="5.5" fontFamily="monospace">{m.val.toFixed(0)}</text>
                </g>
            ))}
            <rect x="38" y={springBottom} width="24" height="20" rx="3" fill="#4a6fa5" stroke="#3d5f8f" strokeWidth="1" />
            <text x="50" y={springBottom + 12} textAnchor="middle" fill="#fff" fontSize="7" fontFamily="monospace">
                {(force / 9.81).toFixed(1)}
            </text>
            <text x="50" y={springBottom + 18.5} textAnchor="middle" fill="#c0d0e0" fontSize="4">kg</text>
            <line x1="50" y1={springBottom + 20} x2="50" y2={springBottom + 26} stroke="#888" strokeWidth="1.2" />
            <defs>
                <marker id="arrowP" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                    <path d="M0,0 L8,3 L0,6" fill="#e05a3a" />
                </marker>
            </defs>
            <line x1="50" y1={springBottom + 26} x2="50" y2={springBottom + 40} stroke="#e05a3a" strokeWidth="2" markerEnd="url(#arrowP)" />
            {/* P con freccia sopra (combinazione unicode affidabile) */}
            <text x="50" y={springBottom + 52} textAnchor="middle" fill="#e05a3a" fontSize="9" fontWeight="bold" fontFamily="serif">
                <tspan fontStyle="italic">P</tspan>
            </text>
            <line x1="45" y1={springBottom + 44} x2="55" y2={springBottom + 44} stroke="#e05a3a" strokeWidth="0.8" markerEnd="url(#arrowP)" />
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
                    <text x={ox + f1 * sc / 2} y={oy + 16} textAnchor="middle" fill="#3b82f6" fontSize="12" fontWeight="bold">F₁</text>
                    <line x1={ox} y1={oy} x2={ox + f2 * Math.cos(aRad) * sc} y2={oy - f2 * Math.sin(aRad) * sc} stroke="#f59e0b" strokeWidth={2.5} markerEnd="url(#aF2)" />
                    <text x={ox + f2 * Math.cos(aRad) * sc / 2 - 14} y={oy - f2 * Math.sin(aRad) * sc / 2 - 6} fill="#f59e0b" fontSize="12" fontWeight="bold">F₂</text>
                    <line x1={ox} y1={oy} x2={ox + rx * sc} y2={oy - ry * sc} stroke="#dc2626" strokeWidth={3} markerEnd="url(#aR)" />
                    {/* R con freccia sopra */}
                    <g transform={`translate(${ox + rx * sc / 2 + 12}, ${oy - ry * sc / 2})`}>
                        <text x={0} y={0} fill="#dc2626" fontSize="13" fontWeight="bold" fontStyle="italic">R</text>
                        <line x1={-1} y1={-12} x2={10} y2={-12} stroke="#dc2626" strokeWidth="1.5" markerEnd="url(#aR)" />
                    </g>
                    {angle > 0 && angle < 360 && (
                        <path d={`M ${ox + 22} ${oy} A 22 22 0 ${angle > 180 ? 1 : 0} 0 ${ox + 22 * Math.cos(aRad)} ${oy - 22 * Math.sin(aRad)}`}
                              fill="none" stroke="#94a3b8" strokeWidth={1} strokeDasharray="2,2" />
                    )}
                    <text x={ox + 28} y={oy - 6} fill="#94a3b8" fontSize="10">θ</text>
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
                            Risultante <span style={{ textDecoration: "overline", fontStyle: "italic" }}>R</span>
                        </div>
                        <div style={{ fontFamily: "monospace", fontSize: 13, lineHeight: 2, color: "#334155" }}>
                            |<span style={{ fontStyle: "italic" }}>R</span>| ={" "}
                            <span>√</span>
                            <span style={{ textDecoration: "overline", textDecorationColor: "#334155" }}>
                                (F₁² + F₂² + 2F₁F₂cos θ)
                            </span>
                            <br />
                            |<span style={{ fontStyle: "italic" }}>R</span>| = <strong style={{ color: "#dc2626" }}>{R.toFixed(1)} N</strong><br />
                            <span style={{ fontStyle: "italic" }}>α</span> = <strong style={{ color: "#dc2626" }}>{theta.toFixed(1)}°</strong>
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
                Su un pianeta lontano, un astronauta raccoglie una roccia. La roccia ha una massa
                di <strong style={{ color: "#1e40af" }}>5,00 kg</strong> e su quel particolare pianeta il
                suo peso è di <strong style={{ color: "#dc2626" }}>40,0 N</strong>: qual è l'accelerazione
                di gravità sul pianeta?
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
                <div style={{ color: "#16a34a", fontSize: 13, fontWeight: 600, marginTop: 10 }}>✓ Corretto! g = 8,0 N/kg</div>
            )}
            {feedback === "wrong" && (
                <div style={{ color: "#dc2626", fontSize: 13, marginTop: 10 }}>✗ Riprova. Ricorda: P = mg, quindi g = P/m</div>
            )}

            {showSolution && (
                <div style={{ background: "#fff", borderRadius: 10, padding: 14, marginTop: 12, border: "1px solid #bbf7d0" }}>
                    <div style={{ fontFamily: "monospace", fontSize: 14, lineHeight: 2.2, color: "#334155" }}>
                        <div>P = m · g</div>
                        <div>g = P / m</div>
                        <div>g = 40,0 N / 5,00 kg</div>
                        <div style={{ color: "#16a34a", fontWeight: 700 }}>g = 8,0 N/kg</div>
                    </div>
                    <div style={{ marginTop: 8, color: "#16a34a", fontWeight: 600, fontSize: 13 }}>✓ La formula è verificata!</div>
                </div>
            )}
        </div>
    );
}

// ============ TAB: LE FORZE ============

function TabForze({ isMobile }: { isMobile: boolean }) {
    const [mass, setMass] = useState<number>(2.5);
    const [forceType, setForceType] = useState<ForceType>("contatto");

    const force = mass * 9.81;
    const dynWidth = isMobile ? 90 : 110;

    const DynamometerSection = (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <Dynamometer force={force} maxForce={50} width={dynWidth} />
            <div style={{ width: "100%", maxWidth: 160 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4, color: "#475569" }}>
                    <span>Massa</span>
                    <span style={{ color: "#1e40af", fontFamily: "monospace", fontWeight: 700 }}>{mass.toFixed(1)} kg</span>
                </div>
                <input type="range" min={0.1} max={5} step={0.1} value={mass}
                       onChange={e => setMass(+e.target.value)}
                       style={sliderFillStyle(mass, 0.1, 5, "#3b82f6")} />
            </div>
            <div style={{
                fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: "#dc2626",
                background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "6px 14px",
            }}>
                P = {mass.toFixed(1)} × 9,81 = {force.toFixed(1)} N
            </div>
        </div>
    );

    const ForceExplanation = (
        <div style={{ display: "grid", gap: 12 }}>
            <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.75 }}>
                Una forza è un'azione che un corpo esercita su un altro. Le forze modificano lo{" "}
                <strong style={{ color: "#1e40af" }}>stato di moto</strong> dei corpi o
                producono <strong style={{ color: "#1e40af" }}>deformazioni</strong>.
            </div>
            <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.75 }}>
                Ogni forza è una <strong style={{ color: "#d97706" }}>grandezza vettoriale</strong>: ha
                un modulo (intensità), una direzione e un verso.
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
                    ? <>Colpire una palla con una racchetta, spingere un carrello, piantare un chiodo. Richiedono il <strong>contatto diretto</strong> tra i corpi.</>
                    : <>La forza di gravità, la forza magnetica, la forza elettrica. Agiscono <strong>senza contatto</strong> tra i corpi coinvolti.</>
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
            <strong>📏 Il Newton (N)</strong> — Un newton è la forza che produce un allungamento della molla di un dinamometro uguale a quello prodotto da una massa appesa di <strong>1/9,81 kg</strong> (circa 102 g).
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
                P = mg
            </div>
            <div style={{
                display: "flex", justifyContent: "center", gap: isMobile ? 16 : 28,
                marginTop: 10, fontSize: 13, color: "#64748b", flexWrap: "wrap",
            }}>
                <span><strong style={{ color: "#dc2626" }}>P</strong> = peso (N)</span>
                <span><strong style={{ color: "#1e40af" }}>m</strong> = massa (kg)</span>
                <span><strong style={{ color: "#d97706" }}>g</strong> = acc. gravità (N/kg)</span>
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
                    <span style={{ fontWeight: 600 }}>Massa personalizzata</span>
                    <span style={{ fontFamily: "monospace", color: "#1e40af", fontWeight: 700 }}>{mass} kg</span>
                </div>
                <input type="range" min={0.01} max={2000} step={mass < 10 ? 0.1 : 1}
                       value={mass} onChange={e => setMass(+e.target.value)}
                       style={sliderFillStyle(mass, 0.01, 2000, "#3b82f6")} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#94a3b8", marginTop: 3 }}>
                    <span>0,01 kg</span><span>2000 kg</span>
                </div>
            </div>
            <div style={{
                padding: "12px 16px", background: "#fffbeb", borderRadius: 10,
                border: "1px solid #fde68a", fontSize: 13, color: "#92400e", lineHeight: 1.7,
            }}>
                <strong>⚠️ Peso ≠ Massa</strong>
                <p style={{ margin: "8px 0 4px" }}>
                    La <strong style={{ color: "#1e40af" }}>massa</strong> è una proprietà intrinseca del corpo (kg). Resta invariata ovunque.
                </p>
                <p style={{ margin: 0 }}>
                    Il <strong style={{ color: "#dc2626" }}>peso</strong> è una forza (N). Dipende dal valore di <em>g</em> e quindi dal corpo celeste.
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
                    {PLANETS.map((pl, i) => <option key={i} value={i}>{pl.icon} {pl.name}</option>)}
                </select>
                <div style={{
                    width: p.radius * 1.6, height: p.radius * 1.6, borderRadius: "50%", margin: "0 auto 8px",
                    background: `radial-gradient(circle at 35% 35%, ${p.color}dd, ${p.color}66)`,
                    boxShadow: `0 0 14px ${p.color}22`,
                }} />
                <div style={{ color: "#64748b", fontFamily: "monospace", fontSize: 12 }}>g = {p.g} N/kg</div>
                <div style={{ color: "#dc2626", fontFamily: "monospace", fontSize: isMobile ? 18 : 22, fontWeight: 700, margin: "4px 0" }}>
                    {w < 100 ? w.toFixed(2) : w.toFixed(0)} N
                </div>
                <div style={{ color: "#94a3b8", fontSize: 11 }}>P = {mass} × {p.g}</div>
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
                <div style={{ color: "#64748b", fontSize: 12, marginBottom: 6 }}>Rapporto pesi</div>
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
                        {(planet.g / compare.g).toFixed(2)}×
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

            <InfoBox title={`📊 Peso di ${mass} kg nel sistema solare`}>
                <PlanetBarChart mass={mass} isMobile={isMobile} />
            </InfoBox>

            <ExercisePeso />
        </div>
    );
}

// ============ COMPONENTE PRINCIPALE ============

export default function ForzeDemo() {
    const { isMobile, isTablet } = useBreakpoint();
    const [activeTab, setActiveTab] = useState<ForceTab>("forze");

    const tabStyle = (tab: ForceTab, disabled?: boolean): React.CSSProperties => ({
        flex: 1,
        padding: isMobile ? "10px 4px" : "12px 8px",
        fontSize: isMobile ? 13 : 14,
        fontWeight: 700,
        border: "none",
        borderBottom: `3px solid ${activeTab === tab ? "#3b82f6" : "transparent"}`,
        background: activeTab === tab ? "#eff6ff" : "transparent",
        color: disabled ? "#cbd5e1" : activeTab === tab ? "#1e40af" : "#64748b",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s ease",
        borderRadius: "8px 8px 0 0",
        opacity: disabled ? 0.5 : 1,
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
            {/* Tab selector */}
            <div style={{
                display: "flex", gap: 0, marginBottom: 16,
                borderBottom: "2px solid #e2e8f0",
            }}>
                {TAB_CONFIG.map(tab => (
                    <button
                        key={tab.id}
                        disabled={tab.disabled}
                        style={tabStyle(tab.id, tab.disabled)}
                        onClick={() => !tab.disabled && setActiveTab(tab.id)}
                    >
                        {isMobile ? tab.mobileLabel : tab.label}
                        {tab.disabled && (
                            <span style={{
                                fontSize: 9, background: "#f1f5f9", color: "#94a3b8",
                                padding: "1px 5px", borderRadius: 4, marginLeft: 4,
                                fontWeight: 500,
                            }}>soon</span>
                        )}
                    </button>
                ))}
            </div>

            {activeTab === "forze" && <TabForze isMobile={isMobile} />}
            {activeTab === "peso" && <TabPeso isMobile={isMobile} />}
        </DemoContainer>
    );
}