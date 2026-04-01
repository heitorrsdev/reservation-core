import type { Database } from '@infrastructure/database/database.provider';
import { reservations } from '@infrastructure/database/schema/reservation';
import { TEST_TIME } from '@test/utils/time';
import { randomUUID } from 'crypto';

type ReservationRow = typeof reservations.$inferSelect;

type ReservationFactoryInput = {
  userId: string;
  barberId: string;
  startTime?: Date;
  endTime?: Date;
  status?: ReservationRow['status'];
};

export function buildReservation(
  input: ReservationFactoryInput,
): ReservationRow {
  const startTime = input.startTime ?? TEST_TIME;
  const endTime =
    input.endTime ?? new Date(startTime.getTime() + 60 * 60 * 1000);

  const status: ReservationRow['status'] = input.status ?? 'active';

  return {
    id: randomUUID(),
    userId: input.userId,
    barberId: input.barberId,
    startTime,
    endTime,
    createdAt: TEST_TIME,
    status,
  };
}

export async function persistReservation(
  db: Database,
  input: ReservationFactoryInput,
): Promise<ReservationRow> {
  const row = buildReservation(input);

  await db.insert(reservations).values(row);

  return row;
}
