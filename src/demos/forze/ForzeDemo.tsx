/**
 * ForzeDemo.tsx
 *
 * Demo multi-tab su:
 * - Forze (generale): somma vettoriale e risultante
 * - Forza peso: P = m g
 * - Forza elastica: Legge di Hooke F = k x
 * - Attrito: statico e dinamico (F_s,max = μ_s N, F_d = μ_d N)
 *
 * Stile: coerente con le altre demo (Responsive + KaTeX + CoordinatePlane + SwipeableTabs).
 */

import React, { useMemo, useState } from "react";
import {
    DemoContainer,
    ResponsiveCard,
    useBreakpoint,
    SwipeableTabs,
    CollapsiblePanel,
} from "../../components/ui";
import { Latex, DisplayMath } from "../../components/ui/Latex";
import { CoordinatePlane, PlaneVector, PlaneLine } from "../../components/ui/CoordinatePlane";

// ================== Helpers ==================

function degToRad(deg: number) {
    return (deg * Math.PI) / 180;
}
function radToDeg(rad: number) {
    return (rad * 180) / Math.PI;
}
function clamp(n: number, a: number, b: number) {
    return Math.max(a, Math.min(b, n));
}
function formatNumber(n: number, decimals = 2) {
    return n.toFixed(decimals).replace(/\.?0+$/, "");
}

// ================== Costanti colori ==================

const C = {
    blue: "#2563eb",
    red: "#dc2626",
    green: "#16a34a",
    amber: "#f59e0b",
    slate: "#64748b",
    grayLine: "#94a3b8",
};

// ================== TAB 1: Forze (generale) ==================

function ForzeGeneraleTab({ isMobile }: { isMobile: boolean }) {
    const [f1, setF1] = useState(32);
    const [f2, setF2] = useState(51);
    const [thetaDeg, setThetaDeg] = useState(90); // angolo tra F1 e F2

    // F1 sull'asse x positivo, F2 ruotato di theta
    const computed = useMemo(() => {
        const t = clamp(thetaDeg, 0, 180);
        const f2x = f2 * Math.cos(degToRad(t));
        const f2y = f2 * Math.sin(degToRad(t));
        const rx = f1 + f2x;
        const ry = f2y;

        const r = Math.sqrt(rx * rx + ry * ry);
        const alpha = rx === 0 && ry === 0 ? 0 : radToDeg(Math.atan2(ry, rx));
        return { t, f2x, f2y, rx, ry, r, alpha };
    }, [f1, f2, thetaDeg]);

    const range = Math.max(10, Math.ceil((computed.r + 10) / 5) * 5);

    const vectors: PlaneVector[] = [
        {
            origin: { x: 0, y: 0 },
            end: { x: f1, y: 0 },
            color: C.blue,
            strokeWidth: 3,
            label: "F_1",
            labelPosition: "end",
        },
        {
            origin: { x: 0, y: 0 },
            end: { x: computed.f2x, y: computed.f2y },
            color: C.green,
            strokeWidth: 3,
            label: "F_2",
            labelPosition: "end",
        },
        {
            origin: { x: 0, y: 0 },
            end: { x: computed.rx, y: computed.ry },
            color: C.red,
            strokeWidth: 4,
            label: "R",
            labelPosition: "end",
        },
    ];

    const guideLines: PlaneLine[] = [
        {
            p1: { x: f1, y: 0 },
            p2: { x: computed.rx, y: computed.ry },
            color: C.grayLine,
            strokeWidth: 1.5,
            style: "dashed",
        },
        {
            p1: { x: computed.f2x, y: computed.f2y },
            p2: { x: computed.rx, y: computed.ry },
            color: C.grayLine,
            strokeWidth: 1.5,
            style: "dashed",
        },
    ];

    return (
        <div style={{ display: "grid", gap: 16 }}>
            <ResponsiveCard>
                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>Somma vettoriale di due forze</div>
                <div style={{ color: C.slate, fontSize: 13 }}>
                    Impostiamo <strong>F₁</strong> sull’asse x e <strong>F₂</strong> con angolo θ. La risultante è{" "}
                    <strong>R = F₁ + F₂</strong>.
                </div>
            </ResponsiveCard>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
                <ResponsiveCard padding={10}>
                    <CoordinatePlane
                        width={520}
                        height={520}
                        xMin={-range * 0.1}
                        xMax={range}
                        yMin={-range * 0.2}
                        yMax={range}
                        showGrid={true}
                        gridOpacity={0.5}
                        showArrows={true}
                        vectors={vectors}
                        lines={guideLines}
                        xAxisLabel="x"
                        yAxisLabel="y"
                        style={{ width: "100%", height: "auto", maxHeight: "60vh" }}
                    />

                    <div style={{ marginTop: 10, display: "flex", gap: 14, flexWrap: "wrap", fontSize: 13 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 18, height: 3, background: C.blue }} />
              F₁
            </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 18, height: 3, background: C.green }} />
              F₂
            </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 18, height: 3, background: C.red }} />
              R
            </span>
                    </div>
                </ResponsiveCard>

                <ResponsiveCard>
                    <div style={{ fontWeight: 700, marginBottom: 10 }}>Parametri</div>

                    <div style={{ display: "grid", gap: 14 }}>
                        <div>
                            <div style={{ fontSize: 13, color: C.slate, marginBottom: 4 }}>F₁ = {formatNumber(f1, 0)} N</div>
                            <input
                                type="range"
                                min={5}
                                max={100}
                                step={1}
                                value={f1}
                                onChange={(e) => setF1(parseFloat(e.target.value))}
                                style={{ width: "100%" }}
                            />
                        </div>

                        <div>
                            <div style={{ fontSize: 13, color: C.slate, marginBottom: 4 }}>F₂ = {formatNumber(f2, 0)} N</div>
                            <input
                                type="range"
                                min={5}
                                max={100}
                                step={1}
                                value={f2}
                                onChange={(e) => setF2(parseFloat(e.target.value))}
                                style={{ width: "100%" }}
                            />
                        </div>

                        <div>
                            <div style={{ fontSize: 13, color: C.slate, marginBottom: 4 }}>
                                Angolo tra F₁ e F₂: θ = {formatNumber(thetaDeg, 0)}°
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={180}
                                step={1}
                                value={thetaDeg}
                                onChange={(e) => setThetaDeg(parseFloat(e.target.value))}
                                style={{ width: "100%" }}
                            />
                        </div>
                    </div>

                    <div style={{ height: 12 }} />

                    <div style={{ padding: 12, background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                        <div style={{ fontWeight: 800, marginBottom: 8 }}>Risultato</div>

                        <div style={{ display: "grid", gap: 8, fontSize: 14 }}>
                            <div>
                                <Latex>{`R_x = F_1 + F_2\\cos\\theta = ${formatNumber(f1, 0)} + ${formatNumber(
                                    f2,
                                    0
                                )}\\cos(${formatNumber(computed.t, 0)}^\\circ) = `}</Latex>{" "}
                                <strong>{formatNumber(computed.rx, 2)}</strong>
                            </div>

                            <div>
                                <Latex>{`R_y = F_2\\sin\\theta = ${formatNumber(f2, 0)}\\sin(${formatNumber(
                                    computed.t,
                                    0
                                )}^\\circ) = `}</Latex>{" "}
                                <strong>{formatNumber(computed.ry, 2)}</strong>
                            </div>

                            <div>
                                <Latex>{`|\\vec R| = \\sqrt{R_x^2+R_y^2} = `}</Latex>{" "}
                                <strong style={{ color: C.red }}>{formatNumber(computed.r, 2)} N</strong>
                            </div>

                            <div>
                                <Latex>{`\\alpha = \\arctan\\left(\\frac{R_y}{R_x}\\right) = `}</Latex>{" "}
                                <strong style={{ color: C.amber }}>{formatNumber(computed.alpha, 1)}°</strong>
                            </div>
                        </div>
                    </div>

                    <div style={{ height: 12 }} />

                    <CollapsiblePanel title="📚 Richiamo teorico" defaultOpen={!isMobile}>
                        <div style={{ display: "grid", gap: 10 }}>
                            <DisplayMath>{`\\vec R = \\vec F_1 + \\vec F_2`}</DisplayMath>
                            <DisplayMath>{`R_x = F_1 + F_2\\cos\\theta`}</DisplayMath>
                            <DisplayMath>{`R_y = F_2\\sin\\theta`}</DisplayMath>
                            <DisplayMath>{`|\\vec R| = \\sqrt{R_x^2 + R_y^2}`}</DisplayMath>
                        </div>
                    </CollapsiblePanel>
                </ResponsiveCard>
            </div>
        </div>
    );
}

// ================== TAB 2: Forza peso ==================

const PLANETS = [
    { id: "Terra", g: 9.81 },
    { id: "Luna", g: 1.62 },
    { id: "Marte", g: 3.69 },
    { id: "Giove", g: 24.79 },
];

function ForzaPesoTab({ isMobile }: { isMobile: boolean }) {
    const [mass, setMass] = useState(1.0);
    const [planetId, setPlanetId] = useState<(typeof PLANETS)[number]["id"]>("Terra");

    const g = PLANETS.find((p) => p.id === planetId)?.g ?? 9.81;
    const P = mass * g;

    const scale = 0.25;
    const vectors: PlaneVector[] = [
        {
            origin: { x: 0, y: 0 },
            end: { x: 0, y: -P * scale },
            color: C.red,
            strokeWidth: 4,
            label: "P",
            labelPosition: "end",
        },
    ];

    const range = Math.max(6, Math.ceil(Math.abs(P * scale)) + 2);

    return (
        <div style={{ display: "grid", gap: 16 }}>
            <ResponsiveCard>
                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>Forza peso</div>
                <div style={{ color: C.slate, fontSize: 13 }}>
                    La forza peso è la forza gravitazionale esercitata sul corpo: <strong>P = m g</strong>.
                </div>
            </ResponsiveCard>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
                <ResponsiveCard padding={10}>
                    <CoordinatePlane
                        width={520}
                        height={520}
                        xMin={-range}
                        xMax={range}
                        yMin={-range}
                        yMax={range}
                        showGrid={true}
                        gridOpacity={0.5}
                        showArrows={true}
                        vectors={vectors}
                        xAxisLabel="x"
                        yAxisLabel="y"
                        style={{ width: "100%", height: "auto", maxHeight: "60vh" }}
                    />
                    <div style={{ marginTop: 10, fontSize: 13, color: C.slate }}>
                        (Vettore in scala grafica: <strong>{formatNumber(scale, 2)}</strong>)
                    </div>
                </ResponsiveCard>

                <ResponsiveCard>
                    <div style={{ fontWeight: 700, marginBottom: 10 }}>Parametri</div>

                    <div style={{ display: "grid", gap: 14 }}>
                        <div>
                            <div style={{ fontSize: 13, color: C.slate, marginBottom: 6 }}>
                                Massa: <strong>{formatNumber(mass, 2)} kg</strong>
                            </div>
                            <input
                                type="range"
                                min={0.1}
                                max={10}
                                step={0.1}
                                value={mass}
                                onChange={(e) => setMass(parseFloat(e.target.value))}
                                style={{ width: "100%" }}
                            />
                        </div>

                        <div>
                            <div style={{ fontSize: 13, color: C.slate, marginBottom: 6 }}>
                                Pianeta: <strong>{planetId}</strong> (g = {formatNumber(g, 2)} N/kg)
                            </div>
                            <select
                                value={planetId}
                                onChange={(e) => setPlanetId(e.target.value as any)}
                                style={{
                                    width: "100%",
                                    padding: "10px 12px",
                                    borderRadius: 10,
                                    border: "1px solid #d1d5db",
                                    background: "#fff",
                                }}
                            >
                                {PLANETS.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.id} — g = {formatNumber(p.g, 2)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ height: 12 }} />

                    <div style={{ padding: 12, background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                        <div style={{ fontWeight: 800, marginBottom: 8 }}>Calcolo</div>
                        <div style={{ display: "grid", gap: 8, fontSize: 14 }}>
                            <div>
                                <Latex>{`P = m\\,g = ${formatNumber(mass, 2)}\\cdot ${formatNumber(g, 2)} = `}</Latex>{" "}
                                <strong style={{ color: C.red }}>{formatNumber(P, 2)} N</strong>
                            </div>
                            <div style={{ color: C.slate, fontSize: 13 }}>Direzione: verticale. Verso: verso il basso.</div>
                        </div>
                    </div>

                    <div style={{ height: 12 }} />

                    <CollapsiblePanel title="📚 Note" defaultOpen={!isMobile}>
                        <div style={{ display: "grid", gap: 10 }}>
                            <DisplayMath>{`\\vec P = m\\,\\vec g`}</DisplayMath>
                            <DisplayMath>{`P = m g`}</DisplayMath>
                            <div style={{ fontSize: 13, color: C.slate }}>
                                La massa è invariabile, il peso cambia perché cambia g.
                            </div>
                        </div>
                    </CollapsiblePanel>
                </ResponsiveCard>
            </div>
        </div>
    );
}

// ================== TAB 3: Forza elastica (Hooke) ==================

function ForzaElasticaTab({ isMobile }: { isMobile: boolean }) {
    const [k, setK] = useState(200);
    const [x, setX] = useState(0.05);

    const F = -k * x;

    const rangeX = 0.15;
    const rangeY = Math.max(50, Math.ceil((Math.abs(k * rangeX) + 20) / 20) * 20);

    const line: PlaneLine[] = [
        { p1: { x: -rangeX, y: -k * -rangeX }, p2: { x: rangeX, y: -k * rangeX }, color: C.blue, strokeWidth: 2.5, style: "solid" },
    ];

    const vectors: PlaneVector[] = [
        { origin: { x: 0, y: 0 }, end: { x, y: 0 }, color: C.green, strokeWidth: 3, label: "x", labelPosition: "end" },
        { origin: { x: 0, y: 0 }, end: { x: 0, y: F / 50 }, color: C.red, strokeWidth: 4, label: "F", labelPosition: "end" },
    ];

    return (
        <div style={{ display: "grid", gap: 16 }}>
            <ResponsiveCard>
                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>Forza elastica (Legge di Hooke)</div>
                <div style={{ color: C.slate, fontSize: 13 }}>
                    In 1D: <strong>F = −k x</strong>. La forza elastica è sempre opposta allo spostamento.
                </div>
            </ResponsiveCard>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
                <ResponsiveCard padding={10}>
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>Grafico concettuale</div>
                    <div style={{ fontSize: 13, color: C.slate, marginBottom: 10 }}>
                        Mostriamo la relazione <strong>F(x) = −k x</strong> (assi semplificati).
                    </div>

                    <CoordinatePlane
                        width={520}
                        height={420}
                        xMin={-rangeX}
                        xMax={rangeX}
                        yMin={-rangeY}
                        yMax={rangeY}
                        showGrid={true}
                        gridOpacity={0.4}
                        showArrows={true}
                        lines={line}
                        vectors={vectors}
                        xAxisLabel="x (m)"
                        yAxisLabel="F (N)"
                        style={{ width: "100%", height: "auto", maxHeight: "55vh" }}
                    />

                    <div style={{ marginTop: 10, fontSize: 12, color: C.slate }}>
                        Nota: per la leggibilità, il vettore <strong>F</strong> è disegnato in scala (F/50).
                    </div>
                </ResponsiveCard>

                <ResponsiveCard>
                    <div style={{ fontWeight: 700, marginBottom: 10 }}>Parametri</div>

                    <div style={{ display: "grid", gap: 14 }}>
                        <div>
                            <div style={{ fontSize: 13, color: C.slate, marginBottom: 4 }}>
                                k = <strong>{formatNumber(k, 0)} N/m</strong>
                            </div>
                            <input type="range" min={20} max={500} step={10} value={k} onChange={(e) => setK(parseFloat(e.target.value))} style={{ width: "100%" }} />
                        </div>

                        <div>
                            <div style={{ fontSize: 13, color: C.slate, marginBottom: 4 }}>
                                x = <strong>{formatNumber(x, 3)} m</strong>{" "}
                                <span style={{ color: x >= 0 ? C.green : C.amber }}>({x >= 0 ? "allungamento" : "compressione"})</span>
                            </div>
                            <input type="range" min={-0.12} max={0.12} step={0.005} value={x} onChange={(e) => setX(parseFloat(e.target.value))} style={{ width: "100%" }} />
                        </div>
                    </div>

                    <div style={{ height: 12 }} />

                    <div style={{ padding: 12, background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                        <div style={{ fontWeight: 800, marginBottom: 8 }}>Calcolo</div>
                        <div style={{ display: "grid", gap: 8, fontSize: 14 }}>
                            <div>
                                <Latex>{`F = -k\\,x = -(${formatNumber(k, 0)})\\cdot(${formatNumber(x, 3)}) = `}</Latex>{" "}
                                <strong style={{ color: C.red }}>{formatNumber(F, 2)} N</strong>
                            </div>
                            <div style={{ fontSize: 13, color: C.slate }}>
                                Il segno indica il verso: la forza è <strong>opposta</strong> allo spostamento.
                            </div>
                        </div>
                    </div>

                    <div style={{ height: 12 }} />

                    <CollapsiblePanel title="📚 Formule" defaultOpen={!isMobile}>
                        <div style={{ display: "grid", gap: 10 }}>
                            <DisplayMath>{`\\vec F_e = -k\\,\\vec x`}</DisplayMath>
                            <DisplayMath>{`F = -k x`}</DisplayMath>
                            <div style={{ fontSize: 13, color: C.slate }}>
                                In modulo: <Latex>{`|F| = k\\,|x|`}</Latex>
                            </div>
                        </div>
                    </CollapsiblePanel>
                </ResponsiveCard>
            </div>
        </div>
    );
}

// ================== TAB 4: Attrito ==================

type SurfaceRow = { material: string; muD: number; muS: number };

const FRICTION_TABLE: SurfaceRow[] = [
    { material: "Gomma su cemento (asciutto)", muD: 0.8, muS: 1.0 },
    { material: "Acciaio su acciaio", muD: 0.57, muS: 0.74 },
    { material: "Vetro su vetro", muD: 0.4, muS: 0.94 },
    { material: "Legno su pelle", muD: 0.4, muS: 0.5 },
    { material: "Gomma su cemento (bagnato)", muD: 0.25, muS: 0.3 },
    { material: "Sci scivolanti su neve", muD: 0.05, muS: 0.1 },
    { material: "Articolazione del ginocchio", muD: 0.003, muS: 0.01 },
];

function AttritoTab({ isMobile }: { isMobile: boolean }) {
    const [mass, setMass] = useState(10);
    const [muS, setMuS] = useState(0.7);
    const [muD, setMuD] = useState(0.5);
    const [applied, setApplied] = useState(40);
    const [useTableIdx, setUseTableIdx] = useState<number>(1);

    const g = 9.81;
    const N = mass * g;

    const FsMax = muS * N;
    const Fd = muD * N;

    const regime = applied <= FsMax ? "statico (non scivola)" : "dinamico (scivola)";
    const friction = applied <= FsMax ? applied : Fd;

    const scale = 0.02;
    const vectors: PlaneVector[] = [
        { origin: { x: 0, y: 0 }, end: { x: applied * scale, y: 0 }, color: C.blue, strokeWidth: 3, label: "F", labelPosition: "end" },
        { origin: { x: 0, y: 0 }, end: { x: -friction * scale, y: 0 }, color: C.red, strokeWidth: 3, label: "F_a", labelPosition: "end" },
        { origin: { x: 0, y: 0 }, end: { x: 0, y: N * scale }, color: C.green, strokeWidth: 3, label: "N", labelPosition: "end" },
        { origin: { x: 0, y: 0 }, end: { x: 0, y: -(mass * g) * scale }, color: C.amber, strokeWidth: 3, label: "P", labelPosition: "end" },
    ];

    const range = Math.max(6, Math.ceil(Math.max(applied, FsMax, N) * scale) + 2);

    const applyTable = (idx: number) => {
        const row = FRICTION_TABLE[idx];
        if (!row) return;
        setMuD(row.muD);
        setMuS(row.muS);
        setUseTableIdx(idx);
    };

    return (
        <div style={{ display: "grid", gap: 16 }}>
            <ResponsiveCard>
                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>Forza di attrito</div>
                <div style={{ color: C.slate, fontSize: 13 }}>
                    <strong>Statico</strong>: si adatta fino a un massimo. <strong>Dinamico</strong>: durante lo scorrimento.
                </div>
            </ResponsiveCard>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
                <ResponsiveCard padding={10}>
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>Schema delle forze</div>
                    <CoordinatePlane
                        width={520}
                        height={420}
                        xMin={-range}
                        xMax={range}
                        yMin={-range}
                        yMax={range}
                        showGrid={true}
                        gridOpacity={0.4}
                        showArrows={true}
                        vectors={vectors}
                        xAxisLabel="x"
                        yAxisLabel="y"
                        style={{ width: "100%", height: "auto", maxHeight: "55vh" }}
                    />
                    <div style={{ marginTop: 10, fontSize: 13, color: C.slate }}>
                        Regime: <strong>{regime}</strong>
                    </div>
                </ResponsiveCard>

                <ResponsiveCard>
                    <div style={{ fontWeight: 700, marginBottom: 10 }}>Parametri</div>

                    <div style={{ display: "grid", gap: 14 }}>
                        <div>
                            <div style={{ fontSize: 13, color: C.slate, marginBottom: 4 }}>
                                m = <strong>{formatNumber(mass, 1)} kg</strong>
                            </div>
                            <input type="range" min={1} max={100} step={1} value={mass} onChange={(e) => setMass(parseFloat(e.target.value))} style={{ width: "100%" }} />
                        </div>

                        <div>
                            <div style={{ fontSize: 13, color: C.slate, marginBottom: 4 }}>
                                F applicata = <strong>{formatNumber(applied, 0)} N</strong>
                            </div>
                            <input type="range" min={0} max={600} step={5} value={applied} onChange={(e) => setApplied(parseFloat(e.target.value))} style={{ width: "100%" }} />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <div>
                                <div style={{ fontSize: 13, color: C.slate, marginBottom: 4 }}>
                                    μₛ = <strong>{formatNumber(muS, 2)}</strong>
                                </div>
                                <input type="range" min={0.01} max={1.2} step={0.01} value={muS} onChange={(e) => setMuS(parseFloat(e.target.value))} style={{ width: "100%" }} />
                            </div>

                            <div>
                                <div style={{ fontSize: 13, color: C.slate, marginBottom: 4 }}>
                                    μ_d = <strong>{formatNumber(muD, 2)}</strong>
                                </div>
                                <input type="range" min={0.01} max={1.0} step={0.01} value={muD} onChange={(e) => setMuD(parseFloat(e.target.value))} style={{ width: "100%" }} />
                            </div>
                        </div>
                    </div>

                    <div style={{ height: 12 }} />

                    <div style={{ padding: 12, background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                        <div style={{ fontWeight: 800, marginBottom: 8 }}>Calcoli</div>
                        <div style={{ display: "grid", gap: 8, fontSize: 14 }}>
                            <div>
                                <Latex>{`N = m g = ${formatNumber(mass, 1)}\\cdot 9.81 = `}</Latex>{" "}
                                <strong>{formatNumber(N, 2)} N</strong>
                            </div>

                            <div>
                                <Latex>{`F_{s,\\max} = \\mu_s\\,N = ${formatNumber(muS, 2)}\\cdot ${formatNumber(N, 2)} = `}</Latex>{" "}
                                <strong>{formatNumber(FsMax, 2)} N</strong>
                            </div>

                            <div>
                                <Latex>{`F_d = \\mu_d\\,N = ${formatNumber(muD, 2)}\\cdot ${formatNumber(N, 2)} = `}</Latex>{" "}
                                <strong>{formatNumber(Fd, 2)} N</strong>
                            </div>

                            <div style={{ paddingTop: 8, borderTop: "1px solid #e2e8f0" }}>
                                <div>
                                    <span>Con F = {formatNumber(applied, 0)} N → </span>
                                    <strong style={{ color: regime.includes("statico") ? C.green : C.red }}>{regime}</strong>
                                </div>
                                <div style={{ fontSize: 13, color: C.slate, marginTop: 4 }}>
                                    Attrito effettivo: <strong>{formatNumber(friction, 2)} N</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ height: 12 }} />

                    <CollapsiblePanel title="📌 Tabella (valori tipici)" defaultOpen={!isMobile}>
                        <div style={{ display: "grid", gap: 10 }}>
                            <div style={{ fontSize: 13, color: C.slate }}>
                                Seleziona una riga per impostare automaticamente μₛ e μ_d:
                            </div>

                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                                    <thead>
                                    <tr style={{ background: "#f1f5f9" }}>
                                        <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #e2e8f0" }}>Materiale</th>
                                        <th style={{ textAlign: "center", padding: 10, borderBottom: "1px solid #e2e8f0" }}>μ_d</th>
                                        <th style={{ textAlign: "center", padding: 10, borderBottom: "1px solid #e2e8f0" }}>μₛ</th>
                                        <th style={{ textAlign: "center", padding: 10, borderBottom: "1px solid #e2e8f0" }} />
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {FRICTION_TABLE.map((row, i) => {
                                        const active = i === useTableIdx;
                                        return (
                                            <tr key={row.material} style={{ background: active ? "#eff6ff" : "#fff" }}>
                                                <td style={{ padding: 10, borderBottom: "1px solid #e2e8f0" }}>{row.material}</td>
                                                <td style={{ textAlign: "center", padding: 10, borderBottom: "1px solid #e2e8f0" }}>
                                                    {formatNumber(row.muD, 3)}
                                                </td>
                                                <td style={{ textAlign: "center", padding: 10, borderBottom: "1px solid #e2e8f0" }}>
                                                    {formatNumber(row.muS, 3)}
                                                </td>
                                                <td style={{ textAlign: "center", padding: 10, borderBottom: "1px solid #e2e8f0" }}>
                                                    <button
                                                        onClick={() => applyTable(i)}
                                                        style={{
                                                            padding: "8px 10px",
                                                            borderRadius: 10,
                                                            border: "1px solid #d1d5db",
                                                            background: active ? "#dbeafe" : "#fff",
                                                            cursor: "pointer",
                                                            fontWeight: 700,
                                                            fontSize: 12,
                                                        }}
                                                    >
                                                        Usa
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ fontSize: 12, color: C.slate }}>
                                Valori indicativi: dipendono dalle condizioni delle superfici.
                            </div>
                        </div>
                    </CollapsiblePanel>
                </ResponsiveCard>
            </div>

            <CollapsiblePanel title="📚 Leggi (riassunto)" defaultOpen={!isMobile}>
                <div style={{ display: "grid", gap: 10 }}>
                    <DisplayMath>{`F_{s} \\le F_{s,\\max} = \\mu_s\\,N`}</DisplayMath>
                    <DisplayMath>{`F_{d} = \\mu_d\\,N`}</DisplayMath>
                    <div style={{ fontSize: 13, color: C.slate }}>
                        L’attrito è parallelo alla superficie e opposto al moto (o al moto “che avverrebbe”).
                    </div>
                </div>
            </CollapsiblePanel>
        </div>
    );
}

// ================== Demo principale con Tabs ==================

export default function ForzeDemo() {
    const { isMobile } = useBreakpoint();

    // ✅ FIX: SwipeableTabs vuole { id, label, content }
    const tabs = useMemo(
        () => [
            { id: "forze", label: "Forze", content: <ForzeGeneraleTab isMobile={isMobile} /> },
            { id: "peso", label: "Forza peso", content: <ForzaPesoTab isMobile={isMobile} /> },
            { id: "elastica", label: "Forza elastica", content: <ForzaElasticaTab isMobile={isMobile} /> },
            { id: "attrito", label: "Attrito", content: <AttritoTab isMobile={isMobile} /> },
        ],
        [isMobile]
    );

    return (
        <DemoContainer
            title="Le forze"
            description="Demo interattiva su risultante, forza peso, forza elastica e attrito (statico/dinamico)."
        >
            <SwipeableTabs tabs={tabs} />
        </DemoContainer>
    );
}
