# PKLogin

Local passkey/WebAuthn demonstrator using a Vue 3 SPA frontend and Node.js/Express backend with JSON file persistence.

## What this demo shows
- Real WebAuthn registration and authentication ceremonies
- Two login flows:
  - Passkey-only (discoverable credentials)
  - Username + passkey
- Account page with passkey list, add passkey, delete passkey
- Last-passkey deletion behavior: deleting the final passkey deletes the user and logs out
- Dev-only reset endpoint and UI action to clear demo data

## Stack
- Frontend: Vue 3, Vite, TypeScript, Vue Router, Pinia, `@simplewebauthn/browser`
- Backend: Node.js, Express, TypeScript, `@simplewebauthn/server`, zod
- Persistence: local JSON files under `data/`
- Session model: HTTP-only cookie with server-side session records

## Project structure
```text
apps/
  backend/
  frontend/
data/
docs/
```

## Environment configuration
Copy `.env.example` to `.env` and adjust if needed.

Important backend variables:
- `PORT` (default `3000`)
- `RP_NAME` (default `Local Passkey Demo`)
- `RP_ID` (default `localhost`)
- `EXPECTED_ORIGIN` (default `http://localhost:5173`)
- `FRONTEND_ORIGIN` (default `http://localhost:5173`)
- `SESSION_COOKIE_NAME` (default `pkdemo_session`)
- `SESSION_SECRET` (set a local demo secret)
- `SESSION_TTL_HOURS` (default `24`)
- `CHALLENGE_TTL_SECONDS` (default `300`)
- `DEV_RESET_ENABLED` (`true` for local demo)
- `DATA_DIR` (optional override path for JSON data files)

Frontend variables:
- `VITE_API_BASE_URL` (default `http://localhost:3000/api`)
- `VITE_DEV_RESET_ENABLED` (`true` to show dev reset UI in dev mode)

## Install
```bash
npm install
```

## Run (development)
```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

## Build and validation
```bash
npm run lint
npm run test
npm run build
```

## Manual test checklist
1. Open `/` and confirm both auth path buttons are visible.
2. Use `/auth/passkey` to register a new username + passkey label.
3. Confirm redirect to `/account` and passkey list shows the new credential.
4. Log out and use `/auth/passkey` sign-in without entering username.
5. Use `/auth/username-passkey` login with existing username.
6. In `/account`, add a second passkey and verify list updates.
7. Delete one passkey and verify account remains.
8. Delete the final passkey and verify redirect to `/` with account-deleted message.
9. Trigger dev reset from `/` and verify sessions/users/passkeys are cleared.
10. Verify clear error messages for unsupported browser or failed ceremony.

## Security/demo notes
- This is a local demonstrator, not production hardened.
- Private key material is never stored by the app.
- Backend validates request payloads and verifies all WebAuthn responses server-side.
- JSON persistence is written atomically using temp-file + rename.

## Known limitations
- No password fallback/recovery flow.
- No rate limiting or anti-abuse controls.
- No production secret management or deployment hardening.
- Frontend has no automated UI tests yet.
