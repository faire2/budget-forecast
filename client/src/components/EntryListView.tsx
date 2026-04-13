import { format } from 'date-fns';
import { EntryListRow } from './EntryListRow';
import type { DailyProjection } from '../types/forecast';

type EntryListViewProps = {
  selectedDate: string | null;
  forecasts: DailyProjection[] | undefined;
  onEntryClick: (entryId: number, date: string) => void;
  onDeleteEntry: (entryId: number, date: string, isRecurring: boolean) => void;
};

export function EntryListView({
  selectedDate,
  forecasts,
  onEntryClick,
  onDeleteEntry,
}: EntryListViewProps) {
  const today = format(new Date(), 'yyyy-MM-dd');

  // forecasts already covers exactly today → selectedDate, just filter for days with entries
  const filteredDays: DailyProjection[] = !selectedDate || !forecasts
    ? []
    : forecasts.filter(day => day.entries.length > 0);

  // Date range for header
  const startDate = selectedDate ? (selectedDate < today ? selectedDate : today) : '';
  const endDate = selectedDate ? (selectedDate < today ? today : selectedDate) : '';

  // Empty state
  if (!selectedDate) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        Select a date in the calendar to view entries
      </div>
    );
  }

  if (filteredDays.length === 0) {
    return (
      <div>
        {startDate && endDate && (
          <h3 className="text-sm font-semibold text-foreground mb-2">
            Entries: {format(new Date(startDate), 'MMM d')} - {format(new Date(endDate), 'MMM d')}
          </h3>
        )}
        <div className="text-sm text-muted-foreground text-center py-8">
          No entries in this date range
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-2">
        Entries: {format(new Date(startDate), 'MMM d')} - {format(new Date(endDate), 'MMM d')}
      </h3>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {filteredDays.map(day => (
          <EntryListRow
            key={day.date}
            day={day}
            onEntryClick={onEntryClick}
            onDeleteEntry={onDeleteEntry}
          />
        ))}
      </div>
    </div>
  );
}
