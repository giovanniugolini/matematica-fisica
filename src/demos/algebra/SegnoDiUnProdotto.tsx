/**
 * DisequazioniProdottoDemo - Versione Responsive
 * Step-by-step: forma fattorizzata → studio fattori → schema segno → soluzione
 * Ottimizzato per mobile, tablet e desktop
 */

import React, { useState, useCallback, useMemo } from "react";

// Componenti UI
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
} from "../../components/ui";
import { CollapsibleExplanation } from "../../components/ui/CollapsibleExplanation";

// Utility matematiche
import {
    randomInt,
    randomNonZero,
    randomChoice,
    formatNumberLatex,
    formatFractionLatex,
} from "../../utils/math";

// ============ TIPI ============

interface Factor {
    coefficient: number; // coefficiente di x
    constant: number;   // termine noto
    root: number;       // punto in cui si annulla
}

interface Inequality {
    factors: Factor[];  // 2-3 fattori (80% 2 fattori, 20% 3 fattori)
    inequalityType: "<" | ">" | "≤" | "≥";
    solutionLatex: string;
    solutionSetLatex: string;
    solutionIntervals: { start: string; end: string; included: boolean }[];
    roots: number[];
}

// ============ GENERATORE ============

function generateDisequazione(): Inequality {
    // 80% 2 fattori, 20% 3 fattori
    const numFactors = Math.random() < 0.8 ? 2 : 3;

    const factors: Factor[] = [];
    const rootsSet = new Set<number>();

    // Genera fattori distinti
    while (factors.length < numFactors) {
        // Coefficiente diverso da zero
        const coefficient = randomNonZero(-3, 3);

        // Genera radice intera semplice tra -5 e 5
        let root;
        do {
            root = randomInt(-5, 5);
        } while (rootsSet.has(root));

        rootsSet.add(root);

        // Costante: -coefficient * root
        const constant = -coefficient * root;

        factors.push({
            coefficient,
            constant,
            root,
        });
    }

    // Tipo di disequazione
    const inequalityTypes: ("<" | ">" | "≤" | "≥")[] = ["<", ">", "≤", "≥"];
    const inequalityType = randomChoice(inequalityTypes);

    // Ordina radici
    const roots = Array.from(rootsSet).sort((a, b) => a - b);

    // Risolve la disequazione
    const solution = solveProductInequality(factors, inequalityType, roots);

    return {
        factors,
        inequalityType,
        solutionLatex: solution.latex,
        solutionSetLatex: solution.setLatex,
        solutionIntervals: solution.intervals,
        roots,
    };
}

function solveProductInequality(
    factors: Factor[],
    type: "<" | ">" | "≤" | "≥",
    roots: number[]
): {
    latex: string;
    setLatex: string;
    intervals: { start: string; end: string; included: boolean }[]
} {
    const rootsSorted = [...roots].sort((a, b) => a - b);
    const testPoints = [-10, ...rootsSorted, 10];
    const intervals: { start: number; end: number; sign: number }[] = [];

    // Determina il segno in ciascun intervallo
    for (let i = 0; i < testPoints.length - 1; i++) {
        const x = (testPoints[i] + testPoints[i + 1]) / 2; // Punto medio

        // Calcola segno del prodotto
        let productSign = 1;
        for (const factor of factors) {
            const factorSign = factor.coefficient * x + factor.constant > 0 ? 1 : -1;
            productSign *= factorSign;
        }

        intervals.push({
            start: testPoints[i],
            end: testPoints[i + 1],
            sign: productSign,
        });
    }

    // Determina quali intervalli soddisfano la disequazione
    const isStrict = type === "<" || type === ">";
    const wantPositive = type === ">" || type === "≥";

    const solutionIntervals = intervals
        .filter(interval => {
            if (wantPositive) {
                return interval.sign > 0;
            } else {
                return interval.sign < 0;
            }
        })
        .map(interval => {
            // Gestisci intervalli infiniti
            const isStartInfinity = interval.start === -10;
            const isEndInfinity = interval.end === 10;

            let startStr: string;
            let endStr: string;
            let includedStart = false;
            let includedEnd = false;

            if (isStartInfinity) {
                startStr = "-\\infty";
            } else {
                startStr = formatNumberLatex(interval.start);
                // Controlla se il punto iniziale è una radice e se va inclusa
                includedStart = !isStrict && rootsSorted.includes(interval.start);
            }

            if (isEndInfinity) {
                endStr = "+\\infty";
            } else {
                endStr = formatNumberLatex(interval.end);
                // Controlla se il punto finale è una radice e se va inclusa
                includedEnd = !isStrict && rootsSorted.includes(interval.end);
            }

            return {
                start: startStr,
                end: endStr,
                included: isStartInfinity ? false : includedStart,
            };
        });

    // Costruisci la rappresentazione LaTeX
    let latex = "";
    let setLatex = "";

    // Simboli per le disequazioni
    const leqSymbol = isStrict ? "<" : "\\leq";
    const geqSymbol = isStrict ? ">" : "\\geq";

    if (solutionIntervals.length === 0) {
        latex = "\\emptyset";
        setLatex = "\\emptyset";
    } else if (solutionIntervals.length === 1 &&
        solutionIntervals[0].start === "-\\infty" &&
        solutionIntervals[0].end === "+\\infty") {
        latex = "\\forall x \\in \\mathbb{R}";
        setLatex = "\\mathbb{R}";
    } else {
        // Costruisci la soluzione in forma algebrica (x ≤ a ∨ x ≥ b)
        const algebraicParts: string[] = [];

        for (const interval of solutionIntervals) {
            if (interval.start === "-\\infty" && interval.end === "+\\infty") {
                algebraicParts.push("\\forall x \\in \\mathbb{R}");
            } else if (interval.start === "-\\infty") {
                // x ≤ end o x < end
                algebraicParts.push(`x ${leqSymbol} ${interval.end}`);
            } else if (interval.end === "+\\infty") {
                // x ≥ start o x > start
                algebraicParts.push(`x ${geqSymbol} ${interval.start}`);
            } else {
                // start ≤ x ≤ end o start < x < end
                algebraicParts.push(`${interval.start} ${leqSymbol} x ${leqSymbol} ${interval.end}`);
            }
        }

        if (algebraicParts.length === 1) {
            latex = algebraicParts[0];
        } else {
            latex = algebraicParts.join(" \\; \\vee \\; ");
        }

        // Forma insiemistica con intervalli
        const setStrings = solutionIntervals.map(interval => {
            if (interval.start === "-\\infty" && interval.end === "+\\infty") {
                return "\\mathbb{R}";
            }
            const leftBracket = interval.start === "-\\infty" ? "(" : (interval.included ? "[" : "(");
            const rightBracket = interval.end === "+\\infty" ? ")" : (interval.included ? "]" : ")");
            return `${leftBracket}${interval.start}, ${interval.end}${rightBracket}`;
        });

        if (setStrings.length === 1) {
            setLatex = setStrings[0];
        } else {
            setLatex = setStrings.join(" \\cup ");
        }
    }

    return {
        latex,
        setLatex,
        intervals: solutionIntervals,
    };
}

// ============ COMPONENTE GRAFICO DEI SEGNI ============

interface SignChartProps {
    factors: Factor[];
    roots: number[];
    isMobile?: boolean;
}

function SignChart({ factors, roots, isMobile = false }: SignChartProps) {
    const sortedRoots = [...roots].sort((a, b) => a - b);

    // Dimensioni
    const rowHeight = isMobile ? 40 : 50;
    const labelWidth = isMobile ? 110 : 160;
    const regionWidth = isMobile ? 60 : 80;
    const topPadding = 30;
    const bottomPadding = 10;

    const numRegions = sortedRoots.length + 1;
    const chartWidth = labelWidth + numRegions * regionWidth;
    const chartHeight = topPadding + (factors.length + 1) * rowHeight + bottomPadding;

    // Calcola il segno di un fattore in un punto
    const getFactorSign = (factor: Factor, x: number): number => {
        const value = factor.coefficient * x + factor.constant;
        return value > 0 ? 1 : -1;
    };

    // Calcola il segno del prodotto in un punto
    const getProductSign = (x: number): number => {
        let sign = 1;
        for (const factor of factors) {
            sign *= getFactorSign(factor, x);
        }
        return sign;
    };

    // Genera un punto di test per ogni regione
    const getTestPoint = (regionIndex: number): number => {
        if (regionIndex === 0) {
            return sortedRoots[0] - 1;
        } else if (regionIndex === sortedRoots.length) {
            return sortedRoots[sortedRoots.length - 1] + 1;
        } else {
            return (sortedRoots[regionIndex - 1] + sortedRoots[regionIndex]) / 2;
        }
    };

    // Formatta il nome del fattore
    const formatFactorName = (factor: Factor): string => {
        const coeff = factor.coefficient;
        const constant = factor.constant;

        if (coeff === 1) {
            return `x ${constant >= 0 ? '+' : '−'} ${Math.abs(constant)}`;
        } else if (coeff === -1) {
            return `−x ${constant >= 0 ? '+' : '−'} ${Math.abs(constant)}`;
        } else {
            return `${coeff}x ${constant >= 0 ? '+' : '−'} ${Math.abs(constant)}`;
        }
    };

    // Formatta il nome del prodotto come prodotto dei fattori
    const formatProductName = (): string => {
        return factors.map(f => `(${formatFactorName(f)})`).join("");
    };

    const fontSize = isMobile ? 12 : 14;
    const signFontSize = isMobile ? 16 : 20;

    const productY = topPadding + factors.length * rowHeight + rowHeight / 2;
    const verticalLineTop = topPadding;
    const verticalLineBottom = productY + rowHeight / 2 - 10;

    return (
        <svg
            width="100%"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            style={{ maxWidth: chartWidth, display: "block", margin: "0 auto" }}
        >
            {/* Etichette delle radici in alto */}
            {sortedRoots.map((root, i) => (
                <text
                    key={`root-label-${i}`}
                    x={labelWidth + (i + 1) * regionWidth}
                    y={topPadding - 10}
                    textAnchor="middle"
                    fontSize={fontSize}
                    fill="#1e40af"
                    fontWeight="bold"
                >
                    {root}
                </text>
            ))}

            {/* Linee verticali continue */}
            {sortedRoots.map((root, rootIdx) => {
                const xPos = labelWidth + (rootIdx + 1) * regionWidth;
                return (
                    <line
                        key={`vertical-line-${rootIdx}`}
                        x1={xPos}
                        y1={verticalLineTop}
                        x2={xPos}
                        y2={verticalLineBottom}
                        stroke="#64748b"
                        strokeWidth={1.5}
                    />
                );
            })}

            {/* Linea separatrice sopra il prodotto */}
            <line
                x1={labelWidth}
                y1={productY - rowHeight / 2}
                x2={chartWidth - 10}
                y2={productY - rowHeight / 2}
                stroke="#334155"
                strokeWidth={2}
            />

            {/* Righe per ogni fattore */}
            {factors.map((factor, factorIdx) => {
                const y = topPadding + factorIdx * rowHeight + rowHeight / 2;

                return (
                    <g key={`factor-${factorIdx}`}>
                        {/* Etichetta del fattore */}
                        <text
                            x={labelWidth - 10}
                            y={y + 5}
                            textAnchor="end"
                            fontSize={fontSize}
                            fill="#334155"
                        >
                            {formatFactorName(factor)}
                        </text>

                        {/* Cerchi dove il fattore si annulla */}
                        {sortedRoots.map((root, rootIdx) => {
                            const xPos = labelWidth + (rootIdx + 1) * regionWidth;
                            const isZero = Math.abs(factor.root - root) < 0.001;

                            return isZero ? (
                                <circle
                                    key={`zero-${rootIdx}`}
                                    cx={xPos}
                                    cy={y}
                                    r={isMobile ? 6 : 8}
                                    fill="white"
                                    stroke="#1e40af"
                                    strokeWidth={2}
                                />
                            ) : null;
                        })}

                        {/* Segni nelle regioni */}
                        {Array.from({ length: numRegions }).map((_, regionIdx) => {
                            const testPoint = getTestPoint(regionIdx);
                            const sign = getFactorSign(factor, testPoint);
                            const xCenter = labelWidth + regionIdx * regionWidth + regionWidth / 2;

                            return (
                                <text
                                    key={`sign-${regionIdx}`}
                                    x={xCenter}
                                    y={y + 6}
                                    textAnchor="middle"
                                    fontSize={signFontSize}
                                    fill={sign > 0 ? "#16a34a" : "#dc2626"}
                                    fontWeight="bold"
                                >
                                    {sign > 0 ? "+" : "−"}
                                </text>
                            );
                        })}
                    </g>
                );
            })}

            {/* Riga del prodotto */}
            <g>
                {/* Etichetta del prodotto */}
                <text
                    x={labelWidth - 10}
                    y={productY + 5}
                    textAnchor="end"
                    fontSize={isMobile ? 10 : 12}
                    fill="#334155"
                    fontWeight="bold"
                >
                    {formatProductName()}
                </text>

                {/* Cerchi alle radici */}
                {sortedRoots.map((root, rootIdx) => {
                    const xPos = labelWidth + (rootIdx + 1) * regionWidth;
                    return (
                        <circle
                            key={`product-zero-${rootIdx}`}
                            cx={xPos}
                            cy={productY}
                            r={isMobile ? 6 : 8}
                            fill="white"
                            stroke="#334155"
                            strokeWidth={2}
                        />
                    );
                })}

                {/* Segni del prodotto nelle regioni */}
                {Array.from({ length: numRegions }).map((_, regionIdx) => {
                    const testPoint = getTestPoint(regionIdx);
                    const sign = getProductSign(testPoint);
                    const xCenter = labelWidth + regionIdx * regionWidth + regionWidth / 2;

                    return (
                        <text
                            key={`product-sign-${regionIdx}`}
                            x={xCenter}
                            y={productY + 6}
                            textAnchor="middle"
                            fontSize={signFontSize}
                            fill={sign > 0 ? "#16a34a" : "#dc2626"}
                            fontWeight="bold"
                        >
                            {sign > 0 ? "+" : "−"}
                        </text>
                    );
                })}
            </g>
        </svg>
    );
}

// ============ COMPONENTE GRAFICO SOLUZIONE ============

interface SolutionChartProps {
    factors: Factor[];
    roots: number[];
    inequalityType: "<" | ">" | "≤" | "≥";
    isMobile?: boolean;
}

function SolutionChart({ factors, roots, inequalityType, isMobile = false }: SolutionChartProps) {
    const sortedRoots = [...roots].sort((a, b) => a - b);

    // Dimensioni
    const labelWidth = isMobile ? 60 : 80;
    const regionWidth = isMobile ? 60 : 80;
    const chartHeight = isMobile ? 60 : 70;
    const lineY = chartHeight / 2;
    const dashLength = isMobile ? 30 : 40;

    const numRegions = sortedRoots.length + 1;
    const chartWidth = labelWidth + numRegions * regionWidth;

    const fontSize = isMobile ? 12 : 14;
    const isStrict = inequalityType === "<" || inequalityType === ">";
    const wantPositive = inequalityType === ">" || inequalityType === "≥";
    const circleR = isMobile ? 6 : 8;

    // Calcola il segno del prodotto in un punto
    const getProductSign = (x: number): number => {
        let sign = 1;
        for (const factor of factors) {
            const value = factor.coefficient * x + factor.constant;
            sign *= value > 0 ? 1 : -1;
        }
        return sign;
    };

    // Genera un punto di test per ogni regione
    const getTestPoint = (regionIndex: number): number => {
        if (regionIndex === 0) {
            return sortedRoots[0] - 1;
        } else if (regionIndex === sortedRoots.length) {
            return sortedRoots[sortedRoots.length - 1] + 1;
        } else {
            return (sortedRoots[regionIndex - 1] + sortedRoots[regionIndex]) / 2;
        }
    };

    // Determina quali regioni sono soluzioni
    const isSolutionRegion = (regionIndex: number): boolean => {
        const testPoint = getTestPoint(regionIndex);
        const sign = getProductSign(testPoint);
        return wantPositive ? sign > 0 : sign < 0;
    };

    // Costruisci i segmenti della soluzione
    const segments: { xStart: number; xEnd: number; isInfiniteLeft: boolean; isInfiniteRight: boolean }[] = [];

    let currentSegmentStart: number | null = null;
    let currentIsInfiniteLeft = false;

    for (let i = 0; i < numRegions; i++) {
        const isSolution = isSolutionRegion(i);
        const xStart = labelWidth + i * regionWidth;
        const xEnd = labelWidth + (i + 1) * regionWidth;

        if (isSolution) {
            if (currentSegmentStart === null) {
                currentSegmentStart = xStart;
                currentIsInfiniteLeft = i === 0;
            }
        } else {
            if (currentSegmentStart !== null) {
                segments.push({
                    xStart: currentSegmentStart,
                    xEnd: xStart,
                    isInfiniteLeft: currentIsInfiniteLeft,
                    isInfiniteRight: false
                });
                currentSegmentStart = null;
            }
        }
    }

    // Chiudi l'ultimo segmento se necessario
    if (currentSegmentStart !== null) {
        segments.push({
            xStart: currentSegmentStart,
            xEnd: chartWidth - 10,
            isInfiniteLeft: currentIsInfiniteLeft,
            isInfiniteRight: true
        });
    }

    return (
        <svg
            width="100%"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            style={{ maxWidth: chartWidth, display: "block", margin: "0 auto" }}
        >
            {/* Etichetta */}
            <text
                x={labelWidth - 10}
                y={lineY + 5}
                textAnchor="end"
                fontSize={fontSize}
                fill="#334155"
                fontWeight="bold"
            >
                Soluzione
            </text>

            {/* Segmenti della soluzione */}
            {segments.map((seg, idx) => (
                <g key={`segment-${idx}`}>
                    {/* Segmento con infinito su entrambi i lati (tutta la retta) */}
                    {seg.isInfiniteLeft && seg.isInfiniteRight && (
                        <>
                            <line
                                x1={seg.xStart}
                                y1={lineY}
                                x2={seg.xStart + dashLength}
                                y2={lineY}
                                stroke="#16a34a"
                                strokeWidth={4}
                                strokeDasharray="12,6"
                            />
                            <line
                                x1={seg.xStart + dashLength}
                                y1={lineY}
                                x2={seg.xEnd - dashLength}
                                y2={lineY}
                                stroke="#16a34a"
                                strokeWidth={4}
                            />
                            <line
                                x1={seg.xEnd - dashLength}
                                y1={lineY}
                                x2={seg.xEnd}
                                y2={lineY}
                                stroke="#16a34a"
                                strokeWidth={4}
                                strokeDasharray="12,6"
                            />
                        </>
                    )}

                    {/* Segmento con infinito solo a sinistra */}
                    {seg.isInfiniteLeft && !seg.isInfiniteRight && (
                        <>
                            <line
                                x1={seg.xStart}
                                y1={lineY}
                                x2={seg.xStart + dashLength}
                                y2={lineY}
                                stroke="#16a34a"
                                strokeWidth={4}
                                strokeDasharray="12,6"
                            />
                            <line
                                x1={seg.xStart + dashLength}
                                y1={lineY}
                                x2={seg.xEnd}
                                y2={lineY}
                                stroke="#16a34a"
                                strokeWidth={4}
                            />
                        </>
                    )}

                    {/* Segmento con infinito solo a destra */}
                    {!seg.isInfiniteLeft && seg.isInfiniteRight && (
                        <>
                            <line
                                x1={seg.xStart}
                                y1={lineY}
                                x2={seg.xEnd - dashLength}
                                y2={lineY}
                                stroke="#16a34a"
                                strokeWidth={4}
                            />
                            <line
                                x1={seg.xEnd - dashLength}
                                y1={lineY}
                                x2={seg.xEnd}
                                y2={lineY}
                                stroke="#16a34a"
                                strokeWidth={4}
                                strokeDasharray="12,6"
                            />
                        </>
                    )}

                    {/* Segmento finito (senza infiniti) */}
                    {!seg.isInfiniteLeft && !seg.isInfiniteRight && (
                        <line
                            x1={seg.xStart}
                            y1={lineY}
                            x2={seg.xEnd}
                            y2={lineY}
                            stroke="#16a34a"
                            strokeWidth={4}
                        />
                    )}
                </g>
            ))}

            {/* Etichette delle radici e cerchi */}
            {sortedRoots.map((root, i) => {
                const xPos = labelWidth + (i + 1) * regionWidth;
                const isIncluded = !isStrict;

                // Determina se questo punto è un confine della soluzione
                const leftIsSolution = isSolutionRegion(i);
                const rightIsSolution = isSolutionRegion(i + 1);
                const isBoundary = leftIsSolution || rightIsSolution;

                return (
                    <g key={`root-${i}`}>
                        {/* Etichetta del valore */}
                        <text
                            x={xPos}
                            y={lineY - 15}
                            textAnchor="middle"
                            fontSize={fontSize}
                            fill="#1e40af"
                            fontWeight="bold"
                        >
                            {root}
                        </text>

                        {/* Cerchio: pieno se incluso, vuoto se escluso */}
                        {isBoundary && (
                            <circle
                                cx={xPos}
                                cy={lineY}
                                r={circleR}
                                fill={isIncluded ? "#16a34a" : "white"}
                                stroke="#16a34a"
                                strokeWidth={2.5}
                            />
                        )}

                        {/* Linea verticale di riferimento se non è boundary */}
                        {!isBoundary && (
                            <line
                                x1={xPos}
                                y1={lineY - 8}
                                x2={xPos}
                                y2={lineY + 8}
                                stroke="#94a3b8"
                                strokeWidth={1}
                            />
                        )}
                    </g>
                );
            })}
        </svg>
    );
}

// ============ COMPONENTE PRINCIPALE ============

export default function DisequazioniProdottoDemo() {
    const { isMobile, isTablet } = useBreakpoint();

    const [ineq, setIneq] = useState<Inequality>(() => generateDisequazione());
    const { currentStep, nextStep, prevStep, showAll, reset } = useStepNavigation(4);

    // helper robusto (currentStep 0-based, stepNumber 1-based)
    const isActive = (stepNumber: number) => currentStep >= stepNumber - 1;

    const handleGenerate = useCallback(() => {
        setIneq(generateDisequazione());
        reset();
    }, [reset]);

    // Formatta i fattori in LaTeX
    const factorsLatex = useMemo(() => {
        return ineq.factors.map(factor => {
            const coeff = factor.coefficient;
            const constant = factor.constant;

            if (coeff === 1) {
                return `(x ${constant >= 0 ? '+' : ''} ${formatNumberLatex(constant)})`;
            } else if (coeff === -1) {
                return `(-x ${constant >= 0 ? '+' : ''} ${formatNumberLatex(constant)})`;
            } else {
                return `(${formatNumberLatex(coeff)}x ${constant >= 0 ? '+' : ''} ${formatNumberLatex(constant)})`;
            }
        }).join(" \\cdot ");
    }, [ineq.factors]);

    const originalInequality = `${factorsLatex} ${ineq.inequalityType} 0`;

    // Genera LaTeX per lo studio dei fattori separatamente
    const factorsStudyLatex = useMemo(() => {
        let latex = "\\begin{aligned}\n";

        ineq.factors.forEach((factor, index) => {
            const coeff = factor.coefficient;
            const constTerm = factor.constant;

            // Disequazione del fattore > 0
            if (coeff === 1) {
                latex += `& x ${constTerm >= 0 ? '+' : ''} ${formatNumberLatex(constTerm)} > 0 \\\\\n`;
                latex += `& x > ${formatNumberLatex(-constTerm)} \\\\\n`;
            } else if (coeff === -1) {
                latex += `& -x ${constTerm >= 0 ? '+' : ''} ${formatNumberLatex(constTerm)} > 0 \\\\\n`;
                latex += `& -x > ${formatNumberLatex(-constTerm)} \\\\\n`;
                latex += `& x < ${formatNumberLatex(constTerm)} \\\\\n`;
            } else {
                latex += `& ${formatNumberLatex(coeff)}x ${constTerm >= 0 ? '+' : ''} ${formatNumberLatex(constTerm)} > 0 \\\\\n`;

                if (coeff > 0) {
                    latex += `& ${formatNumberLatex(coeff)}x > ${formatNumberLatex(-constTerm)} \\\\\n`;
                    latex += `& x > \\frac{${formatNumberLatex(-constTerm)}}{${formatNumberLatex(coeff)}} \\\\\n`;
                    latex += `& x > ${formatNumberLatex(factor.root)} \\\\\n`;
                } else {
                    latex += `& ${formatNumberLatex(coeff)}x > ${formatNumberLatex(-constTerm)} \\\\\n`;
                    latex += `& x < \\frac{${formatNumberLatex(-constTerm)}}{${formatNumberLatex(coeff)}} \\\\\n`;
                    latex += `& x < ${formatNumberLatex(factor.root)} \\\\\n`;
                }
            }

            if (index < ineq.factors.length - 1) {
                latex += "&\\\\\n"; // Separatore tra fattori
            }
        });

        latex += "\\end{aligned}";
        return latex;
    }, [ineq.factors]);

    // ============ STEP CARDS ============

    const Step1 = (
        <StepCard stepNumber={1} title="Forma fattorizzata" color="green" isActive={isActive(1)}>
            <CollapsibleExplanation title="Spiegazione">
                <div>
                    <p>Le disequazioni prodotto hanno la forma:</p>
                    <Latex>{"(ax + b)(cx + d) \\, \\text{op} \\, 0"}</Latex>
                    <p>dove "op" può essere <Latex>{">"}</Latex>, <Latex>{"<"}</Latex>, <Latex>{"\\geq"}</Latex>, o <Latex>{"\\leq"}</Latex>.</p>
                    <p>Ogni fattore è un binomio di primo grado.</p>
                </div>
            </CollapsibleExplanation>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>Forma della disequazione:</div>
            <div
                style={{
                    fontSize: isMobile ? 16 : 18,
                    padding: "8px 12px",
                    background: "#fff",
                    borderRadius: 6,
                    display: "inline-block",
                }}
            >
                <Latex>{originalInequality}</Latex>
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
                <span>Numero di fattori: {ineq.factors.length} ({ineq.factors.length === 2 ? 'più comune' : 'meno comune'})</span>
            </div>
        </StepCard>
    );

    const Step2 = (
        <StepCard stepNumber={2} title="Studiamo i fattori separatamente" color="blue" isActive={isActive(2)}>
            <CollapsibleExplanation title="Spiegazione">
                <div>
                    <p>Studiamo il segno di ciascun fattore risolvendo la disequazione corrispondente <strong>&gt; 0</strong>:</p>
                    <ul>
                        <li>Se il coefficiente di x è positivo, la soluzione è <Latex>{"x > -\\frac{b}{a}"}</Latex></li>
                        <li>Se il coefficiente di x è negativo, la soluzione è <Latex>{"x < -\\frac{b}{a}"}</Latex></li>
                    </ul>
                    <p>Questo ci permette di determinare dove ciascun fattore è positivo o negativo.</p>
                </div>
            </CollapsibleExplanation>
            <div style={{ padding: "8px 12px", background: "#fff", borderRadius: 6 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Risolviamo ciascun fattore &gt; 0:</div>

                <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.6, overflowX: "auto" }}>
                    <Latex display>{factorsStudyLatex}</Latex>
                </div>

                <div style={{ marginTop: 12, paddingTop: 8, borderTop: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: 13, color: "#64748b" }}>Riassunto:</div>
                    <div style={{ fontSize: 14 }}>
                        {ineq.factors.map((factor, idx) => (
                            <div key={idx} style={{ marginBottom: 4 }}>
                                <Latex>
                                    {`${factorsLatex.split(" \\cdot ")[idx]} > 0 \\quad \\Rightarrow \\quad ${factor.coefficient > 0 ? 'x >' : 'x <'} ${formatNumberLatex(factor.root)}`}
                                </Latex>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </StepCard>
    );

    const Step3 = (
        <StepCard stepNumber={3} title="Schema dei segni" color="amber" isActive={isActive(3)} fullWidth>
            <CollapsibleExplanation title="Spiegazione">
                <div>
                    <p>Costruiamo lo schema dei segni che mostra:</p>
                    <ul>
                        <li>Gli intervalli determinati dalle radici dei fattori</li>
                        <li>Il segno di ciascun fattore in ogni intervallo</li>
                        <li>Il segno del prodotto (applicando la regola dei segni)</li>
                    </ul>
                    <p>I cerchi indicano dove ogni fattore si annulla (vale 0).</p>
                </div>
            </CollapsibleExplanation>

            <div style={{ background: "#fff", borderRadius: 8, padding: 16, marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>Grafico dei segni:</div>
                <SignChart factors={ineq.factors} roots={ineq.roots} isMobile={isMobile} />
            </div>

            <div style={{ background: "#fff", borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Cosa stiamo cercando:</div>
                <div style={{
                    padding: "6px 10px",
                    background: "#f1f5f9",
                    borderRadius: 4,
                    marginBottom: 10
                }}>
                    <Latex>{`${factorsLatex} ${ineq.inequalityType} 0`}</Latex>
                </div>

                <div style={{
                    padding: "8px 12px",
                    background: ineq.inequalityType === ">" || ineq.inequalityType === "≥" ? "#f0fdf4" : "#fef2f2",
                    borderRadius: 6,
                    border: `1px solid ${ineq.inequalityType === ">" || ineq.inequalityType === "≥" ? "#bbf7d0" : "#fecaca"}`
                }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                        {ineq.inequalityType === ">" || ineq.inequalityType === "≥"
                            ? "Cerchiamo intervalli con segno POSITIVO (+)"
                            : "Cerchiamo intervalli con segno NEGATIVO (-)"}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                        {ineq.inequalityType === ">" || ineq.inequalityType === "<"
                            ? "Disequazione stretta: le radici NON sono incluse"
                            : "Disequazione larga: le radici SONO incluse"}
                    </div>
                </div>
            </div>
        </StepCard>
    );

    const Step4 = (
        <StepCard
            stepNumber={4}
            title="Soluzione"
            color="green"
            isActive={isActive(4)}
            fullWidth
        >
            <CollapsibleExplanation title="Spiegazione">
                <div>
                    <p>Dallo schema dei segni, selezioniamo gli intervalli in cui il prodotto ha il segno richiesto:</p>
                    <ul>
                        <li>Per <Latex>{"> 0"}</Latex> o <Latex>{"\\geq 0"}</Latex>: intervalli con segno <Latex>{"+"}</Latex></li>
                        <li>Per <Latex>{"< 0"}</Latex> o <Latex>{"\\leq 0"}</Latex>: intervalli con segno <Latex>{"-"}</Latex></li>
                    </ul>
                    <p>Cerchio pieno = punto incluso, cerchio vuoto = punto escluso.</p>
                </div>
            </CollapsibleExplanation>

            {/* Grafico della soluzione */}
            <div style={{ background: "#fff", borderRadius: 8, padding: 16, marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>Rappresentazione grafica:</div>
                <SolutionChart
                    factors={ineq.factors}
                    roots={ineq.roots}
                    inequalityType={ineq.inequalityType}
                    isMobile={isMobile}
                />
            </div>

            <div
                style={{
                    background: "#f0fdf4",
                    borderRadius: 8,
                    padding: 12,
                    border: "1px solid #bbf7d0"
                }}
            >
                <div
                    style={{
                        fontWeight: 700,
                        marginBottom: 8,
                        color: "#166534",
                        fontSize: isMobile ? 16 : 18,
                    }}
                >
                    Soluzione in forma algebrica
                </div>

                <div
                    style={{
                        fontSize: isMobile ? 16 : 18,
                        padding: "8px 12px",
                        background: "#fff",
                        borderRadius: 6,
                        marginBottom: 12,
                        overflowX: "auto",
                    }}
                >
                    <Latex display>{ineq.solutionLatex}</Latex>
                </div>

                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Notazione intervalli:</div>
                <div
                    style={{
                        fontSize: isMobile ? 14 : 16,
                        padding: "8px 12px",
                        background: "#fff7ed",
                        borderRadius: 6,
                        border: "1px solid #fed7aa",
                        overflowX: "auto",
                    }}
                >
                    <Latex display>{ineq.solutionSetLatex}</Latex>
                </div>

                <div style={{ marginTop: 12, fontSize: 12, color: "#64748b" }}>
                    {ineq.inequalityType === ">" || ineq.inequalityType === "<"
                        ? "Disequazione stretta: estremi esclusi (parentesi tonde)"
                        : "Disequazione larga: estremi inclusi (parentesi quadre)"}
                </div>
            </div>
        </StepCard>
    );

    const MethodContent = (
        <div style={{ fontSize: 13 }}>
            <ol style={{ margin: 0, paddingLeft: 20 }}>
                <li>
                    <strong>Forma fattorizzata</strong>: <Latex>{"(ax+b)(cx+d) \\, \\text{op} \\, 0"}</Latex>
                </li>
                <li>
                    <strong>Studio separato</strong>: risolvi ciascun fattore <Latex>{"> 0"}</Latex>
                </li>
                <li>
                    <strong>Schema dei segni</strong>: costruisci tabella con intervalli e segni
                </li>
                <li>
                    <strong>Regola dei segni</strong>: determina il segno del prodotto
                </li>
                <li>
                    <strong>Soluzione</strong>: seleziona gli intervalli con il segno richiesto
                </li>
            </ol>
            <div style={{ marginTop: 12, padding: 8, background: "#f8fafc", borderRadius: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Regola dei segni:</div>
                <div style={{ fontSize: 11 }}>
                    <Latex>{"+ \\times + = +"}</Latex><br/>
                    <Latex>{"+ \\times - = -"}</Latex><br/>
                    <Latex>{"- \\times + = -"}</Latex><br/>
                    <Latex>{"- \\times - = +"}</Latex>
                </div>
            </div>
        </div>
    );

    // ============ MOBILE ============

    if (isMobile) {
        return (
            <DemoContainer title="Disequazioni Prodotto" description="Risolvi disequazioni prodotto passo dopo passo">
                <div style={{ marginBottom: 12 }}>
                    <GenerateButton text="Nuova" onClick={handleGenerate} />
                </div>

                <ProblemCard label="Risolvi:">
                    <div style={{ textAlign: "center", fontSize: 18 }}>
                        <Latex display>{originalInequality}</Latex>
                    </div>
                </ProblemCard>

                <NavigationButtons
                    currentStep={currentStep}
                    totalSteps={4}
                    onNext={nextStep}
                    onPrev={prevStep}
                    onShowAll={showAll}
                />

                <SwipeableTabs
                    tabs={[
                        {
                            id: "steps",
                            label: "📝 Steps",
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
                            id: "method",
                            label: "💡 Metodo",
                            content: (
                                <CollapsiblePanel title="Metodo di risoluzione" defaultOpen>
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
            <DemoContainer title="Disequazioni Prodotto" description="Risolvi disequazioni prodotto passo dopo passo">
                <div style={{ marginBottom: 16 }}>
                    <GenerateButton text="Nuova disequazione" onClick={handleGenerate} />
                </div>

                <ProblemCard label="Risolvi la disequazione:">
                    <div style={{ textAlign: "center" }}>
                        <Latex display>{originalInequality}</Latex>
                    </div>
                </ProblemCard>

                <NavigationButtons
                    currentStep={currentStep}
                    totalSteps={4}
                    onNext={nextStep}
                    onPrev={prevStep}
                    onShowAll={showAll}
                />

                <ResponsiveGrid columns={{ tablet: 2 }} gap={12}>
                    {Step1}
                    {Step2}
                </ResponsiveGrid>

                <div style={{ marginTop: 12 }}>
                    {Step3}
                </div>

                <div style={{ marginTop: 12 }}>
                    {Step4}
                </div>

                <div style={{ marginTop: 16 }}>
                    <CollapsiblePanel title="💡 Metodo di risoluzione" defaultOpen={false}>
                        {MethodContent}
                    </CollapsiblePanel>
                </div>
            </DemoContainer>
        );
    }

    // ============ DESKTOP ============

    return (
        <DemoContainer title="Disequazioni Prodotto" description="Risolvi disequazioni prodotto passo dopo passo">
            <div style={{ marginBottom: 20 }}>
                <GenerateButton text="Nuova disequazione" onClick={handleGenerate} />
            </div>

            <ProblemCard label="Risolvi la disequazione:">
                <div style={{ textAlign: "center" }}>
                    <Latex display>{originalInequality}</Latex>
                </div>
            </ProblemCard>

            <NavigationButtons
                currentStep={currentStep}
                totalSteps={4}
                onNext={nextStep}
                onPrev={prevStep}
                onShowAll={showAll}
            />

            <ResponsiveGrid columns={{ desktop: 2 }} gap={12}>
                {Step1}
                {Step2}
            </ResponsiveGrid>

            <div style={{ marginTop: 12 }}>{Step3}</div>
            <div style={{ marginTop: 12 }}>{Step4}</div>

            <InfoBox title="Metodo di risoluzione:">{MethodContent}</InfoBox>
        </DemoContainer>
    );
}