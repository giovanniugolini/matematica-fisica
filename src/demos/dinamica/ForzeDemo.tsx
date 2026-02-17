import React, { useState } from "react";

// ─── Types ───
interface Planet {
    name: string;
    g: number;
    color: string;
    icon: string;
    radius: number;
}

interface Tab {
    id: string;
    label: string;
    icon: string;
    disabled?: boolean;
}

interface DynamometerProps {
    force: number;
    maxForce?: number;
}

// ─── Data ───
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

const TABS: Tab[] = [
    { id: "forze", label: "Le Forze", icon: "⚡" },
    { id: "peso", label: "Forza Peso", icon: "⬇️" },
    { id: "elastica", label: "Forza Elastica", icon: "〰️", disabled: true },
    { id: "attrito", label: "Forza d'Attrito", icon: "≋", disabled: true },
];

// ─── Styles ───
const card: React.CSSProperties = {
    background: "#fff",
    borderRadius: 14,
    padding: 22,
    border: "1px solid #e8ecf0",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
};

const sectionTitle: React.CSSProperties = {
    fontSize: 17,
    fontWeight: 700,
    color: "#1a2b3c",
    margin: "0 0 14px",
    display: "flex",
    alignItems: "center",
    gap: 8,
};

const hintBox: React.CSSProperties = {
    background: "#f0f7ff",
    border: "1px solid #d0e3f7",
    borderRadius: 10,
    padding: "12px 16px",
    fontSize: 13.5,
    color: "#2c5282",
    lineHeight: 1.7,
};

// ─── Dynamometer Component ───
const Dynamometer: React.FC<DynamometerProps> = ({ force, maxForce = 50 }) => {
    const clampedForce = Math.min(force, maxForce);
    const springExtension = (clampedForce / maxForce) * 120;
    const numCoils = 8;
    const springTop = 50;
    const springBottom = springTop + 90 + springExtension;
    const coilWidth = 13;

    const springPath = (() => {
        let d = `M 50 ${springTop}`;
        const ch = (springBottom - springTop) / numCoils;
        for (let i = 0; i < numCoils; i++) {
            const y1 = springTop + i * ch + ch * 0.25;
            const y2 = springTop + i * ch + ch * 0.75;
            d += ` L ${50 + coilWidth} ${y1} L ${50 - coilWidth} ${y2}`;
        }
        d += ` L 50 ${springBottom}`;
        return d;
    })();

    const scaleMarks: { y: number; val: number }[] = [];
    for (let i = 0; i <= 5; i++) {
        const val = (maxForce / 5) * i;
        const y = springTop + (i / 5) * (90 + springExtension);
        scaleMarks.push({ y, val });
    }

    return (
        <svg viewBox="0 0 100 300" style={{ width: 110, height: 300 }}>
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
            <line x1="50" y1={springBottom + 20} x2="50" y2={springBottom + 28} stroke="#888" strokeWidth="1.2" />
            <defs>
                <marker id="arrowP" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                    <path d="M0,0 L8,3 L0,6" fill="#e05a3a" />
                </marker>
            </defs>
            <line x1="50" y1={springBottom + 28} x2="50" y2={springBottom + 46} stroke="#e05a3a" strokeWidth="2" markerEnd="url(#arrowP)" />
            <text x="50" y={springBottom + 55} textAnchor="middle" fill="#e05a3a" fontSize="8" fontWeight="bold" fontFamily="serif" fontStyle="italic">P⃗</text>
        </svg>
    );
};

// ─── Force Vectors ───
const ForceVectorDemo: React.FC = () => {
    const [f1, setF1] = useState<number>(30);
    const [f2, setF2] = useState<number>(40);
    const [angle, setAngle] = useState<number>(90);

    const aRad = (angle * Math.PI) / 180;
    const rx = f1 + f2 * Math.cos(aRad);
    const ry = f2 * Math.sin(aRad);
    const R = Math.sqrt(rx * rx + ry * ry);
    const theta = Math.atan2(ry, rx) * (180 / Math.PI);
    const scale = 2.2;
    const ox = 150, oy = 150;

    const sliders: { label: string; val: number; set: (v: number) => void; color: string; cls: string; unit?: string; min: number; max: number }[] = [
        { label: "F₁", val: f1, set: setF1, color: "#3182ce", cls: "slider", min: 5, max: 60 },
        { label: "F₂", val: f2, set: setF2, color: "#e8a735", cls: "slider slider-orange", min: 5, max: 60 },
        { label: "Angolo θ", val: angle, set: setAngle, color: "#888", cls: "slider slider-gray", unit: "°", min: 0, max: 180 },
    ];

    return (
        <div style={card}>
            <div style={sectionTitle}>📐 Risultante di due forze</div>
            <div style={{ ...hintBox, marginBottom: 16 }}>
                👉 <strong>Mostra spiegazione</strong> — La forza totale o <strong>risultante</strong> è la somma vettoriale delle singole forze che agiscono su un oggetto. Quando due forze formano un angolo, si usa la regola del parallelogramma per trovare modulo e direzione della risultante.
            </div>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
                <svg viewBox="0 0 300 300" style={{ width: 260, height: 260, background: "#fafbfc", borderRadius: 10, border: "1px solid #e8ecf0" }}>
                    {Array.from({ length: 16 }, (_, i) => (
                        <g key={i}>
                            <line x1={i * 20} y1={0} x2={i * 20} y2={300} stroke="#f0f0f0" strokeWidth={0.5} />
                            <line x1={0} y1={i * 20} x2={300} y2={i * 20} stroke="#f0f0f0" strokeWidth={0.5} />
                        </g>
                    ))}
                    <line x1={ox} y1={15} x2={ox} y2={285} stroke="#ddd" strokeWidth={1} />
                    <line x1={15} y1={oy} x2={285} y2={oy} stroke="#ddd" strokeWidth={1} />
                    <line x1={ox + f1 * scale} y1={oy} x2={ox + rx * scale} y2={oy - ry * scale} stroke="#ccc" strokeWidth={0.8} strokeDasharray="4,3" />
                    <line x1={ox + f2 * Math.cos(aRad) * scale} y1={oy - f2 * Math.sin(aRad) * scale} x2={ox + rx * scale} y2={oy - ry * scale} stroke="#ccc" strokeWidth={0.8} strokeDasharray="4,3" />
                    <defs>
                        <marker id="aF1" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#3182ce" /></marker>
                        <marker id="aF2" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#e8a735" /></marker>
                        <marker id="aR" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><path d="M0,0 L10,3.5 L0,7" fill="#e05a3a" /></marker>
                    </defs>
                    <line x1={ox} y1={oy} x2={ox + f1 * scale} y2={oy} stroke="#3182ce" strokeWidth={2.5} markerEnd="url(#aF1)" />
                    <text x={ox + f1 * scale / 2} y={oy + 18} textAnchor="middle" fill="#3182ce" fontSize="12" fontWeight="bold">F₁</text>
                    <line x1={ox} y1={oy} x2={ox + f2 * Math.cos(aRad) * scale} y2={oy - f2 * Math.sin(aRad) * scale} stroke="#e8a735" strokeWidth={2.5} markerEnd="url(#aF2)" />
                    <text x={ox + f2 * Math.cos(aRad) * scale / 2 - 14} y={oy - f2 * Math.sin(aRad) * scale / 2 - 6} fill="#e8a735" fontSize="12" fontWeight="bold">F₂</text>
                    <line x1={ox} y1={oy} x2={ox + rx * scale} y2={oy - ry * scale} stroke="#e05a3a" strokeWidth={3} markerEnd="url(#aR)" />
                    <text x={ox + rx * scale / 2 + 12} y={oy - ry * scale / 2} fill="#e05a3a" fontSize="13" fontWeight="bold">R⃗</text>
                    {angle > 0 && angle < 360 && (
                        <path d={`M ${ox + 22} ${oy} A 22 22 0 ${angle > 180 ? 1 : 0} 0 ${ox + 22 * Math.cos(aRad)} ${oy - 22 * Math.sin(aRad)}`} fill="none" stroke="#999" strokeWidth={1} strokeDasharray="2,2" />
                    )}
                    <text x={ox + 28} y={oy - 6} fill="#999" fontSize="10">θ</text>
                </svg>

                <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 180, flex: 1 }}>
                    {sliders.map((s, i) => (
                        <label key={i} style={{ color: "#556" }}>
              <span style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 3 }}>
                <span style={{ fontWeight: 600 }}>{s.label}</span>
                <span style={{ color: s.color, fontFamily: "monospace" }}>{s.val}{s.unit || " N"}</span>
              </span>
                            <input type="range" min={s.min} max={s.max} value={s.val} onChange={e => s.set(+e.target.value)} className={s.cls} />
                        </label>
                    ))}
                    <div style={{ background: "#fafbfc", borderRadius: 10, padding: 14, border: "1px solid #e8ecf0", marginTop: 4 }}>
                        <div style={{ color: "#e05a3a", fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Risultante R⃗</div>
                        <div style={{ fontFamily: "monospace", fontSize: 13, lineHeight: 2, color: "#444" }}>
                            |R| = √(F₁² + F₂² + 2F₁F₂cos θ)<br />
                            |R| = <strong style={{ color: "#e05a3a" }}>{R.toFixed(1)} N</strong><br />
                            α = <strong style={{ color: "#e05a3a" }}>{theta.toFixed(1)}°</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Tab: Le Forze ───
const TabForze: React.FC = () => {
    const [mass, setMass] = useState<number>(2.5);
    const [showInfo, setShowInfo] = useState<"contatto" | "distanza">("contatto");
    const force = mass * 9.81;

    const forceExamples: { name: string; val: string }[] = [
        { name: "Motori navicella", val: "3,1 × 10⁷" },
        { name: "Locomotiva", val: "2,5 × 10⁵" },
        { name: "Motore jet", val: "7,5 × 10⁴" },
        { name: "Automobile", val: "7,0 × 10³" },
        { name: "Peso adulto", val: "7,0 × 10²" },
        { name: "Peso mela", val: "1,0 × 10⁰" },
        { name: "Peso formica", val: "1,0 × 10⁻³" },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                <div style={{ ...card, flex: "1 1 320px" }}>
                    <div style={sectionTitle}>💡 Che cos'è una forza?</div>
                    <p style={{ color: "#4a5568", lineHeight: 1.75, fontSize: 14, margin: "0 0 14px" }}>
                        Una forza è un'azione che un corpo esercita su un altro. Le forze modificano lo <strong style={{ color: "#3182ce" }}>stato di moto</strong> dei corpi o producono <strong style={{ color: "#3182ce" }}>deformazioni</strong>.
                    </p>
                    <p style={{ color: "#4a5568", lineHeight: 1.75, fontSize: 14, margin: "0 0 16px" }}>
                        Ogni forza è una <strong style={{ color: "#e8a735" }}>grandezza vettoriale</strong>: ha un modulo (intensità), una direzione e un verso.
                    </p>
                    <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                        {(["contatto", "distanza"] as const).map(t => (
                            <button key={t} onClick={() => setShowInfo(t)} style={{
                                flex: 1, padding: "9px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13,
                                border: showInfo === t ? "2px solid #3182ce" : "1px solid #e2e8f0",
                                background: showInfo === t ? "#ebf4ff" : "#fff",
                                color: showInfo === t ? "#3182ce" : "#888", transition: "all 0.2s"
                            }}>
                                {t === "contatto" ? "Per contatto" : "A distanza"}
                            </button>
                        ))}
                    </div>
                    <div style={hintBox}>
                        {showInfo === "contatto"
                            ? <>Colpire una palla con una racchetta, spingere un carrello, piantare un chiodo. Richiedono il <strong>contatto diretto</strong> tra i corpi.</>
                            : <>La forza di gravità, la forza magnetica, la forza elettrica. Agiscono <strong>senza contatto</strong> tra i corpi coinvolti.</>
                        }
                    </div>
                </div>

                <div style={{ ...card, flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <div style={sectionTitle}>🔧 Dinamometro</div>
                    <Dynamometer force={force} maxForce={50} />
                    <label style={{ color: "#556", width: "100%", maxWidth: 150 }}>
            <span style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
              <span>Massa</span>
              <span style={{ color: "#3182ce", fontFamily: "monospace", fontWeight: 600 }}>{mass.toFixed(1)} kg</span>
            </span>
                        <input type="range" min={0.1} max={5} step={0.1} value={mass} onChange={e => setMass(+e.target.value)} className="slider" />
                    </label>
                    <div style={{
                        fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: "#e05a3a",
                        background: "#fef5f3", border: "1px solid #fcd5ce", borderRadius: 8, padding: "6px 14px"
                    }}>
                        P = {mass.toFixed(1)} × 9,81 = {force.toFixed(1)} N
                    </div>
                </div>
            </div>

            <div style={card}>
                <div style={sectionTitle}>📊 Scala delle forze</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {forceExamples.map((f, i) => (
                        <div key={i} style={{
                            flex: "1 1 90px", background: "#fafbfc", borderRadius: 10, padding: "10px 8px",
                            border: "1px solid #e8ecf0", textAlign: "center", minWidth: 90
                        }}>
                            <div style={{ color: "#888", fontSize: 10, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.8 }}>{f.name}</div>
                            <div style={{ color: "#3182ce", fontFamily: "monospace", fontSize: 14, fontWeight: 700 }}>{f.val}</div>
                            <div style={{ color: "#bbb", fontSize: 10 }}>N</div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={hintBox}>
                <strong>📏 Il Newton (N)</strong> — Un newton è la forza che produce un allungamento della molla di un dinamometro uguale a quello prodotto da una massa appesa di <strong>1/9,81 kg</strong> (circa 102 g).
            </div>

            <ForceVectorDemo />
        </div>
    );
};

// ─── Tab: Forza Peso ───
const TabPeso: React.FC = () => {
    const [mass, setMass] = useState<number>(70);
    const [selectedPlanet, setSelectedPlanet] = useState<number>(2);
    const [comparePlanet, setComparePlanet] = useState<number>(3);

    const planet = PLANETS[selectedPlanet];
    const compare = PLANETS[comparePlanet];

    const massPresets: { label: string; mass: number; icon: string }[] = [
        { label: "Mela", mass: 0.1, icon: "🍎" },
        { label: "Libro", mass: 0.5, icon: "📕" },
        { label: "Persona", mass: 70, icon: "🧑" },
        { label: "Auto", mass: 1200, icon: "🚗" },
        { label: "Perseverance", mass: 1025, icon: "🤖" },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ ...card, textAlign: "center" as const, background: "#fef5f3", border: "1px solid #fcd5ce" }}>
                <div style={{ fontSize: 34, fontWeight: 700, color: "#e05a3a", fontFamily: "serif", fontStyle: "italic" }}>P = mg</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 28, marginTop: 10, fontSize: 13, color: "#777" }}>
                    <span><strong style={{ color: "#e05a3a" }}>P</strong> = peso (N)</span>
                    <span><strong style={{ color: "#3182ce" }}>m</strong> = massa (kg)</span>
                    <span><strong style={{ color: "#e8a735" }}>g</strong> = acc. gravità (N/kg)</span>
                </div>
            </div>

            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                <div style={{ ...card, flex: "1 1 300px" }}>
                    <div style={sectionTitle}>⚖️ Scegli un oggetto</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                        {massPresets.map((p, i) => (
                            <button key={i} onClick={() => setMass(p.mass)} style={{
                                padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13,
                                display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s",
                                border: mass === p.mass ? "2px solid #3182ce" : "1px solid #e2e8f0",
                                background: mass === p.mass ? "#ebf4ff" : "#fff",
                                color: mass === p.mass ? "#3182ce" : "#666", fontWeight: mass === p.mass ? 600 : 400
                            }}>
                                <span>{p.icon}</span> {p.label}
                                <span style={{ fontSize: 10, opacity: 0.6 }}>{p.mass} kg</span>
                            </button>
                        ))}
                    </div>

                    <label style={{ color: "#556", display: "block", marginBottom: 16 }}>
            <span style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 3 }}>
              <span style={{ fontWeight: 600 }}>Massa personalizzata</span>
              <span style={{ fontFamily: "monospace", color: "#3182ce", fontWeight: 600 }}>{mass} kg</span>
            </span>
                        <input type="range" min={0.01} max={2000} step={mass < 10 ? 0.1 : 1} value={mass} onChange={e => setMass(+e.target.value)} className="slider" />
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#aaa" }}>
                            <span>0,01 kg</span><span>2000 kg</span>
                        </div>
                    </label>

                    <div style={hintBox}>
                        <strong style={{ color: "#c05621" }}>⚠️ Peso ≠ Massa</strong>
                        <p style={{ margin: "8px 0 4px" }}>La <strong style={{ color: "#3182ce" }}>massa</strong> è una proprietà intrinseca del corpo (kg). Resta invariata ovunque.</p>
                        <p style={{ margin: 0 }}>Il <strong style={{ color: "#e05a3a" }}>peso</strong> è una forza (N). Dipende dal valore di <em>g</em> e quindi dal corpo celeste.</p>
                    </div>
                </div>

                <div style={{ ...card, flex: "1 1 300px" }}>
                    <div style={sectionTitle}>🪐 Confronta pianeti</div>
                    <div style={{ display: "flex", gap: 14 }}>
                        {[{ idx: selectedPlanet, set: setSelectedPlanet }, { idx: comparePlanet, set: setComparePlanet }].map((s, si) => {
                            const p = PLANETS[s.idx];
                            const w = mass * p.g;
                            return (
                                <div key={si} style={{ flex: 1, textAlign: "center" as const }}>
                                    <select value={s.idx} onChange={e => s.set(+e.target.value)} style={{
                                        width: "100%", padding: 8, borderRadius: 8, border: "1px solid #e2e8f0",
                                        background: "#fafbfc", color: "#444", fontSize: 13, marginBottom: 12
                                    }}>
                                        {PLANETS.map((pl, i) => <option key={i} value={i}>{pl.icon} {pl.name}</option>)}
                                    </select>
                                    <div style={{
                                        width: p.radius * 1.8, height: p.radius * 1.8, borderRadius: "50%", margin: "0 auto 10px",
                                        background: `radial-gradient(circle at 35% 35%, ${p.color}dd, ${p.color}66)`,
                                        boxShadow: `0 0 16px ${p.color}22`
                                    }} />
                                    <div style={{ color: "#888", fontFamily: "monospace", fontSize: 13 }}>g = {p.g} N/kg</div>
                                    <div style={{ color: "#e05a3a", fontFamily: "monospace", fontSize: 22, fontWeight: 700, margin: "6px 0" }}>
                                        {w < 100 ? w.toFixed(2) : w.toFixed(0)} N
                                    </div>
                                    <div style={{ color: "#aaa", fontSize: 11 }}>P = {mass} × {p.g}</div>
                                </div>
                            );
                        })}
                    </div>
                    <div style={{ marginTop: 14, background: "#fafbfc", borderRadius: 10, padding: 12, border: "1px solid #e8ecf0", textAlign: "center" as const }}>
                        <div style={{ color: "#888", fontSize: 12, marginBottom: 6 }}>Rapporto pesi</div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
                            <span style={{ color: planet.color, fontWeight: 700, fontSize: 13 }}>{planet.name}</span>
                            <div style={{ width: 100, height: 8, background: "#e8ecf0", borderRadius: 4, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${(planet.g / Math.max(planet.g, compare.g)) * 100}%`, background: planet.color, borderRadius: 4, transition: "width 0.3s" }} />
                            </div>
                            <span style={{ color: "#666", fontFamily: "monospace", fontSize: 13 }}>{(planet.g / compare.g).toFixed(2)}×</span>
                            <div style={{ width: 100, height: 8, background: "#e8ecf0", borderRadius: 4, overflow: "hidden", direction: "rtl" }}>
                                <div style={{ height: "100%", width: `${(compare.g / Math.max(planet.g, compare.g)) * 100}%`, background: compare.color, borderRadius: 4, transition: "width 0.3s" }} />
                            </div>
                            <span style={{ color: compare.color, fontWeight: 700, fontSize: 13 }}>{compare.name}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={card}>
                <div style={sectionTitle}>📊 Peso di {mass} kg nel sistema solare</div>
                <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 200, padding: "0 4px" }}>
                    {PLANETS.map((p, i) => {
                        const w = mass * p.g;
                        const maxW = mass * 24.79;
                        const barH = Math.max((w / maxW) * 160, 4);
                        return (
                            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                                <div style={{ color: "#666", fontFamily: "monospace", fontSize: 10, whiteSpace: "nowrap" }}>
                                    {w < 100 ? w.toFixed(1) : w.toFixed(0)} N
                                </div>
                                <div style={{
                                    width: "100%", maxWidth: 36, height: barH, borderRadius: "6px 6px 2px 2px",
                                    background: `linear-gradient(to top, ${p.color}77, ${p.color}cc)`,
                                    transition: "height 0.4s ease"
                                }} />
                                <div style={{ color: "#888", fontSize: 9, textAlign: "center" as const, lineHeight: 1.2 }}>
                                    {p.icon}<br /><span style={{ fontSize: 8 }}>{p.name}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <ExercisePeso />
        </div>
    );
};

// ─── Exercise ───
const ExercisePeso: React.FC = () => {
    const [showSolution, setShowSolution] = useState<boolean>(false);
    const [userAnswer, setUserAnswer] = useState<string>("");
    const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

    const checkAnswer = (): void => {
        const val = parseFloat(userAnswer.replace(",", "."));
        if (Math.abs(val - 8.0) < 0.2) setFeedback("correct");
        else if (!isNaN(val)) setFeedback("wrong");
    };

    return (
        <div style={{ ...card, background: "#f0faf0", border: "1px solid #c6e6c6" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{
            background: "#38a169", color: "#fff", padding: "3px 10px", borderRadius: 6,
            fontSize: 11, fontWeight: 700, letterSpacing: 1
        }}>PROVA TU</span>
            </div>
            <p style={{ color: "#2d4a3e", margin: "0 0 14px", fontSize: 14, lineHeight: 1.75 }}>
                Su un pianeta lontano, un astronauta raccoglie una roccia. La roccia ha una massa di <strong style={{ color: "#3182ce" }}>5,00 kg</strong> e su quel particolare pianeta il suo peso è di <strong style={{ color: "#e05a3a" }}>40,0 N</strong>: qual è l'accelerazione di gravità sul pianeta?
            </p>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
                <input
                    type="text" placeholder="g = ? N/kg" value={userAnswer}
                    onChange={e => { setUserAnswer(e.target.value); setFeedback(null); }}
                    onKeyDown={e => e.key === "Enter" && checkAnswer()}
                    style={{
                        padding: "8px 14px", borderRadius: 8, fontSize: 14, fontFamily: "monospace", width: 140,
                        border: `2px solid ${feedback === "correct" ? "#38a169" : feedback === "wrong" ? "#e05a3a" : "#e2e8f0"}`,
                        background: "#fff", color: "#333", transition: "border-color 0.2s"
                    }}
                />
                <button onClick={checkAnswer} style={{
                    padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer",
                    background: "#3182ce", color: "#fff", fontWeight: 600, fontSize: 13
                }}>Verifica</button>
                <button onClick={() => setShowSolution(!showSolution)} style={{
                    padding: "8px 18px", borderRadius: 8, border: "1px solid #ccc", cursor: "pointer",
                    background: "#fff", color: "#666", fontWeight: 600, fontSize: 13
                }}>{showSolution ? "Nascondi" : "Soluzione"}</button>
            </div>

            {feedback === "correct" && <div style={{ color: "#38a169", fontSize: 13, fontWeight: 600 }}>✓ Corretto! g = 8,0 N/kg</div>}
            {feedback === "wrong" && <div style={{ color: "#e05a3a", fontSize: 13 }}>✗ Riprova. Ricorda: P = mg, quindi g = P/m</div>}

            {showSolution && (
                <div style={{ background: "#fff", borderRadius: 10, padding: 14, marginTop: 10, border: "1px solid #d0e6d0" }}>
                    <div style={{ fontFamily: "monospace", fontSize: 14, lineHeight: 2.2, color: "#444" }}>
                        <div>P = m · g</div>
                        <div>g = P / m</div>
                        <div>g = 40,0 N / 5,00 kg</div>
                        <div style={{ color: "#38a169", fontWeight: 700 }}>g = 8,0 N/kg</div>
                    </div>
                    <div style={{ marginTop: 8, color: "#38a169", fontWeight: 600, fontSize: 13 }}>✓ La formula è verificata!</div>
                </div>
            )}
        </div>
    );
};

// ─── Main ───
const ForzaDemo: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>("forze");

    return (
        <div style={{
            minHeight: "100vh",
            background: "#f4f6f8",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            padding: "24px 16px"
        }}>
            <div style={{ maxWidth: 880, margin: "0 auto" }}>
                {/* Header */}
                <a href="/" style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    color: "#3182ce", textDecoration: "none", fontSize: 14, marginBottom: 12,
                    fontWeight: 500
                }}>
                    ← Torna alla home
                </a>
                <h1 style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 800, color: "#1a2b3c" }}>Le Forze</h1>
                <p style={{ margin: "0 0 20px", fontSize: 14, color: "#718096" }}>
                    Dinamometro, forza peso e risultante di forze
                </p>

                <div style={{
                    display: "flex", gap: 0, marginBottom: 24, background: "#fff", borderRadius: 12,
                    padding: 4, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                }}>
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            disabled={tab.disabled}
                            onClick={() => !tab.disabled && setActiveTab(tab.id)}
                            style={{
                                flex: 1, padding: "10px 14px", borderRadius: 8, border: "none",
                                cursor: tab.disabled ? "not-allowed" : "pointer",
                                background: activeTab === tab.id ? "#3182ce" : "transparent",
                                color: tab.disabled ? "#ccc" : activeTab === tab.id ? "#fff" : "#666",
                                fontWeight: 600, fontSize: 13.5, transition: "all 0.2s",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                opacity: tab.disabled ? 0.5 : 1, minWidth: 0
                            }}
                        >
                            <span style={{ fontSize: 15 }}>{tab.icon}</span>
                            <span>{tab.label}</span>
                            {tab.disabled && <span style={{ fontSize: 9, background: "#f0f0f0", color: "#aaa", padding: "1px 6px", borderRadius: 4 }}>soon</span>}
                        </button>
                    ))}
                </div>

                {activeTab === "forze" && <TabForze />}
                {activeTab === "peso" && <TabPeso />}
            </div>

            <style>{`
        .slider {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          outline: none;
          -webkit-appearance: none;
          appearance: none;
          background: #e2e8f0;
          cursor: pointer;
        }
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #3182ce;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        }
        .slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #3182ce;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        }
        .slider::-moz-range-track {
          height: 6px;
          border-radius: 3px;
          background: #e2e8f0;
        }
        .slider-orange::-webkit-slider-thumb { background: #e8a735; }
        .slider-orange::-moz-range-thumb { background: #e8a735; }
        .slider-gray::-webkit-slider-thumb { background: #888; }
        .slider-gray::-moz-range-thumb { background: #888; }
        .slider-red::-webkit-slider-thumb { background: #e05a3a; }
        .slider-red::-moz-range-thumb { background: #e05a3a; }
        select:focus, input:focus { outline: none; }
      `}</style>
        </div>
    );
};

export default ForzaDemo;