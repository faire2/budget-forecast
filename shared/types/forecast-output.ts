// Shared output types — no DB imports, safe to use in both API and client bundles

export interface ProjectedEntry {
  id: number;
  amount: string;
  type: 'income' | 'expense';
  note: string | null;
  isRecurring: boolean;
  isSkipped: boolean;
  recurringRule?: 'weekly' | 'biweekly' | 'monthly';
  recurringStartDate?: string;
}

export interface DailyProjection {
  date: string; // ISO YYYY-MM-DD
  income: number;
  expenses: number;
  balance: number; // end of day projected balance
  entries: ProjectedEntry[];
}
