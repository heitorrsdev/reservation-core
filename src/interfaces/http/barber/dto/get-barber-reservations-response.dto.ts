export class BarberReservationFullDto {
  id: string;
  userId: string;
  startTime: Date;
  endTime: Date;
}

export class BarberReservationSlotDto {
  startTime: Date;
  endTime: Date;
}

export class PaginationMetaDto {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export class GetBarberReservationsResponseDto {
  data: BarberReservationFullDto[] | BarberReservationSlotDto[];
  meta: PaginationMetaDto;
}
