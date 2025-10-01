import React, { useEffect, useMemo, useState } from "react";

/**
 * Demo interattiva: velocità media come coefficiente angolare della secante
 *
 * Include:
 *  - Marcatori di massimi/minimi locali con etichette
 *  - Pulsante "Anima t₂ → t₁" (secante → tangente)
 *  - Grafico della derivata numerica v(t) sotto, con linea orizzontale a v̄
 *  - ✨ Nuovo: retta **tangente** in t₁ e **toggle** per mostrare/nascondere **secante** e **tangente**
 *
 * s(t) è generata come combinazione di sinusoidi + deriva per garantire estremi locali.
 * Rendering via SVG.
 * Salva come: src/demos/fisica/MediaVelocitaSecanteDemo.tsx
 */

// ---------- Costanti di scena ----------
const T_MAX = 10; // secondi
const N_SAMPLES = 500; // risoluzione della curva

// ---------- Utility ----------
function linspace(n: number, a = 0, b = 1) {
    const arr = new Array(n);
    for (let i = 0; i < n; i++) arr[i] = a + (i * (b - a)) / (n - 1);
    return arr;
}
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function interp1(tArr: number[], yArr: number[], t: number) {
    // Interpolazione lineare y(t) dato array monotono tArr
    const n = tArr.length;
    if (t <= tArr[0]) return yArr[0];
    if (t >= tArr[n - 1]) return yArr[n - 1];
    // ricerca binaria
    let lo = 0, hi = n - 1;
    while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (tArr[mid] <= t) lo = mid; else hi = mid;
    }
    const u = (t - tArr[lo]) / (tArr[hi] - tArr[lo]);
    return lerp(yArr[lo], yArr[hi], u);
}

// ---------- Generatore s(t) non monotono con massimi/minimi ----------
function makePosition(seed: number) {
    // PRNG deterministico semplice
    let s = seed >>> 0;
    const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32;

    // Parametri casuali
    const drift = (rnd() - 0.5) * 2 * 1.0; // deriva lineare [-1,1] m/s
    const A1 = 6 + 10 * rnd(); // ampiezze per varianza verticale
    const A2 = 4 + 8 * rnd();
    const A3 = 2 + 6 * rnd();
    const w1 = 1 + Math.floor(rnd() * 3); // 1..3 onde su [0,T_MAX]
    const w2 = 2 + Math.floor(rnd() * 3); // 2..4
    const w3 = 3 + Math.floor(rnd() * 4); // 3..6
    const phi1 = 2 * Math.PI * rnd();
    const phi2 = 2 * Math.PI * rnd();
    const phi3 = 2 * Math.PI * rnd();
    const offset = (rnd() - 0.5) * 8; // spostamento verticale iniziale

    return (t: number) =>
        offset + drift * t
        + A1 * Math.sin((2 * Math.PI * w1 * t) / T_MAX + phi1)
        + A2 * Math.cos((2 * Math.PI * w2 * t) / T_MAX + phi2)
        + A3 * Math.sin((2 * Math.PI * w3 * t) / T_MAX + phi3);
}

// Conta cambi di segno nella derivata discreta (per test)
function countSlopeSignChanges(yArr: number[]) {
    let changes = 0;
    let prevSign = 0;
    for (let i = 1; i < yArr.length; i++) {
        const dy = yArr[i] - yArr[i - 1];
        const sign = dy > 0 ? 1 : dy < 0 ? -1 : 0;
        if (sign !== 0 && prevSign !== 0 && sign !== prevSign) changes++;
        if (sign !== 0) prevSign = sign;
    }
    return changes;
}

// Derivata numerica centrale (v(t) ≈ ds/dt)
function numericDerivative(tArr: number[], sArr: number[]) {
    const n = tArr.length;
    const v = new Array(n).fill(0);
    for (let i = 1; i < n - 1; i++) v[i] = (sArr[i + 1] - sArr[i - 1]) / (tArr[i + 1] - tArr[i - 1]);
    v[0] = (sArr[1] - sArr[0]) / (tArr[1] - tArr[0]);
    v[n - 1] = (sArr[n - 1] - sArr[n - 2]) / (tArr[n - 1] - tArr[n - 2]);
    return v;
}

// Stima vertice parabolico locale tra (i-1,i,i+1)
function refineExtremum(tArr: number[], sArr: number[], i: number) {
    const x0 = tArr[i - 1], y0 = sArr[i - 1];
    const x1 = tArr[i], y1 = sArr[i];
    const x2 = tArr[i + 1], y2 = sArr[i + 1];
    const denom = y2 - 2 * y1 + y0;
    if (Math.abs(denom) < 1e-12) return { t: x1, s: y1 };
    const tPeak = x1 - 0.5 * (x2 - x0) * ((y2 - y0) / denom);
    const tClamped = clamp(tPeak, x0, x2);
    const sPeak = interp1(tArr, sArr, tClamped);
    return { t: tClamped, s: sPeak };
}

function findLocalExtrema(tArr: number[], sArr: number[]) {
    const maxima: { t: number; s: number }[] = [];
    const minima: { t: number; s: number }[] = [];
    for (let i = 1; i < sArr.length - 1; i++) {
        const dy1 = sArr[i] - sArr[i - 1];
        const dy2 = sArr[i + 1] - sArr[i];
        if (dy1 > 0 && dy2 < 0) {
            const p = refineExtremum(tArr, sArr, i);
            maxima.push(p);
        } else if (dy1 < 0 && dy2 > 0) {
            const p = refineExtremum(tArr, sArr, i);
            minima.push(p);
        }
    }
    // Limita il numero di etichette per non affollare (max 12 totali)
    const pickStep = Math.ceil((maxima.length + minima.length) / 12) || 1;
    return {
        maxima: maxima.filter((_, idx) => idx % pickStep === 0),
        minima: minima.filter((_, idx) => idx % pickStep === 0),
    };
}

// ---------- Componente principale ----------
export default function MediaVelocitaSecanteDemo() {
    // dimensioni SVG
    const WIDTH = 900, HEIGHT = 520, PAD_L = 64, PAD_R = 28, PAD_T = 28, PAD_B = 70;
    const HEIGHT_V = 220; // altezza sotto-grafico velocità

    // dataset casuale (rigenerabile)
    const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 1e9));
    const tArr = useMemo(() => linspace(N_SAMPLES, 0, T_MAX), []);
    const sFunc = useMemo(() => makePosition(seed), [seed]);
    const sArr = useMemo(() => tArr.map((t) => sFunc(t)), [sFunc, tArr]);
    const vArr = useMemo(() => numericDerivative(tArr, sArr), [tArr, sArr]);

    // range verticale dinamico con padding
    const sMinRaw = useMemo(() => Math.min(...sArr), [sArr]);
    const sMaxRaw = useMemo(() => Math.max(...sArr), [sArr]);
    const padV = 0.08 * Math.max(1, sMaxRaw - sMinRaw);
    const sMin = sMinRaw - padV;
    const sMax = sMaxRaw + padV;
    const spanS = Math.max(1e-6, sMax - sMin);

    // range verticale per v(t)
    const vMinRaw = useMemo(() => Math.min(...vArr), [vArr]);
    const vMaxRaw = useMemo(() => Math.max(...vArr), [vArr]);
    const padVv = 0.08 * Math.max(1, vMaxRaw - vMinRaw);
    const vMin = vMinRaw - padVv;
    const vMax = vMaxRaw + padVv;
    const spanV = Math.max(1e-6, vMax - vMin);

    // trasformazioni asse
    const toX = (t: number) => PAD_L + (t / T_MAX) * (WIDTH - PAD_L - PAD_R);
    const toY = (s: number) => HEIGHT - PAD_B - ((s - sMin) / spanS) * (HEIGHT - PAD_T - PAD_B);
    const toYv = (v: number) => HEIGHT_V - 40 - ((v - vMin) / spanV) * (HEIGHT_V - 70);
    const fromX = (px: number) => clamp(((px - PAD_L) / (WIDTH - PAD_L - PAD_R)) * T_MAX, 0, T_MAX);

    // punti mobili t1, t2
    const [t1, setT1] = useState(2);
    const [t2, setT2] = useState(7);
    const s1 = useMemo(() => interp1(tArr, sArr, t1), [tArr, sArr, t1]);
    const s2 = useMemo(() => interp1(tArr, sArr, t2), [tArr, sArr, t2]);
    const canCompute = Math.abs(t2 - t1) > 1e-6;
    const vMedia = canCompute ? (s2 - s1) / (t2 - t1) : NaN;

    // ✨ Nuovi toggle visibilità
    const [showSecant, setShowSecant] = useState(true);
    const [showTangent, setShowTangent] = useState(false);

    // drag gestione
    const [drag, setDrag] = useState<null | "t1" | "t2">(null);
    function onMouseDown(e: React.MouseEvent<SVGSVGElement>) {
        const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const mt = fromX(mx);
        const d1 = Math.abs(mt - t1);
        const d2 = Math.abs(mt - t2);
        setDrag(d1 <= d2 ? "t1" : "t2");
    }
    function onMouseMove(e: React.MouseEvent<SVGSVGElement>) {
        if (!drag) return;
        const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const mt = fromX(mx);
        if (drag === "t1") setT1(mt > t2 ? t2 : mt);
        else setT2(mt < t1 ? t1 : mt);
    }
    function onMouseUp() { setDrag(null); }
    function onMouseLeave() { setDrag(null); }

    // rigenera dataset
    function randomize() { setSeed(Math.floor(Math.random() * 1e9)); }

    // Estremi locali (per markers)
    const { maxima, minima } = useMemo(() => findLocalExtrema(tArr, sArr), [tArr, sArr]);

    // Animazione t2 -> t1 (secante -> tangente)
    const [animating, setAnimating] = useState(false);
    useEffect(() => {
        if (!animating) return;
        let raf: number;
        const step = () => {
            const dist = t2 - t1;
            if (dist <= 0.02) { setAnimating(false); return; }
            const next = t2 - Math.max(0.01, dist * 0.07);
            setT2(next < t1 ? t1 : next);
            raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [animating, t1, t2]);

    // griglia e ticks
    const tTicks = useMemo(() => Array.from({ length: T_MAX + 1 }, (_, i) => i), []);
    const sTicks = useMemo(() => {
        const k = 6;
        const step = spanS / k;
        const arr: number[] = [];
        for (let i = 0; i <= k; i++) arr.push(sMin + i * step);
        return arr;
    }, [spanS, sMin]);
    const vTicks = useMemo(() => {
        const k = 5;
        const step = spanV / k;
        const arr: number[] = [];
        for (let i = 0; i <= k; i++) arr.push(vMin + i * step);
        return arr;
    }, [spanV, vMin]);

    // path della curva s(t)
    const pathS = useMemo(() => {
        let d = "";
        for (let i = 0; i < tArr.length; i++) {
            const px = toX(tArr[i]);
            const py = toY(sArr[i]);
            d += (i === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`);
        }
        return d;
    }, [tArr, sArr]);

    // path di v(t)
    const pathV = useMemo(() => {
        let d = "";
        for (let i = 0; i < tArr.length; i++) {
            const px = toX(tArr[i]);
            const py = toYv(vArr[i]);
            d += (i === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`);
        }
        return d;
    }, [tArr, vArr]);

    // valore di v(t1) per la tangente
    const vT1 = useMemo(() => interp1(tArr, vArr, t1), [tArr, vArr, t1]);

    // === Self-tests (solo in dev) ===
    useEffect(() => {
        if (process.env.NODE_ENV === "production") return;
        // 1) Deve esserci variabilità e almeno un cambio di segno della derivata discreta (indicatore di estremo locale)
        const changes = countSlopeSignChanges(sArr);
        if (changes < 1) {
            // eslint-disable-next-line no-console
            console.warn("[TEST] Poche/nessuna inversione di pendenza: considerare un seed diverso", { changes, seed });
        }
        // 2) Caso sintetico a velocità costante: s(t)=5t → v̄=5 su ogni coppia
        const tTest = linspace(50, 0, 10);
        const sLin = tTest.map((t) => 5 * t);
        const tA = 1.2, tB = 5.7;
        const sA = interp1(tTest, sLin, tA);
        const sB = interp1(tTest, sLin, tB);
        const vAvg = (sB - sA) / (tB - tA);
        if (Math.abs(vAvg - 5) > 1e-6) {
            // eslint-disable-next-line no-console
            console.warn("[TEST] Velocità costante fallito", vAvg);
        }
    }, [sArr, seed]);

    return (
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
                Velocità media = coefficiente angolare della secante
            </h1>
            <p style={{ color: "#475569", marginTop: 0 }}>
                Trascina i due marcatori temporali <b>t₁</b> e <b>t₂</b> sul grafico (o usa gli slider).
                La retta <i>secante</i> tra i punti \((t₁, s(t₁))\) e \((t₂, s(t₂))\) ha coefficiente angolare pari alla
                <b> velocità media</b> <code style={{ marginLeft: 6 }}>v̄ = (s(t₂) − s(t₁)) / (t₂ − t₁)</code>.
                Il grafico è volutamente non monotono: compaiono <b>massimi/minimi locali</b>. È inclusa la <b>tangente</b> in t₁.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12 }}>
                {/* PANNELLO GRAFICO */}
                <div style={{ background: "#fff", borderRadius: 16, padding: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ fontWeight: 600 }}>Diagramma spazio–tempo s(t)</div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <input type="checkbox" checked={showSecant} onChange={(e) => setShowSecant(e.target.checked)} /> Mostra secante
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <input type="checkbox" checked={showTangent} onChange={(e) => setShowTangent(e.target.checked)} /> Mostra tangente
                            </label>
                            <button onClick={() => setAnimating(true)} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff" }}>
                                Anima t₂ → t₁
                            </button>
                            <button onClick={randomize} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff" }}>
                                Nuovo grafico casuale
                            </button>
                        </div>
                    </div>

                    <svg
                        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                        style={{ width: "100%", height: "auto", cursor: drag ? "grabbing" : "crosshair" }}
                        onMouseDown={onMouseDown}
                        onMouseMove={onMouseMove}
                        onMouseUp={onMouseUp}
                        onMouseLeave={onMouseLeave}
                    >
                        {/* area sfondo */}
                        <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="#ffffff" rx={16} />

                        {/* griglia verticale (tempo) */}
                        {tTicks.map((t) => (
                            <line key={t} x1={toX(t)} y1={PAD_T} x2={toX(t)} y2={HEIGHT - PAD_B} stroke="#e5e7eb" />
                        ))}
                        {/* griglia orizzontale (spazio) */}
                        {sTicks.map((s, i) => (
                            <line key={i} x1={PAD_L} y1={toY(s)} x2={WIDTH - PAD_R} y2={toY(s)} stroke="#e5e7eb" />
                        ))}

                        {/* assi */}
                        <line x1={PAD_L} y1={HEIGHT - PAD_B} x2={WIDTH - PAD_R} y2={HEIGHT - PAD_B} stroke="#111827" strokeWidth={2} />
                        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={HEIGHT - PAD_B} stroke="#111827" strokeWidth={2} />

                        {/* etichette assi */}
                        {tTicks.map((t) => (
                            <text key={t} x={toX(t)} y={HEIGHT - PAD_B + 18} fontSize={11} textAnchor="middle" fill="#374151">{t}</text>
                        ))}
                        {sTicks.map((s, i) => (
                            <text key={i} x={PAD_L - 8} y={toY(s) + 4} fontSize={11} textAnchor="end" fill="#374151">{s.toFixed(0)}</text>
                        ))}
                        <text x={(PAD_L + WIDTH - PAD_R) / 2} y={HEIGHT - 10} fontSize={12} textAnchor="middle" fill="#111827">tempo t (s)</text>
                        <text x={18} y={(PAD_T + HEIGHT - PAD_B) / 2} fontSize={12} textAnchor="middle" fill="#111827" transform={`rotate(-90 18 ${(PAD_T + HEIGHT - PAD_B) / 2})`}>
                            spazio s (m)
                        </text>

                        {/* curva s(t) */}
                        <path d={pathS} fill="none" stroke="#2563eb" strokeWidth={3} />

                        {/* marcatori di estremi */}
                        {maxima.map((p, idx) => (
                            <g key={`max-${idx}`}>
                                <polygon points={`${toX(p.t)},${toY(p.s) - 8} ${toX(p.t) - 7},${toY(p.s) + 6} ${toX(p.t) + 7},${toY(p.s) + 6}`} fill="#ef4444" />
                                <text x={toX(p.t)} y={toY(p.s) - 12} fontSize={11} textAnchor="middle" fill="#991b1b">max</text>
                            </g>
                        ))}
                        {minima.map((p, idx) => (
                            <g key={`min-${idx}`}>
                                <polygon points={`${toX(p.t)},${toY(p.s) + 8} ${toX(p.t) - 7},${toY(p.s) - 6} ${toX(p.t) + 7},${toY(p.s) - 6}`} fill="#3b82f6" />
                                <text x={toX(p.t)} y={toY(p.s) + 16} fontSize={11} textAnchor="middle" fill="#1e3a8a">min</text>
                            </g>
                        ))}

                        {/* ✨ Tangente in t1 */}
                        {showTangent && (
                            (() => {
                                const y0 = s1 + vT1 * (0 - t1);
                                const yT = s1 + vT1 * (T_MAX - t1);
                                return (
                                    <g>
                                        <line x1={toX(0)} y1={toY(y0)} x2={toX(T_MAX)} y2={toY(yT)} stroke="#9333ea" strokeWidth={3} strokeDasharray="6 6" />
                                        <text x={toX(Math.min(T_MAX, t1 + 1))} y={toY(s1 + vT1 * Math.min(1, T_MAX - t1)) - 8} fontSize={11} textAnchor="start" fill="#6d28d9">
                                            tangente in t₁ (pendenza ≈ v(t₁))
                                        </text>
                                    </g>
                                );
                            })()
                        )}

                        {/* Secante (se definita) */}
                        {canCompute && showSecant && (
                            <g>
                                <line x1={toX(t1)} y1={toY(s1)} x2={toX(t2)} y2={toY(s2)} stroke="#059669" strokeWidth={3} />

                                {/* Delta t linea alla base */}
                                <line x1={toX(t1)} y1={HEIGHT - PAD_B} x2={toX(t2)} y2={HEIGHT - PAD_B} stroke="#10b981" strokeWidth={4} />
                                <text x={(toX(t1) + toX(t2)) / 2} y={HEIGHT - PAD_B + 22} fontSize={12} textAnchor="middle" fill="#065f46">Δt = {(t2 - t1).toFixed(2)} s</text>

                                {/* Delta s linea a destra */}
                                <line x1={WIDTH - PAD_R} y1={toY(s1)} x2={WIDTH - PAD_R} y2={toY(s2)} stroke="#10b981" strokeWidth={4} />
                                <text x={WIDTH - PAD_R - 6} y={(toY(s1) + toY(s2)) / 2} fontSize={12} textAnchor="end" fill="#065f46">Δs = {(s2 - s1).toFixed(2)} m</text>
                            </g>
                        )}

                        {/* handles */}
                        <g>
                            <line x1={toX(t1)} y1={toY(s1)} x2={toX(t1)} y2={toY(sMin)} stroke="#ef4444" strokeDasharray="4 4" />
                            <circle cx={toX(t1)} cy={toY(s1)} r={6.5} fill="#ef4444" />
                            <circle cx={toX(t1)} cy={toY(s1)} r={10} fill="none" stroke="#ef4444" strokeOpacity={0.5} />
                            <rect x={toX(t1) - 34} y={toY(s1) - 28} width={68} height={18} fill="white" stroke="#ef4444" rx={4} />
                            <text x={toX(t1)} y={toY(s1) - 15} fontSize={11} textAnchor="middle" fill="#111827">t={t1.toFixed(2)} s</text>

                            <line x1={toX(t2)} y1={toY(s2)} x2={toX(t2)} y2={toY(sMin)} stroke="#f59e0b" strokeDasharray="4 4" />
                            <circle cx={toX(t2)} cy={toY(s2)} r={6.5} fill="#f59e0b" />
                            <circle cx={toX(t2)} cy={toY(s2)} r={10} fill="none" stroke="#f59e0b" strokeOpacity={0.5} />
                            <rect x={toX(t2) - 34} y={toY(s2) - 28} width={68} height={18} fill="white" stroke="#f59e0b" rx={4} />
                            <text x={toX(t2)} y={toY(s2) - 15} fontSize={11} textAnchor="middle" fill="#111827">t={t2.toFixed(2)} s</text>
                        </g>
                    </svg>
                </div>

                {/* PANNELLO CONTROLLI/VALORI */}
                <div style={{ background: "#fff", borderRadius: 16, padding: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Controlli</div>
                    <div style={{ display: "grid", gap: 8 }}>
                        <label>
                            t1: <input type="range" min={0} max={T_MAX} step={0.01} value={t1} onChange={(e) => setT1(Math.min(parseFloat(e.target.value), t2))} />
                            <span style={{ marginLeft: 8 }}>{t1.toFixed(2)} s</span>
                        </label>
                        <label>
                            t2: <input type="range" min={0} max={T_MAX} step={0.01} value={t2} onChange={(e) => setT2(Math.max(parseFloat(e.target.value), t1))} />
                            <span style={{ marginLeft: 8 }}>{t2.toFixed(2)} s</span>
                        </label>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                            <button onClick={() => { setT1(2); setT2(7); setAnimating(false); }} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff" }}>
                                Reimposta t1/t2
                            </button>
                            <button onClick={() => setAnimating(true)} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff" }}>
                                Anima t₂ → t₁
                            </button>
                            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <input type="checkbox" checked={showSecant} onChange={(e) => setShowSecant(e.target.checked)} /> Mostra secante
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <input type="checkbox" checked={showTangent} onChange={(e) => setShowTangent(e.target.checked)} /> Mostra tangente
                            </label>
                        </div>
                    </div>

                    <hr style={{ margin: "12px 0", border: 0, borderTop: "1px solid #e5e7eb" }} />

                    <div style={{ fontSize: 14 }}>
                        <div> s(t₁) = <b>{s1.toFixed(2)}</b> m, &nbsp; s(t₂) = <b>{s2.toFixed(2)}</b> m</div>
                        {canCompute ? (
                            <>
                                <div style={{ marginTop: 6 }}>
                                    <b>Velocità media</b>: v̄ = (Δs / Δt) = <b>{vMedia.toFixed(3)}</b> m/s
                                </div>
                                <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>
                                    Secante verde ↔ pendenza = v̄. Tangente viola in t₁ ↔ pendenza ≈ v(t₁).
                                </div>
                            </>
                        ) : (
                            <div style={{ color: "#b91c1c", marginTop: 6 }}>Scegli due istanti distinti (t₂ ≠ t₁).</div>
                        )}
                    </div>

                    <hr style={{ margin: "12px 0", border: 0, borderTop: "1px solid #e5e7eb" }} />

                    <div style={{ fontSize: 13, color: "#475569" }}>
                        Suggerimento didattico: sposta t₂ verso t₁ e osserva come la secante tende alla tangente. In quel limite ottieni la
                        <i> velocità istantanea</i>.
                    </div>
                </div>
            </div>

            {/* SOTTO-GRAFICO: v(t) numerica */}
            <div style={{ background: "#fff", borderRadius: 16, padding: 12, marginTop: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Derivata numerica v(t)</div>
                <svg viewBox={`0 0 ${WIDTH} ${HEIGHT_V}`} style={{ width: "100%", height: "auto" }}>
                    {/* griglia */}
                    {Array.from({ length: T_MAX + 1 }, (_, i) => i).map((t) => (
                        <line key={t} x1={toX(t)} y1={20} x2={toX(t)} y2={HEIGHT_V - 40} stroke="#e5e7eb" />
                    ))}
                    {vTicks.map((v, i) => (
                        <line key={i} x1={PAD_L} y1={toYv(v)} x2={WIDTH - PAD_R} y2={toYv(v)} stroke="#e5e7eb" />
                    ))}

                    {/* assi */}
                    <line x1={PAD_L} y1={HEIGHT_V - 40} x2={WIDTH - PAD_R} y2={HEIGHT_V - 40} stroke="#111827" strokeWidth={2} />
                    <line x1={PAD_L} y1={20} x2={PAD_L} y2={HEIGHT_V - 40} stroke="#111827" strokeWidth={2} />

                    {/* etichette */}
                    {Array.from({ length: T_MAX + 1 }, (_, i) => i).map((t) => (
                        <text key={t} x={toX(t)} y={HEIGHT_V - 20} fontSize={11} textAnchor="middle" fill="#374151">{t}</text>
                    ))}
                    {vTicks.map((v, i) => (
                        <text key={i} x={PAD_L - 8} y={toYv(v) + 4} fontSize={11} textAnchor="end" fill="#374151">{v.toFixed(1)}</text>
                    ))}
                    <text x={(PAD_L + WIDTH - PAD_R) / 2} y={HEIGHT_V - 6} fontSize={12} textAnchor="middle" fill="#111827">tempo t (s)</text>
                    <text x={18} y={(20 + HEIGHT_V - 40) / 2} fontSize={12} textAnchor="middle" fill="#111827" transform={`rotate(-90 18 ${(20 + HEIGHT_V - 40) / 2})`}>
                        v(t) (m/s)
                    </text>

                    {/* curva v(t) */}
                    <path d={pathV} fill="none" stroke="#7c3aed" strokeWidth={2.5} />

                    {/* evidenzia t1,t2 e v̄ */}
                    <line x1={toX(t1)} y1={20} x2={toX(t1)} y2={HEIGHT_V - 40} stroke="#9ca3af" strokeDasharray="4 4" />
                    <line x1={toX(t2)} y1={20} x2={toX(t2)} y2={HEIGHT_V - 40} stroke="#9ca3af" strokeDasharray="4 4" />
                    {canCompute && (
                        <g>
                            <line x1={toX(t1)} y1={toYv(vMedia)} x2={toX(t2)} y2={toYv(vMedia)} stroke="#10b981" strokeWidth={4} />
                            <text x={(toX(t1) + toX(t2)) / 2} y={toYv(vMedia) - 6} fontSize={11} textAnchor="middle" fill="#065f46">v̄</text>
                        </g>
                    )}
                    {/* marcatore di v(t1) per collegarlo alla tangente */}
                    <g>
                        <circle cx={toX(t1)} cy={toYv(vT1)} r={4} fill="#9333ea" />
                        <text x={toX(t1) + 6} y={toYv(vT1) - 6} fontSize={11} fill="#6d28d9">v(t₁)</text>
                    </g>
                </svg>
            </div>
        </div>
    );
}
