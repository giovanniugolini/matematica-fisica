/**
 * AST Types - Rappresentazione intermedia per il compilatore
 */

import type { Blocco, MetadatiLezione } from './schema.js';

// ============================================================================
// SOURCE LOCATION (per error reporting)
// ============================================================================

export interface SourceLocation {
  line: number;
  column: number;
  offset?: number;
}

export interface SourceRange {
  start: SourceLocation;
  end: SourceLocation;
}

// ============================================================================
// AST NODES
// ============================================================================

export interface AstNode {
  type: string;
  location?: SourceRange;
}

// Frontmatter parsed
export interface AstFrontmatter extends AstNode {
  type: 'frontmatter';
  data: Record<string, unknown>;
}

// Generic content block (before type resolution)
export interface AstContent extends AstNode {
  type: 'content';
  content: string;
}

// Heading
export interface AstHeading extends AstNode {
  type: 'heading';
  depth: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
}

// Paragraph
export interface AstParagraph extends AstNode {
  type: 'paragraph';
  content: string;
}

// LaTeX display formula
export interface AstLatexDisplay extends AstNode {
  type: 'latex-display';
  latex: string;
  label?: string;
}

// List
export interface AstList extends AstNode {
  type: 'list';
  ordered: boolean;
  items: string[];
}

// Image (short syntax)
export interface AstImage extends AstNode {
  type: 'image';
  src: string;
  alt: string;
}

// Transition marker
export interface AstTransition extends AstNode {
  type: 'transition';
}

// Slide separator
export interface AstSlideSeparator extends AstNode {
  type: 'slide-separator';
  slideId?: string;
}

// Directive block (generic)
export interface AstDirective extends AstNode {
  type: 'directive';
  name: string;
  attributes: Record<string, unknown>;
  content: string;
  children?: AstBlock[];
}

// Union type for all AST blocks
export type AstBlock =
  | AstFrontmatter
  | AstContent
  | AstHeading
  | AstParagraph
  | AstLatexDisplay
  | AstList
  | AstImage
  | AstTransition
  | AstSlideSeparator
  | AstDirective;

// ============================================================================
// AST DOCUMENT
// ============================================================================

export interface AstSlide {
  id?: string;
  title?: string;
  blocks: AstBlock[];
  transitionIndices: number[];
}

export interface AstDocument {
  frontmatter: AstFrontmatter | null;
  slides: AstSlide[];
  errors: CompilerError[];
  warnings: CompilerWarning[];
}

// ============================================================================
// COMPILER OUTPUT
// ============================================================================

export interface CompiledSlide {
  id: string;
  titolo: string;
  blocchi: Blocco[];
  transitions?: number[];
}

export interface CompilerOutput {
  success: boolean;
  lesson: import('./schema.js').Lezione | null;
  errors: CompilerError[];
  warnings: CompilerWarning[];
}

// ============================================================================
// ERRORS & WARNINGS
// ============================================================================

export type ErrorCode =
  | 'E001' // Frontmatter mancante
  | 'E002' // Campo obbligatorio mancante nel frontmatter
  | 'E003' // Direttiva non chiusa
  | 'E004' // Tipo direttiva sconosciuto
  | 'E005' // Campo obbligatorio mancante in direttiva
  | 'E006' // JSON non valido in blocco json
  | 'E007' // Sintassi attributi non valida
  | 'E008' // Errore di parsing generico
  | 'E009'; // Valore non valido

export type WarningCode =
  | 'W001' // AssetId non trovato nel registry
  | 'W002' // Lezione prerequisita non trovata
  | 'W003' // Collegamento a lezione inesistente
  | 'W004' // Immagine senza alt text
  | 'W005'; // Slide senza titolo

export interface CompilerError {
  code: ErrorCode;
  message: string;
  location?: SourceRange;
  help?: string;
}

export interface CompilerWarning {
  code: WarningCode;
  message: string;
  location?: SourceRange;
  help?: string;
}

// ============================================================================
// COMPILER OPTIONS
// ============================================================================

export interface CompilerOptions {
  /** Validate assetIds against registry */
  validateAssets?: boolean;
  /** Asset registry for validation */
  assetRegistry?: Set<string>;
  /** Validate lesson links */
  validateLinks?: boolean;
  /** Known lesson IDs for link validation */
  knownLessons?: Set<string>;
  /** Strict mode: treat warnings as errors */
  strict?: boolean;
  /** Source file path (for error messages) */
  sourcePath?: string;
}
