# PKLogin

Local passkey (WebAuthn) demonstrator with:
- Vue 3 SPA frontend
- Express + TypeScript backend
- JSON-file persistence (no database)

This project demonstrates real server-side WebAuthn challenge generation and verification for local development on `localhost`.

## Features
- Two authentication flows:
  - Passkey-only (discoverable credentials)
  - Username + passkey
- Account page with:
  - user details
  - passkey list
  - add passkey
  - delete passkey
- Last-passkey deletion behavior:
  - deleting the final passkey deletes the user account and logs out
- Dev-only reset action to clear all demo data
- HTTP-only cookie session model
- TypeScript strict mode and backend validation with `zod`

## Tech Stack
- Frontend: Vue 3, Vite, TypeScript, Vue Router, Pinia, `@simplewebauthn/browser`
- Backend: Node.js, Express, TypeScript, `@simplewebauthn/server`
- Storage: local JSON files under `data/`
- Tests: Vitest (backend)

## Repository Layout
```text
apps/
  backend/
  frontend/
data/
docs/
```

## Prerequisites
- Node.js 20+
- npm 10+
- A browser with WebAuthn/passkey support

## Quick Start
1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Run frontend + backend:
```bash
npm run dev
```

4. Open:
- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:3000/health`

## Environment Variables
Defined in `.env.example`.

Backend:
- `PORT` (default: `3000`)
- `NODE_ENV` (`development` for local demo)
- `RP_NAME` (default: `Local Passkey Demo`)
- `RP_ID` (default: `localhost`)
- `EXPECTED_ORIGIN` (default: `http://localhost:5173`)
- `FRONTEND_ORIGIN` (default: `http://localhost:5173`)
- `SESSION_COOKIE_NAME` (default: `pkdemo_session`)
- `SESSION_SECRET` (required for signing/session safety)
- `SESSION_TTL_HOURS` (default: `24`)
- `CHALLENGE_TTL_SECONDS` (default: `300`)
- `DEV_RESET_ENABLED` (`true` to enable reset endpoint)
- `DATA_DIR` (optional path override for JSON storage)

Frontend:
- `VITE_API_BASE_URL` (default: `http://localhost:3000/api`)
- `VITE_DEV_RESET_ENABLED` (`true` to show reset action in dev)

## NPM Scripts
Root:
- `npm run dev` - run frontend and backend concurrently
- `npm run lint` - run TS checks for both workspaces
- `npm run test` - run backend tests + frontend test placeholder
- `npm run build` - build backend and frontend

Backend workspace:
- `npm --workspace apps/backend run dev`
- `npm --workspace apps/backend run test`

Frontend workspace:
- `npm --workspace apps/frontend run dev`

## API Summary
Base URL: `/api`

Auth:
- `POST /auth/register/options`
- `POST /auth/register/verify`
- `POST /auth/login/options`
- `POST /auth/login/verify`

Session:
- `GET /session/me`
- `POST /session/logout`

Passkeys:
- `GET /passkeys`
- `POST /passkeys/add/options`
- `POST /passkeys/add/verify`
- `DELETE /passkeys/:passkeyId`

Dev:
- `POST /dev/reset` (enabled only when `DEV_RESET_ENABLED=true` and not production)

Error response shape:
```json
{
  "code": "SOME_ERROR_CODE",
  "message": "Human-readable message",
  "details": {}
}
```

## Data Storage
JSON files are stored under `data/`:
- `users.json`
- `passkeys.json`
- `sessions.json`
- `challenges.json`

Writes are atomic (`tmp` file + rename).

Schema reference:
- `docs/data-schema.md`

## Manual Verification Checklist
1. Open `/` and verify both auth entry buttons.
2. Register via `/auth/passkey` with username + passkey label.
3. Confirm redirect to `/account` and passkey list population.
4. Logout and sign in again using passkey-only flow.
5. Login via `/auth/username-passkey` with existing username.
6. Add a second passkey in account.
7. Delete one passkey and verify account remains.
8. Delete final passkey and verify account deletion + logout + redirect.
9. Use dev reset and verify all records/session are cleared.

## Security Notes (Demo Scope)
- Private key material is never stored by this app.
- WebAuthn verification is server-side only.
- All API request bodies are validated.
- This is a local demonstrator, not production-hardened.

## Current Limitations
- No password fallback or recovery flow
- No anti-abuse/rate limiting
- No frontend automated UI tests
- No production deployment hardening
