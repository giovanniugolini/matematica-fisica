/**
 * UrnProbabilityTreeDemo - Versione refactorizzata
 * Albero di probabilità per estrazioni da un'urna
 */

import React, { useMemo, useState } from "react";
import { DemoContainer } from "../../components/ui";

// ============ TIPI ============

type BallColor = {
    id: string;
    name: string;
    short: string;
    count: number;
    hex: string;
};

type Fraction = { num: number; den: number; str: string; dec: string };

// ============ COSTANTI ============

const COLORS_BASE = [
    { id: "R", name: "Rosso", short: "R", hex: "#ef4444" },
    { id: "B", name: "Blu", short: "B", hex: "#3b82f6" },
    { id: "V", name: "Verde", short: "V", hex: "#22c55e" },
    { id: "G", name: "Giallo", short: "G", hex: "#eab308" },
];

const SVG_W = 750, SVG_H = 400;

// ============ UTILITY ============

function gcd(a: number, b: number): number {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { const t = b; b = a % b; a = t; }
    return a || 1;
}

function makeFrac(num: number, den: number): Fraction {
    if (den === 0 || num === 0) return { num: 0, den: 1, str: "0", dec: "0" };
    const d = gcd(num, den);
    const n = num / d, dn = den / d;
    const str = dn === 1 ? `${n}` : `${n}/${dn}`;
    const val = n / dn;
    const dec = val >= 0.001 ? val.toFixed(3).replace(".", ",") : val.toExponential(2);
    return { num: n, den: dn, str, dec };
}

function generateRandomUrn(): BallColor[] {
    const numColors = 2 + Math.floor(Math.random() * 2); // 2 o 3
    return COLORS_BASE.slice(0, numColors).map(c => ({
        ...c,
        count: 1 + Math.floor(Math.random() * 5)
    }));
}

// ============ COMPONENTE PRINCIPALE ============

export default function UrnProbabilityTreeDemo() {
    const [colors, setColors] = useState<BallColor[]>(() => generateRandomUrn());
    const [withReplacement, setWithReplacement] = useState(false);

    const total = useMemo(() => colors.reduce((s, c) => s + c.count, 0), [colors]);
    const n = colors.length;

    // Probabilità primo livello
    const prob1 = useMemo(() => colors.map(c => makeFrac(c.count, total)), [colors, total]);

    // Probabilità secondo livello (condizionate)
    const prob2 = useMemo(() => {
        return colors.map((_, i) => {
            if (withReplacement) return colors.map(c => makeFrac(c.count, total));
            const den = total - 1;
            return colors.map((c, j) => makeFrac(i === j ? Math.max(c.count - 1, 0) : c.count, den));
        });
    }, [colors, total, withReplacement]);

    // Probabilità congiunte
    const jointProb = useMemo(() => {
        return colors.map((_, i) => colors.map((_, j) => {
            const p1 = prob1[i], p2 = prob2[i][j];
            return makeFrac(p1.num * p2.num, p1.den * p2.den);
        }));
    }, [colors, prob1, prob2]);

    // Layout albero
    const layout = useMemo(() => {
        const xRoot = 70, xFirst = 260, xSecond = 520;
        const topM = 30, botM = 30;
        const space = SVG_H - topM - botM;
        const leafCount = n * n;
        const leafY = Array.from({ length: leafCount }, (_, i) => topM + (leafCount > 1 ? i * space / (leafCount - 1) : space / 2));

        const ySecond: number[][] = [];
        for (let i = 0; i < n; i++) {
            ySecond[i] = [];
            for (let j = 0; j < n; j++) {
                ySecond[i][j] = leafY[i * n + j];
            }
        }

        const yFirst = colors.map((_, i) => {
            const ys = ySecond[i];
            return ys.reduce((s, y) => s + y, 0) / ys.length;
        });

        const yRoot = leafY.reduce((s, y) => s + y, 0) / leafY.length;

        return { xRoot, xFirst, xSecond, yRoot, yFirst, ySecond };
    }, [n, colors]);

    // Handlers
    const handleCountChange = (idx: number, val: number) => {
        setColors(prev => prev.map((c, i) => i === idx ? { ...c, count: Math.max(0, val) } : c));
    };

    const handleNumColors = (num: number) => {
        const n = Math.max(1, Math.min(4, num));
        setColors(prev => {
            if (n === prev.length) return prev;
            if (n < prev.length) return prev.slice(0, n);
            return [...prev, ...COLORS_BASE.slice(prev.length, n).map(c => ({ ...c, count: 2 }))];
        });
    };

    // Stili
    const cardStyle: React.CSSProperties = { background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" };

    return (
        <DemoContainer
            title="Albero di probabilità – Estrazioni da un'urna"
            description="Visualizza le probabilità di due estrazioni successive, con o senza reimmissione."
        >
            {/* Controlli urna */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={cardStyle}>
                    <div style={{ fontWeight: 600, marginBottom: 12 }}>🎱 Composizione urna</div>
                    <div style={{ display: "grid", gap: 8 }}>
                        {colors.map((c, i) => (
                            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 16, height: 16, borderRadius: "50%", background: c.hex }} />
                                <span style={{ minWidth: 60, fontWeight: 500 }}>{c.name}</span>
                                <input
                                    type="number"
                                    min={0}
                                    value={c.count}
                                    onChange={e => handleCountChange(i, parseInt(e.target.value) || 0)}
                                    style={{ width: 60, padding: "4px 8px", borderRadius: 6, border: "1px solid #d1d5db" }}
                                />
                                <span style={{ fontSize: 12, color: "#6b7280" }}>palline</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #e5e7eb" }}>
                        <label style={{ fontSize: 13 }}>
                            Colori:
                            <input
                                type="number"
                                min={1}
                                max={4}
                                value={colors.length}
                                onChange={e => handleNumColors(parseInt(e.target.value) || 2)}
                                style={{ width: 50, marginLeft: 8, padding: "4px 8px", borderRadius: 6, border: "1px solid #d1d5db" }}
                            />
                        </label>
                        <span style={{ marginLeft: 12, fontSize: 13, color: "#6b7280" }}>Totale: <strong>{total}</strong></span>
                    </div>
                </div>

                <div style={cardStyle}>
                    <div style={{ fontWeight: 600, marginBottom: 12 }}>⚙️ Modalità</div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                        <button
                            onClick={() => setWithReplacement(false)}
                            style={{
                                flex: 1,
                                padding: "12px 16px",
                                borderRadius: 8,
                                border: !withReplacement ? "2px solid #3b82f6" : "1px solid #d1d5db",
                                background: !withReplacement ? "#dbeafe" : "#fff",
                                cursor: "pointer",
                                textAlign: "left"
                            }}
                        >
                            <div style={{ fontWeight: 600 }}>Senza reimmissione</div>
                            <div style={{ fontSize: 11, color: "#6b7280" }}>La pallina non torna nell'urna</div>
                        </button>
                        <button
                            onClick={() => setWithReplacement(true)}
                            style={{
                                flex: 1,
                                padding: "12px 16px",
                                borderRadius: 8,
                                border: withReplacement ? "2px solid #22c55e" : "1px solid #d1d5db",
                                background: withReplacement ? "#dcfce7" : "#fff",
                                cursor: "pointer",
                                textAlign: "left"
                            }}
                        >
                            <div style={{ fontWeight: 600 }}>Con reimmissione</div>
                            <div style={{ fontSize: 11, color: "#6b7280" }}>La pallina torna nell'urna</div>
                        </button>
                    </div>
                    <button
                        onClick={() => setColors(generateRandomUrn())}
                        style={{ width: "100%", padding: "10px 16px", borderRadius: 8, border: "none", background: "#f59e0b", color: "#fff", cursor: "pointer", fontWeight: 600 }}
                    >
                        🎲 Genera problema casuale
                    </button>
                </div>
            </div>

            {/* Albero SVG */}
            <div style={{ ...cardStyle, marginTop: 12, overflowX: "auto" }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>📊 Albero delle probabilità</div>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: "100%", maxHeight: "50vh" }}>
                    <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="#fafafa" rx={8} />

                    {/* Rami livello 1 */}
                    {colors.map((c, i) => {
                        const { xRoot, xFirst, yRoot, yFirst } = layout;
                        const mx = (xRoot + xFirst) / 2, my = (yRoot + yFirst[i]) / 2;
                        return (
                            <g key={`l1-${i}`}>
                                <line x1={xRoot} y1={yRoot} x2={xFirst} y2={yFirst[i]} stroke="#94a3b8" strokeWidth={2} />
                                <rect x={mx - 28} y={my - 14} width={56} height={28} rx={6} fill="#fff" stroke="#d1d5db" />
                                <text x={mx} y={my + 1} fontSize={11} textAnchor="middle" fill="#374151">{prob1[i].str}</text>
                                <text x={mx} y={my + 12} fontSize={9} textAnchor="middle" fill="#9ca3af">({prob1[i].dec})</text>
                            </g>
                        );
                    })}

                    {/* Rami livello 2 */}
                    {colors.map((_, i) => colors.map((_, j) => {
                        const { xFirst, xSecond, yFirst, ySecond } = layout;
                        const y1 = yFirst[i], y2 = ySecond[i][j];
                        const mx = (xFirst + xSecond) / 2, my = (y1 + y2) / 2;
                        const p = prob2[i][j];
                        const isZero = p.num === 0;
                        return (
                            <g key={`l2-${i}-${j}`}>
                                <line x1={xFirst} y1={y1} x2={xSecond} y2={y2} stroke={isZero ? "#e5e7eb" : "#94a3b8"} strokeWidth={isZero ? 1 : 2} strokeDasharray={isZero ? "4 3" : undefined} />
                                <rect x={mx - 28} y={my - 14} width={56} height={28} rx={6} fill="#fff" stroke="#d1d5db" />
                                <text x={mx} y={my + 1} fontSize={11} textAnchor="middle" fill={isZero ? "#9ca3af" : "#374151"}>{p.str}</text>
                                <text x={mx} y={my + 12} fontSize={9} textAnchor="middle" fill="#9ca3af">({p.dec})</text>
                            </g>
                        );
                    }))}

                    {/* Nodo radice */}
                    <circle cx={layout.xRoot} cy={layout.yRoot} r={14} fill="#fff" stroke="#374151" strokeWidth={2} />
                    <text x={layout.xRoot} y={layout.yRoot + 4} fontSize={10} textAnchor="middle" fill="#374151">Inizio</text>

                    {/* Nodi livello 1 */}
                    {colors.map((c, i) => (
                        <g key={`n1-${i}`}>
                            <circle cx={layout.xFirst} cy={layout.yFirst[i]} r={14} fill="#fff" stroke={c.hex} strokeWidth={3} />
                            <text x={layout.xFirst} y={layout.yFirst[i] + 5} fontSize={13} textAnchor="middle" fill={c.hex} fontWeight={700}>{c.short}</text>
                        </g>
                    ))}

                    {/* Nodi livello 2 (foglie) */}
                    {colors.map((c1, i) => colors.map((c2, j) => {
                        const y = layout.ySecond[i][j];
                        const label = `${c1.short}${c2.short}`;
                        const jp = jointProb[i][j];
                        return (
                            <g key={`n2-${i}-${j}`}>
                                <circle cx={layout.xSecond} cy={y} r={14} fill="#fff" stroke={c2.hex} strokeWidth={3} />
                                <text x={layout.xSecond} y={y + 5} fontSize={13} textAnchor="middle" fill={c2.hex} fontWeight={700}>{c2.short}</text>
                                <text x={layout.xSecond + 24} y={y + 4} fontSize={12} textAnchor="start" fill="#374151" fontWeight={600}>{label}</text>
                                <text x={layout.xSecond + 60} y={y + 4} fontSize={11} textAnchor="start" fill="#6b7280">P = {jp.str}</text>
                            </g>
                        );
                    }))}

                    {/* Labels livelli */}
                    <text x={layout.xRoot} y={15} fontSize={11} textAnchor="middle" fill="#6b7280">Partenza</text>
                    <text x={layout.xFirst} y={15} fontSize={11} textAnchor="middle" fill="#6b7280">1ª estrazione</text>
                    <text x={layout.xSecond} y={15} fontSize={11} textAnchor="middle" fill="#6b7280">2ª estrazione</text>
                </svg>
            </div>

            {/* Tabella riepilogo */}
            <div style={{ ...cardStyle, marginTop: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 12 }}>📋 Tabella probabilità congiunte</div>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                        <tr style={{ background: "#f8fafc" }}>
                            <th style={{ padding: "8px 12px", borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>Esito</th>
                            <th style={{ padding: "8px 12px", borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>P(1ª)</th>
                            <th style={{ padding: "8px 12px", borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>P(2ª|1ª)</th>
                            <th style={{ padding: "8px 12px", borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>P(esito)</th>
                            <th style={{ padding: "8px 12px", borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>Decimale</th>
                        </tr>
                        </thead>
                        <tbody>
                        {colors.flatMap((c1, i) => colors.map((c2, j) => {
                            const jp = jointProb[i][j];
                            return (
                                <tr key={`${i}-${j}`} style={{ background: (i * n + j) % 2 === 0 ? "#fff" : "#f8fafc" }}>
                                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #e5e7eb" }}>
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                                <span style={{ width: 12, height: 12, borderRadius: "50%", background: c1.hex }} />
                                                <span style={{ width: 12, height: 12, borderRadius: "50%", background: c2.hex }} />
                                                <strong>{c1.short}{c2.short}</strong>
                                            </span>
                                    </td>
                                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #e5e7eb" }}>{prob1[i].str}</td>
                                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #e5e7eb" }}>{prob2[i][j].str}</td>
                                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #e5e7eb", fontWeight: 600 }}>{jp.str}</td>
                                    <td style={{ padding: "8px 12px", borderBottom: "1px solid #e5e7eb", color: "#6b7280" }}>{jp.dec}</td>
                                </tr>
                            );
                        }))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Spiegazione */}
            <div style={{ marginTop: 12, background: "#eff6ff", borderRadius: 12, padding: 16, fontSize: 13, color: "#1e40af" }}>
                <strong>💡 Come leggere l'albero:</strong>
                <ul style={{ margin: "8px 0 0 0", paddingLeft: 20 }}>
                    <li>Ogni ramo mostra la probabilità di quell'evento</li>
                    <li>La probabilità di un percorso si calcola <strong>moltiplicando</strong> le probabilità sui rami</li>
                    <li><strong>Senza reimmissione:</strong> le probabilità del 2° livello cambiano (il denominatore diminuisce di 1)</li>
                    <li><strong>Con reimmissione:</strong> le probabilità restano uguali ad ogni livello (eventi indipendenti)</li>
                </ul>
            </div>
        </DemoContainer>
    );
}