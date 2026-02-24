# Implement the local passkey demonstrator

Use `AGENTS.md` and `SPEC.md` and `impl.md` as the source of truth.

## Mandatory workflow (do not skip)
Before writing code:
1. Restate the scope from `SPEC.md`
2. List ambiguities / missing details (if any)
3. Ask grouped clarification questions
4. Propose implementation approach and file structure
5. Wait for approval

If the user explicitly tells you to proceed, continue with clearly labeled assumptions.

---

## Implementation task
Build the project described in `SPEC.md`:

- Vue 3 SPA (TypeScript, Vite, Vue Router, Pinia)
- Node.js + Express backend (TypeScript)
- WebAuthn/passkeys using:
  - `@simplewebauthn/server`
  - `@simplewebauthn/browser`
- Plain CSS UI
- Local JSON persistence
- HTTP-only cookie sessions
- Dev-only reset-all-data feature
- Deleting the last passkey deletes the user and logs them out

This must be a **real WebAuthn implementation** (server-generated challenges + server verification), not a frontend mock.

---

## What to produce after approval
Respond in this exact order:

1. **Short implementation plan**
2. **Proposed file tree**
3. **Code changes by file** (full content for new files, patches for existing files)
4. **Environment variables (`.env.example`)**
5. **Run instructions**
6. **Manual test checklist**
7. **Known limitations / next improvements**

---

## Build expectations
### Frontend
Implement routes:
- `/` welcome page
- `/auth/passkey`
- `/auth/username-passkey`
- `/account`

UI requirements:
- Clean plain CSS
- Clear error/success messages
- WebAuthn unsupported-browser detection
- Visible dev-only “Reset demo data” action with confirmation

### Backend
Implement `/api` endpoints per `SPEC.md`, including:
- registration options + verify
- authentication options + verify
- session (`me`, `logout`)
- passkey list/add/delete
- dev reset

Use explicit request/response validation schemas.
Keep business logic in backend services.

### Persistence
Use JSON files under `/data` and implement safe writes (temp file + rename).
Keep schema aligned with `SPEC.md`.

---

## Coding rules
- TypeScript strict mode
- Small, readable modules
- No silent failures
- Log key auth/passkey/reset events with timestamps
- Update:
  - `README.md`
  - `plan.md`
  - `changelog.md` (under today’s date header)
- Document assumptions if needed

---

## First response now
Do **not** write code yet.

Start by:
1. Restating the scope
2. Listing any missing details
3. Proposing the implementation approach and file tree
4. Create project .gitignore file
5. Waiting for approval