/**
 * Schema Lezioni Interattive
 */

// ============================================================================
// TIPI BASE
// ============================================================================

export type LivelloScolastico =
    | "primo-biennio"
    | "secondo-biennio"
    | "quinto-anno"
    | "universita";

export type Materia = "matematica" | "fisica";

export type Argomento =
    | "algebra"
    | "equazioni"
    | "disequazioni"
    | "funzioni"
    | "geometria-analitica"
    | "trigonometria"
    | "limiti"
    | "derivate"
    | "integrali"
    | "probabilita"
    | "statistica"
    | "cinematica"
    | "dinamica"
    | "lavoro-energia"
    | "vettori"
    | "elettrostatica"
    | "elettromagnetismo"
    | "termologia"
    | "onde"
    | "ottica";

// ============================================================================
// BLOCCHI CONTENUTO
// ============================================================================

export interface BloccoTesto {
    tipo: "testo";
    contenuto: string;
}

export type TitoloLivello = 2 | 3 | 4;

export interface BloccoTitolo {
    tipo: "titolo";
    livello: TitoloLivello;
    testo: string;
}

export interface BloccoFormula {
    tipo: "formula";
    latex: string;
    display?: boolean;
    etichetta?: string;
    descrizione?: string;
}

export interface BloccoDefinizione {
    tipo: "definizione";
    termine: string;
    definizione: string;
    nota?: string;
}

export interface BloccoTeorema {
    tipo: "teorema";
    nome?: string;
    enunciato: string;
    dimostrazione?: string;
}

export interface BloccoEsempio {
    tipo: "esempio";
    titolo?: string;
    problema: string;
    soluzione: string;
    nota?: string;
}

export type NotaVariante = "info" | "attenzione" | "suggerimento" | "ricorda";

export interface BloccoNota {
    tipo: "nota";
    variante: NotaVariante;
    contenuto: string;
}

export interface BloccoElenco {
    tipo: "elenco";
    ordinato: boolean;
    elementi: string[];
}

export interface BloccoImmagine {
    tipo: "immagine";
    /** URL diretto dell'immagine (legacy) */
    src?: string;
    /** ID asset dal registry (preferito) */
    assetId?: string;
    /** Alt text per accessibilità */
    alt: string;
    /** Didascalia sotto l'immagine */
    didascalia?: string;
    /** Larghezza in percentuale 0-100 */
    larghezza?: number;
}

/** Blocco Video */
export interface BloccoVideo {
    tipo: "video";
    /** URL diretto del video (legacy) */
    src?: string;
    /** ID asset dal registry (preferito) */
    assetId?: string;
    /** Titolo del video */
    titolo?: string;
    /** Didascalia sotto il video */
    didascalia?: string;
    /** Larghezza in percentuale (default 100) */
    larghezza?: number;
    /** Altezza in pixel (default 400) */
    altezza?: number;
    /** Autoplay (default false) */
    autoplay?: boolean;
}

export interface BloccoDemo {
    tipo: "demo";
    componente: string;
    props?: Record<string, unknown>;
    titolo?: string;
    descrizione?: string;
    altezza?: number;
}

export interface OpzioneQuiz {
    testo: string;
    corretta: boolean;
}

export interface BloccoQuiz {
    tipo: "quiz";
    domanda: string;
    opzioni: OpzioneQuiz[];
    spiegazione: string;
    difficolta?: "facile" | "media" | "difficile";
}

export interface StepItem {
    titolo: string;
    contenuto: string;
}

export interface BloccoStepByStep {
    tipo: "step-by-step";
    titolo?: string;
    step: StepItem[];
}

export type CalloutVariante = "obiettivo" | "prerequisiti" | "materiali" | "tempo";

export interface BloccoCallout {
    tipo: "callout";
    variante: CalloutVariante;
    titolo?: string;
    contenuto: string;
}

export interface BloccoSeparatore {
    tipo: "separatore";
}

export interface BloccoTabella {
    tipo: "tabella";
    intestazione: string[];
    righe: string[][];
    didascalia?: string;
}

export interface BloccoCitazione {
    tipo: "citazione";
    testo: string;
    autore?: string;
    fonte?: string;
}

export interface BloccoCodice {
    tipo: "codice";
    linguaggio: string;
    codice: string;
    eseguibile?: boolean;
}

export interface BloccoCollegamento {
    tipo: "collegamento";
    lezioneId: string;
    testo: string;
    descrizione?: string;
}

/**
 * Sequenza a step "veri"
 * Ogni step può contenere qualsiasi Blocco.
 */
export interface SequenzaStep {
    id?: string;
    titolo?: string;
    /**
     * Transizioni "a frammenti" in stile slide.
     *
     * - Gli step (SequenzaStep) restano dei cambi-slide: quando passi allo step successivo,
     *   sparisce tutto ciò che era nello step precedente.
     * - Le transitions invece sono *interne* allo step: rivelano progressivamente i blocchi,
     *   mantenendo visibile ciò che è già comparso.
     *
     * Valori ammessi: indici (0..blocchi.length-1) che indicano l'inizio di un nuovo frammento.
     * Esempio: blocchi=[A,B,C,D], transitions=[0,2]
     *   - frammento 0: (vuoto)     -> end=0
     *   - frammento 1: A,B         -> end=2
     *   - frammento 2: A,B,C,D     -> end=4
     */
    transitions?: number[];
    blocchi: Blocco[];
}

export interface BloccoSequenza {
    tipo: "sequenza";
    titolo?: string;
    steps: SequenzaStep[];
    startAt?: number;
    showProgress?: boolean;
    allowJump?: boolean;
}

export type Blocco =
    | BloccoTesto
    | BloccoTitolo
    | BloccoFormula
    | BloccoDefinizione
    | BloccoTeorema
    | BloccoEsempio
    | BloccoNota
    | BloccoElenco
    | BloccoImmagine
    | BloccoVideo
    | BloccoDemo
    | BloccoQuiz
    | BloccoStepByStep
    | BloccoCallout
    | BloccoSeparatore
    | BloccoTabella
    | BloccoCitazione
    | BloccoCodice
    | BloccoCollegamento
    | BloccoAttivita
    | BloccoSequenza
    | BloccoBrainstorming
    | BloccoQuestion


// ============================================================================
// NUOVI BLOCCHI (2026-01) - Naming componenti in inglese, tipo in italiano
// ============================================================================

export interface BloccoAttivita {
    tipo: "attivita";
    titolo?: string;          // es. "Attività"
    consegna: string;         // contenuto (supporta LaTeX tramite renderTesto)
    nota?: string;            // opzionale
}

// ============================================================================
// STRUTTURA LEZIONE
// ============================================================================

export interface MetadatiLezione {
    id: string;
    titolo: string;
    sottotitolo?: string;
    materia: Materia;
    argomento: Argomento;
    livello: LivelloScolastico;
    durata?: number;
    autore?: string;
    dataCreazione?: string;
    dataModifica?: string;
    versione?: string;
    tags?: string[];
    prerequisiti?: string[];
    obiettivi?: string[];
}

export interface SezioneLezione {
    id: string;
    titolo: string;
    blocchi: Blocco[];
}

export interface Risorsa {
    tipo: "libro" | "video" | "sito" | "esercizi";
    titolo: string;
    url?: string;
    descrizione?: string;
}

export interface Lezione {
    metadati: MetadatiLezione;
    introduzione?: Blocco[];
    sezioni: SezioneLezione[];
    conclusione?: Blocco[];
    risorse?: Risorsa[];
}

export interface BloccoBrainstorming {
    tipo: "brainstorming";
    title: string;
    placeholder?: string;
    heightPx?: number;

    // persistence
    persistId?: string;        // abilita persistenza
    persistDefault?: boolean;  // default true se persistId esiste
}
export interface BloccoQuestion {
    tipo: "question";
    title?: string;
    question: string;
    answer: string;

    showAnswerLabel?: string; // default: "Show answer"
    hideAnswerLabel?: string; // default: "Hide answer"
    defaultExpanded?: boolean; // default: false
}