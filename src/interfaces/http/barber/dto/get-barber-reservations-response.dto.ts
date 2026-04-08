import { ApiProperty } from '@nestjs/swagger';

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
  @ApiProperty({
    type: 'array',
    items: { type: 'object', additionalProperties: true },
  })
  data: BarberReservationFullDto[] | BarberReservationSlotDto[];

  meta: PaginationMetaDto;
}
