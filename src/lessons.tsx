import React from "react";

// Tipi per le lezioni
export type LessonInfo = {
    slug: string;
    title: string;
    description?: string;
    materia: "matematica" | "fisica";
    argomento: string;
    durata?: number; // minuti
    Component: React.LazyExoticComponent<React.ComponentType<any>>;
};

// Registro delle lezioni
export const lessons: LessonInfo[] = [
    {
        slug: "lezione-componenti-vettore",
        title: "Componenti cartesiane di un vettore",
        description: "Come scomporre un vettore nelle sue componenti x e y usando seno e coseno",
        materia: "fisica",
        argomento: "vettori",
        durata: 45,
        Component: React.lazy(() => import("./lessons/pages/LessonPage")),
    },
    // Aggiungi altre lezioni qui...
];

// Mappa slug -> lezione per lookup veloce
export const lessonBySlug = new Map(lessons.map((l) => [l.slug, l]));