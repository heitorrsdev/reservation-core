import type { TokenGenerator } from '@application/auth/token-generator.interface';
import { TOKEN_GENERATOR } from '@application/auth/token-generator.token';
import { RESERVATION_REPOSITORY } from '@application/reservation/reservation-repository.token';
import type { ReservationDrizzleRepository } from '@infrastructure/reservation/reservation.drizzle-repository';
import type { INestApplication } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { persistBarber } from '@test/factories/barber.factory';
import { persistReservation } from '@test/factories/reservation.factory';
import { persistUser } from '@test/factories/user.factory';
import { testDb } from '@test/utils/infra/test-database';
import { truncateTestDatabase } from '@test/utils/infra/truncate-test-db';
import request from 'supertest';
import type { App } from 'supertest/types';

import { configureApp } from '../../src/app.config';
import { AppModule } from '../../src/app.module';

describe('ReservationController (e2e) - DELETE /reservations/:id', () => {
  let app: INestApplication;
  let httpServer: App;
  let tokenGenerator: TokenGenerator;
  let reservationRepository: ReservationDrizzleRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();

    httpServer = app.getHttpServer() as App;
    tokenGenerator = app.get<TokenGenerator>(TOKEN_GENERATOR);
    reservationRepository = app.get<ReservationDrizzleRepository>(
      RESERVATION_REPOSITORY,
    );
  });

  beforeEach(async () => {
    await truncateTestDatabase();
    jest.useFakeTimers({
      doNotFake: [
        'nextTick',
        'setImmediate',
        'clearImmediate',
        'setInterval',
        'clearInterval',
        'setTimeout',
        'clearTimeout',
      ],
    });
  });

  afterAll(async () => {
    jest.useRealTimers();
    await app.close();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  async function getTokenForUser(
    userId: string,
    email: string,
  ): Promise<string> {
    return tokenGenerator.generate({ sub: userId, email });
  }

  it('should allow the owning user to cancel the reservation 2 hours before', async () => {
    const user = await persistUser(testDb);
    const barberUser = await persistUser(testDb);
    const barber = await persistBarber(testDb, { id: barberUser.id });

    const startTime = new Date('2026-05-01T10:00:00Z');
    const endTime = new Date('2026-05-01T11:00:00Z');

    const reservation = await persistReservation(testDb, {
      userId: user.id,
      barberId: barber.id,
      startTime,
      endTime,
    });

    jest.setSystemTime(startTime.getTime() - 2 * 60 * 60 * 1000);
    const token = await getTokenForUser(user.id, user.email);

    await request(httpServer)
      .delete(`/reservations/${reservation.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    const updated = await reservationRepository.findById(reservation.id);
    expect(updated?.status).toBe('cancelled');
  });

  it('should return 422 when client attempts to cancel 30 minutes before', async () => {
    const user = await persistUser(testDb);
    const barberUser = await persistUser(testDb);
    const barber = await persistBarber(testDb, { id: barberUser.id });

    const startTime = new Date('2026-05-01T10:00:00Z');
    const endTime = new Date('2026-05-01T11:00:00Z');

    const reservation = await persistReservation(testDb, {
      userId: user.id,
      barberId: barber.id,
      startTime,
      endTime,
    });

    jest.setSystemTime(startTime.getTime() - 30 * 60 * 1000);
    const token = await getTokenForUser(user.id, user.email);

    await request(httpServer)
      .delete(`/reservations/${reservation.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(422);
  });

  it('should allow the provider barber to cancel 30 minutes before', async () => {
    const user = await persistUser(testDb);
    const barberUser = await persistUser(testDb);
    const barber = await persistBarber(testDb, { id: barberUser.id });

    const startTime = new Date('2026-05-01T10:00:00Z');
    const endTime = new Date('2026-05-01T11:00:00Z');

    const reservation = await persistReservation(testDb, {
      userId: user.id,
      barberId: barber.id,
      startTime,
      endTime,
    });

    jest.setSystemTime(startTime.getTime() - 30 * 60 * 1000);
    const token = await getTokenForUser(barberUser.id, barberUser.email);

    await request(httpServer)
      .delete(`/reservations/${reservation.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    const updated = await reservationRepository.findById(reservation.id);
    expect(updated?.status).toBe('cancelled');
  });

  it('should return 422 when barber attempts to cancel 5 minutes after start', async () => {
    const user = await persistUser(testDb);
    const barberUser = await persistUser(testDb);
    const barber = await persistBarber(testDb, { id: barberUser.id });

    const startTime = new Date('2026-05-01T10:00:00Z');
    const endTime = new Date('2026-05-01T11:00:00Z');

    const reservation = await persistReservation(testDb, {
      userId: user.id,
      barberId: barber.id,
      startTime,
      endTime,
    });

    jest.setSystemTime(startTime.getTime() + 5 * 60 * 1000);
    const token = await getTokenForUser(barberUser.id, barberUser.email);

    await request(httpServer)
      .delete(`/reservations/${reservation.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(422);
  });

  it('should return 403 when a third-party user attempts to cancel', async () => {
    const user = await persistUser(testDb);
    const barberUser = await persistUser(testDb);
    const barber = await persistBarber(testDb, { id: barberUser.id });
    const maliciousUser = await persistUser(testDb);

    const startTime = new Date('2026-05-01T10:00:00Z');
    const endTime = new Date('2026-05-01T11:00:00Z');

    const reservation = await persistReservation(testDb, {
      userId: user.id,
      barberId: barber.id,
      startTime,
      endTime,
    });

    jest.setSystemTime(new Date('2026-05-01T08:00:00Z'));
    const token = await getTokenForUser(maliciousUser.id, maliciousUser.email);

    await request(httpServer)
      .delete(`/reservations/${reservation.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('should return 409 when attempting to cancel an already cancelled reservation', async () => {
    const user = await persistUser(testDb);
    const barberUser = await persistUser(testDb);
    const barber = await persistBarber(testDb, { id: barberUser.id });

    const startTime = new Date('2026-05-01T10:00:00Z');
    const endTime = new Date('2026-05-01T11:00:00Z');

    const reservation = await persistReservation(testDb, {
      userId: user.id,
      barberId: barber.id,
      startTime,
      endTime,
    });

    jest.setSystemTime(new Date('2026-05-01T08:00:00Z'));
    const token = await getTokenForUser(user.id, user.email);

    const domainReservation = await reservationRepository.findById(
      reservation.id,
    );

    if (domainReservation) {
      domainReservation.cancel(user.id, new Date());
      await reservationRepository.save(domainReservation);
    }

    await request(httpServer)
      .delete(`/reservations/${reservation.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(409);
  });
});
