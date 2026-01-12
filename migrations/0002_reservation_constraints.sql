-- Needed for EXCLUDE USING gist with text + range
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- period derivation
CREATE OR REPLACE FUNCTION reservations_set_period()
RETURNS trigger AS $$
BEGIN
  NEW.period := tstzrange(NEW.start_time, NEW.end_time);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reservations_period_trigger
BEFORE INSERT OR UPDATE ON reservations
FOR EACH ROW
EXECUTE FUNCTION reservations_set_period();

-- logical validation
ALTER TABLE reservations
ADD CONSTRAINT reservations_time_valid
CHECK (end_time > start_time);

-- prevent overlapping reservations per barber
ALTER TABLE reservations
ADD CONSTRAINT reservations_no_overlap
EXCLUDE USING gist (
  barber_id WITH =,
  period WITH &&
);
