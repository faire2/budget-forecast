import { format, isToday } from 'date-fns';
import { TrendingUp, TrendingDown, Plus, Trash2 } from 'lucide-react';
import type { DailyProjection, ProjectedEntry } from '@shared/types/forecast-output';

type DayRowProps = {
  day: DailyProjection;
  onEntryClick: (entryId: number, date: string) => void;
  onAddEntry: (date: string, type: 'income' | 'expense') => void;
  onDeleteEntry?: (entryId: number, date: string, isRecurring: boolean) => void;
};

export function DayRow({ day, onEntryClick, onAddEntry, onDeleteEntry }: DayRowProps) {
  const dayIsToday = isToday(new Date(day.date));

  const formatCurrency = (decimalAmount: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
    }).format(decimalAmount);
  };

  const formatAmount = (amountString: string) => {
    const decimalAmount = parseFloat(amountString);
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
    }).format(decimalAmount);
  };

  return (
    <div
      id={`day-${day.date}`}
      className={`border border-border rounded-lg overflow-hidden ${
        dayIsToday ? 'bg-accent/10 border-l-4 border-l-accent' : 'bg-card'
      }`}
    >
      {/* Date Header */}
      <div className="px-4 py-3 border-b border-border">
        <time
          dateTime={day.date}
          className="text-base font-semibold text-foreground"
        >
          {format(new Date(day.date), 'EEE, MMM d')}
        </time>
        {dayIsToday && (
          <span className="ml-2 text-xs font-medium text-accent-foreground bg-accent px-2 py-1 rounded">
            Today
          </span>
        )}
      </div>

      {/* Entry Lines */}
      <div className="divide-y divide-border/50">
        {day.entries.map((entry) => (
          <EntryLine
            key={entry.id}
            entry={entry}
            date={day.date}
            onClick={() => onEntryClick(entry.id, day.date)}
            formatAmount={formatAmount}
            {...(onDeleteEntry && { onDelete: () => onDeleteEntry(entry.id, day.date, entry.isRecurring) })}
          />
        ))}

        {/* Add Entry Lines */}
        <div className="flex gap-2 px-2 py-2">
          <button
            onClick={() => onAddEntry(day.date, 'income')}
            className="flex-1 px-3 py-2 flex items-center justify-center gap-2 text-sm text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950 border border-green-200 dark:border-green-800 rounded transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add income</span>
          </button>
          <button
            onClick={() => onAddEntry(day.date, 'expense')}
            className="flex-1 px-3 py-2 flex items-center justify-center gap-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950 border border-red-200 dark:border-red-800 rounded transition-colors"
          >
            <span className="text-base">−</span>
            <span>Add expense</span>
          </button>
        </div>

        {/* Balance Line */}
        <div className="px-4 py-2 flex items-center justify-between bg-muted/30">
          <span className="text-sm font-medium text-foreground">Balance</span>
          <span
            className={`text-sm font-bold ${
              day.balance < 0 ? 'text-destructive' : 'text-foreground'
            }`}
          >
            {formatCurrency(day.balance)}
          </span>
        </div>
      </div>
    </div>
  );
}

type EntryLineProps = {
  entry: ProjectedEntry;
  date: string;
  onClick: () => void;
  onDelete?: () => void;
  formatAmount: (amount: string) => string;
};

function EntryLine({ entry, onClick, onDelete, formatAmount }: EntryLineProps) {
  const isIncome = entry.type === 'income';
  const Icon = isIncome ? TrendingUp : TrendingDown;

  return (
    <div className="w-full px-4 py-2 flex items-center gap-3 group">
      {/* Icon */}
      <Icon
        className={`w-4 h-4 flex-shrink-0 ${
          isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        }`}
      />

      {/* Note/Label - Clickable */}
      <button
        onClick={onClick}
        className={`flex-1 text-left text-sm min-w-0 hover:underline ${
          entry.isSkipped
            ? 'line-through text-muted-foreground'
            : 'text-foreground'
        }`}
        disabled={entry.isSkipped}
      >
        {entry.note || (isIncome ? 'Income' : 'Expense')}
      </button>

      {/* Amount */}
      <span
        className={`text-sm font-medium flex-shrink-0 ${
          entry.isSkipped
            ? 'line-through text-muted-foreground'
            : isIncome
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400'
        }`}
      >
        {isIncome ? '+' : '-'}
        {formatAmount(entry.amount)}
      </span>

      {/* Delete button */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
          aria-label="Delete entry"
          disabled={entry.isSkipped}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
