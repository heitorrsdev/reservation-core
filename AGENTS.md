# AGENTS.md

## 1. Project Overview

This project is a backend service for a **barbershop reservation system** built with strong architectural discipline.
The goal is to implement a maintainable and scalable backend using **clean layered architecture**, prioritizing domain modeling and long-term maintainability over rapid feature development.

The system manages:

* Users
* Barbers (a specialization of users)
* Reservations between users and barbers

At the current stage the project already contains **domain logic, application use cases, database infrastructure, and integration tests**. The **HTTP layer is being implemented** as the external interface.

---

## 2. Tech Stack

| Concern | Tool |
|---|---|
| Language | TypeScript |
| Runtime | Node.js 20 |
| Framework | NestJS |
| Database | PostgreSQL |
| ORM / Query Builder | Drizzle ORM (query builder and mapping layer, not schema authority) |
| Migrations | SQL-first manual migrations |
| Password hashing | argon2 |
| Testing | Jest |
| Package manager | pnpm 9 |
| Containerization | Docker |
| Linting | ESLint |
| Formatting | Prettier |
| Task runner | Taskfile (task) |

Testing approach emphasizes **integration tests and concurrency validation** rather than heavy mocking.

---

## 3. Project Structure

```
src/
  domain/           # Pure business logic. Entities, value objects, domain errors, repository interfaces. No framework dependencies allowed.
  application/      # Use cases and orchestration. Commands, repository tokens for DI.
  infrastructure/   # Drizzle repositories, database provider, PostgreSQL, argon2, migration runner, schema definitions.
  interfaces/http/  # Controllers, DTOs, validation, exception filters, domain-to-HTTP error mapping.

migrations/         # Versioned SQL migrations. All schema changes go here.
docs/
  adr/              # Architecture Decision Records (ADRs 0001–0010). Consult before proposing structural changes.
  testing.md
  use-cases.md
test/               # Integration tests, concurrency tests, test utilities, and factories.
docker/             # docker-compose.dev.yml, docker-compose.prod.yml, docker-compose.test.yml
```

---

## 4. Code Conventions

Favor **explicit, readable code over abstraction**. Avoid premature generalization.

| Element | Convention | Example |
|---|---|---|
| Entities | PascalCase | `User`, `Reservation` |
| Use cases | Verb-based | `CreateUserUseCase` |
| Commands | Verb + domain object | `CreateReservationCommand` |
| Repository interface | Domain name | `UserRepository` |
| Repository impl | Name + Drizzle | `UserDrizzleRepository` |
| DTOs | Suffix with DTO | `CreateUserDTO` |
| Files | kebab-case | `create-user.usecase.ts` |
| Errors | Explicit error classes | `UserAlreadyExistsError` |

Avoid:

* Generic utility abstractions
* Shared base classes for controllers
* Leaking infrastructure logic into domain or application layers

---

## 5. Task Runner

All operations must be run via `task`, never by invoking scripts or docker compose directly.

| Task | Purpose |
|---|---|
| `task dev-up` | Start DEV Postgres container |
| `task dev-stop` | Stop DEV containers |
| `task dev-down` | Remove DEV containers (keep volumes) |
| `task dev-reset` | Remove DEV containers and volumes |
| `task test-up` | Start TEST Postgres container (waits for healthy) |
| `task test-down` | Remove TEST containers |
| `task test-reset` | Remove TEST containers and volumes |
| `task migrate` | Run SQL migrations (requires DATABASE_URL) |
| `task lint` | Run ESLint |
| `task typecheck` | Run TypeScript type check (no emit) |
| `task ci-test` | Full CI test run: reset → up → migrate → jest → down |

Never invoke `docker compose` directly. Always use the Taskfile.

---

## 6. Docker

Three isolated environments with separate compose files:

| Environment | File | Purpose |
|---|---|---|
| dev | `docker/docker-compose.dev.yml` | Local development |
| prod | `docker/docker-compose.prod.yml` | Production |
| test | `docker/docker-compose.test.yml` | Integration/CI tests |

Never mix environments. Never use the dev or prod compose for tests.

---

## 7. Commit & PR Rules

**Commit format:**

```
type: short description
```

Allowed types: `feat`, `fix`, `refactor`, `test`, `docs`, `style`, `chore`

Commit messages must be imperative, concise, and focused on a single change.

Commits must be atomic: each commit should represent a single, self-contained change that leaves the codebase in a working state.
Never batch unrelated changes in a single commit.
Prefer multiple small commits over one large commit per task.

`chore` applies to: tooling changes, configuration updates, dependency management, and developer experience (DX) improvements that do not affect application logic.

Examples:
- chore: add @src path alias
- chore: harden eslint config
- chore: update tsconfig paths


**Branch naming:**

```
feat/feature-name
fix/bug-description
refactor/refactor-description
test/test-description
docs/doc-description
chore/short-description
```

**PR rules:**

PRs must be small and focused. Never mix refactors with features.

PR description structure:

```markdown
## Description
One paragraph summarizing the change and its purpose.

## What was done
- Bullet list of concrete changes made

## Why
Explanation of motivation and architectural reasoning.
Why this approach was chosen and what it enables going forward.
```

**Git workflow:**

The agent must always follow these steps before starting any work:

1. Switch to main: `git switch main`
2. Fetch remote changes: `git fetch origin`
3. Pull latest: `git pull origin main`
4. Create and switch to the new branch from the updated main

After completing any task:
1. Run `task ci-test` and confirm all tests pass. If any test fails, fix it before proceeding.
2. Stop and summarize what was done
3. List all files modified
4. Ask for explicit approval before proceeding to open a PR
5. Only open the PR after receiving confirmation

Never open a PR autonomously. Always wait for human review and approval first.

---

## 8. CI Pipeline

CI runs on all PRs and on pushes to `main`.

Pipeline steps (via GitHub Actions):

1. `pnpm install --frozen-lockfile`
2. `task lint`
3. `task typecheck`
4. `task ci-test` (reset → up → migrate → jest → down)

`DATABASE_URL` is injected from `secrets.TEST_DATABASE_URL`.

A PR must pass all CI steps before merging. Never open a PR that is known to break lint, typecheck, or tests.

---

## 9. Testing

Testing framework: Jest

Test types: integration tests, concurrency tests.

Tests are located in `test/`. Structure example:

```
test/reservation/reservation-concurrency.int.spec.ts
test/user/create-user.e2e.spec.ts
```

Utilities include: test database setup, truncation helpers, concurrency barrier, and factories.

Factories generate valid domain objects for tests.

Tests must prioritize **behavioral verification and business invariants**, not implementation details.

| Command | Purpose |
|---|---|
| `pnpm test` | Run all tests |
| `pnpm test <file>` | Run a specific test file |
| `task ci-test` | Full CI-grade test run with isolated DB |

Critical domain flows must have integration coverage. Concurrency-sensitive logic (reservations) must always be tested.

---

## 10. Architecture Decision Records (ADRs)

ADRs are located in `docs/adr/` and document all major technical decisions:

| ADR | Topic |
|---|---|
| 0001 | Layered architecture |
| 0002 | Architecture enforcement via tooling |
| 0003 | PostgreSQL-first database strategy |
| 0004 | SQL-first migrations |
| 0005 | Drizzle over Prisma |
| 0006 | SQL-first migration runner |
| 0007 | Barber as specialized user |
| 0008 | Drizzle schema in database provider |
| 0009 | Postgres error mapper |
| 0010 | UUID as identifier type |

**Before proposing any structural change, consult the relevant ADR.** If a decision contradicts an existing ADR, flag it explicitly and do not proceed without confirmation.

---

## 11. Domain Glossary

| Term | Definition |
|---|---|
| User | A system user capable of creating reservations |
| Barber | A specialization of a user who can receive reservations. Modeled as relational specialization, not a role enum |
| Reservation | A scheduled appointment between a user and a barber |
| Reservation Conflict | Occurs when a reservation overlaps an existing reservation for the same barber |
| Invalid Reservation Time | Occurs when reservation start/end times violate domain rules |
| CreatedAt | Timestamp generated by the application layer, not the database |
| Repository | Interface used by the application layer to interact with persistence |

---

## 12. Hard Rules

Never place framework code inside the domain layer. Domain must never depend on NestJS, Drizzle, PostgreSQL, HTTP, or DTOs.

Controllers must never access repositories directly. Controllers must call **application use cases only**.

Never modify the database schema without creating a **new migration**. Do not use automatic ORM schema generation.

Do not duplicate SQL error handling logic. All PostgreSQL error interpretation must go through **PostgresErrorMapper**.

Do not introduce generic repositories or query abstractions prematurely.

Do not introduce base controller classes or unnecessary architectural layers.

Do not bypass domain entities when creating business objects.

Do not log using `console.log` in production code.

Avoid premature optimization and speculative abstractions.

**Dependency flow must always be:**

```
interfaces/http → application → domain

infrastructure implements domain interfaces (e.g. repositories)
but is never imported by domain or application directly.
```

Never invert this dependency direction.

Never create a branch from a stale or non-main base unless explicitly instructed otherwise.

## 13. Environment Configuration

The project uses environment-specific `.env` files managed by `task`.

| File | Purpose | Versioned? |
|---|---|---|
| `.env.dev` | Local development variables | Yes |
| `.env.test` | Test environment variables (Default) | Yes |
| `.env.prod` | Production credentials/secrets | **No** |

**How it works:**
- Tasks use `go-task` native `dotenv` support: `dotenv: [ .env.{{.ENV | default "test"}} ]`.
- Running `task dev-*` automatically sets `ENV=dev` and loads `.env.dev`.
- Running `task test-*` (or default tasks) loads `.env.test`.
- Running `task prod-*` automatically sets `ENV=prod` and loads `.env.prod`.

**Primary Variables:**
- `DATABASE_URL`: Active database connection used by migrations and the app.

Never commit `.env.prod` or any other file containing real secrets. Use `.env.dev` and `.env.test` for non-sensitive, reproducible configurations.