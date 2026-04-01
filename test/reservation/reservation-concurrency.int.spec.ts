import { ReservationConflictError } from '@domain/reservation/errors/reservation-conflict.error';
import { ReservationDrizzleRepository } from '@infrastructure/reservation/reservation.drizzle-repository';
import { ReservationMapper } from '@infrastructure/reservation/reservation.mapper';
import { persistBarber } from '@test/factories/barber.factory';
import { buildReservation } from '@test/factories/reservation.factory';
import { persistUser } from '@test/factories/user.factory';
import { Barrier } from '@test/utils/concurrency-barrier';
import { testDb } from '@test/utils/infra/test-database';

it('should prevent double booking under real concurrency', async () => {
  const barberUser = await persistUser(testDb);
  const barber = await persistBarber(testDb, { id: barberUser.id });

  const users = await Promise.all([
    persistUser(testDb),
    persistUser(testDb),
    persistUser(testDb),
    persistUser(testDb),
    persistUser(testDb),
  ]);

  const start = new Date('2030-01-01T10:00:00Z');
  const end = new Date('2030-01-01T11:00:00Z');

  const barrier = new Barrier(users.length);
  const tasks = users.map(async (user): Promise<void> => {
    const rawData = buildReservation({
      barberId: barber.id,
      userId: user.id,
      startTime: start,
      endTime: end,
    });

    const reservation = ReservationMapper.toDomain(rawData);

    return testDb.transaction(async (tx): Promise<void> => {
      const txRepo = new ReservationDrizzleRepository(tx);

      await barrier.wait();
      await txRepo.save(reservation);
    });
  });

  const results = await Promise.allSettled(tasks);

  const success = results.filter((r) => r.status === 'fulfilled');
  const failed = results.filter((r) => r.status === 'rejected');

  expect(success).toHaveLength(1);
  expect(failed.length).toBe(users.length - 1);

  for (const f of failed) {
    if (!(f.reason instanceof ReservationConflictError)) {
      console.error('UNEXPECTED ERROR:', f.reason);
    }
    expect(f.reason).toBeInstanceOf(ReservationConflictError);
  }
});
