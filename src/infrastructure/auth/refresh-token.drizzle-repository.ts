import type { RefreshToken } from '@domain/auth/refresh-token.interface';
import type { RefreshTokenRepository } from '@domain/auth/refresh-token.repository';
import type { DrizzleClient } from '@infrastructure/database/database.provider';
import { DATABASE } from '@infrastructure/database/database.token';
import { refreshTokens } from '@infrastructure/database/schema/refresh-token';
import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';

@Injectable()
export class RefreshTokenDrizzleRepository implements RefreshTokenRepository {
  constructor(@Inject(DATABASE) private readonly db: DrizzleClient) {}

  async save(token: RefreshToken): Promise<void> {
    await this.db.insert(refreshTokens).values({
      id: token.id,
      userId: token.userId,
      tokenHash: token.tokenHash,
      expiresAt: token.expiresAt,
      revokedAt: token.revokedAt,
    });
  }

  async findById(id: string): Promise<RefreshToken | null> {
    const result = await this.db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.id, id))
      .limit(1);

    if (result.length === 0) return null;

    const row = result[0];
    return {
      id: row.id,
      userId: row.userId,
      tokenHash: row.tokenHash,
      expiresAt: row.expiresAt,
      revokedAt: row.revokedAt,
    };
  }

  async update(token: RefreshToken): Promise<void> {
    await this.db
      .update(refreshTokens)
      .set({ revokedAt: token.revokedAt })
      .where(eq(refreshTokens.id, token.id));
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    await this.db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)),
      );
  }
}
