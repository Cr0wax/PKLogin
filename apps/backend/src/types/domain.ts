export interface User {
  id: string;
  username: string;
  usernameNormalized: string;
  createdAt: string;
}

export interface StoredPasskey {
  id: string;
  userId: string;
  credentialId: string;
  publicKey: string;
  counter: number;
  transports: string[];
  label: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export interface SessionRecord {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export type ChallengeType = 'registration' | 'authentication';

export type ChallengeFlow = 'passkey-only' | 'username-passkey' | 'account-add';

export interface ChallengeRecord {
  id: string;
  type: ChallengeType;
  flow: ChallengeFlow;
  challenge: string;
  createdAt: string;
  expiresAt: string;
  userId: string | null;
  pendingUserId: string | null;
  username: string | null;
  usernameNormalized: string | null;
  label: string | null;
  expectedCredentialIds: string[] | null;
}

export interface ErrorResponse {
  code: string;
  message: string;
  details?: unknown;
}
