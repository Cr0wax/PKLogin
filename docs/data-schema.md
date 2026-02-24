# Data Schema

Data is stored as JSON files under `data/`.

## `users.json`
Array of:
- `id` (string)
- `username` (string)
- `usernameNormalized` (string, lowercase)
- `createdAt` (ISO datetime string)

## `passkeys.json`
Array of:
- `id` (string)
- `userId` (string)
- `credentialId` (string)
- `publicKey` (base64-encoded public key bytes)
- `counter` (number)
- `transports` (string array)
- `label` (string)
- `createdAt` (ISO datetime string)
- `lastUsedAt` (ISO datetime string or `null`)

## `sessions.json`
Array of:
- `id` (string)
- `userId` (string)
- `createdAt` (ISO datetime string)
- `updatedAt` (ISO datetime string)
- `expiresAt` (ISO datetime string)

## `challenges.json`
Array of:
- `id` (string)
- `type` (`registration` or `authentication`)
- `flow` (`passkey-only`, `username-passkey`, `account-add`)
- `challenge` (string)
- `createdAt` (ISO datetime string)
- `expiresAt` (ISO datetime string)
- `userId` (string or `null`)
- `pendingUserId` (string or `null`)
- `username` (string or `null`)
- `usernameNormalized` (string or `null`)
- `label` (string or `null`)
- `expectedCredentialIds` (string array or `null`)
