import { v4 as uuidv4 } from 'uuid';

import { AppError } from '../lib/errors.js';
import { logEvent } from '../lib/logger.js';
import { challengesRepository, passkeysRepository, usersRepository } from '../storage/repositories.js';
import type { ChallengeFlow, ChallengeRecord, StoredPasskey, User } from '../types/domain.js';
import {
  createAuthenticationOptions,
  createRegistrationOptions,
  extractAuthenticationCounter,
  extractAuthenticationCredentialId,
  extractRegistrationResult,
  verifyAuthentication,
  verifyRegistration,
} from './webauthnService.js';

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

function nowIso(): string {
  return new Date().toISOString();
}

function challengeExpiryIso(ttlSeconds: number): string {
  return new Date(Date.now() + ttlSeconds * 1000).toISOString();
}

export class AuthService {
  public constructor(private readonly challengeTtlSeconds: number) {}

  private async purgeExpiredChallenges(): Promise<void> {
    await challengesRepository.deleteExpired(nowIso());
  }

  public async startRegistration(args: {
    username: string;
    label: string;
    flow: ChallengeFlow;
  }): Promise<{ challengeId: string; options: unknown }> {
    await this.purgeExpiredChallenges();

    const usernameNormalized = normalizeUsername(args.username);
    const existingUser = await usersRepository.findByUsernameNormalized(usernameNormalized);
    if (existingUser) {
      throw new AppError(409, 'USERNAME_TAKEN', 'Username is already in use');
    }

    const pendingUserId = uuidv4();
    const options = await createRegistrationOptions({
      userId: pendingUserId,
      username: args.username,
      excludeCredentialIds: [],
    });

    const challenge = options.challenge;
    const challengeRecord: ChallengeRecord = {
      id: uuidv4(),
      type: 'registration',
      flow: args.flow,
      challenge,
      createdAt: nowIso(),
      expiresAt: challengeExpiryIso(this.challengeTtlSeconds),
      userId: null,
      pendingUserId,
      username: args.username,
      usernameNormalized,
      label: args.label,
      expectedCredentialIds: null,
    };

    await challengesRepository.upsert(challengeRecord);

    return {
      challengeId: challengeRecord.id,
      options,
    };
  }

  public async finishRegistration(args: {
    challengeId: string;
    response: Record<string, unknown>;
  }): Promise<{ user: User; passkey: StoredPasskey }> {
    const challenge = await challengesRepository.findById(args.challengeId);
    if (!challenge || challenge.type !== 'registration' || !challenge.pendingUserId || !challenge.usernameNormalized) {
      throw new AppError(400, 'INVALID_CHALLENGE', 'Registration challenge was not found');
    }

    if (new Date(challenge.expiresAt).getTime() <= Date.now()) {
      await challengesRepository.deleteById(challenge.id);
      throw new AppError(400, 'EXPIRED_CHALLENGE', 'Registration challenge has expired');
    }

    const verification = await verifyRegistration({
      response: args.response,
      expectedChallenge: challenge.challenge,
    });

    if (!verification.verified) {
      throw new AppError(401, 'REGISTRATION_FAILED', 'Registration verification failed');
    }

    const parsed = extractRegistrationResult(verification);
    if (!parsed) {
      throw new AppError(500, 'REGISTRATION_PARSE_FAILED', 'Unable to parse registration credential data');
    }

    const existingCredential = await passkeysRepository.findByCredentialId(parsed.credentialId);
    if (existingCredential) {
      throw new AppError(409, 'CREDENTIAL_EXISTS', 'This passkey is already registered');
    }

    const user: User = {
      id: challenge.pendingUserId,
      username: challenge.username ?? challenge.usernameNormalized,
      usernameNormalized: challenge.usernameNormalized,
      createdAt: nowIso(),
    };

    await usersRepository.create(user);

    const passkey: StoredPasskey = {
      id: uuidv4(),
      userId: user.id,
      credentialId: parsed.credentialId,
      publicKey: parsed.publicKey,
      counter: parsed.counter,
      transports: parsed.transports,
      label: challenge.label ?? 'Passkey',
      createdAt: nowIso(),
      lastUsedAt: null,
    };

    await passkeysRepository.create(passkey);
    await challengesRepository.deleteById(challenge.id);

    logEvent('registration_success', {
      userId: user.id,
      username: user.username,
      flow: challenge.flow,
      passkeyId: passkey.id,
    });

    return { user, passkey };
  }

  public async startAuthentication(args: {
    flow: ChallengeFlow;
    username?: string;
  }): Promise<{ challengeId: string; options: unknown }> {
    await this.purgeExpiredChallenges();

    let userId: string | null = null;
    let expectedCredentialIds: string[] | null = null;
    let usernameNormalized: string | null = null;

    if (args.flow === 'username-passkey') {
      if (!args.username) {
        throw new AppError(400, 'USERNAME_REQUIRED', 'Username is required for this login flow');
      }

      usernameNormalized = normalizeUsername(args.username);
      const user = await usersRepository.findByUsernameNormalized(usernameNormalized);
      if (!user) {
        throw new AppError(404, 'USER_NOT_FOUND', 'No account found for this username');
      }

      const userPasskeys = await passkeysRepository.listByUserId(user.id);
      if (userPasskeys.length === 0) {
        throw new AppError(400, 'NO_PASSKEYS', 'This account has no registered passkeys');
      }

      userId = user.id;
      expectedCredentialIds = userPasskeys.map((entry) => entry.credentialId);
    }

    const options = await createAuthenticationOptions(expectedCredentialIds ?? undefined);

    const challengeRecord: ChallengeRecord = {
      id: uuidv4(),
      type: 'authentication',
      flow: args.flow,
      challenge: options.challenge,
      createdAt: nowIso(),
      expiresAt: challengeExpiryIso(this.challengeTtlSeconds),
      userId,
      pendingUserId: null,
      username: args.username ?? null,
      usernameNormalized,
      label: null,
      expectedCredentialIds,
    };

    await challengesRepository.upsert(challengeRecord);

    return {
      challengeId: challengeRecord.id,
      options,
    };
  }

  public async finishAuthentication(args: {
    challengeId: string;
    response: Record<string, unknown>;
  }): Promise<{ user: User; passkey: StoredPasskey }> {
    const challenge = await challengesRepository.findById(args.challengeId);
    if (!challenge || challenge.type !== 'authentication') {
      throw new AppError(400, 'INVALID_CHALLENGE', 'Authentication challenge was not found');
    }

    if (new Date(challenge.expiresAt).getTime() <= Date.now()) {
      await challengesRepository.deleteById(challenge.id);
      throw new AppError(400, 'EXPIRED_CHALLENGE', 'Authentication challenge has expired');
    }

    const credentialId = extractAuthenticationCredentialId(args.response);
    const passkey = await passkeysRepository.findByCredentialId(credentialId);

    if (!passkey) {
      throw new AppError(401, 'UNKNOWN_CREDENTIAL', 'Credential is not registered');
    }

    if (challenge.userId && challenge.userId !== passkey.userId) {
      throw new AppError(401, 'CREDENTIAL_USER_MISMATCH', 'Credential does not belong to this user');
    }

    const verification = await verifyAuthentication({
      response: args.response,
      expectedChallenge: challenge.challenge,
      passkey,
    });

    if (!verification.verified) {
      logEvent('authentication_failed', {
        challengeId: challenge.id,
        passkeyId: passkey.id,
        reason: 'verification_false',
      });
      throw new AppError(401, 'AUTHENTICATION_FAILED', 'Authentication verification failed');
    }

    const user = await usersRepository.findById(passkey.userId);
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User account for credential was not found');
    }

    const updatedPasskey: StoredPasskey = {
      ...passkey,
      counter: extractAuthenticationCounter(verification),
      lastUsedAt: nowIso(),
    };

    await passkeysRepository.update(updatedPasskey);
    await challengesRepository.deleteById(challenge.id);

    logEvent('authentication_success', {
      userId: user.id,
      username: user.username,
      flow: challenge.flow,
      passkeyId: passkey.id,
    });

    return { user, passkey: updatedPasskey };
  }
}
