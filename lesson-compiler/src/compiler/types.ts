/**
 * AST Types v2 - Con supporto sequenze
 */

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

export interface AstSectionBreak extends AstNode {
  type: 'section-break';
  sectionId?: string;
  sectionTitle?: string;
}

export interface AstStepBreak extends AstNode {
  type: 'step-break';
  stepTitle?: string;
}

export interface AstDirective extends AstNode {
  type: 'directive';
  name: string;
  attributes: Record<string, unknown>;
  content: string;
  rawContent?: string; // Per sequenze, contenuto grezzo con == step ==
}

export type AstBlock =
  | AstFrontmatter
  | AstHeading
  | AstParagraph
  | AstLatexDisplay
  | AstList
  | AstImage
  | AstTransition
  | AstSectionBreak
  | AstStepBreak
  | AstDirective;

export interface AstSection {
  id?: string;
  title?: string;
  blocks: AstBlock[];
}

export interface AstDocument {
  frontmatter: AstFrontmatter | null;
  introduction: AstBlock[];
  sections: AstSection[];
  conclusion: AstBlock[];
  resources: Array<{ type: string; title: string; url?: string; description?: string }>;
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
  strict?: boolean;
  sourcePath?: string;
}
