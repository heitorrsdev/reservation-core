import type { TokenGenerator } from '@application/auth/token-generator.interface';
import { TOKEN_GENERATOR } from '@application/auth/token-generator.token';
import type { ErrorResponseDto } from '@http/common/dto/error-response.dto';
import type { GetReservationByIdResponseDto } from '@http/reservation/dto/get-reservation-by-id-response.dto';
import type { INestApplication } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { persistBarber } from '@test/factories/barber.factory';
import { persistReservation } from '@test/factories/reservation.factory';
import { persistUser } from '@test/factories/user.factory';
import { bodyAs } from '@test/utils/http-response';
import { testDb } from '@test/utils/infra/test-database';
import request from 'supertest';
import type { App } from 'supertest/types';

import { configureApp } from '../../src/app.config';
import { AppModule } from '../../src/app.module';
import { truncateTestDatabase } from '../utils/infra/truncate-test-db';

describe('ReservationController (e2e) - GET /reservations/:id', () => {
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

  it('should return 200 and the requested reservation', async () => {
    const user = await persistUser(testDb);
    const barberUser = await persistUser(testDb);
    const barber = await persistBarber(testDb, { id: barberUser.id });

    const startTime = new Date();
    startTime.setHours(10, 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(11, 0, 0, 0);

    const reservation = await persistReservation(testDb, {
      userId: user.id,
      barberId: barber.id,
      startTime,
      endTime,
    });

    const token = await getTokenForUser(user.id, user.email);

    const response = await request(httpServer)
      .get(`/reservations/${reservation.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const body = bodyAs<GetReservationByIdResponseDto>(response);
    expect(body).toHaveProperty('id', reservation.id);
    expect(body).toHaveProperty('userId', reservation.userId);
    expect(body).toHaveProperty('barberId', reservation.barberId);
    expect(body).toHaveProperty(
      'startTime',
      reservation.startTime.toISOString(),
    );
    expect(body).toHaveProperty('endTime', reservation.endTime.toISOString());
    expect(body).toHaveProperty('createdAt');
  });

  it('should return 401 when not authenticated', async () => {
    await request(httpServer).get('/reservations/any-id').expect(401);
  });

  it('should return 404 when reservation is not found', async () => {
    const user = await persistUser(testDb);
    const token = await getTokenForUser(user.id, user.email);

    const nonExistentId = '00000000-0000-4000-a000-000000000000';

    const response = await request(httpServer)
      .get(`/reservations/${nonExistentId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    const body = bodyAs<ErrorResponseDto>(response);
    expect(body.message).toContain(nonExistentId);
  });
});
