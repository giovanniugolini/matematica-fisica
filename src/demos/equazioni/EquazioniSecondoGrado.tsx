/**
 * EquazioniSecondoGradoDemo - Versione refactorizzata con helpers
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
    randomChoice,
    formatNumberLatex,
    formatQuadraticLatex,
    sumTermsLatex,
    monoX2Latex,
    monoXLatex,
    constLatex,
    coefForX2Latex,
    isZero,
} from "../../utils/math";

// ============ TIPI ============

type EqType = "pura" | "spuria" | "completa";

interface EqDef {
    originalLeft: { a: number; b: number; c: number };
    originalRight: { a: number; b: number; c: number };
    a: number;
    b: number;
    c: number;
    eqType: EqType;
    delta: number;
    hasRealSolutions: boolean;
    solutionsLatex: string;
    solutionSetLatex: string;
    x1?: number;
    x2?: number;
    pureRhs?: number;
    spuriaR2?: number;
}

// ============ GENERATORE ============

function generateEquazione(): EqDef {
    const eqType = randomChoice<EqType>(["pura", "spuria", "completa", "completa"]);

    let a = 0, b = 0, c = 0;
    let pureRhs: number | undefined;
    let spuriaR2: number | undefined;

    if (eqType === "pura") {
        a = randomNonZero(-4, 4);
        b = 0;
        const k = randomInt(1, 5);
        c = -a * k * k;
        if (Math.random() < 0.2) c = a * k * k; // 20%: nessuna soluzione
        pureRhs = -c / a;
    } else if (eqType === "spuria") {
        a = randomNonZero(-4, 4);
        c = 0;
        const r2 = randomInt(-6, 6) || 2;
        b = -a * r2;
        spuriaR2 = -b / a;
    } else {
        a = randomNonZero(-4, 4);
        const r1 = randomInt(-5, 5);
        let r2 = randomInt(-5, 5);
        while (r2 === r1) r2 = randomInt(-5, 5);
        b = -a * (r1 + r2);
        c = a * r1 * r2;

        if (Math.random() < 0.2) {
            const signC = a > 0 ? 1 : -1;
            c = signC * randomInt(2, 8);
            const maxB = Math.max(0, Math.floor(Math.sqrt(4 * Math.abs(a * c))) - 1);
            b = maxB > 0 ? randomInt(-maxB, maxB) : 0;
        }
    }

    const delta = b * b - 4 * a * c;

    // Forma originale
    const addLeft = { a: randomInt(0, 2), b: randomInt(-3, 3), c: randomInt(-6, 6) };
    const addRight = { a: addLeft.a + a, b: addLeft.b + b, c: addLeft.c + c };

    // Soluzioni
    let hasRealSolutions = false;
    let solutionsLatex = "";
    let solutionSetLatex = "";
    let x1: number | undefined;
    let x2: number | undefined;

    if (eqType === "pura") {
        const rhs = pureRhs!;
        if (rhs < 0) {
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
        x1 = 0;
        x2 = spuriaR2!;
        solutionsLatex = `x = 0 \\;\\lor\\; x = ${formatNumberLatex(x2)}`;
        solutionSetLatex = `\\left\\{ 0,\\; ${formatNumberLatex(x2)} \\right\\}`;
    } else {
        if (delta < 0) {
            solutionsLatex = "\\emptyset";
            solutionSetLatex = "\\emptyset";
        } else if (isZero(delta)) {
            hasRealSolutions = true;
            x1 = -b / (2 * a);
            solutionsLatex = `x_1 = x_2 = ${formatNumberLatex(x1)}`;
            solutionSetLatex = `\\left\\{ ${formatNumberLatex(x1)} \\right\\}`;
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
        a, b, c, eqType, delta,
        hasRealSolutions, solutionsLatex, solutionSetLatex,
        x1, x2, pureRhs, spuriaR2,
    };
}

// ============ COMPONENTE PRINCIPALE ============

export default function EquazioniSecondoGradoDemo() {
    const [eq, setEq] = useState<EqDef>(() => generateEquazione());
    const { currentStep, nextStep, prevStep, showAll, reset, isStepActive } = useStepNavigation(4);

    const handleGenerate = useCallback(() => {
        setEq(generateEquazione());
        reset();
    }, [reset]);

    const leftSide = formatQuadraticLatex(eq.originalLeft.a, eq.originalLeft.b, eq.originalLeft.c);
    const rightSide = formatQuadraticLatex(eq.originalRight.a, eq.originalRight.b, eq.originalRight.c);
    const originalEquation = `${leftSide} = ${rightSide}`;
    const normalForm = `${formatQuadraticLatex(eq.a, eq.b, eq.c)} = 0`;

    const eqTypeLabel = eq.eqType === "pura" ? "pura (b = 0)"
        : eq.eqType === "spuria" ? "spuria (c = 0)" : "completa";

    // Passaggi numerici
    const numericWorkLatex = useMemo(() => {
        const A = eq.a, B = eq.b, C = eq.c;

        if (eq.eqType === "pura") {
            const line1 = `${sumTermsLatex([{ latex: monoX2Latex(A), value: A }, { latex: constLatex(C), value: C }])} = 0`;
            const line2 = `${coefForX2Latex(A)}x^2 = ${-C}`;
            const rhs = -C / A;
            const line3 = `x^2 = ${formatNumberLatex(rhs)}`;

            if (rhs < 0) return `\\begin{aligned} ${line1} \\\\ ${line2} \\\\ ${line3} \\\\ &\\Rightarrow \\text{nessuna soluzione reale} \\end{aligned}`;
            if (isZero(rhs)) return `\\begin{aligned} ${line1} \\\\ ${line2} \\\\ ${line3} \\\\ &\\Rightarrow x = 0 \\end{aligned}`;
            return `\\begin{aligned} ${line1} \\\\ ${line2} \\\\ ${line3} \\\\ &\\Rightarrow x = \\pm \\sqrt{${formatNumberLatex(rhs)}} \\\\ &\\Rightarrow x = ${formatNumberLatex(eq.x1!)} \\;\\lor\\; x = ${formatNumberLatex(eq.x2!)} \\end{aligned}`;
        }

        if (eq.eqType === "spuria") {
            const line1 = `${sumTermsLatex([{ latex: monoX2Latex(A), value: A }, { latex: monoXLatex(B), value: B }])} = 0`;
            const inside = sumTermsLatex([{ latex: monoXLatex(A), value: A }, { latex: constLatex(B), value: B }]);
            const line2 = `x\\left(${inside}\\right)=0`;
            const line3 = `x=0 \\;\\lor\\; ${inside}=0`;
            const line4 = `${monoXLatex(A)} = ${-B}`;
            const line5 = `x = ${formatNumberLatex(-B / A)}`;
            return `\\begin{aligned} ${line1} \\\\ ${line2} \\\\ ${line3} \\\\ &\\Rightarrow ${line4} \\\\ &\\Rightarrow ${line5} \\end{aligned}`;
        }

        // Completa
        const delta = eq.delta;
        const line0 = `${formatQuadraticLatex(A, B, C)} = 0`;
        const line1 = `\\Delta = ${B}^2 - 4\\cdot(${A})\\cdot(${C})`;
        const line2 = `\\Delta = ${B * B} - ${4 * A * C} = ${delta}`;

        if (delta < 0) return `\\begin{aligned} ${line0} \\\\ ${line1} \\\\ ${line2} \\\\ &\\Rightarrow \\Delta < 0 \\Rightarrow \\text{nessuna soluzione} \\end{aligned}`;

        if (isZero(delta)) {
            const denom = 2 * A;
            const line3 = `x = -\\frac{${B}}{${denom}} = ${formatNumberLatex(-B / denom)}`;
            return `\\begin{aligned} ${line0} \\\\ ${line1} \\\\ ${line2} \\\\ &\\Rightarrow x_1=x_2 \\\\ &\\Rightarrow ${line3} \\end{aligned}`;
        }

        const sqrtD = Math.sqrt(delta);
        const denom = 2 * A;
        const line3 = `\\sqrt{\\Delta} = ${formatNumberLatex(sqrtD)}`;
        const line4 = `x = \\frac{${-B} \\pm ${formatNumberLatex(sqrtD)}}{${denom}}`;
        const line5 = `\\Rightarrow x_1=${formatNumberLatex(eq.x1!)},\\; x_2=${formatNumberLatex(eq.x2!)}`;
        return `\\begin{aligned} ${line0} \\\\ ${line1} \\\\ ${line2} \\\\ ${line3} \\\\ ${line4} \\\\ ${line5} \\end{aligned}`;
    }, [eq]);

    return (
        <DemoContainer
            title="Equazioni di Secondo Grado"
            description="Passi: forma normale → classificazione → risoluzione (con passaggi numerici)."
        >
            <div style={{ marginBottom: 20 }}>
                <GenerateButton text="Nuova equazione" onClick={handleGenerate} />
            </div>

            <ProblemCard label="Risolvi l'equazione:">
                <Latex display>{originalEquation}</Latex>
            </ProblemCard>

            <NavigationButtons
                currentStep={currentStep}
                totalSteps={4}
                onNext={nextStep}
                onPrev={prevStep}
                onShowAll={showAll}
            />

            <StepGrid columns={2}>
                {/* Step 1: Forma normale */}
                <StepCard stepNumber={1} title="Forma normale" color="green" isActive={isStepActive(1)}>
                    <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>Porta tutto a sinistra:</div>
                    <div style={{ fontSize: 18, padding: "8px 12px", background: "#fff", borderRadius: 6, display: "inline-block" }}>
                        <Latex>{normalForm}</Latex>
                    </div>
                    <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
                        <Latex>{`a = ${eq.a}, \\; b = ${eq.b}, \\; c = ${eq.c}`}</Latex>
                    </div>
                </StepCard>

                {/* Step 2: Classificazione */}
                <StepCard stepNumber={2} title="Classificazione" color="blue" isActive={isStepActive(2)}>
                    <div style={{ padding: "8px 12px", background: "#fff", borderRadius: 6 }}>
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>Equazione {eq.eqType}</div>
                        <div style={{ fontSize: 13, color: "#64748b" }}>{eqTypeLabel}</div>
                        <div style={{ marginTop: 10, fontSize: 13, color: "#64748b" }}>
                            {eq.eqType === "pura" && <Latex>{"\\textbf{Suggerimento:}\\; x^2 = -\\frac{c}{a}"}</Latex>}
                            {eq.eqType === "spuria" && <Latex>{"\\textbf{Suggerimento:}\\; x(ax+b)=0"}</Latex>}
                            {eq.eqType === "completa" && <Latex>{"\\textbf{Suggerimento:}\\; \\Delta=b^2-4ac"}</Latex>}
                        </div>
                    </div>
                </StepCard>

                {/* Step 3: Risoluzione */}
                <StepCard stepNumber={3} title="Risoluzione" color="amber" isActive={isStepActive(3)} fullWidth>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div style={{ background: "#fff", borderRadius: 8, padding: 12 }}>
                            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>Svolgimento:</div>
                            <div style={{ fontSize: 16, lineHeight: 1.6 }}>
                                <Latex display>{numericWorkLatex}</Latex>
                            </div>
                        </div>
                        <div style={{ background: "#fff", borderRadius: 8, padding: 12 }}>
                            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Soluzioni:</div>
                            <div style={{ fontSize: 18, padding: "6px 10px", background: "#fff7ed", borderRadius: 6, display: "inline-block", color: "#9a3412", marginBottom: 10, border: "1px solid #fed7aa" }}>
                                <Latex>{eq.solutionsLatex}</Latex>
                            </div>
                            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Forma insiemistica:</div>
                            <div style={{ fontSize: 14, padding: "6px 10px", background: "#fff7ed", borderRadius: 6, color: "#9a3412", border: "1px solid #fed7aa" }}>
                                <Latex>{eq.solutionSetLatex}</Latex>
                            </div>
                        </div>
                    </div>
                </StepCard>
            </StepGrid>

            <InfoBox title="Schema:">
                <ol style={{ margin: "8px 0 0 0", paddingLeft: 20 }}>
                    <li><strong>Forma normale</strong> <Latex>{"ax^2+bx+c=0"}</Latex></li>
                    <li><strong>Classificazione</strong>: pura (<Latex>{"b=0"}</Latex>), spuria (<Latex>{"c=0"}</Latex>), completa</li>
                    <li><strong>Risoluzione</strong>: passaggi numerici con formula appropriata</li>
                </ol>
            </InfoBox>
        </DemoContainer>
    );
}