import type { PasswordHasher } from '@application/user/password-hasher.interface';
import { PASSWORD_HASHER } from '@application/user/password-hasher.token';
import { InvalidCredentialsError } from '@domain/auth/errors/invalid-credentials.error';
import type { RefreshTokenRepository } from '@domain/auth/refresh-token.repository';
import type { UserRepository } from '@domain/user/user.repository';
import { Inject, Injectable } from '@nestjs/common';
import { randomBytes, randomUUID } from 'crypto';

import { USER_REPOSITORY } from '../user/user-repository.token';
import type { LoginCommand } from './login.command';
import { REFRESH_TOKEN_REPOSITORY } from './refresh-token-repository.token';
import type { TokenGenerator } from './token-generator.interface';
import { TOKEN_GENERATOR } from './token-generator.token';

const REFRESH_TOKEN_EXPIRATION_DAYS = 7;

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    @Inject(TOKEN_GENERATOR)
    private readonly tokenGenerator: TokenGenerator,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(
    command: LoginCommand,
  ): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> {
    const user = await this.userRepository.findByEmail(command.email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const passwordHash = user.passwordHash;

    const isPasswordValid = await this.passwordHasher.compare(
      command.password,
      passwordHash.value,
    );
    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    const accessToken = await this.tokenGenerator.generate({
      sub: user.id,
      email: user.email.value,
    });

    const tokenId = randomUUID();
    const randomPart = randomBytes(32).toString('hex');
    const tokenHash = await this.passwordHasher.hash(randomPart);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRATION_DAYS);

    await this.refreshTokenRepository.save({
      id: tokenId,
      userId: user.id,
      tokenHash,
      expiresAt,
      revokedAt: null,
    });

    return {
      accessToken,
      refreshToken: `${tokenId}.${randomPart}`,
      expiresAt,
    };
  }
}
