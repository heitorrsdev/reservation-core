import { ReservationNotFoundError } from '@domain/reservation/errors/reservation-not-found.error';
import type { ReservationRepository } from '@domain/reservation/reservation.repository';
import { Inject } from '@nestjs/common';

import type { CancelReservationCommand } from './cancel-reservation.command';
import { RESERVATION_REPOSITORY } from './reservation-repository.token';

export class CancelReservationUseCase {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: ReservationRepository,
  ) {}

  async execute(command: CancelReservationCommand): Promise<void> {
    const reservation = await this.reservationRepository.findById(
      command.reservationId,
    );

    if (!reservation) {
      throw new ReservationNotFoundError(command.reservationId);
    }

    reservation.cancel(command.actorId, new Date());

    await this.reservationRepository.save(reservation);
  }
}
