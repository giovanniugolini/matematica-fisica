/**
 * Debug quiz parsing
 */

import { Parser } from './index';

async function debug() {
  const parser = new Parser();

  const source = `---
id: test
title: Test
subject: fisica
topic: vettori
level: secondo-biennio
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

  const ast = await parser.parse(source);
  
  const quizBlock = ast.slides[0]?.blocks.find(b => (b as any).name === 'quiz');
  
  console.log('Quiz directive:');
  console.log(JSON.stringify(quizBlock, null, 2));
}

debug().catch(console.error);
