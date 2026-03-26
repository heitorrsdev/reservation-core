import { BARBER_REPOSITORY } from '@application/barber/barber-repository.token';
import { BarberRepository } from '@domain/barber/barber.repository';
import { BarberNotFoundError } from '@domain/barber/errors/barber-not-found.error';
import { InvalidReservationTimeError } from '@domain/reservation/errors/invalid-reservation-time.error';
import { Reservation } from '@domain/reservation/reservation.entity';
import { ReservationRepository } from '@domain/reservation/reservation.repository';
import { Inject } from '@nestjs/common';

import { GetBarberReservationsCommand } from './get-barber-reservations.command';
import { RESERVATION_REPOSITORY } from './reservation-repository.token';

export class GetBarberReservationsUseCase {
  constructor(
    @Inject(BARBER_REPOSITORY)
    private readonly barberRepository: BarberRepository,
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: ReservationRepository,
  ) {}

  async execute(command: GetBarberReservationsCommand): Promise<{
    reservations: Reservation[];
    total: number;
    isOwner: boolean;
  }> {
    const barber = await this.barberRepository.findById(command.barberId);

    if (!barber) {
      throw new BarberNotFoundError(command.barberId);
    }

    if (
      command.startTime &&
      command.endTime &&
      command.startTime >= command.endTime
    ) {
      throw new InvalidReservationTimeError();
    }

    const [reservations, total] =
      await this.reservationRepository.findByBarberId(
        command.barberId,
        command.limit,
        command.offset,
        command.startTime,
        command.endTime,
      );

    const isOwner = command.requesterId === barber.id;

    return { reservations, total, isOwner };
  }
}
