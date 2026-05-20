/**
 * MomentoTorcenteDemo — τ = F × d × sinθ: la chiave inglese
 * Dimostra che, a parità di forza, applicarla più lontano e più perpendicolarmente
 * al braccio produce un momento maggiore
 */
import React, { useState, useEffect, useRef } from "react";
import { Latex, DisplayMath, DemoContainer, CollapsiblePanel, useBreakpoint } from "../../components/ui";

const F_MIN = 1, F_MAX = 20;     // N
const D_MIN = 5, D_MAX = 40;     // cm
const A_MIN = 0, A_MAX = 180;    // gradi
const TAU_MAX = F_MAX * (D_MAX / 100); // 8 N·m (a θ=90°)

const C_TORQ = "#7c3aed";  // viola
const C_FORC = "#ef4444";  // rosso
const C_DIST = "#0ea5e9";  // azzurro
const C_ANGL = "#f59e0b";  // ambra — angolo
const C_GRPH = "#16a34a";  // verde

function fmt(n: number, d = 2) { return n.toFixed(d); }

function sliderFill(v: number, lo: number, hi: number, c: string): React.CSSProperties {
    const pct = ((v - lo) / (hi - lo)) * 100;
    return {
        width: "100%", height: 8, borderRadius: 4,
        appearance: "none" as const, outline: "none", cursor: "pointer",
        background: `linear-gradient(to right,${c} 0%,${c} ${pct}%,#e2e8f0 ${pct}%,#e2e8f0 100%)`,
    };
}

function hexPoints(cx: number, cy: number, r: number, rotDeg: number): string {
    return Array.from({ length: 6 }, (_, i) => {
        const a = (i * 60 + rotDeg) * Math.PI / 180;
        return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(" ");
}

// ── SVG chiave inglese ──────────────────────────────────────────────────────

function WrenchSVG({
    F, d, theta, boltAngle, showAngle, showBraccio, isMobile, idSuffix,
}: {
    F: number; d: number; theta: number; boltAngle: number;
    showAngle: boolean; showBraccio: boolean; isMobile: boolean; idSuffix: string;
}) {
    const W = isMobile ? 340 : 500;
    const H = 220;
    const PX = 80;
    const PY = H / 2 + 10;  // pivot più in alto per spazio alla freccia in basso

    const HW_HEAD = 13;
    const HW_TAIL = 8;
    const HX_START = PX - 5;
    const HX_END = W - 18;

    // posizione punto di applicazione
    const D_PX_MIN = 55;
    const D_PX_MAX = HX_END - PX - 10;
    const dFrac = (d - D_MIN) / (D_MAX - D_MIN);
    const dPx = D_PX_MIN + dFrac * (D_PX_MAX - D_PX_MIN);
    const appX = PX + dPx;

    // angolo tra forza e braccio
    const thetaRad = theta * Math.PI / 180;
    const cosT = Math.cos(thetaRad);
    const sinT = Math.sin(thetaRad);

    // freccia forza: parte dal punto di applicazione, direzione theta dall'asse del braccio
    const fLen = 18 + (F / F_MAX) * 62;
    const fEndX = appX + fLen * cosT;
    const fEndY = PY + fLen * sinT;

    // etichetta F: offset perpendicolare alla direzione della freccia
    const fLabelX = fEndX + 10 * sinT;
    const fLabelY = fEndY - 10 * cosT + 4;

    // arco angolo θ al punto di applicazione
    const arcR = 24;
    const arcEndX = appX + arcR * cosT;
    const arcEndY = PY + arcR * sinT;

    // etichetta θ a metà arco
    const halfRad = thetaRad / 2;
    const arcLblR = arcR + 14;
    const arcLblX = appX + arcLblR * Math.cos(halfRad);
    const arcLblY = PY + arcLblR * Math.sin(halfRad);

    // arco momento al bullone
    const tauArcR = 38;

    const mF   = `mF_${idSuffix}`;
    const mDfwd = `mDfwd_${idSuffix}`;
    const mDbwd = `mDbwd_${idSuffix}`;
    const mTau  = `mTau_${idSuffix}`;

    const showArc = showAngle && theta > 3 && theta < 177;

    // Braccio = proiezione perpendicolare del raggio sulla linea d'azione di F
    // Piede della perpendicolare dal perno (PX,PY) alla retta d'azione
    const footX = PX + dPx * sinT * sinT;
    const footY = PY - dPx * cosT * sinT;
    const braccio_cm = d * sinT;         // = d·sinθ in cm
    const sq = 7;                        // dimensione segno angolo retto
    // segno angolo retto al piede: lato lungo direzione braccio (-sinT,cosT),
    // l'altro lungo linea d'azione (cosT,sinT)
    const raX1 = footX + sq * (-sinT);
    const raY1 = footY + sq * cosT;
    const raX2 = raX1 + sq * cosT;
    const raY2 = raY1 + sq * sinT;
    const raX3 = footX + sq * cosT;
    const raY3 = footY + sq * sinT;
    // etichetta braccio: punto medio + offset verso il lato della forza
    const braLblX = (PX + footX) / 2 + 14 * cosT;
    const braLblY = (PY + footY) / 2 + 14 * sinT;
    // linea d'azione estesa
    const extBack = Math.max(dPx * 0.35, 55);
    const loaX1 = appX - extBack * cosT;
    const loaY1 = PY  - extBack * sinT;
    const loaX2 = appX + (fLen + 12) * cosT;
    const loaY2 = PY  + (fLen + 12) * sinT;

    return (
        <svg viewBox={`0 0 ${W} ${H}`} style={{
            width: "100%", display: "block",
            background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0",
        }}>
            <defs>
                <marker id={mF} markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
                    <polygon points="0,0 9,3.5 0,7" fill={C_FORC} />
                </marker>
                <marker id={mDfwd} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                    <polygon points="0,0 7,3.5 0,7" fill={C_DIST} />
                </marker>
                <marker id={mDbwd} markerWidth="7" markerHeight="7" refX="1" refY="3.5" orient="auto-start-reverse">
                    <polygon points="0,0 7,3.5 0,7" fill={C_DIST} />
                </marker>
                <marker id={mTau} markerWidth="8" markerHeight="7" refX="7" refY="3.5" orient="auto">
                    <polygon points="0,0 8,3.5 0,7" fill={C_TORQ} />
                </marker>
            </defs>

            {/* ── Manico chiave (trapezio) ──────────────────────────── */}
            <path
                d={`M${HX_START},${PY - HW_HEAD} L${HX_END},${PY - HW_TAIL} L${HX_END},${PY + HW_TAIL} L${HX_START},${PY + HW_HEAD} Z`}
                fill="#64748b" stroke="#334155" strokeWidth={1.5}
            />
            {Array.from({ length: 4 }, (_, i) => {
                const gx = HX_END - 18 - i * 14;
                return (
                    <line key={i}
                        x1={gx} y1={PY - HW_TAIL + 3} x2={gx} y2={PY + HW_TAIL - 3}
                        stroke="#94a3b8" strokeWidth={1.2} />
                );
            })}

            {/* ── Braccio d (sopra la chiave) ──────────────────────── */}
            <line
                x1={PX} y1={PY - HW_HEAD - 14}
                x2={appX} y2={PY - HW_HEAD - 14}
                stroke={C_DIST} strokeWidth={1.5}
                markerStart={`url(#${mDbwd})`} markerEnd={`url(#${mDfwd})`}
            />
            <line x1={PX}   y1={PY - HW_HEAD - 20} x2={PX}   y2={PY - HW_HEAD - 7} stroke={C_DIST} strokeWidth={1} />
            <line x1={appX} y1={PY - HW_HEAD - 20} x2={appX} y2={PY - HW_HEAD - 7} stroke={C_DIST} strokeWidth={1} />
            <text x={(PX + appX) / 2} y={PY - HW_HEAD - 22}
                textAnchor="middle" fontSize={11} fill={C_DIST} fontWeight="bold">
                d = {d} cm
            </text>

            {/* ── Sede bullone ─────────────────────────────────────── */}
            <circle cx={PX} cy={PY} r={23} fill="#1e293b" />
            <polygon points={hexPoints(PX, PY, 19, 0)}   fill="#94a3b8" stroke="#64748b" strokeWidth={2} />
            <polygon points={hexPoints(PX, PY, 13, boltAngle)} fill="#fbbf24" stroke="#d97706" strokeWidth={1.5} />
            <line
                x1={PX} y1={PY}
                x2={PX + 10 * Math.cos(boltAngle * Math.PI / 180)}
                y2={PY + 10 * Math.sin(boltAngle * Math.PI / 180)}
                stroke="#7c2d12" strokeWidth={2.5} strokeLinecap="round"
            />

            {/* ── Braccio = d·sinθ (perpendicolare al perno) ───────── */}
            {showBraccio && sinT > 0.05 && (
                <>
                    {/* linea d'azione di F (tratteggiata) */}
                    <line x1={loaX1} y1={loaY1} x2={loaX2} y2={loaY2}
                        stroke={C_FORC} strokeWidth={1} strokeDasharray="6,3" opacity={0.3} />
                    {/* segmento braccio: dal perno al piede */}
                    <line x1={PX} y1={PY} x2={footX} y2={footY}
                        stroke={C_TORQ} strokeWidth={2.5} />
                    {/* segno angolo retto al piede */}
                    <polyline
                        points={`${raX1},${raY1} ${raX2},${raY2} ${raX3},${raY3}`}
                        fill="none" stroke={C_TORQ} strokeWidth={1.5}
                    />
                    {/* etichetta */}
                    <text x={braLblX} y={braLblY}
                        textAnchor="middle" dominantBaseline="middle"
                        fontSize={10} fill={C_TORQ} fontWeight="bold">
                        b={fmt(braccio_cm, 1)} cm
                    </text>
                </>
            )}

            {/* ── Linea riferimento braccio (tratteggiata, ambra) ────── */}
            {showArc && (
                <line x1={appX} y1={PY} x2={appX + arcR + 6} y2={PY}
                    stroke={C_ANGL} strokeWidth={1} strokeDasharray="3,2" opacity={0.7} />
            )}

            {/* ── Arco angolo θ ────────────────────────────────────── */}
            {showArc && (
                <path
                    d={`M ${appX + arcR} ${PY} A ${arcR} ${arcR} 0 0 1 ${arcEndX} ${arcEndY}`}
                    fill="none" stroke={C_ANGL} strokeWidth={1.8}
                />
            )}

            {/* ── Etichetta θ ─────────────────────────────────────── */}
            {showAngle && theta > 8 && theta < 172 && (
                <text x={arcLblX} y={arcLblY}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={10} fill={C_ANGL} fontWeight="bold">
                    {theta}°
                </text>
            )}

            {/* ── Componente perpendicolare F·sinθ (tratteggiata) ──── */}
            {showAngle && sinT > 0.08 && (
                <>
                    <line
                        x1={appX + 14} y1={PY}
                        x2={appX + 14} y2={PY + fLen * sinT}
                        stroke={C_FORC} strokeWidth={1.4} strokeDasharray="4,2" opacity={0.45}
                    />
                    {sinT > 0.3 && (
                        <text
                            x={appX + 17} y={PY + fLen * sinT * 0.48}
                            fontSize={9} fill={C_FORC} opacity={0.65}
                            dominantBaseline="middle">
                            F·sinθ
                        </text>
                    )}
                </>
            )}

            {/* ── Punto di applicazione ────────────────────────────── */}
            <circle cx={appX} cy={PY} r={6} fill={C_FORC} stroke="white" strokeWidth={2} />

            {/* ── Freccia forza a angolo θ ─────────────────────────── */}
            <line
                x1={appX} y1={PY}
                x2={fEndX} y2={fEndY}
                stroke={C_FORC} strokeWidth={3} markerEnd={`url(#${mF})`}
            />
            <text x={fLabelX} y={fLabelY}
                textAnchor={cosT < -0.3 ? "end" : "start"}
                fontSize={11} fill={C_FORC} fontWeight="bold">
                F = {F} N
            </text>

            {/* ── Arco momento torcente al bullone (orario) ────────── */}
            <path
                d={`M ${PX + tauArcR} ${PY} A ${tauArcR} ${tauArcR} 0 0 1 ${PX} ${PY + tauArcR}`}
                fill="none" stroke={C_TORQ} strokeWidth={2.2}
                strokeDasharray="5,2" markerEnd={`url(#${mTau})`}
            />
            <text x={PX + tauArcR + 6} y={PY + 13}
                fontSize={11} fill={C_TORQ} fontWeight="bold">
                τ
            </text>

            {/* angolo ruotato */}
            {boltAngle > 3 && (
                <text x={PX + 2} y={PY - 30}
                    textAnchor="middle" fontSize={10} fill={C_TORQ} fontWeight="600">
                    {fmt(boltAngle % 360, 0)}°
                </text>
            )}
        </svg>
    );
}

// ── Mini-SVG per confronto ──────────────────────────────────────────────────

function MiniWrench({ label, F, d, forceAngle, boltRot, tau, color }: {
    label: string; F: number; d: number;
    forceAngle: number;  // angolo tra forza e braccio (gradi)
    boltRot: number;     // angolo rotazione bullone (gradi)
    tau: number;         // momento in N·m
    color: string;
}) {
    const W = 220, H = 148;
    const PX = 50, PY = H / 2 + 8;
    const HW_HEAD = 10, HW_TAIL = 6;
    const HX_START = PX - 4, HX_END = W - 10;
    const D_PX_MIN = 40;
    const D_PX_MAX = HX_END - PX - 8;
    const dFrac = (d - D_MIN) / (D_MAX - D_MIN);
    const dPx = D_PX_MIN + dFrac * (D_PX_MAX - D_PX_MIN);
    const appX = PX + dPx;
    const fLen = 12 + (F / F_MAX) * 38;
    const thetaRad = forceAngle * Math.PI / 180;
    const fEndX = appX + fLen * Math.cos(thetaRad);
    const fEndY = PY + fLen * Math.sin(thetaRad);
    const uid = `mini_${label.replace(/\W/g, "_")}`;

    return (
        <div>
            <div style={{
                textAlign: "center", fontWeight: 700, fontSize: 13,
                color, marginBottom: 4,
            }}>
                {label}
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} style={{
                width: "100%", display: "block",
                background: "#f8fafc", borderRadius: 8, border: `1.5px solid ${color}`,
            }}>
                <defs>
                    <marker id={`${uid}_F`} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                        <polygon points="0,0 8,3 0,6" fill={C_FORC} />
                    </marker>
                </defs>

                {/* manico */}
                <path
                    d={`M${HX_START},${PY - HW_HEAD} L${HX_END},${PY - HW_TAIL} L${HX_END},${PY + HW_TAIL} L${HX_START},${PY + HW_HEAD} Z`}
                    fill="#64748b" stroke="#334155" strokeWidth={1}
                />
                {/* sede */}
                <circle cx={PX} cy={PY} r={16} fill="#1e293b" />
                {/* dado */}
                <polygon points={hexPoints(PX, PY, 13, 0)} fill="#94a3b8" stroke="#64748b" strokeWidth={1.5} />
                {/* bullone ruotato */}
                <polygon points={hexPoints(PX, PY, 9, boltRot)} fill="#fbbf24" stroke="#d97706" strokeWidth={1} />
                <line
                    x1={PX} y1={PY}
                    x2={PX + 7 * Math.cos(boltRot * Math.PI / 180)}
                    y2={PY + 7 * Math.sin(boltRot * Math.PI / 180)}
                    stroke="#7c2d12" strokeWidth={2} strokeLinecap="round"
                />
                {/* punto applicazione */}
                <circle cx={appX} cy={PY} r={5} fill={C_FORC} stroke="white" strokeWidth={1.5} />
                {/* freccia forza ad angolo forceAngle */}
                <line
                    x1={appX} y1={PY}
                    x2={fEndX} y2={fEndY}
                    stroke={C_FORC} strokeWidth={2.5} markerEnd={`url(#${uid}_F)`}
                />
                {/* d label */}
                <text x={(PX + appX) / 2} y={PY - HW_HEAD - 10}
                    textAnchor="middle" fontSize={9} fill={C_DIST} fontWeight="bold">
                    d = {d} cm
                </text>
                {/* τ label */}
                <text x={W / 2} y={H - 6}
                    textAnchor="middle" fontSize={11} fill={color} fontWeight="bold">
                    τ = {fmt(tau, 2)} N·m → {fmt(boltRot, 0)}°
                </text>
            </svg>
        </div>
    );
}

// ── Grafico τ vs d ──────────────────────────────────────────────────────────

function TauGraph({ F, d, theta, isMobile }: {
    F: number; d: number; theta: number; isMobile: boolean;
}) {
    const W = isMobile ? 280 : 360;
    const H = isMobile ? 160 : 190;
    const pad = { t: 28, r: 14, b: 38, l: 48 };
    const gw = W - pad.l - pad.r;
    const gh = H - pad.t - pad.b;
    const sinT = Math.sin(theta * Math.PI / 180);

    const tauFn = (dv: number) => F * (dv / 100) * sinT;
    const tauMax_graph = Math.max(F * (D_MAX / 100) * 1.1, 0.1);

    const toX = (dv: number) => pad.l + ((dv - D_MIN) / (D_MAX - D_MIN)) * gw;
    const toY = (tv: number) => pad.t + gh - (tv / tauMax_graph) * gh;

    const N = 60;
    const pts = Array.from({ length: N + 1 }, (_, i) => {
        const dv = D_MIN + (D_MAX - D_MIN) * i / N;
        return { x: toX(dv), y: toY(tauFn(dv)) };
    });
    const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

    const cx = toX(d);
    const cy = toY(tauFn(d));

    const xTicks = [10, 20, 30, 40];
    const yTicks = Array.from({ length: 4 }, (_, i) => tauMax_graph * (i + 1) / 4);
    const fs = 9;
    const tauCurrent = tauFn(d);

    return (
        <svg viewBox={`0 0 ${W} ${H}`} style={{
            width: "100%", display: "block",
            background: "white", borderRadius: 8, border: "1px solid #e2e8f0",
        }}>
            <text x={W / 2} y={17} textAnchor="middle" fontSize={10} fill="#334155" fontWeight="bold">
                τ in funzione di d (F={F} N, θ={theta}°)
            </text>
            <rect x={pad.l} y={pad.t} width={gw} height={gh} fill="#f8fafc" rx={2} />
            {xTicks.map(dv => (
                <line key={dv} x1={toX(dv)} y1={pad.t} x2={toX(dv)} y2={pad.t + gh} stroke="#e2e8f0" strokeWidth={1} />
            ))}
            {yTicks.map((tv, i) => (
                <line key={i} x1={pad.l} y1={toY(tv)} x2={pad.l + gw} y2={toY(tv)} stroke="#e2e8f0" strokeWidth={1} />
            ))}
            <path d={pathD} fill="none" stroke={C_GRPH} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            <line x1={pad.l} y1={pad.t + gh} x2={pad.l + gw + 4} y2={pad.t + gh} stroke="#475569" strokeWidth={1.5} />
            <line x1={pad.l} y1={pad.t}      x2={pad.l}           y2={pad.t + gh + 4} stroke="#475569" strokeWidth={1.5} />
            {xTicks.map(dv => (
                <text key={dv} x={toX(dv)} y={pad.t + gh + 13} textAnchor="middle" fontSize={fs} fill="#94a3b8">{dv}</text>
            ))}
            {yTicks.map((tv, i) => (
                <text key={i} x={pad.l - 5} y={toY(tv) + 3} textAnchor="end" fontSize={fs} fill="#94a3b8">{tv.toFixed(1)}</text>
            ))}
            <text x={pad.l + gw + 6} y={pad.t + gh + 3}  fontSize={fs + 1} fill="#334155" fontWeight="bold">d (cm)</text>
            <text x={pad.l - 36}     y={pad.t + 4}         fontSize={fs + 1} fill="#334155" fontWeight="bold">τ (N·m)</text>
            <line x1={cx} y1={pad.t + gh} x2={cx} y2={cy} stroke={C_TORQ} strokeWidth={1} strokeDasharray="3,2" opacity={0.6} />
            <line x1={pad.l} y1={cy}      x2={cx} y2={cy} stroke={C_TORQ} strokeWidth={1} strokeDasharray="3,2" opacity={0.6} />
            <circle cx={cx} cy={cy} r={5.5} fill={C_TORQ} stroke="white" strokeWidth={2} />
            <rect x={cx > pad.l + gw - 80 ? cx - 88 : cx + 6} y={cy - 26} width={84} height={20} rx={3}
                fill="white" stroke={C_TORQ} strokeWidth={1} opacity={0.93} />
            <text x={cx > pad.l + gw - 80 ? cx - 84 : cx + 10} y={cy - 12} fontSize={fs} fill={C_TORQ} fontWeight="bold">
                ({d}, {fmt(tauCurrent, 2)})
            </text>
        </svg>
    );
}

// ── Componente principale ───────────────────────────────────────────────────

export default function MomentoTorcenteDemo() {
    const [F, setF]                   = useState(10);
    const [d, setD]                   = useState(20);
    const [theta, setTheta]           = useState(90);
    const [showAngle, setShowAngle]   = useState(false);
    const [showBraccio, setShowBraccio] = useState(false);
    const [boltAngle, setBoltAngle]   = useState(0);
    const [spinning, setSpinning]   = useState(false);

    const bp = useBreakpoint();
    const isMobile = bp.isMobile;

    const sinT = Math.sin(theta * Math.PI / 180);
    const tau  = F * (d / 100) * sinT;          // N·m
    const targetDelta = (tau / TAU_MAX) * 360;   // angolo di rotazione del bullone

    const animRef       = useRef<number | null>(null);
    const startAngleRef = useRef(0);
    const startTimeRef  = useRef<number | null>(null);
    const ANIM_DURATION = 900;

    useEffect(() => {
        if (!spinning) return;
        startAngleRef.current = boltAngle;
        startTimeRef.current  = null;

        const tick = (now: number) => {
            if (startTimeRef.current === null) startTimeRef.current = now;
            const elapsed  = now - startTimeRef.current;
            const progress = Math.min(elapsed / ANIM_DURATION, 1);
            const eased    = 1 - Math.pow(1 - progress, 3);
            setBoltAngle(startAngleRef.current + targetDelta * eased);
            if (progress < 1) {
                animRef.current = requestAnimationFrame(tick);
            } else {
                setSpinning(false);
            }
        };
        animRef.current = requestAnimationFrame(tick);
        return () => { if (animRef.current !== null) cancelAnimationFrame(animRef.current); };
    }, [spinning]); // eslint-disable-line react-hooks/exhaustive-deps

    function avvita()          { if (!spinning) setSpinning(true); }
    function reset()           {
        if (animRef.current !== null) cancelAnimationFrame(animRef.current);
        setSpinning(false); setBoltAngle(0);
    }
    function changeF(v: number)     { setF(v);     reset(); }
    function changeD(v: number)     { setD(v);     reset(); }
    function changeTheta(v: number) { setTheta(v); reset(); }

    // Confronto: stessa F e θ, braccio diverso
    const dCompA = 10, dCompB = 35;
    const tauA = F * (dCompA / 100) * sinT;
    const tauB = F * (dCompB / 100) * sinT;
    const boltRotA = (tauA / TAU_MAX) * 360;
    const boltRotB = (tauB / TAU_MAX) * 360;

    const btnBase: React.CSSProperties = {
        padding: "7px 18px", borderRadius: 8, fontWeight: 700,
        fontSize: 14, cursor: "pointer", border: "2px solid", transition: "all 0.15s",
    };

    return (
        <DemoContainer title="Momento torcente: τ = F · d · sinθ">

            {/* Visualizzazione chiave */}
            <WrenchSVG
                F={F} d={d} theta={theta}
                boltAngle={boltAngle} showAngle={showAngle} showBraccio={showBraccio}
                isMobile={isMobile} idSuffix="main"
            />

            {/* Pulsanti */}
            <div style={{ display: "flex", gap: 10, justifyContent: "center", margin: "10px 0" }}>
                <button onClick={avvita} disabled={spinning} style={{
                    ...btnBase,
                    background: spinning ? "#f3f4f6" : "#f5f3ff",
                    borderColor: C_TORQ,
                    color: spinning ? "#9ca3af" : C_TORQ,
                    opacity: spinning ? 0.7 : 1,
                }}>
                    {spinning ? "⟳ Avvitando…" : "🔩 Avvita!"}
                </button>
                <button onClick={reset} style={{ ...btnBase, background: "#f8fafc", borderColor: "#cbd5e1", color: "#64748b" }}>
                    ↺ Azzera
                </button>
            </div>

            {/* Sliders + risultato */}
            <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr auto",
                gap: 14, alignItems: "center",
                background: "white", borderRadius: 12,
                border: "1.5px solid #e2e8f0",
                padding: "14px 18px", marginBottom: 14,
            }}>
                {/* Forza F */}
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, color: C_FORC, fontSize: 14 }}>Forza <Latex>{"F"}</Latex></span>
                        <span style={{ fontWeight: 700, color: C_FORC, fontFamily: "monospace", fontSize: 15 }}>{F} N</span>
                    </div>
                    <input type="range" min={F_MIN} max={F_MAX} step={1} value={F}
                        onChange={e => changeF(Number(e.target.value))}
                        style={sliderFill(F, F_MIN, F_MAX, C_FORC)} />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                        <span>{F_MIN} N</span><span>{F_MAX} N</span>
                    </div>
                </div>

                {/* Distanza d */}
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, color: C_DIST, fontSize: 14 }}>Distanza <Latex>{"d"}</Latex></span>
                        <span style={{ fontWeight: 700, color: C_DIST, fontFamily: "monospace", fontSize: 15 }}>{d} cm</span>
                    </div>
                    <input type="range" min={D_MIN} max={D_MAX} step={1} value={d}
                        onChange={e => changeD(Number(e.target.value))}
                        style={sliderFill(d, D_MIN, D_MAX, C_DIST)} />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                        <span>{D_MIN} cm</span><span>{D_MAX} cm</span>
                    </div>
                </div>

                {/* Angolo θ */}
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, color: C_ANGL, fontSize: 14 }}>
                            Angolo <Latex>{"\\theta"}</Latex>
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontWeight: 700, color: C_ANGL, fontFamily: "monospace", fontSize: 15 }}>
                                {theta}°
                            </span>
                            <button
                                onClick={() => { setTheta(90); reset(); }}
                                title="Imposta forza perpendicolare (θ = 90°)"
                                style={{
                                    padding: "2px 7px", borderRadius: 5, fontSize: 12,
                                    fontWeight: 700, cursor: "pointer",
                                    border: `1.5px solid ${C_ANGL}`,
                                    background: theta === 90 ? C_ANGL : "white",
                                    color: theta === 90 ? "white" : C_ANGL,
                                }}
                            >
                                ⊥
                            </button>
                        </span>
                    </div>
                    <input type="range" min={A_MIN} max={A_MAX} step={1} value={theta}
                        onChange={e => changeTheta(Number(e.target.value))}
                        style={sliderFill(theta, A_MIN, A_MAX, C_ANGL)} />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                        <span>0° ‖</span>
                        <span style={{ color: C_ANGL, fontWeight: 600 }}>90° ⊥ max</span>
                        <span>180° ‖</span>
                    </div>
                    {/* Checkbox visualizzazione */}
                    <div style={{ display: "flex", gap: 14, marginTop: 7, flexWrap: "wrap" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#64748b", cursor: "pointer", userSelect: "none" }}>
                            <input type="checkbox" checked={showAngle} onChange={e => setShowAngle(e.target.checked)}
                                style={{ cursor: "pointer", accentColor: C_ANGL }} />
                            mostra arco θ
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#64748b", cursor: "pointer", userSelect: "none" }}>
                            <input type="checkbox" checked={showBraccio} onChange={e => setShowBraccio(e.target.checked)}
                                style={{ cursor: "pointer", accentColor: C_TORQ }} />
                            <span>mostra braccio <Latex>{"d\\sin\\theta"}</Latex></span>
                        </label>
                    </div>
                </div>

                {/* Risultato τ */}
                <div style={{
                    textAlign: "center", padding: "10px 16px",
                    background: "#f5f3ff", borderRadius: 10,
                    border: `2px solid ${C_TORQ}`,
                    minWidth: isMobile ? undefined : 130,
                }}>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginBottom: 2 }}>
                        Momento torcente
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: C_TORQ, fontFamily: "monospace" }}>
                        {fmt(tau, 2)}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>N·m</div>
                    <div style={{ marginTop: 6, fontSize: 11, color: "#475569" }}>
                        <Latex>{`\\tau = F{\\cdot}d{\\cdot}\\sin\\theta`}</Latex>
                    </div>
                    <div style={{ marginTop: 2, fontSize: 11, color: C_TORQ, fontFamily: "monospace" }}>
                        = {F}·{fmt(d/100,2)}·{fmt(sinT,2)}
                    </div>
                    {Math.abs(sinT) < 0.05 && (
                        <div style={{ marginTop: 4, fontSize: 11, color: "#ef4444", fontWeight: 600 }}>
                            θ ≈ 0° o 180°: τ = 0!
                        </div>
                    )}
                </div>
            </div>

            {/* Confronto: stessa F e θ, braccio diverso */}
            <div style={{
                background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 12,
                padding: "12px 16px", marginBottom: 14,
            }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#334155", marginBottom: 10 }}>
                    Confronto a parità di forza e angolo (F = {F} N, θ = {theta}°)
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <MiniWrench
                        label={`d = ${dCompA} cm (corto)`}
                        F={F} d={dCompA} forceAngle={theta}
                        boltRot={boltRotA} tau={tauA}
                        color="#f59e0b"
                    />
                    <MiniWrench
                        label={`d = ${dCompB} cm (lungo)`}
                        F={F} d={dCompB} forceAngle={theta}
                        boltRot={boltRotB} tau={tauB}
                        color={C_TORQ}
                    />
                </div>
                {tauA > 0.001 ? (
                    <div style={{ marginTop: 10, fontSize: 13, color: "#475569" }}>
                        Il braccio lungo produce un momento{" "}
                        <strong style={{ color: C_TORQ }}>
                            {fmt(dCompB / dCompA, 1)}×
                        </strong>{" "}
                        maggiore → il bullone ruota di più con la stessa forza e lo stesso angolo.
                    </div>
                ) : (
                    <div style={{ marginTop: 10, fontSize: 13, color: "#ef4444" }}>
                        Con θ = 0° o 180° la forza è parallela al braccio: τ = 0 in entrambi i casi!
                    </div>
                )}
            </div>

            {/* Grafico τ vs d */}
            <div style={{ marginBottom: 14 }}>
                <div style={{
                    padding: "6px 12px", background: "#f0fdf4",
                    borderRadius: "8px 8px 0 0", border: "1.5px solid #86efac",
                    borderBottom: "none", fontSize: 13, fontWeight: 600, color: "#166534",
                }}>
                    τ in funzione di d — pendenza proporzionale a F·sinθ
                </div>
                <TauGraph F={F} d={d} theta={theta} isMobile={isMobile} />
                <div style={{
                    padding: "5px 12px", background: "#f0fdf4",
                    borderRadius: "0 0 8px 8px", border: "1.5px solid #86efac",
                    borderTop: "none", fontSize: 12, color: "#166534",
                }}>
                    Se d raddoppia, τ raddoppia: <Latex>{"\\tau \\propto d"}</Latex>.
                    Cambiando θ si vede che la retta si abbassa (pendenza = F·sinθ).
                </div>
            </div>

            {/* Teoria */}
            <CollapsiblePanel title="Il momento torcente — formula completa con sinθ">
                <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 14, color: "#334155" }}>
                    <p style={{ margin: 0 }}>
                        Il <strong>momento torcente</strong> (o <em>momento di una forza</em>) misura
                        la capacità di una forza di far ruotare un corpo attorno a un asse (il <em>perno</em>).
                        Dipende da tre fattori: l'intensità della forza, la distanza dal perno e
                        l'angolo con cui la forza è applicata.
                    </p>
                    <div style={{ textAlign: "center" }}>
                        <DisplayMath>{"\\tau = F \\cdot d \\cdot \\sin\\theta"}</DisplayMath>
                    </div>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr 1fr",
                        gap: 10,
                    }}>
                        <div style={{ background: "#fef2f2", borderRadius: 8, padding: "10px 14px", border: "1px solid #fca5a5" }}>
                            <strong style={{ color: C_FORC }}>F</strong>
                            <p style={{ margin: "6px 0 0", fontSize: 13 }}>Forza applicata (N)</p>
                        </div>
                        <div style={{ background: "#eff6ff", borderRadius: 8, padding: "10px 14px", border: "1px solid #93c5fd" }}>
                            <strong style={{ color: C_DIST }}>d</strong>
                            <p style={{ margin: "6px 0 0", fontSize: 13 }}>Distanza perno–applicazione (m)</p>
                        </div>
                        <div style={{ background: "#fffbeb", borderRadius: 8, padding: "10px 14px", border: "1px solid #fcd34d" }}>
                            <strong style={{ color: C_ANGL }}>sinθ</strong>
                            <p style={{ margin: "6px 0 0", fontSize: 13 }}>
                                θ = angolo tra F e il braccio.
                                Massimo a θ=90° (⊥), zero a θ=0° e 180° (∥).
                            </p>
                        </div>
                        <div style={{ background: "#f5f3ff", borderRadius: 8, padding: "10px 14px", border: "1px solid #c4b5fd" }}>
                            <strong style={{ color: C_TORQ }}>τ (N·m)</strong>
                            <p style={{ margin: "6px 0 0", fontSize: 13 }}>Più è grande, più facilmente il corpo ruota.</p>
                        </div>
                    </div>
                    <div style={{ background: "#fafafa", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px" }}>
                        <strong>Perché il seno?</strong> Solo la componente di F <em>perpendicolare</em> al braccio
                        produce rotazione. Quella parallela tira/spinge il braccio senza farlo ruotare.
                        La componente perpendicolare vale F·sinθ — ecco l'origine del fattore sinθ
                        nella formula. Il caso θ=90° (forza perpendicolare) è il più efficiente: sinθ=1.
                    </div>
                    <div style={{ background: "#fafafa", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px" }}>
                        <strong>Chiave inglese:</strong> a parità di forza e angolo, usare il manico più
                        lungo (d maggiore) moltiplica il momento. Se si applica la forza non
                        perpendicolarmente (θ ≠ 90°) si spreca parte dello sforzo — conviene sempre
                        spingere a 90° rispetto al manico.
                    </div>
                </div>
            </CollapsiblePanel>
        </DemoContainer>
    );
}
