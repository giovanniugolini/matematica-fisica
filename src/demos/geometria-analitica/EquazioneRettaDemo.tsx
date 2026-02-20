/**
 * EquazioneRettaDemo - Esplorazione interattiva dell'equazione della retta y = mx + q
 * Slider per m (coefficiente angolare) e q (intercetta)
 */

import React, { useState, useMemo } from "react";

import {
    Latex,
    DemoContainer,
    InfoBox,
    useBreakpoint,
    ResponsiveGrid,
    GraphContainer,
    CollapsiblePanel,
} from "../../components/ui";
import { CollapsibleExplanation } from "../../components/ui/CollapsibleExplanation";
import { CoordinatePlane } from "../../components/ui/CoordinatePlane";

// ============ COMPONENTE PRINCIPALE ============

export default function EquazioneRettaDemo() {
    const { isMobile, isTablet } = useBreakpoint();

    // Parametri della retta
    const [m, setM] = useState(1); // coefficiente angolare
    const [q, setQ] = useState(0); // intercetta (quota)

    // Range degli slider
    const mMin = -5;
    const mMax = 5;
    const mStep = 0.1;
    const qMin = -5;
    const qMax = 5;
    const qStep = 0.1;

    // Calcoli derivati
    const calculations = useMemo(() => {
        // Angolo in gradi (arctan di m)
        const angleRad = Math.atan(m);
        const angleDeg = (angleRad * 180) / Math.PI;

        // Intersezione con asse x (se m != 0)
        const xIntercept = m !== 0 ? -q / m : null;

        // Tipo di retta
        let tipo: string;
        if (m === 0) {
            tipo = "orizzontale";
        } else if (m > 0) {
            tipo = "crescente";
        } else {
            tipo = "decrescente";
        }

        return {
            angleRad,
            angleDeg,
            xIntercept,
            tipo,
        };
    }, [m, q]);

    // ============ GRAFICO ============

    const planeSize = isMobile ? 300 : isTablet ? 380 : 450;
    const range = 6;

    // Punti notevoli
    const yInterceptPoint = {
        x: 0,
        y: q,
        label: `(0, ${q})`,
        color: "#22c55e",
        radius: 6,
    };

    const xInterceptPoint = calculations.xIntercept !== null && Math.abs(calculations.xIntercept) <= range
        ? {
            x: calculations.xIntercept,
            y: 0,
            label: `(${formatNumber(calculations.xIntercept)}, 0)`,
            color: "#f59e0b",
            radius: 6,
        }
        : null;

    const points = xInterceptPoint ? [yInterceptPoint, xInterceptPoint] : [yInterceptPoint];

    // Linea della retta
    const lines = [
        {
            slope: m,
            intercept: q,
            color: "#3b82f6",
            strokeWidth: 3,
        },
    ];

    // Linea orizzontale y = 0 evidenziata se m = 0
    if (m === 0) {
        lines[0].color = "#ef4444";
    }


    // ============ FEEDBACK VISIVO ============

    const PendenzaFeedback = () => {
        let icon: string;
        let text: string;
        let bgColor: string;
        let textColor: string;

        if (m === 0) {
            icon = "➡️";
            text = "Retta orizzontale (pendenza nulla)";
            bgColor = "#fef3c7";
            textColor = "#92400e";
        } else if (m > 0) {
            icon = "↗️";
            text = `Retta crescente (sale verso destra)`;
            bgColor = "#dcfce7";
            textColor = "#166534";
        } else {
            icon = "↘️";
            text = `Retta decrescente (scende verso destra)`;
            bgColor = "#fee2e2";
            textColor = "#991b1b";
        }

        return (
            <div style={{
                background: bgColor,
                borderRadius: 8,
                padding: 12,
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 12,
            }}>
                <span style={{ fontSize: 24 }}>{icon}</span>
                <span style={{ color: textColor, fontWeight: 500 }}>{text}</span>
            </div>
        );
    };

    // ============ INFO PANELS ============

    const EquazionePanel = () => (
        <div style={{
            background: "#eff6ff",
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            textAlign: "center",
        }}>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
                Equazione della retta:
            </div>
            <div style={{ fontSize: isMobile ? 22 : 28 }}>
                <Latex>{`y = ${formatCoefficient(m)}x ${formatConstant(q)}`}</Latex>
            </div>
        </div>
    );

    const ProprietaPanel = () => (
        <div style={{
            background: "#f8fafc",
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
        }}>
            <div style={{ fontWeight: 600, marginBottom: 12, color: "#1e293b" }}>
                Proprieta della retta
            </div>
            <div style={{ display: "grid", gap: 8, fontSize: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>Coefficiente angolare (m):</span>
                    <span style={{ fontWeight: 600 }}>{m}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>Intercetta (q):</span>
                    <span style={{ fontWeight: 600 }}>{q}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>Angolo con asse x:</span>
                    <span style={{ fontWeight: 600 }}>{formatNumber(calculations.angleDeg)}°</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>Passa per (0, q):</span>
                    <span style={{ fontWeight: 600, color: "#22c55e" }}>(0, {q})</span>
                </div>
                {calculations.xIntercept !== null && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#64748b" }}>Interseca asse x in:</span>
                        <span style={{ fontWeight: 600, color: "#f59e0b" }}>
                            ({formatNumber(calculations.xIntercept)}, 0)
                        </span>
                    </div>
                )}
            </div>
        </div>
    );

    // ============ SPIEGAZIONE TEORICA ============

    const TeoriaContent = (
        <div style={{ fontSize: 14, lineHeight: 1.8 }}>
            <p><strong>L'equazione della retta</strong> nella forma esplicita e:</p>
            <div style={{ textAlign: "center", margin: "16px 0" }}>
                <Latex display>{"y = mx + q"}</Latex>
            </div>

            <div style={{
                background: "#dbeafe",
                borderRadius: 8,
                padding: 12,
                margin: "16px 0",
                border: "2px solid #3b82f6",
            }}>
                <p style={{ margin: 0 }}><strong>m = ROTAZIONE</strong></p>
                <p style={{ margin: "8px 0 0 0", fontSize: 13 }}>
                    Il coefficiente angolare m determina l'<strong>inclinazione</strong> (rotazione) della retta rispetto all'asse x.
                    Cambiando m, la retta ruota attorno al punto (0, q).
                </p>
            </div>

            <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
                <li><Latex>{"m > 0"}</Latex>: la retta e <strong>crescente</strong> (sale da sinistra a destra)</li>
                <li><Latex>{"m < 0"}</Latex>: la retta e <strong>decrescente</strong> (scende da sinistra a destra)</li>
                <li><Latex>{"m = 0"}</Latex>: la retta e <strong>orizzontale</strong></li>
                <li>Maggiore e <Latex>{"|m|"}</Latex>, piu la retta e ripida (ruotata)</li>
            </ul>

            <div style={{
                background: "#dcfce7",
                borderRadius: 8,
                padding: 12,
                margin: "16px 0",
                border: "2px solid #22c55e",
            }}>
                <p style={{ margin: 0 }}><strong>q = TRASLAZIONE</strong></p>
                <p style={{ margin: "8px 0 0 0", fontSize: 13 }}>
                    L'intercetta q determina la <strong>traslazione verticale</strong> della retta.
                    Cambiando q, la retta si sposta su o giu mantenendo la stessa inclinazione.
                </p>
            </div>

            <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
                <li>La retta passa sempre per il punto <Latex>{"(0, q)"}</Latex></li>
                <li><Latex>{"q > 0"}</Latex>: retta traslata verso l'alto</li>
                <li><Latex>{"q < 0"}</Latex>: retta traslata verso il basso</li>
            </ul>

            <p style={{ marginTop: 16 }}><strong>Significato geometrico di m:</strong></p>
            <div style={{ textAlign: "center", margin: "12px 0" }}>
                <Latex display>{"m = \\tan(\\alpha) = \\frac{\\Delta y}{\\Delta x}"}</Latex>
            </div>
            <p>dove <Latex>{"\\alpha"}</Latex> e l'angolo che la retta forma con l'asse x positivo.</p>
        </div>
    );

    // ============ PRESET BUTTONS ============

    const PresetButtons = () => (
        <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
                Esempi notevoli:
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <PresetButton label="y = x" m={1} q={0} />
                <PresetButton label="y = -x" m={-1} q={0} />
                <PresetButton label="y = 2x + 1" m={2} q={1} />
                <PresetButton label="y = -0.5x + 2" m={-0.5} q={2} />
                <PresetButton label="y = 3 (orizzontale)" m={0} q={3} />
            </div>
        </div>
    );

    const PresetButton = ({ label, m: presetM, q: presetQ }: { label: string; m: number; q: number }) => (
        <button
            onClick={() => { setM(presetM); setQ(presetQ); }}
            style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid #d1d5db",
                background: m === presetM && q === presetQ ? "#dbeafe" : "#fff",
                color: "#475569",
                fontSize: 13,
                cursor: "pointer",
            }}
        >
            {label}
        </button>
    );

    // ============ LAYOUT ============

    const ControlsSection = (
        <div>
            <EquazionePanel />
            <PendenzaFeedback />

            {/* Slider m - ROTAZIONE */}
            <div style={{
                background: "#fff",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                border: "2px solid #3b82f620",
            }}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                }}>
                    <span style={{ fontWeight: 600, color: "#1e293b" }}>m (coefficiente angolare)</span>
                    <span style={{
                        background: "#3b82f6",
                        color: "#fff",
                        padding: "4px 12px",
                        borderRadius: 20,
                        fontWeight: 700,
                        fontSize: 16,
                        minWidth: 50,
                        textAlign: "center",
                    }}>
                        {m >= 0 ? `+${m}` : m}
                    </span>
                </div>
                <input
                    type="range"
                    min={mMin}
                    max={mMax}
                    step={mStep}
                    value={m}
                    onChange={(e) => setM(parseFloat(e.target.value))}
                    style={{ width: "100%" }}
                />
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12,
                    color: "#94a3b8",
                    marginTop: 4,
                }}>
                    <span>{mMin}</span>
                    <span style={{ color: "#3b82f6", fontWeight: 600 }}>ROTAZIONE della retta</span>
                    <span>{mMax}</span>
                </div>
            </div>

            {/* Slider q - TRASLAZIONE */}
            <div style={{
                background: "#fff",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                border: "2px solid #22c55e20",
            }}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                }}>
                    <span style={{ fontWeight: 600, color: "#1e293b" }}>q (intercetta)</span>
                    <span style={{
                        background: "#22c55e",
                        color: "#fff",
                        padding: "4px 12px",
                        borderRadius: 20,
                        fontWeight: 700,
                        fontSize: 16,
                        minWidth: 50,
                        textAlign: "center",
                    }}>
                        {q >= 0 ? `+${q}` : q}
                    </span>
                </div>
                <input
                    type="range"
                    min={qMin}
                    max={qMax}
                    step={qStep}
                    value={q}
                    onChange={(e) => setQ(parseFloat(e.target.value))}
                    style={{ width: "100%" }}
                />
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12,
                    color: "#94a3b8",
                    marginTop: 4,
                }}>
                    <span>{qMin}</span>
                    <span style={{ color: "#22c55e", fontWeight: 600 }}>TRASLAZIONE verticale</span>
                    <span>{qMax}</span>
                </div>
            </div>

            <PresetButtons />
            <ProprietaPanel />
        </div>
    );

    const GraphSection = (
        <GraphContainer title="Piano Cartesiano">
            <div style={{ display: "flex", justifyContent: "center" }}>
                <CoordinatePlane
                    width={planeSize}
                    height={planeSize}
                    xMin={-range}
                    xMax={range}
                    yMin={-range}
                    yMax={range}
                    points={points}
                    lines={lines}
                    showGrid={true}
                    showArrows={true}
                />
            </div>
            <div style={{ marginTop: 12, fontSize: 13, color: "#64748b", textAlign: "center" }}>
                <span style={{ color: "#22c55e", fontWeight: 600 }}>●</span> intersezione asse y
                {calculations.xIntercept !== null && (
                    <span style={{ marginLeft: 12 }}>
                        <span style={{ color: "#f59e0b", fontWeight: 600 }}>●</span> intersezione asse x
                    </span>
                )}
            </div>
        </GraphContainer>
    );

    // ============ MOBILE ============

    if (isMobile) {
        return (
            <DemoContainer
                title="Equazione della Retta"
                description="Esplora y = mx + q"
            >
                {ControlsSection}
                {GraphSection}

                <CollapsiblePanel title="Teoria: significato di m e q" defaultOpen={false}>
                    {TeoriaContent}
                </CollapsiblePanel>
            </DemoContainer>
        );
    }

    // ============ TABLET / DESKTOP ============

    return (
        <DemoContainer
            title="Equazione della Retta"
            description="Esplora interattivamente l'equazione y = mx + q e scopri il significato dei parametri."
        >
            <ResponsiveGrid columns={{ tablet: 2, desktop: 2 }} gap={20}>
                <div>{ControlsSection}</div>
                <div>{GraphSection}</div>
            </ResponsiveGrid>

            <InfoBox title="Teoria: l'equazione della retta">
                {TeoriaContent}
            </InfoBox>
        </DemoContainer>
    );
}

// ============ HELPER FUNCTIONS ============

function formatNumber(n: number): string {
    if (Number.isInteger(n)) return n.toString();
    return (Math.round(n * 100) / 100).toString();
}

function formatCoefficient(m: number): string {
    if (m === 1) return "";
    if (m === -1) return "-";
    return m.toString();
}

function formatConstant(q: number): string {
    if (q === 0) return "";
    if (q > 0) return `+ ${q}`;
    return `- ${Math.abs(q)}`;
}
