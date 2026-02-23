# ADR 0008 – Injecting Drizzle Schemas into Database Provider for Type Safety

## Context

The project uses Drizzle ORM for database access with SQL-first migrations.
Drizzle allows injecting schema definitions directly into the database instance, enabling full TypeScript type inference and IDE autocomplete.

A strict Clean Architecture approach would separate:

* Database connection provider (infrastructure bootstrap)
* ORM schema mapping layer
* Repository implementations

In such architecture, the database provider would expose only a raw connection, and repositories would import schemas explicitly.
However, this approach increases boilerplate and reduces developer experience (DX), especially in small single-service codebases.

## Decision

1. **Drizzle schemas will be injected directly into the database provider**

   * The database provider will return a typed Drizzle instance with schema metadata attached.
   * Repositories will consume the typed database instance without manually importing schema definitions.

2. **Schema definitions will remain in the infrastructure layer**

   * Domain entities and value objects will not depend on Drizzle or database schema types.
   * Mapping between domain and persistence will continue to be handled via mappers.

3. **This coupling is accepted as a conscious trade-off for improved DX**

   * The project is a single-service portfolio and study system, where productivity and type safety outweigh future modularization concerns.

## Consequences

### Positive

* Full TypeScript type inference for queries and relations
* Improved IDE autocomplete and developer productivity
* Reduced boilerplate in repository implementations
* Lower risk of runtime type mismatches

### Negative / Trade-offs

* Database provider becomes coupled to all schema definitions
* Harder to modularize or split into multiple services in the future
* Less flexibility for dynamic schema loading or multi-database architectures

These trade-offs are considered acceptable for a portfolio and learning-oriented project.

## Resulting Structure

### infrastructure/database/database.provider.ts

* Responsible for creating the PostgreSQL connection pool
* Initializes Drizzle with schema injection for typed database access

### infrastructure/database/schema/*

* Contains Drizzle schema definitions for all tables
* Does not import domain entities or value objects

### infrastructure/*/repositories

* Consume the typed database instance
* Map persistence models to domain entities using explicit mappers

## Final Observations

This decision prioritizes **developer experience, type safety, and clarity of repository code** over strict architectural purity.
If the system evolves into a multi-module or distributed architecture, the schema injection strategy should be revisited and moved into a dedicated ORM adapter layer.
