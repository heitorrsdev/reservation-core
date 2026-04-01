import type { TokenGenerator } from '@application/auth/token-generator.interface';
import { TOKEN_GENERATOR } from '@application/auth/token-generator.token';
import type {
  BarberReservationFullDto,
  BarberReservationSlotDto,
  GetBarberReservationsResponseDto,
} from '@http/barber/dto/get-barber-reservations-response.dto';
import type { ErrorResponseDto } from '@http/common/dto/error-response.dto';
import type { INestApplication } from '@nestjs/common';
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

describe('BarberController (e2e) - GET /barbers/:id/reservations', () => {
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

  it('should return full reservation data when requested by the barber (owner)', async () => {
    const barberUser = await persistUser(testDb);
    const barber = await persistBarber(testDb, { id: barberUser.id });
    const clientUser = await persistUser(testDb);

    const startTime = new Date('2026-06-01T10:00:00Z');
    const endTime = new Date('2026-06-01T11:00:00Z');

    await persistReservation(testDb, {
      userId: clientUser.id,
      barberId: barber.id,
      startTime,
      endTime,
    });

    const token = await getTokenForUser(barberUser.id, barberUser.email);

    const response = await request(httpServer)
      .get(`/barbers/${barber.id}/reservations`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const body = bodyAs<GetBarberReservationsResponseDto>(response);
    expect(body.data).toHaveLength(1);

    const item = body.data[0] as BarberReservationFullDto;
    expect(item).toHaveProperty('id');
    expect(item).toHaveProperty('userId', clientUser.id);
    expect(item).toHaveProperty('startTime');
    expect(item).toHaveProperty('endTime');

    expect(body.meta.totalItems).toBe(1);
    expect(body.meta.itemCount).toBe(1);
    expect(body.meta.itemsPerPage).toBe(20);
    expect(body.meta.totalPages).toBe(1);
    expect(body.meta.currentPage).toBe(1);
  });

  it('should return time slots only when requested by a non-owner user', async () => {
    const barberUser = await persistUser(testDb);
    const barber = await persistBarber(testDb, { id: barberUser.id });
    const clientUser = await persistUser(testDb);

    const startTime = new Date('2026-06-01T10:00:00Z');
    const endTime = new Date('2026-06-01T11:00:00Z');

    await persistReservation(testDb, {
      userId: clientUser.id,
      barberId: barber.id,
      startTime,
      endTime,
    });

    const token = await getTokenForUser(clientUser.id, clientUser.email);

    const response = await request(httpServer)
      .get(`/barbers/${barber.id}/reservations`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const body = bodyAs<GetBarberReservationsResponseDto>(response);
    expect(body.data).toHaveLength(1);

    const item = body.data[0] as BarberReservationSlotDto;
    expect(item).toHaveProperty('startTime');
    expect(item).toHaveProperty('endTime');
    expect(item).not.toHaveProperty('id');
    expect(item).not.toHaveProperty('userId');
  });

  it('should paginate results correctly', async () => {
    const barberUser = await persistUser(testDb);
    const barber = await persistBarber(testDb, { id: barberUser.id });
    const clientUser = await persistUser(testDb);

    for (let i = 0; i < 5; i++) {
      const start = new Date(`2026-06-0${i + 1}T10:00:00Z`);
      const end = new Date(`2026-06-0${i + 1}T11:00:00Z`);
      await persistReservation(testDb, {
        userId: clientUser.id,
        barberId: barber.id,
        startTime: start,
        endTime: end,
      });
    }

    const token = await getTokenForUser(barberUser.id, barberUser.email);

    const response = await request(httpServer)
      .get(`/barbers/${barber.id}/reservations?limit=2&page=2`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const body = bodyAs<GetBarberReservationsResponseDto>(response);
    expect(body.data).toHaveLength(2);
    expect(body.meta.totalItems).toBe(5);
    expect(body.meta.itemCount).toBe(2);
    expect(body.meta.itemsPerPage).toBe(2);
    expect(body.meta.totalPages).toBe(3);
    expect(body.meta.currentPage).toBe(2);
  });

  it('should filter reservations by date range', async () => {
    const barberUser = await persistUser(testDb);
    const barber = await persistBarber(testDb, { id: barberUser.id });
    const clientUser = await persistUser(testDb);

    await persistReservation(testDb, {
      userId: clientUser.id,
      barberId: barber.id,
      startTime: new Date('2026-06-01T10:00:00Z'),
      endTime: new Date('2026-06-01T11:00:00Z'),
    });

    await persistReservation(testDb, {
      userId: clientUser.id,
      barberId: barber.id,
      startTime: new Date('2026-07-01T10:00:00Z'),
      endTime: new Date('2026-07-01T11:00:00Z'),
    });

    const token = await getTokenForUser(barberUser.id, barberUser.email);

    const response = await request(httpServer)
      .get(
        `/barbers/${barber.id}/reservations?startTime=2026-06-01T00:00:00Z&endTime=2026-06-30T23:59:59Z`,
      )
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const body = bodyAs<GetBarberReservationsResponseDto>(response);
    expect(body.data).toHaveLength(1);
    expect(body.meta.totalItems).toBe(1);
  });

  it('should return 401 when not authenticated', async () => {
    await request(httpServer).get('/barbers/any-id/reservations').expect(401);
  });

  it('should return 404 when barber is not found', async () => {
    const user = await persistUser(testDb);
    const token = await getTokenForUser(user.id, user.email);

    const nonExistentId = '00000000-0000-4000-a000-000000000000';

    const response = await request(httpServer)
      .get(`/barbers/${nonExistentId}/reservations`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    const body = bodyAs<ErrorResponseDto>(response);
    expect(body.message).toContain(nonExistentId);
  });

  it('should return 422 when startTime is after endTime', async () => {
    const barberUser = await persistUser(testDb);
    const barber = await persistBarber(testDb, { id: barberUser.id });

    const token = await getTokenForUser(barberUser.id, barberUser.email);

    await request(httpServer)
      .get(
        `/barbers/${barber.id}/reservations?startTime=2026-07-01T00:00:00Z&endTime=2026-06-01T00:00:00Z`,
      )
      .set('Authorization', `Bearer ${token}`)
      .expect(422);
  });

  it('should return empty data with correct meta when no reservations exist', async () => {
    const barberUser = await persistUser(testDb);
    const barber = await persistBarber(testDb, { id: barberUser.id });

    const token = await getTokenForUser(barberUser.id, barberUser.email);

    const response = await request(httpServer)
      .get(`/barbers/${barber.id}/reservations`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const body = bodyAs<GetBarberReservationsResponseDto>(response);
    expect(body.data).toHaveLength(0);
    expect(body.meta.totalItems).toBe(0);
    expect(body.meta.itemCount).toBe(0);
    expect(body.meta.totalPages).toBe(0);
    expect(body.meta.currentPage).toBe(1);
  });
});
