# Start implementation prompt — Passkey demonstrator (Vue SPA + local JSON)

You are implementing a local passkey demonstrator web app.

## Phase 0 — Mandatory pre-implementation workflow
Before coding anything:
1. Restate the requested scope in your own words.
2. Identify missing or ambiguous requirements.
3. Ask focused clarification questions (grouped, not one-by-one).
4. Propose implementation options with pros/cons (backend stack, styling, session approach).
5. Recommend one option.
6. Wait for user approval.

Do not start coding until the user approves the approach.
If the user explicitly asks you to proceed, continue with clearly labeled assumptions.

---

## Project objective
Build a **local web application** that demonstrates **passkeys (WebAuthn)** with two login variants:

1. **Passkey-only login**
   - No username prompt initially
   - User authenticates using a passkey (discoverable credential flow)
   - New users must be able to create an account and register a passkey

2. **Username + passkey login**
   - User enters username first
   - Then authenticates using a passkey linked to that user
   - New users must be able to create an account and register a passkey

After successful login, show an account page with:
- basic user details
- list of registered passkeys (display label + date/time added)
- ability to add another passkey
- ability to delete existing passkeys

---

## Hard constraints
- Frontend must be a **Vue SPA**.
- App must run **locally** as a demonstrator.
- Use **local JSON files** for persistence (no database).
- Passkeys must be implemented as real WebAuthn flow (server challenge + verification).
- Keep UI clean, simple, and demo-friendly.

---

## Approved defaults (use unless user changes)
- Frontend: Vue 3 + Vite + TypeScript + Vue Router + Pinia
- Backend: Node.js + Express + TypeScript
- WebAuthn: `@simplewebauthn/server` + `@simplewebauthn/browser`
- Sessions: signed HTTP-only cookies
- Styling: clean custom CSS (no heavy UI framework)
- Passkey labels: user-entered label (with fallback generated label)
- Block deleting the last passkey for a user (default safety)

---

## Deliverables
Implement the project with:

### 1) Frontend (Vue SPA)
Routes:
- `/` — Welcome page with short description and two buttons:
  - “Passkey-only login”
  - “Username + passkey login”
- `/auth/passkey` — Passkey-only flow page
- `/auth/username-passkey` — Username-first flow page
- `/account` — Logged-in account page

Frontend requirements:
- Clear forms and buttons for:
  - register new account
  - login
  - add passkey
  - delete passkey
- Show readable error and success messages
- Detect unsupported WebAuthn and explain it to user
- Keep layout clean and minimal

### 2) Backend API
Implement endpoints for:
- registration options (generate)
- registration verification
- authentication options (generate)
- authentication verification
- current session/user info
- list passkeys for current user
- add passkey (same as registration while logged in)
- delete passkey
- logout

Use explicit request/response validation schemas.

### 3) JSON persistence
Persist data in local JSON files under `/data`, e.g.:
- `users.json`
- `passkeys.json`
- `sessions.json`
- `challenges.json` (or equivalent)

Each passkey record should include at least:
- credential ID
- user ID
- public key
- counter
- transports (if available)
- label
- createdAt
- lastUsedAt (optional but preferred)

Each user record should include at least:
- user ID
- username
- createdAt

### 4) Local run setup
Provide:
- scripts to run frontend/backend in development
- a simple local setup in `README.md`
- note about WebAuthn secure context and localhost usage
- any config values required for RP ID / expected origin

### 5) Documentation
Update:
- `README.md` (run steps, supported browsers, demo limitations)
- `changelog.md`
- `plan.md`

---

## Implementation guidance
- Keep business logic in backend; frontend only orchestrates and renders.
- Keep WebAuthn ceremonies separate:
  - generate options endpoint
  - verify response endpoint
- Store and validate challenges correctly.
- Keep code modular:
  - frontend views/components/stores/services
  - backend routes/services/storage/validation
- Prefer small, readable files over deeply abstracted patterns.
- Add basic backend tests for storage and validation helpers if practical.

---

## Acceptance criteria
The implementation is complete only when all of the following work locally:

1. User opens welcome page and sees two login path buttons.
2. User can register a new account + passkey in both flows.
3. User can log in using passkey-only flow (without entering username first).
4. User can log in using username + passkey flow.
5. After login, user sees account details and registered passkeys list.
6. User can add a second passkey.
7. User can delete a passkey (with clear handling if it is the last passkey).
8. Data persists after app restart via JSON files.
9. Errors are visible and understandable (unsupported browser, duplicate username, failed verification, etc.).
10. README explains exactly how to run the demo.

---

## Output format for your response (when you start coding)
After approval, respond in this order:
1. Short implementation plan
2. File tree to be created/changed
3. Code changes (by file)
4. Run instructions
5. Manual test checklist
6. Known limitations / next improvements