/**
 * AngleRotationDemo - Versione refactorizzata
 * Angolo orientato, più giri, funzioni goniometriche
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { DemoContainer } from "../../components/ui";
import {
    DEG_TO_RAD,
    RAD_TO_DEG,
    clamp,
    normalizeAngleDeg,
    normalizeAngleDegSigned,
    formatRadiansPi,
    snapToNotableAngle,
    polarToCartesianSVG,
} from "../../utils/math";

// ============ COSTANTI ============

const SIZE = 420;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 160;

// ============ COMPONENTE PRINCIPALE ============

export default function AngleRotationDemo() {
    // Lato iniziale (α) fisso a 0°, lato finale (β) variabile
    const [baseDeg] = useState(0);
    const [endDeg, setEndDeg] = useState(35);

    // Accumuli per il verso reale
    const baseAccumRef = useRef(0);
    const endAccumRef = useRef(35);
    const prevEndDegRef = useRef(endDeg);

    // Animazione
    const [isAnimating, setIsAnimating] = useState(false);
    const [speed, setSpeed] = useState(30);
    const [direction, setDirection] = useState(1); // 1=CCW, -1=CW

    // Opzioni UI
    const [showProjections, setShowProjections] = useState(true);
    const [highlightArc, setHighlightArc] = useState(false);
    const [highlightRadius, setHighlightRadius] = useState(false);
    const [showSector, setShowSector] = useState(false);
    const [snapNotevoli, setSnapNotevoli] = useState(true);
    const [showTicks, setShowTicks] = useState(true);
    const [allowAccum, setAllowAccum] = useState(true);

    // Goniometria
    const [showCos, setShowCos] = useState(true);
    const [showSin, setShowSin] = useState(true);
    const [showTan, setShowTan] = useState(false);

    const svgRef = useRef<SVGSVGElement | null>(null);

    const baseRad = useMemo(() => baseDeg * DEG_TO_RAD, [baseDeg]);
    const endRad = useMemo(() => endDeg * DEG_TO_RAD, [endDeg]);

    // Animazione
    useEffect(() => {
        if (!isAnimating) return;
        let raf: number;
        let last = performance.now();

        const tick = (t: number) => {
            const dt = (t - last) / 1000;
            last = t;
            const delta = direction * speed * dt;
            endAccumRef.current += delta;
            setEndDeg(normalizeAngleDeg(endAccumRef.current));
            raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [isAnimating, speed, direction]);

    // Punti chiave
    const B = polarToCartesianSVG(R, baseRad, CX, CY);
    const P = polarToCartesianSVG(R, endRad, CX, CY);
    const Px = { x: P.x, y: CY };
    const Py = { x: CX, y: P.y };

    // Angolo orientato
    const thetaOrientedDeg = endAccumRef.current - baseAccumRef.current;
    const orientedIsCCW = thetaOrientedDeg >= 0;
    const thetaOrientedMagMod = ((Math.abs(thetaOrientedDeg) % 360) + 360) % 360;
    const thetaPrincipalDeg = normalizeAngleDegSigned(endDeg - baseDeg);

    // Goniometria
    const cosVal = Math.cos(endRad);
    const sinVal = Math.sin(endRad);
    const tanVal = Math.tan(endRad);
    const yTanRaw = CY - R * tanVal;
    const yTan = clamp(yTanRaw, CY - R * 2.2, CY + R * 2.2);

    // Drag handler
    function onPointerDown(e: React.PointerEvent<SVGSVGElement>) {
        const svg = svgRef.current;
        if (!svg) return;

        const el = e.currentTarget;
        el.setPointerCapture?.(e.pointerId);

        const pt = svg.createSVGPoint();
        const getLocal = (ev: PointerEvent) => {
            pt.x = ev.clientX;
            pt.y = ev.clientY;
            const ctm = svg.getScreenCTM();
            if (!ctm) return { x: 0, y: 0 };
            return pt.matrixTransform(ctm.inverse());
        };

        const handleMove = (ev: PointerEvent) => {
            const p = getLocal(ev);
            const dx = p.x - CX;
            const dy = p.y - CY;
            let deg = Math.atan2(-dy, dx) * RAD_TO_DEG;
            if (deg < 0) deg += 360;

            if (snapNotevoli) {
                deg = snapToNotableAngle(deg);
            }

            const prev = prevEndDegRef.current;
            let diff = deg - prev;
            diff = normalizeAngleDegSigned(diff);
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

    // Sync accumuli quando si disattiva "Più giri"
    useEffect(() => {
        if (!allowAccum) {
            endAccumRef.current = endDeg;
        }
        prevEndDegRef.current = endDeg;
    }, [allowAccum, endDeg]);

    // ============ COMPONENTI GRAFICI ============

    function ArcSmall() {
        const a = thetaOrientedMagMod;
        if (a <= 1e-6) return null;

        const largeArc = a > 180 ? 1 : 0;
        const sweep = orientedIsCCW ? 0 : 1;
        const start = polarToCartesianSVG(60, baseRad, CX, CY);
        const end = polarToCartesianSVG(60, endRad, CX, CY);
        const d = `M ${start.x} ${start.y} A 60 60 0 ${largeArc} ${sweep} ${end.x} ${end.y}`;

        return <path d={d} fill="none" stroke={orientedIsCCW ? "#3b82f6" : "#ef4444"} strokeWidth={5} />;
    }

    function ArcOnCircle() {
        if (!highlightArc) return null;
        const a = thetaOrientedMagMod;
        if (a <= 1e-6) return null;

        const largeArc = a > 180 ? 1 : 0;
        const sweep = orientedIsCCW ? 0 : 1;
        const start = polarToCartesianSVG(R, baseRad, CX, CY);
        const end = polarToCartesianSVG(R, endRad, CX, CY);
        const d = `M ${start.x} ${start.y} A ${R} ${R} 0 ${largeArc} ${sweep} ${end.x} ${end.y}`;

        return <path d={d} fill="none" stroke={orientedIsCCW ? "#ef4444" : "#7f1d1d"} strokeWidth={6} strokeLinecap="round" />;
    }

    function SectorFilled() {
        if (!showSector) return null;
        const a = thetaOrientedMagMod;
        if (a <= 1e-6) return null;

        const largeArc = a > 180 ? 1 : 0;
        const sweep = orientedIsCCW ? 0 : 1;
        const start = polarToCartesianSVG(R, baseRad, CX, CY);
        const end = polarToCartesianSVG(R, endRad, CX, CY);
        const d = `M ${CX} ${CY} L ${start.x} ${start.y} A ${R} ${R} 0 ${largeArc} ${sweep} ${end.x} ${end.y} Z`;

        return <path d={d} fill="rgba(59,130,246,0.18)" stroke="none" />;
    }

    function Ticks() {
        if (!showTicks) return null;

        const items: React.ReactElement[] = [];
        for (let d = 0; d < 360; d += 30) {
            const r = d * DEG_TO_RAD;
            const inner = polarToCartesianSVG(R - 8, r, CX, CY);
            const outer = polarToCartesianSVG(R + 8, r, CX, CY);
            items.push(<line key={`t-${d}`} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#cbd5e1" />);

            const lab = polarToCartesianSVG(R + 22, r, CX, CY);
            items.push(
                <text key={`lbl-${d}`} x={lab.x} y={lab.y} fontSize={10} textAnchor="middle" dominantBaseline="middle" fill="#64748b">
                    {d}°
                </text>
            );
        }
        return <g>{items}</g>;
    }

    // ============ RENDER ============

    return (
        <DemoContainer
            title="Angolo orientato • più giri • funzioni goniometriche"
            description="α è bloccato a 0° (asse x positivo). Trascina il punto blu per muovere β. θ = β − α (antiorario = positivo)."
        >
            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}>
                {/* Canvas */}
                <div style={{ background: "white", borderRadius: 16, padding: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
                    <svg
                        ref={svgRef}
                        viewBox={`0 0 ${SIZE} ${SIZE}`}
                        style={{ width: "100%", height: "auto", cursor: "crosshair", touchAction: "none" }}
                        onPointerDown={onPointerDown}
                    >
                        <rect x={0} y={0} width={SIZE} height={SIZE} fill="white" />

                        {/* Cerchio + tacche */}
                        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#e5e7eb" strokeWidth={2} />
                        <Ticks />

                        {/* Settore e arco grande */}
                        <SectorFilled />
                        <ArcOnCircle />

                        {/* Assi */}
                        <line x1={CX - R - 12} y1={CY} x2={CX + R + 12} y2={CY} stroke="#d1d5db" strokeDasharray="6 6" />
                        <line x1={CX} y1={CY - R - 12} x2={CX} y2={CY + R + 12} stroke="#d1d5db" strokeDasharray="6 6" />

                        {/* Lati */}
                        <line x1={CX} y1={CY} x2={B.x} y2={B.y} stroke="#6b7280" strokeWidth={4} />
                        <line x1={CX} y1={CY} x2={P.x} y2={P.y} stroke={highlightRadius ? "#f59e0b" : "#111827"} strokeWidth={highlightRadius ? 6 : 4} />

                        {/* Arco piccolo */}
                        <ArcSmall />

                        {/* Proiezioni */}
                        {showProjections && (
                            <>
                                <line x1={P.x} y1={P.y} x2={Px.x} y2={Px.y} stroke="#94a3b8" strokeDasharray="4 4" />
                                <line x1={P.x} y1={P.y} x2={Py.x} y2={Py.y} stroke="#94a3b8" strokeDasharray="4 4" />

                                {showCos && (
                                    <>
                                        <line x1={CX} y1={CY} x2={Px.x} y2={CY} stroke="#0ea5e9" strokeWidth={5} />
                                        <circle cx={Px.x} cy={CY} r={4} fill="#0ea5e9" />
                                    </>
                                )}

                                {showSin && (
                                    <>
                                        <line x1={CX} y1={CY} x2={CX} y2={Py.y} stroke="#10b981" strokeWidth={5} />
                                        <circle cx={CX} cy={Py.y} r={4} fill="#10b981" />
                                    </>
                                )}
                            </>
                        )}

                        {/* Tangente */}
                        {showTan && (
                            <>
                                <line x1={CX + R} y1={CY - R * 2.4} x2={CX + R} y2={CY + R * 2.4} stroke="#f97316" strokeDasharray="6 6" />
                                <line x1={CX + R} y1={CY} x2={CX + R} y2={yTan} stroke="#f97316" strokeWidth={5} />
                                <circle cx={CX + R} cy={yTan} r={4} fill="#f97316" />
                            </>
                        )}

                        {/* Manici */}
                        <circle cx={B.x} cy={B.y} r={10} fill="#9ca3af" stroke="#0f172a" />
                        <circle cx={P.x} cy={P.y} r={10} fill="#3b82f6" stroke="#0f172a" />

                        {/* Centro */}
                        <circle cx={CX} cy={CY} r={5} fill="#111827" />
                        <text x={CX + R + 10} y={CY - 8} fontSize={12} fill="#6b7280">lato iniziale (α=0° bloccato)</text>
                    </svg>
                </div>

                {/* Pannello controlli */}
                <div style={{ background: "white", borderRadius: 16, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
                    {/* Letture */}
                    <div style={{ display: "grid", gap: 6, marginBottom: 12 }}>
                        <div><b>α (iniziale):</b> {baseDeg.toFixed(1)}°</div>
                        <div><b>β (finale):</b> {endDeg.toFixed(1)}°</div>
                        <div><b>θ orientato:</b> {thetaOrientedDeg.toFixed(1)}° ({(thetaOrientedDeg * DEG_TO_RAD).toFixed(3)} rad = {formatRadiansPi(thetaOrientedDeg * DEG_TO_RAD)})</div>
                        <div><b>θ principale:</b> {thetaPrincipalDeg.toFixed(1)}°</div>
                        <div style={{ color: "#64748b" }}>Segno: {orientedIsCCW ? "antiorario (+)" : "orario (−)"} — giri ≈ {(thetaOrientedDeg / 360).toFixed(2)}</div>
                    </div>

                    {/* Input β */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                        <label>
                            α (°)
                            <input type="number" value={baseDeg} disabled style={{ width: "100%", padding: 6, borderRadius: 6, border: "1px solid #d1d5db" }} />
                        </label>
                        <label>
                            β (°)
                            <input
                                type="number"
                                min={0}
                                max={360}
                                step={0.1}
                                value={endDeg}
                                onChange={(e) => {
                                    const v = clamp(parseFloat(e.target.value || "0"), 0, 360);
                                    const vs = snapNotevoli ? snapToNotableAngle(v) : v;
                                    const prev = prevEndDegRef.current;
                                    let diff = vs - prev;
                                    diff = normalizeAngleDegSigned(diff);
                                    endAccumRef.current += diff;
                                    prevEndDegRef.current = vs;
                                    setEndDeg(vs);
                                }}
                                style={{ width: "100%", padding: 6, borderRadius: 6, border: "1px solid #d1d5db" }}
                            />
                        </label>
                    </div>

                    {/* Pulsanti animazione */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                        <button
                            onClick={() => setIsAnimating((v) => !v)}
                            style={{ padding: "8px 16px", borderRadius: 16, background: "black", color: "white", border: 0, cursor: "pointer" }}
                        >
                            {isAnimating ? "Pausa" : "Avvia animazione"}
                        </button>
                        <button
                            onClick={() => {
                                setEndDeg(0);
                                endAccumRef.current = 0;
                                prevEndDegRef.current = 0;
                            }}
                            style={{ padding: "8px 16px", borderRadius: 16, background: "#f3f4f6", border: 0, cursor: "pointer" }}
                        >
                            Reset
                        </button>
                    </div>

                    {/* Toggle visuali */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                        <ToggleButton active={highlightArc} onClick={() => setHighlightArc((s) => !s)} label="Arco" activeColor="#fecaca" />
                        <ToggleButton active={highlightRadius} onClick={() => setHighlightRadius((s) => !s)} label="Raggio β" activeColor="#fde68a" />
                        <ToggleButton active={showSector} onClick={() => setShowSector((s) => !s)} label="Settore" activeColor="#dbeafe" />
                    </div>

                    {/* Checkbox */}
                    <div style={{ display: "grid", gap: 6, marginBottom: 12 }}>
                        <Checkbox checked={allowAccum} onChange={setAllowAccum} label="Più giri (accumula θ oltre 360°)" />
                        <Checkbox checked={showProjections} onChange={setShowProjections} label="Mostra proiezioni (cosθ, sinθ)" />
                        <Checkbox checked={showTicks} onChange={setShowTicks} label="Mostra tacche (ogni 30°)" />
                        <Checkbox checked={snapNotevoli} onChange={setSnapNotevoli} label="Snap angoli notevoli (±3°)" />
                    </div>

                    {/* Goniometria */}
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
                            <Checkbox checked={showCos} onChange={setShowCos} label="cosθ" />
                            <Checkbox checked={showSin} onChange={setShowSin} label="sinθ" />
                            <Checkbox checked={showTan} onChange={setShowTan} label="tanθ" />
                        </div>
                        <div style={{ fontFamily: "monospace", fontSize: 13, color: "#334155" }}>
                            cosθ = {cosVal.toFixed(3)} • sinθ = {sinVal.toFixed(3)} • tanθ = {Math.abs(tanVal) > 1e3 ? "∞" : tanVal.toFixed(3)}
                        </div>
                    </div>

                    {/* Velocità animazione */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            Velocità (°/s)
                            <input
                                type="number"
                                value={speed}
                                onChange={(e) => setSpeed(parseFloat(e.target.value || "0"))}
                                style={{ width: 80, padding: 4, borderRadius: 6, border: "1px solid #d1d5db" }}
                            />
                        </label>
                        <Checkbox checked={direction === -1} onChange={(v) => setDirection(v ? -1 : 1)} label="Senso orario" />
                    </div>
                </div>
            </div>
        </DemoContainer>
    );
}

// ============ COMPONENTI HELPER ============

function ToggleButton({ active, onClick, label, activeColor }: { active: boolean; onClick: () => void; label: string; activeColor: string }) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: "6px 12px",
                borderRadius: 12,
                background: active ? activeColor : "#f3f4f6",
                border: 0,
                cursor: "pointer",
                fontSize: 13,
            }}
        >
            {label}
        </button>
    );
}

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
    return (
        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
            {label}
        </label>
    );
}