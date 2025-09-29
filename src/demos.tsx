import React from "react";

// Tipi opzionali
export type DemoInfo = {
    slug: string;
    title: string;
    Component: React.LazyExoticComponent<React.ComponentType<any>>;
};

// Registro delle demo (aggiungi qui le prossime)
export const demos: DemoInfo[] = [
    {
        slug: "angolo-rotazione",
        title: "Angolo come rotazione",
        Component: React.lazy(() => import("./demos/angolo-rotazione/AngleRotationDemo")),
    },
];
