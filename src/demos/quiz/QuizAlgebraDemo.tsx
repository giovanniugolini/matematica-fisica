/**
 * QuizAlgebraDemo - Quiz random sulle equazioni di secondo grado
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
import type { QuizDefinition, QuizScore } from "../../types/quiz";
import { generateAlgebraQuiz } from "../../utils/quiz/generators";

const QUIZ_LENGTH = 7;

function createRandomQuiz(): QuizDefinition {
    return {
        id: `algebra-random-${Date.now()}`,
        title: "Quiz Equazioni di 2° grado",
        description:
            "Verifica le tue conoscenze sulle equazioni di secondo grado",
        questions: generateAlgebraQuiz(QUIZ_LENGTH),
        shuffleQuestions: false, // Già randomizzato dal generatore
        shuffleOptions: false,
        passingScore: 60,
    };
}

export default function QuizAlgebraDemo(): React.ReactElement {
    const [quiz, setQuiz] = useState<QuizDefinition>(createRandomQuiz);
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
        // Genera un nuovo quiz random
        setQuiz(createRandomQuiz());
        reset();
    }, [reset]);

    const handleNewQuiz = useCallback(() => {
        setQuiz(createRandomQuiz());
        reset();
    }, [reset]);

    return (
        <QuizContainer
            title="Quiz: Equazioni di 2° grado"
            description="Domande generate casualmente sulle equazioni di secondo grado"
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
