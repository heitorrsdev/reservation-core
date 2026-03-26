export interface GetBarberReservationsCommand {
  barberId: string;
  requesterId: string;
  limit: number;
  offset: number;
  startTime?: Date;
  endTime?: Date;
}
