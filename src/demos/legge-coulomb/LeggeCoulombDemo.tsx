import React, { useMemo, useRef, useState } from "react";

/**
 * Legge di Coulomb — due cariche puntiformi su un piano
 * - Trascina le cariche (q1, q2) con **mouse o touch**
 * - Cambia i valori delle cariche e l'unità (nC, µC, mC, C)
 * - Vedi vettori forza F1 su q1 dovuta a q2 e F2 su q2 dovuta a q1
 * - Mostra modulo |F|, direzione e verso (attrazione/repulsione)
 *
 * I vettori sono scalati in px con un fattore regolabile e con un tasto "Auto‑scala".
 */

// Costante di Coulomb (vuoto)
const K = 8.9875517923e9; // N·m^2/C^2

// Dimensioni canvas SVG
const WIDTH = 920;
const HEIGHT = 520;
const PAD = 40; // padding interno per non uscire con i marker

// Unità di carica disponibili
const CHARGE_UNITS = ["nC", "µC", "mC", "C"] as const;
type ChargeUnit = typeof CHARGE_UNITS[number];
const UNIT_TO_COULOMB: Record<ChargeUnit, number> = {
    nC: 1e-9,
    "µC": 1e-6,
    mC: 1e-3,
    C: 1,
};

// Utility numeriche
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const hypot = (dx: number, dy: number) => Math.hypot(dx, dy);
const toDeg = (rad: number) => (rad * 180) / Math.PI;

// Disegno frecce
function Arrow({ x1, y1, x2, y2, color = "#10b981", label }: {
    x1: number; y1: number; x2: number; y2: number; color?: string; label?: string;
}) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const L = Math.hypot(dx, dy) || 1;
    const ux = dx / L, uy = dy / L;
    const head = 12; // px
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

export default function LeggeCoulombDemo() {
    // Stato cariche: posizione in px e valore in unità selezionata
    const [unit, setUnit] = useState<ChargeUnit>("µC");
    const [pxPerMeter, setPxPerMeter] = useState<number>(60); // scala: 60 px ≈ 1 m
    const [gain, setGain] = useState<number>(500); // px per Newton (fattore di visualizzazione vettori)
    const [showForces, setShowForces] = useState<boolean>(true);

    const [q1, setQ1] = useState<number>(+3); // in unità correnti (es. µC)
    const [q2, setQ2] = useState<number>(-4);
    const [p1, setP1] = useState<{ x: number; y: number }>({ x: WIDTH * 0.33, y: HEIGHT * 0.52 });
    const [p2, setP2] = useState<{ x: number; y: number }>({ x: WIDTH * 0.67, y: HEIGHT * 0.38 });

    // Drag con Pointer Events (mouse e touch)
    const svgRef = useRef<SVGSVGElement | null>(null);
    const [drag, setDrag] = useState<null | { which: "q1" | "q2"; id: number }>(null);

    // Conversioni cariche e distanza
    const q1C = useMemo(() => q1 * UNIT_TO_COULOMB[unit], [q1, unit]);
    const q2C = useMemo(() => q2 * UNIT_TO_COULOMB[unit], [q2, unit]);

    // Vettori geometrici
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const r_px = Math.max(1, hypot(dx, dy));
    const r_m = r_px / pxPerMeter; // metri
    const ux = dx / r_px;
    const uy = dy / r_px; // versore da q1 verso q2

    const coincidenti = r_px < 8;

    // Coulomb: F1 su q1 dovuta a q2
    const prod = q1C * q2C;
    const Fmag = coincidenti ? 0 : (K * Math.abs(prod)) / (r_m * r_m); // Newton
    const sign = prod > 0 ? -1 : +1; // verso rispetto a u12
    const F1x = sign * ux * Fmag;
    const F1y = sign * uy * Fmag;
    const F2x = -F1x;
    const F2y = -F1y;

    // Vettori in pixel per il disegno (con lunghezza minima per visibilità)
    const vpx = (F: number) => {
        const L = Math.abs(F) * gain;
        const sgn = F >= 0 ? 1 : -1;
        const Lc = Math.min(Math.max(L, 6), 2000); // tra 6px e 2000px
        return sgn * Lc;
    };
    const F1x_px = vpx(F1x), F1y_px = vpx(F1y);
    const F2x_px = vpx(F2x), F2y_px = vpx(F2y);

    const angle1 = toDeg(Math.atan2(F1y, F1x));
    const verso = prod < 0 ? "attrazione (verso l'altra carica)" : "repulsione (lontano dall'altra carica)";

    // --- Pointer helpers ---
    function ptrToLocal(e: React.PointerEvent<Element>) {
        const rect = (svgRef.current as SVGSVGElement).getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    function startDrag(which: "q1" | "q2", e: React.PointerEvent<Element>) {
        (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
        setDrag({ which, id: e.pointerId });
    }
    function moveDrag(e: React.PointerEvent<SVGSVGElement>) {
        if (!drag) return;
        const m = ptrToLocal(e);
        const nx = clamp(m.x, PAD, WIDTH - PAD);
        const ny = clamp(m.y, PAD, HEIGHT - PAD);
        if (drag.which === "q1") setP1({ x: nx, y: ny });
        else setP2({ x: nx, y: ny });
    }
    function endDrag(e: React.PointerEvent<SVGSVGElement>) {
        if (drag && e.pointerId === drag.id) setDrag(null);
    }

    // Randomizza posizioni evitando sovrapposizioni
    function randomizePositions() {
        function rnd() {
            return {
                x: PAD + Math.random() * (WIDTH - 2 * PAD),
                y: PAD + Math.random() * (HEIGHT - 2 * PAD),
            };
        }
        let a = rnd();
        let b = rnd();
        let tries = 0;
        while (hypot(a.x - b.x, a.y - b.y) < 120 && tries < 50) { b = rnd(); tries++; }
        setP1(a); setP2(b);
    }

    function autoScale() {
        if (Fmag > 0) {
            const targetPx = 140; // punta a ~140px per la freccia
            const newGain = targetPx / Fmag;
            setGain(clamp(newGain, 5, 5000));
        }
    }

    const circleCursor = drag ? "grabbing" : "grab";
    const hitR = 26; // raggio area sensibile al drag (trasparente)

    return (
        <div style={{ maxWidth: 1024, margin: "0 auto", padding: 16 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Legge di Coulomb — due cariche puntiformi</h1>
            <p style={{ color: "#475569", marginTop: 0 }}>
                <b>Trascina</b> i dischi colorati (mouse o touch) per spostare <b>q1</b> e <b>q2</b>. Cambia il loro valore e osserva i vettori forza.
                Direzione lungo la congiungente, verso da <i>seg(q1·q2)</i>, modulo |F| = k |q1 q2| / r².
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 12 }}>
                {/* CANVAS */}
                <div style={{ background: "#fff", borderRadius: 16, padding: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                    <svg
                        ref={svgRef}
                        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                        style={{ width: "100%", height: "auto" }}
                        onPointerMove={moveDrag}
                        onPointerUp={endDrag}
                        onPointerCancel={endDrag}
                        onPointerLeave={endDrag}
                    >
                        {/* Sfondo */}
                        <rect x={0} y={0} width={WIDTH} height={HEIGHT} rx={16} fill="#ffffff" />

                        {/* Griglia leggera */}
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((i) => (
                            <line key={`vg-${i}`} x1={(i * WIDTH) / 10} y1={PAD} x2={(i * WIDTH) / 10} y2={HEIGHT - PAD} stroke="#f1f5f9" />
                        ))}
                        {Array.from({ length: 8 }, (_, i) => i + 1).map((i) => (
                            <line key={`hg-${i}`} x1={PAD} y1={(i * HEIGHT) / 8} x2={WIDTH - PAD} y2={(i * HEIGHT) / 8} stroke="#f1f5f9" />
                        ))}

                        {/* Segmento di distanza */}
                        <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#94a3b8" strokeDasharray="6 6" />

                        {/* Vettori forza */}
                        {showForces && !coincidenti && (
                            <>
                                <Arrow x1={p1.x} y1={p1.y} x2={p1.x + F1x_px} y2={p1.y + F1y_px} color="#0ea5e9" label="F1" />
                                <Arrow x1={p2.x} y1={p2.y} x2={p2.x + F2x_px} y2={p2.y + F2y_px} color="#ef4444" label="F2" />
                            </>
                        )}

                        {/* Cariche + area sensibile al drag */}
                        <g style={{ cursor: circleCursor }}>
                            {/* q1 */}
                            <circle cx={p1.x} cy={p1.y} r={hitR} fill="transparent" onPointerDown={(e)=> startDrag("q1", e)} />
                            <circle cx={p1.x} cy={p1.y} r={18} fill={q1 >= 0 ? "#0ea5e9" : "#0284c7"} stroke="#0c4a6e" strokeWidth={2} pointerEvents="none" />
                            <text x={p1.x} y={p1.y + 4} fontSize={13} textAnchor="middle" fill="#ffffff" pointerEvents="none">q1</text>

                            {/* q2 */}
                            <circle cx={p2.x} cy={p2.y} r={hitR} fill="transparent" onPointerDown={(e)=> startDrag("q2", e)} />
                            <circle cx={p2.x} cy={p2.y} r={18} fill={q2 >= 0 ? "#ef4444" : "#dc2626"} stroke="#7f1d1d" strokeWidth={2} pointerEvents="none" />
                            <text x={p2.x} y={p2.y + 4} fontSize={13} textAnchor="middle" fill="#ffffff" pointerEvents="none">q2</text>
                        </g>

                        {/* Etichette distanza */}
                        <g>
                            <circle cx={(p1.x + p2.x) / 2} cy={(p1.y + p2.y) / 2} r={3} fill="#94a3b8" />
                            <text x={(p1.x + p2.x) / 2} y={(p1.y + p2.y) / 2 - 8} fontSize={11} textAnchor="middle" fill="#475569">
                                r = {r_m.toFixed(2)} m
                            </text>
                        </g>
                    </svg>
                </div>

                {/* PANNELLO CONTROLLI */}
                <div style={{ background: "#fff", borderRadius: 16, padding: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                    <div style={{ display: "grid", gap: 10 }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>Cariche</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "center" }}>
                            <label>Unità: </label>
                            <select value={unit} onChange={(e) => setUnit(e.target.value as ChargeUnit)}>
                                {CHARGE_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                            <div>
                                <label style={{ fontSize: 13 }}>q1 ({unit})</label>
                                <input type="number" step={0.1} value={q1} onChange={(e)=> setQ1(parseFloat(e.target.value))}
                                       style={{ width: "100%", padding: 8, border: "1px solid #cbd5e1", borderRadius: 8 }} />
                            </div>
                            <div>
                                <label style={{ fontSize: 13 }}>q2 ({unit})</label>
                                <input type="number" step={0.1} value={q2} onChange={(e)=> setQ2(parseFloat(e.target.value))}
                                       style={{ width: "100%", padding: 8, border: "1px solid #cbd5e1", borderRadius: 8 }} />
                            </div>
                        </div>

                        <div style={{ height: 1, background: "#e5e7eb", margin: "4px 0" }} />

                        <div style={{ fontWeight: 600, marginBottom: 4 }}>Scala</div>
                        <label style={{ fontSize: 13 }}>px per metro: <b>{pxPerMeter}</b></label>
                        <input type="range" min={20} max={200} step={1} value={pxPerMeter} onChange={(e)=> setPxPerMeter(parseFloat(e.target.value))} />

                        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "center" }}>
                            <label style={{ fontSize: 13 }}>gain vettori (px/N): <b>{Math.round(gain)}</b></label>
                            <button onClick={autoScale} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff" }}>Auto‑scala frecce</button>
                        </div>
                        <input type="range" min={5} max={5000} step={5} value={gain} onChange={(e)=> setGain(parseFloat(e.target.value))} />

                        <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                            <input type="checkbox" checked={showForces} onChange={(e)=> setShowForces(e.target.checked)} /> Mostra forze
                        </label>

                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                            <button
                                onClick={()=>{ setQ1(3); setQ2(-4); setUnit("µC"); setP1({x: WIDTH*0.33, y: HEIGHT*0.52}); setP2({x: WIDTH*0.67, y: HEIGHT*0.38}); setGain(500); setPxPerMeter(60); }}
                                style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff" }}
                            >Reimposta</button>
                            <button onClick={randomizePositions}
                                    style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff" }}>Randomizza posizioni</button>
                        </div>

                        <div style={{ height: 1, background: "#e5e7eb", margin: "4px 0" }} />

                        <div style={{ fontWeight: 600, marginBottom: 4 }}>Valori istantanei</div>
                        {coincidenti ? (
                            <div style={{ color: "#b91c1c", fontSize: 13 }}>Le cariche sono troppo vicine/sovrapposte: r ≈ 0 → forza non definita.</div>
                        ) : (
                            <div style={{ fontSize: 13, color: "#334155", display: "grid", gap: 4 }}>
                                <div>q1 = <b>{q1}</b> {unit} = <b>{q1C.toExponential(2)}</b> C</div>
                                <div>q2 = <b>{q2}</b> {unit} = <b>{q2C.toExponential(2)}</b> C</div>
                                <div>r = <b>{r_m.toFixed(3)}</b> m</div>
                                <div>|F| = k |q1 q2| / r² = <b>{Fmag.toExponential(3)}</b> N</div>
                                <div>Direzione: lungo la congiungente q1→q2</div>
                                <div>Verso: <b>{verso}</b></div>
                                <div>F1 (componenti): (<b>{F1x.toExponential(3)}</b>, <b>{F1y.toExponential(3)}</b>) N</div>
                                <div>Angolo F1 rispetto all'asse x: <b>{isFinite(angle1) ? angle1.toFixed(1) : "–"}°</b></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ marginTop: 10, color: "#64748b", fontSize: 12 }}>
                Suggerimenti: trascina i dischi colorati. Prova cariche entrambe positive (repulsione) o di segno opposto (attrazione). Riduci la distanza o aumenta i microcoulomb, poi usa <b>Auto‑scala</b> per avere frecce ben visibili.
            </div>
        </div>
    );
}
