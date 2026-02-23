/**
 * ParabolaDemo — Parabola come luogo geometrico e sue equazioni
 * Tab 1: Luogo geometrico (fuoco + direttrice)
 * Tab 2: y = ax² + bx + c  (asse ∥ asse y)
 * Tab 3: x = ay² + by + c  (asse ∥ asse x)
 */

import React, { useState } from "react";
import {
    Latex,
    DemoContainer,
    useBreakpoint,
    SwipeableTabs,
    CollapsiblePanel,
} from "../../components/ui";
import { CollapsibleExplanation } from "../../components/ui/CollapsibleExplanation";

// ─── helpers ───────────────────────────────────────────────────────────────

function clamp(v: number, lo: number, hi: number) {
    return Math.min(Math.max(v, lo), hi);
}

/** Formatta un numero senza zeri finali inutili (max d decimali) */
function fmt(n: number, d = 2): string {
    const r = Math.round(n * 10 ** d) / 10 ** d;
    if (Number.isInteger(r)) return r.toString();
    return r.toFixed(d).replace(/\.?0+$/, "");
}

/** Formatta come stringa con segno per uso in equazioni */
function fmtSign(n: number, d = 2): string {
    if (n === 0) return "";
    return n > 0 ? ` + ${fmt(n, d)}` : ` - ${fmt(-n, d)}`;
}

/** Formatta la parte ax² per LaTeX */
function fmtA(a: number, var_: string): string {
    if (a === 1) return `${var_}`;
    if (a === -1) return `-${var_}`;
    return `${fmt(a)}${var_}`;
}

/** Produce la stringa LaTeX di y = ax² + bx + c */
function latexY(a: number, b: number, c: number): string {
    let s = fmtA(a, "x^2");
    if (b !== 0) {
        const bAbs = Math.abs(b);
        const bStr = bAbs === 1 ? "" : fmt(bAbs);
        s += b > 0 ? ` + ${bStr}x` : ` - ${bStr}x`;
    }
    if (c !== 0) s += fmtSign(c);
    return `y = ${s}`;
}

/** Produce la stringa LaTeX di x = ay² + by + c */
function latexX(a: number, b: number, c: number): string {
    let s = fmtA(a, "y^2");
    if (b !== 0) {
        const bAbs = Math.abs(b);
        const bStr = bAbs === 1 ? "" : fmt(bAbs);
        s += b > 0 ? ` + ${bStr}y` : ` - ${bStr}y`;
    }
    if (c !== 0) s += fmtSign(c);
    return `x = ${s}`;
}

// ─── slider ────────────────────────────────────────────────────────────────

interface SliderProps {
    label: string;
    symbol: string;
    value: number;
    min: number;
    max: number;
    step: number;
    color: string;
    displayValue: string;
    onChange: (v: number) => void;
    disabled?: boolean;
}

function PSlider({ label, symbol, value, min, max, step, color, displayValue, onChange, disabled = false }: SliderProps) {
    const pct = ((clamp(value, min, max) - min) / (max - min)) * 100;
    return (
        <div style={{
            padding: "10px 14px", background: "#fff", borderRadius: 10,
            border: `2px solid ${disabled ? "#e2e8f0" : color}`, opacity: disabled ? 0.5 : 1,
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 26, height: 26, borderRadius: "50%",
                        background: color, color: "#fff", fontWeight: 700, fontSize: 13,
                    }}>{symbol}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{label}</span>
                </span>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{displayValue}</span>
            </div>
            <input
                type="range" min={min} max={max} step={step} value={clamp(value, min, max)}
                disabled={disabled}
                onChange={e => onChange(parseFloat(e.target.value))}
                style={{
                    width: "100%", height: 8, borderRadius: 4, appearance: "none",
                    background: `linear-gradient(to right, ${color} ${pct}%, #e2e8f0 ${pct}%)`,
                    outline: "none", cursor: disabled ? "not-allowed" : "pointer", accentColor: color,
                }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#94a3b8", marginTop: 3 }}>
                <span>{min}</span><span>{max}</span>
            </div>
        </div>
    );
}

// ─── piano cartesiano SVG base ──────────────────────────────────────────────

interface ViewCfg {
    w: number; h: number;
    xMin: number; xMax: number;
    yMin: number; yMax: number;
    padL?: number; padR?: number; padT?: number; padB?: number;
}

function mkPlane(cfg: ViewCfg) {
    const padL = cfg.padL ?? 48;
    const padR = cfg.padR ?? 24;
    const padT = cfg.padT ?? 24;
    const padB = cfg.padB ?? 38;
    const plotW = cfg.w - padL - padR;
    const plotH = cfg.h - padT - padB;
    const toX = (x: number) => padL + ((x - cfg.xMin) / (cfg.xMax - cfg.xMin)) * plotW;
    const toY = (y: number) => padT + ((cfg.yMax - y) / (cfg.yMax - cfg.yMin)) * plotH;
    return { toX, toY, padL, padR, padT, padB, plotW, plotH };
}

interface PlaneGridProps {
    cfg: ViewCfg;
    xStep?: number;
    yStep?: number;
}

function PlaneGrid({ cfg, xStep = 1, yStep = 1 }: PlaneGridProps) {
    const { toX, toY, padL, padR, padT, padB, plotW, plotH } = mkPlane(cfg);
    const { w, h, xMin, xMax, yMin, yMax } = cfg;

    const xs: number[] = [];
    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax + 1e-9; x += xStep)
        xs.push(Math.round(x * 1000) / 1000);

    const ys: number[] = [];
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax + 1e-9; y += yStep)
        ys.push(Math.round(y * 1000) / 1000);

    const fs = 10;

    return (
        <>
            {/* Background */}
            <rect x={0} y={0} width={w} height={h} rx={8} fill="#fafafa" />

            {/* Grid */}
            <g stroke="#e5e7eb" strokeWidth={1}>
                {xs.map(x => <line key={`gx${x}`} x1={toX(x)} y1={padT} x2={toX(x)} y2={padT + plotH} />)}
                {ys.map(y => <line key={`gy${y}`} x1={padL} y1={toY(y)} x2={padL + plotW} y2={toY(y)} />)}
            </g>

            {/* Axes */}
            <line x1={padL} y1={toY(0)} x2={w - padR} y2={toY(0)} stroke="#334155" strokeWidth={2} />
            <line x1={toX(0)} y1={padT} x2={toX(0)} y2={h - padB} stroke="#334155" strokeWidth={2} />

            {/* Arrow heads */}
            <polygon points={`${w - padR},${toY(0)} ${w - padR - 8},${toY(0) - 4} ${w - padR - 8},${toY(0) + 4}`} fill="#334155" />
            <polygon points={`${toX(0)},${padT} ${toX(0) - 4},${padT + 8} ${toX(0) + 4},${padT + 8}`} fill="#334155" />

            {/* Axis labels */}
            <text x={w - padR + 4} y={toY(0) + 4} fontSize={12} fill="#334155" fontStyle="italic">x</text>
            <text x={toX(0) + 5} y={padT - 6} fontSize={12} fill="#334155" fontStyle="italic">y</text>

            {/* Tick labels */}
            {xs.filter(x => x !== 0 && toX(x) > padL + 10 && toX(x) < w - padR - 10).map(x => (
                <text key={`xl${x}`} x={toX(x)} y={toY(0) + 14} fontSize={fs} fill="#94a3b8" textAnchor="middle">{x}</text>
            ))}
            {ys.filter(y => y !== 0 && toY(y) > padT + 4 && toY(y) < h - padB - 4).map(y => (
                <text key={`yl${y}`} x={toX(0) - 5} y={toY(y) + 4} fontSize={fs} fill="#94a3b8" textAnchor="end">{y}</text>
            ))}
            <text x={toX(0) - 6} y={toY(0) + 14} fontSize={fs} fill="#94a3b8" textAnchor="end">O</text>
        </>
    );
}

// ─── riquadro proprietà ─────────────────────────────────────────────────────

interface PropRow { label: string; value: string; color?: string; }

function PropsBox({ rows }: { rows: PropRow[] }) {
    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: "6px 14px",
            padding: "12px 16px",
            background: "#fff",
            borderRadius: 10,
            border: "1px solid #e2e8f0",
            fontSize: 13,
        }}>
            {rows.map(({ label, value, color = "#0f172a" }) => (
                <React.Fragment key={label}>
                    <span style={{ color: "#64748b", fontWeight: 600, whiteSpace: "nowrap" }}>{label}</span>
                    <span style={{ color, fontWeight: 700, fontFamily: "monospace" }}>{value}</span>
                </React.Fragment>
            ))}
        </div>
    );
}

// ─── TAB 1: Luogo geometrico ────────────────────────────────────────────────

function Tab1({ isMobile }: { isMobile: boolean }) {
    const [p, setP] = useState(1.5);      // distanza vertice–fuoco
    const [xP, setXP] = useState(2.5);   // x del punto P sulla parabola

    const w = isMobile ? 340 : 480;
    const h = isMobile ? 270 : 350;

    // Range asse y: deve contenere fuoco e punto P
    const pyMax = xP * xP / (4 * p);
    const yMax = Math.ceil(Math.max(pyMax + 1.5, p * 2 + 0.5, 5));
    const yMin = Math.floor(-p - 0.8);
    const xMin = -5, xMax = 5;

    const cfg: ViewCfg = { w, h, xMin, xMax, yMin, yMax };
    const { toX, toY } = mkPlane(cfg);

    // Parabola y = x²/(4p)
    const parabPts: string[] = [];
    const N = 300;
    for (let i = 0; i <= N; i++) {
        const x = xMin + (i / N) * (xMax - xMin);
        const y = x * x / (4 * p);
        parabPts.push(`${toX(x)},${toY(y)}`);
    }

    // Punto P, fuoco F, piede D
    const px = clamp(xP, xMin + 0.1, xMax - 0.1);
    const py = px * px / (4 * p);
    const fx = 0, fy = p;
    const dx = px, dy = -p; // piede della perpendicolare alla direttrice

    const distPF = Math.sqrt((px - fx) ** 2 + (py - fy) ** 2);
    const distPD = py - dy; // = py + p (sempre uguale a distPF)

    const yStep = yMax - yMin > 12 ? 2 : 1;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* SVG */}
            <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ maxWidth: w, display: "block", margin: "0 auto" }}>
                <PlaneGrid cfg={cfg} xStep={1} yStep={yStep} />

                {/* Direttrice d: y = -p */}
                <line
                    x1={toX(xMin)} y1={toY(-p)}
                    x2={toX(xMax)} y2={toY(-p)}
                    stroke="#9333ea" strokeWidth={2} strokeDasharray="7,4"
                />
                <text x={toX(xMax) - 5} y={toY(-p) - 7} fontSize={11} fill="#9333ea" textAnchor="end" fontWeight="bold">
                    d: y = {fmt(-p)}
                </text>

                {/* Parabola */}
                <polyline points={parabPts.join(" ")} fill="none" stroke="#2563eb" strokeWidth={2.8} />

                {/* PF (distanza da F) */}
                <line
                    x1={toX(px)} y1={toY(py)} x2={toX(fx)} y2={toY(fy)}
                    stroke="#ef4444" strokeWidth={2} strokeDasharray="6,3"
                />
                {/* PD (distanza da direttrice) */}
                <line
                    x1={toX(px)} y1={toY(py)} x2={toX(dx)} y2={toY(dy)}
                    stroke="#16a34a" strokeWidth={2} strokeDasharray="6,3"
                />

                {/* Simbolo angolo retto su D */}
                <rect x={toX(dx) + 2} y={toY(dy) - 10} width={8} height={8}
                    fill="none" stroke="#9333ea" strokeWidth={1.5} />

                {/* Piede D */}
                <circle cx={toX(dx)} cy={toY(dy)} r={4} fill="#9333ea" />

                {/* Fuoco F */}
                <circle cx={toX(fx)} cy={toY(fy)} r={7} fill="#ef4444" stroke="#fff" strokeWidth={2} />
                <text x={toX(fx) + 10} y={toY(fy) - 7} fontSize={12} fill="#ef4444" fontWeight="bold">
                    F(0; {fmt(p)})
                </text>

                {/* Vertice V */}
                <circle cx={toX(0)} cy={toY(0)} r={5} fill="#2563eb" stroke="#fff" strokeWidth={2} />
                <text x={toX(0) + 8} y={toY(0) - 8} fontSize={11} fill="#2563eb" fontWeight="bold">V</text>

                {/* Punto P */}
                <circle cx={toX(px)} cy={toY(py)} r={7} fill="#f97316" stroke="#fff" strokeWidth={2} />
                <text x={toX(px) + 10} y={toY(py) - 6} fontSize={11} fill="#f97316" fontWeight="bold">
                    P({fmt(px, 1)}; {fmt(py, 2)})
                </text>

                {/* Label |PF| */}
                <text
                    x={(toX(px) + toX(fx)) / 2 + 8}
                    y={(toY(py) + toY(fy)) / 2 - 4}
                    fontSize={11} fill="#ef4444" fontWeight="bold"
                >
                    {fmt(distPF, 3)}
                </text>
                {/* Label |PD| */}
                <text
                    x={toX(px) + 7}
                    y={(toY(py) + toY(dy)) / 2 + 4}
                    fontSize={11} fill="#16a34a" fontWeight="bold"
                >
                    {fmt(distPD, 3)}
                </text>

                {/* Asse di simmetria */}
                <line
                    x1={toX(0)} y1={toY(yMin)} x2={toX(0)} y2={toY(yMax)}
                    stroke="#94a3b8" strokeWidth={1} strokeDasharray="3,3"
                />
            </svg>

            {/* Badge |PF| = |PD| */}
            <div style={{
                padding: "10px 16px", background: "#f0fdf4", borderRadius: 8,
                border: "2px solid #86efac",
                display: "flex", gap: 12, justifyContent: "center", alignItems: "center", flexWrap: "wrap",
            }}>
                <span style={{ fontSize: 14, color: "#ef4444", fontWeight: 700 }}>|PF| = {fmt(distPF, 4)}</span>
                <span style={{ fontSize: 20, color: "#334155" }}>=</span>
                <span style={{ fontSize: 14, color: "#16a34a", fontWeight: 700 }}>|PD| = {fmt(distPD, 4)}</span>
            </div>

            {/* Sliders */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <PSlider
                    label="Distanza vertice–fuoco" symbol="p"
                    value={p} min={0.5} max={3} step={0.05}
                    displayValue={`p = ${fmt(p)}`} color="#ef4444"
                    onChange={setP}
                />
                <PSlider
                    label="Ascissa del punto P" symbol="x"
                    value={xP} min={-4.5} max={4.5} step={0.1}
                    displayValue={`x = ${fmt(xP, 1)}`} color="#f97316"
                    onChange={setXP}
                />
            </div>

            {/* Formule */}
            <div style={{ padding: "12px 16px", background: "#eff6ff", borderRadius: 8, border: "1px solid #bfdbfe" }}>
                <div style={{ fontSize: 12, color: "#1e40af", marginBottom: 4 }}>Equazione canonica (vertice nell'origine):</div>
                <Latex display>{`x^2 = 4p \\cdot y \\quad \\Leftrightarrow \\quad y = \\frac{x^2}{4p}`}</Latex>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
                    Con p = {fmt(p)}: &nbsp; <em>y = x² / {fmt(4 * p)}</em>
                </div>
            </div>
        </div>
    );
}

// ─── TAB 2: y = ax² + bx + c ───────────────────────────────────────────────

function Tab2({ isMobile }: { isMobile: boolean }) {
    const [a2, setA2] = useState(1);
    const [b2, setB2] = useState(0);
    const [c2, setC2] = useState(0);

    // Impedisci a = 0 (parabola degenere)
    const a = a2 === 0 ? 0.1 : a2;

    const delta = b2 * b2 - 4 * a * c2;
    const h = -b2 / (2 * a);              // x vertice
    const k = -delta / (4 * a);           // y vertice = c2 - b2²/(4a)
    const fY = k + 1 / (4 * a);           // y fuoco
    const dirY = k - 1 / (4 * a);        // y direttrice

    // Intersezione con asse y: x = 0 → y = c2
    const intY = c2;

    // Intersezioni con asse x: Δ = b² - 4ac
    const sqrtDelta = delta >= 0 ? Math.sqrt(delta) : 0;
    const x1 = (-b2 + sqrtDelta) / (2 * a);
    const x2 = (-b2 - sqrtDelta) / (2 * a);

    // Viewport: centrato sul vertice
    const HALF_X = 6;
    const xMin = Math.round(h - HALF_X), xMax = Math.round(h + HALF_X);
    const yMin = a > 0 ? Math.round(k - 3) : Math.round(k - 8);
    const yMax = a > 0 ? Math.round(k + 9) : Math.round(k + 4);

    const w = isMobile ? 340 : 460;
    const h_ = isMobile ? 270 : 360;
    const cfg: ViewCfg = { w, h: h_, xMin, xMax, yMin, yMax };
    const { toX, toY } = mkPlane(cfg);

    // Parabola
    const pts: string[] = [];
    for (let i = 0; i <= 300; i++) {
        const x = xMin + (i / 300) * (xMax - xMin);
        const y = a * x * x + b2 * x + c2;
        pts.push(`${toX(x)},${toY(y)}`);
    }

    const xStep = (xMax - xMin) > 16 ? 2 : 1;
    const yStep = (yMax - yMin) > 16 ? 2 : 1;

    // Asse di simmetria: x = h (solo se dentro viewport)
    const axisInView = h > xMin && h < xMax;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Equazione: forma generale + valori sostituiti */}
            <div style={{
                padding: "12px 16px", background: "#eff6ff", borderRadius: 8,
                border: "2px solid #bfdbfe",
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8,
            }}>
                <div style={{ textAlign: "center", borderRight: "1px solid #bfdbfe", paddingRight: 8 }}>
                    <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4, fontWeight: 600 }}>Forma generale</div>
                    <Latex display>{`y = ax^2 + bx + c`}</Latex>
                </div>
                <div style={{ textAlign: "center", paddingLeft: 4 }}>
                    <div style={{ fontSize: 11, color: "#1e40af", marginBottom: 4, fontWeight: 600 }}>Valori correnti</div>
                    <Latex display>{latexY(a, b2, c2)}</Latex>
                </div>
            </div>

            {/* SVG */}
            <svg width="100%" viewBox={`0 0 ${w} ${h_}`} style={{ maxWidth: w, display: "block", margin: "0 auto" }}>
                <PlaneGrid cfg={cfg} xStep={xStep} yStep={yStep} />

                {/* Direttrice */}
                {dirY > yMin && dirY < yMax && (
                    <>
                        <line
                            x1={toX(xMin)} y1={toY(dirY)} x2={toX(xMax)} y2={toY(dirY)}
                            stroke="#9333ea" strokeWidth={1.8} strokeDasharray="7,4"
                        />
                        <text x={toX(xMax) - 4} y={toY(dirY) - 6} fontSize={10} fill="#9333ea" textAnchor="end">
                            d: y = {fmt(dirY)}
                        </text>
                    </>
                )}

                {/* Asse di simmetria */}
                {axisInView && (
                    <>
                        <line
                            x1={toX(h)} y1={toY(yMin)} x2={toX(h)} y2={toY(yMax)}
                            stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5,3"
                        />
                        <text x={toX(h) + 4} y={toY(yMax) + 12} fontSize={9} fill="#94a3b8">x={fmt(h)}</text>
                    </>
                )}

                {/* Parabola */}
                <polyline points={pts.join(" ")} fill="none" stroke="#2563eb" strokeWidth={2.8} />

                {/* Fuoco */}
                {fY > yMin && fY < yMax && (
                    <>
                        <circle cx={toX(h)} cy={toY(fY)} r={6} fill="#ef4444" stroke="#fff" strokeWidth={2} />
                        <text x={toX(h) + 9} y={toY(fY) - 6} fontSize={11} fill="#ef4444" fontWeight="bold">
                            F({fmt(h)};{fmt(fY)})
                        </text>
                    </>
                )}

                {/* Vertice */}
                {k > yMin && k < yMax && (
                    <>
                        <circle cx={toX(h)} cy={toY(k)} r={6} fill="#2563eb" stroke="#fff" strokeWidth={2} />
                        <text x={toX(h) + 9} y={toY(k) + 5} fontSize={11} fill="#2563eb" fontWeight="bold">
                            V({fmt(h)};{fmt(k)})
                        </text>
                    </>
                )}

                {/* Intersezione asse y */}
                {intY > yMin && intY < yMax && h !== 0 && (
                    <circle cx={toX(0)} cy={toY(intY)} r={4} fill="#f97316" stroke="#fff" strokeWidth={2} />
                )}

                {/* Intersezioni asse x (se Δ ≥ 0) */}
                {delta >= 0 && (
                    <>
                        {x1 > xMin && x1 < xMax && (
                            <circle cx={toX(x1)} cy={toY(0)} r={4} fill="#16a34a" stroke="#fff" strokeWidth={2} />
                        )}
                        {Math.abs(x2 - x1) > 0.05 && x2 > xMin && x2 < xMax && (
                            <circle cx={toX(x2)} cy={toY(0)} r={4} fill="#16a34a" stroke="#fff" strokeWidth={2} />
                        )}
                    </>
                )}
            </svg>

            {/* Proprietà */}
            <PropsBox rows={[
                { label: "Vertice V", value: `(${fmt(h)}; ${fmt(k)})`, color: "#2563eb" },
                { label: "Fuoco F", value: `(${fmt(h)}; ${fmt(fY)})`, color: "#ef4444" },
                { label: "Direttrice", value: `y = ${fmt(dirY)}`, color: "#9333ea" },
                { label: "Asse", value: `x = ${fmt(h)}`, color: "#64748b" },
                { label: "Concavità", value: a > 0 ? "verso l'alto (a > 0)" : "verso il basso (a < 0)", color: "#2563eb" },
                { label: "Int. asse y", value: `(0; ${fmt(c2)})`, color: "#f97316" },
                {
                    label: "Int. asse x",
                    value: delta > 0
                        ? `(${fmt(x1)}; 0)  (${fmt(x2)}; 0)`
                        : delta === 0
                            ? `(${fmt(x1)}; 0)  [tangente]`
                            : "nessuna  (Δ < 0)",
                    color: "#16a34a",
                },
            ]} />

            {/* Sliders */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <PSlider label="Coefficiente a" symbol="a" value={a2} min={-3} max={3} step={0.1}
                    displayValue={`a = ${fmt(a2, 1)}`} color="#d97706" onChange={v => setA2(v === 0 ? 0.1 : v)} />
                <PSlider label="Coefficiente b" symbol="b" value={b2} min={-6} max={6} step={0.25}
                    displayValue={`b = ${fmt(b2, 2)}`} color="#16a34a" onChange={setB2} />
                <PSlider label="Coefficiente c" symbol="c" value={c2} min={-6} max={6} step={0.25}
                    displayValue={`c = ${fmt(c2, 2)}`} color="#9333ea" onChange={setC2} />
            </div>

            {/* Formule riassunto */}
            <div style={{ padding: "12px 14px", background: "#fafafa", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}>
                <div style={{ color: "#64748b", marginBottom: 6, fontWeight: 600 }}>Formule (con Δ = b² − 4ac = {fmt(delta, 2)})</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, color: "#334155" }}>
                    <span>Vertice: V = (−b/2a; −Δ/4a)</span>
                    <span>Fuoco: F = (−b/2a; (1−Δ)/4a)</span>
                    <span>Direttrice: y = −(1+Δ)/4a</span>
                    <span>Asse: x = −b/2a</span>
                </div>
            </div>
        </div>
    );
}

// ─── TAB 3: x = ay² + by + c ───────────────────────────────────────────────

function Tab3({ isMobile }: { isMobile: boolean }) {
    const [a3, setA3] = useState(1);
    const [b3, setB3] = useState(0);
    const [c3, setC3] = useState(0);

    const a = a3 === 0 ? 0.1 : a3;

    const delta = b3 * b3 - 4 * a * c3;
    const k = -b3 / (2 * a);              // y vertice
    const hh = -delta / (4 * a);          // x vertice
    const fX = hh + 1 / (4 * a);         // x fuoco
    const dirX = hh - 1 / (4 * a);       // x direttrice

    // Intersezione con asse x: y = 0 → x = c3
    const intX = c3;

    // Intersezioni con asse y: ay² + by + c = 0
    const sqrtDelta = delta >= 0 ? Math.sqrt(delta) : 0;
    const y1 = (-b3 + sqrtDelta) / (2 * a);
    const y2 = (-b3 - sqrtDelta) / (2 * a);

    // Viewport: centrato sul vertice
    const HALF_Y = 6;
    const yMin = Math.round(k - HALF_Y), yMax = Math.round(k + HALF_Y);
    const xMin = a > 0 ? Math.round(hh - 3) : Math.round(hh - 9);
    const xMax = a > 0 ? Math.round(hh + 9) : Math.round(hh + 3);

    const w = isMobile ? 340 : 460;
    const h_ = isMobile ? 270 : 360;
    const cfg: ViewCfg = { w, h: h_, xMin, xMax, yMin, yMax };
    const { toX, toY } = mkPlane(cfg);

    // Parabola x = ay² + by + c (parametrizzata in y)
    const pts: string[] = [];
    for (let i = 0; i <= 300; i++) {
        const y = yMin + (i / 300) * (yMax - yMin);
        const x = a * y * y + b3 * y + c3;
        pts.push(`${toX(x)},${toY(y)}`);
    }

    const xStep = (xMax - xMin) > 16 ? 2 : 1;
    const yStep = (yMax - yMin) > 16 ? 2 : 1;

    const axisInView = k > yMin && k < yMax;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Equazione: forma generale + valori sostituiti */}
            <div style={{
                padding: "12px 16px", background: "#fdf4ff", borderRadius: 8,
                border: "2px solid #e9d5ff",
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8,
            }}>
                <div style={{ textAlign: "center", borderRight: "1px solid #e9d5ff", paddingRight: 8 }}>
                    <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4, fontWeight: 600 }}>Forma generale</div>
                    <Latex display>{`x = ay^2 + by + c`}</Latex>
                </div>
                <div style={{ textAlign: "center", paddingLeft: 4 }}>
                    <div style={{ fontSize: 11, color: "#6b21a8", marginBottom: 4, fontWeight: 600 }}>Valori correnti</div>
                    <Latex display>{latexX(a, b3, c3)}</Latex>
                </div>
            </div>

            {/* SVG */}
            <svg width="100%" viewBox={`0 0 ${w} ${h_}`} style={{ maxWidth: w, display: "block", margin: "0 auto" }}>
                <PlaneGrid cfg={cfg} xStep={xStep} yStep={yStep} />

                {/* Direttrice x = dirX */}
                {dirX > xMin && dirX < xMax && (
                    <>
                        <line
                            x1={toX(dirX)} y1={toY(yMin)} x2={toX(dirX)} y2={toY(yMax)}
                            stroke="#9333ea" strokeWidth={1.8} strokeDasharray="7,4"
                        />
                        <text x={toX(dirX) + 4} y={toY(yMax) + 12} fontSize={10} fill="#9333ea">
                            x={fmt(dirX)}
                        </text>
                    </>
                )}

                {/* Asse di simmetria y = k */}
                {axisInView && (
                    <>
                        <line
                            x1={toX(xMin)} y1={toY(k)} x2={toX(xMax)} y2={toY(k)}
                            stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5,3"
                        />
                        <text x={toX(xMax) - 4} y={toY(k) - 5} fontSize={9} fill="#94a3b8" textAnchor="end">y={fmt(k)}</text>
                    </>
                )}

                {/* Parabola */}
                <polyline points={pts.join(" ")} fill="none" stroke="#7c3aed" strokeWidth={2.8} />

                {/* Fuoco */}
                {fX > xMin && fX < xMax && (
                    <>
                        <circle cx={toX(fX)} cy={toY(k)} r={6} fill="#ef4444" stroke="#fff" strokeWidth={2} />
                        <text x={toX(fX) + 8} y={toY(k) - 8} fontSize={11} fill="#ef4444" fontWeight="bold">
                            F({fmt(fX)};{fmt(k)})
                        </text>
                    </>
                )}

                {/* Vertice */}
                {hh > xMin && hh < xMax && (
                    <>
                        <circle cx={toX(hh)} cy={toY(k)} r={6} fill="#7c3aed" stroke="#fff" strokeWidth={2} />
                        <text x={toX(hh) + 8} y={toY(k) + 5} fontSize={11} fill="#7c3aed" fontWeight="bold">
                            V({fmt(hh)};{fmt(k)})
                        </text>
                    </>
                )}

                {/* Intersezione asse x (y=0 → x=c3) */}
                {intX > xMin && intX < xMax && k !== 0 && (
                    <circle cx={toX(intX)} cy={toY(0)} r={4} fill="#f97316" stroke="#fff" strokeWidth={2} />
                )}

                {/* Intersezioni asse y (se Δ ≥ 0) */}
                {delta >= 0 && (
                    <>
                        {y1 > yMin && y1 < yMax && (
                            <circle cx={toX(0)} cy={toY(y1)} r={4} fill="#16a34a" stroke="#fff" strokeWidth={2} />
                        )}
                        {Math.abs(y2 - y1) > 0.05 && y2 > yMin && y2 < yMax && (
                            <circle cx={toX(0)} cy={toY(y2)} r={4} fill="#16a34a" stroke="#fff" strokeWidth={2} />
                        )}
                    </>
                )}
            </svg>

            {/* Proprietà */}
            <PropsBox rows={[
                { label: "Vertice V", value: `(${fmt(hh)}; ${fmt(k)})`, color: "#7c3aed" },
                { label: "Fuoco F", value: `(${fmt(fX)}; ${fmt(k)})`, color: "#ef4444" },
                { label: "Direttrice", value: `x = ${fmt(dirX)}`, color: "#9333ea" },
                { label: "Asse", value: `y = ${fmt(k)}`, color: "#64748b" },
                { label: "Concavità", value: a > 0 ? "verso destra (a > 0)" : "verso sinistra (a < 0)", color: "#7c3aed" },
                { label: "Int. asse x", value: `(${fmt(c3)}; 0)`, color: "#f97316" },
                {
                    label: "Int. asse y",
                    value: delta > 0
                        ? `(0; ${fmt(y1)})  (0; ${fmt(y2)})`
                        : delta === 0
                            ? `(0; ${fmt(y1)})  [tangente]`
                            : "nessuna  (Δ < 0)",
                    color: "#16a34a",
                },
            ]} />

            {/* Sliders */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <PSlider label="Coefficiente a" symbol="a" value={a3} min={-3} max={3} step={0.1}
                    displayValue={`a = ${fmt(a3, 1)}`} color="#d97706" onChange={v => setA3(v === 0 ? 0.1 : v)} />
                <PSlider label="Coefficiente b" symbol="b" value={b3} min={-6} max={6} step={0.25}
                    displayValue={`b = ${fmt(b3, 2)}`} color="#16a34a" onChange={setB3} />
                <PSlider label="Coefficiente c" symbol="c" value={c3} min={-6} max={6} step={0.25}
                    displayValue={`c = ${fmt(c3, 2)}`} color="#9333ea" onChange={setC3} />
            </div>

            {/* Formule riassunto */}
            <div style={{ padding: "12px 14px", background: "#fafafa", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}>
                <div style={{ color: "#64748b", marginBottom: 6, fontWeight: 600 }}>Formule (con Δ = b² − 4ac = {fmt(delta, 2)})</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, color: "#334155" }}>
                    <span>Vertice: V = (−Δ/4a; −b/2a)</span>
                    <span>Fuoco: F = ((1−Δ)/4a; −b/2a)</span>
                    <span>Direttrice: x = −(1+Δ)/4a</span>
                    <span>Asse: y = −b/2a</span>
                </div>
            </div>
        </div>
    );
}

// ─── COMPONENTE PRINCIPALE ──────────────────────────────────────────────────

const sectionStyle = {
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    padding: 16,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
} as const;

export default function ParabolaDemo() {
    const { isMobile } = useBreakpoint();

    const teoriaContent = (
        <div style={{ fontSize: 13, lineHeight: 1.65 }}>
            <p>
                <strong>Luogo geometrico:</strong> una parabola è il luogo dei punti del piano
                equidistanti da un punto fisso detto <strong>fuoco F</strong> e da una retta fissa
                detta <strong>direttrice d</strong>.
            </p>
            <p>
                <strong>Asse di simmetria:</strong> la retta passante per F, perpendicolare a d.
                Il <strong>vertice V</strong> è il punto dell'asse a distanza minima da d.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
                <div style={{ padding: "10px 12px", background: "#eff6ff", borderRadius: 8 }}>
                    <div style={{ fontWeight: 700, color: "#1d4ed8", marginBottom: 4 }}>Asse ∥ asse y</div>
                    <div style={{ color: "#64748b", fontSize: 12 }}>y = ax² + bx + c</div>
                    <ul style={{ paddingLeft: 16, margin: "6px 0 0", fontSize: 12 }}>
                        <li>a &gt; 0 → concava in su</li>
                        <li>a &lt; 0 → concava in giù</li>
                        <li>|a| grande → parabola stretta</li>
                    </ul>
                </div>
                <div style={{ padding: "10px 12px", background: "#fdf4ff", borderRadius: 8 }}>
                    <div style={{ fontWeight: 700, color: "#7c3aed", marginBottom: 4 }}>Asse ∥ asse x</div>
                    <div style={{ color: "#64748b", fontSize: 12 }}>x = ay² + by + c</div>
                    <ul style={{ paddingLeft: 16, margin: "6px 0 0", fontSize: 12 }}>
                        <li>a &gt; 0 → concava a destra</li>
                        <li>a &lt; 0 → concava a sinistra</li>
                        <li>Non è funzione di x</li>
                    </ul>
                </div>
            </div>
        </div>
    );

    return (
        <DemoContainer
            title="La Parabola"
            description="Luogo geometrico, fuoco, direttrice e coefficienti"
        >
            <SwipeableTabs
                tabs={[
                    {
                        id: "luogo",
                        label: "📍 Luogo geometrico",
                        content: (
                            <div style={{ display: "grid", gap: 14 }}>
                                <div style={sectionStyle}>
                                    <div style={{ fontSize: 15, fontWeight: 700, color: "#334155", marginBottom: 10 }}>
                                        📍 La parabola come luogo geometrico
                                    </div>
                                    <CollapsibleExplanation title="Come leggere il grafico">
                                        <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                                            <p>Il <strong>fuoco F</strong> (rosso) e la <strong>direttrice d</strong> (viola tratteggiata) definiscono la parabola.</p>
                                            <p>Il punto <strong>P</strong> (arancione) si muove sulla parabola: la distanza <span style={{ color: "#ef4444" }}>|PF|</span> (da F) è sempre uguale alla distanza <span style={{ color: "#16a34a" }}>|PD|</span> (da d, perpendicolarmente).</p>
                                            <p>Varia <strong>p</strong> per cambiare apertura; varia <strong>x</strong> per spostare P.</p>
                                        </div>
                                    </CollapsibleExplanation>
                                    <Tab1 isMobile={isMobile} />
                                </div>
                                <CollapsiblePanel title="📖 Teoria" defaultOpen={false}>
                                    {teoriaContent}
                                </CollapsiblePanel>
                            </div>
                        ),
                    },
                    {
                        id: "asse-y",
                        label: "📈 Asse ∥ y",
                        content: (
                            <div style={{ display: "grid", gap: 14 }}>
                                <div style={sectionStyle}>
                                    <div style={{ fontSize: 15, fontWeight: 700, color: "#334155", marginBottom: 10 }}>
                                        📈 Parabola con asse parallelo all'asse y
                                    </div>
                                    <CollapsibleExplanation title="Come leggere il grafico">
                                        <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                                            <p><strong>a</strong> controlla apertura e concavità: a &gt; 0 apre verso l'alto, a &lt; 0 verso il basso; |a| grande = parabola stretta.</p>
                                            <p><strong>b</strong> sposta il vertice sull'asse x (cambia x_V = −b/2a).</p>
                                            <p><strong>c</strong> è l'intersezione con l'asse y.</p>
                                            <p>Il <strong>discriminante Δ = b²−4ac</strong> determina le intersezioni con l'asse x.</p>
                                        </div>
                                    </CollapsibleExplanation>
                                    <Tab2 isMobile={isMobile} />
                                </div>
                            </div>
                        ),
                    },
                    {
                        id: "asse-x",
                        label: "📉 Asse ∥ x",
                        content: (
                            <div style={{ display: "grid", gap: 14 }}>
                                <div style={sectionStyle}>
                                    <div style={{ fontSize: 15, fontWeight: 700, color: "#334155", marginBottom: 10 }}>
                                        📉 Parabola con asse parallelo all'asse x
                                    </div>
                                    <CollapsibleExplanation title="Come leggere il grafico">
                                        <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                                            <p>Questa parabola ha l'asse di simmetria parallelo all'asse x: <em>non è una funzione di x</em> (una verticale può incontrarla due volte).</p>
                                            <p><strong>a</strong> &gt; 0 → apre verso destra; a &lt; 0 → verso sinistra.</p>
                                            <p><strong>b</strong> sposta il vertice sull'asse y (y_V = −b/2a).</p>
                                            <p><strong>c</strong> è l'intersezione con l'asse x (dove y=0).</p>
                                        </div>
                                    </CollapsibleExplanation>
                                    <Tab3 isMobile={isMobile} />
                                </div>
                            </div>
                        ),
                    },
                ]}
                defaultTab="luogo"
            />
        </DemoContainer>
    );
}
