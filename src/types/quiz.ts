/**
 * Quiz Types - Interfacce TypeScript per il sistema quiz/verifiche
 * @module types/quiz
 */

// ============ TIPI DOMANDA ============

export type QuestionType = "multiple_choice" | "numeric";

export interface QuizOption {
    /** Identificatore opzione ("a", "b", "c", "d") */
    id: string;
    /** Testo dell'opzione */
    text: string;
    /** Se il testo è in formato LaTeX */
    isLatex?: boolean;
}

export interface QuestionExplanation {
    /** Spiegazione quando la risposta è corretta */
    correct: string;
    /** Spiegazione quando la risposta è sbagliata */
    wrong: string;
}

export type QuestionDifficulty = "facile" | "medio" | "difficile";

// ============ DOMANDE ============

interface BaseQuestion {
    /** Identificatore univoco della domanda */
    id: string;
    /** Testo della domanda */
    prompt: string;
    /** Se il prompt è in formato LaTeX */
    promptLatex?: boolean;
    /** Spiegazione per risposta corretta/sbagliata */
    explanation: QuestionExplanation;
    /** Difficoltà della domanda */
    difficulty?: QuestionDifficulty;
    /** Punti assegnati (default: 1) */
    points?: number;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
    type: "multiple_choice";
    /** Opzioni di risposta */
    options: QuizOption[];
    /** ID dell'opzione corretta */
    correctOptionId: string;
}

export interface NumericQuestion extends BaseQuestion {
    type: "numeric";
    /** Validazione della risposta numerica */
    validation: {
        /** Valore esatto atteso */
        exactValue: number;
        /** Tolleranza accettata (default: 0) */
        tolerance?: number;
    };
    /** Placeholder per l'input */
    placeholder?: string;
    /** Unità di misura (mostrata accanto all'input) */
    unit?: string;
}

export type QuizQuestion = MultipleChoiceQuestion | NumericQuestion;

// ============ DEFINIZIONE QUIZ ============

export interface QuizDefinition {
    /** Identificatore univoco del quiz */
    id: string;
    /** Titolo del quiz */
    title: string;
    /** Descrizione opzionale */
    description?: string;
    /** Lista delle domande */
    questions: QuizQuestion[];
    /** Limite di tempo in secondi (opzionale) */
    timeLimit?: number;
    /** Se mescolare l'ordine delle domande */
    shuffleQuestions?: boolean;
    /** Se mescolare le opzioni delle domande a risposta multipla */
    shuffleOptions?: boolean;
    /** Percentuale minima per superare il quiz (0-100) */
    passingScore?: number;
}

// ============ STATO QUIZ ============

export type QuizStatus = "not_started" | "in_progress" | "completed";

export interface QuizState {
    /** Stato corrente del quiz */
    status: QuizStatus;
    /** Indice della domanda corrente (0-indexed) */
    currentIndex: number;
    /** Risposte date (questionId -> valore) */
    answers: Record<string, string | number | null>;
    /** Timestamp di inizio */
    startedAt?: number;
    /** Timestamp di completamento */
    completedAt?: number;
}

// ============ RISULTATI ============

export interface QuizScore {
    /** Numero di risposte corrette */
    correct: number;
    /** Numero di risposte sbagliate */
    wrong: number;
    /** Numero di domande senza risposta */
    unanswered: number;
    /** Numero totale di domande */
    total: number;
    /** Percentuale di risposte corrette (0-100) */
    percentage: number;
    /** Se il quiz è stato superato */
    passed: boolean;
    /** Punti totali ottenuti */
    totalPoints: number;
    /** Punti massimi possibili */
    maxPoints: number;
}

export interface QuestionResult {
    /** ID della domanda */
    questionId: string;
    /** Risposta data dall'utente */
    userAnswer: string | number | null;
    /** Risposta corretta */
    correctAnswer: string | number;
    /** Se la risposta è corretta */
    isCorrect: boolean;
    /** Punti ottenuti */
    points: number;
}

// ============ GENERATORI ============

export interface QuestionGenerator {
    /** Genera una nuova domanda casuale */
    generate: () => QuizQuestion;
    /** Tipo di domanda generata */
    type: QuestionType;
    /** Categoria della domanda */
    category?: string;
}
