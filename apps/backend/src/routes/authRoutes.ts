import express from 'express';

import { env } from '../config/env.js';
import { AppError } from '../lib/errors.js';
import { logEvent } from '../lib/logger.js';
import { validateBody } from '../middleware/validate.js';
import {
  loginOptionsBodySchema,
  loginVerifyBodySchema,
  registerOptionsBodySchema,
  registerVerifyBodySchema,
} from '../schemas/authSchemas.js';
import { AuthService } from '../services/authService.js';
import { createSession, setSessionCookie } from '../services/sessionService.js';

const authService = new AuthService(env.CHALLENGE_TTL_SECONDS);

export const authRoutes = express.Router();

authRoutes.post('/register/options', validateBody(registerOptionsBodySchema), async (req, res, next) => {
  try {
    const body = registerOptionsBodySchema.parse(req.body);
    const flow = body.flow ?? 'passkey-only';
    const result = await authService.startRegistration({
      username: body.username,
      label: body.label,
      flow,
    });

    res.json({
      challengeId: result.challengeId,
      options: result.options,
    });
  } catch (error) {
    next(error);
  }
});

authRoutes.post('/register/verify', validateBody(registerVerifyBodySchema), async (req, res, next) => {
  try {
    const body = registerVerifyBodySchema.parse(req.body);
    const result = await authService.finishRegistration({
      challengeId: body.challengeId,
      response: body.response,
    });

    const session = await createSession(result.user.id);
    setSessionCookie(res, session.id);

    res.json({
      user: result.user,
      passkey: result.passkey,
    });
  } catch (error) {
    logEvent('registration_failed', {
      reason: error instanceof Error ? error.message : String(error),
    });
    next(error);
  }
});

authRoutes.post('/login/options', validateBody(loginOptionsBodySchema), async (req, res, next) => {
  try {
    const body = loginOptionsBodySchema.parse(req.body);
    const flow = body.flow ?? 'passkey-only';

    if (flow === 'username-passkey' && !body.username) {
      throw new AppError(400, 'USERNAME_REQUIRED', 'Username is required for username + passkey flow');
    }

    const result = await authService.startAuthentication({
      flow,
      username: body.username,
    });

    res.json({
      challengeId: result.challengeId,
      options: result.options,
    });
  } catch (error) {
    next(error);
  }
});

authRoutes.post('/login/verify', validateBody(loginVerifyBodySchema), async (req, res, next) => {
  try {
    const body = loginVerifyBodySchema.parse(req.body);
    const result = await authService.finishAuthentication({
      challengeId: body.challengeId,
      response: body.response,
    });

    const session = await createSession(result.user.id);
    setSessionCookie(res, session.id);

    res.json({
      user: result.user,
    });
  } catch (error) {
    logEvent('authentication_failed', {
      reason: error instanceof Error ? error.message : String(error),
    });
    next(error);
  }
});
