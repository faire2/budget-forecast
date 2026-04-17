import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

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

type EntryDialogProps = {
  isOpen: boolean;
  mode: 'create' | 'edit';
  onClose: () => void;
  onSubmit: (data: EntryFormData) => void;
  onDelete?: () => void;
  defaultDate?: string; // Date to prefill in create mode
  // For edit mode:
  initialData?: {
    entryId: number;
    amount: string; // decimal Kč (e.g. "123.00")
    type: 'income' | 'expense';
    note: string | null;
    date: string;
    isRecurring: boolean;
    recurringRule?: 'weekly' | 'biweekly' | 'monthly';
    recurringStartDate?: string;
  };
};

export function EntryDialog({
  isOpen,
  mode,
  onClose,
  onSubmit,
  onDelete,
  defaultDate,
  initialData,
}: EntryDialogProps) {
  const [amountDollars, setAmountDollars] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [note, setNote] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [date, setDate] = useState('');
  const [recurringRule, setRecurringRule] = useState<'weekly' | 'biweekly' | 'monthly'>('weekly');
  const [recurringStartDate, setRecurringStartDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when dialog opens or mode changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        // Pre-fill with existing data
        const amountInDollars = parseFloat(initialData.amount).toFixed(2);
        setAmountDollars(amountInDollars);
        setType(initialData.type);
        setNote(initialData.note || '');
        setIsRecurring(initialData.isRecurring);
        setDate(initialData.date);
        setRecurringRule(initialData.recurringRule || 'weekly');
        setRecurringStartDate(initialData.recurringStartDate || initialData.date);
      } else {
        // Reset for create mode - type comes from initialData
        setAmountDollars('');
        setType(initialData?.type || 'income');
        setNote('');
        setIsRecurring(false);
        setDate(defaultDate || '');
        setRecurringRule('weekly');
        setRecurringStartDate(defaultDate || '');
      }
      setErrors({});
    }
  }, [isOpen, mode, initialData, defaultDate]);

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

    // Convert dollars to cents
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
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('Are you sure you want to delete this entry?')) {
      onDelete();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {mode === 'create'
              ? (type === 'income' ? 'Add Income' : 'Add Expense')
              : 'Edit Entry'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Note field - FIRST */}
          <div className="space-y-2">
            <label htmlFor="note" className="text-sm font-medium text-foreground">
              Note
            </label>
            <input
              id="note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
              placeholder="Describe this entry..."
              autoFocus
            />
          </div>

          {/* Amount field - SECOND */}
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
              aria-invalid={!!errors.amount}
              aria-describedby={errors.amount ? 'amount-error' : undefined}
            />
            {errors.amount && (
              <p id="amount-error" className="text-xs text-destructive" role="alert">
                {errors.amount}
              </p>
            )}
          </div>

          {/* Recurring toggle - Only show in create mode */}
          {mode === 'create' && (
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
          )}

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
                aria-describedby={errors.date ? 'date-error' : undefined}
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
                  aria-describedby={errors.recurringStartDate ? 'recurring-start-date-error' : undefined}
                />
                {errors.recurringStartDate && (
                  <p id="recurring-start-date-error" className="text-xs text-destructive" role="alert">
                    {errors.recurringStartDate}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Form actions */}
          <div className="flex gap-2 justify-between">
            <div>
              {mode === 'edit' && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-destructive-foreground bg-destructive hover:bg-destructive/90 rounded-md transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors"
              >
                {mode === 'create' ? 'Create' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
