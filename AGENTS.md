# AGENTS.md

## 1) Purpose of this repository
This repository is a local demonstrator of passkey authentication (WebAuthn/passkeys) with:
- a Vue single-page frontend (SPA)
- a local backend API (required for WebAuthn challenge generation and verification)
- local JSON file persistence (no database)

The goal is clarity and correctness of the passkey flow, not production-scale architecture.

---

## 2) Working mode (mandatory)
Before writing code for any new feature or change:
1. Analyze the request and restate the scope.
2. Identify ambiguities / missing details.
3. Ask targeted clarification questions for missing details.
4. Propose 1–3 implementation options with pros/cons.
5. Recommend one option.
6. Wait for user approval.
7. Only then implement.

Do not skip this sequence.

If the user has not answered yet, proceed only with clearly marked assumptions and keep changes minimal.

---

## 3) Core technical constraints
- Frontend must be a Vue SPA.
- Passkeys must be implemented using WebAuthn properly:
  - server generates registration/authentication challenges
  - server verifies registration/authentication responses
  - frontend only orchestrates browser WebAuthn calls and renders UI
- Data persistence must use local JSON files only (no SQL/NoSQL database).
- App must run locally as a demonstrator.
- Prefer TypeScript unless the user explicitly requests JavaScript.

---

## 4) Default stack (unless user approves something else)
### Frontend
- Vue 3
- Vite
- Vue Router
- Pinia
- TypeScript

### Backend
- Node.js 20+ (npm 10+)
- Express
- TypeScript
- @simplewebauthn/server
- @simplewebauthn/browser (frontend package)

### Styling
- Clean, minimal UI
- No heavy component library by default
- Keep CSS simple and readable
- Responsive enough for desktop + laptop demo

---

## 5) Security and WebAuthn rules (mandatory)
- Never attempt to “fake” passkey verification on the client.
- Never store private keys (passkeys private keys stay on the authenticator/device).
- Store only data needed for verification and credential management (e.g., credential ID, public key, counter, transports, metadata/label, timestamps).
- Store and validate challenges per ceremony (registration/authentication).
- Validate RP ID and expected origin consistently.
- Use secure session handling (HTTP-only cookie preferred for local demo).
- Validate all API input payloads with explicit schemas.
- Return clear errors; do not silently swallow WebAuthn failures.

---

## 6) Data persistence rules (JSON files)
- Store data under `/data` (gitignored except sample files if needed).
- Use separate files for logical entities when useful (users, passkeys, sessions, challenges), or a single `db.json` if explicitly chosen.
- Use atomic file writes (write temp + rename) to reduce corruption risk.
- Do not silently drop malformed records; log warnings and fail fast where appropriate.
- Keep schema stable and documented in `docs/data-schema.md` (create if missing).

---

## 7) API and domain design rules
- Keep business logic in backend; frontend should orchestrate and render.
- Use explicit request/response schemas.
- Keep endpoints small and predictable.
- Use consistent error response format:
  - `code`
  - `message`
  - optional `details`
- Keep WebAuthn ceremony endpoints separate (generate vs verify).
- Keep credential CRUD endpoints separate from auth endpoints.

---

## 8) Frontend UX rules
- Clean landing page with clear explanation of the demo.
- Distinguish two login paths:
  1. passkey-only login
  2. username-first + passkey login
- Registration and login flows must be explicit and understandable.
- Show user-facing error messages for unsupported browser / failed WebAuthn / validation errors.
- After login, show:
  - basic user details
  - list of registered passkeys (label + date added)
  - actions to add a passkey or delete a passkey
- Prefer simple state management over clever abstractions.

---

## 9) Quality standards
- TypeScript strict mode on.
- Add basic tests for backend core logic where practical (especially JSON storage helpers and validation).
- Add manual test steps to `README.md`.
- Log important backend events with timestamps (startup, auth success/fail, credential add/remove).
- Keep code modular and readable; no giant files.

---

## 10) Repo hygiene
Be extremely concise, sacrifice grammar for concision. Update documentation only when working with code itself like implementation of new features, changes, bugfixes.
- Keep `README.md` updated with run instructions and demo limitations.
- Keep `plan.md` updated (in-progress / next / done).
- Append changes to `changelog.md` under a `YYYY-MM-DD` header.
- If creating assumptions, document them in `docs/assumptions.md` (create if missing).

---

## 11) Definition of done (for each feature)
A feature is done only when:
- code builds and runs locally
- passkey flow works end-to-end in the intended path(s)
- errors are handled in UI
- JSON persistence works across restart
- README/changelog/plan are updated

---

## 12) Engineering guidelines (mandatory)
- Prefer explicit schemas and boundary validation (`zod`) over “best effort” parsing.
- Keep route handlers thin: validate in middleware, keep business logic in services.
- Surface failures via explicit errors and structured logs; do not silently drop malformed data.
- Keep configuration minimal/local for demo scope; avoid unnecessary infra/secrets tooling.
- Keep backend JSON payload limits conservative (currently `1mb`).
- Keep dev reset safety gates intact: endpoint must stay disabled in production and require `DEV_RESET_ENABLED=true`.
- Treat frontend test command as non-gating placeholder until real UI tests exist.
- Use npm workspaces + `package-lock.json`; do not add yarn/pnpm lockfiles.
- Backend is NodeNext ESM: keep explicit `.js` extension on backend relative imports in `.ts` files.

### Repo-verified workflow commands
- Full check loop: `npm run lint && npm run test && npm run build`.
- Backend focused loop: `npm --workspace apps/backend run lint && npm --workspace apps/backend run test`.
- Frontend prod-like smoke check: `npm --workspace apps/frontend run build && npm --workspace apps/frontend run preview`.
- Backend runtime smoke check: `npm --workspace apps/backend run build && npm --workspace apps/backend run start`.

### Mandatory task-intake flow (before implementation)
1) Restate scope, assumptions, and constraints.
2) Record task in `plan.md` with implementation and acceptance notes.
3) State immediate next implementation step.
Only start coding after these three steps are complete.

### Mandatory implementation flow (single feature per cycle)
1) Pick one task from `plan.md`.
2) Implement only that task.
3) Validate with tests; if tests are unavailable, provide exact manual checks.
4) Commit code changes.
5) Update docs (`changelog.md`, `plan.md`, related docs when applicable).
6) Commit documentation updates separately.

Changelog append rule:
- Always write entries under a day header in YYYY-MM-DD format.
- If the current date header does not exist yet, add it first, then append bullet points under that header.

Do not bundle multiple unrelated features in one implementation cycle unless explicitly requested.

### Mandatory git-branch flow (before feature implementation)
1) Do not implement on master (or any protected default branch).
2) Create and switch to a new branch first before editing files or committing.
3) Use a codex/ prefix for agent-created branches (e.g., codex/mission-timeout).
4) Keep all commits for that feature on the feature branch until reviewed/merged.
5) Before branching, check if `master` is not behind remote, `pull` when needed.

### Mandatory sensitive-data exposure check (before sharing outputs)
Before committing or sharing any docs, examples, logs, prompts, screenshots, or report artifacts:
1) Path disclosure: remove machine-specific absolute paths; use repo-relative paths or placeholders.
2) Credential leakage: redact API keys/tokens/passwords/private keys/cookies/connection strings.
3) Hardcoded secrets: reject real secrets; use env vars and dummy redacted values.
4) Log/artifact sanitization: redact sensitive strings with [REDACTED].
5) Fail-safe: if unsure, treat as sensitive and redact.
