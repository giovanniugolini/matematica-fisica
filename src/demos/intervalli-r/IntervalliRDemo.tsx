import React, { useEffect, useMemo, useRef, useState } from "react";

/** ===== Types & constants ===== */
const SetKinds = {
    CLOSED: "[a,b]",
    OPEN: "(a,b)",
    LEFT_OPEN: "(a,b]",
    RIGHT_OPEN: "[a,b)",
    RAY_RIGHT_CLOSED: "[a, +∞)",
    RAY_RIGHT_OPEN: "(a, +∞)",
    RAY_LEFT_CLOSED: "(-∞, b]",
    RAY_LEFT_OPEN: "(-∞, b)",
    WHOLE: "(-∞, +∞)",
} as const;
type SetKind = typeof SetKinds[keyof typeof SetKinds];

type Geom = { left: number; right: number; width: number };

function clamp(v: number, a: number, b: number) {
    return Math.max(a, Math.min(b, v));
}

/** ---- TIPI PER LE VERIFICHE (evita l’errore TS con includes) ---- */
const BOUNDED_INTERVALS: ReadonlyArray<SetKind> = [
    SetKinds.CLOSED,
    SetKinds.OPEN,
    SetKinds.LEFT_OPEN,
    SetKinds.RIGHT_OPEN,
];
const RAY_RIGHT: ReadonlyArray<SetKind> = [
    SetKinds.RAY_RIGHT_CLOSED,
    SetKinds.RAY_RIGHT_OPEN,
];
const RAY_LEFT: ReadonlyArray<SetKind> = [
    SetKinds.RAY_LEFT_CLOSED,
    SetKinds.RAY_LEFT_OPEN,
];
const WITH_A_ENDPOINT: ReadonlyArray<SetKind> = [
    ...BOUNDED_INTERVALS,
    ...RAY_RIGHT,
];
const WITH_B_ENDPOINT: ReadonlyArray<SetKind> = [
    ...BOUNDED_INTERVALS,
    ...RAY_LEFT,
];
const A_INCLUDED: ReadonlyArray<SetKind> = [
    SetKinds.CLOSED,
    SetKinds.RIGHT_OPEN,
    SetKinds.RAY_RIGHT_CLOSED,
];
const B_INCLUDED: ReadonlyArray<SetKind> = [
    SetKinds.CLOSED,
    SetKinds.LEFT_OPEN,
    SetKinds.RAY_LEFT_CLOSED,
];

function describeSet(kind: SetKind, a: number, b: number) {
    const lowerBounded = WITH_A_ENDPOINT.includes(kind);
    const upperBounded = WITH_B_ENDPOINT.includes(kind);

    const inf: number | "-∞" = lowerBounded ? a : "-∞";
    const sup: number | "+∞" = upperBounded ? b : "+∞";

    let hasMin = false;
    let hasMax = false;
    switch (kind) {
        case SetKinds.CLOSED:
            hasMin = true; hasMax = true; break;
        case SetKinds.RIGHT_OPEN:
            hasMin = true; hasMax = false; break;
        case SetKinds.LEFT_OPEN:
            hasMin = false; hasMax = true; break;
        case SetKinds.OPEN:
            hasMin = false; hasMax = false; break;
        case SetKinds.RAY_RIGHT_CLOSED:
            hasMin = true; hasMax = false; break;
        case SetKinds.RAY_RIGHT_OPEN:
            hasMin = false; hasMax = false; break;
        case SetKinds.RAY_LEFT_CLOSED:
            hasMin = false; hasMax = true; break;
        case SetKinds.RAY_LEFT_OPEN:
            hasMin = false; hasMax = false; break;
        case SetKinds.WHOLE:
            hasMin = false; hasMax = false; break;
    }
    return { lowerBounded, upperBounded, inf, sup, hasMin, hasMax };
}

function Marker({ x, included, label }: { x: number; included: boolean; label?: string }) {
    const dotStyle: React.CSSProperties = {
        width: 12, height: 12, borderRadius: "50%", border: "2px solid #111",
        background: included ? "#111" : "#fff",
    };
    const wrap: React.CSSProperties = {
        position: "absolute", left: x, top: 24, transform: "translate(-50%,-50%)", textAlign: "center",
    };
    const labelStyle: React.CSSProperties = { fontSize: 12, marginTop: 4, color: "#334155" };
    return (
        <div style={wrap}>
            <div style={dotStyle} />
            {label && <div style={labelStyle}>{label}</div>}
        </div>
    );
}

/** ===== Component ===== */
export default function IntervalliRDemo() {
    // State
    const [kind, setKind] = useState<SetKind>(SetKinds.CLOSED);
    const [a, setA] = useState<number>(-2);
    const [b, setB] = useState<number>(3);
    const [speed, setSpeed] = useState<number>(0.8); // px/ms (convertita in unità matematiche via scala)
    const [playing, setPlaying] = useState<boolean>(true);

    // Geometria linea
    const lineRef = useRef<HTMLDivElement | null>(null);
    const [geom, setGeom] = useState<Geom>({ left: 0, right: 0, width: 0 });

    useEffect(() => {
        const updateGeom = () => {
            const el = lineRef.current;
            if (!el) return;
            const r = el.getBoundingClientRect();
            setGeom({ left: r.left, right: r.right, width: r.width });
        };
        updateGeom();
        window.addEventListener("resize", updateGeom);
        return () => window.removeEventListener("resize", updateGeom);
    }, []);

    // Mappatura ℝ <-> pixel
    const view = useMemo(() => {
        let minX: number, maxX: number;
        if (BOUNDED_INTERVALS.includes(kind)) {
            const pad = Math.max(1, (b - a) * 0.2);
            minX = a - pad;
            maxX = b + pad;
        } else if (RAY_RIGHT.includes(kind)) {
            const m = Math.max(1, Math.abs(a) + 2);
            minX = a - 2 * m;
            maxX = a + 8 * m;
        } else if (RAY_LEFT.includes(kind)) {
            const m = Math.max(1, Math.abs(b) + 2);
            minX = b - 8 * m;
            maxX = b + 2 * m;
        } else {
            minX = -10; maxX = 10;
        }
        const scale = geom.width > 0 ? (geom.width - 40) / (maxX - minX) : 1; // padding 20px lato
        const toPx = (x: number) => 20 + (x - minX) * scale;
        const fromPx = (px: number) => minX + (px - 20) / scale;
        return { minX, maxX, toPx, fromPx, scale };
    }, [geom.width, kind, a, b]);

    const desc = useMemo(() => describeSet(kind, a, b), [kind, a, b]);

    // Stato pallina (coordinate matematiche)
    const [x, setX] = useState<number>((a + b) / 2);
    const [vx, setVx] = useState<1 | -1>(1);
    const lastT = useRef<number | null>(null);

    useEffect(() => {
        const center = SetKinds.WHOLE === kind
            ? 0
            : (Number.isFinite(a) && Number.isFinite(b))
                ? (a + b) / 2
                : Number.isFinite(a) ? a + 1 : Number.isFinite(b) ? b - 1 : 0;
        setX(center);
        setVx(1);
    }, [kind, a, b]);

    useEffect(() => {
        if (!playing) { lastT.current = null; return; }
        let raf = 0;
        const tick = (t: number) => {
            if (!lastT.current) lastT.current = t;
            const dt = t - lastT.current; // ms
            lastT.current = t;

            const vu = speed / (view.scale || 1); // unità matematiche per ms
            let nx = x + (vx >= 0 ? vu * dt : -vu * dt);

            const hasLower = WITH_A_ENDPOINT.includes(kind);
            const hasUpper = WITH_B_ENDPOINT.includes(kind);
            const lower = hasLower ? a : -Infinity;
            const upper = hasUpper ? b : +Infinity;

            if (nx <= lower && Number.isFinite(lower)) { nx = lower; setVx(1); }
            else if (nx >= upper && Number.isFinite(upper)) { nx = upper; setVx(-1); }
            else if (!Number.isFinite(upper) && nx > view.maxX + 2) { nx = view.minX - 1; }
            else if (!Number.isFinite(lower) && nx < view.minX - 2) { nx = view.maxX + 1; }

            setX(nx);
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [playing, speed, view.scale, view.minX, view.maxX, x, vx, a, b, kind]);

    const px = view.toPx(x);
    const ax = Number.isFinite(a) ? view.toPx(a) : null;
    const bx = Number.isFinite(b) ? view.toPx(b) : null;

    const includeA = A_INCLUDED.includes(kind);
    const includeB = B_INCLUDED.includes(kind);

    /** ===== UI ===== */
    const card: React.CSSProperties = { background: "#fff", borderRadius: 16, padding: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" };
    const small: React.CSSProperties = { fontSize: 12, color: "#64748b" };

    return (
        <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
                Pallina su una retta — inf, sup, minimo, massimo
            </h1>
            <p style={{ color: "#334155", marginBottom: 12 }}>
                Scegli l'insieme: la pallina rimbalza sugli estremi se finiti; se non è limitato, prosegue oltre (con un piccolo “wrap” visuale).
            </p>

            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
                <div style={card}>
                    <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Tipo di insieme</label>
                    <select value={kind} onChange={(e) => setKind(e.target.value as SetKind)} style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #cbd5e1" }}>
                        {Object.values(SetKinds).map((k) => <option key={k} value={k}>{k}</option>)}
                    </select>
                    <div style={{ ...small, marginTop: 6 }}>Prova aperti/chiusi e semiretti per vedere quando sup/inf sono raggiunti (min/max).</div>
                </div>

                <div style={card}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div>
                            <label style={{ display: "block", fontSize: 14, fontWeight: 600 }}>a</label>
                            <input type="number" value={a} step={0.5} onChange={(e) => setA(parseFloat(e.target.value))}
                                   style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #cbd5e1" }} />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: 14, fontWeight: 600 }}>b</label>
                            <input type="number" value={b} step={0.5} onChange={(e) => setB(parseFloat(e.target.value))}
                                   style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #cbd5e1" }} />
                        </div>
                    </div>
                    <div style={{ ...small, marginTop: 6 }}>Ignorato se non serve (per semiretti/ℝ usa solo a o b).</div>
                </div>

                <div style={card}>
                    <label style={{ display: "block", fontSize: 14, fontWeight: 600 }}>Velocità</label>
                    <input type="range" min={0.2} max={2.0} step={0.1} value={speed}
                           onChange={(e) => setSpeed(parseFloat(e.target.value))}
                           style={{ width: "100%" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                        <button onClick={() => setPlaying((p) => !p)}
                                style={{ padding: "6px 12px", borderRadius: 10, border: "1px solid #cbd5e1", background: "#fff" }}>
                            {playing ? "Pausa" : "Play"}
                        </button>
                        <div style={small}>{playing ? "In esecuzione" : "In pausa"}</div>
                    </div>
                </div>

                <div style={card}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Proprietà dell'insieme</div>
                    <ul style={{ fontSize: 14, lineHeight: 1.8, margin: 0, paddingLeft: 18 }}>
                        <li>Inferiormente limitato: <b>{desc.lowerBounded ? "Sì" : "No"}</b></li>
                        <li>Superiormente limitato: <b>{desc.upperBounded ? "Sì" : "No"}</b></li>
                        <li>Estremo Inferiore: <b>{String(desc.inf)}</b> {desc.hasMin && <span style={{ fontSize: 12, color: "#047857" }}>(= minimo)</span>}</li>
                        <li>Estremo Superiore: <b>{String(desc.sup)}</b> {desc.hasMax && <span style={{ fontSize: 12, color: "#047857" }}>(= massimo)</span>}</li>
                        <li>Minimo esiste: <b>{desc.hasMin ? "Sì" : "No"}</b></li>
                        <li>Massimo esiste: <b>{desc.hasMax ? "Sì" : "No"}</b></li>
                    </ul>
                </div>
            </div>

            {/* Number line */}
            <div ref={lineRef}
                 style={{ position: "relative", border: "1px solid #e5e7eb", borderRadius: 16, background: "#fff",
                     boxShadow: "inset 0 1px 3px rgba(0,0,0,0.04)", height: 160, overflow: "hidden", marginTop: 12 }}>
                {/* base line */}
                <div style={{ position: "absolute", left: 20, right: 20, top: "50%", height: 2, background: "#111827" }} />

                {/* infinity arrows */}
                {!WITH_A_ENDPOINT.includes(kind) && (
                    <div style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)" }}>
                        <div style={{
                            width: 0, height: 0, borderTop: "6px solid transparent", borderBottom: "6px solid transparent",
                            borderRight: "12px solid #111827"
                        }} />
                    </div>
                )}
                {!WITH_B_ENDPOINT.includes(kind) && (
                    <div style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%) rotate(180deg)" }}>
                        <div style={{
                            width: 0, height: 0, borderTop: "6px solid transparent", borderBottom: "6px solid transparent",
                            borderRight: "12px solid #111827"
                        }} />
                    </div>
                )}

                {/* endpoints */}
                {Number.isFinite(a) && WITH_A_ENDPOINT.includes(kind) && ax !== null && (
                    <Marker x={ax} included={includeA} label="a" />
                )}
                {Number.isFinite(b) && WITH_B_ENDPOINT.includes(kind) && bx !== null && (
                    <Marker x={bx} included={includeB} label="b" />
                )}

                {/* shaded interval */}
                {(() => {
                    const y = 20; const thickness = 6;
                    let L = Number.isFinite(a) && ax !== null ? ax : 20;
                    let R = Number.isFinite(b) && bx !== null ? bx : (geom.width - 20);
                    if (RAY_RIGHT.includes(kind) && ax !== null) { L = ax; R = geom.width - 20; }
                    if (RAY_LEFT.includes(kind) && bx !== null) { L = 20; R = bx; }
                    if (kind === SetKinds.WHOLE) { L = 20; R = geom.width - 20; }
                    const barWrap: React.CSSProperties = { position: "absolute", left: 0, right: 0, top: `calc(50% - ${y}px)` };
                    const bar: React.CSSProperties = { position: "absolute", left: Math.min(L, R), width: Math.abs(R - L),
                        height: thickness, background: "rgba(59,130,246,0.25)", top: -thickness / 2 };
                    return <div style={barWrap}><div style={bar} /></div>;
                })()}

                {/* ball */}
                <div title="pallina"
                     style={{ position: "absolute", width: 20, height: 20, borderRadius: "50%", background: "#e11d48",
                         boxShadow: "0 2px 6px rgba(0,0,0,0.15)", left: px, top: "50%",
                         transform: "translate(-50%, -50%)" }} />
                {/* labels min/max */}
                {desc.hasMin && Number.isFinite(a) && ax !== null && (
                    <div style={{ position: "absolute", fontSize: 12, color: "#047857", left: ax, top: 64, transform: "translateX(-50%)" }}>min = a</div>
                )}
                {desc.hasMax && Number.isFinite(b) && bx !== null && (
                    <div style={{ position: "absolute", fontSize: 12, color: "#047857", left: bx, top: 64, transform: "translateX(-50%)" }}>max = b</div>
                )}
            </div>

            {/* legend */}
            <div style={{ marginTop: 12, fontSize: 14, color: "#334155" }}>
                <p style={{ margin: "6px 0" }}>
                    <b>Legenda:</b> punto pieno = estremo incluso; punto vuoto = estremo escluso.
                    Le frecce ai bordi indicano illimitatezza.
                </p>
                <p style={{ margin: "6px 0" }}>
                    Per (a,b) la pallina non può toccare a o b: quindi non esistono min/max anche se inf = a e sup = b.
                </p>
            </div>
        </div>
    );
}
