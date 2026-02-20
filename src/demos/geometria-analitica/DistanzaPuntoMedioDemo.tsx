22/**
 * DistanzaPuntoMedioDemo - Calcolo distanza tra due punti e punto medio
 * Step-by-step con visualizzazione grafica sul piano cartesiano
 */

import React, { useState, useCallback, useMemo } from "react";

import {
    Latex,
    DemoContainer,
    ProblemCard,
    NavigationButtons,
    StepCard,
    InfoBox,
    GenerateButton,
    useStepNavigation,
    useBreakpoint,
    ResponsiveGrid,
    SwipeableTabs,
    CollapsiblePanel,
    GraphContainer,
} from "../../components/ui";
import { CollapsibleExplanation } from "../../components/ui/CollapsibleExplanation";
import { CoordinatePlane, type LineStyle } from "../../components/ui/CoordinatePlane";

import { randomInt } from "../../utils/math";

// ============ TIPI ============

interface PointPair {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

interface Calculations {
    // Differenze
    deltaX: number;
    deltaY: number;
    // Distanza
    deltaX2: number;
    deltaY2: number;
    sumSquares: number;
    distance: number;
    distanceExact: string; // Forma esatta con radice se necessario
    // Punto medio
    midX: number;
    midY: number;
    midXFraction: string;
    midYFraction: string;
}

// ============ GENERATORE ============

function generatePoints(): PointPair {
    const x1 = randomInt(-5, 5);
    const y1 = randomInt(-5, 5);
    let x2 = randomInt(-5, 5);
    let y2 = randomInt(-5, 5);

    // Evita punti coincidenti
    while (x1 === x2 && y1 === y2) {
        x2 = randomInt(-5, 5);
        y2 = randomInt(-5, 5);
    }

    return { x1, y1, x2, y2 };
}

function calculateAll(points: PointPair): Calculations {
    const { x1, y1, x2, y2 } = points;

    // Differenze
    const deltaX = x2 - x1;
    const deltaY = y2 - y1;

    // Distanza
    const deltaX2 = deltaX * deltaX;
    const deltaY2 = deltaY * deltaY;
    const sumSquares = deltaX2 + deltaY2;
    const distance = Math.sqrt(sumSquares);

    // Forma esatta della distanza
    let distanceExact: string;
    if (Number.isInteger(distance)) {
        distanceExact = distance.toString();
    } else {
        // Semplifica la radice se possibile
        const simplified = simplifySquareRoot(sumSquares);
        distanceExact = simplified;
    }

    // Punto medio
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    // Frazioni per punto medio
    const sumX = x1 + x2;
    const sumY = y1 + y2;
    const midXFraction = Number.isInteger(midX) ? midX.toString() : `\\frac{${sumX}}{2}`;
    const midYFraction = Number.isInteger(midY) ? midY.toString() : `\\frac{${sumY}}{2}`;

    return {
        deltaX,
        deltaY,
        deltaX2,
        deltaY2,
        sumSquares,
        distance,
        distanceExact,
        midX,
        midY,
        midXFraction,
        midYFraction,
    };
}

// Semplifica radice quadrata (es. sqrt(8) = 2*sqrt(2))
function simplifySquareRoot(n: number): string {
    if (n === 0) return "0";

    let outside = 1;
    let inside = n;

    for (let i = 2; i * i <= inside; i++) {
        while (inside % (i * i) === 0) {
            outside *= i;
            inside /= i * i;
        }
    }

    if (inside === 1) {
        return outside.toString();
    } else if (outside === 1) {
        return `\\sqrt{${n}}`;
    } else {
        return `${outside}\\sqrt{${inside}}`;
    }
}

function formatNumber(n: number): string {
    if (Number.isInteger(n)) return n.toString();
    // Arrotonda a 2 decimali se necessario
    const rounded = Math.round(n * 100) / 100;
    return rounded.toString();
}

function formatSignedNumber(n: number): string {
    if (n >= 0) return `+ ${n}`;
    return `- ${Math.abs(n)}`;
}

// ============ COMPONENTE PRINCIPALE ============

export default function DistanzaPuntoMedioDemo() {
    const { isMobile, isTablet } = useBreakpoint();

    const [points, setPoints] = useState<PointPair>(() => generatePoints());
    const [mode, setMode] = useState<"distanza" | "punto-medio">("distanza");
    const totalSteps = mode === "distanza" ? 4 : 3;
    const { currentStep, nextStep, prevStep, showAll, reset } = useStepNavigation(totalSteps);

    const calc = useMemo(() => calculateAll(points), [points]);

    const isActive = (stepNumber: number) => currentStep >= stepNumber - 1;

    const handleGenerate = useCallback(() => {
        setPoints(generatePoints());
        reset();
    }, [reset]);

    const handleModeChange = useCallback((newMode: "distanza" | "punto-medio") => {
        setMode(newMode);
        reset();
    }, [reset]);

    // ============ GRAFICO ============

    const planeWidth = isMobile ? 280 : isTablet ? 350 : 400;
    const planeHeight = isMobile ? 280 : isTablet ? 350 : 400;

    // Calcola range dinamico basato sui punti
    const margin = 2;
    const xMin = Math.min(points.x1, points.x2, calc.midX) - margin;
    const xMax = Math.max(points.x1, points.x2, calc.midX) + margin;
    const yMin = Math.min(points.y1, points.y2, calc.midY) - margin;
    const yMax = Math.max(points.y1, points.y2, calc.midY) + margin;

    // Normalizza a intervallo simmetrico
    const absMax = Math.max(Math.abs(xMin), Math.abs(xMax), Math.abs(yMin), Math.abs(yMax), 6);
    const range = Math.ceil(absMax);

    const planePoints = [
        { x: points.x1, y: points.y1, label: `A(${points.x1}, ${points.y1})`, color: "#3b82f6", radius: 6 },
        { x: points.x2, y: points.y2, label: `B(${points.x2}, ${points.y2})`, color: "#ef4444", radius: 6 },
    ];

    // Mostra punto medio solo se siamo in modalità punto medio e allo step giusto
    if (mode === "punto-medio" && currentStep >= 2) {
        planePoints.push({
            x: calc.midX,
            y: calc.midY,
            label: `M(${formatNumber(calc.midX)}, ${formatNumber(calc.midY)})`,
            color: "#22c55e",
            radius: 6,
        });
    }

    // Costruisci le linee in modo immutabile
    const baseLine = {
        p1: { x: points.x1, y: points.y1 },
        p2: { x: points.x2, y: points.y2 },
        color: "#8b5cf6",
        strokeWidth: 2,
    };

    const projectionLines = mode === "distanza" && currentStep >= 1 ? [
        // Linea orizzontale (deltaX)
        {
            p1: { x: points.x1, y: points.y1 },
            p2: { x: points.x2, y: points.y1 },
            color: "#f59e0b",
            strokeWidth: 2,
            style: "dashed" as "dashed",
        },
        // Linea verticale (deltaY)
        {
            p1: { x: points.x2, y: points.y1 },
            p2: { x: points.x2, y: points.y2 },
            color: "#10b981",
            strokeWidth: 2,
            style: "dashed" as "dashed",
        },
    ] : [];

    const planeLines = [baseLine, ...projectionLines];

    const GraphComponent = (
        <GraphContainer title="Piano Cartesiano">
            <div style={{ display: "flex", justifyContent: "center" }}>
                <CoordinatePlane
                    width={planeWidth}
                    height={planeHeight}
                    xMin={-range}
                    xMax={range}
                    yMin={-range}
                    yMax={range}
                    points={planePoints}
                    lines={planeLines}
                    showGrid={true}
                    showArrows={true}
                />
            </div>
            <div style={{ marginTop: 12, fontSize: 13, color: "#64748b", textAlign: "center" }}>
                <span style={{ color: "#3b82f6", fontWeight: 600 }}>A</span> = punto iniziale,{" "}
                <span style={{ color: "#ef4444", fontWeight: 600 }}>B</span> = punto finale
                {mode === "punto-medio" && currentStep >= 2 && (
                    <>, <span style={{ color: "#22c55e", fontWeight: 600 }}>M</span> = punto medio</>
                )}
            </div>
        </GraphContainer>
    );

    // ============ STEP DISTANZA ============

    const DistanceStep1 = (
        <StepCard stepNumber={1} title="Calcolo delle differenze" color="blue" isActive={isActive(1)}>
            <CollapsibleExplanation title="Teoria: Formula della distanza">
                <div>
                    <p>La <strong>distanza</strong> tra due punti nel piano cartesiano si calcola con il <strong>teorema di Pitagora</strong>.</p>
                    <p>Dati due punti <Latex>{"A(x_1, y_1)"}</Latex> e <Latex>{"B(x_2, y_2)"}</Latex>, la distanza e:</p>
                    <Latex display>{"d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}"}</Latex>
                    <p>Il segmento AB e l'ipotenusa di un triangolo rettangolo con cateti:</p>
                    <ul>
                        <li><Latex>{"\\Delta x = x_2 - x_1"}</Latex> (cateto orizzontale)</li>
                        <li><Latex>{"\\Delta y = y_2 - y_1"}</Latex> (cateto verticale)</li>
                    </ul>
                </div>
            </CollapsibleExplanation>
            <div style={{ background: "#fff", borderRadius: 8, padding: 12, marginTop: 8 }}>
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
                    Calcoliamo le differenze delle coordinate:
                </div>
                <div style={{ fontSize: 16, lineHeight: 2 }}>
                    <Latex display>{`\\Delta x = x_2 - x_1 = ${points.x2} - (${points.x1}) = ${calc.deltaX}`}</Latex>
                    <Latex display>{`\\Delta y = y_2 - y_1 = ${points.y2} - (${points.y1}) = ${calc.deltaY}`}</Latex>
                </div>
            </div>
        </StepCard>
    );

    const DistanceStep2 = (
        <StepCard stepNumber={2} title="Quadrati delle differenze" color="purple" isActive={isActive(2)}>
            <div style={{ background: "#fff", borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
                    Eleviamo al quadrato:
                </div>
                <div style={{ fontSize: 16, lineHeight: 2 }}>
                    <Latex display>{`(\\Delta x)^2 = (${calc.deltaX})^2 = ${calc.deltaX2}`}</Latex>
                    <Latex display>{`(\\Delta y)^2 = (${calc.deltaY})^2 = ${calc.deltaY2}`}</Latex>
                </div>
            </div>
        </StepCard>
    );

    const DistanceStep3 = (
        <StepCard stepNumber={3} title="Somma e radice quadrata" color="amber" isActive={isActive(3)}>
            <div style={{ background: "#fff", borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
                    Sommiamo e calcoliamo la radice:
                </div>
                <div style={{ fontSize: 16, lineHeight: 2 }}>
                    <Latex display>{`(\\Delta x)^2 + (\\Delta y)^2 = ${calc.deltaX2} + ${calc.deltaY2} = ${calc.sumSquares}`}</Latex>
                    <Latex display>{`d = \\sqrt{${calc.sumSquares}} = ${calc.distanceExact}`}</Latex>
                </div>
            </div>
        </StepCard>
    );

    const DistanceStep4 = (
        <StepCard stepNumber={4} title="Risultato finale" color="green" isActive={isActive(4)} fullWidth>
            <div style={{
                background: "#f0fdf4",
                borderRadius: 8,
                padding: 16,
                border: "1px solid #bbf7d0",
            }}>
                <div style={{ fontWeight: 700, marginBottom: 12, color: "#166534", fontSize: 16 }}>
                    Distanza tra A e B
                </div>
                <div style={{
                    fontSize: 20,
                    padding: "12px 16px",
                    background: "#fff",
                    borderRadius: 8,
                    display: "inline-block",
                }}>
                    <Latex>{`d(A, B) = ${calc.distanceExact}`}</Latex>
                    {!Number.isInteger(calc.distance) && (
                        <span style={{ color: "#64748b", fontSize: 14, marginLeft: 12 }}>
                            <Latex>{`\\approx ${formatNumber(calc.distance)}`}</Latex>
                        </span>
                    )}
                </div>
            </div>
        </StepCard>
    );

    // ============ STEP PUNTO MEDIO ============

    const MidpointStep1 = (
        <StepCard stepNumber={1} title="Formula del punto medio" color="blue" isActive={isActive(1)}>
            <CollapsibleExplanation title="Teoria: Il punto medio">
                <div>
                    <p>Il <strong>punto medio</strong> M di un segmento AB e il punto che divide il segmento in due parti uguali.</p>
                    <p>Dati due punti <Latex>{"A(x_1, y_1)"}</Latex> e <Latex>{"B(x_2, y_2)"}</Latex>, le coordinate del punto medio sono:</p>
                    <Latex display>{"M = \\left( \\frac{x_1 + x_2}{2}, \\frac{y_1 + y_2}{2} \\right)"}</Latex>
                    <p>In pratica, si calcola la <strong>media aritmetica</strong> delle coordinate x e delle coordinate y.</p>
                </div>
            </CollapsibleExplanation>
            <div style={{ background: "#fff", borderRadius: 8, padding: 12, marginTop: 8 }}>
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
                    Applichiamo la formula:
                </div>
                <div style={{ fontSize: 16 }}>
                    <Latex display>{"M = \\left( \\frac{x_1 + x_2}{2}, \\frac{y_1 + y_2}{2} \\right)"}</Latex>
                </div>
            </div>
        </StepCard>
    );

    const MidpointStep2 = (
        <StepCard stepNumber={2} title="Calcolo delle coordinate" color="purple" isActive={isActive(2)}>
            <div style={{ background: "#fff", borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
                    Sostituiamo i valori:
                </div>
                <div style={{ fontSize: 16, lineHeight: 2.2 }}>
                    <Latex display>{`x_M = \\frac{${points.x1} + (${points.x2})}{2} = \\frac{${points.x1 + points.x2}}{2} = ${calc.midXFraction}`}</Latex>
                    <Latex display>{`y_M = \\frac{${points.y1} + (${points.y2})}{2} = \\frac{${points.y1 + points.y2}}{2} = ${calc.midYFraction}`}</Latex>
                </div>
            </div>
        </StepCard>
    );

    const MidpointStep3 = (
        <StepCard stepNumber={3} title="Risultato finale" color="green" isActive={isActive(3)} fullWidth>
            <div style={{
                background: "#f0fdf4",
                borderRadius: 8,
                padding: 16,
                border: "1px solid #bbf7d0",
            }}>
                <div style={{ fontWeight: 700, marginBottom: 12, color: "#166534", fontSize: 16 }}>
                    Punto medio M del segmento AB
                </div>
                <div style={{
                    fontSize: 20,
                    padding: "12px 16px",
                    background: "#fff",
                    borderRadius: 8,
                    display: "inline-block",
                }}>
                    <Latex>{`M = \\left( ${calc.midXFraction}, ${calc.midYFraction} \\right)`}</Latex>
                </div>
                {(!Number.isInteger(calc.midX) || !Number.isInteger(calc.midY)) && (
                    <div style={{ marginTop: 8, fontSize: 14, color: "#64748b" }}>
                        <Latex>{`M \\approx (${formatNumber(calc.midX)}, ${formatNumber(calc.midY)})`}</Latex>
                    </div>
                )}
            </div>
        </StepCard>
    );

    // ============ METODO RIASSUNTO ============

    const MethodContent = (
        <div style={{ fontSize: 13 }}>
            {mode === "distanza" ? (
                <>
                    <p style={{ marginBottom: 8 }}><strong>Formula della distanza:</strong></p>
                    <Latex display>{"d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}"}</Latex>
                    <ol style={{ margin: "12px 0 0 0", paddingLeft: 20 }}>
                        <li>Calcola <Latex>{"\\Delta x = x_2 - x_1"}</Latex></li>
                        <li>Calcola <Latex>{"\\Delta y = y_2 - y_1"}</Latex></li>
                        <li>Eleva al quadrato entrambi</li>
                        <li>Somma e calcola la radice quadrata</li>
                    </ol>
                </>
            ) : (
                <>
                    <p style={{ marginBottom: 8 }}><strong>Formula del punto medio:</strong></p>
                    <Latex display>{"M = \\left( \\frac{x_1 + x_2}{2}, \\frac{y_1 + y_2}{2} \\right)"}</Latex>
                    <ol style={{ margin: "12px 0 0 0", paddingLeft: 20 }}>
                        <li>Somma le coordinate x e dividi per 2</li>
                        <li>Somma le coordinate y e dividi per 2</li>
                        <li>Scrivi il punto medio M</li>
                    </ol>
                </>
            )}
        </div>
    );

    // ============ SELETTORE MODALITA ============

    const ModeSelector = (
        <div style={{
            display: "flex",
            gap: 8,
            marginBottom: 16,
            flexWrap: "wrap",
        }}>
            <button
                onClick={() => handleModeChange("distanza")}
                style={{
                    padding: "10px 20px",
                    borderRadius: 8,
                    border: mode === "distanza" ? "2px solid #3b82f6" : "1px solid #d1d5db",
                    background: mode === "distanza" ? "#dbeafe" : "#fff",
                    color: mode === "distanza" ? "#1e40af" : "#475569",
                    fontWeight: mode === "distanza" ? 600 : 400,
                    cursor: "pointer",
                    fontSize: 14,
                }}
            >
                Distanza
            </button>
            <button
                onClick={() => handleModeChange("punto-medio")}
                style={{
                    padding: "10px 20px",
                    borderRadius: 8,
                    border: mode === "punto-medio" ? "2px solid #22c55e" : "1px solid #d1d5db",
                    background: mode === "punto-medio" ? "#dcfce7" : "#fff",
                    color: mode === "punto-medio" ? "#166534" : "#475569",
                    fontWeight: mode === "punto-medio" ? 600 : 400,
                    cursor: "pointer",
                    fontSize: 14,
                }}
            >
                Punto Medio
            </button>
            <GenerateButton text="Nuovi punti" onClick={handleGenerate} />
        </div>
    );

    // ============ PROBLEMA ============

    const problemLabel = mode === "distanza"
        ? "Calcola la distanza tra i punti:"
        : "Trova il punto medio del segmento:";

    const problemContent = (
        <div style={{ textAlign: "center", fontSize: isMobile ? 18 : 22 }}>
            <Latex>{`A(${points.x1}, ${points.y1})`}</Latex>
            <span style={{ margin: "0 16px", color: "#64748b" }}>e</span>
            <Latex>{`B(${points.x2}, ${points.y2})`}</Latex>
        </div>
    );

    // ============ MOBILE ============

    if (isMobile) {
        return (
            <DemoContainer title="Distanza e Punto Medio" description="Calcoli nel piano cartesiano">
                {ModeSelector}

                <ProblemCard label={problemLabel}>
                    {problemContent}
                </ProblemCard>

                <NavigationButtons
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                    onNext={nextStep}
                    onPrev={prevStep}
                    onShowAll={showAll}
                />

                <SwipeableTabs
                    tabs={[
                        {
                            id: "steps",
                            label: "Procedimento",
                            content: (
                                <div style={{ display: "grid", gap: 12 }}>
                                    {mode === "distanza" ? (
                                        <>
                                            {DistanceStep1}
                                            {DistanceStep2}
                                            {DistanceStep3}
                                            {DistanceStep4}
                                        </>
                                    ) : (
                                        <>
                                            {MidpointStep1}
                                            {MidpointStep2}
                                            {MidpointStep3}
                                        </>
                                    )}
                                </div>
                            ),
                        },
                        {
                            id: "graph",
                            label: "Grafico",
                            content: GraphComponent,
                        },
                        {
                            id: "method",
                            label: "Formula",
                            content: (
                                <CollapsiblePanel title="Formula e metodo" defaultOpen>
                                    {MethodContent}
                                </CollapsiblePanel>
                            ),
                        },
                    ]}
                    defaultTab="steps"
                />
            </DemoContainer>
        );
    }

    // ============ TABLET ============

    if (isTablet) {
        return (
            <DemoContainer
                title="Distanza e Punto Medio"
                description="Calcola la distanza tra due punti o il punto medio di un segmento."
            >
                {ModeSelector}

                <ProblemCard label={problemLabel}>
                    {problemContent}
                </ProblemCard>

                <NavigationButtons
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                    onNext={nextStep}
                    onPrev={prevStep}
                    onShowAll={showAll}
                />

                <ResponsiveGrid columns={{ tablet: 2 }} gap={16}>
                    <div>
                        <div style={{ display: "grid", gap: 12 }}>
                            {mode === "distanza" ? (
                                <>
                                    {DistanceStep1}
                                    {DistanceStep2}
                                    {DistanceStep3}
                                    {DistanceStep4}
                                </>
                            ) : (
                                <>
                                    {MidpointStep1}
                                    {MidpointStep2}
                                    {MidpointStep3}
                                </>
                            )}
                        </div>
                    </div>
                    <div>
                        {GraphComponent}
                    </div>
                </ResponsiveGrid>

                <div style={{ marginTop: 16 }}>
                    <CollapsiblePanel title="Formula e metodo" defaultOpen={false}>
                        {MethodContent}
                    </CollapsiblePanel>
                </div>
            </DemoContainer>
        );
    }

    // ============ DESKTOP ============

    return (
        <DemoContainer
            title="Distanza e Punto Medio"
            description="Calcola la distanza tra due punti o il punto medio di un segmento nel piano cartesiano."
        >
            {ModeSelector}

            <ProblemCard label={problemLabel}>
                {problemContent}
            </ProblemCard>

            <NavigationButtons
                currentStep={currentStep}
                totalSteps={totalSteps}
                onNext={nextStep}
                onPrev={prevStep}
                onShowAll={showAll}
            />

            <ResponsiveGrid columns={{ desktop: 2 }} gap={20}>
                <div>
                    <div style={{ display: "grid", gap: 12 }}>
                        {mode === "distanza" ? (
                            <>
                                {DistanceStep1}
                                {DistanceStep2}
                                {DistanceStep3}
                                {DistanceStep4}
                            </>
                        ) : (
                            <>
                                {MidpointStep1}
                                {MidpointStep2}
                                {MidpointStep3}
                            </>
                        )}
                    </div>
                </div>
                <div>
                    {GraphComponent}
                </div>
            </ResponsiveGrid>

            <InfoBox title="Riepilogo formule:">
                {MethodContent}
            </InfoBox>
        </DemoContainer>
    );
}
