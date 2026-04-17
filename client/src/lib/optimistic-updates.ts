import type { QueryClient } from '@tanstack/react-query';
import type { DailyProjection, ProjectedEntry } from '@shared/types/forecast-output';
import type { EntryFormData } from '../components/EntryDialog';

/**
 * Gets all active forecast query keys from the cache
 */
export function getAllForecastQueries(queryClient: QueryClient): Array<[string, string, string]> {
  const cache = queryClient.getQueryCache();
  const allQueries = cache.getAll();

  return allQueries
    .filter(query => {
      const key = query.queryKey;
      return Array.isArray(key) && key[0] === 'forecasts' && key.length === 3;
    })
    .map(query => query.queryKey as [string, string, string]);
}

/**
 * Recalculates daily balances starting from a given balance
 * @param days - Array of daily projections to update
 * @param startingBalance - Starting balance in decimal Kč
 * @param fromDate - Optional date to start recalculating from (YYYY-MM-DD)
 * @returns Updated array with recalculated balances
 */
export function recalculateBalances(
  days: DailyProjection[],
  startingBalance: number,
  fromDate?: string
): DailyProjection[] {
  // Create a deep copy to avoid mutating original
  const updated = days.map(day => ({
    ...day,
    entries: [...day.entries],
  }));

  let balance = startingBalance;

  for (const day of updated) {
    if (fromDate && day.date < fromDate) {
      // Use existing balance for days before fromDate
      balance = day.balance;
      continue;
    }

    // Recalculate balance for this day
    balance = balance + day.income - day.expenses;
    day.balance = balance;
  }

  return updated;
}

/**
 * Adds a new entry to the cache and recalculates balances
 */
export function addEntryToCache(
  days: DailyProjection[],
  entry: ProjectedEntry,
  date: string,
  startingBalance: number
): DailyProjection[] {
  const updated = days.map(day => ({
    ...day,
    entries: [...day.entries],
  }));

  // Find the day to add the entry to
  const dayIndex = updated.findIndex(d => d.date === date);
  if (dayIndex === -1) {
    // Date not in current forecast range, return unchanged
    return updated;
  }

  const day = updated[dayIndex]!;

  // Add entry to the day
  day.entries.push(entry);

  // Recalculate day totals
  const entryAmount = parseFloat(entry.amount);
  if (entry.type === 'income') {
    day.income += entryAmount;
  } else {
    day.expenses += entryAmount;
  }

  // Recalculate balances from this date forward
  return recalculateBalances(updated, startingBalance, date);
}

/**
 * Updates an existing entry in the cache and recalculates balances
 */
export function updateEntryInCache(
  days: DailyProjection[],
  entryId: number,
  updatedData: EntryFormData,
  startingBalance: number
): DailyProjection[] {
  const updated = days.map(day => ({
    ...day,
    entries: [...day.entries],
  }));

  // Find the entry across all days
  let foundDay: DailyProjection | undefined;
  let foundEntry: ProjectedEntry | undefined;

  for (const day of updated) {
    const entry = day.entries.find(e => e.id === entryId);
    if (entry) {
      foundDay = day;
      foundEntry = entry;
      break;
    }
  }

  if (!foundDay || !foundEntry) {
    // Entry not found in cache, return unchanged
    return updated;
  }

  // Remove old entry's contribution to totals
  const oldAmount = parseFloat(foundEntry.amount);
  if (foundEntry.type === 'income') {
    foundDay.income -= oldAmount;
  } else {
    foundDay.expenses -= oldAmount;
  }

  // Update entry data (convert cents → decimal Kč for cache storage)
  const newAmount = updatedData.amount / 100;
  foundEntry.amount = newAmount.toFixed(2);
  foundEntry.type = updatedData.type;
  foundEntry.note = updatedData.note || null;

  // Add new entry's contribution to totals
  if (updatedData.type === 'income') {
    foundDay.income += newAmount;
  } else {
    foundDay.expenses += newAmount;
  }

  // Recalculate balances from this date forward
  return recalculateBalances(updated, startingBalance, foundDay.date);
}

/**
 * Removes an entry from the cache and recalculates balances
 */
export function removeEntryFromCache(
  days: DailyProjection[],
  entryId: number,
  startingBalance: number
): DailyProjection[] {
  const updated = days.map(day => ({
    ...day,
    entries: [...day.entries],
  }));

  // Find and remove the entry
  let removedFromDate: string | undefined;

  for (const day of updated) {
    const entryIndex = day.entries.findIndex(e => e.id === entryId);
    if (entryIndex !== -1) {
      const entry = day.entries[entryIndex]!;
      const amount = parseFloat(entry.amount);

      // Remove from day totals
      if (entry.type === 'income') {
        day.income -= amount;
      } else {
        day.expenses -= amount;
      }

      // Remove entry
      day.entries.splice(entryIndex, 1);
      removedFromDate = day.date;
      break;
    }
  }

  if (!removedFromDate) {
    // Entry not found, return unchanged
    return updated;
  }

  // Recalculate balances from removal date forward
  return recalculateBalances(updated, startingBalance, removedFromDate);
}

/**
 * Updates a recurring entry override in the cache and recalculates balances
 */
export function updateEntryOverrideInCache(
  days: DailyProjection[],
  entryId: number,
  date: string,
  overrideAmount?: string,
  overrideNote?: string | null
): DailyProjection[] {
  const updated = days.map(day => ({
    ...day,
    entries: [...day.entries],
  }));

  // Find the specific entry on the specific date
  const day = updated.find(d => d.date === date);
  if (!day) {
    // Date not in cache range
    return updated;
  }

  const entry = day.entries.find(e => e.id === entryId);
  if (!entry) {
    // Entry not found on this date
    return updated;
  }

  // Store old amount for recalculation
  const oldAmount = parseFloat(entry.amount);

  // Apply overrides
  if (overrideAmount !== undefined) {
    const newAmount = parseFloat(overrideAmount);

    // Update day totals
    if (entry.type === 'income') {
      day.income = day.income - oldAmount + newAmount;
    } else {
      day.expenses = day.expenses - oldAmount + newAmount;
    }

    entry.amount = (newAmount * 100).toString(); // Convert to cents
  }

  if (overrideNote !== undefined) {
    entry.note = overrideNote;
  }

  // Recalculate balances from this date forward
  // We need to get the starting balance by working backwards
  const startingBalance = day.balance - (day.income - day.expenses);
  return recalculateBalances(updated, startingBalance, date);
}
