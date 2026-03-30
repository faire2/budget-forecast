import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type CalendarProps = {
  selectedDate: string | null; // ISO date string (YYYY-MM-DD)
  datesWithEntries: string[]; // Array of ISO date strings that have entries
  onDateSelect: (date: string) => void;
  currentMonth: Date;
  onMonthChange: (newMonth: Date) => void;
};

export function Calendar({
  selectedDate,
  datesWithEntries,
  onDateSelect,
  currentMonth,
  onMonthChange,
}: CalendarProps) {
  // Generate calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = 'd';
  const rows: Date[][] = [];
  let days: Date[] = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      days.push(day);
      day = addDays(day, 1);
    }
    rows.push(days);
    days = [];
  }

  const handlePrevMonth = () => {
    onMonthChange(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(addMonths(currentMonth, 1));
  };

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    onDateSelect(dateStr);
  };

  const hasEntries = (date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return datesWithEntries.includes(dateStr);
  };

  const isSelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    const dateStr = format(date, 'yyyy-MM-dd');
    return dateStr === selectedDate;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      {/* Header with month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <h3 className="text-base font-semibold text-foreground">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>

        <button
          onClick={handleNextMonth}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Day names header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName) => (
          <div
            key={dayName}
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="space-y-1">
        {rows.map((week, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-7 gap-1">
            {week.map((date, dateIdx) => {
              const isCurrentMonth = isSameMonth(date, currentMonth);
              const isCurrentDay = isToday(date);
              const isDateSelected = isSelected(date);
              const dateHasEntries = hasEntries(date);

              return (
                <button
                  key={dateIdx}
                  onClick={() => handleDateClick(date)}
                  disabled={!isCurrentMonth}
                  className={`
                    relative h-10 text-sm rounded transition-colors
                    ${
                      !isCurrentMonth
                        ? 'text-muted-foreground/40 cursor-not-allowed'
                        : isDateSelected
                        ? 'bg-primary text-primary-foreground font-semibold'
                        : isCurrentDay
                        ? 'bg-accent text-accent-foreground font-medium'
                        : 'text-foreground hover:bg-muted'
                    }
                  `}
                  aria-label={format(date, 'MMMM d, yyyy')}
                  aria-current={isCurrentDay ? 'date' : undefined}
                  aria-selected={isDateSelected}
                >
                  {format(date, dateFormat)}

                  {/* Indicator dot for dates with entries */}
                  {dateHasEntries && isCurrentMonth && (
                    <span
                      className={`
                        absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full
                        ${
                          isDateSelected
                            ? 'bg-primary-foreground'
                            : isCurrentDay
                            ? 'bg-accent-foreground'
                            : 'bg-primary'
                        }
                      `}
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
