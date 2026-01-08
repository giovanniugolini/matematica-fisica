import { describe, it, expect } from 'vitest';
import { compile, Parser } from '../index';

describe('Parser v2', () => {
    it('should parse frontmatter', async () => {
        const source = `---
id: test
title: Test
subject: fisica
topic: vettori
level: primo-biennio
---

# Intro

Hello
`;
        const parser = new Parser();
        const ast = await parser.parse(source);
        expect(ast.frontmatter).not.toBeNull();
        expect(ast.frontmatter?.data.id).toBe('test');
    });

    it('should split into introduction and sections', async () => {
        const source = `---
id: test
title: Test
subject: fisica
topic: vettori
level: primo-biennio
---

# Introduzione

Intro text

---

# Section One

Content

---

# Conclusione

Final
`;
        const parser = new Parser();
        const ast = await parser.parse(source);

        expect(ast.introduction.length).toBeGreaterThan(0);
        expect(ast.sections.length).toBe(1);
        expect(ast.sections[0].title).toBe('Section One');
        expect(ast.conclusion.length).toBeGreaterThan(0);
    });

    it('should detect transitions', async () => {
        const source = `---
id: test
title: Test
subject: fisica
topic: vettori
level: primo-biennio
---

# Section

First

>>>

Second

>>>

Third
`;
        const parser = new Parser();
        const ast = await parser.parse(source);

        const transitions = ast.sections[0].blocks.filter(b => b.type === 'transition');
        expect(transitions.length).toBe(2);
    });
});

describe('Compiler v2', () => {
    it('should compile with sequenza when H2 headers present', async () => {
        const source = `---
id: test
title: Test
subject: fisica
topic: vettori
level: primo-biennio
---

# Section

## Step 1

Content 1

## Step 2

Content 2
`;
        const result = await compile(source);

        expect(result.success).toBe(true);
        // With H2 headers, it ALWAYS creates a sequenza
        expect(result.lesson?.sezioni[0].blocchi[0].tipo).toBe('sequenza');
    });

    it('should compile directives correctly', async () => {
        const source = `---
id: test
title: Test
subject: fisica
topic: vettori
level: primo-biennio
---

# Section

## Step 1

:::note info
Important note
:::

## Step 2

:::definition
term: Test term

This is the definition.

note: A note about it.
:::

## Step 3

:::quiz
difficulty: facile
question: What is 2+2?

- [ ] 3
- [x] 4
- [ ] 5

explanation: Basic math.
:::
`;
        const result = await compile(source);

        expect(result.success).toBe(true);

        // Find the sequenza (created because of ## steps)
        const seq = result.lesson?.sezioni[0].blocchi[0];
        expect(seq?.tipo).toBe('sequenza');

        if (seq?.tipo === 'sequenza') {
            const allBlocks = seq.steps.flatMap(s => s.blocchi);
            expect(allBlocks.some(b => b.tipo === 'nota')).toBe(true);
            expect(allBlocks.some(b => b.tipo === 'definizione')).toBe(true);
            expect(allBlocks.some(b => b.tipo === 'quiz')).toBe(true);
        }
    });

    it('should handle resources', async () => {
        const source = `---
id: test
title: Test
subject: fisica
topic: vettori
level: primo-biennio
---

# Content

Text

---

# Risorse

:::risorsa
tipo: libro
titolo: Test Book
descrizione: A test book
:::

:::risorsa
tipo: video
titolo: Test Video
url: https://example.com
:::
`;
        const result = await compile(source);

        expect(result.success).toBe(true);
        expect(result.lesson?.risorse?.length).toBe(2);
    });
});