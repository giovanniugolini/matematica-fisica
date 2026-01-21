/**
 * Quiz Generators - Generatori di domande casuali per quiz
 * @module utils/quiz/generators
 */

import type {
    QuizQuestion,
    MultipleChoiceQuestion,
    NumericQuestion,
    QuizOption,
    QuestionDifficulty,
} from "../../types/quiz";
import {
    randomInt,
    randomNonZero,
    randomChoice,
    shuffle,
    formatQuadraticLatex,
    discriminant,
} from "../math";

// ============ UTILITY ============

let questionIdCounter = 0;

/**
 * Genera un ID univoco per una domanda
 */
function generateId(prefix: string = "q"): string {
    return `${prefix}_${Date.now()}_${++questionIdCounter}`;
}

/**
 * Crea opzioni da un array di valori
 */
function createOptions(
    values: (string | number)[],
    isLatex: boolean = false
): QuizOption[] {
    const letters = ["a", "b", "c", "d"];
    return values.map((value, index) => ({
        id: letters[index],
        text: String(value),
        isLatex,
    }));
}

// ============ GENERATORI EQUAZIONI 2° GRADO ============

/**
 * Genera una domanda sul discriminante di un'equazione di 2° grado
 */
export function generateDiscriminantQuestion(): MultipleChoiceQuestion {
    const a = randomNonZero(-5, 5);
    const b = randomInt(-10, 10);
    const c = randomInt(-10, 10);

    const delta = discriminant(a, b, c);
    const equation = `${formatQuadraticLatex(a, b, c)} = 0`;

    // Genera distrattori plausibili
    const distractors = [
        b * b + 4 * a * c, // errore segno
        b - 4 * a * c, // dimenticato quadrato
        4 * a * c - b * b, // invertito
    ].filter((d) => d !== delta);

    // Prendi 3 distrattori unici
    const uniqueDistractors = [...new Set(distractors)].slice(0, 3);
    while (uniqueDistractors.length < 3) {
        const fake = delta + randomNonZero(-20, 20);
        if (fake !== delta && !uniqueDistractors.includes(fake)) {
            uniqueDistractors.push(fake);
        }
    }

    const allOptions = shuffle([delta, ...uniqueDistractors.slice(0, 3)]);
    const options = createOptions(allOptions);
    const correctId = options.find((o) => o.text === String(delta))!.id;

    return {
        id: generateId("disc"),
        type: "multiple_choice",
        prompt: `Calcola il discriminante dell'equazione $${equation}$`,
        promptLatex: true,
        options,
        correctOptionId: correctId,
        explanation: {
            correct: `Esatto! $\\Delta = b^2 - 4ac = ${b}^2 - 4 \\cdot ${a} \\cdot ${c} = ${delta}$`,
            wrong: `Il discriminante si calcola con $\\Delta = b^2 - 4ac = ${b}^2 - 4 \\cdot ${a} \\cdot ${c} = ${delta}$`,
        },
        difficulty: "facile",
    };
}

/**
 * Genera una domanda sul numero di soluzioni di un'equazione di 2° grado
 */
export function generateSolutionCountQuestion(): MultipleChoiceQuestion {
    // Genera coefficienti che producono diversi tipi di discriminante
    const type = randomChoice(["positive", "zero", "negative"] as const);

    let a: number, b: number, c: number;

    if (type === "positive") {
        // Δ > 0: due soluzioni reali distinte
        a = 1;
        b = randomInt(3, 8);
        c = 1;
    } else if (type === "zero") {
        // Δ = 0: due soluzioni reali coincidenti
        const root = randomInt(1, 5);
        a = 1;
        b = -2 * root;
        c = root * root;
    } else {
        // Δ < 0: nessuna soluzione reale
        a = 1;
        b = randomInt(-4, 4);
        c = randomInt(10, 20);
    }

    const delta = discriminant(a, b, c);
    const equation = `${formatQuadraticLatex(a, b, c)} = 0`;

    let correctAnswer: string;
    if (delta > 0) {
        correctAnswer = "Due soluzioni reali distinte";
    } else if (delta === 0) {
        correctAnswer = "Due soluzioni reali coincidenti";
    } else {
        correctAnswer = "Nessuna soluzione reale";
    }

    const allOptions = [
        "Due soluzioni reali distinte",
        "Due soluzioni reali coincidenti",
        "Nessuna soluzione reale",
        "Infinite soluzioni",
    ];

    const options = createOptions(allOptions);
    const correctId = options.find((o) => o.text === correctAnswer)!.id;

    return {
        id: generateId("solcount"),
        type: "multiple_choice",
        prompt: `Quante soluzioni reali ha l'equazione $${equation}$?`,
        promptLatex: true,
        options,
        correctOptionId: correctId,
        explanation: {
            correct: `Corretto! Il discriminante è $\\Delta = ${delta}$, quindi l'equazione ha ${correctAnswer.toLowerCase()}.`,
            wrong: `Il discriminante è $\\Delta = ${delta}$. Quando $\\Delta > 0$ ci sono due soluzioni distinte, quando $\\Delta = 0$ sono coincidenti, quando $\\Delta < 0$ non ci sono soluzioni reali.`,
        },
        difficulty: "medio",
    };
}

/**
 * Genera una domanda sulle soluzioni di un'equazione di 2° grado
 */
export function generateQuadraticSolutionQuestion(): MultipleChoiceQuestion {
    // Genera un'equazione con soluzioni intere
    const x1 = randomInt(-6, 6);
    const x2 = randomInt(-6, 6);

    const a = 1;
    const b = -(x1 + x2);
    const c = x1 * x2;

    const equation = `${formatQuadraticLatex(a, b, c)} = 0`;

    let correctAnswer: string;
    if (x1 === x2) {
        correctAnswer = `x = ${x1}`;
    } else {
        const sorted = [x1, x2].sort((a, b) => a - b);
        correctAnswer = `x = ${sorted[0]} \\text{ oppure } x = ${sorted[1]}`;
    }

    // Genera distrattori
    const distractors: string[] = [];
    if (x1 === x2) {
        distractors.push(`x = ${x1 + 1}`);
        distractors.push(`x = ${-x1}`);
        distractors.push(`x = ${x1} \\text{ oppure } x = ${x1 + 2}`);
    } else {
        distractors.push(`x = ${x1 + x2} \\text{ oppure } x = ${x1 * x2}`);
        distractors.push(`x = ${-x1} \\text{ oppure } x = ${-x2}`);
        distractors.push(`x = ${x1 + 1} \\text{ oppure } x = ${x2 - 1}`);
    }

    const allOptions = shuffle([correctAnswer, ...distractors.slice(0, 3)]);
    const options = createOptions(allOptions, true);
    const correctId = options.find((o) => o.text === correctAnswer)!.id;

    return {
        id: generateId("quadsol"),
        type: "multiple_choice",
        prompt: `Risolvi l'equazione $${equation}$`,
        promptLatex: true,
        options,
        correctOptionId: correctId,
        explanation: {
            correct: x1 === x2
                ? `Esatto! L'equazione ha una soluzione doppia $x = ${x1}$`
                : `Esatto! Le soluzioni sono $x_1 = ${Math.min(x1, x2)}$ e $x_2 = ${Math.max(x1, x2)}$`,
            wrong: x1 === x2
                ? `L'equazione $(x - ${x1})^2 = 0$ ha soluzione $x = ${x1}$`
                : `L'equazione $(x - ${x1})(x - ${x2}) = 0$ ha soluzioni $x = ${x1}$ e $x = ${x2}$`,
        },
        difficulty: "medio",
    };
}

// ============ GENERATORI CALCOLO NUMERICO ============

/**
 * Genera una domanda con risposta numerica sulla somma dei coefficienti
 */
export function generateCoefficientSumQuestion(): NumericQuestion {
    const a = randomNonZero(-5, 5);
    const b = randomInt(-10, 10);
    const c = randomInt(-10, 10);

    const equation = `${formatQuadraticLatex(a, b, c)} = 0`;
    const sum = a + b + c;

    return {
        id: generateId("coefsum"),
        type: "numeric",
        prompt: `Calcola la somma dei coefficienti $a + b + c$ per l'equazione $${equation}$`,
        promptLatex: true,
        validation: {
            exactValue: sum,
            tolerance: 0,
        },
        placeholder: "Inserisci il risultato...",
        explanation: {
            correct: `Esatto! $a + b + c = ${a} + (${b}) + (${c}) = ${sum}$`,
            wrong: `La somma è $a + b + c = ${a} + (${b}) + (${c}) = ${sum}$`,
        },
        difficulty: "facile",
    };
}

/**
 * Genera una domanda con risposta numerica sul prodotto delle radici
 */
export function generateRootsProductQuestion(): NumericQuestion {
    const x1 = randomInt(-5, 5);
    const x2 = randomInt(-5, 5);

    const a = 1;
    const b = -(x1 + x2);
    const c = x1 * x2;

    const equation = `${formatQuadraticLatex(a, b, c)} = 0`;
    const product = x1 * x2;

    return {
        id: generateId("rootprod"),
        type: "numeric",
        prompt: `Calcola il prodotto delle soluzioni dell'equazione $${equation}$`,
        promptLatex: true,
        validation: {
            exactValue: product,
            tolerance: 0,
        },
        placeholder: "Inserisci il risultato...",
        explanation: {
            correct: `Corretto! Il prodotto delle radici è $x_1 \\cdot x_2 = \\frac{c}{a} = ${product}$`,
            wrong: `Per un'equazione $ax^2 + bx + c = 0$, il prodotto delle radici è $\\frac{c}{a} = ${product}$`,
        },
        difficulty: "medio",
    };
}

/**
 * Genera una domanda con risposta numerica sulla somma delle radici
 */
export function generateRootsSumQuestion(): NumericQuestion {
    const x1 = randomInt(-5, 5);
    const x2 = randomInt(-5, 5);

    const a = 1;
    const b = -(x1 + x2);
    const c = x1 * x2;

    const equation = `${formatQuadraticLatex(a, b, c)} = 0`;
    const sum = x1 + x2;

    return {
        id: generateId("rootsum"),
        type: "numeric",
        prompt: `Calcola la somma delle soluzioni dell'equazione $${equation}$`,
        promptLatex: true,
        validation: {
            exactValue: sum,
            tolerance: 0,
        },
        placeholder: "Inserisci il risultato...",
        explanation: {
            correct: `Corretto! La somma delle radici è $x_1 + x_2 = -\\frac{b}{a} = ${sum}$`,
            wrong: `Per un'equazione $ax^2 + bx + c = 0$, la somma delle radici è $-\\frac{b}{a} = ${sum}$`,
        },
        difficulty: "medio",
    };
}

// ============ GENERATORE QUIZ COMPLETO ============

export type QuestionGeneratorType =
    | "discriminant"
    | "solutionCount"
    | "quadraticSolution"
    | "coefficientSum"
    | "rootsProduct"
    | "rootsSum";

const generators: Record<QuestionGeneratorType, () => QuizQuestion> = {
    discriminant: generateDiscriminantQuestion,
    solutionCount: generateSolutionCountQuestion,
    quadraticSolution: generateQuadraticSolutionQuestion,
    coefficientSum: generateCoefficientSumQuestion,
    rootsProduct: generateRootsProductQuestion,
    rootsSum: generateRootsSumQuestion,
};

/**
 * Genera un set casuale di domande per un quiz di algebra
 */
export function generateAlgebraQuiz(
    count: number,
    types?: QuestionGeneratorType[]
): QuizQuestion[] {
    const availableTypes = types ?? (Object.keys(generators) as QuestionGeneratorType[]);
    const questions: QuizQuestion[] = [];

    for (let i = 0; i < count; i++) {
        const type = randomChoice(availableTypes);
        questions.push(generators[type]());
    }

    return questions;
}

/**
 * Genera un quiz misto con domande di diversa difficoltà
 */
export function generateMixedQuiz(config: {
    easy?: number;
    medium?: number;
    hard?: number;
}): QuizQuestion[] {
    const questions: QuizQuestion[] = [];

    // Facile: discriminante e somma coefficienti
    const easyTypes: QuestionGeneratorType[] = ["discriminant", "coefficientSum"];
    for (let i = 0; i < (config.easy ?? 2); i++) {
        questions.push(generators[randomChoice(easyTypes)]());
    }

    // Medio: conteggio soluzioni, prodotto/somma radici
    const mediumTypes: QuestionGeneratorType[] = [
        "solutionCount",
        "rootsProduct",
        "rootsSum",
    ];
    for (let i = 0; i < (config.medium ?? 3); i++) {
        questions.push(generators[randomChoice(mediumTypes)]());
    }

    // Difficile: soluzioni complete
    const hardTypes: QuestionGeneratorType[] = ["quadraticSolution"];
    for (let i = 0; i < (config.hard ?? 2); i++) {
        questions.push(generators[randomChoice(hardTypes)]());
    }

    return shuffle(questions);
}
