import { TrendingUp, TrendingDown, Repeat, X, Edit3, Trash2 } from 'lucide-react';

export type ProjectedEntry = {
  id: number;
  amount: string;
  type: 'income' | 'expense';
  note: string | null;
  isRecurring: boolean;
  isSkipped: boolean;
};

type DayDetailProps = {
  entries: ProjectedEntry[];
  date: string; // ISO date string for the occurrence
  onSkip?: (entryId: number, date: string) => void;
  onEdit?: (entryId: number, date: string) => void;
  onDelete?: (entryId: number) => void;
};

const formatCurrency = (amountStr: string): string => {
  const cents = parseFloat(amountStr);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
};

export function DayDetail({ entries, date, onSkip, onEdit, onDelete }: DayDetailProps) {
  if (entries.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        No entries for this day
      </div>
    );
  }

  const handleSkip = (entryId: number) => {
    if (onSkip) {
      onSkip(entryId, date);
    }
  };

  const handleEdit = (entryId: number) => {
    if (onEdit) {
      onEdit(entryId, date);
    }
  };

  const handleDelete = (entryId: number) => {
    if (onDelete) {
      onDelete(entryId);
    }
  };

  return (
    <div className="p-4 space-y-2">
      {entries.map((entry) => {
        const isIncome = entry.type === 'income';
        const isSkipped = entry.isSkipped;

        return (
          <div
            key={entry.id}
            className={`
              p-3 rounded-md flex items-center gap-3
              ${
                isSkipped
                  ? 'bg-muted/50 text-muted-foreground line-through'
                  : 'bg-card border border-border'
              }
            `}
          >
            {/* Type icon */}
            <div
              className={`
                flex-shrink-0 p-2 rounded-full
                ${
                  isSkipped
                    ? 'bg-muted'
                    : isIncome
                    ? 'bg-accent/20'
                    : 'bg-muted'
                }
              `}
              aria-label={isIncome ? 'Income entry' : 'Expense entry'}
            >
              {isIncome ? (
                <TrendingUp
                  className={`h-4 w-4 ${
                    isSkipped ? 'text-muted-foreground' : 'text-accent-foreground'
                  }`}
                  aria-hidden="true"
                />
              ) : (
                <TrendingDown
                  className={`h-4 w-4 ${
                    isSkipped ? 'text-muted-foreground' : 'text-muted-foreground'
                  }`}
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Entry details */}
            <div className="flex-1 min-w-0">
              {entry.note && (
                <div
                  className={`text-sm font-medium ${
                    isSkipped ? 'text-muted-foreground' : 'text-foreground'
                  }`}
                >
                  {entry.note}
                </div>
              )}
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs uppercase tracking-wide ${
                    isSkipped
                      ? 'text-muted-foreground'
                      : isIncome
                      ? 'text-accent-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {entry.type}
                </span>
                {entry.isRecurring && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Repeat className="h-3 w-3" />
                    Recurring
                  </span>
                )}
              </div>
            </div>

            {/* Amount */}
            <div
              className={`
                flex-shrink-0 text-base font-semibold
                ${
                  isSkipped
                    ? 'text-muted-foreground'
                    : isIncome
                    ? 'text-accent-foreground'
                    : 'text-muted-foreground'
                }
              `}
            >
              {isIncome ? '+' : '-'}
              {formatCurrency(entry.amount)}
            </div>

            {/* Action buttons */}
            <div className="flex-shrink-0 flex gap-1">
              {entry.isRecurring && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(entry.id);
                    }}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                    title="Edit this occurrence"
                    aria-label="Edit this occurrence"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSkip(entry.id);
                    }}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                    title={isSkipped ? 'Unskip this occurrence' : 'Skip this occurrence'}
                    aria-label={isSkipped ? 'Unskip this occurrence' : 'Skip this occurrence'}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(entry.id);
                }}
                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                title="Delete entry"
                aria-label="Delete entry"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
