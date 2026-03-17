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
    {
        slug: "quiz-forza-peso",
        title: "Quiz: Forza e Forza Peso",
        Component: React.lazy(() => import("./demos/quiz/QuizForzaPesoDemo")),
        type: "quiz",
        questionCount: 10,
    },
    {
        slug: "quiz-forza-elastica",
        title: "Quiz: Forza Elastica",
        Component: React.lazy(() => import("./demos/quiz/QuizForzaElasticaDemo")),
        type: "quiz",
        questionCount: 10,
    },
    {
        slug: "gioco-inversione-formule",
        title: "Gioco: Isola la variabile",
        Component: React.lazy(() => import("./demos/quiz/InversioneFormuleGame")),
        type: "quiz",
    },
    {
        slug: "escape-room",
        title: "Gioco: Escape Room di Fisica & Matematica",
        Component: React.lazy(() => import("./demos/quiz/EscapeRoomGame")),
        type: "quiz",
    },
    {
        slug: "verifica-fisica-vettori-1",
        title: "Verifica: Vettori e Forze",
        Component: React.lazy(() => import("./demos/quiz/VerificaFisicaVettori1")),
        type: "verifica",
    },
    {
        slug: "verifica-goniometria-1",
        title: "Verifica: Equazioni Goniometriche",
        Component: React.lazy(() => import("./demos/quiz/VerificaGoniometria1")),
        type: "verifica",
    },
    {
        slug: "verifica-continuita-1",
        title: "Verifica: Continuità e Asintoti",
        Component: React.lazy(() => import("./demos/quiz/VerificaContinuita1")),
        type: "verifica",
    },
    {
        slug: "verifica-piano-cartesiano-1",
        title: "Verifica: Piano Cartesiano e Retta",
        Component: React.lazy(() => import("./demos/quiz/VerificaPianoCartesiano1")),
        type: "verifica",
    },
    {
        slug: "battaglia-piano-cartesiano",
        title: "Battaglia di Problemi: Piano Cartesiano",
        Component: React.lazy(() => import("./demos/quiz/BattagliaProblemiDemo")),
        type: "quiz",
    },
];
