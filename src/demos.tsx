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
    {
        slug: "disequazioni-secondo-grado",
        title: "Disequazioni di secondo grado (step-by-step)",
        Component: React.lazy(
            () => import("./demos/disequazioni/DisequazioniSecondoGradoDemo")
        ),
    },
    {
        slug: "equazioni-secondo-grado",
        title: "Equazioni di secondo grado (step-by-step)",
        Component: React.lazy(
            () => import("./demos/equazioni/EquazioniSecondoGrado")
        ),
    },
    {
        slug: "equazioni-frazionarie",
        title: "Equazioni Frazionarie (step-by-step)",
        Component: React.lazy(
            () => import("./demos/equazioni/EquazioniFrazionarie")
        ),
    },
    {
        slug: "vettore-per-escalare",
        title: "Moltiplicazione tra un vettore e uno scalare",
        Component: React.lazy(
            () => import("./demos/vettori-piano/VettorePerScalare")
        ),
    },
    {
        slug: "scomposizione-polinomi",
        title: "Scomposizione di Polinomi (step-by-step)",
        Component: React.lazy(() => import("./demos/algebra/ScomposizionePolinomiDemo")),
    },
    // ============ NUOVE DEMO CINEMATICA ============
    {
        slug: "moto-uniformemente-accelerato",
        title: "Moto Uniformemente Accelerato (MUA)",
        Component: React.lazy(() => import("./demos/cinematica/MotoUniformementeAcceleratoDemo")),
    },
    {
        slug: "caduta-libera",
        title: "Caduta Libera",
        Component: React.lazy(() => import("./demos/cinematica/CadutaLiberaDemo")),
    },
    // ============ NUOVE DEMO GONIOMETRIA ============
    {
        slug: "archi-associati",
        title: "Archi Associati e Formule Goniometriche",
        Component: React.lazy(() => import("./demos/goniometria/ArchiAssociatiDemo")),
    },
    // ============ NUOVE DEMO ELETTROMAGNETISMO ============
    {
        slug: "condensatore",
        title: "Il Condensatore: Capacità, Carica ed Energia",
        Component: React.lazy(() => import("./demos/elettromagnetismo/./CondensatoreDemo")),
    },
    // ============ NUOVE DEMO COMPONENTI VETTORE ============
    {
        slug: "componenti-cartesiane-vettore",
        title: "Componenti Cartesiane di un vettore",
        Component: React.lazy(() => import("./demos/vettori-piano/./ComponentiCartesianeVettoreDemo")),
    },
    // ============ NUOVE DEMO CINEMATICA ============
    {
        slug: "moto-circolare-uniforme",
        title: "Moto Circolare Uniforme",
        Component: React.lazy(() => import("./demos/cinematica/./MotoCircolareUniformeDemo")),
    },

    // ============ SEGNO DI N PRODOTTO ============
    {
        slug: "segno-di-un-prodotto",
        title: "Disequazioni prodotto e disequazioni fratte",
        Component: React.lazy(() => import("./demos/algebra/./SegnoDiUnProdotto.tsx")),
    },

    // ============ RISOLUZIONE DI UN TRIANGOLO RETTANGOLO ============
    {
        slug: "risoluzione-di-un-triangolo-rettangolo",
        title: "Risoluzione di un triangolo rettangolo",
        Component: React.lazy(() => import("./demos/trigonometria/./RisoluzioneDiUnTriangoloRettangolo.tsx")),
    },
    // ============ QUIZ E VERIFICHE ============
    {
        slug: "quiz-algebra",
        title: "Quiz: Equazioni di 2° grado (random)",
        Component: React.lazy(() => import("./demos/quiz/QuizAlgebraDemo")),
    },
    {
        slug: "verifica-algebra-1",
        title: "Verifica: Equazioni di 2° grado",
        Component: React.lazy(() => import("./demos/quiz/VerificaAlgebra1")),
    },
    {
        slug: "quiz-vettori",
        title: "Quiz: Vettori (random)",
        Component: React.lazy(() => import("./demos/quiz/QuizVettoriDemo")),
  
    },
    {
        slug: "legge-hom",
        title: "La prima legge di Ohm (laboratorio online)",
        Component: React.lazy(() => import("./demos/elettromagnetismo/Leggeohmdemo.tsx")),
    },
    {
        slug: "sistemi-secondo-grado",
        title: "Sistemi di Secondo grado (step by step)",
        Component: React.lazy(() => import("./demos/equazioni/SistemiSecondoGrado.tsx")),
    },
    {
        slug: "funzioni-continue",
        title: "Funzioni Continue",
        Component: React.lazy(() => import("./demos/funzioni/FunzioniContinueDemo.tsx")),
    },
    {
        slug: "equazioni-goniometriche",
        title: "Equazioni Goniometriche",
        Component: React.lazy(() => import("./demos/goniometria/EquazioniGoniometricheDemo.tsx")),
    },
];