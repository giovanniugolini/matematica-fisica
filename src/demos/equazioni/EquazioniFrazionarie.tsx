// src/demos/equazioni/EquazioniFrazionarie.tsx
import React, { useState, useCallback, useMemo } from "react";
import {
    Latex,
    DemoContainer,
    ProblemCard,
    NavigationButtons,
    StepCard,
    GenerateButton,
    useStepNavigation,
    useBreakpoint,
    ResponsiveGrid,
    SwipeableTabs,
    CollapsiblePanel,
} from "../../components/ui";
import { ResponsiveButtonGroup } from "../../components/ui/ResponsiveButtonGroup";
import { CollapsibleExplanation } from "../../components/ui/CollapsibleExplanation";
import {
    Linear,
    Quadratic,
    Const,
    Polynomial,
    randomInt,
    randomNonZero,
    formatNumberLatex,
    formatQuadraticLatex,
    formatLinearLatex,
    parenLatex,
    monoXLatex,
    classifyQuadratic,
    isZero,
    formatRatioLatex,
    formatDenominatorLatex,
    factorizeDenominatorLatex,
    formatNumeratorLatex,
    getDenominatorRoots,
    mcmLatexFromDenominators,
    multiplierLatexForDenominator,
} from "../../utils/math";

type Degree = 1 | 2;
type Difficulty = "base" | "intermedio";

interface FractionalEq {
    degree: Degree;
    den1: Polynomial;
    den2: Polynomial;
    num1: Const | Linear | Quadratic;
    num2: Const | Linear | Quadratic;
    A: number;
    B: number;
    C: number;
    excluded: number[];
}

export default function EquazioniFrazionarie() {
    const { isMobile } = useBreakpoint();

    const [difficulty, setDifficulty] = useState<Difficulty>("base");
    const [eq, setEq] = useState<FractionalEq>(() => generateFractionalEq("base"));

    // Solo 2 frazioni => 4 step fissi
    const { currentStep, nextStep, prevStep, showAll, reset } = useStepNavigation(4);
    const isActive = (stepNumber: number) => currentStep >= stepNumber - 1;

    const handleGenerate = useCallback(() => {
        setEq(generateFractionalEq(difficulty));
        reset();
    }, [difficulty, reset]);

    // ✅ FIX “controllo”: usa direttamente il valore selezionato per generare
    const handleDifficultyChange = useCallback(
        (value: string) => {
            const d = value as Difficulty;
            setDifficulty(d);
            setEq(generateFractionalEq(d));
            reset();
        },
        [reset]
    );

    const { candidates, admissible, detailsLatex } = useMemo(() => solveWithoutDenominators(eq), [eq]);

    const den1Latex = formatDenominatorLatex(eq.den1);
    const den2Latex = formatDenominatorLatex(eq.den2);

    const num1Latex = formatNumeratorLatex(eq.num1);
    const num2Latex = formatNumeratorLatex(eq.num2);

    const originalEquation = `\\frac{${num1Latex}}{${den1Latex}} = \\frac{${num2Latex}}{${den2Latex}}`;

    const allDenoms = useMemo(() => [eq.den1, eq.den2], [eq.den1, eq.den2]);

    const mcmLatex = useMemo(() => mcmLatexFromDenominators(allDenoms), [allDenoms]);

    const mult1 = useMemo(() => multiplierLatexForDenominator(eq.den1, allDenoms), [eq.den1, allDenoms]);
    const mult2 = useMemo(() => multiplierLatexForDenominator(eq.den2, allDenoms), [eq.den2, allDenoms]);

    const transformedLatex = `${parenLatex(num1Latex)}${mult1 === "1" ? "" : mult1} = ${parenLatex(num2Latex)}${
        mult2 === "1" ? "" : mult2
    }`;

    // ✅ Visualizzazione tipo “quaderno”: stesso denominatore (m.c.m.) sotto a entrambi, barrato.
    const cancelEquationLatex = useMemo(() => {
        const leftNum = `${parenLatex(num1Latex)}${mult1 === "1" ? "" : mult1}`;
        const rightNum = `${parenLatex(num2Latex)}${mult2 === "1" ? "" : mult2}`;

        // Nota: mcmLatex è già del tipo (x+4)(x-1)
        return `\\frac{${leftNum}}{\\cancel{${mcmLatex}}} = \\frac{${rightNum}}{\\cancel{${mcmLatex}}}`;
    }, [num1Latex, num2Latex, mult1, mult2, mcmLatex]);


    const finalPolyLatex =
        eq.degree === 1
            ? `${formatLinearLatex(eq.B, eq.C)} = 0`
            : `${formatQuadraticLatex(eq.A, eq.B, eq.C)} = 0`;

    const excludedRoots = useMemo(() => getDenominatorRoots(allDenoms), [allDenoms]);
    const excludedLatex = excludedRoots.length ? excludedRoots.map((v) => formatNumberLatex(v)).join(", ") : "\\emptyset";

    const candidatesLatex =
        candidates.length === 0 ? "\\emptyset" : candidates.map((v) => formatNumberLatex(v)).join(",\\; ");
    const admissibleLatex =
        admissible.length === 0 ? "\\emptyset" : admissible.map((v) => formatNumberLatex(v)).join(",\\; ");

    const quadClass = eq.degree === 2 ? classifyQuadratic(eq.A, eq.B, eq.C) : null;
    const quadClassLabel =
        quadClass === "pura" ? "pura (b=0)" : quadClass === "spuria" ? "spuria (c=0)" : "completa";

    const Step1 = (
        <StepCard stepNumber={1} title="Condizione di esistenza" color="green" isActive={isActive(1)}>
            <CollapsibleExplanation title="Condizione di Esistenza (C.E.)">
                <div>
                    I denominatori devono essere diversi da zero:
                    <br />
                    {"c" in eq.den1
                        ? `Il denominatore ${den1Latex} si scompone in ${factorizeDenominatorLatex(eq.den1)}.`
                        : `Il denominatore ${den1Latex} si annulla per $x = ${-eq.den1.b / eq.den1.a}$.`}
                    <br />
                    {"c" in eq.den2
                        ? `Il denominatore ${den2Latex} si scompone in ${factorizeDenominatorLatex(eq.den2)}.`
                        : `Il denominatore ${den2Latex} si annulla per $x = ${-eq.den2.b / eq.den2.a}$.`}
                </div>
            </CollapsibleExplanation>

            <div style={{ fontSize: isMobile ? 15 : 16, padding: "8px 12px", background: "#fff", borderRadius: 6 }}>
                <Latex display>{`${den1Latex} \\neq 0 \\quad \\land \\quad ${den2Latex} \\neq 0`}</Latex>
                <Latex display>{`x \\neq ${excludedLatex}`}</Latex>
            </div>
        </StepCard>
    );

    const Step2 = (
        <StepCard stepNumber={2} title="m.c.m. e trasformazione" color="blue" isActive={isActive(2)}>
            <CollapsibleExplanation title="Scomposizione e m.c.m.">
                <div>
                    <strong>Scomponiamo i denominatori:</strong>
                    <br />
                    {"c" in eq.den1
                        ? `Il denominatore ${den1Latex} si scompone in ${factorizeDenominatorLatex(eq.den1)}.`
                        : `Il denominatore ${den1Latex} è lineare.`}
                    <br />
                    {"c" in eq.den2
                        ? `Il denominatore ${den2Latex} si scompone in ${factorizeDenominatorLatex(eq.den2)}.`
                        : `Il denominatore ${den2Latex} è lineare.`}
                    <br />
                    <strong>m.c.m.:</strong> {mcmLatex}.
                    <br />
                    Moltiplichiamo entrambi i membri per il m.c.m. e otteniamo:
                </div>
            </CollapsibleExplanation>

            {/* Parte NON estendibile: mostra la "cancellazione" */}
            <div style={{ fontSize: isMobile ? 15 : 16, padding: "8px 12px", background: "#fff", borderRadius: 6 }}>
                <Latex display>{`\\text{m.c.m.} = ${mcmLatex}`}</Latex>
                <Latex display>{cancelEquationLatex}</Latex>
                <Latex display>{`\\Rightarrow ${transformedLatex}`}</Latex>
            </div>

        </StepCard>
    );

    const Step3 = (
        <StepCard stepNumber={3} title="Risoluzione" color="amber" isActive={isActive(3)}>
            <CollapsibleExplanation title="Passaggi algebrici">
                <div>
                    <strong>Equazione dopo il m.c.m.:</strong>
                    <br />
                    {finalPolyLatex}
                    <br />
                    {eq.degree === 2 ? (
                        <>
                            <strong>Classificazione:</strong> {quadClassLabel}.
                            <br />
                            <strong>Discriminante:</strong>
                            <br />
                            {`Delta = ${eq.B}^2 - 4(${eq.A})(${eq.C}) = ${eq.B * eq.B - 4 * eq.A * eq.C}`}
                            <br />
                            {eq.B * eq.B - 4 * eq.A * eq.C > 0 ? (
                                <>
                                    <strong>Soluzioni:</strong>
                                    <br />
                                    {`x = \\frac{${-eq.B} \\pm \\sqrt{${eq.B * eq.B - 4 * eq.A * eq.C}}}{2 \\cdot ${eq.A}}`}
                                </>
                            ) : eq.B * eq.B - 4 * eq.A * eq.C === 0 ? (
                                <>
                                    <strong>Soluzione doppia:</strong>
                                    <br />
                                    {`x = \\frac{${-eq.B}}{2 \\cdot ${eq.A}}`}
                                </>
                            ) : (
                                <strong>Nessuna soluzione reale (Delta &lt; 0).</strong>
                            )}
                        </>
                    ) : (
                        <>
                            <strong>Soluzione:</strong>
                            <br />
                            {`x = ${formatRatioLatex(-eq.C, eq.B)}`}
                        </>
                    )}
                </div>
            </CollapsibleExplanation>

            <div
                style={{
                    fontSize: isMobile ? 17 : 18,
                    padding: "8px 12px",
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

            <div style={{ marginTop: 10, fontSize: 12, color: "#64748b" }}>Svolgimento:</div>
            <div style={{ marginTop: 6, fontSize: 16 }}>
                <Latex display>{detailsLatex}</Latex>
            </div>
        </StepCard>
    );

    const Step4 = (
        <StepCard stepNumber={4} title="Verifica C.E. e soluzioni" color="purple" isActive={isActive(4)}>
            <CollapsibleExplanation title="Verifica delle soluzioni">
                <div>
                    <strong>Soluzioni candidate:</strong>
                    <br />
                    {candidatesLatex}
                    <br />
                    <strong>Condizione di Esistenza (C.E.):</strong>
                    <br />
                    {`I valori esclusi sono: ${excludedLatex}.`}
                    <br />
                    {candidates.length > admissible.length ? (
                        <>
                            <strong>Soluzioni non ammissibili:</strong>
                            <br />
                            {`Le soluzioni ${candidates
                                .filter((x) => !admissible.includes(x))
                                .map((v) => formatNumberLatex(v))
                                .join(", ")} non rispettano la C.E.`}
                            <br />
                            <strong>Soluzioni ammissibili:</strong>
                            <br />
                            {admissibleLatex}
                        </>
                    ) : (
                        <strong>Tutte le soluzioni sono ammissibili.</strong>
                    )}
                </div>
            </CollapsibleExplanation>

            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Soluzioni candidate:</div>
            <div
                style={{
                    fontSize: 15,
                    padding: "8px 12px",
                    background: "#f8fafc",
                    borderRadius: 6,
                    border: "1px solid #e2e8f0",
                    overflowX: "auto",
                    marginBottom: 10,
                }}
            >
                <Latex>{candidates.length === 0 ? "\\emptyset" : `\\left\\{ ${candidatesLatex} \\right\\}`}</Latex>
            </div>

            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Verifica C.E.:</div>
            <div
                style={{
                    fontSize: 14,
                    padding: "8px 12px",
                    background: "#f0fdf4",
                    borderRadius: 6,
                    border: "1px solid #bbf7d0",
                    marginBottom: 10,
                    overflowX: "auto",
                }}
            >
                <Latex>{`x \\neq ${excludedLatex}`}</Latex>
            </div>

            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Soluzioni ammissibili:</div>
            <div
                style={{
                    fontSize: 15,
                    padding: "8px 12px",
                    background: "#dcfce7",
                    borderRadius: 6,
                    border: "1px solid #86efac",
                    color: "#166534",
                    fontWeight: 700,
                    overflowX: "auto",
                }}
            >
                <Latex>{admissible.length === 0 ? "\\emptyset" : `\\left\\{ ${admissibleLatex} \\right\\}`}</Latex>
            </div>

            {candidates.length > admissible.length && (
                <div style={{ marginTop: 10, fontSize: 12, color: "#991b1b" }}>
                    Alcune soluzioni candidate sono state scartate perché non rispettano la C.E.
                </div>
            )}
        </StepCard>
    );

    const MethodContent = (
        <div style={{ fontSize: 13 }}>
            <ol style={{ margin: 0, paddingLeft: 20 }}>
                <li>
                    <strong>Condizione di esistenza:</strong> escludi i valori che annullano i denominatori.
                </li>
                <li>
                    <strong>m.c.m. e trasformazione:</strong> moltiplica entrambi i membri per il m.c.m.
                </li>
                <li>
                    <strong>Risoluzione:</strong> risolvi l’equazione senza denominatori; se è di 2° grado usa Δ.
                </li>
                <li>
                    <strong>Verifica:</strong> elimina i candidati che violano la C.E.
                </li>
            </ol>
        </div>
    );

    if (isMobile) {
        return (
            <DemoContainer title="Equazioni frazionarie" description="Risolvi step-by-step">
                <div style={{ marginBottom: 12 }}>
                    <ResponsiveButtonGroup
                        options={[
                            { label: "Base", value: "base" },
                            { label: "Intermedio", value: "intermedio" },
                        ]}
                        selectedValue={difficulty}
                        onChange={handleDifficultyChange}
                    />
                </div>

                <div style={{ marginBottom: 12 }}>
                    <GenerateButton text="Nuova" onClick={handleGenerate} />
                </div>

                <ProblemCard label="Risolvi:">
                    <div style={{ fontSize: 18 }}>
                        <Latex display>{originalEquation}</Latex>
                    </div>
                    <div style={{ marginTop: 10, fontSize: 12, color: "#64748b" }}>
                        Tipo: <strong>{eq.degree === 1 ? "1° grado (dopo m.c.m.)" : "2° grado (dopo m.c.m.)"}</strong>
                    </div>
                </ProblemCard>

                <NavigationButtons currentStep={currentStep} totalSteps={4} onNext={nextStep} onPrev={prevStep} onShowAll={showAll} />

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
                                <CollapsiblePanel title="Metodo di risoluzione" defaultOpen={true}>
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

    return (
        <DemoContainer title="Equazioni frazionarie" description="Risolvi equazioni frazionarie passo dopo passo.">
            <div style={{ marginBottom: 16 }}>
                <ResponsiveButtonGroup
                    options={[
                        { label: "Base", value: "base" },
                        { label: "Intermedio", value: "intermedio" },
                    ]}
                    selectedValue={difficulty}
                    onChange={handleDifficultyChange}
                />
            </div>

            <div style={{ marginBottom: 16 }}>
                <GenerateButton text="Nuova equazione" onClick={handleGenerate} />
            </div>

            <ProblemCard label="Risolvi l'equazione:">
                <Latex display>{originalEquation}</Latex>
                <div style={{ marginTop: 10, fontSize: 12, color: "#64748b" }}>
                    Tipo: <strong>{eq.degree === 1 ? "1° grado (dopo m.c.m.)" : "2° grado (dopo m.c.m.)"}</strong>
                </div>
            </ProblemCard>

            <NavigationButtons currentStep={currentStep} totalSteps={4} onNext={nextStep} onPrev={prevStep} onShowAll={showAll} />

            <ResponsiveGrid columns={{ tablet: 2, desktop: 2 }} gap={12}>
                {Step1}
                {Step2}
                {Step3}
                {Step4}
            </ResponsiveGrid>

            <div style={{ marginTop: 16 }}>
                <CollapsiblePanel title="💡 Metodo di risoluzione" defaultOpen={false}>
                    {MethodContent}
                </CollapsiblePanel>
            </div>
        </DemoContainer>
    );
}

/**
 * Generatore:
 * - Base: 2 denominatori lineari, con esiti 1° o 2° grado.
 * - Intermedio: 2 frazioni soltanto, con denominatore quadratico fattorizzabile,
 *               e casi che portano a 1° oppure 2° grado (ma mai oltre).
 */
function generateFractionalEq(difficulty: Difficulty): FractionalEq {
    // -------------------------
    // INTERMEDIO (solo 2 frazioni)
    // -------------------------
    if (difficulty === "intermedio") {
        // Caso A (≈50%): den2 con fattore comune (x+p)(x+q) e num2 costante -> 1° grado
        if (Math.random() < 0.5) {
            const p = randomInt(-6, 6);
            let q = randomInt(-6, 6);
            while (q === p) q = randomInt(-6, 6);

            const den1: Linear = { a: 1, b: p }; // x + p
            const den2: Quadratic = { a: 1, b: p + q, c: p * q }; // (x+p)(x+q)

            const k = randomNonZero(-6, 6);
            const c = randomNonZero(-10, 10);

            const B = k;
            const C = k * q - c;

            const excluded = getDenominatorRoots([den1, den2]);

            return {
                degree: 1,
                den1,
                den2,
                num1: { k },
                num2: { k: c },
                A: 0,
                B,
                C,
                excluded,
            };
        }

        // Caso B (≈50%): den2 quadratico (x+r)(x+s), num2 lineare -> spesso 2° grado
        const p = randomInt(-6, 6);
        const den1: Linear = { a: 1, b: p };

        let r = randomInt(-6, 6);
        let s = randomInt(-6, 6);
        while (s === r) s = randomInt(-6, 6);

        const den2: Quadratic = { a: 1, b: r + s, c: r * s }; // (x+r)(x+s)

        const k = randomNonZero(-6, 6);
        const a = randomNonZero(-6, 6);
        const b = randomInt(-8, 8);

        // k(x+r)(x+s) = (ax+b)(x+p)
        const A = k - a;
        const B = k * (r + s) - (a * p + b);
        const C = k * (r * s) - b * p;

        const excluded = getDenominatorRoots([den1, den2]);
        const degree: Degree = isZero(A) ? 1 : 2;

        return {
            degree,
            den1,
            den2,
            num1: { k },
            num2: { a, b },
            A,
            B,
            C,
            excluded,
        };
    }

    // -------------------------
    // BASE (2 denominatori lineari)
    // -------------------------
    const degree: Degree = Math.random() < 0.5 ? 1 : 2;

    const p = randomInt(-6, 6);
    let q = randomInt(-6, 6);
    while (q === p) q = randomInt(-6, 6);

    const den1: Linear = { a: 1, b: p };
    const den2: Linear = { a: 1, b: q };

    const excluded = getDenominatorRoots([den1, den2]);

    if (degree === 1) {
        let k1 = randomNonZero(-6, 6);
        let k2 = randomNonZero(-6, 6);
        while (k2 === k1) k2 = randomNonZero(-6, 6);

        const B = k1 - k2;
        const C = k1 * q - k2 * p;

        if (isZero(B)) return generateFractionalEq(difficulty);

        return {
            degree: 1,
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

    let m1 = randomNonZero(-4, 4);
    let m2 = randomNonZero(-4, 4);
    while (m2 === m1) m2 = randomNonZero(-4, 4);

    const n1 = randomInt(-6, 6);
    const n2 = randomInt(-6, 6);

    const A = m1 - m2;
    const B = m1 * q + n1 - (m2 * p + n2);
    const C = n1 * q - n2 * p;

    if (isZero(A)) return generateFractionalEq(difficulty);

    return {
        degree: 2,
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
