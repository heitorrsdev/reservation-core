# Reservation Core — Barber Shop Booking System

Backend system for barber shop booking, focused on **layered architecture**, **explicit domain modeling**, and **database-enforced integrity**.

The project prioritizes clear business rules, domain isolation, and SQL-first design for Node.js applications.

---

## Overview

Reservation system connecting users and barbers, with schedule conflicts **prevented at the database level** via constraints.

No redundant application-level pre-validation for concurrency is performed; conflicts are treated as integrity violations and propagated to the domain/application layer.

Core principles:

* Invariants enforced in both domain and database layers
* Unidirectional dependencies between layers
* Documented architectural decisions

---

## Tech Stack

* Node.js + TypeScript
* NestJS (application composition and boundary)
* PostgreSQL
* Drizzle ORM (infrastructure layer only)
* pnpm
* Jest (fully configured for integration and unit testing)

**Migrations:** SQL-first, manually written for explicit control over schema and constraints.

---

## Architecture

Layered architecture with unidirectional dependencies:

```
src/
├── domain         # Entities, value objects, errors, and contracts
├── application    # Use cases and orchestration
└── infrastructure # Database adapters, ORM, and external integrations
```

Dependency rules:

* `domain` is fully isolated, no external dependencies
* `application` depends only on `domain`
* `infrastructure` implements contracts defined in `domain` or `application`
* ESLint enforces architecture rules

Full architectural decisions are documented in [`docs/adr`](./docs/adr).

---

## Domain Model

* **User**
  Identity root. Email and password hash are validated via Value Objects.

* **Barber**
  Specialization of `User` sharing the same identifier. Stores role-specific data in `barbers` table.

* **Client**
  Any `User` who creates a reservation. Not an explicit entity in the domain.

---

## Use Cases

Detailed source of truth: [`docs/use-cases.md`](./docs/use-cases.md)

Implemented and in-progress use cases:

* Create user
* Create barber
* Create reservation
* Cancel reservation
* List barber schedule
* List client reservations

---

## Database and Integrity

* PostgreSQL as source of truth
* Constraints enforce:

  * Relational integrity
  * Prevention of overlapping reservations
* Reservation conflicts are detected at the database level and translated to domain errors
* This approach minimizes race conditions and simplifies application logic

---

## Testing Strategy

* **Unit tests** validate domain logic and value objects
* **Integration tests** enforce invariants under real concurrent conditions
* Transactional repositories and concurrency barrier utilities simulate race conditions
* PostgreSQL `EXCLUDE USING gist` constraints enforce real concurrency protection
* Testing workflow and conventions documented in [`docs/testing.md`](./docs/testing.md)

---

## Documentation

* ADRs (architectural decisions): [`docs/adr`](./docs/adr)
* Detailed use cases: [`docs/use-cases.md`](./docs/use-cases.md)
* Testing conventions and concurrency model: [`docs/testing.md`](./docs/testing.md)

---

## License

[MIT License](LICENSE)
