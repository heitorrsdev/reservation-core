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
