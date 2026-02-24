import {
  type AuthenticationResponseJSON,
  type RegistrationResponseJSON,
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';

import { env } from '../config/env.js';
import type { StoredPasskey } from '../types/domain.js';

function decodeCredentialPublicKey(publicKeyBase64: string): Uint8Array {
  return new Uint8Array(Buffer.from(publicKeyBase64, 'base64'));
}

function encodeCredentialPublicKey(publicKey: Uint8Array): string {
  return Buffer.from(publicKey).toString('base64');
}

function toCredentialIdString(id: string | Uint8Array | ArrayBuffer): string {
  if (typeof id === 'string') {
    return id;
  }

  if (id instanceof ArrayBuffer) {
    return isoBase64URL.fromBuffer(Buffer.from(id));
  }

  return isoBase64URL.fromBuffer(Buffer.from(id));
}

function toExcludeCredentials(credentialIds: string[]) {
  return credentialIds.map((credentialId) => ({
    id: credentialId,
  }));
}

export async function createRegistrationOptions(args: {
  userId: string;
  username: string;
  excludeCredentialIds: string[];
}) {
  const options = await generateRegistrationOptions({
    rpName: env.RP_NAME,
    rpID: env.RP_ID,
    userID: new TextEncoder().encode(args.userId),
    userName: args.username,
    userDisplayName: args.username,
    attestationType: 'none',
    authenticatorSelection: {
      residentKey: 'required',
      userVerification: 'preferred',
    },
    excludeCredentials: toExcludeCredentials(args.excludeCredentialIds),
  });

  return options;
}

export async function verifyRegistration(args: {
  response: Record<string, unknown>;
  expectedChallenge: string;
}) {
  const verification = await verifyRegistrationResponse({
    response: args.response as unknown as RegistrationResponseJSON,
    expectedChallenge: args.expectedChallenge,
    expectedOrigin: env.EXPECTED_ORIGIN,
    expectedRPID: env.RP_ID,
    requireUserVerification: true,
  });

  return verification;
}

export async function createAuthenticationOptions(allowCredentialIds?: string[]) {
  const options = await generateAuthenticationOptions({
    rpID: env.RP_ID,
    userVerification: 'preferred',
    ...(allowCredentialIds && allowCredentialIds.length > 0
      ? { allowCredentials: toExcludeCredentials(allowCredentialIds) }
      : {}),
  });

  return options;
}

export async function verifyAuthentication(args: {
  response: Record<string, unknown>;
  expectedChallenge: string;
  passkey: StoredPasskey;
}) {
  const verification = await verifyAuthenticationResponse({
    response: args.response as unknown as AuthenticationResponseJSON,
    expectedChallenge: args.expectedChallenge,
    expectedOrigin: env.EXPECTED_ORIGIN,
    expectedRPID: env.RP_ID,
    credential: {
      id: args.passkey.credentialId,
      publicKey: decodeCredentialPublicKey(args.passkey.publicKey),
      counter: args.passkey.counter,
      transports: args.passkey.transports,
    },
    requireUserVerification: true,
  } as Parameters<typeof verifyAuthenticationResponse>[0]);

  return verification;
}

export function extractRegistrationResult(verification: Awaited<ReturnType<typeof verifyRegistration>>) {
  if (!verification.registrationInfo) {
    return null;
  }

  const registrationInfo = verification.registrationInfo as Record<string, unknown>;

  const maybeCredential = registrationInfo.credential as
    | { id: string | Uint8Array | ArrayBuffer; publicKey: Uint8Array; counter: number; transports?: string[] }
    | undefined;

  if (maybeCredential) {
    return {
      credentialId: toCredentialIdString(maybeCredential.id),
      publicKey: encodeCredentialPublicKey(maybeCredential.publicKey),
      counter: maybeCredential.counter,
      transports: maybeCredential.transports ?? [],
    };
  }

  const legacyId = registrationInfo.credentialID as Uint8Array | ArrayBuffer | undefined;
  const legacyPublicKey = registrationInfo.credentialPublicKey as Uint8Array | undefined;
  const legacyCounter = registrationInfo.counter as number | undefined;

  if (!legacyId || !legacyPublicKey || typeof legacyCounter !== 'number') {
    return null;
  }

  return {
    credentialId: toCredentialIdString(legacyId),
    publicKey: encodeCredentialPublicKey(legacyPublicKey),
    counter: legacyCounter,
    transports: [],
  };
}

export function extractAuthenticationCredentialId(response: Record<string, unknown>): string {
  const id = response.id;
  if (typeof id !== 'string' || id.length === 0) {
    throw new Error('Authentication response does not contain a credential ID');
  }

  return id;
}

export function extractAuthenticationCounter(verification: Awaited<ReturnType<typeof verifyAuthentication>>): number {
  const authInfo = verification.authenticationInfo as Record<string, unknown>;
  const newCounter = authInfo.newCounter;

  if (typeof newCounter !== 'number') {
    throw new Error('Authentication verification missing new counter');
  }

  return newCounter;
}
