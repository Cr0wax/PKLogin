import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';
import { z } from 'zod';

import { readJsonFile, writeJsonAtomic } from '../src/storage/fileStore.js';

const tempDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe('fileStore', () => {
  it('writes and reads json values atomically', async () => {
    const tempDirectory = await mkdtemp(path.join(os.tmpdir(), 'pklogin-file-store-'));
    tempDirectories.push(tempDirectory);

    const filePath = path.join(tempDirectory, 'sample.json');
    const expected = [{ id: 'item-1', value: 42 }];

    await writeJsonAtomic(filePath, expected);

    const parsed = await readJsonFile(
      filePath,
      z.array(
        z.object({
          id: z.string(),
          value: z.number(),
        }),
      ),
    );

    expect(parsed).toEqual(expected);
  });

  it('fails fast when json schema does not match expected structure', async () => {
    const tempDirectory = await mkdtemp(path.join(os.tmpdir(), 'pklogin-file-schema-'));
    tempDirectories.push(tempDirectory);

    const filePath = path.join(tempDirectory, 'invalid.json');
    await writeJsonAtomic(filePath, { value: 'not-an-array' });

    await expect(readJsonFile(filePath, z.array(z.string()))).rejects.toMatchObject({
      code: 'STORAGE_SCHEMA_ERROR',
    });
  });
});
