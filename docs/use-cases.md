# Use Cases — Reservation System

This document defines the **essential use cases** of the system.
It describes the expected business rules that impact schema, queries, and validations.

> **Note on actors:**
> All actors in this document represent roles played by system Users.
> Client is the user who makes reservations.
> Barber is a specialized user with their own schedule.
> Administrative Process represents internal or administrative system actions.

---

## UC-00 — Create User

**Actor:** User (Registration)

### Primary Flow

1. System receives email and password
2. System validates email format
3. System generates and validates the password hash
4. User is successfully created

### Business Rules

* Email must have a valid format
* Email must be unique
* Password **is not stored in plain text**
* User is created as the system's base entity

---

## UC-01 — Create Barber

**Actor:** Administrative Process

### Primary Flow

1. System receives a `userId`
2. System verifies if the user exists
3. System verifies if the user is already a barber
4. System creates the barber associated with the user

### Business Rules

* Barber is a **user specialization**
* A user can be a barber **at most once**
* The barber's identity is derived from the user's identity
* Barber is created as active by default

---

## UC-02 — Create Reservation

**Actor:** Client

### Primary Flow

1. Client selects a barber
2. Provides `start_time` and `end_time`
3. System validates:
   * valid time interval
   * active barber
4. System attempts to create the reservation
5. Reservation is successfully created

### Business Rules

* `start_time` must be before `end_time`
* The interval must represent a valid reservation time
* The barber must be active
* The system **does not pre-check availability beforeband**
* Schedule conflicts are handled via **database constraint**
* Constraint violation results in a **reservation conflict error**

---

## UC-03 — Cancel Reservation

**Actor:** Client or Barber

### Primary Flow

1. System verifies if the reservation exists
2. System verifies authorization:
   * belongs to the client **or**
   * to the barber
3. Reservation is marked as cancelled (soft state)

### Observations

* Reservation **is not deleted**
* Cancellation persistence (e.g., `status`, `canceled_at`) not yet implemented

---

## UC-04 — List Barber Schedule

**Actor:** Barber

### Primary Flow

1. System receives a date range (`start_time` / `end_time`)
2. Returns the barber's reservations in the period
3. Result sorted by `start_time`

### Pending Decisions

* Inclusion of cancelled reservations
* Visibility policy per period

---

## UC-05 — List Client Reservations

**Actor:** Client

### Primary Flow

1. Returns the client's reservations
2. Paginated result
3. Sorted by `start_time`

### Pending Decisions

* Inclusion of cancelled reservations
* Visibility policy for past reservations

### Observations

* Dates and times are handled in UTC

---

## UC-06 — List All Barbers

**Actor:** Client (or Public)

### Primary Flow

1. System queries all active barbers
2. Returns the list of barbers with their public profile data

### Business Rules

* Response must **not expose sensitive user data** (e.g., password hashes)
* Reflects the architectural decision that Barber is a **specialization of User** (see ADR-0007)
* Only active barbers are included in the result

---

## UC-07 — Get Reservation by ID

**Actor:** Client or Barber

### Primary Flow

1. System receives a reservation ID and the actor's ID
2. System verifies if the reservation exists
3. System validates authorization:
   * Client can only view **their own** reservation
   * Barber can only view reservations **assigned to them**
4. Returns the reservation details

### Business Rules

* **IDOR protection** must be enforced — actors cannot access reservations they do not own
* Unauthorized access results in an authorization error, not a not-found error (to avoid information leakage)

---

## UC-08 — User Authentication (Login)

**Actor:** User

### Primary Flow

1. System receives credentials (email and password)
2. System looks up the user by email
3. System verifies the provided password against the stored Argon2 hash
4. On success, system issues an **Access Token** and a **Refresh Token**
5. Refresh token hash is persisted in the database

### Business Rules

* Passwords are **verified via Argon2** — never compared in plain text
* Access tokens are **stateless JWTs** with a short expiration (see ADR-0013)
* Refresh tokens are **stateful** and stored as a hash in the database (see ADR-0014)
* Refresh tokens must **never be persisted in plain text**
* Invalid credentials result in a generic authentication error (no distinction between wrong email and wrong password)

---

## UC-09 — Reschedule Reservation

**Actor:** Client or Barber

### Primary Flow

1. System receives a reservation ID, the actor's ID, new `start_time`, and new `end_time`
2. System verifies if the reservation exists
3. System validates authorization:
   * Client can only reschedule **their own** reservation
   * Barber can only reschedule reservations **assigned to them**
4. System validates the reservation is not in the past (`currentTime >= original start_time` is rejected)
5. System validates client did not request a reschedule with less than 1 hour of notice
6. System validates that `new_end_time > new_start_time`
7. System checks for scheduling conflicts for the barber in the new time window
8. Reservation times are updated successfully

### Business Rules

* **Cancelled reservations cannot be rescheduled** — throws a conflict error
* **IDOR protection** must be enforced — only the owning client or the assigned barber may reschedule
* Reservations whose **original `start_time` is already in the past** cannot be rescheduled
* **Clients** cannot reschedule with **less than 1 hour** of notice before the original `start_time`
* **Barbers** are not subject to the 1-hour notice restriction
* `new_end_time` must be strictly after `new_start_time`
* Rescheduling to a **conflicting time window** (overlap with another active reservation for the same barber) is rejected via database exclusion constraint
