import type { RefreshToken } from './refresh-token.interface';

export interface RefreshTokenRepository {
  save(token: RefreshToken): Promise<void>;
  findById(id: string): Promise<RefreshToken | null>;
  update(token: RefreshToken): Promise<void>;
  revokeAllByUserId(userId: string): Promise<void>;
}
