/**
 * ForzaPesoDemo — Forza Peso: P = mg
 */

import React, { useState } from "react";
import {
    DemoContainer,
    InfoBox,
    useBreakpoint,
    ResponsiveGrid,
} from "../../components/ui";

// ============ TIPI E COSTANTI ============

interface Planet {
    name: string;
    g: number;
    color: string;
    icon: string;
    radius: number;
}

interface MassPreset {
    label: string;
    mass: number;
    icon: string;
}

const PLANETS: Planet[] = [
    { name: "Mercurio", g: 3.7,   color: "#9e9e9e", icon: "☿", radius: 18 },
    { name: "Venere",   g: 8.87,  color: "#e8a735", icon: "♀", radius: 22 },
    { name: "Terra",    g: 9.81,  color: "#4a90d9", icon: "🜨", radius: 24 },
    { name: "Luna",     g: 1.62,  color: "#bbb",    icon: "☽", radius: 14 },
    { name: "Marte",    g: 3.69,  color: "#c1440e", icon: "♂", radius: 20 },
    { name: "Giove",    g: 24.79, color: "#c4a46c", icon: "♃", radius: 38 },
    { name: "Saturno",  g: 10.44, color: "#d4b876", icon: "♄", radius: 34 },
    { name: "Urano",    g: 8.69,  color: "#5bb5a6", icon: "♅", radius: 28 },
    { name: "Nettuno",  g: 11.15, color: "#3f54ba", icon: "♆", radius: 27 },
];

const MASS_PRESETS: MassPreset[] = [
    { label: "Mela",         mass: 0.1,  icon: "🍎" },
    { label: "Libro",        mass: 0.5,  icon: "📕" },
    { label: "Persona",      mass: 70,   icon: "🧑" },
    { label: "Auto",         mass: 1200, icon: "🚗" },
    { label: "Perseverance", mass: 1025, icon: "🤖" },
];

function sliderFillStyle(val: number, min: number, max: number, color: string): React.CSSProperties {
    const pct = ((val - min) / (max - min)) * 100;
    return {
        width: "100%", height: 8, borderRadius: 4,
        appearance: "none" as const, outline: "none", cursor: "pointer",
        background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, #e2e8f0 ${pct}%, #e2e8f0 100%)`,
    };
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

// ============ ESERCIZIO ============

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
        <div style={{ padding: "16px 18px", background: "#f0fdf4", borderRadius: 12, border: "2px solid #86efac" }}>
            <div style={{ display: "inline-block", background: "#16a34a", color: "#fff", padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
                {"PROVA TU"}
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
                    style={{ padding: "8px 14px", borderRadius: 8, fontSize: 14, fontFamily: "monospace", width: 140, border: `2px solid ${feedback === "correct" ? "#16a34a" : feedback === "wrong" ? "#dc2626" : "#e2e8f0"}`, background: "#fff", color: "#0f172a", outline: "none", transition: "border-color 0.2s" }}
                />
                <button onClick={checkAnswer} style={{ ...btnBase, background: "#3b82f6", color: "#fff", border: "none" }}>{"Verifica"}</button>
                <button onClick={() => setShowSolution(!showSolution)} style={{ ...btnBase, background: "#fff", color: "#64748b", border: "1px solid #cbd5e1" }}>
                    {showSolution ? "Nascondi" : "Soluzione"}
                </button>
            </div>
            {feedback === "correct" && <div style={{ color: "#16a34a", fontSize: 13, fontWeight: 600, marginTop: 10 }}>{"✓ Corretto! g = 8,0 N/kg"}</div>}
            {feedback === "wrong" && <div style={{ color: "#dc2626", fontSize: 13, marginTop: 10 }}>{"✗ Riprova. Ricorda: P = mg, quindi g = P/m"}</div>}
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

// ============ COMPONENTE PRINCIPALE ============

export default function ForzaPesoDemo() {
    const { isMobile } = useBreakpoint();
    const [mass, setMass] = useState<number>(70);
    const [selectedPlanet, setSelectedPlanet] = useState<number>(2);
    const [comparePlanet, setComparePlanet] = useState<number>(3);

    const planet = PLANETS[selectedPlanet];
    const compare = PLANETS[comparePlanet];

    const FormulaCard = (
        <div style={{ padding: "16px 20px", background: "#fef2f2", borderRadius: 12, border: "2px solid #fecaca", textAlign: "center" }}>
            <div style={{ fontSize: isMobile ? 28 : 34, fontWeight: 700, color: "#dc2626", fontFamily: "serif", fontStyle: "italic" }}>
                {"P = mg"}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: isMobile ? 16 : 28, marginTop: 10, fontSize: 13, color: "#64748b", flexWrap: "wrap" }}>
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
            <div style={{ padding: "12px 16px", background: "#fffbeb", borderRadius: 10, border: "1px solid #fde68a", fontSize: 13, color: "#92400e", lineHeight: 1.7 }}>
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
                <select value={idx} onChange={e => set(+e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#334155", fontSize: 13, marginBottom: 10, outline: "none" }}>
                    {PLANETS.map((pl, i) => <option key={i} value={i}>{pl.icon + " " + pl.name}</option>)}
                </select>
                <div style={{ width: p.radius * 1.6, height: p.radius * 1.6, borderRadius: "50%", margin: "0 auto 8px", background: `radial-gradient(circle at 35% 35%, ${p.color}dd, ${p.color}66)`, boxShadow: `0 0 14px ${p.color}22` }} />
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
                        <div style={{ height: "100%", borderRadius: 4, transition: "width 0.3s ease", width: `${(planet.g / Math.max(planet.g, compare.g)) * 100}%`, background: planet.color }} />
                    </div>
                    <span style={{ color: "#475569", fontFamily: "monospace", fontSize: 13, fontWeight: 700 }}>
                        {(planet.g / compare.g).toFixed(2) + "×"}
                    </span>
                    <div style={{ width: 80, height: 8, background: "#e2e8f0", borderRadius: 4, overflow: "hidden", direction: "rtl" as const }}>
                        <div style={{ height: "100%", borderRadius: 4, transition: "width 0.3s ease", width: `${(compare.g / Math.max(planet.g, compare.g)) * 100}%`, background: compare.color }} />
                    </div>
                    <span style={{ color: compare.color, fontWeight: 700, fontSize: 13 }}>{compare.name}</span>
                </div>
            </div>
        </div>
    );

    return (
        <DemoContainer
            title="Forza Peso"
            description="P = mg — Confronta il tuo peso in tutto il sistema solare"
        >
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
        </DemoContainer>
    );
}
