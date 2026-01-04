#!/usr/bin/env node
/**
 * CLI Script - Compile lesson markdown files to JSON
 * 
 * Usage:
 *   npm run compile:lessons              # Compile all .md files
 *   npm run compile:lessons -- --watch   # Watch mode
 *   npm run compile:lessons -- file.md   # Compile single file
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { resolve, basename, dirname, join } from 'path';
import { glob } from 'glob';
import chalk from 'chalk';
import chokidar from 'chokidar';

import { compile, compileWithReport } from '../src/compiler/index.js';
import type { CompilerOptions } from '../src/compiler/types.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

interface Config {
  inputDir: string;
  outputDir: string;
  watch: boolean;
  verbose: boolean;
  strict: boolean;
}

function parseArgs(): Config {
  const args = process.argv.slice(2);
  
  return {
    inputDir: process.env.INPUT_DIR || './src/lessons/md',
    outputDir: process.env.OUTPUT_DIR || './src/lessons/data',
    watch: args.includes('--watch') || args.includes('-w'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    strict: args.includes('--strict'),
  };
}

// ============================================================================
// COMPILATION
// ============================================================================

async function compileFile(
  inputPath: string,
  outputPath: string,
  options: CompilerOptions
): Promise<boolean> {
  const startTime = Date.now();
  
  try {
    // Read source
    const source = await readFile(inputPath, 'utf-8');
    
    // Compile
    const { output, report } = await compileWithReport(source, {
      ...options,
      sourcePath: inputPath,
    });

    // Print report
    if (output.errors.length > 0 || output.warnings.length > 0) {
      console.log(report);
    }

    if (!output.success || !output.lesson) {
      console.log(chalk.red(`✗ ${inputPath}`));
      return false;
    }

    // Ensure output directory exists
    const outputDir = dirname(outputPath);
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true });
    }

    // Write JSON
    const json = JSON.stringify(output.lesson, null, 2);
    await writeFile(outputPath, json, 'utf-8');

    const duration = Date.now() - startTime;
    console.log(chalk.green(`✓ ${inputPath}`) + chalk.gray(` → ${outputPath} (${duration}ms)`));
    
    if (output.warnings.length > 0) {
      console.log(chalk.yellow(`  ${output.warnings.length} warning(s)`));
    }

    return true;

  } catch (error) {
    console.log(chalk.red(`✗ ${inputPath}`));
    console.error(chalk.red(`  Error: ${(error as Error).message}`));
    return false;
  }
}

async function compileAll(config: Config): Promise<{ success: number; failed: number }> {
  console.log(chalk.blue('\n📚 Lesson Markdown Compiler\n'));
  
  // Find all .md files
  const pattern = join(config.inputDir, '**/*.md');
  const files = await glob(pattern);

  if (files.length === 0) {
    console.log(chalk.yellow(`No .md files found in ${config.inputDir}`));
    return { success: 0, failed: 0 };
  }

  console.log(chalk.gray(`Found ${files.length} file(s) to compile\n`));

  const options: CompilerOptions = {
    strict: config.strict,
  };

  let success = 0;
  let failed = 0;

  for (const inputPath of files) {
    // Generate output path
    const relativePath = inputPath.replace(config.inputDir, '').replace(/^\//, '');
    const outputPath = join(
      config.outputDir,
      relativePath.replace(/\.md$/, '.json')
    );

    const ok = await compileFile(inputPath, outputPath, options);
    if (ok) {
      success++;
    } else {
      failed++;
    }
  }

  // Summary
  console.log('');
  if (failed === 0) {
    console.log(chalk.green(`✓ All ${success} file(s) compiled successfully`));
  } else {
    console.log(chalk.red(`✗ ${failed} file(s) failed, ${success} succeeded`));
  }

  return { success, failed };
}

// ============================================================================
// WATCH MODE
// ============================================================================

function startWatchMode(config: Config): void {
  console.log(chalk.blue('\n👀 Watch mode started\n'));
  console.log(chalk.gray(`Watching ${config.inputDir} for changes...\n`));

  const watcher = chokidar.watch(join(config.inputDir, '**/*.md'), {
    persistent: true,
    ignoreInitial: true,
  });

  const options: CompilerOptions = {
    strict: config.strict,
  };

  const handleChange = async (inputPath: string) => {
    const relativePath = inputPath.replace(config.inputDir, '').replace(/^\//, '');
    const outputPath = join(
      config.outputDir,
      relativePath.replace(/\.md$/, '.json')
    );

    console.log(chalk.gray(`\nFile changed: ${inputPath}`));
    await compileFile(inputPath, outputPath, options);
  };

  watcher.on('change', handleChange);
  watcher.on('add', handleChange);

  watcher.on('unlink', (path) => {
    console.log(chalk.yellow(`\nFile deleted: ${path}`));
  });

  // Keep process alive
  process.on('SIGINT', () => {
    console.log(chalk.gray('\n\nStopping watch mode...'));
    watcher.close();
    process.exit(0);
  });
}

// ============================================================================
// MAIN
// ============================================================================

async function main(): Promise<void> {
  const config = parseArgs();

  // Initial compilation
  const { failed } = await compileAll(config);

  // Start watch mode if requested
  if (config.watch) {
    startWatchMode(config);
  } else {
    process.exit(failed > 0 ? 1 : 0);
  }
}

main().catch((error) => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});
