import type { NextFunction, Request, Response } from 'express';

import { env } from '../config/env.js';
import { refreshSession, setSessionCookie } from '../services/sessionService.js';
import { sessionsRepository, usersRepository } from '../storage/repositories.js';

export async function sessionMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const sessionId = req.cookies?.[env.SESSION_COOKIE_NAME] as string | undefined;

  if (!sessionId) {
    next();
    return;
  }

  const session = await sessionsRepository.findById(sessionId);
  if (!session) {
    next();
    return;
  }

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    await sessionsRepository.deleteById(session.id);
    next();
    return;
  }

  const user = await usersRepository.findById(session.userId);
  if (!user) {
    await sessionsRepository.deleteById(session.id);
    next();
    return;
  }

  const refreshed = await refreshSession(session);
  setSessionCookie(res, refreshed.id);

  req.sessionId = refreshed.id;
  req.sessionRecord = refreshed;
  req.currentUser = user;

  next();
}
