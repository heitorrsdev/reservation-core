# ADR 0013 – Stateless JWT Authentication

## Context

Initially, the API endpoints in the system were entirely public and open to unauthenticated access. However, core business rules—such as creating a reservation—require identifying the user performing the action in an authoritative and secure manner without exposing fields like `userId` strictly to client manipulation.

We needed a mechanism to verify identity natively. We considered the following authentication options:
1. **Session-based Authentication**: Secure and stateful, but couples the server memory and limits horizontal scalability without implementing distributed session stores (like Redis).
2. **API Keys**: Lightweight but typically intended for server-to-server or deterministic service integrations, rather than evolving client sessions.
3. **JSON Web Tokens (JWT)**: Stateless authentication that effectively scales well when client-server decoupling is prioritized.

## Decision

1. **Adopt JWT Authentication using `HS256`** 
   - Token validation is managed via `@nestjs/jwt` and `passport-jwt` inside the `infrastructure` layer.
   - The token contains claims (e.g., `sub` for user ID and `email`), enabling controllers to authorize requests without performing secondary DB lookups merely to verify identity.

2. **Stateless Implementation**
   - No JWT hashes are persisted in the database at this stage.

3. **Opt-Out Route Protection (`@Public()`)**
   - We apply `JwtAuthGuard` globally via the `APP_GUARD` provider in the HTTP module. By default, every route in the system requires authentication.
   - For routes that must legitimately bypass this restriction, an explicit `@Public()` decorator is applied.
   - Currently, exclusively `POST /users` (registration) and `POST /auth/login` (authentication) use this opt-out.

4. **Security Policy**
   - Core secrets (`JWT_SECRET`) are strictly injected through external environment variables (`.env`) and never hardcoded in the repository.
   - The access token leverages an explicit 24-hour expiration window.
   - Refresh tokens are intentionally deferred and will be tackled in a future ADR when fine-grained revocation and ongoing session persistence become a priority.

## Consequences

### Positive

* **Stateless Scalability**: Since the server does not hold session state, horizontal scaling via load balancers is simplified.
* **Secure by Default**: The global guard prevents developers from accidentally exposing a new route. Future endpoints are automatically protected without requiring explicit decorator assignments.

### Negative / Trade-offs

* **Revocation Inability**: Given the stateless nature without a deny-list or session store, a token cannot be forcibly revoked gracefully before its expiration window closes.
* **Security Window**: The 24-hour token lifecycle acts as a direct security trade-off. This limits the friction for end-users, but leaves a compromised token active for a lengthy window until refresh tokens are fully implemented. 

These trade-offs align optimally with the application's current development phase.
