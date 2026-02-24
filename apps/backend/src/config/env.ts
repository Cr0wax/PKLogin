import { z } from 'zod';

function parseBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') {
      return true;
    }
    if (normalized === 'false') {
      return false;
    }
  }

  return undefined;
}

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  RP_NAME: z.string().min(1).default('Local Passkey Demo'),
  RP_ID: z.string().min(1).default('localhost'),
  EXPECTED_ORIGIN: z.string().min(1).default('http://localhost:5173'),
  FRONTEND_ORIGIN: z.string().min(1).default('http://localhost:5173'),
  SESSION_COOKIE_NAME: z.string().min(1).default('pkdemo_session'),
  SESSION_SECRET: z.string().min(8).default('change-me-in-dev'),
  SESSION_TTL_HOURS: z.coerce.number().int().min(1).max(720).default(24),
  DEV_RESET_ENABLED: z.preprocess(parseBoolean, z.boolean().default(true)),
  CHALLENGE_TTL_SECONDS: z.coerce.number().int().min(30).max(3600).default(300),
  DATA_DIR: z.string().min(1).optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

export function loadEnv(): AppEnv {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const messages = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    throw new Error(`Invalid environment configuration: ${messages.join('; ')}`);
  }

  return parsed.data;
}

export const env = loadEnv();
