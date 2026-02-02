# ADR 0003: PostgreSQL-First Database Strategy for the Data Model

## Context

The application domain involves rules related to time, concurrency, and integrity that are naturally expressed at the database level.

Implementing these rules only in the application layer increases the risk of inconsistency and race conditions.

## Decision

Adopt a **PostgreSQL-first** approach, where the database is the **source of truth** for structural and integrity rules.

Guidelines:

* Critical rules live in the database whenever possible
* Advanced PostgreSQL features are considered part of the domain
* The ORM is not responsible for abstracting complex database semantics

## Consequences

* Strong guarantees of integrity and concurrency
* Reduction of defensive logic in the application
* Greater conscious dependency on PostgreSQL
