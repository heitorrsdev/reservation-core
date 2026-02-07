import { Barber } from '@domain/barber/barber.entity';

type BarberRow = {
  id: string;
  name: string;
  bio: string | null;
  active: boolean;
  createdAt: Date;
};

export class BarberMapper {
  static toDomain(row: BarberRow): Barber {
    return Barber.create({
      userId: row.id,
      name: row.name,
      bio: row.bio,
      createdAt: row.createdAt,
    });
  }

  static toPersistence(barber: Barber): BarberRow {
    return {
      id: barber.id,
      name: barber.name,
      bio: barber.bio,
      active: barber.active,
      createdAt: barber.createdAt,
    };
  }
}
