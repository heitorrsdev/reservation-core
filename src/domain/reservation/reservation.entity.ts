import { randomUUID } from 'crypto';

import { CannotCancelPastReservationError } from './errors/cannot-cancel-past-reservation.error';
import { ClientLateCancellationError } from './errors/client-late-cancellation.error';
import { InvalidReservationTimeError } from './errors/invalid-reservation-time.error';
import { ReservationAlreadyCancelledError } from './errors/reservation-already-cancelled.error';
import { UnauthorizedReservationAccessError } from './errors/unauthorized-reservation-access.error';

export type ReservationStatus = 'active' | 'cancelled';

export class Reservation {
  private _status: ReservationStatus;

  private constructor(
    readonly id: string,
    readonly userId: string,
    readonly barberId: string,
    readonly startTime: Date,
    readonly endTime: Date,
    readonly createdAt: Date,
    status: ReservationStatus,
  ) {
    this._status = status;
  }

  get status(): ReservationStatus {
    return this._status;
  }

  public cancel(actorId: string, currentTime: Date): void {
    if (this._status === 'cancelled') {
      throw new ReservationAlreadyCancelledError();
    }

    const isClient = actorId === this.userId;
    const isBarber = actorId === this.barberId;

    if (!isClient && !isBarber) {
      throw new UnauthorizedReservationAccessError();
    }

    if (currentTime >= this.startTime) {
      throw new CannotCancelPastReservationError();
    }

    if (isClient) {
      const limitTimeForClient = new Date(
        this.startTime.getTime() - 60 * 60 * 1000,
      );
      if (currentTime >= limitTimeForClient) {
        throw new ClientLateCancellationError();
      }
    }

    this._status = 'cancelled';
  }

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
      'active',
    );
  }

  static reconstitute(props: {
    id: string;
    userId: string;
    barberId: string;
    startTime: Date;
    endTime: Date;
    createdAt: Date;
    status: ReservationStatus;
  }) {
    return new Reservation(
      props.id,
      props.userId,
      props.barberId,
      props.startTime,
      props.endTime,
      props.createdAt,
      props.status,
    );
  }
}
