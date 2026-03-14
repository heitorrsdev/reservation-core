import { CreateBarberUseCase } from '@application/barber/create-barber.usecase';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { CreateBarberDto } from './dto/create-barber.dto';

@Controller('barbers')
export class BarberController {
  constructor(private readonly createBarberUseCase: CreateBarberUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateBarberDto): Promise<void> {
    await this.createBarberUseCase.execute({
      userId: dto.userId,
      name: dto.name,
      bio: dto.bio,
    });
  }
}
