import React, { useEffect, useMemo, useRef, useState } from "react";

// ===== util =====
const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

function clamp(v: number, a: number, b: number) { return Math.max(a, Math.min(b, v)); }
function norm360(deg: number) { let d = deg % 360; if (d < 0) d += 360; return d; }
function principal(deg: number) { let d = ((deg + 180) % 360 + 360) % 360 - 180; if (d === -180) d = 180; return d; }

// radianti come multipli “puliti” di π
function formatRadPi(rad: number): string {
    const k = rad / Math.PI;
    const dens = [1, 2, 3, 4, 6, 8, 12, 16];
    for (const d of dens) {
        const n = Math.round(k * d);
        if (Math.abs(k - n / d) < 1e-3) {
            if (n === 0) return "0";
            if (d === 1) return `${n}π`;
            return `${n}π/${d}`;
        }
    }
    return rad.toFixed(3);
}

// snap angoli notevoli
const NOTEVOLI = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
function snapIfClose(deg: number, enabled: boolean, eps = 3) {
    if (!enabled) return deg;
    const d = deg === 360 ? 0 : deg;
    let best = d, bestErr = Infinity;
    for (const v of NOTEVOLI) {
        const t = v === 360 ? 0 : v;
        const err = Math.abs(((d - t + 540) % 360) - 180);
        if (err < bestErr) { bestErr = err; best = t; }
    }
    return bestErr <= eps ? (best === 0 && deg > 359 ? 360 : best) : deg;
}

// ===== component =====
export default function AngleRotationDemo() {
    // lato iniziale (α) fisso a 0°, lato finale (β) variabile
    const [baseDeg] = useState(0);
    const [endDeg,  setEndDeg]  = useState(35);

    // accumuli per il verso reale
    const baseAccumRef = useRef(0);     // rimane 0 perché α è bloccato
    const endAccumRef  = useRef(35);

    // per unwrapping durante il drag (solo β)
    const prevEndDegRef  = useRef(endDeg);

    // animazione (muove β)
    const [isAnimating, setIsAnimating] = useState(false);
    const [speed, setSpeed] = useState(30);   // deg/s
    const [direction, setDirection] = useState(1); // 1=CCW, -1=CW

    // opzioni UI
    const [showProjections, setShowProjections] = useState(true);
    const [highlightArc, setHighlightArc]       = useState(false);
    const [highlightRadius, setHighlightRadius] = useState(false);
    const [showSector, setShowSector]           = useState(false);
    const [snapNotevoli, setSnapNotevoli]       = useState(true);
    const [showTicks, setShowTicks]             = useState(true);
    const [allowAccum, setAllowAccum]           = useState(true); // “Più giri”

    // goniometria
    const [showCos, setShowCos] = useState(true);
    const [showSin, setShowSin] = useState(true);
    const [showTan, setShowTan] = useState(false);

    // disegno
    const svgRef = useRef<SVGSVGElement | null>(null);
    const size = 420;
    const cx = size / 2;
    const cy = size / 2;
    const R = 160;

    const baseRad = useMemo(() => baseDeg * DEG2RAD, [baseDeg]);
    const endRad  = useMemo(() => endDeg  * DEG2RAD, [endDeg]);

    // animazione: muove il lato β, aggiornando l'accumulo
    useEffect(() => {
        if (!isAnimating) return;
        let raf: number; let last = performance.now();
        const tick = (t: number) => {
            const dt = (t - last) / 1000; last = t;
            const delta = direction * speed * dt;
            endAccumRef.current += delta;
            setEndDeg(norm360(endAccumRef.current));
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [isAnimating, speed, direction]);

    function polarToXY(r: number, angRad: number) {
        // Y invertita: in SVG cresce verso il basso → così teniamo CCW positivo
        return { x: cx + r * Math.cos(angRad), y: cy - r * Math.sin(angRad) };
    }

    const B = polarToXY(R, baseRad);
    const P = polarToXY(R, endRad);
    const Px = { x: P.x, y: cy };
    const Py = { x: cx, y: P.y };

    // ===== angolo orientato (θ = β − α) =====
    const thetaOrientedDeg = endAccumRef.current - baseAccumRef.current; // = endAccumRef.current
    const orientedIsCCW    = thetaOrientedDeg >= 0;
    const thetaOrientedMagMod = ((Math.abs(thetaOrientedDeg) % 360) + 360) % 360;
    const thetaPrincipalDeg = principal(endDeg - baseDeg);

    // ===== drag: SOLO β (lato finale) =====
    function onPointerDown(e: React.PointerEvent<SVGSVGElement>) {
        const svg = svgRef.current; if (!svg) return;
        const el = e.currentTarget;
        el.setPointerCapture?.(e.pointerId);

        const pt = svg.createSVGPoint();
        const getLocal = (ev: PointerEvent) => {
            pt.x = ev.clientX; pt.y = ev.clientY;
            const ctm = svg.getScreenCTM(); if (!ctm) return { x: 0, y: 0 };
            return pt.matrixTransform(ctm.inverse());
        };

        const handleMove = (ev: PointerEvent) => {
            const p = getLocal(ev);
            const dx = p.x - cx, dy = p.y - cy;
            let deg = Math.atan2(-dy, dx) * RAD2DEG; // CCW positivo
            if (deg < 0) deg += 360;
            deg = snapIfClose(deg, snapNotevoli);

            // unwrap SOLO per β
            const prev = prevEndDegRef.current;
            let diff = deg - prev;
            diff = principal(diff);
            endAccumRef.current += diff;
            prevEndDegRef.current = deg;
            setEndDeg(deg);
        };

        const handleUp = () => {
            try { el.releasePointerCapture?.(e.pointerId); } catch {}
            window.removeEventListener("pointermove", handleMove);
            window.removeEventListener("pointerup", handleUp);
        };

        window.addEventListener("pointermove", handleMove, { passive: false });
        window.addEventListener("pointerup", handleUp, { passive: true });
    }

    // disattivando “Più giri”, riallineo accumuli = principali per β
    useEffect(() => {
        if (!allowAccum) {
            endAccumRef.current  = endDeg;
        }
        prevEndDegRef.current  = endDeg;
    }, [allowAccum, endDeg]);

    // ===== pezzi grafici =====
    function ArcSmall() {
        const a = thetaOrientedMagMod; // ampiezza 0..360
        if (a <= 1e-6) return null;
        const largeArc = a > 180 ? 1 : 0;
        const sweep = orientedIsCCW ? 0 : 1; // 0=CCW visivo
        const start = polarToXY(60, baseRad);
        const end   = polarToXY(60, endRad);
        const d = `M ${start.x} ${start.y} A 60 60 0 ${largeArc} ${sweep} ${end.x} ${end.y}`;
        return <path d={d} fill="none" stroke={orientedIsCCW ? "#3b82f6" : "#ef4444"} strokeWidth={5} />;
    }

    function ArcOnCircle() {
        if (!highlightArc) return null;
        const a = thetaOrientedMagMod;
        if (a <= 1e-6) return null;
        const largeArc = a > 180 ? 1 : 0;
        const sweep = orientedIsCCW ? 0 : 1;
        const start = polarToXY(R, baseRad);
        const end   = polarToXY(R, endRad);
        const d = `M ${start.x} ${start.y} A ${R} ${R} 0 ${largeArc} ${sweep} ${end.x} ${end.y}`;
        return <path d={d} fill="none" stroke={orientedIsCCW ? "#ef4444" : "#7f1d1d"} strokeWidth={6} strokeLinecap="round" />;
    }

    function SectorFilled() {
        if (!showSector) return null;
        const a = thetaOrientedMagMod;
        if (a <= 1e-6) return null;
        const largeArc = a > 180 ? 1 : 0;
        const sweep = orientedIsCCW ? 0 : 1;
        const start = polarToXY(R, baseRad);
        const end   = polarToXY(R, endRad);
        const d = `M ${cx} ${cy} L ${start.x} ${start.y} A ${R} ${R} 0 ${largeArc} ${sweep} ${end.x} ${end.y} Z`;
        return <path d={d} fill="rgba(59,130,246,0.18)" stroke="none" />;
    }

    function Ticks() {
        if (!showTicks) return null;
        const items: React.ReactElement[] = [];
        for (let d = 0; d < 360; d += 30) {
            const r = d * DEG2RAD;
            const i = polarToXY(R - 8, r);
            const o = polarToXY(R + 8, r);
            items.push(<line key={`t-${d}`} x1={i.x} y1={i.y} x2={o.x} y2={o.y} stroke="#cbd5e1" />);
            const lab = polarToXY(R + 22, r);
            items.push(
                <text key={`lbl-${d}`} x={lab.x} y={lab.y} fontSize={10} textAnchor="middle" dominantBaseline="middle" fill="#64748b">
                    {d}°
                </text>
            );
        }
        return <g>{items}</g>;
    }

    // goniometria rispetto a β
    const cosVal = Math.cos(endRad);
    const sinVal = Math.sin(endRad);
    const tanVal = Math.tan(endRad);
    const yTanRaw = cy - R * tanVal;
    const yTan = clamp(yTanRaw, cy - R * 2.2, cy + R * 2.2);

    return (
        <div style={{ maxWidth: 1000, margin: "auto", padding: "1rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                Angolo orientato • più giri • funzioni goniometriche
            </h1>
            <p style={{ color: "#475569" }}>
                <b>α è bloccato a 0°</b> (asse x positivo). Trascina il punto blu per muovere β.
                θ = β − α (antiorario = positivo).
            </p>

            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}>
                {/* canvas */}
                <div style={{ background: "white", borderRadius: 16, padding: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
                    <svg
                        ref={svgRef}
                        viewBox={`0 0 ${size} ${size}`}
                        style={{ width: "100%", height: "auto", cursor: "crosshair", touchAction: "none" }}
                        onPointerDown={onPointerDown}
                    >
                        <rect x={0} y={0} width={size} height={size} fill="white" />

                        {/* cerchio + tacche */}
                        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#e5e7eb" strokeWidth={2} />
                        <Ticks />

                        {/* settore e arco grande (orientati) */}
                        <SectorFilled />
                        <ArcOnCircle />

                        {/* assi */}
                        <line x1={cx - R - 12} y1={cy} x2={cx + R + 12} y2={cy} stroke="#d1d5db" strokeDasharray="6 6" />
                        <line x1={cx} y1={cy - R - 12} x2={cx} y2={cy + R + 12} stroke="#d1d5db" strokeDasharray="6 6" />

                        {/* lati */}
                        <line x1={cx} y1={cy} x2={B.x} y2={B.y} stroke="#6b7280" strokeWidth={4} />
                        <line x1={cx} y1={cy} x2={P.x} y2={P.y} stroke={highlightRadius ? "#f59e0b" : "#111827"} strokeWidth={highlightRadius ? 6 : 4} />

                        {/* arco piccolo (orientato) */}
                        <ArcSmall />

                        {/* proiezioni + segmenti cos/sin */}
                        {showProjections && (
                            <>
                                {/* guide tratteggiate dalla punta P agli assi */}
                                <line x1={P.x} y1={P.y} x2={Px.x} y2={Px.y} stroke="#94a3b8" strokeDasharray="4 4" />
                                <line x1={P.x} y1={P.y} x2={Py.x} y2={Py.y} stroke="#94a3b8" strokeDasharray="4 4" />

                                {/* cosθ sull'asse x: dal centro (0) al punto Px sull'asse x */}
                                {showCos && (
                                    <>
                                        <line x1={cx} y1={cy} x2={Px.x} y2={cy} stroke="#0ea5e9" strokeWidth={5} />
                                        <circle cx={Px.x} cy={cy} r={4} fill="#0ea5e9" />
                                    </>
                                )}

                                {/* sinθ sull'asse y: dal centro (0) al punto Py sull'asse y */}
                                {showSin && (
                                    <>
                                        <line x1={cx} y1={cy} x2={cx} y2={Py.y} stroke="#10b981" strokeWidth={5} />
                                        <circle cx={cx} cy={Py.y} r={4} fill="#10b981" />
                                    </>
                                )}
                            </>
                        )}

                        {/* tangente */}
                        {showTan && (
                            <>
                                <line x1={cx + R} y1={cy - R * 2.4} x2={cx + R} y2={cy + R * 2.4} stroke="#f97316" strokeDasharray="6 6" />
                                <line x1={cx + R} y1={cy} x2={cx + R} y2={yTan} stroke="#f97316" strokeWidth={5} />
                                <circle cx={cx + R} cy={yTan} r={4} fill="#f97316" />
                            </>
                        )}

                        {/* manici (solo β “attivo”) */}
                        <circle cx={B.x} cy={B.y} r={10} fill="#9ca3af" stroke="#0f172a" />
                        <circle cx={P.x} cy={P.y} r={10} fill="#3b82f6" stroke="#0f172a" />

                        {/* centro e label */}
                        <circle cx={cx} cy={cy} r={5} fill="#111827" />
                        <text x={cx + R + 10} y={cy - 8} fontSize={12} fill="#6b7280">lato iniziale (α=0° bloccato)</text>
                    </svg>
                </div>

                {/* pannello controlli */}
                <div style={{ background: "white", borderRadius: 16, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
                    {/* letture */}
                    <div style={{ display: "grid", gap: 6 }}>
                        <div><b>α (iniziale):</b> {baseDeg.toFixed(1)}°</div>
                        <div><b>β (finale):</b> {endDeg.toFixed(1)}°</div>
                        <div><b>θ orientato:</b> {thetaOrientedDeg.toFixed(1)}° ({(thetaOrientedDeg * DEG2RAD).toFixed(3)} rad = {formatRadPi(thetaOrientedDeg * DEG2RAD)})</div>
                        <div><b>θ principale (scorciatoia):</b> {thetaPrincipalDeg.toFixed(1)}°</div>
                        <div className="muted" style={{ color: "#64748b" }}>Segno: {orientedIsCCW ? "antiorario (+)" : "orario (−)"} — giri ≈ {(thetaOrientedDeg / 360).toFixed(2)}</div>
                    </div>

                    {/* controlli numerici: α disabilitato, β attivo */}
                    <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                            <label>α (°)
                                <input type="number" value={baseDeg} disabled />
                            </label>
                            <label>β (°)
                                <input
                                    type="number" min={0} max={360} step={0.1}
                                    value={endDeg}
                                    onChange={(e) => {
                                        const v = clamp(parseFloat(e.target.value || "0"), 0, 360);
                                        const vs = snapIfClose(v, snapNotevoli);
                                        const prev = prevEndDegRef.current;
                                        let diff = vs - prev;
                                        diff = principal(diff);
                                        endAccumRef.current += diff;
                                        prevEndDegRef.current = vs;
                                        setEndDeg(vs);
                                    }}
                                />
                            </label>
                        </div>

                        {/* animazione + opzioni visuali */}
                        <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                            <button
                                style={{ padding: "8px 16px", borderRadius: 16, background: "black", color: "white", border: 0 }}
                                onClick={() => setIsAnimating(v => !v)}
                            >
                                {isAnimating ? "Pausa" : "Avvia animazione"}
                            </button>
                            <button
                                style={{ padding: "8px 16px", borderRadius: 16, background: "#f3f4f6", border: 0 }}
                                onClick={() => {
                                    // reset: α resta 0, β torna 0
                                    setEndDeg(0);
                                    endAccumRef.current = 0;
                                    prevEndDegRef.current = 0;
                                }}
                            >
                                Reset
                            </button>

                            <button
                                style={{ padding: "8px 16px", borderRadius: 16, background: highlightArc ? "#fecaca" : "#f3f4f6", border: 0 }}
                                onClick={() => setHighlightArc(s => !s)}
                            >
                                {highlightArc ? "Nascondi arco" : "Evidenzia arco sulla circonferenza"}
                            </button>
                            <button
                                style={{ padding: "8px 16px", borderRadius: 16, background: highlightRadius ? "#fde68a" : "#f3f4f6", border: 0 }}
                                onClick={() => setHighlightRadius(s => !s)}
                            >
                                {highlightRadius ? "Raggio normale" : "Evidenzia raggio β"}
                            </button>
                            <button
                                style={{ padding: "8px 16px", borderRadius: 16, background: showSector ? "#dbeafe" : "#f3f4f6", border: 0 }}
                                onClick={() => setShowSector(s => !s)}
                            >
                                {showSector ? "Nascondi settore" : "Mostra settore pieno"}
                            </button>
                        </div>

                        {/* switch e snap */}
                        <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
                            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <input type="checkbox" checked={allowAccum} onChange={(e) => setAllowAccum(e.target.checked)} />
                                Più giri (accumula θ oltre 360°)
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <input type="checkbox" checked={showProjections} onChange={(e) => setShowProjections(e.target.checked)} />
                                Mostra proiezioni (cosθ, sinθ)
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <input type="checkbox" checked={showTicks} onChange={(e) => setShowTicks(e.target.checked)} />
                                Mostra tacche (ogni 30°)
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <input type="checkbox" checked={snapNotevoli} onChange={(e) => setSnapNotevoli(e.target.checked)} />
                                Snap angoli notevoli (±3°)
                            </label>
                        </div>

                        {/* goniometria */}
                        <div style={{ marginTop: 12, display: "grid", gap: 6 }}>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <input type="checkbox" checked={showCos} onChange={(e) => setShowCos(e.target.checked)} />
                                    Evidenzia cosθ
                                </label>
                                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <input type="checkbox" checked={showSin} onChange={(e) => setShowSin(e.target.checked)} />
                                    Evidenzia sinθ
                                </label>
                                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <input type="checkbox" checked={showTan} onChange={(e) => setShowTan(e.target.checked)} />
                                    Evidenzia tanθ (tangente a x=1)
                                </label>
                            </div>
                            <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 13, color: "#334155" }}>
                                cosθ = {cosVal.toFixed(3)} • sinθ = {sinVal.toFixed(3)} • tanθ = {Math.abs(tanVal) > 1e3 ? "∞" : tanVal.toFixed(3)}
                            </div>
                        </div>

                        {/* animazione */}
                        <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10 }}>
                            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                Velocità (°/s)
                                <input type="number" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value || "0"))} style={{ width: 80 }} />
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <input type="checkbox" checked={direction === -1} onChange={(e) => setDirection(e.target.checked ? -1 : 1)} />
                                Senso orario (animazione)
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
