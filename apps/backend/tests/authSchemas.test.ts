import { describe, expect, it } from 'vitest';

import { usernameSchema } from '../src/schemas/commonSchemas.js';

describe('usernameSchema', () => {
  it('accepts usernames within allowed format and range', () => {
    const parsed = usernameSchema.parse('User_Name-01');
    expect(parsed).toBe('User_Name-01');
  });

  it('rejects too-short usernames', () => {
    expect(() => usernameSchema.parse('ab')).toThrow();
  });

  it('rejects unsupported characters', () => {
    expect(() => usernameSchema.parse('bad username!')).toThrow();
  });
});
