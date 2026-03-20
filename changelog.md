# Changelog

## 2026-03-20
- Updated `README.md` workspace command docs to match the current backend and frontend scripts.

## 2026-03-12
- Cleaned up `AGENTS.md` engineering guidelines by removing stale duplicate items and adding repo-verified npm workflow commands.

## 2026-02-24
- Scaffolded monorepo workspace with `apps/frontend` and `apps/backend`.
- Added root scripts and environment template for local demo execution.
- Implemented backend configuration validation, JSON persistence helpers, and cookie session middleware.
- Implemented WebAuthn registration/authentication option and verify endpoints.
- Implemented session endpoints (`me`, `logout`), passkey endpoints (list/add/delete), and dev reset endpoint.
- Implemented account deletion behavior when the final passkey is removed.
- Implemented Vue SPA routes for welcome, passkey-only auth, username+passkey auth, and account page.
- Added frontend API and WebAuthn service orchestration with user-facing error handling.
- Added backend tests for storage atomic behavior, validation boundaries, and last-passkey deletion logic.
- Added documentation for setup, manual validation, data schema, and assumptions.
