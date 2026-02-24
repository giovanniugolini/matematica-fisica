import React from "react";

// Tipi opzionali
export type DemoInfo = {
    slug: string;
    title: string;
    Component: React.LazyExoticComponent<React.ComponentType<any>>;
    tags?: string[];
};

// Registro delle demo (aggiungi qui le prossime)
export const demos: DemoInfo[] = [
    {
        slug: "angolo-rotazione",
        title: "Angolo e funzioni goniometriche",
        Component: React.lazy(() => import("./demos/angolo-rotazione/AngleRotationDemo")),
        tags: ["goniometria", "angoli", "seno", "coseno", "tangente", "cerchio"],
    },
    {
        slug: "vettori-punta-coda",
        title: "Vettori: Metodo Punta-Coda (interattivo)",
        Component: React.lazy(() => import("./demos/vettori-piano/VectorTailToHeadPage")),
        tags: ["vettori", "somma", "punta-coda", "fisica"],
    },
    {
        slug: "intervalli-r",
        title: "Intervalli su ℝ",
        Component: React.lazy(() => import("./demos/intervalli-r/IntervalliRDemo")),
        tags: ["intervalli", "numeri reali", "analisi", "insiemi"],
    },
    {
        slug: "velocita-media-secante",
        title: "Velocità media (secante su s(t))",
        Component: React.lazy(() => import("./demos/media-velocita-secante/MediaVelocitaSecanteDemo")),
        tags: ["cinematica", "velocità", "secante", "derivata", "fisica"],
    },
    {
        slug: "legge-di-coulomb",
        title: "Legge di Coulomb (2 cariche)",
        Component: React.lazy(() => import("./demos/legge-coulomb/LeggeCoulombDemo")),
        tags: ["elettromagnetismo", "coulomb", "cariche", "forza elettrica", "fisica"],
    },
    {
        slug: "campo-elettrico",
        title: "Campo elettrico (1 carica)",
        Component: React.lazy(() => import("./demos/campo-elettrico/CampoElettricoDemo")),
        tags: ["elettromagnetismo", "campo elettrico", "cariche", "fisica"],
    },
    {
        slug: "conversione-unita",
        title: "Multipli e sottomultipli dell'unità di misura",
        Component: React.lazy(() => import("./demos/misure/ConversioneUnitaDemo")),
        tags: ["misure", "conversioni", "unità", "fisica"],
    },
    {
        slug: "misure",
        title: "Notazione scientifica delle misure",
        Component: React.lazy(() => import("./demos/misure/NotazioneScientificaDemo")),
        tags: ["misure", "notazione scientifica", "potenze", "fisica"],
    },
    {
        slug: "probabilita-urna-albero",
        title: "Probabilità: estrazioni da un'urna (albero)",
        Component: React.lazy(() => import("./demos/probabilita/UrnProbabilityTreeDemo")),
        tags: ["probabilità", "urna", "albero", "eventi", "statistica"],
    },
    {
        slug: "disequazioni-soluzioni",
        title: "Soluzioni di una disequazione: grafico, intervalli, forma algebrica",
        Component: React.lazy(() => import("./demos/disequazioni/RappresentazioneSoluzioniDisequazioniDemo")),
        tags: ["disequazioni", "intervalli", "grafico", "algebra"],
    },
    {
        slug: "ebbinghaus-curva-oblio",
        title: "Curva di Ebbinghaus: lettura del grafico + mini-quiz per le lezioni di Pedagogia",
        Component: React.lazy(() => import("./demos/ebbinghaus/EbbinghausDemo")),
        tags: ["pedagogia", "memoria", "apprendimento", "grafico"],
    },
    {
        slug: "limite-finito-finito",
        title: "Limiti: Limite finito per x → x₀ finito",
        Component: React.lazy(() => import("./demos/limiti/LimiteFinitoPuntoFinito")),
        tags: ["limiti", "analisi", "funzioni", "continuità"],
    },
    {
        slug: "limite-infinito-finito",
        title: "Limiti: Limite infinito per x → x₀ finito (asintoti verticali)",
        Component: React.lazy(() => import("./demos/limiti/LimiteInfinitoPuntoFinito")),
        tags: ["limiti", "asintoti", "analisi", "funzioni"],
    },
    {
        slug: "limite-finito-infinito",
        title: "Limiti: Limite finito per x → ±∞ (asintoti orizzontali)",
        Component: React.lazy(() => import("./demos/limiti/LimiteFinitoPiuMenoInfinito")),
        tags: ["limiti", "asintoti", "analisi", "infinito"],
    },
    {
        slug: "limite-infinito-infinito",
        title: "Limiti: Limite infinito per x → ±∞ (funzioni divergenti)",
        Component: React.lazy(() => import("./demos/limiti/LimiteInfinitoPiuMenoInfinito")),
        tags: ["limiti", "analisi", "infinito", "divergenza"],
    },
    {
        slug: "sistemi-disequazioni",
        title: "Sistemi di disequazioni lineari (rappresentazione grafica)",
        Component: React.lazy(() => import("./demos/disequazioni/SistemiDisequazioniDemo")),
        tags: ["disequazioni", "sistemi", "grafico", "algebra"],
    },
    {
        slug: "domini-funzioni",
        title: "Dominio delle funzioni (step-by-step)",
        Component: React.lazy(() => import("./demos/funzioni/DominiFunzioniDemo")),
        tags: ["funzioni", "dominio", "analisi", "step-by-step"],
    },
    {
        slug: "disequazioni-secondo-grado",
        title: "Disequazioni di secondo grado (step-by-step)",
        Component: React.lazy(() => import("./demos/disequazioni/DisequazioniSecondoGradoDemo")),
        tags: ["disequazioni", "secondo grado", "parabola", "algebra", "step-by-step"],
    },
    {
        slug: "equazioni-secondo-grado",
        title: "Equazioni di secondo grado (step-by-step)",
        Component: React.lazy(() => import("./demos/equazioni/EquazioniSecondoGrado")),
        tags: ["equazioni", "secondo grado", "delta", "algebra", "step-by-step"],
    },
    {
        slug: "equazioni-frazionarie",
        title: "Equazioni Frazionarie (step-by-step)",
        Component: React.lazy(() => import("./demos/equazioni/EquazioniFrazionarie")),
        tags: ["equazioni", "frazioni", "algebra", "step-by-step"],
    },
    {
        slug: "vettore-per-escalare",
        title: "Moltiplicazione tra un vettore e uno scalare",
        Component: React.lazy(() => import("./demos/vettori-piano/VettorePerScalare")),
        tags: ["vettori", "scalare", "moltiplicazione", "fisica"],
    },
    {
        slug: "scomposizione-polinomi",
        title: "Scomposizione di Polinomi (step-by-step)",
        Component: React.lazy(() => import("./demos/algebra/ScomposizionePolinomiDemo")),
        tags: ["polinomi", "scomposizione", "fattorizzazione", "algebra", "step-by-step"],
    },
    {
        slug: "moto-uniformemente-accelerato",
        title: "Moto Uniformemente Accelerato (MUA)",
        Component: React.lazy(() => import("./demos/cinematica/MotoUniformementeAcceleratoDemo")),
        tags: ["cinematica", "moto", "accelerazione", "MUA", "fisica"],
    },
    {
        slug: "caduta-libera",
        title: "Caduta Libera",
        Component: React.lazy(() => import("./demos/cinematica/CadutaLiberaDemo")),
        tags: ["cinematica", "caduta", "gravità", "fisica"],
    },
    {
        slug: "archi-associati",
        title: "Archi Associati e Formule Goniometriche",
        Component: React.lazy(() => import("./demos/goniometria/ArchiAssociatiDemo")),
        tags: ["goniometria", "archi associati", "formule", "angoli"],
    },
    {
        slug: "condensatore",
        title: "Il Condensatore: Capacità, Carica ed Energia",
        Component: React.lazy(() => import("./demos/elettromagnetismo/./CondensatoreDemo")),
        tags: ["elettromagnetismo", "condensatore", "capacità", "energia", "fisica"],
    },
    {
        slug: "componenti-cartesiane-vettore",
        title: "Componenti Cartesiane di un vettore",
        Component: React.lazy(() => import("./demos/vettori-piano/./ComponentiCartesianeVettoreDemo")),
        tags: ["vettori", "componenti", "cartesiane", "seno", "coseno", "fisica"],
    },
    {
        slug: "moto-circolare-uniforme",
        title: "Moto Circolare Uniforme",
        Component: React.lazy(() => import("./demos/cinematica/./MotoCircolareUniformeDemo")),
        tags: ["cinematica", "moto circolare", "velocità angolare", "fisica"],
    },
    {
        slug: "segno-di-un-prodotto",
        title: "Disequazioni prodotto e disequazioni fratte",
        Component: React.lazy(() => import("./demos/algebra/./SegnoDiUnProdotto.tsx")),
        tags: ["disequazioni", "prodotto", "fratte", "segno", "algebra"],
    },
    {
        slug: "risoluzione-di-un-triangolo-rettangolo",
        title: "Risoluzione di un triangolo rettangolo",
        Component: React.lazy(() => import("./demos/trigonometria/./RisoluzioneDiUnTriangoloRettangolo.tsx")),
        tags: ["trigonometria", "triangolo", "rettangolo", "seno", "coseno"],
    },
    {
        slug: "quiz-algebra",
        title: "Quiz: Equazioni di 2° grado (random)",
        Component: React.lazy(() => import("./demos/quiz/QuizAlgebraDemo")),
        tags: ["quiz", "equazioni", "secondo grado", "verifica"],
    },
    {
        slug: "verifica-algebra-1",
        title: "Verifica: Equazioni di 2° grado",
        Component: React.lazy(() => import("./demos/quiz/VerificaAlgebra1")),
        tags: ["verifica", "equazioni", "secondo grado", "test"],
    },
    {
        slug: "quiz-vettori",
        title: "Quiz: Vettori (random)",
        Component: React.lazy(() => import("./demos/quiz/QuizVettoriDemo")),
        tags: ["quiz", "vettori", "fisica", "verifica"],
    },
    {
        slug: "legge-hom",
        title: "La prima legge di Ohm (laboratorio online)",
        Component: React.lazy(() => import("./demos/elettromagnetismo/Leggeohmdemo.tsx")),
        tags: ["elettromagnetismo", "ohm", "resistenza", "corrente", "laboratorio", "fisica"],
    },
    {
        slug: "seconda-legge-ohm",
        title: "La seconda legge di Ohm — R = ρl/A",
        Component: React.lazy(() => import("./demos/elettromagnetismo/SecondaLeggeOhmDemo.tsx")),
        tags: ["elettromagnetismo", "ohm", "resistenza", "resistività", "conduttore", "sezione", "lunghezza", "fisica"],
    },
    {
        slug: "sistemi-secondo-grado",
        title: "Sistemi di Secondo grado (step by step)",
        Component: React.lazy(() => import("./demos/equazioni/SistemiSecondoGrado.tsx")),
        tags: ["sistemi", "secondo grado", "equazioni", "algebra", "step-by-step"],
    },
    {
        slug: "funzioni-continue",
        title: "Funzioni Continue",
        Component: React.lazy(() => import("./demos/funzioni/FunzioniContinueDemo.tsx")),
        tags: ["funzioni", "continuità", "analisi", "limiti"],
    },
    {
        slug: "equazioni-goniometriche",
        title: "Equazioni Goniometriche",
        Component: React.lazy(() => import("./demos/goniometria/EquazioniGoniometricheDemo.tsx")),
        tags: ["goniometria", "equazioni", "seno", "coseno", "tangente"],
    },
    {
        slug: "proprieta-funzioni-continue",
        title: "Proprietà delle funzioni continue",
        Component: React.lazy(() => import("./demos/funzioni/ProprietaFunzioniContinue.tsx")),
        tags: ["funzioni", "continuità", "teoremi", "analisi"],
    },
    {
        slug: "forze",
        title: "Le Forze",
        Component: React.lazy(() => import("./demos/vettori-piano/ForzeDemo.tsx")),
        tags: ["forze", "vettori", "dinamica", "newton", "fisica"],
    },
    {
        slug: "distanza-punto-medio",
        title: "Distanza tra due punti e Punto Medio",
        Component: React.lazy(() => import("./demos/geometria-analitica/DistanzaPuntoMedioDemo.tsx")),
        tags: ["geometria", "distanza", "punto medio", "piano cartesiano", "coordinate"],
    },
    {
        slug: "equazione-retta",
        title: "Equazione della Retta (y = mx + q)",
        Component: React.lazy(() => import("./demos/geometria-analitica/EquazioneRettaDemo.tsx")),
        tags: ["geometria", "retta", "coefficiente angolare", "piano cartesiano", "funzioni lineari"],
    },
    {
        slug: "parabola",
        title: "La Parabola: luogo geometrico ed equazioni",
        Component: React.lazy(() => import("./demos/geometria-analitica/ParabolaDemo.tsx")),
        tags: ["geometria", "parabola", "fuoco", "direttrice", "vertice", "analisi", "funzioni"],
    },
    {
        slug: "asintoti",
        title: "Asintoti: orizzontali, verticali e obliqui",
        Component: React.lazy(() => import("./demos/funzioni/AsintotiDemo")),
        tags: ["asintoti", "limiti", "analisi", "funzioni", "orizzontale", "verticale", "obliquo"],
    },
];