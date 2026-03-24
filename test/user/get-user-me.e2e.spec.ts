import type { TokenGenerator } from '@application/auth/token-generator.interface';
import { TOKEN_GENERATOR } from '@application/auth/token-generator.token';
import type { ErrorResponseDto } from '@http/common/dto/error-response.dto';
import type { GetUserMeResponseDto } from '@http/user/dto/get-user-me-response.dto';
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

describe('UserController (e2e) - GET /users/me', () => {
  let app: INestApplication;
  let httpServer: App;
  let tokenGenerator: TokenGenerator;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    configureApp(app);

    await app.init();

    httpServer = app.getHttpServer() as App;
    tokenGenerator = app.get<TokenGenerator>(TOKEN_GENERATOR);
  });

  beforeEach(async () => {
    await truncateTestDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  async function getTokenForUser(
    userId: string,
    email: string,
  ): Promise<string> {
    return tokenGenerator.generate({ sub: userId, email });
  }

  it('should return 200 with the authenticated user data', async () => {
    const user = await persistUser(testDb);
    const token = await getTokenForUser(user.id, user.email);

    const response = await request(httpServer)
      .get('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const body = bodyAs<GetUserMeResponseDto>(response);
    expect(body).toHaveProperty('id');
    expect(body.id).toBe(user.id);
    expect(body).toHaveProperty('email');
    expect(body.email).toBe(user.email);
    expect(body).toHaveProperty('createdAt');
    expect(body).not.toHaveProperty('passwordHash');
  });

  it('should return 401 when not authenticated', async () => {
    await request(httpServer).get('/users/me').expect(401);
  });

  it('should return 404 when user is not found', async () => {
    const nonExistentId = '00000000-0000-4000-a000-000000000000';
    const token = await getTokenForUser(nonExistentId, 'test@example.com');

    const response = await request(httpServer)
      .get('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    const body = bodyAs<ErrorResponseDto>(response);
    expect(body.message).toContain(nonExistentId);
  });
});
