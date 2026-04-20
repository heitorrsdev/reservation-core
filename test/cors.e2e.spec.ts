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

  async function setupApp(originsConfig: string | undefined): Promise<void> {
    if (originsConfig === undefined) {
      delete process.env.ALLOWED_ORIGINS;
    } else {
      process.env.ALLOWED_ORIGINS = originsConfig;
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
    httpServer = app.getHttpServer() as App;
  }

  afterEach(async () => {
    await app.close();
  });

  describe('when ALLOWED_ORIGINS is a list', () => {
    beforeEach(async () => setupApp('http://example.com,http://test.com'));

    it('should allow origin when it matches', async () => {
      const response = await request(httpServer)
        .options('/health')
        .set('Origin', 'http://example.com')
        .set('Access-Control-Request-Method', 'GET')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBe(
        'http://example.com',
      );
    });

    it('should NOT allow origin when it does NOT match', async () => {
      const response = await request(httpServer)
        .options('/health')
        .set('Origin', 'http://malicious.com')
        .set('Access-Control-Request-Method', 'GET')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBeUndefined();
    });
  });

  describe('when ALLOWED_ORIGINS is "true"', () => {
    beforeEach(async () => setupApp('true'));

    it('should allow any origin for health endpoint', async () => {
      const response = await request(httpServer)
        .options('/health')
        .set('Origin', 'http://random-origin.com')
        .set('Access-Control-Request-Method', 'GET')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBe(
        'http://random-origin.com',
      );
    });
  });

  describe('when ALLOWED_ORIGINS is "*"', () => {
    beforeEach(async () => setupApp('*'));

    it('should allow any origin for health endpoint', async () => {
      const response = await request(httpServer)
        .options('/health')
        .set('Origin', 'http://another-random.com')
        .set('Access-Control-Request-Method', 'GET')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBe(
        'http://another-random.com',
      );
    });
  });
});
