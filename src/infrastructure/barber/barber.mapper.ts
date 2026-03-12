import { Barber } from '@domain/barber/barber.entity';
import type { barbers } from '@infrastructure/database/schema';

type BarberSelect = typeof barbers.$inferSelect;
type BarberInsert = typeof barbers.$inferInsert;
export class BarberMapper {
  static toDomain(row: BarberSelect): Barber {
    return Barber.create({
      userId: row.id,
      name: row.name,
      bio: row.bio,
      createdAt: row.createdAt,
    });
  }

  static toPersistence(barber: Barber): BarberInsert {
    return {
      id: barber.id,
      name: barber.name,
      bio: barber.bio,
      active: barber.active,
      createdAt: barber.createdAt,
    };
  }
}
