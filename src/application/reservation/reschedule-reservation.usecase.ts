import { ReservationNotFoundError } from '@domain/reservation/errors/reservation-not-found.error';
import type { ReservationRepository } from '@domain/reservation/reservation.repository';
import { Inject } from '@nestjs/common';

import type { RescheduleReservationCommand } from './reschedule-reservation.command';
import { RESERVATION_REPOSITORY } from './reservation-repository.token';

export class RescheduleReservationUseCase {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: ReservationRepository,
  ) {}

  async execute(command: RescheduleReservationCommand): Promise<void> {
    const reservation = await this.reservationRepository.findById(
      command.reservationId,
    );

    if (!reservation) {
      throw new ReservationNotFoundError(command.reservationId);
    }

    reservation.reschedule(
      command.newStartTime,
      command.newEndTime,
      command.actorId,
      new Date(),
    );

    await this.reservationRepository.save(reservation);
  }
}
