# Assumptions

- Username uniqueness is case-insensitive using `usernameNormalized`.
- Username validation:
  - length `3..32`
  - allowed chars: letters, numbers, `.`, `_`, `-`
- Passkey label validation:
  - length `1..64`
- Session lifetime defaults to 24 hours and is refreshed on active requests.
- Challenge lifetime defaults to 300 seconds.
- Cookie defaults:
  - `HttpOnly=true`
  - `SameSite=Lax`
  - `Secure=false` in non-production local HTTP mode
- `DEV_RESET_ENABLED=true` and non-production mode are both required for reset endpoint usage.
- Data files are auto-created when missing.
