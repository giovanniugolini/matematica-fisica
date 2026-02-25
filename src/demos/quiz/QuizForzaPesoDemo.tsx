/**
 * QuizForzaPesoDemo - Quiz sulla definizione di forza e forza peso
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
import type { QuizDefinition } from "../../types/quiz";

const quizForzaPeso: QuizDefinition = {
    id: "quiz-forza-peso",
    title: "Quiz: Forza e Forza Peso",
    description: "Definizione di forza, unità di misura, forza peso e relazione con la massa — 10 domande",
    passingScore: 60,
    shuffleQuestions: true,
    shuffleOptions: true,
    questions: [
        {
            id: "fp-q1",
            type: "multiple_choice",
            prompt: "Che tipo di grandezza è la forza?",
            promptLatex: false,
            options: [
                { id: "a", text: "Scalare", isLatex: false },
                { id: "b", text: "Vettoriale", isLatex: false },
                { id: "c", text: "Fondamentale", isLatex: false },
                { id: "d", text: "Invariante", isLatex: false },
            ],
            correctOptionId: "b",
            explanation: {
                correct: "Esatto! La forza è una grandezza vettoriale: ha modulo, direzione e verso.",
                wrong: "La forza è una grandezza vettoriale perché per descriverla completamente occorre specificare modulo, direzione e verso.",
            },
            difficulty: "facile",
            points: 1,
        },
        {
            id: "fp-q2",
            type: "multiple_choice",
            prompt: "Qual è l'unità di misura della forza nel Sistema Internazionale?",
            promptLatex: false,
            options: [
                { id: "a", text: "Chilogrammo (kg)", isLatex: false },
                { id: "b", text: "Metro al secondo (m/s)", isLatex: false },
                { id: "c", text: "Newton (N)", isLatex: false },
                { id: "d", text: "Joule (J)", isLatex: false },
            ],
            correctOptionId: "c",
            explanation: {
                correct: "Corretto! L'unità di misura della forza nel SI è il Newton (N), equivalente a kg·m/s².",
                wrong: "Nel Sistema Internazionale la forza si misura in Newton (N). 1 N = 1 kg·m/s².",
            },
            difficulty: "facile",
            points: 1,
        },
        {
            id: "fp-q3",
            type: "multiple_choice",
            prompt: "Quale strumento si usa per misurare l'intensità di una forza?",
            promptLatex: false,
            options: [
                { id: "a", text: "Bilancia a bracci", isLatex: false },
                { id: "b", text: "Tachimetro", isLatex: false },
                { id: "c", text: "Dinamometro", isLatex: false },
                { id: "d", text: "Termometro", isLatex: false },
            ],
            correctOptionId: "c",
            explanation: {
                correct: "Esatto! Il dinamometro misura l'intensità (modulo) di una forza sfruttando la deformazione di una molla.",
                wrong: "Lo strumento per misurare le forze è il dinamometro, che sfrutta la deformazione elastica di una molla (legge di Hooke).",
            },
            difficulty: "facile",
            points: 1,
        },
        {
            id: "fp-q4",
            type: "multiple_choice",
            prompt: "Cos'è la forza peso?",
            promptLatex: false,
            options: [
                { id: "a", text: "La quantità di materia di un corpo", isLatex: false },
                { id: "b", text: "La forza gravitazionale esercitata dalla Terra", isLatex: false },
                { id: "c", text: "La resistenza al movimento", isLatex: false },
                { id: "d", text: "Una deformazione elastica", isLatex: false },
            ],
            correctOptionId: "b",
            explanation: {
                correct: "Corretto! La forza peso è la forza gravitazionale con cui la Terra attrae un corpo verso il suo centro.",
                wrong: "La forza peso è la forza gravitazionale esercitata dalla Terra su un corpo. Non va confusa con la massa, che è la quantità di materia.",
            },
            difficulty: "facile",
            points: 1,
        },
        {
            id: "fp-q5",
            type: "multiple_choice",
            prompt: "Qual è la formula che lega il peso (P) alla massa (m)?",
            promptLatex: false,
            options: [
                { id: "a", text: "P = m/g", isLatex: false },
                { id: "b", text: "P = g/m", isLatex: false },
                { id: "c", text: "P = m + g", isLatex: false },
                { id: "d", text: "P = mg", isLatex: false },
            ],
            correctOptionId: "d",
            explanation: {
                correct: "Esatto! La formula è $P = mg$, dove $m$ è la massa in kg e $g$ è l'accelerazione di gravità (≈ 9,81 N/kg).",
                wrong: "La formula corretta è $P = mg$: il peso è il prodotto della massa per l'accelerazione di gravità $g$.",
            },
            difficulty: "facile",
            points: 1,
        },
        {
            id: "fp-q6",
            type: "multiple_choice",
            prompt: "Quanto vale circa la costante g sulla superficie terrestre?",
            promptLatex: false,
            options: [
                { id: "a", text: "1,62 N/kg", isLatex: false },
                { id: "b", text: "9,81 N/kg", isLatex: false },
                { id: "c", text: "3,69 N/kg", isLatex: false },
                { id: "d", text: "10,0 N/kg", isLatex: false },
            ],
            correctOptionId: "b",
            explanation: {
                correct: "Esatto! Sulla superficie terrestre $g \\approx 9{,}81 \\text{ N/kg}$ (spesso approssimato a $10 \\text{ N/kg}$ nei calcoli).",
                wrong: "Il valore di $g$ sulla superficie terrestre è circa $9{,}81 \\text{ N/kg}$. I valori 1,62 e 3,69 corrispondono rispettivamente a Luna e Marte.",
            },
            difficulty: "facile",
            points: 1,
        },
        {
            id: "fp-q7",
            type: "multiple_choice",
            prompt: "Qual è la principale differenza tra massa e peso?",
            promptLatex: false,
            options: [
                { id: "a", text: "La massa cambia a seconda del luogo", isLatex: false },
                { id: "b", text: "Il peso è una grandezza scalare", isLatex: false },
                { id: "c", text: "La massa è invariante, il peso dipende dal luogo", isLatex: false },
                { id: "d", text: "Non c'è alcuna differenza", isLatex: false },
            ],
            correctOptionId: "c",
            explanation: {
                correct: "Esatto! La massa è una proprietà intrinseca del corpo e non cambia mai. Il peso ($P = mg$) varia perché $g$ dipende dal pianeta o dal luogo.",
                wrong: "La massa è invariante (non dipende dal luogo), mentre il peso $P = mg$ cambia perché $g$ varia da pianeta a pianeta.",
            },
            difficulty: "medio",
            points: 1,
        },
        {
            id: "fp-q8",
            type: "multiple_choice",
            prompt: "Quali sono la direzione e il verso della forza peso?",
            promptLatex: false,
            options: [
                { id: "a", text: "Orizzontale verso destra", isLatex: false },
                { id: "b", text: "Perpendicolare alla superficie e verso il basso", isLatex: false },
                { id: "c", text: "Parallela alla superficie e verso l'alto", isLatex: false },
                { id: "d", text: "Circolare rispetto al centro", isLatex: false },
            ],
            correctOptionId: "b",
            explanation: {
                correct: "Corretto! La forza peso è diretta verso il centro della Terra, cioè perpendicolare al suolo e orientata verso il basso.",
                wrong: "La forza peso punta sempre verso il centro della Terra: è perpendicolare alla superficie terrestre e diretta verso il basso.",
            },
            difficulty: "facile",
            points: 1,
        },
        {
            id: "fp-q9",
            type: "multiple_choice",
            prompt: "Se un corpo ha una massa di 1025 kg, quanto peserà circa sulla Luna?",
            promptLatex: false,
            options: [
                { id: "a", text: "Circa lo stesso che sulla Terra", isLatex: false },
                { id: "b", text: "Circa un sesto del peso sulla Terra", isLatex: false },
                { id: "c", text: "Circa il doppio del peso sulla Terra", isLatex: false },
                { id: "d", text: "Esattamente zero", isLatex: false },
            ],
            correctOptionId: "b",
            explanation: {
                correct: "Esatto! Sulla Luna $g_{\\text{Luna}} \\approx 1{,}62 \\text{ N/kg} \\approx g_{\\text{Terra}}/6$, quindi il peso è circa un sesto di quello terrestre. La massa rimane invariata.",
                wrong: "Sulla Luna $g \\approx 1{,}62 \\text{ N/kg}$, circa un sesto del valore terrestre. Quindi $P_{\\text{Luna}} = m \\cdot g_{\\text{Luna}} \\approx P_{\\text{Terra}}/6$.",
            },
            difficulty: "medio",
            points: 1,
        },
        {
            id: "fp-q10",
            type: "multiple_choice",
            prompt: "Qual è l'effetto generale delle forze sui corpi?",
            promptLatex: false,
            options: [
                { id: "a", text: "Solo riscaldarli", isLatex: false },
                { id: "b", text: "Aumentarne sempre la massa", isLatex: false },
                { id: "c", text: "Modificare lo stato di moto o produrre deformazioni", isLatex: false },
                { id: "d", text: "Mantenerli sempre fermi", isLatex: false },
            ],
            correctOptionId: "c",
            explanation: {
                correct: "Esatto! Le forze possono modificare lo stato di moto di un corpo (accelerarlo, decelerarlo, cambiarne la direzione) oppure produrre deformazioni.",
                wrong: "Le forze hanno due effetti principali: modificare lo stato di moto (dinamico) o produrre deformazioni (statico). Non cambiano mai la massa.",
            },
            difficulty: "facile",
            points: 1,
        },
    ],
};

export default function QuizForzaPesoDemo(): React.ReactElement {
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
        quiz: quizForzaPeso,
        showImmediateFeedback,
    });

    const handleRetry = useCallback(() => {
        reset();
    }, [reset]);

    return (
        <QuizContainer
            title="Quiz: Forza e Forza Peso"
            description="Definizione di forza, unità di misura, forza peso e relazione con la massa"
        >
            {/* Schermata iniziale */}
            {state.status === "not_started" && (
                <>
                    <QuizStartScreen
                        title={quizForzaPeso.title}
                        description={quizForzaPeso.description}
                        questionCount={quizForzaPeso.questions.length}
                        onStart={start}
                    />

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
