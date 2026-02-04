import { Inject } from '@nestjs/common';

import { UserAlreadyExistsError } from '@domain/user/errors/user-already-exists.error';
import { User } from '@domain/user/user.entity';
import { UserRepository } from '@domain/user/user.repository';

import { ConflictError } from '@application/errors/conflict.error';

import { CreateUserCommand } from './create-user.command';
import { PasswordHasher } from './password-hasher';
import { PASSWORD_HASHER } from './password-hasher.token';
import { USER_REPOSITORY } from './user-repository.token';

export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,

    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(command: CreateUserCommand): Promise<{ userId: string }> {
    const passwordHash = await this.passwordHasher.hash(command.password);

    const user = User.create({
      email: command.email,
      passwordHash,
    });

    try {
      await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof ConflictError) {
        throw new UserAlreadyExistsError(command.email);
      }
      throw error;
    }

    return { userId: user.id };
  }
}
