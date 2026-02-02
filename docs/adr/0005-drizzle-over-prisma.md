# ADR 0005: Adoption of Drizzle ORM over Prisma

## Context

The project was started using Prisma ORM, aiming for productivity and strong typing.

As the domain evolved, requirements emerged that demand extensive use of advanced PostgreSQL features, creating friction with Prisma's abstraction model.

## Decision

Replace Prisma ORM with **Drizzle ORM**, adopting an ORM-thin and SQL-first approach.

Determining criteria:

* Less abstraction over PostgreSQL
* Better coexistence with explicit SQL
* Reduction of workarounds and risk of drift
* Alignment with the PostgreSQL-first strategy

## Consequences

* Closer proximity between code and database
* Less ORM "magic"
* More explicit responsibility in the infrastructure layer
