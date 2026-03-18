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

describe('BarberController (e2e) - POST /barbers', () => {
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

  it('should create a barber and return 201', async () => {
    const user = await persistUser(testDb);

    const response = await request(httpServer)
      .post('/barbers')
      .send({
        userId: user.id,
        name: 'John the Barber',
        bio: 'Expert in fades',
      })
      .expect(201);

    const body = bodyAs<CreatedResponseDto>(response);
    expect(body).toHaveProperty('id');
    expect(body.id).toBe(user.id);
  });

  it('should create a barber with bio omitted', async () => {
    const user = await persistUser(testDb);

    const response = await request(httpServer)
      .post('/barbers')
      .send({
        userId: user.id,
        name: 'John the Barber',
      })
      .expect(201);

    const body = bodyAs<CreatedResponseDto>(response);
    expect(body).toHaveProperty('id');
    expect(body.id).toBe(user.id);
  });

  it('should return 409 when user is already a barber', async () => {
    const user = await persistUser(testDb);
    await persistBarber(testDb, { id: user.id });

    const response = await request(httpServer)
      .post('/barbers')
      .send({
        userId: user.id,
        name: 'John the Barber',
      })
      .expect(409);

    const body = bodyAs<ErrorResponseDto>(response);
    expect(body.message).toContain(user.id);
  });

  it('should return 404 when user does not exist', async () => {
    const nonExistentId = '00000000-0000-4000-a000-000000000000';

    const response = await request(httpServer)
      .post('/barbers')
      .send({
        userId: nonExistentId,
        name: 'John the Barber',
      })
      .expect(404);

    const body = bodyAs<ErrorResponseDto>(response);
    expect(body.message).toContain(nonExistentId);
  });

  it('should return 400 when userId is missing', async () => {
    await request(httpServer)
      .post('/barbers')
      .send({
        name: 'John the Barber',
      })
      .expect(400);
  });

  it('should return 400 when name is missing', async () => {
    const user = await persistUser(testDb);

    await request(httpServer)
      .post('/barbers')
      .send({
        userId: user.id,
      })
      .expect(400);
  });

  it('should return 400 when userId is invalid', async () => {
    await request(httpServer)
      .post('/barbers')
      .send({
        userId: 'invalid-id',
        name: 'John the Barber',
      })
      .expect(400);
  });
});
