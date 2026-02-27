BEGIN;

-- Drop constraints that depend on TEXT ids

ALTER TABLE reservations
    DROP CONSTRAINT reservations_user_fk;

ALTER TABLE reservations
    DROP CONSTRAINT reservations_barber_fk;

ALTER TABLE barbers
    DROP CONSTRAINT barbers_user_fk;

ALTER TABLE reservations
    DROP CONSTRAINT reservations_no_overlap;

-- Drop primary keys

ALTER TABLE reservations
    DROP CONSTRAINT reservations_pkey;

ALTER TABLE barbers
    DROP CONSTRAINT barbers_pkey;

ALTER TABLE users
    DROP CONSTRAINT users_pkey;

-- Convert columns from TEXT to UUID

ALTER TABLE users
    ALTER COLUMN id TYPE uuid USING id::uuid;

ALTER TABLE barbers
    ALTER COLUMN id TYPE uuid USING id::uuid;

ALTER TABLE reservations
    ALTER COLUMN id TYPE uuid USING id::uuid;

ALTER TABLE reservations
    ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

ALTER TABLE reservations
    ALTER COLUMN barber_id TYPE uuid USING barber_id::uuid;

-- Recreate primary keys

ALTER TABLE users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);

ALTER TABLE barbers
    ADD CONSTRAINT barbers_pkey PRIMARY KEY (id);

ALTER TABLE reservations
    ADD CONSTRAINT reservations_pkey PRIMARY KEY (id);

-- Recreate foreign keys

ALTER TABLE reservations
    ADD CONSTRAINT reservations_user_fk
    FOREIGN KEY (user_id)
    REFERENCES users(id);

ALTER TABLE reservations
    ADD CONSTRAINT reservations_barber_fk
    FOREIGN KEY (barber_id)
    REFERENCES barbers(id);

ALTER TABLE barbers
    ADD CONSTRAINT barbers_user_fk
    FOREIGN KEY (id)
    REFERENCES users(id)
    ON DELETE CASCADE;

-- Recreate exclusion constraint (required because barber_id type changed)

ALTER TABLE reservations
    ADD CONSTRAINT reservations_no_overlap
    EXCLUDE USING gist (
        barber_id WITH =,
        period WITH &&
    );

COMMIT;
