import { UserNotFoundError } from '@domain/user/errors/user-not-found.error';
import { User } from '@domain/user/user.entity';
import { UserRepository } from '@domain/user/user.repository';
import { Inject } from '@nestjs/common';

import { GetUserMeCommand } from './get-user-me.command';
import { USER_REPOSITORY } from './user-repository.token';

export class GetUserMeUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: GetUserMeCommand): Promise<User> {
    const user = await this.userRepository.findById(command.id);

    if (!user) {
      throw new UserNotFoundError(command.id);
    }

    return user;
  }
}
