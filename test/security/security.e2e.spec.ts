import type { INestApplication } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';

import { configureApp } from '../../src/app.config';
import { AppModule } from '../../src/app.module';

describe('Security Configuration (e2e)', () => {
  let app: INestApplication;
  let httpServer: App;
  const originalLimit = process.env.THROTTLE_LIMIT;

  beforeAll(async () => {
    process.env.THROTTLE_LIMIT = '10';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();

    httpServer = app.getHttpServer() as App;
  });

  afterAll(async () => {
    process.env.THROTTLE_LIMIT = originalLimit;
    await app.close();
  });

  describe('Helmet (Security Headers)', () => {
    it('should inject standard security headers in the response', async () => {
      const response = await request(httpServer).get('/health');
      expect(response.status).toBe(200);

      expect(response.header['x-frame-options']).toBeDefined();
      expect(response.header['x-dns-prefetch-control']).toBeDefined();
      expect(response.header['strict-transport-security']).toBeDefined();
    });
  });

  describe('Throttler (Global Rate Limiting)', () => {
    it('should allow consecutive requests up to the limit and block the next one with 429', async () => {
      // Helmet test consumed 1 request. limit is 10. We can do 9 more.
      for (let i = 0; i < 9; i++) {
        await request(httpServer).get('/health').expect(200);
      }

      // The 11th request MUST fail with 429 Too Many Requests
      await request(httpServer).get('/health').expect(429);
    });
  });
});
