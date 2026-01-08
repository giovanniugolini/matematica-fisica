/**
 * Compiler v2 - AST → Lezione JSON
 * Supporta sequenze con step e transizioni
 */

import type {
  AstDocument,
  AstSection,
  AstBlock,
  AstHeading,
  AstParagraph,
  AstLatexDisplay,
  AstList,
  AstImage,
  AstDirective,
  AstTransition,
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
  BloccoSequenza,
  SequenzaStep,
  Materia,
  Argomento,
  LivelloScolastico,
  NotaVariante,
  CalloutVariante,
  TitoloLivello,
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
      this.addError('E001', 'Frontmatter mancante');
      return this.failedOutput();
    }

    const metadati = this.parseMetadati(ast.frontmatter.data, ast.frontmatter.location);
    if (!metadati) return this.failedOutput();

    // Compile sections
    const sezioni: SezioneLezione[] = ast.sections.map((s, i) => this.compileSection(s, i));

    // Compile introduction/conclusion
    const introduzione = ast.introduction.length > 0
        ? this.compileBlocksToSequenceOrBlocks(ast.introduction, 'Introduzione')
        : undefined;

    const conclusione = ast.conclusion.length > 0
        ? this.compileBlocksToSequenceOrBlocks(ast.conclusion, 'Conclusione')
        : undefined;

    const lezione: Lezione = { metadati, sezioni };
    if (introduzione) lezione.introduzione = introduzione;
    if (conclusione) lezione.conclusione = conclusione;
    if (ast.resources.length > 0) {
      lezione.risorse = ast.resources.map(r => ({
        tipo: r.type as 'libro' | 'video' | 'sito' | 'esercizi',
        titolo: r.title,
        url: r.url,
        descrizione: r.description,
      }));
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
    const missing = required.filter(k => !data[k]);

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
      dataCreazione: data.created as string | undefined,
      dataModifica: data.modified as string | undefined,
      versione: data.version as string | undefined,
      tags: data.tags as string[] | undefined,
      prerequisiti: data.prerequisites as string[] | undefined,
      obiettivi: data.objectives as string[] | undefined,
    };
  }

  private compileSection(section: AstSection, index: number): SezioneLezione {
    const blocchi = this.compileBlocksToSequenceOrBlocks(section.blocks, section.title);

    return {
      id: section.id || `sezione-${index + 1}`,
      titolo: section.title || `Sezione ${index + 1}`,
      blocchi,
    };
  }

  /**
   * Compile blocks - ALWAYS wrap in a sequenza when there are H2 headers
   * Each ## becomes a step in the sequenza
   */
  private compileBlocksToSequenceOrBlocks(blocks: AstBlock[], title?: string): Blocco[] {
    // Check if there's a sequenza directive
    const sequenzaDirective = blocks.find(
        b => b.type === 'directive' && (b as AstDirective).name === 'sequenza'
    ) as AstDirective | undefined;

    if (sequenzaDirective) {
      const seq = this.compileSequenzaDirective(sequenzaDirective);
      if (seq) return [seq];
    }

    // Check if there are H2 headers - if so, ALWAYS create a sequenza
    const hasH2Headers = blocks.some(
        b => b.type === 'heading' && (b as AstHeading).depth === 2
    );

    if (hasH2Headers) {
      const seq = this.createSequenzaFromBlocks(blocks, title);
      return [seq];
    }

    // Check if there are transitions without H2 - still create sequenza
    const hasTransitions = blocks.some(b => b.type === 'transition');
    if (hasTransitions) {
      const seq = this.createSequenzaFromBlocks(blocks, title);
      return [seq];
    }

    // No H2 and no transitions, compile normally (shouldn't happen often)
    return this.compileBlocks(blocks);
  }

  /**
   * Create a sequenza from blocks with transitions
   * Each transition creates a new step
   */
  private createSequenzaFromBlocks(blocks: AstBlock[], title?: string): BloccoSequenza {
    const steps: SequenzaStep[] = [];
    let currentStep: SequenzaStep = { blocchi: [], transitions: [] };
    let blockIndex = 0;

    for (const block of blocks) {
      if (block.type === 'transition') {
        // Record transition at current position within step
        currentStep.transitions!.push(blockIndex);
        continue;
      }

      // Check for step break (== Title ==)
      if (block.type === 'heading' && (block as AstHeading).depth === 2) {
        // Save current step if not empty
        if (currentStep.blocchi.length > 0) {
          steps.push(currentStep);
        }
        // Start new step
        currentStep = {
          titolo: (block as AstHeading).text,
          blocchi: [],
          transitions: [],
        };
        blockIndex = 0;
        continue;
      }

      const compiled = this.compileBlock(block);
      if (compiled) {
        if (Array.isArray(compiled)) {
          currentStep.blocchi.push(...compiled);
          blockIndex += compiled.length;
        } else {
          currentStep.blocchi.push(compiled);
          blockIndex++;
        }
      }
    }

    // Don't forget last step
    if (currentStep.blocchi.length > 0) {
      steps.push(currentStep);
    }

    // Clean up empty transitions arrays
    for (const step of steps) {
      if (step.transitions && step.transitions.length === 0) {
        delete step.transitions;
      }
    }

    return {
      tipo: 'sequenza',
      titolo: title,
      showProgress: true,
      allowJump: true,
      steps,
    };
  }

  /**
   * Compile :::sequenza directive with == step == syntax
   */
  private compileSequenzaDirective(directive: AstDirective): BloccoSequenza | null {
    const { attributes, rawContent } = directive;

    // Parse steps from rawContent using == Title == markers
    const steps = this.parseSequenzaSteps(rawContent || '');

    return {
      tipo: 'sequenza',
      titolo: attributes.titolo as string || attributes.title as string,
      showProgress: attributes.showProgress as boolean ?? true,
      allowJump: attributes.allowJump as boolean ?? true,
      steps,
    };
  }

  /**
   * Parse sequenza content into steps
   * Format: == Step Title ==\n content \n>>>\n more content
   */
  private parseSequenzaSteps(content: string): SequenzaStep[] {
    const steps: SequenzaStep[] = [];

    // Split by == Title ==
    const stepRegex = /^==\s*(.+?)\s*==$/gm;
    const parts: { title: string; content: string; start: number }[] = [];

    let match;
    let lastEnd = 0;

    while ((match = stepRegex.exec(content)) !== null) {
      if (lastEnd > 0) {
        // Save previous part's content
        parts[parts.length - 1].content = content.slice(lastEnd, match.index).trim();
      }
      parts.push({
        title: match[1],
        content: '',
        start: match.index + match[0].length,
      });
      lastEnd = match.index + match[0].length;
    }

    // Last part
    if (parts.length > 0) {
      parts[parts.length - 1].content = content.slice(lastEnd).trim();
    } else {
      // No step markers, single step
      parts.push({ title: '', content: content.trim(), start: 0 });
    }

    // Convert each part to a step
    for (const part of parts) {
      const step = this.parseStepContent(part.title, part.content);
      steps.push(step);
    }

    return steps;
  }

  /**
   * Parse a single step's content, handling >>> transitions
   */
  private parseStepContent(title: string, content: string): SequenzaStep {
    const blocchi: Blocco[] = [];
    const transitions: number[] = [];

    // Split by >>> and track positions
    const fragments = content.split(/^>>>$/m);

    let blockIndex = 0;
    for (let i = 0; i < fragments.length; i++) {
      const fragment = fragments[i].trim();
      if (!fragment) continue;

      if (i > 0) {
        // There was a >>> before this fragment
        transitions.push(blockIndex);
      }

      // Parse fragment as mini-markdown
      const fragmentBlocks = this.parseFragmentToBlocks(fragment);
      for (const block of fragmentBlocks) {
        blocchi.push(block);
        blockIndex++;
      }
    }

    const step: SequenzaStep = { blocchi };
    if (title) step.titolo = title;
    if (transitions.length > 0) step.transitions = transitions;

    return step;
  }

  /**
   * Parse a text fragment into blocks (simple parsing for step content)
   */
  private parseFragmentToBlocks(text: string): Blocco[] {
    const blocks: Blocco[] = [];
    const lines = text.split('\n');
    let i = 0;

    while (i < lines.length) {
      const line = lines[i].trim();

      if (!line) {
        i++;
        continue;
      }

      // Display formula
      if (line.startsWith('$$') && line.endsWith('$$')) {
        blocks.push({
          tipo: 'formula',
          latex: line.slice(2, -2).trim(),
          display: true,
        });
        i++;
        continue;
      }

      // Multi-line formula
      if (line === '$$') {
        let latex = '';
        i++;
        while (i < lines.length && lines[i].trim() !== '$$') {
          latex += lines[i] + '\n';
          i++;
        }
        blocks.push({
          tipo: 'formula',
          latex: latex.trim(),
          display: true,
        });
        i++;
        continue;
      }

      // List
      if (line.startsWith('- ') || line.match(/^\d+\.\s/)) {
        const ordered = !line.startsWith('- ');
        const items: string[] = [];
        while (i < lines.length) {
          const l = lines[i].trim();
          if (l.startsWith('- ') || l.match(/^\d+\.\s/)) {
            items.push(l.replace(/^[-\d.]+\s*/, ''));
            i++;
          } else if (l === '') {
            i++;
            break;
          } else {
            break;
          }
        }
        blocks.push({ tipo: 'elenco', ordinato: ordered, elementi: items });
        continue;
      }

      // Regular text
      let text = line;
      i++;
      while (i < lines.length && lines[i].trim() && !lines[i].trim().startsWith('$$') &&
      !lines[i].trim().startsWith('- ') && !lines[i].trim().match(/^\d+\.\s/)) {
        text += '\n' + lines[i];
        i++;
      }
      blocks.push({ tipo: 'testo', contenuto: text });
    }

    return blocks;
  }

  private compileBlocks(blocks: AstBlock[]): Blocco[] {
    const result: Blocco[] = [];
    for (const block of blocks) {
      if (block.type === 'transition') continue; // Skip bare transitions
      const compiled = this.compileBlock(block);
      if (compiled) {
        if (Array.isArray(compiled)) result.push(...compiled);
        else result.push(compiled);
      }
    }
    return result;
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

  private compileHeading(block: AstHeading): Blocco {
    const level = Math.min(Math.max(block.depth + 1, 2), 4) as TitoloLivello;
    return { tipo: 'titolo', livello: level, testo: block.text };
  }

  private compileParagraph(block: AstParagraph): Blocco {
    return { tipo: 'testo', contenuto: block.content };
  }

  private compileLatex(block: AstLatexDisplay): Blocco {
    return { tipo: 'formula', latex: block.latex, display: true };
  }

  private compileList(block: AstList): Blocco {
    return { tipo: 'elenco', ordinato: block.ordered, elementi: block.items };
  }

  private compileImage(block: AstImage): Blocco {
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
      case 'separator': return { tipo: 'separatore' };
      case 'sequenza': return this.compileSequenzaDirective(block);
      case 'json': return this.compileJsonEscape(content, location);
      default:
        this.addWarning('W001', `Direttiva sconosciuta: "${name}", ignorata`, location);
        return null;
    }
  }

  private compileNote(attrs: Record<string, unknown>, content: string): Blocco {
    const variantMap: Record<string, NotaVariante> = {
      info: 'info', warning: 'attenzione', attenzione: 'attenzione',
      tip: 'suggerimento', suggerimento: 'suggerimento',
      remember: 'ricorda', ricorda: 'ricorda',
    };
    const variant = attrs.variant as string || Object.keys(attrs).find(k => variantMap[k]) || 'info';
    return { tipo: 'nota', variante: variantMap[variant] || 'info', contenuto: content || '' };
  }

  private compileCallout(attrs: Record<string, unknown>, content: string): Blocco {
    const variantMap: Record<string, CalloutVariante> = {
      obiettivo: 'obiettivo', prerequisiti: 'prerequisiti',
      materiali: 'materiali', tempo: 'tempo',
    };
    const variant = attrs.variant as string || Object.keys(attrs).find(k => variantMap[k]) || 'obiettivo';
    return {
      tipo: 'callout',
      variante: variantMap[variant] || 'obiettivo',
      titolo: attrs.titolo as string || attrs.title as string,
      contenuto: content || ''
    };
  }

  private compileDefinition(attrs: Record<string, unknown>, content: string, loc?: SourceRange): Blocco | null {
    const term = attrs.term as string || attrs.termine as string;
    if (!term) {
      this.addError('E005', 'Campo "term" obbligatorio in definition', loc);
      return null;
    }
    return {
      tipo: 'definizione',
      termine: term,
      definizione: content,
      nota: attrs.note as string || attrs.nota as string,
    };
  }

  private compileTheorem(attrs: Record<string, unknown>, content: string, loc?: SourceRange): Blocco | null {
    const statement = (attrs.statement as string) || (attrs.enunciato as string) || content;
    if (!statement) {
      this.addError('E005', 'Campo "statement" obbligatorio in theorem', loc);
      return null;
    }
    return {
      tipo: 'teorema',
      nome: attrs.name as string || attrs.nome as string,
      enunciato: statement,
      dimostrazione: attrs.proof as string || attrs.dimostrazione as string,
    };
  }

  private compileExample(attrs: Record<string, unknown>, content: string, loc?: SourceRange): Blocco | null {
    const problem = (attrs.problem as string) || (attrs.problema as string) || content;
    const solution = (attrs.solution as string) || (attrs.soluzione as string);
    if (!problem) { this.addError('E005', 'Campo "problem" obbligatorio in example', loc); return null; }
    if (!solution) { this.addError('E005', 'Campo "solution" obbligatorio in example', loc); return null; }
    return {
      tipo: 'esempio',
      titolo: attrs.title as string || attrs.titolo as string,
      problema: problem,
      soluzione: solution,
      nota: attrs.note as string || attrs.nota as string,
    };
  }

  private compileActivity(attrs: Record<string, unknown>, content: string): Blocco {
    return {
      tipo: 'attivita',
      titolo: attrs.title as string || attrs.titolo as string,
      consegna: content,
      nota: attrs.note as string || attrs.nota as string,
    };
  }

  private compileQuestion(attrs: Record<string, unknown>, content: string, loc?: SourceRange): Blocco | null {
    const question = (attrs.question as string) || (attrs.domanda as string) || content;
    const answer = (attrs.answer as string) || (attrs.risposta as string);
    if (!question) { this.addError('E005', 'Campo "question" obbligatorio', loc); return null; }
    if (!answer) { this.addError('E005', 'Campo "answer" obbligatorio', loc); return null; }
    return {
      tipo: 'question',
      title: attrs.title as string || attrs.titolo as string,
      question,
      answer,
      showAnswerLabel: attrs.showAnswerLabel as string,
      hideAnswerLabel: attrs.hideAnswerLabel as string,
      defaultExpanded: attrs.defaultExpanded as boolean,
    };
  }

  private compileBrainstorming(attrs: Record<string, unknown>, loc?: SourceRange): Blocco | null {
    const title = attrs.title as string || attrs.titolo as string;
    if (!title) { this.addError('E005', 'Campo "title" obbligatorio in brainstorming', loc); return null; }
    return {
      tipo: 'brainstorming',
      titolo: title,
      placeholder: attrs.placeholder as string,
      altezzaPx: attrs.altezzaPx as number || attrs.heightPx as number,
      persistId: attrs.persistId as string,
      persistDefault: attrs.persistDefault as boolean,
    };
  }

  private compileQuiz(attrs: Record<string, unknown>, content: string, loc?: SourceRange): Blocco | null {
    const question = attrs.question as string || attrs.domanda as string;
    const explanation = (attrs.explanation as string) || (attrs.spiegazione as string) || '';

    const options: { testo: string; corretta: boolean }[] = [];
    const optionRegex = /^-\s*\[([ x])\]\s*(.+)$/gm;
    let match;
    while ((match = optionRegex.exec(content)) !== null) {
      options.push({ testo: match[2].trim(), corretta: match[1] === 'x' });
    }

    if (!question) { this.addError('E005', 'Campo "question" obbligatorio in quiz', loc); return null; }
    if (options.length === 0) { this.addError('E005', 'Almeno un\'opzione richiesta in quiz', loc); return null; }

    return {
      tipo: 'quiz',
      domanda: question,
      opzioni: options,
      spiegazione: explanation,
      difficolta: attrs.difficulty as 'facile' | 'media' | 'difficile' || attrs.difficolta as 'facile' | 'media' | 'difficile',
    };
  }

  private compileImageDirective(attrs: Record<string, unknown>, loc?: SourceRange): Blocco | null {
    if (!attrs.src && !attrs.assetId) {
      this.addError('E005', 'Campo "src" o "assetId" obbligatorio in image', loc);
      return null;
    }
    return {
      tipo: 'immagine',
      src: attrs.src as string,
      assetId: attrs.assetId as string,
      alt: (attrs.alt as string) || '',
      didascalia: attrs.caption as string || attrs.didascalia as string,
      larghezza: attrs.width as number || attrs.larghezza as number,
    };
  }

  private compileVideo(attrs: Record<string, unknown>, loc?: SourceRange): Blocco | null {
    if (!attrs.src && !attrs.assetId) {
      this.addError('E005', 'Campo "src" o "assetId" obbligatorio in video', loc);
      return null;
    }
    return {
      tipo: 'video',
      src: attrs.src as string,
      assetId: attrs.assetId as string,
      titolo: attrs.title as string || attrs.titolo as string,
    };
  }

  private compileDemo(attrs: Record<string, unknown>, loc?: SourceRange): Blocco | null {
    const component = attrs.component as string || attrs.componente as string;
    if (!component) { this.addError('E005', 'Campo "component" obbligatorio in demo', loc); return null; }
    return {
      tipo: 'demo',
      componente: component,
      props: attrs.props as Record<string, unknown>,
      titolo: attrs.title as string || attrs.titolo as string,
      descrizione: attrs.description as string || attrs.descrizione as string,
    };
  }

  private compileTable(attrs: Record<string, unknown>, content: string): Blocco {
    let header: string[] = [];
    let rows: string[][] = [];
    try {
      const data = JSON.parse(content);
      header = data.header || [];
      rows = data.rows || [];
    } catch {}
    return {
      tipo: 'tabella',
      intestazione: header,
      righe: rows,
      didascalia: attrs.caption as string || attrs.didascalia as string,
    };
  }

  private compileCode(attrs: Record<string, unknown>, content: string): Blocco {
    return {
      tipo: 'codice',
      linguaggio: (attrs.lang as string) || (attrs.linguaggio as string) || 'text',
      codice: content,
    };
  }

  private compileQuote(attrs: Record<string, unknown>, content: string): Blocco {
    return {
      tipo: 'citazione',
      testo: content,
      autore: attrs.author as string || attrs.autore as string,
      fonte: attrs.source as string || attrs.fonte as string,
    };
  }

  private compileLink(attrs: Record<string, unknown>, loc?: SourceRange): Blocco | null {
    const lessonId = attrs.lessonId as string || attrs.lezioneId as string;
    const text = attrs.text as string || attrs.testo as string;
    if (!lessonId) { this.addError('E005', 'Campo "lessonId" obbligatorio in link', loc); return null; }
    if (!text) { this.addError('E005', 'Campo "text" obbligatorio in link', loc); return null; }
    return {
      tipo: 'collegamento',
      lezioneId: lessonId,
      testo: text,
      descrizione: attrs.description as string || attrs.descrizione as string,
    };
  }

  private compileJsonEscape(content: string, loc?: SourceRange): Blocco | Blocco[] | null {
    try {
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed as Blocco[] : parsed as Blocco;
    } catch (e) {
      this.addError('E006', `JSON non valido: ${(e as Error).message}`, loc);
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