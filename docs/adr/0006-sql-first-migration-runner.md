# ADR 0006 — SQL-First Migration Runner

## Context

The project adopts a **PostgreSQL-first** strategy, utilizing advanced database features such as:

- `tstzrange`
- `EXCLUDE USING gist`
- triggers
- extensions (`btree_gist`)

Traditional ORM tools (e.g., Prisma) impose limitations when dealing with advanced SQL, creating friction and loss of control over the schema.

Additionally, the project requires:

- explicit migration history
- deterministic execution
- total control over the executed SQL
- independence from opinionated tools

## Decision

A **custom migration runner** based on pure SQL was implemented, with the following characteristics:

- Migrations versioned in `.sql` files
- Incremental execution based on a `schema_migrations` table
- Application of each migration within a transaction
- Idempotent and deterministic execution
- Runner implemented in TypeScript using `pg`

The `schema_migrations` table is automatically created if it does not exist, eliminating manual dependencies.

## Consequences

### Positive

- Total control over the schema
- Unrestricted support for advanced SQL
- Predictable execution in DEV and PROD
- Reduced dependency on ORM

### Negative

- Less automation than traditional ORMs
- Explicit responsibility for versioning and migration order

## Alternatives Considered

- **Prisma Migrate**  
  Rejected due to limitations with advanced SQL and high operational friction.

- **External tools (Flyway, Liquibase)**  
  Rejected to maintain simplicity, local control, and less dependency on external tooling.

## Notes

- **High Volumetry (Concurrent Indexing):** The custom runner wraps each migration entirely inside a single transaction (`BEGIN` / `COMMIT`). PostgreSQL explicitly forbids running `CREATE INDEX CONCURRENTLY` inside transaction blocks. In a high-volumetry environment, standard index creation will lock large tables and cause downtime. The runner will need to be enhanced in the future to support non-transactional migrations.
- **Distributed Locking:** The current implementation does not use `pg_advisory_lock`. In a horizontally scaled environment, multiple instances attempting to run migrations simultaneously might lead to race conditions.
