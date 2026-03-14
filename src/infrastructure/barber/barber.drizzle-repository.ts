import { Barber } from '@domain/barber/barber.entity';
import { BarberRepository } from '@domain/barber/barber.repository';
import { UserAlreadyBarberError } from '@domain/barber/errors/user-already-barber.error';
import { DrizzleClient } from '@infrastructure/database/database.provider';
import { DATABASE } from '@infrastructure/database/database.token';
import { PostgresErrorMapper } from '@infrastructure/database/postgres-error.mapper';
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
    try {
      await this.db.insert(barbers).values(data);
    } catch (error: unknown) {
      if (PostgresErrorMapper.isUniqueViolation(error)) {
        throw new UserAlreadyBarberError(barber.id);
      }
      throw error;
    }
  }

  async findById(id: string): Promise<Barber | null> {
    const result = await this.db
      .select()
      .from(barbers)
      .where(eq(barbers.id, id))
      .limit(1);

    if (!result.length) return null;
    return BarberMapper.toDomain(result[0]);
  }
}
