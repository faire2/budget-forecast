import { pgTable, serial, decimal, text, date, timestamp, integer, index, uniqueIndex } from 'drizzle-orm/pg-core';

// Balance Anchor table - stores the known starting balance
export const balanceAnchor = pgTable('balance_anchor', {
  id: serial('id').primaryKey(),
  balance: decimal('balance', { precision: 12, scale: 2 }).notNull(),
  asOfDate: date('as_of_date').notNull(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Entries table - stores both one-time and recurring income/expense entries
export const entries = pgTable('entries', {
  id: serial('id').primaryKey(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  note: text('note'),
  date: date('date'), // null if recurring
  recurringRule: text('recurring_rule', { enum: ['weekly', 'biweekly', 'monthly'] }),
  recurringStartDate: date('recurring_start_date'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  dateIdx: index('entries_date_idx').on(table.date),
  recurringStartDateIdx: index('entries_recurring_start_date_idx').on(table.recurringStartDate),
}));

// Recurring Overrides table - stores skip/edit actions for specific recurring entry occurrences
export const recurringOverrides = pgTable('recurring_overrides', {
  id: serial('id').primaryKey(),
  entryId: integer('entry_id').references(() => entries.id).notNull(),
  occurrenceDate: date('occurrence_date').notNull(),
  action: text('action', { enum: ['skip', 'edit'] }).notNull(),
  overrideAmount: decimal('override_amount', { precision: 12, scale: 2 }),
  overrideNote: text('override_note'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  entryOccurrenceIdx: uniqueIndex('recurring_overrides_entry_occurrence_idx').on(table.entryId, table.occurrenceDate),
}));

// Export types for insert and select operations
export type BalanceAnchor = typeof balanceAnchor.$inferSelect;
export type NewBalanceAnchor = typeof balanceAnchor.$inferInsert;

export type Entry = typeof entries.$inferSelect;
export type NewEntry = typeof entries.$inferInsert;

export type RecurringOverride = typeof recurringOverrides.$inferSelect;
export type NewRecurringOverride = typeof recurringOverrides.$inferInsert;
