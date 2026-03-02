## Testing Strategy

This project adopts a **multi-layered testing strategy** focused on enforcing domain invariants, validating persistence guarantees, and ensuring correct behavior under real database constraints.

The goal is not only to test isolated logic, but to verify that **architectural boundaries and database-level invariants hold under realistic conditions**, including concurrent execution.

---

## Test File Naming Conventions

| Suffix         | Meaning           | Scope                                  |
| -------------- | ----------------- | -------------------------------------- |
| `.spec.ts`     | Unit tests        | Domain / pure logic                    |
| `.int.spec.ts` | Integration tests | Database, repositories, infrastructure |
| `.e2e-spec.ts` | End-to-end tests  | HTTP / NestJS application layer        |

Test folders mirror bounded contexts (e.g., `test/reservation`, `test/user`).

---

## Test Types

### Unit Tests (Domain Layer)

Unit tests validate pure domain behavior without infrastructure dependencies.

**Targets:**

* Entities
* Value objects
* Domain services
* Logical invariants (e.g., reservation time validity)

**Characteristics:**

* No database
* No NestJS container
* No IO
* Deterministic and fast

These tests validate business rules independently from persistence concerns.

---

### Integration Tests (Persistence & Infrastructure)

Integration tests validate interaction with a real PostgreSQL database.

**Targets:**

* Repository implementations
* Database constraints (UNIQUE, EXCLUDE, FK)
* Error mapping (PostgreSQL → domain errors)
* Schema behavior and migrations

**Characteristics:**

* Uses isolated PostgreSQL container via Docker
* Schema migrations executed before the test suite
* Database truncated before each test for deterministic isolation
* No mocks for persistence layer
* Enforced in CI

Integration tests intentionally rely on real database behavior rather than mocks.
Database constraints are treated as part of the system’s correctness model.

---

### Concurrency Tests

Concurrency tests validate that race conditions are prevented under parallel execution.

**Key invariants tested:**

* A barber cannot have overlapping reservations
* Only one concurrent reservation for the same time slot can succeed

**Strategy:**

* Multiple concurrent transactions are started
* Execution is synchronized using a barrier to ensure simultaneous writes
* `Promise.allSettled` is used to observe outcomes
* PostgreSQL `EXCLUDE USING gist` constraint enforces correctness
* Constraint violations are mapped to `ReservationConflictError`

These tests validate that concurrency protection is enforced at the database level and correctly surfaced at the domain layer.

---

## Invariant Enforcement Model

Invariant enforcement is intentionally split across layers:

* **Domain layer** validates logical invariants (e.g., time range validity).
* **Database layer** enforces structural and concurrency invariants (e.g., overlapping reservations).
* **Repositories** translate database constraint violations into domain-specific errors.

This ensures correctness even under concurrent execution and prevents reliance on application-level checks alone.

---

## Database Test Lifecycle

Integration tests rely on a deterministic PostgreSQL environment:

1. Docker PostgreSQL container for tests
2. SQL migrations executed before the test suite
3. Tables truncated (with cascade) before each test
4. Isolated connection pool for test execution

This guarantees test isolation and reproducibility.

---

## Taskfile Test Commands

| Command             | Description                     |
| ------------------- | ------------------------------- |
| `task test-reset`   | Drop and recreate schema        |
| `task test-up`      | Start PostgreSQL test container |
| `task test-migrate` | Execute SQL migrations          |
| `task test`         | Run Jest test suite             |

---

## End-to-End Tests

E2E tests validate HTTP behavior through the NestJS application layer.

**Targets:**

* Controllers
* Use cases
* Serialization
* HTTP error mapping

These tests verify that domain and infrastructure layers integrate correctly at the application boundary.

---

## Future Improvements

* Property-based testing for reservation time-slot edge cases
* High-load concurrency stress testing
* CI-level performance thresholds for critical paths
