# ADR 0011 – Application-Controlled Timestamps

## Context

The initial database schema utilized PostgreSQL's `DEFAULT NOW()` for the `created_at` timestamp columns across various tables.
While convenient, relying on the database to generate timestamps introduced several issues:

* Inconsistent state between the application's domain entities and the persistence layer immediately after creation (the domain entity wouldn't know its `createdAt` value until after persistence and reloading).
* Difficulty in accurately testing time-dependent logic without complex database mocking or workarounds.
* Violation of Domain-Driven Design principles, as the domain should ideally own its invariants and state, including creation timestamps.

In migration 0006, the `DEFAULT NOW()` constraints were removed from `created_at` columns. Currently, `createdAt` is explicitly set via `new Date()` within the domain entity's `create()` factory method. The domain now fully owns timestamp generation, removing this responsibility from the database.

## Decision

1. **`createdAt` is always generated at the application layer**
   * The database schema will not define default values (e.g., `DEFAULT NOW()`) for timestamp columns.
   * Timestamp generation is strictly a domain responsibility.

2. **Entities manage timestamps through factory methods**
   * **`create()`**: Used for instantiating new entities. It internally generates and assigns the `createdAt` timestamp (e.g., via `new Date()`) and never accepts it as an external input.
   * **`reconstitute()`**: Used exclusively by infrastructure mappers to rebuild domain entities from database rows. It accepts all fields, including the persisted `createdAt` timestamp, ensuring the domain entity accurately reflects the stored state.

## Consequences

### Positive

* **Consistent behavior:** Time is predictable and consistent across both test and production environments.
* **Domain invariant control:** The domain fully controls and owns its state, including when an entity was conceptually created, without relying on external persistence mechanisms.
* **No hidden database behavior:** The persistence layer accurately reflects what the application explicitly provides, reducing magic and hidden side effects.

### Negative / Trade-offs

* **Application responsibility:** The application must always explicitly provide the `createdAt` value before persistence; the database will no longer act as a safety net for missing timestamps.
* **Database limitations:** The database cannot independently generate new records with valid timestamps (e.g., via manual SQL inserts or external scripts) without explicitly providing the `created_at` value.

These trade-offs are deliberate. The architectural benefits of domain-owned state and improved testability far outweigh the convenience of database-generated timestamps.
