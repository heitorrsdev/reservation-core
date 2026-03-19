import type { PasswordHasher } from '@application/user/password-hasher.interface';
import { PASSWORD_HASHER } from '@application/user/password-hasher.token';
import { InvalidRefreshTokenError } from '@domain/auth/errors/invalid-refresh-token.error';
import type { RefreshTokenRepository } from '@domain/auth/refresh-token.repository';
import { Inject, Injectable } from '@nestjs/common';

import type { LogoutCommand } from './logout.command';
import { REFRESH_TOKEN_REPOSITORY } from './refresh-token-repository.token';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(command: LogoutCommand): Promise<void> {
    const dotIndex = command.refreshToken.indexOf('.');
    if (dotIndex === -1) {
      throw new InvalidRefreshTokenError();
    }

    const tokenId = command.refreshToken.substring(0, dotIndex);
    const randomPart = command.refreshToken.substring(dotIndex + 1);

    const storedToken = await this.refreshTokenRepository.findById(tokenId);
    if (!storedToken) {
      throw new InvalidRefreshTokenError();
    }

    if (storedToken.revokedAt) {
      return;
    }

    const isValid = await this.passwordHasher.compare(
      randomPart,
      storedToken.tokenHash,
    );
    if (!isValid) {
      throw new InvalidRefreshTokenError();
    }

    await this.refreshTokenRepository.update({
      ...storedToken,
      revokedAt: new Date(),
    });
  }
}
