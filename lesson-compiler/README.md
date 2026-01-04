# Lesson Markdown Compiler

Compilatore per il DSL Markdown delle lezioni interattive.

Converte file `.md` scritti con la sintassi speciale in JSON compatibile con lo schema `Lezione`.

## Quick Start

```bash
# Installa dipendenze
npm install

# Compila tutte le lezioni
npm run compile:lessons

# Watch mode (ricompila al salvataggio)
npm run compile:watch

# Esegui test
npm run test
```

## Struttura

```
lesson-compiler/
├── src/
│   └── compiler/
│       ├── index.ts        # Entry point
│       ├── parser.ts       # Markdown → AST
│       ├── compiler.ts     # AST → JSON
│       ├── schema.ts       # Tipi Lezione
│       ├── types.ts        # Tipi AST
│       └── utils.ts        # Utility
├── scripts/
│   └── compile-lessons.ts  # CLI
├── examples/
│   └── md/                 # Lezioni esempio
└── docs/
    └── lesson-markdown-spec.md
```

## Uso programmatico

```typescript
import { compile } from './src/compiler';

const markdown = `---
id: mia-lezione
title: La mia lezione
subject: fisica
topic: vettori
level: secondo-biennio
---

# Titolo

Contenuto della lezione.
`;

const result = await compile(markdown);

if (result.success) {
  console.log(JSON.stringify(result.lesson, null, 2));
} else {
  console.error(result.errors);
}
```

## Sintassi

Vedi [lesson-markdown-spec.md](docs/lesson-markdown-spec.md) per la specifica completa.

### Esempio base

```markdown
---
id: esempio
title: Lezione esempio
subject: fisica
topic: vettori
level: secondo-biennio
---

# Prima slide

Testo con $\LaTeX$ inline.

$$v_x = |\vec{v}| \cos\theta$$

:::note info
Una nota informativa.
:::

---

# Seconda slide

>>>

Contenuto che appare dopo una transizione.
```

## Integrazione nel progetto

Per integrare nel progetto principale:

1. Copia la cartella `src/compiler` in `src/lessons/compiler`
2. Copia `scripts/compile-lessons.ts` in `scripts/`
3. Aggiungi le dipendenze al `package.json` principale
4. Aggiungi lo script npm: `"compile:lessons": "tsx scripts/compile-lessons.ts"`

## Configurazione

Variabili d'ambiente:

- `INPUT_DIR`: cartella sorgenti `.md` (default: `./src/lessons/md`)
- `OUTPUT_DIR`: cartella output `.json` (default: `./src/lessons/data`)

## Fase di sviluppo

Questo è l'MVP (Fase 1). Blocchi supportati:

- ✅ Frontmatter → metadati
- ✅ Heading → titolo
- ✅ Paragrafi → testo
- ✅ LaTeX display → formula
- ✅ Liste → elenco
- ✅ Immagini (sintassi breve)
- ✅ Slide separator `---`
- ✅ Transizioni `>>>`
- ✅ `:::note` → nota
- ✅ `:::callout` → callout
- ✅ `:::definition` → definizione
- ✅ `:::theorem` → teorema
- ✅ `:::example` → esempio
- ✅ `:::activity` → attività
- ✅ `:::question` → question
- ✅ `:::brainstorming` → brainstorming
- ✅ `:::quiz` → quiz
- ✅ `:::image` → immagine (estesa)
- ✅ `:::video` → video
- ✅ `:::demo` → demo
- ✅ `:::table` → tabella
- ✅ `:::code` → codice
- ✅ `:::quote` → citazione
- ✅ `:::link` → collegamento
- ✅ `:::json` → escape hatch

## License

MIT
