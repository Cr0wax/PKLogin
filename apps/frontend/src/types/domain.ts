export interface User {
  id: string;
  username: string;
  usernameNormalized: string;
  createdAt: string;
}

export interface Passkey {
  id: string;
  userId: string;
  credentialId: string;
  counter: number;
  transports: string[];
  label: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}
