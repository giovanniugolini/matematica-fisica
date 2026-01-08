/**
 * Schema Lezioni - Tipi per il compilatore v2
 * Allineato alla struttura del frontend
 */

// ============================================================================
// ENUMS E TIPI BASE
// ============================================================================

export type LivelloScolastico =
  | "primo-biennio"
  | "secondo-biennio"
  | "quinto-anno"
  | "universita";

export type Materia = "matematica" | "fisica";

export type Argomento =
  | "algebra" | "equazioni" | "disequazioni" | "funzioni"
  | "geometria-analitica" | "trigonometria" | "limiti" | "derivate"
  | "integrali" | "probabilita" | "statistica" | "cinematica"
  | "dinamica" | "lavoro-energia" | "vettori" | "elettrostatica"
  | "elettromagnetismo" | "termologia" | "onde" | "ottica";

export type NotaVariante = "info" | "attenzione" | "suggerimento" | "ricorda";
export type CalloutVariante = "obiettivo" | "prerequisiti" | "materiali" | "tempo";
export type TitoloLivello = 2 | 3 | 4;
export type DifficoltaQuiz = "facile" | "media" | "difficile";

// ============================================================================
// BLOCCHI
// ============================================================================

export interface BloccoTesto {
  tipo: "testo";
  contenuto: string;
}

export interface BloccoTitolo {
  tipo: "titolo";
  livello: TitoloLivello;
  testo: string;
}

export interface BloccoFormula {
  tipo: "formula";
  latex: string;
  display?: boolean;
  descrizione?: string;
  etichetta?: string;
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

export interface BloccoNota {
  tipo: "nota";
  variante: NotaVariante;
  contenuto: string;
}

export interface BloccoCallout {
  tipo: "callout";
  variante: CalloutVariante;
  titolo?: string;
  contenuto: string;
}

export interface BloccoElenco {
  tipo: "elenco";
  ordinato: boolean;
  elementi: string[];
}

export interface BloccoImmagine {
  tipo: "immagine";
  src?: string;
  assetId?: string;
  alt: string;
  didascalia?: string;
  larghezza?: number;
}

export interface BloccoVideo {
  tipo: "video";
  src?: string;
  assetId?: string;
  titolo?: string;
  didascalia?: string;
}

export interface BloccoDemo {
  tipo: "demo";
  componente: string;
  props?: Record<string, unknown>;
  titolo?: string;
  descrizione?: string;
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
  difficolta?: DifficoltaQuiz;
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
}

export interface BloccoCollegamento {
  tipo: "collegamento";
  lezioneId: string;
  testo: string;
  descrizione?: string;
}

export interface BloccoAttivita {
  tipo: "attivita";
  titolo?: string;
  consegna: string;
  nota?: string;
}

export interface BloccoBrainstorming {
  tipo: "brainstorming";
  titolo: string;
  placeholder?: string;
  altezzaPx?: number;
  persistId?: string;
  persistDefault?: boolean;
}

export interface BloccoQuestion {
  tipo: "question";
  title?: string;
  question: string;
  answer: string;
  showAnswerLabel?: string;
  hideAnswerLabel?: string;
  defaultExpanded?: boolean;
}

export interface BloccoSeparatore {
  tipo: "separatore";
}

// ============================================================================
// SEQUENZA - Struttura per step con transizioni
// ============================================================================

export interface SequenzaStep {
  titolo?: string;
  blocchi: Blocco[];
  transitions?: number[];
}

export interface BloccoSequenza {
  tipo: "sequenza";
  titolo?: string;
  showProgress?: boolean;
  allowJump?: boolean;
  steps: SequenzaStep[];
}

// ============================================================================
// UNION TYPE BLOCCHI
// ============================================================================

export type Blocco =
  | BloccoTesto
  | BloccoTitolo
  | BloccoFormula
  | BloccoDefinizione
  | BloccoTeorema
  | BloccoEsempio
  | BloccoNota
  | BloccoCallout
  | BloccoElenco
  | BloccoImmagine
  | BloccoVideo
  | BloccoDemo
  | BloccoQuiz
  | BloccoTabella
  | BloccoCitazione
  | BloccoCodice
  | BloccoCollegamento
  | BloccoAttivita
  | BloccoBrainstorming
  | BloccoQuestion
  | BloccoSeparatore
  | BloccoSequenza;

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
