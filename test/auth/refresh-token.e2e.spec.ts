import type { PasswordHasher } from '@application/user/password-hasher.interface';
import { PASSWORD_HASHER } from '@application/user/password-hasher.token';
import { refreshTokens } from '@infrastructure/database/schema/refresh-token';
import type { INestApplication } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { persistUser } from '@test/factories/user.factory';
import { bodyAs } from '@test/utils/http-response';
import { testDb } from '@test/utils/infra/test-database';
import { truncateTestDatabase } from '@test/utils/infra/truncate-test-db';
import { eq } from 'drizzle-orm';
import request from 'supertest';
import type { App } from 'supertest/types';

import { configureApp } from '../../src/app.config';
import { AppModule } from '../../src/app.module';

function extractRefreshCookie(response: request.Response): string {
  const cookies = response.headers['set-cookie'] as unknown as string[];
  const refreshCookie = cookies.find((c: string) =>
    c.startsWith('refreshToken='),
  );
  if (!refreshCookie) throw new Error('No refreshToken cookie found');
  const match = refreshCookie.match(/refreshToken=([^;]+)/);
  if (!match) throw new Error('Could not parse refreshToken cookie value');
  return decodeURIComponent(match[1]);
}

describe('AuthController (e2e) - POST /auth/refresh', () => {
  let app: INestApplication;
  let httpServer: App;
  let passwordHasher: PasswordHasher;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
    httpServer = app.getHttpServer() as App;
    passwordHasher = app.get<PasswordHasher>(PASSWORD_HASHER);
  });

  beforeEach(async () => {
    await truncateTestDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  async function loginAndGetCookie(): Promise<string> {
    const password = 'securepassword123';
    const passwordHash = await passwordHasher.hash(password);
    const user = await persistUser(testDb, { passwordHash });

    const response = await request(httpServer)
      .post('/auth/login')
      .send({ email: user.email, password })
      .expect(200);

    return extractRefreshCookie(response);
  }

  it('should return 200 with a new accessToken and rotate refresh token cookie', async () => {
    const refreshCookie = await loginAndGetCookie();

    const response = await request(httpServer)
      .post('/auth/refresh')
      .set('Cookie', `refreshToken=${refreshCookie}`)
      .expect(200);

    const body = bodyAs<{ accessToken: string }>(response);
    expect(body).toHaveProperty('accessToken');
    expect(typeof body.accessToken).toBe('string');

    const newCookie = extractRefreshCookie(response);
    expect(newCookie).not.toBe(refreshCookie);
  });

  it('should return 401 when refresh token is expired', async () => {
    const password = 'securepassword123';
    const passwordHash = await passwordHasher.hash(password);
    const user = await persistUser(testDb, { passwordHash });

    const loginResponse = await request(httpServer)
      .post('/auth/login')
      .send({ email: user.email, password })
      .expect(200);

    const refreshCookie = extractRefreshCookie(loginResponse);
    const tokenId = refreshCookie.split('.')[0];

    await testDb
      .update(refreshTokens)
      .set({ expiresAt: new Date('2020-01-01') })
      .where(eq(refreshTokens.id, tokenId));

    await request(httpServer)
      .post('/auth/refresh')
      .set('Cookie', `refreshToken=${refreshCookie}`)
      .expect(401);
  });

  it('should return 401 when refresh token is revoked', async () => {
    const password = 'securepassword123';
    const passwordHash = await passwordHasher.hash(password);
    const user = await persistUser(testDb, { passwordHash });

    const loginResponse = await request(httpServer)
      .post('/auth/login')
      .send({ email: user.email, password })
      .expect(200);

    const refreshCookie = extractRefreshCookie(loginResponse);
    const tokenId = refreshCookie.split('.')[0];

    await testDb
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.id, tokenId));

    await request(httpServer)
      .post('/auth/refresh')
      .set('Cookie', `refreshToken=${refreshCookie}`)
      .expect(401);
  });

  it('should revoke all user tokens on reuse detection', async () => {
    const refreshCookie = await loginAndGetCookie();
    const tokenId = refreshCookie.split('.')[0];

    const rotateResponse = await request(httpServer)
      .post('/auth/refresh')
      .set('Cookie', `refreshToken=${refreshCookie}`)
      .expect(200);

    const revokedRow = await testDb
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.id, tokenId))
      .limit(1);
    expect(revokedRow[0].revokedAt).not.toBeNull();

    const newRefreshCookie = extractRefreshCookie(rotateResponse);

    await request(httpServer)
      .post('/auth/refresh')
      .set('Cookie', `refreshToken=${refreshCookie}`)
      .expect(401);

    await request(httpServer)
      .post('/auth/refresh')
      .set('Cookie', `refreshToken=${newRefreshCookie}`)
      .expect(401);
  });

  it('should return 401 when no cookie is present', async () => {
    await request(httpServer).post('/auth/refresh').expect(401);
  });
});
