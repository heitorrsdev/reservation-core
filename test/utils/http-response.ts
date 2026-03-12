import type request from 'supertest';

export function bodyAs<T>(response: request.Response): T {
  return response.body as T;
}
