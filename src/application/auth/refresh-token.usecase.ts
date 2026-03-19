import type { PasswordHasher } from '@application/user/password-hasher.interface';
import { PASSWORD_HASHER } from '@application/user/password-hasher.token';
import { InvalidRefreshTokenError } from '@domain/auth/errors/invalid-refresh-token.error';
import { RefreshTokenReuseError } from '@domain/auth/errors/refresh-token-reuse.error';
import type { RefreshTokenRepository } from '@domain/auth/refresh-token.repository';
import type { UserRepository } from '@domain/user/user.repository';
import { Inject, Injectable } from '@nestjs/common';
import { randomBytes, randomUUID } from 'crypto';

import { USER_REPOSITORY } from '../user/user-repository.token';
import type { RefreshTokenCommand } from './refresh-token.command';
import { REFRESH_TOKEN_REPOSITORY } from './refresh-token-repository.token';
import type { TokenGenerator } from './token-generator.interface';
import { TOKEN_GENERATOR } from './token-generator.token';

const REFRESH_TOKEN_EXPIRATION_DAYS = 7;

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    @Inject(TOKEN_GENERATOR)
    private readonly tokenGenerator: TokenGenerator,
  ) {}

  async execute(
    command: RefreshTokenCommand,
  ): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> {
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

    if (storedToken.expiresAt < new Date()) {
      throw new InvalidRefreshTokenError();
    }

    if (storedToken.revokedAt) {
      await this.refreshTokenRepository.revokeAllByUserId(storedToken.userId);
      throw new RefreshTokenReuseError();
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

    const newTokenId = randomUUID();
    const newRandomPart = randomBytes(32).toString('hex');
    const newTokenHash = await this.passwordHasher.hash(newRandomPart);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRATION_DAYS);

    await this.refreshTokenRepository.save({
      id: newTokenId,
      userId: storedToken.userId,
      tokenHash: newTokenHash,
      expiresAt,
      revokedAt: null,
    });

    const user = await this.userRepository.findById(storedToken.userId);
    if (!user) {
      throw new InvalidRefreshTokenError();
    }

    const accessToken = await this.tokenGenerator.generate({
      sub: user.id,
      email: user.email.value,
    });

    return {
      accessToken,
      refreshToken: `${newTokenId}.${newRandomPart}`,
      expiresAt,
    };
  }
}
