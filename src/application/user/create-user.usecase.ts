import { User } from '@domain/user/user.entity';
import { UserRepository } from '@domain/user/user.repository';
import { Inject } from '@nestjs/common';

import { CreateUserCommand } from './create-user.command';
import { PasswordHasher } from './password-hasher.interface';
import { PASSWORD_HASHER } from './password-hasher.token';
import { USER_REPOSITORY } from './user-repository.token';

export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,

    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(command: CreateUserCommand): Promise<{ id: string }> {
    const passwordHash = await this.passwordHasher.hash(command.password);

    const user = User.create({
      email: command.email,
      passwordHash,
    });

    await this.userRepository.save(user);

    return { id: user.id };
  }
}
