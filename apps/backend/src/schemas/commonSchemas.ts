import { z } from 'zod';

export const usernameSchema = z
  .string()
  .trim()
  .min(3)
  .max(32)
  .regex(/^[a-zA-Z0-9._-]+$/, 'Username may only contain letters, numbers, dot, underscore, and hyphen');

export const passkeyLabelSchema = z.string().trim().min(1).max(64);
