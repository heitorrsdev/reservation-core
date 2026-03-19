# ADR 0014 – Refresh Token Strategy

## Context

Our authentication mechanism relies on stateless JWT access tokens, which currently have a 24-hour expiration with no built-in revocation mechanism (as outlined in ADR 0013). This architecture introduces two primary constraints:
- Without refresh tokens, users must re-authenticate and provide their credentials after every token expiration, degrading the user experience.
- Without a logout mechanism, active sessions cannot be reliably invalidated before the access token reaches its natural expiration time.

To maintain security while improving the user experience, we needed a strategy to persist, rotate, and revoke sessions securely.

## Decision

We have decided to implement stateful refresh token authentication with automatic rotation, database persistence, and logout support. The key aspects of this decision are:

1. **Database Persistence**
   - Refresh tokens are stored in the database in a dedicated `refresh_tokens` table.
   - The table schema includes: `id` (UUID), `user_id` (UUID), `token_hash` (TEXT), `expires_at` (TIMESTAMPTZ), and `revoked_at` (TIMESTAMPTZ).

2. **Secure Storage**
   - Refresh tokens are never stored in plain text. We only persist the hash of the token's random part (hashed with argon2).
   - This prevents stolen database backups from being used to impersonate active user sessions.

3. **Expiration and Rotation**
   - Refresh tokens have a hardcoded expiration of 7 days.
   - Refresh token rotation is strictly enforced: each successful use of a refresh token invalidates the old token and issues a new one to the client.

4. **Reuse Detection**
   - If a client attempts to use a refresh token that has already been marked as revoked (e.g., due to an earlier rotation), the system assumes a token compromise.
   - In this scenario, the entire session is forcibly invalidated by revoking all active refresh tokens associated with that user.

5. **Token Lifecycle Endpoints**
   - `POST /auth/refresh`: Accepts an active refresh token, issues a new access token, and rotates the refresh token.
   - `POST /auth/logout`: Accepts an active refresh token and marks it as revoked.

## Consequences

### Positive

* **Enhanced User Experience**: Users remain authenticated across access token expirations without repeatedly entering credentials up to the 7-day refresh token limit.
* **Proactive Security Constraints**: Sessions can now be explicitly invalidated via logout, bridging the gap left by stateless access tokens.
* **Theft Mitigation**: Any stolen refresh token triggers immediate reuse detection when either the legitimate user or attacker attempts to rotate it subsequently, terminating the compromised session cascade.

### Negative / Trade-offs

* **Increased Complexity**: Adds stateful database persistence to our previously stateless authentication system.
* **Infrastructure Footprint**: Requires a new database migration and recurring checks against persistent storage for every token refresh.
* **Client Logout Requirement**: Active revocation relies strictly on the client making an explicit request to `POST /auth/logout` sending the current refresh token. If the client simply discards the token locally without notifying the server, the token remains valid in the database until expiration.
