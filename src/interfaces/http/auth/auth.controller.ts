import { LoginUseCase } from '@application/auth/login.usecase';
import { LogoutUseCase } from '@application/auth/logout.usecase';
import { RefreshTokenUseCase } from '@application/auth/refresh-token.usecase';
import { InvalidRefreshTokenError } from '@domain/auth/errors/invalid-refresh-token.error';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';

import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { Public } from './public.decorator';

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/auth',
};

const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    const { accessToken, refreshToken, expiresAt } =
      await this.loginUseCase.execute({
        email: body.email,
        password: body.password,
      });

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      ...COOKIE_OPTIONS,
      expires: expiresAt,
    });

    return { accessToken };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    const cookies = req.cookies as Record<string, string> | undefined;
    const refreshToken = cookies?.refreshToken;
    if (!refreshToken) {
      throw new InvalidRefreshTokenError();
    }

    const result = await this.refreshTokenUseCase.execute({ refreshToken });

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, {
      ...COOKIE_OPTIONS,
      expires: result.expiresAt,
    });

    return { accessToken: result.accessToken };
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const cookies = req.cookies as Record<string, string> | undefined;
    const refreshToken = cookies?.refreshToken;
    if (!refreshToken) {
      throw new InvalidRefreshTokenError();
    }

    await this.logoutUseCase.execute({ refreshToken });

    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, COOKIE_OPTIONS);
  }
}
