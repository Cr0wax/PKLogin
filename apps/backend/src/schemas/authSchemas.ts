import { z } from 'zod';

import { passkeyLabelSchema, usernameSchema } from './commonSchemas.js';

const credentialResponseSchema = z.record(z.any());

export const registerOptionsBodySchema = z.object({
  username: usernameSchema,
  label: passkeyLabelSchema,
  flow: z.enum(['passkey-only', 'username-passkey']).optional(),
});

export const registerVerifyBodySchema = z.object({
  challengeId: z.string().uuid(),
  response: credentialResponseSchema,
});

export const loginOptionsBodySchema = z.object({
  username: usernameSchema.optional(),
  flow: z.enum(['passkey-only', 'username-passkey']).optional(),
});

export const loginVerifyBodySchema = z.object({
  challengeId: z.string().uuid(),
  response: credentialResponseSchema,
});
