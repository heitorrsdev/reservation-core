import { randomUUID } from 'crypto';

import { InvalidReservationTimeError } from './errors/invalid-reservation-time.error';

export class Reservation {
  private constructor(
    readonly id: string,
    readonly userId: string,
    readonly barberId: string,
    readonly startTime: Date,
    readonly endTime: Date,
    readonly createdAt: Date,
  ) {}

  static create(props: {
    userId: string;
    barberId: string;
    startTime: Date;
    endTime: Date;
  }) {
    if (props.endTime <= props.startTime) {
      throw new InvalidReservationTimeError();
    }

    return new Reservation(
      randomUUID(),
      props.userId,
      props.barberId,
      props.startTime,
      props.endTime,
      new Date(),
    );
  }
}
