/**
* FunzioniContinueDemo - Continuità e classificazione delle discontinuità
*
* Struttura:
*   - Definizione di continuità (3 condizioni)
*   - Grafico SVG interattivo per ogni esempio
*   - Step-by-step: f(x₀) definita? → limiti laterali → lim = f(x₀)? → classificazione
*   - Catalogo di esempi per ogni tipo di discontinuità
*/

import React, { useState, useCallback, useMemo } from "react";

import {
    Latex,
    DemoContainer,
    ProblemCard,
    NavigationButtons,
    StepCard,
    InfoBox,
    useStepNavigation,
    useBreakpoint,
    ResponsiveGrid,
    SwipeableTabs,
    CollapsiblePanel,
} from "../../components/ui";
import { CollapsibleExplanation } from "../../components/ui/CollapsibleExplanation";

// ============ TIPI ============

type DiscontinuityType = "continua" | "eliminabile" | "salto" | "seconda_specie";

interface SpecialPoint {
    x: number;
    y: number;
    type: "filled" | "empty";
}

interface AsymptoteArrow {
    x: number;
    direction: "up" | "down";
    side: "left" | "right";
}

interface FunctionExample {
    id: string;
    label: string;
    definitionLatex: string;
    a: number;
    aLatex: string;
    fa: number | undefined;
    faLatex: string;
    limLeft: number | undefined;
    limLeftLatex: string;
    limRight: number | undefined;
    limRightLatex: string;
    limit: number | undefined;
    limitLatex: string;
    type: DiscontinuityType;
    /** Segmenti da disegnare: lista di [xStart, xEnd] */
    segments: { range: [number, number]; fn: (x: number) => number }[];
    xRange: [number, number];
    yRange: [number, number];
    specialPoints: SpecialPoint[];
    arrows: AsymptoteArrow[];
}

// ============ CATALOGO FUNZIONI ============

const EXAMPLES: FunctionExample[] = [
// ── CONTINUA ──
    {
    id: "cont_1",
    label: "Continua: parabola",
    definitionLatex: "f(x) = x^2 - 1",
    a: 1, aLatex: "1",
    fa: 0, faLatex: "0",
    limLeft: 0, limLeftLatex: "0",
    limRight: 0, limRightLatex: "0",
    limit: 0, limitLatex: "0",
    type: "continua",
    segments: [{ range: [-2, 4], fn: (x) => x * x - 1 }],
    xRange: [-2, 4], yRange: [-2, 9],
    specialPoints: [{ x: 1, y: 0, type: "filled" }],
    arrows: [],
},
    {
    id: "cont_2",
    label: "Continua: seno",
    definitionLatex: "f(x) = \\sin(x)",
    a: 0, aLatex: "0",
    fa: 0, faLatex: "0",
    limLeft: 0, limLeftLatex: "0",
    limRight: 0, limRightLatex: "0",
    limit: 0, limitLatex: "0",
    type: "continua",
    segments: [{ range: [-7, 7], fn: (x) => Math.sin(x) }],
    xRange: [-7, 7], yRange: [-1.8, 1.8],
    specialPoints: [{ x: 0, y: 0, type: "filled" }],
    arrows: [],
},

// ── ELIMINABILE ──
    {
    id: "elim_1",
    label: "Eliminabile: (x²-1)/(x-1)",
    definitionLatex: "f(x) = \\dfrac{x^2 - 1}{x - 1}",
    a: 1, aLatex: "1",
    fa: undefined, faLatex: "\\text{non def.}",
    limLeft: 2, limLeftLatex: "2",
    limRight: 2, limRightLatex: "2",
    limit: 2, limitLatex: "2",
    type: "eliminabile",
    segments: [
        { range: [-1.5, 0.97], fn: (x) => x + 1 },
        { range: [1.03, 4], fn: (x) => x + 1 },
    ],
    xRange: [-1.5, 4], yRange: [-1, 6],
    specialPoints: [{ x: 1, y: 2, type: "empty" }],
    arrows: [],
},
    {
    id: "elim_2",
    label: "Eliminabile: sin(x)/x",
    definitionLatex: "f(x) = \\dfrac{\\sin(x)}{x}",
    a: 0, aLatex: "0",
    fa: undefined, faLatex: "\\text{non def.}",
    limLeft: 1, limLeftLatex: "1",
    limRight: 1, limRightLatex: "1",
    limit: 1, limitLatex: "1",
    type: "eliminabile",
    segments: [
        { range: [-10, -0.08], fn: (x) => Math.sin(x) / x },
        { range: [0.08, 10], fn: (x) => Math.sin(x) / x },
    ],
    xRange: [-10, 10], yRange: [-0.5, 1.5],
    specialPoints: [{ x: 0, y: 1, type: "empty" }],
    arrows: [],
},
    {
    id: "elim_3",
    label: "Eliminabile: f(x₀) ≠ lim",
    definitionLatex: "f(x) = \\begin{cases} x^2 & x \\neq 2 \\\\ 7 & x = 2 \\end{cases}",
    a: 2, aLatex: "2",
    fa: 7, faLatex: "7",
    limLeft: 4, limLeftLatex: "4",
    limRight: 4, limRightLatex: "4",
    limit: 4, limitLatex: "4",
    type: "eliminabile",
    segments: [
        { range: [-0.5, 1.97], fn: (x) => x * x },
        { range: [2.03, 3.5], fn: (x) => x * x },
    ],
    xRange: [-0.5, 3.5], yRange: [-1, 10],
    specialPoints: [
        { x: 2, y: 4, type: "empty" },
        { x: 2, y: 7, type: "filled" },
    ],
    arrows: [],
},

// ── SALTO (prima specie) ──
    {
    id: "salto_1",
    label: "Salto: funzione a tratti",
    definitionLatex: "f(x) = \\begin{cases} x + 1 & x < 2 \\\\ x - 1 & x \\geq 2 \\end{cases}",
    a: 2, aLatex: "2",
    fa: 1, faLatex: "1",
    limLeft: 3, limLeftLatex: "3",
    limRight: 1, limRightLatex: "1",
    limit: undefined, limitLatex: "\\text{non esiste}",
    type: "salto",
    segments: [
        { range: [-1, 1.97], fn: (x) => x + 1 },
        { range: [2, 5], fn: (x) => x - 1 },
    ],
    xRange: [-1, 5], yRange: [-1, 5],
    specialPoints: [
        { x: 2, y: 3, type: "empty" },
        { x: 2, y: 1, type: "filled" },
    ],
    arrows: [],
},
    {
    id: "salto_2",
    label: "Salto: segno di x",
    definitionLatex: "f(x) = \\text{sgn}(x) = \\begin{cases} -1 & x < 0 \\\\ 0 & x = 0 \\\\ 1 & x > 0 \\end{cases}",
    a: 0, aLatex: "0",
    fa: 0, faLatex: "0",
    limLeft: -1, limLeftLatex: "-1",
    limRight: 1, limRightLatex: "1",
    limit: undefined, limitLatex: "\\text{non esiste}",
    type: "salto",
    segments: [
        { range: [-4, -0.03], fn: () => -1 },
        { range: [0.03, 4], fn: () => 1 },
    ],
    xRange: [-4, 4], yRange: [-2, 2],
    specialPoints: [
        { x: 0, y: -1, type: "empty" },
        { x: 0, y: 0, type: "filled" },
        { x: 0, y: 1, type: "empty" },
    ],
    arrows: [],
},
    {
    id: "salto_3",
    label: "Salto: parte intera",
    definitionLatex: "f(x) = \\lfloor x \\rfloor",
    a: 1, aLatex: "1",
    fa: 1, faLatex: "1",
    limLeft: 0, limLeftLatex: "0",
    limRight: 1, limRightLatex: "1",
    limit: undefined, limitLatex: "\\text{non esiste}",
    type: "salto",
    segments: [
        { range: [-2, -1.02], fn: () => -2 },
        { range: [-1, -0.02], fn: () => -1 },
        { range: [0, 0.98], fn: () => 0 },
        { range: [1, 1.98], fn: () => 1 },
        { range: [2, 2.98], fn: () => 2 },
        { range: [3, 3.98], fn: () => 3 },
    ],
    xRange: [-2.5, 4.5], yRange: [-3, 4],
    specialPoints: [
        { x: -2, y: -2, type: "filled" }, { x: -1, y: -2, type: "empty" },
        { x: -1, y: -1, type: "filled" }, { x: 0, y: -1, type: "empty" },
        { x: 0, y: 0, type: "filled" }, { x: 1, y: 0, type: "empty" },
        { x: 1, y: 1, type: "filled" }, { x: 2, y: 1, type: "empty" },
        { x: 2, y: 2, type: "filled" }, { x: 3, y: 2, type: "empty" },
        { x: 3, y: 3, type: "filled" }, { x: 4, y: 3, type: "empty" },
    ],
    arrows: [],
},

// ── SECONDA SPECIE ──
    {
    id: "sec_1",
    label: "2ª specie: 1/x",
    definitionLatex: "f(x) = \\dfrac{1}{x}",
    a: 0, aLatex: "0",
    fa: undefined, faLatex: "\\text{non def.}",
    limLeft: undefined, limLeftLatex: "-\\infty",
    limRight: undefined, limRightLatex: "+\\infty",
    limit: undefined, limitLatex: "\\text{non esiste}",
    type: "seconda_specie",
    segments: [
        { range: [-5, -0.15], fn: (x) => 1 / x },
        { range: [0.15, 5], fn: (x) => 1 / x },
    ],
    xRange: [-5, 5], yRange: [-6, 6],
    specialPoints: [],
    arrows: [
        { x: 0, direction: "down", side: "left" },
        { x: 0, direction: "up", side: "right" },
    ],
},
    {
    id: "sec_2",
    label: "2ª specie: 1/(x-1)²",
    definitionLatex: "f(x) = \\dfrac{1}{(x-1)^2}",
    a: 1, aLatex: "1",
    fa: undefined, faLatex: "\\text{non def.}",
    limLeft: undefined, limLeftLatex: "+\\infty",
    limRight: undefined, limRightLatex: "+\\infty",
    limit: undefined, limitLatex: "+\\infty",
    type: "seconda_specie",
    segments: [
        { range: [-2, 0.7], fn: (x) => 1 / ((x - 1) * (x - 1)) },
        { range: [1.3, 5], fn: (x) => 1 / ((x - 1) * (x - 1)) },
    ],
    xRange: [-2, 5], yRange: [-1, 10],
    specialPoints: [],
    arrows: [
        { x: 1, direction: "up", side: "left" },
        { x: 1, direction: "up", side: "right" },
    ],
},
    {
    id: "sec_3",
    label: "2ª specie: sin(1/x)",
    definitionLatex: "f(x) = \\sin\\!\\left(\\dfrac{1}{x}\\right)",
    a: 0, aLatex: "0",
    fa: undefined, faLatex: "\\text{non def.}",
    limLeft: undefined, limLeftLatex: "\\nexists",
    limRight: undefined, limRightLatex: "\\nexists",
    limit: undefined, limitLatex: "\\text{non esiste}",
    type: "seconda_specie",
    segments: [
        { range: [-5, -0.04], fn: (x) => Math.sin(1 / x) },
        { range: [0.04, 5], fn: (x) => Math.sin(1 / x) },
    ],
    xRange: [-3, 3], yRange: [-1.8, 1.8],
    specialPoints: [],
    arrows: [],
},
    {
    id: "sec_4",
    label: "2ª specie: e^(1/x)",
    definitionLatex: "f(x) = e^{1/x}",
    a: 0, aLatex: "0",
    fa: undefined, faLatex: "\\text{non def.}",
    limLeft: 0, limLeftLatex: "0",
    limRight: undefined, limRightLatex: "+\\infty",
    limit: undefined, limitLatex: "\\text{non esiste}",
    type: "seconda_specie",
    segments: [
        { range: [-5, -0.08], fn: (x) => Math.exp(1 / x) },
        { range: [0.15, 5], fn: (x) => Math.min(Math.exp(1 / x), 12) },
    ],
    xRange: [-5, 5], yRange: [-1, 8],
    specialPoints: [],
    arrows: [
        { x: 0, direction: "up", side: "right" },
    ],
},
];

// ============ GRAFICO SVG ============

function FunctionGraph({
    example,
    width,
    height,
}: {
    example: FunctionExample;
    width: number;
    height: number;
}) {
    const pad = { top: 20, right: 20, bottom: 30, left: 40 };
    const w = width - pad.left - pad.right;
    const h = height - pad.top - pad.bottom;

    const [xMin, xMax] = example.xRange;
    const [yMin, yMax] = example.yRange;

    const toSvgX = (x: number) => pad.left + ((x - xMin) / (xMax - xMin)) * w;
    const toSvgY = (y: number) => pad.top + ((yMax - y) / (yMax - yMin)) * h;

    // Assi
    const originX = toSvgX(0);
    const originY = toSvgY(0);
    const showXAxis = yMin <= 0 && yMax >= 0;
    const showYAxis = xMin <= 0 && xMax >= 0;

    // Griglia
    const xTicks: number[] = [];
    const yTicks: number[] = [];
    const xStep = niceStep(xMax - xMin);
    const yStep = niceStep(yMax - yMin);

    for (let v = Math.ceil(xMin / xStep) * xStep; v <= xMax; v += xStep) {
        xTicks.push(Math.round(v * 1000) / 1000);
    }
    for (let v = Math.ceil(yMin / yStep) * yStep; v <= yMax; v += yStep) {
        yTicks.push(Math.round(v * 1000) / 1000);
    }

    // Curva: campiona punti per ogni segmento
    const curves = example.segments.map((seg, idx) => {
        const points: string[] = [];
        const [a, b] = seg.range;
        const n = Math.max(200, Math.round((b - a) * 60));
        const dx = (b - a) / n;
        let started = false;

        for (let i = 0; i <= n; i++) {
            const x = a + i * dx;
            const y = seg.fn(x);
            if (y === undefined || !isFinite(y) || y > yMax + (yMax - yMin) * 0.3 || y < yMin - (yMax - yMin) * 0.3) {
                if (started) {
                    // Interruzione
                    started = false;
                }
                continue;
            }
            const sx = toSvgX(x);
            const sy = toSvgY(Math.max(yMin - 1, Math.min(yMax + 1, y)));
            if (!started) {
                points.push(`M ${sx} ${sy}`);
                started = true;
            } else {
                points.push(`L ${sx} ${sy}`);
            }
        }
        return points.join(" ");
    });

    // Linea tratteggiata verticale x = a
    const aX = toSvgX(example.a);

    return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
        {/* Sfondo */}
    <rect x={pad.left} y={pad.top} width={w} height={h} fill="#fafbfc" rx={4} />

        {/* Griglia leggera */}
        {xTicks.map((v) => (
    <line key={`gx-${v}`} x1={toSvgX(v)} y1={pad.top} x2={toSvgX(v)} y2={pad.top + h} stroke="#e5e7eb" strokeWidth={0.5} />
    ))}
        {yTicks.map((v) => (
    <line key={`gy-${v}`} x1={pad.left} y1={toSvgY(v)} x2={pad.left + w} y2={toSvgY(v)} stroke="#e5e7eb" strokeWidth={0.5} />
))}

{/* Assi */}
{showXAxis && (
<line x1={pad.left} y1={originY} x2={pad.left + w} y2={originY} stroke="#64748b" strokeWidth={1.2} />
)}
{showYAxis && (
<line x1={originX} y1={pad.top} x2={originX} y2={pad.top + h} stroke="#64748b" strokeWidth={1.2} />
)}

{/* Tick labels */}
{xTicks.filter((v) => v !== 0).map((v) => (
<text key={`tx-${v}`} x={toSvgX(v)} y={pad.top + h + 16} fontSize={10} fill="#94a3b8" textAnchor="middle">
{Number.isInteger(v) ? v : v.toFixed(1)}
</text>
))}
{yTicks.filter((v) => v !== 0).map((v) => (
<text key={`ty-${v}`} x={pad.left - 8} y={toSvgY(v) + 4} fontSize={10} fill="#94a3b8" textAnchor="end">
{Number.isInteger(v) ? v : v.toFixed(1)}
</text>
))}

{/* Etichetta O */}
{showXAxis && showYAxis && (
<text x={originX - 8} y={originY + 14} fontSize={10} fill="#64748b">O</text>
)}

{/* Linea tratteggiata x = a */}
<line
x1={aX} y1={pad.top} x2={aX} y2={pad.top + h}
stroke="#3b82f6" strokeWidth={1} strokeDasharray="4,4" opacity={0.5}
/>
<text x={aX} y={pad.top + h + 16} fontSize={11} fill="#3b82f6" textAnchor="middle" fontWeight={700}>
x₀={example.aLatex}
</text>

{/* Curve */}
{curves.map((d, i) => (
<path key={`c-${i}`} d={d} fill="none" stroke="#dc2626" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
))}

{/* Frecce asintotiche */}
{example.arrows.map((arr, i) => {
const ax = toSvgX(arr.x) + (arr.side === "left" ? -6 : 6);
const tipY = arr.direction === "up" ? pad.top + 8 : pad.top + h - 8;
const baseY = arr.direction === "up" ? pad.top + 30 : pad.top + h - 30;
return (
<g key={`arr-${i}`}>
<line x1={ax} y1={baseY} x2={ax} y2={tipY} stroke="#dc2626" strokeWidth={1.5} strokeDasharray="3,3" />
<polygon
points={
arr.direction === "up"
? `${ax},${tipY} ${ax - 4},${tipY + 8} ${ax + 4},${tipY + 8}`
: `${ax},${tipY} ${ax - 4},${tipY - 8} ${ax + 4},${tipY - 8}`
}
fill="#dc2626"
/>
</g>
);
})}

{/* Punti speciali */}
{example.specialPoints.map((pt, i) => {
const px = toSvgX(pt.x);
const py = toSvgY(pt.y);
if (py < pad.top - 5 || py > pad.top + h + 5) return null;
return pt.type === "filled" ? (
<circle key={`sp-${i}`} cx={px} cy={py} r={4.5} fill="#dc2626" stroke="#fff" strokeWidth={1.5} />
) : (
<circle key={`sp-${i}`} cx={px} cy={py} r={4.5} fill="#fff" stroke="#dc2626" strokeWidth={2} />
);
})}

{/* Linee orizzontali tratteggiate ai limiti */}
{example.limLeft !== undefined && isFinite(example.limLeft) && (
<line
x1={pad.left} y1={toSvgY(example.limLeft)} x2={aX}  y2={toSvgY(example.limLeft)}
stroke="#8b5cf6" strokeWidth={1} strokeDasharray="3,3" opacity={0.6}
/>
)}
{example.limRight !== undefined && isFinite(example.limRight) && example.limRight !== example.limLeft && (
<line
x1={aX} y1={toSvgY(example.limRight)} x2={pad.left + w} y2={toSvgY(example.limRight)}
stroke="#8b5cf6" strokeWidth={1} strokeDasharray="3,3" opacity={0.6}
/>
)}

{/* Etichetta y = f(x) */}
<text x={pad.left + w - 4} y={pad.top + 14} fontSize={11} fill="#dc2626" textAnchor="end" fontStyle="italic" fontWeight={600}>
y = f(x)
</text>
</svg>
);
}

function niceStep(range: number): number {
const rough = range / 6;
const pow = Math.pow(10, Math.floor(Math.log10(rough)));
const norm = rough / pow;
if (norm < 1.5) return pow;
if (norm < 3.5) return 2 * pow;
if (norm < 7.5) return 5 * pow;
return 10 * pow;
}

// ============ COMPONENTE PRINCIPALE ============

export default function FunzioniContinueDemo() {
const { isMobile, isTablet } = useBreakpoint();

const [selectedIdx, setSelectedIdx] = useState(0);
const example = EXAMPLES[selectedIdx];

const { currentStep, nextStep, prevStep, showAll, reset } = useStepNavigation(4);
const isActive = (n: number) => currentStep >= n - 1;

const handleSelect = useCallback(
(idx: number) => {
setSelectedIdx(idx);
reset();
},
[reset]
);

// Raggruppamento per tipo
const groups = useMemo(() => {
const map: Record<DiscontinuityType, { label: string; color: string; items: { idx: number; ex: FunctionExample }[] }> = {
continua: { label: "✓ Continua", color: "#16a34a", items: [] },
eliminabile: { label: "Eliminabile", color: "#2563eb", items: [] },
salto: { label: "Salto (1ª specie)", color: "#d97706", items: [] },
seconda_specie: { label: "2ª specie", color: "#dc2626", items: [] },
};
EXAMPLES.forEach((ex, idx) => map[ex.type].items.push({ idx, ex }));
return map;
}, []);

const typeLabel = example.type === "continua" ? "Continua"
: example.type === "eliminabile" ? "Discontinuità eliminabile"
: example.type === "salto" ? "Discontinuità di salto (1ª specie)"
: "Discontinuità di 2ª specie";

const typeColor = example.type === "continua" ? "#16a34a"
: example.type === "eliminabile" ? "#2563eb"
: example.type === "salto" ? "#d97706"
: "#dc2626";

const graphW = isMobile ? 340 : isTablet ? 420 : 500;
const graphH = isMobile ? 220 : 260;

// ── STEP CARDS ──

const Step1 = (
<StepCard stepNumber={1} title="f(x₀) è definita?" color="green" isActive={isActive(1)}>
<CollapsibleExplanation title="Perché serve?">
<div>
<p>La <strong>prima condizione</strong> per la continuità è che <Latex>{"f(x_0)"}</Latex> sia definita.</p>
<p>Se <Latex>{"x_0"}</Latex> non appartiene al dominio, la funzione non può essere continua in quel punto.</p>
</div>
</CollapsibleExplanation>
<div style={{
padding: "10px 14px", background: "#fff", borderRadius: 8,
border: "1px solid #e2e8f0", fontSize: isMobile ? 15 : 17,
}}>
<Latex>{`f(${example.aLatex}) = ${example.faLatex}`}</Latex>
</div>
<div style={{
marginTop: 8, fontSize: 13, fontWeight: 600,
color: example.fa !== undefined ? "#16a34a" : "#dc2626",
}}>
{example.fa !== undefined ? "✓ f(x₀) è definita" : "✗ f(x₀) non è definita"}
</div>
</StepCard>
);

const Step2 = (
<StepCard stepNumber={2} title="Limiti laterali" color="blue" isActive={isActive(2)}>
<CollapsibleExplanation title="Limiti destro e sinistro">
<div>
<p>Si calcolano i <strong>limiti laterali</strong>:</p>
<Latex display>{"\\lim_{x \\to x_0^-} f(x) \\quad \\text{e} \\quad \\lim_{x \\to x_0^+} f(x)"}</Latex>
<p>Se sono entrambi finiti e uguali, il limite bilatero esiste.</p>
</div>
</CollapsibleExplanation>
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
<div style={{
padding: "8px 12px", background: "#fff", borderRadius: 8,
border: "1px solid #e2e8f0", fontSize: isMobile ? 14 : 16,
}}>
<div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>Limite sinistro:</div>
<Latex>{`\\lim_{x \\to ${example.aLatex}^-} f(x) = ${example.limLeftLatex}`}</Latex>
</div>
<div style={{
padding: "8px 12px", background: "#fff", borderRadius: 8,
border: "1px solid #e2e8f0", fontSize: isMobile ? 14 : 16,
}}>
<div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>Limite destro:</div>
<Latex>{`\\lim_{x \\to ${example.aLatex}^+} f(x) = ${example.limRightLatex}`}</Latex>
</div>
</div>
<div style={{
marginTop: 10, padding: "8px 12px", background: "#f8fafc", borderRadius: 8,
border: "1px solid #e2e8f0", fontSize: isMobile ? 14 : 16,
}}>
<div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>Limite bilatero:</div>
<Latex>{`\\lim_{x \\to ${example.aLatex}} f(x) = ${example.limitLatex}`}</Latex>
</div>
</StepCard>
);

const Step3 = (
<StepCard stepNumber={3} title="Verifica continuità" color="amber" isActive={isActive(3)}>
<CollapsibleExplanation title="Condizione fondamentale">
<div>
<p>Una funzione è <strong>continua</strong> in <Latex>{"x_0"}</Latex> se e solo se:</p>
<Latex display>{"\\lim_{x \\to x_0} f(x) = f(x_0)"}</Latex>
<p>Questo richiede che tutte e tre le condizioni siano soddisfatte:</p>
<ol>
<li><Latex>{"f(x_0)"}</Latex> è definita</li>
<li><Latex>{"\\lim_{x \\to x_0} f(x)"}</Latex> esiste (finito)</li>
<li>Limite e valore coincidono</li>
</ol>
</div>
</CollapsibleExplanation>
<div style={{ fontSize: 13, lineHeight: 2 }}>
{/* Condizione 1 */}
<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
<span style={{ color: example.fa !== undefined ? "#16a34a" : "#dc2626", fontWeight: 700 }}>
{example.fa !== undefined ? "✓" : "✗"}
</span>
<span><Latex>{`f(${example.aLatex})`}</Latex> definita</span>
</div>
{/* Condizione 2 */}
<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
<span style={{ color: example.limit !== undefined ? "#16a34a" : "#dc2626", fontWeight: 700 }}>
{example.limit !== undefined ? "✓" : "✗"}
</span>
<span><Latex>{`\\lim_{x \\to ${example.aLatex}} f(x)`}</Latex> esiste finito</span>
</div>
{/* Condizione 3 */}
<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
<span style={{
color: example.fa !== undefined && example.limit !== undefined && example.fa === example.limit ? "#16a34a" : "#dc2626",
fontWeight: 700,
}}>
{example.fa !== undefined && example.limit !== undefined && example.fa === example.limit ? "✓" : "✗"}
</span>
<span><Latex>{`\\lim_{x \\to ${example.aLatex}} f(x) = f(${example.aLatex})`}</Latex></span>
</div>
</div>
</StepCard>
);

const Step4 = (
<StepCard
stepNumber={4}
title="Classificazione"
color={example.type === "continua" ? "green" : "red"}
isActive={isActive(4)}
fullWidth
>
<CollapsibleExplanation title="Schema classificazione">
<div style={{ fontSize: 13 }}>
<p>I punti singolari si classificano in base al comportamento dei limiti laterali:</p>
<ul style={{ paddingLeft: 18, marginTop: 8 }}>
<li style={{ marginBottom: 6 }}>
<strong>Eliminabile:</strong> <Latex>{"\\lim_{x \\to x_0} f(x)"}</Latex> esiste finito, ma è diverso da <Latex>{"f(x_0)"}</Latex> oppure <Latex>{"f(x_0)"}</Latex> non è definita.
</li>
<li style={{ marginBottom: 6 }}>
<strong>Salto (1ª specie):</strong> i limiti destro e sinistro esistono finiti, ma sono diversi tra loro.
</li>
<li>
<strong>2ª specie:</strong> almeno uno dei limiti laterali non esiste oppure è infinito.
</li>
</ul>
</div>
</CollapsibleExplanation>

<div style={{
padding: "12px 16px",
background: example.type === "continua" ? "#f0fdf4" : "#fef2f2",
borderRadius: 8,
border: `2px solid ${typeColor}`,
}}>
<div style={{ fontWeight: 700, fontSize: isMobile ? 16 : 18, color: typeColor, marginBottom: 6 }}>
{example.type === "continua" ? "✓ " : "✗ "}{typeLabel}
</div>
<div style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
{example.type === "continua" && (
<span>Tutte e tre le condizioni sono soddisfatte: <Latex>{`\\lim_{x \\to ${example.aLatex}} f(x) = f(${example.aLatex}) = ${example.faLatex}`}</Latex></span>
)}
{example.type === "eliminabile" && example.fa === undefined && (
<span>Il limite esiste ed è finito (<Latex>{`l = ${example.limitLatex}`}</Latex>), ma <Latex>{`f(${example.aLatex})`}</Latex> non è definita. Si può eliminare la discontinuità ponendo <Latex>{`f(${example.aLatex}) = ${example.limitLatex}`}</Latex>.</span>
)}
{example.type === "eliminabile" && example.fa !== undefined && (
<span>Il limite esiste ed è finito (<Latex>{`l = ${example.limitLatex}`}</Latex>), ma <Latex>{`f(${example.aLatex}) = ${example.faLatex} \\neq ${example.limitLatex}`}</Latex>. Si può eliminare la discontinuità ridefinendo <Latex>{`f(${example.aLatex}) = ${example.limitLatex}`}</Latex>.</span>
)}
{example.type === "salto" && (
<span>I limiti laterali sono finiti ma diversi: <Latex>{`\\lim^- = ${example.limLeftLatex},\\; \\lim^+ = ${example.limRightLatex}`}</Latex>. L'ampiezza del salto è <Latex>{`|${example.limLeftLatex} - (${example.limRightLatex})| = ${Math.abs((example.limLeft ?? 0) - (example.limRight ?? 0))}`}</Latex>.</span>
)}
{example.type === "seconda_specie" && (
<span>Almeno uno dei limiti laterali è infinito o non esiste: <Latex>{`\\lim^- = ${example.limLeftLatex},\\; \\lim^+ = ${example.limRightLatex}`}</Latex>.</span>
)}
</div>
</div>
</StepCard>
);

// ── SELETTORE ESEMPI ──

const ExampleSelector = (
<div style={{ marginBottom: 16 }}>
{(Object.keys(groups) as DiscontinuityType[]).map((type) => {
const group = groups[type];
if (group.items.length === 0) return null;
return (
<div key={type} style={{ marginBottom: 10 }}>
<div style={{ fontSize: 12, fontWeight: 700, color: group.color, marginBottom: 4 }}>
{group.label}
</div>
<div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
{group.items.map(({ idx, ex }) => (
<button
key={ex.id}
onClick={() => handleSelect(idx)}
style={{
padding: "5px 10px",
fontSize: 12,
borderRadius: 6,
border: `1.5px solid ${idx === selectedIdx ? group.color : "#e2e8f0"}`,
background: idx === selectedIdx ? `${group.color}14` : "#fff",
color: idx === selectedIdx ? group.color : "#475569",
fontWeight: idx === selectedIdx ? 700 : 400,
cursor: "pointer",
transition: "all 0.15s",
}}
>
{ex.label}
</button>
))}
</div>
</div>
);
})}
</div>
);

// ── TABELLA RIASSUNTIVA ──

const SummaryTable = (
<div style={{ fontSize: 13, lineHeight: 1.6 }}>
<table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
<thead>
<tr style={{ background: "#f1f5f9" }}>
<th style={{ padding: "8px 10px", textAlign: "left", borderBottom: "2px solid #cbd5e1" }}>Tipo</th>
<th style={{ padding: "8px 10px", textAlign: "center", borderBottom: "2px solid #cbd5e1" }}>
<Latex>{"\\lim^-"}</Latex> e <Latex>{"\\lim^+"}</Latex>
</th>
<th style={{ padding: "8px 10px", textAlign: "center", borderBottom: "2px solid #cbd5e1" }}>
<Latex>{"\\lim"}</Latex> bilatero
</th>
<th style={{ padding: "8px 10px", textAlign: "center", borderBottom: "2px solid #cbd5e1" }}>
<Latex>{"f(x_0)"}</Latex>
</th>
</tr>
</thead>
<tbody>
<tr>
<td style={{ padding: "6px 10px", borderBottom: "1px solid #e2e8f0", color: "#16a34a", fontWeight: 700 }}>Continua</td>
<td style={{ padding: "6px 10px", borderBottom: "1px solid #e2e8f0", textAlign: "center" }}>finiti e uguali</td>
<td style={{ padding: "6px 10px", borderBottom: "1px solid #e2e8f0", textAlign: "center" }}>= l (finito)</td>
<td style={{ padding: "6px 10px", borderBottom: "1px solid #e2e8f0", textAlign: "center" }}>= l</td>
</tr>
<tr>
<td style={{ padding: "6px 10px", borderBottom: "1px solid #e2e8f0", color: "#2563eb", fontWeight: 700 }}>Eliminabile</td>
<td style={{ padding: "6px 10px", borderBottom: "1px solid #e2e8f0", textAlign: "center" }}>finiti e uguali</td>
<td style={{ padding: "6px 10px", borderBottom: "1px solid #e2e8f0", textAlign: "center" }}>= l (finito)</td>
<td style={{ padding: "6px 10px", borderBottom: "1px solid #e2e8f0", textAlign: "center" }}>≠ l oppure non def.</td>
</tr>
<tr>
<td style={{ padding: "6px 10px", borderBottom: "1px solid #e2e8f0", color: "#d97706", fontWeight: 700 }}>Salto</td>
<td style={{ padding: "6px 10px", borderBottom: "1px solid #e2e8f0", textAlign: "center" }}>finiti ma diversi</td>
<td style={{ padding: "6px 10px", borderBottom: "1px solid #e2e8f0", textAlign: "center" }}>non esiste</td>
<td style={{ padding: "6px 10px", borderBottom: "1px solid #e2e8f0", textAlign: "center" }}>—</td>
</tr>
<tr>
<td style={{ padding: "6px 10px", color: "#dc2626", fontWeight: 700 }}>2ª specie</td>
<td style={{ padding: "6px 10px", textAlign: "center" }}>almeno uno ±∞ o ∄</td>
<td style={{ padding: "6px 10px", textAlign: "center" }}>non esiste</td>
<td style={{ padding: "6px 10px", textAlign: "center" }}>—</td>
</tr>
</tbody>
</table>
</div>
);

const DefinitionCard = (
<div style={{
padding: "14px 18px", background: "#eff6ff", borderRadius: 10,
border: "2px solid #bfdbfe", marginBottom: 16,
}}>
<div style={{ fontWeight: 700, fontSize: 14, color: "#1e40af", marginBottom: 8 }}>
Continuità in un punto
</div>
<div style={{ fontSize: isMobile ? 14 : 15, lineHeight: 1.8 }}>
Sia <Latex>{"f"}</Latex> definita in un intorno di <Latex>{"x_0"}</Latex>. La funzione <Latex>{"f"}</Latex> è <strong>continua</strong> in <Latex>{"x_0"}</Latex> se:
</div>
<div style={{
padding: "10px 16px", background: "#fff", borderRadius: 8,
border: "1px solid #dbeafe", marginTop: 8, textAlign: "center",
fontSize: isMobile ? 16 : 20,
}}>
<Latex display>{"\\lim_{x \\to x_0} f(x) = f(x_0)"}</Latex>
</div>
<div style={{ marginTop: 10, fontSize: 12, color: "#475569", lineHeight: 1.7 }}>
Ciò richiede tre condizioni: (1) <Latex>{"f(x_0)"}</Latex> è definita, (2) il limite esiste finito, (3) limite e valore coincidono.
</div>
</div>
);

// ── MOBILE ──

if (isMobile) {
return (
<DemoContainer title="Funzioni continue" description="Continuità e discontinuità">
{DefinitionCard}
{ExampleSelector}

<ProblemCard label="Funzione:">
<div style={{ textAlign: "center", fontSize: 16 }}>
<Latex display>{example.definitionLatex}</Latex>
</div>
<div style={{ textAlign: "center", fontSize: 12, color: "#64748b", marginTop: 4 }}>
Analisi in <Latex>{`x_0 = ${example.aLatex}`}</Latex>
</div>
</ProblemCard>

<div style={{ display: "flex", justifyContent: "center", margin: "12px 0", overflowX: "auto" }}>
<FunctionGraph example={example} width={graphW} height={graphH} />
</div>

<NavigationButtons currentStep={currentStep} totalSteps={4} onNext={nextStep} onPrev={prevStep} onShowAll={showAll} />

<SwipeableTabs
tabs={[
{
id: "steps",
label: "📝 Analisi",
content: (
<div style={{ display: "grid", gap: 12 }}>
{Step1}
{Step2}
{Step3}
{Step4}
</div>
),
},
{
id: "schema",
label: "📊 Schema",
content: (
<CollapsiblePanel title="Classificazione" defaultOpen>
{SummaryTable}
</CollapsiblePanel>
),
},
]}
defaultTab="steps"
/>
</DemoContainer>
);
}

// ── TABLET ──

if (isTablet) {
return (
<DemoContainer title="Funzioni continue" description="Continuità e classificazione delle discontinuità">
{DefinitionCard}
{ExampleSelector}

<ProblemCard label="Studia la continuità di:">
<div style={{ textAlign: "center" }}>
<Latex display>{example.definitionLatex}</Latex>
</div>
<div style={{ textAlign: "center", fontSize: 12, color: "#64748b", marginTop: 4 }}>
nel punto <Latex>{`x_0 = ${example.aLatex}`}</Latex>
</div>
</ProblemCard>

<div style={{ display: "flex", justifyContent: "center", margin: "14px 0" }}>
<FunctionGraph example={example} width={graphW} height={graphH} />
</div>

<NavigationButtons currentStep={currentStep} totalSteps={4} onNext={nextStep} onPrev={prevStep} onShowAll={showAll} />

<ResponsiveGrid columns={{ tablet: 2 }} gap={12}>
{Step1}
{Step2}
</ResponsiveGrid>
<div style={{ marginTop: 12 }}>{Step3}</div>
<div style={{ marginTop: 12 }}>{Step4}</div>

<div style={{ marginTop: 16 }}>
<CollapsiblePanel title="📊 Classificazione dei punti singolari" defaultOpen={false}>
{SummaryTable}
</CollapsiblePanel>
</div>
</DemoContainer>
);
}

// ── DESKTOP ──

return (
<DemoContainer title="Funzioni continue" description="Continuità e classificazione delle discontinuità">
{DefinitionCard}
{ExampleSelector}

<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
<ProblemCard label="Studia la continuità di:">
<div style={{ textAlign: "center" }}>
<Latex display>{example.definitionLatex}</Latex>
</div>
<div style={{ textAlign: "center", fontSize: 12, color: "#64748b", marginTop: 4 }}>
nel punto <Latex>{`x_0 = ${example.aLatex}`}</Latex>
</div>
</ProblemCard>
<div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
<FunctionGraph example={example} width={graphW} height={graphH} />
</div>
</div>

<NavigationButtons currentStep={currentStep} totalSteps={4} onNext={nextStep} onPrev={prevStep} onShowAll={showAll} />

<ResponsiveGrid columns={{ desktop: 2 }} gap={12}>
{Step1}
{Step2}
</ResponsiveGrid>
<div style={{ marginTop: 12 }}>{Step3}</div>
<div style={{ marginTop: 12 }}>{Step4}</div>

<InfoBox title="📊 Classificazione dei punti singolari">{SummaryTable}</InfoBox>
</DemoContainer>
);
}