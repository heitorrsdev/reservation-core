export interface CreateReservationCommand {
  userId: string;
  barberId: string;
  startTime: Date;
  endTime: Date;
}
