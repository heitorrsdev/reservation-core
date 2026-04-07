import type { TokenGenerator } from '@application/auth/token-generator.interface';
import { TOKEN_GENERATOR } from '@application/auth/token-generator.token';
import type { GetAllBarbersResponseDto } from '@http/barber/dto/get-all-barbers-response.dto';
import type { INestApplication } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { persistBarber } from '@test/factories/barber.factory';
import { persistUser } from '@test/factories/user.factory';
import { bodyAs } from '@test/utils/http-response';
import { testDb } from '@test/utils/infra/test-database';
import { truncateTestDatabase } from '@test/utils/infra/truncate-test-db';
import request from 'supertest';
import type { App } from 'supertest/types';

import { configureApp } from '../../src/app.config';
import { AppModule } from '../../src/app.module';

describe('BarberController (e2e) - GET /barbers', () => {
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

  it('should return 200 and an array of active barbers', async () => {
    const requestUser = await persistUser(testDb);
    const token = await getTokenForUser(requestUser.id, requestUser.email);

    // Active barbers
    const user1 = await persistUser(testDb);
    const barber1 = await persistBarber(testDb, {
      id: user1.id,
      name: 'John Doe',
      active: true,
    });

    const user2 = await persistUser(testDb);
    const barber2 = await persistBarber(testDb, {
      id: user2.id,
      name: 'Jane Doe',
      active: true,
    });

    // Inactive barber (should not be returned)
    const user3 = await persistUser(testDb);
    await persistBarber(testDb, {
      id: user3.id,
      name: 'Inactive Barber',
      active: false,
    });

    const response = await request(httpServer)
      .get('/barbers')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const body = bodyAs<GetAllBarbersResponseDto>(response);

    expect(body.data).toHaveLength(2);
    expect(body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: barber1.id,
          name: barber1.name,
          bio: barber1.bio,
        }),
        expect.objectContaining({
          id: barber2.id,
          name: barber2.name,
          bio: barber2.bio,
        }),
      ]),
    );

    // Ensure it doesn't leak password hashes or creation dates not in DTO
    expect(body.data[0]).not.toHaveProperty('passwordHash');
    expect(body.data[0]).not.toHaveProperty('email');
    expect(body.data[0]).not.toHaveProperty('createdAt');
  });

  it('should return 401 when not authenticated', async () => {
    await request(httpServer).get('/barbers').expect(401);
  });
});
