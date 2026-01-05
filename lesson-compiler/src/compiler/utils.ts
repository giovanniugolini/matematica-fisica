/**
 * Utilities per il compilatore
 */

import type { CompilerError, CompilerWarning } from './types.js';

export function formatError(error: CompilerError, sourcePath: string, sourceLines?: string[]): string {
  const parts: string[] = [`error[${error.code}]: ${error.message}`];
  if (error.location) {
    parts.push(`  --> ${sourcePath}:${error.location.start.line}:${error.location.start.column}`);
  }
  if (error.help) {
    parts.push(`   = help: ${error.help}`);
  }
  return parts.join('\n');
}

export function formatWarning(warning: CompilerWarning, sourcePath: string): string {
  const parts: string[] = [`warning[${warning.code}]: ${warning.message}`];
  if (warning.location) {
    parts.push(`  --> ${sourcePath}:${warning.location.start.line}:${warning.location.start.column}`);
  }
  return parts.join('\n');
}

export function formatSummary(errorCount: number, warningCount: number): string {
  if (errorCount === 0 && warningCount === 0) return 'Compilation successful';
  const parts: string[] = [];
  if (errorCount > 0) parts.push(`${errorCount} error(s)`);
  if (warningCount > 0) parts.push(`${warningCount} warning(s)`);
  return `Compilation failed: ${parts.join(', ')}`;
}
