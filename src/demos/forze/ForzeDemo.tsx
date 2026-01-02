/**
 * ForzeDemo — stile "demo belle" (tipo CadutaLiberaDemo)
 * Tabs:
 * 0) Introduzione
 * 1) Forze (risultante)
 * 2) Forza peso
 * 3) Forza elastica
 * 4) Attrito
 */

import React, { useMemo, useState } from "react";
import {
    Latex,
    DemoContainer,
    SwipeableTabs,
    ResponsiveCard,
    CollapsiblePanel,
    useBreakpoint,
    NavigationButtons,
    StepCard,
    StepGrid,
    ResultBox,
    InfoBox,
    useStepNavigation,
} from "../../components/ui";
import { DisplayMath, InlineMath } from "../../components/ui/Latex";

// ========================= Stile / Costanti =========================

const COLORS = {
    text: "#0f172a",
    muted: "#475569",
    subtle: "#64748b",
    bgSoft: "#f8fafc",
    border: "#e2e8f0",
    blue: "#2563eb",
    green: "#16a34a",
    red: "#dc2626",
    amber: "#f59e0b",
};

// ========================= Oggetti (stile CadutaLibera) =========================

type ObjPreset = {
    id: string;
    label: string;
    emoji: string;
    massKg: number;
    fill?: string;
};

const OBJECTS: ObjPreset[] = [
    { id: "libro", label: "Libro", emoji: "📘", massKg: 0.9, fill: "#e2e8f0" },
    { id: "zaino", label: "Zaino", emoji: "🎒", massKg: 4.0, fill: "#e2e8f0" },
    { id: "valigia", label: "Valigia", emoji: "🧳", massKg: 12.0, fill: "#e2e8f0" },
    { id: "cassa", label: "Cassa", emoji: "📦", massKg: 18.0, fill: "#e2e8f0" },
    { id: "manubrio", label: "Manubrio", emoji: "🏋️", massKg: 20.0, fill: "#e2e8f0" },
    { id: "palla", label: "Palla", emoji: "⚽", massKg: 0.45, fill: "#e2e8f0" },
];

function findObject(id: string) {
    return OBJECTS.find((o) => o.id === id) ?? null;
}

// ========================= Helpers =========================

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

// ========================= SVG primitives =========================

function Arrow({
                   x1,
                   y1,
                   x2,
                   y2,
                   color = COLORS.red,
                   width = 3,
                   headSize = 10,
               }: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    color?: string;
    width?: number;
    headSize?: number;
}) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.max(1e-6, Math.sqrt(dx * dx + dy * dy));
    const ux = dx / len;
    const uy = dy / len;

    const hx = x2 - ux * headSize;
    const hy = y2 - uy * headSize;

    const px = -uy;
    const py = ux;

    const leftX = hx + px * (headSize * 0.5);
    const leftY = hy + py * (headSize * 0.5);
    const rightX = hx - px * (headSize * 0.5);
    const rightY = hy - py * (headSize * 0.5);

    return (
        <>
            <line
                x1={x1}
                y1={y1}
                x2={hx}
                y2={hy}
                stroke={color}
                strokeWidth={width}
                strokeLinecap="round"
            />
            <polygon points={`${x2},${y2} ${leftX},${leftY} ${rightX},${rightY}`} fill={color} />
        </>
    );
}

function Block({
                   x,
                   y,
                   w,
                   h,
                   fill = "#e2e8f0",
                   stroke = "#475569",
               }: {
    x: number;
    y: number;
    w: number;
    h: number;
    fill?: string;
    stroke?: string;
}) {
    return <rect x={x} y={y} width={w} height={h} rx={10} fill={fill} stroke={stroke} strokeWidth={2} />;
}

function Ground({ y, color = "#94a3b8" }: { y: number; color?: string }) {
    return (
        <>
            <line x1={30} y1={y} x2={490} y2={y} stroke={color} strokeWidth={3} />
            {Array.from({ length: 20 }).map((_, i) => {
                const x = 40 + i * 24;
                return <line key={i} x1={x} y1={y} x2={x - 10} y2={y + 14} stroke={color} strokeWidth={2} />;
            })}
        </>
    );
}

function Spring({
                    x,
                    y,
                    length,
                    amplitude = 10,
                    turns = 7,
                    color = COLORS.blue,
                }: {
    x: number;
    y: number;
    length: number;
    amplitude?: number;
    turns?: number;
    color?: string;
}) {
    const pts: { x: number; y: number }[] = [];
    const step = length / (turns * 2);
    pts.push({ x, y });
    for (let i = 1; i <= turns * 2; i++) {
        pts.push({
            x: x + i * step,
            y: y + (i % 2 === 0 ? -amplitude : amplitude),
        });
    }
    pts.push({ x: x + length, y });

    const d = pts.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
    return <path d={d} fill="none" stroke={color} strokeWidth={3} strokeLinejoin="round" />;
}

function SectionTitle({ icon, title }: { icon: string; title: string }) {
    return (
        <div style={{ fontWeight: 800, fontSize: 16, color: COLORS.text, marginBottom: 12 }}>
            {icon} {title}
        </div>
    );
}

function ObjSelector({
                         value,
                         onChange,
                         note,
                     }: {
    value: string; // objectId or "custom"
    onChange: (id: string) => void;
    note?: string;
}) {
    return (
        <div>
            <div style={{ fontSize: 12, color: COLORS.subtle, marginBottom: 6 }}>
                Oggetto {note ? <span style={{ color: COLORS.subtle }}>— {note}</span> : null}
            </div>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: `1px solid ${COLORS.border}`,
                    background: "#fff",
                    fontWeight: 700,
                }}
            >
                <option value="custom">🛠️ Personalizzato</option>
                {OBJECTS.map((o) => (
                    <option key={o.id} value={o.id}>
                        {o.emoji} {o.label} — m ≈ {formatNumber(o.massKg, 2)} kg
                    </option>
                ))}
            </select>
        </div>
    );
}

// ========================= Tab 0 — Introduzione =========================

function IntroTab({ isMobile }: { isMobile: boolean }) {
    return (
        <div style={{ display: "grid", gap: 12 }}>
            <ResponsiveCard>
                <SectionTitle icon="📌" title="Che cos’è una forza" />
                <div style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.5 }}>
                    <Latex>{`\\text{Una forza è una grandezza vettoriale che può modificare lo stato di moto o deformare un corpo.}`}</Latex>
                </div>

                <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                    <div style={{ padding: 12, borderRadius: 12, background: COLORS.bgSoft, border: `1px solid ${COLORS.border}` }}>
                        <strong>Vettore</strong> = direzione + verso + intensità + punto di applicazione.
                    </div>
                    <div style={{ padding: 12, borderRadius: 12, background: COLORS.bgSoft, border: `1px solid ${COLORS.border}` }}>
                        Unità di misura: <InlineMath>{`1\\,\\text{N}`}</InlineMath> (Newton).
                    </div>
                </div>
            </ResponsiveCard>

            <div
                style={{
                    display: "grid",
                    gap: 12,
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    alignItems: "start",
                }}
            >
                <ResponsiveCard>
                    <SectionTitle icon="🧭" title="Figura: forza come vettore" />
                    <svg viewBox="0 0 520 260" style={{ width: "100%", height: "auto", display: "block" }}>
                        <rect x={10} y={10} width={500} height={240} rx={16} fill={COLORS.bgSoft} stroke={COLORS.border} />
                        <Ground y={200} />

                        {(() => {
                            const bx = 210,
                                by = 140,
                                bw = 100,
                                bh = 60;
                            const cx = bx + bw / 2; // baricentro
                            const cy = by + bh / 2; // baricentro
                            return (
                                <>
                                    <Block x={bx} y={by} w={bw} h={bh} />
                                    <circle cx={cx} cy={cy} r={4} fill="#0f172a" opacity={0.7} />
                                    <Arrow x1={cx} y1={cy} x2={380} y2={80} color={COLORS.red} width={4} headSize={14} />
                                    <text x={392} y={84} fontSize={18} fill="#991b1b" fontWeight="900">
                                        F
                                    </text>
                                </>
                            );
                        })()}

                        <text x={28} y={40} fontSize={13} fill={COLORS.muted}>
                            • origine della freccia = punto di applicazione
                        </text>
                        <text x={28} y={62} fontSize={13} fill={COLORS.muted}>
                            • lunghezza = intensità
                        </text>
                        <text x={28} y={84} fontSize={13} fill={COLORS.muted}>
                            • direzione + verso = orientamento del vettore
                        </text>
                    </svg>
                </ResponsiveCard>

                <ResponsiveCard>
                    <SectionTitle icon="🧠" title="Promemoria vettori" />
                    <div style={{ display: "grid", gap: 10 }}>
                        <DisplayMath>{`\\vec F = (F_x, F_y)`}</DisplayMath>
                        <DisplayMath>{`|\\vec F| = \\sqrt{F_x^2 + F_y^2}`}</DisplayMath>

                        <CollapsiblePanel title="Perché serve spesso scomporre in componenti?" defaultOpen={!isMobile}>
                            <div style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.5 }}>
                                Molti problemi si risolvono lavorando sulle componenti lungo gli assi (es. lungo x per moto su piano).
                            </div>
                        </CollapsiblePanel>
                    </div>
                </ResponsiveCard>
            </div>
        </div>
    );
}

// ========================= Tab 1 — Risultante =========================

function RisultanteTab({ isMobile }: { isMobile: boolean }) {
    const totalSteps = 4;
    const nav = useStepNavigation(totalSteps);

    const [f1, setF1] = useState(30);
    const [f2, setF2] = useState(40);
    const [thetaDeg, setThetaDeg] = useState(60);

    const computed = useMemo(() => {
        const th = clamp(thetaDeg, 0, 180);
        const f2x = f2 * Math.cos(degToRad(th));
        const f2y = f2 * Math.sin(degToRad(th));
        const rx = f1 + f2x;
        const ry = f2y;
        const r = Math.sqrt(rx * rx + ry * ry);
        const alpha = r === 0 ? 0 : radToDeg(Math.atan2(ry, rx));
        return { th, f2x, f2y, rx, ry, r, alpha };
    }, [f1, f2, thetaDeg]);

    return (
        <div style={{ display: "grid", gap: 12 }}>
            <ResponsiveCard>
                <SectionTitle icon="🎯" title="Obiettivo" />
                <div style={{ color: COLORS.muted, fontSize: 14 }}>
                    <Latex>{`\\text{Calcolare la risultante }\\ \\vec R = \\vec F_1 + \\vec F_2\\ \\text{e trovare modulo e direzione.}`}</Latex>
                </div>
            </ResponsiveCard>

            <div style={{ display: "grid", gap: 12, gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr" }}>
                <ResponsiveCard>
                    <SectionTitle icon="📈" title="Figura" />
                    <svg viewBox="0 0 520 320" style={{ width: "100%", height: "auto", display: "block" }}>
                        <rect x={10} y={10} width={500} height={300} rx={16} fill="#ffffff" stroke={COLORS.border} />

                        <line x1={80} y1={260} x2={460} y2={260} stroke="#94a3b8" strokeWidth={2} />
                        <line x1={80} y1={260} x2={80} y2={60} stroke="#94a3b8" strokeWidth={2} />
                        <text x={468} y={265} fontSize={14} fill={COLORS.subtle}>
                            x
                        </text>
                        <text x={74} y={52} fontSize={14} fill={COLORS.subtle}>
                            y
                        </text>

                        <circle cx={80} cy={260} r={4} fill="#0f172a" opacity={0.75} />

                        {(() => {
                            const s = 3.2;
                            const ox = 80,
                                oy = 260;

                            const f1x = f1 * s;
                            const f2x = computed.f2x * s;
                            const f2y = computed.f2y * s;
                            const rx = computed.rx * s;
                            const ry = computed.ry * s;

                            return (
                                <>
                                    <Arrow x1={ox} y1={oy} x2={ox + f1x} y2={oy} color={COLORS.blue} width={4} headSize={14} />
                                    <text x={ox + f1x + 10} y={oy + 4} fontSize={16} fill="#1d4ed8" fontWeight="900">
                                        F₁
                                    </text>

                                    <Arrow x1={ox} y1={oy} x2={ox + f2x} y2={oy - f2y} color={COLORS.green} width={4} headSize={14} />
                                    <text x={ox + f2x + 10} y={oy - f2y} fontSize={16} fill="#166534" fontWeight="900">
                                        F₂
                                    </text>

                                    <line
                                        x1={ox + f1x}
                                        y1={oy}
                                        x2={ox + rx}
                                        y2={oy - ry}
                                        stroke="#94a3b8"
                                        strokeWidth={2}
                                        strokeDasharray="6 6"
                                    />
                                    <line
                                        x1={ox + f2x}
                                        y1={oy - f2y}
                                        x2={ox + rx}
                                        y2={oy - ry}
                                        stroke="#94a3b8"
                                        strokeWidth={2}
                                        strokeDasharray="6 6"
                                    />

                                    <Arrow x1={ox} y1={oy} x2={ox + rx} y2={oy - ry} color={COLORS.red} width={5} headSize={16} />
                                    <text x={ox + rx + 10} y={oy - ry + 4} fontSize={16} fill="#991b1b" fontWeight="900">
                                        R
                                    </text>

                                    <path
                                        d={`M ${ox + 35} ${oy} A 35 35 0 0 1 ${ox + 35 * Math.cos(degToRad(computed.th))} ${
                                            oy - 35 * Math.sin(degToRad(computed.th))
                                        }`}
                                        fill="none"
                                        stroke={COLORS.amber}
                                        strokeWidth={3}
                                    />
                                    <text x={ox + 44} y={oy - 18} fontSize={14} fill="#b45309" fontWeight="900">
                                        θ
                                    </text>
                                </>
                            );
                        })()}
                    </svg>

                    <div style={{ marginTop: 10, fontSize: 13, color: COLORS.subtle }}>
                        Suggerimento: osserva come cambiano <strong>Rx</strong> e <strong>Ry</strong> al variare di θ.
                    </div>
                </ResponsiveCard>

                <ResponsiveCard>
                    <SectionTitle icon="⚙️" title="Parametri + Procedura" />

                    <div style={{ display: "grid", gap: 12 }}>
                        <div>
                            <div style={{ fontSize: 12, color: COLORS.subtle, marginBottom: 6 }}>
                                F₁ = <strong>{formatNumber(f1, 0)} N</strong>
                            </div>
                            <input type="range" min={5} max={100} step={1} value={f1} onChange={(e) => setF1(parseFloat(e.target.value))} style={{ width: "100%" }} />
                        </div>

                        <div>
                            <div style={{ fontSize: 12, color: COLORS.subtle, marginBottom: 6 }}>
                                F₂ = <strong>{formatNumber(f2, 0)} N</strong>
                            </div>
                            <input type="range" min={5} max={100} step={1} value={f2} onChange={(e) => setF2(parseFloat(e.target.value))} style={{ width: "100%" }} />
                        </div>

                        <div>
                            <div style={{ fontSize: 12, color: COLORS.subtle, marginBottom: 6 }}>
                                θ = <strong>{formatNumber(thetaDeg, 0)}°</strong>
                            </div>
                            <input type="range" min={0} max={180} step={1} value={thetaDeg} onChange={(e) => setThetaDeg(parseFloat(e.target.value))} style={{ width: "100%" }} />
                        </div>

                        <NavigationButtons currentStep={nav.currentStep} totalSteps={totalSteps} onNext={nav.nextStep} onPrev={nav.prevStep} onShowAll={nav.showAll} />

                        <StepGrid columns={1} gap={10}>
                            <StepCard stepNumber={1} title="Scomponi F₂" color="green" isActive={nav.isStepActive(0)}>
                                <div style={{ fontSize: 14 }}>
                                    <Latex>{`F_{2x}=F_2\\cos\\theta,\\quad F_{2y}=F_2\\sin\\theta`}</Latex>
                                    <div style={{ marginTop: 8 }}>
                                        <Latex>{`F_{2x}=${formatNumber(f2, 0)}\\cos(${formatNumber(computed.th, 0)}^\\circ)=`}</Latex>{" "}
                                        <strong>{formatNumber(computed.f2x, 2)} N</strong>
                                    </div>
                                    <div>
                                        <Latex>{`F_{2y}=${formatNumber(f2, 0)}\\sin(${formatNumber(computed.th, 0)}^\\circ)=`}</Latex>{" "}
                                        <strong>{formatNumber(computed.f2y, 2)} N</strong>
                                    </div>
                                </div>
                            </StepCard>

                            <StepCard stepNumber={2} title="Somma le componenti" color="blue" isActive={nav.isStepActive(1)}>
                                <div style={{ fontSize: 14 }}>
                                    <Latex>{`R_x=F_1+F_{2x},\\quad R_y=F_{2y}`}</Latex>
                                    <div style={{ marginTop: 8 }}>
                                        <Latex>{`R_x=${formatNumber(f1, 0)}+${formatNumber(computed.f2x, 2)}=`}</Latex>{" "}
                                        <strong>{formatNumber(computed.rx, 2)} N</strong>
                                    </div>
                                    <div>
                                        <Latex>{`R_y=${formatNumber(computed.f2y, 2)}=`}</Latex> <strong>{formatNumber(computed.ry, 2)} N</strong>
                                    </div>
                                </div>
                            </StepCard>

                            <StepCard stepNumber={3} title="Modulo" color="purple" isActive={nav.isStepActive(2)}>
                                <div style={{ fontSize: 14 }}>
                                    <Latex>{`|\\vec R|=\\sqrt{R_x^2+R_y^2}`}</Latex>
                                    <div style={{ marginTop: 8 }}>
                                        <Latex>{`|\\vec R|=\\sqrt{(${formatNumber(computed.rx, 2)})^2+(${formatNumber(computed.ry, 2)})^2}=`}</Latex>{" "}
                                        <strong style={{ color: "#991b1b" }}>{formatNumber(computed.r, 2)} N</strong>
                                    </div>
                                </div>
                            </StepCard>

                            <StepCard stepNumber={4} title="Direzione" color="amber" isActive={nav.isStepActive(3)}>
                                <div style={{ fontSize: 14 }}>
                                    <Latex>{`\\alpha=\\arctan\\left(\\frac{R_y}{R_x}\\right)`}</Latex>
                                    <div style={{ marginTop: 8 }}>
                                        <Latex>{`\\alpha=\\arctan\\left(\\frac{${formatNumber(computed.ry, 2)}}{${formatNumber(computed.rx, 2)}}\\right)=`}</Latex>{" "}
                                        <strong style={{ color: "#b45309" }}>{formatNumber(computed.alpha, 1)}°</strong>
                                    </div>
                                </div>
                            </StepCard>
                        </StepGrid>

                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 6 }}>
                            <ResultBox label="Modulo">
                                <Latex>{`${formatNumber(computed.r, 2)}\\,N`}</Latex>
                            </ResultBox>
                            <ResultBox label="Direzione">
                                <Latex>{`${formatNumber(computed.alpha, 1)}^\\circ`}</Latex>
                            </ResultBox>
                        </div>

                        <InfoBox variant="gray" title="Nota">
                            Se θ = 0°, le forze sono collineari e la risultante è la somma dei moduli.
                        </InfoBox>
                    </div>
                </ResponsiveCard>
            </div>
        </div>
    );
}

// ========================= Tab 2 — Forza peso =========================

const PLANETS = [
    { id: "Terra", g: 9.81 },
    { id: "Luna", g: 1.62 },
    { id: "Marte", g: 3.69 },
    { id: "Giove", g: 24.79 },
];

function PesoTab({ isMobile }: { isMobile: boolean }) {
    const totalSteps = 3;
    const nav = useStepNavigation(totalSteps);

    const [objId, setObjId] = useState<string>(OBJECTS[0]?.id ?? "custom");
    const [mass, setMass] = useState<number>(OBJECTS[0]?.massKg ?? 2.0);
    const [planetId, setPlanetId] = useState<(typeof PLANETS)[number]["id"]>("Terra");

    const obj = objId === "custom" ? null : findObject(objId);
    const emoji = obj?.emoji ?? "🧱";
    const fill = obj?.fill ?? "#e2e8f0";

    const g = PLANETS.find((p) => p.id === planetId)?.g ?? 9.81;
    const P = mass * g;
    const L = clamp(P * 5, 30, 160);

    const handleObjChange = (id: string) => {
        setObjId(id);
        const o = findObject(id);
        if (o) setMass(o.massKg);
    };

    const handleMassChange = (m: number) => {
        setMass(m);
        setObjId("custom");
    };

    return (
        <div style={{ display: "grid", gap: 12 }}>
            <ResponsiveCard>
                <SectionTitle icon="🎯" title="Obiettivo" />
                <div style={{ color: COLORS.muted, fontSize: 14 }}>
                    <Latex>{`\\text{Calcolare la forza peso }\\ \\vec P\\ \\text{con } P=mg\\ \\text{e rappresentarla come vettore verticale.}`}</Latex>
                </div>
            </ResponsiveCard>

            <div style={{ display: "grid", gap: 12, gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr" }}>
                <ResponsiveCard>
                    <SectionTitle icon="📈" title="Figura" />
                    <svg viewBox="0 0 520 320" style={{ width: "100%", height: "auto", display: "block" }}>
                        <rect x={10} y={10} width={500} height={300} rx={16} fill="#ffffff" stroke={COLORS.border} />
                        <Ground y={250} />

                        {(() => {
                            const bx = 230,
                                by = 190,
                                bw = 80,
                                bh = 60;
                            const cx = bx + bw / 2;
                            const cy = by + bh / 2;

                            return (
                                <>
                                    <Block x={bx} y={by} w={bw} h={bh} fill={fill} />
                                    <text x={cx} y={cy + 10} textAnchor="middle" fontSize={26}>
                                        {emoji}
                                    </text>

                                    <circle cx={cx} cy={cy} r={4} fill="#0f172a" opacity={0.7} />
                                    <Arrow x1={cx} y1={cy} x2={cx} y2={cy + L} color={COLORS.red} width={5} headSize={16} />
                                    <text x={cx + 12} y={cy + L - 6} fontSize={18} fill="#991b1b" fontWeight="900">
                                        P
                                    </text>
                                </>
                            );
                        })()}

                        <text x={32} y={46} fontSize={14} fill={COLORS.muted}>
                            Direzione: verticale — Verso: verso il basso
                        </text>
                    </svg>
                </ResponsiveCard>

                <ResponsiveCard>
                    <SectionTitle icon="⚙️" title="Parametri + Procedura" />
                    <div style={{ display: "grid", gap: 12 }}>
                        <ObjSelector
                            value={objId}
                            onChange={handleObjChange}
                            note="imposta automaticamente la massa"
                        />

                        <div>
                            <div style={{ fontSize: 12, color: COLORS.subtle, marginBottom: 6 }}>
                                Massa m = <strong>{formatNumber(mass, 2)} kg</strong>
                            </div>
                            <input
                                type="range"
                                min={0.1}
                                max={40}
                                step={0.1}
                                value={mass}
                                onChange={(e) => handleMassChange(parseFloat(e.target.value))}
                                style={{ width: "100%" }}
                            />
                        </div>

                        <div>
                            <div style={{ fontSize: 12, color: COLORS.subtle, marginBottom: 6 }}>
                                Pianeta: <strong>{planetId}</strong> (g = {formatNumber(g, 2)} N/kg)
                            </div>
                            <select
                                value={planetId}
                                onChange={(e) => setPlanetId(e.target.value as any)}
                                style={{
                                    width: "100%",
                                    padding: "10px 12px",
                                    borderRadius: 10,
                                    border: `1px solid ${COLORS.border}`,
                                    background: "#fff",
                                    fontWeight: 700,
                                }}
                            >
                                {PLANETS.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.id} — g = {formatNumber(p.g, 2)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <NavigationButtons currentStep={nav.currentStep} totalSteps={totalSteps} onNext={nav.nextStep} onPrev={nav.prevStep} onShowAll={nav.showAll} />

                        <StepGrid columns={1} gap={10}>
                            <StepCard stepNumber={1} title="Formula" color="blue" isActive={nav.isStepActive(0)}>
                                <DisplayMath>{`P = m g`}</DisplayMath>
                            </StepCard>

                            <StepCard stepNumber={2} title="Sostituzione" color="green" isActive={nav.isStepActive(1)}>
                                <div style={{ fontSize: 14 }}>
                                    <Latex>{`P=${formatNumber(mass, 2)}\\cdot ${formatNumber(g, 2)}=`}</Latex>{" "}
                                    <strong style={{ color: "#991b1b" }}>{formatNumber(P, 2)} N</strong>
                                </div>
                            </StepCard>

                            <StepCard stepNumber={3} title="Interpretazione" color="amber" isActive={nav.isStepActive(2)}>
                                <div style={{ fontSize: 14, color: COLORS.muted }}>
                                    Direzione verticale, verso verso il basso, intensità <strong>{formatNumber(P, 2)} N</strong>.
                                </div>
                            </StepCard>
                        </StepGrid>

                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                            <ResultBox label="Peso">
                                <Latex>{`${formatNumber(P, 2)}\\,N`}</Latex>
                            </ResultBox>
                        </div>

                        <InfoBox variant="gray" title="Attenzione">
                            Massa (kg) ≠ peso (N). La massa non cambia, il peso sì.
                        </InfoBox>
                    </div>
                </ResponsiveCard>
            </div>
        </div>
    );
}

// ========================= Tab 3 — Forza elastica =========================

function ElasticaTab({ isMobile }: { isMobile: boolean }) {
    const totalSteps = 4;
    const nav = useStepNavigation(totalSteps);

    const [k, setK] = useState(200);
    const [x, setX] = useState(0.06);

    const F = -k * x;
    const isStretch = x >= 0;
    const L = clamp(Math.abs(F) * 0.35, 25, 140);

    return (
        <div style={{ display: "grid", gap: 12 }}>
            <ResponsiveCard>
                <SectionTitle icon="🎯" title="Obiettivo" />
                <div style={{ color: COLORS.muted, fontSize: 14 }}>
                    <Latex>{`\\text{Calcolare la forza elastica con la legge di Hooke:}\\ \\ F=-kx.`}</Latex>
                </div>
            </ResponsiveCard>

            <div style={{ display: "grid", gap: 12, gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr" }}>
                <ResponsiveCard>
                    <SectionTitle icon="📈" title="Figura" />
                    <svg viewBox="0 0 520 320" style={{ width: "100%", height: "auto", display: "block" }}>
                        <rect x={10} y={10} width={500} height={300} rx={16} fill="#ffffff" stroke={COLORS.border} />

                        <rect x={40} y={110} width={30} height={140} fill="#cbd5e1" stroke="#64748b" strokeWidth={2} />
                        {Array.from({ length: 8 }).map((_, i) => (
                            <line key={i} x1={40} y1={120 + i * 16} x2={70} y2={112 + i * 16} stroke="#94a3b8" strokeWidth={2} />
                        ))}

                        <Spring x={70} y={180} length={220 + x * 800} amplitude={10} turns={7} color={COLORS.blue} />

                        {(() => {
                            const bx = 320 + x * 800;
                            const by = 150;
                            const bw = 90;
                            const bh = 60;
                            const cx = bx + bw / 2;
                            const cy = by + bh / 2;

                            return (
                                <>
                                    <Block x={bx} y={by} w={bw} h={bh} />
                                    <circle cx={cx} cy={cy} r={4} fill="#0f172a" opacity={0.7} />

                                    <Arrow x1={365} y1={245} x2={cx} y2={245} color={COLORS.green} width={4} headSize={14} />
                                    <text x={cx + 6} y={240} fontSize={16} fill="#166534" fontWeight="900">
                                        x
                                    </text>

                                    {isStretch ? (
                                        <Arrow x1={cx} y1={cy} x2={cx - L} y2={cy} color={COLORS.red} width={5} headSize={16} />
                                    ) : (
                                        <Arrow x1={cx} y1={cy} x2={cx + L} y2={cy} color={COLORS.red} width={5} headSize={16} />
                                    )}
                                    <text x={cx + (isStretch ? -L - 22 : L + 10)} y={cy - 6} fontSize={16} fill="#991b1b" fontWeight="900">
                                        F
                                    </text>
                                </>
                            );
                        })()}
                    </svg>

                    <div style={{ marginTop: 10, fontSize: 13, color: COLORS.subtle }}>
                        La forza elastica tende a riportare la molla verso l’equilibrio.
                    </div>
                </ResponsiveCard>

                <ResponsiveCard>
                    <SectionTitle icon="⚙️" title="Parametri + Procedura" />
                    <div style={{ display: "grid", gap: 12 }}>
                        <div>
                            <div style={{ fontSize: 12, color: COLORS.subtle, marginBottom: 6 }}>
                                k = <strong>{formatNumber(k, 0)} N/m</strong>
                            </div>
                            <input type="range" min={20} max={600} step={10} value={k} onChange={(e) => setK(parseFloat(e.target.value))} style={{ width: "100%" }} />
                        </div>

                        <div>
                            <div style={{ fontSize: 12, color: COLORS.subtle, marginBottom: 6 }}>
                                x = <strong>{formatNumber(x, 3)} m</strong>{" "}
                                <span style={{ color: isStretch ? "#166534" : "#b45309", fontWeight: 900 }}>
                  ({isStretch ? "allungamento" : "compressione"})
                </span>
                            </div>
                            <input type="range" min={-0.12} max={0.12} step={0.005} value={x} onChange={(e) => setX(parseFloat(e.target.value))} style={{ width: "100%" }} />
                        </div>

                        <NavigationButtons currentStep={nav.currentStep} totalSteps={totalSteps} onNext={nav.nextStep} onPrev={nav.prevStep} onShowAll={nav.showAll} />

                        <StepGrid columns={1} gap={10}>
                            <StepCard stepNumber={1} title="Legge di Hooke" color="blue" isActive={nav.isStepActive(0)}>
                                <DisplayMath>{`F=-kx`}</DisplayMath>
                                <div style={{ fontSize: 13, color: COLORS.subtle }}>Il segno “−” indica verso opposto allo spostamento.</div>
                            </StepCard>

                            <StepCard stepNumber={2} title="Sostituzione" color="green" isActive={nav.isStepActive(1)}>
                                <div style={{ fontSize: 14 }}>
                                    <Latex>{`F=-(${formatNumber(k, 0)})\\cdot(${formatNumber(x, 3)})=`}</Latex>{" "}
                                    <strong style={{ color: "#991b1b" }}>{formatNumber(F, 2)} N</strong>
                                </div>
                            </StepCard>

                            <StepCard stepNumber={3} title="Segno e verso" color="amber" isActive={nav.isStepActive(2)}>
                                <div style={{ fontSize: 14, color: COLORS.muted }}>
                                    {F === 0 ? (
                                        <>Se x = 0 allora F = 0 (equilibrio).</>
                                    ) : isStretch ? (
                                        <>Se x &gt; 0 allora F &lt; 0: la forza “tira indietro”.</>
                                    ) : (
                                        <>Se x &lt; 0 allora F &gt; 0: la forza “spinge in avanti”.</>
                                    )}
                                </div>
                            </StepCard>

                            <StepCard stepNumber={4} title="Modulo" color="purple" isActive={nav.isStepActive(3)}>
                                <div style={{ fontSize: 14 }}>
                                    <Latex>{`|F|=k|x|=${formatNumber(k, 0)}\\cdot ${formatNumber(Math.abs(x), 3)}=`}</Latex>{" "}
                                    <strong>{formatNumber(Math.abs(F), 2)} N</strong>
                                </div>
                            </StepCard>
                        </StepGrid>

                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                            <ResultBox label="Forza elastica">
                                <Latex>{`${formatNumber(F, 2)}\\,N`}</Latex>
                            </ResultBox>
                            <ResultBox label="Modulo">
                                <Latex>{`${formatNumber(Math.abs(F), 2)}\\,N`}</Latex>
                            </ResultBox>
                        </div>

                        <InfoBox variant="gray" title="Nota">
                            In molti esercizi basta il modulo <InlineMath>{`|F|=k|x|`}</InlineMath>, ma il verso è importante nei problemi di dinamica.
                        </InfoBox>
                    </div>
                </ResponsiveCard>
            </div>
        </div>
    );
}

// ========================= Tab 4 — Attrito =========================

const FRICTION_TABLE = [
    { material: "Gomma su cemento (asciutto)", muD: 0.8, muS: 1.0 },
    { material: "Acciaio su acciaio", muD: 0.57, muS: 0.74 },
    { material: "Vetro su vetro", muD: 0.4, muS: 0.94 },
    { material: "Legno su pelle", muD: 0.4, muS: 0.5 },
    { material: "Gomma su cemento (bagnato)", muD: 0.25, muS: 0.3 },
    { material: "Sci su neve", muD: 0.05, muS: 0.1 },
];

function AttritoTab({ isMobile }: { isMobile: boolean }) {
    const totalSteps = 4;
    const nav = useStepNavigation(totalSteps);

    const [objId, setObjId] = useState<string>(OBJECTS[3]?.id ?? "custom"); // default: cassa
    const [mass, setMass] = useState<number>(OBJECTS[3]?.massKg ?? 10);

    const [muS, setMuS] = useState(0.7);
    const [muD, setMuD] = useState(0.5);
    const [applied, setApplied] = useState(40);
    const [tableIdx, setTableIdx] = useState(1);

    const obj = objId === "custom" ? null : findObject(objId);
    const emoji = obj?.emoji ?? "📦";
    const fill = obj?.fill ?? "#e2e8f0";

    const handleObjChange = (id: string) => {
        setObjId(id);
        const o = findObject(id);
        if (o) setMass(o.massKg);
    };
    const handleMassChange = (m: number) => {
        setMass(m);
        setObjId("custom");
    };

    const g = 9.81;
    const N = mass * g;
    const FsMax = muS * N;
    const Fd = muD * N;

    const isStatic = applied <= FsMax;
    const frictionEff = isStatic ? applied : Fd;

    const s = 0.9;
    const LF = clamp(applied * s, 20, 200);
    const LFa = clamp(frictionEff * s, 20, 200);
    const LN = clamp(N * 0.4, 30, 160);
    const LP = clamp(N * 0.4, 30, 160);

    const applyRow = (idx: number) => {
        const row = FRICTION_TABLE[idx];
        if (!row) return;
        setTableIdx(idx);
        setMuD(row.muD);
        setMuS(row.muS);
    };

    return (
        <div style={{ display: "grid", gap: 12 }}>
            <ResponsiveCard>
                <SectionTitle icon="🎯" title="Obiettivo" />
                <div style={{ color: COLORS.muted, fontSize: 14 }}>
                    <Latex>{`\\text{Distinguere attrito statico e dinamico e calcolare la forza di attrito.}`}</Latex>
                </div>
            </ResponsiveCard>

            <div style={{ display: "grid", gap: 12, gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr" }}>
                <ResponsiveCard>
                    <SectionTitle icon="📈" title="Figura" />
                    <svg viewBox="0 0 520 320" style={{ width: "100%", height: "auto", display: "block" }}>
                        <rect x={10} y={10} width={500} height={300} rx={16} fill="#ffffff" stroke={COLORS.border} />
                        <Ground y={240} />

                        {(() => {
                            const bx = 220,
                                by = 180,
                                bw = 100,
                                bh = 60;
                            const cx = bx + bw / 2;
                            const cy = by + bh / 2;

                            return (
                                <>
                                    <Block x={bx} y={by} w={bw} h={bh} fill={fill} />
                                    <text x={cx} y={cy + 10} textAnchor="middle" fontSize={26}>
                                        {emoji}
                                    </text>

                                    <circle cx={cx} cy={cy} r={4} fill="#0f172a" opacity={0.7} />

                                    <Arrow x1={cx} y1={cy} x2={cx + LF} y2={cy} color={COLORS.blue} width={5} headSize={16} />
                                    <text x={cx + LF + 10} y={cy - 4} fontSize={16} fill="#1d4ed8" fontWeight="900">
                                        F
                                    </text>

                                    <Arrow x1={cx} y1={cy} x2={cx - LFa} y2={cy} color={COLORS.red} width={5} headSize={16} />
                                    <text x={cx - LFa - 28} y={cy - 4} fontSize={16} fill="#991b1b" fontWeight="900">
                                        Fₐ
                                    </text>

                                    <Arrow x1={cx} y1={cy} x2={cx} y2={cy - LN} color={COLORS.green} width={5} headSize={16} />
                                    <text x={cx + 10} y={cy - LN + 6} fontSize={16} fill="#166534" fontWeight="900">
                                        N
                                    </text>

                                    <Arrow x1={cx} y1={cy} x2={cx} y2={cy + LP} color={COLORS.amber} width={5} headSize={16} />
                                    <text x={cx + 10} y={cy + LP - 6} fontSize={16} fill="#b45309" fontWeight="900">
                                        P
                                    </text>
                                </>
                            );
                        })()}

                        <text x={32} y={46} fontSize={14} fill={COLORS.muted}>
                            L’attrito è parallelo al piano e opposto al moto (o al moto che avverrebbe).
                        </text>
                        <text x={32} y={70} fontSize={14} fill={isStatic ? "#166534" : "#991b1b"} fontWeight="900">
                            Regime: {isStatic ? "statico (non scivola)" : "dinamico (scivola)"}
                        </text>
                    </svg>
                </ResponsiveCard>

                <ResponsiveCard>
                    <SectionTitle icon="⚙️" title="Parametri + Procedura" />

                    <div style={{ display: "grid", gap: 12 }}>
                        <ObjSelector
                            value={objId}
                            onChange={handleObjChange}
                            note="imposta automaticamente la massa"
                        />

                        <div>
                            <div style={{ fontSize: 12, color: COLORS.subtle, marginBottom: 6 }}>
                                Massa m = <strong>{formatNumber(mass, 2)} kg</strong>
                            </div>
                            <input
                                type="range"
                                min={0.5}
                                max={80}
                                step={0.5}
                                value={mass}
                                onChange={(e) => handleMassChange(parseFloat(e.target.value))}
                                style={{ width: "100%" }}
                            />
                        </div>

                        <div>
                            <div style={{ fontSize: 12, color: COLORS.subtle, marginBottom: 6 }}>
                                Forza applicata F = <strong>{formatNumber(applied, 0)} N</strong>
                            </div>
                            <input type="range" min={0} max={600} step={5} value={applied} onChange={(e) => setApplied(parseFloat(e.target.value))} style={{ width: "100%" }} />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <div>
                                <div style={{ fontSize: 12, color: COLORS.subtle, marginBottom: 6 }}>
                                    μₛ = <strong>{formatNumber(muS, 2)}</strong>
                                </div>
                                <input type="range" min={0.01} max={1.2} step={0.01} value={muS} onChange={(e) => setMuS(parseFloat(e.target.value))} style={{ width: "100%" }} />
                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: COLORS.subtle, marginBottom: 6 }}>
                                    μ_d = <strong>{formatNumber(muD, 2)}</strong>
                                </div>
                                <input type="range" min={0.01} max={1.0} step={0.01} value={muD} onChange={(e) => setMuD(parseFloat(e.target.value))} style={{ width: "100%" }} />
                            </div>
                        </div>

                        <NavigationButtons currentStep={nav.currentStep} totalSteps={totalSteps} onNext={nav.nextStep} onPrev={nav.prevStep} onShowAll={nav.showAll} />

                        <StepGrid columns={1} gap={10}>
                            <StepCard stepNumber={1} title="Normale" color="green" isActive={nav.isStepActive(0)}>
                                <div style={{ fontSize: 14 }}>
                                    <Latex>{`N=mg=${formatNumber(mass, 2)}\\cdot 9.81=`}</Latex> <strong>{formatNumber(N, 2)} N</strong>
                                </div>
                            </StepCard>

                            <StepCard stepNumber={2} title="Attrito statico massimo" color="blue" isActive={nav.isStepActive(1)}>
                                <div style={{ fontSize: 14 }}>
                                    <Latex>{`F_{s,\\max}=\\mu_s N=${formatNumber(muS, 2)}\\cdot ${formatNumber(N, 2)}=`}</Latex>{" "}
                                    <strong>{formatNumber(FsMax, 2)} N</strong>
                                </div>
                            </StepCard>

                            <StepCard stepNumber={3} title="Attrito dinamico" color="purple" isActive={nav.isStepActive(2)}>
                                <div style={{ fontSize: 14 }}>
                                    <Latex>{`F_d=\\mu_d N=${formatNumber(muD, 2)}\\cdot ${formatNumber(N, 2)}=`}</Latex>{" "}
                                    <strong>{formatNumber(Fd, 2)} N</strong>
                                </div>
                            </StepCard>

                            <StepCard stepNumber={4} title="Regime e attrito effettivo" color="amber" isActive={nav.isStepActive(3)}>
                                <div style={{ fontSize: 14, color: COLORS.muted, lineHeight: 1.5 }}>
                                    {isStatic ? (
                                        <>
                                            Poiché <InlineMath>{`F\\le F_{s,\\max}`}</InlineMath>, il blocco non scivola e{" "}
                                            <InlineMath>{`F_a=F`}</InlineMath>.
                                        </>
                                    ) : (
                                        <>
                                            Poiché <InlineMath>{`F>F_{s,\\max}`}</InlineMath>, il blocco scivola e{" "}
                                            <InlineMath>{`F_a\\approx F_d`}</InlineMath>.
                                        </>
                                    )}
                                    <div style={{ marginTop: 8 }}>
                                        <strong style={{ color: "#991b1b" }}>Fₐ = {formatNumber(frictionEff, 2)} N</strong>
                                    </div>
                                </div>
                            </StepCard>
                        </StepGrid>

                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                            <ResultBox label="Regime">{isStatic ? "statico" : "dinamico"}</ResultBox>
                            <ResultBox label="Attrito effettivo">
                                <Latex>{`${formatNumber(frictionEff, 2)}\\,N`}</Latex>
                            </ResultBox>
                        </div>

                        <CollapsiblePanel title="📌 Valori tipici (tabella)" defaultOpen={!isMobile}>
                            <div style={{ display: "grid", gap: 10 }}>
                                <div style={{ fontSize: 13, color: COLORS.subtle }}>Seleziona una riga per impostare μₛ e μ_d:</div>
                                <div style={{ overflowX: "auto" }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                                        <thead>
                                        <tr style={{ background: COLORS.bgSoft }}>
                                            <th style={{ textAlign: "left", padding: 10, borderBottom: `1px solid ${COLORS.border}` }}>Materiale</th>
                                            <th style={{ textAlign: "center", padding: 10, borderBottom: `1px solid ${COLORS.border}` }}>μ_d</th>
                                            <th style={{ textAlign: "center", padding: 10, borderBottom: `1px solid ${COLORS.border}` }}>μₛ</th>
                                            <th style={{ padding: 10, borderBottom: `1px solid ${COLORS.border}` }} />
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {FRICTION_TABLE.map((r, i) => {
                                            const active = i === tableIdx;
                                            return (
                                                <tr key={r.material} style={{ background: active ? "#eff6ff" : "#fff" }}>
                                                    <td style={{ padding: 10, borderBottom: `1px solid ${COLORS.border}` }}>{r.material}</td>
                                                    <td style={{ textAlign: "center", padding: 10, borderBottom: `1px solid ${COLORS.border}` }}>{formatNumber(r.muD, 3)}</td>
                                                    <td style={{ textAlign: "center", padding: 10, borderBottom: `1px solid ${COLORS.border}` }}>{formatNumber(r.muS, 3)}</td>
                                                    <td style={{ textAlign: "center", padding: 10, borderBottom: `1px solid ${COLORS.border}` }}>
                                                        <button
                                                            onClick={() => applyRow(i)}
                                                            style={{
                                                                padding: "8px 10px",
                                                                borderRadius: 10,
                                                                border: `1px solid ${COLORS.border}`,
                                                                background: active ? "#dbeafe" : "#fff",
                                                                cursor: "pointer",
                                                                fontWeight: 900,
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
                                <div style={{ fontSize: 12, color: COLORS.subtle }}>
                                    Nota: valori indicativi (dipendono dalle condizioni reali delle superfici).
                                </div>
                            </div>
                        </CollapsiblePanel>
                    </div>
                </ResponsiveCard>
            </div>
        </div>
    );
}

// ========================= Main =========================

export default function ForzeDemo() {
    const { isMobile } = useBreakpoint();

    const tabs = useMemo(
        () => [
            { id: "intro", label: "Introduzione", content: <IntroTab isMobile={isMobile} /> },
            { id: "risultante", label: "Forze", content: <RisultanteTab isMobile={isMobile} /> },
            { id: "peso", label: "Forza peso", content: <PesoTab isMobile={isMobile} /> },
            { id: "elastica", label: "Forza elastica", content: <ElasticaTab isMobile={isMobile} /> },
            { id: "attrito", label: "Attrito", content: <AttritoTab isMobile={isMobile} /> },
        ],
        [isMobile]
    );

    return (
        <DemoContainer
            title="Le forze"
            description="Introduzione e demo interattive in stile step-by-step: risultante, forza peso, forza elastica e attrito."
        >
            <SwipeableTabs tabs={tabs} />
        </DemoContainer>
    );
}
