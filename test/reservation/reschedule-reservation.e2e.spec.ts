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

describe('ReservationController (e2e) - PATCH /reservations/:id', () => {
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

  it('should allow the owning user to reschedule the reservation 2 hours before', async () => {
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

    const newStartTime = '2026-05-02T14:00:00Z';
    const newEndTime = '2026-05-02T15:00:00Z';

    await request(httpServer)
      .patch(`/reservations/${reservation.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ newStartTime, newEndTime })
      .expect(204);

    const updated = await reservationRepository.findById(reservation.id);
    expect(updated?.startTime).toEqual(new Date(newStartTime));
    expect(updated?.endTime).toEqual(new Date(newEndTime));
    expect(updated?.status).toBe('active');
  });

  it('should return 409 when rescheduling to a conflicting time', async () => {
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

    // Create a conflicting reservation for the same barber
    const otherUser = await persistUser(testDb);
    const conflictStart = new Date('2026-05-01T14:00:00Z');
    const conflictEnd = new Date('2026-05-01T15:00:00Z');

    await persistReservation(testDb, {
      userId: otherUser.id,
      barberId: barber.id,
      startTime: conflictStart,
      endTime: conflictEnd,
    });

    jest.setSystemTime(startTime.getTime() - 2 * 60 * 60 * 1000);
    const token = await getTokenForUser(user.id, user.email);

    await request(httpServer)
      .patch(`/reservations/${reservation.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        newStartTime: '2026-05-01T14:00:00Z',
        newEndTime: '2026-05-01T15:00:00Z',
      })
      .expect(409);
  });

  it('should return 422 when client tries to reschedule < 1 hour before', async () => {
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
      .patch(`/reservations/${reservation.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        newStartTime: '2026-05-02T14:00:00Z',
        newEndTime: '2026-05-02T15:00:00Z',
      })
      .expect(422);
  });

  it('should return 403 when a third-party user attempts to reschedule', async () => {
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
      .patch(`/reservations/${reservation.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        newStartTime: '2026-05-02T14:00:00Z',
        newEndTime: '2026-05-02T15:00:00Z',
      })
      .expect(403);
  });

  it('should return 409 when rescheduling a cancelled reservation', async () => {
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

    // Cancel first
    const domainReservation = await reservationRepository.findById(
      reservation.id,
    );

    if (domainReservation) {
      domainReservation.cancel(user.id, new Date());
      await reservationRepository.save(domainReservation);
    }

    await request(httpServer)
      .patch(`/reservations/${reservation.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        newStartTime: '2026-05-02T14:00:00Z',
        newEndTime: '2026-05-02T15:00:00Z',
      })
      .expect(409);
  });
});
