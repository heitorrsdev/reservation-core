# ADR 0009 – Centralized PostgreSQL Error Mapping Adapter

## Context

Repositories currently inspect database errors directly to detect PostgreSQL constraint violations (e.g., unique constraint `23505`).
This logic was implemented inline in repository classes, resulting in:

* Duplication of error parsing logic across repositories
* Tight coupling between repositories and PostgreSQL error codes
* Reduced readability and maintainability
* Violation of Clean Architecture boundaries (infrastructure concerns leaking into repositories)

Drizzle ORM wraps PostgreSQL errors, requiring custom logic to extract the underlying error code, which further complicates repository implementations.

## Decision

1. **Introduce a dedicated PostgresErrorMapper in the infrastructure layer**

   * Centralizes PostgreSQL error code extraction and classification.
   * Abstracts Drizzle and pg error structures from repositories.

2. **Repositories will depend only on semantic error checks**

   * Example: `PostgresErrorMapper.isUniqueViolation(error)`
   * Repositories will no longer parse error objects manually.

3. **The mapper remains an infrastructure concern**

   * Domain and application layers remain unaware of PostgreSQL-specific details.
   * Only infrastructure repositories may reference the mapper.

## Consequences

### Positive

* Eliminates duplicated error parsing logic
* Improves repository readability and maintainability
* Reduces PostgreSQL coupling leakage into repository code
* Centralizes future database-specific error handling changes
* Easier to extend for additional PostgreSQL error codes

### Negative / Trade-offs

* Introduces an additional infrastructure abstraction layer
* Still PostgreSQL-specific (not a generic SQL error adapter)
* If multi-database support is required, a higher-level error abstraction layer will be needed

These trade-offs are acceptable given the PostgreSQL-first architecture strategy of this project.

## Resulting Structure

### infrastructure/database/postgres-error.mapper.ts

* Responsible for:
  * Extracting PostgreSQL error codes from pg and Drizzle error objects
  * Providing semantic helpers (e.g., unique constraint violation detection)

### infrastructure/*/*.drizzle-repository.ts

* Uses PostgresErrorMapper for database error classification
* Maps database errors to domain-specific errors (e.g., ReservationConflictError)

## Final Observations

This decision reinforces Clean Architecture boundaries by isolating database-specific error handling logic.
Repositories now focus strictly on persistence behavior and domain mapping, while infrastructure-specific error parsing remains centralized and reusable.
If the system evolves into a multi-database architecture, this mapper should be replaced with a generic database error abstraction layer.
