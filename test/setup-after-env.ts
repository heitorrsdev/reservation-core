import { closeDatabase } from '@infrastructure/database/database.provider';

afterAll(async () => {
  await closeDatabase();
});
