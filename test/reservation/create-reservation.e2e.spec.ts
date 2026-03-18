import type { CreatedResponseDto } from '@http/common/dto/created-response.dto';
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

describe('ReservationController (e2e) - POST /reservations', () => {
  let app: INestApplication;
  let httpServer: App;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    configureApp(app);

    await app.init();

    httpServer = app.getHttpServer() as App;
  });

  beforeEach(async () => {
    await truncateTestDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a reservation and return 201', async () => {
    const user = await persistUser(testDb);
    const barberUser = await persistUser(testDb);
    const barber = await persistBarber(testDb, { id: barberUser.id });

    const startTime = new Date();
    startTime.setHours(10, 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(11, 0, 0, 0);

    const response = await request(httpServer)
      .post('/reservations')
      .send({
        userId: user.id,
        barberId: barber.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      })
      .expect(201);

    const body = bodyAs<CreatedResponseDto>(response);
    expect(body).toHaveProperty('id');
    expect(typeof body.id).toBe('string');
  });

  it('should return 409 when barber already has an overlapping reservation', async () => {
    const user1 = await persistUser(testDb);
    const user2 = await persistUser(testDb);
    const barberUser = await persistUser(testDb);
    const barber = await persistBarber(testDb, { id: barberUser.id });

    const startTime = new Date();
    startTime.setHours(10, 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(11, 0, 0, 0);

    await request(httpServer)
      .post('/reservations')
      .send({
        userId: user1.id,
        barberId: barber.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      })
      .expect(201);

    const response = await request(httpServer)
      .post('/reservations')
      .send({
        userId: user2.id,
        barberId: barber.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      })
      .expect(409);

    const body = bodyAs<ErrorResponseDto>(response);
    expect(body.message).toContain('barber already has a reservation');
  });

  it('should return 422 when startTime is after endTime', async () => {
    const user = await persistUser(testDb);
    const barberUser = await persistUser(testDb);
    const barber = await persistBarber(testDb, { id: barberUser.id });

    const startTime = new Date();
    startTime.setHours(11, 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(10, 0, 0, 0);

    await request(httpServer)
      .post('/reservations')
      .send({
        userId: user.id,
        barberId: barber.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      })
      .expect(422);
  });

  it('should return 404 when userId does not exist', async () => {
    const barberUser = await persistUser(testDb);
    const barber = await persistBarber(testDb, { id: barberUser.id });
    const nonExistentId = '00000000-0000-4000-a000-000000000000';

    const startTime = new Date();
    startTime.setHours(10, 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(11, 0, 0, 0);

    const response = await request(httpServer)
      .post('/reservations')
      .send({
        userId: nonExistentId,
        barberId: barber.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      })
      .expect(404);

    const body = bodyAs<ErrorResponseDto>(response);
    expect(body.message).toContain(nonExistentId);
  });

  it('should return 404 when barberId does not exist', async () => {
    const user = await persistUser(testDb);
    const nonExistentId = '00000000-0000-4000-a000-000000000000';

    const startTime = new Date();
    startTime.setHours(10, 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(11, 0, 0, 0);

    const response = await request(httpServer)
      .post('/reservations')
      .send({
        userId: user.id,
        barberId: nonExistentId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      })
      .expect(404);

    const body = bodyAs<ErrorResponseDto>(response);
    expect(body.message).toContain(nonExistentId);
  });

  it('should return 400 when required fields are missing', async () => {
    await request(httpServer).post('/reservations').send({}).expect(400);
  });

  it('should return 400 when userId or barberId is not a valid UUID', async () => {
    const startTime = new Date();
    startTime.setHours(10, 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(11, 0, 0, 0);

    await request(httpServer)
      .post('/reservations')
      .send({
        userId: 'invalid-id',
        barberId: 'also-invalid',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      })
      .expect(400);
  });

  it('should return 400 when startTime or endTime is not a valid date string', async () => {
    const user = await persistUser(testDb);
    const barberUser = await persistUser(testDb);
    const barber = await persistBarber(testDb, { id: barberUser.id });

    await request(httpServer)
      .post('/reservations')
      .send({
        userId: user.id,
        barberId: barber.id,
        startTime: 'not-a-date',
        endTime: 'not-a-date-either',
      })
      .expect(400);
  });
});
