/**
 * MediaVelocitaSecanteDemo - Versione refactorizzata
 * Velocità media come coefficiente angolare della secante
 */

import React, { useEffect, useMemo, useState } from "react";
import { DemoContainer } from "../../components/ui";

// ============ COSTANTI ============

const T_MAX = 10;
const N_SAMPLES = 500;
const WIDTH = 900, HEIGHT = 480;
const PAD = { L: 60, R: 28, T: 28, B: 60 };
const HEIGHT_V = 200;

// ============ UTILITY ============

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const linspace = (n: number, a = 0, b = 1) => Array.from({ length: n }, (_, i) => a + (i * (b - a)) / (n - 1));

function interp1(tArr: number[], yArr: number[], t: number): number {
    const n = tArr.length;
    if (t <= tArr[0]) return yArr[0];
    if (t >= tArr[n - 1]) return yArr[n - 1];
    let lo = 0, hi = n - 1;
    while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (tArr[mid] <= t) lo = mid; else hi = mid;
    }
    return lerp(yArr[lo], yArr[hi], (t - tArr[lo]) / (tArr[hi] - tArr[lo]));
}

// Generatore s(t) con sinusoidi
function makePosition(seed: number) {
    let s = seed >>> 0;
    const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32;

    const drift = (rnd() - 0.5) * 2;
    const A1 = 6 + 10 * rnd(), A2 = 4 + 8 * rnd(), A3 = 2 + 6 * rnd();
    const w1 = 1 + Math.floor(rnd() * 3), w2 = 2 + Math.floor(rnd() * 3), w3 = 3 + Math.floor(rnd() * 4);
    const phi1 = 2 * Math.PI * rnd(), phi2 = 2 * Math.PI * rnd(), phi3 = 2 * Math.PI * rnd();
    const offset = (rnd() - 0.5) * 8;

    return (t: number) => offset + drift * t
        + A1 * Math.sin((2 * Math.PI * w1 * t) / T_MAX + phi1)
        + A2 * Math.cos((2 * Math.PI * w2 * t) / T_MAX + phi2)
        + A3 * Math.sin((2 * Math.PI * w3 * t) / T_MAX + phi3);
}

function numericDerivative(tArr: number[], sArr: number[]): number[] {
    const n = tArr.length;
    const v = new Array(n).fill(0);
    for (let i = 1; i < n - 1; i++) v[i] = (sArr[i + 1] - sArr[i - 1]) / (tArr[i + 1] - tArr[i - 1]);
    v[0] = (sArr[1] - sArr[0]) / (tArr[1] - tArr[0]);
    v[n - 1] = (sArr[n - 1] - sArr[n - 2]) / (tArr[n - 1] - tArr[n - 2]);
    return v;
}

function findExtrema(tArr: number[], sArr: number[]) {
    const maxima: { t: number; s: number }[] = [];
    const minima: { t: number; s: number }[] = [];
    for (let i = 1; i < sArr.length - 1; i++) {
        const dy1 = sArr[i] - sArr[i - 1], dy2 = sArr[i + 1] - sArr[i];
        if (dy1 > 0 && dy2 < 0) maxima.push({ t: tArr[i], s: sArr[i] });
        else if (dy1 < 0 && dy2 > 0) minima.push({ t: tArr[i], s: sArr[i] });
    }
    // Limita etichette
    const step = Math.ceil((maxima.length + minima.length) / 10) || 1;
    return {
        maxima: maxima.filter((_, i) => i % step === 0),
        minima: minima.filter((_, i) => i % step === 0)
    };
}

// ============ COMPONENTE PRINCIPALE ============

export default function MediaVelocitaSecanteDemo() {
    // Dataset
    const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9));
    const tArr = useMemo(() => linspace(N_SAMPLES, 0, T_MAX), []);
    const sFunc = useMemo(() => makePosition(seed), [seed]);
    const sArr = useMemo(() => tArr.map(t => sFunc(t)), [sFunc, tArr]);
    const vArr = useMemo(() => numericDerivative(tArr, sArr), [tArr, sArr]);

    // Range verticale
    const sMin = useMemo(() => Math.min(...sArr) - 2, [sArr]);
    const sMax = useMemo(() => Math.max(...sArr) + 2, [sArr]);
    const vMin = useMemo(() => Math.min(...vArr) - 1, [vArr]);
    const vMax = useMemo(() => Math.max(...vArr) + 1, [vArr]);

    // Trasformazioni
    const toX = (t: number) => PAD.L + (t / T_MAX) * (WIDTH - PAD.L - PAD.R);
    const toY = (s: number) => HEIGHT - PAD.B - ((s - sMin) / (sMax - sMin)) * (HEIGHT - PAD.T - PAD.B);
    const toYv = (v: number) => HEIGHT_V - 40 - ((v - vMin) / (vMax - vMin)) * (HEIGHT_V - 60);
    const fromX = (px: number) => clamp(((px - PAD.L) / (WIDTH - PAD.L - PAD.R)) * T_MAX, 0, T_MAX);

    // Punti mobili
    const [t1, setT1] = useState(2);
    const [t2, setT2] = useState(7);
    const s1 = useMemo(() => interp1(tArr, sArr, t1), [tArr, sArr, t1]);
    const s2 = useMemo(() => interp1(tArr, sArr, t2), [tArr, sArr, t2]);
    const vT1 = useMemo(() => interp1(tArr, vArr, t1), [tArr, vArr, t1]);

    const canCompute = Math.abs(t2 - t1) > 0.01;
    const vMedia = canCompute ? (s2 - s1) / (t2 - t1) : 0;
    const deltaS = s2 - s1;
    const deltaT = t2 - t1;

    // Toggle
    const [showSecant, setShowSecant] = useState(true);
    const [showTangent, setShowTangent] = useState(false);
    const [showVGraph, setShowVGraph] = useState(true);

    // Drag
    const [drag, setDrag] = useState<null | "t1" | "t2">(null);

    const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const scaleX = WIDTH / rect.width;
        const mx = (e.clientX - rect.left) * scaleX;
        const mt = fromX(mx);
        setDrag(Math.abs(mt - t1) <= Math.abs(mt - t2) ? "t1" : "t2");
    };

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!drag) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const scaleX = WIDTH / rect.width;
        const mx = (e.clientX - rect.left) * scaleX;
        const mt = fromX(mx);
        if (drag === "t1") setT1(Math.min(mt, t2 - 0.1));
        else setT2(Math.max(mt, t1 + 0.1));
    };

    // Animazione
    const [animating, setAnimating] = useState(false);
    useEffect(() => {
        if (!animating) return;
        let raf: number;
        const step = () => {
            const dist = t2 - t1;
            if (dist <= 0.05) { setAnimating(false); return; }
            setT2(prev => prev - Math.max(0.02, dist * 0.08));
            raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [animating, t1, t2]);

    // Estremi
    const { maxima, minima } = useMemo(() => findExtrema(tArr, sArr), [tArr, sArr]);

    // Path SVG
    const pathS = useMemo(() => tArr.map((t, i) => `${i === 0 ? 'M' : 'L'} ${toX(t)} ${toY(sArr[i])}`).join(' '), [tArr, sArr, toX, toY]);
    const pathV = useMemo(() => tArr.map((t, i) => `${i === 0 ? 'M' : 'L'} ${toX(t)} ${toYv(vArr[i])}`).join(' '), [tArr, vArr, toX, toYv]);

    // Ticks
    const tTicks = Array.from({ length: T_MAX + 1 }, (_, i) => i);

    // Stili
    const cardStyle: React.CSSProperties = { background: "#fff", borderRadius: 16, padding: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" };

    return (
        <DemoContainer
            title="Velocità media e retta secante"
            description="La velocità media tra due istanti è il coefficiente angolare della retta secante sul grafico s(t). Trascina i marcatori o usa l'animazione per vedere come la secante tende alla tangente."
        >
            {/* Grafico principale */}
            <div style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>Diagramma spazio-tempo s(t)</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
                            <input type="checkbox" checked={showSecant} onChange={e => setShowSecant(e.target.checked)} /> Secante
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
                            <input type="checkbox" checked={showTangent} onChange={e => setShowTangent(e.target.checked)} /> Tangente
                        </label>
                        <button onClick={() => setAnimating(true)} disabled={animating} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #d1d5db", background: animating ? "#e5e7eb" : "#fff", cursor: animating ? "default" : "pointer", fontSize: 13 }}>
                            ▶ Anima t₂→t₁
                        </button>
                        <button onClick={() => setSeed(Math.floor(Math.random() * 1e9))} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontSize: 13 }}>
                            🎲 Nuovo
                        </button>
                    </div>
                </div>

                <svg
                    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                    style={{ width: "100%", height: "auto", maxHeight: "55vh", cursor: drag ? "grabbing" : "crosshair" }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={() => setDrag(null)}
                    onMouseLeave={() => setDrag(null)}
                >
                    <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="#fafafa" rx={12} />

                    {/* Griglia */}
                    {tTicks.map(t => <line key={t} x1={toX(t)} y1={PAD.T} x2={toX(t)} y2={HEIGHT - PAD.B} stroke="#e5e7eb" />)}

                    {/* Assi */}
                    <line x1={PAD.L} y1={HEIGHT - PAD.B} x2={WIDTH - PAD.R} y2={HEIGHT - PAD.B} stroke="#374151" strokeWidth={2} />
                    <line x1={PAD.L} y1={PAD.T} x2={PAD.L} y2={HEIGHT - PAD.B} stroke="#374151" strokeWidth={2} />
                    {tTicks.map(t => <text key={t} x={toX(t)} y={HEIGHT - PAD.B + 18} fontSize={11} textAnchor="middle" fill="#6b7280">{t}</text>)}
                    <text x={(PAD.L + WIDTH - PAD.R) / 2} y={HEIGHT - 10} fontSize={12} textAnchor="middle" fill="#374151">t (s)</text>
                    <text x={16} y={(PAD.T + HEIGHT - PAD.B) / 2} fontSize={12} textAnchor="middle" fill="#374151" transform={`rotate(-90 16 ${(PAD.T + HEIGHT - PAD.B) / 2})`}>s (m)</text>

                    {/* Curva s(t) */}
                    <path d={pathS} fill="none" stroke="#2563eb" strokeWidth={3} />

                    {/* Estremi */}
                    {maxima.map((p, i) => (
                        <g key={`max-${i}`}>
                            <circle cx={toX(p.t)} cy={toY(p.s)} r={5} fill="#ef4444" />
                            <text x={toX(p.t)} y={toY(p.s) - 10} fontSize={10} textAnchor="middle" fill="#991b1b">max</text>
                        </g>
                    ))}
                    {minima.map((p, i) => (
                        <g key={`min-${i}`}>
                            <circle cx={toX(p.t)} cy={toY(p.s)} r={5} fill="#3b82f6" />
                            <text x={toX(p.t)} y={toY(p.s) + 16} fontSize={10} textAnchor="middle" fill="#1e40af">min</text>
                        </g>
                    ))}

                    {/* Tangente in t1 */}
                    {showTangent && (
                        <line
                            x1={toX(0)} y1={toY(s1 + vT1 * (0 - t1))}
                            x2={toX(T_MAX)} y2={toY(s1 + vT1 * (T_MAX - t1))}
                            stroke="#9333ea" strokeWidth={2.5} strokeDasharray="8 4"
                        />
                    )}

                    {/* Secante */}
                    {canCompute && showSecant && (
                        <g>
                            <line x1={toX(t1)} y1={toY(s1)} x2={toX(t2)} y2={toY(s2)} stroke="#10b981" strokeWidth={3} />
                            {/* Δt e Δs */}
                            <line x1={toX(t1)} y1={HEIGHT - PAD.B + 5} x2={toX(t2)} y2={HEIGHT - PAD.B + 5} stroke="#10b981" strokeWidth={3} />
                            <text x={(toX(t1) + toX(t2)) / 2} y={HEIGHT - PAD.B + 22} fontSize={11} textAnchor="middle" fill="#047857">Δt = {deltaT.toFixed(2)} s</text>
                            <line x1={WIDTH - PAD.R + 5} y1={toY(s1)} x2={WIDTH - PAD.R + 5} y2={toY(s2)} stroke="#10b981" strokeWidth={3} />
                            <text x={WIDTH - PAD.R - 8} y={(toY(s1) + toY(s2)) / 2} fontSize={11} textAnchor="end" fill="#047857">Δs = {deltaS.toFixed(1)} m</text>
                        </g>
                    )}

                    {/* Handle t1 */}
                    <g>
                        <line x1={toX(t1)} y1={toY(s1)} x2={toX(t1)} y2={HEIGHT - PAD.B} stroke="#ef4444" strokeDasharray="4 3" />
                        <circle cx={toX(t1)} cy={toY(s1)} r={8} fill="#ef4444" stroke="#fff" strokeWidth={2} style={{ cursor: "grab" }} />
                        <rect x={toX(t1) - 30} y={toY(s1) - 26} width={60} height={18} fill="#fff" stroke="#ef4444" rx={4} />
                        <text x={toX(t1)} y={toY(s1) - 13} fontSize={11} textAnchor="middle" fill="#b91c1c">t₁={t1.toFixed(1)}s</text>
                    </g>

                    {/* Handle t2 */}
                    <g>
                        <line x1={toX(t2)} y1={toY(s2)} x2={toX(t2)} y2={HEIGHT - PAD.B} stroke="#f59e0b" strokeDasharray="4 3" />
                        <circle cx={toX(t2)} cy={toY(s2)} r={8} fill="#f59e0b" stroke="#fff" strokeWidth={2} style={{ cursor: "grab" }} />
                        <rect x={toX(t2) - 30} y={toY(s2) - 26} width={60} height={18} fill="#fff" stroke="#f59e0b" rx={4} />
                        <text x={toX(t2)} y={toY(s2) - 13} fontSize={11} textAnchor="middle" fill="#92400e">t₂={t2.toFixed(1)}s</text>
                    </g>
                </svg>
            </div>

            {/* Controlli e risultati */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 12 }}>
                {/* Slider */}
                <div style={cardStyle}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Controlli</div>
                    <div style={{ display: "grid", gap: 8 }}>
                        <label style={{ fontSize: 13 }}>
                            <span style={{ color: "#ef4444", fontWeight: 600 }}>t₁</span> = {t1.toFixed(2)} s
                            <input type="range" min={0} max={T_MAX - 0.1} step={0.05} value={t1} onChange={e => setT1(Math.min(+e.target.value, t2 - 0.1))} style={{ width: "100%", accentColor: "#ef4444" }} />
                        </label>
                        <label style={{ fontSize: 13 }}>
                            <span style={{ color: "#f59e0b", fontWeight: 600 }}>t₂</span> = {t2.toFixed(2)} s
                            <input type="range" min={0.1} max={T_MAX} step={0.05} value={t2} onChange={e => setT2(Math.max(+e.target.value, t1 + 0.1))} style={{ width: "100%", accentColor: "#f59e0b" }} />
                        </label>
                        <button onClick={() => { setT1(2); setT2(7); }} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontSize: 12 }}>
                            Reset posizioni
                        </button>
                    </div>
                </div>

                {/* Valori */}
                <div style={{ ...cardStyle, background: "#f0fdf4" }}>
                    <div style={{ fontWeight: 600, marginBottom: 8, color: "#166534" }}>📊 Valori</div>
                    <div style={{ fontSize: 13, display: "grid", gap: 6 }}>
                        <div>s(t₁) = <strong>{s1.toFixed(2)}</strong> m</div>
                        <div>s(t₂) = <strong>{s2.toFixed(2)}</strong> m</div>
                        <div style={{ borderTop: "1px solid #bbf7d0", paddingTop: 6, marginTop: 4 }}>
                            <strong>Δs</strong> = s₂ - s₁ = <strong>{deltaS.toFixed(2)}</strong> m
                        </div>
                        <div><strong>Δt</strong> = t₂ - t₁ = <strong>{deltaT.toFixed(2)}</strong> s</div>
                    </div>
                </div>

                {/* Risultato */}
                <div style={{ ...cardStyle, background: "linear-gradient(135deg, #dbeafe 0%, #ede9fe 100%)" }}>
                    <div style={{ fontWeight: 600, marginBottom: 8, color: "#4338ca" }}>🎯 Velocità media</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: "#10b981" }}>
                        v̄ = {vMedia.toFixed(3)} m/s
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
                        v̄ = Δs / Δt = {deltaS.toFixed(2)} / {deltaT.toFixed(2)}
                    </div>
                    {showTangent && (
                        <div style={{ fontSize: 12, color: "#7c3aed", marginTop: 8 }}>
                            v(t₁) ≈ {vT1.toFixed(3)} m/s (tangente)
                        </div>
                    )}
                </div>
            </div>

            {/* Grafico v(t) */}
            <div style={{ ...cardStyle, marginTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ fontWeight: 600 }}>Velocità istantanea v(t)</div>
                    <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
                        <input type="checkbox" checked={showVGraph} onChange={e => setShowVGraph(e.target.checked)} /> Mostra grafico
                    </label>
                </div>

                {showVGraph && (
                    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT_V}`} style={{ width: "100%", height: "auto" }}>
                        <rect x={0} y={0} width={WIDTH} height={HEIGHT_V} fill="#fafafa" rx={8} />

                        {/* Griglia */}
                        {tTicks.map(t => <line key={t} x1={toX(t)} y1={20} x2={toX(t)} y2={HEIGHT_V - 40} stroke="#e5e7eb" />)}

                        {/* Assi */}
                        <line x1={PAD.L} y1={HEIGHT_V - 40} x2={WIDTH - PAD.R} y2={HEIGHT_V - 40} stroke="#374151" strokeWidth={1.5} />
                        <line x1={PAD.L} y1={20} x2={PAD.L} y2={HEIGHT_V - 40} stroke="#374151" strokeWidth={1.5} />
                        {tTicks.map(t => <text key={t} x={toX(t)} y={HEIGHT_V - 22} fontSize={10} textAnchor="middle" fill="#6b7280">{t}</text>)}
                        <text x={(PAD.L + WIDTH - PAD.R) / 2} y={HEIGHT_V - 6} fontSize={11} textAnchor="middle" fill="#374151">t (s)</text>
                        <text x={14} y={HEIGHT_V / 2 - 10} fontSize={11} textAnchor="middle" fill="#374151" transform={`rotate(-90 14 ${HEIGHT_V / 2 - 10})`}>v (m/s)</text>

                        {/* Curva v(t) */}
                        <path d={pathV} fill="none" stroke="#7c3aed" strokeWidth={2.5} />

                        {/* Linee t1 e t2 */}
                        <line x1={toX(t1)} y1={20} x2={toX(t1)} y2={HEIGHT_V - 40} stroke="#ef4444" strokeDasharray="4 3" strokeWidth={1.5} />
                        <line x1={toX(t2)} y1={20} x2={toX(t2)} y2={HEIGHT_V - 40} stroke="#f59e0b" strokeDasharray="4 3" strokeWidth={1.5} />

                        {/* v̄ media */}
                        {canCompute && (
                            <g>
                                <line x1={toX(t1)} y1={toYv(vMedia)} x2={toX(t2)} y2={toYv(vMedia)} stroke="#10b981" strokeWidth={3} />
                                <text x={(toX(t1) + toX(t2)) / 2} y={toYv(vMedia) - 6} fontSize={11} textAnchor="middle" fill="#047857" fontWeight={600}>v̄</text>
                            </g>
                        )}

                        {/* v(t1) */}
                        <circle cx={toX(t1)} cy={toYv(vT1)} r={5} fill="#9333ea" />
                        <text x={toX(t1) + 8} y={toYv(vT1) - 6} fontSize={10} fill="#7c3aed">v(t₁)</text>
                    </svg>
                )}
            </div>

            {/* Spiegazione */}
            <div style={{ marginTop: 12, background: "#eff6ff", borderRadius: 12, padding: 16, fontSize: 13, color: "#1e40af" }}>
                <strong>💡 Concetto chiave:</strong> La <strong>secante</strong> (verde) collega due punti sulla curva s(t).
                La sua pendenza è la <strong>velocità media</strong>. Quando t₂ si avvicina a t₁, la secante tende alla <strong>tangente</strong> (viola),
                la cui pendenza è la <strong>velocità istantanea</strong> v(t₁). Questo è il concetto di derivata!
            </div>
        </DemoContainer>
    );
}