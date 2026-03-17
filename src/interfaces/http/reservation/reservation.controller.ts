import { CreateReservationCommand } from '@application/reservation/create-reservation.command';
import { CreateReservationUseCase } from '@application/reservation/create-reservation.usecase';
import { Body, Controller, Post } from '@nestjs/common';

import { CreateReservationDto } from './dto/create-reservation.dto';
import { CreateReservationResponseDto } from './dto/create-reservation-response.dto';

@Controller('reservations')
export class ReservationController {
  constructor(
    private readonly createReservationUseCase: CreateReservationUseCase,
  ) {}

  @Post()
  async create(
    @Body() body: CreateReservationDto,
  ): Promise<CreateReservationResponseDto> {
    const command: CreateReservationCommand = {
      userId: body.userId,
      barberId: body.barberId,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
    };

    const result = await this.createReservationUseCase.execute(command);

    return result;
  }
}
