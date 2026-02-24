import type { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { env } from '../config/env.js';
import { sessionsRepository } from '../storage/repositories.js';
import type { SessionRecord } from '../types/domain.js';

function createExpiryDate(now: Date): Date {
  return new Date(now.getTime() + env.SESSION_TTL_HOURS * 60 * 60 * 1000);
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: env.NODE_ENV === 'production',
    path: '/',
    maxAge: env.SESSION_TTL_HOURS * 60 * 60 * 1000,
  };
}

export async function createSession(userId: string): Promise<SessionRecord> {
  const now = new Date();
  const nowIso = now.toISOString();
  const session: SessionRecord = {
    id: uuidv4(),
    userId,
    createdAt: nowIso,
    updatedAt: nowIso,
    expiresAt: createExpiryDate(now).toISOString(),
  };

  await sessionsRepository.upsert(session);
  return session;
}

export async function refreshSession(session: SessionRecord): Promise<SessionRecord> {
  const now = new Date();
  const refreshed: SessionRecord = {
    ...session,
    updatedAt: now.toISOString(),
    expiresAt: createExpiryDate(now).toISOString(),
  };

  await sessionsRepository.upsert(refreshed);
  return refreshed;
}

export async function destroySession(sessionId: string): Promise<void> {
  await sessionsRepository.deleteById(sessionId);
}

export function setSessionCookie(response: Response, sessionId: string): void {
  response.cookie(env.SESSION_COOKIE_NAME, sessionId, cookieOptions());
}

export function clearSessionCookie(response: Response): void {
  response.clearCookie(env.SESSION_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    path: '/',
  });
}
