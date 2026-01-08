#!/usr/bin/env node
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { glob } from 'glob';
import chalk from 'chalk';

import { compile } from '../src/compiler/index.js';

async function compileFile(inputPath: string, outputPath: string): Promise<boolean> {
  try {
    const source = await readFile(inputPath, 'utf-8');
    const result = await compile(source, { sourcePath: inputPath });

    for (const error of result.errors) {
      console.log(chalk.red(`  error[${error.code}]: ${error.message}`));
    }
    for (const warning of result.warnings) {
      console.log(chalk.yellow(`  warning[${warning.code}]: ${warning.message}`));
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

async function main(): Promise<void> {
  const inputDir = process.env.INPUT_DIR || './examples/md';
  const outputDir = process.env.OUTPUT_DIR || './output';
  
  console.log(chalk.blue('\n📚 Lesson Markdown Compiler v2\n'));
  
  const files = await glob(join(inputDir, '**/*.md'));
  if (files.length === 0) {
    console.log(chalk.yellow(`No .md files found in ${inputDir}`));
    return;
  }

  console.log(chalk.gray(`Found ${files.length} file(s)\n`));

  let success = 0, failed = 0;
  for (const inputPath of files) {
    const outputPath = join(outputDir, inputPath.replace(inputDir, '').replace(/^\//, '').replace(/\.md$/, '.json'));
    if (await compileFile(inputPath, outputPath)) success++; else failed++;
  }

  console.log(failed === 0 
    ? chalk.green(`\n✓ All ${success} file(s) compiled`) 
    : chalk.red(`\n✗ ${failed} failed, ${success} succeeded`));
  
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(console.error);
