# ADR 0002: Architectural Governance via TypeScript and ESLint

## Context

Layered architecture, by itself, is not enough to prevent structural violations over time, especially in a flexible framework like NestJS.

Relying solely on human discipline to maintain architectural boundaries is fragile and does not scale.

## Decision

Use **TypeScript and ESLint as architectural enforcement tools**, applying explicit restrictions during development time.

The strategy includes:

* Path aliases reflecting the architectural layers
* Import rules that prevent invalid dependencies between layers
* Architectural violations treated as lint errors, not as informal conventions

## Consequences

* Architectural violations are detected immediately
* Less structural freedom in exchange for greater consistency
* Architecture treated as a technical rule, not as an optional guideline
