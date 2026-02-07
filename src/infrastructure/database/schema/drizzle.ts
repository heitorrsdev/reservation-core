import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import * as barbersSchema from './barber';
import * as reservationSchema from './reservation';
import * as userSchema from './user';

export type DrizzleDatabase = NodePgDatabase<{
  barber: typeof barbersSchema;
  reservation: typeof reservationSchema;
  user: typeof userSchema;
}>;
