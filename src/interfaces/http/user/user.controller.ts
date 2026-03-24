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

@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserMeUseCase: GetUserMeUseCase,
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
}
