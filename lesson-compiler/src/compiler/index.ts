/**
 * Lesson Markdown Compiler - Entry point
 */

import { Parser } from './parser.js';
import { Compiler } from './compiler.js';
import type { CompilerOptions, CompilerOutput } from './types.js';

export { Parser } from './parser.js';
export { Compiler } from './compiler.js';
export * from './types.js';
export * from './schema.js';
export * from './utils.js';

export async function compile(source: string, options: CompilerOptions = {}): Promise<CompilerOutput> {
  const parser = new Parser(options.sourcePath || '<input>');
  const ast = await parser.parse(source);
  const compiler = new Compiler(options);
  return compiler.compile(ast);
}

export async function compileWithReport(source: string, options: CompilerOptions = {}): Promise<{ output: CompilerOutput; report: string }> {
  const result = await compile(source, options);
  const reportParts: string[] = [];
  
  for (const error of result.errors) {
    reportParts.push(`error[${error.code}]: ${error.message}`);
  }
  for (const warning of result.warnings) {
    reportParts.push(`warning[${warning.code}]: ${warning.message}`);
  }
  
  return { output: result, report: reportParts.join('\n') };
}
