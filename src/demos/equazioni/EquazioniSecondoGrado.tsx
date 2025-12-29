import React, { useState, useMemo, useCallback } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

// ============ COMPONENTE LATEX ============

function Latex({
                   children,
                   display = false,
               }: {
    children: string;
    display?: boolean;
}) {
    const html = useMemo(() => {
        try {
            return katex.renderToString(children, {
                throwOnError: false,
                displayMode: display,
            });
        } catch {
            return children;
        }
    }, [children, display]);

    return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

// ============ TIPI ============

type EqType = "pura" | "spuria" | "completa";

type EqDef = {
    // Forma "originale" LHS = RHS (non normale)
    originalLeft: { a: number; b: number; c: number };
    originalRight: { a: number; b: number; c: number };

    // Forma normale: ax^2 + bx + c = 0
    a: number;
    b: number;
    c: number;

    // Classificazione
    eqType: EqType;

    // Dati risoluzione
    delta: number;
    hasRealSolutions: boolean;

    // Soluzioni (output)
    solutionsLatex: string;
    solutionSetLatex: string;
    x1?: number;
    x2?: number;

    // Per passaggi “numerici”
    pureRhs?: number; // -c/a
    spuriaR2?: number; // -b/a
};

// ============ UTILITÀ ============

function randomInt(min: number, max: number): number {
    return min + Math.floor(Math.random() * (max - min + 1));
}

function randomNonZero(min: number, max: number): number {
    let n = 0;
    while (n === 0) n = randomInt(min, max);
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
    const simplifiedNum = Math.round((num * 1000) / divisor) / 1000;
    const simplifiedDen = Math.round((den * 1000) / divisor) / 1000;

    if (simplifiedDen === 1) return (sign * simplifiedNum).toString();

    const signStr = sign < 0 ? "-" : "";
    return `${signStr}\\frac{${simplifiedNum}}{${simplifiedDen}}`;
}

function formatNumberLatex(n: number): string {
    if (!Number.isFinite(n)) return "\\text{indef.}";
    if (Number.isInteger(n)) return n.toString();

    for (let den = 2; den <= 12; den++) {
        const num = n * den;
        if (Math.abs(num - Math.round(num)) < 0.0001) {
            return formatFractionLatex(Math.round(num), den);
        }
    }
    return n.toFixed(2).replace(/\.?0+$/, "");
}

function isZero(n: number): boolean {
    return Math.abs(n) < 1e-10;
}

// --- monomi “puliti” (1x -> x, -1x -> -x, ecc.) ---


function coefForX2Latex(a: number): string {
    if (a === 1) return "";    // 1x^2 -> x^2
    if (a === -1) return "-";  // -1x^2 -> -x^2
    return `${a}`;             // 3x^2, -3x^2, ...
}

function coefForXLatex(a: number): string {
    if (a === 1) return "";    // 1x -> x
    if (a === -1) return "-";  // -1x -> -x
    return `${a}`;
}

function monoX2Latex(a: number): string {
    if (a === 0) return "0";
    if (a === 1) return "x^2";
    if (a === -1) return "-x^2";
    return `${a}x^2`;
}

function monoXLatex(b: number): string {
    if (b === 0) return "0";
    if (b === 1) return "x";
    if (b === -1) return "-x";
    return `${b}x`;
}

function constLatex(c: number): string {
    if (c === 0) return "0";
    return c < 0 ? `-${Math.abs(c)}` : `${c}`;
}

// Concatena termini con segni “puliti”
function sumTermsLatex(terms: { latex: string; value: number }[]): string {
    const nonZero = terms.filter((t) => t.value !== 0);
    if (nonZero.length === 0) return "0";

    let out = nonZero[0].latex;
    for (let i = 1; i < nonZero.length; i++) {
        const v = nonZero[i].value;
        const raw = nonZero[i].latex;
        const absLatex = raw.startsWith("-") ? raw.slice(1) : raw;
        out += v >= 0 ? ` + ${absLatex}` : ` - ${absLatex}`;
    }
    return out;
}

function formatQuadraticLatex(a: number, b: number, c: number): string {
    return sumTermsLatex([
        { latex: monoX2Latex(a), value: a },
        { latex: monoXLatex(b), value: b },
        { latex: constLatex(c), value: c },
    ]);
}

// ============ GENERATORE ============

function generateEquazione(): EqDef {
    // Bias: più complete, ma tutte presenti
    const types: EqType[] = ["pura", "spuria", "completa", "completa"];
    const eqType = types[randomInt(0, types.length - 1)];

    let a = 0,
        b = 0,
        c = 0;

    let pureRhs: number | undefined;
    let spuriaR2: number | undefined;

    if (eqType === "pura") {
        // ax^2 + c = 0
        a = randomNonZero(-4, 4);
        b = 0;

        const k = randomInt(1, 5);
        const ratio = k * k; // -c/a

        c = -a * ratio;

        // 20%: nessuna soluzione reale
        if (Math.random() < 0.2) c = a * ratio;

        pureRhs = -c / a;
    } else if (eqType === "spuria") {
        // ax^2 + bx = 0
        a = randomNonZero(-4, 4);
        c = 0;

        // radici: 0 e rr2 (semplice)
        const r2 = randomInt(-6, 6);
        const rr2 = r2 === 0 ? 2 : r2;

        // -b/a = rr2 -> b = -a*rr2
        b = -a * rr2;
        spuriaR2 = -b / a;
    } else {
        // completa
        a = randomNonZero(-4, 4);

        // spesso due radici intere
        const r1 = randomInt(-5, 5);
        let r2 = randomInt(-5, 5);
        while (r2 === r1) r2 = randomInt(-5, 5);

        b = -a * (r1 + r2);
        c = a * r1 * r2;

        // 20%: Δ<0
        if (Math.random() < 0.2) {
            const signC = a > 0 ? 1 : -1;
            c = signC * randomInt(2, 8);
            const maxB = Math.max(0, Math.floor(Math.sqrt(4 * Math.abs(a * c))) - 1);
            b = maxB > 0 ? randomInt(-maxB, maxB) : 0;
        }
    }

    const delta = b * b - 4 * a * c;

    // Forma originale (non normale): aggiungo lo stesso polinomio a entrambi, ma lo rappresento come LHS=RHS
    const addLeft = { a: randomInt(0, 2), b: randomInt(-3, 3), c: randomInt(-6, 6) };
    const addRight = { a: addLeft.a + a, b: addLeft.b + b, c: addLeft.c + c };

    // Soluzioni
    let hasRealSolutions = false;
    let solutionsLatex = "";
    let solutionSetLatex = "";
    let x1: number | undefined;
    let x2: number | undefined;

    if (eqType === "pura") {
        const rhs = -c / a; // x^2 = rhs
        pureRhs = rhs;

        if (rhs < 0) {
            hasRealSolutions = false;
            solutionsLatex = "\\emptyset";
            solutionSetLatex = "\\emptyset";
        } else if (isZero(rhs)) {
            hasRealSolutions = true;
            x1 = 0;
            solutionsLatex = "x = 0";
            solutionSetLatex = "\\{0\\}";
        } else {
            hasRealSolutions = true;
            const root = Math.sqrt(rhs);
            x1 = -root;
            x2 = root;
            solutionsLatex = `x = ${formatNumberLatex(x1)} \\;\\lor\\; x = ${formatNumberLatex(x2)}`;
            solutionSetLatex = `\\left\\{ ${formatNumberLatex(x1)},\\; ${formatNumberLatex(x2)} \\right\\}`;
        }
    } else if (eqType === "spuria") {
        hasRealSolutions = true;
        const r2 = -b / a;
        spuriaR2 = r2;
        x1 = 0;
        x2 = r2;
        solutionsLatex = `x = 0 \\;\\lor\\; x = ${formatNumberLatex(r2)}`;
        solutionSetLatex = `\\left\\{ 0,\\; ${formatNumberLatex(r2)} \\right\\}`;
    } else {
        if (delta < 0) {
            hasRealSolutions = false;
            solutionsLatex = "\\emptyset";
            solutionSetLatex = "\\emptyset";
        } else if (isZero(delta)) {
            hasRealSolutions = true;
            const r = -b / (2 * a);
            x1 = r;
            solutionsLatex = `x_1 = x_2 = ${formatNumberLatex(r)}`;
            solutionSetLatex = `\\left\\{ ${formatNumberLatex(r)} \\right\\}`;
        } else {
            hasRealSolutions = true;
            const sqrtD = Math.sqrt(delta);
            const r1 = (-b - sqrtD) / (2 * a);
            const r2 = (-b + sqrtD) / (2 * a);
            x1 = Math.min(r1, r2);
            x2 = Math.max(r1, r2);
            solutionsLatex = `x_1 = ${formatNumberLatex(x1)},\\; x_2 = ${formatNumberLatex(x2)}`;
            solutionSetLatex = `\\left\\{ ${formatNumberLatex(x1)},\\; ${formatNumberLatex(x2)} \\right\\}`;
        }
    }

    return {
        originalLeft: addLeft,
        originalRight: addRight,
        a,
        b,
        c,
        eqType,
        delta,
        hasRealSolutions,
        solutionsLatex,
        solutionSetLatex,
        x1,
        x2,
        pureRhs,
        spuriaR2,
    };
}

// ============ COMPONENTE PRINCIPALE ============

export default function EquazioniSecondoGradoDemo() {
    const [eq, setEq] = useState<EqDef>(() => generateEquazione());
    const [currentStep, setCurrentStep] = useState(0);

    // 0: problema, 1: forma normale, 2: classificazione, 3: risoluzione
    const totalSteps = 4;

    const handleGenerate = useCallback(() => {
        setEq(generateEquazione());
        setCurrentStep(0);
    }, []);

    const nextStep = () => {
        if (currentStep < totalSteps - 1) setCurrentStep(currentStep + 1);
    };
    const prevStep = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };
    const showAll = () => setCurrentStep(totalSteps - 1);

    // Equazione originale
    const leftSide = formatQuadraticLatex(eq.originalLeft.a, eq.originalLeft.b, eq.originalLeft.c);
    const rightSide = formatQuadraticLatex(eq.originalRight.a, eq.originalRight.b, eq.originalRight.c);
    const originalEquation = `${leftSide} = ${rightSide}`;

    // Forma normale
    const normalForm = `${formatQuadraticLatex(eq.a, eq.b, eq.c)} = 0`;

    // Classificazione label
    const eqTypeLabel =
        eq.eqType === "pura"
            ? "pura (b = 0)"
            : eq.eqType === "spuria"
                ? "spuria (c = 0)"
                : "completa (a, b, c ≠ 0)";

    // ============ PASSAGGI NUMERICI RISOLUZIONE ============

    const numericWorkLatex = useMemo(() => {
        const A = eq.a;
        const B = eq.b;
        const C = eq.c;

        if (eq.eqType === "pura") {
            // Ax^2 + C = 0 -> Ax^2 = -C -> x^2 = (-C)/A -> x = ±sqrt(...)
            const line1 = `${sumTermsLatex([
                { latex: monoX2Latex(A), value: A },
                { latex: constLatex(C), value: C },
            ])} = 0`;

            const line2 = `${coefForX2Latex(A)}x^2 = ${-C}`;

            const rhs = -C / A;
            const line3 = `x^2 = ${formatNumberLatex(rhs)}`;

            if (rhs < 0) {
                return `\\begin{aligned}
      ${line1} \\\\
      ${line2} \\\\
      ${line3} \\\\
      &\\Rightarrow \\text{nessuna soluzione reale}
    \\end{aligned}`;
            }

            if (isZero(rhs)) {
                return `\\begin{aligned}
      ${line1} \\\\
      ${line2} \\\\
      ${line3} \\\\
      &\\Rightarrow x = 0
    \\end{aligned}`;
            }

            return `\\begin{aligned}
    ${line1} \\\\
    ${line2} \\\\
    ${line3} \\\\
    &\\Rightarrow x = \\pm \\sqrt{${formatNumberLatex(rhs)}} \\\\
    &\\Rightarrow x = ${formatNumberLatex(eq.x1!)} \\;\\lor\\; x = ${formatNumberLatex(eq.x2!)}
  \\end{aligned}`;
        }


        if (eq.eqType === "spuria") {
            // Ax^2 + Bx = 0 -> x(Ax + B)=0
            const line1 = `${sumTermsLatex([
                { latex: monoX2Latex(A), value: A },
                { latex: monoXLatex(B), value: B },
            ])} = 0`;

            const inside = sumTermsLatex([
                { latex: monoXLatex(A), value: A }, // Ax
                { latex: constLatex(B), value: B }, // +B
            ]);

            const line2 = `x\\left(${inside}\\right)=0`;
            const line3 = `x=0 \\;\\lor\\; ${inside}=0`;

            // Ax + B = 0 -> Ax = -B -> x = -B/A
            const line4 = `${monoXLatex(A)} = ${-B}`; // se A=1 -> x = -B
            const line5 = `x = ${formatNumberLatex(-B / A)}`;

            return `\\begin{aligned}
        ${line1} \\\\
        ${line2} \\\\
        ${line3} \\\\
        &\\Rightarrow ${line4} \\\\
        &\\Rightarrow ${line5}
      \\end{aligned}`;
        }

        // completa: Δ e formula risolutiva (con numeri)
        const delta = eq.delta;
        const line0 = `${formatQuadraticLatex(A, B, C)} = 0`;
        const line1 = `\\Delta = ${B}^2 - 4\\cdot(${A})\\cdot(${C})`;
        const line2 = `\\Delta = ${B * B} - ${4 * A * C} = ${delta}`;

        if (delta < 0) {
            return `\\begin{aligned}
        ${line0} \\\\
        ${line1} \\\\
        ${line2} \\\\
        &\\Rightarrow \\Delta < 0 \\Rightarrow \\text{nessuna soluzione reale}
      \\end{aligned}`;
        }

        if (isZero(delta)) {
            const denom = 2 * A;
            const line3 = `x = -\\frac{${B}}{2\\cdot(${A})} = -\\frac{${B}}{${denom}} = ${formatNumberLatex(-B / denom)}`;

            return `\\begin{aligned}
        ${line0} \\\\
        ${line1} \\\\
        ${line2} \\\\
        &\\Rightarrow x_1=x_2 \\\\
        &\\Rightarrow ${line3}
      \\end{aligned}`;
        }

        const sqrtD = Math.sqrt(delta);
        const denom = 2 * A;

        const line3 = `\\sqrt{\\Delta} = \\sqrt{${delta}} = ${formatNumberLatex(sqrtD)}`;
        const line4 = `x = \\frac{-(${B}) \\pm ${formatNumberLatex(sqrtD)}}{2\\cdot(${A})}`;
        const line5 = `x = \\frac{${-B} \\pm ${formatNumberLatex(sqrtD)}}{${denom}}`;
        const line6 = `\\Rightarrow x_1=${formatNumberLatex(eq.x1!)},\\; x_2=${formatNumberLatex(eq.x2!)}`;

        return `\\begin{aligned}
      ${line0} \\\\
      ${line1} \\\\
      ${line2} \\\\
      ${line3} \\\\
      ${line4} \\\\
      ${line5} \\\\
      ${line6}
    \\end{aligned}`;
    }, [eq]);

    return (
        <div style={{ maxWidth: 950, margin: "auto", padding: 16, fontFamily: "system-ui, sans-serif" }}>
            {/* Header */}
            <div style={{ marginBottom: 16 }}>
                <a href="#/" style={{ color: "#3b82f6", textDecoration: "none", fontSize: 14 }}>
                    ← Torna alla home
                </a>
                <h1 style={{ margin: "8px 0", fontSize: 24 }}>Equazioni di Secondo Grado</h1>
                <p style={{ color: "#64748b", margin: 0, fontSize: 14 }}>
                    Passi: forma normale → classificazione → risoluzione (con passaggi numerici).
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
                        boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                    }}
                >
                    🎲 Nuova equazione
                </button>
            </div>

            {/* Equazione originale */}
            <div
                style={{
                    background: "#fff",
                    borderRadius: 12,
                    padding: 20,
                    marginBottom: 16,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                    textAlign: "center",
                }}
            >
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>Risolvi l&apos;equazione:</div>
                <div style={{ fontSize: 24 }}>
                    <Latex display>{originalEquation}</Latex>
                </div>
            </div>

            {/* Navigazione */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontWeight: 600, fontSize: 16 }}>Procedimento</div>
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
                            fontSize: 13,
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
                            fontWeight: 500,
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
                            fontWeight: 500,
                        }}
                    >
                        Mostra tutto
                    </button>
                </div>
            </div>

            {/* Steps */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {/* Step 1 */}
                <div
                    style={{
                        padding: 16,
                        background: currentStep >= 1 ? "#f0fdf4" : "#f8fafc",
                        borderRadius: 8,
                        borderLeft: `4px solid ${currentStep >= 1 ? "#22c55e" : "#cbd5e1"}`,
                        opacity: currentStep >= 1 ? 1 : 0.5,
                    }}
                >
                    <div style={{ fontWeight: 600, color: "#166534", marginBottom: 6 }}>Step 1: Forma normale</div>
                    {currentStep >= 1 && (
                        <div>
                            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>Porta tutto a sinistra:</div>
                            <div style={{ fontSize: 18, padding: "8px 12px", background: "#fff", borderRadius: 6, display: "inline-block" }}>
                                <Latex>{normalForm}</Latex>
                            </div>
                            <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
                                <Latex>{`a = ${eq.a}, \\; b = ${eq.b}, \\; c = ${eq.c}`}</Latex>
                            </div>
                        </div>
                    )}
                </div>

                {/* Step 2 */}
                <div
                    style={{
                        padding: 16,
                        background: currentStep >= 2 ? "#eff6ff" : "#f8fafc",
                        borderRadius: 8,
                        borderLeft: `4px solid ${currentStep >= 2 ? "#3b82f6" : "#cbd5e1"}`,
                        opacity: currentStep >= 2 ? 1 : 0.5,
                    }}
                >
                    <div style={{ fontWeight: 600, color: "#1d4ed8", marginBottom: 6 }}>Step 2: Classificazione</div>
                    {currentStep >= 2 && (
                        <div style={{ padding: "8px 12px", background: "#fff", borderRadius: 6 }}>
                            <div style={{ fontWeight: 700, marginBottom: 6 }}>Equazione {eq.eqType}</div>
                            <div style={{ fontSize: 13, color: "#64748b" }}>{eqTypeLabel}</div>

                            <div style={{ marginTop: 10, fontSize: 13, color: "#64748b" }}>
                                {eq.eqType === "pura" && <Latex>{`\\textbf{Suggerimento:}\\; x^2 = -\\frac{c}{a}`}</Latex>}
                                {eq.eqType === "spuria" && <Latex>{`\\textbf{Suggerimento:}\\; x(ax+b)=0`}</Latex>}
                                {eq.eqType === "completa" && <Latex>{`\\textbf{Suggerimento:}\\; \\Delta=b^2-4ac`}</Latex>}
                            </div>
                        </div>
                    )}
                </div>

                {/* Step 3 */}
                <div
                    style={{
                        padding: 16,
                        background: currentStep >= 3 ? "#fef3c7" : "#f8fafc",
                        borderRadius: 8,
                        borderLeft: `4px solid ${currentStep >= 3 ? "#f59e0b" : "#cbd5e1"}`,
                        opacity: currentStep >= 3 ? 1 : 0.5,
                        gridColumn: "1 / -1",
                    }}
                >
                    <div style={{ fontWeight: 600, color: "#b45309", marginBottom: 6 }}>Step 3: Risoluzione (passaggi numerici)</div>

                    {currentStep >= 3 && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            {/* Passaggi */}
                            <div style={{ background: "#fff", borderRadius: 8, padding: 12 }}>
                                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>Svolgimento:</div>
                                <div style={{ fontSize: 16, lineHeight: 1.6 }}>
                                    <Latex display>{numericWorkLatex}</Latex>
                                </div>
                            </div>

                            {/* Soluzioni finali */}
                            <div style={{ background: "#fff", borderRadius: 8, padding: 12 }}>
                                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Soluzioni:</div>
                                <div
                                    style={{
                                        fontSize: 18,
                                        padding: "6px 10px",
                                        background: "#fff7ed",
                                        borderRadius: 6,
                                        display: "inline-block",
                                        color: "#9a3412",
                                        marginBottom: 10,
                                        border: "1px solid #fed7aa",
                                    }}
                                >
                                    <Latex>{eq.solutionsLatex}</Latex>
                                </div>

                                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Forma insiemistica:</div>
                                <div
                                    style={{
                                        fontSize: 14,
                                        padding: "6px 10px",
                                        background: "#fff7ed",
                                        borderRadius: 6,
                                        color: "#9a3412",
                                        border: "1px solid #fed7aa",
                                    }}
                                >
                                    <Latex>{eq.solutionSetLatex}</Latex>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Spiegazione sintetica */}
            <div style={{ marginTop: 20, background: "#eff6ff", borderRadius: 12, padding: 16, fontSize: 13, color: "#1e3a8a" }}>
                <strong>Schema:</strong>
                <ol style={{ margin: "8px 0 0 0", paddingLeft: 20 }}>
                    <li>
                        <strong>Forma normale</strong> <Latex>{`ax^2+bx+c=0`}</Latex>
                    </li>
                    <li>
                        <strong>Classificazione</strong>: pura (<Latex>{`b=0`}</Latex>), spuria (<Latex>{`c=0`}</Latex>), completa
                    </li>
                    <li>
                        <strong>Risoluzione</strong>: passaggi numerici (coefficiente 1 mostrato come <Latex>{`x`}</Latex> o <Latex>{`x^2`}</Latex>)
                    </li>
                </ol>
            </div>
        </div>
    );
}
