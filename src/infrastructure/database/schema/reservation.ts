import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';

export const reservations = pgTable('reservations', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  barberId: uuid('barber_id').notNull(),

  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),

  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
