# SPEC.md

## 1) Project overview

### Project name
Local Passkey Demonstrator (Vue SPA + Node/Express + JSON storage)

### Purpose
Build a local web application that demonstrates real passkey authentication (WebAuthn) in two user flows:

1. **Passkey-only** login (discoverable credential flow)
2. **Username + passkey** login (username-first flow)

The app is for demonstration and learning, not production use.

### Approved stack
- **Frontend:** Vue 3 + Vite + TypeScript + Vue Router + Pinia
- **Backend:** Node.js + Express + TypeScript
- **Passkeys/WebAuthn:** `@simplewebauthn/server`, `@simplewebauthn/browser`
- **Styling:** Plain CSS
- **Persistence:** Local JSON files
- **Session model:** HTTP-only cookie session
- **Passkey labels:** User-provided label
- **Reset feature:** Yes (dev-only reset all data)
- **Delete last passkey:** Allowed; if it is the last passkey, delete the user and terminate session

---

## 2) Scope

## In scope
- Welcome page with two entry points (two login methods)
- User registration (in both flows)
- User authentication with passkeys (in both flows)
- Account page after login
- List passkeys (label + date/time added)
- Add additional passkey
- Delete passkey
- Deleting the last passkey deletes the user account
- Local JSON persistence
- Dev-only reset endpoint and UI control
- Basic validation and error handling
- Documentation (`README.md`, `changelog.md`, `plan.md`)

## Out of scope
- Production security hardening
- Multi-device sync
- Password fallback
- Email verification
- Account recovery
- Admin features
- Database integration
- Rate limiting / anti-abuse hardening
- Full test suite (basic tests only if practical)

---

## 3) Functional requirements

## 3.1 Welcome page (`/`)
The welcome page must:
- Explain this is a local passkey/WebAuthn demonstrator
- Provide two buttons:
  - **Passkey-only login**
  - **Username + passkey login**
- Optionally display a note:
  - Works in modern browsers with passkey/WebAuthn support
  - `localhost` is used as secure context for local demo
- Provide a visible link/button to reset demo data (dev-only, with confirmation)

---

## 3.2 Passkey-only flow (`/auth/passkey`)
This page must support:

### Returning user login
- User clicks “Sign in with passkey”
- Browser passkey prompt is shown
- Backend generates authentication options without requiring username (discoverable credentials)
- Backend verifies authentication response
- On success:
  - Create/update session
  - Redirect to `/account`

### New user registration
Since passkey-only login has no username prompt by default, new registration must include:
- Username input
- Passkey label input
- “Create account and register passkey” action

Flow:
1. User enters username + passkey label
2. Backend validates username availability
3. Backend generates registration options
4. Browser performs passkey registration
5. Backend verifies registration response
6. Backend stores user + passkey
7. User is logged in and redirected to `/account`

---

## 3.3 Username + passkey flow (`/auth/username-passkey`)
This page must support:

### Returning user login
- User enters username
- User clicks “Continue with passkey”
- Backend generates authentication options scoped to that user’s credentials
- Browser passkey prompt is shown
- Backend verifies response
- On success:
  - Create/update session
  - Redirect to `/account`

### New user registration
- User enters username
- User enters passkey label
- User clicks “Create account and register passkey”
- Backend generates registration options for that username
- Browser registers passkey
- Backend verifies and stores user + passkey
- User is logged in and redirected to `/account`

---

## 3.4 Account page (`/account`)
After successful login, show:

### User details
- `username`
- `userId` (optional to display; acceptable for demo)
- `createdAt`

### Passkeys list
For each passkey:
- `label`
- `createdAt` (formatted datetime)
- Optional:
  - `lastUsedAt`
  - `transports`

### Actions
- **Add passkey**
  - Requires label input
  - Runs registration ceremony while user is logged in
  - Stores additional passkey for same user
- **Delete passkey**
  - Deletes selected passkey
  - If deleted passkey was the user’s last passkey:
    - delete user record
    - delete all user-linked data
    - destroy session
    - redirect to welcome page
    - show message: user account deleted because last passkey was removed
- **Logout**
  - Destroys session and redirects to `/`

---

## 3.5 Reset demo data (dev-only)
A dev-only reset action must:
- Be available in UI (welcome page is enough)
- Require confirmation dialog
- Call backend reset endpoint
- Delete all JSON data (users, passkeys, sessions, challenges)
- Recreate empty valid JSON files
- Clear current session
- Return success message

This feature must be clearly marked as **dev-only/demo-only**.

---

## 4) Non-functional requirements

## 4.1 Local run
- Must run on `localhost`
- Frontend and backend may run as separate dev servers (Vite + API), with proxy
- WebAuthn expected origin and RP ID must be configurable via environment variables

## 4.2 Usability
- Clean, minimal plain CSS UI
- Clear labels and action buttons
- Clear error messages for failed WebAuthn, duplicate username, unsupported browser, etc.
- No hidden flows

## 4.3 Maintainability
- TypeScript strict mode enabled
- Explicit validation schemas for API input
- Modular backend and frontend structure
- No giant mixed-purpose files

## 4.4 Logging
Backend should log:
- startup
- registration success/failure
- authentication success/failure
- passkey add/delete
- reset action
- file storage errors

Logs can be console-based for the demo.

---

## 5) WebAuthn requirements (technical)

## 5.1 General
The implementation must use **real WebAuthn flow**:
- Server generates options (registration/authentication)
- Browser executes WebAuthn ceremony
- Server verifies browser response

Client must never “verify” passkeys itself.

## 5.2 RP configuration
Use environment variables for:
- `RP_NAME` (e.g., `Passkey Demo`)
- `RP_ID` (default `localhost`)
- `EXPECTED_ORIGIN` (e.g., `http://localhost:5173` for dev; can vary by setup)

If backend serves frontend directly in future, `EXPECTED_ORIGIN` may differ.

## 5.3 Challenges
Challenges must be:
- generated per ceremony
- bound to expected context (registration/authentication)
- stored temporarily in server-side JSON-backed storage or session
- invalidated after successful verification (or expiry)

## 5.4 Credential storage
Store only public credential metadata needed for verification:
- credential ID
- public key
- counter
- transports (if available)
- user linkage
- label
- timestamps

No private key material is ever stored by the app.