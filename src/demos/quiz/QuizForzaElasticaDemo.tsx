/**
 * QuizForzaElasticaDemo - Quiz sulla forza elastica e legge di Hooke
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

const quizForzaElastica: QuizDefinition = {
    id: "quiz-forza-elastica",
    title: "Quiz: Forza Elastica",
    description: "Legge di Hooke, costante elastica e comportamento delle molle — 10 domande",
    passingScore: 60,
    shuffleQuestions: true,
    shuffleOptions: true,
    questions: [
        {
            id: "fe-q1",
            type: "multiple_choice",
            prompt: "Come viene definita la forza che tende a riportare una molla alla sua lunghezza iniziale?",
            promptLatex: false,
            options: [
                { id: "a", text: "Forza d'attrito", isLatex: false },
                { id: "b", text: "Forza di richiamo o elastica", isLatex: false },
                { id: "c", text: "Forza peso", isLatex: false },
                { id: "d", text: "Forza centrifuga", isLatex: false },
            ],
            correctOptionId: "b",
            explanation: {
                correct: "Esatto! La forza che riporta la molla alla lunghezza a riposo si chiama forza di richiamo o forza elastica.",
                wrong: "La forza che riporta la molla alla sua lunghezza naturale è la forza di richiamo (o elastica). È descritta dalla legge di Hooke.",
            },
            difficulty: "facile",
            points: 1,
        },
        {
            id: "fe-q2",
            type: "multiple_choice",
            prompt: "Qual è il nome della legge che descrive la proporzionalità tra forza elastica e allungamento?",
            promptLatex: false,
            options: [
                { id: "a", text: "Legge di Newton", isLatex: false },
                { id: "b", text: "Legge di gravitazione", isLatex: false },
                { id: "c", text: "Legge di Hooke", isLatex: false },
                { id: "d", text: "Legge di Archimede", isLatex: false },
            ],
            correctOptionId: "c",
            explanation: {
                correct: "Corretto! La legge di Hooke stabilisce che la forza elastica è proporzionale all'allungamento: $F = kx$.",
                wrong: "È la legge di Hooke (Robert Hooke, 1678) a stabilire che $F = kx$, cioè la proporzionalità diretta tra forza ed allungamento.",
            },
            difficulty: "facile",
            points: 1,
        },
        {
            id: "fe-q3",
            type: "multiple_choice",
            prompt: "Nella formula vettoriale $\\vec{F} = -k\\vec{x}$, cosa esprime il segno meno?",
            promptLatex: true,
            options: [
                { id: "a", text: "Che la forza è nulla", isLatex: false },
                { id: "b", text: "Che la forza ha lo stesso verso dello spostamento", isLatex: false },
                { id: "c", text: "Che la forza è sempre opposta allo spostamento", isLatex: false },
                { id: "d", text: "Che la costante k è negativa", isLatex: false },
            ],
            correctOptionId: "c",
            explanation: {
                correct: "Esatto! Il segno meno indica che la forza elastica è sempre diretta in senso opposto allo spostamento: se allunghi, la forza richiama verso il centro; se comprimi, spinge verso l'esterno.",
                wrong: "Il segno meno in $\\vec{F} = -k\\vec{x}$ indica che la forza è opposta allo spostamento $\\vec{x}$. La costante $k$ è sempre positiva.",
            },
            difficulty: "medio",
            points: 1,
        },
        {
            id: "fe-q4",
            type: "multiple_choice",
            prompt: "Qual è l'unità di misura della costante elastica k nel Sistema Internazionale?",
            promptLatex: false,
            options: [
                { id: "a", text: "Newton (N)", isLatex: false },
                { id: "b", text: "Metri al secondo (m/s)", isLatex: false },
                { id: "c", text: "Newton su metro (N/m)", isLatex: false },
                { id: "d", text: "Chilogrammi (kg)", isLatex: false },
            ],
            correctOptionId: "c",
            explanation: {
                correct: "Corretto! Dalla formula $k = F/x$, l'unità è $\\text{N}/\\text{m}$ (Newton su metro).",
                wrong: "Dalla definizione $k = F/x$: $[k] = \\text{N}/\\text{m}$, Newton su metro.",
            },
            difficulty: "facile",
            points: 1,
        },
        {
            id: "fe-q5",
            type: "multiple_choice",
            prompt: "Se raddoppiamo l'allungamento x di una molla, cosa accade all'intensità della forza elastica?",
            promptLatex: false,
            options: [
                { id: "a", text: "Rimane uguale", isLatex: false },
                { id: "b", text: "Dimezza", isLatex: false },
                { id: "c", text: "Raddoppia", isLatex: false },
                { id: "d", text: "Diventa quattro volte maggiore", isLatex: false },
            ],
            correctOptionId: "c",
            explanation: {
                correct: "Esatto! La relazione è lineare: $F = kx$. Se $x$ raddoppia, anche $F$ raddoppia (a parità di $k$).",
                wrong: "Dalla legge di Hooke $F = kx$: la forza è direttamente proporzionale all'allungamento, quindi se $x$ raddoppia, anche $F$ raddoppia.",
            },
            difficulty: "facile",
            points: 1,
        },
        {
            id: "fe-q6",
            type: "multiple_choice",
            prompt: "Cosa indica una costante elastica k molto elevata?",
            promptLatex: false,
            options: [
                { id: "a", text: "Che la molla è molto flessibile", isLatex: false },
                { id: "b", text: "Che la molla è molto rigida", isLatex: false },
                { id: "c", text: "Che la molla è molto lunga", isLatex: false },
                { id: "d", text: "Che la molla non ha massa", isLatex: false },
            ],
            correctOptionId: "b",
            explanation: {
                correct: "Esatto! Un $k$ elevato significa che serve una forza grande per produrre un piccolo allungamento: la molla è rigida.",
                wrong: "Un valore alto di $k$ indica rigidità: dalla formula $F = kx$, per ottenere lo stesso allungamento $x$ serve una forza $F$ maggiore.",
            },
            difficulty: "facile",
            points: 1,
        },
        {
            id: "fe-q7",
            type: "multiple_choice",
            prompt: "In un grafico forza-allungamento, cosa rappresenta la pendenza della retta?",
            promptLatex: false,
            options: [
                { id: "a", text: "La massa della molla", isLatex: false },
                { id: "b", text: "La costante elastica k", isLatex: false },
                { id: "c", text: "L'accelerazione di gravità", isLatex: false },
                { id: "d", text: "La forza peso", isLatex: false },
            ],
            correctOptionId: "b",
            explanation: {
                correct: "Esatto! Nel grafico $F$ vs $x$, la retta ha equazione $F = kx$: la pendenza (coefficiente angolare) è proprio $k$.",
                wrong: "Nel grafico $F$ vs $x$ la legge di Hooke dà una retta passante per l'origine con coefficiente angolare $k$: la pendenza è la costante elastica.",
            },
            difficulty: "medio",
            points: 1,
        },
        {
            id: "fe-q8",
            type: "multiple_choice",
            prompt: "Perché la legge di Hooke non è una legge fisica universale?",
            promptLatex: false,
            options: [
                { id: "a", text: "Perché vale solo per le masse", isLatex: false },
                { id: "b", text: "Perché è una legge empirica valida entro certi limiti", isLatex: false },
                { id: "c", text: "Perché vale solo sulla Luna", isLatex: false },
                { id: "d", text: "Perché non considera il tempo", isLatex: false },
            ],
            correctOptionId: "b",
            explanation: {
                correct: "Corretto! La legge di Hooke è empirica e vale solo entro il limite elastico del materiale: oltre quel punto la proporzionalità non vale più.",
                wrong: "La legge di Hooke è una legge empirica: funziona bene entro il limite elastico, ma se si supera tale limite la molla si deforma permanentemente e la proporzionalità non vale più.",
            },
            difficulty: "medio",
            points: 1,
        },
        {
            id: "fe-q9",
            type: "multiple_choice",
            prompt: "Cosa succede se si allunga una molla oltre il suo limite elastico?",
            promptLatex: false,
            options: [
                { id: "a", text: "Torna sempre alla forma originale", isLatex: false },
                { id: "b", text: "Si rompe istantaneamente", isLatex: false },
                { id: "c", text: "Si deforma permanentemente", isLatex: false },
                { id: "d", text: "La forza diventa infinita", isLatex: false },
            ],
            correctOptionId: "c",
            explanation: {
                correct: "Esatto! Superato il limite elastico, la molla subisce una deformazione permanente e non torna più alla lunghezza originale.",
                wrong: "Oltre il limite elastico il materiale entra nella zona plastica: la deformazione diventa permanente e la molla non recupera la forma iniziale.",
            },
            difficulty: "medio",
            points: 1,
        },
        {
            id: "fe-q10",
            type: "multiple_choice",
            prompt: "Se una forza di 4,0 N produce un allungamento di 0,020 m, quanto vale k?",
            promptLatex: false,
            options: [
                { id: "a", text: "0,08 N/m", isLatex: false },
                { id: "b", text: "200 N/m", isLatex: false },
                { id: "c", text: "50 N/m", isLatex: false },
                { id: "d", text: "80 N/m", isLatex: false },
            ],
            correctOptionId: "b",
            explanation: {
                correct: "Esatto! $k = F/x = 4{,}0 \\text{ N} / 0{,}020 \\text{ m} = 200 \\text{ N/m}$.",
                wrong: "Dalla legge di Hooke: $k = F/x = 4{,}0 / 0{,}020 = 200 \\text{ N/m}$.",
            },
            difficulty: "medio",
            points: 1,
        },
    ],
};

export default function QuizForzaElasticaDemo(): React.ReactElement {
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
        quiz: quizForzaElastica,
        showImmediateFeedback,
    });

    const handleRetry = useCallback(() => {
        reset();
    }, [reset]);

    return (
        <QuizContainer
            title="Quiz: Forza Elastica"
            description="Legge di Hooke, costante elastica e comportamento delle molle"
        >
            {state.status === "not_started" && (
                <>
                    <QuizStartScreen
                        title={quizForzaElastica.title}
                        description={quizForzaElastica.description}
                        questionCount={quizForzaElastica.questions.length}
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
                                onChange={(e) => setShowImmediateFeedback(e.target.checked)}
                                style={{ width: 18, height: 18 }}
                            />
                            Mostra feedback immediato dopo ogni risposta
                        </label>
                    </div>
                </>
            )}

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
