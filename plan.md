# Plan

## In Progress
- Implement local passkey demonstrator (Vue SPA + Express API + WebAuthn + JSON persistence).
  - Acceptance notes:
    - Real WebAuthn ceremonies (server-generated options and server verification)
    - Two auth paths: passkey-only and username+passkey
    - Account management for passkeys (list/add/delete)
    - Deleting final passkey deletes account and logs user out
    - Dev-only reset-all-data

## Next
- Implement backend foundation (validated config, storage, session middleware)
- Implement WebAuthn ceremony routes and domain services
- Implement frontend flows and account UI
- Add tests and update docs

## Done
- Approved implementation plan and phased commit/push workflow
