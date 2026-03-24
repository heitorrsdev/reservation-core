import type { TokenGenerator } from '@application/auth/token-generator.interface';
import { TOKEN_GENERATOR } from '@application/auth/token-generator.token';
import type { GetBarberByIdResponseDto } from '@http/barber/dto/get-barber-by-id-response.dto';
import type { ErrorResponseDto } from '@http/common/dto/error-response.dto';
import type { INestApplication } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { persistBarber } from '@test/factories/barber.factory';
import { persistUser } from '@test/factories/user.factory';
import { bodyAs } from '@test/utils/http-response';
import { testDb } from '@test/utils/infra/test-database';
import request from 'supertest';
import type { App } from 'supertest/types';

import { configureApp } from '../../src/app.config';
import { AppModule } from '../../src/app.module';
import { truncateTestDatabase } from '../utils/infra/truncate-test-db';

describe('BarberController (e2e) - GET /barbers/:id', () => {
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

  it('should return 200 and the requested barber', async () => {
    const user = await persistUser(testDb);
    const barber = await persistBarber(testDb, { id: user.id });

    const token = await getTokenForUser(user.id, user.email);

    const response = await request(httpServer)
      .get(`/barbers/${barber.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const body = bodyAs<GetBarberByIdResponseDto>(response);
    expect(body).toHaveProperty('id', barber.id);
    expect(body).toHaveProperty('name', barber.name);
    expect(body).toHaveProperty('bio', barber.bio);
    expect(body).toHaveProperty('active', barber.active);
    expect(body).toHaveProperty('createdAt');
  });

  it('should return 401 when not authenticated', async () => {
    await request(httpServer).get('/barbers/any-id').expect(401);
  });

  it('should return 404 when barber is not found', async () => {
    const user = await persistUser(testDb);
    const token = await getTokenForUser(user.id, user.email);

    const nonExistentId = '00000000-0000-4000-a000-000000000000';

    const response = await request(httpServer)
      .get(`/barbers/${nonExistentId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    const body = bodyAs<ErrorResponseDto>(response);
    expect(body.message).toContain(nonExistentId);
  });

  it('should return 410 when barber is inactive', async () => {
    const user = await persistUser(testDb);
    const barber = await persistBarber(testDb, { id: user.id, active: false });

    const token = await getTokenForUser(user.id, user.email);

    const response = await request(httpServer)
      .get(`/barbers/${barber.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(410);

    const body = bodyAs<ErrorResponseDto>(response);
    expect(body.message).toContain(barber.id);
    expect(body.message).toContain('inactive');
  });
});
