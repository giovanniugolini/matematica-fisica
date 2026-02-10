/**
 * DisequazioniProdottoDemo - Versione Responsive
 * Step-by-step: forma fattorizzata → studio fattori → schema segno → soluzione
 * Supporta sia disequazioni prodotto che disequazioni fratte (primo grado)
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

type InequalityMode = "prodotto" | "fratta";

interface Factor {
    coefficient: number; // coefficiente di x
    constant: number;   // termine noto
    root: number;       // punto in cui si annulla
}

interface Inequality {
    mode: InequalityMode;
    numeratorFactors: Factor[];   // fattori al numeratore
    denominatorFactors: Factor[]; // fattori al denominatore (vuoto per prodotto)
    inequalityType: "<" | ">" | "≤" | "≥";
    solutionLatex: string;
    solutionSetLatex: string;
    solutionIntervals: { start: string; end: string; includedStart: boolean; includedEnd: boolean }[];
    roots: number[];           // tutte le radici ordinate
    denominatorRoots: number[]; // radici del denominatore (sempre escluse)
}

// ============ GENERATORE ============

function generateFactor(existingRoots: Set<number>): Factor {
    const coefficient = randomNonZero(-3, 3);
    let root: number;
    do {
        root = randomInt(-5, 5);
    } while (existingRoots.has(root));
    existingRoots.add(root);
    const constant = -coefficient * root;
    return { coefficient, constant, root };
}

function generateDisequazione(): Inequality {
    // 50% prodotto, 50% fratta
    const mode: InequalityMode = Math.random() < 0.5 ? "prodotto" : "fratta";

    const rootsSet = new Set<number>();
    const numeratorFactors: Factor[] = [];
    const denominatorFactors: Factor[] = [];

    if (mode === "prodotto") {
        // 80% 2 fattori, 20% 3 fattori
        const numFactors = Math.random() < 0.8 ? 2 : 3;
        for (let i = 0; i < numFactors; i++) {
            numeratorFactors.push(generateFactor(rootsSet));
        }
    } else {
        // Fratta semplice: sempre 1 fattore al numeratore e 1 al denominatore
        numeratorFactors.push(generateFactor(rootsSet));
        denominatorFactors.push(generateFactor(rootsSet));
    }

    // Tipo di disequazione
    const inequalityTypes: ("<" | ">" | "≤" | "≥")[] = ["<", ">", "≤", "≥"];
    const inequalityType = randomChoice(inequalityTypes);

    // Tutte le radici ordinate
    const allRoots = [...numeratorFactors, ...denominatorFactors]
        .map(f => f.root)
        .sort((a, b) => a - b);

    const denominatorRoots = denominatorFactors.map(f => f.root).sort((a, b) => a - b);

    // Risolve la disequazione
    const allFactors = [...numeratorFactors, ...denominatorFactors];
    const solution = solveInequality(allFactors, inequalityType, allRoots, denominatorRoots);

    return {
        mode,
        numeratorFactors,
        denominatorFactors,
        inequalityType,
        solutionLatex: solution.latex,
        solutionSetLatex: solution.setLatex,
        solutionIntervals: solution.intervals,
        roots: allRoots,
        denominatorRoots,
    };
}

function solveInequality(
    allFactors: Factor[],
    type: "<" | ">" | "≤" | "≥",
    roots: number[],
    denominatorRoots: number[]
): {
    latex: string;
    setLatex: string;
    intervals: { start: string; end: string; includedStart: boolean; includedEnd: boolean }[];
} {
    const rootsSorted = [...roots].sort((a, b) => a - b);
    const uniqueRoots = [...new Set(rootsSorted)];
    const testPoints = [-10, ...uniqueRoots, 10];
    const intervals: { start: number; end: number; sign: number }[] = [];

    // Determina il segno in ciascun intervallo
    for (let i = 0; i < testPoints.length - 1; i++) {
        const x = (testPoints[i] + testPoints[i + 1]) / 2;
        let productSign = 1;
        for (const factor of allFactors) {
            const factorSign = factor.coefficient * x + factor.constant > 0 ? 1 : -1;
            productSign *= factorSign;
        }
        intervals.push({ start: testPoints[i], end: testPoints[i + 1], sign: productSign });
    }

    const isStrict = type === "<" || type === ">";
    const wantPositive = type === ">" || type === "≥";
    const denomRootsSet = new Set(denominatorRoots);

    const solutionIntervals = intervals
        .filter(interval => wantPositive ? interval.sign > 0 : interval.sign < 0)
        .map(interval => {
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
                // Incluso solo se: non stretta, è una radice, e NON è radice del denominatore
                includedStart = !isStrict
                    && uniqueRoots.includes(interval.start)
                    && !denomRootsSet.has(interval.start);
            }

            if (isEndInfinity) {
                endStr = "+\\infty";
            } else {
                endStr = formatNumberLatex(interval.end);
                includedEnd = !isStrict
                    && uniqueRoots.includes(interval.end)
                    && !denomRootsSet.has(interval.end);
            }

            return { start: startStr, end: endStr, includedStart, includedEnd };
        });

    // Costruisci LaTeX
    let latex = "";
    let setLatex = "";

    const leqSymbol = isStrict ? "<" : "\\leq";
    const geqSymbol = isStrict ? ">" : "\\geq";

    if (solutionIntervals.length === 0) {
        latex = "\\emptyset";
        setLatex = "\\emptyset";
    } else if (
        solutionIntervals.length === 1 &&
        solutionIntervals[0].start === "-\\infty" &&
        solutionIntervals[0].end === "+\\infty"
    ) {
        if (denomRootsSet.size > 0) {
            const excluded = [...denomRootsSet].sort((a, b) => a - b)
                .map(r => formatNumberLatex(r)).join(", ");
            latex = `\\forall x \\in \\mathbb{R},\\; x \\neq ${excluded}`;
            setLatex = `\\mathbb{R} \\setminus \\{${excluded}\\}`;
        } else {
            latex = "\\forall x \\in \\mathbb{R}";
            setLatex = "\\mathbb{R}";
        }
    } else {
        const algebraicParts: string[] = [];

        for (const interval of solutionIntervals) {
            if (interval.start === "-\\infty" && interval.end === "+\\infty") {
                algebraicParts.push("\\forall x \\in \\mathbb{R}");
            } else if (interval.start === "-\\infty") {
                const sym = interval.includedEnd ? "\\leq" : "<";
                algebraicParts.push(`x ${sym} ${interval.end}`);
            } else if (interval.end === "+\\infty") {
                const sym = interval.includedStart ? "\\geq" : ">";
                algebraicParts.push(`x ${sym} ${interval.start}`);
            } else {
                const symLeft = interval.includedStart ? "\\leq" : "<";
                const symRight = interval.includedEnd ? "\\leq" : "<";
                algebraicParts.push(`${interval.start} ${symLeft} x ${symRight} ${interval.end}`);
            }
        }

        latex = algebraicParts.length === 1
            ? algebraicParts[0]
            : algebraicParts.join(" \\; \\vee \\; ");

        const setStrings = solutionIntervals.map(interval => {
            if (interval.start === "-\\infty" && interval.end === "+\\infty") {
                return "\\mathbb{R}";
            }
            const leftBracket = interval.start === "-\\infty" || !interval.includedStart ? "(" : "[";
            const rightBracket = interval.end === "+\\infty" || !interval.includedEnd ? ")" : "]";
            return `${leftBracket}${interval.start},\\, ${interval.end}${rightBracket}`;
        });

        setLatex = setStrings.length === 1
            ? setStrings[0]
            : setStrings.join(" \\cup ");
    }

    return { latex, setLatex, intervals: solutionIntervals };
}

// ============ HELPER LATEX ============

function formatFactorLatex(factor: Factor): string {
    const coeff = factor.coefficient;
    const constant = factor.constant;

    // Se la costante è 0, mostra solo il monomio: (x), (-x), (2x)
    if (constant === 0) {
        if (coeff === 1) return "(x)";
        if (coeff === -1) return "(-x)";
        return `(${formatNumberLatex(coeff)}x)`;
    }

    if (coeff === 1) {
        return `(x ${constant >= 0 ? '+' : ''} ${formatNumberLatex(constant)})`;
    } else if (coeff === -1) {
        return `(-x ${constant >= 0 ? '+' : ''} ${formatNumberLatex(constant)})`;
    } else {
        return `(${formatNumberLatex(coeff)}x ${constant >= 0 ? '+' : ''} ${formatNumberLatex(constant)})`;
    }
}

function buildInequalityLatex(ineq: Inequality): string {
    const numLatex = ineq.numeratorFactors.map(formatFactorLatex).join(" \\cdot ");

    if (ineq.mode === "prodotto") {
        return `${numLatex} ${ineq.inequalityType} 0`;
    }

    const denLatex = ineq.denominatorFactors.map(formatFactorLatex).join(" \\cdot ");
    return `\\dfrac{${numLatex}}{${denLatex}} ${ineq.inequalityType} 0`;
}

// ============ COMPONENTE GRAFICO DEI SEGNI ============

interface SignChartProps {
    numeratorFactors: Factor[];
    denominatorFactors: Factor[];
    roots: number[];
    denominatorRoots: number[];
    isMobile?: boolean;
}

function SignChart({ numeratorFactors, denominatorFactors, roots, denominatorRoots, isMobile = false }: SignChartProps) {
    const allFactors = [...numeratorFactors, ...denominatorFactors];
    const sortedRoots = [...new Set(roots)].sort((a, b) => a - b);
    const denomRootsSet = new Set(denominatorRoots);
    const hasDenominator = denominatorFactors.length > 0;

    // Dimensioni
    const rowHeight = isMobile ? 40 : 50;
    const labelWidth = isMobile ? 110 : 160;
    const regionWidth = isMobile ? 60 : 80;
    const topPadding = 30;
    const bottomPadding = 10;

    const numRegions = sortedRoots.length + 1;
    const chartWidth = labelWidth + numRegions * regionWidth;

    // Righe: numeratore factors + (separatore N) + denominatore factors + (separatore D) + prodotto/quoziente
    const numRows = allFactors.length + (hasDenominator ? 1 : 0); // +1 per la riga risultato (N/D o prodotto)
    // Calcoliamo le posizioni delle righe
    // Per la fratta: num factors | linea separatrice num | den factors | linea separatrice | risultato
    // Per il prodotto: factors | linea separatrice | risultato

    let totalRows: number;
    if (hasDenominator) {
        // numFactors righe + separatore "N" + denFactors righe + separatore + riga risultato
        totalRows = numeratorFactors.length + denominatorFactors.length + 1;
    } else {
        totalRows = allFactors.length + 1;
    }

    const chartHeight = topPadding + totalRows * rowHeight + bottomPadding;

    const getFactorSign = (factor: Factor, x: number): number => {
        const value = factor.coefficient * x + factor.constant;
        return value > 0 ? 1 : -1;
    };

    const getProductSign = (x: number): number => {
        let sign = 1;
        for (const factor of allFactors) {
            sign *= getFactorSign(factor, x);
        }
        return sign;
    };

    const getTestPoint = (regionIndex: number): number => {
        if (regionIndex === 0) return sortedRoots[0] - 1;
        if (regionIndex === sortedRoots.length) return sortedRoots[sortedRoots.length - 1] + 1;
        return (sortedRoots[regionIndex - 1] + sortedRoots[regionIndex]) / 2;
    };

    const formatFactorName = (factor: Factor): string => {
        const coeff = factor.coefficient;
        const constant = factor.constant;
        if (constant === 0) {
            if (coeff === 1) return "x";
            if (coeff === -1) return "−x";
            return `${coeff}x`;
        }
        if (coeff === 1) return `x ${constant >= 0 ? '+' : '−'} ${Math.abs(constant)}`;
        if (coeff === -1) return `−x ${constant >= 0 ? '+' : '−'} ${Math.abs(constant)}`;
        return `${coeff}x ${constant >= 0 ? '+' : '−'} ${Math.abs(constant)}`;
    };

    const fontSize = isMobile ? 12 : 14;
    const signFontSize = isMobile ? 16 : 20;

    // Calcola la posizione Y della riga del risultato
    const resultRowIndex = hasDenominator
        ? numeratorFactors.length + denominatorFactors.length
        : allFactors.length;
    const resultY = topPadding + resultRowIndex * rowHeight + rowHeight / 2;

    // Posizioni separatori
    const numDenSeparatorY = hasDenominator
        ? topPadding + numeratorFactors.length * rowHeight
        : -1;

    const resultSeparatorY = resultY - rowHeight / 2;

    const verticalLineTop = topPadding;
    const verticalLineBottom = resultY + rowHeight / 2 - 10;

    // Helper per renderizzare una riga di fattore
    const renderFactorRow = (factor: Factor, rowIndex: number, isDenominator: boolean) => {
        const y = topPadding + rowIndex * rowHeight + rowHeight / 2;

        return (
            <g key={`factor-${rowIndex}`}>
                <text
                    x={labelWidth - 10}
                    y={y + 5}
                    textAnchor="end"
                    fontSize={fontSize}
                    fill={isDenominator ? "#7c3aed" : "#334155"}
                >
                    {formatFactorName(factor)}
                </text>

                {/* Cerchi/simboli dove il fattore si annulla */}
                {sortedRoots.map((root, rootIdx) => {
                    const xPos = labelWidth + (rootIdx + 1) * regionWidth;
                    const isZero = Math.abs(factor.root - root) < 0.001;

                    if (!isZero) return null;

                    return (
                        <g key={`zero-${rootIdx}`}>
                            <circle
                                cx={xPos}
                                cy={y}
                                r={isMobile ? 6 : 8}
                                fill="white"
                                stroke={isDenominator ? "#7c3aed" : "#1e40af"}
                                strokeWidth={2}
                            />
                            {/* Per fattori del denominatore, mostra 0 barrato */}
                            {isDenominator && (
                                <text
                                    x={xPos}
                                    y={y + 4}
                                    textAnchor="middle"
                                    fontSize={isMobile ? 9 : 11}
                                    fill="#7c3aed"
                                    fontWeight="bold"
                                >
                                    0
                                </text>
                            )}
                        </g>
                    );
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
    };

    // Label del risultato
    const resultLabel = hasDenominator ? "N / D" : (() => {
        const parts = allFactors.map(f => `(${formatFactorName(f)})`);
        return parts.join("");
    })();

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
                    fill={denomRootsSet.has(root) ? "#7c3aed" : "#1e40af"}
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
                        stroke={denomRootsSet.has(root) ? "#7c3aed" : "#64748b"}
                        strokeWidth={1.5}
                        strokeDasharray={denomRootsSet.has(root) ? "4,3" : undefined}
                    />
                );
            })}

            {/* Etichetta sezione N se fratta */}
            {hasDenominator && (
                <text
                    x={8}
                    y={topPadding + (numeratorFactors.length * rowHeight) / 2}
                    fontSize={isMobile ? 10 : 12}
                    fill="#64748b"
                    fontWeight="bold"
                    dominantBaseline="middle"
                >
                    N
                </text>
            )}

            {/* Righe numeratore */}
            {numeratorFactors.map((factor, idx) => renderFactorRow(factor, idx, false))}

            {/* Separatore tra numeratore e denominatore se fratta */}
            {hasDenominator && (
                <line
                    x1={labelWidth}
                    y1={numDenSeparatorY}
                    x2={chartWidth - 10}
                    y2={numDenSeparatorY}
                    stroke="#94a3b8"
                    strokeWidth={1}
                    strokeDasharray="6,4"
                />
            )}

            {/* Etichetta sezione D se fratta */}
            {hasDenominator && (
                <text
                    x={8}
                    y={numDenSeparatorY + (denominatorFactors.length * rowHeight) / 2}
                    fontSize={isMobile ? 10 : 12}
                    fill="#7c3aed"
                    fontWeight="bold"
                    dominantBaseline="middle"
                >
                    D
                </text>
            )}

            {/* Righe denominatore */}
            {denominatorFactors.map((factor, idx) =>
                renderFactorRow(factor, numeratorFactors.length + idx, true)
            )}

            {/* Linea separatrice sopra il risultato */}
            <line
                x1={labelWidth}
                y1={resultSeparatorY}
                x2={chartWidth - 10}
                y2={resultSeparatorY}
                stroke="#334155"
                strokeWidth={2}
            />

            {/* Riga del risultato */}
            <g>
                <text
                    x={labelWidth - 10}
                    y={resultY + 5}
                    textAnchor="end"
                    fontSize={isMobile ? 10 : 12}
                    fill="#334155"
                    fontWeight="bold"
                >
                    {resultLabel}
                </text>

                {/* Simboli alle radici nella riga risultato */}
                {sortedRoots.map((root, rootIdx) => {
                    const xPos = labelWidth + (rootIdx + 1) * regionWidth;
                    const isDenomRoot = denomRootsSet.has(root);

                    if (isDenomRoot) {
                        // Simbolo ∄ (non esiste) per radici del denominatore
                        return (
                            <g key={`result-root-${rootIdx}`}>
                                {/* Sfondo */}
                                <rect
                                    x={xPos - (isMobile ? 9 : 11)}
                                    y={resultY - (isMobile ? 9 : 11)}
                                    width={isMobile ? 18 : 22}
                                    height={isMobile ? 18 : 22}
                                    rx={3}
                                    fill="#faf5ff"
                                    stroke="#7c3aed"
                                    strokeWidth={1.5}
                                />
                                <text
                                    x={xPos}
                                    y={resultY + (isMobile ? 5 : 5)}
                                    textAnchor="middle"
                                    fontSize={isMobile ? 13 : 16}
                                    fill="#7c3aed"
                                    fontWeight="bold"
                                >
                                    ∄
                                </text>
                            </g>
                        );
                    }

                    // Cerchio normale per radici del numeratore
                    return (
                        <circle
                            key={`result-root-${rootIdx}`}
                            cx={xPos}
                            cy={resultY}
                            r={isMobile ? 6 : 8}
                            fill="white"
                            stroke="#334155"
                            strokeWidth={2}
                        />
                    );
                })}

                {/* Segni del risultato nelle regioni */}
                {Array.from({ length: numRegions }).map((_, regionIdx) => {
                    const testPoint = getTestPoint(regionIdx);
                    const sign = getProductSign(testPoint);
                    const xCenter = labelWidth + regionIdx * regionWidth + regionWidth / 2;

                    return (
                        <text
                            key={`result-sign-${regionIdx}`}
                            x={xCenter}
                            y={resultY + 6}
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
    numeratorFactors: Factor[];
    denominatorFactors: Factor[];
    roots: number[];
    denominatorRoots: number[];
    inequalityType: "<" | ">" | "≤" | "≥";
    isMobile?: boolean;
}

function SolutionChart({
                           numeratorFactors,
                           denominatorFactors,
                           roots,
                           denominatorRoots,
                           inequalityType,
                           isMobile = false,
                       }: SolutionChartProps) {
    const allFactors = [...numeratorFactors, ...denominatorFactors];
    const sortedRoots = [...new Set(roots)].sort((a, b) => a - b);
    const denomRootsSet = new Set(denominatorRoots);

    const labelWidth = isMobile ? 60 : 80;
    const regionWidth = isMobile ? 60 : 80;
    const chartHeight = isMobile ? 60 : 70;
    const lineY = chartHeight / 2;
    const dashLength = isMobile ? 30 : 40;

    const numRegions = sortedRoots.length + 1;
    const chartWidth = labelWidth + numRegions * regionWidth;

    const fontSize = isMobile ? 12 : 14;
    const isStrict = inequalityType === "<" || inequalityType === ">";
    const circleR = isMobile ? 6 : 8;

    const wantPositive = inequalityType === ">" || inequalityType === "≥";

    const getProductSign = (x: number): number => {
        let sign = 1;
        for (const factor of allFactors) {
            sign *= (factor.coefficient * x + factor.constant) > 0 ? 1 : -1;
        }
        return sign;
    };

    const getTestPoint = (regionIndex: number): number => {
        if (regionIndex === 0) return sortedRoots[0] - 1;
        if (regionIndex === sortedRoots.length) return sortedRoots[sortedRoots.length - 1] + 1;
        return (sortedRoots[regionIndex - 1] + sortedRoots[regionIndex]) / 2;
    };

    const isSolutionRegion = (regionIndex: number): boolean => {
        const sign = getProductSign(getTestPoint(regionIndex));
        return wantPositive ? sign > 0 : sign < 0;
    };

    // Segmenti soluzione
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
                segments.push({ xStart: currentSegmentStart, xEnd: xStart, isInfiniteLeft: currentIsInfiniteLeft, isInfiniteRight: false });
                currentSegmentStart = null;
            }
        }
    }
    if (currentSegmentStart !== null) {
        segments.push({ xStart: currentSegmentStart, xEnd: chartWidth - 10, isInfiniteLeft: currentIsInfiniteLeft, isInfiniteRight: true });
    }

    return (
        <svg
            width="100%"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            style={{ maxWidth: chartWidth, display: "block", margin: "0 auto" }}
        >
            <text x={labelWidth - 10} y={lineY + 5} textAnchor="end" fontSize={fontSize} fill="#334155" fontWeight="bold">
                Soluzione
            </text>

            {/* Segmenti */}
            {segments.map((seg, idx) => (
                <g key={`segment-${idx}`}>
                    {seg.isInfiniteLeft && seg.isInfiniteRight && (
                        <>
                            <line x1={seg.xStart} y1={lineY} x2={seg.xStart + dashLength} y2={lineY} stroke="#16a34a" strokeWidth={4} strokeDasharray="12,6" />
                            <line x1={seg.xStart + dashLength} y1={lineY} x2={seg.xEnd - dashLength} y2={lineY} stroke="#16a34a" strokeWidth={4} />
                            <line x1={seg.xEnd - dashLength} y1={lineY} x2={seg.xEnd} y2={lineY} stroke="#16a34a" strokeWidth={4} strokeDasharray="12,6" />
                        </>
                    )}
                    {seg.isInfiniteLeft && !seg.isInfiniteRight && (
                        <>
                            <line x1={seg.xStart} y1={lineY} x2={seg.xStart + dashLength} y2={lineY} stroke="#16a34a" strokeWidth={4} strokeDasharray="12,6" />
                            <line x1={seg.xStart + dashLength} y1={lineY} x2={seg.xEnd} y2={lineY} stroke="#16a34a" strokeWidth={4} />
                        </>
                    )}
                    {!seg.isInfiniteLeft && seg.isInfiniteRight && (
                        <>
                            <line x1={seg.xStart} y1={lineY} x2={seg.xEnd - dashLength} y2={lineY} stroke="#16a34a" strokeWidth={4} />
                            <line x1={seg.xEnd - dashLength} y1={lineY} x2={seg.xEnd} y2={lineY} stroke="#16a34a" strokeWidth={4} strokeDasharray="12,6" />
                        </>
                    )}
                    {!seg.isInfiniteLeft && !seg.isInfiniteRight && (
                        <line x1={seg.xStart} y1={lineY} x2={seg.xEnd} y2={lineY} stroke="#16a34a" strokeWidth={4} />
                    )}
                </g>
            ))}

            {/* Radici e cerchi */}
            {sortedRoots.map((root, i) => {
                const xPos = labelWidth + (i + 1) * regionWidth;
                const isDenomRoot = denomRootsSet.has(root);

                const leftIsSolution = isSolutionRegion(i);
                const rightIsSolution = isSolutionRegion(i + 1);
                const isBoundary = leftIsSolution || rightIsSolution;

                // Radici del denominatore: sempre escluse (cerchio vuoto con ∄)
                // Radici del numeratore: incluse solo se disequazione larga
                const isIncluded = !isDenomRoot && !isStrict;

                return (
                    <g key={`root-${i}`}>
                        <text
                            x={xPos}
                            y={lineY - 15}
                            textAnchor="middle"
                            fontSize={fontSize}
                            fill={isDenomRoot ? "#7c3aed" : "#1e40af"}
                            fontWeight="bold"
                        >
                            {root}
                        </text>

                        {isBoundary && !isDenomRoot && (
                            <circle
                                cx={xPos}
                                cy={lineY}
                                r={circleR}
                                fill={isIncluded ? "#16a34a" : "white"}
                                stroke="#16a34a"
                                strokeWidth={2.5}
                            />
                        )}

                        {isBoundary && isDenomRoot && (
                            <g>
                                <circle
                                    cx={xPos}
                                    cy={lineY}
                                    r={circleR}
                                    fill="white"
                                    stroke="#7c3aed"
                                    strokeWidth={2.5}
                                />
                                {/* Barra diagonale per indicare esclusione */}
                                <line
                                    x1={xPos - circleR + 1}
                                    y1={lineY + circleR - 1}
                                    x2={xPos + circleR - 1}
                                    y2={lineY - circleR + 1}
                                    stroke="#7c3aed"
                                    strokeWidth={2}
                                />
                            </g>
                        )}

                        {!isBoundary && (
                            <line x1={xPos} y1={lineY - 8} x2={xPos} y2={lineY + 8} stroke="#94a3b8" strokeWidth={1} />
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

    const isActive = (stepNumber: number) => currentStep >= stepNumber - 1;

    const handleGenerate = useCallback(() => {
        setIneq(generateDisequazione());
        reset();
    }, [reset]);

    const originalInequality = useMemo(() => buildInequalityLatex(ineq), [ineq]);

    // LaTeX per studio fattori
    const factorsStudyLatex = useMemo(() => {
        const allFactors = [...ineq.numeratorFactors, ...ineq.denominatorFactors];
        let latex = "\\begin{aligned}\n";

        allFactors.forEach((factor, index) => {
            const coeff = factor.coefficient;
            const constTerm = factor.constant;
            const isDenom = index >= ineq.numeratorFactors.length;
            const label = isDenom ? "\\;(\\text{D})" : "";

            // Formatta "ax + b > 0" gestendo b=0
            const fmtPoly = (c: number, k: number) => {
                if (k === 0) {
                    if (c === 1) return "x";
                    if (c === -1) return "-x";
                    return `${formatNumberLatex(c)}x`;
                }
                const cStr = c === 1 ? "x" : c === -1 ? "-x" : `${formatNumberLatex(c)}x`;
                return `${cStr} ${k >= 0 ? '+' : ''} ${formatNumberLatex(k)}`;
            };

            if (coeff === 1) {
                latex += `& ${fmtPoly(1, constTerm)} > 0 ${label}\\\\\n`;
                latex += `& x > ${formatNumberLatex(-constTerm)} \\\\\n`;
            } else if (coeff === -1) {
                latex += `& ${fmtPoly(-1, constTerm)} > 0 ${label}\\\\\n`;
                latex += `& -x > ${formatNumberLatex(-constTerm)} \\\\\n`;
                latex += `& x < ${formatNumberLatex(constTerm)} \\\\\n`;
            } else {
                latex += `& ${fmtPoly(coeff, constTerm)} > 0 ${label}\\\\\n`;
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

            if (index < allFactors.length - 1) {
                latex += "&\\\\\n";
            }
        });

        latex += "\\end{aligned}";
        return latex;
    }, [ineq]);

    // Riassunto per step 2
    const allFactorsForSummary = useMemo(
        () => [...ineq.numeratorFactors, ...ineq.denominatorFactors],
        [ineq]
    );

    // ============ STEP CARDS ============

    const Step1 = (
        <StepCard stepNumber={1} title={ineq.mode === "fratta" ? "Forma della disequazione fratta" : "Forma fattorizzata"} color="green" isActive={isActive(1)}>
            <CollapsibleExplanation title="Spiegazione">
                <div>
                    {ineq.mode === "prodotto" ? (
                        <>
                            <p>Le disequazioni prodotto hanno la forma:</p>
                            <Latex>{"(ax + b)(cx + d) \\, \\text{op} \\, 0"}</Latex>
                            <p>dove "op" può essere <Latex>{">"}</Latex>, <Latex>{"<"}</Latex>, <Latex>{"\\geq"}</Latex>, o <Latex>{"\\leq"}</Latex>.</p>
                        </>
                    ) : (
                        <>
                            <p>Le disequazioni fratte hanno la forma:</p>
                            <Latex>{"\\dfrac{N(x)}{D(x)} \\, \\text{op} \\, 0"}</Latex>
                            <p>Il procedimento è analogo alle disequazioni prodotto, ma gli zeri del denominatore sono <strong>sempre esclusi</strong> dalla soluzione (il denominatore non può mai valere zero).</p>
                        </>
                    )}
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
                <Latex display>{originalInequality}</Latex>
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
                {ineq.mode === "prodotto" ? (
                    <span>Tipo: prodotto • Fattori: {ineq.numeratorFactors.length}</span>
                ) : (
                    <span>Tipo: fratta • 1 fattore al numeratore, 1 al denominatore</span>
                )}
            </div>
            {ineq.mode === "fratta" && (
                <div style={{
                    marginTop: 8,
                    padding: "6px 10px",
                    background: "#faf5ff",
                    borderRadius: 4,
                    border: "1px solid #e9d5ff",
                    fontSize: 12,
                    color: "#7c3aed"
                }}>
                    ⚠️ Condizione di esistenza: il denominatore non può essere zero
                </div>
            )}
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
                    {ineq.mode === "fratta" && (
                        <p>I fattori del <strong style={{ color: "#7c3aed" }}>denominatore (D)</strong> sono evidenziati. Le loro radici saranno sempre escluse dalla soluzione.</p>
                    )}
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
                        {allFactorsForSummary.map((factor, idx) => {
                            const isDenom = idx >= ineq.numeratorFactors.length;
                            const factorLatex = formatFactorLatex(factor);
                            return (
                                <div key={idx} style={{
                                    marginBottom: 4,
                                    color: isDenom ? "#7c3aed" : undefined,
                                }}>
                                    <Latex>
                                        {`${factorLatex} > 0 \\quad \\Rightarrow \\quad ${factor.coefficient > 0 ? 'x >' : 'x <'} ${formatNumberLatex(factor.root)}`}
                                    </Latex>
                                    {isDenom && <span style={{ fontSize: 11, marginLeft: 6 }}>(D)</span>}
                                </div>
                            );
                        })}
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
                        <li>Il segno del {ineq.mode === "fratta" ? "quoziente" : "prodotto"} (applicando la regola dei segni)</li>
                    </ul>
                    {ineq.mode === "fratta" && (
                        <p>Il simbolo <strong style={{ color: "#7c3aed" }}>∄</strong> indica i punti in cui il denominatore si annulla e il quoziente <strong>non esiste</strong>.</p>
                    )}
                </div>
            </CollapsibleExplanation>

            <div style={{ background: "#fff", borderRadius: 8, padding: 16, marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>Grafico dei segni:</div>
                <SignChart
                    numeratorFactors={ineq.numeratorFactors}
                    denominatorFactors={ineq.denominatorFactors}
                    roots={ineq.roots}
                    denominatorRoots={ineq.denominatorRoots}
                    isMobile={isMobile}
                />
            </div>

            <div style={{ background: "#fff", borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Cosa stiamo cercando:</div>
                <div style={{
                    padding: "6px 10px",
                    background: "#f1f5f9",
                    borderRadius: 4,
                    marginBottom: 10
                }}>
                    <Latex display>{originalInequality}</Latex>
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
                            : "Disequazione larga: le radici del numeratore sono incluse"}
                    </div>
                    {ineq.mode === "fratta" && (
                        <div style={{ fontSize: 12, color: "#7c3aed", marginTop: 4, fontWeight: 600 }}>
                            ⚠️ Le radici del denominatore sono SEMPRE escluse
                        </div>
                    )}
                </div>
            </div>
        </StepCard>
    );

    const Step4 = (
        <StepCard stepNumber={4} title="Soluzione" color="green" isActive={isActive(4)} fullWidth>
            <CollapsibleExplanation title="Spiegazione">
                <div>
                    <p>Dallo schema dei segni, selezioniamo gli intervalli in cui il {ineq.mode === "fratta" ? "quoziente" : "prodotto"} ha il segno richiesto:</p>
                    <ul>
                        <li>Per <Latex>{"> 0"}</Latex> o <Latex>{"\\geq 0"}</Latex>: intervalli con segno <Latex>{"+"}</Latex></li>
                        <li>Per <Latex>{"< 0"}</Latex> o <Latex>{"\\leq 0"}</Latex>: intervalli con segno <Latex>{"-"}</Latex></li>
                    </ul>
                    <p>Cerchio pieno = punto incluso, cerchio vuoto = punto escluso.</p>
                    {ineq.mode === "fratta" && (
                        <p>Il cerchio barrato <span style={{ color: "#7c3aed" }}>⊘</span> indica un punto dove la funzione non esiste (denominatore = 0), sempre escluso.</p>
                    )}
                </div>
            </CollapsibleExplanation>

            <div style={{ background: "#fff", borderRadius: 8, padding: 16, marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>Rappresentazione grafica:</div>
                <SolutionChart
                    numeratorFactors={ineq.numeratorFactors}
                    denominatorFactors={ineq.denominatorFactors}
                    roots={ineq.roots}
                    denominatorRoots={ineq.denominatorRoots}
                    inequalityType={ineq.inequalityType}
                    isMobile={isMobile}
                />
            </div>

            <div style={{
                background: "#f0fdf4",
                borderRadius: 8,
                padding: 12,
                border: "1px solid #bbf7d0"
            }}>
                <div style={{
                    fontWeight: 700,
                    marginBottom: 8,
                    color: "#166534",
                    fontSize: isMobile ? 16 : 18,
                }}>
                    Soluzione in forma algebrica
                </div>
                <div style={{
                    fontSize: isMobile ? 16 : 18,
                    padding: "8px 12px",
                    background: "#fff",
                    borderRadius: 6,
                    marginBottom: 12,
                    overflowX: "auto",
                }}>
                    <Latex display>{ineq.solutionLatex}</Latex>
                </div>

                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Notazione intervalli:</div>
                <div style={{
                    fontSize: isMobile ? 14 : 16,
                    padding: "8px 12px",
                    background: "#fff7ed",
                    borderRadius: 6,
                    border: "1px solid #fed7aa",
                    overflowX: "auto",
                }}>
                    <Latex display>{ineq.solutionSetLatex}</Latex>
                </div>

                <div style={{ marginTop: 12, fontSize: 12, color: "#64748b" }}>
                    {ineq.mode === "fratta" ? (
                        ineq.inequalityType === ">" || ineq.inequalityType === "<"
                            ? "Disequazione stretta: tutti gli estremi sono esclusi (parentesi tonde)"
                            : "Disequazione larga: le radici del numeratore sono incluse (parentesi quadre), le radici del denominatore sono sempre escluse (parentesi tonde)"
                    ) : (
                        ineq.inequalityType === ">" || ineq.inequalityType === "<"
                            ? "Disequazione stretta: estremi esclusi (parentesi tonde)"
                            : "Disequazione larga: estremi inclusi (parentesi quadre)"
                    )}
                </div>
            </div>
        </StepCard>
    );

    const MethodContent = (
        <div style={{ fontSize: 13 }}>
            <ol style={{ margin: 0, paddingLeft: 20 }}>
                <li>
                    <strong>Forma fattorizzata</strong>: {ineq.mode === "fratta"
                    ? <Latex>{"\\frac{N(x)}{D(x)} \\, \\text{op} \\, 0"}</Latex>
                    : <Latex>{"(ax+b)(cx+d) \\, \\text{op} \\, 0"}</Latex>}
                </li>
                <li>
                    <strong>Studio separato</strong>: risolvi ciascun fattore <Latex>{"> 0"}</Latex>
                </li>
                <li>
                    <strong>Schema dei segni</strong>: costruisci tabella con intervalli e segni
                </li>
                <li>
                    <strong>Regola dei segni</strong>: determina il segno del {ineq.mode === "fratta" ? "quoziente" : "prodotto"}
                </li>
                <li>
                    <strong>Soluzione</strong>: seleziona gli intervalli con il segno richiesto
                </li>
            </ol>
            <div style={{ marginTop: 12, padding: 8, background: "#f8fafc", borderRadius: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Regola dei segni:</div>
                <div style={{ fontSize: 11 }}>
                    <Latex>{"+ \\times + = +"}</Latex><br />
                    <Latex>{"+ \\times - = -"}</Latex><br />
                    <Latex>{"- \\times + = -"}</Latex><br />
                    <Latex>{"- \\times - = +"}</Latex>
                </div>
            </div>
            {ineq.mode === "fratta" && (
                <div style={{ marginTop: 12, padding: 8, background: "#faf5ff", borderRadius: 4, border: "1px solid #e9d5ff" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, color: "#7c3aed" }}>Nota per le disequazioni fratte:</div>
                    <div style={{ fontSize: 11 }}>
                        La regola dei segni per il quoziente è la stessa del prodotto.<br />
                        Gli zeri del denominatore sono <strong>sempre esclusi</strong> dalla soluzione,<br />
                        anche nelle disequazioni con ≤ o ≥.
                    </div>
                </div>
            )}
        </div>
    );

    // ============ MOBILE ============

    if (isMobile) {
        return (
            <DemoContainer
                title="Disequazioni Prodotto e disequazioni fratte"
                description="Risolvi disequazioni passo dopo passo"
            >
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
            <DemoContainer
                title="Disequazioni Prodotto e disequazioni fratte"
                description="Risolvi disequazioni passo dopo passo"
            >
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

                <div style={{ marginTop: 12 }}>{Step3}</div>
                <div style={{ marginTop: 12 }}>{Step4}</div>

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
        <DemoContainer
            title="Disequazioni Prodotto e disequazioni fratte"
            description="Risolvi disequazioni passo dopo passo"
        >
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