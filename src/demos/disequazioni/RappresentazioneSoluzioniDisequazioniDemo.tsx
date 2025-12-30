/**
 * RappresentazioneSoluzioniDisequazioniDemo - Versione Responsive
 * Visualizza soluzioni in forma algebrica, grafica e con notazione intervalli
 * Ottimizzato per mobile, tablet e desktop
 */

import React, { useState, useMemo, useRef } from "react";

// Componenti UI
import {
    DemoContainer,
    GenerateButton,
    InfoBox,
    useBreakpoint,
    ResponsiveGrid,
    ResponsiveCard,
    TouchButton,
    CollapsiblePanel,
} from "../../components/ui";

// Utility
import { randomInt, randomBool } from "../../utils/math";

// ============ TIPI ============

type RayForm = {
    type: "ray";
    boundary: number;
    op: "<" | "<=" | ">" | ">=";
};

type IntervalForm = {
    type: "interval";
    a: number;
    b: number;
    includeLeft: boolean;
    includeRight: boolean;
};

type TwoRaysForm = {
    type: "twoRays";
    left: number;
    right: number;
    includeLeft: boolean;
    includeRight: boolean;
};

type SolutionForm = RayForm | IntervalForm | TwoRaysForm;

type Segment = {
    from: number;
    to: number;
    includeFrom: boolean;
    includeTo: boolean;
    isInfiniteLeft?: boolean;
    isInfiniteRight?: boolean;
};

// ============ COSTANTI ============

const SVG_WIDTH = 800;
const SVG_HEIGHT = 200;
const X_MIN = -10;
const X_MAX = 10;

// ============ HELPERS ============

function formatNumber(n: number): string {
    if (Number.isInteger(n)) return n.toString();
    return n.toFixed(2).replace(/\.?0+$/, "").replace(".", ",");
}

function maybeHalf(x: number): number {
    if (Math.random() < 0.4) {
        const delta = Math.random() < 0.5 ? -0.5 : 0.5;
        const y = x + delta;
        if (y >= X_MIN && y <= X_MAX) return y;
    }
    return x;
}

function generateRandomSolution(): SolutionForm {
    const kind = randomInt(0, 2);

    if (kind === 0) {
        const boundary = maybeHalf(randomInt(-5, 5));
        const ops: RayForm["op"][] = ["<", "<=", ">", ">="];
        return { type: "ray", boundary, op: ops[randomInt(0, 3)] };
    }

    if (kind === 1) {
        let a = randomInt(-6, 3);
        let b = Math.min(6, randomInt(a + 1, a + 8));
        const aHalf = maybeHalf(a);
        const bHalf = maybeHalf(b);
        if (bHalf - aHalf >= 0.5) { a = aHalf; b = bHalf; }
        return { type: "interval", a, b, includeLeft: randomBool(), includeRight: randomBool() };
    }

    let left = randomInt(-6, 0);
    let right = Math.min(6, randomInt(left + 2, left + 8));
    const leftHalf = maybeHalf(left);
    const rightHalf = maybeHalf(right);
    if (rightHalf - leftHalf >= 0.5) { left = leftHalf; right = rightHalf; }
    return { type: "twoRays", left, right, includeLeft: randomBool(0.7), includeRight: randomBool(0.7) };
}

function algebraicForm(sol: SolutionForm): string {
    switch (sol.type) {
        case "ray": return `x ${sol.op} ${formatNumber(sol.boundary)}`;
        case "interval": {
            const leftOp = sol.includeLeft ? "≤" : "<";
            const rightOp = sol.includeRight ? "≤" : "<";
            return `${formatNumber(sol.a)} ${leftOp} x ${rightOp} ${formatNumber(sol.b)}`;
        }
        case "twoRays": {
            const leftOp = sol.includeLeft ? "≤" : "<";
            const rightOp = sol.includeRight ? "≥" : ">";
            return `x ${leftOp} ${formatNumber(sol.left)}  ∨  x ${rightOp} ${formatNumber(sol.right)}`;
        }
    }
}

function intervalNotation(sol: SolutionForm): string {
    switch (sol.type) {
        case "ray": {
            const a = formatNumber(sol.boundary);
            if (sol.op === "<") return `(-∞, ${a})`;
            if (sol.op === "<=") return `(-∞, ${a}]`;
            if (sol.op === ">") return `(${a}, +∞)`;
            return `[${a}, +∞)`;
        }
        case "interval": {
            const l = sol.includeLeft ? "[" : "(";
            const r = sol.includeRight ? "]" : ")";
            return `${l}${formatNumber(sol.a)}, ${formatNumber(sol.b)}${r}`;
        }
        case "twoRays": {
            const leftPart = sol.includeLeft ? `(-∞, ${formatNumber(sol.left)}]` : `(-∞, ${formatNumber(sol.left)})`;
            const rightPart = sol.includeRight ? `[${formatNumber(sol.right)}, +∞)` : `(${formatNumber(sol.right)}, +∞)`;
            return `${leftPart} ∪ ${rightPart}`;
        }
    }
}

function scaleX(x: number): number {
    return 40 + ((x - X_MIN) / (X_MAX - X_MIN)) * (SVG_WIDTH - 80);
}

function solutionToSegments(sol: SolutionForm): Segment[] {
    switch (sol.type) {
        case "ray":
            return sol.op === "<" || sol.op === "<="
                ? [{ from: X_MIN, to: sol.boundary, includeFrom: false, includeTo: sol.op === "<=", isInfiniteLeft: true }]
                : [{ from: sol.boundary, to: X_MAX, includeFrom: sol.op === ">=", includeTo: false, isInfiniteRight: true }];
        case "interval":
            return [{ from: sol.a, to: sol.b, includeFrom: sol.includeLeft, includeTo: sol.includeRight }];
        case "twoRays":
            return [
                { from: X_MIN, to: sol.left, includeFrom: false, includeTo: sol.includeLeft, isInfiniteLeft: true },
                { from: sol.right, to: X_MAX, includeFrom: sol.includeRight, includeTo: false, isInfiniteRight: true }
            ];
    }
}

function computeComplementSegments(segments: Segment[]): Segment[] {
    if (!segments.length) return [{ from: X_MIN, to: X_MAX, includeFrom: false, includeTo: false }];

    const clamped = segments
        .map(s => ({ from: Math.max(X_MIN, Math.min(X_MAX, s.from)), to: Math.max(X_MIN, Math.min(X_MAX, s.to)) }))
        .filter(s => s.to > s.from)
        .sort((a, b) => a.from - b.from);

    if (!clamped.length) return [{ from: X_MIN, to: X_MAX, includeFrom: false, includeTo: false }];

    const merged: { from: number; to: number }[] = [];
    let cur = { ...clamped[0] };
    for (let i = 1; i < clamped.length; i++) {
        if (clamped[i].from <= cur.to) cur.to = Math.max(cur.to, clamped[i].to);
        else { merged.push(cur); cur = { ...clamped[i] }; }
    }
    merged.push(cur);

    const complement: Segment[] = [];
    let start = X_MIN;
    for (const s of merged) {
        if (s.from > start) complement.push({ from: start, to: s.from, includeFrom: false, includeTo: false });
        start = s.to;
    }
    if (start < X_MAX) complement.push({ from: start, to: X_MAX, includeFrom: false, includeTo: false });
    return complement;
}

// ============ COMPONENTE PRINCIPALE ============

export default function RappresentazioneSoluzioniDisequazioniDemo() {
    const { isMobile, isTablet } = useBreakpoint();
    const [solution, setSolution] = useState<SolutionForm>(() => generateRandomSolution());
    const [showAlgebraic, setShowAlgebraic] = useState(true);
    const [showInterval, setShowInterval] = useState(true);
    const [cleanProgress, setCleanProgress] = useState(0);
    const isCleaningRef = useRef(false);

    const segments = useMemo(() => solutionToSegments(solution), [solution]);
    const complementSegments = useMemo(() => computeComplementSegments(segments), [segments]);
    const algebraic = useMemo(() => algebraicForm(solution), [solution]);
    const interval = useMemo(() => intervalNotation(solution), [solution]);

    const endpointValues = useMemo(() => {
        const vals: number[] = [];
        segments.forEach(seg => {
            if (!seg.isInfiniteLeft && !vals.includes(seg.from)) vals.push(seg.from);
            if (!seg.isInfiniteRight && !vals.includes(seg.to)) vals.push(seg.to);
        });
        return vals.sort((a, b) => a - b);
    }, [segments]);

    const newSolution = () => {
        setSolution(generateRandomSolution());
        setCleanProgress(0);
        isCleaningRef.current = false;
    };

    const startCleaning = () => {
        if (isCleaningRef.current) return;
        isCleaningRef.current = true;
        setCleanProgress(0);

        const duration = 800;
        let startTime: number | null = null;

        const step = (timestamp: number) => {
            if (startTime === null) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const t = Math.min(1, elapsed / duration);
            setCleanProgress(t);
            if (t < 1) requestAnimationFrame(step);
            else isCleaningRef.current = false;
        };

        requestAnimationFrame(step);
    };

    const axisY = SVG_HEIGHT / 2;
    const showEndpointLabels = cleanProgress > 0.99;

    // ============ SVG GRAFICO ============

    const GraphSvg = (
        <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} style={{ width: "100%", height: "auto" }}>
            <defs>
                <pattern id="graphPaper" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <rect width="20" height="20" fill="#fafafa" />
                    <path d="M20 0 H0 V20" fill="none" stroke="#e0e0e0" strokeWidth={1} />
                </pattern>
            </defs>

            <rect x={0} y={0} width={SVG_WIDTH} height={SVG_HEIGHT} fill="url(#graphPaper)" stroke="#ddd" rx={8} />

            {/* Retta base */}
            <line x1={scaleX(X_MIN)} y1={axisY} x2={scaleX(X_MAX)} y2={axisY} stroke="#999" strokeWidth={2} strokeOpacity={Math.max(0.1, 1 - cleanProgress * 0.9)} />

            {/* Infiniti */}
            <circle cx={scaleX(X_MIN)} cy={axisY} r={5} fill="#666" stroke="#444" strokeWidth={1.5} opacity={Math.max(0.1, 1 - cleanProgress * 0.9)} />
            <circle cx={scaleX(X_MAX)} cy={axisY} r={5} fill="#666" stroke="#444" strokeWidth={1.5} opacity={Math.max(0.1, 1 - cleanProgress * 0.9)} />
            <text x={scaleX(X_MIN)} y={axisY + 25} fontSize={12} textAnchor="middle" fill="#555" fontStyle="italic" opacity={Math.max(0.1, 1 - cleanProgress * 0.9)}>−∞</text>
            <text x={scaleX(X_MAX)} y={axisY + 25} fontSize={12} textAnchor="middle" fill="#555" fontStyle="italic" opacity={Math.max(0.1, 1 - cleanProgress * 0.9)}>+∞</text>

            {/* Tacche */}
            {Array.from({ length: X_MAX - X_MIN + 1 }, (_, i) => {
                const xReal = X_MIN + i;
                const xSvg = scaleX(xReal);
                const tickOpacity = Math.max(0.1, 1 - cleanProgress * 0.9);
                // Su mobile, mostra meno tacche
                if (isMobile && xReal % 2 !== 0) return null;
                return (
                    <g key={`tick-${xReal}`} opacity={tickOpacity}>
                        <line x1={xSvg} y1={axisY - 5} x2={xSvg} y2={axisY + 5} stroke="#555" strokeWidth={1} />
                        {xReal % 2 === 0 && <text x={xSvg} y={axisY + 22} fontSize={isMobile ? 10 : 11} textAnchor="middle" fill="#333">{xReal}</text>}
                    </g>
                );
            })}

            {/* Complemento (sparisce) */}
            {complementSegments.map((seg, idx) => {
                const opacity = 1 - cleanProgress;
                if (opacity <= 0) return null;
                return <line key={`comp-${idx}`} x1={scaleX(seg.from)} y1={axisY} x2={scaleX(seg.to)} y2={axisY} stroke="#777" strokeWidth={3} strokeOpacity={opacity} />;
            })}

            {/* Soluzione (blu) */}
            {segments.map((seg, idx) => {
                const xFrom = scaleX(seg.from);
                const xTo = scaleX(seg.to);
                const dashLength = 54;
                const circleR = isMobile ? 8 : 6;

                return (
                    <g key={`seg-${idx}`}>
                        {!seg.isInfiniteLeft && !seg.isInfiniteRight && (
                            <line x1={xFrom} y1={axisY} x2={xTo} y2={axisY} stroke="#1f77b4" strokeWidth={4} />
                        )}

                        {seg.isInfiniteLeft && (
                            <>
                                <line x1={xFrom} y1={axisY} x2={xFrom + dashLength} y2={axisY} stroke="#1f77b4" strokeWidth={4} strokeDasharray="12,6" />
                                <line x1={xFrom + dashLength} y1={axisY} x2={xTo} y2={axisY} stroke="#1f77b4" strokeWidth={4} />
                            </>
                        )}

                        {seg.isInfiniteRight && (
                            <>
                                <line x1={xFrom} y1={axisY} x2={xTo - dashLength} y2={axisY} stroke="#1f77b4" strokeWidth={4} />
                                <line x1={xTo - dashLength} y1={axisY} x2={xTo} y2={axisY} stroke="#1f77b4" strokeWidth={4} strokeDasharray="12,6" />
                            </>
                        )}

                        {!seg.isInfiniteLeft && (
                            <circle cx={xFrom} cy={axisY} r={circleR} fill={seg.includeFrom ? "#1f77b4" : "#ffffff"} stroke="#1f77b4" strokeWidth={2.5} />
                        )}
                        {!seg.isInfiniteRight && (
                            <circle cx={xTo} cy={axisY} r={circleR} fill={seg.includeTo ? "#1f77b4" : "#ffffff"} stroke="#1f77b4" strokeWidth={2.5} />
                        )}
                    </g>
                );
            })}

            {/* Etichette estremi */}
            {showEndpointLabels && endpointValues.map((val, idx) => (
                <text key={`lbl-${idx}`} x={scaleX(val)} y={axisY - 20} fontSize={isMobile ? 12 : 13} textAnchor="middle" fill="#1f77b4" fontWeight={600}>
                    {formatNumber(val)}
                </text>
            ))}
        </svg>
    );

    // ============ PANNELLI FORME ============

    const AlgebraicPanel = (
        <ResponsiveCard style={{ background: "#eff6ff", flex: 1 }}>
            <div style={{ fontWeight: 600, marginBottom: 8, color: "#1d4ed8", fontSize: isMobile ? 14 : 16 }}>Forma algebrica</div>
            <div style={{ fontSize: isMobile ? 18 : 20, fontFamily: "Georgia, serif", color: "#1e3a8a" }}>{algebraic}</div>
        </ResponsiveCard>
    );

    const IntervalPanel = (
        <ResponsiveCard style={{ background: "#f0fdf4", flex: 1 }}>
            <div style={{ fontWeight: 600, marginBottom: 8, color: "#166534", fontSize: isMobile ? 14 : 16 }}>Notazione intervalli</div>
            <div style={{ fontSize: isMobile ? 18 : 20, fontFamily: "Georgia, serif", color: "#14532d" }}>{interval}</div>
        </ResponsiveCard>
    );

    // ============ LEGENDA ============

    const Legend = (
        <div style={{ display: "flex", flexWrap: "wrap", gap: isMobile ? 12 : 20, fontSize: isMobile ? 12 : 13 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width={24} height={16}><circle cx={12} cy={8} r={5} fill="#1f77b4" stroke="#1f77b4" strokeWidth={2} /></svg>
                <span>Incluso (≤, ≥)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width={24} height={16}><circle cx={12} cy={8} r={5} fill="#fff" stroke="#1f77b4" strokeWidth={2} /></svg>
                <span>Escluso (&lt;, &gt;)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width={30} height={16}><line x1={0} y1={8} x2={30} y2={8} stroke="#1f77b4" strokeWidth={3} strokeDasharray="6,3" /></svg>
                <span>Infinito</span>
            </div>
        </div>
    );

    // ============ LAYOUT MOBILE ============

    if (isMobile) {
        return (
            <DemoContainer
                title="Soluzioni disequazioni"
                description="Forma algebrica, grafica e intervalli"
            >
                {/* Controlli */}
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    <TouchButton variant="primary" onClick={newSolution} fullWidth>
                        🎲 Nuova
                    </TouchButton>
                    <TouchButton
                        variant={cleanProgress > 0 ? "secondary" : "outline"}
                        onClick={startCleaning}
                        disabled={cleanProgress > 0}
                        fullWidth
                    >
                        🧹 Pulisci
                    </TouchButton>
                </div>

                {/* Grafico */}
                <ResponsiveCard padding={8} style={{ marginBottom: 12 }}>
                    {GraphSvg}
                </ResponsiveCard>

                {/* Forme */}
                <div style={{ display: "grid", gap: 12, marginBottom: 12 }}>
                    {showAlgebraic && AlgebraicPanel}
                    {showInterval && IntervalPanel}
                </div>

                {/* Toggle + Legenda collassati */}
                <CollapsiblePanel title="⚙️ Opzioni e legenda" defaultOpen={false}>
                    <div style={{ display: "grid", gap: 12 }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "8px 0" }}>
                            <input type="checkbox" checked={showAlgebraic} onChange={(e) => setShowAlgebraic(e.target.checked)} style={{ width: 18, height: 18 }} />
                            <span>Forma algebrica</span>
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "8px 0" }}>
                            <input type="checkbox" checked={showInterval} onChange={(e) => setShowInterval(e.target.checked)} style={{ width: 18, height: 18 }} />
                            <span>Notazione intervalli</span>
                        </label>
                        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 12 }}>
                            {Legend}
                        </div>
                    </div>
                </CollapsiblePanel>
            </DemoContainer>
        );
    }

    // ============ LAYOUT TABLET ============

    if (isTablet) {
        return (
            <DemoContainer
                title="Rappresentazione soluzioni disequazioni"
                description="Visualizza soluzioni in forma algebrica, grafica e con notazione intervalli."
            >
                {/* Controlli */}
                <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                    <GenerateButton text="Nuova soluzione" onClick={newSolution} />
                    <TouchButton
                        variant={cleanProgress > 0 ? "secondary" : "outline"}
                        onClick={startCleaning}
                        disabled={cleanProgress > 0}
                    >
                        🧹 Pulisci soluzione
                    </TouchButton>
                </div>

                {/* Grafico */}
                <ResponsiveCard style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Rappresentazione grafica</div>
                    {GraphSvg}
                </ResponsiveCard>

                {/* Toggle */}
                <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                        <input type="checkbox" checked={showAlgebraic} onChange={(e) => setShowAlgebraic(e.target.checked)} />
                        <span>Forma algebrica</span>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                        <input type="checkbox" checked={showInterval} onChange={(e) => setShowInterval(e.target.checked)} />
                        <span>Notazione intervalli</span>
                    </label>
                </div>

                {/* Forme */}
                <ResponsiveGrid columns={{ tablet: 2 }} gap={12}>
                    {showAlgebraic && AlgebraicPanel}
                    {showInterval && IntervalPanel}
                </ResponsiveGrid>

                {/* Legenda */}
                <CollapsiblePanel title="Legenda" defaultOpen={false}>
                    {Legend}
                </CollapsiblePanel>
            </DemoContainer>
        );
    }

    // ============ LAYOUT DESKTOP ============

    return (
        <DemoContainer
            title="Rappresentazione delle soluzioni di una disequazione"
            description="Visualizza soluzioni in forma algebrica, grafica e con notazione intervalli."
        >
            <p style={{ marginBottom: "1rem", lineHeight: 1.4, fontSize: 14, color: "#64748b" }}>
                Questa pagina mostra una <strong>soluzione già risolta</strong> di una
                disequazione in tre modi: <strong>forma algebrica</strong>,{" "}
                <strong>rappresentazione grafica</strong> e <strong>notazione per intervalli</strong>.
                Con il pulsante <em>"Pulisci soluzione"</em> vengono eliminati i
                pezzi di retta che <strong>non</strong> appartengono alla soluzione.
            </p>

            {/* Grafico */}
            <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12, marginBottom: 20, boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>
                <h2 style={{ fontSize: "1.1rem", marginBottom: 8 }}>Rappresentazione grafica sulla retta reale</h2>
                {GraphSvg}
            </div>

            {/* Controlli */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
                <GenerateButton text="Nuova soluzione" onClick={newSolution} />
                <button
                    onClick={startCleaning}
                    disabled={cleanProgress > 0}
                    style={{
                        padding: "10px 20px",
                        borderRadius: 8,
                        border: cleanProgress > 0 ? "1px solid #cbd5e1" : "1px solid #22c55e",
                        background: cleanProgress > 0 ? "#f1f5f9" : "#dcfce7",
                        color: cleanProgress > 0 ? "#94a3b8" : "#166534",
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: cleanProgress > 0 ? "not-allowed" : "pointer",
                    }}
                >
                    🧹 Pulisci soluzione
                </button>
            </div>

            {/* Toggle */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input type="checkbox" checked={showAlgebraic} onChange={(e) => setShowAlgebraic(e.target.checked)} />
                    <span>Mostra forma algebrica</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input type="checkbox" checked={showInterval} onChange={(e) => setShowInterval(e.target.checked)} />
                    <span>Mostra notazione intervalli</span>
                </label>
            </div>

            {/* Forme */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {showAlgebraic && AlgebraicPanel}
                {showInterval && IntervalPanel}
            </div>

            {/* Legenda */}
            <div style={{ marginTop: 20, background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #e5e7eb" }}>
                <div style={{ fontWeight: 600, marginBottom: 10 }}>Legenda</div>
                {Legend}
            </div>

            <InfoBox title="Tipi di soluzione:">
                <ul style={{ margin: "8px 0 0 0", paddingLeft: 20 }}>
                    <li><strong>Semiretta:</strong> x &lt; a oppure x &gt; a</li>
                    <li><strong>Intervallo:</strong> a &lt; x &lt; b</li>
                    <li><strong>Unione di semirette:</strong> x &lt; a oppure x &gt; b (esterno)</li>
                </ul>
            </InfoBox>
        </DemoContainer>
    );
}