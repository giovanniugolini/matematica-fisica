/**
 * Lesson Markdown Compiler
 * 
 * Entry point principale
 */

import { Parser } from './parser.js';
import { Compiler } from './compiler.js';
import { formatError, formatWarning, formatSummary } from './utils.js';
import type { CompilerOptions, CompilerOutput } from './types.js';
import type { Lezione } from './schema.js';

export { Parser } from './parser.js';
export { Compiler } from './compiler.js';
export * from './types.js';
export * from './schema.js';
export * from './utils.js';

/**
 * Compile markdown source to Lezione JSON
 * 
 * @param source - Markdown source string
 * @param options - Compiler options
 * @returns Compilation result
 */
export async function compile(
  source: string,
  options: CompilerOptions = {}
): Promise<CompilerOutput> {
  const sourcePath = options.sourcePath || '<input>';
  
  // Parse markdown to AST
  const parser = new Parser(sourcePath);
  const ast = await parser.parse(source);

  // Compile AST to JSON
  const compiler = new Compiler(options);
  const result = compiler.compile(ast);

  return result;
}

/**
 * Compile and format output with colored console messages
 */
export async function compileWithReport(
  source: string,
  options: CompilerOptions = {}
): Promise<{ output: CompilerOutput; report: string }> {
  const result = await compile(source, options);
  const sourcePath = options.sourcePath || '<input>';
  const sourceLines = source.split('\n');

  const reportParts: string[] = [];

  // Errors
  for (const error of result.errors) {
    reportParts.push(formatError(error, sourcePath, sourceLines));
    reportParts.push('');
  }

  // Warnings
  for (const warning of result.warnings) {
    reportParts.push(formatWarning(warning, sourcePath, sourceLines));
    reportParts.push('');
  }

  // Summary
  reportParts.push(formatSummary(result.errors.length, result.warnings.length));

  return {
    output: result,
    report: reportParts.join('\n'),
  };
}

/**
 * Validate markdown without full compilation
 * Returns only errors and warnings
 */
export async function validate(
  source: string,
  options: CompilerOptions = {}
): Promise<{ valid: boolean; errors: CompilerOutput['errors']; warnings: CompilerOutput['warnings'] }> {
  const result = await compile(source, options);
  return {
    valid: result.success,
    errors: result.errors,
    warnings: result.warnings,
  };
}
