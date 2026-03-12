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
- Node.js (LTS)
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
- Prefer explicit schemas and validation over “best effort” parsing.
- Do not silently drop data; emit warnings with counts (surface in UI and logs).
- Keep configuration minimal and local; avoid complex secrets management for MVP.

### Working commands (repo-verified)
- Use root scripts for standard workflows: `npm run dev`, `npm run lint`, `npm run test`, `npm run build`.
- Use workspace scripts for focused work:
  - backend: `npm --workspace apps/backend run dev|test|lint|build`
  - frontend: `npm --workspace apps/frontend run dev|lint|build`
- Treat frontend `npm --workspace apps/frontend run test` as a placeholder unless real UI tests are added.

### Mandatory task-intake flow (always before implementation)
For every new request, follow this sequence in order:
1) Understand the task: restate scope and confirm assumptions/constraints.
2) Save the task: record it in plan.md with implementation details and acceptance notes.
3) Propose next step: present the immediate next implementation step before writing code.
Do not start coding before these three steps are completed.

### Mandatory implementation flow (single feature per cycle)
For implementation work, follow this sequence in order:
1) Select one feature/task only from plan.md.
2) Implement code changes for that single feature.
3) Validate by running tests, or if tests are not available/executable, provide exact manual verification steps. Do not proceed without validation.
4) Commit code changes.
5) Update documentation (changelog.md, plan.md, and related docs if applicable).
6) Commit documentation changes as a separate commit.

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
