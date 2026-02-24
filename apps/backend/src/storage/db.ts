import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ensureDirectory, ensureJsonFile } from './fileStore.js';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(currentDirectory, '../../../../');

export const dataDirectoryPath = path.resolve(repositoryRoot, 'data');

export const dataFilePaths = {
  users: path.join(dataDirectoryPath, 'users.json'),
  passkeys: path.join(dataDirectoryPath, 'passkeys.json'),
  sessions: path.join(dataDirectoryPath, 'sessions.json'),
  challenges: path.join(dataDirectoryPath, 'challenges.json'),
} as const;

export async function initializeDataStore(): Promise<void> {
  await ensureDirectory(dataDirectoryPath);
  await Promise.all([
    ensureJsonFile(dataFilePaths.users, []),
    ensureJsonFile(dataFilePaths.passkeys, []),
    ensureJsonFile(dataFilePaths.sessions, []),
    ensureJsonFile(dataFilePaths.challenges, []),
  ]);
}
