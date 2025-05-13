#!/usr/bin/env node
import { spawn } from 'child_process';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOGS_DIR = join(__dirname, '..', 'logs');
const LOG_FILE = join(LOGS_DIR, `typecheck-${new Date().toISOString().split('T')[0]}.log`);

interface TypeError {
  file: string;
  line: number;
  column: number;
  message: string;
}

interface ErrorSummary {
  total: number;
  byFile: Map<string, number>;
  errors: TypeError[];
}

async function ensureLogsDirectory() {
  if (!existsSync(LOGS_DIR)) {
    await mkdir(LOGS_DIR, { recursive: true });
    await writeFile(join(LOGS_DIR, '.gitkeep'), '');
  }
}

async function getLastLog(): Promise<ErrorSummary | null> {
  try {
    const files = await readFile(LOG_FILE, 'utf-8');
    const errors: TypeError[] = [];
    const byFile = new Map<string, number>();

    files.split('\n').forEach(line => {
      if (line.trim()) {
        const match = line.match(/^(.+?)\((\d+),(\d+)\): (.+)$/);
        if (match) {
          const [_, file, line, column, message] = match;
          errors.push({
            file,
            line: parseInt(line),
            column: parseInt(column),
            message
          });
          byFile.set(file, (byFile.get(file) || 0) + 1);
        }
      }
    });

    return {
      total: errors.length,
      byFile,
      errors
    };
  } catch {
    return null;
  }
}

function parseTscOutput(output: string): ErrorSummary {
  const errors: TypeError[] = [];
  const byFile = new Map<string, number>();

  output.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('Found')) {
      const match = line.match(/^(.+?)\((\d+),(\d+)\): (.+)$/);
      if (match) {
        const [_, file, line, column, message] = match;
        errors.push({
          file,
          line: parseInt(line),
          column: parseInt(column),
          message
        });
        byFile.set(file, (byFile.get(file) || 0) + 1);
      }
    }
  });

  return {
    total: errors.length,
    byFile,
    errors
  };
}

function getNewErrors(current: ErrorSummary, previous: ErrorSummary | null): ErrorSummary {
  if (!previous) return current;

  const newErrors: TypeError[] = [];
  const byFile = new Map<string, number>();

  current.errors.forEach(error => {
    const isNew = !previous.errors.some(
      prev => 
        prev.file === error.file &&
        prev.line === error.line &&
        prev.column === error.column &&
        prev.message === error.message
    );

    if (isNew) {
      newErrors.push(error);
      byFile.set(error.file, (byFile.get(error.file) || 0) + 1);
    }
  });

  return {
    total: newErrors.length,
    byFile,
    errors: newErrors
  };
}

function printSummary(summary: ErrorSummary, showAll: boolean = false) {
  console.log('\n=== TypeScript Error Summary ===');
  console.log(`Total errors: ${summary.total}`);

  if (summary.total > 0) {
    console.log('\nErrors by file:');
    summary.byFile.forEach((count, file) => {
      console.log(`  ${file}: ${count} errors`);
    });

    if (showAll) {
      console.log('\nDetailed errors:');
      summary.errors.forEach(error => {
        console.log(`  ${error.file}(${error.line},${error.column}): ${error.message}`);
      });
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const showAll = args.includes('--all');
  const projectIndex = args.indexOf('--project');
  const projectArg = projectIndex !== -1 ? args.slice(projectIndex, projectIndex + 2) : [];
  const otherArgs = args.filter(arg => arg !== '--all' && !projectArg.includes(arg));

  await ensureLogsDirectory();

  const tsc = spawn('tsc', [
    '--watch',
    '--noEmit',
    ...projectArg,
    ...otherArgs
  ], {
    stdio: ['inherit', 'pipe', 'pipe']
  });

  let buffer = '';
  let lastSummary: ErrorSummary | null = null;

  tsc.stdout.on('data', async (data) => {
    const output = data.toString();
    buffer += output;
    process.stdout.write(output);

    if (output.includes('Found')) {
      const currentSummary = parseTscOutput(buffer);
      const previousSummary = await getLastLog();
      const newErrors = getNewErrors(currentSummary, previousSummary);

      console.log('\n=== New Errors ===');
      printSummary(newErrors, showAll);

      if (previousSummary) {
        const diff = currentSummary.total - previousSummary.total;
        console.log(`\nProgress: ${diff > 0 ? '+' : ''}${diff} errors`);
      }

      await writeFile(LOG_FILE, buffer);
      lastSummary = currentSummary;
      buffer = '';
    }
  });

  tsc.stderr.on('data', (data) => {
    process.stderr.write(data);
  });

  tsc.on('close', (code) => {
    process.exit(code || 0);
  });
}

main().catch(console.error); 