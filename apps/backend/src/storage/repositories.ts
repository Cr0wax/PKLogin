import { z } from 'zod';

import type { ChallengeRecord, SessionRecord, StoredPasskey, User } from '../types/domain.js';
import { dataFilePaths } from './db.js';
import { readJsonFile, writeJsonAtomic } from './fileStore.js';

const userSchema = z.object({
  id: z.string().min(1),
  username: z.string().min(1),
  usernameNormalized: z.string().min(1),
  createdAt: z.string().min(1),
});

const passkeySchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  credentialId: z.string().min(1),
  publicKey: z.string().min(1),
  counter: z.number().int().nonnegative(),
  transports: z.array(z.string()),
  label: z.string().min(1),
  createdAt: z.string().min(1),
  lastUsedAt: z.string().nullable(),
});

const sessionSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  expiresAt: z.string().min(1),
});

const challengeSchema = z.object({
  id: z.string().min(1),
  type: z.union([z.literal('registration'), z.literal('authentication')]),
  flow: z.union([z.literal('passkey-only'), z.literal('username-passkey'), z.literal('account-add')]),
  challenge: z.string().min(1),
  createdAt: z.string().min(1),
  expiresAt: z.string().min(1),
  userId: z.string().nullable(),
  pendingUserId: z.string().nullable(),
  username: z.string().nullable(),
  usernameNormalized: z.string().nullable(),
  label: z.string().nullable(),
  expectedCredentialIds: z.array(z.string()).nullable(),
});

const usersSchema = z.array(userSchema);
const passkeysSchema = z.array(passkeySchema);
const sessionsSchema = z.array(sessionSchema);
const challengesSchema = z.array(challengeSchema);

async function readUsers(): Promise<User[]> {
  return readJsonFile(dataFilePaths.users, usersSchema);
}

async function writeUsers(users: User[]): Promise<void> {
  await writeJsonAtomic(dataFilePaths.users, users);
}

async function readPasskeys(): Promise<StoredPasskey[]> {
  return readJsonFile(dataFilePaths.passkeys, passkeysSchema);
}

async function writePasskeys(passkeys: StoredPasskey[]): Promise<void> {
  await writeJsonAtomic(dataFilePaths.passkeys, passkeys);
}

async function readSessions(): Promise<SessionRecord[]> {
  return readJsonFile(dataFilePaths.sessions, sessionsSchema);
}

async function writeSessions(sessions: SessionRecord[]): Promise<void> {
  await writeJsonAtomic(dataFilePaths.sessions, sessions);
}

async function readChallenges(): Promise<ChallengeRecord[]> {
  return readJsonFile(dataFilePaths.challenges, challengesSchema);
}

async function writeChallenges(challenges: ChallengeRecord[]): Promise<void> {
  await writeJsonAtomic(dataFilePaths.challenges, challenges);
}

export const usersRepository = {
  async list(): Promise<User[]> {
    return readUsers();
  },
  async findById(userId: string): Promise<User | undefined> {
    const users = await readUsers();
    return users.find((entry) => entry.id === userId);
  },
  async findByUsernameNormalized(usernameNormalized: string): Promise<User | undefined> {
    const users = await readUsers();
    return users.find((entry) => entry.usernameNormalized === usernameNormalized);
  },
  async create(user: User): Promise<void> {
    const users = await readUsers();
    users.push(user);
    await writeUsers(users);
  },
  async deleteById(userId: string): Promise<void> {
    const users = await readUsers();
    const filtered = users.filter((entry) => entry.id !== userId);
    await writeUsers(filtered);
  },
};

export const passkeysRepository = {
  async list(): Promise<StoredPasskey[]> {
    return readPasskeys();
  },
  async listByUserId(userId: string): Promise<StoredPasskey[]> {
    const passkeys = await readPasskeys();
    return passkeys.filter((entry) => entry.userId === userId);
  },
  async findById(passkeyId: string): Promise<StoredPasskey | undefined> {
    const passkeys = await readPasskeys();
    return passkeys.find((entry) => entry.id === passkeyId);
  },
  async findByCredentialId(credentialId: string): Promise<StoredPasskey | undefined> {
    const passkeys = await readPasskeys();
    return passkeys.find((entry) => entry.credentialId === credentialId);
  },
  async create(passkey: StoredPasskey): Promise<void> {
    const passkeys = await readPasskeys();
    passkeys.push(passkey);
    await writePasskeys(passkeys);
  },
  async update(passkey: StoredPasskey): Promise<void> {
    const passkeys = await readPasskeys();
    const index = passkeys.findIndex((entry) => entry.id === passkey.id);
    if (index >= 0) {
      passkeys[index] = passkey;
      await writePasskeys(passkeys);
    }
  },
  async deleteById(passkeyId: string): Promise<void> {
    const passkeys = await readPasskeys();
    const filtered = passkeys.filter((entry) => entry.id !== passkeyId);
    await writePasskeys(filtered);
  },
  async deleteByUserId(userId: string): Promise<void> {
    const passkeys = await readPasskeys();
    const filtered = passkeys.filter((entry) => entry.userId !== userId);
    await writePasskeys(filtered);
  },
};

export const sessionsRepository = {
  async list(): Promise<SessionRecord[]> {
    return readSessions();
  },
  async findById(sessionId: string): Promise<SessionRecord | undefined> {
    const sessions = await readSessions();
    return sessions.find((entry) => entry.id === sessionId);
  },
  async upsert(session: SessionRecord): Promise<void> {
    const sessions = await readSessions();
    const index = sessions.findIndex((entry) => entry.id === session.id);
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.push(session);
    }
    await writeSessions(sessions);
  },
  async deleteById(sessionId: string): Promise<void> {
    const sessions = await readSessions();
    const filtered = sessions.filter((entry) => entry.id !== sessionId);
    await writeSessions(filtered);
  },
  async deleteByUserId(userId: string): Promise<void> {
    const sessions = await readSessions();
    const filtered = sessions.filter((entry) => entry.userId !== userId);
    await writeSessions(filtered);
  },
  async deleteExpired(nowIso: string): Promise<void> {
    const now = new Date(nowIso).getTime();
    const sessions = await readSessions();
    const filtered = sessions.filter((entry) => new Date(entry.expiresAt).getTime() > now);
    await writeSessions(filtered);
  },
};

export const challengesRepository = {
  async list(): Promise<ChallengeRecord[]> {
    return readChallenges();
  },
  async findById(challengeId: string): Promise<ChallengeRecord | undefined> {
    const challenges = await readChallenges();
    return challenges.find((entry) => entry.id === challengeId);
  },
  async upsert(challenge: ChallengeRecord): Promise<void> {
    const challenges = await readChallenges();
    const index = challenges.findIndex((entry) => entry.id === challenge.id);
    if (index >= 0) {
      challenges[index] = challenge;
    } else {
      challenges.push(challenge);
    }
    await writeChallenges(challenges);
  },
  async deleteById(challengeId: string): Promise<void> {
    const challenges = await readChallenges();
    const filtered = challenges.filter((entry) => entry.id !== challengeId);
    await writeChallenges(filtered);
  },
  async deleteExpired(nowIso: string): Promise<void> {
    const now = new Date(nowIso).getTime();
    const challenges = await readChallenges();
    const filtered = challenges.filter((entry) => new Date(entry.expiresAt).getTime() > now);
    await writeChallenges(filtered);
  },
  async clearAll(): Promise<void> {
    await writeChallenges([]);
  },
};
