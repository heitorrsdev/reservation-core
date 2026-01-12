-- ENUMS
CREATE TYPE user_role AS ENUM ('CLIENT', 'BARBER', 'ADMIN');

-- USERS
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX users_role_idx ON users(role);

-- BARBERS
CREATE TABLE barbers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    bio TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX barbers_active_idx ON barbers(active);

-- RESERVATIONS
CREATE TABLE reservations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    barber_id TEXT NOT NULL,

    start_time TIMESTAMPTZ NOT NULL,
    end_time   TIMESTAMPTZ NOT NULL,

    period tstzrange NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT reservations_user_fk
        FOREIGN KEY (user_id) REFERENCES users(id),

    CONSTRAINT reservations_barber_fk
        FOREIGN KEY (barber_id) REFERENCES barbers(id)
);

CREATE INDEX reservations_barber_idx ON reservations(barber_id);
