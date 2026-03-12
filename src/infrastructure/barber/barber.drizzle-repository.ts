import { Barber } from '@domain/barber/barber.entity';
import { BarberRepository } from '@domain/barber/barber.repository';
import { DrizzleClient } from '@infrastructure/database/database.provider';
import { DATABASE } from '@infrastructure/database/database.token';
import { barbers } from '@infrastructure/database/schema/barber';
import { Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { BarberMapper } from './barber.mapper';

export class BarberDrizzleRepository implements BarberRepository {
  constructor(
    @Inject(DATABASE)
    private readonly db: DrizzleClient,
  ) {}

  async save(barber: Barber): Promise<void> {
    const data = BarberMapper.toPersistence(barber);
    await this.db.insert(barbers).values(data);
  }

  async findById(id: string): Promise<Barber | null> {
    const [row] = await this.db
      .select()
      .from(barbers)
      .where(eq(barbers.id, id));

    return BarberMapper.toDomain(row);
  }
}
