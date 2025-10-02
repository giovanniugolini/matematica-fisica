import React, { useMemo, useRef, useState, useEffect } from "react";

/**
 * Campo elettrico — pannello semplice stile "legge di Coulomb"
 *
 * Drag&drop robusto con Pointer Events (e capture sullo <svg>),
 * hit-test in PIXEL coerente con letterboxing, vincolo distanza ≤ 5 m,
 * e (opzionale) simulazione del moto della carica di prova con F = q_t E.
 */

const K = 8.9875517923e9; // N·m²/C²
// 20 m × 14 m, come l'altro pannello
const WORLD = { xmin: -10, xmax: 10, ymin: -7, ymax: 7 };
const MAX_DIST = 5; // m: distanza massima consentita tra sorgente e prova

type Vec2 = { x: number; y: number };

function clamp(v: number, a: number, b: number) { return Math.max(a, Math.min(b, v)); }
function length(v: Vec2) { return Math.hypot(v.x, v.y); }
function normalize(v: Vec2): Vec2 { const L = length(v); return L === 0 ? { x: 0, y: 0 } : { x: v.x / L, y: v.y / L }; }
function constrainWithinRadius(p: Vec2, center: Vec2, R: number): Vec2 {
    const dx = p.x - center.x, dy = p.y - center.y;
    const d = Math.hypot(dx, dy);
    if (d <= R || d === 0) return p;
    const f = R / d; return { x: center.x + dx * f, y: center.y + dy * f };
}

function worldToPxFactory(svgWidth: number, svgHeight: number) {
    const { xmin, xmax, ymin, ymax } = WORLD;
    const worldW = xmax - xmin;
    const worldH = ymax - ymin;
    const s = Math.min(svgWidth / worldW, svgHeight / worldH); // "meet"
    const offsetX = (svgWidth - s * worldW) / 2;
    const offsetY = (svgHeight - s * worldH) / 2;
    return {
        toX: (x: number) => offsetX + (x - xmin) * s,
        toY: (y: number) => svgHeight - (offsetY + (y - ymin) * s),
        fromX: (px: number) => xmin + (px - offsetX) / s,
        fromY: (py: number) => ymin + (svgHeight - py - offsetY) / s,
        s, offsetX, offsetY,
    };
}

export type EField = { Ex: number; Ey: number; Emag: number };
function E_field_at(p: Vec2, source: Vec2, qCoulomb: number): EField {
    const soft = 0.05; // m
    const r = { x: p.x - source.x, y: p.y - source.y };
    let r2 = r.x * r.x + r.y * r.y;
    r2 = Math.max(r2, soft * soft);
    const Emag = K * qCoulomb / r2; // N/C
    const dir = normalize(r);
    return { Ex: Emag * dir.x, Ey: Emag * dir.y, Emag };
}
const E_at = E_field_at;

function Arrow({ x, y, vx, vy, toX, toY, color, lenWorld = 0.5 }: {
    x: number; y: number; vx: number; vy: number; toX: (x: number) => number; toY: (y: number) => number; color: string; lenWorld?: number;
}) {
    const dir = normalize({ x: vx, y: vy });
    const tip = { x: x + dir.x * lenWorld, y: y + dir.y * lenWorld };
    const X1 = toX(x), Y1 = toY(y);
    const X2 = toX(tip.x), Y2 = toY(tip.y);
    const headSize = 6; // px
    const ang = Math.atan2(Y2 - Y1, X2 - X1);
    const hx = X2 - headSize * Math.cos(ang);
    const hy = Y2 - headSize * Math.sin(ang);
    const left = { x: hx + headSize * 0.6 * Math.cos(ang + Math.PI / 2), y: hy + headSize * 0.6 * Math.sin(ang + Math.PI / 2) };
    const right = { x: hx + headSize * 0.6 * Math.cos(ang - Math.PI / 2), y: hy + headSize * 0.6 * Math.sin(ang - Math.PI / 2) };
    return (
        <g>
            <line x1={X1} y1={Y1} x2={X2} y2={Y2} stroke={color} strokeWidth={2} />
            <polygon points={`${X2},${Y2} ${left.x},${left.y} ${right.x},${right.y}`} fill={color} />
        </g>
    );
}

export default function CampoElettricoPuntualeDemo() {
    const WIDTH = 900; const HEIGHT = 560;
    const svgRef = useRef<SVGSVGElement | null>(null);


    const { toX, toY, fromX, fromY, offsetX, offsetY } = useMemo(
        () => worldToPxFactory(WIDTH, HEIGHT), // 👉 mapping in unità del viewBox
        [WIDTH, HEIGHT]
    );

    // Stato fisico
    const [source, setSource] = useState<Vec2>({ x: -1.5, y: 0 });
    const [qMicro, setQMicro] = useState<number>(500); // μC
    const qSourceC = qMicro * 1e-6; // C

    const [test, setTest] = useState<Vec2>({ x: 2, y: 1 });
    const [qTestNano, setQTestNano] = useState<number>(1); // nC
    const qTestC = qTestNano * 1e-9; // C
    const [showTest, setShowTest] = useState<boolean>(false);


    // Simulazione del moto della carica di prova


    const [showField, setShowField] = useState<boolean>(true);
    const [grid, setGrid] = useState<number>(28);
    const [vecScale, setVecScale] = useState<number>(0.80);

    // Drag & hover (Pointer Events)
    const [dragging, setDragging] = useState<null | "source" | "test">(null);
    const [hoverTarget, setHoverTarget] = useState<null | "source" | "test">(null);

    function getWorldPointFromClient(clientX: number, clientY: number, svgEl: SVGSVGElement) {
        const rect = svgEl.getBoundingClientRect();
        // converti da px CSS -> unità del viewBox
        const xView = (clientX - rect.left) * (WIDTH / rect.width);
        const yView = (clientY - rect.top) * (HEIGHT / rect.height);
        return { x: fromX(xView), y: fromY(yView) };
    }

    function getLocalPxFromClient(clientX: number, clientY: number, svgEl: SVGSVGElement) {
        const rect = svgEl.getBoundingClientRect();
        // restituisci coordinate nel sistema del viewBox (coerente con toX/toY)
        const xView = (clientX - rect.left) * (WIDTH / rect.width);
        const yView = (clientY - rect.top) * (HEIGHT / rect.height);
        return { x: xView, y: yView };
    }

    function nearChargeAtPointerPx(mousePx: {x:number;y:number}, chargeWorld: Vec2, radiusPx = 22) {
        const cx = toX(chargeWorld.x), cy = toY(chargeWorld.y);
        const dx = cx - mousePx.x, dy = cy - mousePx.y;
        return Math.hypot(dx, dy) <= radiusPx;
    }

    function onPointerDown(e: React.PointerEvent<SVGSVGElement>) {
        const svgEl = e.currentTarget as SVGSVGElement;
        const px = getLocalPxFromClient(e.clientX, e.clientY, svgEl);

        let target: null | "source" | "test" = null;
        if (nearChargeAtPointerPx(px, source)) target = "source";
        else if (showTest && nearChargeAtPointerPx(px, test)) target = "test"; // <-- rispetta showTest

        if (target) {
            setDragging(target);
            (svgRef.current as any)?.setPointerCapture?.((e as any).pointerId);
        }
    }

    function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
        const svgEl = e.currentTarget as SVGSVGElement;
        const px = getLocalPxFromClient(e.clientX, e.clientY, svgEl);

        if (!dragging) {
            const h = nearChargeAtPointerPx(px, source, 14)
                ? "source"
                : (showTest && nearChargeAtPointerPx(px, test, 14) ? "test" : null); // <-- rispetta showTest
            setHoverTarget(h);
            return;
        }


        let p = getWorldPointFromClient(e.clientX, e.clientY, svgEl);
        p.x = clamp(p.x, WORLD.xmin, WORLD.xmax);
        p.y = clamp(p.y, WORLD.ymin, WORLD.ymax);

        if (dragging === "source") {
            p = constrainWithinRadius(p, test, MAX_DIST);
            setSource(p);
        } else if (dragging === "test") {
            p = constrainWithinRadius(p, source, MAX_DIST);
            setTest(p);
        }
    }
    function onPointerUp(e: React.PointerEvent<SVGSVGElement>) {
        try { (svgRef.current as any)?.releasePointerCapture?.((e as any).pointerId); } catch {}
        setDragging(null);
    }
    function onPointerLeave() { setDragging(null); }

    // Calcoli al punto di prova
    const testField: EField = useMemo(() => E_at(test, source, qSourceC), [test, source, qSourceC]);
    const testForce = useMemo(() => ({ Fx: qTestC * testField.Ex, Fy: qTestC * testField.Ey }), [testField, qTestC]);
    const Fmag = Math.hypot(testForce.Fx, testForce.Fy);


    // Griglia vettori
    const gridPts: Vec2[] = useMemo(() => {
        const pts: Vec2[] = [];
        const nx = grid, ny = Math.round(grid * ( (WORLD.ymax - WORLD.ymin) / (WORLD.xmax - WORLD.xmin) ));
        for (let i = 0; i < nx; i++) {
            const x = WORLD.xmin + (i + 0.5) * (WORLD.xmax - WORLD.xmin) / nx;
            for (let j = 0; j < ny; j++) {
                const y = WORLD.ymin + (j + 0.5) * (WORLD.ymax - WORLD.ymin) / ny;
                const r2 = (x - source.x) ** 2 + (y - source.y) ** 2;
                if (r2 < 0.06 * 0.06) continue; // evita frecce troppo vicine alla sorgente
                pts.push({ x, y });
            }
        }
        return pts;
    }, [grid, source]);

    function lenFromEmag(Emag: number) {
        const Lmax = vecScale; const E0 = 2e5;
        return Lmax * (1 - Math.exp(-Emag / E0));
    }

    // Self-tests (dev)
    useEffect(() => {
        if (process.env.NODE_ENV !== "development") return;
        const wx = 3.2, wy = -1.1;
        const px = toX(wx), py = toY(wy);
        const wx2 = fromX(px), wy2 = fromY(py);
        console.assert(Math.abs(wx - wx2) < 1e-6 && Math.abs(wy - wy2) < 1e-6, "[TEST] mapping world<->pixel");
        const s = source; const q = (qSourceC === 0 ? 1e-9 : qSourceC);
        const p1 = { x: s.x + 2, y: s.y + 1 }; const E1 = E_at(p1, s, q);
        const r1 = { x: p1.x - s.x, y: p1.y - s.y }; const dot = r1.x * E1.Ex + r1.y * E1.Ey;
        console.assert((q > 0 ? dot > 0 : dot < 0), "[TEST] direzione E");
    }, [toX, toY, fromX, fromY, source, qSourceC]);

    const card: React.CSSProperties = { background: "#fff", borderRadius: 16, padding: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" };
    const cursor = dragging ? "grabbing" : (hoverTarget ? "grab" : "crosshair");
    const chip = (text: string, color = "#e2e8f0") => (<span style={{ background: color, borderRadius: 999, fontSize: 12, padding: "2px 8px" }}>{text}</span>);

    return (
        <div className="container page--fisica">
            <h1>Campo elettrico (carica puntiforme)</h1>
            <p className="muted">Trascina la <b>carica sorgente</b> e la <b>carica di prova</b>. Distanza bloccata a ≤ 5 m. {chip("E in N/C")} {chip("F in N")} </p>

            <div className="grid-2">
                <div className="card" style={card}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ fontWeight: 600 }}>Piano (x,y) in metri</div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button className="btn" onClick={() => setShowField((s) => !s)}>
                                {showField ? "Nascondi" : "Mostra"} vettori
                            </button>
                            <button className="btn" onClick={() => setShowTest(s => !s)}>
                                {showTest ? "Nascondi carica di prova" : "Mostra carica di prova"}
                            </button>
                        </div>
                    </div>

                    <svg
                        ref={svgRef}
                        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                        preserveAspectRatio="xMidYMid meet"
                        style={{ width: "100%", height: "min(70vh, 560px)", cursor, touchAction: "none" }}
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        onPointerLeave={onPointerLeave}
                    >
                        {/* fondo */}
                        <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="#fff" rx={16} />

                        {/* griglia */}
                        {Array.from({ length: 11 }, (_, i) => WORLD.xmin + i * (WORLD.xmax - WORLD.xmin) / 10).map((vx) => (
                            <line key={`vx-${vx}`} x1={toX(vx)} y1={offsetY} x2={toX(vx)} y2={HEIGHT - offsetY} stroke="#eef2f7" />
                        ))}

                        {Array.from({ length: 8 }, (_, j) => WORLD.ymin + j * (WORLD.ymax - WORLD.ymin) / 7).map((vy) => (
                            <line key={`vy-${vy}`} x1={offsetX} y1={toY(vy)} x2={WIDTH - offsetX} y2={toY(vy)} stroke="#eef2f7" />
                        ))}


                        {/* assi */}
                        <line x1={toX(WORLD.xmin)} y1={toY(0)} x2={toX(WORLD.xmax)} y2={toY(0)} stroke="#0f172a" />
                        <line x1={toX(0)} y1={toY(WORLD.ymin)} x2={toX(0)} y2={toY(WORLD.ymax)} stroke="#0f172a" />

                        {/* vettori di campo */}
                        {showField && gridPts.map((p, idx) => {
                            const E = E_at(p, source, qSourceC);
                            const L = lenFromEmag(E.Emag);
                            const color = qSourceC >= 0 ? "#2563eb" : "#1d4ed8";
                            return <Arrow key={idx} x={p.x} y={p.y} vx={E.Ex} vy={E.Ey} lenWorld={L} toX={toX} toY={toY} color={color} />;
                        })}

                        {/* sorgente */}
                        {(() => {
                            const X = toX(source.x), Y = toY(source.y);
                            const signPos = qSourceC >= 0;
                            const fill = signPos ? "#ef4444" : "#3b82f6";
                            const text = signPos ? "+" : "−";
                            return (
                                <g onPointerDown={(e)=>{ e.stopPropagation(); setDragging("source"); (svgRef.current as any)?.setPointerCapture?.((e as any).pointerId); }} style={{ cursor: dragging==='source' ? 'grabbing' : 'grab' }}>
                                    <circle cx={X} cy={Y} r={14} fill={fill} stroke="#0f172a" strokeWidth={1} />
                                    <text x={X} y={Y + 4} fontSize={18} textAnchor="middle" fill="#fff" fontWeight={700}>{text}</text>
                                    <text x={X + 18} y={Y - 18} fontSize={12} fill="#0f172a">q = {qMicro.toFixed(2)} μC</text>
                                </g>
                            );
                        })()}

                        {/* prova */}
                        {/* prova (nascondibile) */}
                        {(() => {
                            if (!showTest) return null;                // <-- se nascosta, non disegniamo nulla
                            const X = toX(test.x), Y = toY(test.y);
                            const E = testField;                       // campo nel punto di prova
                            const L_E = lenFromEmag(E.Emag);
                            const F = testForce;                       // forza nel punto di prova
                            const dirF = { x: F.Fx, y: F.Fy };

                            return (
                                <g
                                    onPointerDown={(e) => {
                                        e.stopPropagation();
                                        setDragging("test");
                                        (svgRef.current as any)?.setPointerCapture?.((e as any).pointerId);
                                    }}
                                    style={{ cursor: dragging === "test" ? "grabbing" : "grab" }}
                                >
                                    {/* SOLO vettore F (verde) applicato alla prova */}
                                    <Arrow
                                        x={test.x} y={test.y}
                                        vx={dirF.x} vy={dirF.y}
                                        lenWorld={L_E * 0.9}
                                        toX={toX} toY={toY}
                                        color="#10b981"
                                    />
                                    <circle cx={X} cy={Y} r={10} fill="#f59e0b" stroke="#0f172a" />
                                    <text x={X + 14} y={Y - 12} fontSize={12} fill="#0f172a">
                                        q_t = {qTestNano.toFixed(2)} nC
                                    </text>
                                </g>
                            );
                        })()}

                    </svg>

                    <div style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
                        <label> Densità griglia
                            <input type="range" min={8} max={28} step={1} value={grid} onChange={(e) => setGrid(parseInt(e.target.value))} style={{ marginLeft: 8 }} />
                            <span className="badge" style={{ marginLeft: 6 }}>{grid}</span>
                        </label>
                        <label> Scala vettori
                            <input type="range" min={0.2} max={1.2} step={0.05} value={vecScale} onChange={(e) => setVecScale(parseFloat(e.target.value))} style={{ marginLeft: 8 }} />
                            <span className="badge" style={{ marginLeft: 6 }}>{vecScale.toFixed(2)} m</span>
                        </label>
                    </div>
                </div>

                <div className="card" style={card}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Controlli</div>
                    <div style={{ display: "grid", gap: 10 }}>
                        <div>
                            <div style={{ fontWeight: 600, marginBottom: 4 }}>Carica sorgente</div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                                <label>x (m)
                                    <input type="number" value={source.x} step={0.1} onChange={(e) => {
                                        const nx = clamp(parseFloat(e.target.value), WORLD.xmin, WORLD.xmax);
                                        let ns = { ...source, x: nx };
                                        ns = constrainWithinRadius(ns, test, MAX_DIST);
                                        setSource(ns);
                                    }} />
                                </label>
                                <label>y (m)
                                    <input type="number" value={source.y} step={0.1} onChange={(e) => {
                                        const ny = clamp(parseFloat(e.target.value), WORLD.ymin, WORLD.ymax);
                                        let ns = { ...source, y: ny };
                                        ns = constrainWithinRadius(ns, test, MAX_DIST);
                                        setSource(ns);
                                    }} />
                                </label>
                                <label>q (μC)
                                    <input type="number" value={qMicro} step={0.1} onChange={(e) => setQMicro(parseFloat(e.target.value))} />
                                </label>
                            </div>
                        </div>

                        <div>
                            <div style={{ fontWeight: 600, marginBottom: 4 }}>Carica di prova</div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                                <label>x (m)
                                    <input type="number" value={test.x} step={0.1} onChange={(e) => {
                                        const nx = clamp(parseFloat(e.target.value), WORLD.xmin, WORLD.xmax);
                                        let nt = { ...test, x: nx };
                                        nt = constrainWithinRadius(nt, source, MAX_DIST);
                                        setTest(nt);
                                    }} />
                                </label>
                                <label>y (m)
                                    <input type="number" value={test.y} step={0.1} onChange={(e) => {
                                        const ny = clamp(parseFloat(e.target.value), WORLD.ymin, WORLD.ymax);
                                        let nt = { ...test, y: ny };
                                        nt = constrainWithinRadius(nt, source, MAX_DIST);
                                        setTest(nt);
                                    }} />
                                </label>
                                <label>q_t (nC)
                                    <input type="number" value={qTestNano} step={0.1} onChange={(e) => setQTestNano(parseFloat(e.target.value))} />
                                </label>
                            </div>
                        </div>



                        {/* Letture */}
                        <div className="card" style={{ padding: 8 }}>
                            <div style={{ fontWeight: 600, marginBottom: 6 }}>Misure al punto di prova</div>
                            <div>E = (Ex, Ey) = (<b>{testField.Ex.toExponential(3)}</b>, <b>{testField.Ey.toExponential(3)}</b>) N/C</div>
                            <div>|E| = <b>{testField.Emag.toExponential(3)}</b> N/C</div>
                            <div>F = q_t·E = (<b>{(testForce.Fx).toExponential(3)}</b>, <b>{(testForce.Fy).toExponential(3)}</b>) N</div>
                            <div>|F| = <b>{Fmag.toExponential(3)}</b> N</div>
                        </div>

                        <div className="muted" style={{ fontSize: 12 }}>
                            Suggerimenti: il cursore passa a "grab" solo quando sei <i>davvero</i> sopra una carica; durante il drag diventa "grabbing". La distanza tra cariche è limitata a 5 m.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
