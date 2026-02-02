# ADR 0004: SQL-First Migrations Strategy

## Context

The adoption of advanced PostgreSQL features makes it unfeasible to automatically generate migrations from TypeScript schemas or ORM DSLs.

Automatic migrations tend to cause drift and loss of control in scenarios involving advanced SQL.

## Decision

Adopt a **SQL-first strategy for migrations**, with the following rules:

* Migrations are explicitly written in SQL
* Advanced SQL is encouraged and versioned
* No migration is automatically generated from code

The ORM is used only as an executor and integrator of the migration flow.

## Consequences

* Total predictability over schema changes
* Greater responsibility in writing migrations
* Elimination of fragile abstractions over the database
