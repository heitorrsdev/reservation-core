CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Reservation"

CREATE OR REPLACE FUNCTION reservation_set_period()
RETURNS trigger AS $$
BEGIN
  NEW.period := tstzrange(NEW."startTime", NEW."endTime");
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reservation_period_trigger
BEFORE INSERT OR UPDATE ON "Reservation"
FOR EACH ROW
EXECUTE FUNCTION reservation_set_period();

ALTER TABLE "Reservation"
ADD CONSTRAINT reservation_time_valid
CHECK ("endTime" > "startTime");

ALTER TABLE "Reservation"
ADD CONSTRAINT no_overlapping_reservations
EXCLUDE USING gist (
  "barberId" WITH =,
  "period" WITH &&
);
