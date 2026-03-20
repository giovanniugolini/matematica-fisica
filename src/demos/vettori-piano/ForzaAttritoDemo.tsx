/**
 * ForzaAttritoDemo — Forza d'Attrito: Fs,max = μs·N e Fd = μd·N
 */

import React, { useState } from "react";
import {
    DemoContainer,
    InfoBox,
    useBreakpoint,
    ResponsiveGrid,
} from "../../components/ui";

// ============ COSTANTI ============

const FRICTION_MATERIALS = [
    { material: "Gomma su cemento (asciutto)", mud: 0.80, mus: 1.00 },
    { material: "Acciaio su acciaio",          mud: 0.57, mus: 0.74 },
    { material: "Vetro su vetro",              mud: 0.40, mus: 0.94 },
    { material: "Legno su pelle",              mud: 0.40, mus: 0.50 },
    { material: "Gomma su cemento (bagnato)",  mud: 0.25, mus: 0.30 },
    { material: "Sci sciolinati su neve",      mud: 0.05, mus: 0.10 },
    { material: "Articolazione ginocchio",     mud: 0.003, mus: 0.01 },
];

// ============ HELPER ============

function sliderFillStyle(val: number, min: number, max: number, color: string): React.CSSProperties {
    const pct = ((val - min) / (max - min)) * 100;
    return {
        width: "100%", height: 8, borderRadius: 4,
        appearance: "none" as const, outline: "none", cursor: "pointer",
        background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, #e2e8f0 ${pct}%, #e2e8f0 100%)`,
    };
}

// ============ VISUALIZZAZIONE ATTRITO ============

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
                <marker id="aFF" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill={isMoving ? "#dc2626" : "#f59e0b"} /></marker>
                <marker id="aFW" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto"><path d="M0,0 L7,2.5 L0,5" fill="#6b7280" /></marker>
                <marker id="aFN" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto"><path d="M0,0 L7,2.5 L0,5" fill="#8b5cf6" /></marker>
            </defs>

            <rect x={0} y={groundY} width={W} height={H - groundY} fill="#e2e8f0" />
            {Array.from({ length: 12 }, (_, i) => (
                <line key={i} x1={i * 36 + 4} y1={groundY} x2={i * 36 - 8} y2={groundY + 12} stroke="#cbd5e1" strokeWidth={1} />
            ))}

            <rect x={blockX} y={blockY} width={blockW} height={blockH} rx={4}
                  fill={isMoving ? "#fef3c7" : "#dbeafe"} stroke={isMoving ? "#d97706" : "#3b82f6"} strokeWidth={1.5} />
            <text x={blockX + blockW / 2} y={blockY + blockH / 2 + 5} textAnchor="middle" fill="#1e293b" fontSize="11" fontWeight="bold">{"m"}</text>

            {isMoving && (
                <>
                    {[8, 16, 24].map((d, i) => (
                        <line key={i} x1={blockX - d} y1={blockY + 8 + i * 6} x2={blockX - d - 12} y2={blockY + 8 + i * 6} stroke="#d97706" strokeWidth={1.5} strokeDasharray="2,2" />
                    ))}
                    <text x={blockX + blockW / 2} y={blockY - 8} textAnchor="middle" fill="#d97706" fontSize="9" fontWeight="bold">{"IN MOTO →"}</text>
                </>
            )}

            {appArrowLen > 0 && (
                <>
                    <line x1={blockX + blockW} y1={blockY + blockH / 2} x2={blockX + blockW + appArrowLen} y2={blockY + blockH / 2} stroke="#3b82f6" strokeWidth={2.5} markerEnd="url(#aFA)" />
                    <text x={blockX + blockW + appArrowLen / 2} y={blockY + blockH / 2 - 6} textAnchor="middle" fill="#3b82f6" fontSize="9" fontWeight="bold">{"F=" + appliedF.toFixed(0) + "N"}</text>
                </>
            )}

            {frArrowLen > 0 && (
                <>
                    <line x1={blockX} y1={blockY + blockH / 2} x2={blockX - frArrowLen} y2={blockY + blockH / 2} stroke={isMoving ? "#dc2626" : "#f59e0b"} strokeWidth={2.5} markerEnd="url(#aFF)" />
                    <text x={blockX - frArrowLen / 2} y={blockY + blockH / 2 - 6} textAnchor="middle" fill={isMoving ? "#dc2626" : "#f59e0b"} fontSize="9" fontWeight="bold">
                        {(isMoving ? "Fd" : "Fs") + "=" + frictionMag.toFixed(0) + "N"}
                    </text>
                </>
            )}

            <line x1={blockX + blockW / 2} y1={blockY + blockH} x2={blockX + blockW / 2} y2={blockY + blockH + weightArrowLen} stroke="#6b7280" strokeWidth={2} markerEnd="url(#aFW)" />
            <text x={blockX + blockW / 2 + 6} y={blockY + blockH + weightArrowLen / 2} fill="#6b7280" fontSize="8" fontStyle="italic">{"P"}</text>

            <line x1={blockX + blockW / 2} y1={blockY} x2={blockX + blockW / 2} y2={blockY - normalArrowLen} stroke="#8b5cf6" strokeWidth={2} markerEnd="url(#aFN)" />
            <text x={blockX + blockW / 2 + 6} y={blockY - normalArrowLen / 2} fill="#8b5cf6" fontSize="8" fontStyle="italic">{"N"}</text>

            <text x={8} y={H - 14} fill="#64748b" fontSize="8">
                {isMoving
                    ? "Attrito dinamico Fd = \u03BCd\u00B7N = " + Fd.toFixed(1) + " N"
                    : "Attrito statico Fs \u2264 Fs,max = \u03BCs\u00B7N = " + Fs_max.toFixed(1) + " N"
                }
            </text>
        </svg>
    );
}

// ============ ESERCIZIO ============

function ExerciseAttrito() {
    const [showSol, setShowSol] = useState(false);
    const [ans, setAns] = useState("");
    const [fb, setFb] = useState<"correct" | "wrong" | null>(null);
    const check = () => {
        const v = parseFloat(ans.replace(",", "."));
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

// ============ COMPONENTE PRINCIPALE ============

export default function ForzaAttritoDemo() {
    const { isMobile } = useBreakpoint();
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
        <DemoContainer
            title="Forza d'Attrito"
            description="Attrito statico e dinamico: Fs,max = μs·N e Fd = μd·N"
        >
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
                        <InfoBox title="📊 Coefficienti di attrito (Tabella)">{MaterialTable}</InfoBox>
                    </>
                ) : (
                    <ResponsiveGrid columns={{ tablet: 2, desktop: 2 }} gap={14}>
                        <InfoBox title="🎛️ Parametri">{Controls}</InfoBox>
                        <InfoBox title="📊 Coefficienti di attrito (Tabella)">{MaterialTable}</InfoBox>
                    </ResponsiveGrid>
                )}

                <ExerciseAttrito />
            </div>
        </DemoContainer>
    );
}
