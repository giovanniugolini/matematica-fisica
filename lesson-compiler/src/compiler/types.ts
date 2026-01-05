/**
 * AST Types - Rappresentazione intermedia per il compilatore
 */

import type { Blocco, MetadatiLezione } from './schema.js';

export interface SourceLocation {
  line: number;
  column: number;
  offset?: number;
}

export interface SourceRange {
  start: SourceLocation;
  end: SourceLocation;
}

export interface AstNode {
  type: string;
  location?: SourceRange;
}

export interface AstFrontmatter extends AstNode {
  type: 'frontmatter';
  data: Record<string, unknown>;
}

export interface AstHeading extends AstNode {
  type: 'heading';
  depth: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
}

export interface AstParagraph extends AstNode {
  type: 'paragraph';
  content: string;
}

export interface AstLatexDisplay extends AstNode {
  type: 'latex-display';
  latex: string;
  label?: string;
}

export interface AstList extends AstNode {
  type: 'list';
  ordered: boolean;
  items: string[];
}

export interface AstImage extends AstNode {
  type: 'image';
  src: string;
  alt: string;
}

export interface AstTransition extends AstNode {
  type: 'transition';
}

export interface AstSlideSeparator extends AstNode {
  type: 'slide-separator';
  slideId?: string;
}

export interface AstDirective extends AstNode {
  type: 'directive';
  name: string;
  attributes: Record<string, unknown>;
  content: string;
  children?: AstBlock[];
}

export type AstBlock =
  | AstFrontmatter
  | AstHeading
  | AstParagraph
  | AstLatexDisplay
  | AstList
  | AstImage
  | AstTransition
  | AstSlideSeparator
  | AstDirective;

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

export type ErrorCode =
  | 'E001' | 'E002' | 'E003' | 'E004' | 'E005' 
  | 'E006' | 'E007' | 'E008' | 'E009';

export type WarningCode =
  | 'W001' | 'W002' | 'W003' | 'W004' | 'W005';

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

export interface CompilerOutput {
  success: boolean;
  lesson: import('./schema.js').Lezione | null;
  errors: CompilerError[];
  warnings: CompilerWarning[];
}

export interface CompilerOptions {
  validateAssets?: boolean;
  assetRegistry?: Set<string>;
  validateLinks?: boolean;
  knownLessons?: Set<string>;
  strict?: boolean;
  sourcePath?: string;
}
