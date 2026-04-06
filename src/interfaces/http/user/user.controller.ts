import { GetUserReservationsUseCase } from '@application/reservation/get-user-reservations.usecase';
import { CreateUserUseCase } from '@application/user/create-user.usecase';
import { GetUserMeUseCase } from '@application/user/get-user-me.usecase';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';

import { Public } from '../auth/public.decorator';
import { User } from '../auth/user.decorator';
import { CreatedResponseDto } from '../common/dto/created-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUserMeResponseDto } from './dto/get-user-me-response.dto';
import { GetUserReservationsResponseDto } from './dto/get-user-reservations-response.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserMeUseCase: GetUserMeUseCase,
    private readonly getUserReservationsUseCase: GetUserReservationsUseCase,
  ) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateUserDto): Promise<CreatedResponseDto> {
    return await this.createUserUseCase.execute({
      email: dto.email,
      password: dto.password,
    });
  }

  @Get('me')
  async getMe(@User() user: { sub: string }): Promise<GetUserMeResponseDto> {
    const userEntity = await this.getUserMeUseCase.execute({ id: user.sub });

    return {
      id: userEntity.id,
      email: userEntity.email.value,
      createdAt: userEntity.createdAt,
    };
  }

  @Get('me/reservations')
  async getMyReservations(
    @User() user: { sub: string },
  ): Promise<GetUserReservationsResponseDto> {
    const reservations = await this.getUserReservationsUseCase.execute({
      userId: user.sub,
    });

    return {
      data: reservations.map((reservation) => ({
        id: reservation.id,
        barberId: reservation.barberId,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
        status: reservation.status,
        createdAt: reservation.createdAt,
      })),
    };
  }
}
