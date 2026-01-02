/**
 * ComponentiCartesianeVettoreDemo
 *
 * Demo interattiva per studiare le componenti cartesiane di un vettore:
 * - Modalità 1: Modulo e angolo → componenti (Aₓ = A·cosθ, Aᵧ = A·senθ)
 * - Modalità 2: Componenti → modulo e angolo (A = √(Aₓ² + Aᵧ²), θ = tan⁻¹(|Aᵧ|/|Aₓ|) + quadrante)
 *
 * Nota didattica (grafico):
 * - Per rendere leggibile il disegno, l’arco viene sempre mostrato come "arco minore":
 *   θ_eff ∈ (-180°, 180°], con θ_eff = θ se θ ≤ 180°, altrimenti θ_eff = θ - 360°.
 * - In modalità "modulo-angolo" usiamo e MOSTRIAMO θ_eff anche dentro sin/cos.
 */

import React, { useMemo, useState } from "react";
import { DemoContainer, useBreakpoint, ResponsiveCard, CollapsiblePanel } from "../../components/ui";
import { Latex, DisplayMath } from "../../components/ui/Latex";
import { CoordinatePlane, PlaneArc, PlaneLine, PlaneVector } from "../../components/ui/CoordinatePlane";

// ============ TIPI ============

type Mode = "modulo-angolo" | "componenti";

type ComputedBase = {
    mode: Mode;
    ax: number;
    ay: number;
    modulo: number;
    quadrante: number;
    thetaDirDeg: number; // direzione 0..360
    thetaEffDeg: number; // (-180..180] per arco minore
    thetaRad: number; // rad di thetaEff
};

type ComputedModuloAngolo = ComputedBase & {
    mode: "modulo-angolo";
};

type ComputedComponenti = ComputedBase & {
    mode: "componenti";
    angoloAcuto: number; // sempre 0..90
};

type Computed = ComputedModuloAngolo | ComputedComponenti;

// ============ COSTANTI ============

const VECTOR_COLOR = "#dc2626"; // rosso - vettore principale
const COMP_X_COLOR = "#2563eb"; // blu - componente x
const COMP_Y_COLOR = "#16a34a"; // verde - componente y
const ANGLE_COLOR = "#f59e0b"; // arancione - angolo
const TRIANGLE_COLOR = "#94a3b8"; // grigio - triangolo tratteggiato

// Valori iniziali (Reset)
const INITIAL_MODULO = 4;
const INITIAL_ANGOLO_DEG = 30;

// ============ HELPERS ============

function radToDeg(rad: number): number {
    return (rad * 180) / Math.PI;
}

function degToRad(deg: number): number {
    return (deg * Math.PI) / 180;
}

function formatNumber(n: number, decimals: number = 2): string {
    return n.toFixed(decimals).replace(/\.?0+$/, "");
}

function normalizeAngle360(deg: number): number {
    return ((deg % 360) + 360) % 360; // 0..360
}

// Angolo equivalente per arco minore: (-180..180]
function minorAngleDeg(theta360: number): number {
    const t = normalizeAngle360(theta360);
    return t > 180 ? t - 360 : t;
}

function getQuadrant(ax: number, ay: number): number {
    if (ax >= 0 && ay >= 0) return 1;
    if (ax < 0 && ay >= 0) return 2;
    if (ax < 0 && ay < 0) return 3;
    return 4;
}

function getQuadrantName(q: number): string {
    const names = ["", "I quadrante", "II quadrante", "III quadrante", "IV quadrante"];
    return names[q] ?? "";
}

// ============ COMPONENTE PRINCIPALE ============

export default function ComponentiCartesianeVettoreDemo() {
    const { isMobile, isTablet } = useBreakpoint();

    // Modalità
    const [mode, setMode] = useState<Mode>("modulo-angolo");

    // Modalità 1: modulo e angolo (direzione)
    const [modulo, setModulo] = useState(INITIAL_MODULO);
    const [angoloDeg, setAngoloDeg] = useState(INITIAL_ANGOLO_DEG);

    // Modalità 2: componenti
    const [compX, setCompX] = useState(3);
    const [compY, setCompY] = useState(2);

    // Reset: riporta il vettore a modulo/angolo prestabiliti
    const resetVector = () => {
        const mod = INITIAL_MODULO;
        const theta = INITIAL_ANGOLO_DEG;

        setModulo(mod);
        setAngoloDeg(theta);

        // coerenza anche per slider componenti
        const ax = Math.round(mod * Math.cos(degToRad(theta)) * 10) / 10;
        const ay = Math.round(mod * Math.sin(degToRad(theta)) * 10) / 10;
        setCompX(ax);
        setCompY(ay);
    };

    // Calcoli derivati (unione discriminata)
    const computed: Computed = useMemo(() => {
        if (mode === "modulo-angolo") {
            const thetaDirDeg = normalizeAngle360(angoloDeg);
            const thetaEffDeg = minorAngleDeg(thetaDirDeg);
            const thetaRad = degToRad(thetaEffDeg);

            const ax = modulo * Math.cos(thetaRad);
            const ay = modulo * Math.sin(thetaRad);

            return {
                mode,
                ax,
                ay,
                modulo,
                quadrante: getQuadrant(ax, ay),
                thetaDirDeg,
                thetaEffDeg,
                thetaRad,
            };
        }

        // mode === "componenti"
        const ax = compX;
        const ay = compY;

        const mod = Math.sqrt(ax * ax + ay * ay);
        const quadrante = getQuadrant(ax, ay);

        // angolo acuto (0..90)
        let angoloAcuto = 0;
        if (Math.abs(ax) > 1e-6) {
            angoloAcuto = radToDeg(Math.atan(Math.abs(ay) / Math.abs(ax)));
        } else {
            angoloAcuto = 90;
        }

        // direzione 0..360
        let thetaDir = 0;
        if (ax >= 0 && ay >= 0) thetaDir = angoloAcuto; // I
        else if (ax < 0 && ay >= 0) thetaDir = 180 - angoloAcuto; // II
        else if (ax < 0 && ay < 0) thetaDir = 180 + angoloAcuto; // III
        else thetaDir = 360 - angoloAcuto; // IV

        thetaDir = normalizeAngle360(thetaDir);
        const thetaEffDeg = minorAngleDeg(thetaDir);
        const thetaRad = degToRad(thetaEffDeg);

        return {
            mode,
            ax,
            ay,
            modulo: mod,
            quadrante,
            thetaDirDeg: thetaDir,
            thetaEffDeg,
            thetaRad,
            angoloAcuto,
        };
    }, [mode, modulo, angoloDeg, compX, compY]);

    // ============ ELEMENTI GRAFICI ============

    const mainVector: PlaneVector = {
        origin: { x: 0, y: 0 },
        end: { x: computed.ax, y: computed.ay },
        color: VECTOR_COLOR,
        strokeWidth: 3,
        label: "A⃗",
        labelPosition: "end",
    };

    const vectorAx: PlaneVector = {
        origin: { x: 0, y: 0 },
        end: { x: computed.ax, y: 0 },
        color: COMP_X_COLOR,
        strokeWidth: 2,
        label: "Aₓ",
        labelPosition: "middle",
    };

    const vectorAy: PlaneVector = {
        origin: { x: 0, y: 0 },
        end: { x: 0, y: computed.ay },
        color: COMP_Y_COLOR,
        strokeWidth: 2,
        label: "Aᵧ",
        labelPosition: "middle",
    };

    const triangleLines: PlaneLine[] = [
        {
            p1: { x: computed.ax, y: computed.ay },
            p2: { x: computed.ax, y: 0 },
            color: TRIANGLE_COLOR,
            strokeWidth: 1.5,
            style: "dashed",
        },
        {
            p1: { x: computed.ax, y: computed.ay },
            p2: { x: 0, y: computed.ay },
            color: TRIANGLE_COLOR,
            strokeWidth: 1.5,
            style: "dashed",
        },
    ];

    const angleArc: PlaneArc = {
        center: { x: 0, y: 0 },
        radius: Math.min(1.2, computed.modulo * 0.3),
        startAngle: 0,
        endAngle: computed.thetaEffDeg, // può essere negativo → arco minore sotto asse x
        color: ANGLE_COLOR,
        strokeWidth: 2,
        label: "θ",
    };

    const range = Math.max(6, Math.ceil(computed.modulo) + 2);

    // ============ UI: Selettore modalità + Reset ============

    const modeSelector = (
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <button
                onClick={() => setMode("modulo-angolo")}
                style={{
                    flex: 1,
                    minWidth: 140,
                    padding: "12px 16px",
                    borderRadius: 8,
                    border: mode === "modulo-angolo" ? "2px solid #3b82f6" : "1px solid #d1d5db",
                    background: mode === "modulo-angolo" ? "#dbeafe" : "#fff",
                    cursor: "pointer",
                    fontWeight: mode === "modulo-angolo" ? 600 : 400,
                    fontSize: 14,
                }}
            >
                📐 Modulo e Angolo → Componenti
            </button>

            <button
                onClick={() => setMode("componenti")}
                style={{
                    flex: 1,
                    minWidth: 140,
                    padding: "12px 16px",
                    borderRadius: 8,
                    border: mode === "componenti" ? "2px solid #3b82f6" : "1px solid #d1d5db",
                    background: mode === "componenti" ? "#dbeafe" : "#fff",
                    cursor: "pointer",
                    fontWeight: mode === "componenti" ? 600 : 400,
                    fontSize: 14,
                }}
            >
                📊 Componenti → Modulo e Angolo
            </button>

            <button
                onClick={resetVector}
                style={{
                    padding: "12px 16px",
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    background: "#fff",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                }}
                title="Reset vettore"
            >
                ↺ Reset
            </button>
        </div>
    );

    // ============ PANNELLO INPUT ============

    const inputPanel =
        mode === "modulo-angolo" ? (
            <ResponsiveCard style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 12, color: VECTOR_COLOR }}>📥 Input: Modulo e Angolo</div>

                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
                    <div>
                        <label style={{ fontSize: 13, color: "#6b7280", display: "block", marginBottom: 4 }}>
                            Modulo |A⃗| = {formatNumber(modulo, 1)}
                        </label>
                        <input
                            type="range"
                            min={0.5}
                            max={8}
                            step={0.1}
                            value={modulo}
                            onChange={(e) => setModulo(parseFloat(e.target.value))}
                            style={{ width: "100%" }}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: 13, color: "#6b7280", display: "block", marginBottom: 4 }}>
                            Direzione θ = {formatNumber(normalizeAngle360(angoloDeg), 0)}°
                        </label>
                        <input
                            type="range"
                            min={0}
                            max={360}
                            step={1}
                            value={angoloDeg}
                            onChange={(e) => setAngoloDeg(parseFloat(e.target.value))}
                            style={{ width: "100%" }}
                        />
                    </div>
                </div>
            </ResponsiveCard>
        ) : (
            <ResponsiveCard style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 12, color: VECTOR_COLOR }}>📥 Input: Componenti</div>

                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
                    <div>
                        <label style={{ fontSize: 13, color: COMP_X_COLOR, display: "block", marginBottom: 4 }}>
                            Aₓ = {formatNumber(compX, 1)}
                        </label>
                        <input
                            type="range"
                            min={-6}
                            max={6}
                            step={0.1}
                            value={compX}
                            onChange={(e) => setCompX(parseFloat(e.target.value))}
                            style={{ width: "100%" }}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: 13, color: COMP_Y_COLOR, display: "block", marginBottom: 4 }}>
                            Aᵧ = {formatNumber(compY, 1)}
                        </label>
                        <input
                            type="range"
                            min={-6}
                            max={6}
                            step={0.1}
                            value={compY}
                            onChange={(e) => setCompY(parseFloat(e.target.value))}
                            style={{ width: "100%" }}
                        />
                    </div>
                </div>
            </ResponsiveCard>
        );

    // ============ PANNELLO RISULTATI ============

    const resultsPanel = (
        <ResponsiveCard style={{ background: "#f8fafc" }}>
            <div style={{ fontWeight: 600, marginBottom: 12, color: "#334155" }}>📤 Risultati</div>

            <div style={{ display: "grid", gap: 12 }}>
                <div
                    style={{
                        padding: "8px 12px",
                        background: "#fff",
                        borderRadius: 8,
                        border: "1px solid #e2e8f0",
                    }}
                >
                    <span style={{ color: "#6b7280", fontSize: 13 }}>Quadrante: </span>
                    <strong>{getQuadrantName(computed.quadrante)}</strong>
                    <span style={{ marginLeft: 8, fontSize: 12, color: "#94a3b8" }}>
            (Aₓ {computed.ax >= 0 ? "> 0" : "< 0"}, Aᵧ {computed.ay >= 0 ? "> 0" : "< 0"})
          </span>
                </div>

                {computed.mode === "modulo-angolo" && (
                    <div style={{ padding: 12, background: "#fff", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                        <div style={{ fontWeight: 500, marginBottom: 8, fontSize: 14 }}>Componenti calcolate:</div>

                        <div style={{ display: "grid", gap: 8 }}>
                            <div>
                                <Latex>{`A_x = A \\cdot \\cos\\theta = ${formatNumber(modulo)} \\cdot \\cos(${formatNumber(
                                    computed.thetaEffDeg,
                                    0
                                )}^\\circ) = `}</Latex>{" "}
                                <strong style={{ color: COMP_X_COLOR }}>{formatNumber(computed.ax, 3)}</strong>
                            </div>

                            <div>
                                <Latex>{`A_y = A \\cdot \\sin\\theta = ${formatNumber(modulo)} \\cdot \\sin(${formatNumber(
                                    computed.thetaEffDeg,
                                    0
                                )}^\\circ) = `}</Latex>{" "}
                                <strong style={{ color: COMP_Y_COLOR }}>{formatNumber(computed.ay, 3)}</strong>
                            </div>

                            {computed.thetaDirDeg > 180 && (
                                <div style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>
                                    Per disegnare l’arco minore usiamo l’angolo equivalente:{" "}
                                    <strong>
                                        θ_eff = θ − 360° = {formatNumber(computed.thetaEffDeg, 0)}°
                                    </strong>{" "}
                                    (con θ = {formatNumber(computed.thetaDirDeg, 0)}°).
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {computed.mode === "componenti" && (
                    <div style={{ padding: 12, background: "#fff", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                        <div style={{ fontWeight: 500, marginBottom: 8, fontSize: 14 }}>Modulo e direzione:</div>

                        <div style={{ display: "grid", gap: 8 }}>
                            <div>
                                <Latex>{`|\\vec{A}| = \\sqrt{A_x^2 + A_y^2} = \\sqrt{(${formatNumber(
                                    computed.ax
                                )})^2 + (${formatNumber(computed.ay)})^2} = `}</Latex>{" "}
                                <strong style={{ color: VECTOR_COLOR }}>{formatNumber(computed.modulo, 3)}</strong>
                            </div>

                            <div>
                                <Latex>{`\\tan\\theta = \\frac{|A_y|}{|A_x|} = \\frac{${formatNumber(
                                    Math.abs(computed.ay)
                                )}}{${formatNumber(Math.abs(computed.ax))}}`}</Latex>
                            </div>

                            <div>
                                <Latex>{`\\theta_{acuto} = \\arctan\\left(\\frac{|A_y|}{|A_x|}\\right) = `}</Latex>{" "}
                                <strong>{formatNumber(computed.angoloAcuto, 1)}°</strong>
                            </div>

                            <div style={{ paddingTop: 8, borderTop: "1px solid #e2e8f0" }}>
                                <div>
                                    <span>Direzione (0°–360°): </span>
                                    <strong style={{ color: ANGLE_COLOR }}>θ = {formatNumber(computed.thetaDirDeg, 1)}°</strong>
                                </div>
                                {computed.thetaDirDeg > 180 && (
                                    <div style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>
                                        Arco minore usato nel grafico: <strong>θ_eff = {formatNumber(computed.thetaEffDeg, 1)}°</strong>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Riepilogo valori */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, fontSize: 13 }}>
                    <div
                        style={{
                            textAlign: "center",
                            padding: 8,
                            background: "#fff",
                            borderRadius: 6,
                            border: `2px solid ${VECTOR_COLOR}`,
                        }}
                    >
                        <div style={{ color: "#6b7280", fontSize: 11 }}>|A⃗|</div>
                        <strong style={{ color: VECTOR_COLOR }}>{formatNumber(computed.modulo, 2)}</strong>
                    </div>

                    <div
                        style={{
                            textAlign: "center",
                            padding: 8,
                            background: "#fff",
                            borderRadius: 6,
                            border: `2px solid ${ANGLE_COLOR}`,
                        }}
                    >
                        <div style={{ color: "#6b7280", fontSize: 11 }}>θ (dir)</div>
                        <strong style={{ color: ANGLE_COLOR }}>{formatNumber(computed.thetaDirDeg, 1)}°</strong>
                    </div>

                    <div
                        style={{
                            textAlign: "center",
                            padding: 8,
                            background: "#fff",
                            borderRadius: 6,
                            border: `2px solid ${COMP_X_COLOR}`,
                        }}
                    >
                        <div style={{ color: "#6b7280", fontSize: 11 }}>Aₓ</div>
                        <strong style={{ color: COMP_X_COLOR }}>{formatNumber(computed.ax, 2)}</strong>
                    </div>

                    <div
                        style={{
                            textAlign: "center",
                            padding: 8,
                            background: "#fff",
                            borderRadius: 6,
                            border: `2px solid ${COMP_Y_COLOR}`,
                        }}
                    >
                        <div style={{ color: "#6b7280", fontSize: 11 }}>Aᵧ</div>
                        <strong style={{ color: COMP_Y_COLOR }}>{formatNumber(computed.ay, 2)}</strong>
                    </div>
                </div>
            </div>
        </ResponsiveCard>
    );

    // ============ FORMULE ============

    const formulasPanel = (
        <CollapsiblePanel title="📚 Formule" defaultOpen={!isMobile}>
            <div style={{ display: "grid", gap: 16 }}>
                <div style={{ padding: 12, background: "#eff6ff", borderRadius: 8 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8, color: "#1d4ed8", fontSize: 14 }}>
                        Da modulo e angolo → componenti
                    </div>
                    <div style={{ display: "grid", gap: 4 }}>
                        <DisplayMath>{`A_x = A \\cdot \\cos\\theta`}</DisplayMath>
                        <DisplayMath>{`A_y = A \\cdot \\sin\\theta`}</DisplayMath>
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
                        Nel grafico usiamo spesso <strong>θ_eff</strong> (angolo equivalente nell’intervallo (-180°, 180°]) per
                        mostrare l’arco minore.
                    </div>
                </div>

                <div style={{ padding: 12, background: "#f0fdf4", borderRadius: 8 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8, color: "#166534", fontSize: 14 }}>
                        Da componenti → modulo e angolo
                    </div>
                    <div style={{ display: "grid", gap: 4 }}>
                        <DisplayMath>{`|\\vec{A}| = \\sqrt{A_x^2 + A_y^2}`}</DisplayMath>
                        <DisplayMath>{`\\theta = \\arctan\\left(\\frac{|A_y|}{|A_x|}\\right)`}</DisplayMath>
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
                        ⚠️ L’arcotangente dà l’angolo acuto. Per la direzione completa (0°–360°) bisogna considerare il quadrante.
                    </div>
                </div>

                <div style={{ padding: 12, background: "#fef3c7", borderRadius: 8 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8, color: "#92400e", fontSize: 14 }}>
                        Segni delle componenti
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
                        <div>
                            <strong>I quad:</strong> Aₓ {">"} 0, Aᵧ {">"} 0
                        </div>
                        <div>
                            <strong>II quad:</strong> Aₓ {"<"} 0, Aᵧ {">"} 0
                        </div>
                        <div>
                            <strong>III quad:</strong> Aₓ {"<"} 0, Aᵧ {"<"} 0
                        </div>
                        <div>
                            <strong>IV quad:</strong> Aₓ {">"} 0, Aᵧ {"<"} 0
                        </div>
                    </div>
                </div>
            </div>
        </CollapsiblePanel>
    );

    // ============ LEGENDA ============

    const legendPanel = (
        <div
            style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 16,
                padding: 12,
                background: "#fff",
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                fontSize: 13,
                marginTop: 12,
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 20, height: 3, background: VECTOR_COLOR }} />
                <span>Vettore A⃗</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 20, height: 3, background: COMP_X_COLOR }} />
                <span>Componente Aₓ</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 20, height: 3, background: COMP_Y_COLOR }} />
                <span>Componente Aᵧ</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 16, height: 16, border: `2px solid ${ANGLE_COLOR}`, borderRadius: "50%" }} />
                <span>Angolo (arco minore)</span>
            </div>
        </div>
    );

    // ============ GRAFICO ============

    const graphPanel = (
        <ResponsiveCard padding={8}>
            <CoordinatePlane
                width={500}
                height={500}
                xMin={-range}
                xMax={range}
                yMin={-range}
                yMax={range}
                showGrid={true}
                gridOpacity={0.5}
                showArrows={true}
                vectors={[vectorAx, vectorAy, mainVector]}
                lines={triangleLines}
                arcs={computed.modulo > 0.1 ? [angleArc] : []}
                xAxisLabel="x"
                yAxisLabel="y"
                style={{ width: "100%", height: "auto", maxHeight: "60vh" }}
            />
            {legendPanel}
        </ResponsiveCard>
    );

    // ============ LAYOUT RESPONSIVE ============

    if (isMobile) {
        return (
            <DemoContainer title="Componenti cartesiane di un vettore" description="Scomponi un vettore nelle sue componenti x e y">
                {modeSelector}
                {graphPanel}
                {inputPanel}
                {resultsPanel}
                {formulasPanel}
            </DemoContainer>
        );
    }

    if (isTablet) {
        return (
            <DemoContainer
                title="Componenti cartesiane di un vettore"
                description="Scomponi un vettore nelle sue componenti cartesiane o calcola modulo e direzione dalle componenti."
            >
                {modeSelector}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>{graphPanel}</div>
                    <div>
                        {inputPanel}
                        {resultsPanel}
                    </div>
                </div>
                {formulasPanel}
            </DemoContainer>
        );
    }

    return (
        <DemoContainer
            title="Componenti cartesiane di un vettore"
            description="Scomponi un vettore nelle sue componenti cartesiane Aₓ e Aᵧ, oppure calcola modulo e direzione dalle componenti."
        >
            {modeSelector}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>{graphPanel}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {inputPanel}
                    {resultsPanel}
                    {formulasPanel}
                </div>
            </div>
        </DemoContainer>
    );
}
