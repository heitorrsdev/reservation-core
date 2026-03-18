import { CreateUserUseCase } from '@application/user/create-user.usecase';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { Public } from '../auth/public.decorator';
import { CreatedResponseDto } from '../common/dto/created-response.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateUserDto): Promise<CreatedResponseDto> {
    return await this.createUserUseCase.execute({
      email: dto.email,
      password: dto.password,
    });
  }
}
