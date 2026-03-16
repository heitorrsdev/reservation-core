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
    id?: string;
    userId: string;
    barberId: string;
    startTime: Date;
    endTime: Date;
  }) {
    if (props.endTime <= props.startTime) {
      throw new InvalidReservationTimeError();
    }

    return new Reservation(
      props.id || randomUUID(),
      props.userId,
      props.barberId,
      props.startTime,
      props.endTime,
      new Date(),
    );
  }

  static reconstitute(props: {
    id: string;
    userId: string;
    barberId: string;
    startTime: Date;
    endTime: Date;
    createdAt: Date;
  }) {
    return new Reservation(
      props.id,
      props.userId,
      props.barberId,
      props.startTime,
      props.endTime,
      props.createdAt,
    );
  }
}
