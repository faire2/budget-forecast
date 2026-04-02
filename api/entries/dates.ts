import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { db } from '../../shared/db/client.js';
import { entries, recurringOverrides } from '../../shared/db/schema.js';
import { sql, and, gte, lte, eq } from 'drizzle-orm';
import { startOfMonth, endOfMonth, format, parseISO, addMonths, eachDayOfInterval, isSameDay } from 'date-fns';

// Validation schema
const querySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/), // YYYY-MM format
});

/**
 * GET /api/entries/dates?month=2026-04
 * Returns array of dates (YYYY-MM-DD) that have entries in the given month
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Validate query parameters
    const validation = querySchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: validation.error.errors
      });
    }

    const { month } = validation.data;

    // Parse month and get date range
    const monthDate = parseISO(`${month}-01`);
    const startDate = startOfMonth(monthDate);
    const endDate = endOfMonth(monthDate);
    const startDateStr = format(startDate, 'yyyy-MM-dd');
    const endDateStr = format(endDate, 'yyyy-MM-dd');

    // Fetch all entries (one-time and recurring) for this month
    const allEntries = await db.select().from(entries);

    // Fetch all overrides
    const allOverrides = await db.select().from(recurringOverrides);

    // Create override map
    const overrideMap = new Map<string, typeof allOverrides[0]>();
    allOverrides.forEach((override) => {
      const key = `${override.entryId}-${override.occurrenceDate}`;
      overrideMap.set(key, override);
    });

    // Calculate which dates have entries
    const datesWithEntries = new Set<string>();
    const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

    for (const day of daysInMonth) {
      const dayStr = format(day, 'yyyy-MM-dd');

      for (const entry of allEntries) {
        let hasEntryOnThisDay = false;

        // Check one-time entries
        if (entry.date && entry.date === dayStr) {
          hasEntryOnThisDay = true;
        }

        // Check recurring entries
        if (entry.recurringRule && entry.recurringStartDate) {
          const startDate = parseISO(entry.recurringStartDate);

          if (day >= startDate) {
            let isOccurrence = false;

            if (entry.recurringRule === 'weekly') {
              const daysDiff = Math.floor((day.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
              isOccurrence = daysDiff % 7 === 0;
            } else if (entry.recurringRule === 'biweekly') {
              const daysDiff = Math.floor((day.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
              isOccurrence = daysDiff % 14 === 0;
            } else if (entry.recurringRule === 'monthly') {
              let current = startDate;
              while (current <= day) {
                if (isSameDay(current, day)) {
                  isOccurrence = true;
                  break;
                }
                current = addMonths(current, 1);
              }
            }

            if (isOccurrence) {
              // Check if this occurrence is skipped
              const overrideKey = `${entry.id}-${dayStr}`;
              const override = overrideMap.get(overrideKey);

              if (!override || override.action !== 'skip') {
                hasEntryOnThisDay = true;
              }
            }
          }
        }

        if (hasEntryOnThisDay) {
          datesWithEntries.add(dayStr);
          break; // Move to next day
        }
      }
    }

    // Return array of dates
    return res.status(200).json(Array.from(datesWithEntries).sort());

  } catch (error) {
    console.error('Error fetching entry dates:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
