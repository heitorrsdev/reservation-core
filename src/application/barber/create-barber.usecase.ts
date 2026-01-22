import { Barber } from '@domain/barber/barber.entity';
import { BarberRepository } from '@domain/barber/barber.repository';
import { UserAlreadyBarber } from '@domain/barber/errors/user-already-barber.error';
import { UserNotFound } from '@domain/user/errors/user-not-found.error';
import { UserRepository } from '@domain/user/user.repository';

import { CreateBarberCommand } from './create-barber.command';

export class CreateBarberUseCase {
  constructor(
    private barberRepository: BarberRepository,
    private userRepository: UserRepository,
  ) {}

  async execute(command: CreateBarberCommand): Promise<void> {
    const userExists = await this.userRepository.findById(command.userId);
    if (!userExists) {
      throw new UserNotFound(command.userId);
    }

    const barberExists = await this.barberRepository.findById(command.userId);
    if (barberExists) {
      throw new UserAlreadyBarber(command.userId);
    }

    const barber = Barber.create({
      userId: command.userId,
      name: command.name,
      bio: command.bio,
    });

    await this.barberRepository.save(barber);
  }
}
