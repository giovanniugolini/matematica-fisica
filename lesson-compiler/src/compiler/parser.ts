/**
 * Parser - Markdown → AST
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import { parse as parseYaml } from 'yaml';

import type {
  AstDocument,
  AstBlock,
  AstSlide,
  AstFrontmatter,
  AstHeading,
  AstParagraph,
  AstLatexDisplay,
  AstList,
  AstImage,
  AstTransition,
  AstDirective,
  CompilerError,
  CompilerWarning,
  SourceRange,
} from './types.js';

interface Position {
  start: { line: number; column: number; offset?: number };
  end: { line: number; column: number; offset?: number };
}

interface MdastNode {
  type: string;
  position?: Position;
  children?: MdastNode[];
  value?: string;
  depth?: number;
  ordered?: boolean;
  url?: string;
  alt?: string;
  title?: string;
  lang?: string;
}

interface ExtractedDirective {
  name: string;
  variant: string;
  content: string;
  line: number;
}

export class Parser {
  private errors: CompilerError[] = [];
  private warnings: CompilerWarning[] = [];
  private sourcePath: string;

  constructor(sourcePath: string = '<input>') {
    this.sourcePath = sourcePath;
  }

  async parse(source: string): Promise<AstDocument> {
    this.errors = [];
    this.warnings = [];

    // Step 1: Pre-process transitions
    const { source: sourceWithTransitions, transitionPlaceholders } = this.extractTransitions(source);

    // Step 2: Extract ::: directives
    const { processedSource, directives } = this.extractDirectives(sourceWithTransitions);

    // Step 3: Parse with remark
    const processor = unified()
      .use(remarkParse)
      .use(remarkFrontmatter, ['yaml'])
      .use(remarkGfm);

    const mdast = processor.parse(processedSource) as MdastNode;

    // Step 4: Convert MDAST to our AST
    const { frontmatter, blocks } = this.convertMdast(mdast, directives, transitionPlaceholders);

    // Step 5: Split into slides
    const slides = this.splitIntoSlides(blocks);

    return {
      frontmatter,
      slides,
      errors: this.errors,
      warnings: this.warnings,
    };
  }

  private extractTransitions(source: string): {
    source: string;
    transitionPlaceholders: Set<string>;
  } {
    const transitionPlaceholders = new Set<string>();
    let counter = 0;

    const processed = source.replace(/^[ \t]*>>>[ \t]*$/gm, () => {
      const id = `TRANSITION_PLACEHOLDER_${counter++}`;
      transitionPlaceholders.add(id);
      return id;
    });

    return { source: processed, transitionPlaceholders };
  }

  private extractDirectives(source: string): {
    processedSource: string;
    directives: Map<string, ExtractedDirective>;
  } {
    const directives = new Map<string, ExtractedDirective>();
    let counter = 0;

    const regex = /^:::(\w+)(?: (.+))?[\r\n]+([\s\S]*?)^:::[ \t]*$/gm;

    const processedSource = source.replace(regex, (match, name, variant, content, offset) => {
      const id = `DIRECTIVE_PLACEHOLDER_${counter++}`;
      const line = source.substring(0, offset).split('\n').length;

      directives.set(id, {
        name: name || '',
        variant: (variant || '').trim(),
        content: (content || '').trim(),
        line,
      });

      return `\n${id}\n`;
    });

    return { processedSource, directives };
  }

  private convertMdast(
    mdast: MdastNode,
    directives: Map<string, ExtractedDirective>,
    transitionPlaceholders: Set<string>
  ): { frontmatter: AstFrontmatter | null; blocks: AstBlock[] } {
    let frontmatter: AstFrontmatter | null = null;
    const blocks: AstBlock[] = [];

    if (!mdast.children) {
      return { frontmatter, blocks };
    }

    for (const node of mdast.children) {
      const location = this.getLocation(node.position);

      switch (node.type) {
        case 'yaml': {
          try {
            const data = parseYaml(node.value || '') as Record<string, unknown>;
            frontmatter = { type: 'frontmatter', data, location };
          } catch (e) {
            this.errors.push({
              code: 'E008',
              message: `Invalid YAML: ${(e as Error).message}`,
              location,
            });
          }
          break;
        }

        case 'heading': {
          blocks.push({
            type: 'heading',
            depth: node.depth as 1 | 2 | 3 | 4 | 5 | 6,
            text: this.extractText(node),
            location,
          } as AstHeading);
          break;
        }

        case 'paragraph': {
          const text = this.extractText(node).trim();

          if (transitionPlaceholders.has(text)) {
            blocks.push({ type: 'transition', location } as AstTransition);
            break;
          }

          if (text.startsWith('DIRECTIVE_PLACEHOLDER_')) {
            const directive = directives.get(text);
            if (directive) {
              const { attrs, content } = this.parseDirectiveBody(directive.content);
              blocks.push({
                type: 'directive',
                name: directive.name,
                attributes: { ...attrs, variant: directive.variant || attrs.variant },
                content,
                location,
              } as AstDirective);
              break;
            }
          }

          if (text === '>>>') {
            blocks.push({ type: 'transition', location } as AstTransition);
            break;
          }

          const latexMatch = text.match(/^\$\$([\s\S]+)\$\$$/);
          if (latexMatch) {
            const latex = latexMatch[1].trim();
            const labelMatch = latex.match(/^\[([^\]]+)\]\s*([\s\S]+)$/);
            blocks.push({
              type: 'latex-display',
              latex: labelMatch ? labelMatch[2].trim() : latex,
              label: labelMatch ? labelMatch[1] : undefined,
              location,
            } as AstLatexDisplay);
            break;
          }

          blocks.push({
            type: 'paragraph',
            content: text,
            location,
          } as AstParagraph);
          break;
        }

        case 'list': {
          const items = (node.children || []).map(item => this.extractText(item));
          blocks.push({
            type: 'list',
            ordered: node.ordered ?? false,
            items,
            location,
          } as AstList);
          break;
        }

        case 'image': {
          blocks.push({
            type: 'image',
            src: node.url || '',
            alt: node.alt || '',
            location,
          } as AstImage);
          break;
        }

        case 'thematicBreak': {
          blocks.push({ type: 'slide-separator', location });
          break;
        }

        case 'code': {
          blocks.push({
            type: 'directive',
            name: 'code',
            attributes: { lang: node.lang || 'text' },
            content: node.value || '',
            location,
          } as AstDirective);
          break;
        }

        case 'table': {
          const tableData = this.parseTable(node);
          blocks.push({
            type: 'directive',
            name: 'table',
            attributes: {},
            content: JSON.stringify(tableData),
            location,
          } as AstDirective);
          break;
        }

        case 'blockquote': {
          const quoteText = this.extractText(node).trim();
          if (quoteText === '' || quoteText === '>' || quoteText === '>>') {
            blocks.push({ type: 'transition', location } as AstTransition);
            break;
          }
          
          blocks.push({
            type: 'directive',
            name: 'quote',
            attributes: {},
            content: quoteText,
            location,
          } as AstDirective);
          break;
        }
      }
    }

    return { frontmatter, blocks };
  }

  private parseDirectiveBody(body: string): {
    attrs: Record<string, unknown>;
    content: string;
  } {
    const lines = body.split('\n');
    const attrs: Record<string, unknown> = {};
    const contentLines: string[] = [];
    
    let currentKey: string | null = null;
    let currentValue: string[] = [];
    let inContent = false;

    const saveCurrentAttr = () => {
      if (currentKey) {
        const value = currentValue.join('\n').trim();
        attrs[currentKey] = this.parseValue(value);
        currentKey = null;
        currentValue = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      if (trimmedLine === '') {
        if (currentKey) {
          saveCurrentAttr();
        }
        if (inContent) {
          contentLines.push('');
        }
        continue;
      }

      if (trimmedLine.startsWith('- ')) {
        saveCurrentAttr();
        inContent = true;
        contentLines.push(line);
        continue;
      }

      if (inContent) {
        contentLines.push(line);
        continue;
      }

      const match = line.match(/^([a-zA-Z_]\w*)\s*:\s*(.*)$/);
      if (match) {
        saveCurrentAttr();
        const [, key, value] = match;
        
        if (value.trim()) {
          attrs[key] = this.parseValue(value.trim());
        } else {
          currentKey = key;
          currentValue = [];
        }
        continue;
      }

      if (currentKey) {
        currentValue.push(line);
      } else {
        inContent = true;
        contentLines.push(line);
      }
    }

    saveCurrentAttr();

    const content = contentLines.join('\n').trim();
    return { attrs, content };
  }

  private parseValue(value: string): unknown {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (/^-?\d+$/.test(value)) return parseInt(value, 10);
    if (/^-?\d+\.\d+$/.test(value)) return parseFloat(value);
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1);
    }
    return value;
  }

  private parseTable(node: MdastNode): { header: string[]; rows: string[][] } {
    const header: string[] = [];
    const rows: string[][] = [];

    for (const child of node.children || []) {
      if (child.type === 'tableRow') {
        const cells = (child.children || []).map(cell => this.extractText(cell));
        if (header.length === 0) {
          header.push(...cells);
        } else {
          rows.push(cells);
        }
      }
    }

    return { header, rows };
  }

  private extractText(node: MdastNode): string {
    if (node.value !== undefined) return node.value;
    if (!node.children) return '';
    return node.children.map(c => this.extractTextFormatted(c)).join('');
  }

  private extractTextFormatted(node: MdastNode): string {
    switch (node.type) {
      case 'text': return node.value || '';
      case 'inlineCode': return `\`${node.value || ''}\``;
      case 'strong': return `**${this.extractText(node)}**`;
      case 'emphasis': return `*${this.extractText(node)}*`;
      case 'link': return `[${this.extractText(node)}](${node.url || ''})`;
      default: return this.extractText(node);
    }
  }

  private splitIntoSlides(blocks: AstBlock[]): AstSlide[] {
    const slides: AstSlide[] = [];
    let current: AstSlide = { blocks: [], transitionIndices: [] };
    let blockIdx = 0;

    for (const block of blocks) {
      if (block.type === 'slide-separator') {
        if (current.blocks.length > 0) {
          slides.push(current);
        }
        current = { blocks: [], transitionIndices: [] };
        blockIdx = 0;
        continue;
      }

      if (block.type === 'transition') {
        current.transitionIndices.push(blockIdx);
        continue;
      }

      if (block.type === 'heading' && !current.title) {
        current.title = (block as AstHeading).text;
      }

      current.blocks.push(block);
      blockIdx++;
    }

    if (current.blocks.length > 0) {
      slides.push(current);
    }

    return slides;
  }

  private getLocation(pos?: Position): SourceRange | undefined {
    if (!pos) return undefined;
    return {
      start: { line: pos.start.line, column: pos.start.column, offset: pos.start.offset },
      end: { line: pos.end.line, column: pos.end.column, offset: pos.end.offset },
    };
  }
}
