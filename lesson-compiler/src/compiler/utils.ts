/**
 * Utilities per il compilatore
 */

import type { CompilerError, CompilerWarning, SourceRange } from './types.js';

/**
 * Format error message with source location
 */
export function formatError(
  error: CompilerError,
  sourcePath: string,
  sourceLines?: string[]
): string {
  const parts: string[] = [];

  // Error header
  parts.push(`error[${error.code}]: ${error.message}`);

  // Location
  if (error.location) {
    const { start } = error.location;
    parts.push(`  --> ${sourcePath}:${start.line}:${start.column}`);

    // Source context
    if (sourceLines && start.line <= sourceLines.length) {
      const lineNum = start.line;
      const line = sourceLines[lineNum - 1];
      const lineNumStr = String(lineNum).padStart(3, ' ');
      
      parts.push(`   |`);
      parts.push(`${lineNumStr} | ${line}`);
      parts.push(`   | ${' '.repeat(start.column - 1)}^`);
    }
  }

  // Help text
  if (error.help) {
    parts.push(`   = help: ${error.help}`);
  }

  return parts.join('\n');
}

/**
 * Format warning message
 */
export function formatWarning(
  warning: CompilerWarning,
  sourcePath: string,
  sourceLines?: string[]
): string {
  const parts: string[] = [];

  parts.push(`warning[${warning.code}]: ${warning.message}`);

  if (warning.location) {
    const { start } = warning.location;
    parts.push(`  --> ${sourcePath}:${start.line}:${start.column}`);

    if (sourceLines && start.line <= sourceLines.length) {
      const lineNum = start.line;
      const line = sourceLines[lineNum - 1];
      const lineNumStr = String(lineNum).padStart(3, ' ');
      
      parts.push(`   |`);
      parts.push(`${lineNumStr} | ${line}`);
    }
  }

  if (warning.help) {
    parts.push(`   = help: ${warning.help}`);
  }

  return parts.join('\n');
}

/**
 * Format compilation summary
 */
export function formatSummary(
  errorCount: number,
  warningCount: number
): string {
  const parts: string[] = [];

  if (errorCount > 0) {
    parts.push(`${errorCount} error${errorCount !== 1 ? 's' : ''}`);
  }

  if (warningCount > 0) {
    parts.push(`${warningCount} warning${warningCount !== 1 ? 's' : ''}`);
  }

  if (parts.length === 0) {
    return 'Compilation successful';
  }

  return `Compilation failed: ${parts.join(', ')}`;
}

/**
 * Generate unique ID for slide
 */
export function generateSlideId(index: number, title?: string): string {
  if (title) {
    // Slugify title
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    if (slug) {
      return `slide-${slug}`;
    }
  }
  return `slide-${index + 1}`;
}

/**
 * Check if a string contains LaTeX
 */
export function containsLatex(text: string): boolean {
  return /\$[^$]+\$|\$\$[^$]+\$\$/.test(text);
}

/**
 * Extract inline LaTeX from text
 */
export function extractInlineLatex(text: string): Array<{ match: string; latex: string; start: number; end: number }> {
  const results: Array<{ match: string; latex: string; start: number; end: number }> = [];
  const regex = /\$([^$]+)\$/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    results.push({
      match: match[0],
      latex: match[1],
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  return results;
}
