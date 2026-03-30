import type { Entry, RecurringOverride, BalanceAnchor } from '../db/schema.js';

// Input for forecast calculation
export interface ForecastInput {
  startDate: string; // ISO YYYY-MM-DD
  endDate: string; // ISO YYYY-MM-DD
  balanceAnchor: BalanceAnchor;
  entries: Entry[];
  overrides: RecurringOverride[];
}

// Entry detail in a daily projection
export interface ProjectedEntry {
  id: number;
  amount: string;
  type: 'income' | 'expense';
  note: string | null;
  isRecurring: boolean;
  isSkipped: boolean;
}

// Daily projection result
export interface DailyProjection {
  date: string; // ISO YYYY-MM-DD
  income: number;
  expenses: number;
  balance: number; // end of day projected balance
  entries: ProjectedEntry[];
}
