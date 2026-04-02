import { useState, useEffect } from 'react';
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
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayDays, setDisplayDays] = useState(days);

  useEffect(() => {
    // Trigger animation when days change
    if (JSON.stringify(days) !== JSON.stringify(displayDays)) {
      setIsAnimating(true);

      // Fade out old content
      setTimeout(() => {
        setDisplayDays(days);
      }, 150);

      // Fade in new content
      setTimeout(() => {
        setIsAnimating(false);
      }, 200);
    }
  }, [days]);

  return (
    <div
      className={`space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2 transition-opacity duration-200 ${
        isAnimating ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {displayDays.map((day, index) => (
        <div
          key={day.date}
          className="animate-slide-in"
          style={{
            animationDelay: `${index * 30}ms`,
            animationFillMode: 'backwards'
          }}
        >
          <DayRow
            day={day}
            onEntryClick={onEntryClick}
            onAddEntry={onAddEntry}
          />
        </div>
      ))}
    </div>
  );
}
