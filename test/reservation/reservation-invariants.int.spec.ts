import { ReservationConflictError } from '@domain/reservation/errors/reservation-conflict.error';
import { Reservation } from '@domain/reservation/reservation.entity';
import { ReservationDrizzleRepository } from '@infrastructure/reservation/reservation.drizzle-repository';
import { persistBarber } from '@test/factories/barber.factory';
import { persistUser } from '@test/factories/user.factory';
import { testDb } from '@test/utils/infra/test-database';
import { truncateTestDatabase } from '@test/utils/infra/truncate-test-db';
import { randomUUID } from 'crypto';

describe('Reservation invariants (integration)', () => {
  let repository: ReservationDrizzleRepository;

  beforeAll(() => {
    repository = new ReservationDrizzleRepository(testDb);
  });

  beforeEach(async () => {
    await truncateTestDatabase();
  });

  it('should persist a valid reservation', async () => {
    const user = await persistUser(testDb);
    const barber = await persistBarber(testDb, { id: user.id });

    const reservation = Reservation.create({
      id: randomUUID(),
      barberId: barber.id,
      userId: user.id,
      startTime: new Date('2030-01-01T10:00:00Z'),
      endTime: new Date('2030-01-01T11:00:00Z'),
      createdAt: new Date('2030-01-01T09:00:00Z'),
    });

    await repository.save(reservation);

    const found = await repository.findById(reservation.id);
    expect(found).toBeDefined();
    expect(found?.id).toBe(reservation.id);
  });

  it('should throw ReservationConflictError when slot is already taken', async () => {
    const barberUser = await persistUser(testDb);
    const barber = await persistBarber(testDb, { id: barberUser.id });

    const userA = await persistUser(testDb);
    const userB = await persistUser(testDb);

    const start = new Date('2030-01-01T10:00:00Z');
    const end = new Date('2030-01-01T11:00:00Z');

    const first = Reservation.create({
      id: randomUUID(),
      barberId: barber.id,
      userId: userA.id,
      startTime: start,
      endTime: end,
      createdAt: new Date('2030-01-01T09:00:00Z'),
    });

    await repository.save(first);

    const conflicting = Reservation.create({
      id: randomUUID(),
      barberId: barber.id,
      userId: userB.id,
      startTime: start,
      endTime: end,
      createdAt: new Date('2030-01-01T09:00:00Z'),
    });

    await expect(repository.save(conflicting)).rejects.toBeInstanceOf(
      ReservationConflictError,
    );
  });
});
