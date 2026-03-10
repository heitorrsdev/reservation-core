import { CreateUserUseCase } from '@application/user/create-user.usecase';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateUserDto) {
    const result = await this.createUserUseCase.execute({
      email: dto.email,
      password: dto.password,
    });

    return { userId: result.userId };
  }
}
