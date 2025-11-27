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

    {
        slug: "vettori-punta-coda", // Nuovo slug specifico per la somma
        title: "Vettori: Metodo Punta-Coda (interattivo)",
        Component: React.lazy(() => import("./demos/vettori-piano/VectorTailToHeadPage")), // Nuovo componente
    },
    {
        slug: "intervalli-r",
        title: "Intervalli su ℝ",
        Component: React.lazy(() => import("./demos/intervalli-r/IntervalliRDemo")),
    },
    {
        slug: "velocita-media-secante",
        title: "Velocità media (secante su s(t))",
        Component: React.lazy(() => import("./demos/media-velocita-secante/MediaVelocitaSecanteDemo")),
    },
    {
        slug: "legge-di-coulomb",
        title: "Legge di Coulomb (2 cariche)",
        Component: React.lazy(() => import("./demos/legge-coulomb/LeggeCoulombDemo")),
    },
    {
        slug: "campo-elettrico",
        title: "Campo elettrico (1 carica)",
        Component: React.lazy(() => import("./demos/campo-elettrico/CampoElettricoDemo")),
    },
    {
        slug: "conversione-unita",
        title: "Multipli e sottomultipli dell'unità di misura",
        Component: React.lazy(() => import("./demos/misure/ConversioneUnitaDemo")),
    },
    {
        slug: "misure",
        title: "Notazione scientifica delle misure",
        Component: React.lazy(
            () => import("./demos/misure/NotazioneScientificaDemo")
        ),

    },
    {
        slug: "probabilita-urna-albero",
        title: "Probabilità: estrazioni da un'urna (albero)",
        Component: React.lazy(
            () => import("./demos/probabilita/UrnProbabilityTreeDemo")
        ),
    },

    {
        slug: "disequazioni-soluzioni",
        title: "Soluzioni di una disequazione: grafico, intervalli, forma algebrica",
        Component: React.lazy(
            () =>
                import(
                    "./demos/disequazioni/RappresentazioneSoluzioniDisequazioniDemo"
                    )
        ),
    },




];