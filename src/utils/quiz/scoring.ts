/**
 * Quiz Scoring - Funzioni per validazione risposte e calcolo punteggio
 * @module utils/quiz/scoring
 */

import type {
    QuizQuestion,
    MultipleChoiceQuestion,
    NumericQuestion,
    QuizScore,
    QuestionResult,
    QuizDefinition,
} from "../../types/quiz";

// ============ VALIDAZIONE RISPOSTE ============

/**
 * Valida una risposta a scelta multipla
 */
export function validateMultipleChoice(
    question: MultipleChoiceQuestion,
    answer: string | null
): boolean {
    if (answer === null) return false;
    return answer === question.correctOptionId;
}

/**
 * Valida una risposta numerica con tolleranza opzionale
 */
export function validateNumeric(
    question: NumericQuestion,
    answer: number | null
): boolean {
    if (answer === null || isNaN(answer)) return false;

    const { exactValue, tolerance = 0 } = question.validation;
    return Math.abs(answer - exactValue) <= tolerance;
}

/**
 * Valida una risposta generica in base al tipo di domanda
 */
export function validateAnswer(
    question: QuizQuestion,
    answer: string | number | null
): boolean {
    if (question.type === "multiple_choice") {
        return validateMultipleChoice(question, answer as string | null);
    } else {
        return validateNumeric(question, answer as number | null);
    }
}

/**
 * Ottiene la risposta corretta per una domanda
 */
export function getCorrectAnswer(question: QuizQuestion): string | number {
    if (question.type === "multiple_choice") {
        return question.correctOptionId;
    } else {
        return question.validation.exactValue;
    }
}

/**
 * Ottiene il testo della risposta corretta (per visualizzazione)
 */
export function getCorrectAnswerText(question: QuizQuestion): string {
    if (question.type === "multiple_choice") {
        const option = question.options.find(
            (o) => o.id === question.correctOptionId
        );
        return option?.text ?? question.correctOptionId;
    } else {
        const { exactValue, tolerance } = question.validation;
        if (tolerance && tolerance > 0) {
            return `${exactValue} (±${tolerance})`;
        }
        return exactValue.toString();
    }
}

// ============ CALCOLO PUNTEGGIO ============

/**
 * Calcola il risultato per una singola domanda
 */
export function evaluateQuestion(
    question: QuizQuestion,
    answer: string | number | null
): QuestionResult {
    const isCorrect = validateAnswer(question, answer);
    const points = question.points ?? 1;

    return {
        questionId: question.id,
        userAnswer: answer,
        correctAnswer: getCorrectAnswer(question),
        isCorrect,
        points: isCorrect ? points : 0,
    };
}

/**
 * Calcola il punteggio complessivo del quiz
 */
export function calculateScore(
    questions: QuizQuestion[],
    answers: Record<string, string | number | null>,
    passingScore: number = 60
): QuizScore {
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;
    let totalPoints = 0;
    let maxPoints = 0;

    for (const question of questions) {
        const answer = answers[question.id] ?? null;
        const questionPoints = question.points ?? 1;
        maxPoints += questionPoints;

        if (answer === null || answer === "") {
            unanswered++;
        } else if (validateAnswer(question, answer)) {
            correct++;
            totalPoints += questionPoints;
        } else {
            wrong++;
        }
    }

    const total = questions.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    const passed = percentage >= passingScore;

    return {
        correct,
        wrong,
        unanswered,
        total,
        percentage,
        passed,
        totalPoints,
        maxPoints,
    };
}

/**
 * Calcola i risultati dettagliati per ogni domanda
 */
export function calculateDetailedResults(
    questions: QuizQuestion[],
    answers: Record<string, string | number | null>
): QuestionResult[] {
    return questions.map((question) => {
        const answer = answers[question.id] ?? null;
        return evaluateQuestion(question, answer);
    });
}

// ============ UTILITÀ ============

/**
 * Verifica se una domanda ha ricevuto risposta
 */
export function isQuestionAnswered(
    questionId: string,
    answers: Record<string, string | number | null>
): boolean {
    const answer = answers[questionId];
    return answer !== null && answer !== undefined && answer !== "";
}

/**
 * Conta le domande risposte
 */
export function countAnswered(
    questions: QuizQuestion[],
    answers: Record<string, string | number | null>
): number {
    return questions.filter((q) => isQuestionAnswered(q.id, answers)).length;
}

/**
 * Ottiene il colore in base alla percentuale
 */
export function getScoreColor(percentage: number): string {
    if (percentage >= 80) return "#22c55e"; // green
    if (percentage >= 60) return "#f59e0b"; // amber
    return "#ef4444"; // red
}

/**
 * Ottiene il messaggio in base al punteggio
 */
export function getScoreMessage(percentage: number, passed: boolean): string {
    if (percentage === 100) return "Perfetto! Tutte le risposte sono corrette!";
    if (percentage >= 90) return "Ottimo lavoro!";
    if (percentage >= 80) return "Molto bene!";
    if (percentage >= 70) return "Buon risultato!";
    if (passed) return "Quiz superato!";
    if (percentage >= 50) return "Quasi! Riprova per migliorare.";
    return "Continua a esercitarti!";
}

/**
 * Prepara un quiz per essere eseguito (shuffle se necessario)
 */
export function prepareQuiz(quiz: QuizDefinition): QuizQuestion[] {
    let questions = [...quiz.questions];

    // Shuffle domande se richiesto
    if (quiz.shuffleQuestions) {
        questions = shuffleArray(questions);
    }

    // Shuffle opzioni per domande multiple choice se richiesto
    if (quiz.shuffleOptions) {
        questions = questions.map((q) => {
            if (q.type === "multiple_choice") {
                return {
                    ...q,
                    options: shuffleArray([...q.options]),
                };
            }
            return q;
        });
    }

    return questions;
}

/**
 * Fisher-Yates shuffle
 */
function shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}
