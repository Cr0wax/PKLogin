import express from 'express';

import { env } from '../config/env.js';
import { clearSessionCookie } from '../services/sessionService.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import {
  addPasskeyOptionsBodySchema,
  addPasskeyVerifyBodySchema,
  deletePasskeyParamsSchema,
} from '../schemas/passkeySchemas.js';
import { PasskeyService } from '../services/passkeyService.js';

const passkeyService = new PasskeyService(env.CHALLENGE_TTL_SECONDS);

export const passkeyRoutes = express.Router();

passkeyRoutes.use(requireAuth);

passkeyRoutes.get('/', async (req, res, next) => {
  try {
    const passkeys = await passkeyService.listForUser(req.currentUser!.id);
    res.json({ passkeys });
  } catch (error) {
    next(error);
  }
});

passkeyRoutes.post('/add/options', validateBody(addPasskeyOptionsBodySchema), async (req, res, next) => {
  try {
    const body = addPasskeyOptionsBodySchema.parse(req.body);
    const result = await passkeyService.startAddPasskey(req.currentUser!, body.label);
    res.json({
      challengeId: result.challengeId,
      options: result.options,
    });
  } catch (error) {
    next(error);
  }
});

passkeyRoutes.post('/add/verify', validateBody(addPasskeyVerifyBodySchema), async (req, res, next) => {
  try {
    const body = addPasskeyVerifyBodySchema.parse(req.body);
    const passkey = await passkeyService.finishAddPasskey({
      challengeId: body.challengeId,
      user: req.currentUser!,
      response: body.response,
    });

    res.json({ passkey });
  } catch (error) {
    next(error);
  }
});

passkeyRoutes.delete('/:passkeyId', validateParams(deletePasskeyParamsSchema), async (req, res, next) => {
  try {
    const { passkeyId } = deletePasskeyParamsSchema.parse(req.params);
    const result = await passkeyService.deletePasskey({ user: req.currentUser!, passkeyId });

    if (result.accountDeleted) {
      clearSessionCookie(res);
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});
