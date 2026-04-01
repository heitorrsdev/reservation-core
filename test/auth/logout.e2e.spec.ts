import type { PasswordHasher } from '@application/user/password-hasher.interface';
import { PASSWORD_HASHER } from '@application/user/password-hasher.token';
import type { INestApplication } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { persistUser } from '@test/factories/user.factory';
import { testDb } from '@test/utils/infra/test-database';
import { truncateTestDatabase } from '@test/utils/infra/truncate-test-db';
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

describe('AuthController (e2e) - POST /auth/logout', () => {
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

  it('should return 200 and clear the refresh token cookie', async () => {
    const password = 'securepassword123';
    const passwordHash = await passwordHasher.hash(password);
    const user = await persistUser(testDb, { passwordHash });

    const loginResponse = await request(httpServer)
      .post('/auth/login')
      .send({ email: user.email, password })
      .expect(200);

    const refreshCookie = extractRefreshCookie(loginResponse);

    const logoutResponse = await request(httpServer)
      .post('/auth/logout')
      .set('Cookie', `refreshToken=${refreshCookie}`)
      .expect(200);

    const cookies = logoutResponse.headers['set-cookie'] as unknown as string[];
    const clearedCookie = cookies.find((c: string) =>
      c.startsWith('refreshToken='),
    );
    expect(clearedCookie).toBeDefined();
    expect(clearedCookie).toContain('refreshToken=;');
  });

  it('should return 401 when no cookie is present', async () => {
    await request(httpServer).post('/auth/logout').expect(401);
  });
});
