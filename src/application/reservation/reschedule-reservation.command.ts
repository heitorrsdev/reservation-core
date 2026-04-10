export interface RescheduleReservationCommand {
  reservationId: string;
  actorId: string;
  newStartTime: Date;
  newEndTime: Date;
}
