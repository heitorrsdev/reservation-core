# ADR 0012 – Entity Factory Method Separation

## Context

Entities in the project previously relied on a single static `create()` method. Originally, this method accepted all entity fields, including `createdAt`. This singular creation path was used both by the application layer when instantiating new entities and by infrastructure mappers when reconstructing entities from database rows.

This blurred the technical distinction between two fundamentally different operations:
1. **Creation**: Representing the birth of a new concept in the domain, where certain invariants (like timestamping the current moment) must be enforced.
2. **Reconstitution**: Hydrating an already existing entity from an external persistence layer, where historical data (like a past `createdAt` timestamp or an inactive `active` state) must be exactly preserved.

When the architectural decision was made to have the domain strictly dictate `createdAt` (ADR 0011), removing the `createdAt` parameter from the `create()` method broke the infrastructure mappers. Mappers suddenly lost their ability to pass historical timestamps back into the entities, demonstrating the flaw in sharing the factory method across boundaries.

## Decision

Entity instantiation is now strictly separated into two distinct static factory methods:

1. **`create(...)`**
   - **Purpose**: Exclusively for new entity creation.
   - **Characteristics**: Never accepts a `createdAt` parameter. Always sets `createdAt` internally to `new Date()`. Enforces creation-time invariants.
   - **Usage restriction**: Must only be called by Use Cases and the Application layer.

2. **`reconstitute(...)`**
   - **Purpose**: Exclusively for infrastructure mappers rebuilding entities from database rows.
   - **Characteristics**: Accepts all persisted fields, including `createdAt`, `id`, and states like `active`. Bypasses creation-time invariants to faithfully restore the object's stored state.
   - **Usage restriction**: Must only be called by Infrastructure mapping layers. Never to be called by the Application layer.

## Consequences

### Positive

* **Semantic Clarity**: The intent behind entity instantiation is explicit. "Creating" a new business object is vastly different from "reconstituting" an existing one.
* **Invariant Enforcement**: Domain invariants tied to the birth of an entity (such as setting the current timestamp) are safely enforced in `create()` without interfering with persistence hydration.
* **Architectural Boundaries**: Mappers are explicitly identified and isolated in their reconstruction paths, preventing the application layer from artificially mocking historical state during standard business flows.

### Negative / Trade-offs

* **Maintenance Overhead**: Developers must maintain two separate factory methods per entity, mapping properties twice.
* **Developer Discipline**: Developers must learn and remember which factory method to use in each context, as the type system alone cannot prevent the Application layer from incorrectly invoking `reconstitute()`. 

These trade-offs are acceptable given the strong decoupling and safety it provides to the domain logic.
