/**
 * Debug script - run with: npx tsx src/compiler/debug.ts
 */

import { Parser } from './index';

async function debug() {
  const parser = new Parser();

  console.log('=== TEST: Transitions ===');
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

  const ast = await parser.parse(source);

  console.log('Number of slides:', ast.slides.length);
  console.log('\nSlide 0 blocks:');
  ast.slides[0]?.blocks.forEach((b, i) => {
    console.log(`  [${i}] type: ${b.type}, content: ${JSON.stringify((b as any).content || (b as any).text || '').slice(0, 50)}`);
  });
  console.log('\nTransition indices:', ast.slides[0]?.transitionIndices);

  // Check what remark sees
  console.log('\n=== RAW REMARK OUTPUT ===');
  const { unified } = await import('unified');
  const remarkParse = (await import('remark-parse')).default;
  const remarkFrontmatter = (await import('remark-frontmatter')).default;

  const processor = unified()
      .use(remarkParse)
      .use(remarkFrontmatter, ['yaml']);

  const mdast = processor.parse(source);

  console.log('Children types:', (mdast as any).children?.map((c: any) => ({
    type: c.type,
    value: c.value?.slice(0, 30),
    depth: c.depth,
  })));
}

debug().catch(console.error);