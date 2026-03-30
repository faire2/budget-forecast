import { useState } from 'react';

// Type for form data (matches backend Entry schema)
export type EntryFormData = {
  amount: number; // in cents
  type: 'income' | 'expense';
  note: string;
  // One-time entry fields
  date?: string; // ISO date string (YYYY-MM-DD), required if not recurring
  // Recurring entry fields
  recurringRule?: 'weekly' | 'biweekly' | 'monthly';
  recurringStartDate?: string; // ISO date string, required if recurring
};

type EntryFormProps = {
  onSubmit: (data: EntryFormData) => void;
  onCancel?: () => void;
};

export function EntryForm({ onSubmit, onCancel }: EntryFormProps) {
  const [amountDollars, setAmountDollars] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [note, setNote] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  // One-time fields
  const [date, setDate] = useState('');
  // Recurring fields
  const [recurringRule, setRecurringRule] = useState<'weekly' | 'biweekly' | 'monthly'>('weekly');
  const [recurringStartDate, setRecurringStartDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate amount
    const amount = parseFloat(amountDollars);
    if (!amountDollars || isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    // Validate date fields based on entry type
    if (isRecurring) {
      if (!recurringStartDate) {
        newErrors.recurringStartDate = 'Start date is required for recurring entries';
      }
    } else {
      if (!date) {
        newErrors.date = 'Date is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Convert dollars to cents (e.g., 50.00 -> 5000)
    const amountCents = Math.round(parseFloat(amountDollars) * 100);

    const formData: EntryFormData = {
      amount: amountCents,
      type,
      note: note.trim(),
    };

    // Add appropriate date fields based on entry type
    if (isRecurring) {
      formData.recurringRule = recurringRule;
      formData.recurringStartDate = recurringStartDate;
    } else {
      formData.date = date;
    }

    onSubmit(formData);

    // Reset form
    setAmountDollars('');
    setType('income');
    setDate('');
    setNote('');
    setIsRecurring(false);
    setRecurringRule('weekly');
    setRecurringStartDate('');
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Amount field */}
      <div className="space-y-2">
        <label htmlFor="amount" className="text-sm font-medium text-foreground">
          Amount
        </label>
        <input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          value={amountDollars}
          onChange={(e) => setAmountDollars(e.target.value)}
          className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
          placeholder="0.00"
          autoFocus
          aria-invalid={!!errors.amount}
          aria-describedby={errors.amount ? "amount-error" : undefined}
        />
        {errors.amount && (
          <p id="amount-error" className="text-xs text-destructive" role="alert">
            {errors.amount}
          </p>
        )}
      </div>

      {/* Type field */}
      <div className="space-y-2">
        <label htmlFor="type" className="text-sm font-medium text-foreground">
          Type
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as 'income' | 'expense')}
          className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      {/* Recurring toggle */}
      <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-md">
        <input
          id="recurring"
          type="checkbox"
          checked={isRecurring}
          onChange={(e) => setIsRecurring(e.target.checked)}
          className="w-4 h-4 text-primary bg-input border-border rounded focus:ring-2 focus:ring-ring"
        />
        <label htmlFor="recurring" className="text-sm font-medium text-foreground cursor-pointer">
          Recurring entry
        </label>
      </div>

      {/* Conditional date fields */}
      {!isRecurring ? (
        // One-time entry: single date field
        <div className="space-y-2">
          <label htmlFor="date" className="text-sm font-medium text-foreground">
            Date
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
            aria-invalid={!!errors.date}
            aria-describedby={errors.date ? "date-error" : undefined}
          />
          {errors.date && (
            <p id="date-error" className="text-xs text-destructive" role="alert">
              {errors.date}
            </p>
          )}
        </div>
      ) : (
        // Recurring entry: rule + start date
        <>
          <div className="space-y-2">
            <label htmlFor="recurringRule" className="text-sm font-medium text-foreground">
              Frequency
            </label>
            <select
              id="recurringRule"
              value={recurringRule}
              onChange={(e) => setRecurringRule(e.target.value as 'weekly' | 'biweekly' | 'monthly')}
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
            >
              <option value="weekly">Weekly (every 7 days)</option>
              <option value="biweekly">Bi-weekly (every 14 days)</option>
              <option value="monthly">Monthly (same day each month)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="recurringStartDate" className="text-sm font-medium text-foreground">
              Start date
            </label>
            <input
              id="recurringStartDate"
              type="date"
              value={recurringStartDate}
              onChange={(e) => setRecurringStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
              aria-invalid={!!errors.recurringStartDate}
              aria-describedby={errors.recurringStartDate ? "recurring-start-date-error" : undefined}
            />
            {errors.recurringStartDate && (
              <p id="recurring-start-date-error" className="text-xs text-destructive" role="alert">
                {errors.recurringStartDate}
              </p>
            )}
          </div>
        </>
      )}

      {/* Note field */}
      <div className="space-y-2">
        <label htmlFor="note" className="text-sm font-medium text-foreground">
          Note (optional)
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none resize-none"
          placeholder="Add a note..."
        />
      </div>

      {/* Form actions */}
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors"
        >
          Save Entry
        </button>
      </div>
    </form>
  );
}
