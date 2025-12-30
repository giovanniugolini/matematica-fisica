/**
 * LeggeCoulombDemo - Versione refactorizzata
 * Due cariche puntiformi su un piano con forza di Coulomb
 */

import React, { useMemo, useRef, useState } from "react";
import { DemoContainer } from "../../components/ui";
import {
    clamp,
    Vec2,
    vecNormalize,
    coulombForce,
    formatScientific,
    RAD_TO_DEG,
} from "../../utils/math";

// ============ COSTANTI ============

const WIDTH = 920;
const HEIGHT = 520;
const PAD = 40;

// Unità di carica disponibili
const CHARGE_UNITS = ["nC", "µC", "mC", "C"] as const;
type ChargeUnit = typeof CHARGE_UNITS[number];

const UNIT_TO_COULOMB: Record<ChargeUnit, number> = {
    nC: 1e-9,
    "µC": 1e-6,
    mC: 1e-3,
    C: 1,
};

// ============ COMPONENTE FRECCIA ============

function Arrow({ x1, y1, x2, y2, color = "#10b981", label }: {
    x1: number; y1: number; x2: number; y2: number; color?: string; label?: string;
}) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const L = Math.hypot(dx, dy) || 1;
    const ux = dx / L, uy = dy / L;
    const head = 12;
    const backX = x2 - ux * head;
    const backY = y2 - uy * head;
    const leftX = backX + (-uy) * 7;
    const leftY = backY + (ux) * 7;
    const rightX = backX - (-uy) * 7;
    const rightY = backY - (ux) * 7;

    return (
        <g>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={4} />
            <polygon points={`${x2},${y2} ${leftX},${leftY} ${rightX},${rightY}`} fill={color} />
            {label && (
                <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 8} fontSize={12} textAnchor="middle" fill={color}>{label}</text>
            )}
        </g>
    );
}

// ============ COMPONENTE PRINCIPALE ============

export default function LeggeCoulombDemo() {
    // Stato cariche
    const [unit, setUnit] = useState<ChargeUnit>("µC");
    const [pxPerMeter, setPxPerMeter] = useState<number>(130);
    const [gain, setGain] = useState<number>(800);
    const [showForces, setShowForces] = useState<boolean>(true);

    const [q1, setQ1] = useState<number>(+3);
    const [q2, setQ2] = useState<number>(-4);
    const [p1, setP1] = useState<Vec2>({ x: WIDTH * 0.33, y: HEIGHT * 0.52 });
    const [p2, setP2] = useState<Vec2>({ x: WIDTH * 0.67, y: HEIGHT * 0.38 });

    // Drag
    const svgRef = useRef<SVGSVGElement | null>(null);
    const [drag, setDrag] = useState<null | { which: "q1" | "q2"; id: number }>(null);

    // Conversioni
    const q1C = useMemo(() => q1 * UNIT_TO_COULOMB[unit], [q1, unit]);
    const q2C = useMemo(() => q2 * UNIT_TO_COULOMB[unit], [q2, unit]);

    // Geometria
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const r_px = Math.max(1, Math.hypot(dx, dy));
    const r_m = r_px / pxPerMeter;
    const dir = vecNormalize({ x: dx, y: dy });

    const coincidenti = r_px < 8;

    // Forza di Coulomb
    const prod = q1C * q2C;
    const Fmag = coincidenti ? 0 : Math.abs(coulombForce(q1C, q2C, r_m));
    const sign = prod > 0 ? -1 : +1; // repulsione vs attrazione
    const F1x = sign * dir.x * Fmag;
    const F1y = sign * dir.y * Fmag;
    const F2x = -F1x;
    const F2y = -F1y;

    // Vettori in pixel
    const vpx = (F: number) => {
        const L = Math.abs(F) * gain;
        const sgn = F >= 0 ? 1 : -1;
        return sgn * clamp(L, 6, 2000);
    };
    const F1x_px = vpx(F1x), F1y_px = vpx(F1y);
    const F2x_px = vpx(F2x), F2y_px = vpx(F2y);

    const angle1 = Math.atan2(F1y, F1x) * RAD_TO_DEG;
    const verso = prod < 0 ? "attrazione" : "repulsione";

    // ============ DRAG HANDLERS ============

    // Ref per tracciare il touch attivo (più affidabile su iOS)
    const activeTouchRef = useRef<{ id: number; which: "q1" | "q2" } | null>(null);

    function ptrToLocal(clientX: number, clientY: number) {
        const rect = svgRef.current!.getBoundingClientRect();
        // Calcola la scala del viewBox rispetto al rect
        const scaleX = WIDTH / rect.width;
        const scaleY = HEIGHT / rect.height;
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    function updatePosition(clientX: number, clientY: number, which: "q1" | "q2") {
        const m = ptrToLocal(clientX, clientY);
        const nx = clamp(m.x, PAD, WIDTH - PAD);
        const ny = clamp(m.y, PAD, HEIGHT - PAD);
        if (which === "q1") setP1({ x: nx, y: ny });
        else setP2({ x: nx, y: ny });
    }

    // ===== TOUCH EVENTS (iOS/Android) =====
    function onTouchStart(which: "q1" | "q2") {
        return (e: React.TouchEvent) => {
            e.preventDefault();
            e.stopPropagation();
            const touch = e.touches[0];
            activeTouchRef.current = { id: touch.identifier, which };
            setDrag({ which, id: touch.identifier });
        };
    }

    function onTouchMove(e: React.TouchEvent<SVGSVGElement>) {
        if (!activeTouchRef.current) return;
        e.preventDefault();

        const touch = Array.from(e.touches).find(t => t.identifier === activeTouchRef.current!.id);
        if (!touch) return;

        updatePosition(touch.clientX, touch.clientY, activeTouchRef.current.which);
    }

    function onTouchEnd(e: React.TouchEvent<SVGSVGElement>) {
        if (!activeTouchRef.current) return;

        const stillTouching = Array.from(e.touches).some(
            t => t.identifier === activeTouchRef.current!.id
        );

        if (!stillTouching) {
            activeTouchRef.current = null;
            setDrag(null);
        }
    }

    // ===== POINTER/MOUSE EVENTS (Desktop) =====
    function startDrag(which: "q1" | "q2", e: React.PointerEvent<Element>) {
        // Su touch, lascia gestire a onTouchStart
        if (e.pointerType === "touch") return;

        e.preventDefault();
        e.stopPropagation();
        (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
        setDrag({ which, id: e.pointerId });
    }

    function moveDrag(e: React.PointerEvent<SVGSVGElement>) {
        // Su touch, lascia gestire a onTouchMove
        if (e.pointerType === "touch") return;
        if (!drag) return;

        e.preventDefault();
        updatePosition(e.clientX, e.clientY, drag.which);
    }

    function endDrag(e: React.PointerEvent<SVGSVGElement>) {
        if (e.pointerType === "touch") return;
        if (drag && e.pointerId === drag.id) setDrag(null);
    }

    function randomizePositions() {
        const rnd = () => ({
            x: PAD + Math.random() * (WIDTH - 2 * PAD),
            y: PAD + Math.random() * (HEIGHT - 2 * PAD),
        });
        let a = rnd(), b = rnd();
        let tries = 0;
        while (Math.hypot(a.x - b.x, a.y - b.y) < 120 && tries < 50) { b = rnd(); tries++; }
        setP1(a); setP2(b);
    }

    function autoScale() {
        if (Fmag > 0) {
            const targetPx = 140;
            setGain(clamp(targetPx / Fmag, 5, 5000));
        }
    }

    function reset() {
        setQ1(3); setQ2(-4); setUnit("µC");
        setP1({ x: WIDTH * 0.33, y: HEIGHT * 0.52 });
        setP2({ x: WIDTH * 0.67, y: HEIGHT * 0.38 });
        setGain(500); setPxPerMeter(60);
    }

    // ============ STILI ============

    const cardStyle: React.CSSProperties = {
        background: "#fff",
        borderRadius: 16,
        padding: 12,
        boxShadow: "0 1px 4px rgba(0,0,0,0.1)"
    };

    const cursor = drag ? "grabbing" : "grab";

    // ============ RENDER ============

    return (
        <DemoContainer
            title="Legge di Coulomb — due cariche puntiformi"
            description="Trascina i dischi per spostare q1 e q2. Osserva i vettori forza: direzione lungo la congiungente, modulo |F| = k|q₁q₂|/r²."
        >
            {/* Canvas principale */}
            <div style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>Piano (x,y)</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                            <input type="checkbox" checked={showForces} onChange={(e) => setShowForces(e.target.checked)} />
                            Mostra forze
                        </label>
                        <button onClick={autoScale} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer" }}>
                            Auto-scala
                        </button>
                        <button onClick={randomizePositions} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer" }}>
                            Randomizza
                        </button>
                        <button onClick={reset} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer" }}>
                            Reset
                        </button>
                    </div>
                </div>

                <svg
                    ref={svgRef}
                    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                    style={{ width: "100%", height: "auto", maxHeight: "65vh", display: "block", margin: "0 auto", touchAction: "none" }}
                    onPointerMove={moveDrag}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    onPointerLeave={endDrag}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                    onTouchCancel={onTouchEnd}
                >
                    {/* Sfondo */}
                    <rect x={0} y={0} width={WIDTH} height={HEIGHT} rx={16} fill="#ffffff" />

                    {/* Griglia */}
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((i) => (
                        <line key={`vg-${i}`} x1={(i * WIDTH) / 10} y1={PAD} x2={(i * WIDTH) / 10} y2={HEIGHT - PAD} stroke="#f1f5f9" />
                    ))}
                    {Array.from({ length: 8 }, (_, i) => i + 1).map((i) => (
                        <line key={`hg-${i}`} x1={PAD} y1={(i * HEIGHT) / 8} x2={WIDTH - PAD} y2={(i * HEIGHT) / 8} stroke="#f1f5f9" />
                    ))}

                    {/* Segmento distanza */}
                    <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#94a3b8" strokeDasharray="6 6" />

                    {/* Vettori forza */}
                    {showForces && !coincidenti && (
                        <>
                            <Arrow x1={p1.x} y1={p1.y} x2={p1.x + F1x_px} y2={p1.y + F1y_px} color="#0ea5e9" label="F₁" />
                            <Arrow x1={p2.x} y1={p2.y} x2={p2.x + F2x_px} y2={p2.y + F2y_px} color="#ef4444" label="F₂" />
                        </>
                    )}

                    {/* Cariche */}
                    <g style={{ cursor }}>
                        {/* q1 - area touch più grande per mobile (40px) */}
                        <circle
                            cx={p1.x} cy={p1.y} r={40}
                            fill="transparent"
                            style={{ touchAction: "none" }}
                            onTouchStart={onTouchStart("q1")}
                            onPointerDown={(e) => startDrag("q1", e)}
                        />
                        <circle cx={p1.x} cy={p1.y} r={20} fill={q1 >= 0 ? "#0ea5e9" : "#0284c7"} stroke="#0c4a6e" strokeWidth={2} pointerEvents="none" />
                        <text x={p1.x} y={p1.y + 5} fontSize={14} textAnchor="middle" fill="#ffffff" fontWeight={600} pointerEvents="none">q₁</text>

                        {/* q2 - area touch più grande per mobile (40px) */}
                        <circle
                            cx={p2.x} cy={p2.y} r={40}
                            fill="transparent"
                            style={{ touchAction: "none" }}
                            onTouchStart={onTouchStart("q2")}
                            onPointerDown={(e) => startDrag("q2", e)}
                        />
                        <circle cx={p2.x} cy={p2.y} r={20} fill={q2 >= 0 ? "#ef4444" : "#dc2626"} stroke="#7f1d1d" strokeWidth={2} pointerEvents="none" />
                        <text x={p2.x} y={p2.y + 5} fontSize={14} textAnchor="middle" fill="#ffffff" fontWeight={600} pointerEvents="none">q₂</text>
                    </g>

                    {/* Etichetta distanza */}
                    <g>
                        <circle cx={(p1.x + p2.x) / 2} cy={(p1.y + p2.y) / 2} r={3} fill="#94a3b8" />
                        <text x={(p1.x + p2.x) / 2} y={(p1.y + p2.y) / 2 - 10} fontSize={13} textAnchor="middle" fill="#475569" fontWeight={500}>
                            r = {r_m.toFixed(2)} m
                        </text>
                    </g>
                </svg>
            </div>

            {/* Controlli in basso */}
            <div style={{ display: "grid", gridTemplateColumns: "auto auto 1fr", gap: 16, marginTop: 16 }}>
                {/* Carica q1 */}
                <div style={{ ...cardStyle, padding: "12px 16px" }}>
                    <div style={{ fontWeight: 600, marginBottom: 8, color: "#0ea5e9", fontSize: 14 }}>⊕ Carica q₁</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <CompactInput label="q₁" unit={unit} value={q1} step={0.1} onChange={setQ1} />
                        <div style={{ fontSize: 12, color: "#64748b" }}>= {formatScientific(q1C, 2)} C</div>
                    </div>
                </div>

                {/* Carica q2 */}
                <div style={{ ...cardStyle, padding: "12px 16px" }}>
                    <div style={{ fontWeight: 600, marginBottom: 8, color: "#ef4444", fontSize: 14 }}>⊖ Carica q₂</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <CompactInput label="q₂" unit={unit} value={q2} step={0.1} onChange={setQ2} />
                        <div style={{ fontSize: 12, color: "#64748b" }}>= {formatScientific(q2C, 2)} C</div>
                    </div>
                </div>

                {/* Risultati e scala */}
                <div style={{ ...cardStyle, background: "#f0fdf4" }}>
                    <div style={{ fontWeight: 600, marginBottom: 8, color: "#10b981" }}>📊 Risultati</div>
                    {coincidenti ? (
                        <div style={{ color: "#b91c1c", fontSize: 13 }}>Cariche sovrapposte: forza non definita.</div>
                    ) : (
                        <div style={{ fontSize: 13, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                            <div>
                                <div>|<b>F</b>| = <span style={{ color: "#10b981", fontWeight: 600 }}>{formatScientific(Fmag)}</span> N</div>
                                <div>Verso: <b>{verso}</b></div>
                                <div>Angolo: <b>{isFinite(angle1) ? angle1.toFixed(1) : "–"}°</b></div>
                            </div>
                            <div>
                                <div>F₁ = ({formatScientific(F1x, 2)}, {formatScientific(F1y, 2)}) N</div>
                                <div>F₂ = ({formatScientific(F2x, 2)}, {formatScientific(F2y, 2)}) N</div>
                            </div>
                        </div>
                    )}

                    {/* Scala */}
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #d1fae5", display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                            Unità:
                            <select value={unit} onChange={(e) => setUnit(e.target.value as ChargeUnit)} style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid #d1d5db" }}>
                                {CHARGE_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                            px/m: <input type="range" min={20} max={200} value={pxPerMeter} onChange={(e) => setPxPerMeter(+e.target.value)} style={{ width: 80 }} />
                            <span style={{ minWidth: 30 }}>{pxPerMeter}</span>
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                            Gain: <input type="range" min={5} max={5000} step={5} value={gain} onChange={(e) => setGain(+e.target.value)} style={{ width: 80 }} />
                            <span style={{ minWidth: 40 }}>{Math.round(gain)}</span>
                        </label>
                    </div>
                </div>
            </div>
        </DemoContainer>
    );
}

// ============ COMPONENTI UI LOCALI ============

function CompactInput({ label, unit, value, step, onChange }: {
    label: string;
    unit: string;
    value: number;
    step: number;
    onChange: (v: number) => void;
}) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#64748b", fontSize: 13, minWidth: 24 }}>{label}</span>
            <input
                type="number"
                value={value}
                step={step}
                onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                style={{
                    padding: "4px 8px",
                    borderRadius: 4,
                    border: "1px solid #d1d5db",
                    fontSize: 13,
                    width: 70,
                    textAlign: "right"
                }}
            />
            <span style={{ color: "#94a3b8", fontSize: 12 }}>{unit}</span>
        </div>
    );
}