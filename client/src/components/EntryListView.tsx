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
  // Get today's date from forecasts (first day in forecast)
  const today = forecasts && forecasts.length > 0 ? forecasts[0]?.date : '';

  // Filter by date range - only show days with entries between today and selected date
  const getFilteredDays = (): DailyProjection[] => {
    if (!selectedDate || !forecasts || !today) return [];

    // Determine range: always between today and selected date
    const startDate = selectedDate < today ? selectedDate : today;
    const endDate = selectedDate < today ? today : selectedDate;

    // Show all days with entries in the range
    return forecasts
      .filter(day => day.date >= startDate && day.date <= endDate && day.entries.length > 0)
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const filteredDays = getFilteredDays();

  // Calculate date range for header
  const startDate = selectedDate && today ? (selectedDate < today ? selectedDate : today) : '';
  const endDate = selectedDate && today ? (selectedDate < today ? today : selectedDate) : '';

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
