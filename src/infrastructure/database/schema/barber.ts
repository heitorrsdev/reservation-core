import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const barbers = pgTable('barbers', {
  id: text('id').primaryKey(),

  name: text('name').notNull(),
  bio: text('bio'),
  active: boolean('active').notNull().default(true),

  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
