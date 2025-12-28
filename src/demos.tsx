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
        title: "Angolo e funzioni goniometriche",
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
    {
        slug: "ebbinghaus-curva-oblio",
        title: "Curva di Ebbinghaus: lettura del grafico + mini-quiz per le lezioni di Pedagogia",
        Component: React.lazy(() => import("./demos/ebbinghaus/EbbinghausDemo")),
    },
    {
        slug: "limite-finito-finito",
        title: "Limiti: Limite finito per x → x₀ finito",
        Component: React.lazy(() => import("./demos/limiti/LimiteFinitoPuntoFinito")),
    },
    {
        slug: "limite-infinito-finito",
        title: "Limiti: Limite infinito per x → x₀ finito (asintoti verticali)",
        Component: React.lazy(() => import("./demos/limiti/LimiteInfinitoPuntoFinito")),
    },
    {
        slug: "limite-finito-infinito",
        title: "Limiti: Limite finito per x → ±∞ (asintoti orizzontali)",
        Component: React.lazy(() => import("./demos/limiti/LimiteFinitoPiuMenoInfinito")),
    },
    {
        slug: "limite-infinito-infinito",
        title: "Limiti: Limite infinito per x → ±∞ (funzioni divergenti)",
        Component: React.lazy(() => import("./demos/limiti/LimiteInfinitoPiuMenoInfinito")),
    },
    {
        slug: "sistemi-disequazioni",
        title: "Sistemi di disequazioni lineari (rappresentazione grafica)",
        Component: React.lazy(
            () => import("./demos/disequazioni/SistemiDisequazioniDemo")
        ),
    },
    {
        slug: "domini-funzioni",
        title: "Dominio delle funzioni (step-by-step)",
        Component: React.lazy(
            () => import("./demos/funzioni/DominiFunzioniDemo")
        ),
    },





];