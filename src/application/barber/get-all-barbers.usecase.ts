import { Barber } from '@domain/barber/barber.entity';
import { BarberRepository } from '@domain/barber/barber.repository';
import { Inject } from '@nestjs/common';

import { BARBER_REPOSITORY } from './barber-repository.token';

export class GetAllBarbersUseCase {
  constructor(
    @Inject(BARBER_REPOSITORY)
    private readonly barberRepository: BarberRepository,
  ) {}

  async execute(): Promise<Barber[]> {
    return await this.barberRepository.findAllActive();
  }
}
