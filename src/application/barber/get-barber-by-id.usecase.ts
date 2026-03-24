import { Barber } from '@domain/barber/barber.entity';
import { BarberRepository } from '@domain/barber/barber.repository';
import { BarberInactiveError } from '@domain/barber/errors/barber-inactive.error';
import { BarberNotFoundError } from '@domain/barber/errors/barber-not-found.error';
import { Inject } from '@nestjs/common';

import { BARBER_REPOSITORY } from './barber-repository.token';
import { GetBarberByIdCommand } from './get-barber-by-id.command';

export class GetBarberByIdUseCase {
  constructor(
    @Inject(BARBER_REPOSITORY)
    private readonly barberRepository: BarberRepository,
  ) {}

  async execute(command: GetBarberByIdCommand): Promise<Barber> {
    const barber = await this.barberRepository.findById(command.id);

    if (!barber) {
      throw new BarberNotFoundError(command.id);
    }

    if (!barber.active) {
      throw new BarberInactiveError(command.id);
    }

    return barber;
  }
}
