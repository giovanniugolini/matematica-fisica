/**
 * VerificaAlgebra1 - Verifica predefinita sulle equazioni di secondo grado
 */

import React from "react";
import {
    QuizContainer,
    QuizStartScreen,
    QuizProgress,
    QuizQuestionCard,
    QuizNavigation,
    QuizResults,
} from "../../components/ui/Quiz";
import { useQuiz } from "../../hooks/useQuiz";
import type { QuizDefinition } from "../../types/quiz";

/**
 * Verifica predefinita con domande fisse
 */
const verificaAlgebra1: QuizDefinition = {
    id: "verifica-algebra-1",
    title: "Verifica: Equazioni di 2° grado",
    description:
        "Verifica sommativa sulle equazioni di secondo grado - 10 domande",
    passingScore: 60,
    shuffleQuestions: true,
    shuffleOptions: true,
    questions: [
        // DOMANDA 1 - Discriminante
        {
            id: "v1-q1",
            type: "multiple_choice",
            prompt: "Calcola il discriminante dell'equazione $x^2 - 6x + 9 = 0$",
            promptLatex: true,
            options: [
                { id: "a", text: "0", isLatex: false },
                { id: "b", text: "36", isLatex: false },
                { id: "c", text: "-36", isLatex: false },
                { id: "d", text: "45", isLatex: false },
            ],
            correctOptionId: "a",
            explanation: {
                correct:
                    "Esatto! $\\Delta = b^2 - 4ac = (-6)^2 - 4(1)(9) = 36 - 36 = 0$",
                wrong: "Il discriminante si calcola con $\\Delta = b^2 - 4ac = 36 - 36 = 0$",
            },
            difficulty: "facile",
            points: 1,
        },
        // DOMANDA 2 - Numero soluzioni
        {
            id: "v1-q2",
            type: "multiple_choice",
            prompt:
                "Se il discriminante di un'equazione di secondo grado è negativo, quante soluzioni reali ha?",
            promptLatex: false,
            options: [
                { id: "a", text: "Due soluzioni distinte", isLatex: false },
                { id: "b", text: "Una soluzione doppia", isLatex: false },
                { id: "c", text: "Nessuna soluzione reale", isLatex: false },
                { id: "d", text: "Infinite soluzioni", isLatex: false },
            ],
            correctOptionId: "c",
            explanation: {
                correct:
                    "Corretto! Quando $\\Delta < 0$, l'equazione non ammette soluzioni reali.",
                wrong: "Quando $\\Delta < 0$, non esistono soluzioni reali perché dovremmo estrarre la radice quadrata di un numero negativo.",
            },
            difficulty: "facile",
            points: 1,
        },
        // DOMANDA 3 - Risoluzione equazione
        {
            id: "v1-q3",
            type: "multiple_choice",
            prompt: "Risolvi l'equazione $x^2 - 5x + 6 = 0$",
            promptLatex: true,
            options: [
                {
                    id: "a",
                    text: "x = 2 \\text{ oppure } x = 3",
                    isLatex: true,
                },
                {
                    id: "b",
                    text: "x = -2 \\text{ oppure } x = -3",
                    isLatex: true,
                },
                {
                    id: "c",
                    text: "x = 1 \\text{ oppure } x = 6",
                    isLatex: true,
                },
                { id: "d", text: "x = 5", isLatex: true },
            ],
            correctOptionId: "a",
            explanation: {
                correct:
                    "Esatto! $(x-2)(x-3) = 0$ quindi $x = 2$ oppure $x = 3$",
                wrong: "Scomponiamo: $x^2 - 5x + 6 = (x-2)(x-3) = 0$, quindi $x = 2$ oppure $x = 3$",
            },
            difficulty: "medio",
            points: 1,
        },
        // DOMANDA 4 - Equazione pura
        {
            id: "v1-q4",
            type: "multiple_choice",
            prompt: "Risolvi l'equazione $x^2 - 16 = 0$",
            promptLatex: true,
            options: [
                {
                    id: "a",
                    text: "x = 4 \\text{ oppure } x = -4",
                    isLatex: true,
                },
                { id: "b", text: "x = 4", isLatex: true },
                { id: "c", text: "x = 16", isLatex: true },
                { id: "d", text: "x = \\pm 8", isLatex: true },
            ],
            correctOptionId: "a",
            explanation: {
                correct:
                    "Corretto! $x^2 = 16$ quindi $x = \\pm\\sqrt{16} = \\pm 4$",
                wrong: "Questa è un'equazione pura: $x^2 = 16$, quindi $x = \\pm 4$",
            },
            difficulty: "facile",
            points: 1,
        },
        // DOMANDA 5 - Somma delle radici
        {
            id: "v1-q5",
            type: "numeric",
            prompt:
                "Qual è la somma delle soluzioni dell'equazione $x^2 - 7x + 10 = 0$?",
            promptLatex: true,
            validation: {
                exactValue: 7,
                tolerance: 0,
            },
            placeholder: "Inserisci la somma...",
            explanation: {
                correct:
                    "Esatto! Per la relazione di Vieta: $x_1 + x_2 = -\\frac{b}{a} = -\\frac{-7}{1} = 7$",
                wrong: "La somma delle radici è $-\\frac{b}{a} = -\\frac{-7}{1} = 7$. (Le soluzioni sono 2 e 5)",
            },
            difficulty: "medio",
            points: 1,
        },
        // DOMANDA 6 - Prodotto delle radici
        {
            id: "v1-q6",
            type: "numeric",
            prompt:
                "Qual è il prodotto delle soluzioni dell'equazione $x^2 + 3x - 10 = 0$?",
            promptLatex: true,
            validation: {
                exactValue: -10,
                tolerance: 0,
            },
            placeholder: "Inserisci il prodotto...",
            explanation: {
                correct:
                    "Esatto! Per la relazione di Vieta: $x_1 \\cdot x_2 = \\frac{c}{a} = -10$",
                wrong: "Il prodotto delle radici è $\\frac{c}{a} = \\frac{-10}{1} = -10$",
            },
            difficulty: "medio",
            points: 1,
        },
        // DOMANDA 7 - Classificazione
        {
            id: "v1-q7",
            type: "multiple_choice",
            prompt: "Come si classifica l'equazione $3x^2 - 12 = 0$?",
            promptLatex: true,
            options: [
                { id: "a", text: "Equazione pura", isLatex: false },
                { id: "b", text: "Equazione spuria", isLatex: false },
                { id: "c", text: "Equazione completa", isLatex: false },
                { id: "d", text: "Equazione lineare", isLatex: false },
            ],
            correctOptionId: "a",
            explanation: {
                correct:
                    "Corretto! È un'equazione pura perché manca il termine di primo grado ($b = 0$).",
                wrong: "Un'equazione di 2° grado si dice pura se $b = 0$ (manca il termine $bx$). In questo caso $3x^2 - 12 = 0$ è pura.",
            },
            difficulty: "facile",
            points: 1,
        },
        // DOMANDA 8 - Formula risolutiva
        {
            id: "v1-q8",
            type: "multiple_choice",
            prompt:
                "Qual è la formula risolutiva per l'equazione $ax^2 + bx + c = 0$?",
            promptLatex: true,
            options: [
                {
                    id: "a",
                    text: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
                    isLatex: true,
                },
                {
                    id: "b",
                    text: "x = \\frac{b \\pm \\sqrt{b^2 - 4ac}}{2a}",
                    isLatex: true,
                },
                {
                    id: "c",
                    text: "x = \\frac{-b \\pm \\sqrt{b^2 + 4ac}}{2a}",
                    isLatex: true,
                },
                {
                    id: "d",
                    text: "x = \\frac{-b \\pm \\sqrt{4ac - b^2}}{2a}",
                    isLatex: true,
                },
            ],
            correctOptionId: "a",
            explanation: {
                correct:
                    "Esatto! La formula risolutiva è $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$",
                wrong: "La formula corretta è $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$. Nota il segno negativo davanti a $b$ e il segno meno sotto radice.",
            },
            difficulty: "medio",
            points: 1,
        },
        // DOMANDA 9 - Calcolo discriminante numerico
        {
            id: "v1-q9",
            type: "numeric",
            prompt: "Calcola il discriminante dell'equazione $2x^2 - 4x - 6 = 0$",
            promptLatex: true,
            validation: {
                exactValue: 64,
                tolerance: 0,
            },
            placeholder: "Inserisci Δ...",
            explanation: {
                correct:
                    "Esatto! $\\Delta = b^2 - 4ac = (-4)^2 - 4(2)(-6) = 16 + 48 = 64$",
                wrong: "$\\Delta = b^2 - 4ac = (-4)^2 - 4(2)(-6) = 16 + 48 = 64$",
            },
            difficulty: "medio",
            points: 1,
        },
        // DOMANDA 10 - Equazione spuria
        {
            id: "v1-q10",
            type: "multiple_choice",
            prompt: "Risolvi l'equazione spuria $x^2 + 4x = 0$",
            promptLatex: true,
            options: [
                {
                    id: "a",
                    text: "x = 0 \\text{ oppure } x = -4",
                    isLatex: true,
                },
                {
                    id: "b",
                    text: "x = 0 \\text{ oppure } x = 4",
                    isLatex: true,
                },
                { id: "c", text: "x = -4", isLatex: true },
                { id: "d", text: "x = 0", isLatex: true },
            ],
            correctOptionId: "a",
            explanation: {
                correct:
                    "Esatto! $x(x + 4) = 0$, quindi $x = 0$ oppure $x = -4$",
                wrong: "Raccogliamo $x$: $x(x + 4) = 0$. Quindi $x = 0$ oppure $x + 4 = 0 \\Rightarrow x = -4$",
            },
            difficulty: "medio",
            points: 1,
        },
    ],
};

export default function VerificaAlgebra1(): React.ReactElement {
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
    } = useQuiz({
        quiz: verificaAlgebra1,
        showImmediateFeedback: false, // Nessun feedback durante la verifica
    });

    return (
        <QuizContainer
            title="Verifica: Equazioni di 2° grado"
            description="Verifica sommativa - Rispondi a tutte le domande prima di inviare"
        >
            {/* Schermata iniziale */}
            {state.status === "not_started" && (
                <>
                    <QuizStartScreen
                        title={verificaAlgebra1.title}
                        description={verificaAlgebra1.description}
                        questionCount={verificaAlgebra1.questions.length}
                        onStart={start}
                    />

                    <div
                        style={{
                            marginTop: 20,
                            padding: 16,
                            background: "#fef3c7",
                            borderRadius: 12,
                            border: "1px solid #fcd34d",
                        }}
                    >
                        <div
                            style={{
                                fontWeight: 600,
                                color: "#92400e",
                                marginBottom: 8,
                            }}
                        >
                            ⚠️ Modalità Verifica
                        </div>
                        <ul
                            style={{
                                margin: 0,
                                paddingLeft: 20,
                                fontSize: 14,
                                color: "#92400e",
                            }}
                        >
                            <li>Non verrà mostrato feedback durante la verifica</li>
                            <li>Puoi navigare tra le domande liberamente</li>
                            <li>
                                Le domande e le opzioni saranno in ordine casuale
                            </li>
                            <li>
                                Puoi inviare la verifica solo dopo aver risposto
                                ad almeno una domanda
                            </li>
                        </ul>
                    </div>
                </>
            )}

            {/* Verifica in corso */}
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
                        showFeedback={false}
                        disabled={false}
                    />

                    <QuizNavigation
                        onPrev={prev}
                        onNext={next}
                        onSubmit={submit}
                        isFirst={isFirst}
                        isLast={isLast}
                        canSubmit={canSubmit}
                    />

                    {/* Griglia navigazione domande */}
                    <div
                        style={{
                            marginTop: 24,
                            padding: 16,
                            background: "#f8fafc",
                            borderRadius: 12,
                        }}
                    >
                        <div
                            style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: "#64748b",
                                marginBottom: 12,
                            }}
                        >
                            Vai alla domanda:
                        </div>
                        <div
                            style={{
                                display: "flex",
                                gap: 8,
                                flexWrap: "wrap",
                            }}
                        >
                            {questions.map((q, index) => {
                                const isAnswered =
                                    state.answers[q.id] !== null &&
                                    state.answers[q.id] !== undefined;
                                const isCurrent = index === state.currentIndex;

                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => {
                                            // goTo non è esposto, ma possiamo navigare con next/prev
                                            // Per semplicità, ricarichiamo con l'indice diretto
                                        }}
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 8,
                                            border: isCurrent
                                                ? "2px solid #3b82f6"
                                                : "1px solid #e2e8f0",
                                            background: isAnswered
                                                ? "#dcfce7"
                                                : "#fff",
                                            color: isCurrent
                                                ? "#3b82f6"
                                                : isAnswered
                                                ? "#166534"
                                                : "#64748b",
                                            fontSize: 14,
                                            fontWeight: isCurrent ? 700 : 500,
                                            cursor: "default",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        {index + 1}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Avviso se ci sono domande senza risposta */}
                        {answeredCount < questions.length && (
                            <div
                                style={{
                                    marginTop: 12,
                                    fontSize: 13,
                                    color: "#f59e0b",
                                }}
                            >
                                {questions.length - answeredCount} domande senza
                                risposta
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Risultati */}
            {state.status === "completed" && score && (
                <QuizResults
                    score={score}
                    questions={questions}
                    answers={state.answers}
                    onRetry={reset}
                    onBack={() => (window.location.href = "#/")}
                />
            )}
        </QuizContainer>
    );
}
