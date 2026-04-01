import type { DailyProjection } from '@/types/forecast';

// Get API base URL from environment variable (for local dev)
// In production (Vercel), this is empty and uses relative paths
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Fetches forecast projections for a date range
 * @param start - Start date in ISO format (YYYY-MM-DD)
 * @param end - End date in ISO format (YYYY-MM-DD)
 * @returns Promise resolving to array of daily projections
 * @throws Error if the request fails
 */
export async function fetchForecasts(
  start: string,
  end: string
): Promise<DailyProjection[]> {
  const url = `${API_BASE_URL}/api/forecasts?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;

  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(
      `Failed to fetch forecasts: ${response.status} ${response.statusText}. ${errorText}`
    );
  }

  const data: unknown = await response.json();

  // Runtime validation - ensure we got an array
  if (!Array.isArray(data)) {
    throw new Error('Invalid response: expected array of daily projections');
  }

  return data as DailyProjection[];
}
