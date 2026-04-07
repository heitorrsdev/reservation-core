import { Reservation } from './reservation.entity';
import { CannotCancelPastReservationError } from './errors/cannot-cancel-past-reservation.error';
import { ClientLateCancellationError } from './errors/client-late-cancellation.error';
import { InvalidReservationTimeError } from './errors/invalid-reservation-time.error';
import { ReservationAlreadyCancelledError } from './errors/reservation-already-cancelled.error';
import { UnauthorizedReservationAccessError } from './errors/unauthorized-reservation-access.error';

describe('Reservation Entity', () => {
  const userId = 'user-1';
  const barberId = 'barber-1';
  const validStartTime = new Date('2024-01-01T10:00:00Z');
  const validEndTime = new Date('2024-01-01T11:00:00Z');

  describe('create', () => {
    it('should create an active reservation with a generated UUID and createdAt', () => {
      const reservation = Reservation.create({
        userId,
        barberId,
        startTime: validStartTime,
        endTime: validEndTime,
      });

      expect(reservation.id).toBeDefined();
      expect(typeof reservation.id).toBe('string');
      expect(reservation.userId).toBe(userId);
      expect(reservation.barberId).toBe(barberId);
      expect(reservation.startTime).toBe(validStartTime);
      expect(reservation.endTime).toBe(validEndTime);
      expect(reservation.createdAt).toBeInstanceOf(Date);
      expect(reservation.status).toBe('active');
    });

    it('should use the provided UUID if one is supplied', () => {
      const customId = 'custom-id-123';
      const reservation = Reservation.create({
        id: customId,
        userId,
        barberId,
        startTime: validStartTime,
        endTime: validEndTime,
      });

      expect(reservation.id).toBe(customId);
    });

    it('should throw InvalidReservationTimeError if endTime is before startTime', () => {
      expect(() => {
        Reservation.create({
          userId,
          barberId,
          startTime: validEndTime, // End time before start time
          endTime: validStartTime,
        });
      }).toThrow(InvalidReservationTimeError);
    });

    it('should throw InvalidReservationTimeError if endTime is equal to startTime', () => {
      expect(() => {
        Reservation.create({
          userId,
          barberId,
          startTime: validStartTime,
          endTime: validStartTime, // End time equals start time
        });
      }).toThrow(InvalidReservationTimeError);
    });
  });

  describe('reconstitute', () => {
    it('should rebuild exactly the provided properties including status', () => {
      const id = 'recon-id-123';
      const createdAt = new Date('2023-12-01T00:00:00Z');
      const status = 'cancelled';

      const reservation = Reservation.reconstitute({
        id,
        userId,
        barberId,
        startTime: validStartTime,
        endTime: validEndTime,
        createdAt,
        status,
      });

      expect(reservation.id).toBe(id);
      expect(reservation.userId).toBe(userId);
      expect(reservation.barberId).toBe(barberId);
      expect(reservation.startTime).toBe(validStartTime);
      expect(reservation.endTime).toBe(validEndTime);
      expect(reservation.createdAt).toBe(createdAt);
      expect(reservation.status).toBe(status);
    });
  });

  describe('cancel', () => {
    let activeReservation: Reservation;

    beforeEach(() => {
      activeReservation = Reservation.create({
        userId,
        barberId,
        startTime: validStartTime,
        endTime: validEndTime,
      });
    });

    it('should throw ReservationAlreadyCancelledError if status is already cancelled', () => {
      // First cancel it
      const validCancelTime = new Date('2024-01-01T08:00:00Z'); // 2 hours before start
      activeReservation.cancel(userId, validCancelTime);

      // Attempt to cancel again
      expect(() => {
        activeReservation.cancel(userId, validCancelTime);
      }).toThrow(ReservationAlreadyCancelledError);
    });

    it('should throw UnauthorizedReservationAccessError if actorId is neither client nor barber', () => {
      const invalidActorId = 'stranger-1';
      const validCancelTime = new Date('2024-01-01T08:00:00Z'); // 2 hours before start

      expect(() => {
        activeReservation.cancel(invalidActorId, validCancelTime);
      }).toThrow(UnauthorizedReservationAccessError);
    });

    it('should throw CannotCancelPastReservationError if currentTime >= startTime (tested with barber)', () => {
      const pastTime1 = new Date('2024-01-01T10:00:00Z'); // Exactly at start time
      const pastTime2 = new Date('2024-01-01T10:30:00Z'); // During reservation

      expect(() => {
        activeReservation.cancel(barberId, pastTime1);
      }).toThrow(CannotCancelPastReservationError);

      expect(() => {
        activeReservation.cancel(barberId, pastTime2);
      }).toThrow(CannotCancelPastReservationError);
    });

    it('should throw ClientLateCancellationError if client cancels < 1 hour before startTime', () => {
      const lateTimeForClient = new Date('2024-01-01T09:30:00Z'); // 30 mins before start

      expect(() => {
        activeReservation.cancel(userId, lateTimeForClient);
      }).toThrow(ClientLateCancellationError);
    });

    it('should throw ClientLateCancellationError if client cancels exactly 1 hour before startTime', () => {
      const limitTimeForClient = new Date('2024-01-01T09:00:00Z'); // exactly 1 hr before start

      expect(() => {
        activeReservation.cancel(userId, limitTimeForClient);
      }).toThrow(ClientLateCancellationError);
    });

    it('should successfully change status to cancelled if client cancels > 1 hour before startTime', () => {
      const validCancelTime = new Date('2024-01-01T08:59:59Z'); // > 1 hr before start

      activeReservation.cancel(userId, validCancelTime);

      expect(activeReservation.status).toBe('cancelled');
    });

    it('should successfully change status to cancelled if barber cancels < 1 hour before startTime', () => {
      const lateTimeButValidForBarber = new Date('2024-01-01T09:30:00Z'); // 30 mins before start

      activeReservation.cancel(barberId, lateTimeButValidForBarber);

      expect(activeReservation.status).toBe('cancelled');
    });
  });
});
