import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

type EditOccurrenceDialogProps = {
  isOpen: boolean;
  date: string;
  originalAmount: string; // in cents
  originalNote: string | null;
  onSubmit: (data: { overrideAmount?: string; overrideNote?: string | null }) => void;
  onClose: () => void;
};

const formatCurrency = (amountStr: string): string => {
  const cents = parseFloat(amountStr);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
};

export function EditOccurrenceDialog({
  isOpen,
  date,
  originalAmount,
  originalNote,
  onSubmit,
  onClose,
}: EditOccurrenceDialogProps) {
  const [amountDollars, setAmountDollars] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Convert cents to dollars for display
      const dollars = (parseFloat(originalAmount) / 100).toFixed(2);
      setAmountDollars(dollars);
      setNote(originalNote || '');
      setErrors({});
    }
  }, [isOpen, originalAmount, originalNote]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate amount if provided
    if (amountDollars) {
      const amount = parseFloat(amountDollars);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = 'Amount must be greater than 0';
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

    const originalDollars = (parseFloat(originalAmount) / 100).toFixed(2);
    const hasAmountChanged = amountDollars !== originalDollars;
    const hasNoteChanged = note !== (originalNote || '');

    // Only include fields that have changed
    const data: { overrideAmount?: string; overrideNote?: string | null } = {};

    if (hasAmountChanged && amountDollars) {
      // Convert dollars to decimal string for backend
      data.overrideAmount = parseFloat(amountDollars).toFixed(2);
    }

    if (hasNoteChanged) {
      data.overrideNote = note.trim() || null;
    }

    // Need at least one override
    if (!data.overrideAmount && !data.overrideNote) {
      setErrors({ form: 'No changes to save' });
      return;
    }

    onSubmit(data);
  };

  const handleCancel = () => {
    setErrors({});
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={handleCancel}
    >
      <div
        className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md m-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 id="dialog-title" className="text-lg font-semibold text-foreground">
            Edit Occurrence
          </h2>
          <button
            onClick={handleCancel}
            className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            Editing occurrence on {date}
          </div>

          {errors.form && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{errors.form}</p>
            </div>
          )}

          {/* Amount field */}
          <div className="space-y-2">
            <label htmlFor="edit-amount" className="text-sm font-medium text-foreground">
              Amount
            </label>
            <div className="text-xs text-muted-foreground mb-1">
              Original: {formatCurrency(originalAmount)}
            </div>
            <input
              id="edit-amount"
              type="number"
              step="0.01"
              min="0"
              value={amountDollars}
              onChange={(e) => setAmountDollars(e.target.value)}
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
              placeholder="0.00"
              aria-invalid={!!errors.amount}
              aria-describedby={errors.amount ? 'edit-amount-error' : undefined}
            />
            {errors.amount && (
              <p id="edit-amount-error" className="text-xs text-destructive" role="alert">
                {errors.amount}
              </p>
            )}
          </div>

          {/* Note field */}
          <div className="space-y-2">
            <label htmlFor="edit-note" className="text-sm font-medium text-foreground">
              Note
            </label>
            {originalNote && (
              <div className="text-xs text-muted-foreground mb-1">
                Original: {originalNote}
              </div>
            )}
            <textarea
              id="edit-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:ring-2 focus:ring-ring focus:outline-none resize-none"
              placeholder="Add a note..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
