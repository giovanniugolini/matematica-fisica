/**
 * SistemiPrimoGradoSostituzioneDemo
 * Risoluzione step-by-step di sistemi lineari 2x2 con il metodo di sostituzione
 * Step: 1) Sistema | 2) Ricava y | 3) Sostituisci | 4) Risolvi x | 5) Trova y + Soluzione
 */

import React, { useState, useCallback, useMemo } from "react";

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

import {
    randomInt,
    randomNonZero,
    randomChoice,
    formatNumberLatex,
} from "../../utils/math";

// ============ HELPERS LATEX ============

/** Monoio a*v: gestisce 0, 1, -1 */
function mono(c: number, v: string): string {
    if (c === 0) return "0";
    if (c === 1) return v;
    if (c === -1) return `-${v}`;
    return `${c}${v}`;
}

/** Termine con segno esplicito, da usare dopo il primo termine (es. + 3x o - 2x) */
function signedMono(c: number, v: string): string {
    if (c === 0) return "";
    if (c > 0) return `+ ${c === 1 ? v : `${c}${v}`}`;
    if (c === -1) return `- ${v}`;
    return `- ${Math.abs(c)}${v}`;
}

/** Costante con segno esplicito */
function signedConst(n: number): string {
    if (n === 0) return "";
    if (n > 0) return `+ ${n}`;
    return `${n}`; // già negativo
}

/** LHS lineare: a*x + b*y */
function linLHS(a: number, b: number): string {
    let s = a !== 0 ? mono(a, "x") : "";
    if (b !== 0) {
        if (s === "" || s === "0") s = mono(b, "y");
        else if (b > 0) s += ` + ${b === 1 ? "y" : `${b}y`}`;
        else if (b === -1) s += " - y";
        else s += ` - ${Math.abs(b)}y`;
    }
    return s || "0";
}

/** Espressione lineare in x: a*x + k */
function linX(a: number, k: number): string {
    let s = a !== 0 ? mono(a, "x") : "";
    if (k !== 0) {
        if (s === "" || s === "0") s = `${k}`;
        else s += ` ${signedConst(k)}`;
    }
    return s || "0";
}

/** Formato compatto b*(expr) dove expr è già in LaTeX */
function timesParen(b: number, expr: string): string {
    if (b === 1) return `(${expr})`;
    if (b === -1) return `-(${expr})`;
    if (b > 0) return `${b}(${expr})`;
    return `${b}(${expr})`; // negativo
}

// ============ TIPI ============

type Nature = "unique" | "impossible" | "indeterminate";

interface SystemDef {
    a1: number; b1: number; c1: number;
    a2: number; b2: number; c2: number;
    nature: Nature;
    x0?: number; y0?: number;
    // y isolata da eq1: y = yA*x + yC
    yA: number; yC: number;
    // equazione risolvente dopo sostituzione: rCoeff*x = rRHS
    rCoeff: number; rRHS: number;
}

// ============ GENERATORE ============

function generateSystem(): SystemDef {
    const nature: Nature = randomChoice<Nature>([
        "unique", "unique", "unique", "unique", "unique",
        "impossible", "indeterminate",
    ]);

    let a1: number, b1: number, c1: number;
    let a2: number, b2: number, c2: number;
    let x0: number | undefined, y0: number | undefined;

    // b1 sempre ±1 → isolamento di y senza frazioni
    b1 = randomChoice([1, -1]);
    a1 = randomNonZero(-3, 3);

    if (nature === "unique") {
        x0 = randomInt(-4, 4);
        y0 = randomInt(-4, 4);
        c1 = a1 * x0 + b1 * y0;

        let attempts = 0;
        do {
            a2 = randomNonZero(-3, 3);
            b2 = randomNonZero(-3, 3);
            attempts++;
        } while (a1 * b2 - a2 * b1 === 0 && attempts < 50);

        c2 = a2 * x0 + b2 * y0;
    } else if (nature === "impossible") {
        const k = randomChoice([2, -2, 3]);
        x0 = randomInt(-3, 3); y0 = randomInt(-3, 3);
        c1 = a1 * x0 + b1 * y0;
        a2 = k * a1; b2 = k * b1;
        c2 = k * c1 + randomChoice([1, -1, 2, -2]);
        x0 = undefined; y0 = undefined;
    } else {
        // indeterminate
        const k = randomChoice([2, -2, 3]);
        x0 = randomInt(-3, 3); y0 = randomInt(-3, 3);
        c1 = a1 * x0 + b1 * y0;
        a2 = k * a1; b2 = k * b1; c2 = k * c1;
        x0 = undefined; y0 = undefined;
    }

    // Isolamento y da eq1: b1*y = c1 - a1*x
    // Con b1=±1: y = b1*(c1 - a1*x) = b1*c1 - b1*a1*x
    const yA = -b1 * a1; // coeff di x nell'espressione di y
    const yC = b1 * c1;  // termine costante

    // Sostituzione in eq2: a2*x + b2*(yA*x + yC) = c2
    // => (a2 + b2*yA)*x = c2 - b2*yC
    const rCoeff = a2! + b2! * yA;
    const rRHS = c2! - b2! * yC;

    return { a1, b1, c1, a2: a2!, b2: b2!, c2: c2!, nature, x0, y0, yA, yC, rCoeff, rRHS };
}

// ============ COMPONENTE PRINCIPALE ============

export default function SistemiPrimoGradoSostituzioneDemo() {
    const { isMobile, isTablet } = useBreakpoint();
    const [sys, setSys] = useState<SystemDef>(() => generateSystem());
    const { currentStep, nextStep, prevStep, showAll, reset } = useStepNavigation(5);

    const isActive = (n: number) => currentStep >= n - 1;

    const handleGenerate = useCallback(() => {
        setSys(generateSystem());
        reset();
    }, [reset]);

    // ---- LaTeX computati ----
    const latex = useMemo(() => {
        const { a1, b1, c1, a2, b2, c2, nature, yA, yC, rCoeff, rRHS } = sys;

        const eq1orig = `${linLHS(a1, b1)} = ${c1}`;
        const eq2orig = `${linLHS(a2, b2)} = ${c2}`;
        const yExpr  = linX(yA, yC);

        // ── sistemi aggiornati ad ogni step ──────────────────────────────

        // Step 1 – sistema originale
        const sys1 = `\\begin{cases} ${eq1orig} \\\\ ${eq2orig} \\end{cases}`;

        // Step 2 – isoliamo y dalla (1): eq1 → y = expr, eq2 invariata
        const sys2 = `\\begin{cases} y = ${yExpr} \\\\ ${eq2orig} \\end{cases}`;

        // Step 3 – sostituiamo y nella (2)
        const xPart = a2 !== 0 ? mono(a2, "x") : "";
        const bAbs = Math.abs(b2);
        const bSign = b2 > 0 ? "+" : "-";
        const bCoef = bAbs === 1 ? "" : `${bAbs}`;
        const substEq2 = xPart
            ? `${xPart} ${bSign} ${bCoef}(${yExpr}) = ${c2}`
            : `${bSign === "-" ? "-" : ""}${bCoef}(${yExpr}) = ${c2}`;
        const sys3 = `\\begin{cases} y = ${yExpr} \\\\ ${substEq2} \\end{cases}`;

        // Step 4 – risolviamo la (2) per x
        let eq2step4: string;
        let sys4: string;
        if (rCoeff === 0) {
            eq2step4 = `0 = ${rRHS}`;
            sys4 = `\\begin{cases} y = ${yExpr} \\\\ 0 = ${rRHS} \\end{cases}`;
        } else {
            const xFmt = formatNumberLatex(rRHS / rCoeff);
            eq2step4 = `x = ${xFmt}`;
            sys4 = `\\begin{cases} y = ${yExpr} \\\\ x = ${xFmt} \\end{cases}`;
        }

        // Step 5 – sostituiamo x nella (1) per trovare y
        let sys5: string;
        let solutionLatex: string;
        if (nature === "impossible") {
            sys5 = `\\text{Sistema impossibile} \\;\\Rightarrow\\; S = \\emptyset`;
            solutionLatex = `S = \\emptyset`;
        } else if (nature === "indeterminate") {
            sys5 = `\\text{Sistema indeterminato} \\;\\Rightarrow\\; \\infty\\text{ soluzioni}`;
            solutionLatex = `S = \\{(x, y) : ${eq1orig}\\}`;
        } else {
            const xVal = rRHS / rCoeff;
            const yVal = yA * xVal + yC;
            const xFmt = formatNumberLatex(xVal);
            const yFmt = formatNumberLatex(yVal);
            sys5 = `\\begin{cases} x = ${xFmt} \\\\ y = ${yFmt} \\end{cases}`;
            solutionLatex = `(x,\\, y) = (${xFmt},\\, ${yFmt})`;
        }

        // ── calcoli intermedi (mostrati sotto al sistema) ─────────────────

        // Step 2 – lavoro su eq1
        const b1yTerm = b1 === 1 ? "y" : "-y";
        const work2 = `\\begin{aligned}
            &${eq1orig} \\\\
            &${b1yTerm} = ${c1} ${signedMono(-a1, "x")} \\\\
            &y = ${yExpr}
        \\end{aligned}`;

        // Step 3 – sostituzione visiva
        const work3 = `${eq2orig} \\xrightarrow{\\,y\\,=\\,${yExpr}\\,} ${substEq2}`;

        // Step 4 – espansione + risoluzione
        let expanded = a2 !== 0 ? mono(a2, "x") : "";
        const p2 = b2 * yA;
        if (p2 !== 0) expanded += ` ${signedMono(p2, "x")}`;
        const pk = b2 * yC;
        if (pk !== 0) expanded += ` ${signedConst(pk)}`;
        expanded = expanded.trim() || "0";

        let work4: string;
        if (rCoeff === 0) {
            work4 = `\\begin{aligned} &${substEq2} \\\\ &${expanded} = ${c2} \\\\ &${eq2step4} \\end{aligned}`;
        } else {
            const xFmt = formatNumberLatex(rRHS / rCoeff);
            work4 = `\\begin{aligned} &${substEq2} \\\\ &${expanded} = ${c2} \\\\ &${mono(rCoeff, "x")} = ${rRHS} \\\\ &x = ${xFmt} \\end{aligned}`;
        }

        // Step 5 – calcolo y
        let work5: string;
        if (nature === "unique") {
            const xVal  = rRHS / rCoeff;
            const yVal  = yA * xVal + yC;
            const xFmt  = formatNumberLatex(xVal);
            const yFmt  = formatNumberLatex(yVal);
            const calcA = yA !== 0 ? `${yA} \\cdot ${xFmt}` : "";
            const calcC = yC !== 0 ? ` ${signedConst(yC)}` : "";
            const calc  = (calcA + calcC).trim() || "0";
            work5 = `\\begin{aligned} &y = ${yExpr} \\\\ &y = ${calc} \\\\ &y = ${yFmt} \\end{aligned}`;
        } else {
            work5 = sys5;
        }

        return { sys1, sys2, sys3, sys4, sys5, work2, work3, work4, work5, solutionLatex };
    }, [sys]);

    // ---- Blocco sistema (riusato in ogni step) ----
    const sysBox = (sysLatex: string, label: string) => (
        <div style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: "10px 16px",
            marginBottom: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
        }}>
            <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, alignSelf: "flex-start" }}>{label}</span>
            <div style={{ fontSize: isMobile ? 18 : 20 }}>
                <Latex display>{sysLatex}</Latex>
            </div>
        </div>
    );

    const workBox = (workLatex: string, label: string) => (
        <div style={{ background: "#fff", borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: isMobile ? 15 : 16, overflowX: "auto" }}>
                <Latex display>{workLatex}</Latex>
            </div>
        </div>
    );

    // ============ STEP CARDS ============

    const Step1 = (
        <StepCard stepNumber={1} title="Il sistema" color="green" isActive={isActive(1)}>
            <CollapsibleExplanation title="Spiegazione">
                <div>
                    <p>Un sistema di due equazioni lineari ha la forma normale:</p>
                    <Latex display>{"\\begin{cases} a_1 x + b_1 y = c_1 \\\\ a_2 x + b_2 y = c_2 \\end{cases}"}</Latex>
                    <p>Con il <strong>metodo di sostituzione</strong>: ricaviamo una variabile da un'equazione e la sostituiamo nell'altra.</p>
                </div>
            </CollapsibleExplanation>
            {sysBox(latex.sys1, "Sistema di partenza")}
        </StepCard>
    );

    const Step2 = (
        <StepCard stepNumber={2} title="Ricava y dalla (1)" color="blue" isActive={isActive(2)}>
            <CollapsibleExplanation title="Spiegazione">
                <div>
                    <p>Dalla 1ª equazione isolo <Latex>{"y"}</Latex> spostando <Latex>{"a_1 x"}</Latex> al secondo membro.</p>
                    <p>Ottengo <Latex>{"y = \\alpha x + k"}</Latex> che userò nei passi successivi.</p>
                </div>
            </CollapsibleExplanation>
            {sysBox(latex.sys2, "Sistema equivalente dopo il passo 2")}
            {workBox(latex.work2, "Calcolo — isolamento di y dalla (1)")}
        </StepCard>
    );

    const Step3 = (
        <StepCard stepNumber={3} title="Sostituisci y nella (2)" color="amber" isActive={isActive(3)}>
            <CollapsibleExplanation title="Spiegazione">
                <div>
                    <p>Al posto di <Latex>{"y"}</Latex> nella 2ª equazione scrivo l'espressione trovata al passo 2.</p>
                    <p>La (2) diventa un'equazione nella <strong>sola incognita</strong> <Latex>{"x"}</Latex>.</p>
                </div>
            </CollapsibleExplanation>
            {sysBox(latex.sys3, "Sistema equivalente dopo il passo 3")}
            {workBox(latex.work3, "Sostituzione di y nella (2)")}
        </StepCard>
    );

    const Step4 = (
        <StepCard stepNumber={4} title="Risolvi la (2) per x" color="purple" isActive={isActive(4)}>
            <CollapsibleExplanation title="Spiegazione">
                <div>
                    <p>Espando e raccolgo i termini in <Latex>{"x"}</Latex>, poi divido.</p>
                    <p>Se il coefficiente di <Latex>{"x"}</Latex> si annulla:</p>
                    <ul>
                        <li><strong>0 = k ≠ 0</strong>: impossibile</li>
                        <li><strong>0 = 0</strong>: indeterminato</li>
                    </ul>
                </div>
            </CollapsibleExplanation>
            {sysBox(latex.sys4, "Sistema equivalente dopo il passo 4")}
            {workBox(latex.work4, "Calcolo — risoluzione della (2)")}
        </StepCard>
    );

    const isUnique    = sys.nature === "unique";
    const isImpossible = sys.nature === "impossible";

    const Step5 = (
        <StepCard
            stepNumber={5}
            title={isUnique ? "Sostituisci x nella (1) → y" : "Conclusione"}
            color={isUnique ? "green" : isImpossible ? "red" : "amber"}
            isActive={isActive(5)}
            fullWidth
        >
            <CollapsibleExplanation title="Spiegazione">
                <div>
                    {isUnique && <p>Sostituisco il valore di <Latex>{"x"}</Latex> nell'espressione di <Latex>{"y"}</Latex> ricavata al passo 2 e ottengo il valore di <Latex>{"y"}</Latex>.</p>}
                    {isImpossible && <p>L'equazione <Latex>{"0 = k \\neq 0"}</Latex> non ha soluzione: le due rette sono <strong>parallele</strong>. <Latex>{"S = \\emptyset"}</Latex>.</p>}
                    {sys.nature === "indeterminate" && <p>L'equazione <Latex>{"0 = 0"}</Latex> è sempre vera: le due rette <strong>coincidono</strong>. Infinite soluzioni.</p>}
                </div>
            </CollapsibleExplanation>

            <div style={{ display: "grid", gridTemplateColumns: isUnique && !isMobile ? "1fr 1fr" : "1fr", gap: 12 }}>
                {isUnique && workBox(latex.work5, "Calcolo — sostituzione di x nella (1)")}
                <div style={{
                    background: isUnique ? "#f0fdf4" : isImpossible ? "#fef2f2" : "#fffbeb",
                    borderRadius: 8,
                    padding: "12px 16px",
                    border: `1px solid ${isUnique ? "#bbf7d0" : isImpossible ? "#fecaca" : "#fde68a"}`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                }}>
                    <div style={{ fontWeight: 700, color: isUnique ? "#166534" : isImpossible ? "#991b1b" : "#92400e", fontSize: isMobile ? 14 : 15 }}>
                        {isUnique ? "Soluzione" : isImpossible ? "Sistema impossibile" : "Sistema indeterminato"}
                    </div>
                    <div style={{ fontSize: isMobile ? 20 : 22 }}>
                        <Latex display>{latex.sys5}</Latex>
                    </div>
                    <div style={{ fontSize: isMobile ? 13 : 14, color: "#64748b" }}>
                        <Latex>{latex.solutionLatex}</Latex>
                    </div>
                </div>
            </div>
        </StepCard>
    );

    // ---- Riquadro metodo ----
    const MethodContent = (
        <div style={{ fontSize: 13 }}>
            <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
                <li>Scrivi il sistema in <strong>forma normale</strong></li>
                <li>
                    <strong>Ricava</strong> una variabile da un'equazione (scegli quella con coefficiente ±1)
                </li>
                <li>
                    <strong>Sostituisci</strong> l'espressione nell'altra equazione
                </li>
                <li>
                    <strong>Risolvi</strong> l'equazione in una sola incognita
                </li>
                <li>
                    <strong>Calcola</strong> la seconda variabile per sostituzione inversa
                </li>
            </ol>
        </div>
    );

    // ============ MOBILE ============
    if (isMobile) {
        return (
            <DemoContainer title="Sistemi lineari – Sostituzione" description="Risolvi step-by-step">
                <div style={{ marginBottom: 12 }}>
                    <GenerateButton text="Nuovo sistema" onClick={handleGenerate} />
                </div>
                <ProblemCard label="Risolvi il sistema:">
                    <div style={{ textAlign: "center", fontSize: 20 }}>
                        <Latex display>{latex.sys1}</Latex>
                    </div>
                </ProblemCard>
                <NavigationButtons
                    currentStep={currentStep}
                    totalSteps={5}
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
                                    {Step1}{Step2}{Step3}{Step4}{Step5}
                                </div>
                            ),
                        },
                        {
                            id: "method",
                            label: "💡 Metodo",
                            content: (
                                <CollapsiblePanel title="Metodo di sostituzione" defaultOpen>
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
                title="Sistemi di equazioni lineari – Metodo di sostituzione"
                description="Risoluzione passo dopo passo con il metodo di sostituzione."
            >
                <div style={{ marginBottom: 16 }}>
                    <GenerateButton text="Nuovo sistema" onClick={handleGenerate} />
                </div>
                <ProblemCard label="Risolvi il sistema:">
                    <div style={{ textAlign: "center" }}>
                        <Latex display>{latex.sys1}</Latex>
                    </div>
                </ProblemCard>
                <NavigationButtons
                    currentStep={currentStep}
                    totalSteps={5}
                    onNext={nextStep}
                    onPrev={prevStep}
                    onShowAll={showAll}
                />
                <ResponsiveGrid columns={{ tablet: 2 }} gap={12}>
                    {Step1}{Step2}
                </ResponsiveGrid>
                <div style={{ marginTop: 12 }}>{Step3}</div>
                <ResponsiveGrid columns={{ tablet: 2 }} gap={12} style={{ marginTop: 12 }}>
                    {Step4}{Step5}
                </ResponsiveGrid>
                <div style={{ marginTop: 16 }}>
                    <CollapsiblePanel title="💡 Metodo di sostituzione" defaultOpen={false}>
                        {MethodContent}
                    </CollapsiblePanel>
                </div>
            </DemoContainer>
        );
    }

    // ============ DESKTOP ============
    return (
        <DemoContainer
            title="Sistemi di equazioni lineari – Metodo di sostituzione"
            description="Risoluzione passo dopo passo con il metodo di sostituzione."
        >
            <div style={{ marginBottom: 20 }}>
                <GenerateButton text="Nuovo sistema" onClick={handleGenerate} />
            </div>
            <ProblemCard label="Risolvi il sistema:">
                <div style={{ textAlign: "center" }}>
                    <Latex display>{latex.sys1}</Latex>
                </div>
            </ProblemCard>
            <NavigationButtons
                currentStep={currentStep}
                totalSteps={5}
                onNext={nextStep}
                onPrev={prevStep}
                onShowAll={showAll}
            />
            <ResponsiveGrid columns={{ desktop: 2 }} gap={12}>
                {Step1}{Step2}
            </ResponsiveGrid>
            <div style={{ marginTop: 12 }}>{Step3}</div>
            <ResponsiveGrid columns={{ desktop: 2 }} gap={12} style={{ marginTop: 12 }}>
                {Step4}{Step5}
            </ResponsiveGrid>
            <InfoBox title="Schema del metodo:">{MethodContent}</InfoBox>
        </DemoContainer>
    );
}
