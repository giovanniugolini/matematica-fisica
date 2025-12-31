/**
 * CondensatoreDemo - Il Condensatore: Capacità, Carica ed Energia
 *
 * Caratteristiche:
 * - Visualizzazione condensatore piano con cariche
 * - Calcolo capacità, carica, energia
 * - 3 layout responsive (mobile, tablet, desktop)
 *
 * TODO: Aggiungere tab RC e Serie/Parallelo quando svolti in classe
 */

import React, { useState, useMemo } from "react";

import {
    Latex,
    DemoContainer,
    ResponsiveCard,
    CollapsiblePanel,
    useBreakpoint,
} from "../../components/ui";

// ============ COSTANTI ============

const COLORS = {
    positive: "#ef4444",
    negative: "#3b82f6",
    electric: "#f59e0b",
    capacita: "#8b5cf6",
    tensione: "#22c55e",
    carica: "#ec4899",
    energia: "#06b6d4",
    text: "#334155",
};

// ============ UTILITÀ ============

function formatWithPrefix(value: number, unit: string, decimals: number = 2): string {
    if (value === 0) return `0 ${unit}`;

    const absValue = Math.abs(value);
    let prefix = "";
    let displayValue = value;

    if (absValue >= 1e6) {
        prefix = "M";
        displayValue = value / 1e6;
    } else if (absValue >= 1e3) {
        prefix = "k";
        displayValue = value / 1e3;
    } else if (absValue >= 1) {
        prefix = "";
        displayValue = value;
    } else if (absValue >= 1e-3) {
        prefix = "m";
        displayValue = value / 1e-3;
    } else if (absValue >= 1e-6) {
        prefix = "μ";
        displayValue = value / 1e-6;
    } else if (absValue >= 1e-9) {
        prefix = "n";
        displayValue = value / 1e-9;
    } else {
        prefix = "p";
        displayValue = value / 1e-12;
    }

    return `${displayValue.toFixed(decimals)} ${prefix}${unit}`;
}

// ============ COMPONENTE CONDENSATORE VISUALE ============

interface CondensatoreVisualeProps {
    tensione: number;
    caricaPercentuale: number; // 0-1
    width: number;
    height: number;
    showField?: boolean;
}

function CondensatoreVisuale({
                                 tensione,
                                 caricaPercentuale,
                                 width,
                                 height,
                                 showField = true
                             }: CondensatoreVisualeProps) {
    const cx = width / 2;
    const cy = height / 2;

    // Dimensioni piastre
    const plateWidth = 12;
    const plateHeight = height * 0.5;
    const plateSeparation = width * 0.25;

    // Posizioni piastre
    const leftPlateX = cx - plateSeparation / 2 - plateWidth / 2;
    const rightPlateX = cx + plateSeparation / 2 - plateWidth / 2;
    const plateY = cy - plateHeight / 2;

    // Numero di cariche proporzionale alla carica
    const numCharges = Math.max(0, Math.floor(caricaPercentuale * 8));

    // Genera posizioni cariche
    const charges = useMemo(() => {
        const result = [];
        for (let i = 0; i < numCharges; i++) {
            const yPos = plateY + 20 + (i * (plateHeight - 40) / Math.max(numCharges - 1, 1));
            result.push({ y: yPos, key: i });
        }
        return result;
    }, [numCharges, plateY, plateHeight]);

    // Linee campo elettrico
    const fieldLines = useMemo(() => {
        if (!showField || caricaPercentuale < 0.1) return [];
        const lines = [];
        const numLines = 5;
        for (let i = 0; i < numLines; i++) {
            const yPos = plateY + 30 + (i * (plateHeight - 60) / (numLines - 1));
            lines.push({ y: yPos, key: i });
        }
        return lines;
    }, [showField, caricaPercentuale, plateY, plateHeight]);

    return (
        <svg width={width} height={height} style={{ display: 'block' }}>
            {/* Sfondo */}
            <rect x={0} y={0} width={width} height={height} fill="#fafafa" rx={8} />

            {/* Fili di collegamento */}
            <line
                x1={20} y1={cy}
                x2={leftPlateX} y2={cy}
                stroke="#475569"
                strokeWidth={3}
            />
            <line
                x1={rightPlateX + plateWidth} y1={cy}
                x2={width - 20} y2={cy}
                stroke="#475569"
                strokeWidth={3}
            />

            {/* Piastra sinistra (positiva) */}
            <rect
                x={leftPlateX}
                y={plateY}
                width={plateWidth}
                height={plateHeight}
                fill={COLORS.positive}
                rx={2}
            />
            <text
                x={leftPlateX + plateWidth / 2}
                y={plateY - 10}
                textAnchor="middle"
                fontSize={18}
                fontWeight={700}
                fill={COLORS.positive}
            >
                +
            </text>

            {/* Piastra destra (negativa) */}
            <rect
                x={rightPlateX}
                y={plateY}
                width={plateWidth}
                height={plateHeight}
                fill={COLORS.negative}
                rx={2}
            />
            <text
                x={rightPlateX + plateWidth / 2}
                y={plateY - 10}
                textAnchor="middle"
                fontSize={18}
                fontWeight={700}
                fill={COLORS.negative}
            >
                −
            </text>

            {/* Cariche sulla piastra positiva */}
            {charges.map((c) => (
                <text
                    key={`pos-${c.key}`}
                    x={leftPlateX + plateWidth + 8}
                    y={c.y + 5}
                    fontSize={14}
                    fill={COLORS.positive}
                >
                    +
                </text>
            ))}

            {/* Cariche sulla piastra negativa */}
            {charges.map((c) => (
                <text
                    key={`neg-${c.key}`}
                    x={rightPlateX - 12}
                    y={c.y + 5}
                    fontSize={14}
                    fill={COLORS.negative}
                >
                    −
                </text>
            ))}

            {/* Linee campo elettrico */}
            {fieldLines.map((line) => (
                <g key={`field-${line.key}`}>
                    <defs>
                        <marker
                            id={`arrow-${line.key}`}
                            markerWidth="8"
                            markerHeight="6"
                            refX="7"
                            refY="3"
                            orient="auto"
                        >
                            <polygon points="0 0, 8 3, 0 6" fill={COLORS.electric} />
                        </marker>
                    </defs>
                    <line
                        x1={leftPlateX + plateWidth + 25}
                        y1={line.y}
                        x2={rightPlateX - 20}
                        y2={line.y}
                        stroke={COLORS.electric}
                        strokeWidth={1.5}
                        strokeDasharray="6,3"
                        markerEnd={`url(#arrow-${line.key})`}
                        opacity={0.7}
                    />
                </g>
            ))}

            {/* Label E */}
            {showField && caricaPercentuale >= 0.1 && (
                <text
                    x={cx}
                    y={cy + plateHeight / 2 + 25}
                    textAnchor="middle"
                    fontSize={14}
                    fontWeight={600}
                    fill={COLORS.electric}
                >
                    E⃗ (campo elettrico)
                </text>
            )}

            {/* Tensione */}
            <g transform={`translate(${cx}, ${plateY - 30})`}>
                <text textAnchor="middle" fontSize={14} fontWeight={600} fill={COLORS.tensione}>
                    V = {tensione.toFixed(1)} V
                </text>
            </g>

            {/* Terminali */}
            <circle cx={20} cy={cy} r={6} fill="#475569" />
            <circle cx={width - 20} cy={cy} r={6} fill="#475569" />

            {/* Labels terminali */}
            <text x={20} y={cy + 25} textAnchor="middle" fontSize={12} fill={COLORS.positive}>+</text>
            <text x={width - 20} y={cy + 25} textAnchor="middle" fontSize={12} fill={COLORS.negative}>−</text>
        </svg>
    );
}

// ============ COMPONENTE PRINCIPALE ============

export default function CondensatoreDemo() {
    const { isMobile, isTablet } = useBreakpoint();

    // ============ STATO ============
    const [capacitaBase, setCapacitaBase] = useState(100); // μF
    const [tensioneBase, setTensioneBase] = useState(12);  // V

    const capacitaF = capacitaBase * 1e-6; // Converti in Farad
    const caricaBase = capacitaF * tensioneBase;
    const energiaBase = 0.5 * capacitaF * tensioneBase * tensioneBase;

    // Dimensioni condensatore
    const condensatoreWidth = isMobile ? 280 : 320;
    const condensatoreHeight = isMobile ? 200 : 240;

    // ============ PANNELLI ============

    const ControlsPanel = (
        <ResponsiveCard>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: COLORS.text }}>
                ⚙️ Parametri
            </div>

            {/* Capacità */}
            <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                    <span>Capacità C</span>
                    <span style={{ fontWeight: 600, color: COLORS.capacita }}>{capacitaBase} μF</span>
                </div>
                <input
                    type="range"
                    min={1}
                    max={1000}
                    step={1}
                    value={capacitaBase}
                    onChange={e => setCapacitaBase(Number(e.target.value))}
                    style={{ width: "100%", accentColor: COLORS.capacita }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#94a3b8" }}>
                    <span>1 μF</span>
                    <span>1000 μF</span>
                </div>
            </div>

            {/* Tensione */}
            <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                    <span>Tensione V</span>
                    <span style={{ fontWeight: 600, color: COLORS.tensione }}>{tensioneBase} V</span>
                </div>
                <input
                    type="range"
                    min={1}
                    max={100}
                    step={1}
                    value={tensioneBase}
                    onChange={e => setTensioneBase(Number(e.target.value))}
                    style={{ width: "100%", accentColor: COLORS.tensione }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#94a3b8" }}>
                    <span>1 V</span>
                    <span>100 V</span>
                </div>
            </div>
        </ResponsiveCard>
    );

    const ValuesPanel = (
        <ResponsiveCard>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: COLORS.text }}>
                📊 Valori calcolati
            </div>

            <div style={{ display: "grid", gap: 10 }}>
                {/* Capacità */}
                <div style={{ padding: 12, background: `${COLORS.capacita}10`, borderRadius: 8, borderLeft: `4px solid ${COLORS.capacita}` }}>
                    <div style={{ fontSize: 11, color: "#64748b" }}>Capacità</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.capacita }}>
                        C = {formatWithPrefix(capacitaF, "F")}
                    </div>
                </div>

                {/* Carica */}
                <div style={{ padding: 12, background: `${COLORS.carica}10`, borderRadius: 8, borderLeft: `4px solid ${COLORS.carica}` }}>
                    <div style={{ fontSize: 11, color: "#64748b" }}>Carica</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.carica }}>
                        Q = {formatWithPrefix(caricaBase, "C")}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                        Q = C · V = {capacitaBase} μF · {tensioneBase} V
                    </div>
                </div>

                {/* Energia */}
                <div style={{ padding: 12, background: `${COLORS.energia}10`, borderRadius: 8, borderLeft: `4px solid ${COLORS.energia}` }}>
                    <div style={{ fontSize: 11, color: "#64748b" }}>Energia immagazzinata</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.energia }}>
                        U = {formatWithPrefix(energiaBase, "J")}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                        U = ½CV² = ½ · {capacitaBase} μF · ({tensioneBase} V)²
                    </div>
                </div>
            </div>
        </ResponsiveCard>
    );

    const FormulasPanel = (
        <CollapsiblePanel title="📐 Formule" defaultOpen={!isMobile}>
            <div style={{ display: "grid", gap: 12 }}>
                <div style={{ padding: 10, background: "#f8fafc", borderRadius: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 6, color: COLORS.capacita }}>Definizione di capacità</div>
                    <Latex>{"C = \\frac{Q}{V} \\quad \\Rightarrow \\quad Q = C \\cdot V"}</Latex>
                </div>

                <div style={{ padding: 10, background: "#f8fafc", borderRadius: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 6, color: COLORS.energia }}>Energia immagazzinata</div>
                    <Latex>{"U = \\frac{1}{2}CV^2 = \\frac{1}{2}QV = \\frac{Q^2}{2C}"}</Latex>
                </div>

                <div style={{ padding: 10, background: "#f8fafc", borderRadius: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 6, color: COLORS.electric }}>Condensatore piano</div>
                    <Latex>{"C = \\varepsilon_0 \\varepsilon_r \\frac{A}{d}"}</Latex>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                        A = area piastre, d = distanza tra le piastre
                    </div>
                </div>
            </div>
        </CollapsiblePanel>
    );

    const VisualePanel = (
        <ResponsiveCard>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12, color: COLORS.text }}>
                🔋 Condensatore
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
                <CondensatoreVisuale
                    tensione={tensioneBase}
                    caricaPercentuale={Math.min(1, caricaBase / (1000 * 1e-6 * 100))}
                    width={condensatoreWidth}
                    height={condensatoreHeight}
                />
            </div>
        </ResponsiveCard>
    );

    // ============ RENDER ============

    return (
        <DemoContainer
            title="Il Condensatore"
            description="Capacità, carica ed energia"
            maxWidth={1300}
        >
            {/* ============ LAYOUT MOBILE ============ */}
            {isMobile && (
                <div style={{ display: "grid", gap: 12 }}>
                    {VisualePanel}
                    {ControlsPanel}
                    {ValuesPanel}
                    {FormulasPanel}
                </div>
            )}

            {/* ============ LAYOUT TABLET ============ */}
            {isTablet && (
                <div style={{ display: "grid", gap: 16 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        {VisualePanel}
                        <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
                            {ControlsPanel}
                        </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        {ValuesPanel}
                        {FormulasPanel}
                    </div>
                </div>
            )}

            {/* ============ LAYOUT DESKTOP ============ */}
            {!isMobile && !isTablet && (
                <div style={{ display: "grid", gridTemplateColumns: "300px 1fr 1fr", gap: 16 }}>
                    <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
                        {ControlsPanel}
                        {FormulasPanel}
                    </div>
                    <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
                        {VisualePanel}
                    </div>
                    <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
                        {ValuesPanel}
                    </div>
                </div>
            )}
        </DemoContainer>
    );
}