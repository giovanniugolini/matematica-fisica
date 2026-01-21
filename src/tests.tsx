import React from "react";

// Tipi per verifiche/quiz
export type TestInfo = {
    slug: string;
    title: string;
    Component: React.LazyExoticComponent<React.ComponentType<any>>;
    /** Tipo: "quiz" per quiz random, "verifica" per verifiche predefinite */
    type: "quiz" | "verifica";
    /** Numero di domande (per visualizzazione) */
    questionCount?: number;
};

// Registro delle verifiche e quiz
export const tests: TestInfo[] = [
    {
        slug: "quiz-algebra",
        title: "Quiz: Equazioni di 2° grado (random)",
        Component: React.lazy(() => import("./demos/quiz/QuizAlgebraDemo")),
        type: "quiz",
        questionCount: 7,
    },
    {
        slug: "verifica-algebra-1",
        title: "Verifica: Equazioni di 2° grado",
        Component: React.lazy(() => import("./demos/quiz/VerificaAlgebra1")),
        type: "verifica",
        questionCount: 10,
    },
    {
        slug: "quiz-vettori",
        title: "Quiz: Vettori (random)",
        Component: React.lazy(() => import("./demos/quiz/QuizVettoriDemo")),
        type: "quiz",
        questionCount: 8,
    },
];
