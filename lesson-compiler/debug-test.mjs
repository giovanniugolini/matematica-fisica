import { compile } from './src/compiler/index.ts';

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
`;

const result = await compile(source);
console.log(JSON.stringify(result.lesson?.sezioni[0], null, 2));
