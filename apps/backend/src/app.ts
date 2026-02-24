import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import { env } from './config/env.js';
import { isAppError, toErrorResponse } from './lib/errors.js';
import { logError } from './lib/logger.js';
import { sessionMiddleware } from './middleware/session.js';
import { authRoutes } from './routes/authRoutes.js';
import { devRoutes } from './routes/devRoutes.js';
import { passkeyRoutes } from './routes/passkeyRoutes.js';
import { sessionRoutes } from './routes/sessionRoutes.js';

export function createApp(): express.Express {
  const app = express();

  app.use(cors({ origin: env.FRONTEND_ORIGIN, credentials: true }));
  app.use(cookieParser(env.SESSION_SECRET));
  app.use(express.json({ limit: '1mb' }));
  app.use(sessionMiddleware);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/session', sessionRoutes);
  app.use('/api/passkeys', passkeyRoutes);
  app.use('/api/dev', devRoutes);

  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (isAppError(error)) {
      res.status(error.status).json(toErrorResponse(error));
      return;
    }

    logError('unhandled_error', error);
    res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' });
  });

  return app;
}
