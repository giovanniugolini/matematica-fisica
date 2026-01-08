/**
 * Parser v2 - Markdown → AST
 * Supporta: sezioni (#), introduzione/conclusione, sequenze con step (==)
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import { parse as parseYaml } from 'yaml';

import type {
  AstDocument,
  AstBlock,
  AstSection,
  AstFrontmatter,
  AstHeading,
  AstParagraph,
  AstLatexDisplay,
  AstList,
  AstImage,
  AstTransition,
  AstSectionBreak,
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
  lang?: string;
}

interface ExtractedDirective {
  name: string;
  variant: string;
  content: string;
  rawContent: string;
  line: number;
}

export class Parser {
  private errors: CompilerError[] = [];
  private warnings: CompilerWarning[] = [];

  async parse(source: string): Promise<AstDocument> {
    this.errors = [];
    this.warnings = [];

    // Step 1: Pre-process transitions and directives
    const { source: s1, transitionPlaceholders } = this.extractTransitions(source);
    const { processedSource, directives } = this.extractDirectives(s1);

    // Step 2: Parse with remark
    const processor = unified()
      .use(remarkParse)
      .use(remarkFrontmatter, ['yaml'])
      .use(remarkGfm);

    const mdast = processor.parse(processedSource) as MdastNode;

    // Step 3: Convert to AST blocks
    const { frontmatter, blocks } = this.convertMdast(mdast, directives, transitionPlaceholders);

    // Step 4: Split into introduction, sections, conclusion
    const { introduction, sections, conclusion, resources } = this.splitDocument(blocks);

    return {
      frontmatter,
      introduction,
      sections,
      conclusion,
      resources,
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

    // Match ::: blocks - capture raw content for sequenze
    const regex = /^:::(\w+)(?: (.+))?[\r\n]+([\s\S]*?)^:::[ \t]*$/gm;

    const processedSource = source.replace(regex, (match, name, variant, content, offset) => {
      const id = `DIRECTIVE_PLACEHOLDER_${counter++}`;
      const line = source.substring(0, offset).split('\n').length;

      directives.set(id, {
        name: name || '',
        variant: (variant || '').trim(),
        content: (content || '').trim(),
        rawContent: content || '',
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

    if (!mdast.children) return { frontmatter, blocks };

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
                rawContent: directive.rawContent,
                location,
              } as AstDirective);
              break;
            }
          }

          if (text === '>>>') {
            blocks.push({ type: 'transition', location } as AstTransition);
            break;
          }

          // Display LaTeX
          const latexMatch = text.match(/^\$\$([\s\S]+)\$\$$/);
          if (latexMatch) {
            blocks.push({
              type: 'latex-display',
              latex: latexMatch[1].trim(),
              location,
            } as AstLatexDisplay);
            break;
          }

          blocks.push({ type: 'paragraph', content: text, location } as AstParagraph);
          break;
        }

        case 'list': {
          const items = (node.children || []).map(item => this.extractText(item));
          blocks.push({ type: 'list', ordered: node.ordered ?? false, items, location } as AstList);
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
          // --- is section break
          blocks.push({ type: 'section-break', location } as AstSectionBreak);
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

  private splitDocument(blocks: AstBlock[]): {
    introduction: AstBlock[];
    sections: AstSection[];
    conclusion: AstBlock[];
    resources: Array<{ type: string; title: string; url?: string; description?: string }>;
  } {
    const introduction: AstBlock[] = [];
    const sections: AstSection[] = [];
    const conclusion: AstBlock[] = [];
    const resources: Array<{ type: string; title: string; url?: string; description?: string }> = [];

    let currentSection: AstSection | null = null;
    let inIntro = true;
    let inConclusion = false;

    for (const block of blocks) {
      // Check for special section markers via H1
      if (block.type === 'heading' && (block as AstHeading).depth === 1) {
        const title = (block as AstHeading).text.toLowerCase();
        
        if (title.includes('introduzione') || title.includes('intro')) {
          inIntro = true;
          inConclusion = false;
          currentSection = null;
          continue;
        }
        
        if (title.includes('conclusione') || title.includes('riepilogo')) {
          inIntro = false;
          inConclusion = true;
          currentSection = null;
          continue;
        }

        if (title.includes('risorse') || title.includes('resources')) {
          // Skip, resources handled via directive
          continue;
        }

        // Regular section
        inIntro = false;
        inConclusion = false;
        currentSection = {
          id: this.slugify(title),
          title: (block as AstHeading).text,
          blocks: [],
        };
        sections.push(currentSection);
        continue;
      }

      // Section break (---)
      if (block.type === 'section-break') {
        if (currentSection) {
          currentSection = null;
        }
        continue;
      }

      // Resource directive
      if (block.type === 'directive' && (block as AstDirective).name === 'risorsa') {
        const attrs = (block as AstDirective).attributes;
        resources.push({
          type: attrs.tipo as string || 'sito',
          title: attrs.titolo as string || '',
          url: attrs.url as string,
          description: attrs.descrizione as string,
        });
        continue;
      }

      // Add block to appropriate container
      if (inConclusion) {
        conclusion.push(block);
      } else if (inIntro && !currentSection) {
        introduction.push(block);
      } else if (currentSection) {
        currentSection.blocks.push(block);
      } else {
        // No section yet, create default
        currentSection = {
          id: `sezione-${sections.length + 1}`,
          title: `Sezione ${sections.length + 1}`,
          blocks: [block],
        };
        sections.push(currentSection);
        inIntro = false;
      }
    }

    return { introduction, sections, conclusion, resources };
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

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed === '') {
        if (currentKey) saveCurrentAttr();
        if (inContent) contentLines.push('');
        continue;
      }

      // List items are content
      if (trimmed.startsWith('- ')) {
        saveCurrentAttr();
        inContent = true;
        contentLines.push(line);
        continue;
      }

      if (inContent) {
        contentLines.push(line);
        continue;
      }

      // key: value
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
    return { attrs, content: contentLines.join('\n').trim() };
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
        if (header.length === 0) header.push(...cells);
        else rows.push(cells);
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

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private getLocation(pos?: Position): SourceRange | undefined {
    if (!pos) return undefined;
    return {
      start: { line: pos.start.line, column: pos.start.column, offset: pos.start.offset },
      end: { line: pos.end.line, column: pos.end.column, offset: pos.end.offset },
    };
  }
}
