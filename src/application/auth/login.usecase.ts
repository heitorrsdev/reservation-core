import type { PasswordHasher } from '@application/user/password-hasher.interface';
import { PASSWORD_HASHER } from '@application/user/password-hasher.token';
import { InvalidCredentialsError } from '@domain/auth/errors/invalid-credentials.error';
import { Inject, Injectable } from '@nestjs/common';

import type { UserRepository } from '../../domain/user/user.repository';
import { USER_REPOSITORY } from '../user/user-repository.token';
import type { LoginCommand } from './login.command';
import type { TokenGenerator } from './token-generator.interface';
import { TOKEN_GENERATOR } from './token-generator.token';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    @Inject(TOKEN_GENERATOR)
    private readonly tokenGenerator: TokenGenerator,
  ) {}

  async execute(command: LoginCommand): Promise<{ accessToken: string }> {
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

    return { accessToken };
  }
}
