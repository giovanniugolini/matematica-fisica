import React, { useState, useMemo, useCallback } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

// ============ COMPONENTE LATEX ============

function Latex({ children, display = false }: { children: string; display?: boolean }) {
    const html = useMemo(() => {
        try {
            return katex.renderToString(children, {
                throwOnError: false,
                displayMode: display,
            });
        } catch (e) {
            return children;
        }
    }, [children, display]);

    return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

// ============ TIPI ============

type InequalitySign = "<" | ">" | "<=" | ">=";

type SolutionType = "two-roots" | "one-root" | "no-roots";

type DisequazioneDef = {
    // Coefficienti originali (forma non normale)
    originalLeft: { a: number; b: number; c: number };
    originalRight: { a: number; b: number; c: number };
    sign: InequalitySign;

    // Forma normale ax² + bx + c <> 0
    a: number;
    b: number;
    c: number;

    // Equazione associata
    delta: number;
    solutionType: SolutionType;
    x1?: number;
    x2?: number;

    // Soluzioni della disequazione
    solutionIntervals: string;
    solutionSet: string;
};

// ============ UTILITÀ ============

function randomInt(min: number, max: number): number {
    return min + Math.floor(Math.random() * (max - min + 1));
}

function randomNonZero(min: number, max: number): number {
    let n = 0;
    while (n === 0) {
        n = randomInt(min, max);
    }
    return n;
}

function gcd(a: number, b: number): number {
    a = Math.abs(Math.round(a * 1000));
    b = Math.abs(Math.round(b * 1000));
    while (b) {
        const t = b;
        b = a % b;
        a = t;
    }
    return a;
}

function formatFractionLatex(num: number, den: number): string {
    if (den === 0) return "\\text{indefinito}";
    if (num === 0) return "0";

    const sign = (num < 0) !== (den < 0) ? -1 : 1;
    num = Math.abs(num);
    den = Math.abs(den);
    const divisor = gcd(num, den);
    const simplifiedNum = Math.round(num * 1000 / divisor) / 1000;
    const simplifiedDen = Math.round(den * 1000 / divisor) / 1000;

    if (simplifiedDen === 1) {
        return (sign * simplifiedNum).toString();
    }

    const signStr = sign < 0 ? "-" : "";
    return `${signStr}\\frac{${simplifiedNum}}{${simplifiedDen}}`;
}

function formatNumberLatex(n: number): string {
    if (Number.isInteger(n)) return n.toString();

    // Prova a trovare una frazione semplice
    for (let den = 2; den <= 12; den++) {
        const num = n * den;
        if (Math.abs(num - Math.round(num)) < 0.0001) {
            return formatFractionLatex(Math.round(num), den);
        }
    }

    return n.toFixed(2).replace(/\.?0+$/, "");
}

function formatQuadraticLatex(a: number, b: number, c: number): string {
    let result = "";

    // Termine quadratico
    if (a === 1) result = "x^2";
    else if (a === -1) result = "-x^2";
    else result = `${a}x^2`;

    // Termine lineare
    if (b > 0) {
        result += b === 1 ? " + x" : ` + ${b}x`;
    } else if (b < 0) {
        result += b === -1 ? " - x" : ` - ${Math.abs(b)}x`;
    }

    // Termine noto
    if (c > 0) result += ` + ${c}`;
    else if (c < 0) result += ` - ${Math.abs(c)}`;

    return result;
}

function signToLatex(sign: InequalitySign): string {
    switch (sign) {
        case "<": return "<";
        case ">": return ">";
        case "<=": return "\\leq";
        case ">=": return "\\geq";
    }
}

function signToText(sign: InequalitySign): string {
    switch (sign) {
        case "<": return "minore di zero";
        case ">": return "maggiore di zero";
        case "<=": return "minore o uguale a zero";
        case ">=": return "maggiore o uguale a zero";
    }
}

function isStrictInequality(sign: InequalitySign): boolean {
    return sign === "<" || sign === ">";
}

function isPositiveInequality(sign: InequalitySign): boolean {
    return sign === ">" || sign === ">=";
}

// ============ GENERATORE ============

function generateDisequazione(): DisequazioneDef {
    // Genera coefficienti per forma normale con soluzioni "belle"
    const signs: InequalitySign[] = ["<", ">", "<=", ">="];
    const sign = signs[randomInt(0, 3)];

    // Decidi il tipo di soluzione
    const solutionTypes: SolutionType[] = ["two-roots", "two-roots", "two-roots", "one-root", "no-roots"];
    const solutionType = solutionTypes[randomInt(0, 4)];

    let a: number, b: number, c: number, delta: number, x1: number | undefined, x2: number | undefined;

    if (solutionType === "two-roots") {
        // Genera due radici intere o frazionarie semplici
        x1 = randomInt(-5, 5);
        x2 = randomInt(-5, 5);
        while (x2 === x1) {
            x2 = randomInt(-5, 5);
        }
        if (x1 > x2) [x1, x2] = [x2, x1];

        // a(x - x1)(x - x2) = ax² - a(x1+x2)x + a·x1·x2
        a = randomNonZero(-3, 3);
        b = -a * (x1 + x2);
        c = a * x1 * x2;
        delta = b * b - 4 * a * c;
    } else if (solutionType === "one-root") {
        // Delta = 0: radice doppia
        x1 = randomInt(-4, 4);
        x2 = x1;

        // a(x - x1)² = ax² - 2ax1·x + a·x1²
        a = randomNonZero(-3, 3);
        b = -2 * a * x1;
        c = a * x1 * x1;
        delta = 0;
    } else {
        // Delta < 0: nessuna radice reale
        a = randomNonZero(-3, 3);
        // Per avere delta < 0: b² < 4ac, quindi se a > 0, c > 0 e |b| piccolo
        const signC = a > 0 ? 1 : -1;
        c = signC * randomInt(2, 5);
        // b² < 4ac => |b| < 2√(ac)
        const maxB = Math.floor(Math.sqrt(4 * Math.abs(a * c))) - 1;
        b = maxB > 0 ? randomInt(-maxB, maxB) : 0;
        delta = b * b - 4 * a * c;
        x1 = undefined;
        x2 = undefined;
    }

    // Genera una forma "originale" (non normale) aggiungendo termini a entrambi i lati
    const addLeft = { a: randomInt(0, 2), b: randomInt(-3, 3), c: randomInt(-5, 5) };
    const addRight = {
        a: addLeft.a + a,
        b: addLeft.b + b,
        c: addLeft.c + c
    };

    // Calcola le soluzioni
    let solutionIntervals: string;
    let solutionSet: string;

    const strict = isStrictInequality(sign);
    const positive = isPositiveInequality(sign);
    const concavityUp = a > 0;

    if (solutionType === "no-roots") {
        // Parabola sempre positiva (a > 0) o sempre negativa (a < 0)
        if ((concavityUp && positive) || (!concavityUp && !positive)) {
            solutionIntervals = "\\mathbb{R}";
            solutionSet = "\\left\\{ x \\in \\mathbb{R} \\right\\}";
        } else {
            solutionIntervals = "\\emptyset";
            solutionSet = "\\emptyset";
        }
    } else if (solutionType === "one-root") {
        const x1Latex = formatNumberLatex(x1!);
        if (concavityUp) {
            // Parabola tocca l'asse in x1, sempre ≥ 0
            if (positive) {
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
            // Parabola tocca l'asse in x1, sempre ≤ 0
            if (!positive) {
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
        }
    } else {
        // Due radici distinte
        const x1Latex = formatNumberLatex(x1!);
        const x2Latex = formatNumberLatex(x2!);
        const leftBracket = strict ? "(" : "[";
        const rightBracket = strict ? ")" : "]";

        if (concavityUp) {
            // Parabola positiva esterna, negativa interna
            if (positive) {
                solutionIntervals = `\\left(-\\infty, ${x1Latex}\\right${rightBracket} \\cup \\left${leftBracket}${x2Latex}, +\\infty\\right)`;
                const cond = strict ? `x < ${x1Latex} \\lor x > ${x2Latex}` : `x \\leq ${x1Latex} \\lor x \\geq ${x2Latex}`;
                solutionSet = `\\left\\{ x \\in \\mathbb{R} : ${cond} \\right\\}`;
            } else {
                solutionIntervals = `\\left${leftBracket}${x1Latex}, ${x2Latex}\\right${rightBracket}`;
                const cond = strict ? `${x1Latex} < x < ${x2Latex}` : `${x1Latex} \\leq x \\leq ${x2Latex}`;
                solutionSet = `\\left\\{ x \\in \\mathbb{R} : ${cond} \\right\\}`;
            }
        } else {
            // Parabola negativa esterna, positiva interna
            if (!positive) {
                solutionIntervals = `\\left(-\\infty, ${x1Latex}\\right${rightBracket} \\cup \\left${leftBracket}${x2Latex}, +\\infty\\right)`;
                const cond = strict ? `x < ${x1Latex} \\lor x > ${x2Latex}` : `x \\leq ${x1Latex} \\lor x \\geq ${x2Latex}`;
                solutionSet = `\\left\\{ x \\in \\mathbb{R} : ${cond} \\right\\}`;
            } else {
                solutionIntervals = `\\left${leftBracket}${x1Latex}, ${x2Latex}\\right${rightBracket}`;
                const cond = strict ? `${x1Latex} < x < ${x2Latex}` : `${x1Latex} \\leq x \\leq ${x2Latex}`;
                solutionSet = `\\left\\{ x \\in \\mathbb{R} : ${cond} \\right\\}`;
            }
        }
    }

    return {
        originalLeft: addLeft,
        originalRight: addRight,
        sign,
        a,
        b,
        c,
        delta,
        solutionType,
        x1,
        x2,
        solutionIntervals,
        solutionSet
    };
}

// ============ COMPONENTE GRAFICO ============

const SVG_WIDTH = 700;
const SVG_HEIGHT = 450;
const PADDING = 50;

function ParabolaGraph({
                           diseq,
                           showIntersections,
                           showConcavity,
                           showSolution
                       }: {
    diseq: DisequazioneDef;
    showIntersections: boolean;
    showConcavity: boolean;
    showSolution: boolean;
}) {
    const { a, b, c, x1, x2, solutionType, sign } = diseq;

    // Calcola il range x appropriato
    let xMin = -8, xMax = 8;
    if (solutionType === "two-roots" || solutionType === "one-root") {
        const roots = solutionType === "one-root" ? [x1!] : [x1!, x2!];
        const minRoot = Math.min(...roots);
        const maxRoot = Math.max(...roots);
        // Assicura margine attorno alle radici
        xMin = Math.min(-8, minRoot - 3);
        xMax = Math.max(8, maxRoot + 3);
    }

    // Vertice della parabola
    const vertexX = -b / (2 * a);
    const vertexY = a * vertexX * vertexX + b * vertexX + c;

    // Calcola i valori Y agli estremi del range X
    const yAtXMin = a * xMin * xMin + b * xMin + c;
    const yAtXMax = a * xMax * xMax + b * xMax + c;

    // Calcola il range Y per mostrare l'intera parabola
    let yMin: number, yMax: number;

    if (a > 0) {
        // Parabola con concavità verso l'alto: il vertice è il minimo
        yMin = vertexY - 2; // Un po' sotto il vertice
        yMax = Math.max(yAtXMin, yAtXMax, 4) + 2; // Il massimo tra gli estremi
    } else {
        // Parabola con concavità verso il basso: il vertice è il massimo
        yMax = vertexY + 2; // Un po' sopra il vertice
        yMin = Math.min(yAtXMin, yAtXMax, -4) - 2; // Il minimo tra gli estremi
    }

    // Assicura che lo 0 sia sempre visibile (per l'asse x)
    if (yMin > -1) yMin = -2;
    if (yMax < 1) yMax = 2;

    // Assicura un range minimo ragionevole
    const yRange = yMax - yMin;
    if (yRange < 10) {
        const center = (yMax + yMin) / 2;
        yMin = center - 5;
        yMax = center + 5;
    }

    function scaleX(x: number): number {
        const t = (x - xMin) / (xMax - xMin);
        return PADDING + t * (SVG_WIDTH - 2 * PADDING);
    }

    function scaleY(y: number): number {
        const t = (y - yMin) / (yMax - yMin);
        return SVG_HEIGHT - PADDING - t * (SVG_HEIGHT - 2 * PADDING);
    }

    const originX = scaleX(0);
    const originY = scaleY(0);

    // Genera punti della parabola (senza clipping verticale)
    const parabolaPoints: string[] = [];
    const numPoints = 150;
    for (let i = 0; i <= numPoints; i++) {
        const x = xMin + (i / numPoints) * (xMax - xMin);
        const y = a * x * x + b * x + c;
        // Includi tutti i punti nel range visibile
        const svgX = scaleX(x);
        const svgY = scaleY(y);
        // Limita solo ai bordi dell'SVG per evitare overflow
        if (svgY >= PADDING - 20 && svgY <= SVG_HEIGHT - PADDING + 20) {
            parabolaPoints.push(`${svgX},${svgY}`);
        }
    }

    // Determina le zone + e - per la colorazione
    const zones: { x1: number; x2: number; positive: boolean }[] = [];

    if (solutionType === "two-roots") {
        // Tre zone: (-∞, x1), (x1, x2), (x2, +∞)
        const concavityUp = a > 0;
        zones.push({ x1: xMin, x2: x1!, positive: concavityUp }); // esterna sinistra
        zones.push({ x1: x1!, x2: x2!, positive: !concavityUp }); // interna
        zones.push({ x1: x2!, x2: xMax, positive: concavityUp }); // esterna destra
    } else if (solutionType === "one-root") {
        // Due zone che si toccano nel vertice
        const concavityUp = a > 0;
        zones.push({ x1: xMin, x2: x1!, positive: concavityUp });
        zones.push({ x1: x1!, x2: xMax, positive: concavityUp });
    } else {
        // Nessuna radice: tutta la parabola ha lo stesso segno
        const concavityUp = a > 0;
        zones.push({ x1: xMin, x2: xMax, positive: concavityUp });
    }

    // Calcola step per le tacchette Y (meno tacchette)
    const yStep = Math.ceil((yMax - yMin) / 6); // Massimo ~6 tacchette

    return (
        <svg width={SVG_WIDTH} height={SVG_HEIGHT} style={{ maxWidth: "100%", display: "block", margin: "0 auto" }}>
            {/* Sfondo */}
            <rect x={0} y={0} width={SVG_WIDTH} height={SVG_HEIGHT} fill="#fafafa" stroke="#ddd" rx={8} />

            {/* Zone colorate +/- (solo dopo la soluzione) */}
            {showSolution && zones.map((zone, idx) => (
                <g key={`zone-${idx}`}>
                    <rect
                        x={scaleX(zone.x1)}
                        y={PADDING}
                        width={scaleX(zone.x2) - scaleX(zone.x1)}
                        height={SVG_HEIGHT - 2 * PADDING}
                        fill={zone.positive ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)"}
                    />
                    {/* Etichetta + o - */}
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

            {/* Griglia leggera */}
            {Array.from({ length: Math.ceil(xMax - xMin) + 1 }, (_, i) => {
                const x = Math.floor(xMin) + i;
                if (x < xMin || x > xMax) return null;
                return (
                    <line
                        key={`vgrid-${x}`}
                        x1={scaleX(x)}
                        y1={PADDING}
                        x2={scaleX(x)}
                        y2={SVG_HEIGHT - PADDING}
                        stroke="#e5e7eb"
                        strokeWidth={1}
                    />
                );
            })}
            {Array.from({ length: Math.ceil((yMax - yMin) / yStep) + 1 }, (_, i) => {
                const y = Math.floor(yMin / yStep) * yStep + i * yStep;
                if (y < yMin || y > yMax) return null;
                return (
                    <line
                        key={`hgrid-${y}`}
                        x1={PADDING}
                        y1={scaleY(y)}
                        x2={SVG_WIDTH - PADDING}
                        y2={scaleY(y)}
                        stroke="#e5e7eb"
                        strokeWidth={1}
                    />
                );
            })}

            {/* Asse X */}
            <line
                x1={PADDING}
                y1={originY}
                x2={SVG_WIDTH - PADDING}
                y2={originY}
                stroke="#374151"
                strokeWidth={2}
            />
            <polygon
                points={`${SVG_WIDTH - PADDING},${originY} ${SVG_WIDTH - PADDING - 8},${originY - 4} ${SVG_WIDTH - PADDING - 8},${originY + 4}`}
                fill="#374151"
            />
            <text x={SVG_WIDTH - PADDING + 5} y={originY + 5} fontSize={14} fill="#374151" fontStyle="italic">x</text>

            {/* Asse Y */}
            <line
                x1={originX}
                y1={SVG_HEIGHT - PADDING}
                x2={originX}
                y2={PADDING}
                stroke="#374151"
                strokeWidth={2}
            />
            <polygon
                points={`${originX},${PADDING} ${originX - 4},${PADDING + 8} ${originX + 4},${PADDING + 8}`}
                fill="#374151"
            />
            <text x={originX + 8} y={PADDING + 5} fontSize={14} fill="#374151" fontStyle="italic">y</text>

            {/* Tacche asse X */}
            {Array.from({ length: Math.ceil(xMax - xMin) + 1 }, (_, i) => {
                const x = Math.floor(xMin) + i;
                if (x === 0 || x < xMin || x > xMax) return null;
                return (
                    <g key={`xtick-${x}`}>
                        <line x1={scaleX(x)} y1={originY - 4} x2={scaleX(x)} y2={originY + 4} stroke="#374151" strokeWidth={1} />
                        <text x={scaleX(x)} y={originY + 18} fontSize={10} textAnchor="middle" fill="#6b7280">{x}</text>
                    </g>
                );
            })}

            {/* Tacche asse Y (meno tacchette) */}
            {Array.from({ length: Math.ceil((yMax - yMin) / yStep) + 1 }, (_, i) => {
                const y = Math.floor(yMin / yStep) * yStep + i * yStep;
                if (y === 0 || y < yMin || y > yMax) return null;
                return (
                    <g key={`ytick-${y}`}>
                        <line x1={originX - 4} y1={scaleY(y)} x2={originX + 4} y2={scaleY(y)} stroke="#374151" strokeWidth={1} />
                        <text x={originX - 8} y={scaleY(y) + 4} fontSize={10} textAnchor="end" fill="#6b7280">{y}</text>
                    </g>
                );
            })}

            {/* Origine */}
            <text x={originX - 10} y={originY + 15} fontSize={10} fill="#6b7280">O</text>

            {/* Parabola (solo dopo la concavità - Step 3) */}
            {showConcavity && (
                <polyline
                    points={parabolaPoints.join(" ")}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth={3}
                />
            )}

            {/* Simbolo concavità (solo dopo Step 3) */}
            {showConcavity && (
                <g>
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
                </g>
            )}

            {/* Intersezioni con asse x (dopo Step 2) */}
            {showIntersections && solutionType === "two-roots" && (
                <>
                    <circle cx={scaleX(x1!)} cy={originY} r={8} fill="#ef4444" stroke="#fff" strokeWidth={2} />
                    <text x={scaleX(x1!)} y={originY + 28} fontSize={13} textAnchor="middle" fill="#ef4444" fontWeight={600}>
                        x₁={formatNumberLatex(x1!).replace(/\\frac\{([^}]+)\}\{([^}]+)\}/, '$1/$2')}
                    </text>
                    <circle cx={scaleX(x2!)} cy={originY} r={8} fill="#ef4444" stroke="#fff" strokeWidth={2} />
                    <text x={scaleX(x2!)} y={originY + 28} fontSize={13} textAnchor="middle" fill="#ef4444" fontWeight={600}>
                        x₂={formatNumberLatex(x2!).replace(/\\frac\{([^}]+)\}\{([^}]+)\}/, '$1/$2')}
                    </text>
                </>
            )}
            {showIntersections && solutionType === "one-root" && (
                <>
                    <circle cx={scaleX(x1!)} cy={originY} r={8} fill="#f59e0b" stroke="#fff" strokeWidth={2} />
                    <text x={scaleX(x1!)} y={originY + 28} fontSize={13} textAnchor="middle" fill="#f59e0b" fontWeight={600}>
                        x₁=x₂={formatNumberLatex(x1!).replace(/\\frac\{([^}]+)\}\{([^}]+)\}/, '$1/$2')}
                    </text>
                </>
            )}
            {showIntersections && solutionType === "no-roots" && (
                <text x={SVG_WIDTH / 2} y={PADDING + 25} fontSize={13} textAnchor="middle" fill="#6b7280" fontStyle="italic">
                    Δ &lt; 0: nessuna intersezione con l'asse x
                </text>
            )}

            {/* Legenda (solo dopo la soluzione) */}
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
    const [currentStep, setCurrentStep] = useState(0);

    const totalSteps = 5; // 0: problema, 1: forma normale, 2: intersezioni, 3: concavità, 4: soluzione

    const handleGenerate = useCallback(() => {
        setDiseq(generateDisequazione());
        setCurrentStep(0);
    }, []);

    const nextStep = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const showAll = () => {
        setCurrentStep(totalSteps - 1);
    };

    // Formatta l'equazione originale
    const leftSide = formatQuadraticLatex(diseq.originalLeft.a, diseq.originalLeft.b, diseq.originalLeft.c);
    const rightSide = formatQuadraticLatex(diseq.originalRight.a, diseq.originalRight.b, diseq.originalRight.c);
    const originalEquation = `${leftSide || "0"} ${signToLatex(diseq.sign)} ${rightSide || "0"}`;

    // Forma normale
    const normalForm = `${formatQuadraticLatex(diseq.a, diseq.b, diseq.c)} ${signToLatex(diseq.sign)} 0`;

    return (
        <div style={{
            maxWidth: 950,
            margin: "auto",
            padding: 16,
            fontFamily: "system-ui, sans-serif"
        }}>
            {/* Header */}
            <div style={{ marginBottom: 16 }}>
                <a href="#/" style={{ color: "#3b82f6", textDecoration: "none", fontSize: 14 }}>
                    ← Torna alla home
                </a>
                <h1 style={{ margin: "8px 0", fontSize: 24 }}>
                    Disequazioni di Secondo Grado
                </h1>
                <p style={{ color: "#64748b", margin: 0, fontSize: 14 }}>
                    Risolvi disequazioni quadratiche passo dopo passo.
                </p>
            </div>

            {/* Pulsante genera */}
            <div style={{ marginBottom: 20 }}>
                <button
                    onClick={handleGenerate}
                    style={{
                        padding: "10px 20px",
                        borderRadius: 8,
                        border: "none",
                        background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: "pointer",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.15)"
                    }}
                >
                    🎲 Nuova disequazione
                </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Sezione: Procedimento */}
                <div>
                    {/* Disequazione originale */}
                    <div style={{
                        background: "#fff",
                        borderRadius: 12,
                        padding: 20,
                        marginBottom: 16,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                        textAlign: "center"
                    }}>
                        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
                            Risolvi la disequazione:
                        </div>
                        <div style={{ fontSize: 24 }}>
                            <Latex display>{originalEquation}</Latex>
                        </div>
                    </div>

                    {/* Navigazione */}
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 16
                    }}>
                        <div style={{ fontWeight: 600, fontSize: 16 }}>
                            Procedimento
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button
                                onClick={prevStep}
                                disabled={currentStep === 0}
                                style={{
                                    padding: "6px 12px",
                                    borderRadius: 6,
                                    border: "1px solid #cbd5e1",
                                    background: currentStep === 0 ? "#f1f5f9" : "#fff",
                                    color: currentStep === 0 ? "#94a3b8" : "#334155",
                                    cursor: currentStep === 0 ? "not-allowed" : "pointer",
                                    fontSize: 13
                                }}
                            >
                                ← Indietro
                            </button>
                            <button
                                onClick={nextStep}
                                disabled={currentStep === totalSteps - 1}
                                style={{
                                    padding: "6px 12px",
                                    borderRadius: 6,
                                    border: "none",
                                    background: currentStep === totalSteps - 1 ? "#94a3b8" : "#3b82f6",
                                    color: "#fff",
                                    cursor: currentStep === totalSteps - 1 ? "not-allowed" : "pointer",
                                    fontSize: 13,
                                    fontWeight: 500
                                }}
                            >
                                Avanti →
                            </button>
                            <button
                                onClick={showAll}
                                style={{
                                    padding: "6px 12px",
                                    borderRadius: 6,
                                    border: "1px solid #22c55e",
                                    background: "#dcfce7",
                                    color: "#166534",
                                    cursor: "pointer",
                                    fontSize: 13,
                                    fontWeight: 500
                                }}
                            >
                                Mostra tutto
                            </button>
                        </div>
                    </div>

                    {/* Steps in grid 2x2 */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        {/* Step 1: Forma normale */}
                        <div style={{
                            padding: 16,
                            background: currentStep >= 1 ? "#f0fdf4" : "#f8fafc",
                            borderRadius: 8,
                            borderLeft: `4px solid ${currentStep >= 1 ? "#22c55e" : "#cbd5e1"}`,
                            opacity: currentStep >= 1 ? 1 : 0.5
                        }}>
                            <div style={{ fontWeight: 600, color: "#166534", marginBottom: 6 }}>
                                Step 1: Riduci in forma normale
                            </div>
                            {currentStep >= 1 && (
                                <div>
                                    <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
                                        Porta tutti i termini a sinistra:
                                    </div>
                                    <div style={{
                                        fontSize: 18,
                                        padding: "8px 12px",
                                        background: "#fff",
                                        borderRadius: 6,
                                        display: "inline-block"
                                    }}>
                                        <Latex>{normalForm}</Latex>
                                    </div>
                                    <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
                                        <Latex>{`a = ${diseq.a}, \\; b = ${diseq.b}, \\; c = ${diseq.c}`}</Latex>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Step 2: Equazione associata */}
                        <div style={{
                            padding: 16,
                            background: currentStep >= 2 ? "#eff6ff" : "#f8fafc",
                            borderRadius: 8,
                            borderLeft: `4px solid ${currentStep >= 2 ? "#3b82f6" : "#cbd5e1"}`,
                            opacity: currentStep >= 2 ? 1 : 0.5
                        }}>
                            <div style={{ fontWeight: 600, color: "#1d4ed8", marginBottom: 6 }}>
                                Step 2: Equazione associata
                            </div>
                            {currentStep >= 2 && (
                                <div>
                                    <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
                                        <Latex>{`\\Delta = ${diseq.b}^2 - 4 \\cdot ${diseq.a} \\cdot ${diseq.c} = ${diseq.delta}`}</Latex>
                                    </div>

                                    {diseq.solutionType === "two-roots" && (
                                        <div style={{
                                            padding: "6px 10px",
                                            background: "#fef2f2",
                                            borderRadius: 6,
                                            color: "#991b1b",
                                            fontSize: 14
                                        }}>
                                            <Latex>{`\\Delta > 0 \\Rightarrow x_1 = ${formatNumberLatex(diseq.x1!)}, \\; x_2 = ${formatNumberLatex(diseq.x2!)}`}</Latex>
                                        </div>
                                    )}
                                    {diseq.solutionType === "one-root" && (
                                        <div style={{
                                            padding: "6px 10px",
                                            background: "#fef3c7",
                                            borderRadius: 6,
                                            color: "#92400e",
                                            fontSize: 14
                                        }}>
                                            <Latex>{`\\Delta = 0 \\Rightarrow x_1 = x_2 = ${formatNumberLatex(diseq.x1!)}`}</Latex>
                                        </div>
                                    )}
                                    {diseq.solutionType === "no-roots" && (
                                        <div style={{
                                            padding: "6px 10px",
                                            background: "#f3f4f6",
                                            borderRadius: 6,
                                            color: "#374151",
                                            fontSize: 14
                                        }}>
                                            <Latex>{"\\Delta < 0 \\Rightarrow \\text{nessuna radice reale}"}</Latex>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Step 3: Concavità */}
                        <div style={{
                            padding: 16,
                            background: currentStep >= 3 ? "#faf5ff" : "#f8fafc",
                            borderRadius: 8,
                            borderLeft: `4px solid ${currentStep >= 3 ? "#8b5cf6" : "#cbd5e1"}`,
                            opacity: currentStep >= 3 ? 1 : 0.5
                        }}>
                            <div style={{ fontWeight: 600, color: "#6d28d9", marginBottom: 6 }}>
                                Step 3: Concavità
                            </div>
                            {currentStep >= 3 && (
                                <div style={{
                                    padding: "8px 12px",
                                    background: "#fff",
                                    borderRadius: 6
                                }}>
                                    {diseq.a > 0 ? (
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <Latex>{`a = ${diseq.a} > 0`}</Latex>
                                            <span style={{ fontSize: 24 }}>⟹ ∪</span>
                                        </div>
                                    ) : (
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <Latex>{`a = ${diseq.a} < 0`}</Latex>
                                            <span style={{ fontSize: 24 }}>⟹ ∩</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Step 4: Soluzione */}
                        <div style={{
                            padding: 16,
                            background: currentStep >= 4 ? "#fef3c7" : "#f8fafc",
                            borderRadius: 8,
                            borderLeft: `4px solid ${currentStep >= 4 ? "#f59e0b" : "#cbd5e1"}`,
                            opacity: currentStep >= 4 ? 1 : 0.5
                        }}>
                            <div style={{ fontWeight: 600, color: "#b45309", marginBottom: 6 }}>
                                Step 4: Soluzione
                            </div>
                            {currentStep >= 4 && (
                                <div>
                                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Intervalli:</div>
                                    <div style={{
                                        fontSize: 18,
                                        padding: "6px 10px",
                                        background: "#fff",
                                        borderRadius: 6,
                                        display: "inline-block",
                                        color: "#92400e",
                                        marginBottom: 8
                                    }}>
                                        <Latex>{diseq.solutionIntervals}</Latex>
                                    </div>

                                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Forma insiemistica:</div>
                                    <div style={{
                                        fontSize: 14,
                                        padding: "6px 10px",
                                        background: "#fff",
                                        borderRadius: 6,
                                        color: "#92400e"
                                    }}>
                                        <Latex>{diseq.solutionSet}</Latex>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sezione: Grafico (sotto, grande) */}
                <div style={{
                    background: "#fff",
                    borderRadius: 12,
                    padding: 20,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.1)"
                }}>
                    <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 16 }}>
                        Rappresentazione grafica
                    </div>
                    <ParabolaGraph
                        diseq={diseq}
                        showIntersections={currentStep >= 2}
                        showConcavity={currentStep >= 3}
                        showSolution={currentStep >= 4}
                    />
                    <div style={{
                        marginTop: 16,
                        fontSize: 14,
                        color: "#64748b",
                        textAlign: "center"
                    }}>
                        {currentStep < 2 && (
                            <span style={{ fontStyle: "italic" }}>Prosegui per vedere le intersezioni...</span>
                        )}
                        {currentStep === 2 && (
                            <span>Le <strong style={{ color: "#ef4444" }}>intersezioni</strong> dividono l'asse x in regioni</span>
                        )}
                        {currentStep === 3 && (
                            <span>La <strong style={{ color: "#8b5cf6" }}>concavità</strong> determina dove la parabola è positiva/negativa</span>
                        )}
                        {currentStep >= 4 && (
                            <span>La <strong style={{ color: "#22c55e" }}>zona verde</strong> indica i valori che soddisfano la disequazione</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Spiegazione */}
            <div style={{
                marginTop: 20,
                background: "#eff6ff",
                borderRadius: 12,
                padding: 16,
                fontSize: 13,
                color: "#1e3a8a"
            }}>
                <strong>Metodo di risoluzione:</strong>
                <ol style={{ margin: "8px 0 0 0", paddingLeft: 20 }}>
                    <li><strong>Forma normale:</strong> riduci a <Latex>{"ax^2 + bx + c \\lessgtr 0"}</Latex></li>
                    <li><strong>Equazione associata:</strong> trova le radici di <Latex>{"ax^2 + bx + c = 0"}</Latex> usando <Latex>{"\\Delta = b^2 - 4ac"}</Latex></li>
                    <li><strong>Concavità:</strong> se <Latex>{"a > 0"}</Latex> parabola ∪, se <Latex>{"a < 0"}</Latex> parabola ∩</li>
                    <li><strong>Soluzione:</strong> leggi dal grafico i valori di x che soddisfano la disequazione</li>
                </ol>
            </div>
        </div>
    );
}