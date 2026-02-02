# ADR 0001: Layered Architecture with Dependency Inversion

## Context

The project has a domain with non-trivial business rules and requires a clear separation between business logic, use case orchestration, infrastructure details, and the HTTP interface.

The domain is treated as the core of the system, following Domain-Driven Design (DDD) principles.

Frameworks like NestJS offer high structural flexibility, which can lead to excessive coupling between layers if there is no explicit architectural decision regarding dependency direction and abstraction control.

## Decision

Adopt a **layered architecture** based on the **Dependency Inversion Principle (DIP)**, with well-defined responsibilities and unidirectional dependencies:

- **Domain**: the business core, containing entities, rules, and abstractions
- **Application**: use case orchestration and domain coordination
- **Infrastructure**: technical details, ORM, database, and external integrations
- **HTTP**: entry interface (controllers, DTOs, modules)

### Fundamental Rules

- Inner layers **do not depend** on outer layers
- The domain **does not know** about frameworks, ORM, database, or delivery mechanisms
- Inner layers depend only on **abstractions**
- Outer layers provide **concrete implementations**
- The link between abstractions and implementations is made via **Dependency Injection**, preferably through the framework's container
- Dependencies always flow **from the outside in**

## Consequences

- Domain isolated from technical details
- Reduction of structural and accidental coupling
- Ease of unit testing and infrastructure replacement
- Greater architectural predictability
- Requirement for more discipline in the use of abstractions and explicit dependency registration
