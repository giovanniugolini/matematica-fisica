/**
 * DisequazioniProdottoDemo - Versione Responsive
 * Step-by-step: forma fattorizzata → segni dei fattori → schema segno → soluzione
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
    factors: Factor[];  // 2-3 fattori
    inequalityType: "<" | ">" | "≤" | "≥";
    solutionLatex: string;
    solutionSetLatex: string;
    solutionIntervals: { start: string; end: string; included: boolean }[];
    roots: number[];
}

// ============ GENERATORE ============

function generateDisequazione(): Inequality {
    // Numero di fattori (2 o 3)
    const numFactors = Math.random() < 0.7 ? 2 : 3;

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
                // Nota: l'inclusione è sempre per il punto di partenza dell'intervallo
            };
        });

    // Costruisci la rappresentazione LaTeX
    let latex = "";
    let setLatex = "";

    if (solutionIntervals.length === 0) {
        latex = "\\emptyset";
        setLatex = "\\emptyset";
    } else if (solutionIntervals.length === 1 &&
        solutionIntervals[0].start === "-\\infty" &&
        solutionIntervals[0].end === "+\\infty") {
        latex = "\\forall x \\in \\mathbb{R}";
        setLatex = "\\mathbb{R}";
    } else {
        // Costruisci la soluzione in forma testuale
        const intervalStrings = solutionIntervals.map(interval => {
            if (interval.start === "-\\infty" && interval.end === "+\\infty") {
                return "\\mathbb{R}";
            }
            const leftBracket = interval.start === "-\\infty" ? "]" : (interval.included ? "[" : "]");
            const rightBracket = interval.end === "+\\infty" ? "[" : (interval.included ? "]" : "[");
            return `${leftBracket}${interval.start}, ${interval.end}${rightBracket}`;
        });

        if (intervalStrings.length === 1) {
            latex = `x \\in ${intervalStrings[0]}`;
        } else {
            latex = `x \\in ${intervalStrings.join(" \\cup ")}`;
        }

        // Forma insiemistica
        const setStrings = solutionIntervals.map(interval => {
            if (interval.start === "-\\infty" && interval.end === "+\\infty") {
                return "\\mathbb{R}";
            }
            const leftBracket = interval.start === "-\\infty" ? "-\\infty" : interval.start;
            const rightBracket = interval.end === "+\\infty" ? "+\\infty" : interval.end;
            const leftInclude = interval.included ? "[" : "]";
            const rightInclude = interval.included ? "]" : "[";
            return `${leftInclude}${leftBracket}, ${rightBracket}${rightInclude}`;
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

    // Genera lo schema dei segni in LaTeX
    const signSchemaLatex = useMemo(() => {
        const roots = ineq.roots.sort((a, b) => a - b);
        const numRows = ineq.factors.length + 2; // Fattori + prodotto + riga x

        let latex = "\\begin{array}{c|" + "c".repeat(roots.length + 1) + "}\n";

        // Riga delle x (intervalli)
        latex += "x & ";
        const intervals: string[] = [];

        if (roots.length > 0) {
            intervals.push(`-\\infty, ${formatNumberLatex(roots[0])}`);

            for (let i = 0; i < roots.length - 1; i++) {
                intervals.push(`${formatNumberLatex(roots[i])}, ${formatNumberLatex(roots[i + 1])}`);
            }

            intervals.push(`${formatNumberLatex(roots[roots.length - 1])}, +\\infty`);

            latex += intervals.join(" & ") + " \\\\\n";
            latex += "\\hline\n";
        }

        // Righe per ogni fattore
        for (let i = 0; i < ineq.factors.length; i++) {
            const factor = ineq.factors[i];
            latex += `${factorsLatex.split(" \\cdot ")[i]} & `;

            // Determina il segno in ciascun intervallo
            const signs: string[] = [];

            // Punti di test negli intervalli
            const testPoints = [
                roots[0] - 1,
                ...roots.map((r, idx) => (r + (roots[idx + 1] || (r + 2))) / 2),
                roots[roots.length - 1] + 1
            ].slice(0, roots.length + 1);

            for (const x of testPoints) {
                const value = factor.coefficient * x + factor.constant;
                signs.push(value > 0 ? "+" : value < 0 ? "-" : "0");
            }

            latex += signs.join(" & ") + " \\\\\n";
        }

        latex += "\\hline\n";

        // Riga del prodotto
        latex += "\\text{Prodotto} & ";
        const productSigns: string[] = [];

        // Calcola segno del prodotto in ogni intervallo
        const testPoints = [
            roots[0] - 1,
            ...roots.map((r, idx) => (r + (roots[idx + 1] || (r + 2))) / 2),
            roots[roots.length - 1] + 1
        ].slice(0, roots.length + 1);

        for (const x of testPoints) {
            let productSign = 1;
            for (const factor of ineq.factors) {
                const factorSign = factor.coefficient * x + factor.constant > 0 ? 1 : -1;
                productSign *= factorSign;
            }
            productSigns.push(productSign > 0 ? "+" : productSign < 0 ? "-" : "0");
        }

        latex += productSigns.join(" & ") + " \\\\\n";
        latex += "\\end{array}";

        return latex;
    }, [ineq.factors, ineq.roots, factorsLatex]);

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
                <span>Numero di fattori: {ineq.factors.length}</span>
            </div>
        </StepCard>
    );

    const Step2 = (
        <StepCard stepNumber={2} title="Radici dei fattori" color="blue" isActive={isActive(2)}>
            <CollapsibleExplanation title="Spiegazione">
                <div>
                    <p>Ogni fattore <Latex>{"ax + b"}</Latex> si annulla quando:</p>
                    <Latex>{"x = -\\frac{b}{a}"}</Latex>
                    <p>Queste radici dividono la retta reale in intervalli.</p>
                    <p>Le radici vanno ordinate in senso crescente.</p>
                </div>
            </CollapsibleExplanation>
            <div style={{ padding: "8px 12px", background: "#fff", borderRadius: 6 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Punti in cui i fattori si annullano:</div>

                <div style={{ marginTop: 8 }}>
                    {ineq.factors.map((factor, idx) => (
                        <div key={idx} style={{ marginBottom: 4, fontSize: 14 }}>
                            <Latex>{`${factorsLatex.split(" \\cdot ")[idx]} = 0 \\quad \\Rightarrow \\quad x = ${formatNumberLatex(factor.root)}`}</Latex>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: 12, paddingTop: 8, borderTop: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: 13, color: "#64748b" }}>Radici ordinate:</div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>
                        <Latex>{`x = ${ineq.roots.map(r => formatNumberLatex(r)).join(",\\; ")}`}</Latex>
                    </div>
                </div>
            </div>
        </StepCard>
    );

    const Step3 = (
        <StepCard stepNumber={3} title="Schema dei segni" color="amber" isActive={isActive(3)} fullWidth>
            <CollapsibleExplanation title="Spiegazione">
                <div>
                    <p>Costruiamo uno schema che mostra il segno di ogni fattore e del prodotto negli intervalli determinati dalle radici.</p>
                    <p>Regola dei segni:</p>
                    <ul>
                        <li>+ × + = +</li>
                        <li>+ × - = -</li>
                        <li>- × + = -</li>
                        <li>- × - = +</li>
                    </ul>
                </div>
            </CollapsibleExplanation>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: 12,
                }}
            >
                <div style={{ background: "#fff", borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>Schema completo:</div>
                    <div style={{ fontSize: 14, lineHeight: 1.6, overflowX: "auto" }}>
                        <Latex display>{signSchemaLatex}</Latex>
                    </div>
                </div>

                <div style={{ background: "#fff", borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Interpretazione:</div>
                    <div style={{ fontSize: 13, marginBottom: 10 }}>
                        <p>Lo schema mostra il segno del prodotto in ciascun intervallo:</p>
                        <ul style={{ marginLeft: 20 }}>
                            <li>"+" indica prodotto positivo</li>
                            <li>"-" indica prodotto negativo</li>
                        </ul>
                    </div>

                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Tipo di disequazione:</div>
                    <div style={{
                        padding: "6px 10px",
                        background: "#f1f5f9",
                        borderRadius: 4,
                        marginBottom: 10
                    }}>
                        <Latex>{`${factorsLatex} ${ineq.inequalityType} 0`}</Latex>
                    </div>

                    <div style={{ fontSize: 12, color: "#64748b" }}>
                        {ineq.inequalityType === ">" || ineq.inequalityType === "≥"
                            ? "Cerchiamo intervalli con segno POSITIVO (+)"
                            : "Cerchiamo intervalli con segno NEGATIVO (-)"}
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
                    <p>La soluzione finale è l'unione degli intervalli in cui il prodotto ha il segno richiesto.</p>
                    <p>Attenzione ai punti estremi:</p>
                    <ul>
                        <li>Se la disequazione è stretta (<Latex>{">"}</Latex> o <Latex>{"<"}</Latex>), le radici NON sono incluse</li>
                        <li>Se la disequazione è larga (<Latex>{"\\geq"}</Latex> o <Latex>{"\\leq"}</Latex>), le radici SONO incluse</li>
                    </ul>
                </div>
            </CollapsibleExplanation>
            <div
                style={{
                    background: "#f0fdf4",
                    borderRadius: 8,
                    padding: 12,
                    border: "1px solid #bbf7d0",
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
                    ✓ Soluzione della disequazione
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

                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Forma insiemistica:</div>
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

                <div style={{ marginTop: 12, fontSize: 13, color: "#64748b" }}>
                    <div>Radici: <Latex>{`x = ${ineq.roots.map(r => formatNumberLatex(r)).join(",\\ ")}`}</Latex></div>
                    <div style={{ marginTop: 4 }}>
                        {ineq.inequalityType === ">" || ineq.inequalityType === "<"
                            ? "Disequazione STRETTA: le radici NON sono incluse"
                            : "Disequazione LARGA: le radici SONO incluse"}
                    </div>
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
                    <strong>Trova le radici</strong>: risolvi <Latex>{"ax+b=0"}</Latex> per ogni fattore
                </li>
                <li>
                    <strong>Schema dei segni</strong>: studia il segno di ogni fattore negli intervalli
                </li>
                <li>
                    <strong>Applica la regola</strong>: prodotto positivo/negativo in base al segno
                </li>
                <li>
                    <strong>Soluzione</strong>: unisci gli intervalli che soddisfano la disequazione
                </li>
            </ol>
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