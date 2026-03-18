import { CreateReservationUseCase } from '@application/reservation/create-reservation.usecase';
import { Body, Controller, Post } from '@nestjs/common';

import { CreatedResponseDto } from '../common/dto/created-response.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Controller('reservations')
export class ReservationController {
  constructor(
    private readonly createReservationUseCase: CreateReservationUseCase,
  ) {}

  @Post()
  async create(
    @Body() body: CreateReservationDto,
  ): Promise<CreatedResponseDto> {
    return await this.createReservationUseCase.execute({
      userId: body.userId,
      barberId: body.barberId,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
    });
  }
}
