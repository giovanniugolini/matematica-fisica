import React, { useMemo, useState, useEffect, useRef } from "react";

type FunctionDef = {
    id: string;
    name: string;
    expr: string;
    f: (x: number) => number;
    limitPlus: number | null;
    limitMinus: number | null;
    note?: string;
};

const FUNCTIONS: FunctionDef[] = [
    {
        id: "inv",
        name: "f(x) = 1/x",
        expr: "1/x",
        f: (x) => 1 / x,
        limitPlus: 0,
        limitMinus: 0,
        note: "Asintoto orizzontale y = 0",
    },
    {
        id: "inv-plus",
        name: "f(x) = 1/x + 2",
        expr: "1/x + 2",
        f: (x) => 1 / x + 2,
        limitPlus: 2,
        limitMinus: 2,
    },
    {
        id: "rational",
        name: "f(x) = (2x+1)/(x+3)",
        expr: "(2x+1)/(x+3)",
        f: (x) => (2 * x + 1) / (x + 3),
        limitPlus: 2,
        limitMinus: 2,
    },
    {
        id: "arctan",
        name: "f(x) = arctan(x)",
        expr: "arctan(x)",
        f: (x) => Math.atan(x),
        limitPlus: Math.PI / 2,
        limitMinus: -Math.PI / 2,
        note: "Limiti diversi: π/2 e -π/2",
    },
];

const W = 800, H = 500, PL = 60, PR = 30, PT = 30, PB = 60;

export default function LimiteFinitoPiuMenoInfinito() {
    const [sel, setSel] = useState(FUNCTIONS[0]);
    const [show, setShow] = useState(true);
    const [showPts, setShowPts] = useState(true);
    const [anim, setAnim] = useState(false);
    const [animX, setAnimX] = useState<number | null>(null);
    const [manX, setManX] = useState<number | null>(null);
    const [man, setMan] = useState(false);
    const [dir, setDir] = useState<"p" | "m">("p");

    const xMin = -25, xMax = 25;

    const vals = useMemo(() => {
        const v: number[] = [];
        for (let x = xMin; x <= xMax; x += (xMax - xMin) / 100) {
            const y = sel.f(x);
            if (Number.isFinite(y)) v.push(y);
        }
        return v;
    }, [sel, xMin, xMax]);

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

    const yMin = Math.min(...vals, sel.limitPlus ?? 0, sel.limitMinus ?? 0) - 1;
    const yMax = Math.max(...vals, sel.limitPlus ?? 0, sel.limitMinus ?? 0) + 1;

    const samp = useMemo(() => {
        const pts: { x: number; y: number }[] = [];
        for (let i = 0; i <= 500; i++) {
            const x = xMin + (i / 500) * (xMax - xMin);
            const y = sel.f(x);
            if (Number.isFinite(y)) pts.push({ x, y });
        }
        return pts;
    }, [sel, xMin, xMax]);

    const toX = (x: number) => PL + ((x - xMin) / (xMax - xMin)) * (W - PL - PR);
    const toY = (y: number) => H - PB - ((y - yMin) / (yMax - yMin)) * (H - PT - PB);

    const path = useMemo(() => {
        if (!samp.length) return "";
        let d = `M ${toX(samp[0].x)} ${toY(samp[0].y)}`;
        for (let i = 1; i < samp.length; i++) d += ` L ${toX(samp[i].x)} ${toY(samp[i].y)}`;
        return d;
    }, [samp]);

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

    return (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
                Limite finito per x → ±∞
            </h1>
            <p style={{ color: "#475569", marginBottom: 12 }}>
                Studia gli <strong>asintoti orizzontali</strong>: quando x tende a ±∞,
                la funzione si avvicina a un valore finito L.
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
                                Asintoti
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <input type="checkbox" checked={showPts} onChange={(e) => setShowPts(e.target.checked)} />
                                Punti avvicin.
                            </label>
                        </div>
                    </div>

                    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
                        <defs>
                            <pattern id="g3" width="20" height="20" patternUnits="userSpaceOnUse">
                                <rect width="20" height="20" fill="#fafafa" />
                                <path d="M20 0 H0 V20" fill="none" stroke="#e0e0e0" strokeWidth={1} />
                            </pattern>
                        </defs>
                        <rect x={0} y={0} width={W} height={H} fill="url(#g3)" />

                        {/* Assi */}
                        <line x1={PL} y1={toY(0)} x2={W - PR} y2={toY(0)} stroke="#111827" strokeWidth={2} />
                        <line x1={toX(0)} y1={PT} x2={toX(0)} y2={H - PB} stroke="#111827" strokeWidth={2} />

                        {/* Asintoti */}
                        {show && sel.limitPlus !== null && (
                            <g>
                                <line x1={PL} y1={toY(sel.limitPlus)} x2={W - PR} y2={toY(sel.limitPlus)} stroke="#10b981" strokeWidth={2} strokeDasharray="8 4" />
                                <text x={W - PR - 10} y={toY(sel.limitPlus) - 8} fontSize={11} textAnchor="end" fill="#059669" fontWeight={600}>
                                    y = {sel.limitPlus.toFixed(3)} (+∞)
                                </text>
                            </g>
                        )}
                        {show && sel.limitMinus !== null && sel.limitMinus !== sel.limitPlus && (
                            <g>
                                <line x1={PL} y1={toY(sel.limitMinus)} x2={W - PR} y2={toY(sel.limitMinus)} stroke="#8b5cf6" strokeWidth={2} strokeDasharray="8 4" />
                                <text x={PL + 10} y={toY(sel.limitMinus) - 8} fontSize={11} fill="#7c3aed" fontWeight={600}>
                                    y = {sel.limitMinus.toFixed(3)} (-∞)
                                </text>
                            </g>
                        )}

                        {/* Curva */}
                        <path d={path} fill="none" stroke="#2563eb" strokeWidth={3} />

                        {/* Punti di avvicinamento */}
                        {showPts && (
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
                                <rect x={PL - 80} y={toY(actY) - 10} width={70} height={20} fill="#fef3c7" stroke="#f59e0b" rx={4} />
                                <text x={PL - 45} y={toY(actY) + 3} fontSize={11} textAnchor="middle" fill="#92400e" fontWeight={600}>
                                    f(x) = {actY.toFixed(3)}
                                </text>
                            </>
                        )}

                        <text x={W - PR - 5} y={H - PB + 35} fontSize={14} fill="#374151">+∞</text>
                        <text x={PL + 5} y={H - PB + 35} fontSize={14} fill="#374151">-∞</text>
                    </svg>

                    {sel.note && (
                        <div style={{ marginTop: 8, padding: 8, background: "#f0fdf4", borderRadius: 8, fontSize: 13, color: "#14532d" }}>
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
                                <strong>x:</strong> {manX?.toFixed(2)} | <strong>f(x):</strong> {actY?.toFixed(4)}
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
                                        <td style={{ padding: 4, textAlign: "right" }}>{p.fx.toFixed(4)}</td>
                                    </tr>
                                ))}
                                {sel.limitMinus !== null && (
                                    <tr style={{ background: "#ddd6fe", fontWeight: 600 }}>
                                        <td style={{ padding: 4 }}>x → -∞</td>
                                        <td style={{ padding: 4, textAlign: "right" }}>L = {sel.limitMinus.toFixed(4)}</td>
                                    </tr>
                                )}
                                <tr style={{ background: "#e5e7eb" }}>
                                    <td colSpan={2} style={{ padding: 4, textAlign: "center" }}>• • •</td>
                                </tr>
                                {sel.limitPlus !== null && (
                                    <tr style={{ background: "#d1fae5", fontWeight: 600 }}>
                                        <td style={{ padding: 4 }}>x → +∞</td>
                                        <td style={{ padding: 4, textAlign: "right" }}>L = {sel.limitPlus.toFixed(4)}</td>
                                    </tr>
                                )}
                                {approachPlus.map((p, i) => (
                                    <tr key={`tp-${i}`} style={{ background: "#f0fdf4" }}>
                                        <td style={{ padding: 4 }}>{p.x.toFixed(1)}</td>
                                        <td style={{ padding: 4, textAlign: "right" }}>{p.fx.toFixed(4)}</td>
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
                                <div style={{ fontSize: 16, fontWeight: 600, color: "#059669", marginLeft: 12 }}>
                                    {sel.limitPlus !== null ? sel.limitPlus.toFixed(4) : "diverge"}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: "#8b5cf6" }}>x → -∞:</div>
                                <div style={{ fontSize: 16, fontWeight: 600, color: "#7c3aed", marginLeft: 12 }}>
                                    {sel.limitMinus !== null ? sel.limitMinus.toFixed(4) : "diverge"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: 12, background: "#eff6ff", borderRadius: 12, padding: 12, fontSize: 13, color: "#1e3a8a" }}>
                <strong>Concetto:</strong> Un asintoto orizzontale y = L si ha quando lim f(x) = L per x → ±∞.
                La funzione si avvicina sempre più al valore L ma può non raggiungerlo mai.
            </div>
        </div>
    );
}