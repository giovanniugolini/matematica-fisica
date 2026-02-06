/**
 * Quiz Components - Componenti UI per quiz e verifiche
 * @module components/ui/Quiz
 */

import React, { useState } from "react";
import type {
    QuizQuestion,
    MultipleChoiceQuestion,
    NumericQuestion,
    QuizOption as QuizOptionType,
    QuizScore,
    QuestionResult,
} from "../../types/quiz";
import { useBreakpoint } from "./Responsive";
import { Latex, MixedLatex } from "./Latex";
import {
    getCorrectAnswerText,
    getScoreColor,
    getScoreMessage,
    calculateDetailedResults,
} from "../../utils/quiz/scoring";

// ============ TIPI PROPS ============

export interface QuizOptionProps {
    /** Opzione da visualizzare */
    option: QuizOptionType;
    /** Se l'opzione è selezionata */
    isSelected: boolean;
    /** Stato dell'opzione dopo la verifica */
    state?: "default" | "correct" | "wrong" | "missed";
    /** Se l'input è disabilitato */
    disabled?: boolean;
    /** Callback quando selezionata */
    onSelect: (optionId: string) => void;
}

export interface QuizNumericInputProps {
    /** Valore corrente */
    value: string;
    /** Callback quando cambia */
    onChange: (value: string) => void;
    /** Placeholder */
    placeholder?: string;
    /** Unità di misura */
    unit?: string;
    /** Se l'input è disabilitato */
    disabled?: boolean;
    /** Stato dopo verifica */
    state?: "default" | "correct" | "wrong";
}

export interface QuizProgressProps {
    /** Indice corrente (0-indexed) */
    current: number;
    /** Totale domande */
    total: number;
    /** Risposte date */
    answeredCount: number;
}

export interface QuizFeedbackProps {
    /** Se la risposta è corretta */
    isCorrect: boolean;
    /** Spiegazione */
    explanation: string;
    /** Se mostrare la risposta corretta */
    showCorrectAnswer?: boolean;
    /** Testo risposta corretta */
    correctAnswerText?: string;
}

export interface QuizQuestionProps {
    /** Domanda da visualizzare */
    question: QuizQuestion;
    /** Risposta corrente */
    currentAnswer: string | number | null;
    /** Callback per la risposta */
    onAnswer: (value: string | number | null) => void;
    /** Se mostrare feedback */
    showFeedback?: boolean;
    /** Se la risposta è corretta (per feedback) */
    isCorrect?: boolean;
    /** Se disabilitare l'input */
    disabled?: boolean;
}

export interface QuizResultsProps {
    /** Punteggio finale */
    score: QuizScore;
    /** Domande del quiz */
    questions: QuizQuestion[];
    /** Risposte date */
    answers: Record<string, string | number | null>;
    /** Callback per rifare il quiz */
    onRetry?: () => void;
    /** Callback per tornare indietro */
    onBack?: () => void;
}

export interface QuizContainerProps {
    /** Titolo del quiz */
    title: string;
    /** Descrizione */
    description?: string;
    /** Contenuto */
    children: React.ReactNode;
    /** Link indietro */
    backLink?: string;
    /** Testo link indietro */
    backText?: string;
}

// ============ COLORI E STILI ============

const optionColors = {
    default: {
        bg: "#f8fafc",
        border: "#e2e8f0",
        text: "#334155",
        hover: "#f1f5f9",
    },
    selected: {
        bg: "#eff6ff",
        border: "#3b82f6",
        text: "#1e40af",
        hover: "#dbeafe",
    },
    correct: {
        bg: "#f0fdf4",
        border: "#22c55e",
        text: "#166534",
        hover: "#dcfce7",
    },
    wrong: {
        bg: "#fef2f2",
        border: "#ef4444",
        text: "#991b1b",
        hover: "#fee2e2",
    },
    missed: {
        bg: "#fefce8",
        border: "#eab308",
        text: "#854d0e",
        hover: "#fef9c3",
    },
};

// ============ COMPONENTI ============

/**
 * Bottone per opzione a risposta multipla
 */
export function QuizOptionButton({
    option,
    isSelected,
    state = "default",
    disabled = false,
    onSelect,
}: QuizOptionProps): React.ReactElement {
    const { isMobile } = useBreakpoint();

    const effectiveState = state === "default" && isSelected ? "selected" : state;
    const colors = optionColors[effectiveState];

    const letterStyle: React.CSSProperties = {
        width: isMobile ? 32 : 28,
        height: isMobile ? 32 : 28,
        borderRadius: "50%",
        background: isSelected || state !== "default" ? colors.border : "#e2e8f0",
        color: isSelected || state !== "default" ? "#fff" : "#64748b",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        fontSize: isMobile ? 14 : 13,
        flexShrink: 0,
    };

    return (
        <button
            onClick={() => !disabled && onSelect(option.id)}
            disabled={disabled}
            style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: isMobile ? "14px 16px" : "12px 16px",
                background: colors.bg,
                border: `2px solid ${colors.border}`,
                borderRadius: 12,
                cursor: disabled ? "not-allowed" : "pointer",
                textAlign: "left",
                fontSize: isMobile ? 15 : 14,
                color: colors.text,
                transition: "all 0.15s ease",
                opacity: disabled && state === "default" ? 0.6 : 1,
            }}
        >
            <span style={letterStyle}>{option.id.toUpperCase()}</span>
            <span style={{ flex: 1 }}>
                {option.isLatex ? <Latex>{option.text}</Latex> : option.text}
            </span>
            {state === "correct" && <span>✓</span>}
            {state === "wrong" && <span>✗</span>}
        </button>
    );
}

/**
 * Input numerico per domande con risposta numerica
 */
export function QuizNumericInput({
    value,
    onChange,
    placeholder = "Inserisci la risposta...",
    unit,
    disabled = false,
    state = "default",
}: QuizNumericInputProps): React.ReactElement {
    const { isMobile } = useBreakpoint();

    const borderColor =
        state === "correct"
            ? "#22c55e"
            : state === "wrong"
            ? "#ef4444"
            : "#d1d5db";

    const bgColor =
        state === "correct"
            ? "#f0fdf4"
            : state === "wrong"
            ? "#fef2f2"
            : "#fff";

    return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                style={{
                    flex: 1,
                    padding: isMobile ? "14px 16px" : "12px 16px",
                    fontSize: 16,
                    borderRadius: 12,
                    border: `2px solid ${borderColor}`,
                    background: bgColor,
                    outline: "none",
                    minHeight: isMobile ? 52 : 48,
                    boxSizing: "border-box",
                }}
            />
            {unit && (
                <span
                    style={{
                        fontSize: 14,
                        color: "#64748b",
                        fontWeight: 500,
                    }}
                >
                    {unit}
                </span>
            )}
            {state === "correct" && (
                <span style={{ color: "#22c55e", fontSize: 20 }}>✓</span>
            )}
            {state === "wrong" && (
                <span style={{ color: "#ef4444", fontSize: 20 }}>✗</span>
            )}
        </div>
    );
}

/**
 * Barra di progresso del quiz
 */
export function QuizProgress({
    current,
    total,
    answeredCount,
}: QuizProgressProps): React.ReactElement {
    const percentage = Math.round(((current + 1) / total) * 100);

    return (
        <div style={{ marginBottom: 20 }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                }}
            >
                <span style={{ fontSize: 14, fontWeight: 600, color: "#334155" }}>
                    Domanda {current + 1} di {total}
                </span>
                <span style={{ fontSize: 13, color: "#64748b" }}>
                    {answeredCount}/{total} risposte
                </span>
            </div>
            <div
                style={{
                    height: 8,
                    background: "#e2e8f0",
                    borderRadius: 4,
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        width: `${percentage}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
                        borderRadius: 4,
                        transition: "width 0.3s ease",
                    }}
                />
            </div>
        </div>
    );
}

/**
 * Box di feedback (corretto/sbagliato)
 */
export function QuizFeedback({
    isCorrect,
    explanation,
    showCorrectAnswer = false,
    correctAnswerText,
}: QuizFeedbackProps): React.ReactElement {
    const bgColor = isCorrect ? "#f0fdf4" : "#fef2f2";
    const borderColor = isCorrect ? "#22c55e" : "#ef4444";
    const textColor = isCorrect ? "#166534" : "#991b1b";
    const icon = isCorrect ? "✓" : "✗";
    const title = isCorrect ? "Corretto!" : "Sbagliato";

    return (
        <div
            style={{
                marginTop: 16,
                padding: 16,
                background: bgColor,
                border: `1px solid ${borderColor}`,
                borderRadius: 12,
                color: textColor,
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                }}
            >
                <span style={{ fontSize: 18 }}>{icon}</span>
                <span style={{ fontWeight: 600 }}>{title}</span>
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.5 }}>
                {isCorrect ? explanation : explanation}
            </div>
            {showCorrectAnswer && !isCorrect && correctAnswerText && (
                <div
                    style={{
                        marginTop: 12,
                        paddingTop: 12,
                        borderTop: `1px solid ${borderColor}`,
                        fontSize: 14,
                    }}
                >
                    <strong>Risposta corretta:</strong> {correctAnswerText}
                </div>
            )}
        </div>
    );
}

/**
 * Renderer per una singola domanda
 */
export function QuizQuestionCard({
    question,
    currentAnswer,
    onAnswer,
    showFeedback = false,
    isCorrect,
    disabled = false,
}: QuizQuestionProps): React.ReactElement {
    const [numericValue, setNumericValue] = useState(
        currentAnswer !== null ? String(currentAnswer) : ""
    );

    const handleNumericChange = (value: string) => {
        setNumericValue(value);
        const num = parseFloat(value);
        onAnswer(isNaN(num) ? null : num);
    };

    // Aggiorna numericValue quando cambia currentAnswer esternamente
    React.useEffect(() => {
        if (question.type === "numeric") {
            setNumericValue(currentAnswer !== null ? String(currentAnswer) : "");
        }
    }, [currentAnswer, question.type]);

    return (
        <div
            style={{
                background: "#fff",
                borderRadius: 16,
                padding: 20,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
        >
            {/* Prompt della domanda */}
            <div
                style={{
                    fontSize: 16,
                    fontWeight: 500,
                    color: "#1e293b",
                    marginBottom: 20,
                    lineHeight: 1.5,
                }}
            >
                {question.promptLatex ? (
                    <MixedLatex>{question.prompt}</MixedLatex>
                ) : (
                    question.prompt
                )}
            </div>

            {/* Difficoltà (opzionale) */}
            {question.difficulty && (
                <div style={{ marginBottom: 16 }}>
                    <span
                        style={{
                            fontSize: 12,
                            padding: "4px 8px",
                            borderRadius: 4,
                            background:
                                question.difficulty === "facile"
                                    ? "#dcfce7"
                                    : question.difficulty === "medio"
                                    ? "#fef3c7"
                                    : "#fee2e2",
                            color:
                                question.difficulty === "facile"
                                    ? "#166534"
                                    : question.difficulty === "medio"
                                    ? "#92400e"
                                    : "#991b1b",
                        }}
                    >
                        {question.difficulty.charAt(0).toUpperCase() +
                            question.difficulty.slice(1)}
                    </span>
                </div>
            )}

            {/* Opzioni risposta multipla */}
            {question.type === "multiple_choice" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {(question as MultipleChoiceQuestion).options.map((option) => {
                        let state: "default" | "correct" | "wrong" | "missed" =
                            "default";
                        if (showFeedback) {
                            const isCorrectOption =
                                option.id ===
                                (question as MultipleChoiceQuestion).correctOptionId;
                            const isSelectedOption = option.id === currentAnswer;

                            if (isSelectedOption && isCorrectOption) {
                                state = "correct";
                            } else if (isSelectedOption && !isCorrectOption) {
                                state = "wrong";
                            } else if (!isSelectedOption && isCorrectOption) {
                                state = "missed";
                            }
                        }

                        return (
                            <QuizOptionButton
                                key={option.id}
                                option={option}
                                isSelected={option.id === currentAnswer}
                                state={state}
                                disabled={disabled || showFeedback}
                                onSelect={(id) => onAnswer(id)}
                            />
                        );
                    })}
                </div>
            )}

            {/* Input numerico */}
            {question.type === "numeric" && (
                <QuizNumericInput
                    value={numericValue}
                    onChange={handleNumericChange}
                    placeholder={(question as NumericQuestion).placeholder}
                    unit={(question as NumericQuestion).unit}
                    disabled={disabled || showFeedback}
                    state={
                        showFeedback
                            ? isCorrect
                                ? "correct"
                                : "wrong"
                            : "default"
                    }
                />
            )}

            {/* Feedback */}
            {showFeedback && isCorrect !== undefined && (
                <QuizFeedback
                    isCorrect={isCorrect}
                    explanation={
                        isCorrect
                            ? question.explanation.correct
                            : question.explanation.wrong
                    }
                    showCorrectAnswer={!isCorrect}
                    correctAnswerText={
                        !isCorrect ? getCorrectAnswerText(question) : undefined
                    }
                />
            )}
        </div>
    );
}

/**
 * Schermata risultati finali
 */
export function QuizResults({
    score,
    questions,
    answers,
    onRetry,
    onBack,
}: QuizResultsProps): React.ReactElement {
    const { isMobile } = useBreakpoint();
    const [showDetails, setShowDetails] = useState(false);

    const detailedResults = calculateDetailedResults(questions, answers);
    const scoreColor = getScoreColor(score.percentage);
    const message = getScoreMessage(score.percentage, score.passed);

    return (
        <div
            style={{
                background: "#fff",
                borderRadius: 16,
                padding: isMobile ? 20 : 32,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
        >
            {/* Header con punteggio */}
            <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div
                    style={{
                        width: 120,
                        height: 120,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${scoreColor}20, ${scoreColor}40)`,
                        border: `4px solid ${scoreColor}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 16px",
                    }}
                >
                    <span
                        style={{
                            fontSize: 36,
                            fontWeight: 700,
                            color: scoreColor,
                        }}
                    >
                        {score.percentage}%
                    </span>
                </div>
                <h2
                    style={{
                        fontSize: 24,
                        fontWeight: 700,
                        color: "#1e293b",
                        marginBottom: 8,
                    }}
                >
                    {message}
                </h2>
                <p style={{ color: "#64748b", fontSize: 14 }}>
                    {score.correct} corrette, {score.wrong} sbagliate
                    {score.unanswered > 0 && `, ${score.unanswered} senza risposta`}
                </p>
            </div>

            {/* Statistiche */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 12,
                    marginBottom: 24,
                }}
            >
                <StatBox
                    label="Corrette"
                    value={score.correct}
                    color="#22c55e"
                />
                <StatBox label="Sbagliate" value={score.wrong} color="#ef4444" />
                <StatBox
                    label="Senza risposta"
                    value={score.unanswered}
                    color="#94a3b8"
                />
            </div>

            {/* Toggle dettagli */}
            <button
                onClick={() => setShowDetails(!showDetails)}
                style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#334155",
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <span>Vedi dettagli risposte</span>
                <span
                    style={{
                        transform: showDetails ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                    }}
                >
                    ▼
                </span>
            </button>

            {/* Dettagli risposte */}
            {showDetails && (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                        marginBottom: 24,
                    }}
                >
                    {detailedResults.map((result, index) => {
                        const question = questions[index];
                        return (
                            <ResultItem
                                key={result.questionId}
                                index={index + 1}
                                question={question}
                                result={result}
                            />
                        );
                    })}
                </div>
            )}

            {/* Bottoni azione */}
            <div style={{ display: "flex", gap: 12 }}>
                {onBack && (
                    <button
                        onClick={onBack}
                        style={{
                            flex: 1,
                            padding: "14px 20px",
                            borderRadius: 10,
                            border: "1px solid #d1d5db",
                            background: "#fff",
                            color: "#334155",
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        ← Torna indietro
                    </button>
                )}
                {onRetry && (
                    <button
                        onClick={onRetry}
                        style={{
                            flex: 1,
                            padding: "14px 20px",
                            borderRadius: 10,
                            border: "none",
                            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                            color: "#fff",
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        Riprova
                    </button>
                )}
            </div>
        </div>
    );
}

// ============ COMPONENTI HELPER ============

function StatBox({
    label,
    value,
    color,
}: {
    label: string;
    value: number;
    color: string;
}): React.ReactElement {
    return (
        <div
            style={{
                padding: 16,
                background: `${color}10`,
                borderRadius: 12,
                textAlign: "center",
            }}
        >
            <div
                style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color,
                    marginBottom: 4,
                }}
            >
                {value}
            </div>
            <div style={{ fontSize: 12, color: "#64748b" }}>{label}</div>
        </div>
    );
}

function ResultItem({
    index,
    question,
    result,
}: {
    index: number;
    question: QuizQuestion;
    result: QuestionResult;
}): React.ReactElement {
    const bgColor = result.isCorrect
        ? "#f0fdf4"
        : result.userAnswer === null
        ? "#f8fafc"
        : "#fef2f2";
    const borderColor = result.isCorrect
        ? "#22c55e"
        : result.userAnswer === null
        ? "#e2e8f0"
        : "#ef4444";

    return (
        <div
            style={{
                padding: 12,
                background: bgColor,
                border: `1px solid ${borderColor}`,
                borderRadius: 8,
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 8,
                }}
            >
                <span style={{ fontWeight: 600, fontSize: 14, color: "#334155" }}>
                    Domanda {index}
                </span>
                <span
                    style={{
                        fontSize: 12,
                        padding: "2px 8px",
                        borderRadius: 4,
                        background: result.isCorrect ? "#dcfce7" : "#fee2e2",
                        color: result.isCorrect ? "#166534" : "#991b1b",
                    }}
                >
                    {result.isCorrect
                        ? "Corretta"
                        : result.userAnswer === null
                        ? "Senza risposta"
                        : "Sbagliata"}
                </span>
            </div>
            <div style={{ fontSize: 13, color: "#64748b" }}>
                <div style={{ marginBottom: 4 }}>
                    {question.promptLatex ? (
                        <MixedLatex>{question.prompt}</MixedLatex>
                    ) : (
                        question.prompt.slice(0, 100) +
                        (question.prompt.length > 100 ? "..." : "")
                    )}
                </div>
                {!result.isCorrect && (
                    <div style={{ marginTop: 8, fontSize: 12 }}>
                        <span style={{ color: "#991b1b" }}>
                            Tua risposta:{" "}
                            {result.userAnswer === null
                                ? "—"
                                : formatAnswer(question, result.userAnswer)}
                        </span>
                        <br />
                        <span style={{ color: "#166534" }}>
                            Risposta corretta:{" "}
                            {formatAnswer(question, result.correctAnswer)}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

function formatAnswer(
    question: QuizQuestion,
    answer: string | number | null
): string {
    if (answer === null) return "—";

    if (question.type === "multiple_choice") {
        const option = (question as MultipleChoiceQuestion).options.find(
            (o) => o.id === answer
        );
        return option
            ? `${answer.toString().toUpperCase()}) ${option.text}`
            : answer.toString();
    }

    return answer.toString();
}

/**
 * Container principale per quiz
 */
export function QuizContainer({
    title,
    description,
    children,
    backLink = "#/",
    backText = "← Torna alla home",
}: QuizContainerProps): React.ReactElement {
    return (
        <div
            style={{
                maxWidth: 700,
                margin: "auto",
                padding: 16,
                fontFamily: "system-ui, sans-serif",
            }}
        >
            {/* Header */}
            <div style={{ marginBottom: 20 }}>
                <a
                    href={backLink}
                    style={{
                        color: "#3b82f6",
                        textDecoration: "none",
                        fontSize: 14,
                    }}
                >
                    {backText}
                </a>
                <h1 style={{ margin: "8px 0", fontSize: 24, color: "#1e293b" }}>
                    {title}
                </h1>
                {description && (
                    <p style={{ color: "#64748b", margin: 0, fontSize: 14 }}>
                        {description}
                    </p>
                )}
            </div>

            {children}
        </div>
    );
}

/**
 * Schermata iniziale del quiz
 */
export function QuizStartScreen({
    title,
    description,
    questionCount,
    timeLimit,
    onStart,
}: {
    title: string;
    description?: string;
    questionCount: number;
    timeLimit?: number;
    onStart: () => void;
}): React.ReactElement {
    return (
        <div
            style={{
                background: "#fff",
                borderRadius: 16,
                padding: 32,
                textAlign: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
        >
            <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
            <h2
                style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#1e293b",
                    marginBottom: 8,
                }}
            >
                {title}
            </h2>
            {description && (
                <p
                    style={{
                        color: "#64748b",
                        fontSize: 14,
                        marginBottom: 24,
                        maxWidth: 400,
                        margin: "0 auto 24px",
                    }}
                >
                    {description}
                </p>
            )}

            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 24,
                    marginBottom: 32,
                }}
            >
                <div>
                    <div
                        style={{
                            fontSize: 28,
                            fontWeight: 700,
                            color: "#3b82f6",
                        }}
                    >
                        {questionCount}
                    </div>
                    <div style={{ fontSize: 13, color: "#64748b" }}>Domande</div>
                </div>
                {timeLimit && (
                    <div>
                        <div
                            style={{
                                fontSize: 28,
                                fontWeight: 700,
                                color: "#8b5cf6",
                            }}
                        >
                            {Math.floor(timeLimit / 60)}
                        </div>
                        <div style={{ fontSize: 13, color: "#64748b" }}>
                            Minuti
                        </div>
                    </div>
                )}
            </div>

            <button
                onClick={onStart}
                style={{
                    padding: "16px 48px",
                    borderRadius: 12,
                    border: "none",
                    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                }}
            >
                Inizia il Quiz
            </button>
        </div>
    );
}

/**
 * Bottoni di navigazione quiz
 */
export function QuizNavigation({
    onPrev,
    onNext,
    onSubmit,
    onShowFeedback,
    isFirst,
    isLast,
    canSubmit,
    showFeedbackButton = false,
    feedbackShown = false,
}: {
    onPrev: () => void;
    onNext: () => void;
    onSubmit: () => void;
    onShowFeedback?: () => void;
    isFirst: boolean;
    isLast: boolean;
    canSubmit: boolean;
    showFeedbackButton?: boolean;
    feedbackShown?: boolean;
}): React.ReactElement {
    const { isMobile } = useBreakpoint();

    return (
        <div
            style={{
                display: "flex",
                gap: 12,
                marginTop: 20,
                flexDirection: isMobile ? "column" : "row",
            }}
        >
            <button
                onClick={onPrev}
                disabled={isFirst}
                style={{
                    flex: 1,
                    padding: "14px 20px",
                    borderRadius: 10,
                    border: "1px solid #d1d5db",
                    background: isFirst ? "#f1f5f9" : "#fff",
                    color: isFirst ? "#94a3b8" : "#334155",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: isFirst ? "not-allowed" : "pointer",
                }}
            >
                ← Precedente
            </button>

            {showFeedbackButton && onShowFeedback && !feedbackShown && (
                <button
                    onClick={onShowFeedback}
                    style={{
                        flex: 1,
                        padding: "14px 20px",
                        borderRadius: 10,
                        border: "none",
                        background: "#22c55e",
                        color: "#fff",
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: "pointer",
                    }}
                >
                    Verifica
                </button>
            )}

            {isLast ? (
                <button
                    onClick={onSubmit}
                    disabled={!canSubmit}
                    style={{
                        flex: 1,
                        padding: "14px 20px",
                        borderRadius: 10,
                        border: "none",
                        background: canSubmit
                            ? "linear-gradient(135deg, #3b82f6, #8b5cf6)"
                            : "#94a3b8",
                        color: "#fff",
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: canSubmit ? "pointer" : "not-allowed",
                    }}
                >
                    Termina Quiz
                </button>
            ) : (
                <button
                    onClick={onNext}
                    style={{
                        flex: 1,
                        padding: "14px 20px",
                        borderRadius: 10,
                        border: "none",
                        background: "#3b82f6",
                        color: "#fff",
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: "pointer",
                    }}
                >
                    Successiva →
                </button>
            )}
        </div>
    );
}
