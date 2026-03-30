import { format, isToday } from 'date-fns';
import { TrendingUp, TrendingDown, Plus } from 'lucide-react';
import type { DailyProjection, ProjectedEntry } from '../types/forecast';

type DayRowProps = {
  day: DailyProjection;
  onEntryClick: (entryId: number, date: string) => void;
  onAddEntry: (date: string) => void;
};

export function DayRow({ day, onEntryClick, onAddEntry }: DayRowProps) {
  const dayIsToday = isToday(new Date(day.date));

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatAmount = (amountString: string) => {
    const cents = parseFloat(amountString);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
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
          />
        ))}

        {/* Add Entry Line */}
        <button
          onClick={() => onAddEntry(day.date)}
          className="w-full px-4 py-2 flex items-center gap-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add entry...</span>
        </button>

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
  formatAmount: (amount: string) => string;
};

function EntryLine({ entry, onClick, formatAmount }: EntryLineProps) {
  const isIncome = entry.type === 'income';
  const Icon = isIncome ? TrendingUp : TrendingDown;

  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-2 flex items-center gap-3 hover:bg-muted transition-colors text-left ${
        entry.isSkipped ? 'opacity-50' : ''
      }`}
      disabled={entry.isSkipped}
    >
      {/* Icon */}
      <Icon
        className={`w-4 h-4 flex-shrink-0 ${
          isIncome ? 'text-accent' : 'text-muted-foreground'
        }`}
      />

      {/* Note/Label */}
      <span
        className={`flex-1 text-sm min-w-0 ${
          entry.isSkipped
            ? 'line-through text-muted-foreground'
            : 'text-foreground'
        }`}
      >
        {entry.note || (isIncome ? 'Income' : 'Expense')}
      </span>

      {/* Amount */}
      <span
        className={`text-sm font-medium flex-shrink-0 ${
          entry.isSkipped
            ? 'line-through text-muted-foreground'
            : isIncome
            ? 'text-accent'
            : 'text-foreground'
        }`}
      >
        {isIncome ? '+' : '-'}
        {formatAmount(entry.amount)}
      </span>
    </button>
  );
}
