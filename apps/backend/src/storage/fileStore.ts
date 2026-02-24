import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { z } from 'zod';

import { AppError } from '../lib/errors.js';

export async function ensureDirectory(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}

export async function ensureJsonFile(filePath: string, defaultValue: unknown): Promise<void> {
  try {
    await readFile(filePath, 'utf8');
  } catch (error: unknown) {
    const isMissing = typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT';

    if (!isMissing) {
      throw error;
    }

    await writeJsonAtomic(filePath, defaultValue);
  }
}

export async function readJsonFile<T>(filePath: string, schema: z.ZodType<T>): Promise<T> {
  let raw: string;

  try {
    raw = await readFile(filePath, 'utf8');
  } catch (error) {
    throw new AppError(500, 'STORAGE_READ_ERROR', 'Failed to read storage file', {
      filePath,
      reason: error instanceof Error ? error.message : String(error),
    });
  }

  let parsedUnknown: unknown;
  try {
    parsedUnknown = JSON.parse(raw);
  } catch (error) {
    throw new AppError(500, 'STORAGE_PARSE_ERROR', 'Storage file contains invalid JSON', {
      filePath,
      reason: error instanceof Error ? error.message : String(error),
    });
  }

  const parsed = schema.safeParse(parsedUnknown);
  if (!parsed.success) {
    throw new AppError(500, 'STORAGE_SCHEMA_ERROR', 'Storage file does not match expected schema', {
      filePath,
      issues: parsed.error.issues,
    });
  }

  return parsed.data;
}

export async function writeJsonAtomic(filePath: string, value: unknown): Promise<void> {
  const directory = path.dirname(filePath);
  const tempFilePath = `${filePath}.tmp`;

  await ensureDirectory(directory);
  await writeFile(tempFilePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await rename(tempFilePath, filePath);
}
