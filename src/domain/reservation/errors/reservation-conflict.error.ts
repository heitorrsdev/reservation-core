export class ReservationConflictError extends Error {
  constructor() {
    super('The barber already has a reservation in this time range');
  }
}
