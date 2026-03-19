import type { PasswordHasher } from '@application/user/password-hasher.interface';
import { PASSWORD_HASHER } from '@application/user/password-hasher.token';
import type { INestApplication } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { persistUser } from '@test/factories/user.factory';
import { bodyAs } from '@test/utils/http-response';
import { testDb } from '@test/utils/infra/test-database';
import request from 'supertest';
import type { App } from 'supertest/types';

import { configureApp } from '../../src/app.config';
import { AppModule } from '../../src/app.module';
import { truncateTestDatabase } from '../utils/infra/truncate-test-db';

describe('AuthController (e2e) - POST /auth/login', () => {
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

  it('should return 200 with an accessToken for valid credentials', async () => {
    const password = 'securepassword123';
    const passwordHash = await passwordHasher.hash(password);
    const user = await persistUser(testDb, { passwordHash });

    const response = await request(httpServer)
      .post('/auth/login')
      .send({ email: user.email, password })
      .expect(200);

    const body = bodyAs<{ accessToken: string }>(response);
    expect(body).toHaveProperty('accessToken');
    expect(typeof body.accessToken).toBe('string');
  });

  it('should set a refreshToken HttpOnly cookie on successful login', async () => {
    const password = 'securepassword123';
    const passwordHash = await passwordHasher.hash(password);
    const user = await persistUser(testDb, { passwordHash });

    const response = await request(httpServer)
      .post('/auth/login')
      .send({ email: user.email, password })
      .expect(200);

    const cookies = response.headers['set-cookie'] as unknown as string[];
    expect(cookies).toBeDefined();
    const refreshCookie = cookies.find((c: string) =>
      c.startsWith('refreshToken='),
    );
    expect(refreshCookie).toBeDefined();
    expect(refreshCookie).toContain('HttpOnly');
  });

  it('should not include refreshToken in the response body', async () => {
    const password = 'securepassword123';
    const passwordHash = await passwordHasher.hash(password);
    const user = await persistUser(testDb, { passwordHash });

    const response = await request(httpServer)
      .post('/auth/login')
      .send({ email: user.email, password })
      .expect(200);

    const body = bodyAs<Record<string, unknown>>(response);
    expect(body).not.toHaveProperty('refreshToken');
  });

  it('should return 401 when using wrong password', async () => {
    const passwordHash = await passwordHasher.hash('correctpassword');
    const user = await persistUser(testDb, { passwordHash });

    await request(httpServer)
      .post('/auth/login')
      .send({ email: user.email, password: 'wrongpassword' })
      .expect(401);
  });

  it('should return 401 when email does not exist', async () => {
    await request(httpServer)
      .post('/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'somepassword' })
      .expect(401);
  });

  it('should return 400 when missing email or password', async () => {
    await request(httpServer).post('/auth/login').send({}).expect(400);
    await request(httpServer)
      .post('/auth/login')
      .send({ email: 'test@example.com' })
      .expect(400);
    await request(httpServer)
      .post('/auth/login')
      .send({ password: 'pwd' })
      .expect(400);
  });
});
