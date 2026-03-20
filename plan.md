# Plan

## In Progress
- None.

## Next
- Add frontend integration tests for key auth/account flows.
- Add optional rate limiting and lockout rules for repeated auth failures.
- Improve structured log persistence for demo event review.

## Done
- Verified `README.md` against the current app and expanded workspace script docs to match the available commands.
- Refreshed AGENTS.md with repo-verified command workflow guidance and removed stale/redundant engineering notes.
- Implemented local passkey demonstrator with Vue SPA + Express API + WebAuthn verification.
- Added both auth paths: passkey-only and username+passkey.
- Added account passkey management (list/add/delete).
- Implemented last-passkey deletion behavior (delete user + logout).
- Implemented dev-only reset-all-data endpoint and UI action.
- Added JSON storage helpers with atomic write semantics.
- Added backend tests for storage, validation, and last-passkey deletion behavior.
- Added and validated monorepo build/lint/test scripts.
