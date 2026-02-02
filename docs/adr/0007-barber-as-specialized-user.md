# ADR 0007 – User as Identity, Barber as Specialization (Shared Primary Key)

## Context

The system needs to handle reservations between clients and barbers. The initial model attempted to represent this using:

* `users` with a `role` field (CLIENT | BARBER | ADMIN)
* A separate `barbers` table

This created conceptual ambiguity:

* A barber was simultaneously a *role* and an *entity*
* The source of truth regarding "who is a barber" was duplicated
* The `reservations` table became dependent on poorly defined entities

Additionally, the `ADMIN` role has no real use cases at the moment, characterizing YAGNI (You Ain't Gonna Need It).

## Decision

1. **User will be treated exclusively as identity/authentication**

   * Represents any person who can authenticate in the system
   * Carries no business semantics beyond that

2. **Barber will be a specialization of User**

   * A barber is a User with additional data and behaviors
   * The existence of a record in `barbers` defines whether the User is a barber

3. **User ↔ Barber relationship will be 1:1 with a shared primary key**

   * `barbers.id` will be both the PK and a FK to `users.id`
   * Ensures strong consistency: no Barber exists without a User

4. **There will be no explicit distinction for "Client"**

   * A Client is any User who is **not** a Barber
   * A Barber can act as a client (e.g., booking a time with another barber)

5. **The Admin concept will be removed**

   * There is no current need
   * Avoids premature complexity and special rules

## Consequences

### Positive

* Elimination of conceptual duplication (role vs. entity)
* Model aligned with common practices in marketplace systems
* Clearer business rules that are easier to evolve
* Database correctly reflects the domain

### Negative / Trade-offs

* The distinction between client and barber is not explicit via enum or flag
* Queries need to use `JOIN` or `EXISTS` to verify if a User is a Barber
* Role-based authorization will require its own layer in the future

These trade-offs are considered acceptable and preferable to the rigidity and ambiguity of the previous model.

## Resulting Conceptual Structure

### users

* id (PK)
* email
* password_hash
* created_at

### barbers

* id (PK, FK → users.id)
* name
* bio
* active
* created_at

### reservations

* id (PK)
* user_id (FK → users.id)      -- client
* barber_id (FK → barbers.id)
* start_time
* end_time
* period
* created_at

Time and overlap constraints remain unchanged.

## Final Observations

This decision focuses exclusively on **correct domain and database modeling**.
Authorization issues (e.g., who can create a schedule, serve clients, etc.) will be handled later at the application level.
