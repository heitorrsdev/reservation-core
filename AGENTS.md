# AGENTS.md

## 1. Project Overview

This project is a backend service for a **barbershop reservation system** designed with strong architectural discipline.

The primary goal is **long-term maintainability and correctness**, not rapid prototyping.
The architecture follows **strict layered separation** and **domain-driven modeling**.

The system currently supports:

* User registration
* Authentication using **JWT access tokens and refresh tokens**
* Barber management (modeled as a specialization of users)
* Reservation scheduling between users and barbers
* Reservation lifecycle management (create, cancel, reschedule)
* Reservation conflict prevention and concurrency protection

The project already includes:

* Fully implemented **domain layer**
* Application **use cases**
* Database **repositories**
* **HTTP interface**
* **Authentication system**
* **Integration and concurrency tests**

The system prioritizes **correct domain invariants**, **transaction safety**, and **explicit architecture boundaries**.

---

# 2. Tech Stack

| Concern                 | Tool                          |
| ----------------------- | ----------------------------- |
| Language                | TypeScript                    |
| Runtime                 | Node.js                       |
| Framework               | NestJS                        |
| Database                | PostgreSQL                    |
| Query Builder / Mapping | Drizzle ORM                   |
| Migrations              | SQL-first manual migrations   |
| Authentication          | JWT (stateless access tokens) |
| Password hashing        | argon2                        |
| Refresh token hashing   | argon2                        |
| Logging                 | Pino                          |
| Testing                 | Jest                          |
| Package manager         | pnpm                          |
| Containerization        | Docker                        |
| Task runner             | go-task                       |

Important design principle:

**The database schema is authoritative and defined via SQL migrations, not via ORM models.**

---

# 3. Project Structure

```
src/
  domain/           # Pure business logic
  application/      # Use cases and orchestration
  infrastructure/   # Database, repositories, auth, logging
  interfaces/http/  # Controllers, DTOs, filters, decorators

migrations/         # Versioned SQL migrations

docs/
  adr/              # Architecture Decision Records
  testing.md
  use-cases.md

test/
  e2e tests
  integration tests
  concurrency tests
  test utilities
  factories

docker/
  docker-compose.dev.yml
  docker-compose.prod.yml
  docker-compose.test.yml
```

---

# 4. Layer Responsibilities

### Domain

Pure business logic.

Contains:

* Entities
* Value Objects
* Domain Errors
* Repository Interfaces

Restrictions:

* No framework imports
* No database code
* No HTTP code

---

### Application

Coordinates domain logic.

Contains:

* Use cases
* Commands
* Repository tokens for DI
* Service interfaces (token generator, password hasher)

Application layer **does not know infrastructure implementations**.

---

### Infrastructure

Implements interfaces defined by domain/application.

Contains:

* Drizzle repositories
* PostgreSQL integration
* JWT authentication
* Password hashing (argon2)
* Refresh token persistence
* Logging (Pino)

Infrastructure must **never leak into domain**.

---

### Interfaces (HTTP)

External interface.

Contains:

* Controllers
* DTOs
* Validation
* Exception filters
* HTTP ↔ Domain error mapping
* Authentication decorators

Controllers call **use cases only**.

---

# 5. Code Conventions

Favor **explicitness over abstraction**.

| Element                   | Convention                    |
| ------------------------- | ----------------------------- |
| Entities                  | PascalCase                    |
| Use cases                 | VerbBasedUseCase              |
| Commands                  | VerbDomainObjectCommand       |
| Repository interface      | DomainNameRepository          |
| Repository implementation | NameDrizzleRepository         |
| DTOs                      | `*.dto.ts`                    |
| Files                     | kebab-case                    |
| Errors                    | Explicit domain error classes |

Avoid:

* Generic repositories
* Base controllers
* Premature abstractions
* Cross-layer shortcuts

---

# 6. Task Runner

All project operations must be executed through **Taskfile tasks**.

Never call `docker compose` directly.

Key tasks:

| Task                                   | Purpose                       |
| -------------------------------------- | ----------------------------- |
| `task up ENV=dev`                      | Start development environment |
| `task down ENV=dev`                    | Stop development environment  |
| `task reset ENV=dev`                   | Reset development DB          |
| `task up`                              | Start test DB                 |
| `task migrate`                         | Run migrations                |
| `task test`                            | Full isolated test run        |
| `task test-watch FILES="file.spec.ts"` | Run specific tests            |

Testing pipeline:

```
task test
```

This runs:

```
reset → up → migrate → jest → down
```

---

# 7. Docker Environments

Three isolated environments:

| Environment | File                    |
| ----------- | ----------------------- |
| dev         | docker-compose.dev.yml  |
| prod        | docker-compose.prod.yml |
| test        | docker-compose.test.yml |

Each environment has its own database.

Never mix environments.

---

## 8. Commit & PR Rules

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

Never append generated IDs, timestamps, hashes, or any automatic suffix to branch names.
Branch names must always follow exactly: type/short-description

Correct: refactor/domain-entity-created-at

Wrong: refactor/domain-entity-created-at-12618706006155161774

**PR rules:**

PRs must be small and focused. Never mix refactors with features.

PR description structure:

```markdown
## Description
One paragraph summarizing the change.

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
1. Run `task test` and confirm all tests pass. If any test fails, fix it before proceeding.
2. Stop and summarize what was done
3. List all files modified
4. Ask for explicit approval before proceeding to open a PR
5. Only open the PR after receiving confirmation

Never open a PR autonomously. Always wait for human review and approval first.

---

# 9. Environment Configuration

Environment variables are managed via **Taskfile dotenv integration**.

Files:

| File        | Purpose             | Versioned |
| ----------- | ------------------- | --------- |
| `.env.dev`  | Local development   | Yes       |
| `.env.test` | Testing environment | Yes       |
| `.env.prod` | Production secrets  | No        |

Tasks automatically load the correct file.

Example:

```
task up ENV=dev
```

loads:

```
.env.dev
```

---

# 10. Testing

Testing framework: **Jest**

Test types:

* End-to-end tests
* Integration tests
* Concurrency tests

Structure:

```
test/
  auth/
  barber/
  reservation/
  user/
  factories/
  utils/
```

Factories generate valid domain objects.

Concurrency-sensitive flows must always have tests.

Reservation creation is heavily validated under concurrent scenarios.

---

# 11. Architecture Decision Records (ADR)

Located in:

```
docs/adr/
```

These documents define the **architectural rules of the system**.

Key decisions include:

| ID   | Decision                          |
| ---- | --------------------------------- |
| 0001 | Layered architecture              |
| 0003 | PostgreSQL-first strategy         |
| 0004 | SQL-first migrations              |
| 0005 | Drizzle over Prisma               |
| 0010 | UUID identifiers                  |
| 0011 | Application-controlled timestamps |
| 0013 | Stateless JWT authentication      |
| 0014 | Refresh token strategy            |
| 0015 | Structured logging with Pino      |

Before proposing structural changes, consult ADRs.

If a proposal contradicts an ADR, **stop and request clarification**.

---

# 12. Domain Glossary

| Term                 | Meaning                                            |
| -------------------- | -------------------------------------------------- |
| User                 | System user who creates reservations               |
| Barber               | Specialized user capable of receiving reservations |
| Reservation          | Appointment between user and barber                |
| Reservation Conflict | Overlapping reservations for same barber           |
| Access Token         | Short-lived JWT used for authentication            |
| Refresh Token        | Stateful token used to renew access tokens         |
| Repository           | Persistence interface used by application layer    |

---

# 13. Hard Rules

### Entity factories

Entities must expose two factory methods:

```
create()
reconstitute()
```

Rules:

* `create()`
  Used when creating new entities
  Must internally generate `createdAt`.

* `reconstitute()`
  Used by infrastructure mappers when rebuilding entities from database rows.

Never mix their usage.

---

### Layer dependency rule

Dependencies must always flow:

```
interfaces → application → domain
```

Infrastructure implements domain interfaces but **must never be imported by domain or application directly**.

---

### Repository access

Controllers must **never access repositories directly**.

They must call **application use cases only**.

---

### Database schema

Never modify database structure without creating a **new migration**.

Automatic ORM schema generation is forbidden.

---

### Authentication

All endpoints are **protected by default** using `JwtAuthGuard`.

Endpoints that must be public must explicitly use:

```
@Public()
```

---

### Security rules

* Refresh tokens must never be stored in plaintext.
* Always store **argon2 hash**.
* Do not log secrets.
* Never use `console.log` in production code.

---

### Error handling

PostgreSQL errors must be interpreted only through:

```
PostgresErrorMapper
```

Do not duplicate SQL error handling logic elsewhere.

---

### Architecture discipline

Never introduce:

* Generic repositories
* Base controllers
* Cross-layer shortcuts
* Premature abstractions

---

### Branching rule

Always start work from the latest `main`.

Never create branches from stale bases.

---

## Important Principle

The architecture intentionally favors:

* **clarity over abstraction**
* **explicit domain modeling**
* **strict boundaries**
* **long-term maintainability**

When in doubt, prefer the **simplest solution that preserves architecture rules**.
