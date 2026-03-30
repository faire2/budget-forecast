import { DayRow } from './DayRow';
import type { DailyProjection } from '../types/forecast';

type DayListCompactProps = {
  days: DailyProjection[];
  onEntryClick: (entryId: number, date: string) => void;
  onAddEntry: (date: string) => void;
};

export function DayListCompact({
  days,
  onEntryClick,
  onAddEntry,
}: DayListCompactProps) {
  return (
    <div className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
      {days.map((day) => (
        <DayRow
          key={day.date}
          day={day}
          onEntryClick={onEntryClick}
          onAddEntry={onAddEntry}
        />
      ))}
    </div>
  );
}
