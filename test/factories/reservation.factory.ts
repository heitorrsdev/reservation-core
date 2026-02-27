import { TEST_TIME } from '@test/utils/time';
import { randomUUID } from 'crypto';

import { Database } from '@infrastructure/database/database.provider';
import { reservations } from '@infrastructure/database/schema/reservation';

type ReservationInsert = typeof reservations.$inferInsert;
type ReservationFactoryInput = { userId: string; barberId: string } & Partial<
  Omit<ReservationInsert, 'userId' | 'barberId'>
>;

export function buildReservation(
  input: ReservationFactoryInput,
): ReservationInsert {
  const id = input.id ?? randomUUID();
  const startTime = input.startTime ?? TEST_TIME;
  const endTime =
    input.endTime ?? new Date(startTime.getTime() + 60 * 60 * 1000);
  const createdAt = input.createdAt ?? TEST_TIME;

  return {
    id,
    userId: input.userId,
    barberId: input.barberId,
    startTime,
    endTime,
    createdAt,
  };
}

export async function persistReservation(
  db: Database,
  input: ReservationFactoryInput,
) {
  const data = buildReservation(input);
  await db.insert(reservations).values(data);
  return data;
}
