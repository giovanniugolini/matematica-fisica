/**
 * Lesson Markdown Compiler v2
 */

import { Parser } from './parser.js';
import { Compiler } from './compiler.js';
import type { CompilerOptions, CompilerOutput } from './types.js';

export { Parser } from './parser.js';
export { Compiler } from './compiler.js';
export * from './types.js';
export * from './schema.js';

export async function compile(source: string, options: CompilerOptions = {}): Promise<CompilerOutput> {
  const parser = new Parser();
  const ast = await parser.parse(source);
  const compiler = new Compiler(options);
  return compiler.compile(ast);
}
