import React, { useMemo, useState, useEffect, useRef } from "react";

type FunctionDef = {
    id: string;
    name: string;
    expr: string;
    f: (x: number) => number;
    limitPlus: string; // "+∞" o "-∞"
    limitMinus: string;
    note?: string;
};

const FUNCTIONS: FunctionDef[] = [
    {
        id: "x",
        name: "f(x) = x",
        expr: "x",
        f: (x) => x,
        limitPlus: "+∞",
        limitMinus: "-∞",
        note: "Funzione lineare: cresce/decresce linearmente",
    },
    {
        id: "x2",
        name: "f(x) = x²",
        expr: "x²",
        f: (x) => x * x,
        limitPlus: "+∞",
        limitMinus: "+∞",
        note: "Parabola: tende a +∞ da entrambi i lati",
    },
    {
        id: "x3",
        name: "f(x) = x³",
        expr: "x³",
        f: (x) => x * x * x,
        limitPlus: "+∞",
        limitMinus: "-∞",
        note: "Cubica: comportamento opposto agli estremi",
    },
    {
        id: "negx2",
        name: "f(x) = -x²",
        expr: "-x²",
        f: (x) => -(x * x),
        limitPlus: "-∞",
        limitMinus: "-∞",
        note: "Parabola rivolta verso il basso",
    },
    {
        id: "exp",
        name: "f(x) = eˣ",
        expr: "eˣ",
        f: (x) => Math.exp(x),
        limitPlus: "+∞",
        limitMinus: "0",
        note: "Esponenziale: diverge a +∞, tende a 0 per x → -∞",
    },
    {
        id: "negexp",
        name: "f(x) = -eˣ",
        expr: "-eˣ",
        f: (x) => -Math.exp(x),
        limitPlus: "-∞",
        limitMinus: "0",
        note: "Esponenziale negativo",
    },
    {
        id: "poly",
        name: "f(x) = x⁴ - 5x²",
        expr: "x⁴ - 5x²",
        f: (x) => x ** 4 - 5 * x * x,
        limitPlus: "+∞",
        limitMinus: "+∞",
        note: "Polinomio di grado pari: stesso comportamento",
    },
];

const W = 800, H = 500, PL = 60, PR = 30, PT = 30, PB = 60;

function clamp(v: number, a: number, b: number) {
    return Math.max(a, Math.min(b, v));
}

export default function LimiteInfinitoPiuMenoInfinito() {
    const [sel, setSel] = useState(FUNCTIONS[0]);
    const [show, setShow] = useState(true);
    const [anim, setAnim] = useState(false);
    const [animX, setAnimX] = useState<number | null>(null);
    const [manX, setManX] = useState<number | null>(null);
    const [man, setMan] = useState(false);
    const [dir, setDir] = useState<"p" | "m">("p");

    const xMin = -10, xMax = 10;

    // Campionamento con range verticale adattivo
    const samp = useMemo(() => {
        const pts: { x: number; y: number }[] = [];
        for (let i = 0; i <= 400; i++) {
            const x = xMin + (i / 400) * (xMax - xMin);
            const y = sel.f(x);
            if (Number.isFinite(y)) pts.push({ x, y });
        }
        return pts;
    }, [sel]);

    // Range verticale con scala adattiva
    const yVals = samp.map((p) => p.y);
    const yMinRaw = Math.min(...yVals);
    const yMaxRaw = Math.max(...yVals);

    // Usa range più ampio per funzioni che crescono molto
    const range = yMaxRaw - yMinRaw;
    let yMin: number, yMax: number;

    if (range > 1000) {
        // Per range molto grandi, usa range ancora più ampio
        const pad = range * 0.1;
        yMin = yMinRaw - pad;
        yMax = yMaxRaw + pad;
    } else {
        // Per range normali
        const pad = Math.max(5, range * 0.2);
        yMin = yMinRaw - pad;
        yMax = yMaxRaw + pad;
    }

    const toX = (x: number) => PL + ((x - xMin) / (xMax - xMin)) * (W - PL - PR);
    const toY = (y: number) => {
        // Non clampare, usa il range completo
        return H - PB - ((y - yMin) / (yMax - yMin)) * (H - PT - PB);
    };

    const path = useMemo(() => {
        if (!samp.length) return "";
        let d = `M ${toX(samp[0].x)} ${toY(samp[0].y)}`;
        for (let i = 1; i < samp.length; i++) {
            d += ` L ${toX(samp[i].x)} ${toY(samp[i].y)}`;
        }
        return d;
    }, [samp]);

    // Punti di avvicinamento all'infinito
    const approachPlus = useMemo(() => {
        const pts: { x: number; fx: number }[] = [];
        const positions = [xMax * 0.3, xMax * 0.5, xMax * 0.7, xMax * 0.85, xMax * 0.95];
        for (const x of positions) {
            const fx = sel.f(x);
            if (Number.isFinite(fx)) pts.push({ x, fx });
        }
        return pts;
    }, [sel, xMax]);

    const approachMinus = useMemo(() => {
        const pts: { x: number; fx: number }[] = [];
        const positions = [xMin * 0.3, xMin * 0.5, xMin * 0.7, xMin * 0.85, xMin * 0.95];
        for (const x of positions) {
            const fx = sel.f(x);
            if (Number.isFinite(fx)) pts.push({ x, fx });
        }
        return pts;
    }, [sel, xMin]);

    const actX = man && manX !== null ? manX : animX;
    const actY = actX !== null ? sel.f(actX) : null;

    const ref = useRef<number | null>(null);
    useEffect(() => {
        if (!anim) { setAnimX(null); return; }
        let t = 0, start: number | null = null;
        const step = (ts: number) => {
            if (!start) start = ts;
            t = Math.min(1, (ts - start) / 3000);
            setAnimX(dir === "p" ? t * xMax * 0.95 : -t * Math.abs(xMin) * 0.95);
            if (t >= 1) { setAnim(false); return; }
            ref.current = requestAnimationFrame(step);
        };
        ref.current = requestAnimationFrame(step);
        return () => { if (ref.current) cancelAnimationFrame(ref.current); };
    }, [anim, dir, xMax, xMin]);

    const xTicks = [-10, -5, 0, 5, 10];
    const yTicks = useMemo(() => {
        const range = yMax - yMin;
        let step: number;

        if (range > 10000) step = 5000;
        else if (range > 5000) step = 2000;
        else if (range > 1000) step = 500;
        else if (range > 500) step = 100;
        else if (range > 100) step = 50;
        else if (range > 50) step = 20;
        else if (range > 20) step = 10;
        else step = 5;

        const ticks: number[] = [];
        for (let i = Math.ceil(yMin / step) * step; i <= Math.floor(yMax / step) * step; i += step) {
            ticks.push(i);
        }
        return ticks;
    }, [yMin, yMax]);

    return (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
                Limite infinito per x → ±∞
            </h1>
            <p style={{ color: "#475569", marginBottom: 12 }}>
                Studia le <strong>funzioni che divergono</strong>: quando x tende a ±∞,
                anche f(x) tende a ±∞. La funzione cresce o decresce illimitatamente.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12 }}>
                <div style={{ background: "#fff", borderRadius: 16, padding: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                        <div style={{ fontWeight: 600 }}>Grafico della funzione</div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 13 }}>
                            <button onClick={() => { setDir("p"); setAnim(true); setMan(false); }} disabled={anim} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #cbd5e1", background: anim && dir === "p" ? "#e5e7eb" : "#fff" }}>
                                → +∞
                            </button>
                            <button onClick={() => { setDir("m"); setAnim(true); setMan(false); }} disabled={anim} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #cbd5e1", background: anim && dir === "m" ? "#e5e7eb" : "#fff" }}>
                                → -∞
                            </button>
                            <button onClick={() => { setMan(!man); if (!man) { setManX(0); setAnim(false); } }} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #cbd5e1", background: man ? "#dbeafe" : "#fff", fontWeight: man ? 600 : 400 }}>
                                {man ? "Manuale ON" : "Manuale"}
                            </button>
                            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} />
                                Punti
                            </label>
                        </div>
                    </div>

                    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
                        <defs>
                            <pattern id="g4" width="20" height="20" patternUnits="userSpaceOnUse">
                                <rect width="20" height="20" fill="#fafafa" />
                                <path d="M20 0 H0 V20" fill="none" stroke="#e0e0e0" strokeWidth={1} />
                            </pattern>
                        </defs>
                        <rect x={0} y={0} width={W} height={H} fill="url(#g4)" />

                        {/* Griglia */}
                        {xTicks.map((x, i) => (
                            <line key={`xg-${i}`} x1={toX(x)} y1={PT} x2={toX(x)} y2={H - PB} stroke="#e5e7eb" />
                        ))}
                        {yTicks.map((y, i) => (
                            <line key={`yg-${i}`} x1={PL} y1={toY(y)} x2={W - PR} y2={toY(y)} stroke="#e5e7eb" />
                        ))}

                        {/* Assi */}
                        <line x1={PL} y1={toY(0)} x2={W - PR} y2={toY(0)} stroke="#111827" strokeWidth={2} />
                        <line x1={toX(0)} y1={PT} x2={toX(0)} y2={H - PB} stroke="#111827" strokeWidth={2} />

                        {/* Ticks */}
                        {xTicks.map((x, i) => (
                            <text key={`xl-${i}`} x={toX(x)} y={H - PB + 20} fontSize={10} textAnchor="middle" fill="#374151">
                                {x}
                            </text>
                        ))}
                        {yTicks.map((y, i) => (
                            <text key={`yl-${i}`} x={PL - 10} y={toY(y) + 4} fontSize={10} textAnchor="end" fill="#374151">
                                {Math.abs(y) >= 1000 ? (y / 1000).toFixed(0) + "k" : y}
                            </text>
                        ))}

                        {/* Frecce indicatori infinito */}
                        {sel.limitPlus === "+∞" && (
                            <g>
                                <line x1={W - PR - 30} y1={PT + 20} x2={W - PR - 10} y2={PT + 5} stroke="#10b981" strokeWidth={2} markerEnd="url(#arrowUp)" />
                                <text x={W - PR - 35} y={PT + 15} fontSize={11} fill="#059669" fontWeight={600}>+∞</text>
                            </g>
                        )}
                        {sel.limitPlus === "-∞" && (
                            <g>
                                <line x1={W - PR - 30} y1={H - PB - 20} x2={W - PR - 10} y2={H - PB - 5} stroke="#ef4444" strokeWidth={2} />
                                <text x={W - PR - 35} y={H - PB - 15} fontSize={11} fill="#991b1b" fontWeight={600}>-∞</text>
                            </g>
                        )}
                        {sel.limitMinus === "+∞" && (
                            <g>
                                <line x1={PL + 10} y1={PT + 20} x2={PL + 30} y2={PT + 5} stroke="#8b5cf6" strokeWidth={2} />
                                <text x={PL + 35} y={PT + 15} fontSize={11} fill="#7c3aed" fontWeight={600}>+∞</text>
                            </g>
                        )}
                        {sel.limitMinus === "-∞" && (
                            <g>
                                <line x1={PL + 10} y1={H - PB - 20} x2={PL + 30} y2={H - PB - 5} stroke="#f97316" strokeWidth={2} />
                                <text x={PL + 35} y={H - PB - 15} fontSize={11} fill="#ea580c" fontWeight={600}>-∞</text>
                            </g>
                        )}

                        {/* Curva */}
                        <path d={path} fill="none" stroke="#2563eb" strokeWidth={3} />

                        {/* Punti avvicinamento */}
                        {show && (
                            <>
                                {approachPlus.map((p, i) => (
                                    <circle key={`p-${i}`} cx={toX(p.x)} cy={toY(p.fx)} r={3} fill="#10b981" opacity={0.5 + i * 0.1} />
                                ))}
                                {approachMinus.map((p, i) => (
                                    <circle key={`m-${i}`} cx={toX(p.x)} cy={toY(p.fx)} r={3} fill="#8b5cf6" opacity={0.5 + i * 0.1} />
                                ))}
                            </>
                        )}

                        {/* Pallina */}
                        {actX !== null && actY !== null && Number.isFinite(actY) && (
                            <>
                                <circle cx={toX(actX)} cy={toY(actY)} r={8} fill="#fbbf24" stroke="#92400e" strokeWidth={2} />
                                <line x1={toX(actX)} y1={toY(actY)} x2={toX(actX)} y2={H - PB} stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="3 3" opacity={0.6} />
                                <rect x={toX(actX) - 35} y={H - PB + 25} width={70} height={20} fill="#fef3c7" stroke="#f59e0b" rx={4} />
                                <text x={toX(actX)} y={H - PB + 38} fontSize={11} textAnchor="middle" fill="#92400e" fontWeight={600}>
                                    x = {actX.toFixed(1)}
                                </text>
                                <rect x={PL - 80} y={toY(actY) - 10} width={75} height={20} fill="#fef3c7" stroke="#f59e0b" rx={4} />
                                <text x={PL - 42} y={toY(actY) + 3} fontSize={11} textAnchor="middle" fill="#92400e" fontWeight={600}>
                                    f(x) = {actY.toFixed(1)}
                                </text>
                            </>
                        )}

                        <text x={W - PR - 5} y={H - PB + 35} fontSize={14} fill="#374151">+∞</text>
                        <text x={PL + 5} y={H - PB + 35} fontSize={14} fill="#374151">-∞</text>
                    </svg>

                    {sel.note && (
                        <div style={{ marginTop: 8, padding: 8, background: "#fef3c7", borderRadius: 8, fontSize: 13, color: "#78350f" }}>
                            ℹ️ {sel.note}
                        </div>
                    )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ background: "#fff", borderRadius: 16, padding: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                        <div style={{ fontWeight: 600, marginBottom: 8 }}>Funzione</div>
                        <select value={sel.id} onChange={(e) => { setSel(FUNCTIONS.find((f) => f.id === e.target.value)!); setAnim(false); setMan(false); }} style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #cbd5e1" }}>
                            {FUNCTIONS.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                    </div>

                    {man && (
                        <div style={{ background: "#dbeafe", borderRadius: 16, padding: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", border: "2px solid #3b82f6" }}>
                            <div style={{ fontWeight: 600, marginBottom: 8, color: "#1e3a8a" }}>🎯 Esplora</div>
                            <input type="range" min={xMin} max={xMax} step={0.1} value={manX ?? 0} onChange={(e) => setManX(parseFloat(e.target.value))} style={{ width: "100%" }} />
                            <div style={{ marginTop: 8, fontSize: 13, color: "#1e40af" }}>
                                <strong>x:</strong> {manX?.toFixed(2)} | <strong>f(x):</strong> {actY?.toFixed(2)}
                            </div>
                        </div>
                    )}

                    <div style={{ background: "#fff", borderRadius: 16, padding: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                        <div style={{ fontWeight: 600, marginBottom: 8 }}>Tabella di avvicinamento</div>
                        <div style={{ maxHeight: 200, overflowY: "auto", fontSize: 12 }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead style={{ background: "#f1f5f9", position: "sticky", top: 0 }}>
                                <tr>
                                    <th style={{ padding: 4, textAlign: "left" }}>x</th>
                                    <th style={{ padding: 4, textAlign: "right" }}>f(x)</th>
                                </tr>
                                </thead>
                                <tbody>
                                {approachMinus.reverse().map((p, i) => (
                                    <tr key={`tm-${i}`} style={{ background: "#f5f3ff" }}>
                                        <td style={{ padding: 4 }}>{p.x.toFixed(1)}</td>
                                        <td style={{ padding: 4, textAlign: "right" }}>{p.fx.toFixed(1)}</td>
                                    </tr>
                                ))}
                                <tr style={{ background: "#ddd6fe", fontWeight: 600 }}>
                                    <td style={{ padding: 4 }}>x → -∞</td>
                                    <td style={{ padding: 4, textAlign: "right" }}>{sel.limitMinus}</td>
                                </tr>
                                <tr style={{ background: "#e5e7eb" }}>
                                    <td colSpan={2} style={{ padding: 4, textAlign: "center" }}>• • •</td>
                                </tr>
                                <tr style={{ background: "#d1fae5", fontWeight: 600 }}>
                                    <td style={{ padding: 4 }}>x → +∞</td>
                                    <td style={{ padding: 4, textAlign: "right" }}>{sel.limitPlus}</td>
                                </tr>
                                {approachPlus.map((p, i) => (
                                    <tr key={`tp-${i}`} style={{ background: "#f0fdf4" }}>
                                        <td style={{ padding: 4 }}>{p.x.toFixed(1)}</td>
                                        <td style={{ padding: 4, textAlign: "right" }}>{p.fx.toFixed(1)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div style={{ background: "#fff", borderRadius: 16, padding: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                        <div style={{ fontWeight: 600, marginBottom: 8 }}>Limiti</div>
                        <div style={{ fontSize: 14 }}>
                            <div style={{ marginBottom: 6 }}>
                                <div style={{ fontSize: 12, color: "#10b981" }}>x → +∞:</div>
                                <div style={{ fontSize: 16, fontWeight: 600, color: sel.limitPlus === "+∞" ? "#059669" : sel.limitPlus === "-∞" ? "#991b1b" : "#334155", marginLeft: 12 }}>
                                    {sel.limitPlus}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: "#8b5cf6" }}>x → -∞:</div>
                                <div style={{ fontSize: 16, fontWeight: 600, color: sel.limitMinus === "+∞" ? "#7c3aed" : sel.limitMinus === "-∞" ? "#ea580c" : "#334155", marginLeft: 12 }}>
                                    {sel.limitMinus}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: 12, background: "#fef2f2", borderRadius: 12, padding: 12, fontSize: 13, color: "#991b1b" }}>
                <strong>Concetto:</strong> Quando sia x che f(x) tendono a infinito, la funzione diverge.
                Per polinomi, il comportamento è determinato dal termine di grado massimo.
                Le funzioni esponenziali divergono più rapidamente dei polinomi.
            </div>
        </div>
    );
}