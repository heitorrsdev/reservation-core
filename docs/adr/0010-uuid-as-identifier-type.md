# ADR 0010 – UUID as Native Identifier Type

## Context

The initial database schema defined all primary and foreign key identifiers as `TEXT`:

* `users.id`
* `barbers.id`
* `reservations.id`
* `reservations.user_id`
* `reservations.barber_id`

Although UUID values were already generated and used at the application layer, the database did not enforce UUID typing.

This created several structural problems:

* No format validation at the database level
* Possibility of persisting invalid identifier values
* Semantic mismatch between application and persistence layers
* Larger index footprint compared to native `UUID`
* Weakened type guarantees at the persistence boundary

Because the system is still in an early stage and no production data exists, the cost of correcting the schema is minimal.

Keeping identifiers as `TEXT` would be a technically weak decision: it sacrifices type safety for no practical benefit.

## Decision

1. **All identifier columns will use PostgreSQL’s native `UUID` type**

   The following columns will be migrated from `TEXT` to `UUID`:

   * `users.id`
   * `barbers.id`
   * `reservations.id`
   * `reservations.user_id`
   * `reservations.barber_id`

2. **UUID generation remains at the application layer**

   * The database will not define a default UUID generator (`gen_random_uuid()`).
   * The application remains responsible for identifier creation.
   * This preserves architectural consistency and avoids hidden persistence-layer behavior.

3. **Foreign key constraints remain unchanged semantically**

   * Only the column types are adjusted.
   * Referential integrity rules remain intact.

## Consequences

### Positive

* Enforced structural validation at the database level
* Stronger type safety at the persistence boundary
* Improved semantic alignment between ORM and database schema
* Smaller and more efficient indexes compared to `TEXT`
* Clearer long-term schema correctness

### Negative / Trade-offs

* Requires a migration altering primary and foreign key column types
* Slightly more rigid schema (intentional constraint)
* Tighter coupling to PostgreSQL UUID support (acceptable given the PostgreSQL-first strategy)

These trade-offs are deliberate and technically justified. The benefits in correctness and integrity outweigh the migration cost.

## Resulting Structure

### Database Schema

* All primary keys defined as `UUID`
* All foreign keys referencing `UUID`
* No default UUID generation at the database level

### Application Layer

* UUID generation remains centralized in the application
* ORM models updated to reflect `UUID` type explicitly

## Final Observations

Using `TEXT` for identifiers when the domain explicitly uses UUIDs is an architectural inconsistency and a type-safety regression.

This decision restores semantic correctness at the persistence boundary and prevents subtle data integrity issues.

If, in the future, a multi-database strategy is adopted, identifier typing must be re-evaluated. For a PostgreSQL-first architecture, native `UUID` is the technically sound choice.
