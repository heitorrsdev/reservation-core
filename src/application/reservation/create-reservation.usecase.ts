import { Reservation } from '@domain/reservation/reservation.entity';
import type { ReservationRepository } from '@domain/reservation/reservation.repository';
import { Inject } from '@nestjs/common';

import type { CreateReservationCommand } from './create-reservation.command';
import { RESERVATION_REPOSITORY } from './reservation-repository.token';

export class CreateReservationUseCase {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: ReservationRepository,
  ) {}

  async execute(
    command: CreateReservationCommand,
  ): Promise<{ reservationId: string }> {
    const reservation = Reservation.create({
      userId: command.userId,
      barberId: command.barberId,
      startTime: command.startTime,
      endTime: command.endTime,
    });

    await this.reservationRepository.save(reservation);

    return { reservationId: reservation.id };
  }
}
