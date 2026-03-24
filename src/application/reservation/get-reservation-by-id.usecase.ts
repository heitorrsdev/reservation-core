import { ReservationNotFoundError } from '@domain/reservation/errors/reservation-not-found.error';
import { Reservation } from '@domain/reservation/reservation.entity';
import { ReservationRepository } from '@domain/reservation/reservation.repository';
import { Inject } from '@nestjs/common';

import { GetReservationByIdCommand } from './get-reservation-by-id.command';
import { RESERVATION_REPOSITORY } from './reservation-repository.token';

export class GetReservationByIdUseCase {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: ReservationRepository,
  ) {}

  async execute(command: GetReservationByIdCommand): Promise<Reservation> {
    const reservation = await this.reservationRepository.findById(command.id);

    if (!reservation) {
      throw new ReservationNotFoundError(command.id);
    }

    return reservation;
  }
}
