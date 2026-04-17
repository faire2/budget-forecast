import { addDays, eachDayOfInterval, parseISO, isSameDay, addWeeks, addMonths, format } from 'date-fns';
import type { Entry, RecurringOverride } from '../db/schema.js';
import type { ForecastInput, DailyProjection, ProjectedEntry } from '../types/forecast.js';

/**
 * Checks if a given date matches a recurring entry's schedule
 */
function isRecurringOccurrence(
  checkDate: Date,
  recurringStartDate: string,
  recurringRule: 'weekly' | 'biweekly' | 'monthly'
): boolean {
  const startDate = parseISO(recurringStartDate);

  if (checkDate < startDate) {
    return false;
  }

  if (recurringRule === 'weekly') {
    const daysDiff = Math.floor((checkDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff % 7 === 0;
  }

  if (recurringRule === 'biweekly') {
    const daysDiff = Math.floor((checkDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff % 14 === 0;
  }

  if (recurringRule === 'monthly') {
    let current = startDate;
    while (current <= checkDate) {
      if (isSameDay(current, checkDate)) {
        return true;
      }
      current = addMonths(current, 1);
    }
    return false;
  }

  return false;
}

/**
 * Generates daily forecast projections based on balance anchor, entries, and overrides
 */
export function calculateForecast(input: ForecastInput): DailyProjection[] {
  const { startDate, endDate, balanceAnchor, entries, overrides } = input;

  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const days = eachDayOfInterval({ start, end });

  // Create override lookup map for fast access
  const overrideMap = new Map<string, RecurringOverride>();
  overrides.forEach((override: RecurringOverride) => {
    const key = `${override.entryId}-${override.occurrenceDate}`;
    overrideMap.set(key, override);
  });

  let runningBalance = parseFloat(balanceAnchor.balance);
  const projections: DailyProjection[] = [];

  for (const day of days) {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayEntries: ProjectedEntry[] = [];

    // Collect entries for this day
    for (const entry of entries) {
      let shouldInclude = false;
      let isRecurring = false;
      let effectiveAmount = parseFloat(entry.amount);
      let effectiveNote = entry.note;
      let isSkipped = false;

      // Check one-time entries
      if (entry.date && isSameDay(parseISO(entry.date), day)) {
        shouldInclude = true;
        isRecurring = false;
      }

      // Check recurring entries
      if (entry.recurringRule && entry.recurringStartDate) {
        if (isRecurringOccurrence(day, entry.recurringStartDate, entry.recurringRule)) {
          shouldInclude = true;
          isRecurring = true;

          // Apply overrides
          const overrideKey = `${entry.id}-${dayStr}`;
          const override = overrideMap.get(overrideKey);

          if (override) {
            if (override.action === 'skip') {
              isSkipped = true;
            } else if (override.action === 'edit') {
              if (override.overrideAmount !== null && override.overrideAmount !== undefined) {
                effectiveAmount = parseFloat(override.overrideAmount);
              }
              if (override.overrideNote !== null && override.overrideNote !== undefined) {
                effectiveNote = override.overrideNote;
              }
            }
          }
        }
      }

      if (shouldInclude) {
        dayEntries.push({
          id: entry.id,
          amount: effectiveAmount.toFixed(2),
          type: entry.type,
          note: effectiveNote,
          isRecurring,
          isSkipped,
          ...(entry.recurringRule && { recurringRule: entry.recurringRule }),
          ...(entry.recurringStartDate && { recurringStartDate: entry.recurringStartDate }),
        });
      }
    }

    // Sort entries by amount descending
    dayEntries.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));

    // Calculate daily totals
    let income = 0;
    let expenses = 0;

    for (const entry of dayEntries) {
      // Skip entries don't affect balance
      if (entry.isSkipped) {
        continue;
      }

      const amount = parseFloat(entry.amount);
      if (entry.type === 'income') {
        income += amount;
      } else if (entry.type === 'expense') {
        expenses += amount;
      }
    }

    // Update running balance
    runningBalance = runningBalance + income - expenses;

    projections.push({
      date: dayStr,
      income,
      expenses,
      balance: runningBalance,
      entries: dayEntries,
    });
  }

  return projections;
}
