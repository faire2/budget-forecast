import { format } from 'date-fns';
import { X } from 'lucide-react';

type DeleteRecurringDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onDeleteThis: () => void;         // Skip this occurrence
  onDeleteFromNow: () => void;      // Delete from this date forward
  onDeleteAll: () => void;          // Delete entire recurring entry
  entryNote: string;
  date: string;
};

export function DeleteRecurringDialog({
  isOpen,
  onClose,
  onDeleteThis,
  onDeleteFromNow,
  onDeleteAll,
  entryNote,
  date,
}: DeleteRecurringDialogProps) {
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
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Delete Recurring Entry
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          <p className="text-sm text-foreground">
            "{entryNote}" on {format(new Date(date), 'MMM d, yyyy')}
          </p>
          <p className="text-sm text-muted-foreground">
            Choose how to delete this recurring entry:
          </p>
        </div>

        {/* Footer - Three Buttons */}
        <div className="flex flex-col gap-2 p-4 border-t border-border">
          <button
            type="button"
            onClick={() => {
              onDeleteThis();
              onClose();
            }}
            className="w-full px-4 py-3 text-sm font-medium text-left border border-border rounded-md hover:bg-muted transition-colors"
          >
            <div className="font-medium">This instance</div>
            <div className="text-xs text-muted-foreground mt-1">
              Skip only this occurrence on {format(new Date(date), 'MMM d')}
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              onDeleteFromNow();
              onClose();
            }}
            className="w-full px-4 py-3 text-sm font-medium text-left border border-border rounded-md hover:bg-muted transition-colors"
          >
            <div className="font-medium">All from now</div>
            <div className="text-xs text-muted-foreground mt-1">
              Delete this occurrence and all future ones
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              onDeleteAll();
              onClose();
            }}
            className="w-full px-4 py-3 text-sm font-medium text-left border border-destructive bg-destructive/10 rounded-md hover:bg-destructive/20 transition-colors text-destructive"
          >
            <div className="font-medium">Completely all</div>
            <div className="text-xs mt-1 opacity-80">
              Permanently delete this entire recurring entry
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
