import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import * as reservationSchema from './reservation';
import * as userSchema from './user';

export type DrizzleDatabase = NodePgDatabase<{
  user: typeof userSchema;
  reservation: typeof reservationSchema;
}>;
