import { UserAlreadyExistsError } from '@domain/user/errors/user-already-exists.error';
import { User } from '@domain/user/user.entity';
import { UserRepository } from '@domain/user/user.repository';

import { ConflictError } from '@application/errors/conflict.error';

import { CreateUserCommand } from './create-user.command';
import { PasswordHasher } from './password-hasher';

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
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
