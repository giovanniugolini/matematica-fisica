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

/** Monomio a*v: gestisce 0, 1, -1 */
function mono(c: number, v: string): string {
    if (c === 0) return "0";
    if (c === 1) return v;
    if (c === -1) return `-${v}`;
    return `${c}${v}`;
}

/** Termine con segno esplicito (dopo il primo termine) */
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
    return `${n}`;
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

/** Espressione lineare a*v + k (v = variabile qualsiasi) */
function varExpr(a: number, v: string, k: number): string {
    let s = a !== 0 ? mono(a, v) : "";
    if (k !== 0) {
        if (s === "" || s === "0") s = `${k}`;
        else s += ` ${signedConst(k)}`;
    }
    return s || "0";
}

// ============ TIPI ============

type Nature = "unique" | "impossible" | "indeterminate";

interface SystemDef {
    a1: number; b1: number; c1: number;
    a2: number; b2: number; c2: number;
    nature: Nature;
    x0?: number; y0?: number;
    // Scelta di isolamento: V = isolateVar, W = altra variabile
    isolateFrom: 1 | 2;
    isolateVar: "x" | "y";
    // V = exprA * W + exprC
    exprA: number; exprC: number;
    // equazione risolvente: rCoeff * W = rRHS
    rCoeff: number; rRHS: number;
}

// ============ HELPER: scelta migliore della variabile da isolare ============

function chooseBestIsolation(
    a1: number, b1: number, a2: number, b2: number
): { from: 1 | 2; var: "x" | "y" } {
    const candidates: { from: 1 | 2; var: "x" | "y"; coeff: number }[] = [
        { from: 1, var: "x", coeff: a1 },
        { from: 1, var: "y", coeff: b1 },
        { from: 2, var: "x", coeff: a2 },
        { from: 2, var: "y", coeff: b2 },
    ];
    // Preferisci |coeff| = 1 (nessuna frazione)
    const unit = candidates.filter(c => Math.abs(c.coeff) === 1);
    const pool = unit.length > 0 ? unit : candidates.sort((a, b) => Math.abs(a.coeff) - Math.abs(b.coeff)).slice(0, 1);
    return pool[Math.floor(Math.random() * pool.length)];
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

    if (nature === "unique") {
        // Genera coefficienti con almeno un ±1 (per isolamento pulito)
        let attempt = 0;
        do {
            a1 = randomNonZero(-3, 3);
            b1 = randomNonZero(-3, 3);
            a2 = randomNonZero(-3, 3);
            b2 = randomNonZero(-3, 3);
            // Forza almeno un ±1 in posizione casuale
            const pos = randomInt(0, 3);
            const val = randomChoice<number>([1, -1]);
            if (pos === 0) a1 = val; else if (pos === 1) b1 = val;
            else if (pos === 2) a2 = val; else b2 = val;
            attempt++;
        } while (a1! * b2! - a2! * b1! === 0 && attempt < 100);

        x0 = randomInt(-4, 4);
        y0 = randomInt(-4, 4);
        c1 = a1! * x0 + b1! * y0;
        c2 = a2! * x0 + b2! * y0;
    } else {
        // impossible/indeterminate: b1=±1, eq2 proporzionale a eq1
        b1 = randomChoice<number>([1, -1]);
        a1 = randomNonZero(-3, 3);
        const k = randomChoice<number>([2, -2, 3]);
        a2 = k * a1; b2 = k * b1;
        const tx = randomInt(-3, 3), ty = randomInt(-3, 3);
        c1 = a1 * tx + b1 * ty;
        c2 = nature === "impossible"
            ? k * c1 + randomChoice<number>([1, -1, 2, -2])
            : k * c1;
    }

    const _a1 = a1!, _b1 = b1!, _c1 = c1!;
    const _a2 = a2!, _b2 = b2!, _c2 = c2!;

    // Scegli la variabile e l'equazione migliore da cui isolare
    const choice = chooseBestIsolation(_a1, _b1, _a2, _b2);
    const isolateFrom = choice.from;
    const isolateVar  = choice.var;

    // Coefficienti dell'equazione da cui si isola
    // cv = coeff di V, cw = coeff di W (altra var), c = rhs
    const cv = isolateFrom === 1
        ? (isolateVar === "x" ? _a1 : _b1)
        : (isolateVar === "x" ? _a2 : _b2);
    const cw = isolateFrom === 1
        ? (isolateVar === "x" ? _b1 : _a1)
        : (isolateVar === "x" ? _b2 : _a2);
    const c  = isolateFrom === 1 ? _c1 : _c2;

    // Con |cv| = 1: V = cv*(c - cw*W) = cv*c - cv*cw*W
    const exprA = -cv * cw; // coeff di W
    const exprC =  cv * c;  // termine noto

    // Coefficienti dell'equazione *altra* (quella in cui si sostituisce)
    const cv2 = isolateFrom === 1
        ? (isolateVar === "x" ? _a2 : _b2)
        : (isolateVar === "x" ? _a1 : _b1);
    const cw2 = isolateFrom === 1
        ? (isolateVar === "x" ? _b2 : _a2)
        : (isolateVar === "x" ? _b1 : _a1);
    const c2_ = isolateFrom === 1 ? _c2 : _c1;

    // Dopo sostituzione: (cv2*exprA + cw2)*W = c2_ - cv2*exprC
    const rCoeff = cv2 * exprA + cw2;
    const rRHS   = c2_ - cv2 * exprC;

    return {
        a1: _a1, b1: _b1, c1: _c1,
        a2: _a2, b2: _b2, c2: _c2,
        nature, x0, y0,
        isolateFrom, isolateVar, exprA, exprC, rCoeff, rRHS,
    };
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
        const { a1, b1, c1, a2, b2, c2, nature, isolateFrom, isolateVar, exprA, exprC, rCoeff, rRHS } = sys;

        const V = isolateVar;               // variabile isolata
        const W = V === "x" ? "y" : "x";   // altra variabile

        const eq1orig = `${linLHS(a1, b1)} = ${c1}`;
        const eq2orig = `${linLHS(a2, b2)} = ${c2}`;

        // Espressione di V in funzione di W: V = exprA*W + exprC
        const vExpr = varExpr(exprA, W, exprC);
        const isolatedLine = `${V} = ${vExpr}`;

        // ── sistemi aggiornati ad ogni step ────────────────────────────────

        // Step 1 – originale
        const sys1 = `\\begin{cases} ${eq1orig} \\\\ ${eq2orig} \\end{cases}`;

        // Step 2 – V isolata dalla eq "isolateFrom"; altra eq invariata
        const sys2 = isolateFrom === 1
            ? `\\begin{cases} ${isolatedLine} \\\\ ${eq2orig} \\end{cases}`
            : `\\begin{cases} ${eq1orig} \\\\ ${isolatedLine} \\end{cases}`;

        // Coefficienti dell'equazione in cui si sostituisce (quella "altra")
        const cv2 = isolateFrom === 1 ? (V === "x" ? a2 : b2) : (V === "x" ? a1 : b1);
        const cw2 = isolateFrom === 1 ? (V === "x" ? b2 : a2) : (V === "x" ? b1 : a1);
        const c2_ = isolateFrom === 1 ? c2 : c1;
        const otherOrig = isolateFrom === 1 ? eq2orig : eq1orig;

        // Equazione con V sostituito: cv2*(vExpr) + cw2*W = c2_
        const vParen = Math.abs(cv2) === 1
            ? (cv2 === 1 ? `(${vExpr})` : `-(${vExpr})`)
            : `${cv2}(${vExpr})`;
        const substEq = cw2 !== 0
            ? `${vParen} ${signedMono(cw2, W)} = ${c2_}`
            : `${vParen} = ${c2_}`;

        // Step 3 – sostituzione fatta nell'altra eq
        const sys3 = isolateFrom === 1
            ? `\\begin{cases} ${isolatedLine} \\\\ ${substEq} \\end{cases}`
            : `\\begin{cases} ${substEq} \\\\ ${isolatedLine} \\end{cases}`;

        // Step 4 – W risolto
        const wLine = rCoeff === 0 ? `0 = ${rRHS}` : `${W} = ${formatNumberLatex(rRHS / rCoeff)}`;
        const sys4 = isolateFrom === 1
            ? `\\begin{cases} ${isolatedLine} \\\\ ${wLine} \\end{cases}`
            : `\\begin{cases} ${wLine} \\\\ ${isolatedLine} \\end{cases}`;

        // Step 5 – entrambe le variabili note (x sempre prima)
        let sys5: string;
        let solutionLatex: string;
        if (nature === "impossible") {
            sys5 = `\\text{Sistema impossibile} \\;\\Rightarrow\\; S = \\emptyset`;
            solutionLatex = `S = \\emptyset`;
        } else if (nature === "indeterminate") {
            sys5 = `\\text{Sistema indeterminato (}\\infty\\text{ soluzioni)}`;
            solutionLatex = `\\infty\\text{ soluzioni}`;
        } else {
            const wVal = rRHS / rCoeff;
            const vVal = exprA * wVal + exprC;
            const wFmt = formatNumberLatex(wVal);
            const vFmt = formatNumberLatex(vVal);
            const xFmt = V === "x" ? vFmt : wFmt;
            const yFmt = V === "y" ? vFmt : wFmt;
            sys5 = `\\begin{cases} x = ${xFmt} \\\\ y = ${yFmt} \\end{cases}`;
            solutionLatex = `(x,\\, y) = (${xFmt},\\, ${yFmt})`;
        }

        // ── calcoli intermedi ──────────────────────────────────────────────

        // Step 2: isolamento di V dall'equazione scelta
        const cv = isolateFrom === 1 ? (V === "x" ? a1 : b1) : (V === "x" ? a2 : b2);
        const cw = isolateFrom === 1 ? (V === "x" ? b1 : a1) : (V === "x" ? b2 : a2);
        const c  = isolateFrom === 1 ? c1 : c2;
        const origLine = isolateFrom === 1 ? eq1orig : eq2orig;
        const cvVterm = mono(cv, V);
        const moved = `${cvVterm} = ${c} ${signedMono(-cw, W)}`;
        const work2 = `\\begin{aligned} &${origLine} \\\\ &${moved} \\\\ &${isolatedLine} \\end{aligned}`;

        // Step 3: sostituzione visiva
        const work3 = `${otherOrig} \\;\\xrightarrow{\\;${V}\\,=\\,${vExpr}\\;}\\; ${substEq}`;

        // Step 4: espansione e risoluzione
        let expLine = "";
        const t1 = cv2 * exprA;
        const t2 = cw2;
        const tk = cv2 * exprC;
        if (t1 !== 0) expLine += mono(t1, W);
        if (t2 !== 0) expLine += expLine ? ` ${signedMono(t2, W)}` : mono(t2, W);
        if (tk !== 0) expLine += ` ${signedConst(tk)}`;
        expLine = expLine.trim() || "0";

        let work4: string;
        if (rCoeff === 0) {
            work4 = `\\begin{aligned} &${substEq} \\\\ &${expLine} = ${c2_} \\\\ &0 = ${rRHS} \\end{aligned}`;
        } else {
            const wFmt = formatNumberLatex(rRHS / rCoeff);
            work4 = `\\begin{aligned} &${substEq} \\\\ &${expLine} = ${c2_} \\\\ &${mono(rCoeff, W)} = ${rRHS} \\\\ &${W} = ${wFmt} \\end{aligned}`;
        }

        // Step 5: sostituzione inversa per trovare V
        let work5: string;
        if (nature === "unique") {
            const wVal = rRHS / rCoeff;
            const wFmt = formatNumberLatex(wVal);
            const vVal = exprA * wVal + exprC;
            const vFmt = formatNumberLatex(vVal);
            const calcA = exprA !== 0 ? `${exprA} \\cdot ${wFmt}` : "";
            const calcC = exprC !== 0 ? ` ${signedConst(exprC)}` : "";
            const calc  = (calcA + calcC).trim() || "0";
            work5 = `\\begin{aligned} &${V} = ${vExpr} \\\\ &${V} = ${calc} \\\\ &${V} = ${vFmt} \\end{aligned}`;
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

    const otherEqNum = sys.isolateFrom === 1 ? 2 : 1;
    const otherVar   = sys.isolateVar === "x" ? "y" : "x";
    const step2Title = `Ricava ${sys.isolateVar} dalla (${sys.isolateFrom})`;

    const Step2 = (
        <StepCard stepNumber={2} title={step2Title} color="blue" isActive={isActive(2)}>
            <CollapsibleExplanation title="Spiegazione">
                <div>
                    <p>Dalla ({sys.isolateFrom}) isolo <Latex>{sys.isolateVar}</Latex> perché ha coefficiente ±1: non servono frazioni.</p>
                    <p>Ottengo <Latex>{`${sys.isolateVar} = \\alpha ${otherVar} + k`}</Latex> che userò nei passi successivi.</p>
                </div>
            </CollapsibleExplanation>
            {sysBox(latex.sys2, "Sistema equivalente dopo il passo 2")}
            {workBox(latex.work2, "Calcolo — isolamento di y dalla (1)")}
        </StepCard>
    );

    const Step3 = (
        <StepCard stepNumber={3} title={`Sostituisci ${sys.isolateVar} nella (${otherEqNum})`} color="amber" isActive={isActive(3)}>
            <CollapsibleExplanation title="Spiegazione">
                <div>
                    <p>Al posto di <Latex>{sys.isolateVar}</Latex> nella ({otherEqNum}) scrivo l'espressione trovata al passo 2.</p>
                    <p>La ({otherEqNum}) diventa un'equazione nella <strong>sola incognita</strong> <Latex>{otherVar}</Latex>.</p>
                </div>
            </CollapsibleExplanation>
            {sysBox(latex.sys3, "Sistema equivalente dopo il passo 3")}
            {workBox(latex.work3, "Sostituzione di y nella (2)")}
        </StepCard>
    );

    const Step4 = (
        <StepCard stepNumber={4} title={`Risolvi la (${otherEqNum}) per ${otherVar}`} color="purple" isActive={isActive(4)}>
            <CollapsibleExplanation title="Spiegazione">
                <div>
                    <p>Espando e raccolgo i termini in <Latex>{otherVar}</Latex>, poi divido.</p>
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
            title={isUnique ? `Sostituisci ${otherVar} nella (${sys.isolateFrom}) → ${sys.isolateVar}` : "Conclusione"}
            color={isUnique ? "green" : isImpossible ? "red" : "amber"}
            isActive={isActive(5)}
            fullWidth
        >
            <CollapsibleExplanation title="Spiegazione">
                <div>
                    {isUnique && <p>Sostituisco il valore di <Latex>{otherVar}</Latex> nell'espressione di <Latex>{sys.isolateVar}</Latex> ricavata al passo 2.</p>}
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
