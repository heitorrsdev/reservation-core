import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { configureApp } from '../../src/app.config';
import { AppModule } from '../../src/app.module';
import { truncateTestDatabase } from '../utils/infra/truncate-test-db';

describe('UserController (e2e) - POST /users', () => {
  let app: INestApplication;
  let httpServer: App;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    configureApp(app);

    await app.init();

    httpServer = app.getHttpServer();
  });

  beforeEach(async () => {
    await truncateTestDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a user and return 201 with userId', async () => {
    const response = await request(httpServer)
      .post('/users')
      .send({ email: 'test@example.com', password: '123456' })
      .expect(201);

    expect(response.body).toHaveProperty('userId');
    expect(response.body.userId).toBeDefined();
  });

  it('should return 409 when email already exists', async () => {
    await request(httpServer)
      .post('/users')
      .send({ email: 'duplicate@example.com', password: '123456' })
      .expect(201);

    const response = await request(httpServer)
      .post('/users')
      .send({ email: 'duplicate@example.com', password: '123456' })
      .expect(409);

    expect(response.body.message).toContain('duplicate@example.com');
  });

  it('should return 400 when email is invalid', async () => {
    await request(httpServer)
      .post('/users')
      .send({ email: 'invalid-email', password: '123456' })
      .expect(400);
  });

  it('should return 400 when password is too short', async () => {
    await request(httpServer)
      .post('/users')
      .send({ email: 'test@example.com', password: '123' })
      .expect(400);
  });
});
