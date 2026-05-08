/**
 * SecondaLeggeNewtonDemo — F = ma: laboratorio interattivo
 * Dinamometro con slider, animazione carrello, grafici a ∝ F e a ∝ 1/m
 */

import React, { useState, useEffect, useRef } from "react";
import { Latex, DisplayMath, DemoContainer, CollapsiblePanel, useBreakpoint } from "../../components/ui";

// ── Costanti fisiche ──────────────────────────────────────────────────────────

const F_MIN = 1, F_MAX = 20;   // Newton
const M_MIN = 0.5, M_MAX = 5;  // kg

// Scala animazione: px = 0.5 * a * PX_SCALE * t²
// Con PX_SCALE=8: a=10 m/s² → 360 px in ~3 s
const PX_SCALE = 8;

// ── Colori ────────────────────────────────────────────────────────────────────

const CF = "#ef4444";   // rosso — forza
const CA = "#6366f1";   // indigo — accelerazione
const CM = "#0ea5e9";   // azzurro — massa
const CG = "#16a34a";   // verde — grafico a vs F
const CH = "#f59e0b";   // ambra — grafico a vs m

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number, d = 2) { return n.toFixed(d); }

function sliderFill(v: number, lo: number, hi: number, c: string): React.CSSProperties {
    const pct = ((v - lo) / (hi - lo)) * 100;
    return {
        width: "100%", height: 8, borderRadius: 4,
        appearance: "none" as const, outline: "none", cursor: "pointer",
        background: `linear-gradient(to right,${c} 0%,${c} ${pct}%,#e2e8f0 ${pct}%,#e2e8f0 100%)`,
    };
}

// ── SVG rotaia + carrello ─────────────────────────────────────────────────────

function TrackSVG({ F, m, a, offset, isMobile }: {
    F: number; m: number; a: number;
    offset: number;   // pixel percorsi dal carrello
    isMobile: boolean;
}) {
    const W = isMobile ? 340 : 500;
    const H = 168;
    const RAIL_Y = 128;       // piano rotaia
    const CART_H = 38;
    const CART_W = 68;
    const WHEEL_R = 10;
    const CART_TOP = RAIL_Y - CART_H;
    const TRACK_END = W - 28;

    // Posizione carrello (parte da 28 px, si sposta a destra)
    const cartX = 28 + offset;
    const cartVisible = cartX + CART_W < TRACK_END + 20;
    const cartMid = cartX + CART_W / 2;
    const cartFront = cartX + CART_W;
    const centerY = CART_TOP + CART_H / 2 + 2;

    // Freccia forza: parte dal bordo destro del carrello
    const arrowLen = 20 + (F / F_MAX) * 90;
    const arrowX1 = cartFront + 4;
    const arrowX2 = arrowX1 + arrowLen;

    // Freccia accelerazione (sopra il carrello)
    const accelArrowLen = 12 + (a / 40) * 80;
    const accelY = CART_TOP - 22;

    // Marker id — unico per non collidere con altri SVG
    const idF = "mrkF2N", idA = "mrkA2N";

    return (
        <svg viewBox={`0 0 ${W} ${H}`}
            style={{ width: "100%", display: "block", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
            <defs>
                <marker id={idF} markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
                    <polygon points="0,0 9,3.5 0,7" fill={CF} />
                </marker>
                <marker id={idA} markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
                    <polygon points="0,0 9,3.5 0,7" fill={CA} />
                </marker>
            </defs>

            {/* Rotaia */}
            <rect x={0} y={RAIL_Y} width={W} height={5} rx={2.5} fill="#cbd5e1" />
            <line x1={4} y1={RAIL_Y + 2} x2={W - 4} y2={RAIL_Y + 2} stroke="#94a3b8" strokeWidth={1} />

            {cartVisible ? (
                <g>
                    {/* Corpo carrello */}
                    <rect x={cartX} y={CART_TOP} width={CART_W} height={CART_H}
                        rx={4} fill="#334155" stroke="#1e293b" strokeWidth={1.5} />

                    {/* Ruote */}
                    <circle cx={cartX + 15} cy={RAIL_Y + 2} r={WHEEL_R} fill="#1e293b" stroke="#94a3b8" strokeWidth={1.5} />
                    <circle cx={cartX + CART_W - 15} cy={RAIL_Y + 2} r={WHEEL_R} fill="#1e293b" stroke="#94a3b8" strokeWidth={1.5} />
                    <circle cx={cartX + 15} cy={RAIL_Y + 2} r={4} fill="#475569" />
                    <circle cx={cartX + CART_W - 15} cy={RAIL_Y + 2} r={4} fill="#475569" />

                    {/* Etichetta massa */}
                    <text x={cartMid} y={CART_TOP + CART_H / 2 + 5}
                        textAnchor="middle" fill="white" fontSize={12} fontWeight="bold">
                        {fmt(m, 1)} kg
                    </text>

                    {/* Freccia forza F (rossa) */}
                    {arrowX1 < TRACK_END && (
                        <>
                            <line x1={arrowX1} y1={centerY}
                                x2={Math.min(arrowX2 - 2, TRACK_END)} y2={centerY}
                                stroke={CF} strokeWidth={3} markerEnd={`url(#${idF})`} />
                            <text x={arrowX1 + (Math.min(arrowX2, TRACK_END) - arrowX1) / 2}
                                y={centerY + 17}
                                textAnchor="middle" fill={CF} fontSize={11} fontWeight="bold">
                                F = {fmt(F, 1)} N
                            </text>
                        </>
                    )}

                    {/* Freccia accelerazione a (indaco, sopra) */}
                    <line x1={cartMid} y1={accelY}
                        x2={cartMid + accelArrowLen - 2} y2={accelY}
                        stroke={CA} strokeWidth={2.5} markerEnd={`url(#${idA})`} />
                    <text x={cartMid + accelArrowLen / 2} y={accelY - 7}
                        textAnchor="middle" fill={CA} fontSize={10} fontWeight="bold">
                        a = {fmt(a, 2)} m/s²
                    </text>
                </g>
            ) : (
                /* Carrello uscito a destra */
                <text x={W - 20} y={RAIL_Y - 16} textAnchor="end"
                    fill={CA} fontSize={14} fontWeight="bold">→ →</text>
            )}

            {/* Scala distanza */}
            {offset > 0 && cartVisible && (
                <>
                    <line x1={28} y1={RAIL_Y + 22} x2={cartX} y2={RAIL_Y + 22}
                        stroke="#94a3b8" strokeWidth={1.5} />
                    <line x1={28} y1={RAIL_Y + 18} x2={28} y2={RAIL_Y + 26}
                        stroke="#94a3b8" strokeWidth={1} />
                    <line x1={cartX} y1={RAIL_Y + 18} x2={cartX} y2={RAIL_Y + 26}
                        stroke="#94a3b8" strokeWidth={1} />
                    <text x={(28 + cartX) / 2} y={RAIL_Y + 34}
                        textAnchor="middle" fill="#94a3b8" fontSize={9}>
                        {fmt(offset / PX_SCALE, 2)} m
                    </text>
                </>
            )}
        </svg>
    );
}

// ── Grafico proporzionalità ───────────────────────────────────────────────────

function PropGraph({ title, xLabel, yLabel, points, current, color, w, h }: {
    title: string; xLabel: string; yLabel: string;
    points: { x: number; y: number }[];
    current: { x: number; y: number };
    color: string; w: number; h: number;
}) {
    const pad = { t: 28, r: 14, b: 36, l: 44 };
    const gw = w - pad.l - pad.r;
    const gh = h - pad.t - pad.b;

    const xMin = 0, xMax = Math.max(...points.map(p => p.x));
    const yMin = 0, yMax = Math.max(...points.map(p => p.y)) * 1.12;

    const toX = (x: number) => pad.l + (x - xMin) / (xMax - xMin) * gw;
    const toY = (y: number) => pad.t + (1 - (y - yMin) / (yMax - yMin)) * gh;

    const pathD = points.map((p, i) =>
        `${i === 0 ? "M" : "L"} ${toX(p.x).toFixed(1)} ${toY(p.y).toFixed(1)}`
    ).join(" ");

    const cx = toX(current.x), cy = toY(current.y);
    const fs = 9;

    // 5 ticks per axis
    const xTicks = Array.from({ length: 5 }, (_, i) => xMin + (xMax - xMin) * (i + 1) / 5);
    const yTicks = Array.from({ length: 4 }, (_, i) => yMax * (i + 1) / 4);
    const ttFlip = cx > pad.l + gw - 85;

    return (
        <svg viewBox={`0 0 ${w} ${h}`}
            style={{ width: "100%", display: "block", background: "white", borderRadius: 8, border: "1px solid #e2e8f0" }}>
            {/* Title */}
            <text x={w / 2} y={17} textAnchor="middle" fontSize={10} fill="#334155" fontWeight="bold">
                {title}
            </text>

            {/* Plot area background */}
            <rect x={pad.l} y={pad.t} width={gw} height={gh} fill="#f8fafc" rx={2} />

            {/* Gridlines */}
            {xTicks.map((x, i) => (
                <line key={i} x1={toX(x)} y1={pad.t} x2={toX(x)} y2={pad.t + gh}
                    stroke="#e2e8f0" strokeWidth={1} />
            ))}
            {yTicks.map((y, i) => (
                <line key={i} x1={pad.l} y1={toY(y)} x2={pad.l + gw} y2={toY(y)}
                    stroke="#e2e8f0" strokeWidth={1} />
            ))}

            {/* Curve */}
            <path d={pathD} fill="none" stroke={color} strokeWidth={2.5}
                strokeLinecap="round" strokeLinejoin="round" />

            {/* Axes */}
            <line x1={pad.l} y1={pad.t + gh} x2={pad.l + gw + 4} y2={pad.t + gh}
                stroke="#475569" strokeWidth={1.5} />
            <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + gh + 4}
                stroke="#475569" strokeWidth={1.5} />
            <polygon points={`${pad.l + gw + 4},${pad.t + gh} ${pad.l + gw - 2},${pad.t + gh - 3} ${pad.l + gw - 2},${pad.t + gh + 3}`} fill="#475569" />
            <polygon points={`${pad.l},${pad.t} ${pad.l - 3},${pad.t + 6} ${pad.l + 3},${pad.t + 6}`} fill="#475569" />

            {/* X labels */}
            {xTicks.map((x, i) => (
                <text key={i} x={toX(x)} y={pad.t + gh + 13}
                    textAnchor="middle" fontSize={fs - 1} fill="#94a3b8">
                    {x < 10 ? x.toFixed(1) : x.toFixed(0)}
                </text>
            ))}
            {/* Y labels */}
            {yTicks.map((y, i) => (
                <text key={i} x={pad.l - 4} y={toY(y) + 3}
                    textAnchor="end" fontSize={fs - 1} fill="#94a3b8">
                    {y < 10 ? y.toFixed(1) : y.toFixed(0)}
                </text>
            ))}

            {/* Axis labels */}
            <text x={pad.l + gw + 8} y={pad.t + gh + 3} fontSize={fs + 1} fill="#334155" fontWeight="bold">
                {xLabel}
            </text>
            <text x={pad.l - 34} y={pad.t + 4} fontSize={fs + 1} fill="#334155" fontWeight="bold">
                {yLabel}
            </text>

            {/* Drop lines */}
            <line x1={cx} y1={pad.t + gh} x2={cx} y2={cy}
                stroke={color} strokeWidth={1} strokeDasharray="3,2" opacity={0.5} />
            <line x1={pad.l} y1={cy} x2={cx} y2={cy}
                stroke={color} strokeWidth={1} strokeDasharray="3,2" opacity={0.5} />

            {/* Current point */}
            <circle cx={cx} cy={cy} r={5.5} fill={color} stroke="white" strokeWidth={2} />

            {/* Tooltip */}
            <rect x={ttFlip ? cx - 84 : cx + 6} y={cy - 26} width={80} height={20} rx={3}
                fill="white" stroke={color} strokeWidth={1} opacity={0.93} />
            <text x={ttFlip ? cx - 80 : cx + 10} y={cy - 12}
                fontSize={fs} fill={color} fontWeight="bold">
                ({current.x.toFixed(1)},&nbsp;{current.y.toFixed(2)})
            </text>
        </svg>
    );
}

// ── Componente principale ─────────────────────────────────────────────────────

export default function SecondaLeggeNewtonDemo() {
    const [F, setF] = useState(10);
    const [m, setM] = useState(1);
    const [running, setRunning] = useState(false);
    const [cartOffset, setCartOffset] = useState(0);

    const bp = useBreakpoint();
    const isMobile = bp.isMobile;

    const a = F / m;

    // Animation state refs
    const animRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number | null>(null);
    const elapsedRef = useRef(0);

    // Track length available (depends on screen)
    const trackLen = isMobile ? 200 : 340;

    // Animation loop
    useEffect(() => {
        if (!running) {
            if (animRef.current !== null) {
                cancelAnimationFrame(animRef.current);
                animRef.current = null;
            }
            lastTimeRef.current = null;
            return;
        }
        // Capture current values for this run
        const aCapture = a;
        const trackLenCapture = trackLen;

        const tick = (now: number) => {
            if (lastTimeRef.current === null) lastTimeRef.current = now;
            const dt = (now - lastTimeRef.current) / 1000;
            lastTimeRef.current = now;
            elapsedRef.current += dt;
            const t = elapsedRef.current;
            const xPx = 0.5 * aCapture * PX_SCALE * t * t;
            if (xPx >= trackLenCapture) {
                setCartOffset(trackLenCapture);
                setRunning(false);
            } else {
                setCartOffset(xPx);
                animRef.current = requestAnimationFrame(tick);
            }
        };
        animRef.current = requestAnimationFrame(tick);
        return () => {
            if (animRef.current !== null) {
                cancelAnimationFrame(animRef.current);
                animRef.current = null;
            }
        };
    }, [running]); // eslint-disable-line react-hooks/exhaustive-deps

    function reset() {
        setRunning(false);
        setCartOffset(0);
        elapsedRef.current = 0;
        lastTimeRef.current = null;
    }

    function changeF(v: number) { setF(v); reset(); }
    function changeM(v: number) { setM(v); reset(); }

    // Graph data
    const N_PTS = 80;

    // a vs F (m fisso): retta dal punto (0,0) a (F_MAX, F_MAX/m)
    const aVsFPoints = Array.from({ length: N_PTS + 1 }, (_, i) => {
        const fi = F_MIN + (F_MAX - F_MIN) * i / N_PTS;
        return { x: fi, y: fi / m };
    });

    // a vs m (F fisso): iperbole da M_MIN a M_MAX
    const aVsMPoints = Array.from({ length: N_PTS + 1 }, (_, i) => {
        const mi = M_MIN + (M_MAX - M_MIN) * i / N_PTS;
        return { x: mi, y: F / mi };
    });

    const GW = isMobile ? 160 : 220;
    const GH = isMobile ? 160 : 190;

    const btnBase: React.CSSProperties = {
        padding: "7px 18px", borderRadius: 8, fontWeight: 700,
        fontSize: 14, cursor: "pointer", border: "2px solid",
        transition: "all 0.15s",
    };

    return (
        <DemoContainer title="Seconda legge della dinamica: F = ma">

            {/* Animazione rotaia */}
            <TrackSVG F={F} m={m} a={a} offset={cartOffset} isMobile={isMobile} />

            {/* Pulsanti animazione */}
            <div style={{ display: "flex", gap: 10, justifyContent: "center", margin: "10px 0" }}>
                <button
                    onClick={() => running ? setRunning(false) : setRunning(true)}
                    style={{
                        ...btnBase,
                        background: running ? "#fef2f2" : "#eff6ff",
                        borderColor: running ? CF : "#3b82f6",
                        color: running ? CF : "#3b82f6",
                    }}
                >
                    {running ? "■ Ferma" : "▶ Avvia"}
                </button>
                <button
                    onClick={reset}
                    style={{ ...btnBase, background: "#f8fafc", borderColor: "#cbd5e1", color: "#64748b" }}
                >
                    ↺ Ricomincia
                </button>
            </div>

            {/* Sliders + risultato */}
            <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr auto",
                gap: 14, alignItems: "center",
                background: "white", borderRadius: 12,
                border: "1.5px solid #e2e8f0",
                padding: "14px 18px", marginBottom: 14,
            }}>
                {/* Forza */}
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, color: CF, fontSize: 14 }}>
                            Forza <Latex>{"F"}</Latex>
                        </span>
                        <span style={{ fontWeight: 700, color: CF, fontFamily: "monospace", fontSize: 15 }}>
                            {fmt(F, 1)} N
                        </span>
                    </div>
                    <input type="range" min={F_MIN} max={F_MAX} step={1} value={F}
                        onChange={e => changeF(Number(e.target.value))}
                        style={sliderFill(F, F_MIN, F_MAX, CF)} />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                        <span>{F_MIN} N</span><span>{F_MAX} N</span>
                    </div>
                </div>

                {/* Massa */}
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, color: CM, fontSize: 14 }}>
                            Massa <Latex>{"m"}</Latex>
                        </span>
                        <span style={{ fontWeight: 700, color: CM, fontFamily: "monospace", fontSize: 15 }}>
                            {fmt(m, 1)} kg
                        </span>
                    </div>
                    <input type="range" min={M_MIN * 10} max={M_MAX * 10} step={5} value={m * 10}
                        onChange={e => changeM(Number(e.target.value) / 10)}
                        style={sliderFill(m, M_MIN, M_MAX, CM)} />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                        <span>{M_MIN} kg</span><span>{M_MAX} kg</span>
                    </div>
                </div>

                {/* Risultato */}
                <div style={{
                    textAlign: "center", padding: "10px 20px",
                    background: "#eef2ff", borderRadius: 10,
                    border: `2px solid ${CA}`,
                }}>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginBottom: 2 }}>
                        Accelerazione
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: CA, fontFamily: "monospace" }}>
                        {fmt(a, 2)}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>m/s²</div>
                    <div style={{ marginTop: 6, fontSize: 12, color: "#475569" }}>
                        <Latex>{`a = \\dfrac{${fmt(F, 1)}}{${fmt(m, 1)}} = ${fmt(a, 2)}\\,\\text{m/s}^2`}</Latex>
                    </div>
                </div>
            </div>

            {/* Grafici proporzionalità */}
            <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: 12, marginBottom: 14,
            }}>
                {/* Grafico a vs F */}
                <div>
                    <div style={{
                        padding: "6px 12px", background: "#fef2f2",
                        borderRadius: "8px 8px 0 0", border: "1.5px solid #fca5a5",
                        borderBottom: "none", fontSize: 13, fontWeight: 600, color: CF,
                    }}>
                        a ∝ F &nbsp;—&nbsp; massa fissa{" "}
                        <span style={{ fontWeight: 400, color: "#64748b" }}>
                            (m = {fmt(m, 1)} kg)
                        </span>
                    </div>
                    <PropGraph
                        title=""
                        xLabel="F (N)" yLabel="a (m/s²)"
                        points={aVsFPoints}
                        current={{ x: F, y: a }}
                        color={CG} w={GW + 60} h={GH}
                    />
                    <div style={{
                        padding: "5px 12px", background: "#f0fdf4",
                        borderRadius: "0 0 8px 8px", border: "1.5px solid #86efac",
                        borderTop: "none", fontSize: 12, color: "#166534",
                    }}>
                        Se F raddoppia, a raddoppia &nbsp;—&nbsp;
                        <Latex>{"a \\propto F"}</Latex>
                    </div>
                </div>

                {/* Grafico a vs m */}
                <div>
                    <div style={{
                        padding: "6px 12px", background: "#fffbeb",
                        borderRadius: "8px 8px 0 0", border: "1.5px solid #fcd34d",
                        borderBottom: "none", fontSize: 13, fontWeight: 600, color: "#92400e",
                    }}>
                        a ∝ 1/m &nbsp;—&nbsp; forza fissa{" "}
                        <span style={{ fontWeight: 400, color: "#64748b" }}>
                            (F = {fmt(F, 1)} N)
                        </span>
                    </div>
                    <PropGraph
                        title=""
                        xLabel="m (kg)" yLabel="a (m/s²)"
                        points={aVsMPoints}
                        current={{ x: m, y: a }}
                        color={CH} w={GW + 60} h={GH}
                    />
                    <div style={{
                        padding: "5px 12px", background: "#fffbeb",
                        borderRadius: "0 0 8px 8px", border: "1.5px solid #fcd34d",
                        borderTop: "none", fontSize: 12, color: "#92400e",
                    }}>
                        Se m raddoppia, a si dimezza &nbsp;—&nbsp;
                        <Latex>{"a \\propto \\dfrac{1}{m}"}</Latex>
                    </div>
                </div>
            </div>

            {/* Teoria collassabile */}
            <CollapsiblePanel title="Seconda legge della dinamica (Newton)">
                <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 14, color: "#334155" }}>
                    <p style={{ margin: 0 }}>
                        Se una forza risultante <Latex>{"\\vec{F}"}</Latex> agisce su un corpo di massa{" "}
                        <Latex>{"m"}</Latex>, il corpo acquista un'accelerazione{" "}
                        <Latex>{"\\vec{a}"}</Latex> nella <strong>stessa direzione e verso</strong> della forza:
                    </p>
                    <div style={{ textAlign: "center" }}>
                        <DisplayMath>{"\\vec{F} = m\\,\\vec{a} \\qquad \\Longleftrightarrow \\qquad a = \\frac{F}{m}"}</DisplayMath>
                    </div>
                    <div style={{
                        display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                        gap: 10,
                    }}>
                        <div style={{ background: "#fef2f2", borderRadius: 8, padding: "10px 14px", border: "1px solid #fca5a5" }}>
                            <strong style={{ color: CF }}>Proporzione diretta con F</strong>
                            <p style={{ margin: "6px 0 0" }}>
                                A massa <strong>costante</strong>, raddoppiando la forza,
                                l'accelerazione raddoppia: <Latex>{"a \\propto F"}</Latex>.
                                Il grafico <em>a</em> vs <em>F</em> è una retta passante per l'origine.
                            </p>
                        </div>
                        <div style={{ background: "#fffbeb", borderRadius: 8, padding: "10px 14px", border: "1px solid #fcd34d" }}>
                            <strong style={{ color: "#92400e" }}>Proporzione inversa con m</strong>
                            <p style={{ margin: "6px 0 0" }}>
                                A forza <strong>costante</strong>, raddoppiando la massa,
                                l'accelerazione si dimezza: <Latex>{"a \\propto 1/m"}</Latex>.
                                Il grafico <em>a</em> vs <em>m</em> è un'iperbole.
                            </p>
                        </div>
                    </div>
                    <p style={{ margin: 0, color: "#475569" }}>
                        <strong>Il newton:</strong>{" "}
                        <Latex>{"1\\,\\text{N} = 1\\,\\text{kg}\\cdot\\text{m/s}^2"}</Latex>.
                        È la forza che imprime un'accelerazione di 1 m/s² a un corpo di massa 1 kg.
                    </p>
                </div>
            </CollapsiblePanel>
        </DemoContainer>
    );
}
