export class InvalidReservationTimeError extends Error {
  constructor() {
    super('End time must be after start time');
  }
}
