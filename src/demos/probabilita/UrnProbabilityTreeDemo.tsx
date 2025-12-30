/**
 * UrnProbabilityTreeDemo - Versione Responsive
 * Albero di probabilità per estrazioni da un'urna
 * Ottimizzato per mobile, tablet e desktop
 */

import React, { useMemo, useState } from "react";
import {
    DemoContainer,
    useBreakpoint,
    ResponsiveGrid,
    ResponsiveCard,
    ResponsiveSvg,
    ResponsiveStack,
    TouchButton,
    CollapsiblePanel,
    SwipeableTabs,
} from "../../components/ui";

// ============ TIPI ============

type BallColor = {
    id: string;
    name: string;
    short: string;
    count: number;
    hex: string;
};

type Fraction = { num: number; den: number; str: string; dec: string };

// ============ COSTANTI ============

const COLORS_BASE = [
    { id: "R", name: "Rosso", short: "R", hex: "#ef4444" },
    { id: "B", name: "Blu", short: "B", hex: "#3b82f6" },
    { id: "V", name: "Verde", short: "V", hex: "#22c55e" },
    { id: "G", name: "Giallo", short: "G", hex: "#eab308" },
];

// ============ UTILITY ============

function gcd(a: number, b: number): number {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { const t = b; b = a % b; a = t; }
    return a || 1;
}

function makeFrac(num: number, den: number): Fraction {
    if (den === 0 || num === 0) return { num: 0, den: 1, str: "0", dec: "0" };
    const d = gcd(num, den);
    const n = num / d, dn = den / d;
    const str = dn === 1 ? `${n}` : `${n}/${dn}`;
    const val = n / dn;
    const dec = val >= 0.001 ? val.toFixed(3).replace(".", ",") : val.toExponential(2);
    return { num: n, den: dn, str, dec };
}

function generateRandomUrn(): BallColor[] {
    const numColors = 2 + Math.floor(Math.random() * 2);
    return COLORS_BASE.slice(0, numColors).map(c => ({
        ...c,
        count: 1 + Math.floor(Math.random() * 5)
    }));
}

// ============ COMPONENTE PRINCIPALE ============

export default function UrnProbabilityTreeDemo() {
    const { isMobile, isTablet, isDesktop } = useBreakpoint();

    const [colors, setColors] = useState<BallColor[]>(() => generateRandomUrn());
    const [withReplacement, setWithReplacement] = useState(false);

    const total = useMemo(() => colors.reduce((s, c) => s + c.count, 0), [colors]);
    const n = colors.length;

    // Probabilità
    const prob1 = useMemo(() => colors.map(c => makeFrac(c.count, total)), [colors, total]);
    const prob2 = useMemo(() => {
        return colors.map((_, i) => {
            if (withReplacement) return colors.map(c => makeFrac(c.count, total));
            const den = total - 1;
            return colors.map((c, j) => makeFrac(i === j ? Math.max(c.count - 1, 0) : c.count, den));
        });
    }, [colors, total, withReplacement]);
    const jointProb = useMemo(() => {
        return colors.map((_, i) => colors.map((_, j) => {
            const p1 = prob1[i], p2 = prob2[i][j];
            return makeFrac(p1.num * p2.num, p1.den * p2.den);
        }));
    }, [colors, prob1, prob2]);

    // Dimensioni SVG responsive
    const svgW = isMobile ? 350 : isTablet ? 550 : 700;
    const svgH = isMobile ? 300 : isTablet ? 350 : 380;

    // Layout albero
    const layout = useMemo(() => {
        const xRoot = isMobile ? 40 : 60;
        const xFirst = isMobile ? 140 : isTablet ? 200 : 250;
        const xSecond = isMobile ? 260 : isTablet ? 380 : 480;
        const topM = 25, botM = 25;
        const space = svgH - topM - botM;
        const leafCount = n * n;
        const leafY = Array.from({ length: leafCount }, (_, i) => topM + (leafCount > 1 ? i * space / (leafCount - 1) : space / 2));

        const ySecond: number[][] = [];
        for (let i = 0; i < n; i++) {
            ySecond[i] = [];
            for (let j = 0; j < n; j++) {
                ySecond[i][j] = leafY[i * n + j];
            }
        }

        const yFirst = colors.map((_, i) => {
            const ys = ySecond[i];
            return ys.reduce((s, y) => s + y, 0) / ys.length;
        });

        const yRoot = leafY.reduce((s, y) => s + y, 0) / leafY.length;

        return { xRoot, xFirst, xSecond, yRoot, yFirst, ySecond };
    }, [n, colors, svgH, isMobile, isTablet]);

    // Handlers
    const handleCountChange = (idx: number, val: number) => {
        setColors(prev => prev.map((c, i) => i === idx ? { ...c, count: Math.max(0, val) } : c));
    };

    const handleNumColors = (num: number) => {
        const nColors = Math.max(1, Math.min(4, num));
        setColors(prev => {
            if (nColors === prev.length) return prev;
            if (nColors < prev.length) return prev.slice(0, nColors);
            return [...prev, ...COLORS_BASE.slice(prev.length, nColors).map(c => ({ ...c, count: 2 }))];
        });
    };

    // ============ RENDER URNA (per mobile come pannello separato) ============
    const UrnPanel = (
        <div style={{ display: "grid", gap: 12 }}>
            {colors.map((c, i) => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: c.hex, flexShrink: 0 }} />
                    <span style={{ minWidth: isMobile ? 50 : 60, fontWeight: 500, fontSize: isMobile ? 14 : 15 }}>{c.name}</span>
                    <input
                        type="number"
                        min={0}
                        value={c.count}
                        onChange={e => handleCountChange(i, parseInt(e.target.value) || 0)}
                        style={{
                            width: isMobile ? 50 : 60,
                            padding: isMobile ? "10px 8px" : "6px 10px",
                            borderRadius: 8,
                            border: "1px solid #d1d5db",
                            fontSize: 16, // evita zoom iOS
                            textAlign: "center"
                        }}
                    />
                </div>
            ))}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                paddingTop: 12,
                borderTop: "1px solid #e5e7eb",
                flexWrap: "wrap"
            }}>
                <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                    Colori:
                    <input
                        type="number"
                        min={1}
                        max={4}
                        value={colors.length}
                        onChange={e => handleNumColors(parseInt(e.target.value) || 2)}
                        style={{
                            width: 50,
                            padding: isMobile ? "10px 8px" : "6px 10px",
                            borderRadius: 6,
                            border: "1px solid #d1d5db",
                            fontSize: 16,
                            textAlign: "center"
                        }}
                    />
                </label>
                <span style={{ fontSize: 13, color: "#6b7280" }}>
                    Totale: <strong>{total}</strong>
                </span>
            </div>
        </div>
    );

    // ============ RENDER MODALITA' ============
    const ModePanel = (
        <ResponsiveStack
            direction={{ mobile: "column", tablet: "row", desktop: "row" }}
            gap={isMobile ? 8 : 12}
        >
            <TouchButton
                variant={!withReplacement ? "primary" : "outline"}
                onClick={() => setWithReplacement(false)}
                fullWidth={isMobile}
                size={isMobile ? "lg" : "md"}
            >
                Senza reimmissione
            </TouchButton>
            <TouchButton
                variant={withReplacement ? "primary" : "outline"}
                onClick={() => setWithReplacement(true)}
                fullWidth={isMobile}
                size={isMobile ? "lg" : "md"}
            >
                Con reimmissione
            </TouchButton>
        </ResponsiveStack>
    );

    // ============ RENDER ALBERO SVG ============
    const TreeSvg = (
        <ResponsiveSvg
            width={svgW}
            height={svgH}
            maxHeight={{ mobile: "45vh", tablet: "50vh", desktop: "55vh" }}
        >
            <rect x={0} y={0} width={svgW} height={svgH} fill="#fafafa" rx={8} />

            {/* Rami livello 1 */}
            {colors.map((c, i) => {
                const { xRoot, xFirst, yRoot, yFirst } = layout;
                const mx = (xRoot + xFirst) / 2, my = (yRoot + yFirst[i]) / 2;
                const badgeW = isMobile ? 44 : 52;
                const badgeH = isMobile ? 22 : 26;
                return (
                    <g key={`l1-${i}`}>
                        <line x1={xRoot} y1={yRoot} x2={xFirst} y2={yFirst[i]} stroke="#94a3b8" strokeWidth={isMobile ? 1.5 : 2} />
                        <rect x={mx - badgeW/2} y={my - badgeH/2} width={badgeW} height={badgeH} rx={5} fill="#fff" stroke="#d1d5db" />
                        <text x={mx} y={my + (isMobile ? 1 : 2)} fontSize={isMobile ? 10 : 11} textAnchor="middle" fill="#374151">{prob1[i].str}</text>
                    </g>
                );
            })}

            {/* Rami livello 2 */}
            {colors.map((_, i) => colors.map((_, j) => {
                const { xFirst, xSecond, yFirst, ySecond } = layout;
                const y1 = yFirst[i], y2 = ySecond[i][j];
                const mx = (xFirst + xSecond) / 2, my = (y1 + y2) / 2;
                const p = prob2[i][j];
                const isZero = p.num === 0;
                const badgeW = isMobile ? 44 : 52;
                const badgeH = isMobile ? 22 : 26;
                return (
                    <g key={`l2-${i}-${j}`}>
                        <line x1={xFirst} y1={y1} x2={xSecond} y2={y2} stroke={isZero ? "#e5e7eb" : "#94a3b8"} strokeWidth={isZero ? 1 : (isMobile ? 1.5 : 2)} strokeDasharray={isZero ? "4 3" : undefined} />
                        <rect x={mx - badgeW/2} y={my - badgeH/2} width={badgeW} height={badgeH} rx={5} fill="#fff" stroke="#d1d5db" />
                        <text x={mx} y={my + (isMobile ? 1 : 2)} fontSize={isMobile ? 10 : 11} textAnchor="middle" fill={isZero ? "#9ca3af" : "#374151"}>{p.str}</text>
                    </g>
                );
            }))}

            {/* Nodo radice */}
            <circle cx={layout.xRoot} cy={layout.yRoot} r={isMobile ? 10 : 12} fill="#fff" stroke="#374151" strokeWidth={2} />
            <text x={layout.xRoot} y={layout.yRoot + 3} fontSize={isMobile ? 8 : 9} textAnchor="middle" fill="#374151">Start</text>

            {/* Nodi livello 1 */}
            {colors.map((c, i) => (
                <g key={`n1-${i}`}>
                    <circle cx={layout.xFirst} cy={layout.yFirst[i]} r={isMobile ? 11 : 13} fill="#fff" stroke={c.hex} strokeWidth={3} />
                    <text x={layout.xFirst} y={layout.yFirst[i] + 4} fontSize={isMobile ? 11 : 12} textAnchor="middle" fill={c.hex} fontWeight={700}>{c.short}</text>
                </g>
            ))}

            {/* Nodi livello 2 */}
            {colors.map((c1, i) => colors.map((c2, j) => {
                const y = layout.ySecond[i][j];
                const jp = jointProb[i][j];
                return (
                    <g key={`n2-${i}-${j}`}>
                        <circle cx={layout.xSecond} cy={y} r={isMobile ? 11 : 13} fill="#fff" stroke={c2.hex} strokeWidth={3} />
                        <text x={layout.xSecond} y={y + 4} fontSize={isMobile ? 11 : 12} textAnchor="middle" fill={c2.hex} fontWeight={700}>{c2.short}</text>
                        {!isMobile && (
                            <>
                                <text x={layout.xSecond + 20} y={y + 3} fontSize={11} textAnchor="start" fill="#374151" fontWeight={600}>{c1.short}{c2.short}</text>
                                <text x={layout.xSecond + 50} y={y + 3} fontSize={10} textAnchor="start" fill="#6b7280">P={jp.str}</text>
                            </>
                        )}
                    </g>
                );
            }))}
        </ResponsiveSvg>
    );

    // ============ RENDER TABELLA ============
    const ResultsTable = (
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: isMobile ? 12 : 13, minWidth: isMobile ? 350 : "auto" }}>
                <thead>
                <tr style={{ background: "#f8fafc" }}>
                    <th style={{ padding: isMobile ? "10px 8px" : "10px 12px", borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>Esito</th>
                    <th style={{ padding: isMobile ? "10px 8px" : "10px 12px", borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>P</th>
                    {!isMobile && <th style={{ padding: "10px 12px", borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>Decimale</th>}
                </tr>
                </thead>
                <tbody>
                {colors.flatMap((c1, i) => colors.map((c2, j) => {
                    const jp = jointProb[i][j];
                    return (
                        <tr key={`${i}-${j}`} style={{ background: (i * n + j) % 2 === 0 ? "#fff" : "#f8fafc" }}>
                            <td style={{ padding: isMobile ? "10px 8px" : "10px 12px", borderBottom: "1px solid #e5e7eb" }}>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: c1.hex }} />
                                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: c2.hex }} />
                                        <strong>{c1.short}{c2.short}</strong>
                                    </span>
                            </td>
                            <td style={{ padding: isMobile ? "10px 8px" : "10px 12px", borderBottom: "1px solid #e5e7eb", fontWeight: 600 }}>{jp.str}</td>
                            {!isMobile && <td style={{ padding: "10px 12px", borderBottom: "1px solid #e5e7eb", color: "#6b7280" }}>{jp.dec}</td>}
                        </tr>
                    );
                }))}
                </tbody>
            </table>
        </div>
    );

    // ============ LAYOUT MOBILE (tabs) ============
    if (isMobile) {
        return (
            <DemoContainer
                title="Probabilità Urna"
                description="Due estrazioni successive"
            >
                {/* Azioni rapide */}
                <ResponsiveCard padding={12} style={{ marginBottom: 12 }}>
                    <ResponsiveStack direction={{ mobile: "column" }} gap={8}>
                        {ModePanel}
                        <TouchButton
                            variant="secondary"
                            onClick={() => setColors(generateRandomUrn())}
                            fullWidth
                            size="lg"
                            icon={<span>🎲</span>}
                        >
                            Nuovo problema
                        </TouchButton>
                    </ResponsiveStack>
                </ResponsiveCard>

                {/* Tabs per contenuto */}
                <SwipeableTabs
                    tabs={[
                        { id: "tree", label: "🌳 Albero", content: (
                                <ResponsiveCard padding={12}>
                                    {TreeSvg}
                                </ResponsiveCard>
                            )},
                        { id: "urn", label: "🎱 Urna", content: (
                                <ResponsiveCard padding={16}>
                                    {UrnPanel}
                                </ResponsiveCard>
                            )},
                        { id: "table", label: "📋 Risultati", content: (
                                <ResponsiveCard padding={12}>
                                    {ResultsTable}
                                </ResponsiveCard>
                            )},
                    ]}
                    defaultTab="tree"
                />
            </DemoContainer>
        );
    }

    // ============ LAYOUT TABLET/DESKTOP ============
    return (
        <DemoContainer
            title="Albero di probabilità – Estrazioni da un'urna"
            description="Visualizza le probabilità di due estrazioni successive, con o senza reimmissione."
        >
            {/* Controlli */}
            <ResponsiveGrid columns={{ tablet: 2, desktop: 2 }} gap={12}>
                <ResponsiveCard>
                    <div style={{ fontWeight: 600, marginBottom: 12 }}>🎱 Composizione urna</div>
                    {UrnPanel}
                </ResponsiveCard>

                <ResponsiveCard>
                    <div style={{ fontWeight: 600, marginBottom: 12 }}>⚙️ Modalità</div>
                    {ModePanel}
                    <TouchButton
                        variant="secondary"
                        onClick={() => setColors(generateRandomUrn())}
                        fullWidth
                        style={{ marginTop: 16 }}
                        icon={<span>🎲</span>}
                    >
                        Genera problema casuale
                    </TouchButton>
                </ResponsiveCard>
            </ResponsiveGrid>

            {/* Albero */}
            <ResponsiveCard style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 12 }}>📊 Albero delle probabilità</div>
                {TreeSvg}
            </ResponsiveCard>

            {/* Tabella */}
            <CollapsiblePanel title="📋 Tabella probabilità congiunte" defaultOpen={isDesktop} openOnDesktop>
                {ResultsTable}
            </CollapsiblePanel>

            {/* Info */}
            <div style={{ marginTop: 12, background: "#eff6ff", borderRadius: 12, padding: 16, fontSize: 13, color: "#1e40af" }}>
                <strong>💡 Come leggere l'albero:</strong>
                <ul style={{ margin: "8px 0 0 0", paddingLeft: 20 }}>
                    <li>Moltiplica le probabilità sui rami per ottenere P(esito)</li>
                    <li><strong>Senza reimmissione:</strong> le probabilità cambiano al 2° livello</li>
                </ul>
            </div>
        </DemoContainer>
    );
}