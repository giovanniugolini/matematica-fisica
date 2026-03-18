/**
 * RettaParabolaDemo — La retta e la parabola
 *
 * Tipologia 1: data una retta y = mx + q e una parabola y = ax² + bx + c,
 *              stabilire se la retta è secante, tangente o esterna.
 *
 * Tipologia 2: trovare la retta tangente alla parabola y = ax² + bx + c
 *              passante per un punto P(x₀, y₀) con il metodo del delta.
 *
 * Metodo del delta:
 *   Sostituendo y = mx + n nella parabola si ottiene ax² + (b−m)x + (c−n) = 0.
 *   La retta è tangente ⟺ Δ = (b−m)² − 4a(c−n) = 0.
 *   Se il punto P(x₀, y₀) appartiene alla parabola e si cerca m:
 *   Δ = 0  →  m = ax₀ + b/2 (formula che si ricava in modo generale).
 *   Ma per l'esercizio scolastico lo sviluppiamo esplicitamente.
 */

import React, { useState, useCallback, useMemo } from "react";
import {
    Latex,
    DemoContainer,
    ProblemCard,
    NavigationButtons,
    StepCard,
    InfoBox,
    GenerateButton,
    useStepNavigation,
    useBreakpoint,
    ResponsiveGrid,
    SwipeableTabs,
    CollapsiblePanel,
} from "../../components/ui";
import { CollapsibleExplanation } from "../../components/ui/CollapsibleExplanation";
import { randomInt, randomNonZero, randomChoice, formatNumberLatex } from "../../utils/math";

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmt(n: number): string {
    const r = Math.round(n * 1000) / 1000;
    if (Number.isInteger(r)) return r.toString();
    return r.toFixed(3).replace(/\.?0+$/, "");
}

/** Restituisce "+n", "−n" o "" per uso in espressioni LaTeX */
function signedLatex(n: number, hideIfZero = false): string {
    if (n === 0) return hideIfZero ? "" : "+ 0";
    if (n > 0) return `+ ${fmt(n)}`;
    return `- ${fmt(-n)}`;
}

/** Formatta y = ax² + bx + c in LaTeX */
function parabolaLatex(a: number, b: number, c: number): string {
    let s = "";
    if (a === 1) s += "x^2";
    else if (a === -1) s += "-x^2";
    else s += `${fmt(a)}x^2`;
    if (b !== 0) {
        const bAbs = Math.abs(b);
        const bStr = bAbs === 1 ? "x" : `${fmt(bAbs)}x`;
        s += b > 0 ? ` + ${bStr}` : ` - ${bStr}`;
    }
    if (c !== 0) s += c > 0 ? ` + ${fmt(c)}` : ` - ${fmt(-c)}`;
    return `y = ${s}`;
}

/** Formatta y = mx + q in LaTeX */
function rettaLatex(m: number, q: number): string {
    let s = "";
    if (m === 0) return `y = ${fmt(q)}`;
    if (m === 1) s = "x";
    else if (m === -1) s = "-x";
    else s = `${fmt(m)}x`;
    if (q !== 0) s += q > 0 ? ` + ${fmt(q)}` : ` - ${fmt(-q)}`;
    return `y = ${s}`;
}

// ─── TIPOLOGIA 1: Posizione reciproca retta–parabola ─────────────────────────

type Posizione = "secante" | "tangente" | "esterna";

interface Tipo1 {
    a: number; b: number; c: number; // parabola
    m: number; q: number;            // retta
    // equazione ridotta ax² + Bx + C = 0  (A=a, B=b-m, C=c-q)
    A: number; B: number; C: number;
    delta: number;
    posizione: Posizione;
    x1?: number; x2?: number; xT?: number;
}

function generateTipo1(): Tipo1 {
    const posizione = randomChoice<Posizione>(["secante", "secante", "tangente", "esterna"]);

    const a = randomNonZero(-3, 3);
    const b = randomInt(-4, 4);
    const c = randomInt(-6, 6);
    const m = randomInt(-5, 5);

    // A = a, B = b - m, C = c - q
    // Δ = B² - 4AC = (b-m)² - 4a(c-q)
    // Vogliamo scegliere q in modo da ottenere la posizione desiderata

    let q: number;

    if (posizione === "tangente") {
        // Δ = 0  →  (b-m)² - 4a(c-q) = 0  →  q = c - (b-m)²/(4a)
        q = c - (b - m) ** 2 / (4 * a);
        // Arrotondiamo a intero se possibile
        const qRound = Math.round(q);
        // Verifica: per q intero, Δ deve essere 0
        const Bcheck = b - m;
        const Ccheck = c - qRound;
        const dCheck = Bcheck ** 2 - 4 * a * Ccheck;
        if (Math.abs(dCheck) < 0.1) q = qRound;
    } else if (posizione === "esterna") {
        // Δ < 0: (b-m)² - 4a(c-q) < 0
        // Se a > 0: c - q > (b-m)²/(4a)  →  q < c - (b-m)²/(4a)
        // Se a < 0: c - q < (b-m)²/(4a)  →  q > c - (b-m)²/(4a)
        const qTangente = c - (b - m) ** 2 / (4 * a);
        if (a > 0) {
            q = Math.round(qTangente) - randomInt(2, 5);
        } else {
            q = Math.round(qTangente) + randomInt(2, 5);
        }
    } else {
        // secante: Δ > 0
        // (b-m)² - 4a(c-q) > 0
        const qTangente = c - (b - m) ** 2 / (4 * a);
        if (a > 0) {
            q = Math.round(qTangente) + randomInt(2, 5);
        } else {
            q = Math.round(qTangente) - randomInt(2, 5);
        }
    }

    const A = a;
    const B = b - m;
    const C = c - q;
    const delta = B ** 2 - 4 * A * C;

    let x1: number | undefined;
    let x2: number | undefined;
    let xT: number | undefined;

    if (posizione === "secante" && delta > 0) {
        const sq = Math.sqrt(delta);
        x1 = (-B - sq) / (2 * A);
        x2 = (-B + sq) / (2 * A);
    } else if (posizione === "tangente" && Math.abs(delta) < 0.01) {
        xT = -B / (2 * A);
    }

    return { a, b, c, m, q: Math.round(q * 100) / 100, A, B, C, delta, posizione, x1, x2, xT };
}

// ─── TIPOLOGIA 2: Retta tangente con metodo del delta ────────────────────────

interface Tipo2 {
    a: number; b: number; c: number;   // parabola y = ax²+bx+c
    x0: number; y0: number;            // punto P sulla parabola
    // equazione ax² + (b-m)x + (c-q) = 0, con q = y0 - m*x0
    // Δ = (b-m)² - 4a(c-q) = 0
    // sviluppato: (b-m)² - 4a(c - y0 + m*x0) = 0
    // = b²-2bm+m² - 4ac + 4ay0 - 4am*x0 = 0
    // = m² - 2bm - 4ax0*m + b² - 4ac + 4ay0 = 0
    // = m² - (2b + 4ax0)m + (b² - 4ac + 4ay0) = 0
    // coeff per m: p = -(2b + 4ax0),  s = b² - 4ac + 4ay0
    // Δm = p² - 4s, ma P ∈ parabola → y0 = ax0²+bx0+c → soluzione unica m
    mTangente: number; // coefficiente angolare della tangente
    q: number;         // intercetta della tangente
    // svolgimento intermedio
    B_coeff: number; // b - m  in  ax²+(b-m)x+(c-q)=0 dopo aver espresso q
    C_coeff: number; // c - q
    deltaEspanso: string; // espressione Δ = ... LaTeX
}

function generateTipo2(): Tipo2 {
    const a = randomNonZero(-3, 3);
    const b = randomInt(-4, 4);
    const c = randomInt(-5, 5);

    // Punto P sulla parabola
    const x0 = randomInt(-4, 4);
    const y0 = a * x0 ** 2 + b * x0 + c;

    // Formula della tangente in x0: m = 2ax0 + b  (derivata, ma ricavabile con Δ=0)
    const mTangente = 2 * a * x0 + b;
    const qTang = y0 - mTangente * x0;

    const B_coeff = b - mTangente;
    const C_coeff = c - qTang;

    // Δ espanso come stringa LaTeX per lo svolgimento
    // Δ = (b-m)² - 4a(c-q) = 0   con q = y0 - m*x0
    // → (b-m)² - 4a(c - y0 + m*x0) = 0
    const p = -(2 * b + 4 * a * x0);
    const s = b ** 2 - 4 * a * c + 4 * a * y0;
    const deltaEspanso = `m^2 ${signedLatex(p)}m ${signedLatex(s)} = 0`;

    return { a, b, c, x0, y0, mTangente, q: Math.round(qTang * 1000) / 1000, B_coeff, C_coeff, deltaEspanso };
}

// ─── SVG Piano Cartesiano ────────────────────────────────────────────────────

interface PlotProps {
    width: number;
    a: number; b: number; c: number;
    m?: number; q?: number;        // retta opzionale
    highlights?: { x: number; y: number; color: string; label?: string }[];
    tangentM?: number; tangentN?: number; // tangente in tipo2
    tangentM2?: number; tangentN2?: number; // seconda tangente in tipo3
    x0?: number; y0?: number;
}

function CartesianPlot({ width, a, b, c, m, q, highlights = [], tangentM, tangentN, tangentM2, tangentN2, x0, y0 }: PlotProps) {
    const H = width;
    const range = 6;
    const pad = 32;
    const innerW = width - pad * 2;
    const innerH = H - pad * 2;

    const toSvg = (wx: number, wy: number) => ({
        x: pad + ((wx + range) / (2 * range)) * innerW,
        y: pad + ((range - wy) / (2 * range)) * innerH,
    });

    // Parabola points
    const parabolaPts: string[] = [];
    const steps = 200;
    let penUp = true;
    for (let i = 0; i <= steps; i++) {
        const wx = -range + (2 * range * i) / steps;
        const wy = a * wx ** 2 + b * wx + c;
        if (Math.abs(wy) > range * 2) { penUp = true; continue; }
        const p = toSvg(wx, wy);
        parabolaPts.push(`${penUp ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`);
        penUp = false;
    }

    // Retta points
    const lineSegs = (slope: number, intercept: number) => {
        const x1 = -range;
        const y1 = slope * x1 + intercept;
        const x2 = range;
        const y2 = slope * x2 + intercept;
        const p1 = toSvg(x1, y1);
        const p2 = toSvg(x2, y2);
        return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y };
    };

    const origin = toSvg(0, 0);

    return (
        <svg width={width} height={H} style={{ display: "block", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
            {/* grid */}
            {Array.from({ length: 2 * range + 1 }, (_, i) => i - range).map(n => {
                const { x } = toSvg(n, 0);
                const { y } = toSvg(0, n);
                return (
                    <g key={n}>
                        <line x1={x} y1={pad} x2={x} y2={H - pad} stroke="#e2e8f0" strokeWidth={n === 0 ? 1.5 : 0.7} />
                        <line x1={pad} y1={y} x2={width - pad} y2={y} stroke="#e2e8f0" strokeWidth={n === 0 ? 1.5 : 0.7} />
                        {n !== 0 && Math.abs(n) <= range - 1 && (
                            <>
                                <text x={x} y={origin.y + 14} textAnchor="middle" fontSize={9} fill="#94a3b8">{n}</text>
                                <text x={origin.x - 8} y={y + 4} textAnchor="end" fontSize={9} fill="#94a3b8">{n}</text>
                            </>
                        )}
                    </g>
                );
            })}
            {/* Assi */}
            <line x1={pad} y1={origin.y} x2={width - pad} y2={origin.y} stroke="#64748b" strokeWidth={1.5} />
            <line x1={origin.x} y1={pad} x2={origin.x} y2={H - pad} stroke="#64748b" strokeWidth={1.5} />
            {/* Parabola */}
            <path d={parabolaPts.join(" ")} fill="none" stroke="#3b82f6" strokeWidth={2.2} />
            {/* Retta principale */}
            {m !== undefined && q !== undefined && (() => {
                const s = lineSegs(m, q);
                return <line {...s} stroke="#ef4444" strokeWidth={2} />;
            })()}
            {/* Tangente (tipo2) */}
            {tangentM !== undefined && tangentN !== undefined && (() => {
                const s = lineSegs(tangentM, tangentN);
                return <line {...s} stroke="#f59e0b" strokeWidth={2} strokeDasharray="5,3" />;
            })()}
            {/* Seconda tangente (tipo3) */}
            {tangentM2 !== undefined && tangentN2 !== undefined && (() => {
                const s = lineSegs(tangentM2, tangentN2);
                return <line {...s} stroke="#a855f7" strokeWidth={2} strokeDasharray="5,3" />;
            })()}
            {/* Punti evidenziati */}
            {highlights.map((h, i) => {
                const p = toSvg(h.x, h.y);
                return (
                    <g key={i}>
                        <circle cx={p.x} cy={p.y} r={5} fill={h.color} stroke="#fff" strokeWidth={1.5} />
                        {h.label && (
                            <text x={p.x + 7} y={p.y - 5} fontSize={10} fill={h.color} fontWeight={700}>{h.label}</text>
                        )}
                    </g>
                );
            })}
            {/* Punto P (tipo2) */}
            {x0 !== undefined && y0 !== undefined && (() => {
                const p = toSvg(x0, y0);
                return (
                    <g>
                        <circle cx={p.x} cy={p.y} r={6} fill="#f59e0b" stroke="#fff" strokeWidth={2} />
                        <text x={p.x + 8} y={p.y - 6} fontSize={11} fill="#b45309" fontWeight={700}>P({x0},{fmt(y0)})</text>
                    </g>
                );
            })()}
        </svg>
    );
}

// ─── STEPS TIPOLOGIA 1 ───────────────────────────────────────────────────────

function Tipo1Steps({ eq, isMobile }: { eq: Tipo1; isMobile: boolean }) {
    const { currentStep, nextStep, prevStep, showAll, reset } = useStepNavigation(4);
    const isActive = (n: number) => currentStep >= n - 1;

    const [local, setLocal] = useState(eq);
    const handleGen = useCallback(() => {
        setLocal(generateTipo1());
        reset();
    }, [reset]);

    const { a, b, c, m, q, A, B, C, delta, posizione, x1, x2, xT } = local;

    const colorePos = posizione === "secante" ? "#22c55e" : posizione === "tangente" ? "#f59e0b" : "#ef4444";

    const highlights = useMemo(() => {
        if (posizione === "secante" && x1 !== undefined && x2 !== undefined) {
            return [
                { x: x1, y: m * x1 + q, color: "#22c55e", label: `P₁` },
                { x: x2, y: m * x2 + q, color: "#16a34a", label: `P₂` },
            ];
        }
        if (posizione === "tangente" && xT !== undefined) {
            return [{ x: xT, y: m * xT + q, color: "#f59e0b", label: "T" }];
        }
        return [];
    }, [posizione, x1, x2, xT, m, q]);

    const svgSize = isMobile ? 260 : 320;

    const Step1 = (
        <StepCard stepNumber={1} title="Sistema retta–parabola" color="green" isActive={isActive(1)}>
            <CollapsibleExplanation title="Perché sostituiamo?">
                <p>Per trovare i punti comuni imponiamo il sistema: le x di intersezione si trovano sostituendo l'espressione della retta nella parabola.</p>
            </CollapsibleExplanation>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Sistema:</div>
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: "8px 14px", overflowX: "auto", marginBottom: 10 }}>
                <Latex display>{`\\begin{cases} ${parabolaLatex(a, b, c)} \\\\ ${rettaLatex(m, q)} \\end{cases}`}</Latex>
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                Sostituendo <Latex>{rettaLatex(m, q)}</Latex> nella parabola e portando tutto a sinistra:
            </div>
            <div style={{ background: "#fff", borderRadius: 6, padding: "8px 12px", overflowX: "auto" }}>
                <Latex display>{`${A === 1 ? "" : A === -1 ? "-" : fmt(A)}x^2 ${signedLatex(B)}x ${signedLatex(C)} = 0`}</Latex>
            </div>
        </StepCard>
    );

    const Step2 = (
        <StepCard stepNumber={2} title="Calcolo del discriminante" color="blue" isActive={isActive(2)}>
            <CollapsibleExplanation title="Regola del delta">
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
                    <li><Latex>{"\\Delta > 0"}</Latex>: retta <strong>secante</strong> (2 punti)</li>
                    <li><Latex>{"\\Delta = 0"}</Latex>: retta <strong>tangente</strong> (1 punto)</li>
                    <li><Latex>{"\\Delta < 0"}</Latex>: retta <strong>esterna</strong> (0 punti)</li>
                </ul>
            </CollapsibleExplanation>
            <div style={{ background: "#fff", borderRadius: 6, padding: "8px 12px", overflowX: "auto" }}>
                <Latex display>{`\\Delta = (${B})^2 - 4 \\cdot (${A}) \\cdot (${C}) = ${B * B} - ${4 * A * C} = ${fmt(delta)}`}</Latex>
            </div>
        </StepCard>
    );

    const Step3 = (
        <StepCard stepNumber={3} title="Conclusione" color="amber" isActive={isActive(3)}>
            <div
                style={{
                    display: "inline-block",
                    padding: "10px 18px",
                    borderRadius: 8,
                    background: posizione === "secante" ? "#f0fdf4" : posizione === "tangente" ? "#fffbeb" : "#fef2f2",
                    border: `2px solid ${colorePos}`,
                    fontSize: 18,
                    fontWeight: 700,
                    color: colorePos,
                }}
            >
                La retta è <strong>{posizione.toUpperCase()}</strong>
            </div>
            <div style={{ marginTop: 8, fontSize: 13, color: "#64748b" }}>
                {posizione === "secante" && <Latex>{`\\Delta = ${fmt(delta)} > 0`}</Latex>}
                {posizione === "tangente" && <Latex>{`\\Delta = ${fmt(delta)} = 0`}</Latex>}
                {posizione === "esterna" && <Latex>{`\\Delta = ${fmt(delta)} < 0`}</Latex>}
            </div>
        </StepCard>
    );

    const Step4 = (
        <StepCard
            stepNumber={4}
            title={posizione === "esterna" ? "Nessun punto comune" : posizione === "tangente" ? "Punto di tangenza" : "Punti di intersezione"}
            color={posizione === "secante" ? "green" : posizione === "tangente" ? "amber" : "red"}
            isActive={isActive(4)}
            fullWidth
        >
            {/* ── ESTERNA ── */}
            {posizione === "esterna" && (
                <div style={{ color: "#991b1b", fontWeight: 600 }}>
                    <Latex>{"\\Delta < 0"}</Latex>: retta e parabola non hanno punti in comune.
                </div>
            )}

            {/* ── TANGENTE ── */}
            {posizione === "tangente" && xT !== undefined && (() => {
                const yT = m * xT + q;
                return (
                    <div>
                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>
                            Con <Latex>{"\\Delta = 0"}</Latex> c'è una sola soluzione. Ricaviamo <Latex>{"x_T"}</Latex> e poi <Latex>{"y_T"}</Latex> dalla retta:
                        </div>
                        <div style={{ background: "#fff", borderRadius: 6, padding: "8px 12px", overflowX: "auto", marginBottom: 10 }}>
                            <Latex display>{`x_T = -\\frac{${B}}{2 \\cdot (${A})} = ${fmt(xT)}`}</Latex>
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>
                            Sostituiamo <Latex>{`x_T = ${fmt(xT)}`}</Latex> nella retta per trovare <Latex>{"y_T"}</Latex>:
                        </div>
                        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: "8px 14px", overflowX: "auto", marginBottom: 10 }}>
                            <Latex display>{`\\begin{cases} ${parabolaLatex(a, b, c)} \\\\ ${rettaLatex(m, q)} \\end{cases} \\xrightarrow{x = ${fmt(xT)}} y_T = ${fmt(m)} \\cdot (${fmt(xT)}) + (${fmt(q)}) = ${fmt(yT)}`}</Latex>
                        </div>
                        <div style={{ background: "#fffbeb", border: "2px solid #f59e0b", borderRadius: 8, padding: "10px 14px", display: "inline-block" }}>
                            <div style={{ fontSize: 12, color: "#92400e", marginBottom: 4 }}>Punto di tangenza</div>
                            <Latex>{`T\\!\\left(${fmt(xT)},\\; ${fmt(yT)}\\right)`}</Latex>
                        </div>
                    </div>
                );
            })()}

            {/* ── SECANTE ── */}
            {posizione === "secante" && x1 !== undefined && x2 !== undefined && (() => {
                const y1 = m * x1 + q;
                const y2 = m * x2 + q;
                return (
                    <div>
                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>
                            Con <Latex>{"\\Delta > 0"}</Latex> ci sono due soluzioni: il sistema si sdoppia in due casi.
                        </div>
                        <div style={{ background: "#fff", borderRadius: 6, padding: "8px 12px", overflowX: "auto", marginBottom: 10 }}>
                            <Latex display>{`x_{1,2} = \\frac{-(${B}) \\pm \\sqrt{${fmt(delta)}}}{2 \\cdot (${A})} \\implies x_1 = ${fmt(x1)},\\quad x_2 = ${fmt(x2)}`}</Latex>
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
                            Sostituiamo ciascuna <Latex>{"x"}</Latex> nella retta per trovare le ordinate:
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
                            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: "8px 14px", overflowX: "auto" }}>
                                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>Sistema con <Latex>{`x_1 = ${fmt(x1)}`}</Latex></div>
                                <Latex display>{`\\begin{cases} ${parabolaLatex(a, b, c)} \\\\ ${rettaLatex(m, q)} \\end{cases} \\xrightarrow{x_1} y_1 = ${fmt(m)} \\cdot (${fmt(x1)}) + (${fmt(q)}) = ${fmt(y1)}`}</Latex>
                            </div>
                            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: "8px 14px", overflowX: "auto" }}>
                                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>Sistema con <Latex>{`x_2 = ${fmt(x2)}`}</Latex></div>
                                <Latex display>{`\\begin{cases} ${parabolaLatex(a, b, c)} \\\\ ${rettaLatex(m, q)} \\end{cases} \\xrightarrow{x_2} y_2 = ${fmt(m)} \\cdot (${fmt(x2)}) + (${fmt(q)}) = ${fmt(y2)}`}</Latex>
                            </div>
                        </div>
                        <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
                            <div style={{ background: "#f0fdf4", border: "2px solid #22c55e", borderRadius: 8, padding: "8px 14px", textAlign: "center" }}>
                                <div style={{ fontSize: 11, color: "#166534", marginBottom: 4 }}>Primo punto</div>
                                <Latex>{`P_1\\!\\left(${fmt(x1)},\\; ${fmt(y1)}\\right)`}</Latex>
                            </div>
                            <div style={{ background: "#f0fdf4", border: "2px solid #16a34a", borderRadius: 8, padding: "8px 14px", textAlign: "center" }}>
                                <div style={{ fontSize: 11, color: "#166534", marginBottom: 4 }}>Secondo punto</div>
                                <Latex>{`P_2\\!\\left(${fmt(x2)},\\; ${fmt(y2)}\\right)`}</Latex>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </StepCard>
    );

    return (
        <div>
            <div style={{ marginBottom: 12 }}>
                <GenerateButton text="Nuovo esercizio" onClick={handleGen} />
            </div>

            <ProblemCard label="Stabilisci la posizione reciproca:">
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 8, textAlign: "center" }}>
                    <div>
                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Parabola</div>
                        <Latex display>{parabolaLatex(a, b, c)}</Latex>
                    </div>
                    <div>
                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Retta</div>
                        <Latex display>{rettaLatex(m, q)}</Latex>
                    </div>
                </div>
            </ProblemCard>

            <NavigationButtons
                currentStep={currentStep}
                totalSteps={4}
                onNext={nextStep}
                onPrev={prevStep}
                onShowAll={showAll}
            />

            <div style={{ display: "grid", gap: 12, gridTemplateColumns: isMobile ? "1fr" : "auto 1fr" }}>
                <div>
                    <CartesianPlot width={svgSize} a={a} b={b} c={c} m={m} q={q} highlights={highlights} />
                </div>
                <div style={{ display: "grid", gap: 12 }}>
                    {Step1}
                    {Step2}
                </div>
            </div>
            <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
                {Step3}
                {Step4}
            </div>
        </div>
    );
}

// ─── STEPS TIPOLOGIA 2 ───────────────────────────────────────────────────────

// ── Metodo Breve (Teorema) ────────────────────────────────────────────────────
function Tipo2Breve({ eq, isMobile }: { eq: Tipo2; isMobile: boolean }) {
    const { currentStep, nextStep, prevStep, showAll } = useStepNavigation(3);
    const isActive = (n: number) => currentStep >= n - 1;
    const { a, b, c, x0, y0, mTangente, q: qTang } = eq;
    const svgSize = isMobile ? 260 : 320;

    const Step1 = (
        <StepCard stepNumber={1} title="Applica il Teorema" color="blue" isActive={isActive(1)}>
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 6, padding: "8px 14px", marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: "#1e40af", fontWeight: 700, marginBottom: 4 }}>TEOREMA — coefficiente angolare della tangente in P</div>
                <Latex>{"m = 2ax_0 + b"}</Latex>
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Sostituiamo i valori:</div>
            <div style={{ background: "#fff", borderRadius: 6, padding: "8px 12px", overflowX: "auto" }}>
                <Latex display>{`m = 2 \\cdot (${a}) \\cdot (${x0}) + (${b}) = ${fmt(mTangente)}`}</Latex>
            </div>
        </StepCard>
    );

    const Step2 = (
        <StepCard stepNumber={2} title="Calcola l'intercetta q" color="amber" isActive={isActive(2)}>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                La retta passa per P, quindi <Latex>{"q = y_0 - mx_0"}</Latex>:
            </div>
            <div style={{ background: "#fff", borderRadius: 6, padding: "8px 12px", overflowX: "auto" }}>
                <Latex display>{`q = ${fmt(y0)} - (${fmt(mTangente)}) \\cdot (${x0}) = ${fmt(qTang)}`}</Latex>
            </div>
        </StepCard>
    );

    const Step3 = (
        <StepCard stepNumber={3} title="Equazione della tangente" color="green" isActive={isActive(3)} fullWidth>
            <div style={{ background: "#f0fdf4", border: "2px solid #22c55e", borderRadius: 8, padding: "12px 18px", display: "inline-block" }}>
                <div style={{ fontSize: 12, color: "#166534", marginBottom: 4 }}>Retta tangente:</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}><Latex>{rettaLatex(mTangente, qTang)}</Latex></div>
            </div>
        </StepCard>
    );

    return (
        <div>
            <NavigationButtons currentStep={currentStep} totalSteps={3} onNext={nextStep} onPrev={prevStep} onShowAll={showAll} />
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: isMobile ? "1fr" : "auto 1fr" }}>
                <CartesianPlot width={svgSize} a={a} b={b} c={c} tangentM={mTangente} tangentN={qTang} x0={x0} y0={y0} />
                <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
                    {Step1}
                    {Step2}
                </div>
            </div>
            <div style={{ marginTop: 12 }}>{Step3}</div>

            {/* ── Enunciato dettagliato del Teorema ── */}
            <div style={{ marginTop: 24, background: "#eff6ff", border: "2px solid #3b82f6", borderRadius: 12, padding: "16px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{
                        background: "#2563eb", color: "#fff", borderRadius: 6,
                        padding: "2px 10px", fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
                    }}>
                        TEOREMA 5
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1e40af" }}>
                        Coefficiente angolare della retta tangente a una parabola in un suo punto
                    </div>
                </div>
                <div style={{ fontSize: 13, color: "#1e3a8a", marginBottom: 10, lineHeight: 1.6 }}>
                    Sia <Latex>{"P(x_0, y_0)"}</Latex> un punto che appartiene alla parabola avente equazione <Latex>{"y = ax^2 + bx + c"}</Latex>.
                    Il coefficiente angolare <Latex>{"m"}</Latex> della retta tangente alla parabola in <Latex>{"P"}</Latex> è dato dalla formula:
                </div>
                <div style={{ background: "#fff", borderRadius: 8, padding: "10px 16px", display: "inline-block", marginBottom: 16, border: "1px solid #bfdbfe", fontSize: 16 }}>
                    <Latex>{"m = 2ax_0 + b"}</Latex>
                </div>
                <div style={{ fontSize: 13, color: "#1e3a8a", marginBottom: 10, lineHeight: 1.6 }}>
                    Applicato a questo esercizio:
                </div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
                    <div style={{ background: "#fff", borderRadius: 8, padding: "10px 14px", border: "1px solid #bfdbfe" }}>
                        <div style={{ fontSize: 12, color: "#2563eb", fontWeight: 700, marginBottom: 6 }}>Passo 1 — calcola m</div>
                        <Latex display>{`m = 2 \\cdot (${a}) \\cdot (${x0}) + (${b}) = ${fmt(mTangente)}`}</Latex>
                    </div>
                    <div style={{ background: "#fff", borderRadius: 8, padding: "10px 14px", border: "1px solid #bfdbfe" }}>
                        <div style={{ fontSize: 12, color: "#2563eb", fontWeight: 700, marginBottom: 6 }}>Passo 2 — calcola q e scrivi la retta</div>
                        <Latex display>{`q = y_0 - mx_0 = ${fmt(y0)} - (${fmt(mTangente)}) \\cdot (${x0}) = ${fmt(qTang)}`}</Latex>
                        <div style={{ marginTop: 8, fontWeight: 700 }}>
                            <Latex>{rettaLatex(mTangente, qTang)}</Latex>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Metodo Generale (Δ = 0) ──────────────────────────────────────────────────
function Tipo2Generale({ eq, isMobile }: { eq: Tipo2; isMobile: boolean }) {
    const { currentStep, nextStep, prevStep, showAll } = useStepNavigation(4);
    const isActive = (n: number) => currentStep >= n - 1;
    const { a, b, c, x0, y0, mTangente, q: qTang, deltaEspanso } = eq;
    const svgSize = isMobile ? 260 : 320;

    // Quantità per il display dell'equazione in x
    const K = c - y0;
    const bMinusM = b === 0 ? "(-m)" : `(${b} - m)`;
    const mPart = x0 === 0 ? "" : x0 === 1 ? " + m" : x0 === -1 ? " - m" : x0 > 0 ? ` + ${x0}m` : ` - ${-x0}m`;
    const constTerm = x0 === 0 ? fmt(K) : `(${fmt(K)}${mPart})`;
    const aStr = a === 1 ? "" : a === -1 ? "-" : fmt(a);

    // Eq in m espansa: m² - Pm + S = 0
    // Poiché P ∈ parabola, S = (2ax₀+b)² → si fattorizza come (m - (2ax₀+b))² = 0
    const P = 2 * b + 4 * a * x0;
    const mLinear = P === 0 ? "" : P > 0 ? ` - ${fmt(P)}m` : ` + ${fmt(-P)}m`;
    const S = mTangente * mTangente; // = (2ax₀+b)²
    const mConst = S === 0 ? "" : ` + ${fmt(S)}`;
    const eqInM = `m^2${mLinear}${mConst} = 0`;

    // q in funzione di m
    const qExpr = x0 === 0 ? fmt(y0) : x0 === 1 ? `${fmt(y0)} - m` : x0 === -1 ? `${fmt(y0)} + m` : x0 > 0 ? `${fmt(y0)} - ${x0}m` : `${fmt(y0)} + ${-x0}m`;

    const Step1 = (
        <StepCard stepNumber={1} title="Retta generica per P" color="green" isActive={isActive(1)}>
            <CollapsibleExplanation title="Strategia">
                <p>Scriviamo la generica retta passante per P con <em>m</em> incognita, poi imponiamo che sia tangente alla parabola.</p>
            </CollapsibleExplanation>
            <div style={{ background: "#fff", borderRadius: 6, padding: "8px 12px", overflowX: "auto", marginBottom: 8 }}>
                <Latex display>{`y - (${fmt(y0)}) = m\\bigl[x - (${x0})\\bigr] \\implies y = mx + ${qExpr}`}</Latex>
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Sistema con la parabola:</div>
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: "8px 14px", overflowX: "auto" }}>
                <Latex display>{`\\begin{cases} ${parabolaLatex(a, b, c)} \\\\ y = mx + ${qExpr} \\end{cases}`}</Latex>
            </div>
        </StepCard>
    );

    const Step2 = (
        <StepCard stepNumber={2} title="Condizione di tangenza: Δ = 0" color="blue" isActive={isActive(2)}>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Equazione risolvente:</div>
            <div style={{ background: "#fff", borderRadius: 6, padding: "8px 12px", overflowX: "auto", marginBottom: 8 }}>
                <Latex display>{`${aStr}x^2 + ${bMinusM}x + ${constTerm} = 0`}</Latex>
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Condizione Δ = 0:</div>
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 6, padding: "8px 12px", overflowX: "auto" }}>
                <Latex display>{`(${b} - m)^2 - 4 \\cdot (${a}) \\cdot ${constTerm} = 0`}</Latex>
            </div>
        </StepCard>
    );

    const Step3 = (
        <StepCard stepNumber={3} title="Equazione in m — soluzione unica" color="amber" isActive={isActive(3)}>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Espandendo:</div>
            <div style={{ background: "#fff", borderRadius: 6, padding: "8px 12px", overflowX: "auto", marginBottom: 8 }}>
                <Latex display>{eqInM}</Latex>
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                Poiché P appartiene alla parabola, l'equazione si fattorizza come quadrato:
            </div>
            <div style={{ background: "#fff", borderRadius: 6, padding: "8px 12px", overflowX: "auto", marginBottom: 8 }}>
                <Latex display>{`\\left(m - (${fmt(mTangente)})\\right)^2 = 0 \\implies m = ${fmt(mTangente)}`}</Latex>
            </div>
            <div style={{ fontSize: 12, color: "#64748b" }}>
                Un'unica soluzione → un'unica retta tangente.
            </div>
        </StepCard>
    );

    const Step4 = (
        <StepCard stepNumber={4} title="Equazione della tangente" color="green" isActive={isActive(4)} fullWidth>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>
                Sostituiamo <Latex>{`m = ${fmt(mTangente)}`}</Latex> in <Latex>{`q = ${qExpr}`}</Latex>:
            </div>
            <div style={{ background: "#fff", borderRadius: 6, padding: "8px 12px", overflowX: "auto", marginBottom: 12 }}>
                <Latex display>{`q = ${fmt(y0)} - (${fmt(mTangente)}) \\cdot (${x0}) = ${fmt(qTang)}`}</Latex>
            </div>
            <div style={{ background: "#f0fdf4", border: "2px solid #22c55e", borderRadius: 8, padding: "12px 18px", display: "inline-block" }}>
                <div style={{ fontSize: 12, color: "#166534", marginBottom: 4 }}>Retta tangente:</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}><Latex>{rettaLatex(mTangente, qTang)}</Latex></div>
            </div>
        </StepCard>
    );

    return (
        <div>
            <NavigationButtons currentStep={currentStep} totalSteps={4} onNext={nextStep} onPrev={prevStep} onShowAll={showAll} />
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: isMobile ? "1fr" : "auto 1fr" }}>
                <CartesianPlot width={svgSize} a={a} b={b} c={c} tangentM={mTangente} tangentN={qTang} x0={x0} y0={y0} />
                <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
                    {Step1}
                    {Step2}
                </div>
            </div>
            <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
                {Step3}
                {Step4}
            </div>
        </div>
    );
}

// ── Wrapper con selettore metodo ──────────────────────────────────────────────
function Tipo2Steps({ isMobile }: { isMobile: boolean }) {
    const [metodo, setMetodo] = useState<"breve" | "generale">("breve");
    const [eq, setEq] = useState<Tipo2>(() => generateTipo2());
    const [genKey, setGenKey] = useState(0);

    const handleGen = useCallback(() => {
        setEq(generateTipo2());
        setGenKey(k => k + 1);
    }, []);

    const { a, b, c, x0, y0 } = eq;

    const btnStyle = (active: boolean): React.CSSProperties => ({
        padding: isMobile ? "7px 14px" : "8px 18px",
        borderRadius: 8,
        border: "2px solid",
        borderColor: active ? "#2563eb" : "#e2e8f0",
        background: active ? "#eff6ff" : "#fff",
        color: active ? "#1d4ed8" : "#475569",
        fontWeight: active ? 700 : 400,
        cursor: "pointer",
        fontSize: isMobile ? 12 : 13,
        transition: "all 0.15s",
    });

    return (
        <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
                <GenerateButton text="Nuovo esercizio" onClick={handleGen} />
            </div>

            <ProblemCard label="Trova la retta tangente alla parabola nel punto P:">
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 8, textAlign: "center" }}>
                    <div>
                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Parabola</div>
                        <Latex display>{parabolaLatex(a, b, c)}</Latex>
                    </div>
                    <div>
                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Punto (sulla parabola)</div>
                        <Latex display>{`P\\left(${x0},\\;${fmt(y0)}\\right)`}</Latex>
                    </div>
                </div>
            </ProblemCard>

            {/* Selettore metodo */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, marginTop: 4 }}>
                <button style={btnStyle(metodo === "breve")} onClick={() => setMetodo("breve")}>
                    Metodo breve (Teorema)
                </button>
                <button style={btnStyle(metodo === "generale")} onClick={() => setMetodo("generale")}>
                    Metodo generale (Δ = 0)
                </button>
            </div>

            {metodo === "breve"
                ? <Tipo2Breve key={`b-${genKey}`} eq={eq} isMobile={isMobile} />
                : <Tipo2Generale key={`g-${genKey}`} eq={eq} isMobile={isMobile} />
            }
        </div>
    );
}

// ─── TIPOLOGIA 3: Retta tangente da punto esterno ────────────────────────────
// Punto P(x₀,y₀) esterno alla parabola → due rette tangenti
// Metodo: q = y₀ - mx₀ → sostituisci nella parabola → Δ=0 → eq. di 2° grado in m

interface Tipo3 {
    a: number; b: number; c: number;  // parabola
    x0: number; y0: number;           // punto esterno
    // equazione in m: m² - Pm + S = 0
    P: number; S: number; deltaM: number;
    m1: number; m2: number;
    q1: number; q2: number;
}

function generateTipo3(): Tipo3 {
    // Usiamo a = ±1 e offset quadrato perfetto per soluzioni intere
    const a = randomChoice([1, -1]);
    const b = randomInt(-3, 3);
    const c = randomInt(-4, 4);
    const x0 = randomInt(-3, 3);
    const f0 = a * x0 ** 2 + b * x0 + c;

    // offset quadrato perfetto: 1 o 4 → sqrtDeltaM = 4 o 8
    const offset = randomChoice([1, 4]);
    // Per a>0 il punto esterno (che ammette 2 tangenti) sta sotto la parabola
    // Per a<0 sta sopra
    const y0 = a > 0 ? f0 - offset : f0 + offset;

    // Equazione in m: m² - Pm + S = 0
    // P = 2b + 4ax₀, S = b² - 4ac + 4ay₀
    const P = 2 * b + 4 * a * x0;
    const S = b ** 2 - 4 * a * c + 4 * a * y0;
    const deltaM = P ** 2 - 4 * S; // = 16a(f0 - y0) > 0 per costruzione

    const sqrtDM = Math.sqrt(Math.abs(deltaM));
    const m1 = (P - sqrtDM) / 2;
    const m2 = (P + sqrtDM) / 2;
    const q1 = y0 - m1 * x0;
    const q2 = y0 - m2 * x0;

    return { a, b, c, x0, y0, P, S, deltaM, m1, m2, q1, q2 };
}

function Tipo3Steps({ isMobile }: { isMobile: boolean }) {
    const { currentStep, nextStep, prevStep, showAll, reset } = useStepNavigation(4);
    const isActive = (n: number) => currentStep >= n - 1;

    const [eq, setEq] = useState<Tipo3>(() => generateTipo3());
    const handleGen = useCallback(() => {
        setEq(generateTipo3());
        reset();
    }, [reset]);

    const { a, b, c, x0, y0, P, S, deltaM, m1, m2, q1, q2 } = eq;
    const svgSize = isMobile ? 260 : 320;

    // Punto di tangenza di ciascuna retta
    const xt1 = (m1 - b) / (2 * a);
    const yt1 = m1 * xt1 + q1;
    const xt2 = (m2 - b) / (2 * a);
    const yt2 = m2 * xt2 + q2;

    // ── Helper per LaTeX dell'equazione in x ──────────────────────────────
    // Equazione: ax² + (b-m)x + (c - y₀ + mx₀) = 0
    // Coefficiente di x: (b - m)  → mostriamo come "(B - m)" con B = b
    // Termine noto: K + x₀·m  dove K = c - y₀

    const K = c - y0; // termine costante dopo la sostituzione di q

    // "(b - m)" per il coefficiente di x
    const bMinusM = b === 0 ? "(-m)" : `(${b} - m)`;

    // "(K + x₀m)" per il termine noto — con gestione segni
    const mPart = x0 === 0 ? "" : x0 === 1 ? " + m" : x0 === -1 ? " - m" : x0 > 0 ? ` + ${x0}m` : ` - ${-x0}m`;
    const constTerm = x0 === 0 ? fmt(K) : `(${fmt(K)}${mPart})`;

    // Δ in forma non espansa: (b-m)² - 4a·(K + x₀m) = 0
    const deltaRaw = `(${b} - m)^2 - 4 \\cdot ${a === 1 ? "" : a === -1 ? "(-1) \\cdot " : `(${a}) \\cdot `}${constTerm} = 0`;

    // Equazione in m espansa: m² - Pm + S = 0 (con segni corretti)
    const mLinear = P === 0 ? "" : P > 0 ? ` - ${fmt(P)}m` : ` + ${fmt(-P)}m`;
    const mConst = S === 0 ? "" : S > 0 ? ` + ${fmt(S)}` : ` - ${fmt(-S)}`;
    const eqInM = `m^2${mLinear}${mConst} = 0`;

    // ── Step 1 ─────────────────────────────────────────────────────────────
    // Scriviamo l'equazione della retta generica passante per P
    // y - y₀ = m(x - x₀)  →  y = mx + q  con q = y₀ - mx₀
    const y0Str = y0 < 0 ? `(${fmt(y0)})` : fmt(y0);
    const x0Str = x0 < 0 ? `(${x0})` : `${x0}`;
    // q esplicita: y₀ - mx₀  come espressione in m
    const qExpr = x0 === 0 ? fmt(y0) : x0 === 1 ? `${fmt(y0)} - m` : x0 === -1 ? `${fmt(y0)} + m` : x0 > 0 ? `${fmt(y0)} - ${x0}m` : `${fmt(y0)} + ${-x0}m`;

    const Step1 = (
        <StepCard stepNumber={1} title="Retta generica passante per P" color="green" isActive={isActive(1)}>
            <CollapsibleExplanation title="Come si scrive la retta?">
                <p>Ogni retta passante per il punto P ha equazione <Latex>{"y - y_0 = m(x - x_0)"}</Latex> con <em>m</em> parametro libero (il coefficiente angolare).</p>
                <p>Portando tutto a destra otteniamo la forma esplicita con <em>q</em> che dipende da <em>m</em>.</p>
            </CollapsibleExplanation>
            <div style={{ background: "#fff", borderRadius: 6, padding: "8px 12px", overflowX: "auto" }}>
                <Latex display>{`y - ${y0Str} = m\\bigl[x - ${x0Str}\\bigr] \\implies y = mx + ${qExpr}`}</Latex>
            </div>
            <div style={{ marginTop: 6, fontSize: 13, color: "#64748b" }}>
                cioè <Latex>{"y = mx + q"}</Latex> con <Latex>{`q = ${qExpr}`}</Latex>
            </div>
        </StepCard>
    );

    // ── Step 2 ─────────────────────────────────────────────────────────────
    // Sistema parabola + retta → equazione in x → condizione Δ = 0
    const aStr = a === 1 ? "" : a === -1 ? "-" : fmt(a);

    const Step2 = (
        <StepCard stepNumber={2} title="Sistema e condizione di tangenza" color="blue" isActive={isActive(2)}>
            <CollapsibleExplanation title="Perché Δ = 0?">
                <p>La retta è tangente se il sistema ha <em>una sola</em> soluzione in x, cioè il discriminante dell'equazione risolvente è nullo.</p>
                <p>Imponendo Δ = 0 otteniamo un'equazione in m: le sue <strong>due soluzioni</strong> danno i coefficienti angolari delle due rette tangenti cercate.</p>
            </CollapsibleExplanation>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Sistema:</div>
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: "8px 14px", overflowX: "auto", marginBottom: 8 }}>
                <Latex display>{`\\begin{cases} ${parabolaLatex(a, b, c)} \\\\ y = mx + ${qExpr} \\end{cases}`}</Latex>
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Sostituendo si ottiene l'equazione risolvente:</div>
            <div style={{ background: "#fff", borderRadius: 6, padding: "8px 12px", overflowX: "auto", marginBottom: 8 }}>
                <Latex display>{`${aStr}x^2 + ${bMinusM}x + ${constTerm} = 0`}</Latex>
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Condizione di tangenza (Δ = 0):</div>
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 6, padding: "8px 12px", overflowX: "auto" }}>
                <Latex display>{deltaRaw}</Latex>
            </div>
        </StepCard>
    );

    // ── Step 3 ─────────────────────────────────────────────────────────────
    // Espandiamo e risolviamo l'equazione in m
    const sqrtDM = Math.sqrt(Math.abs(deltaM));

    const Step3 = (
        <StepCard stepNumber={3} title="Risoluzione dell'equazione in m" color="amber" isActive={isActive(3)}>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Espandendo:</div>
            <div style={{ background: "#fff", borderRadius: 6, padding: "8px 12px", overflowX: "auto", marginBottom: 8 }}>
                <Latex display>{eqInM}</Latex>
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Discriminante:</div>
            <div style={{ background: "#fff", borderRadius: 6, padding: "8px 12px", overflowX: "auto", marginBottom: 8 }}>
                <Latex display>{`\\Delta_m = ${P < 0 ? `(-${-P})` : P}^2 - 4 \\cdot (${fmt(S)}) = ${P*P} - ${fmt(4*S)} = ${fmt(deltaM)}`}</Latex>
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Due soluzioni:</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div style={{ background: "#fffbeb", border: "2px solid #f59e0b", borderRadius: 6, padding: "8px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#92400e", marginBottom: 4 }}>Retta 1</div>
                    <Latex>{`m_1 = ${fmt(m1)}`}</Latex>
                </div>
                <div style={{ background: "#faf5ff", border: "2px solid #a855f7", borderRadius: 6, padding: "8px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#6b21a8", marginBottom: 4 }}>Retta 2</div>
                    <Latex>{`m_2 = ${fmt(m2)}`}</Latex>
                </div>
            </div>
        </StepCard>
    );

    // ── Step 4 ─────────────────────────────────────────────────────────────
    // Sostituiamo m₁ e m₂ in y = mx + q

    const Step4 = (
        <StepCard stepNumber={4} title="Le due rette tangenti" color="green" isActive={isActive(4)} fullWidth>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
                Sostituiamo i valori di m in <Latex>{`y = mx + q`}</Latex> con <Latex>{`q = ${qExpr}`}</Latex>:
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
                <div style={{ background: "#fffbeb", border: "2px solid #f59e0b", borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ fontSize: 12, color: "#92400e", marginBottom: 6, fontWeight: 600 }}>Retta tangente 1  (m₁ = {fmt(m1)})</div>
                    <div style={{ overflowX: "auto", marginBottom: 6 }}>
                        <Latex display>{`q_1 = ${fmt(y0)} - (${fmt(m1)}) \\cdot ${x0Str} = ${fmt(q1)}`}</Latex>
                    </div>
                    <div style={{ fontWeight: 700, overflowX: "auto", fontSize: 15 }}>
                        <Latex>{rettaLatex(m1, q1)}</Latex>
                    </div>
                    <div style={{ marginTop: 6, fontSize: 11, color: "#92400e" }}>
                        tocca la parabola in <Latex>{`T_1\\bigl(${fmt(xt1)},\\,${fmt(yt1)}\\bigr)`}</Latex>
                    </div>
                </div>
                <div style={{ background: "#faf5ff", border: "2px solid #a855f7", borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ fontSize: 12, color: "#6b21a8", marginBottom: 6, fontWeight: 600 }}>Retta tangente 2  (m₂ = {fmt(m2)})</div>
                    <div style={{ overflowX: "auto", marginBottom: 6 }}>
                        <Latex display>{`q_2 = ${fmt(y0)} - (${fmt(m2)}) \\cdot ${x0Str} = ${fmt(q2)}`}</Latex>
                    </div>
                    <div style={{ fontWeight: 700, overflowX: "auto", fontSize: 15 }}>
                        <Latex>{rettaLatex(m2, q2)}</Latex>
                    </div>
                    <div style={{ marginTop: 6, fontSize: 11, color: "#6b21a8" }}>
                        tocca la parabola in <Latex>{`T_2\\bigl(${fmt(xt2)},\\,${fmt(yt2)}\\bigr)`}</Latex>
                    </div>
                </div>
            </div>
        </StepCard>
    );

    return (
        <div>
            <div style={{ marginBottom: 12 }}>
                <GenerateButton text="Nuovo esercizio" onClick={handleGen} />
            </div>

            <ProblemCard label="Trova le rette tangenti alla parabola passanti per il punto esterno P:">
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 8, textAlign: "center" }}>
                    <div>
                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Parabola</div>
                        <Latex display>{parabolaLatex(a, b, c)}</Latex>
                    </div>
                    <div>
                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Punto esterno</div>
                        <Latex display>{`P\\left(${x0},\\;${fmt(y0)}\\right)`}</Latex>
                    </div>
                </div>
            </ProblemCard>

            <NavigationButtons
                currentStep={currentStep}
                totalSteps={4}
                onNext={nextStep}
                onPrev={prevStep}
                onShowAll={showAll}
            />

            <div style={{ display: "grid", gap: 12, gridTemplateColumns: isMobile ? "1fr" : "auto 1fr" }}>
                <div>
                    <CartesianPlot
                        width={svgSize}
                        a={a} b={b} c={c}
                        tangentM={m1} tangentN={q1}
                        tangentM2={m2} tangentN2={q2}
                        x0={x0} y0={y0}
                        highlights={[
                            { x: xt1, y: yt1, color: "#f59e0b", label: "T₁" },
                            { x: xt2, y: yt2, color: "#a855f7", label: "T₂" },
                        ]}
                    />
                </div>
                <div style={{ display: "grid", gap: 12 }}>
                    {Step1}
                    {Step2}
                </div>
            </div>
            <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
                {Step3}
                {Step4}
            </div>

            {/* ── Riepilogo a blocchi ── */}
            <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Schema del metodo
                </div>
                <div style={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    alignItems: isMobile ? "stretch" : "center",
                    gap: 0,
                    overflowX: isMobile ? "visible" : "auto",
                }}>
                    {/* Blocco 1 */}
                    <SchemaBlocco colore="#fef08a" bordo="#ca8a04">
                        <div style={{ marginBottom: 6, lineHeight: 1.4 }}>
                            Si scrive la generica retta passante per <Latex>{"P(x_0, y_0)"}</Latex>:
                        </div>
                        <div style={{ color: "#92400e", fontWeight: 700 }}>
                            <Latex>{"y - y_0 = m(x - x_0)"}</Latex>
                        </div>
                    </SchemaBlocco>

                    <SchemaFreccia vertical={isMobile} />

                    {/* Blocco 2 */}
                    <SchemaBlocco colore="#fef08a" bordo="#ca8a04">
                        <div style={{ marginBottom: 6, lineHeight: 1.4 }}>
                            La si pone a sistema con l'equazione della parabola:
                        </div>
                        <div style={{ color: "#92400e", fontWeight: 700 }}>
                            <Latex display>{`\\begin{cases} y - y_0 = m(x-x_0) \\\\ y = ax^2+bx+c \\end{cases}`}</Latex>
                        </div>
                    </SchemaBlocco>

                    <SchemaFreccia vertical={isMobile} />

                    {/* Blocco 3 */}
                    <SchemaBlocco colore="#fef08a" bordo="#ca8a04">
                        <div style={{ marginBottom: 6, lineHeight: 1.4 }}>
                            Si impone la <strong>condizione di tangenza</strong>, ossia che il discriminante dell'equazione risolvente sia nullo:
                        </div>
                        <div style={{ color: "#92400e", fontWeight: 700, fontSize: 16 }}>
                            <Latex>{"\\Delta = 0"}</Latex>
                        </div>
                    </SchemaBlocco>

                    <SchemaFreccia vertical={isMobile} />

                    {/* Blocco 4 */}
                    <SchemaBlocco colore="#fef08a" bordo="#ca8a04">
                        <div style={{ marginBottom: 6, lineHeight: 1.4 }}>
                            Si risolve l'equazione in <em>m</em>, che fornisce due soluzioni <Latex>{"m_1"}</Latex> e <Latex>{"m_2"}</Latex>. Le tangenti sono:
                        </div>
                        <div style={{ color: "#92400e", fontWeight: 700 }}>
                            <Latex>{"y - y_0 = m_1(x - x_0)"}</Latex>
                        </div>
                        <div style={{ color: "#92400e", fontWeight: 700 }}>
                            <Latex>{"y - y_0 = m_2(x - x_0)"}</Latex>
                        </div>
                    </SchemaBlocco>
                </div>
            </div>
        </div>
    );
}

// ─── Componenti schema a blocchi ─────────────────────────────────────────────

function SchemaBlocco({ colore, bordo, children }: { colore: string; bordo: string; children: React.ReactNode }) {
    return (
        <div style={{
            flex: 1,
            minWidth: 160,
            background: colore,
            border: `2px solid ${bordo}`,
            borderRadius: 10,
            padding: "14px 14px",
            fontSize: 13,
            color: "#1e293b",
            boxShadow: "2px 2px 6px rgba(0,0,0,0.08)",
        }}>
            {children}
        </div>
    );
}

function SchemaFreccia({ vertical }: { vertical: boolean }) {
    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: vertical ? "4px 0" : "0 4px",
            flexShrink: 0,
        }}>
            <svg width={vertical ? 24 : 32} height={vertical ? 32 : 24} viewBox={vertical ? "0 0 24 32" : "0 0 32 24"}>
                {vertical ? (
                    <>
                        <line x1="12" y1="2" x2="12" y2="24" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
                        <polygon points="12,30 7,20 17,20" fill="#2563eb" />
                    </>
                ) : (
                    <>
                        <line x1="2" y1="12" x2="24" y2="12" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
                        <polygon points="30,12 20,7 20,17" fill="#2563eb" />
                    </>
                )}
            </svg>
        </div>
    );
}

// ─── COMPONENTE PRINCIPALE ───────────────────────────────────────────────────

type TabId = "tipo1" | "tipo2" | "tipo3";

export default function RettaParabolaDemo() {
    const { isMobile } = useBreakpoint();
    const [tab, setTab] = useState<TabId>("tipo1");

    const [eq1] = useState<Tipo1>(() => generateTipo1());

    const tabs = [
        {
            id: "tipo1",
            label: isMobile ? "Posizione" : "Posizione reciproca",
            content: <Tipo1Steps eq={eq1} isMobile={isMobile} />,
        },
        {
            id: "tipo2",
            label: isMobile ? "Tang. su P" : "Tangente in P ∈ parabola",
            content: <Tipo2Steps isMobile={isMobile} />,
        },
        {
            id: "tipo3",
            label: isMobile ? "Tang. da P" : "Tangenti da P esterno",
            content: <Tipo3Steps isMobile={isMobile} />,
        },
    ];

    const MethodBox = (
        <InfoBox title="Schema del metodo">
            <div style={{ fontSize: 13 }}>
                <strong>Posizione reciproca:</strong>
                <ol style={{ margin: "4px 0 12px", paddingLeft: 18 }}>
                    <li>Sostituisci la retta nella parabola → equazione in x</li>
                    <li>Calcola <Latex>{"\\Delta = (b-m)^2 - 4a(c-q)"}</Latex></li>
                    <li><Latex>{"\\Delta > 0"}</Latex> → secante, <Latex>{"\\Delta = 0"}</Latex> → tangente, <Latex>{"\\Delta < 0"}</Latex> → esterna</li>
                </ol>
                <strong>Tangente in P ∈ parabola:</strong>
                <ol style={{ margin: "4px 0 12px", paddingLeft: 18 }}>
                    <li><Latex>{"q = y_0 - mx_0"}</Latex> → sostituisci → imponi <Latex>{"\\Delta = 0"}</Latex></li>
                    <li>Eq. in m ha un'unica soluzione (P ∈ parabola)</li>
                    <li>Scrivi <Latex>{"y = mx + q"}</Latex></li>
                </ol>
                <strong>Tangenti da P esterno:</strong>
                <ol style={{ margin: "4px 0", paddingLeft: 18 }}>
                    <li><Latex>{"q = y_0 - mx_0"}</Latex> → sostituisci → imponi <Latex>{"\\Delta_x = 0"}</Latex></li>
                    <li>Eq. in m ha <strong>due soluzioni</strong> m₁, m₂ → due tangenti</li>
                    <li>Calcola q₁ e q₂, scrivi le due rette</li>
                </ol>
            </div>
        </InfoBox>
    );

    return (
        <DemoContainer
            title="La Retta e la Parabola (step by step)"
            description="Posizione reciproca e retta tangente con il metodo del discriminante"
        >
            {/* Tab selector */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                {tabs.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id as TabId)}
                        style={{
                            padding: isMobile ? "8px 14px" : "10px 20px",
                            borderRadius: 8,
                            border: "2px solid",
                            borderColor: tab === t.id ? "#3b82f6" : "#e2e8f0",
                            background: tab === t.id ? "#eff6ff" : "#fff",
                            color: tab === t.id ? "#1d4ed8" : "#475569",
                            fontWeight: tab === t.id ? 700 : 400,
                            cursor: "pointer",
                            fontSize: isMobile ? 13 : 14,
                            transition: "all 0.15s",
                        }}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {tabs.find(t => t.id === tab)?.content}

            <div style={{ marginTop: 20 }}>
                {MethodBox}
            </div>
        </DemoContainer>
    );
}
