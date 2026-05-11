/**
 * ForzaLorentzDemo – Forza di Lorentz su una carica in moto in un campo B uniforme.
 *
 * Tre orientazioni di B:
 *   ⊙ uscente  – B perpendicolare al piano, verso l'osservatore
 *   ⊗ entrante – B perpendicolare al piano, lontano dall'osservatore
 *   → orizzontale – B nel piano della pagina, da sinistra a destra
 *
 * Slider: modulo e direzione di v.
 * Checkbox: mostra/nascondi F = qv×B.
 * La lunghezza della freccia F scala con |F|.
 */
import React, { useState } from "react";
import { DemoContainer, InfoBox, useBreakpoint } from "../../components/ui";

const B_MAG  = 0.50;      // Tesla
const Q_ABS  = 1.60e-19;  // C
const V_UNIT = 1e6;       // m/s per unità slider

type BDir = "out" | "in" | "right";

// ── helpers ───────────────────────────────────────────────────────────────────

function sliderFill(val: number, min: number, max: number, col: string): React.CSSProperties {
    const pct = ((val - min) / (max - min)) * 100;
    return {
        width: "100%", height: 8, borderRadius: 4,
        appearance: "none" as const, outline: "none", cursor: "pointer",
        background: `linear-gradient(to right,${col} 0%,${col} ${pct}%,#e2e8f0 ${pct}%,#e2e8f0 100%)`,
    };
}

const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
function formatSci(val: number): string {
    if (val === 0) return "0";
    const exp  = Math.floor(Math.log10(Math.abs(val)));
    const mant = val / Math.pow(10, exp);
    const expStr = String(Math.abs(exp)).split("").map(d => SUP[+d]).join("");
    return `${mant.toFixed(2)}×10${exp < 0 ? "⁻" : ""}${expStr}`;
}

function dirLabel(a: number): string {
    if (a <= 10 || a >= 350)       return "(→)";
    if (a > 10  && a < 80)         return "(↗)";
    if (a >= 80 && a <= 100)       return "(↑)";
    if (a > 100 && a < 170)        return "(↖)";
    if (a >= 170 && a <= 190)      return "(←)";
    if (a > 190 && a < 260)        return "(↙)";
    if (a >= 260 && a <= 280)      return "(↓)";
    return "(↘)";
}

// ── SVG: freccia con etichetta ────────────────────────────────────────────────
function Arrow({ x1, y1, dx, dy, color, label, sw = 2.6 }: {
    x1: number; y1: number; dx: number; dy: number;
    color: string; label?: string; sw?: number;
}) {
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 5) return null;
    const ux = dx / len, uy = dy / len;
    const nx = -uy, ny = ux;
    const hs = sw * 4;
    const x2 = x1 + dx, y2 = y1 + dy;
    const hx = x2 - ux * hs, hy = y2 - uy * hs;
    return (
        <g>
            <line x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={color} strokeWidth={sw} strokeLinecap="round" />
            <polygon
                points={`${x2},${y2} ${hx + nx*hs*0.5},${hy + ny*hs*0.5} ${hx - nx*hs*0.5},${hy - ny*hs*0.5}`}
                fill={color} />
            {label && (
                <text x={(x2 + nx*16).toFixed(1)} y={(y2 + ny*16 + 1).toFixed(1)}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={13} fontWeight="700" fill={color}
                    fontFamily="system-ui,sans-serif">{label}</text>
            )}
        </g>
    );
}

// ── SVG: arco angolo (da angDeg=0 verso vAngle, CCW matematico) ───────────────
function AngleArc({ cx, cy, r, toDeg }: { cx: number; cy: number; r: number; toDeg: number }) {
    const steps = 32;
    const toRad = (toDeg * Math.PI) / 180;
    const pts   = Array.from({ length: steps + 1 }, (_, i) => {
        const θ = toRad * i / steps;
        return `${(cx + r * Math.cos(θ)).toFixed(1)},${(cy - r * Math.sin(θ)).toFixed(1)}`;
    });
    // etichetta al centro dell'arco
    const mid = toRad / 2;
    const lx  = cx + (r + 14) * Math.cos(mid);
    const ly  = cy - (r + 14) * Math.sin(mid);
    const displayDeg = Math.round(toDeg <= 180 ? toDeg : 360 - toDeg);
    return (
        <g>
            <polyline points={pts.join(" ")} stroke="#f97316" strokeWidth={1.5}
                fill="none" opacity={0.75} />
            <text x={lx.toFixed(1)} y={(ly + 1).toFixed(1)}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={12} fontWeight="600" fill="#f97316"
                fontFamily="system-ui,sans-serif">θ={displayDeg}°</text>
        </g>
    );
}

// ── ToggleGroup ───────────────────────────────────────────────────────────────
function ToggleGroup<T extends string | number>({ label, options, value, onChange, activeColor }: {
    label: string;
    options: { value: T; label: string }[];
    value: T;
    onChange: (v: T) => void;
    activeColor: (v: T) => string;
}) {
    return (
        <div style={{ flex: 1, minWidth: 140 }}>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>{label}</div>
            <div style={{ display: "flex", border: "1.5px solid #e2e8f0",
                borderRadius: 8, overflow: "hidden" }}>
                {options.map(opt => (
                    <button key={String(opt.value)} onClick={() => onChange(opt.value)} style={{
                        flex: 1, padding: "8px 0", border: "none", cursor: "pointer",
                        background: value === opt.value ? activeColor(opt.value) : "#f8fafc",
                        color: value === opt.value ? "white" : "#64748b",
                        fontWeight: value === opt.value ? 700 : 500,
                        fontSize: 12, fontFamily: "system-ui,sans-serif",
                        transition: "background 0.15s",
                    }}>{opt.label}</button>
                ))}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPALE
// ═══════════════════════════════════════════════════════════════════════════════

export default function ForzaLorentzDemo() {
    const [bDir,      setBDir]      = useState<BDir>("out");
    const [qSign,     setQSign]     = useState<1 | -1>(1);
    const [vMag,      setVMag]      = useState(5);
    const [vAngle,    setVAngle]    = useState(30);
    const [showForce, setShowForce] = useState(true);

    const { isMobile } = useBreakpoint();
    const W = isMobile ? 330 : 540;
    const H = 320;
    const CX = W / 2, CY = H / 2;
    const α  = (vAngle * Math.PI) / 180;

    // ── Velocità (SVG) ──────────────────────────────────────────────────────
    const V_SCALE = 22;
    const vx = Math.cos(α) * vMag * V_SCALE;
    const vy = -Math.sin(α) * vMag * V_SCALE;   // y SVG invertita

    // ── Forza: caso B perp. al piano (out/in) ──────────────────────────────
    // Physics: F_svg = qSign·Bsign·(sinα, cosα)·F_LEN
    const Bsign  = bDir === "out" ? 1 : -1;
    const F_LEN  = vMag * 9;                      // scala con vMag (9–90 px)
    const fx     = Math.sin(α) * qSign * Bsign * F_LEN;
    const fy     = Math.cos(α) * qSign * Bsign * F_LEN;

    // ── Forza: caso B orizzontale nel piano ─────────────────────────────────
    // v×B = (cosα, sinα, 0) × (1, 0, 0) = (0, 0, −sinα)
    // F_z = q·v·B·(−sinα)   → positivo = uscente (⊙), negativo = entrante (⊗)
    const sinAlpha   = Math.sin(α);
    const fZ_sign    = -qSign * sinAlpha;           // >0 uscente, <0 entrante
    const θ_vB_deg   = vAngle <= 180 ? vAngle : 360 - vAngle;  // angolo in [0,180]
    const sinTheta   = Math.abs(sinAlpha);
    const F_actual   = Q_ABS * vMag * V_UNIT * B_MAG * (bDir === "right" ? sinTheta : 1);
    const fSym       = sinTheta < 0.01 ? null : (fZ_sign > 0 ? "⊙" : "⊗");
    // Raggio indicatore forza (nel piano): cresce con |F|
    const fRingR     = 4 + vMag * sinTheta * 4.5;   // 4–49 px

    // ── Marker angolo retto (B perp) ────────────────────────────────────────
    const vLen = Math.sqrt(vx * vx + vy * vy);
    const fLen = Math.sqrt(fx * fx + fy * fy);

    const showArrows  = showForce && vMag > 0;
    const qColor      = qSign > 0 ? "#ef4444" : "#3b82f6";

    // ── Griglia simboli (solo modalità out/in) ──────────────────────────────
    const sym  = bDir === "out" ? "⊙" : "⊗";
    const cols = isMobile ? 5 : 7, rows = 4;
    const grid = Array.from({ length: rows * cols }, (_, k) => ({
        gx: ((k % cols) + 0.5) * W / cols,
        gy: (Math.floor(k / cols) + 0.5) * H / rows,
    }));

    return (
        <DemoContainer title="Forza di Lorentz su una carica in movimento">

            {/* ── Canvas SVG ── */}
            <div style={{ overflowX: "auto", marginBottom: 16 }}>
                <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}
                    style={{ display: "block", margin: "0 auto", maxWidth: "100%",
                             background: "#f8fafc", borderRadius: 12,
                             border: "1.5px solid #e2e8f0" }}>

                    {/* ─── SFONDO CAMPO ────────────────────────────────────── */}
                    {bDir !== "right" && (
                        <g opacity={0.22} textAnchor="middle" fontFamily="sans-serif" fontSize={24}>
                            {grid.map(({ gx, gy }, i) => (
                                <text key={i} x={gx} y={gy + 8} fill="#475569">{sym}</text>
                            ))}
                        </g>
                    )}

                    {/* ─── CAMPO B ORIZZONTALE ─────────────────────────────── */}
                    {bDir === "right" && (() => {
                        // Frecce orizzontali B distribuite su 3 righe
                        const rows3 = [CY - 70, CY, CY + 70];
                        const bLen  = W - 60;
                        return (
                            <g opacity={0.35}>
                                {rows3.map((by, i) => (
                                    <Arrow key={i} x1={30} y1={by}
                                        dx={bLen} dy={0}
                                        color="#1d4ed8" sw={i === 1 ? 2.2 : 1.5}
                                        label={i === 1 ? "B" : undefined} />
                                ))}
                            </g>
                        );
                    })()}

                    {/* ─── ETICHETTA CAMPO ─────────────────────────────────── */}
                    <text x={10} y={14} fontSize={11} fill="#64748b"
                        fontFamily="system-ui,sans-serif" dominantBaseline="hanging">
                        {bDir === "out"   && "B = 0.50 T  (uscente ⊙)"}
                        {bDir === "in"    && "B = 0.50 T  (entrante ⊗)"}
                        {bDir === "right" && "B = 0.50 T  (→ nel piano)"}
                    </text>

                    {/* ─── MODALITÀ B PERP: angolo retto F⊥v + freccia F ──── */}
                    {bDir !== "right" && showArrows && vLen > 0 && fLen > 0 && (() => {
                        const uvx = vx / vLen, uvy = vy / vLen;
                        const ufx = fx / fLen, ufy = fy / fLen;
                        const s   = 15;
                        return (
                            <g stroke="#94a3b8" strokeWidth={1.2} fill="none">
                                <polyline points={[
                                    `${CX + uvx*s},${CY + uvy*s}`,
                                    `${CX + uvx*s + ufx*s},${CY + uvy*s + ufy*s}`,
                                    `${CX + ufx*s},${CY + ufy*s}`,
                                ].join(" ")} />
                            </g>
                        );
                    })()}

                    {/* ─── MODALITÀ B NEL PIANO: arco angolo θ ─────────────── */}
                    {bDir === "right" && vMag > 0 && (
                        <AngleArc cx={CX} cy={CY} r={40} toDeg={vAngle} />
                    )}

                    {/* ─── FRECCIA VELOCITÀ ────────────────────────────────── */}
                    {vMag > 0 && (
                        <Arrow x1={CX} y1={CY} dx={vx} dy={vy}
                            color="#f97316" sw={2.8} label="v" />
                    )}

                    {/* ─── FRECCIA FORZA (solo B perp) ─────────────────────── */}
                    {bDir !== "right" && showArrows && (
                        <Arrow x1={CX} y1={CY} dx={fx} dy={fy}
                            color="#8b5cf6" sw={2.8} label="F" />
                    )}

                    {/* ─── INDICATORE FORZA (B nel piano) ──────────────────── */}
                    {bDir === "right" && showForce && vMag > 0 && fSym && (
                        <g>
                            {/* anello crescente */}
                            <circle cx={CX} cy={CY} r={18 + fRingR}
                                fill="none" stroke="#8b5cf6"
                                strokeWidth={2.2} strokeDasharray="5,3" opacity={0.5} />
                            {/* simbolo ⊙/⊗ dentro l'anello */}
                            <text x={CX + 18 + fRingR + 14} y={CY + 5}
                                textAnchor="middle" dominantBaseline="middle"
                                fontSize={20} fill="#8b5cf6" fontWeight="700"
                                fontFamily="system-ui,sans-serif">{fSym}</text>
                            <text x={CX + 18 + fRingR + 28} y={CY - 10}
                                textAnchor="start" fontSize={12} fontWeight="700"
                                fill="#8b5cf6" fontFamily="system-ui,sans-serif">F</text>
                        </g>
                    )}
                    {bDir === "right" && showForce && vMag > 0 && !fSym && (
                        <text x={CX + 26} y={CY - 26} textAnchor="start"
                            fontSize={12} fill="#94a3b8" fontFamily="system-ui,sans-serif">
                            F = 0 (v ∥ B)
                        </text>
                    )}

                    {/* ─── CARICA (in primo piano) ─────────────────────────── */}
                    <circle cx={CX} cy={CY} r={18} fill={qColor} />
                    <circle cx={CX} cy={CY} r={18} fill="none" stroke="white" strokeWidth={2} />
                    <text x={CX} y={CY + 1} textAnchor="middle" dominantBaseline="middle"
                        fontSize={22} fontWeight="900" fill="white"
                        fontFamily="Georgia,serif">
                        {qSign > 0 ? "+" : "−"}
                    </text>
                </svg>
            </div>

            {/* ── Controlli ── */}
            <div style={{ maxWidth: 520, margin: "0 auto",
                fontFamily: "system-ui,sans-serif",
                display: "flex", flexDirection: "column", gap: 14 }}>

                {/* Orientazione B + segno q */}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <ToggleGroup
                        label="Orientazione campo B"
                        options={[
                            { value: "out"   as const, label: "⊙ Uscente"    },
                            { value: "in"    as const, label: "⊗ Entrante"   },
                            { value: "right" as const, label: "→ Orizzontale" },
                        ]}
                        value={bDir}
                        onChange={setBDir}
                        activeColor={() => "#1d4ed8"}
                    />
                    <ToggleGroup
                        label="Carica q"
                        options={[
                            { value:  1 as const, label: "+ Positiva" },
                            { value: -1 as const, label: "− Negativa" },
                        ]}
                        value={qSign}
                        onChange={setQSign}
                        activeColor={v => v > 0 ? "#dc2626" : "#2563eb"}
                    />
                </div>

                {/* Slider velocità */}
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between",
                        fontSize: 13, color: "#475569", marginBottom: 4 }}>
                        <span>Modulo velocità |v|</span>
                        <span style={{ fontWeight: 600, color: "#f97316" }}>
                            {vMag === 0 ? "0 m/s (ferma)" : `${vMag}.0 × 10⁶ m/s`}
                        </span>
                    </div>
                    <input type="range" min={0} max={10} step={1} value={vMag}
                        onChange={e => setVMag(Number(e.target.value))}
                        style={sliderFill(vMag, 0, 10, "#f97316")} />
                    <div style={{ display: "flex", justifyContent: "space-between",
                        fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                        <span>ferma (0)</span><span>veloce (10)</span>
                    </div>
                </div>

                {/* Slider direzione */}
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between",
                        fontSize: 13, color: "#475569", marginBottom: 4 }}>
                        <span>
                            {bDir === "right"
                                ? `Angolo tra v e B (θ = ${θ_vB_deg}°)`
                                : "Direzione velocità"}
                        </span>
                        <span style={{ fontWeight: 600, color: "#f97316" }}>
                            {vAngle}° {dirLabel(vAngle)}
                        </span>
                    </div>
                    <input type="range" min={0} max={355} step={5} value={vAngle}
                        onChange={e => setVAngle(Number(e.target.value))}
                        style={sliderFill(vAngle, 0, 355, "#f97316")} />
                    <div style={{ display: "flex", justifyContent: "space-between",
                        fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                        <span>→ 0°</span>
                        <span>↑ 90°</span>
                        <span>← 180°</span>
                        <span>↓ 270°</span>
                    </div>
                </div>

                {/* Checkbox forza */}
                <label style={{ display: "flex", alignItems: "center", gap: 10,
                    cursor: "pointer", fontSize: 14, color: "#475569",
                    userSelect: "none" }}>
                    <input type="checkbox" checked={showForce}
                        onChange={e => setShowForce(e.target.checked)}
                        style={{ width: 16, height: 16, cursor: "pointer" }} />
                    <span>
                        Mostra forza di Lorentz{" "}
                        <strong style={{ color: "#8b5cf6" }}>F</strong>
                    </span>
                </label>

                {/* Box formula */}
                {showForce && (
                    <div style={{ background: "#faf5ff", borderRadius: 10,
                        padding: "12px 16px", border: "1.5px solid #e9d5ff" }}>

                        {bDir !== "right" ? (
                            <>
                                <div style={{ fontSize: 13, color: "#6b21a8", marginBottom: 6 }}>
                                    <strong>F = |q| · v · B</strong>
                                    <span style={{ fontWeight: 400, color: "#7c3aed",
                                        fontSize: 11, marginLeft: 8 }}>
                                        (B ⊥ piano → θ<sub>vB</sub> = 90°, sin θ = 1)
                                    </span>
                                </div>
                                {vMag === 0 ? (
                                    <div style={{ fontSize: 19, fontWeight: 700, color: "#7c3aed" }}>
                                        F = 0 N &nbsp;<span style={{ fontSize: 12, fontWeight: 400 }}>(carica ferma)</span>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ fontSize: 13, color: "#4c1d95", marginBottom: 4 }}>
                                            = 1.60×10⁻¹⁹ C · {vMag}.0×10⁶ m/s · {B_MAG} T
                                        </div>
                                        <div style={{ fontSize: 19, fontWeight: 700, color: "#7c3aed", marginTop: 4 }}>
                                            = {formatSci(F_actual)} N
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                <div style={{ fontSize: 13, color: "#6b21a8", marginBottom: 6 }}>
                                    <strong>F = |q| · v · B · sin θ</strong>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr",
                                    gap: "4px 16px", fontSize: 12, color: "#4c1d95", marginBottom: 8 }}>
                                    <span>θ<sub>vB</sub> = {θ_vB_deg}°</span>
                                    <span>sin θ = {sinTheta.toFixed(3)}</span>
                                    <span>|v| = {vMag}.0 × 10⁶ m/s</span>
                                    <span>B = {B_MAG} T</span>
                                </div>
                                {vMag === 0 ? (
                                    <div style={{ fontSize: 19, fontWeight: 700, color: "#7c3aed" }}>
                                        F = 0 N &nbsp;<span style={{ fontSize: 12, fontWeight: 400 }}>(carica ferma)</span>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ fontSize: 13, color: "#4c1d95", marginBottom: 4 }}>
                                            = 1.60×10⁻¹⁹ · {vMag}.0×10⁶ · {B_MAG} · {sinTheta.toFixed(3)}
                                        </div>
                                        <div style={{ fontSize: 19, fontWeight: 700, color: "#7c3aed", marginTop: 4 }}>
                                            = {formatSci(F_actual)} N
                                        </div>
                                    </>
                                )}
                                {fSym && (
                                    <div style={{ fontSize: 12, color: "#7c3aed", marginTop: 6,
                                        borderTop: "1px solid #e9d5ff", paddingTop: 6 }}>
                                        Direzione: <strong>{fSym === "⊙" ? "uscente dal piano" : "entrante nel piano"}</strong>
                                        {" "}({fSym})
                                    </div>
                                )}
                                {!fSym && (
                                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6,
                                        borderTop: "1px solid #e9d5ff", paddingTop: 6 }}>
                                        v parallela a B → sin θ = 0 → <strong>F = 0</strong>
                                    </div>
                                )}
                            </>
                        )}

                        {qSign < 0 && (
                            <div style={{ fontSize: 11, color: "#7c3aed", marginTop: 6,
                                borderTop: "1px solid #e9d5ff", paddingTop: 6 }}>
                                Carica negativa → direzione di F opposta alla regola della mano destra
                            </div>
                        )}
                    </div>
                )}
            </div>

            <InfoBox title="La forza di Lorentz">
                <p style={{ margin: "0 0 8px", lineHeight: 1.7 }}>
                    Una carica <em>q</em> in moto con velocità <strong>v</strong> in un campo magnetico <strong>B</strong> è soggetta alla <strong>forza di Lorentz</strong>:
                </p>
                <div style={{ textAlign: "center", fontSize: 17, fontWeight: 700,
                    margin: "8px 0 10px", color: "#7c3aed", fontFamily: "Georgia,serif" }}>
                    F = |q| v B sin θ
                </div>
                <ul style={{ margin: "0 0 8px", paddingLeft: 20, lineHeight: 1.8 }}>
                    <li>θ è l'angolo tra <strong>v</strong> e <strong>B</strong> (0° – 180°).</li>
                    <li>Massima quando v ⊥ B (θ = 90°, sin θ = 1) → <em>modalità ⊙/⊗</em>.</li>
                    <li>Nulla quando v ∥ B (θ = 0° o 180°) → <em>modalità →, v orizzontale</em>.</li>
                    <li>Con B orizzontale la forza è <strong>perpendicolare al piano</strong> (⊙ o ⊗).</li>
                    <li><strong>Direzione</strong>: regola della mano destra per q &gt; 0; inversa per q &lt; 0.</li>
                    <li>F ⊥ v → non compie lavoro → la rapidità non cambia mai.</li>
                    <li>Con v ⊥ B la traiettoria è un <strong>cerchio</strong> (moto circolare uniforme).</li>
                </ul>
            </InfoBox>
        </DemoContainer>
    );
}
