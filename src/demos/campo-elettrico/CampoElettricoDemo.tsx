/**
 * CampoElettricoDemo - Versione Responsive
 * Campo elettrico di una carica puntiforme con carica di prova interattiva
 * Ottimizzato per mobile, tablet e desktop
 */

import React, { useMemo, useRef, useState } from "react";
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
    clamp,
    Vec2,
    EField,
    vecNormalize,
    constrainWithinRadius,
    electricFieldAt,
    electricForce,
    microCoulombToC,
    nanoCoulombToC,
    formatScientific,
    createCoordinateMapper,
    clientToViewBox,
    WorldBounds,
} from "../../utils/math";

// ============ COSTANTI ============

const WIDTH = 900;
const HEIGHT = 560;
const WORLD: WorldBounds = { xmin: -10, xmax: 10, ymin: -7, ymax: 7 };
const MAX_DIST = 5;

// ============ COMPONENTI HELPER ============

interface ArrowProps {
    x: number;
    y: number;
    vx: number;
    vy: number;
    toX: (x: number) => number;
    toY: (y: number) => number;
    color: string;
    lenWorld?: number;
}

function Arrow({ x, y, vx, vy, toX, toY, color, lenWorld = 0.5 }: ArrowProps) {
    const dir = vecNormalize({ x: vx, y: vy });
    const tip = { x: x + dir.x * lenWorld, y: y + dir.y * lenWorld };
    const X1 = toX(x), Y1 = toY(y);
    const X2 = toX(tip.x), Y2 = toY(tip.y);
    const headSize = 6;
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

function CompactInput({ label, unit, value, step, onChange, isMobile }: {
    label: string;
    unit: string;
    value: number;
    step: number;
    onChange: (v: number) => void;
    isMobile?: boolean;
}) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#64748b", fontSize: isMobile ? 14 : 13, minWidth: 24 }}>{label}</span>
            <input
                type="number"
                value={value}
                step={step}
                onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                style={{
                    padding: isMobile ? "10px 12px" : "6px 8px",
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                    fontSize: 16, // Evita zoom iOS
                    width: isMobile ? 80 : 70,
                    textAlign: "right"
                }}
            />
            <span style={{ color: "#94a3b8", fontSize: 12 }}>{unit}</span>
        </div>
    );
}

// ============ COMPONENTE PRINCIPALE ============

export default function CampoElettricoDemo() {
    const { isMobile, isTablet } = useBreakpoint();
    const svgRef = useRef<SVGSVGElement | null>(null);

    // Coordinate mapping
    const mapper = useMemo(() => createCoordinateMapper(WIDTH, HEIGHT, WORLD), []);
    const { toX, toY, fromX, fromY, offsetX, offsetY } = mapper;

    // Stato fisico - Carica sorgente
    const [source, setSource] = useState<Vec2>({ x: -1.5, y: 0 });
    const [qMicro, setQMicro] = useState<number>(500);
    const qSourceC = microCoulombToC(qMicro);

    // Stato fisico - Carica di prova
    const [test, setTest] = useState<Vec2>({ x: 2, y: 1 });
    const [qTestNano, setQTestNano] = useState<number>(1);
    const qTestC = nanoCoulombToC(qTestNano);
    const [showTest, setShowTest] = useState<boolean>(false);

    // Opzioni visuali
    const [showField, setShowField] = useState<boolean>(true);
    const [grid, setGrid] = useState<number>(isMobile ? 16 : 24);
    const [vecScale, setVecScale] = useState<number>(0.80);

    // Drag & hover
    const [dragging, setDragging] = useState<null | "source" | "test">(null);
    const [hoverTarget, setHoverTarget] = useState<null | "source" | "test">(null);

    // ============ CALCOLI FISICI ============

    const testField: EField = useMemo(
        () => electricFieldAt(test, source, qSourceC),
        [test, source, qSourceC]
    );

    const testForceData = useMemo(
        () => electricForce(testField, qTestC),
        [testField, qTestC]
    );

    // Griglia vettori
    const gridPts: Vec2[] = useMemo(() => {
        const pts: Vec2[] = [];
        const nx = grid;
        const ny = Math.round(grid * ((WORLD.ymax - WORLD.ymin) / (WORLD.xmax - WORLD.xmin)));

        for (let i = 0; i < nx; i++) {
            const x = WORLD.xmin + (i + 0.5) * (WORLD.xmax - WORLD.xmin) / nx;
            for (let j = 0; j < ny; j++) {
                const y = WORLD.ymin + (j + 0.5) * (WORLD.ymax - WORLD.ymin) / ny;
                const r2 = (x - source.x) ** 2 + (y - source.y) ** 2;
                if (r2 < 0.06 * 0.06) continue;
                pts.push({ x, y });
            }
        }
        return pts;
    }, [grid, source]);

    function lenFromEmag(Emag: number): number {
        const Lmax = vecScale;
        const E0 = 2e5;
        return Lmax * (1 - Math.exp(-Emag / E0));
    }

    // ============ DRAG HANDLERS ============

    function getWorldPoint(clientX: number, clientY: number): Vec2 {
        const svg = svgRef.current;
        if (!svg) return { x: 0, y: 0 };
        const rect = svg.getBoundingClientRect();
        const viewBox = clientToViewBox(clientX, clientY, rect, WIDTH, HEIGHT);
        return { x: fromX(viewBox.x), y: fromY(viewBox.y) };
    }

    function getLocalPx(clientX: number, clientY: number): { x: number; y: number } {
        const svg = svgRef.current;
        if (!svg) return { x: 0, y: 0 };
        const rect = svg.getBoundingClientRect();
        return clientToViewBox(clientX, clientY, rect, WIDTH, HEIGHT);
    }

    function nearCharge(mousePx: { x: number; y: number }, chargeWorld: Vec2, radiusPx = 22): boolean {
        const cx = toX(chargeWorld.x), cy = toY(chargeWorld.y);
        const dx = cx - mousePx.x, dy = cy - mousePx.y;
        return Math.hypot(dx, dy) <= radiusPx;
    }

    function onPointerDown(e: React.PointerEvent<SVGSVGElement>) {
        const px = getLocalPx(e.clientX, e.clientY);
        let target: null | "source" | "test" = null;

        // Area touch più grande su mobile
        const touchRadius = isMobile ? 35 : 22;
        if (nearCharge(px, source, touchRadius)) target = "source";
        else if (showTest && nearCharge(px, test, touchRadius)) target = "test";

        if (target) {
            setDragging(target);
            svgRef.current?.setPointerCapture?.(e.pointerId);
        }
    }

    function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
        const px = getLocalPx(e.clientX, e.clientY);

        if (!dragging) {
            const h = nearCharge(px, source, 14)
                ? "source"
                : (showTest && nearCharge(px, test, 14) ? "test" : null);
            setHoverTarget(h);
            return;
        }

        let p = getWorldPoint(e.clientX, e.clientY);
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
        try { svgRef.current?.releasePointerCapture?.(e.pointerId); } catch {}
        setDragging(null);
    }

    const cursor = dragging ? "grabbing" : (hoverTarget ? "grab" : "crosshair");

    // ============ PANNELLI ============

    const SourcePanel = (
        <ResponsiveCard style={{ borderLeft: "4px solid #ef4444" }}>
            <div style={{ fontWeight: 600, marginBottom: 12, color: "#ef4444", fontSize: 14 }}>⊕ Carica sorgente</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <CompactInput label="x" unit="m" value={source.x} step={0.1} isMobile={isMobile} onChange={(v) => {
                    const nx = clamp(v, WORLD.xmin, WORLD.xmax);
                    let ns = { ...source, x: nx };
                    ns = constrainWithinRadius(ns, test, MAX_DIST);
                    setSource(ns);
                }} />
                <CompactInput label="y" unit="m" value={source.y} step={0.1} isMobile={isMobile} onChange={(v) => {
                    const ny = clamp(v, WORLD.ymin, WORLD.ymax);
                    let ns = { ...source, y: ny };
                    ns = constrainWithinRadius(ns, test, MAX_DIST);
                    setSource(ns);
                }} />
                <CompactInput label="q" unit="μC" value={qMicro} step={10} isMobile={isMobile} onChange={setQMicro} />
            </div>
        </ResponsiveCard>
    );

    const TestPanel = (
        <ResponsiveCard style={{ borderLeft: "4px solid #f59e0b" }}>
            <div style={{ fontWeight: 600, marginBottom: 12, color: "#f59e0b", fontSize: 14 }}>◉ Carica di prova</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <CompactInput label="x" unit="m" value={test.x} step={0.1} isMobile={isMobile} onChange={(v) => {
                    const nx = clamp(v, WORLD.xmin, WORLD.xmax);
                    let nt = { ...test, x: nx };
                    nt = constrainWithinRadius(nt, source, MAX_DIST);
                    setTest(nt);
                }} />
                <CompactInput label="y" unit="m" value={test.y} step={0.1} isMobile={isMobile} onChange={(v) => {
                    const ny = clamp(v, WORLD.ymin, WORLD.ymax);
                    let nt = { ...test, y: ny };
                    nt = constrainWithinRadius(nt, source, MAX_DIST);
                    setTest(nt);
                }} />
                <CompactInput label="q_t" unit="nC" value={qTestNano} step={0.1} isMobile={isMobile} onChange={setQTestNano} />
            </div>
        </ResponsiveCard>
    );

    const MeasurementsPanel = (
        <ResponsiveCard style={{ background: "#f0fdf4" }}>
            <div style={{ fontWeight: 600, marginBottom: 8, color: "#10b981" }}>📊 Misure</div>
            <div style={{ fontSize: isMobile ? 13 : 13, display: "grid", gap: 6 }}>
                <div><strong>E</strong> = ({formatScientific(testField.Ex)}, {formatScientific(testField.Ey)}) N/C</div>
                <div>|<strong>E</strong>| = <span style={{ color: "#2563eb", fontWeight: 600 }}>{formatScientific(testField.Emag)}</span> N/C</div>
                {showTest && (
                    <>
                        <div style={{ borderTop: "1px solid #bbf7d0", paddingTop: 6, marginTop: 4 }}>
                            <strong>F</strong> = q·E = ({formatScientific(testForceData.Fx)}, {formatScientific(testForceData.Fy)}) N
                        </div>
                        <div>|<strong>F</strong>| = <span style={{ color: "#10b981", fontWeight: 600 }}>{formatScientific(testForceData.Fmag)}</span> N</div>
                    </>
                )}
            </div>
        </ResponsiveCard>
    );

    const SettingsPanel = (
        <ResponsiveCard>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>⚙️ Impostazioni</div>
            <ResponsiveSlider
                value={grid}
                onChange={setGrid}
                min={8}
                max={28}
                step={2}
                label="Densità griglia"
            />
            <div style={{ marginTop: 12 }}>
                <ResponsiveSlider
                    value={vecScale}
                    onChange={setVecScale}
                    min={0.2}
                    max={1.2}
                    step={0.1}
                    label="Scala vettori"
                    formatValue={(v) => `${v.toFixed(1)} m`}
                />
            </div>
        </ResponsiveCard>
    );

    // ============ SVG CANVAS ============

    const SvgCanvas = (
        <ResponsiveSvg
            width={WIDTH}
            height={HEIGHT}
            maxHeight={{ mobile: "50vh", tablet: "55vh", desktop: "65vh" }}
            svgProps={{
                ref: svgRef,
                preserveAspectRatio: "xMidYMid meet",
                style: { cursor, touchAction: "none", display: "block", margin: "0 auto" },
                onPointerDown: onPointerDown,
                onPointerMove: onPointerMove,
                onPointerUp: onPointerUp,
                onPointerLeave: () => setDragging(null),
            }}
        >
            {/* Sfondo */}
            <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="#fff" rx={12} />

            {/* Griglia */}
            {Array.from({ length: 11 }, (_, i) => WORLD.xmin + i * (WORLD.xmax - WORLD.xmin) / 10).map((vx) => (
                <line key={`vx-${vx}`} x1={toX(vx)} y1={offsetY} x2={toX(vx)} y2={HEIGHT - offsetY} stroke="#eef2f7" />
            ))}
            {Array.from({ length: 8 }, (_, j) => WORLD.ymin + j * (WORLD.ymax - WORLD.ymin) / 7).map((vy) => (
                <line key={`vy-${vy}`} x1={offsetX} y1={toY(vy)} x2={WIDTH - offsetX} y2={toY(vy)} stroke="#eef2f7" />
            ))}

            {/* Assi */}
            <line x1={toX(WORLD.xmin)} y1={toY(0)} x2={toX(WORLD.xmax)} y2={toY(0)} stroke="#0f172a" strokeWidth={1.5} />
            <line x1={toX(0)} y1={toY(WORLD.ymin)} x2={toX(0)} y2={toY(WORLD.ymax)} stroke="#0f172a" strokeWidth={1.5} />

            {/* Vettori campo */}
            {showField && gridPts.map((p, idx) => {
                const E = electricFieldAt(p, source, qSourceC);
                const L = lenFromEmag(E.Emag);
                const color = qSourceC >= 0 ? "#2563eb" : "#1d4ed8";
                return <Arrow key={idx} x={p.x} y={p.y} vx={E.Ex} vy={E.Ey} lenWorld={L} toX={toX} toY={toY} color={color} />;
            })}

            {/* Carica sorgente */}
            <g style={{ cursor: dragging === "source" ? "grabbing" : "grab" }}>
                <circle cx={toX(source.x)} cy={toY(source.y)} r={isMobile ? 24 : 18} fill={qSourceC >= 0 ? "#ef4444" : "#3b82f6"} stroke="#0f172a" strokeWidth={2} />
                <text x={toX(source.x)} y={toY(source.y) + 6} fontSize={isMobile ? 26 : 22} textAnchor="middle" fill="#fff" fontWeight={700}>
                    {qSourceC >= 0 ? "+" : "−"}
                </text>
                {!isMobile && (
                    <text x={toX(source.x) + 24} y={toY(source.y) - 22} fontSize={14} fill="#0f172a" fontWeight={500}>
                        q = {qMicro.toFixed(0)} μC
                    </text>
                )}
            </g>

            {/* Carica di prova */}
            {showTest && (
                <g style={{ cursor: dragging === "test" ? "grabbing" : "grab" }}>
                    <Arrow
                        x={test.x}
                        y={test.y}
                        vx={testForceData.Fx}
                        vy={testForceData.Fy}
                        lenWorld={lenFromEmag(testField.Emag) * 0.9}
                        toX={toX}
                        toY={toY}
                        color="#10b981"
                    />
                    <circle cx={toX(test.x)} cy={toY(test.y)} r={isMobile ? 20 : 14} fill="#f59e0b" stroke="#0f172a" strokeWidth={2} />
                    {!isMobile && (
                        <text x={toX(test.x) + 18} y={toY(test.y) - 16} fontSize={14} fill="#0f172a" fontWeight={500}>
                            q_t = {qTestNano.toFixed(1)} nC
                        </text>
                    )}
                </g>
            )}
        </ResponsiveSvg>
    );

    // ============ LAYOUT MOBILE ============

    if (isMobile) {
        return (
            <DemoContainer
                title="Campo elettrico"
                description="Trascina le cariche per esplorare il campo"
            >
                {/* Pulsanti toggle */}
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    <TouchButton
                        variant={showField ? "primary" : "outline"}
                        onClick={() => setShowField(!showField)}
                        fullWidth
                    >
                        {showField ? "🔵 Vettori ON" : "Vettori OFF"}
                    </TouchButton>
                    <TouchButton
                        variant={showTest ? "primary" : "outline"}
                        onClick={() => setShowTest(!showTest)}
                        fullWidth
                    >
                        {showTest ? "🟡 Prova ON" : "Prova OFF"}
                    </TouchButton>
                </div>

                {/* Canvas */}
                <ResponsiveCard padding={8} style={{ marginBottom: 12 }}>
                    {SvgCanvas}
                </ResponsiveCard>

                {/* Misure */}
                {MeasurementsPanel}

                {/* Tabs per controlli */}
                <div style={{ marginTop: 12 }}>
                    <SwipeableTabs
                        tabs={[
                            { id: "source", label: "⊕ Sorgente", content: SourcePanel },
                            { id: "test", label: "◉ Prova", content: TestPanel },
                            { id: "settings", label: "⚙️ Opzioni", content: SettingsPanel },
                        ]}
                        defaultTab="source"
                    />
                </div>
            </DemoContainer>
        );
    }

    // ============ LAYOUT TABLET ============

    if (isTablet) {
        return (
            <DemoContainer
                title="Campo elettrico (carica puntiforme)"
                description="Trascina le cariche per esplorare il campo. Distanza max 5m."
            >
                {/* Toolbar */}
                <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                    <TouchButton
                        variant={showField ? "primary" : "outline"}
                        onClick={() => setShowField(!showField)}
                    >
                        {showField ? "Nascondi vettori" : "Mostra vettori"}
                    </TouchButton>
                    <TouchButton
                        variant={showTest ? "primary" : "outline"}
                        onClick={() => setShowTest(!showTest)}
                    >
                        {showTest ? "Nascondi carica prova" : "Mostra carica prova"}
                    </TouchButton>
                </div>

                {/* Canvas */}
                <ResponsiveCard padding={12} style={{ marginBottom: 12 }}>
                    {SvgCanvas}
                </ResponsiveCard>

                {/* Controlli */}
                <ResponsiveGrid columns={{ tablet: 3 }} gap={12}>
                    {SourcePanel}
                    {showTest && TestPanel}
                    {MeasurementsPanel}
                </ResponsiveGrid>

                <CollapsiblePanel title="⚙️ Impostazioni visualizzazione" defaultOpen={false}>
                    {SettingsPanel}
                </CollapsiblePanel>
            </DemoContainer>
        );
    }

    // ============ LAYOUT DESKTOP ============

    return (
        <DemoContainer
            title="Campo elettrico (carica puntiforme)"
            description="Trascina la carica sorgente e la carica di prova. Distanza bloccata a ≤ 5 m."
        >
            {/* Canvas principale */}
            <ResponsiveCard style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>Piano (x,y) in metri</div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <TouchButton
                            variant={showField ? "primary" : "outline"}
                            onClick={() => setShowField(!showField)}
                        >
                            {showField ? "Nascondi vettori" : "Mostra vettori"}
                        </TouchButton>
                        <TouchButton
                            variant={showTest ? "primary" : "outline"}
                            onClick={() => setShowTest(!showTest)}
                        >
                            {showTest ? "Nascondi carica prova" : "Mostra carica prova"}
                        </TouchButton>
                    </div>
                </div>

                {SvgCanvas}

                {/* Slider sotto il canvas */}
                <div style={{ display: "flex", gap: 32, marginTop: 16, flexWrap: "wrap", justifyContent: "center" }}>
                    <div style={{ minWidth: 200 }}>
                        <ResponsiveSlider value={grid} onChange={setGrid} min={8} max={28} step={2} label="Densità griglia" />
                    </div>
                    <div style={{ minWidth: 200 }}>
                        <ResponsiveSlider value={vecScale} onChange={setVecScale} min={0.2} max={1.2} step={0.1} label="Scala vettori" formatValue={(v) => `${v.toFixed(1)} m`} />
                    </div>
                </div>
            </ResponsiveCard>

            {/* Controlli in basso */}
            <ResponsiveGrid columns={{ desktop: 3 }} gap={16}>
                {SourcePanel}
                {TestPanel}
                {MeasurementsPanel}
            </ResponsiveGrid>
        </DemoContainer>
    );
}