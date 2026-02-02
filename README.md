# Reservation Core — Barber Shop Booking System

Barber shop booking backend focused on **layered architecture**, **explicit domain**, and **guaranteed integrity via relational database**.

The project prioritizes clear business rules, domain isolation, and the conscious use of SQL-first in Node.js.

---

## Overview

A reservation system between users and barbers, with schedule conflict detection performed **at the database level** through constraints.

The application does not perform redundant pre-validations for concurrency; conflicts are treated as integrity failures and correctly propagated to the application layer.

Core principles:
- Invariants protected in the domain and the database
- Unidirectional dependencies between layers
- Documented architectural decisions

---

## Tech Stack

- Node.js + TypeScript
- NestJS (application composition and boundary)
- PostgreSQL
- Drizzle ORM (used only in infrastructure)
- pnpm
- Jest (configured; tests still evolving)

**Migrations:** Pure SQL (SQL-first), manually written for explicit control over schema and constraints.

---

## Architecture

Layered architecture with unidirectional dependencies:

```
src/
├── domain         # Entities, VOs, errors, and contracts
├── application    # Use cases and orchestration
└── infrastructure # Database, ORM, and adapters
```

Rules:
- `domain` does not depend on any other layer
- `application` depends only on `domain`
- `infrastructure` implements contracts defined above
- Dependency rules are **enforced via ESLint**

Details and trade-offs documented in: [`docs/adr`](./docs/adr)

---

## Domain Model

- **User**  
  The system's identity root.  
  Email and password hash are validated in the domain via Value Objects.

- **Barber**  
  A specialization of `User`, sharing the same identifier.  
  Has its own table (`barbers`) for role-specific data.

- **Client**  
  Not an explicit entity in the domain.  
  Usage concept: any `User` who creates a reservation.

---

## Use Cases

Source of truth document: [`docs/use-cases.md`](./docs/use-cases.md)

Defined cases:
- Create user
- Create barber
- Create reservation
- Cancel reservation
- List barber schedule
- List client reservations

Not all have infrastructure implemented at the moment.

---

## Database and Integrity

- PostgreSQL as the source of truth
- Constraints for:
  - relational integrity
  - prevention of overlapping schedules
- Reservation conflicts:
  - detected by the database
  - translated into application errors
- This approach reduces race conditions and simplifies application logic

---

## Current Status

Project under development, focusing on structure and architectural correctness:

- ✅ Domain modeled (`User`, `Barber`, `Reservation`)
- ✅ Main use cases defined
- ✅ Reservation conflict constraint implemented
- ⚠️ `User` and `Barber` infrastructure not yet implemented
- ⚠️ Reservation cancellation under definition (state not yet persisted)
- ⚠️ Tests still in early stages

---

## Documentation

- ADRs (decisions and trade-offs): [`docs/adr`](./docs/adr)
- Detailed use cases: [`docs/use-cases.md`](./docs/use-cases.md)

---

## License

[MIT License](LICENSE)
