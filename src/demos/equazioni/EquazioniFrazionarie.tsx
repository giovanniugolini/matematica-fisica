/**
 * EquazioniFrazionarieDemo - Versione refactorizzata con helpers
 */

import React, { useState, useCallback, useMemo } from "react";

// Componenti UI
import {
    Latex,
    DemoContainer,
    ProblemCard,
    NavigationButtons,
    StepCard,
    StepGrid,
    InfoBox,
    GenerateButton,
    useStepNavigation,
} from "../../components/ui";

// Utility matematiche
import {
    randomInt,
    randomNonZero,
    formatNumberLatex,
    formatQuadraticLatex,
    formatLinearLatex,
    parenLinearLatex,
    parenLatex,
    monoXLatex,
    classifyQuadratic,
    isZero,
    formatRatioLatex,
} from "../../utils/math";

// ============ TIPI ============

type Degree = 1 | 2;
type Linear = { a: number; b: number };
type Const = { k: number };

interface FractionalEq {
    degree: Degree;
    den1: Linear;
    den2: Linear;
    num1: Const | Linear;
    num2: Const | Linear;
    A: number;
    B: number;
    C: number;
    excluded: number[];
}

// ============ GENERATORE ============

function generateFractionalEq(): FractionalEq {
    const degree: Degree = Math.random() < 0.5 ? 1 : 2;

    const p = randomInt(-6, 6);
    let q = randomInt(-6, 6);
    while (q === p) q = randomInt(-6, 6);

    const den1: Linear = { a: 1, b: p };
    const den2: Linear = { a: 1, b: q };
    const excluded = [-p, -q];

    if (degree === 1) {
        let k1 = randomNonZero(-6, 6);
        let k2 = randomNonZero(-6, 6);
        while (k2 === k1) k2 = randomNonZero(-6, 6);

        const B = k1 - k2;
        const C = k1 * q - k2 * p;

        if (isZero(B)) return generateFractionalEq();

        return { degree, den1, den2, num1: { k: k1 }, num2: { k: k2 }, A: 0, B, C, excluded };
    }

    let m1 = randomNonZero(-4, 4);
    let m2 = randomNonZero(-4, 4);
    while (m2 === m1) m2 = randomNonZero(-4, 4);

    const n1 = randomInt(-6, 6);
    const n2 = randomInt(-6, 6);

    const A = m1 - m2;
    const B = (m1 * q + n1) - (m2 * p + n2);
    const C = n1 * q - n2 * p;

    if (isZero(A)) return generateFractionalEq();

    return { degree, den1, den2, num1: { a: m1, b: n1 }, num2: { a: m2, b: n2 }, A, B, C, excluded };
}

// ============ RISOLUZIONE ============

function solveWithoutDenominators(eq: FractionalEq) {
    const { A, B, C, excluded } = eq;

    let candidates: number[] = [];
    let detailsLatex = "";

    if (eq.degree === 1) {
        candidates = [-C / B];
        detailsLatex = `\\begin{aligned}
      ${formatLinearLatex(B, C)} &= 0 \\\\
      ${monoXLatex(B)} &= ${-C} \\\\
      x &= ${formatRatioLatex(-C, B)}
    \\end{aligned}`;
    } else {
        const delta = B * B - 4 * A * C;

        if (delta < 0) {
            candidates = [];
            detailsLatex = `\\begin{aligned}
        ${formatQuadraticLatex(A, B, C)} &= 0 \\\\
        \\Delta &= ${B}^2 - 4\\cdot(${A})\\cdot(${C}) = ${delta} \\\\
        &\\Rightarrow \\Delta < 0 \\Rightarrow \\text{nessuna soluzione reale}
      \\end{aligned}`;
        } else if (isZero(delta)) {
            const x = -B / (2 * A);
            candidates = [x];
            detailsLatex = `\\begin{aligned}
        ${formatQuadraticLatex(A, B, C)} &= 0 \\\\
        \\Delta &= ${delta} \\\\
        &\\Rightarrow x_1=x_2 = ${formatNumberLatex(x)}
      \\end{aligned}`;
        } else {
            const sqrtD = Math.sqrt(delta);
            const x1 = (-B - sqrtD) / (2 * A);
            const x2 = (-B + sqrtD) / (2 * A);
            candidates = [x1, x2].sort((u, v) => u - v);
            detailsLatex = `\\begin{aligned}
        ${formatQuadraticLatex(A, B, C)} &= 0 \\\\
        \\Delta &= ${delta},\\; \\sqrt{\\Delta} = ${formatNumberLatex(sqrtD)} \\\\
        &\\Rightarrow x_1=${formatNumberLatex(candidates[0])},\\; x_2=${formatNumberLatex(candidates[1])}
      \\end{aligned}`;
        }
    }

    const admissible = candidates.filter((x) => !excluded.some((e) => Math.abs(x - e) < 1e-9));
    return { candidates, admissible, detailsLatex };
}

// ============ COMPONENTE PRINCIPALE ============

export default function EquazioniFrazionarieDemo() {
    const [eq, setEq] = useState<FractionalEq>(() => generateFractionalEq());
    const { currentStep, nextStep, prevStep, showAll, reset, isStepActive } = useStepNavigation(4);

    const handleGenerate = useCallback(() => {
        setEq(generateFractionalEq());
        reset();
    }, [reset]);

    const { candidates, admissible, detailsLatex } = useMemo(() => solveWithoutDenominators(eq), [eq]);

    const p = eq.den1.b;
    const q = eq.den2.b;

    const den1Latex = formatLinearLatex(eq.den1.a, eq.den1.b);
    const den2Latex = formatLinearLatex(eq.den2.a, eq.den2.b);

    const num1Latex = eq.degree === 1
        ? `${(eq.num1 as Const).k}`
        : formatLinearLatex((eq.num1 as Linear).a, (eq.num1 as Linear).b);

    const num2Latex = eq.degree === 1
        ? `${(eq.num2 as Const).k}`
        : formatLinearLatex((eq.num2 as Linear).a, (eq.num2 as Linear).b);

    const originalEquation = `\\frac{${num1Latex}}{${den1Latex}} = \\frac{${num2Latex}}{${den2Latex}}`;
    const mcmLatex = `${parenLinearLatex(1, p)}${parenLinearLatex(1, q)}`;
    const transformedLatex = `${parenLatex(num1Latex)}\\,${parenLinearLatex(1, q)} = ${parenLatex(num2Latex)}\\,${parenLinearLatex(1, p)}`;
    const finalPolyLatex = eq.degree === 1
        ? `${formatLinearLatex(eq.B, eq.C)} = 0`
        : `${formatQuadraticLatex(eq.A, eq.B, eq.C)} = 0`;

    const excludedLatex = eq.excluded.map((v) => formatNumberLatex(v)).join(", ");
    const candidatesLatex = candidates.length === 0 ? "\\emptyset" : candidates.map((v) => formatNumberLatex(v)).join(",\\; ");
    const admissibleLatex = admissible.length === 0 ? "\\emptyset" : admissible.map((v) => formatNumberLatex(v)).join(",\\; ");

    const quadClass = eq.degree === 2 ? classifyQuadratic(eq.A, eq.B, eq.C) : null;
    const quadClassLabel = quadClass === "pura" ? "pura (b=0)" : quadClass === "spuria" ? "spuria (c=0)" : "completa";

    return (
        <DemoContainer
            title="Equazioni Frazionarie"
            description="Step: condizione di esistenza → m.c.m. e trasformazione → risoluzione (1° o 2° grado)."
        >
            <div style={{ marginBottom: 20 }}>
                <GenerateButton text="Nuova equazione" onClick={handleGenerate} />
            </div>

            <ProblemCard label="Risolvi l'equazione:">
                <Latex display>{originalEquation}</Latex>
                <div style={{ marginTop: 10, fontSize: 12, color: "#64748b" }}>
                    Tipo: <strong>{eq.degree === 1 ? "1° grado (dopo m.c.m.)" : "2° grado (dopo m.c.m.)"}</strong>
                </div>
            </ProblemCard>

            <NavigationButtons
                currentStep={currentStep}
                totalSteps={4}
                onNext={nextStep}
                onPrev={prevStep}
                onShowAll={showAll}
            />

            <StepGrid columns={2}>
                {/* Step 1: CE */}
                <StepCard stepNumber={1} title="Condizione di esistenza" color="green" isActive={isStepActive(1)}>
                    <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
                        I denominatori devono essere diversi da zero:
                    </div>
                    <div style={{ fontSize: 16, padding: "8px 12px", background: "#fff", borderRadius: 6 }}>
                        <Latex display>{`${den1Latex} \\neq 0 \\quad \\land \\quad ${den2Latex} \\neq 0`}</Latex>
                        <Latex display>{`x \\neq ${excludedLatex}`}</Latex>
                    </div>
                </StepCard>

                {/* Step 2: MCM */}
                <StepCard stepNumber={2} title="m.c.m. e trasformazione" color="blue" isActive={isStepActive(2)}>
                    <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
                        Il m.c.m. dei denominatori è:
                    </div>
                    <div style={{ fontSize: 16, padding: "8px 12px", background: "#fff", borderRadius: 6 }}>
                        <Latex display>{`\\text{m.c.m.} = ${mcmLatex}`}</Latex>
                        <Latex display>{`\\Rightarrow ${transformedLatex}`}</Latex>
                    </div>
                    <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
                        (Moltiplico entrambi i membri per il m.c.m., valido solo sotto C.E.)
                    </div>
                </StepCard>

                {/* Step 3: Risoluzione */}
                <StepCard stepNumber={3} title="Risoluzione" color="amber" isActive={isStepActive(3)} fullWidth>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div style={{ background: "#fff", borderRadius: 8, padding: 12 }}>
                            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Equazione (dopo sviluppo):</div>
                            <div style={{ fontSize: 18, padding: "6px 10px", background: "#fff7ed", borderRadius: 6, border: "1px solid #fed7aa" }}>
                                <Latex>{finalPolyLatex}</Latex>
                            </div>
                            {eq.degree === 2 && (
                                <div style={{ marginTop: 10, fontSize: 13, color: "#64748b" }}>
                                    Classificazione: <strong>{quadClassLabel}</strong>
                                </div>
                            )}
                            <div style={{ marginTop: 12, fontSize: 12, color: "#64748b", marginBottom: 6 }}>Svolgimento:</div>
                            <div style={{ fontSize: 16 }}>
                                <Latex display>{detailsLatex}</Latex>
                            </div>
                        </div>

                        <div style={{ background: "#fff", borderRadius: 8, padding: 12 }}>
                            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Soluzioni candidate:</div>
                            <div style={{ fontSize: 16, padding: "6px 10px", background: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0", marginBottom: 12 }}>
                                <Latex>{candidates.length === 0 ? "\\emptyset" : `\\left\\{ ${candidatesLatex} \\right\\}`}</Latex>
                            </div>

                            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Verifica C.E.:</div>
                            <div style={{ fontSize: 14, padding: "6px 10px", background: "#f0fdf4", borderRadius: 6, border: "1px solid #bbf7d0" }}>
                                <Latex>{`x \\neq ${excludedLatex}`}</Latex>
                            </div>

                            <div style={{ marginTop: 12, fontSize: 12, color: "#64748b", marginBottom: 6 }}>Soluzioni ammissibili:</div>
                            <div style={{ fontSize: 16, padding: "6px 10px", background: "#dcfce7", borderRadius: 6, border: "1px solid #86efac", color: "#166534", fontWeight: 600 }}>
                                <Latex>{admissible.length === 0 ? "\\emptyset" : `\\left\\{ ${admissibleLatex} \\right\\}`}</Latex>
                            </div>

                            {candidates.length > admissible.length && (
                                <div style={{ marginTop: 10, fontSize: 12, color: "#991b1b" }}>
                                    Alcune soluzioni candidate sono state scartate perché non rispettano la C.E.
                                </div>
                            )}
                        </div>
                    </div>
                </StepCard>
            </StepGrid>

            <InfoBox title="Metodo (3 step):">
                <ol style={{ margin: "8px 0 0 0", paddingLeft: 20 }}>
                    <li><strong>Condizione di esistenza:</strong> escludi i valori che annullano i denominatori.</li>
                    <li><strong>m.c.m. e trasformazione:</strong> moltiplica entrambi i membri per il m.c.m.</li>
                    <li><strong>Risoluzione:</strong> risolvi l'equazione senza denominatori; se è di 2° grado usa Δ.</li>
                </ol>
            </InfoBox>
        </DemoContainer>
    );
}