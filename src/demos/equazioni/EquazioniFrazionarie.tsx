import React, { useMemo, useState, useCallback } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

// ============ COMPONENTE LATEX ============

function Latex({ children, display = false }: { children: string; display?: boolean }) {
    const html = useMemo(() => {
        try {
            return katex.renderToString(children, { throwOnError: false, displayMode: display });
        } catch {
            return children;
        }
    }, [children, display]);

    return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

// ============ TIPI ============

type Degree = 1 | 2;

type Linear = { a: number; b: number }; // ax + b
type Const = { k: number }; // k

type FractionalEq = {
    degree: Degree;

    // denominatori lineari: x + p, x + q (qui a=1)
    den1: Linear;
    den2: Linear;

    // numeratori:
    // - grado 1: costanti
    // - grado 2: lineari
    num1: Const | Linear;
    num2: Const | Linear;

    // coefficienti dell'equazione senza denominatori:
    // - se degree=1: Bx + C = 0
    // - se degree=2: Ax^2 + Bx + C = 0
    A: number;
    B: number;
    C: number;

    excluded: number[]; // CE: x != ...
};

// ============ UTILITÀ NUMERICHE ============

function rnd(min: number, max: number): number {
    return min + Math.floor(Math.random() * (max - min + 1));
}

function rndNZ(min: number, max: number): number {
    let n = 0;
    while (n === 0) n = rnd(min, max);
    return n;
}

function isZero(n: number): boolean {
    return Math.abs(n) < 1e-10;
}

// gcd su interi (anche grandi)
function gcd(a: number, b: number): number {
    a = Math.abs(Math.trunc(a));
    b = Math.abs(Math.trunc(b));
    while (b) {
        const t = b;
        b = a % b;
        a = t;
    }
    return a || 1;
}

function formatFractionLatex(num: number, den: number): string {
    if (den === 0) return "\\text{indefinito}";
    if (num === 0) return "0";

    const sign = (num < 0) !== (den < 0) ? -1 : 1;
    num = Math.abs(num);
    den = Math.abs(den);

    const g = gcd(num, den);
    const n = (num / g) * sign;
    const d = den / g;

    if (d === 1) return `${n}`;
    if (n < 0) return `-\\frac{${Math.abs(n)}}{${d}}`;
    return `\\frac{${n}}{${d}}`;
}

// Converte un rapporto tra decimali in frazione semplificata (es. 0.001/0.005 -> 1/5)
function formatRatioLatex(num: number, den: number): string {
    if (den === 0) return "\\text{indefinito}";
    if (num === 0) return "0";

    const sNum = num.toString();
    const sDen = den.toString();
    const decNum = sNum.includes(".") ? sNum.split(".")[1].length : 0;
    const decDen = sDen.includes(".") ? sDen.split(".")[1].length : 0;

    const pow = Math.max(decNum, decDen);
    const factor = Math.pow(10, pow);

    const iNum = Math.round(num * factor);
    const iDen = Math.round(den * factor);

    const sign = (iNum < 0) !== (iDen < 0) ? -1 : 1;
    const a = Math.abs(iNum);
    const b = Math.abs(iDen);

    const g = gcd(a, b);
    const n = (a / g) * sign;
    const d = b / g;

    if (d === 1) return `${n}`;
    if (n < 0) return `-\\frac{${Math.abs(n)}}{${d}}`;
    return `\\frac{${n}}{${d}}`;
}

function formatNumberLatex(n: number): string {
    if (!Number.isFinite(n)) return "\\text{indef.}";
    if (Number.isInteger(n)) return n.toString();

    // prova frazione semplice (den <= 12)
    for (let den = 2; den <= 12; den++) {
        const num = n * den;
        if (Math.abs(num - Math.round(num)) < 0.0001) {
            return formatFractionLatex(Math.round(num), den);
        }
    }

    return n.toFixed(3).replace(/\.?0+$/, "");
}

// ============ UTILITÀ LATEX “PULITE” ============

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

function formatQuadraticLatex(A: number, B: number, C: number): string {
    return sumTermsLatex([
        { latex: monoX2Latex(A), value: A },
        { latex: monoXLatex(B), value: B },
        { latex: constLatex(C), value: C },
    ]);
}

function formatLinearLatex(a: number, b: number): string {
    return sumTermsLatex([
        { latex: monoXLatex(a), value: a },
        { latex: constLatex(b), value: b },
    ]);
}

function parenLinearLatex(a: number, b: number): string {
    return `\\left(${formatLinearLatex(a, b)}\\right)`;
}

function parenLatex(expr: string): string {
    return `\\left(${expr}\\right)`;
}

function classifyQuadratic(B: number, C: number): "pura" | "spuria" | "completa" {
    if (isZero(B) && !isZero(C)) return "pura";
    if (!isZero(B) && isZero(C)) return "spuria";
    if (isZero(B) && isZero(C)) return "spuria";
    return "completa";
}

// ============ GENERATORE (den lineari) ============

function generateFractionalEq(): FractionalEq {
    const degree: Degree = Math.random() < 0.5 ? 1 : 2;

    // den1 = x + p, den2 = x + q
    const p = rnd(-6, 6);
    let q = rnd(-6, 6);
    while (q === p) q = rnd(-6, 6);

    const den1: Linear = { a: 1, b: p };
    const den2: Linear = { a: 1, b: q };

    const excluded = [-p, -q];

    if (degree === 1) {
        // k1/(x+p) = k2/(x+q) => lineare
        let k1 = rndNZ(-6, 6);
        let k2 = rndNZ(-6, 6);
        while (k2 === k1) k2 = rndNZ(-6, 6); // evita cancellazione del coefficiente di x

        // k1(x+q) = k2(x+p) => (k1-k2)x + (k1q - k2p) = 0
        const B = k1 - k2;
        const C = k1 * q - k2 * p;

        if (isZero(B)) return generateFractionalEq();

        return {
            degree,
            den1,
            den2,
            num1: { k: k1 },
            num2: { k: k2 },
            A: 0,
            B,
            C,
            excluded,
        };
    }

    // degree === 2:
    // (m1x+n1)/(x+p) = (m2x+n2)/(x+q) => quadratica, scegliamo m1 != m2
    let m1 = rndNZ(-4, 4);
    let m2 = rndNZ(-4, 4);
    while (m2 === m1) m2 = rndNZ(-4, 4);

    const n1 = rnd(-6, 6);
    const n2 = rnd(-6, 6);

    // (m1x+n1)(x+q) = (m2x+n2)(x+p)
    const A = m1 - m2;
    const B = (m1 * q + n1) - (m2 * p + n2);
    const C = n1 * q - n2 * p;

    if (isZero(A)) return generateFractionalEq();

    return {
        degree,
        den1,
        den2,
        num1: { a: m1, b: n1 },
        num2: { a: m2, b: n2 },
        A,
        B,
        C,
        excluded,
    };
}

// ============ RISOLUZIONE + FILTRO CE ============

function solveWithoutDenominators(eq: FractionalEq) {
    const { A, B, C, excluded } = eq;

    let candidates: number[] = [];
    let detailsLatex = "";
    let finalDelta: number | null = null;

    if (eq.degree === 1) {
        // Bx + C = 0  => x = -C/B (come frazione semplificata)
        candidates = [-C / B];

        detailsLatex = `\\begin{aligned}
      ${formatLinearLatex(B, C)} &= 0 \\\\
      ${monoXLatex(B)} &= ${-C} \\\\
      x &= ${formatRatioLatex(-C, B)}
    \\end{aligned}`;
    } else {
        // Ax^2 + Bx + C = 0
        const delta = B * B - 4 * A * C;
        finalDelta = delta;

        if (delta < 0) {
            candidates = [];
            detailsLatex = `\\begin{aligned}
        ${formatQuadraticLatex(A, B, C)} &= 0 \\\\
        \\Delta &= ${B}^2 - 4\\cdot(${A})\\cdot(${C}) \\\\
        \\Delta &= ${B * B} - ${4 * A * C} = ${delta} \\\\
        &\\Rightarrow \\Delta < 0 \\Rightarrow \\text{nessuna soluzione reale}
      \\end{aligned}`;
        } else if (isZero(delta)) {
            const x = -B / (2 * A);
            candidates = [x];

            detailsLatex = `\\begin{aligned}
        ${formatQuadraticLatex(A, B, C)} &= 0 \\\\
        \\Delta &= ${B}^2 - 4\\cdot(${A})\\cdot(${C}) \\\\
        \\Delta &= ${B * B} - ${4 * A * C} = ${delta} \\\\
        &\\Rightarrow x_1=x_2=-\\frac{${B}}{2\\cdot(${A})} = ${formatNumberLatex(x)}
      \\end{aligned}`;
        } else {
            const sqrtD = Math.sqrt(delta);
            const x1 = (-B - sqrtD) / (2 * A);
            const x2 = (-B + sqrtD) / (2 * A);
            candidates = [x1, x2].sort((u, v) => u - v);

            detailsLatex = `\\begin{aligned}
        ${formatQuadraticLatex(A, B, C)} &= 0 \\\\
        \\Delta &= ${B}^2 - 4\\cdot(${A})\\cdot(${C}) \\\\
        \\Delta &= ${B * B} - ${4 * A * C} = ${delta} \\\\
        \\sqrt{\\Delta} &= \\sqrt{${delta}} = ${formatNumberLatex(sqrtD)} \\\\
        x &= \\frac{-(${B})\\pm ${formatNumberLatex(sqrtD)}}{2\\cdot(${A})} \\\\
        &\\Rightarrow x_1=${formatNumberLatex(candidates[0])},\\; x_2=${formatNumberLatex(candidates[1])}
      \\end{aligned}`;
        }
    }

    const admissible = candidates.filter((x) => !excluded.some((e) => Math.abs(x - e) < 1e-9));

    return { candidates, admissible, detailsLatex, delta: finalDelta };
}

// ============ COMPONENTE PRINCIPALE ============

export default function EquazioniFrazionarieDemo() {
    const [eq, setEq] = useState<FractionalEq>(() => generateFractionalEq());
    const [currentStep, setCurrentStep] = useState(0);

    // 0: problema, 1: CE, 2: mcm, 3: risoluzione
    const totalSteps = 4;

    const handleGenerate = useCallback(() => {
        setEq(generateFractionalEq());
        setCurrentStep(0);
    }, []);

    const nextStep = () => {
        if (currentStep < totalSteps - 1) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    const showAll = () => setCurrentStep(totalSteps - 1);

    const { candidates, admissible, detailsLatex } = useMemo(() => solveWithoutDenominators(eq), [eq]);

    const p = eq.den1.b; // x + p
    const q = eq.den2.b; // x + q

    const den1Latex = formatLinearLatex(eq.den1.a, eq.den1.b);
    const den2Latex = formatLinearLatex(eq.den2.a, eq.den2.b);

    const num1Latex =
        eq.degree === 1 ? `${(eq.num1 as Const).k}` : formatLinearLatex((eq.num1 as Linear).a, (eq.num1 as Linear).b);

    const num2Latex =
        eq.degree === 1 ? `${(eq.num2 as Const).k}` : formatLinearLatex((eq.num2 as Linear).a, (eq.num2 as Linear).b);

    const originalEquation = `\\frac{${num1Latex}}{${den1Latex}} = \\frac{${num2Latex}}{${den2Latex}}`;

    const mcmLatex = `${parenLinearLatex(1, p)}${parenLinearLatex(1, q)}`;

    // ✅ parentesi su numeratore e fattore
    const transformedLatex = `${parenLatex(num1Latex)}\\,${parenLinearLatex(1, q)} = ${parenLatex(num2Latex)}\\,${parenLinearLatex(1, p)}`;

    const finalPolyLatex =
        eq.degree === 1 ? `${formatLinearLatex(eq.B, eq.C)} = 0` : `${formatQuadraticLatex(eq.A, eq.B, eq.C)} = 0`;

    const excludedLatex = eq.excluded.map((v) => formatNumberLatex(v)).join(", ");

    const candidatesLatex =
        candidates.length === 0 ? "\\emptyset" : candidates.map((v) => formatNumberLatex(v)).join(",\\; ");

    const admissibleLatex =
        admissible.length === 0 ? "\\emptyset" : admissible.map((v) => formatNumberLatex(v)).join(",\\; ");

    const quadClass = eq.degree === 2 ? classifyQuadratic(eq.B, eq.C) : null;
    const quadClassLabel = quadClass === "pura" ? "pura (b=0)" : quadClass === "spuria" ? "spuria (c=0)" : "completa";

    return (
        <div style={{ maxWidth: 950, margin: "auto", padding: 16, fontFamily: "system-ui, sans-serif" }}>
            {/* Header */}
            <div style={{ marginBottom: 16 }}>
                <a href="#/" style={{ color: "#3b82f6", textDecoration: "none", fontSize: 14 }}>
                    ← Torna alla home
                </a>
                <h1 style={{ margin: "8px 0", fontSize: 24 }}>Equazioni frazionarie</h1>
                <p style={{ color: "#64748b", margin: 0, fontSize: 14 }}>
                    Step: condizione di esistenza → m.c.m. e trasformazione → risoluzione (1° o 2° grado).
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

            {/* Card Equazione */}
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
                <div style={{ marginTop: 10, fontSize: 12, color: "#64748b" }}>
                    Tipo: <strong>{eq.degree === 1 ? "1° grado (dopo m.c.m.)" : "2° grado (dopo m.c.m.)"}</strong>
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
                {/* Step 1: CE */}
                <div
                    style={{
                        padding: 16,
                        background: currentStep >= 1 ? "#f0fdf4" : "#f8fafc",
                        borderRadius: 8,
                        borderLeft: `4px solid ${currentStep >= 1 ? "#22c55e" : "#cbd5e1"}`,
                        opacity: currentStep >= 1 ? 1 : 0.5,
                    }}
                >
                    <div style={{ fontWeight: 600, color: "#166534", marginBottom: 6 }}>Step 1: Condizione di esistenza</div>

                    {currentStep >= 1 && (
                        <div>
                            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>I denominatori devono essere diversi da zero:</div>
                            <div style={{ fontSize: 16, padding: "8px 12px", background: "#fff", borderRadius: 6 }}>
                                <Latex display>{`${den1Latex} \\neq 0 \\quad \\land \\quad ${den2Latex} \\neq 0`}</Latex>
                                <Latex display>{`x \\neq ${excludedLatex}`}</Latex>
                            </div>
                        </div>
                    )}
                </div>

                {/* Step 2: mcm */}
                <div
                    style={{
                        padding: 16,
                        background: currentStep >= 2 ? "#eff6ff" : "#f8fafc",
                        borderRadius: 8,
                        borderLeft: `4px solid ${currentStep >= 2 ? "#3b82f6" : "#cbd5e1"}`,
                        opacity: currentStep >= 2 ? 1 : 0.5,
                    }}
                >
                    <div style={{ fontWeight: 600, color: "#1d4ed8", marginBottom: 6 }}>Step 2: m.c.m. e trasformazione</div>

                    {currentStep >= 2 && (
                        <div>
                            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>Il m.c.m. dei denominatori è:</div>
                            <div style={{ fontSize: 16, padding: "8px 12px", background: "#fff", borderRadius: 6 }}>
                                <Latex display>{`\\text{m.c.m.} = ${mcmLatex}`}</Latex>
                                <Latex display>{`\\Rightarrow ${transformedLatex}`}</Latex>
                            </div>
                            <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
                                (Moltiplico entrambi i membri per il m.c.m., valido solo sotto C.E.)
                            </div>
                        </div>
                    )}
                </div>

                {/* Step 3: Risoluzione */}
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
                    <div style={{ fontWeight: 600, color: "#b45309", marginBottom: 6 }}>
                        Step 3: Risoluzione dell&apos;equazione senza denominatore
                    </div>

                    {currentStep >= 3 && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <div style={{ background: "#fff", borderRadius: 8, padding: 12 }}>
                                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Equazione (dopo sviluppo):</div>

                                <div
                                    style={{
                                        fontSize: 18,
                                        padding: "6px 10px",
                                        background: "#fff7ed",
                                        borderRadius: 6,
                                        border: "1px solid #fed7aa",
                                    }}
                                >
                                    <Latex>{finalPolyLatex}</Latex>
                                </div>

                                {eq.degree === 2 && (
                                    <div style={{ marginTop: 10, fontSize: 13, color: "#64748b" }}>
                                        Classificazione: <strong>{quadClassLabel}</strong>
                                    </div>
                                )}

                                <div style={{ marginTop: 12, fontSize: 12, color: "#64748b", marginBottom: 6 }}>Svolgimento numerico:</div>
                                <div style={{ fontSize: 16 }}>
                                    <Latex display>{detailsLatex}</Latex>
                                </div>
                            </div>

                            <div style={{ background: "#fff", borderRadius: 8, padding: 12 }}>
                                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Soluzioni candidate:</div>
                                <div
                                    style={{
                                        fontSize: 16,
                                        padding: "6px 10px",
                                        background: "#f8fafc",
                                        borderRadius: 6,
                                        border: "1px solid #e2e8f0",
                                        marginBottom: 12,
                                    }}
                                >
                                    <Latex>{candidates.length === 0 ? "\\emptyset" : `\\left\\{ ${candidatesLatex} \\right\\}`}</Latex>
                                </div>

                                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Verifica C.E.:</div>
                                <div style={{ fontSize: 14, padding: "6px 10px", background: "#f0fdf4", borderRadius: 6, border: "1px solid #bbf7d0" }}>
                                    <Latex>{`x \\neq ${excludedLatex}`}</Latex>
                                </div>

                                <div style={{ marginTop: 12, fontSize: 12, color: "#64748b", marginBottom: 6 }}>Soluzioni ammissibili:</div>
                                <div
                                    style={{
                                        fontSize: 16,
                                        padding: "6px 10px",
                                        background: "#dcfce7",
                                        borderRadius: 6,
                                        border: "1px solid #86efac",
                                        color: "#166534",
                                        fontWeight: 600,
                                    }}
                                >
                                    <Latex>{admissible.length === 0 ? "\\emptyset" : `\\left\\{ ${admissibleLatex} \\right\\}`}</Latex>
                                </div>

                                {candidates.length > admissible.length && (
                                    <div style={{ marginTop: 10, fontSize: 12, color: "#991b1b" }}>
                                        Alcune soluzioni candidate sono state scartate perché non rispettano la C.E.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Spiegazione */}
            <div style={{ marginTop: 20, background: "#eff6ff", borderRadius: 12, padding: 16, fontSize: 13, color: "#1e3a8a" }}>
                <strong>Metodo (3 step):</strong>
                <ol style={{ margin: "8px 0 0 0", paddingLeft: 20 }}>
                    <li>
                        <strong>Condizione di esistenza:</strong> escludi i valori che annullano i denominatori.
                    </li>
                    <li>
                        <strong>m.c.m. e trasformazione:</strong> moltiplica entrambi i membri per il m.c.m. (valido solo sotto C.E.).
                    </li>
                    <li>
                        <strong>Risoluzione:</strong> risolvi l&apos;equazione senza denominatori; se è di 2° grado usa Δ e classifica.
                    </li>
                </ol>
            </div>
        </div>
    );
}
