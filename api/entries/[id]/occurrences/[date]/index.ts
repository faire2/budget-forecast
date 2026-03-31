import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../../../../shared/db/client';
import { entries, recurringOverrides } from '../../../../../shared/db/schema';
import { eq, and } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'DELETE') {
      // DELETE /api/entries/:id/occurrences/:date - Remove override
      const entryId = parseInt(req.query.id as string, 10);
      const occurrenceDate = req.query.date as string;

      if (isNaN(entryId)) {
        return res.status(400).json({ error: 'Invalid entry ID' });
      }

      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(occurrenceDate)) {
        return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
      }

      // Check if entry exists and is recurring
      const entry = await db.select().from(entries).where(eq(entries.id, entryId)).limit(1);
      if (entry.length === 0) {
        return res.status(404).json({ error: 'Entry not found' });
      }

      const foundEntry = entry[0];
      if (!foundEntry || !foundEntry.recurringRule || !foundEntry.recurringStartDate) {
        return res.status(400).json({ error: 'Entry is not recurring' });
      }

      const result = await db.delete(recurringOverrides)
        .where(and(
          eq(recurringOverrides.entryId, entryId),
          eq(recurringOverrides.occurrenceDate, occurrenceDate)
        ))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ error: 'Override not found' });
      }

      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error deleting override:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
