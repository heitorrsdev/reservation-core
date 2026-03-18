import { LoginUseCase } from '@application/auth/login.usecase';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginDto): Promise<LoginResponseDto> {
    const { accessToken } = await this.loginUseCase.execute({
      email: body.email,
      password: body.password,
    });

    return { accessToken };
  }
}
