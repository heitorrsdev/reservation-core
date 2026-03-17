import type { INestApplication } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';

import { configureApp } from '../src/app.config';
import { AppModule } from '../src/app.module';

describe('CORS (e2e)', () => {
  let app: INestApplication;
  let httpServer: App;

  beforeAll(async () => {
    process.env.ALLOWED_ORIGINS = 'http://example.com,http://test.com';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    configureApp(app);

    await app.init();

    httpServer = app.getHttpServer() as App;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should allow origin when it matches ALLOWED_ORIGINS', async () => {
    const response = await request(httpServer)
      .options('/')
      .set('Origin', 'http://example.com')
      .set('Access-Control-Request-Method', 'GET')
      .expect(204);

    expect(response.headers['access-control-allow-origin']).toBe(
      'http://example.com',
    );
  });

  it('should NOT allow origin when it does NOT match ALLOWED_ORIGINS', async () => {
    const response = await request(httpServer)
      .options('/')
      .set('Origin', 'http://malicious.com')
      .set('Access-Control-Request-Method', 'GET')
      .expect(204);

    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });
});
