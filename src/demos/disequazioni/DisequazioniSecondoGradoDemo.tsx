/**
 * DisequazioniSecondoGradoDemo - Versione refactorizzata con helpers
 */

import React, { useState, useCallback } from "react";

// Componenti UI
import {
    Latex,
    DemoContainer,
    ProblemCard,
    NavigationButtons,
    StepCard,
    StepGrid,
    GraphContainer,
    InfoBox,
    GenerateButton,
    useStepNavigation,
} from "../../components/ui";

// Utility matematiche
import {
    randomInt,
    randomNonZero,
    randomChoice,
    formatNumberLatex,
    formatQuadraticLatex,
    signToLatex,
    signToText,
    isStrictInequality,
    isPositiveInequality,
    InequalitySign,
} from "../../utils/math";

// ============ TIPI ============

type SolutionType = "two-roots" | "one-root" | "no-roots";

interface DisequazioneDef {
    originalLeft: { a: number; b: number; c: number };
    originalRight: { a: number; b: number; c: number };
    sign: InequalitySign;
    a: number;
    b: number;
    c: number;
    delta: number;
    solutionType: SolutionType;
    x1?: number;
    x2?: number;
    solutionIntervals: string;
    solutionSet: string;
}

// ============ GENERATORE ============

function generateDisequazione(): DisequazioneDef {
    const sign = randomChoice<InequalitySign>(["<", ">", "<=", ">="]);
    const solutionType = randomChoice<SolutionType>([
        "two-roots", "two-roots", "two-roots", "one-root", "no-roots"
    ]);

    let a: number, b: number, c: number, delta: number;
    let x1: number | undefined, x2: number | undefined;

    if (solutionType === "two-roots") {
        x1 = randomInt(-5, 5);
        x2 = randomInt(-5, 5);
        while (x2 === x1) x2 = randomInt(-5, 5);
        if (x1 > x2) [x1, x2] = [x2, x1];

        a = randomNonZero(-3, 3);
        b = -a * (x1 + x2);
        c = a * x1 * x2;
        delta = b * b - 4 * a * c;
    } else if (solutionType === "one-root") {
        x1 = randomInt(-4, 4);
        x2 = x1;

        a = randomNonZero(-3, 3);
        b = -2 * a * x1;
        c = a * x1 * x1;
        delta = 0;
    } else {
        a = randomNonZero(-3, 3);
        const signC = a > 0 ? 1 : -1;
        c = signC * randomInt(2, 5);
        const maxB = Math.floor(Math.sqrt(4 * Math.abs(a * c))) - 1;
        b = maxB > 0 ? randomInt(-maxB, maxB) : 0;
        delta = b * b - 4 * a * c;
    }

    // Forma originale
    const addLeft = { a: randomInt(0, 2), b: randomInt(-3, 3), c: randomInt(-5, 5) };
    const addRight = { a: addLeft.a + a, b: addLeft.b + b, c: addLeft.c + c };

    // Calcola soluzioni
    const strict = isStrictInequality(sign);
    const positive = isPositiveInequality(sign);
    const concavityUp = a > 0;

    let solutionIntervals: string;
    let solutionSet: string;

    if (solutionType === "no-roots") {
        if ((concavityUp && positive) || (!concavityUp && !positive)) {
            solutionIntervals = "\\mathbb{R}";
            solutionSet = "\\left\\{ x \\in \\mathbb{R} \\right\\}";
        } else {
            solutionIntervals = "\\emptyset";
            solutionSet = "\\emptyset";
        }
    } else if (solutionType === "one-root") {
        const x1Latex = formatNumberLatex(x1!);
        if ((concavityUp && positive) || (!concavityUp && !positive)) {
            if (strict) {
                solutionIntervals = `\\mathbb{R} \\setminus \\{${x1Latex}\\}`;
                solutionSet = `\\left\\{ x \\in \\mathbb{R} : x \\neq ${x1Latex} \\right\\}`;
            } else {
                solutionIntervals = "\\mathbb{R}";
                solutionSet = "\\left\\{ x \\in \\mathbb{R} \\right\\}";
            }
        } else {
            if (strict) {
                solutionIntervals = "\\emptyset";
                solutionSet = "\\emptyset";
            } else {
                solutionIntervals = `\\{${x1Latex}\\}`;
                solutionSet = `\\left\\{ x \\in \\mathbb{R} : x = ${x1Latex} \\right\\}`;
            }
        }
    } else {
        const x1Latex = formatNumberLatex(x1!);
        const x2Latex = formatNumberLatex(x2!);
        const leftBracket = strict ? "(" : "[";
        const rightBracket = strict ? ")" : "]";

        const isExternal = (concavityUp && positive) || (!concavityUp && !positive);

        if (isExternal) {
            solutionIntervals = `\\left(-\\infty, ${x1Latex}\\right${rightBracket} \\cup \\left${leftBracket}${x2Latex}, +\\infty\\right)`;
            const cond = strict
                ? `x < ${x1Latex} \\lor x > ${x2Latex}`
                : `x \\leq ${x1Latex} \\lor x \\geq ${x2Latex}`;
            solutionSet = `\\left\\{ x \\in \\mathbb{R} : ${cond} \\right\\}`;
        } else {
            solutionIntervals = `\\left${leftBracket}${x1Latex}, ${x2Latex}\\right${rightBracket}`;
            const cond = strict
                ? `${x1Latex} < x < ${x2Latex}`
                : `${x1Latex} \\leq x \\leq ${x2Latex}`;
            solutionSet = `\\left\\{ x \\in \\mathbb{R} : ${cond} \\right\\}`;
        }
    }

    return {
        originalLeft: addLeft,
        originalRight: addRight,
        sign, a, b, c, delta,
        solutionType, x1, x2,
        solutionIntervals, solutionSet,
    };
}

// ============ GRAFICO PARABOLA ============

const SVG_WIDTH = 700;
const SVG_HEIGHT = 450;
const PADDING = 50;

interface ParabolaGraphProps {
    diseq: DisequazioneDef;
    showIntersections: boolean;
    showConcavity: boolean;
    showSolution: boolean;
}

function ParabolaGraph({ diseq, showIntersections, showConcavity, showSolution }: ParabolaGraphProps) {
    const { a, b, c, x1, x2, solutionType } = diseq;

    // Range X
    let xMin = -8, xMax = 8;
    if (solutionType !== "no-roots") {
        const roots = solutionType === "one-root" ? [x1!] : [x1!, x2!];
        xMin = Math.min(-8, Math.min(...roots) - 3);
        xMax = Math.max(8, Math.max(...roots) + 3);
    }

    // Vertice
    const vertexX = -b / (2 * a);
    const vertexY = a * vertexX * vertexX + b * vertexX + c;

    // Range Y
    const yAtXMin = a * xMin * xMin + b * xMin + c;
    const yAtXMax = a * xMax * xMax + b * xMax + c;

    let yMin: number, yMax: number;
    if (a > 0) {
        yMin = vertexY - 2;
        yMax = Math.max(yAtXMin, yAtXMax, 4) + 2;
    } else {
        yMax = vertexY + 2;
        yMin = Math.min(yAtXMin, yAtXMax, -4) - 2;
    }

    if (yMin > -1) yMin = -2;
    if (yMax < 1) yMax = 2;

    const yRange = yMax - yMin;
    if (yRange < 10) {
        const center = (yMax + yMin) / 2;
        yMin = center - 5;
        yMax = center + 5;
    }

    const scaleX = (x: number) => PADDING + ((x - xMin) / (xMax - xMin)) * (SVG_WIDTH - 2 * PADDING);
    const scaleY = (y: number) => SVG_HEIGHT - PADDING - ((y - yMin) / (yMax - yMin)) * (SVG_HEIGHT - 2 * PADDING);

    const originX = scaleX(0);
    const originY = scaleY(0);

    // Punti parabola
    const parabolaPoints: string[] = [];
    for (let i = 0; i <= 150; i++) {
        const x = xMin + (i / 150) * (xMax - xMin);
        const y = a * x * x + b * x + c;
        const svgY = scaleY(y);
        if (svgY >= PADDING - 20 && svgY <= SVG_HEIGHT - PADDING + 20) {
            parabolaPoints.push(`${scaleX(x)},${svgY}`);
        }
    }

    // Zone +/-
    const zones: { x1: number; x2: number; positive: boolean }[] = [];
    const concavityUp = a > 0;

    if (solutionType === "two-roots") {
        zones.push({ x1: xMin, x2: x1!, positive: concavityUp });
        zones.push({ x1: x1!, x2: x2!, positive: !concavityUp });
        zones.push({ x1: x2!, x2: xMax, positive: concavityUp });
    } else if (solutionType === "one-root") {
        zones.push({ x1: xMin, x2: x1!, positive: concavityUp });
        zones.push({ x1: x1!, x2: xMax, positive: concavityUp });
    } else {
        zones.push({ x1: xMin, x2: xMax, positive: concavityUp });
    }

    const yStep = Math.ceil((yMax - yMin) / 6);

    const formatRootLabel = (n: number) =>
        formatNumberLatex(n).replace(/\\frac\{([^}]+)\}\{([^}]+)\}/, '$1/$2');

    return (
        <svg width={SVG_WIDTH} height={SVG_HEIGHT} style={{ maxWidth: "100%", display: "block", margin: "0 auto" }}>
            <rect x={0} y={0} width={SVG_WIDTH} height={SVG_HEIGHT} fill="#fafafa" stroke="#ddd" rx={8} />

            {/* Zone +/- */}
            {showSolution && zones.map((zone, idx) => (
                <g key={`zone-${idx}`}>
                    <rect
                        x={scaleX(zone.x1)}
                        y={PADDING}
                        width={scaleX(zone.x2) - scaleX(zone.x1)}
                        height={SVG_HEIGHT - 2 * PADDING}
                        fill={zone.positive ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)"}
                    />
                    <text
                        x={(scaleX(zone.x1) + scaleX(zone.x2)) / 2}
                        y={PADDING + 25}
                        fontSize={20}
                        fontWeight={700}
                        textAnchor="middle"
                        fill={zone.positive ? "rgba(34, 197, 94, 0.7)" : "rgba(239, 68, 68, 0.7)"}
                    >
                        {zone.positive ? "+" : "−"}
                    </text>
                </g>
            ))}

            {/* Griglia */}
            {Array.from({ length: Math.ceil(xMax - xMin) + 1 }, (_, i) => {
                const x = Math.floor(xMin) + i;
                if (x < xMin || x > xMax) return null;
                return <line key={`vg-${x}`} x1={scaleX(x)} y1={PADDING} x2={scaleX(x)} y2={SVG_HEIGHT - PADDING} stroke="#e5e7eb" />;
            })}
            {Array.from({ length: Math.ceil((yMax - yMin) / yStep) + 1 }, (_, i) => {
                const y = Math.floor(yMin / yStep) * yStep + i * yStep;
                if (y < yMin || y > yMax) return null;
                return <line key={`hg-${y}`} x1={PADDING} y1={scaleY(y)} x2={SVG_WIDTH - PADDING} y2={scaleY(y)} stroke="#e5e7eb" />;
            })}

            {/* Assi */}
            <line x1={PADDING} y1={originY} x2={SVG_WIDTH - PADDING} y2={originY} stroke="#374151" strokeWidth={2} />
            <polygon points={`${SVG_WIDTH - PADDING},${originY} ${SVG_WIDTH - PADDING - 8},${originY - 4} ${SVG_WIDTH - PADDING - 8},${originY + 4}`} fill="#374151" />
            <text x={SVG_WIDTH - PADDING + 5} y={originY + 5} fontSize={14} fill="#374151" fontStyle="italic">x</text>

            <line x1={originX} y1={SVG_HEIGHT - PADDING} x2={originX} y2={PADDING} stroke="#374151" strokeWidth={2} />
            <polygon points={`${originX},${PADDING} ${originX - 4},${PADDING + 8} ${originX + 4},${PADDING + 8}`} fill="#374151" />
            <text x={originX + 8} y={PADDING + 5} fontSize={14} fill="#374151" fontStyle="italic">y</text>

            {/* Tacche X */}
            {Array.from({ length: Math.ceil(xMax - xMin) + 1 }, (_, i) => {
                const x = Math.floor(xMin) + i;
                if (x === 0 || x < xMin || x > xMax) return null;
                return (
                    <g key={`xt-${x}`}>
                        <line x1={scaleX(x)} y1={originY - 4} x2={scaleX(x)} y2={originY + 4} stroke="#374151" />
                        <text x={scaleX(x)} y={originY + 18} fontSize={10} textAnchor="middle" fill="#6b7280">{x}</text>
                    </g>
                );
            })}

            {/* Tacche Y */}
            {Array.from({ length: Math.ceil((yMax - yMin) / yStep) + 1 }, (_, i) => {
                const y = Math.floor(yMin / yStep) * yStep + i * yStep;
                if (y === 0 || y < yMin || y > yMax) return null;
                return (
                    <g key={`yt-${y}`}>
                        <line x1={originX - 4} y1={scaleY(y)} x2={originX + 4} y2={scaleY(y)} stroke="#374151" />
                        <text x={originX - 8} y={scaleY(y) + 4} fontSize={10} textAnchor="end" fill="#6b7280">{y}</text>
                    </g>
                );
            })}

            <text x={originX - 10} y={originY + 15} fontSize={10} fill="#6b7280">O</text>

            {/* Parabola */}
            {showConcavity && (
                <polyline points={parabolaPoints.join(" ")} fill="none" stroke="#3b82f6" strokeWidth={3} />
            )}

            {/* Concavità */}
            {showConcavity && (
                <text
                    x={scaleX(vertexX)}
                    y={a > 0 ? scaleY(vertexY) + 30 : scaleY(vertexY) - 20}
                    fontSize={24}
                    textAnchor="middle"
                    fill="#8b5cf6"
                    fontWeight={700}
                >
                    {a > 0 ? "∪" : "∩"}
                </text>
            )}

            {/* Intersezioni */}
            {showIntersections && solutionType === "two-roots" && (
                <>
                    <circle cx={scaleX(x1!)} cy={originY} r={8} fill="#ef4444" stroke="#fff" strokeWidth={2} />
                    <text x={scaleX(x1!)} y={originY + 28} fontSize={13} textAnchor="middle" fill="#ef4444" fontWeight={600}>
                        x₁={formatRootLabel(x1!)}
                    </text>
                    <circle cx={scaleX(x2!)} cy={originY} r={8} fill="#ef4444" stroke="#fff" strokeWidth={2} />
                    <text x={scaleX(x2!)} y={originY + 28} fontSize={13} textAnchor="middle" fill="#ef4444" fontWeight={600}>
                        x₂={formatRootLabel(x2!)}
                    </text>
                </>
            )}
            {showIntersections && solutionType === "one-root" && (
                <>
                    <circle cx={scaleX(x1!)} cy={originY} r={8} fill="#f59e0b" stroke="#fff" strokeWidth={2} />
                    <text x={scaleX(x1!)} y={originY + 28} fontSize={13} textAnchor="middle" fill="#f59e0b" fontWeight={600}>
                        x₁=x₂={formatRootLabel(x1!)}
                    </text>
                </>
            )}
            {showIntersections && solutionType === "no-roots" && (
                <text x={SVG_WIDTH / 2} y={PADDING + 25} fontSize={13} textAnchor="middle" fill="#6b7280" fontStyle="italic">
                    Δ &lt; 0: nessuna intersezione
                </text>
            )}

            {/* Legenda */}
            {showSolution && (
                <g transform={`translate(${SVG_WIDTH - 160}, ${SVG_HEIGHT - PADDING - 55})`}>
                    <rect x={0} y={0} width={150} height={50} fill="#fff" stroke="#e5e7eb" rx={6} />
                    <rect x={10} y={10} width={18} height={12} fill="rgba(34, 197, 94, 0.3)" stroke="rgba(34, 197, 94, 0.5)" />
                    <text x={34} y={20} fontSize={11} fill="#374151">Parabola positiva</text>
                    <rect x={10} y={30} width={18} height={12} fill="rgba(239, 68, 68, 0.3)" stroke="rgba(239, 68, 68, 0.5)" />
                    <text x={34} y={40} fontSize={11} fill="#374151">Parabola negativa</text>
                </g>
            )}
        </svg>
    );
}

// ============ COMPONENTE PRINCIPALE ============

export default function DisequazioniSecondoGradoDemo() {
    const [diseq, setDiseq] = useState<DisequazioneDef>(() => generateDisequazione());
    const { currentStep, nextStep, prevStep, showAll, reset, isStepActive } = useStepNavigation(5);

    const handleGenerate = useCallback(() => {
        setDiseq(generateDisequazione());
        reset();
    }, [reset]);

    const leftSide = formatQuadraticLatex(diseq.originalLeft.a, diseq.originalLeft.b, diseq.originalLeft.c);
    const rightSide = formatQuadraticLatex(diseq.originalRight.a, diseq.originalRight.b, diseq.originalRight.c);
    const originalEquation = `${leftSide} ${signToLatex(diseq.sign)} ${rightSide}`;
    const normalForm = `${formatQuadraticLatex(diseq.a, diseq.b, diseq.c)} ${signToLatex(diseq.sign)} 0`;

    return (
        <DemoContainer
            title="Disequazioni di Secondo Grado"
            description="Risolvi disequazioni quadratiche passo dopo passo."
        >
            <div style={{ marginBottom: 20 }}>
                <GenerateButton text="Nuova disequazione" onClick={handleGenerate} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Problema e steps */}
                <div>
                    <ProblemCard label="Risolvi la disequazione:">
                        <Latex display>{originalEquation}</Latex>
                    </ProblemCard>

                    <NavigationButtons
                        currentStep={currentStep}
                        totalSteps={5}
                        onNext={nextStep}
                        onPrev={prevStep}
                        onShowAll={showAll}
                    />

                    <StepGrid columns={2}>
                        <StepCard stepNumber={1} title="Forma normale" color="green" isActive={isStepActive(1)}>
                            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
                                Porta tutti i termini a sinistra:
                            </div>
                            <div style={{ fontSize: 18, padding: "8px 12px", background: "#fff", borderRadius: 6, display: "inline-block" }}>
                                <Latex>{normalForm}</Latex>
                            </div>
                            <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
                                <Latex>{`a = ${diseq.a}, \\; b = ${diseq.b}, \\; c = ${diseq.c}`}</Latex>
                            </div>
                        </StepCard>

                        <StepCard stepNumber={2} title="Equazione associata" color="blue" isActive={isStepActive(2)}>
                            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
                                <Latex>{`\\Delta = ${diseq.b}^2 - 4 \\cdot ${diseq.a} \\cdot ${diseq.c} = ${diseq.delta}`}</Latex>
                            </div>
                            {diseq.solutionType === "two-roots" && (
                                <div style={{ padding: "6px 10px", background: "#fef2f2", borderRadius: 6, color: "#991b1b", fontSize: 14 }}>
                                    <Latex>{`\\Delta > 0 \\Rightarrow x_1 = ${formatNumberLatex(diseq.x1!)}, \\; x_2 = ${formatNumberLatex(diseq.x2!)}`}</Latex>
                                </div>
                            )}
                            {diseq.solutionType === "one-root" && (
                                <div style={{ padding: "6px 10px", background: "#fef3c7", borderRadius: 6, color: "#92400e", fontSize: 14 }}>
                                    <Latex>{`\\Delta = 0 \\Rightarrow x_1 = x_2 = ${formatNumberLatex(diseq.x1!)}`}</Latex>
                                </div>
                            )}
                            {diseq.solutionType === "no-roots" && (
                                <div style={{ padding: "6px 10px", background: "#f3f4f6", borderRadius: 6, color: "#374151", fontSize: 14 }}>
                                    <Latex>{"\\Delta < 0 \\Rightarrow \\text{nessuna radice reale}"}</Latex>
                                </div>
                            )}
                        </StepCard>

                        <StepCard stepNumber={3} title="Concavità" color="purple" isActive={isStepActive(3)}>
                            <div style={{ padding: "8px 12px", background: "#fff", borderRadius: 6 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <Latex>{`a = ${diseq.a} ${diseq.a > 0 ? "> 0" : "< 0"}`}</Latex>
                                    <span style={{ fontSize: 24 }}>⟹ {diseq.a > 0 ? "∪" : "∩"}</span>
                                </div>
                            </div>
                        </StepCard>

                        <StepCard stepNumber={4} title="Soluzione" color="amber" isActive={isStepActive(4)}>
                            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Intervalli:</div>
                            <div style={{ fontSize: 18, padding: "6px 10px", background: "#fff", borderRadius: 6, display: "inline-block", color: "#92400e", marginBottom: 8 }}>
                                <Latex>{diseq.solutionIntervals}</Latex>
                            </div>
                            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Forma insiemistica:</div>
                            <div style={{ fontSize: 14, padding: "6px 10px", background: "#fff", borderRadius: 6, color: "#92400e" }}>
                                <Latex>{diseq.solutionSet}</Latex>
                            </div>
                        </StepCard>
                    </StepGrid>
                </div>

                {/* Grafico */}
                <GraphContainer
                    title="Rappresentazione grafica"
                    footer={
                        currentStep < 2 ? <em>Prosegui per vedere le intersezioni...</em> :
                            currentStep === 2 ? <>Le <strong style={{ color: "#ef4444" }}>intersezioni</strong> dividono l'asse x in regioni</> :
                                currentStep === 3 ? <>La <strong style={{ color: "#8b5cf6" }}>concavità</strong> determina dove la parabola è positiva/negativa</> :
                                    <>La zona <strong style={{ color: "#22c55e" }}>verde (+)</strong> e <strong style={{ color: "#ef4444" }}>rossa (−)</strong> indicano il segno della parabola</>
                    }
                >
                    <ParabolaGraph
                        diseq={diseq}
                        showIntersections={isStepActive(2)}
                        showConcavity={isStepActive(3)}
                        showSolution={isStepActive(4)}
                    />
                </GraphContainer>
            </div>

            <InfoBox title="Metodo di risoluzione:">
                <ol style={{ margin: "8px 0 0 0", paddingLeft: 20 }}>
                    <li><strong>Forma normale:</strong> riduci a <Latex>{"ax^2 + bx + c \\lessgtr 0"}</Latex></li>
                    <li><strong>Equazione associata:</strong> trova le radici usando <Latex>{"\\Delta = b^2 - 4ac"}</Latex></li>
                    <li><strong>Concavità:</strong> se <Latex>{"a > 0"}</Latex> parabola ∪, se <Latex>{"a < 0"}</Latex> parabola ∩</li>
                    <li><strong>Soluzione:</strong> leggi dal grafico i valori che soddisfano la disequazione</li>
                </ol>
            </InfoBox>
        </DemoContainer>
    );
}