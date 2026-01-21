/**
 * useQuiz Hook - Gestione stato quiz
 * @module hooks/useQuiz
 */

import { useState, useCallback, useMemo } from "react";
import type {
    QuizQuestion,
    QuizState,
    QuizScore,
    QuizDefinition,
} from "../types/quiz";
import {
    calculateScore,
    countAnswered,
    prepareQuiz,
    validateAnswer,
} from "../utils/quiz/scoring";

export interface UseQuizOptions {
    /** Quiz da eseguire */
    quiz: QuizDefinition;
    /** Callback quando il quiz viene completato */
    onComplete?: (score: QuizScore) => void;
    /** Se mostrare feedback immediato dopo ogni risposta */
    showImmediateFeedback?: boolean;
}

export interface UseQuizReturn {
    // Stato
    state: QuizState;
    questions: QuizQuestion[];
    currentQuestion: QuizQuestion | null;
    score: QuizScore | null;

    // Azioni
    start: () => void;
    answer: (questionId: string, value: string | number | null) => void;
    next: () => void;
    prev: () => void;
    goTo: (index: number) => void;
    submit: () => void;
    reset: () => void;

    // Computed
    isFirst: boolean;
    isLast: boolean;
    progress: number;
    answeredCount: number;
    canSubmit: boolean;

    // Feedback (se showImmediateFeedback è true)
    currentFeedback: { isCorrect: boolean; shown: boolean } | null;
    showFeedback: () => void;
    hideFeedback: () => void;
}

/**
 * Hook per gestire lo stato e le azioni di un quiz
 */
export function useQuiz({
    quiz,
    onComplete,
    showImmediateFeedback = false,
}: UseQuizOptions): UseQuizReturn {
    // Domande preparate (con shuffle se necessario)
    const [questions, setQuestions] = useState<QuizQuestion[]>(() =>
        prepareQuiz(quiz)
    );

    // Stato del quiz
    const [state, setState] = useState<QuizState>({
        status: "not_started",
        currentIndex: 0,
        answers: {},
    });

    // Stato per feedback immediato
    const [currentFeedback, setCurrentFeedback] = useState<{
        isCorrect: boolean;
        shown: boolean;
    } | null>(null);

    // Score calcolato (null se non completato)
    const score = useMemo(() => {
        if (state.status !== "completed") return null;
        return calculateScore(questions, state.answers, quiz.passingScore ?? 60);
    }, [state.status, questions, state.answers, quiz.passingScore]);

    // Domanda corrente
    const currentQuestion = useMemo(() => {
        if (state.status === "not_started" || state.status === "completed") {
            return null;
        }
        return questions[state.currentIndex] ?? null;
    }, [questions, state.currentIndex, state.status]);

    // Computed values
    const isFirst = state.currentIndex === 0;
    const isLast = state.currentIndex === questions.length - 1;
    const progress =
        questions.length > 0
            ? Math.round(((state.currentIndex + 1) / questions.length) * 100)
            : 0;
    const answeredCount = countAnswered(questions, state.answers);
    const canSubmit = answeredCount > 0;

    // Azioni
    const start = useCallback(() => {
        // Ri-prepara le domande (nuovo shuffle se necessario)
        const preparedQuestions = prepareQuiz(quiz);
        setQuestions(preparedQuestions);
        setState({
            status: "in_progress",
            currentIndex: 0,
            answers: {},
            startedAt: Date.now(),
        });
        setCurrentFeedback(null);
    }, [quiz]);

    const answer = useCallback(
        (questionId: string, value: string | number | null) => {
            setState((prev) => ({
                ...prev,
                answers: {
                    ...prev.answers,
                    [questionId]: value,
                },
            }));
            // Reset feedback quando si cambia risposta
            setCurrentFeedback(null);
        },
        []
    );

    const next = useCallback(() => {
        setState((prev) => ({
            ...prev,
            currentIndex: Math.min(prev.currentIndex + 1, questions.length - 1),
        }));
        setCurrentFeedback(null);
    }, [questions.length]);

    const prev = useCallback(() => {
        setState((prev) => ({
            ...prev,
            currentIndex: Math.max(prev.currentIndex - 1, 0),
        }));
        setCurrentFeedback(null);
    }, []);

    const goTo = useCallback(
        (index: number) => {
            const safeIndex = Math.max(0, Math.min(index, questions.length - 1));
            setState((prev) => ({
                ...prev,
                currentIndex: safeIndex,
            }));
            setCurrentFeedback(null);
        },
        [questions.length]
    );

    const submit = useCallback(() => {
        const finalScore = calculateScore(
            questions,
            state.answers,
            quiz.passingScore ?? 60
        );
        setState((prev) => ({
            ...prev,
            status: "completed",
            completedAt: Date.now(),
        }));
        setCurrentFeedback(null);
        onComplete?.(finalScore);
    }, [questions, state.answers, quiz.passingScore, onComplete]);

    const reset = useCallback(() => {
        setState({
            status: "not_started",
            currentIndex: 0,
            answers: {},
        });
        setCurrentFeedback(null);
    }, []);

    // Feedback functions
    const showFeedback = useCallback(() => {
        if (!showImmediateFeedback || !currentQuestion) return;

        const userAnswer = state.answers[currentQuestion.id] ?? null;
        const isCorrect = validateAnswer(currentQuestion, userAnswer);

        setCurrentFeedback({ isCorrect, shown: true });
    }, [showImmediateFeedback, currentQuestion, state.answers]);

    const hideFeedback = useCallback(() => {
        setCurrentFeedback(null);
    }, []);

    return {
        state,
        questions,
        currentQuestion,
        score,
        start,
        answer,
        next,
        prev,
        goTo,
        submit,
        reset,
        isFirst,
        isLast,
        progress,
        answeredCount,
        canSubmit,
        currentFeedback,
        showFeedback,
        hideFeedback,
    };
}
