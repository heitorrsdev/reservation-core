import { config } from 'dotenv';

import { migrateTestDatabase } from '../utils/migrate-test-db';

export default () => {
  config({ path: '.env.test' });

  console.log('🚀 Migrating test database...');
  migrateTestDatabase();
};
