/**
 * GraficoFunzioniGoniometricheDemo
 * Il cerchio unitario costruisce in tempo reale i grafici di sin θ, cos θ, tg θ
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DemoContainer, useBreakpoint } from "../../components/ui";
import {
    DEG_TO_RAD, RAD_TO_DEG,
    snapToNotableAngle,
    formatRadiansPi,
} from "../../utils/math";

// ── Costanti globali ──────────────────────────────────────────────────────────

const PI = Math.PI, TWO_PI = 2 * PI;
const SIN_C = "#10b981";
const COS_C = "#0ea5e9";
const TAN_C = "#f97316";
const TAN_CLIP = 2.5;

// Desktop: SVG combinato (cerchio + grafico) — 820×390
const D_CX = 185, D_CY = 195, D_CR = 110;
const D_GX0 = 422, D_GX1 = 808, D_GW = D_GX1 - D_GX0;
// GY0 = D_CY e GYS = D_CR → il valore sin θ trasla orizzontalmente al grafico
const D_GY0 = D_CY, D_GYS = D_CR;
const D_W = 820, D_H = 390;
const D_GT = D_GY0 - D_GYS * 1.35;   // top grafico
const D_GB = D_GY0 + D_GYS * 1.35;   // bottom grafico
const D_gx = (t: number) => D_GX0 + (t / TWO_PI) * D_GW;
const D_gy = (v: number) => D_GY0 - v * D_GYS;

// Mobile: due SVG separati
const M_CX = 170, M_CY = 155, M_CR = 125;
const MC_W = 340, MC_H = 310;
const M_GX0 = 44, M_GX1 = 350, M_GW = M_GX1 - M_GX0;
const M_GY0 = 128, M_GYS = 90;
const MG_W = 380, MG_H = 260;
const M_GT = M_GY0 - M_GYS * 1.3;
const M_GB = M_GY0 + M_GYS * 1.3;
const M_gx = (t: number) => M_GX0 + (t / TWO_PI) * M_GW;
const M_gy = (v: number) => M_GY0 - v * M_GYS;

// ── Costruttori percorso SVG ──────────────────────────────────────────────────

function buildCurve(
    fn: (t: number) => number,
    gx: (t: number) => number,
    gy: (v: number) => number,
    clip?: number,
): string {
    let d = "", pen = false;
    for (let i = 0; i <= 600; i++) {
        const t = TWO_PI * i / 600;
        const v = fn(t);
        if (!isFinite(v) || (clip !== undefined && Math.abs(v) > clip)) { pen = false; continue; }
        d += `${pen ? "L" : "M"} ${gx(t).toFixed(1)} ${gy(v).toFixed(1)} `;
        pen = true;
    }
    return d;
}

function buildTrace(
    fn: (t: number) => number,
    gx: (t: number) => number,
    gy: (v: number) => number,
    tMax: number,
    clip?: number,
): string {
    if (tMax < 0.005) return "";
    const steps = Math.max(4, Math.ceil(tMax / TWO_PI * 600));
    let d = "", pen = false;
    for (let i = 0; i <= steps; i++) {
        const t = tMax * i / steps;
        const v = fn(t);
        if (!isFinite(v) || (clip !== undefined && Math.abs(v) > clip)) { pen = false; continue; }
        d += `${pen ? "L" : "M"} ${gx(t).toFixed(1)} ${gy(v).toFixed(1)} `;
        pen = true;
    }
    return d;
}

// Curve complete (calcolate una volta a livello di modulo)
const D_SIN_F = buildCurve(Math.sin, D_gx, D_gy);
const D_COS_F = buildCurve(Math.cos, D_gx, D_gy);
const D_TAN_F = buildCurve(Math.tan, D_gx, D_gy, TAN_CLIP);
const M_SIN_F = buildCurve(Math.sin, M_gx, M_gy);
const M_COS_F = buildCurve(Math.cos, M_gx, M_gy);
const M_TAN_F = buildCurve(Math.tan, M_gx, M_gy, TAN_CLIP);

// ── Helpers ───────────────────────────────────────────────────────────────────

function s3(n: number) { return parseFloat(n.toPrecision(3)).toString(); }

// ── Componente principale ─────────────────────────────────────────────────────

export default function GraficoFunzioniGoniometricheDemo() {
    const { isMobile } = useBreakpoint();

    const [endDeg, setEndDeg]         = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [speed, setSpeed]           = useState(40);
    const [showSin, setShowSin]       = useState(true);
    const [showCos, setShowCos]       = useState(true);
    const [showTan, setShowTan]       = useState(false);
    const [snap, setSnap]             = useState(true);

    const snapRef = useRef(snap);
    snapRef.current = snap;

    const svgDeskRef  = useRef<SVGSVGElement>(null);
    const svgMobRef   = useRef<SVGSVGElement>(null);

    const thetaRad = endDeg * DEG_TO_RAD;
    const sinVal   = Math.sin(thetaRad);
    const cosVal   = Math.cos(thetaRad);
    const tanVal   = Math.tan(thetaRad);
    const progress = Math.round(endDeg / 360 * 100);

    // ── Animazione ────────────────────────────────────────────────────────────

    useEffect(() => {
        if (!isAnimating) return;
        let raf: number, last = performance.now();
        const tick = (now: number) => {
            const dt = (now - last) / 1000;
            last = now;
            setEndDeg(d => (d + speed * dt) % 360);
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [isAnimating, speed]);

    // ── Drag handler factory ──────────────────────────────────────────────────

    function makeDrag(
        svgRef: React.RefObject<SVGSVGElement | null>,
        circleCX: number, circleCY: number,
        desktopOnly: boolean,
    ) {
        return (e: React.PointerEvent<SVGSVGElement>) => {
            const svg = svgRef.current;
            if (!svg) return;
            const pt = svg.createSVGPoint();

            const toLocal = (ev: { clientX: number; clientY: number }) => {
                pt.x = ev.clientX; pt.y = ev.clientY;
                const ctm = svg.getScreenCTM();
                return ctm ? pt.matrixTransform(ctm.inverse()) : null;
            };

            if (desktopOnly) {
                const loc = toLocal(e);
                if (!loc || loc.x > 408) return;  // solo metà sinistra
            }

            const el = e.currentTarget;
            el.setPointerCapture?.(e.pointerId);
            setIsAnimating(false);

            const handleMove = (ev: PointerEvent) => {
                const loc = toLocal(ev);
                if (!loc) return;
                let deg = Math.atan2(-(loc.y - circleCY), loc.x - circleCX) * RAD_TO_DEG;
                if (deg < 0) deg += 360;
                if (snapRef.current) deg = snapToNotableAngle(deg);
                setEndDeg(deg);
            };
            const handleUp = () => {
                try { el.releasePointerCapture?.(e.pointerId); } catch { /* */ }
                window.removeEventListener("pointermove", handleMove);
                window.removeEventListener("pointerup", handleUp);
            };
            window.addEventListener("pointermove", handleMove, { passive: false });
            window.addEventListener("pointerup", handleUp, { passive: true });
        };
    }

    const onPointerDownDesk = useCallback(
        makeDrag(svgDeskRef, D_CX, D_CY, true),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );
    const onPointerDownMob = useCallback(
        makeDrag(svgMobRef, M_CX, M_CY, false),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    // ── Trace paths ───────────────────────────────────────────────────────────

    const dSinT = useMemo(() => buildTrace(Math.sin, D_gx, D_gy, thetaRad), [thetaRad]);
    const dCosT = useMemo(() => buildTrace(Math.cos, D_gx, D_gy, thetaRad), [thetaRad]);
    const dTanT = useMemo(() => buildTrace(Math.tan, D_gx, D_gy, thetaRad, TAN_CLIP), [thetaRad]);
    const mSinT = useMemo(() => buildTrace(Math.sin, M_gx, M_gy, thetaRad), [thetaRad]);
    const mCosT = useMemo(() => buildTrace(Math.cos, M_gx, M_gy, thetaRad), [thetaRad]);
    const mTanT = useMemo(() => buildTrace(Math.tan, M_gx, M_gy, thetaRad, TAN_CLIP), [thetaRad]);

    // ── Punto P sul cerchio ───────────────────────────────────────────────────

    const PD = { x: D_CX + D_CR * Math.cos(thetaRad), y: D_CY - D_CR * Math.sin(thetaRad) };
    const PM = { x: M_CX + M_CR * Math.cos(thetaRad), y: M_CY - M_CR * Math.sin(thetaRad) };

    // ── Rendering cerchio ─────────────────────────────────────────────────────

    function renderCircle(
        cx: number, cy: number, r: number,
        P: { x: number; y: number },
        fs: number, handleR: number,
    ) {
        const CARD = [0, 90, 180, 270] as const;
        const CARD_LBL: Record<number, string> = { 0: "0", 90: "π/2", 180: "π", 270: "3π/2" };
        const arcR = r * 0.38;
        const yTanRaw = cy - r * tanVal;
        const tanClip = r * 2.5;
        const yTanC = Math.max(cy - tanClip, Math.min(cy + tanClip, yTanRaw));
        const tanLineX = cx + r;

        return (
            <>
                {/* Assi del cerchio */}
                <line x1={cx - r - 14} y1={cy} x2={cx + r + 14} y2={cy}
                    stroke="#d1d5db" strokeWidth={1.5} strokeDasharray="6,4" />
                <line x1={cx} y1={cy - r - 14} x2={cx} y2={cy + r + 14}
                    stroke="#d1d5db" strokeWidth={1.5} strokeDasharray="6,4" />

                {/* Cerchio unitario */}
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth={1.5} />

                {/* Tacche ogni 45° e label punti cardinali */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => {
                    const rad = deg * DEG_TO_RAD;
                    const isCard = CARD.includes(deg as 0 | 90 | 180 | 270);
                    const p1 = { x: cx + (r - 7) * Math.cos(rad), y: cy - (r - 7) * Math.sin(rad) };
                    const p2 = { x: cx + (r + 5) * Math.cos(rad), y: cy - (r + 5) * Math.sin(rad) };
                    const pL = { x: cx + (r + 18) * Math.cos(rad), y: cy - (r + 18) * Math.sin(rad) };
                    return (
                        <g key={deg}>
                            <line x1={p1.x.toFixed(1)} y1={p1.y.toFixed(1)} x2={p2.x.toFixed(1)} y2={p2.y.toFixed(1)}
                                stroke={isCard ? "#94a3b8" : "#d1d5db"} strokeWidth={isCard ? 1.5 : 1} />
                            {isCard && (
                                <text x={pL.x.toFixed(1)} y={pL.y.toFixed(1)} textAnchor="middle"
                                    dominantBaseline="middle" fontSize={fs - 1} fill="#64748b">
                                    {CARD_LBL[deg]}
                                </text>
                            )}
                        </g>
                    );
                })}

                {/* Arco angolo */}
                {thetaRad > 0.02 && (() => {
                    const t = Math.min(thetaRad, TWO_PI - 0.02);
                    const ex = cx + arcR * Math.cos(t), ey = cy - arcR * Math.sin(t);
                    const la = t > PI ? 1 : 0;
                    return (
                        <path d={`M ${cx + arcR} ${cy} A ${arcR} ${arcR} 0 ${la} 0 ${ex.toFixed(2)} ${ey.toFixed(2)}`}
                            fill="rgba(59,130,246,0.12)" stroke="#3b82f6" strokeWidth={1.5} />
                    );
                })()}

                {/* Etichetta θ */}
                {thetaRad > 0.1 && (() => {
                    const mid = thetaRad / 2;
                    const lr = arcR + 12;
                    return (
                        <text x={(cx + lr * Math.cos(mid)).toFixed(1)} y={(cy - lr * Math.sin(mid)).toFixed(1)}
                            textAnchor="middle" dominantBaseline="middle" fontSize={fs} fill="#3b82f6" fontWeight="bold">θ</text>
                    );
                })()}

                {/* Proiezioni tratteggiate da P agli assi */}
                <line x1={P.x.toFixed(1)} y1={P.y.toFixed(1)} x2={P.x.toFixed(1)} y2={cy}
                    stroke="#d1d5db" strokeWidth={1} strokeDasharray="3,2" />
                <line x1={P.x.toFixed(1)} y1={P.y.toFixed(1)} x2={cx} y2={P.y.toFixed(1)}
                    stroke="#d1d5db" strokeWidth={1} strokeDasharray="3,2" />

                {/* cos θ (orizzontale) */}
                {showCos && (
                    <>
                        <line x1={cx} y1={cy} x2={P.x.toFixed(1)} y2={cy}
                            stroke={COS_C} strokeWidth={4} strokeLinecap="round" />
                        <circle cx={P.x} cy={cy} r={4} fill={COS_C} />
                        <text x={((cx + P.x) / 2).toFixed(1)} y={cy + 14}
                            textAnchor="middle" fontSize={fs} fill={COS_C} fontWeight="bold">cos</text>
                    </>
                )}

                {/* sin θ (verticale) */}
                {showSin && (
                    <>
                        <line x1={cx} y1={cy} x2={cx} y2={P.y.toFixed(1)}
                            stroke={SIN_C} strokeWidth={4} strokeLinecap="round" />
                        <circle cx={cx} cy={P.y} r={4} fill={SIN_C} />
                        <text x={cx - 8} y={((cy + P.y) / 2).toFixed(1)}
                            textAnchor="end" dominantBaseline="middle" fontSize={fs} fill={SIN_C} fontWeight="bold">sin</text>
                    </>
                )}

                {/* tg θ sulla retta tangente */}
                {showTan && (
                    <>
                        <line x1={tanLineX} y1={cy - tanClip} x2={tanLineX} y2={cy + tanClip}
                            stroke={TAN_C} strokeWidth={1} strokeDasharray="5,3" opacity={0.45} />
                        <line x1={cx} y1={cy} x2={tanLineX} y2={yTanC.toFixed(1)}
                            stroke={TAN_C} strokeWidth={2} strokeLinecap="round" opacity={0.85} />
                        <circle cx={tanLineX} cy={yTanC} r={4} fill={TAN_C} />
                        <text x={tanLineX + 6} y={yTanC.toFixed(1)}
                            dominantBaseline="middle" fontSize={fs} fill={TAN_C} fontWeight="bold">tg</text>
                    </>
                )}

                {/* Raggio */}
                <line x1={cx} y1={cy} x2={P.x.toFixed(1)} y2={P.y.toFixed(1)}
                    stroke="#1e3a5f" strokeWidth={2.5} />

                {/* Centro */}
                <circle cx={cx} cy={cy} r={4} fill="#111827" />

                {/* Punto P (trascinabile) */}
                <circle cx={P.x} cy={P.y} r={handleR} fill="#3b82f6" stroke="#fff" strokeWidth={2}
                    style={{ cursor: "grab" }} />
            </>
        );
    }

    // ── Rendering grafico ─────────────────────────────────────────────────────

    function renderGraph(
        gx: (t: number) => number, gy: (v: number) => number,
        gx0: number, gx1: number, gy0: number, gt: number, gb: number,
        sinFull: string, cosFull: string, tanFull: string,
        sinTrace: string, cosTrace: string, tanTrace: string,
        fs: number,
    ) {
        const currX = gx(thetaRad);
        const xLbls: [number, string][] = [
            [0, "0"], [PI / 2, "π/2"], [PI, "π"], [3 * PI / 2, "3π/2"], [TWO_PI, "2π"],
        ];

        return (
            <>
                {/* Sfondo grafico */}
                <rect x={gx0 - 2} y={gt - 4} width={gx1 - gx0 + 4} height={gb - gt + 8}
                    rx={6} fill="#f8fafc" />

                {/* Griglia verticale */}
                {[PI / 2, PI, 3 * PI / 2].map((t, i) => (
                    <line key={i} x1={gx(t).toFixed(1)} y1={gt} x2={gx(t).toFixed(1)} y2={gb}
                        stroke="#e2e8f0" strokeWidth={1} />
                ))}
                {/* Griglia orizzontale */}
                {[-1, 1].map(v => (
                    <line key={v} x1={gx0} y1={gy(v).toFixed(1)} x2={gx1} y2={gy(v).toFixed(1)}
                        stroke="#e2e8f0" strokeWidth={1} />
                ))}

                {/* Asintoti tan */}
                {showTan && [PI / 2, 3 * PI / 2].map((t, i) => (
                    <line key={i} x1={gx(t).toFixed(1)} y1={gt} x2={gx(t).toFixed(1)} y2={gb}
                        stroke={TAN_C} strokeWidth={1} strokeDasharray="4,3" opacity={0.35} />
                ))}

                {/* Asse x */}
                <line x1={gx0} y1={gy0} x2={gx1 + 4} y2={gy0} stroke="#475569" strokeWidth={1.5} />
                <polygon points={`${gx1 + 4},${gy0} ${gx1 - 2},${gy0 - 3} ${gx1 - 2},${gy0 + 3}`} fill="#475569" />
                {/* Asse y */}
                <line x1={gx0} y1={gt - 3} x2={gx0} y2={gb + 3} stroke="#475569" strokeWidth={1.5} />
                <polygon points={`${gx0},${gt - 3} ${gx0 - 3},${gt + 5} ${gx0 + 3},${gt + 5}`} fill="#475569" />

                {/* Etichette asse x */}
                {xLbls.map(([t, lbl]) => (
                    <text key={lbl} x={gx(t).toFixed(1)} y={gy0 + 14}
                        textAnchor="middle" fontSize={fs} fill="#64748b">{lbl}</text>
                ))}
                {/* Etichette asse y */}
                {[[-1, "-1"], [1, "1"]].map(([v, lbl]) => (
                    <text key={lbl} x={gx0 - 5} y={(gy(v as number) + 4).toFixed(1)}
                        textAnchor="end" fontSize={fs} fill="#64748b">{lbl}</text>
                ))}
                <text x={gx0 - 5} y={gy0 + 4} textAnchor="end" fontSize={fs} fill="#64748b">0</text>

                {/* Legenda */}
                {[
                    { show: showSin, color: SIN_C, label: "sin θ", offset: 0 },
                    { show: showCos, color: COS_C, label: "cos θ", offset: 46 },
                    { show: showTan, color: TAN_C, label: "tg θ",  offset: 92 },
                ].map(({ show, color, label, offset }) => show && (
                    <g key={label}>
                        <circle cx={gx0 + offset + 5} cy={gt - 6} r={3.5} fill={color} />
                        <text x={gx0 + offset + 11} y={gt - 3} fontSize={fs - 1} fill={color} fontWeight="bold">{label}</text>
                    </g>
                ))}

                {/* Curve complete (sbiadite) */}
                {showSin && <path d={sinFull} fill="none" stroke={SIN_C} strokeWidth={1} opacity={0.16} />}
                {showCos && <path d={cosFull} fill="none" stroke={COS_C} strokeWidth={1} opacity={0.16} />}
                {showTan && <path d={tanFull} fill="none" stroke={TAN_C} strokeWidth={1} opacity={0.16} />}

                {/* Tracce costruite */}
                {showSin && <path d={sinTrace} fill="none" stroke={SIN_C} strokeWidth={2.6} strokeLinecap="round" />}
                {showCos && <path d={cosTrace} fill="none" stroke={COS_C} strokeWidth={2.6} strokeLinecap="round" />}
                {showTan && <path d={tanTrace} fill="none" stroke={TAN_C} strokeWidth={2.6} strokeLinecap="round" />}

                {/* Linea angolo corrente */}
                <line x1={currX.toFixed(1)} y1={gt - 2} x2={currX.toFixed(1)} y2={gb + 2}
                    stroke="#475569" strokeWidth={1.5} strokeDasharray="5,3" opacity={0.5} />
                <text x={currX.toFixed(1)} y={gt - 6} textAnchor="middle" fontSize={fs - 1} fill="#475569">θ</text>

                {/* Punti correnti sulle curve */}
                {showSin && thetaRad > 0.005 && (
                    <circle cx={currX} cy={gy(sinVal)} r={5.5} fill={SIN_C} stroke="#fff" strokeWidth={1.8} />
                )}
                {showCos && thetaRad > 0.005 && (
                    <circle cx={currX} cy={gy(cosVal)} r={5.5} fill={COS_C} stroke="#fff" strokeWidth={1.8} />
                )}
                {showTan && thetaRad > 0.005 && Math.abs(tanVal) <= TAN_CLIP && (
                    <circle cx={currX} cy={gy(tanVal)} r={5.5} fill={TAN_C} stroke="#fff" strokeWidth={1.8} />
                )}
            </>
        );
    }

    // ── Controlli ─────────────────────────────────────────────────────────────

    const pct = (endDeg / 360) * 100;

    const controls = (
        <div style={{ display: "grid", gap: 12 }}>
            {/* Slider angolo */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>Angolo θ</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#3b82f6" }}>
                        {endDeg.toFixed(1)}° = {formatRadiansPi(thetaRad)}
                    </span>
                </div>
                <input type="range" min={0} max={360} step={0.5} value={endDeg}
                    onChange={e => { setEndDeg(parseFloat(e.target.value)); setIsAnimating(false); }}
                    style={{
                        width: "100%", height: 8, borderRadius: 4, appearance: "none", outline: "none",
                        background: `linear-gradient(to right, #3b82f6 ${pct}%, #e2e8f0 ${pct}%)`,
                        cursor: "pointer", accentColor: "#3b82f6",
                    }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#94a3b8", marginTop: 3 }}>
                    <span>0°</span><span>90°</span><span>180°</span><span>270°</span><span>360°</span>
                </div>
            </div>

            {/* Selettori funzioni */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>Mostra:</span>
                {[
                    { label: "sin θ", color: SIN_C, active: showSin, toggle: () => setShowSin(p => !p) },
                    { label: "cos θ", color: COS_C, active: showCos, toggle: () => setShowCos(p => !p) },
                    { label: "tg θ",  color: TAN_C, active: showTan, toggle: () => setShowTan(p => !p) },
                ].map(({ label, color, active, toggle }) => (
                    <button key={label} onClick={toggle} style={{
                        padding: "6px 16px", borderRadius: 20,
                        border: `2px solid ${active ? color : "#e2e8f0"}`,
                        background: active ? `${color}18` : "#fff",
                        color: active ? color : "#94a3b8",
                        fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.2s",
                    }}>{label}</button>
                ))}
            </div>

            {/* Animate + speed */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <button onClick={() => setIsAnimating(p => !p)} style={{
                    padding: "8px 24px", borderRadius: 20, border: "none",
                    background: isAnimating
                        ? "linear-gradient(135deg,#dc2626,#b91c1c)"
                        : "linear-gradient(135deg,#22c55e,#16a34a)",
                    color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
                    boxShadow: isAnimating ? "0 0 12px rgba(220,38,38,.4)" : "0 0 12px rgba(34,197,94,.4)",
                    transition: "all .3s",
                }}>
                    {isAnimating ? "⏸ Pausa" : "▶ Anima"}
                </button>
                <button onClick={() => { setEndDeg(0); setIsAnimating(false); }} style={{
                    padding: "8px 16px", borderRadius: 20, border: "1.5px solid #e2e8f0",
                    background: "#fff", color: "#64748b", fontWeight: 600, fontSize: 13, cursor: "pointer",
                }}>↩ Reset</button>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexGrow: 1, minWidth: 160 }}>
                    <span style={{ fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>Vel.:</span>
                    <input type="range" min={10} max={120} step={10} value={speed}
                        onChange={e => setSpeed(parseInt(e.target.value))}
                        style={{ flexGrow: 1, accentColor: "#3b82f6" }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#334155", whiteSpace: "nowrap" }}>{speed}°/s</span>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12, color: "#64748b" }}>
                    <input type="checkbox" checked={snap} onChange={e => setSnap(e.target.checked)} />
                    Angoli notevoli
                </label>
            </div>

            {/* Valori correnti */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[
                    { label: "sin θ", value: s3(sinVal), color: SIN_C, show: showSin },
                    { label: "cos θ", value: s3(cosVal), color: COS_C, show: showCos },
                    { label: "tg θ",  value: Math.abs(tanVal) > 99 ? "±∞" : s3(tanVal), color: TAN_C, show: showTan },
                ].map(({ label, value, color, show }) => (
                    <div key={label} style={{
                        background: show ? `${color}12` : "#f8fafc",
                        border: `1.5px solid ${show ? color : "#e2e8f0"}`,
                        borderRadius: 8, padding: "8px 10px", textAlign: "center", transition: "all .2s",
                    }}>
                        <div style={{ fontSize: 11, color: show ? color : "#94a3b8", fontWeight: 700 }}>{label}</div>
                        <div style={{ fontSize: 17, fontWeight: 800, color: show ? color : "#94a3b8", fontFamily: "monospace" }}>{value}</div>
                    </div>
                ))}
            </div>

            {/* Barra progresso */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: "#64748b" }}>Ciclo:</span>
                <div style={{ flexGrow: 1, height: 6, background: "#e2e8f0", borderRadius: 3 }}>
                    <div style={{
                        width: `${progress}%`, height: "100%",
                        background: `linear-gradient(to right, #3b82f6, #8b5cf6)`,
                        borderRadius: 3, transition: "width .05s",
                    }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>{progress}%</span>
            </div>

            {/* Hint connettore sin */}
            {showSin && !isMobile && (
                <div style={{
                    background: `${SIN_C}10`, border: `1px solid ${SIN_C}40`,
                    borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#166534",
                }}>
                    <strong>💡</strong> La linea tratteggiata verde mostra come il valore di <strong>sin θ</strong> (ordinata del punto P sul cerchio) si trasferisce direttamente al grafico — il collegamento è orizzontale perché usano la stessa scala.
                </div>
            )}
        </div>
    );

    // ── Layout ────────────────────────────────────────────────────────────────

    if (isMobile) {
        return (
            <DemoContainer
                title="Grafico delle funzioni goniometriche"
                description="Trascina il punto blu per costruire i grafici">
                <div style={{ display: "grid", gap: 14 }}>
                    <svg ref={svgMobRef} viewBox={`0 0 ${MC_W} ${MC_H}`} width="100%"
                        style={{ display: "block", touchAction: "none", cursor: "grab" }}
                        onPointerDown={onPointerDownMob}>
                        <rect width={MC_W} height={MC_H} fill="white" />
                        {renderCircle(M_CX, M_CY, M_CR, PM, 10, 14)}
                    </svg>
                    <svg viewBox={`0 0 ${MG_W} ${MG_H}`} width="100%" style={{ display: "block" }}>
                        <rect width={MG_W} height={MG_H} fill="white" />
                        {renderGraph(M_gx, M_gy, M_GX0, M_GX1, M_GY0, M_GT, M_GB,
                            M_SIN_F, M_COS_F, M_TAN_F,
                            mSinT, mCosT, mTanT, 10)}
                    </svg>
                    {controls}
                </div>
            </DemoContainer>
        );
    }

    return (
        <DemoContainer
            title="Grafico delle funzioni goniometriche"
            description="Trascina il punto blu sul cerchio per costruire i grafici. La linea tratteggiata mostra il legame tra cerchio e grafico.">
            <div style={{ display: "grid", gap: 16 }}>
                <svg ref={svgDeskRef} viewBox={`0 0 ${D_W} ${D_H}`} width="100%"
                    style={{ display: "block", touchAction: "none", cursor: "crosshair" }}
                    onPointerDown={onPointerDownDesk}>
                    <rect width={D_W} height={D_H} fill="white" />

                    {/* Cerchio */}
                    {renderCircle(D_CX, D_CY, D_CR, PD, 11, 10)}

                    {/* Connettore sin θ (orizzontale — stessa scala!) */}
                    {showSin && thetaRad > 0.01 && (
                        <line
                            x1={D_CX} y1={(D_GY0 - D_GYS * sinVal).toFixed(1)}
                            x2={D_gx(thetaRad).toFixed(1)} y2={(D_GY0 - D_GYS * sinVal).toFixed(1)}
                            stroke={SIN_C} strokeWidth={1.3} strokeDasharray="6,4" opacity={0.5} />
                    )}

                    {/* Separatore */}
                    <line x1={408} y1={18} x2={408} y2={372} stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4,4" />

                    {/* Grafico */}
                    {renderGraph(D_gx, D_gy, D_GX0, D_GX1, D_GY0, D_GT, D_GB,
                        D_SIN_F, D_COS_F, D_TAN_F,
                        dSinT, dCosT, dTanT, 11)}
                </svg>
                {controls}
            </div>
        </DemoContainer>
    );
}
