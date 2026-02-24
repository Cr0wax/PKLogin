import type { NextFunction, Request, Response } from 'express';

import { env } from '../config/env.js';
import { sessionsRepository, usersRepository } from '../storage/repositories.js';

export async function sessionMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const sessionId = req.cookies?.[env.SESSION_COOKIE_NAME] as string | undefined;

  if (!sessionId) {
    next();
    return;
  }

  const session = await sessionsRepository.findById(sessionId);
  if (!session) {
    res.clearCookie(env.SESSION_COOKIE_NAME);
    next();
    return;
  }

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    await sessionsRepository.deleteById(session.id);
    res.clearCookie(env.SESSION_COOKIE_NAME);
    next();
    return;
  }

  const user = await usersRepository.findById(session.userId);
  if (!user) {
    await sessionsRepository.deleteById(session.id);
    res.clearCookie(env.SESSION_COOKIE_NAME);
    next();
    return;
  }

  req.sessionId = session.id;
  req.sessionRecord = session;
  req.currentUser = user;

  next();
}
