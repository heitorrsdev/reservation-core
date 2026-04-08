import { CancelReservationUseCase } from '@application/reservation/cancel-reservation.usecase';
import { CreateReservationUseCase } from '@application/reservation/create-reservation.usecase';
import { GetReservationByIdUseCase } from '@application/reservation/get-reservation-by-id.usecase';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { User } from '../auth/user.decorator';
import { CreatedResponseDto } from '../common/dto/created-response.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { GetReservationByIdResponseDto } from './dto/get-reservation-by-id-response.dto';

@ApiTags('Reservations')
@ApiBearerAuth()
@Controller('reservations')
export class ReservationController {
  constructor(
    private readonly cancelReservationUseCase: CancelReservationUseCase,
    private readonly createReservationUseCase: CreateReservationUseCase,
    private readonly getReservationByIdUseCase: GetReservationByIdUseCase,
  ) {}

  @Post()
  async create(
    @User() user: { sub: string; email: string },
    @Body() body: CreateReservationDto,
  ): Promise<CreatedResponseDto> {
    return await this.createReservationUseCase.execute({
      userId: user.sub,
      barberId: body.barberId,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
    });
  }

  @Get(':id')
  async getById(
    @User() user: { sub: string; email: string },
    @Param('id') id: string,
  ): Promise<GetReservationByIdResponseDto> {
    const reservation = await this.getReservationByIdUseCase.execute({
      id,
      actorId: user.sub,
    });

    return {
      id: reservation.id,
      userId: reservation.userId,
      barberId: reservation.barberId,
      startTime: reservation.startTime,
      endTime: reservation.endTime,
      createdAt: reservation.createdAt,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancel(
    @User() user: { sub: string; email: string },
    @Param('id') id: string,
  ): Promise<void> {
    await this.cancelReservationUseCase.execute({
      reservationId: id,
      actorId: user.sub,
    });
  }
}
