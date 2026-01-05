# Lesson Markdown Compiler

Compilatore per il DSL Markdown delle lezioni interattive.

## Quick Start

```bash
npm install
npm run test          # Esegue i test
npm run compile:lessons   # Compila le lezioni
npm run compile:watch     # Watch mode
```

## Struttura

```
lesson-compiler/
├── src/compiler/
│   ├── index.ts      # Entry point
│   ├── parser.ts     # Markdown → AST
│   ├── compiler.ts   # AST → JSON
│   ├── schema.ts     # Tipi Lezione
│   ├── types.ts      # Tipi AST
│   └── tests/
├── scripts/
│   └── compile-lessons.ts
└── examples/md/
```

## Sintassi

```markdown
---
id: lezione-id
title: Titolo
subject: fisica
topic: vettori
level: secondo-biennio
---

# Slide 1

Testo con $\LaTeX$ inline.

$$formula display$$

:::note info
Una nota.
:::

---

# Slide 2

>>>

Contenuto dopo transizione.
```

## Configurazione

```bash
INPUT_DIR=./examples/md OUTPUT_DIR=./output npm run compile:lessons
```
