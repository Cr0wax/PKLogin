import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../lib/errors.js';

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!req.currentUser || !req.sessionRecord || !req.sessionId) {
    next(new AppError(401, 'UNAUTHORIZED', 'Authentication is required'));
    return;
  }

  next();
}
