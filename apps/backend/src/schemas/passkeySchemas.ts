import { z } from 'zod';

import { passkeyLabelSchema } from './commonSchemas.js';

const credentialResponseSchema = z.record(z.any());

export const addPasskeyOptionsBodySchema = z.object({
  label: passkeyLabelSchema,
});

export const addPasskeyVerifyBodySchema = z.object({
  challengeId: z.string().uuid(),
  response: credentialResponseSchema,
});

export const deletePasskeyParamsSchema = z.object({
  passkeyId: z.string().uuid(),
});
