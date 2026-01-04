/**
 * Basic tests for the lesson compiler
 */

import { describe, it, expect } from 'vitest';
import { compile, Parser, Compiler } from '../index';

describe('Parser', () => {
    it('should parse frontmatter', async () => {
        const source = `---
id: test-lesson
title: Test Lesson
subject: fisica
topic: vettori
level: secondo-biennio
---

# Hello World
`;

        const parser = new Parser();
        const ast = await parser.parse(source);

        expect(ast.frontmatter).not.toBeNull();
        expect(ast.frontmatter?.data.id).toBe('test-lesson');
        expect(ast.frontmatter?.data.title).toBe('Test Lesson');
    });

    it('should parse headings', async () => {
        const source = `---
id: test
title: Test
subject: fisica
topic: vettori
level: secondo-biennio
---

# Main Title

## Subtitle
`;

        const parser = new Parser();
        const ast = await parser.parse(source);

        expect(ast.slides.length).toBe(1);
        expect(ast.slides[0].blocks[0].type).toBe('heading');
    });

    it('should split slides at ---', async () => {
        const source = `---
id: test
title: Test
subject: fisica
topic: vettori
level: secondo-biennio
---

# Slide 1

Content 1

---

# Slide 2

Content 2
`;

        const parser = new Parser();
        const ast = await parser.parse(source);

        expect(ast.slides.length).toBe(2);
        expect(ast.slides[0].title).toBe('Slide 1');
        expect(ast.slides[1].title).toBe('Slide 2');
    });

    it('should parse transitions', async () => {
        const source = `---
id: test
title: Test
subject: fisica
topic: vettori
level: secondo-biennio
---

# Slide 1

First content

>>>

Second content

>>>

Third content
`;

        const parser = new Parser();
        const ast = await parser.parse(source);

        expect(ast.slides[0].transitionIndices.length).toBe(2);
    });

    it('should parse LaTeX display formulas', async () => {
        const source = `---
id: test
title: Test
subject: fisica
topic: vettori
level: secondo-biennio
---

# Formula

$$v_x = |\\vec{v}| \\cos\\theta$$
`;

        const parser = new Parser();
        const ast = await parser.parse(source);

        const formulaBlock = ast.slides[0].blocks.find(b => b.type === 'latex-display');
        expect(formulaBlock).toBeDefined();
    });
});

describe('Compiler', () => {
    it('should compile a minimal lesson', async () => {
        const source = `---
id: minimal-test
title: Minimal Test
subject: fisica
topic: vettori
level: secondo-biennio
---

# Hello

This is a test.
`;

        const result = await compile(source);

        expect(result.success).toBe(true);
        expect(result.lesson).not.toBeNull();
        expect(result.lesson?.metadati.id).toBe('minimal-test');
        expect(result.lesson?.sezioni.length).toBe(1);
    });

    it('should fail without frontmatter', async () => {
        const source = `# No Frontmatter

This should fail.
`;

        const result = await compile(source);

        expect(result.success).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0].code).toBe('E001');
    });

    it('should fail with missing required fields', async () => {
        const source = `---
id: test
title: Test
---

# Missing fields
`;

        const result = await compile(source);

        expect(result.success).toBe(false);
        expect(result.errors.some(e => e.code === 'E002')).toBe(true);
    });

    it('should compile callouts', async () => {
        const source = `---
id: test
title: Test
subject: fisica
topic: vettori
level: secondo-biennio
---

# Test

:::callout obiettivo
Learn something
:::
`;

        const result = await compile(source);

        expect(result.success).toBe(true);
        const callout = result.lesson?.sezioni[0].blocchi.find(
            b => b.tipo === 'callout'
        );
        expect(callout).toBeDefined();
    });

    it('should compile notes', async () => {
        const source = `---
id: test
title: Test
subject: fisica
topic: vettori
level: secondo-biennio
---

# Test

:::note info
Important information
:::
`;

        const result = await compile(source);

        expect(result.success).toBe(true);
        const note = result.lesson?.sezioni[0].blocchi.find(
            b => b.tipo === 'nota'
        );
        expect(note).toBeDefined();
    });

    it('should preserve transitions in output', async () => {
        const source = `---
id: test
title: Test
subject: fisica
topic: vettori
level: secondo-biennio
---

# Slide

First

>>>

Second
`;

        const result = await compile(source);

        expect(result.success).toBe(true);
        expect(result.lesson?.sezioni[0].transitions).toBeDefined();
        expect(result.lesson?.sezioni[0].transitions?.length).toBeGreaterThan(0);
    });
});

describe('Full lesson compilation', () => {
    it('should compile a complete lesson with all block types', async () => {
        const source = `---
id: complete-test
title: Complete Test
subject: fisica
topic: vettori
level: secondo-biennio
duration: 30
tags:
  - test
  - example
---

# Introduction

Welcome to this lesson.

:::callout obiettivo
Learn everything!
:::

---

# Concepts

A formula: $E = mc^2$

$$F = ma$$

:::definition
term: Force
A push or pull on an object.
note: Measured in Newtons
:::

>>>

:::note warning
Be careful with units!
:::

---

# Example

:::example
title: Simple calculation

problem:
Calculate the force when m=2kg and a=3m/s².

solution:
F = 2 × 3 = 6 N
:::

---

# Quiz

:::quiz
difficulty: facile

question: What is 2+2?

- [ ] 3
- [x] 4
- [ ] 5

explanation: Basic arithmetic
:::
`;

        const result = await compile(source);

        expect(result.success).toBe(true);
        expect(result.lesson).not.toBeNull();

        // Check structure
        expect(result.lesson?.sezioni.length).toBe(4);

        // Check various block types exist
        const allBlocks = result.lesson?.sezioni.flatMap(s => s.blocchi) || [];

        expect(allBlocks.some(b => b.tipo === 'callout')).toBe(true);
        expect(allBlocks.some(b => b.tipo === 'formula')).toBe(true);
        expect(allBlocks.some(b => b.tipo === 'definizione')).toBe(true);
        expect(allBlocks.some(b => b.tipo === 'nota')).toBe(true);
        expect(allBlocks.some(b => b.tipo === 'esempio')).toBe(true);
        expect(allBlocks.some(b => b.tipo === 'quiz')).toBe(true);
    });
});