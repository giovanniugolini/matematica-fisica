/**
 * Compiler - AST → Lezione JSON
 */

import type {
  AstDocument,
  AstSlide,
  AstBlock,
  AstHeading,
  AstParagraph,
  AstLatexDisplay,
  AstList,
  AstImage,
  AstDirective,
  CompilerOutput,
  CompilerError,
  CompilerWarning,
  CompilerOptions,
  SourceRange,
} from './types.js';

import type {
  Lezione,
  MetadatiLezione,
  SezioneLezione,
  Blocco,
  BloccoTesto,
  BloccoTitolo,
  BloccoFormula,
  BloccoElenco,
  BloccoImmagine,
  BloccoNota,
  BloccoCallout,
  BloccoDefinizione,
  BloccoTeorema,
  BloccoEsempio,
  BloccoAttivita,
  BloccoQuestion,
  BloccoBrainstorming,
  BloccoQuiz,
  BloccoCitazione,
  BloccoTabella,
  BloccoCodice,
  BloccoCollegamento,
  BloccoSeparatore,
  BloccoDemo,
  BloccoVideo,
  BloccoStepByStep,
  NotaVariante,
  CalloutVariante,
  TitoloLivello,
  Materia,
  Argomento,
  LivelloScolastico,
} from './schema.js';

export class Compiler {
  private errors: CompilerError[] = [];
  private warnings: CompilerWarning[] = [];
  private options: CompilerOptions;

  constructor(options: CompilerOptions = {}) {
    this.options = options;
  }

  compile(ast: AstDocument): CompilerOutput {
    this.errors = [...ast.errors];
    this.warnings = [...ast.warnings];

    if (!ast.frontmatter) {
      this.addError('E001', 'Frontmatter mancante', undefined, 
        'Aggiungi un blocco YAML all\'inizio del file');
      return this.failedOutput();
    }

    const metadati = this.parseMetadati(ast.frontmatter.data, ast.frontmatter.location);
    if (!metadati) {
      return this.failedOutput();
    }

    const sezioni: SezioneLezione[] = [];
    let introduzione: Blocco[] | undefined;
    let conclusione: Blocco[] | undefined;

    for (let i = 0; i < ast.slides.length; i++) {
      const slide = ast.slides[i];
      const sezione = this.compileSlide(slide, i);

      if (slide.id === 'intro' || slide.id === 'introduzione') {
        introduzione = sezione.blocchi;
      } else if (slide.id === 'conclusione') {
        conclusione = sezione.blocchi;
      } else {
        sezioni.push(sezione);
      }
    }

    const lezione: Lezione = { metadati, sezioni };
    if (introduzione) lezione.introduzione = introduzione;
    if (conclusione) lezione.conclusione = conclusione;

    if (this.options.strict && this.warnings.length > 0) {
      this.errors.push(...this.warnings.map(w => ({
        code: w.code as unknown as CompilerError['code'],
        message: `[strict] ${w.message}`,
        location: w.location,
        help: w.help,
      })));
    }

    return {
      success: this.errors.length === 0,
      lesson: this.errors.length === 0 ? lezione : null,
      errors: this.errors,
      warnings: this.warnings,
    };
  }

  private parseMetadati(data: Record<string, unknown>, location?: SourceRange): MetadatiLezione | null {
    const required = ['id', 'title', 'subject', 'topic', 'level'];
    const missing = required.filter(key => !data[key]);

    if (missing.length > 0) {
      this.addError('E002', `Campi obbligatori mancanti: ${missing.join(', ')}`, location);
      return null;
    }

    const validSubjects: Materia[] = ['matematica', 'fisica'];
    if (!validSubjects.includes(data.subject as Materia)) {
      this.addError('E009', `Valore non valido per subject: "${data.subject}"`, location);
      return null;
    }

    const validLevels: LivelloScolastico[] = ['primo-biennio', 'secondo-biennio', 'quinto-anno', 'universita'];
    if (!validLevels.includes(data.level as LivelloScolastico)) {
      this.addError('E009', `Valore non valido per level: "${data.level}"`, location);
      return null;
    }

    return {
      id: data.id as string,
      titolo: data.title as string,
      sottotitolo: data.subtitle as string | undefined,
      materia: data.subject as Materia,
      argomento: data.topic as Argomento,
      livello: data.level as LivelloScolastico,
      durata: data.duration as number | undefined,
      autore: data.author as string | undefined,
      versione: data.version as string | undefined,
      tags: data.tags as string[] | undefined,
      prerequisiti: data.prerequisites as string[] | undefined,
      obiettivi: data.objectives as string[] | undefined,
    };
  }

  private compileSlide(slide: AstSlide, index: number): SezioneLezione {
    const blocchi: Blocco[] = [];

    for (const block of slide.blocks) {
      const compiled = this.compileBlock(block);
      if (compiled) {
        if (Array.isArray(compiled)) {
          blocchi.push(...compiled);
        } else {
          blocchi.push(compiled);
        }
      }
    }

    const sezione: SezioneLezione = {
      id: slide.id || `slide-${index + 1}`,
      titolo: slide.title || `Slide ${index + 1}`,
      blocchi,
    };

    if (slide.transitionIndices.length > 0) {
      sezione.transitions = slide.transitionIndices;
    }

    return sezione;
  }

  private compileBlock(block: AstBlock): Blocco | Blocco[] | null {
    switch (block.type) {
      case 'heading':
        return this.compileHeading(block as AstHeading);
      case 'paragraph':
        return this.compileParagraph(block as AstParagraph);
      case 'latex-display':
        return this.compileLatex(block as AstLatexDisplay);
      case 'list':
        return this.compileList(block as AstList);
      case 'image':
        return this.compileImage(block as AstImage);
      case 'directive':
        return this.compileDirective(block as AstDirective);
      default:
        return null;
    }
  }

  private compileHeading(block: AstHeading): BloccoTitolo {
    const level = Math.min(Math.max(block.depth + 1, 2), 4) as TitoloLivello;
    return { tipo: 'titolo', livello: level, testo: block.text };
  }

  private compileParagraph(block: AstParagraph): BloccoTesto {
    return { tipo: 'testo', contenuto: block.content };
  }

  private compileLatex(block: AstLatexDisplay): BloccoFormula {
    const formula: BloccoFormula = { tipo: 'formula', latex: block.latex, display: true };
    if (block.label) formula.etichetta = block.label;
    return formula;
  }

  private compileList(block: AstList): BloccoElenco {
    return { tipo: 'elenco', ordinato: block.ordered, elementi: block.items };
  }

  private compileImage(block: AstImage): BloccoImmagine {
    return { tipo: 'immagine', src: block.src, alt: block.alt || '' };
  }

  private compileDirective(block: AstDirective): Blocco | Blocco[] | null {
    const { name, attributes, content, location } = block;

    switch (name) {
      case 'note': return this.compileNote(attributes, content);
      case 'callout': return this.compileCallout(attributes, content);
      case 'definition': return this.compileDefinition(attributes, content, location);
      case 'theorem': return this.compileTheorem(attributes, content, location);
      case 'example': return this.compileExample(attributes, content, location);
      case 'activity': return this.compileActivity(attributes, content);
      case 'question': return this.compileQuestion(attributes, content, location);
      case 'brainstorming': return this.compileBrainstorming(attributes, location);
      case 'quiz': return this.compileQuiz(attributes, content, location);
      case 'image': return this.compileImageDirective(attributes, location);
      case 'video': return this.compileVideo(attributes, location);
      case 'demo': return this.compileDemo(attributes, location);
      case 'table': return this.compileTable(attributes, content);
      case 'code': return this.compileCode(attributes, content);
      case 'quote': return this.compileQuote(attributes, content);
      case 'link': return this.compileLink(attributes, location);
      case 'separator': return { tipo: 'separatore' } as BloccoSeparatore;
      case 'step-by-step': return this.compileStepByStep(attributes, content);
      case 'json': return this.compileJsonEscape(content, location);
      default:
        this.addError('E004', `Tipo direttiva sconosciuto: "${name}"`, location);
        return null;
    }
  }

  private compileNote(attrs: Record<string, unknown>, content: string): BloccoNota {
    const variantMap: Record<string, NotaVariante> = {
      info: 'info', warning: 'attenzione', attenzione: 'attenzione',
      tip: 'suggerimento', suggerimento: 'suggerimento',
      remember: 'ricorda', ricorda: 'ricorda',
    };
    const variant = attrs.variant as string || Object.keys(attrs).find(k => variantMap[k]) || 'info';
    return { tipo: 'nota', variante: variantMap[variant] || 'info', contenuto: content || '' };
  }

  private compileCallout(attrs: Record<string, unknown>, content: string): BloccoCallout {
    const variantMap: Record<string, CalloutVariante> = {
      obiettivo: 'obiettivo', prerequisiti: 'prerequisiti',
      materiali: 'materiali', tempo: 'tempo',
    };
    const variant = attrs.variant as string || Object.keys(attrs).find(k => variantMap[k]) || 'obiettivo';
    return { tipo: 'callout', variante: variantMap[variant] || 'obiettivo', contenuto: content || '' };
  }

  private compileDefinition(attrs: Record<string, unknown>, content: string, location?: SourceRange): BloccoDefinizione | null {
    const term = attrs.term as string;
    if (!term) {
      this.addError('E005', 'Campo "term" obbligatorio in definition', location);
      return null;
    }
    return { tipo: 'definizione', termine: term, definizione: content, nota: attrs.note as string | undefined };
  }

  private compileTheorem(attrs: Record<string, unknown>, content: string, location?: SourceRange): BloccoTeorema | null {
    const statement = (attrs.statement as string) || content;
    if (!statement) {
      this.addError('E005', 'Campo "statement" obbligatorio in theorem', location);
      return null;
    }
    return { tipo: 'teorema', nome: attrs.name as string | undefined, enunciato: statement, dimostrazione: attrs.proof as string | undefined };
  }

  private compileExample(attrs: Record<string, unknown>, content: string, location?: SourceRange): BloccoEsempio | null {
    const problem = (attrs.problem as string) || content;
    const solution = attrs.solution as string;
    if (!problem) { this.addError('E005', 'Campo "problem" obbligatorio in example', location); return null; }
    if (!solution) { this.addError('E005', 'Campo "solution" obbligatorio in example', location); return null; }
    return { tipo: 'esempio', titolo: attrs.title as string | undefined, problema: problem, soluzione: solution, nota: attrs.note as string | undefined };
  }

  private compileActivity(attrs: Record<string, unknown>, content: string): BloccoAttivita {
    return { tipo: 'attivita', titolo: attrs.title as string | undefined, consegna: content, nota: attrs.note as string | undefined };
  }

  private compileQuestion(attrs: Record<string, unknown>, content: string, location?: SourceRange): BloccoQuestion | null {
    const question = (attrs.question as string) || content;
    const answer = attrs.answer as string;
    if (!question) { this.addError('E005', 'Campo "question" obbligatorio', location); return null; }
    if (!answer) { this.addError('E005', 'Campo "answer" obbligatorio', location); return null; }
    return { tipo: 'question', title: attrs.title as string | undefined, question, answer };
  }

  private compileBrainstorming(attrs: Record<string, unknown>, location?: SourceRange): BloccoBrainstorming | null {
    const title = attrs.title as string;
    if (!title) { this.addError('E005', 'Campo "title" obbligatorio in brainstorming', location); return null; }
    return { tipo: 'brainstorming', title, placeholder: attrs.placeholder as string | undefined };
  }

  private compileQuiz(attrs: Record<string, unknown>, content: string, location?: SourceRange): BloccoQuiz | null {
    const question = attrs.question as string;
    const explanation = (attrs.explanation as string) || '';
    
    const options: { testo: string; corretta: boolean }[] = [];
    const optionRegex = /^-\s*\[([ x])\]\s*(.+)$/gm;
    let match;
    while ((match = optionRegex.exec(content)) !== null) {
      options.push({ testo: match[2].trim(), corretta: match[1] === 'x' });
    }

    if (!question) { this.addError('E005', 'Campo "question" obbligatorio in quiz', location); return null; }
    if (options.length === 0) { this.addError('E005', 'Almeno un\'opzione richiesta in quiz', location); return null; }

    return { tipo: 'quiz', domanda: question, opzioni: options, spiegazione: explanation, difficolta: attrs.difficulty as 'facile' | 'media' | 'difficile' | undefined };
  }

  private compileImageDirective(attrs: Record<string, unknown>, location?: SourceRange): BloccoImmagine | null {
    if (!attrs.src && !attrs.assetId) {
      this.addError('E005', 'Campo "src" o "assetId" obbligatorio in image', location);
      return null;
    }
    return {
      tipo: 'immagine',
      src: attrs.src as string | undefined,
      assetId: attrs.assetId as string | undefined,
      alt: (attrs.alt as string) || '',
      didascalia: attrs.caption as string | undefined,
      larghezza: attrs.width as number | undefined,
    };
  }

  private compileVideo(attrs: Record<string, unknown>, location?: SourceRange): BloccoVideo | null {
    if (!attrs.src && !attrs.assetId) {
      this.addError('E005', 'Campo "src" o "assetId" obbligatorio in video', location);
      return null;
    }
    return { tipo: 'video', src: attrs.src as string | undefined, assetId: attrs.assetId as string | undefined, titolo: attrs.title as string | undefined };
  }

  private compileDemo(attrs: Record<string, unknown>, location?: SourceRange): BloccoDemo | null {
    const component = attrs.component as string;
    if (!component) { this.addError('E005', 'Campo "component" obbligatorio in demo', location); return null; }
    return { tipo: 'demo', componente: component, props: attrs.props as Record<string, unknown> | undefined };
  }

  private compileTable(attrs: Record<string, unknown>, content: string): BloccoTabella {
    let header: string[] = [];
    let rows: string[][] = [];
    try {
      const data = JSON.parse(content);
      header = data.header || [];
      rows = data.rows || [];
    } catch {}
    return { tipo: 'tabella', intestazione: header, righe: rows, didascalia: attrs.caption as string | undefined };
  }

  private compileCode(attrs: Record<string, unknown>, content: string): BloccoCodice {
    return { tipo: 'codice', linguaggio: (attrs.lang as string) || 'text', codice: content };
  }

  private compileQuote(attrs: Record<string, unknown>, content: string): BloccoCitazione {
    return { tipo: 'citazione', testo: content, autore: attrs.author as string | undefined, fonte: attrs.source as string | undefined };
  }

  private compileLink(attrs: Record<string, unknown>, location?: SourceRange): BloccoCollegamento | null {
    const lessonId = attrs.lessonId as string;
    const text = attrs.text as string;
    if (!lessonId) { this.addError('E005', 'Campo "lessonId" obbligatorio in link', location); return null; }
    if (!text) { this.addError('E005', 'Campo "text" obbligatorio in link', location); return null; }
    return { tipo: 'collegamento', lezioneId: lessonId, testo: text, descrizione: attrs.description as string | undefined };
  }

  private compileStepByStep(attrs: Record<string, unknown>, content: string): BloccoStepByStep {
    const steps: { titolo: string; contenuto: string }[] = [];
    const stepRegex = /^\d+\.\s*(.+)$/gm;
    let match;
    let stepNum = 1;
    while ((match = stepRegex.exec(content)) !== null) {
      steps.push({ titolo: `Passo ${stepNum++}`, contenuto: match[1].trim() });
    }
    return { tipo: 'step-by-step', titolo: attrs.title as string | undefined, step: steps };
  }

  private compileJsonEscape(content: string, location?: SourceRange): Blocco | Blocco[] | null {
    try {
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed as Blocco[] : parsed as Blocco;
    } catch (e) {
      this.addError('E006', `JSON non valido: ${(e as Error).message}`, location);
      return null;
    }
  }

  private addError(code: CompilerError['code'], message: string, location?: SourceRange, help?: string) {
    this.errors.push({ code, message, location, help });
  }

  private addWarning(code: CompilerWarning['code'], message: string, location?: SourceRange, help?: string) {
    this.warnings.push({ code, message, location, help });
  }

  private failedOutput(): CompilerOutput {
    return { success: false, lesson: null, errors: this.errors, warnings: this.warnings };
  }
}
