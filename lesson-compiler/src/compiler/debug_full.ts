/**
 * Debug the full lesson compilation test
 */

import { compile } from './index';

async function debug() {
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

    console.log('Success:', result.success);
    console.log('\nErrors:', JSON.stringify(result.errors, null, 2));
    console.log('\nWarnings:', JSON.stringify(result.warnings, null, 2));

    if (result.lesson) {
        console.log('\nLesson sections:', result.lesson.sezioni.length);
        result.lesson.sezioni.forEach((s, i) => {
            console.log(`\nSection ${i}: ${s.titolo}`);
            s.blocchi.forEach((b, j) => {
                console.log(`  [${j}] ${b.tipo}`);
            });
        });
    }
}

debug().catch(console.error);