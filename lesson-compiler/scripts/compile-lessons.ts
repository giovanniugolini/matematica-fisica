#!/usr/bin/env node
/**
 * CLI Script - Compile lesson markdown files to JSON
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { glob } from 'glob';
import chalk from 'chalk';
import chokidar from 'chokidar';

import { compile } from '../src/compiler/index.js';

interface Config {
  inputDir: string;
  outputDir: string;
  watch: boolean;
}

function parseArgs(): Config {
  const args = process.argv.slice(2);
  return {
    inputDir: process.env.INPUT_DIR || './src/lessons/md',
    outputDir: process.env.OUTPUT_DIR || './src/lessons/data',
    watch: args.includes('--watch') || args.includes('-w'),
  };
}

async function compileFile(inputPath: string, outputPath: string): Promise<boolean> {
  try {
    const source = await readFile(inputPath, 'utf-8');
    const result = await compile(source, { sourcePath: inputPath });

    for (const error of result.errors) {
      console.log(chalk.red(`  error[${error.code}]: ${error.message}`));
    }

    if (!result.success || !result.lesson) {
      console.log(chalk.red(`✗ ${inputPath}`));
      return false;
    }

    const outputDir = dirname(outputPath);
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true });
    }

    await writeFile(outputPath, JSON.stringify(result.lesson, null, 2), 'utf-8');
    console.log(chalk.green(`✓ ${inputPath}`) + chalk.gray(` → ${outputPath}`));
    return true;
  } catch (error) {
    console.log(chalk.red(`✗ ${inputPath}: ${(error as Error).message}`));
    return false;
  }
}

async function compileAll(config: Config): Promise<{ success: number; failed: number }> {
  console.log(chalk.blue('\n📚 Lesson Markdown Compiler\n'));
  
  const files = await glob(join(config.inputDir, '**/*.md'));
  if (files.length === 0) {
    console.log(chalk.yellow(`No .md files found in ${config.inputDir}`));
    return { success: 0, failed: 0 };
  }

  console.log(chalk.gray(`Found ${files.length} file(s)\n`));

  let success = 0, failed = 0;
  for (const inputPath of files) {
    const outputPath = join(config.outputDir, inputPath.replace(config.inputDir, '').replace(/^\//, '').replace(/\.md$/, '.json'));
    if (await compileFile(inputPath, outputPath)) success++; else failed++;
  }

  console.log(failed === 0 ? chalk.green(`\n✓ All ${success} file(s) compiled`) : chalk.red(`\n✗ ${failed} failed, ${success} succeeded`));
  return { success, failed };
}

function startWatchMode(config: Config): void {
  console.log(chalk.blue('\n👀 Watch mode\n'));
  const watcher = chokidar.watch(join(config.inputDir, '**/*.md'), { persistent: true, ignoreInitial: true });
  
  watcher.on('change', async (inputPath) => {
    const outputPath = join(config.outputDir, inputPath.replace(config.inputDir, '').replace(/^\//, '').replace(/\.md$/, '.json'));
    await compileFile(inputPath, outputPath);
  });

  process.on('SIGINT', () => { watcher.close(); process.exit(0); });
}

async function main(): Promise<void> {
  const config = parseArgs();
  const { failed } = await compileAll(config);
  if (config.watch) startWatchMode(config);
  else process.exit(failed > 0 ? 1 : 0);
}

main().catch(console.error);
