/**
 * ForzaElasticaDemo — Legge di Hooke: F = kx
 */

import React, { useState } from "react";
import {
    DemoContainer,
    InfoBox,
    useBreakpoint,
    ResponsiveGrid,
} from "../../components/ui";

// ============ HELPER ============

function sliderFillStyle(val: number, min: number, max: number, color: string): React.CSSProperties {
    const pct = ((val - min) / (max - min)) * 100;
    return {
        width: "100%", height: 8, borderRadius: 4,
        appearance: "none" as const, outline: "none", cursor: "pointer",
        background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, #e2e8f0 ${pct}%, #e2e8f0 100%)`,
    };
}

// ============ VISUALIZZAZIONE MOLLA ============

interface SpringSVGProps {
    k: number;
    x: number;
    isMobile: boolean;
    showElasticForce?: boolean;
    showAppliedForce?: boolean;
    showDisplacement?: boolean;
}

function SpringSVG({ k, x, isMobile, showElasticForce = true, showAppliedForce = true, showDisplacement = true }: SpringSVGProps) {
    const W = isMobile ? 340 : 480;
    const H = 140;
    const wallX = 30;
    const restX = wallX + 120;
    const isCompressed = x < 0;
    const maxExtRight = W - restX - 70;
    const maxExtLeft = restX - wallX - 20;
    const maxAllowed = isCompressed ? maxExtLeft : maxExtRight;
    const extPx = Math.min(Math.abs(x) * 250, maxAllowed);
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
    const maxArrowLen = W * 0.25;
    const arrowLen = x !== 0 ? Math.min(Math.max(extPx * 0.6, 14), maxArrowLen) : 0;

    const elX1 = isCompressed ? tipX + 12 : tipX - 12;
    const elX2 = isCompressed ? elX1 + arrowLen : elX1 - arrowLen;
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

            {Array.from({ length: 6 }, (_, i) => (
                <line key={i} x1={wallX} y1={i * 14} x2={wallX - 10} y2={i * 14 + 14} stroke="#94a3b8" strokeWidth={1.5} />
            ))}
            <line x1={wallX} y1={0} x2={wallX} y2={H} stroke="#64748b" strokeWidth={2} />

            <line x1={restX} y1={10} x2={restX} y2={H - 10} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="4,3" />
            <text x={restX} y={8} textAnchor="middle" fill="#94a3b8" fontSize="8">{"eq"}</text>

            <path d={path} fill="none" stroke="#e05a3a" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

            <rect x={tipX - 12} y={springY - 16} width={24} height={32} rx={4} fill="#4a6fa5" stroke="#3d5f8f" strokeWidth={1} />
            <text x={tipX} y={springY + 5} textAnchor="middle" fill="#fff" fontSize="9">{"m"}</text>

            <line x1={wallX} y1={springY + 16} x2={W - 10} y2={springY + 16} stroke="#94a3b8" strokeWidth={1} strokeDasharray="3,2" />

            {showDisplacement && x !== 0 && (
                <>
                    <line x1={restX} y1={springY + 44}
                          x2={isCompressed ? tipX + 5 : tipX - 5} y2={springY + 44}
                          stroke="#64748b" strokeWidth={1.5} markerEnd="url(#aDisp)" />
                    <text x={(restX + tipX) / 2} y={springY + 56} textAnchor="middle" fill="#64748b" fontSize="9" fontStyle="italic">
                        {xLabel}
                    </text>
                </>
            )}

            {showElasticForce && x !== 0 && arrowLen > 0 && (
                <>
                    <line x1={elX1} y1={springY - 24} x2={elX2} y2={springY - 24}
                          stroke={arrowColor} strokeWidth={2.5} markerEnd="url(#aEl)" />
                    <text x={(elX1 + elX2) / 2} y={springY - 28}
                          textAnchor="middle" fill={arrowColor} fontSize="8" fontWeight="bold">
                        {forceLabel}
                    </text>
                </>
            )}

            {showAppliedForce && x !== 0 && arrowLen > 0 && (
                <>
                    <line x1={appX1} y1={springY + 24} x2={appX2} y2={springY + 24}
                          stroke="#3b82f6" strokeWidth={2.5} markerEnd="url(#aApp)" />
                    <text x={(appX1 + appX2) / 2} y={springY + 36}
                          textAnchor="middle" fill="#3b82f6" fontSize="8" fontWeight="bold">
                        {appLabel}
                    </text>
                </>
            )}

            <text x={8} y={H - 6} fill="#94a3b8" fontSize="7">
                {x > 0 ? "Allungamento" : x < 0 ? "Compressione" : "Equilibrio"}
            </text>
        </svg>
    );
}

// ============ GRAFICO F vs x ============

function HookeChart({ k, x, isMobile }: { k: number; x: number; isMobile: boolean }) {
    const W = isMobile ? 240 : 300;
    const H = 180;
    const pad = { l: 40, r: 16, t: 16, b: 36 };
    const gW = W - pad.l - pad.r;
    const gH = H - pad.t - pad.b;
    const xMax = 0.5;
    const fMax = 100;
    const toSvgX = (xv: number) => pad.l + (xv / xMax) * gW;
    const toSvgY = (fv: number) => pad.t + gH - (fv / fMax) * gH;
    const xTicks = [0, 0.1, 0.2, 0.3, 0.4, 0.5];
    const fTicks = [0, 25, 50, 75, 100];
    const currentX = Math.abs(x);
    const currentF = k * currentX;
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
            <line x1={toSvgX(0)} y1={toSvgY(0)} x2={toSvgX(lineEndX)} y2={toSvgY(lineEndF)} stroke="#16a34a" strokeWidth={2} />
            <text x={toSvgX(lineEndX) + 4} y={toSvgY(lineEndF) - 4} fill="#16a34a" fontSize="9" fontWeight="bold">{"F = " + k + "x"}</text>
            {currentX > 0 && currentX <= xMax && currentF <= fMax && (
                <>
                    <line x1={toSvgX(currentX)} y1={H - pad.b} x2={toSvgX(currentX)} y2={toSvgY(currentF)} stroke="#dc2626" strokeWidth={1} strokeDasharray="3,2" />
                    <line x1={pad.l} y1={toSvgY(currentF)} x2={toSvgX(currentX)} y2={toSvgY(currentF)} stroke="#dc2626" strokeWidth={1} strokeDasharray="3,2" />
                    <circle cx={toSvgX(currentX)} cy={toSvgY(currentF)} r={4} fill="#dc2626" />
                    <text x={toSvgX(currentX) + 5} y={toSvgY(currentF) - 4} fill="#dc2626" fontSize="8" fontWeight="bold">{currentF.toFixed(1) + " N"}</text>
                </>
            )}
            {currentX > 0 && currentF > fMax && (
                <text x={W / 2} y={pad.t + 12} textAnchor="middle" fill="#dc2626" fontSize="8">
                    {"F = " + currentF.toFixed(1) + " N (fuori scala)"}
                </text>
            )}
        </svg>
    );
}

// ============ ESERCIZIO ============

function ExerciseElastica() {
    const [showSol, setShowSol] = useState(false);
    const [ans, setAns] = useState("");
    const [fb, setFb] = useState<"correct" | "wrong" | null>(null);
    const check = () => {
        const v = parseFloat(ans.replace(",", "."));
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

// ============ COMPONENTE PRINCIPALE ============

export default function ForzaElasticaDemo() {
    const { isMobile } = useBreakpoint();
    const [k, setK] = useState<number>(50);
    const [appliedForce, setAppliedForce] = useState<number>(10);

    const x = appliedForce / k;
    const force = Math.abs(appliedForce);

    const [showElasticForce, setShowElasticForce] = useState(true);
    const [showAppliedForce, setShowAppliedForce] = useState(true);
    const [showDisplacement, setShowDisplacement] = useState(true);

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
                    <span style={{ fontWeight: 600 }}>{"Forza applicata F"}<sub>{"app"}</sub></span>
                    <span style={{ color: "#3b82f6", fontFamily: "monospace", fontWeight: 700 }}>
                        {(appliedForce >= 0 ? "+" : "") + appliedForce.toFixed(1) + " N (" + (appliedForce >= 0 ? "tira" : "comprime") + ")"}
                    </span>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="range" min={-40} max={40} step={1} value={appliedForce} onChange={e => setAppliedForce(+e.target.value)} style={{ ...sliderFillStyle(appliedForce, -40, 40, "#3b82f6"), flex: 1 }} />
                    <button onClick={() => setAppliedForce(0)} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #d1d5db", background: appliedForce === 0 ? "#f1f5f9" : "#fff", color: appliedForce === 0 ? "#94a3b8" : "#334155", fontSize: 11, fontWeight: 600, cursor: appliedForce === 0 ? "default" : "pointer", whiteSpace: "nowrap" }} disabled={appliedForce === 0}>
                        {"Equilibrio"}
                    </button>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
                    <span>{"← Comprime (−40 N)"}</span><span>{"Tira (+40 N) →"}</span>
                </div>
            </div>

            <div style={{ padding: "10px 14px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8, fontWeight: 600 }}>{"Mostra nel grafico:"}</div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13 }}>
                        <input type="checkbox" checked={showElasticForce} onChange={e => setShowElasticForce(e.target.checked)} style={{ width: 16, height: 16, accentColor: "#16a34a" }} />
                        <span style={{ color: "#16a34a", fontWeight: 600 }}>{"Forza elastica"}</span>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13 }}>
                        <input type="checkbox" checked={showAppliedForce} onChange={e => setShowAppliedForce(e.target.checked)} style={{ width: 16, height: 16, accentColor: "#3b82f6" }} />
                        <span style={{ color: "#3b82f6", fontWeight: 600 }}>{"Forza applicata"}</span>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13 }}>
                        <input type="checkbox" checked={showDisplacement} onChange={e => setShowDisplacement(e.target.checked)} style={{ width: 16, height: 16, accentColor: "#64748b" }} />
                        <span style={{ color: "#64748b", fontWeight: 600 }}>{"Spostamento x"}</span>
                    </label>
                </div>
            </div>

            <div style={{ padding: "12px 16px", background: "#fef2f2", borderRadius: 10, border: "1px solid #fecaca" }}>
                <div style={{ color: "#dc2626", fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{"Risultato"}</div>
                <div style={{ fontFamily: "monospace", fontSize: 13, lineHeight: 2, color: "#334155" }}>
                    {"x = F / k = " + Math.abs(appliedForce).toFixed(1) + " / " + k + " = "}
                    <strong style={{ color: x >= 0 ? "#16a34a" : "#7c3aed" }}>{(x >= 0 ? "+" : "") + x.toFixed(3) + " m"}</strong>
                    {" (" + (x >= 0 ? "allungamento" : "compressione") + ")"}
                </div>
                <div style={{ fontFamily: "monospace", fontSize: 13, lineHeight: 2, color: "#334155", marginTop: 4 }}>
                    {"F"}{"ₑₗ"}{" = k · |x| = " + k + " · " + Math.abs(x).toFixed(3) + " = "}
                    <strong style={{ color: "#dc2626" }}>{force.toFixed(1) + " N"}</strong>
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                    {"All'equilibrio: F"}{"ₑₗ"}{" = F"}{"ₐₚₚ"}{" (in modulo), ma "}<strong>{"direzioni opposte"}</strong>
                </div>
            </div>
        </div>
    );

    return (
        <DemoContainer
            title="Forza Elastica"
            description="Legge di Hooke: F = k·x — Molla interattiva"
        >
            <div style={{ display: "grid", gap: 14 }}>
                {FormulaCard}

                <InfoBox title="🧲 Visualizzazione interattiva della molla">
                    <SpringSVG k={k} x={x} isMobile={isMobile} showElasticForce={showElasticForce} showAppliedForce={showAppliedForce} showDisplacement={showDisplacement} />
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

                <div style={{ padding: "12px 16px", background: "#fffbeb", borderRadius: 10, border: "1px solid #fde68a", fontSize: 13, color: "#92400e", lineHeight: 1.7 }}>
                    <strong>{"📌 Nota importante"}</strong>
                    <p style={{ margin: "8px 0 0" }}>
                        {"La legge di Hooke è "}<strong>{"empirica"}</strong>{", non universale. Vale per allungamenti e compressioni piccoli. Oltre un certo limite, la molla si deforma permanentemente. Si parla di "}<strong>{"molle ideali"}</strong>{" per quelle che obbediscono esattamente alla legge di Hooke."}
                    </p>
                </div>

                <ExerciseElastica />
            </div>
        </DemoContainer>
    );
}
