/**
 * ArchiAssociatiDemo - Archi Associati e Formule Goniometriche
 *
 * Caratteristiche:
 * - Visualizzazione interattiva di tutti i tipi di archi associati
 * - Cerchio goniometrico con angolo α e angolo associato
 * - Formule per sin, cos, tan di ogni tipo
 * - Quiz interattivi a risposta multipla
 * - 3 layout responsive (mobile, tablet, desktop)
 */

import React, { useState } from "react";

import {
    Latex,
    DemoContainer,
    ResponsiveCard,
    CollapsiblePanel,
    useBreakpoint,
} from "../../components/ui";

// ============ TIPI ============

interface ArcoAssociato {
    id: string;
    nome: string;
    formula: string;           // Es: "-α", "π-α", "π+α"
    formulaLatex: string;      // Es: "-\\alpha", "\\pi - \\alpha"
    sinFormula: string;        // Es: "-\\sin\\alpha"
    cosFormula: string;        // Es: "\\cos\\alpha"
    tanFormula: string;        // Es: "-\\tan\\alpha"
    descrizione: string;
    colore: string;
}

interface QuizQuestion {
    id: number;
    domanda: string;
    opzioni: string[];
    rispostaCorretta: number;
    spiegazione: string;
}

// ============ COSTANTI ============

const ARCHI_ASSOCIATI: ArcoAssociato[] = [
    {
        id: "opposti",
        nome: "Angoli opposti",
        formula: "-α",
        formulaLatex: "-\\alpha",
        sinFormula: "-\\sin\\alpha",
        cosFormula: "\\cos\\alpha",
        tanFormula: "-\\tan\\alpha",
        descrizione: "L'angolo opposto ha lo stesso coseno ma seno e tangente cambiano segno",
        colore: "#ef4444"
    },
    {
        id: "supplementari",
        nome: "Angoli supplementari",
        formula: "π - α",
        formulaLatex: "\\pi - \\alpha",
        sinFormula: "\\sin\\alpha",
        cosFormula: "-\\cos\\alpha",
        tanFormula: "-\\tan\\alpha",
        descrizione: "Gli angoli supplementari hanno lo stesso seno ma coseno e tangente cambiano segno",
        colore: "#f59e0b"
    },
    {
        id: "che-differiscono-pi",
        nome: "Angoli che differiscono di π",
        formula: "π + α",
        formulaLatex: "\\pi + \\alpha",
        sinFormula: "-\\sin\\alpha",
        cosFormula: "-\\cos\\alpha",
        tanFormula: "\\tan\\alpha",
        descrizione: "Seno e coseno cambiano segno, la tangente resta uguale",
        colore: "#22c55e"
    },
    {
        id: "esplementari",
        nome: "Angoli esplementari",
        formula: "2π - α",
        formulaLatex: "2\\pi - \\alpha",
        sinFormula: "-\\sin\\alpha",
        cosFormula: "\\cos\\alpha",
        tanFormula: "-\\tan\\alpha",
        descrizione: "Equivalenti agli angoli opposti (stesse formule)",
        colore: "#3b82f6"
    },
    {
        id: "complementari",
        nome: "Angoli complementari",
        formula: "π/2 - α",
        formulaLatex: "\\frac{\\pi}{2} - \\alpha",
        sinFormula: "\\cos\\alpha",
        cosFormula: "\\sin\\alpha",
        tanFormula: "\\cot\\alpha",
        descrizione: "Seno e coseno si scambiano, tangente diventa cotangente",
        colore: "#8b5cf6"
    },
    {
        id: "che-differiscono-pi2",
        nome: "Angoli che differiscono di π/2",
        formula: "π/2 + α",
        formulaLatex: "\\frac{\\pi}{2} + \\alpha",
        sinFormula: "\\cos\\alpha",
        cosFormula: "-\\sin\\alpha",
        tanFormula: "-\\cot\\alpha",
        descrizione: "Seno diventa coseno, coseno diventa -seno",
        colore: "#ec4899"
    },
    {
        id: "che-differiscono-3pi2-plus",
        nome: "Angoli che differiscono di 3π/2 (+)",
        formula: "3π/2 + α",
        formulaLatex: "\\frac{3\\pi}{2} + \\alpha",
        sinFormula: "-\\cos\\alpha",
        cosFormula: "\\sin\\alpha",
        tanFormula: "-\\cot\\alpha",
        descrizione: "Seno diventa -coseno, coseno diventa seno",
        colore: "#06b6d4"
    },
    {
        id: "che-differiscono-3pi2-minus",
        nome: "Angoli la cui somma è 3π/2",
        formula: "3π/2 - α",
        formulaLatex: "\\frac{3\\pi}{2} - \\alpha",
        sinFormula: "-\\cos\\alpha",
        cosFormula: "-\\sin\\alpha",
        tanFormula: "\\cot\\alpha",
        descrizione: "Seno diventa -coseno, coseno diventa -seno",
        colore: "#14b8a6"
    },
];

const QUIZ_QUESTIONS: QuizQuestion[] = [
    {
        id: 1,
        domanda: "\\sin(-\\alpha) = ?",
        opzioni: ["\\sin\\alpha", "-\\sin\\alpha", "\\cos\\alpha", "-\\cos\\alpha"],
        rispostaCorretta: 1,
        spiegazione: "Gli angoli opposti hanno seno opposto: sin(-α) = -sin(α)"
    },
    {
        id: 2,
        domanda: "\\cos(\\pi - \\alpha) = ?",
        opzioni: ["\\cos\\alpha", "-\\cos\\alpha", "\\sin\\alpha", "-\\sin\\alpha"],
        rispostaCorretta: 1,
        spiegazione: "Gli angoli supplementari hanno coseno opposto: cos(π-α) = -cos(α)"
    },
    {
        id: 3,
        domanda: "\\sin(\\pi + \\alpha) = ?",
        opzioni: ["\\sin\\alpha", "-\\sin\\alpha", "\\cos\\alpha", "-\\cos\\alpha"],
        rispostaCorretta: 1,
        spiegazione: "Angoli che differiscono di π: sin(π+α) = -sin(α)"
    },
    {
        id: 4,
        domanda: "\\tan(\\pi + \\alpha) = ?",
        opzioni: ["\\tan\\alpha", "-\\tan\\alpha", "\\cot\\alpha", "-\\cot\\alpha"],
        rispostaCorretta: 0,
        spiegazione: "La tangente ha periodo π, quindi tan(π+α) = tan(α)"
    },
    {
        id: 5,
        domanda: "\\sin\\left(\\frac{\\pi}{2} - \\alpha\\right) = ?",
        opzioni: ["\\sin\\alpha", "-\\sin\\alpha", "\\cos\\alpha", "-\\cos\\alpha"],
        rispostaCorretta: 2,
        spiegazione: "Angoli complementari: sin(π/2 - α) = cos(α)"
    },
    {
        id: 6,
        domanda: "\\cos\\left(\\frac{\\pi}{2} - \\alpha\\right) = ?",
        opzioni: ["\\cos\\alpha", "-\\cos\\alpha", "\\sin\\alpha", "-\\sin\\alpha"],
        rispostaCorretta: 2,
        spiegazione: "Angoli complementari: cos(π/2 - α) = sin(α)"
    },
    {
        id: 7,
        domanda: "\\cos(-\\alpha) = ?",
        opzioni: ["\\cos\\alpha", "-\\cos\\alpha", "\\sin\\alpha", "-\\sin\\alpha"],
        rispostaCorretta: 0,
        spiegazione: "Il coseno è una funzione pari: cos(-α) = cos(α)"
    },
    {
        id: 8,
        domanda: "\\sin(\\pi - \\alpha) = ?",
        opzioni: ["\\sin\\alpha", "-\\sin\\alpha", "\\cos\\alpha", "-\\cos\\alpha"],
        rispostaCorretta: 0,
        spiegazione: "Gli angoli supplementari hanno lo stesso seno: sin(π-α) = sin(α)"
    },
    {
        id: 9,
        domanda: "\\tan\\left(\\frac{\\pi}{2} - \\alpha\\right) = ?",
        opzioni: ["\\tan\\alpha", "-\\tan\\alpha", "\\cot\\alpha", "-\\cot\\alpha"],
        rispostaCorretta: 2,
        spiegazione: "Angoli complementari: tan(π/2 - α) = cot(α)"
    },
    {
        id: 10,
        domanda: "\\cos(\\pi + \\alpha) = ?",
        opzioni: ["\\cos\\alpha", "-\\cos\\alpha", "\\sin\\alpha", "-\\sin\\alpha"],
        rispostaCorretta: 1,
        spiegazione: "Angoli che differiscono di π: cos(π+α) = -cos(α)"
    },
    {
        id: 11,
        domanda: "\\sin\\left(\\frac{\\pi}{2} + \\alpha\\right) = ?",
        opzioni: ["\\sin\\alpha", "-\\sin\\alpha", "\\cos\\alpha", "-\\cos\\alpha"],
        rispostaCorretta: 2,
        spiegazione: "sin(π/2 + α) = cos(α)"
    },
    {
        id: 12,
        domanda: "\\cos\\left(\\frac{\\pi}{2} + \\alpha\\right) = ?",
        opzioni: ["\\cos\\alpha", "\\sin\\alpha", "-\\sin\\alpha", "-\\cos\\alpha"],
        rispostaCorretta: 2,
        spiegazione: "cos(π/2 + α) = -sin(α)"
    },
];

const COLORS = {
    alpha: "#3b82f6",
    associated: "#ef4444",
    sin: "#22c55e",
    cos: "#f59e0b",
    text: "#334155",
    correct: "#22c55e",
    wrong: "#ef4444",
};

// ============ COMPONENTE CERCHIO ============

interface CerchioProps {
    alpha: number;              // angolo α in radianti
    arco: ArcoAssociato;
    width: number;
    height: number;
}

function CerchioGoniometrico({ alpha, arco, width, height }: CerchioProps) {
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.38;

    // Calcola l'angolo associato
    const calcolaAngoloAssociato = (): number => {
        switch (arco.id) {
            case "opposti":
                return -alpha;
            case "supplementari":
                return Math.PI - alpha;
            case "che-differiscono-pi":
                return Math.PI + alpha;
            case "esplementari":
                return 2 * Math.PI - alpha;
            case "complementari":
                return Math.PI / 2 - alpha;
            case "che-differiscono-pi2":
                return Math.PI / 2 + alpha;
            case "che-differiscono-3pi2-plus":
                return 3 * Math.PI / 2 + alpha;
            case "che-differiscono-3pi2-minus":
                return 3 * Math.PI / 2 - alpha;
            default:
                return alpha;
        }
    };

    const alphaAssociato = calcolaAngoloAssociato();

    // Coordinate punto α
    const xAlpha = cx + radius * Math.cos(alpha);
    const yAlpha = cy - radius * Math.sin(alpha);

    // Coordinate punto associato
    const xAssoc = cx + radius * Math.cos(alphaAssociato);
    const yAssoc = cy - radius * Math.sin(alphaAssociato);

    // Proiezioni per α
    const sinAlpha = Math.sin(alpha);
    const cosAlpha = Math.cos(alpha);

    // Proiezioni per associato
    const sinAssoc = Math.sin(alphaAssociato);
    const cosAssoc = Math.cos(alphaAssociato);

    // Arco per α
    const arcAlpha = `M ${cx + radius} ${cy} A ${radius} ${radius} 0 ${alpha > Math.PI ? 1 : 0} 0 ${xAlpha} ${yAlpha}`;

    return (
        <svg width={width} height={height} style={{ display: 'block' }}>
            {/* Sfondo */}
            <rect x={0} y={0} width={width} height={height} fill="#fafafa" rx={8} />

            {/* Assi */}
            <line x1={cx - radius - 20} y1={cy} x2={cx + radius + 20} y2={cy} stroke="#d1d5db" strokeWidth={1} />
            <line x1={cx} y1={cy - radius - 20} x2={cx} y2={cy + radius + 20} stroke="#d1d5db" strokeWidth={1} />

            {/* Labels assi */}
            <text x={cx + radius + 25} y={cy + 5} fontSize={12} fill="#64748b">x</text>
            <text x={cx + 5} y={cy - radius - 10} fontSize={12} fill="#64748b">y</text>

            {/* Cerchio */}
            <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#94a3b8" strokeWidth={2} />

            {/* Arco α */}
            <path d={arcAlpha} fill="none" stroke={COLORS.alpha} strokeWidth={3} opacity={0.6} />

            {/* Raggio α */}
            <line x1={cx} y1={cy} x2={xAlpha} y2={yAlpha} stroke={COLORS.alpha} strokeWidth={2} />

            {/* Punto α */}
            <circle cx={xAlpha} cy={yAlpha} r={6} fill={COLORS.alpha} />
            <text x={xAlpha + 10} y={yAlpha - 10} fontSize={14} fontWeight={600} fill={COLORS.alpha}>α</text>

            {/* Proiezione sin α (verticale) */}
            <line x1={xAlpha} y1={cy} x2={xAlpha} y2={yAlpha} stroke={COLORS.sin} strokeWidth={2} strokeDasharray="4,2" />

            {/* Proiezione cos α (orizzontale) */}
            <line x1={cx} y1={yAlpha} x2={xAlpha} y2={yAlpha} stroke={COLORS.cos} strokeWidth={2} strokeDasharray="4,2" />

            {/* Raggio associato */}
            <line x1={cx} y1={cy} x2={xAssoc} y2={yAssoc} stroke={arco.colore} strokeWidth={2} />

            {/* Punto associato */}
            <circle cx={xAssoc} cy={yAssoc} r={6} fill={arco.colore} />
            <text x={xAssoc + 10} y={yAssoc - 10} fontSize={12} fontWeight={600} fill={arco.colore}>{arco.formula}</text>

            {/* Proiezione sin associato (verticale) */}
            <line x1={xAssoc} y1={cy} x2={xAssoc} y2={yAssoc} stroke={arco.colore} strokeWidth={2} opacity={0.5} />

            {/* Proiezione cos associato (orizzontale) */}
            <line x1={cx} y1={yAssoc} x2={xAssoc} y2={yAssoc} stroke={arco.colore} strokeWidth={2} opacity={0.5} />

            {/* Valori numerici */}
            <g transform={`translate(10, ${height - 80})`}>
                <rect x={0} y={0} width={130} height={70} fill="white" stroke="#e2e8f0" rx={6} />
                <text x={10} y={18} fontSize={11} fontWeight={600} fill={COLORS.alpha}>α:</text>
                <text x={10} y={34} fontSize={10} fill={COLORS.sin}>sin = {sinAlpha.toFixed(3)}</text>
                <text x={10} y={48} fontSize={10} fill={COLORS.cos}>cos = {cosAlpha.toFixed(3)}</text>
                <text x={10} y={62} fontSize={10} fill="#64748b">tan = {Math.abs(cosAlpha) > 0.01 ? (sinAlpha/cosAlpha).toFixed(3) : "±∞"}</text>
            </g>

            <g transform={`translate(${width - 140}, ${height - 80})`}>
                <rect x={0} y={0} width={130} height={70} fill="white" stroke={arco.colore} rx={6} />
                <text x={10} y={18} fontSize={11} fontWeight={600} fill={arco.colore}>{arco.formula}:</text>
                <text x={10} y={34} fontSize={10} fill={arco.colore}>sin = {sinAssoc.toFixed(3)}</text>
                <text x={10} y={48} fontSize={10} fill={arco.colore}>cos = {cosAssoc.toFixed(3)}</text>
                <text x={10} y={62} fontSize={10} fill="#64748b">tan = {Math.abs(cosAssoc) > 0.01 ? (sinAssoc/cosAssoc).toFixed(3) : "±∞"}</text>
            </g>
        </svg>
    );
}

// ============ COMPONENTE QUIZ ============

interface QuizProps {
    questions: QuizQuestion[];
}

function Quiz({ questions }: QuizProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);

    const question = questions[currentQuestion];
    const isCorrect = selectedAnswer === question.rispostaCorretta;
    const isAnswered = answeredQuestions.includes(currentQuestion);

    const handleAnswer = (index: number) => {
        if (isAnswered) return;

        setSelectedAnswer(index);
        setShowResult(true);
        setAnsweredQuestions([...answeredQuestions, currentQuestion]);

        if (index === question.rispostaCorretta) {
            setScore(score + 1);
        }
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedAnswer(null);
            setShowResult(false);
        }
    };

    const handlePrev = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
            setSelectedAnswer(null);
            setShowResult(false);
        }
    };

    const handleReset = () => {
        setCurrentQuestion(0);
        setSelectedAnswer(null);
        setShowResult(false);
        setScore(0);
        setAnsweredQuestions([]);
    };

    const progress = (answeredQuestions.length / questions.length) * 100;

    return (
        <div>
            {/* Progress */}
            <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span>Domanda {currentQuestion + 1} di {questions.length}</span>
                    <span style={{ color: COLORS.correct, fontWeight: 600 }}>Punteggio: {score}/{answeredQuestions.length}</span>
                </div>
                <div style={{ height: 8, background: "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
                    <div
                        style={{
                            height: "100%",
                            width: `${progress}%`,
                            background: `linear-gradient(90deg, ${COLORS.correct}, #3b82f6)`,
                            transition: "width 0.3s"
                        }}
                    />
                </div>
            </div>

            {/* Domanda */}
            <div style={{
                padding: 16,
                background: "#f8fafc",
                borderRadius: 8,
                marginBottom: 16,
                textAlign: "center"
            }}>
                <div style={{ fontSize: 18, marginBottom: 8 }}>
                    <Latex>{question.domanda}</Latex>
                </div>
            </div>

            {/* Opzioni */}
            <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
                {question.opzioni.map((opzione, i) => {
                    let bgColor = "#f8fafc";
                    let borderColor = "#e2e8f0";
                    let textColor = COLORS.text;

                    if (showResult) {
                        if (i === question.rispostaCorretta) {
                            bgColor = "#dcfce7";
                            borderColor = COLORS.correct;
                            textColor = "#166534";
                        } else if (i === selectedAnswer && !isCorrect) {
                            bgColor = "#fee2e2";
                            borderColor = COLORS.wrong;
                            textColor = "#991b1b";
                        }
                    } else if (selectedAnswer === i) {
                        bgColor = "#dbeafe";
                        borderColor = "#3b82f6";
                    }

                    return (
                        <button
                            key={i}
                            onClick={() => handleAnswer(i)}
                            disabled={isAnswered}
                            style={{
                                padding: "12px 16px",
                                background: bgColor,
                                border: `2px solid ${borderColor}`,
                                borderRadius: 8,
                                cursor: isAnswered ? "default" : "pointer",
                                textAlign: "center",
                                fontSize: 16,
                                color: textColor,
                                transition: "all 0.2s",
                            }}
                        >
                            <Latex>{opzione}</Latex>
                        </button>
                    );
                })}
            </div>

            {/* Spiegazione */}
            {showResult && (
                <div style={{
                    padding: 12,
                    background: isCorrect ? "#dcfce7" : "#fee2e2",
                    borderRadius: 8,
                    marginBottom: 16,
                    fontSize: 13,
                }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>
                        {isCorrect ? "✓ Corretto!" : "✗ Sbagliato"}
                    </div>
                    <div style={{ color: "#475569" }}>
                        {question.spiegazione}
                    </div>
                </div>
            )}

            {/* Navigazione */}
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <button
                    onClick={handlePrev}
                    disabled={currentQuestion === 0}
                    style={{
                        padding: "8px 16px",
                        background: currentQuestion === 0 ? "#e2e8f0" : "#f1f5f9",
                        border: "1px solid #d1d5db",
                        borderRadius: 6,
                        cursor: currentQuestion === 0 ? "default" : "pointer",
                        fontSize: 13,
                    }}
                >
                    ← Precedente
                </button>

                {answeredQuestions.length === questions.length ? (
                    <button
                        onClick={handleReset}
                        style={{
                            padding: "8px 16px",
                            background: "#3b82f6",
                            color: "white",
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                            fontSize: 13,
                            fontWeight: 600,
                        }}
                    >
                        🔄 Ricomincia
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        disabled={currentQuestion === questions.length - 1}
                        style={{
                            padding: "8px 16px",
                            background: currentQuestion === questions.length - 1 ? "#e2e8f0" : "#3b82f6",
                            color: currentQuestion === questions.length - 1 ? "#64748b" : "white",
                            border: "none",
                            borderRadius: 6,
                            cursor: currentQuestion === questions.length - 1 ? "default" : "pointer",
                            fontSize: 13,
                            fontWeight: 600,
                        }}
                    >
                        Successiva →
                    </button>
                )}
            </div>

            {/* Risultato finale */}
            {answeredQuestions.length === questions.length && (
                <div style={{
                    marginTop: 16,
                    padding: 16,
                    background: score >= questions.length * 0.7 ? "#dcfce7" : score >= questions.length * 0.5 ? "#fef3c7" : "#fee2e2",
                    borderRadius: 8,
                    textAlign: "center",
                }}>
                    <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
                        {score >= questions.length * 0.7 ? "🎉" : score >= questions.length * 0.5 ? "👍" : "📚"}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 600 }}>
                        Punteggio finale: {score}/{questions.length}
                    </div>
                    <div style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
                        {score >= questions.length * 0.7 ? "Ottimo lavoro!" : score >= questions.length * 0.5 ? "Buon risultato!" : "Continua a studiare!"}
                    </div>
                </div>
            )}
        </div>
    );
}

// ============ COMPONENTE PRINCIPALE ============

export default function ArchiAssociatiDemo() {
    const { isMobile, isTablet } = useBreakpoint();

    const [selectedArco, setSelectedArco] = useState(0);
    const [alpha, setAlpha] = useState(Math.PI / 6); // 30°
    const [showQuiz, setShowQuiz] = useState(false);

    const arco = ARCHI_ASSOCIATI[selectedArco];

    // Converti angolo in gradi per display
    const alphaDeg = (alpha * 180 / Math.PI).toFixed(0);

    // Dimensioni cerchio
    const cerchioWidth = isMobile ? 320 : isTablet ? 380 : 400;
    const cerchioHeight = isMobile ? 320 : isTablet ? 380 : 400;

    // Preset angoli comuni
    const presetAngoli = [
        { nome: "30°", value: Math.PI / 6 },
        { nome: "45°", value: Math.PI / 4 },
        { nome: "60°", value: Math.PI / 3 },
        { nome: "90°", value: Math.PI / 2 },
        { nome: "120°", value: 2 * Math.PI / 3 },
        { nome: "135°", value: 3 * Math.PI / 4 },
    ];

    // ============ PANNELLI ============

    const ControlsPanel = (
        <ResponsiveCard>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: COLORS.text }}>
                ⚙️ Controlli
            </div>

            {/* Selezione arco associato */}
            <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>Tipo di arco associato:</div>
                <div style={{ display: "grid", gap: 6 }}>
                    {ARCHI_ASSOCIATI.map((a, i) => (
                        <button
                            key={a.id}
                            onClick={() => setSelectedArco(i)}
                            style={{
                                padding: "10px 12px",
                                background: selectedArco === i ? `${a.colore}15` : "#f8fafc",
                                border: `2px solid ${selectedArco === i ? a.colore : "#e2e8f0"}`,
                                borderRadius: 8,
                                cursor: "pointer",
                                textAlign: "left",
                                transition: "all 0.2s",
                            }}
                        >
                            <div style={{
                                fontWeight: 600,
                                fontSize: 13,
                                color: selectedArco === i ? a.colore : COLORS.text
                            }}>
                                {a.nome}
                            </div>
                            <div style={{ fontSize: 11, color: "#64748b" }}>
                                <Latex>{a.formulaLatex}</Latex>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Slider angolo */}
            <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                    <span>Angolo α</span>
                    <span style={{ fontWeight: 600, color: COLORS.alpha }}>{alphaDeg}°</span>
                </div>
                <input
                    type="range"
                    min={0}
                    max={Math.PI * 2}
                    step={0.01}
                    value={alpha}
                    onChange={e => setAlpha(Number(e.target.value))}
                    style={{ width: "100%", accentColor: COLORS.alpha }}
                />
            </div>

            {/* Preset angoli */}
            <div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Angoli comuni:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {presetAngoli.map((p, i) => (
                        <button
                            key={i}
                            onClick={() => setAlpha(p.value)}
                            style={{
                                padding: "4px 10px",
                                fontSize: 12,
                                background: Math.abs(alpha - p.value) < 0.01 ? COLORS.alpha : "#f1f5f9",
                                color: Math.abs(alpha - p.value) < 0.01 ? "white" : "#475569",
                                border: "none",
                                borderRadius: 4,
                                cursor: "pointer",
                            }}
                        >
                            {p.nome}
                        </button>
                    ))}
                </div>
            </div>
        </ResponsiveCard>
    );

    const FormulasPanel = (
        <ResponsiveCard>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: arco.colore }}>
                📐 Formule: {arco.nome}
            </div>

            <div style={{ display: "grid", gap: 12 }}>
                {/* Sin */}
                <div style={{ padding: 12, background: "#f0fdf4", borderRadius: 8, borderLeft: `4px solid ${COLORS.sin}` }}>
                    <div style={{ fontSize: 16 }}>
                        <Latex>{`\\sin(${arco.formulaLatex}) = ${arco.sinFormula}`}</Latex>
                    </div>
                </div>

                {/* Cos */}
                <div style={{ padding: 12, background: "#fffbeb", borderRadius: 8, borderLeft: `4px solid ${COLORS.cos}` }}>
                    <div style={{ fontSize: 16 }}>
                        <Latex>{`\\cos(${arco.formulaLatex}) = ${arco.cosFormula}`}</Latex>
                    </div>
                </div>

                {/* Tan */}
                <div style={{ padding: 12, background: "#f8fafc", borderRadius: 8, borderLeft: "4px solid #64748b" }}>
                    <div style={{ fontSize: 16 }}>
                        <Latex>{`\\tan(${arco.formulaLatex}) = ${arco.tanFormula}`}</Latex>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: 16, padding: 12, background: `${arco.colore}10`, borderRadius: 8, fontSize: 13, color: "#475569" }}>
                💡 {arco.descrizione}
            </div>
        </ResponsiveCard>
    );

    const CerchioPanel = (
        <ResponsiveCard>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12, color: COLORS.text }}>
                🔵 Circonferenza Goniometrica
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
                <CerchioGoniometrico
                    alpha={alpha}
                    arco={arco}
                    width={cerchioWidth}
                    height={cerchioHeight}
                />
            </div>
            <div style={{ marginTop: 12, display: "flex", justifyContent: "center", gap: 16, fontSize: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 12, height: 12, background: COLORS.alpha, borderRadius: 2 }}></div>
                    <span>α = {alphaDeg}°</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 12, height: 12, background: arco.colore, borderRadius: 2 }}></div>
                    <span>{arco.formula}</span>
                </div>
            </div>
        </ResponsiveCard>
    );

    const QuizPanel = (
        <ResponsiveCard>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16
            }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: COLORS.text }}>
                    📝 Quiz
                </div>
                <button
                    onClick={() => setShowQuiz(!showQuiz)}
                    style={{
                        padding: "6px 12px",
                        background: showQuiz ? "#fee2e2" : "#dbeafe",
                        color: showQuiz ? "#dc2626" : "#1d4ed8",
                        border: "none",
                        borderRadius: 6,
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                    }}
                >
                    {showQuiz ? "✕ Chiudi" : "▶ Inizia"}
                </button>
            </div>

            {showQuiz ? (
                <Quiz questions={QUIZ_QUESTIONS} />
            ) : (
                <div style={{ padding: 20, textAlign: "center", color: "#64748b" }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🎯</div>
                    <div style={{ fontSize: 14 }}>
                        Metti alla prova le tue conoscenze sugli archi associati!
                    </div>
                    <div style={{ fontSize: 12, marginTop: 8 }}>
                        {QUIZ_QUESTIONS.length} domande a risposta multipla
                    </div>
                </div>
            )}
        </ResponsiveCard>
    );

    const RiepilogoPanel = (
        <CollapsiblePanel title="📋 Riepilogo formule" defaultOpen={!isMobile}>
            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                    <tr style={{ background: "#f8fafc" }}>
                        <th style={{ padding: 8, textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>Arco</th>
                        <th style={{ padding: 8, textAlign: "center", borderBottom: "2px solid #e2e8f0" }}>sin</th>
                        <th style={{ padding: 8, textAlign: "center", borderBottom: "2px solid #e2e8f0" }}>cos</th>
                        <th style={{ padding: 8, textAlign: "center", borderBottom: "2px solid #e2e8f0" }}>tan</th>
                    </tr>
                    </thead>
                    <tbody>
                    {ARCHI_ASSOCIATI.map((a, i) => (
                        <tr
                            key={a.id}
                            style={{
                                background: selectedArco === i ? `${a.colore}10` : "white",
                                cursor: "pointer"
                            }}
                            onClick={() => setSelectedArco(i)}
                        >
                            <td style={{ padding: 8, borderBottom: "1px solid #e2e8f0", fontWeight: 500, color: a.colore }}>
                                <Latex>{a.formulaLatex}</Latex>
                            </td>
                            <td style={{ padding: 8, borderBottom: "1px solid #e2e8f0", textAlign: "center" }}>
                                <Latex>{a.sinFormula}</Latex>
                            </td>
                            <td style={{ padding: 8, borderBottom: "1px solid #e2e8f0", textAlign: "center" }}>
                                <Latex>{a.cosFormula}</Latex>
                            </td>
                            <td style={{ padding: 8, borderBottom: "1px solid #e2e8f0", textAlign: "center" }}>
                                <Latex>{a.tanFormula}</Latex>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </CollapsiblePanel>
    );

    // ============ RENDER ============

    return (
        <DemoContainer
            title="Archi Associati"
            description="Formule goniometriche e relazioni tra angoli"
            maxWidth={1300}
        >
            {/* ============ LAYOUT MOBILE ============ */}
            {isMobile && (
                <div style={{ display: "grid", gap: 12 }}>
                    {CerchioPanel}
                    {ControlsPanel}
                    {FormulasPanel}
                    {RiepilogoPanel}
                    {QuizPanel}
                </div>
            )}

            {/* ============ LAYOUT TABLET ============ */}
            {isTablet && (
                <div style={{ display: "grid", gap: 16 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        {CerchioPanel}
                        <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
                            {ControlsPanel}
                            {FormulasPanel}
                        </div>
                    </div>
                    {RiepilogoPanel}
                    {QuizPanel}
                </div>
            )}

            {/* ============ LAYOUT DESKTOP ============ */}
            {!isMobile && !isTablet && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 420px 1fr", gap: 16 }}>
                    {/* Colonna 1: Controlli */}
                    <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
                        {ControlsPanel}
                        {RiepilogoPanel}
                    </div>

                    {/* Colonna 2: Cerchio */}
                    <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
                        {CerchioPanel}
                    </div>

                    {/* Colonna 3: Formule + Quiz */}
                    <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
                        {FormulasPanel}
                        {QuizPanel}
                    </div>
                </div>
            )}
        </DemoContainer>
    );
}