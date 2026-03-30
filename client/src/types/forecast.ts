// Client-side types for forecast data
// Keep in sync with server/src/types/forecast.ts

// Entry detail in a daily projection
export type ProjectedEntry = {
  id: number;
  amount: string;
  type: 'income' | 'expense';
  note: string | null;
  isRecurring: boolean;
  isSkipped: boolean;
};

// Daily projection result
export type DailyProjection = {
  date: string; // ISO YYYY-MM-DD
  income: number;
  expenses: number;
  balance: number; // end of day projected balance
  entries: ProjectedEntry[];
};
