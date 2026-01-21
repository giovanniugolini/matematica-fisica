/**
 * QuizVettoriDemo - Quiz interattivo sui vettori
 * Domande su somma, differenza, moltiplicazione per scalare e componenti
 */

import React, { useState, useCallback } from "react";
import {
    QuizContainer,
    QuizStartScreen,
    QuizProgress,
    QuizQuestionCard,
    QuizNavigation,
    QuizResults,
} from "../../components/ui/Quiz";
import { useQuiz } from "../../hooks/useQuiz";
import type { QuizDefinition, QuizQuestion, MultipleChoiceQuestion, NumericQuestion } from "../../types/quiz";
import { randomInt, randomChoice, shuffle } from "../../utils/math";

// ============ GENERATORI DOMANDE VETTORI ============

let questionIdCounter = 0;

function generateId(prefix: string = "vec"): string {
    return `${prefix}_${Date.now()}_${++questionIdCounter}`;
}

/**
 * Domanda sulla somma di vettori in componenti
 */
function generateVectorSumQuestion(): MultipleChoiceQuestion {
    const ax = randomInt(-5, 5);
    const ay = randomInt(-5, 5);
    const bx = randomInt(-5, 5);
    const by = randomInt(-5, 5);

    const sumX = ax + bx;
    const sumY = ay + by;

    const correctAnswer = `(${sumX}, ${sumY})`;

    // Distrattori
    const distractors = [
        `(${ax - bx}, ${ay - by})`, // differenza invece di somma
        `(${ax * bx}, ${ay * by})`, // prodotto componenti
        `(${sumX + 1}, ${sumY - 1})`, // errore di calcolo
    ].filter(d => d !== correctAnswer);

    const allOptions = shuffle([correctAnswer, ...distractors.slice(0, 3)]);
    const options = allOptions.map((text, i) => ({
        id: ["a", "b", "c", "d"][i],
        text,
        isLatex: false,
    }));

    const correctId = options.find(o => o.text === correctAnswer)!.id;

    return {
        id: generateId("vecsum"),
        type: "multiple_choice",
        prompt: `Dati $\\vec{A} = (${ax}, ${ay})$ e $\\vec{B} = (${bx}, ${by})$, calcola $\\vec{A} + \\vec{B}$`,
        promptLatex: true,
        options,
        correctOptionId: correctId,
        explanation: {
            correct: `Esatto! $\\vec{A} + \\vec{B} = (${ax} + ${bx >= 0 ? bx : `(${bx})`}, ${ay} + ${by >= 0 ? by : `(${by})`}) = (${sumX}, ${sumY})$`,
            wrong: `La somma si calcola componente per componente: $\\vec{A} + \\vec{B} = (${ax} + ${bx >= 0 ? bx : `(${bx})`}, ${ay} + ${by >= 0 ? by : `(${by})`}) = (${sumX}, ${sumY})$`,
        },
        difficulty: "facile",
    };
}

/**
 * Domanda sulla differenza di vettori in componenti
 */
function generateVectorDiffQuestion(): MultipleChoiceQuestion {
    const ax = randomInt(-5, 5);
    const ay = randomInt(-5, 5);
    const bx = randomInt(-5, 5);
    const by = randomInt(-5, 5);

    const diffX = ax - bx;
    const diffY = ay - by;

    const correctAnswer = `(${diffX}, ${diffY})`;

    const distractors = [
        `(${ax + bx}, ${ay + by})`, // somma invece di differenza
        `(${bx - ax}, ${by - ay})`, // ordine invertito
        `(${diffX - 1}, ${diffY + 1})`, // errore di calcolo
    ].filter(d => d !== correctAnswer);

    const allOptions = shuffle([correctAnswer, ...distractors.slice(0, 3)]);
    const options = allOptions.map((text, i) => ({
        id: ["a", "b", "c", "d"][i],
        text,
        isLatex: false,
    }));

    const correctId = options.find(o => o.text === correctAnswer)!.id;

    return {
        id: generateId("vecdiff"),
        type: "multiple_choice",
        prompt: `Dati $\\vec{A} = (${ax}, ${ay})$ e $\\vec{B} = (${bx}, ${by})$, calcola $\\vec{A} - \\vec{B}$`,
        promptLatex: true,
        options,
        correctOptionId: correctId,
        explanation: {
            correct: `Esatto! $\\vec{A} - \\vec{B} = (${ax} - ${bx >= 0 ? bx : `(${bx})`}, ${ay} - ${by >= 0 ? by : `(${by})`}) = (${diffX}, ${diffY})$`,
            wrong: `La differenza si calcola: $\\vec{A} - \\vec{B} = (${ax} - ${bx >= 0 ? bx : `(${bx})`}, ${ay} - ${by >= 0 ? by : `(${by})`}) = (${diffX}, ${diffY})$`,
        },
        difficulty: "facile",
    };
}

/**
 * Domanda sulla moltiplicazione per scalare
 */
function generateScalarMultQuestion(): MultipleChoiceQuestion {
    const vx = randomInt(-4, 4);
    const vy = randomInt(-4, 4);
    const scalar = randomChoice([2, 3, -2, -1]);

    const resultX = scalar * vx;
    const resultY = scalar * vy;

    const correctAnswer = `(${resultX}, ${resultY})`;

    const distractors = [
        `(${vx + scalar}, ${vy + scalar})`, // somma invece di prodotto
        `(${-resultX}, ${-resultY})`, // segno sbagliato
        `(${resultX + 1}, ${resultY})`, // errore
    ].filter(d => d !== correctAnswer);

    const allOptions = shuffle([correctAnswer, ...distractors.slice(0, 3)]);
    const options = allOptions.map((text, i) => ({
        id: ["a", "b", "c", "d"][i],
        text,
        isLatex: false,
    }));

    const correctId = options.find(o => o.text === correctAnswer)!.id;

    const scalarStr = scalar >= 0 ? `${scalar}` : `(${scalar})`;

    return {
        id: generateId("vecscalar"),
        type: "multiple_choice",
        prompt: `Dato $\\vec{v} = (${vx}, ${vy})$, calcola $${scalarStr} \\cdot \\vec{v}$`,
        promptLatex: true,
        options,
        correctOptionId: correctId,
        explanation: {
            correct: `Esatto! $${scalarStr} \\cdot \\vec{v} = (${scalarStr} \\cdot ${vx >= 0 ? vx : `(${vx})`}, ${scalarStr} \\cdot ${vy >= 0 ? vy : `(${vy})`}) = (${resultX}, ${resultY})$`,
            wrong: `Si moltiplica ogni componente per lo scalare: $${scalarStr} \\cdot \\vec{v} = (${resultX}, ${resultY})$`,
        },
        difficulty: "facile",
    };
}

/**
 * Domanda sul modulo di un vettore
 */
function generateMagnitudeQuestion(): NumericQuestion {
    // Usa terne pitagoriche per avere moduli interi
    const pythagorean = [
        { x: 3, y: 4, mag: 5 },
        { x: 5, y: 12, mag: 13 },
        { x: 6, y: 8, mag: 10 },
        { x: 8, y: 15, mag: 17 },
        { x: 4, y: 3, mag: 5 },
        { x: 12, y: 5, mag: 13 },
    ];

    const chosen = randomChoice(pythagorean);
    const signX = randomChoice([1, -1]);
    const signY = randomChoice([1, -1]);

    const vx = chosen.x * signX;
    const vy = chosen.y * signY;

    return {
        id: generateId("vecmag"),
        type: "numeric",
        prompt: `Calcola il modulo del vettore $\\vec{F} = (${vx}, ${vy})$`,
        promptLatex: true,
        validation: {
            exactValue: chosen.mag,
            tolerance: 0.1,
        },
        placeholder: "Inserisci il modulo...",
        explanation: {
            correct: `Esatto! $|\\vec{F}| = \\sqrt{${vx}^2 + ${vy}^2} = \\sqrt{${vx * vx} + ${vy * vy}} = \\sqrt{${chosen.mag * chosen.mag}} = ${chosen.mag}$`,
            wrong: `Il modulo si calcola con $|\\vec{F}| = \\sqrt{x^2 + y^2} = \\sqrt{${vx * vx} + ${vy * vy}} = ${chosen.mag}$`,
        },
        difficulty: "medio",
    };
}

/**
 * Domanda sulla combinazione lineare 2A - B
 */
function generateLinearCombQuestion(): MultipleChoiceQuestion {
    const ax = randomInt(-3, 3);
    const ay = randomInt(-3, 3);
    const bx = randomInt(-3, 3);
    const by = randomInt(-3, 3);

    // 2A - B
    const resultX = 2 * ax - bx;
    const resultY = 2 * ay - by;

    const correctAnswer = `(${resultX}, ${resultY})`;

    const distractors = [
        `(${2 * ax + bx}, ${2 * ay + by})`, // 2A + B
        `(${ax - 2 * bx}, ${ay - 2 * by})`, // A - 2B
        `(${2 * (ax - bx)}, ${2 * (ay - by)})`, // 2(A - B)
    ].filter(d => d !== correctAnswer);

    const allOptions = shuffle([correctAnswer, ...distractors.slice(0, 3)]);
    const options = allOptions.map((text, i) => ({
        id: ["a", "b", "c", "d"][i],
        text,
        isLatex: false,
    }));

    const correctId = options.find(o => o.text === correctAnswer)!.id;

    return {
        id: generateId("veclincomb"),
        type: "multiple_choice",
        prompt: `Dati $\\vec{A} = (${ax}, ${ay})$ e $\\vec{B} = (${bx}, ${by})$, calcola $2\\vec{A} - \\vec{B}$`,
        promptLatex: true,
        options,
        correctOptionId: correctId,
        explanation: {
            correct: `Esatto! $2\\vec{A} - \\vec{B} = 2(${ax}, ${ay}) - (${bx}, ${by}) = (${2 * ax}, ${2 * ay}) - (${bx}, ${by}) = (${resultX}, ${resultY})$`,
            wrong: `Prima calcola $2\\vec{A} = (${2 * ax}, ${2 * ay})$, poi sottrai $\\vec{B}$: $(${2 * ax} - ${bx >= 0 ? bx : `(${bx})`}, ${2 * ay} - ${by >= 0 ? by : `(${by})`}) = (${resultX}, ${resultY})$`,
        },
        difficulty: "medio",
    };
}

/**
 * Domanda sul vettore opposto
 */
function generateOppositeVectorQuestion(): MultipleChoiceQuestion {
    const vx = randomInt(-5, 5);
    const vy = randomInt(-5, 5);

    const correctAnswer = `(${-vx}, ${-vy})`;

    const distractors = [
        `(${vx}, ${vy})`, // stesso vettore
        `(${-vx}, ${vy})`, // solo x cambiato
        `(${vx}, ${-vy})`, // solo y cambiato
    ].filter(d => d !== correctAnswer);

    const allOptions = shuffle([correctAnswer, ...distractors.slice(0, 3)]);
    const options = allOptions.map((text, i) => ({
        id: ["a", "b", "c", "d"][i],
        text,
        isLatex: false,
    }));

    const correctId = options.find(o => o.text === correctAnswer)!.id;

    return {
        id: generateId("vecopp"),
        type: "multiple_choice",
        prompt: `Dato $\\vec{v} = (${vx}, ${vy})$, qual è il vettore opposto $-\\vec{v}$?`,
        promptLatex: true,
        options,
        correctOptionId: correctId,
        explanation: {
            correct: `Esatto! Il vettore opposto ha componenti cambiate di segno: $-\\vec{v} = (${-vx}, ${-vy})$`,
            wrong: `Il vettore opposto si ottiene cambiando il segno di entrambe le componenti: $-\\vec{v} = (-${vx >= 0 ? vx : `(${vx})`}, -${vy >= 0 ? vy : `(${vy})`}) = (${-vx}, ${-vy})$`,
        },
        difficulty: "facile",
    };
}

/**
 * Domanda sul metodo punta-coda (teorica)
 */
function generatePuntaCodaQuestion(): MultipleChoiceQuestion {
    const questions = [
        {
            prompt: "Nel metodo punta-coda per calcolare $\\vec{A} + \\vec{B}$, dove si posiziona la coda di $\\vec{B}$?",
            correct: "Sulla punta di A",
            distractors: ["Sulla coda di A", "Nell'origine", "In un punto qualsiasi"],
            explanation: {
                correct: "Esatto! Nel metodo punta-coda, la coda del secondo vettore si posiziona sulla punta del primo.",
                wrong: "Nel metodo punta-coda, la coda di B si posiziona sulla punta di A. Il vettore somma va dalla coda di A alla punta di B.",
            },
        },
        {
            prompt: "Nel metodo punta-coda, il vettore risultante $\\vec{A} + \\vec{B}$ va:",
            correct: "Dalla coda di A alla punta di B",
            distractors: ["Dalla punta di A alla coda di B", "Dalla coda di B alla punta di A", "Dalla punta di A alla punta di B"],
            explanation: {
                correct: "Esatto! Il vettore somma collega la coda del primo vettore alla punta dell'ultimo.",
                wrong: "Il vettore somma va dalla coda di A (primo vettore) alla punta di B (secondo vettore).",
            },
        },
        {
            prompt: "Per calcolare graficamente $\\vec{A} - \\vec{B}$ con il metodo punta-coda, devo:",
            correct: "Calcolare A + (-B)",
            distractors: ["Invertire A e sommare B", "Sommare i moduli", "Disegnare B sulla punta di A"],
            explanation: {
                correct: "Esatto! La differenza $\\vec{A} - \\vec{B}$ equivale a $\\vec{A} + (-\\vec{B})$, cioè sommare A al vettore opposto di B.",
                wrong: "Per la differenza, si calcola $\\vec{A} + (-\\vec{B})$: si inverte B e si applica il metodo punta-coda.",
            },
        },
    ];

    const chosen = randomChoice(questions);
    const allOptions = shuffle([chosen.correct, ...chosen.distractors]);
    const options = allOptions.map((text, i) => ({
        id: ["a", "b", "c", "d"][i],
        text,
        isLatex: false,
    }));

    const correctId = options.find(o => o.text === chosen.correct)!.id;

    return {
        id: generateId("vectheory"),
        type: "multiple_choice",
        prompt: chosen.prompt,
        promptLatex: true,
        options,
        correctOptionId: correctId,
        explanation: chosen.explanation,
        difficulty: "facile",
    };
}

/**
 * Domanda sulla componente x o y di una somma
 */
function generateComponentQuestion(): NumericQuestion {
    const ax = randomInt(-5, 5);
    const ay = randomInt(-5, 5);
    const bx = randomInt(-5, 5);
    const by = randomInt(-5, 5);

    const askX = Math.random() > 0.5;
    const result = askX ? ax + bx : ay + by;
    const component = askX ? "x" : "y";

    return {
        id: generateId("veccomp"),
        type: "numeric",
        prompt: `Dati $\\vec{A} = (${ax}, ${ay})$ e $\\vec{B} = (${bx}, ${by})$, qual è la componente $${component}$ di $\\vec{A} + \\vec{B}$?`,
        promptLatex: true,
        validation: {
            exactValue: result,
            tolerance: 0,
        },
        placeholder: `Componente ${component}...`,
        explanation: {
            correct: `Esatto! La componente $${component}$ di $\\vec{A} + \\vec{B}$ è $${askX ? ax : ay} + ${askX ? (bx >= 0 ? bx : `(${bx})`) : (by >= 0 ? by : `(${by})`)} = ${result}$`,
            wrong: `La componente $${component}$ si calcola sommando le componenti $${component}$: $${askX ? ax : ay} + ${askX ? (bx >= 0 ? bx : `(${bx})`) : (by >= 0 ? by : `(${by})`)} = ${result}$`,
        },
        difficulty: "facile",
    };
}

// ============ GENERATORE QUIZ ============

const QUIZ_LENGTH = 8;

const generators = [
    generateVectorSumQuestion,
    generateVectorDiffQuestion,
    generateScalarMultQuestion,
    generateMagnitudeQuestion,
    generateLinearCombQuestion,
    generateOppositeVectorQuestion,
    generatePuntaCodaQuestion,
    generateComponentQuestion,
];

function createVectorQuiz(): QuizDefinition {
    // Seleziona domande diverse
    const selectedGenerators = shuffle([...generators]).slice(0, QUIZ_LENGTH);
    const questions = selectedGenerators.map(gen => gen());

    return {
        id: `vettori-random-${Date.now()}`,
        title: "Quiz Vettori",
        description: "Somma, differenza, scalare e componenti cartesiane",
        questions,
        shuffleQuestions: true,
        shuffleOptions: false,
        passingScore: 60,
    };
}

// ============ COMPONENTE PRINCIPALE ============

export default function QuizVettoriDemo(): React.ReactElement {
    const [quiz, setQuiz] = useState<QuizDefinition>(createVectorQuiz);
    const [showImmediateFeedback, setShowImmediateFeedback] = useState(true);

    const {
        state,
        questions,
        currentQuestion,
        score,
        start,
        answer,
        next,
        prev,
        submit,
        reset,
        isFirst,
        isLast,
        answeredCount,
        canSubmit,
        currentFeedback,
        showFeedback,
    } = useQuiz({
        quiz,
        showImmediateFeedback,
    });

    const handleRetry = useCallback(() => {
        setQuiz(createVectorQuiz());
        reset();
    }, [reset]);

    const handleNewQuiz = useCallback(() => {
        setQuiz(createVectorQuiz());
        reset();
    }, [reset]);

    return (
        <QuizContainer
            title="Quiz: Vettori"
            description="Operazioni con vettori: somma, differenza, scalare, modulo e componenti"
        >
            {/* Schermata iniziale */}
            {state.status === "not_started" && (
                <>
                    <QuizStartScreen
                        title={quiz.title}
                        description={quiz.description}
                        questionCount={questions.length}
                        onStart={start}
                    />

                    {/* Opzioni */}
                    <div
                        style={{
                            marginTop: 20,
                            padding: 16,
                            background: "#f8fafc",
                            borderRadius: 12,
                        }}
                    >
                        <label
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                cursor: "pointer",
                                fontSize: 14,
                                color: "#334155",
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={showImmediateFeedback}
                                onChange={(e) =>
                                    setShowImmediateFeedback(e.target.checked)
                                }
                                style={{ width: 18, height: 18 }}
                            />
                            Mostra feedback immediato dopo ogni risposta
                        </label>
                    </div>

                    {/* Pulsante genera nuovo */}
                    <button
                        onClick={handleNewQuiz}
                        style={{
                            marginTop: 16,
                            width: "100%",
                            padding: "12px 20px",
                            borderRadius: 10,
                            border: "1px solid #d1d5db",
                            background: "#fff",
                            color: "#334155",
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: "pointer",
                        }}
                    >
                        🎲 Genera nuove domande
                    </button>
                </>
            )}

            {/* Quiz in corso */}
            {state.status === "in_progress" && currentQuestion && (
                <>
                    <QuizProgress
                        current={state.currentIndex}
                        total={questions.length}
                        answeredCount={answeredCount}
                    />

                    <QuizQuestionCard
                        question={currentQuestion}
                        currentAnswer={state.answers[currentQuestion.id] ?? null}
                        onAnswer={(value) => answer(currentQuestion.id, value)}
                        showFeedback={currentFeedback?.shown ?? false}
                        isCorrect={currentFeedback?.isCorrect}
                        disabled={currentFeedback?.shown}
                    />

                    <QuizNavigation
                        onPrev={prev}
                        onNext={next}
                        onSubmit={submit}
                        onShowFeedback={showImmediateFeedback ? showFeedback : undefined}
                        isFirst={isFirst}
                        isLast={isLast}
                        canSubmit={canSubmit}
                        showFeedbackButton={
                            showImmediateFeedback &&
                            state.answers[currentQuestion.id] !== null &&
                            state.answers[currentQuestion.id] !== undefined
                        }
                        feedbackShown={currentFeedback?.shown ?? false}
                    />

                    {/* Indicatori domande */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 6,
                            marginTop: 24,
                            flexWrap: "wrap",
                        }}
                    >
                        {questions.map((q, index) => {
                            const isAnswered =
                                state.answers[q.id] !== null &&
                                state.answers[q.id] !== undefined;
                            const isCurrent = index === state.currentIndex;

                            return (
                                <div
                                    key={q.id}
                                    style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 12,
                                        fontWeight: 600,
                                        background: isCurrent
                                            ? "#3b82f6"
                                            : isAnswered
                                            ? "#22c55e"
                                            : "#e2e8f0",
                                        color: isCurrent || isAnswered ? "#fff" : "#64748b",
                                        border: isCurrent ? "2px solid #1d4ed8" : "none",
                                    }}
                                >
                                    {index + 1}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Risultati */}
            {state.status === "completed" && score && (
                <QuizResults
                    score={score}
                    questions={questions}
                    answers={state.answers}
                    onRetry={handleRetry}
                    onBack={() => (window.location.href = "#/")}
                />
            )}
        </QuizContainer>
    );
}
