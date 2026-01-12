import { Reservation } from '@domain/reservation/reservation.entity';
import { ReservationRepository } from '@domain/reservation/reservation.repository';

import { CreateReservationCommand } from './create-reservation.command';

export class CreateReservationUseCase {
  constructor(private readonly reservationRepository: ReservationRepository) {}

  async execute(command: CreateReservationCommand): Promise<void> {
    const reservation = Reservation.create({
      userId: command.userId,
      barberId: command.barberId,
      startTime: command.startTime,
      endTime: command.endTime,
    });

    await this.reservationRepository.save(reservation);
  }
}
