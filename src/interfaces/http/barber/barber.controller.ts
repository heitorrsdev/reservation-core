import { CreateBarberUseCase } from '@application/barber/create-barber.usecase';
import { GetAllBarbersUseCase } from '@application/barber/get-all-barbers.usecase';
import { GetBarberByIdUseCase } from '@application/barber/get-barber-by-id.usecase';
import { GetBarberReservationsUseCase } from '@application/reservation/get-barber-reservations.usecase';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import { User } from '../auth/user.decorator';
import { CreatedResponseDto } from '../common/dto/created-response.dto';
import { CreateBarberDto } from './dto/create-barber.dto';
import { GetAllBarbersResponseDto } from './dto/get-all-barbers-response.dto';
import { GetBarberByIdResponseDto } from './dto/get-barber-by-id-response.dto';
import { GetBarberReservationsQueryDto } from './dto/get-barber-reservations-query.dto';
import { GetBarberReservationsResponseDto } from './dto/get-barber-reservations-response.dto';

@Controller('barbers')
export class BarberController {
  constructor(
    private readonly createBarberUseCase: CreateBarberUseCase,
    private readonly getAllBarbersUseCase: GetAllBarbersUseCase,
    private readonly getBarberByIdUseCase: GetBarberByIdUseCase,
    private readonly getBarberReservationsUseCase: GetBarberReservationsUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateBarberDto): Promise<CreatedResponseDto> {
    return await this.createBarberUseCase.execute({
      userId: dto.userId,
      name: dto.name,
      bio: dto.bio,
    });
  }

  @Get()
  async getAll(): Promise<GetAllBarbersResponseDto> {
    const barbers = await this.getAllBarbersUseCase.execute();

    return {
      data: barbers.map((barber) => ({
        id: barber.id,
        name: barber.name,
        bio: barber.bio,
      })),
    };
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<GetBarberByIdResponseDto> {
    const barber = await this.getBarberByIdUseCase.execute({ id });

    return {
      id: barber.id,
      name: barber.name,
      bio: barber.bio,
      active: barber.active,
      createdAt: barber.createdAt,
    };
  }

  @Get(':id/reservations')
  async getReservations(
    @Param('id') id: string,
    @Query() query: GetBarberReservationsQueryDto,
    @User() user: { sub: string; email: string },
  ): Promise<GetBarberReservationsResponseDto> {
    const offset = (query.page - 1) * query.limit;

    const result = await this.getBarberReservationsUseCase.execute({
      barberId: id,
      requesterId: user.sub,
      limit: query.limit,
      offset,
      startTime: query.startTime,
      endTime: query.endTime,
    });

    const data = result.isOwner
      ? result.reservations.map((r) => ({
          id: r.id,
          userId: r.userId,
          startTime: r.startTime,
          endTime: r.endTime,
        }))
      : result.reservations.map((r) => ({
          startTime: r.startTime,
          endTime: r.endTime,
        }));

    const totalPages = Math.ceil(result.total / query.limit);

    return {
      data,
      meta: {
        totalItems: result.total,
        itemCount: data.length,
        itemsPerPage: query.limit,
        totalPages,
        currentPage: query.page,
      },
    };
  }
}
