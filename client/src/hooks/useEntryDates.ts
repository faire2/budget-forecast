import { useQuery } from '@tanstack/react-query';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Fetches all dates that have entries for a given month
 * @param month - Month in YYYY-MM format
 * @returns Array of date strings (YYYY-MM-DD)
 */
async function fetchEntryDates(month: string): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/api/entries/dates?month=${month}`);

  if (!response.ok) {
    throw new Error('Failed to fetch entry dates');
  }

  return response.json();
}

/**
 * Hook to get all dates with entries for a given month
 * Used for calendar dots display
 */
export function useEntryDates(month: string) {
  return useQuery({
    queryKey: ['entry-dates', month],
    queryFn: () => fetchEntryDates(month),
    staleTime: 60_000, // 1 minute
    enabled: !!month, // Only run if month is provided
  });
}
