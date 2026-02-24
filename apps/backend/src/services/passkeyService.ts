import { v4 as uuidv4 } from 'uuid';

import { AppError } from '../lib/errors.js';
import { logEvent } from '../lib/logger.js';
import { challengesRepository, passkeysRepository, sessionsRepository, usersRepository } from '../storage/repositories.js';
import type { ChallengeRecord, StoredPasskey, User } from '../types/domain.js';
import { createRegistrationOptions, extractRegistrationResult, verifyRegistration } from './webauthnService.js';

function nowIso(): string {
  return new Date().toISOString();
}

function challengeExpiryIso(ttlSeconds: number): string {
  return new Date(Date.now() + ttlSeconds * 1000).toISOString();
}

export class PasskeyService {
  public constructor(private readonly challengeTtlSeconds: number) {}

  private async purgeExpiredChallenges(): Promise<void> {
    await challengesRepository.deleteExpired(nowIso());
  }

  public async listForUser(userId: string): Promise<StoredPasskey[]> {
    return passkeysRepository.listByUserId(userId);
  }

  public async startAddPasskey(user: User, label: string): Promise<{ challengeId: string; options: unknown }> {
    await this.purgeExpiredChallenges();

    const userPasskeys = await passkeysRepository.listByUserId(user.id);
    const options = await createRegistrationOptions({
      userId: user.id,
      username: user.username,
      excludeCredentialIds: userPasskeys.map((entry) => entry.credentialId),
    });

    const challengeRecord: ChallengeRecord = {
      id: uuidv4(),
      type: 'registration',
      flow: 'account-add',
      challenge: options.challenge,
      createdAt: nowIso(),
      expiresAt: challengeExpiryIso(this.challengeTtlSeconds),
      userId: user.id,
      pendingUserId: null,
      username: user.username,
      usernameNormalized: user.usernameNormalized,
      label,
      expectedCredentialIds: null,
    };

    await challengesRepository.upsert(challengeRecord);

    return {
      challengeId: challengeRecord.id,
      options,
    };
  }

  public async finishAddPasskey(args: {
    challengeId: string;
    user: User;
    response: Record<string, unknown>;
  }): Promise<StoredPasskey> {
    const challenge = await challengesRepository.findById(args.challengeId);

    if (!challenge || challenge.type !== 'registration' || challenge.flow !== 'account-add') {
      throw new AppError(400, 'INVALID_CHALLENGE', 'Add-passkey challenge was not found');
    }

    if (challenge.userId !== args.user.id) {
      throw new AppError(403, 'CHALLENGE_USER_MISMATCH', 'Challenge does not belong to current user');
    }

    if (new Date(challenge.expiresAt).getTime() <= Date.now()) {
      await challengesRepository.deleteById(challenge.id);
      throw new AppError(400, 'EXPIRED_CHALLENGE', 'Add-passkey challenge has expired');
    }

    const verification = await verifyRegistration({
      response: args.response,
      expectedChallenge: challenge.challenge,
    });

    if (!verification.verified) {
      throw new AppError(401, 'REGISTRATION_FAILED', 'Passkey verification failed');
    }

    const parsed = extractRegistrationResult(verification);
    if (!parsed) {
      throw new AppError(500, 'REGISTRATION_PARSE_FAILED', 'Unable to parse registration credential data');
    }

    const existingCredential = await passkeysRepository.findByCredentialId(parsed.credentialId);
    if (existingCredential) {
      throw new AppError(409, 'CREDENTIAL_EXISTS', 'This passkey is already registered');
    }

    const passkey: StoredPasskey = {
      id: uuidv4(),
      userId: args.user.id,
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

    logEvent('passkey_added', {
      userId: args.user.id,
      username: args.user.username,
      passkeyId: passkey.id,
    });

    return passkey;
  }

  public async deletePasskey(args: { user: User; passkeyId: string }): Promise<{ accountDeleted: boolean }> {
    const passkey = await passkeysRepository.findById(args.passkeyId);
    if (!passkey || passkey.userId !== args.user.id) {
      throw new AppError(404, 'PASSKEY_NOT_FOUND', 'Passkey not found for current user');
    }

    await passkeysRepository.deleteById(args.passkeyId);

    const remainingPasskeys = await passkeysRepository.listByUserId(args.user.id);

    if (remainingPasskeys.length === 0) {
      await passkeysRepository.deleteByUserId(args.user.id);
      await usersRepository.deleteById(args.user.id);
      await sessionsRepository.deleteByUserId(args.user.id);

      const challenges = await challengesRepository.list();
      const toDelete = challenges.filter((entry) => entry.userId === args.user.id || entry.pendingUserId === args.user.id);
      await Promise.all(toDelete.map((entry) => challengesRepository.deleteById(entry.id)));

      logEvent('passkey_deleted_last_account_removed', {
        userId: args.user.id,
        username: args.user.username,
      });

      return { accountDeleted: true };
    }

    logEvent('passkey_deleted', {
      userId: args.user.id,
      username: args.user.username,
      passkeyId: args.passkeyId,
    });

    return { accountDeleted: false };
  }
}
