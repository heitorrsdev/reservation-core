# Architecture Decision Records (ADR)

This directory contains the **Architecture Decision Records (ADRs)** of the project.

ADRs document **relevant architectural decisions**, the context in which they were made, the alternatives considered, and their consequences.
The goal is to make the **technical reasoning behind the architecture** explicit, facilitating maintenance, evolution, and technical evaluation of the project.

## What is an ADR

An ADR records:

* **Context**: the architectural problem or need
* **Decision**: the choice made
* **Consequences**: positive and negative impacts
* **Alternatives considered** (when applicable)

The decisions described here **reflect the actual state of the code at the time of the commit**.

## Conventions

* Each ADR has a sequential identifier (`0001`, `0002`, …).
* ADRs are **immutable once accepted**, i.e., after the decision has been applied to the code.
* If a decision changes, a new ADR must be created, referencing the previous one.
* ADRs should only be added when the decision is **already applied or immediately applicable** to the code.

## Existing ADRs

|   ID | Title                                |
| ---: | ------------------------------------ |
| 0001 | Layered Architecture                 |
| 0002 | Architecture Enforcement via Tooling |
| 0003 | PostgreSQL-First Database Strategy   |
| 0004 | SQL-First Migrations                 |
| 0005 | Drizzle Over Prisma                  |
| 0006 | SQL-First Migration Runner           |
| 0007 | Barber as Specialized User           |
| 0008 | Drizzle Schema in Database Provider  |
| 0009 | Postgres Error Mapper                |
| 0010 | UUID as Identifier Type              |



---

For business rules and application flows (functional level), see `docs/use-cases.md`.
