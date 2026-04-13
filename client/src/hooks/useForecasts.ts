import { useQuery } from '@tanstack/react-query';
import type { DailyProjection } from '@/types/forecast';
import { fetchForecasts } from '@/lib/api';

/**
 * TanStack Query hook for fetching forecast projections
 * @param startDate - Start date in ISO format (YYYY-MM-DD)
 * @param endDate - End date in ISO format (YYYY-MM-DD)
 * @returns Query result with forecast data, loading state, and error
 */
export function useForecasts(startDate: string, endDate: string, options?: { enabled?: boolean }) {
  return useQuery<DailyProjection[], Error>({
    queryKey: ['forecasts', startDate, endDate],
    queryFn: () => fetchForecasts(startDate, endDate),
    staleTime: 30_000, // 30 seconds per AGENTS.md
    enabled: options?.enabled ?? true,
  });
}
