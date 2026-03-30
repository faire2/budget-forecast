import { format, isToday, parseISO } from 'date-fns';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { DayDetail } from './DayDetail';

export type DailyProjection = {
  date: string;
  income: number;
  expenses: number;
  balance: number;
  entries: ProjectedEntry[];
};

export type ProjectedEntry = {
  id: number;
  amount: string;
  type: 'income' | 'expense';
  note: string | null;
  isRecurring: boolean;
  isSkipped: boolean;
};

type DayListProps = {
  days: DailyProjection[];
  expandedDate: string | null;
  onDayClick: (date: string) => void;
  onSkipOccurrence?: (entryId: number, date: string) => void;
  onEditOccurrence?: (entryId: number, date: string) => void;
  onDeleteEntry?: (entryId: number) => void;
};

const formatCurrency = (cents: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
};

export function DayList({ days, expandedDate, onDayClick, onSkipOccurrence, onEditOccurrence, onDeleteEntry }: DayListProps) {
  return (
    <div className="space-y-1">
      {days.map((day) => {
        const isExpanded = expandedDate === day.date;
        const isCurrentDay = isToday(parseISO(day.date));
        const dateObj = parseISO(day.date);
        const formattedDate = format(dateObj, 'EEE, MMM d');

        return (
          <div key={day.date} id={`day-${day.date}`} className="border border-border rounded-lg overflow-hidden">
            {/* Day row - clickable header */}
            <button
              onClick={() => onDayClick(day.date)}
              aria-expanded={isExpanded}
              aria-controls={`day-detail-${day.date}`}
              className={`
                w-full p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 text-left
                transition-colors hover:bg-muted
                ${isCurrentDay ? 'bg-accent/10 border-l-4 border-l-accent' : ''}
              `}
            >
              {/* Date and expand icon row (mobile) / left section (desktop) */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Expand/collapse icon */}
                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                {/* Date */}
                <time
                  dateTime={day.date}
                  className={`
                    flex-shrink-0 sm:w-28
                    ${isCurrentDay ? 'text-foreground font-semibold' : 'text-muted-foreground'}
                  `}
                >
                  {formattedDate}
                </time>
              </div>

              {/* Financial data - horizontal on mobile, spread on desktop */}
              <div className="flex gap-4 w-full sm:flex-1">
                {/* Income */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Income
                  </div>
                  <div className="text-accent-foreground font-medium text-sm sm:text-base">
                    {formatCurrency(day.income)}
                  </div>
                </div>

                {/* Expenses */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Expenses
                  </div>
                  <div className="text-muted-foreground font-medium text-sm sm:text-base">
                    {formatCurrency(day.expenses)}
                  </div>
                </div>

                {/* Balance */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Balance
                  </div>
                  <div
                    className={`font-semibold text-sm sm:text-base ${
                      day.balance >= 0 ? 'text-foreground' : 'text-destructive'
                    }`}
                  >
                    {formatCurrency(day.balance)}
                  </div>
                </div>
              </div>
            </button>

            {/* Expanded detail section */}
            {isExpanded && (
              <div
                id={`day-detail-${day.date}`}
                role="region"
                aria-label={`Details for ${formattedDate}`}
                className="border-t border-border bg-muted/30"
              >
                <DayDetail
                  entries={day.entries}
                  date={day.date}
                  {...(onSkipOccurrence && { onSkip: onSkipOccurrence })}
                  {...(onEditOccurrence && { onEdit: onEditOccurrence })}
                  {...(onDeleteEntry && { onDelete: onDeleteEntry })}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
