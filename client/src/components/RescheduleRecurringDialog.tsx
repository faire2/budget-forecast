import { format } from 'date-fns';
import { X } from 'lucide-react';

type RescheduleRecurringDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onRescheduleThis: () => void;
  onRescheduleAll: () => void;
  entryNote: string;
  fromDate: string;
  toDate: string;
};

export function RescheduleRecurringDialog({
  isOpen,
  onClose,
  onRescheduleThis,
  onRescheduleAll,
  entryNote,
  fromDate,
  toDate,
}: RescheduleRecurringDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Reschedule Recurring Entry
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-sm text-foreground">
            "{entryNote}" — moving from {format(new Date(fromDate + 'T00:00:00'), 'MMM d')} to{' '}
            {format(new Date(toDate + 'T00:00:00'), 'MMM d, yyyy')}
          </p>
          <p className="text-sm text-muted-foreground">
            Reschedule which occurrences?
          </p>
        </div>

        <div className="flex flex-col gap-2 p-4 border-t border-border">
          <button
            type="button"
            onClick={() => {
              onRescheduleThis();
              onClose();
            }}
            className="w-full px-4 py-3 text-sm font-medium text-left border border-border rounded-md hover:bg-muted transition-colors"
          >
            <div className="font-medium">This occurrence only</div>
            <div className="text-xs text-muted-foreground mt-1">
              Move only {format(new Date(fromDate + 'T00:00:00'), 'MMM d')} to{' '}
              {format(new Date(toDate + 'T00:00:00'), 'MMM d')}
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              onRescheduleAll();
              onClose();
            }}
            className="w-full px-4 py-3 text-sm font-medium text-left border border-border rounded-md hover:bg-muted transition-colors"
          >
            <div className="font-medium">All future occurrences</div>
            <div className="text-xs text-muted-foreground mt-1">
              Change the schedule — next occurrence starts{' '}
              {format(new Date(toDate + 'T00:00:00'), 'MMM d, yyyy')}
            </div>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-md transition-colors mt-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
