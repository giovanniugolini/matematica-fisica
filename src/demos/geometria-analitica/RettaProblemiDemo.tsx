/**
 * RettaProblemiDemo
 * Risoluzione step-by-step di problemi sulla retta tramite "pulsanti formula"
 * Tipi di problema: retta per due punti, per un punto con m noto,
 *                   parallela / perpendicolare a una retta nota per un punto
 *
 * Per i problemi "due punti" l'utente può scegliere tra due percorsi:
 *   A) coeff-angolare → retta-per-punto → forma-esplicita
 *   B) retta-due-punti → forma-esplicita
 */

import React, { useState, useCallback } from "react";
import {
    DemoContainer,
    GenerateButton,
    useBreakpoint,
    CollapsiblePanel,
} from "../../components/ui";
import { DisplayMath, Latex } from "../../components/ui/Latex";
import { CoordinatePlane } from "../../components/ui/CoordinatePlane";
import { randomInt, randomNonZero, randomChoice } from "../../utils/math";

// ============ MATH HELPERS ============

function gcd(a: number, b: number): number {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { [a, b] = [b, a % b]; }
    return a || 1;
}

function simplifyFrac(num: number, den: number): [number, number] {
    if (den === 0) return [num > 0 ? Infinity : -Infinity, 1] as any;
    const g = gcd(Math.abs(num), Math.abs(den));
    const n = (num / g) * (den < 0 ? -1 : 1);
    const d = Math.abs(den / g);
    return [n, d];
}

function fracLatex(num: number, den: number): string {
    const [n, d] = simplifyFrac(num, den);
    if (d === 1) return `${n}`;
    return `\\dfrac{${n}}{${d}}`;
}

function fracVal(num: number, den: number): number { return num / den; }

/** LaTeX "y = mx + q" dati m (come frazione mNum/mDen) e q intero */
function lineLatex(mNum: number, mDen: number, q: number): string {
    const [mn, md] = simplifyFrac(mNum, mDen);
    const mStr = md === 1 ? `${mn}` : `\\dfrac{${mn}}{${md}}`;

    let mTerm = "";
    if (mn === 0) mTerm = "";
    else if (mn === 1 && md === 1) mTerm = "x";
    else if (mn === -1 && md === 1) mTerm = "-x";
    else mTerm = `${mStr}x`;

    const absQ = Math.abs(q);
    const qStr = absQ.toString();

    let qTerm = "";
    if (q === 0) qTerm = "";
    else if (mTerm === "") qTerm = `${q}`;
    else qTerm = q > 0 ? ` + ${qStr}` : ` - ${qStr}`;

    if (mTerm === "" && qTerm === "") return "y = 0";
    return `y = ${mTerm}${qTerm}`;
}

function ptLatex(x: number, y: number): string { return `(${x},\\,${y})`; }

// ============ TYPES ============

type ProblemType = "two-points" | "point-slope" | "point-parallel" | "point-perp";

type FormulaId =
    | "coeff-angolare"
    | "retta-due-punti"
    | "retta-per-punto"
    | "parallele"
    | "perpendicolari"
    | "forma-esplicita";

interface SolvedStep {
    formulaId: FormulaId;
    lines: string[];
}

interface Problem {
    type: ProblemType;
    questionLines: string[];
    x1: number; y1: number;
    x2?: number; y2?: number;
    refMNum?: number; refMDen?: number;
    refQ?: number;
    givenMNum?: number; givenMDen?: number;
    solMNum: number; solMDen: number;
    solQ: number;
    // Percorsi alternativi: ogni percorso è una sequenza di FormulaId
    paths: FormulaId[][];
}

// ============ FORMULA REGISTRY ============

interface FormulaInfo {
    id: FormulaId;
    label: string;
    formula: string;
    color: string;
}

const FORMULAS: FormulaInfo[] = [
    {
        id: "coeff-angolare",
        label: "Coefficiente angolare",
        formula: "m = \\dfrac{y_2 - y_1}{x_2 - x_1}",
        color: "#3b82f6",
    },
    {
        id: "retta-due-punti",
        label: "Retta per due punti",
        formula: "\\dfrac{y - y_1}{y_2 - y_1} = \\dfrac{x - x_1}{x_2 - x_1}",
        color: "#e11d48",
    },
    {
        id: "retta-per-punto",
        label: "Retta per un punto",
        formula: "y - y_0 = m(x - x_0)",
        color: "#8b5cf6",
    },
    {
        id: "parallele",
        label: "Rette parallele",
        formula: "m_1 = m_2",
        color: "#0891b2",
    },
    {
        id: "perpendicolari",
        label: "Rette perpendicolari",
        formula: "m_1 \\cdot m_2 = -1",
        color: "#d97706",
    },
    {
        id: "forma-esplicita",
        label: "Forma esplicita",
        formula: "y = mx + q",
        color: "#16a34a",
    },
];

// ============ PROBLEM GENERATOR ============

function generateProblem(type: ProblemType): Problem {
    const niceSlopes: [number, number][] = [
        [-3, 1], [-2, 1], [-1, 1], [1, 1], [2, 1], [3, 1],
        [-1, 2], [1, 2], [-3, 2], [3, 2],
    ];
    const [mNum, mDen] = randomChoice(niceSlopes);
    const q = randomInt(-4, 4);

    if (type === "two-points") {
        // x multipli di mDen per avere y interi
        const step = mDen;
        const xs: number[] = [];
        for (let x = -4; x <= 4; x += step) xs.push(x);
        const ax1 = randomChoice(xs);
        const ax2 = randomChoice(xs.filter(x => x !== ax1));
        const ay1 = (mNum * ax1 + q * mDen) / mDen;
        const ay2 = (mNum * ax2 + q * mDen) / mDen;

        return {
            type,
            questionLines: [
                `\\text{Trova l'equazione della retta passante per i punti}`,
                `P_1${ptLatex(ax1, ay1)} \\quad \\text{e} \\quad P_2${ptLatex(ax2, ay2)}`,
            ],
            x1: ax1, y1: ay1, x2: ax2, y2: ay2,
            solMNum: mNum, solMDen: mDen, solQ: q,
            paths: [
                ["coeff-angolare", "retta-per-punto", "forma-esplicita"],
                ["retta-due-punti", "forma-esplicita"],
            ],
        };
    }

    if (type === "point-slope") {
        const step = mDen;
        const px = randomInt(-3, 3) * step;
        const py = (mNum * px + q * mDen) / mDen;
        return {
            type,
            questionLines: [
                `\\text{Trova l'equazione della retta passante per}`,
                `P${ptLatex(px, py)} \\quad \\text{con} \\quad m = ${fracLatex(mNum, mDen)}`,
            ],
            x1: px, y1: py,
            givenMNum: mNum, givenMDen: mDen,
            solMNum: mNum, solMDen: mDen, solQ: q,
            paths: [["retta-per-punto", "forma-esplicita"]],
        };
    }

    if (type === "point-parallel") {
        const qRef = q + randomNonZero(-3, 3);
        const step = mDen;
        const px = randomInt(-3, 3) * step;
        const py = (mNum * px + q * mDen) / mDen;
        return {
            type,
            questionLines: [
                `\\text{Trova la retta passante per } P${ptLatex(px, py)}`,
                `\\text{parallela a} \\quad y = ${lineLatex(mNum, mDen, qRef)}`,
            ],
            x1: px, y1: py,
            refMNum: mNum, refMDen: mDen, refQ: qRef,
            solMNum: mNum, solMDen: mDen, solQ: q,
            paths: [["parallele", "retta-per-punto", "forma-esplicita"]],
        };
    }

    // point-perp
    const refMNum = -mDen, refMDen = mNum;
    const qRef = randomInt(-4, 4);
    const step = mDen;
    const px = randomInt(-3, 3) * step;
    const py = (mNum * px + q * mDen) / mDen;
    return {
        type,
        questionLines: [
            `\\text{Trova la retta passante per } P${ptLatex(px, py)}`,
            `\\text{perpendicolare a} \\quad y = ${lineLatex(refMNum, refMDen, qRef)}`,
        ],
        x1: px, y1: py,
        refMNum, refMDen, refQ: qRef,
        solMNum: mNum, solMDen: mDen, solQ: q,
        paths: [["perpendicolari", "retta-per-punto", "forma-esplicita"]],
    };
}

function generateRandomProblem(): Problem {
    const types: ProblemType[] = ["two-points", "point-slope", "point-parallel", "point-perp"];
    return generateProblem(randomChoice(types));
}

// ============ STEP COMPUTATION ============

function computeStep(
    formulaId: FormulaId,
    problem: Problem,
    appliedIds: FormulaId[],
): SolvedStep {
    const { x1, y1, x2, y2, refMNum, refMDen, solMNum, solMDen, solQ } = problem;

    if (formulaId === "coeff-angolare" && x2 !== undefined && y2 !== undefined) {
        const dy = y2 - y1, dx = x2 - x1;
        return {
            formulaId,
            lines: [
                `m = \\dfrac{y_2 - y_1}{x_2 - x_1} = \\dfrac{${y2} - (${y1})}{${x2} - (${x1})} = \\dfrac{${dy}}{${dx}} = ${fracLatex(dy, dx)}`,
            ],
        };
    }

    if (formulaId === "retta-due-punti" && x2 !== undefined && y2 !== undefined) {
        const dy = y2 - y1, dx = x2 - x1;
        const dySign = dy >= 0 ? dy : `(${dy})`;
        const dxSign = dx >= 0 ? dx : `(${dx})`;
        return {
            formulaId,
            lines: [
                `\\dfrac{y - y_1}{y_2 - y_1} = \\dfrac{x - x_1}{x_2 - x_1}`,
                `\\dfrac{y - (${y1})}{${dySign}} = \\dfrac{x - (${x1})}{${dxSign}}`,
            ],
        };
    }

    if (formulaId === "parallele") {
        return {
            formulaId,
            lines: [
                `\\text{Rette parallele} \\Rightarrow m_1 = m_2`,
                `m = ${fracLatex(refMNum!, refMDen!)}`,
            ],
        };
    }

    if (formulaId === "perpendicolari") {
        const [pn, pd] = simplifyFrac(-refMDen!, refMNum!);
        return {
            formulaId,
            lines: [
                `m_1 \\cdot m_2 = -1 \\Rightarrow m_2 = \\dfrac{-1}{m_1} = \\dfrac{-1}{${fracLatex(refMNum!, refMDen!)}}`,
                `m = ${fracLatex(pn, pd)}`,
            ],
        };
    }

    if (formulaId === "retta-per-punto") {
        const mFrac = fracLatex(solMNum, solMDen);
        const y0 = y1, x0 = x1;
        const ySign = y0 >= 0 ? `- ${y0}` : `+ ${Math.abs(y0)}`;
        const xSign = x0 >= 0 ? `- ${x0}` : `+ ${Math.abs(x0)}`;
        return {
            formulaId,
            lines: [
                `y - y_0 = m(x - x_0)`,
                `y ${ySign} = ${mFrac}\\,(x ${xSign})`,
            ],
        };
    }

    if (formulaId === "forma-esplicita") {
        const fromDuePunti = appliedIds.includes("retta-due-punti");
        if (fromDuePunti && x2 !== undefined && y2 !== undefined) {
            const dy = y2 - y1, dx = x2 - x1;
            // prodotto in croce: dy*(x - x1) = dx*(y - y1)
            // dx*y = dy*x - dy*x1 + dx*y1
            // y = (dy/dx)*x + (-dy*x1 + dx*y1)/dx
            return {
                formulaId,
                lines: [
                    `\\text{Prodotto in croce: } ${dy}\\,(x - ${x1}) = ${dx}\\,(y - ${y1})`,
                    `\\text{Semplificando:}`,
                    lineLatex(solMNum, solMDen, solQ),
                ],
            };
        }
        return {
            formulaId,
            lines: [
                `\\text{Espandendo e semplificando:}`,
                lineLatex(solMNum, solMDen, solQ),
            ],
        };
    }

    return { formulaId, lines: ["..."] };
}

// ============ MAIN COMPONENT ============

export default function RettaProblemiDemo() {
    const { isMobile } = useBreakpoint();

    const [problem, setProblem] = useState<Problem>(() => generateRandomProblem());
    const [appliedSteps, setAppliedSteps] = useState<SolvedStep[]>([]);
    const [activePath, setActivePath] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<{ id: FormulaId; msg: string } | null>(null);

    const handleNewProblem = useCallback(() => {
        setProblem(generateRandomProblem());
        setAppliedSteps([]);
        setActivePath(null);
        setFeedback(null);
    }, []);

    const appliedIds = appliedSteps.map(s => s.formulaId);

    // Formule che aprono un percorso (prime di ogni path)
    const openingFormulas = problem.paths.map(p => p[0]);

    // Prossimo step nel percorso attivo (se scelto)
    const nextInPath = activePath !== null
        ? problem.paths[activePath].find(f => !appliedIds.includes(f)) ?? null
        : null;

    const isSolved = activePath !== null
        && problem.paths[activePath].every(f => appliedIds.includes(f));

    const handleFormulaClick = useCallback((id: FormulaId) => {
        if (appliedIds.includes(id)) return;
        setFeedback(null);

        if (activePath === null) {
            // Nessun percorso ancora scelto
            const pathIdx = problem.paths.findIndex(p => p[0] === id);
            if (pathIdx === -1) {
                // formula non è un'apertura valida
                const isInAnyPath = problem.paths.some(p => p.includes(id));
                setFeedback({ id, msg: isInAnyPath ? "Inizia da un'altra formula" : "Non necessaria per questo problema" });
                setTimeout(() => setFeedback(null), 2000);
                return;
            }
            // Sceglie il percorso e applica il primo step
            const step = computeStep(id, problem, []);
            setActivePath(pathIdx);
            setAppliedSteps([step]);
            return;
        }

        // Percorso già scelto
        const currentPath = problem.paths[activePath];
        if (!currentPath.includes(id)) {
            setFeedback({ id, msg: "Non fa parte del percorso scelto" });
            setTimeout(() => setFeedback(null), 2000);
            return;
        }
        if (id !== nextInPath) {
            const missingId = currentPath.slice(0, currentPath.indexOf(id)).find(f => !appliedIds.includes(f));
            const missingInfo = FORMULAS.find(f => f.id === missingId);
            setFeedback({ id, msg: `Prima usa: ${missingInfo?.label ?? "la formula precedente"}` });
            setTimeout(() => setFeedback(null), 2000);
            return;
        }
        const step = computeStep(id, problem, appliedIds);
        setAppliedSteps(prev => [...prev, step]);
    }, [problem, appliedIds, activePath, nextInPath]);

    // ============ GRAPH DATA ============

    const solM = fracVal(problem.solMNum, problem.solMDen);
    const graphLines: any[] = [];
    if (isSolved) {
        graphLines.push({ slope: solM, intercept: problem.solQ, color: "#16a34a", strokeWidth: 2.5 });
    }
    if (problem.type === "point-parallel" || problem.type === "point-perp") {
        graphLines.push({
            slope: fracVal(problem.refMNum!, problem.refMDen!),
            intercept: problem.refQ!,
            color: "#94a3b8", strokeWidth: 1.5, style: "dashed" as const,
        });
    }
    const graphPoints: any[] = [
        { x: problem.x1, y: problem.y1, label: `P(${problem.x1},${problem.y1})`, color: "#ef4444", radius: 5 },
    ];
    if (problem.type === "two-points" && problem.x2 !== undefined) {
        graphPoints.push({ x: problem.x2, y: problem.y2!, label: `Q(${problem.x2},${problem.y2})`, color: "#f59e0b", radius: 5 });
    }

    // ============ RENDER ============

    const formulaToolbox = (
        <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Strumenti — scegli le formule da applicare
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {FORMULAS.map(f => {
                    const isDone = appliedIds.includes(f.id);
                    const isOpening = openingFormulas.includes(f.id);
                    const isNext =
                        activePath === null ? isOpening :
                        f.id === nextInPath;
                    const isInCurrentPath = activePath !== null
                        ? problem.paths[activePath].includes(f.id)
                        : isOpening;
                    const hasFeedback = feedback?.id === f.id;

                    let bg = "#f8fafc";
                    let border = "2px solid #e2e8f0";
                    let textColor = "#475569";
                    let cursor: string = "pointer";
                    let opacity = 1;

                    if (isDone) {
                        bg = "#f0fdf4"; border = "2px solid #86efac";
                        textColor = "#15803d"; opacity = 0.7; cursor = "default";
                    } else if (isNext) {
                        bg = "#eff6ff"; border = `2px solid ${f.color}`; textColor = "#1e293b";
                    } else if (!isInCurrentPath) {
                        opacity = 0.4; cursor = "not-allowed";
                    } else {
                        // in path ma non ancora raggiungibile
                        border = "2px dashed #cbd5e1"; cursor = "pointer";
                    }

                    return (
                        <button
                            key={f.id}
                            onClick={() => handleFormulaClick(f.id)}
                            style={{
                                background: hasFeedback ? "#fef2f2" : bg,
                                border: hasFeedback ? "2px solid #fca5a5" : border,
                                borderRadius: 10,
                                padding: "10px 14px",
                                cursor,
                                opacity,
                                textAlign: "left",
                                minWidth: isMobile ? "calc(50% - 4px)" : 170,
                                transition: "all 0.15s",
                            }}
                        >
                            <div style={{ fontSize: 12, fontWeight: 700, color: isDone ? "#15803d" : f.color, marginBottom: 4 }}>
                                {isDone ? "✓ " : isNext ? "▶ " : ""}{f.label}
                            </div>
                            <div style={{ fontSize: 13, color: textColor }}>
                                <Latex>{f.formula}</Latex>
                            </div>
                            {hasFeedback && (
                                <div style={{ fontSize: 11, color: "#dc2626", marginTop: 4, fontStyle: "italic" }}>
                                    {feedback!.msg}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
            {/* Suggerimento percorsi alternativi */}
            {problem.paths.length > 1 && activePath === null && (
                <div style={{ marginTop: 8, fontSize: 12, color: "#64748b", fontStyle: "italic" }}>
                    Puoi iniziare con "Retta per due punti" (formula diretta) oppure calcolare prima il coefficiente angolare.
                </div>
            )}
        </div>
    );

    const problemCard = (
        <div style={{
            background: "#eff6ff", border: "2px solid #93c5fd",
            borderRadius: 12, padding: 16, marginBottom: 16,
        }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Problema
            </div>
            {problem.questionLines.map((line, i) => (
                <div key={i} style={{ textAlign: "center", marginBottom: i < problem.questionLines.length - 1 ? 6 : 0 }}>
                    <Latex>{line}</Latex>
                </div>
            ))}
        </div>
    );

    const solutionSteps = (
        <div>
            {appliedSteps.length === 0 && (
                <div style={{ color: "#94a3b8", fontSize: 13, fontStyle: "italic", padding: "12px 0" }}>
                    Clicca una formula per iniziare la soluzione…
                </div>
            )}
            {appliedSteps.map((step, idx) => {
                const info = FORMULAS.find(f => f.id === step.formulaId)!;
                return (
                    <div key={idx} style={{
                        background: "#fff",
                        border: `2px solid ${info.color}30`,
                        borderLeft: `4px solid ${info.color}`,
                        borderRadius: 8, padding: "10px 14px", marginBottom: 8,
                    }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: info.color, marginBottom: 6 }}>
                            Passo {idx + 1} — {info.label}
                        </div>
                        {step.lines.map((line, li) => (
                            <div key={li} style={{ textAlign: "center", marginBottom: li < step.lines.length - 1 ? 4 : 0 }}>
                                <Latex>{line}</Latex>
                            </div>
                        ))}
                    </div>
                );
            })}
            {isSolved && (
                <div style={{
                    background: "#f0fdf4", border: "2px solid #16a34a",
                    borderRadius: 10, padding: 14, textAlign: "center", marginTop: 4,
                }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#15803d", marginBottom: 8 }}>
                        Soluzione trovata!
                    </div>
                    <DisplayMath>{lineLatex(problem.solMNum, problem.solMDen, problem.solQ)}</DisplayMath>
                </div>
            )}
        </div>
    );

    const graphCard = (
        <div style={{ background: "#f8fafc", borderRadius: 12, padding: 12, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Grafico {!isSolved && <span style={{ fontWeight: 400, color: "#94a3b8" }}>(completa la soluzione)</span>}
            </div>
            <div style={{ display: "flex", justifyContent: "center", opacity: isSolved ? 1 : 0.35, transition: "opacity 0.4s" }}>
                <CoordinatePlane
                    width={isMobile ? 280 : 300}
                    height={isMobile ? 280 : 300}
                    xMin={-6} xMax={6} yMin={-6} yMax={6}
                    points={graphPoints}
                    lines={graphLines}
                    showGrid={true}
                    showArrows={true}
                />
            </div>
        </div>
    );

    const theoryPanel = (
        <div style={{ fontSize: 14, lineHeight: 1.9 }}>
            <p><strong>Coefficiente angolare tra due punti:</strong></p>
            <div style={{ textAlign: "center", margin: "6px 0 12px" }}>
                <DisplayMath>{"m = \\dfrac{y_2 - y_1}{x_2 - x_1}"}</DisplayMath>
            </div>
            <p><strong>Retta passante per due punti</strong> (formula diretta):</p>
            <div style={{ textAlign: "center", margin: "6px 0 12px" }}>
                <DisplayMath>{"\\dfrac{y - y_1}{y_2 - y_1} = \\dfrac{x - x_1}{x_2 - x_1}"}</DisplayMath>
            </div>
            <p><strong>Retta per un punto P(x₀,y₀) con pendenza m:</strong></p>
            <div style={{ textAlign: "center", margin: "6px 0 12px" }}>
                <DisplayMath>{"y - y_0 = m(x - x_0)"}</DisplayMath>
            </div>
            <p><strong>Rette parallele:</strong> stesso coeff. angolare <Latex>{"m_1 = m_2"}</Latex></p>
            <p><strong>Rette perpendicolari:</strong> <Latex>{"m_1 \\cdot m_2 = -1 \\Rightarrow m_2 = -\\dfrac{1}{m_1}"}</Latex></p>
        </div>
    );

    return (
        <DemoContainer
            title="Retta: problemi con le formule"
            description="Usa i pulsanti-formula nel giusto ordine per risolvere il problema."
        >
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                <GenerateButton onClick={handleNewProblem} text="Nuovo problema" />
            </div>

            {problemCard}
            {formulaToolbox}

            <div style={{ marginTop: 16 }}>
                {!isMobile ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
                        <div>{solutionSteps}</div>
                        <div>{graphCard}</div>
                    </div>
                ) : (
                    <div>
                        {solutionSteps}
                        <div style={{ marginTop: 12 }}>{graphCard}</div>
                    </div>
                )}
            </div>

            {isMobile ? (
                <CollapsiblePanel title="Riepilogo formule" defaultOpen={false}>
                    {theoryPanel}
                </CollapsiblePanel>
            ) : (
                <div style={{
                    background: "#f8fafc", borderRadius: 10, padding: 16,
                    marginTop: 16, border: "1px solid #e2e8f0",
                }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#64748b", marginBottom: 8 }}>
                        Riepilogo formule
                    </div>
                    {theoryPanel}
                </div>
            )}
        </DemoContainer>
    );
}
