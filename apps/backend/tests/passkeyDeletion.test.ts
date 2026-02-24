import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

const tempDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })),
  );
  delete process.env.DATA_DIR;
});

describe('last passkey deletion behavior', () => {
  it('deletes user and sessions when final passkey is removed', async () => {
    const tempDirectory = await mkdtemp(path.join(os.tmpdir(), 'pklogin-last-passkey-'));
    tempDirectories.push(tempDirectory);
    process.env.DATA_DIR = tempDirectory;

    const { initializeDataStore } = await import('../src/storage/db.js');
    const {
      usersRepository,
      passkeysRepository,
      sessionsRepository,
    } = await import('../src/storage/repositories.js');
    const { PasskeyService } = await import('../src/services/passkeyService.js');

    await initializeDataStore();

    const now = new Date().toISOString();
    const user = {
      id: 'user-1',
      username: 'demoUser',
      usernameNormalized: 'demouser',
      createdAt: now,
    };

    await usersRepository.create(user);
    await passkeysRepository.create({
      id: 'passkey-1',
      userId: user.id,
      credentialId: 'credential-1',
      publicKey: Buffer.from('pubkey').toString('base64'),
      counter: 0,
      transports: [],
      label: 'Primary passkey',
      createdAt: now,
      lastUsedAt: null,
    });
    await sessionsRepository.upsert({
      id: 'session-1',
      userId: user.id,
      createdAt: now,
      updatedAt: now,
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
    });

    const service = new PasskeyService(300);
    const result = await service.deletePasskey({
      user,
      passkeyId: 'passkey-1',
    });

    expect(result.accountDeleted).toBe(true);
    expect(await usersRepository.findById(user.id)).toBeUndefined();
    expect(await passkeysRepository.listByUserId(user.id)).toEqual([]);
    expect(await sessionsRepository.list()).toEqual([]);
  });
});
