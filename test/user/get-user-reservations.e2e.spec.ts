import type { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { persistBarber } from '@test/factories/barber.factory';
import { persistReservation } from '@test/factories/reservation.factory';
import { persistUser } from '@test/factories/user.factory';
import { bodyAs } from '@test/utils/http-response';
import { testDb } from '@test/utils/infra/test-database';
import { truncateTestDatabase } from '@test/utils/infra/truncate-test-db';
import request from 'supertest';
import type { App } from 'supertest/types';

import { configureApp } from '../../src/app.config';
import { AppModule } from '../../src/app.module';
import type { GetUserReservationsResponseDto } from '../../src/interfaces/http/user/dto/get-user-reservations-response.dto';

describe('UserController (e2e) - GET /users/me/reservations', () => {
  let app: INestApplication;
  let httpServer: App;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
    httpServer = app.getHttpServer() as unknown as App;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await truncateTestDatabase();
  });

  async function getTokenForUser(
    userId: string,
    email: string,
  ): Promise<string> {
    const jwtService = app.get<JwtService>(JwtService);
    return await jwtService.signAsync({
      sub: userId,
      email,
    });
  }

  it('should return a list of reservations belonging only to the authenticated user', async () => {
    // Arrange
    const userA = await persistUser(testDb);
    const userB = await persistUser(testDb);
    const barberUser = await persistUser(testDb);
    const barber = await persistBarber(testDb, { id: barberUser.id });

    // Reservations for User A
    const resA1 = await persistReservation(testDb, {
      userId: userA.id,
      barberId: barber.id,
      startTime: new Date('2030-01-01T10:00:00Z'),
    });
    const resA2 = await persistReservation(testDb, {
      userId: userA.id,
      barberId: barber.id,
      startTime: new Date('2030-02-01T10:00:00Z'),
    });

    // Reservations for User B
    await persistReservation(testDb, {
      userId: userB.id,
      barberId: barber.id,
    });

    const tokenA = await getTokenForUser(userA.id, userA.email);

    // Act
    const res = await request(httpServer)
      .get('/users/me/reservations')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);

    const mappedRes = bodyAs<GetUserReservationsResponseDto>(res);

    // Assert
    expect(mappedRes.data).toHaveLength(2);

    const ids = mappedRes.data.map((r) => r.id);
    expect(ids).toContain(resA1.id);
    expect(ids).toContain(resA2.id);

    // Check mapping
    const firstRes = mappedRes.data.find((r) => r.id === resA1.id);
    expect(firstRes).toBeDefined();
    expect(firstRes?.barberId).toEqual(barber.id);
    expect(firstRes?.status).toEqual('active');
    expect(firstRes?.startTime).toBeDefined();
    expect(firstRes?.endTime).toBeDefined();
    expect(firstRes?.createdAt).toBeDefined();
    // Do not expose sensitive data such as another user's details or internal timestamps useless to the response
    expect(firstRes).not.toHaveProperty('userId');
  });

  it('should reject unauthenticated requests', async () => {
    await request(httpServer).get('/users/me/reservations').expect(401);
  });
});
