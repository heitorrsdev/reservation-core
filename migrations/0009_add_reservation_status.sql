CREATE TYPE reservation_status AS ENUM ('active', 'cancelled');

ALTER TABLE reservations
ADD COLUMN status reservation_status NOT NULL DEFAULT 'active';

-- prevent overlapping active reservations per barber
ALTER TABLE reservations DROP CONSTRAINT reservations_no_overlap;

ALTER TABLE reservations
ADD CONSTRAINT reservations_no_overlap
EXCLUDE USING gist (
  barber_id WITH =,
  period WITH &&
) WHERE (status = 'active'::reservation_status);
