import { TEST_TIME } from '@test/utils/time';
import { randomUUID } from 'crypto';

import { Reservation } from '@domain/reservation/reservation.entity';

import { Database } from '@infrastructure/database/database.provider';
import { reservations } from '@infrastructure/database/schema/reservation';

export function buildReservation(input: Partial<Reservation> = {}) {
  const id = input.id ?? randomUUID();
  const start = input.startTime ?? TEST_TIME;
  const end = input.endTime ?? new Date(start.getTime() + 30 * 60 * 1000);

  return {
    id,
    barberId: input.barberId ?? 'fixed-barber-id',
    userId: input.userId ?? 'fixed-user-id',
    startTime: start,
    endTime: end,
    createdAt: input.createdAt ?? start,
  };
}

export async function persistReservation(
  db: Database,
  input?: Partial<Reservation>,
) {
  const data = buildReservation(input);
  await db.insert(reservations).values(data);
  return data;
}
