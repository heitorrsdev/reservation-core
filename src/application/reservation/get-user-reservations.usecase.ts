import type { Reservation } from '@domain/reservation/reservation.entity';
import type { ReservationRepository } from '@domain/reservation/reservation.repository';
import { Inject } from '@nestjs/common';

import type { GetUserReservationsCommand } from './get-user-reservations.command';
import { RESERVATION_REPOSITORY } from './reservation-repository.token';

export class GetUserReservationsUseCase {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: ReservationRepository,
  ) {}

  async execute(command: GetUserReservationsCommand): Promise<Reservation[]> {
    return this.reservationRepository.findManyByUserId(command.userId);
  }
}
