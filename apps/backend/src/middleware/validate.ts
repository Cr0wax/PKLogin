import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ZodType } from 'zod';

import { AppError } from '../lib/errors.js';

export function validateBody<T>(schema: ZodType<T>): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      next(new AppError(400, 'VALIDATION_ERROR', 'Request body is invalid', parsed.error.issues));
      return;
    }

    req.body = parsed.data;
    next();
  };
}
