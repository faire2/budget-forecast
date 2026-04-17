import type { Entry, RecurringOverride, BalanceAnchor } from '../db/schema.js';

export type { ProjectedEntry, DailyProjection } from './forecast-output.js';

// Input for forecast calculation
export interface ForecastInput {
  startDate: string; // ISO YYYY-MM-DD
  endDate: string; // ISO YYYY-MM-DD
  balanceAnchor: BalanceAnchor;
  entries: Entry[];
  overrides: RecurringOverride[];
}
