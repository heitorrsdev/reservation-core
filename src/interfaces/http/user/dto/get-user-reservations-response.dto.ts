export class UserReservationDto {
  id: string;
  barberId: string;
  startTime: Date;
  endTime: Date;
  status: string;
  createdAt: Date;
}

export class GetUserReservationsResponseDto {
  data: UserReservationDto[];
}
