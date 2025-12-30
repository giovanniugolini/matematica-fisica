/**
 * AngleRotationDemo - Versione Responsive
 * Angolo orientato, più giri, funzioni goniometriche
 * Ottimizzato per mobile, tablet e desktop
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    DemoContainer,
    useBreakpoint,
    ResponsiveGrid,
    ResponsiveCard,
    ResponsiveSvg,
    TouchButton,
    ResponsiveSlider,
    CollapsiblePanel,
    SwipeableTabs,
} from "../../components/ui";
import {
    DEG_TO_RAD,
    RAD_TO_DEG,
    clamp,
    normalizeAngleDeg,
    normalizeAngleDegSigned,
    formatRadiansPi,
    snapToNotableAngle,
    polarToCartesianSVG,
} from "../../utils/math";

// ============ COSTANTI ============

const SIZE = 420;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 160;

// ============ COMPONENTI HELPER ============

function ToggleChip({ active, onClick, label, activeColor }: {
    active: boolean;
    onClick: () => void;
    label: string;
    activeColor: string;
    isMobile?: boolean;
}) {
    const { isMobile } = useBreakpoint();
    return (
        <button
            onClick={onClick}
            style={{
                padding: isMobile ? "10px 14px" : "6px 12px",
                borderRadius: 20,
                background: active ? activeColor : "#f3f4f6",
                border: active ? `2px solid ${activeColor}` : "1px solid #e5e7eb",
                cursor: "pointer",
                fontSize: isMobile ? 14 : 13,
                fontWeight: active ? 600 : 400,
                minHeight: isMobile ? 44 : 32,
            }}
        >
            {label}
        </button>
    );
}

function Checkbox({ checked, onChange, label }: {
    checked: boolean;
    onChange: (v: boolean) => void;
    label: string;
}) {
    const { isMobile } = useBreakpoint();
    return (
        <label style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            padding: isMobile ? "8px 0" : "4px 0",
            fontSize: isMobile ? 15 : 14,
        }}>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                style={{ width: 18, height: 18 }}
            />
            {label}
        </label>
    );
}

// ============ COMPONENTE PRINCIPALE ============

export default function AngleRotationDemo() {
    const { isMobile, isTablet } = useBreakpoint();

    // Stato angoli
    const [baseDeg] = useState(0);
    const [endDeg, setEndDeg] = useState(35);

    // Accumuli per il verso reale
    const baseAccumRef = useRef(0);
    const endAccumRef = useRef(35);
    const prevEndDegRef = useRef(endDeg);

    // Animazione
    const [isAnimating, setIsAnimating] = useState(false);
    const [speed, setSpeed] = useState(30);
    const [direction, setDirection] = useState(1);

    // Opzioni UI
    const [showProjections, setShowProjections] = useState(true);
    const [highlightArc, setHighlightArc] = useState(false);
    const [highlightRadius, setHighlightRadius] = useState(false);
    const [showSector, setShowSector] = useState(false);
    const [snapNotevoli, setSnapNotevoli] = useState(true);
    const [showTicks, setShowTicks] = useState(true);
    const [allowAccum, setAllowAccum] = useState(true);

    // Goniometria
    const [showCos, setShowCos] = useState(true);
    const [showSin, setShowSin] = useState(true);
    const [showTan, setShowTan] = useState(false);

    const svgRef = useRef<SVGSVGElement | null>(null);

    const baseRad = useMemo(() => baseDeg * DEG_TO_RAD, [baseDeg]);
    const endRad = useMemo(() => endDeg * DEG_TO_RAD, [endDeg]);

    // Animazione
    useEffect(() => {
        if (!isAnimating) return;
        let raf: number;
        let last = performance.now();

        const tick = (t: number) => {
            const dt = (t - last) / 1000;
            last = t;
            const delta = direction * speed * dt;
            endAccumRef.current += delta;
            setEndDeg(normalizeAngleDeg(endAccumRef.current));
            raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [isAnimating, speed, direction]);

    // Punti chiave
    const B = polarToCartesianSVG(R, baseRad, CX, CY);
    const P = polarToCartesianSVG(R, endRad, CX, CY);
    const Px = { x: P.x, y: CY };
    const Py = { x: CX, y: P.y };

    // Angolo orientato
    const thetaOrientedDeg = endAccumRef.current - baseAccumRef.current;
    const orientedIsCCW = thetaOrientedDeg >= 0;
    const thetaOrientedMagMod = ((Math.abs(thetaOrientedDeg) % 360) + 360) % 360;
    const thetaPrincipalDeg = normalizeAngleDegSigned(endDeg - baseDeg);

    // Goniometria
    const cosVal = Math.cos(endRad);
    const sinVal = Math.sin(endRad);
    const tanVal = Math.tan(endRad);
    const yTanRaw = CY - R * tanVal;
    const yTan = clamp(yTanRaw, CY - R * 2.2, CY + R * 2.2);

    // Drag handler
    function onPointerDown(e: React.PointerEvent<SVGSVGElement>) {
        const svg = svgRef.current;
        if (!svg) return;

        const el = e.currentTarget;
        el.setPointerCapture?.(e.pointerId);

        const pt = svg.createSVGPoint();
        const getLocal = (ev: PointerEvent) => {
            pt.x = ev.clientX;
            pt.y = ev.clientY;
            const ctm = svg.getScreenCTM();
            if (!ctm) return { x: 0, y: 0 };
            return pt.matrixTransform(ctm.inverse());
        };

        const handleMove = (ev: PointerEvent) => {
            const p = getLocal(ev);
            const dx = p.x - CX;
            const dy = p.y - CY;
            let deg = Math.atan2(-dy, dx) * RAD_TO_DEG;
            if (deg < 0) deg += 360;

            if (snapNotevoli) {
                deg = snapToNotableAngle(deg);
            }

            const prev = prevEndDegRef.current;
            let diff = deg - prev;
            diff = normalizeAngleDegSigned(diff);
            endAccumRef.current += diff;
            prevEndDegRef.current = deg;
            setEndDeg(deg);
        };

        const handleUp = () => {
            try { el.releasePointerCapture?.(e.pointerId); } catch {}
            window.removeEventListener("pointermove", handleMove);
            window.removeEventListener("pointerup", handleUp);
        };

        window.addEventListener("pointermove", handleMove, { passive: false });
        window.addEventListener("pointerup", handleUp, { passive: true });
    }

    // Sync accumuli
    useEffect(() => {
        if (!allowAccum) {
            endAccumRef.current = endDeg;
        }
        prevEndDegRef.current = endDeg;
    }, [allowAccum, endDeg]);

    // Reset
    const handleReset = () => {
        setEndDeg(0);
        endAccumRef.current = 0;
        prevEndDegRef.current = 0;
        setIsAnimating(false);
    };

    // ============ COMPONENTI GRAFICI SVG ============

    function ArcSmall() {
        const a = thetaOrientedMagMod;
        if (a <= 1e-6) return null;

        const largeArc = a > 180 ? 1 : 0;
        const sweep = orientedIsCCW ? 0 : 1;
        const start = polarToCartesianSVG(60, baseRad, CX, CY);
        const end = polarToCartesianSVG(60, endRad, CX, CY);
        const d = `M ${start.x} ${start.y} A 60 60 0 ${largeArc} ${sweep} ${end.x} ${end.y}`;

        return <path d={d} fill="none" stroke={orientedIsCCW ? "#3b82f6" : "#ef4444"} strokeWidth={5} />;
    }

    function ArcOnCircle() {
        if (!highlightArc) return null;
        const a = thetaOrientedMagMod;
        if (a <= 1e-6) return null;

        const largeArc = a > 180 ? 1 : 0;
        const sweep = orientedIsCCW ? 0 : 1;
        const start = polarToCartesianSVG(R, baseRad, CX, CY);
        const end = polarToCartesianSVG(R, endRad, CX, CY);
        const d = `M ${start.x} ${start.y} A ${R} ${R} 0 ${largeArc} ${sweep} ${end.x} ${end.y}`;

        return <path d={d} fill="none" stroke={orientedIsCCW ? "#ef4444" : "#7f1d1d"} strokeWidth={6} strokeLinecap="round" />;
    }

    function SectorFilled() {
        if (!showSector) return null;
        const a = thetaOrientedMagMod;
        if (a <= 1e-6) return null;

        const largeArc = a > 180 ? 1 : 0;
        const sweep = orientedIsCCW ? 0 : 1;
        const start = polarToCartesianSVG(R, baseRad, CX, CY);
        const end = polarToCartesianSVG(R, endRad, CX, CY);
        const d = `M ${CX} ${CY} L ${start.x} ${start.y} A ${R} ${R} 0 ${largeArc} ${sweep} ${end.x} ${end.y} Z`;

        return <path d={d} fill="rgba(59,130,246,0.18)" stroke="none" />;
    }

    function Ticks() {
        if (!showTicks) return null;

        const items: React.ReactElement[] = [];
        for (let d = 0; d < 360; d += 30) {
            const r = d * DEG_TO_RAD;
            const inner = polarToCartesianSVG(R - 8, r, CX, CY);
            const outer = polarToCartesianSVG(R + 8, r, CX, CY);
            items.push(<line key={`t-${d}`} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#cbd5e1" />);

            const lab = polarToCartesianSVG(R + 22, r, CX, CY);
            items.push(
                <text key={`lbl-${d}`} x={lab.x} y={lab.y} fontSize={10} textAnchor="middle" dominantBaseline="middle" fill="#64748b">
                    {d}°
                </text>
            );
        }
        return <g>{items}</g>;
    }

    // ============ RENDER SVG ============

    const SvgCanvas = (
        <ResponsiveSvg
            width={SIZE}
            height={SIZE}
            maxHeight={{ mobile: "55vh", tablet: "50vh", desktop: "auto" }}
            svgProps={{
                ref: svgRef,
                onPointerDown: onPointerDown,
                style: { cursor: "crosshair", touchAction: "none" }
            }}
        >
            <rect x={0} y={0} width={SIZE} height={SIZE} fill="white" />

            {/* Cerchio + tacche */}
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="#e5e7eb" strokeWidth={2} />
            <Ticks />

            {/* Settore e arco grande */}
            <SectorFilled />
            <ArcOnCircle />

            {/* Assi */}
            <line x1={CX - R - 12} y1={CY} x2={CX + R + 12} y2={CY} stroke="#d1d5db" strokeDasharray="6 6" />
            <line x1={CX} y1={CY - R - 12} x2={CX} y2={CY + R + 12} stroke="#d1d5db" strokeDasharray="6 6" />

            {/* Lati */}
            <line x1={CX} y1={CY} x2={B.x} y2={B.y} stroke="#6b7280" strokeWidth={4} />
            <line x1={CX} y1={CY} x2={P.x} y2={P.y} stroke={highlightRadius ? "#f59e0b" : "#111827"} strokeWidth={highlightRadius ? 6 : 4} />

            {/* Arco piccolo */}
            <ArcSmall />

            {/* Proiezioni */}
            {showProjections && (
                <>
                    <line x1={P.x} y1={P.y} x2={Px.x} y2={Px.y} stroke="#94a3b8" strokeDasharray="4 4" />
                    <line x1={P.x} y1={P.y} x2={Py.x} y2={Py.y} stroke="#94a3b8" strokeDasharray="4 4" />

                    {showCos && (
                        <>
                            <line x1={CX} y1={CY} x2={Px.x} y2={CY} stroke="#0ea5e9" strokeWidth={5} />
                            <circle cx={Px.x} cy={CY} r={4} fill="#0ea5e9" />
                        </>
                    )}

                    {showSin && (
                        <>
                            <line x1={CX} y1={CY} x2={CX} y2={Py.y} stroke="#10b981" strokeWidth={5} />
                            <circle cx={CX} cy={Py.y} r={4} fill="#10b981" />
                        </>
                    )}
                </>
            )}

            {/* Tangente */}
            {showTan && (
                <>
                    <line x1={CX + R} y1={CY - R * 2.4} x2={CX + R} y2={CY + R * 2.4} stroke="#f97316" strokeDasharray="6 6" />
                    <line x1={CX + R} y1={CY} x2={CX + R} y2={yTan} stroke="#f97316" strokeWidth={5} />
                    <circle cx={CX + R} cy={yTan} r={4} fill="#f97316" />
                </>
            )}

            {/* Manici */}
            <circle cx={B.x} cy={B.y} r={isMobile ? 14 : 10} fill="#9ca3af" stroke="#0f172a" strokeWidth={2} />
            <circle cx={P.x} cy={P.y} r={isMobile ? 14 : 10} fill="#3b82f6" stroke="#0f172a" strokeWidth={2} />

            {/* Centro */}
            <circle cx={CX} cy={CY} r={5} fill="#111827" />

            {!isMobile && (
                <text x={CX + R + 10} y={CY - 8} fontSize={11} fill="#6b7280">α=0° (fisso)</text>
            )}
        </ResponsiveSvg>
    );

    // ============ PANNELLI CONTROLLI ============

    const ReadingsPanel = (
        <ResponsiveCard style={{ background: "#f8fafc" }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>📐 Misure</div>
            <div style={{ display: "grid", gap: 6, fontSize: isMobile ? 14 : 13 }}>
                <div><strong>β:</strong> {endDeg.toFixed(1)}°</div>
                <div><strong>θ orientato:</strong> {thetaOrientedDeg.toFixed(1)}°</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>
                    = {(thetaOrientedDeg * DEG_TO_RAD).toFixed(3)} rad = {formatRadiansPi(thetaOrientedDeg * DEG_TO_RAD)}
                </div>
                <div><strong>θ principale:</strong> {thetaPrincipalDeg.toFixed(1)}°</div>
                <div style={{
                    padding: "6px 10px",
                    background: orientedIsCCW ? "#dbeafe" : "#fecaca",
                    borderRadius: 6,
                    fontSize: 12
                }}>
                    {orientedIsCCW ? "⟲ Antiorario (+)" : "⟳ Orario (−)"} • Giri: {(thetaOrientedDeg / 360).toFixed(2)}
                </div>
            </div>
        </ResponsiveCard>
    );

    const TrigPanel = (
        <ResponsiveCard>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>📊 Funzioni goniometriche</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                <ToggleChip active={showCos} onClick={() => setShowCos(!showCos)} label="cos θ" activeColor="#e0f2fe" />
                <ToggleChip active={showSin} onClick={() => setShowSin(!showSin)} label="sin θ" activeColor="#d1fae5" />
                <ToggleChip active={showTan} onClick={() => setShowTan(!showTan)} label="tan θ" activeColor="#ffedd5" />
            </div>
            <div style={{
                fontFamily: "monospace",
                fontSize: isMobile ? 14 : 13,
                background: "#f8fafc",
                padding: 10,
                borderRadius: 8,
                display: "grid",
                gap: 4
            }}>
                <div style={{ color: "#0ea5e9" }}>cos θ = <strong>{cosVal.toFixed(4)}</strong></div>
                <div style={{ color: "#10b981" }}>sin θ = <strong>{sinVal.toFixed(4)}</strong></div>
                <div style={{ color: "#f97316" }}>tan θ = <strong>{Math.abs(tanVal) > 1e3 ? "±∞" : tanVal.toFixed(4)}</strong></div>
            </div>
        </ResponsiveCard>
    );

    const ControlsPanel = (
        <ResponsiveCard>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>⚙️ Controlli</div>

            {/* Slider β */}
            <ResponsiveSlider
                value={endDeg}
                onChange={(v) => {
                    const vs = snapNotevoli ? snapToNotableAngle(v) : v;
                    const prev = prevEndDegRef.current;
                    let diff = vs - prev;
                    diff = normalizeAngleDegSigned(diff);
                    endAccumRef.current += diff;
                    prevEndDegRef.current = vs;
                    setEndDeg(vs);
                }}
                min={0}
                max={360}
                step={1}
                label="β (gradi)"
                formatValue={(v) => `${v.toFixed(0)}°`}
            />

            {/* Pulsanti azione */}
            <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
                <TouchButton
                    variant={isAnimating ? "secondary" : "primary"}
                    onClick={() => setIsAnimating(!isAnimating)}
                    fullWidth={isMobile}
                >
                    {isAnimating ? "⏸ Pausa" : "▶ Anima"}
                </TouchButton>
                <TouchButton variant="outline" onClick={handleReset} fullWidth={isMobile}>
                    🔄 Reset
                </TouchButton>
            </div>

            {/* Velocità e direzione */}
            <div style={{ marginTop: 16 }}>
                <ResponsiveSlider
                    value={speed}
                    onChange={setSpeed}
                    min={10}
                    max={180}
                    step={10}
                    label="Velocità"
                    formatValue={(v) => `${v}°/s`}
                />
                <div style={{ marginTop: 8 }}>
                    <Checkbox
                        checked={direction === -1}
                        onChange={(v) => setDirection(v ? -1 : 1)}
                        label="Senso orario"
                    />
                </div>
            </div>
        </ResponsiveCard>
    );

    const OptionsPanel = (
        <ResponsiveCard>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>🎨 Visualizzazione</div>

            {/* Toggle visuali */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                <ToggleChip active={highlightArc} onClick={() => setHighlightArc(!highlightArc)} label="Arco" activeColor="#fecaca" />
                <ToggleChip active={highlightRadius} onClick={() => setHighlightRadius(!highlightRadius)} label="Raggio" activeColor="#fde68a" />
                <ToggleChip active={showSector} onClick={() => setShowSector(!showSector)} label="Settore" activeColor="#dbeafe" />
            </div>

            {/* Checkbox opzioni */}
            <div style={{ display: "grid", gap: 4 }}>
                <Checkbox checked={allowAccum} onChange={setAllowAccum} label="Più giri (accumula oltre 360°)" />
                <Checkbox checked={showProjections} onChange={setShowProjections} label="Mostra proiezioni" />
                <Checkbox checked={showTicks} onChange={setShowTicks} label="Tacche ogni 30°" />
                <Checkbox checked={snapNotevoli} onChange={setSnapNotevoli} label="Snap angoli notevoli" />
            </div>
        </ResponsiveCard>
    );

    // ============ LAYOUT MOBILE (tabs) ============

    if (isMobile) {
        return (
            <DemoContainer
                title="Angolo orientato"
                description="Trascina il punto blu per ruotare β"
            >
                {/* Canvas sempre visibile */}
                <ResponsiveCard padding={8} style={{ marginBottom: 12 }}>
                    {SvgCanvas}
                </ResponsiveCard>

                {/* Letture principali */}
                {ReadingsPanel}

                {/* Tabs per altri controlli */}
                <div style={{ marginTop: 12 }}>
                    <SwipeableTabs
                        tabs={[
                            { id: "trig", label: "📊 Trig", content: TrigPanel },
                            { id: "controls", label: "⚙️ Controlli", content: ControlsPanel },
                            { id: "options", label: "🎨 Opzioni", content: OptionsPanel },
                        ]}
                        defaultTab="trig"
                    />
                </div>
            </DemoContainer>
        );
    }

    // ============ LAYOUT TABLET ============

    if (isTablet) {
        return (
            <DemoContainer
                title="Angolo orientato • più giri • funzioni goniometriche"
                description="Trascina il punto blu per muovere β. θ = β − α (antiorario = positivo)."
            >
                <ResponsiveGrid columns={{ tablet: 2 }} gap={12}>
                    {/* Canvas */}
                    <ResponsiveCard padding={8}>
                        {SvgCanvas}
                    </ResponsiveCard>

                    {/* Controlli */}
                    <div style={{ display: "grid", gap: 12 }}>
                        {ReadingsPanel}
                        {TrigPanel}
                    </div>
                </ResponsiveGrid>

                <CollapsiblePanel title="⚙️ Controlli avanzati" defaultOpen={false}>
                    <ResponsiveGrid columns={{ tablet: 2 }} gap={12}>
                        {ControlsPanel}
                        {OptionsPanel}
                    </ResponsiveGrid>
                </CollapsiblePanel>
            </DemoContainer>
        );
    }

    // ============ LAYOUT DESKTOP ============

    return (
        <DemoContainer
            title="Angolo orientato • più giri • funzioni goniometriche"
            description="α è bloccato a 0° (asse x positivo). Trascina il punto blu per muovere β. θ = β − α (antiorario = positivo)."
        >
            <ResponsiveGrid columns={{ desktop: 2 }} gap={16}>
                {/* Canvas */}
                <ResponsiveCard padding={12}>
                    {SvgCanvas}
                </ResponsiveCard>

                {/* Pannello controlli */}
                <div style={{ display: "grid", gap: 12 }}>
                    {ReadingsPanel}
                    {TrigPanel}
                    {ControlsPanel}
                    {OptionsPanel}
                </div>
            </ResponsiveGrid>
        </DemoContainer>
    );
}