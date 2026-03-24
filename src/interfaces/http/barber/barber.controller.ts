import { CreateBarberUseCase } from '@application/barber/create-barber.usecase';
import { GetBarberByIdUseCase } from '@application/barber/get-barber-by-id.usecase';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';

import { CreatedResponseDto } from '../common/dto/created-response.dto';
import { CreateBarberDto } from './dto/create-barber.dto';
import { GetBarberByIdResponseDto } from './dto/get-barber-by-id-response.dto';

@Controller('barbers')
export class BarberController {
  constructor(
    private readonly createBarberUseCase: CreateBarberUseCase,
    private readonly getBarberByIdUseCase: GetBarberByIdUseCase,
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
}
