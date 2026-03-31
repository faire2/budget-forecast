import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { db } from '../../../../../shared/db/client';
import { entries, recurringOverrides } from '../../../../../shared/db/schema';
import { eq, and } from 'drizzle-orm';

// Validation schema for skip override
const skipOverrideSchema = z.object({
  // No additional fields needed for skip
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      // POST /api/entries/:id/occurrences/:date/skip - Create skip override
      const entryId = parseInt(req.query.id as string, 10);
      const occurrenceDate = req.query.date as string;

      if (isNaN(entryId)) {
        return res.status(400).json({ error: 'Invalid entry ID' });
      }

      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(occurrenceDate)) {
        return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
      }

      // Validate request body
      const validation = skipOverrideSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validation.error.issues
        });
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

      // Create or update skip override
      const existing = await db.select()
        .from(recurringOverrides)
        .where(and(
          eq(recurringOverrides.entryId, entryId),
          eq(recurringOverrides.occurrenceDate, occurrenceDate)
        ))
        .limit(1);

      let result;
      if (existing.length === 0) {
        result = await db.insert(recurringOverrides).values({
          entryId,
          occurrenceDate,
          action: 'skip',
          overrideAmount: null,
          overrideNote: null,
          createdAt: new Date(),
        }).returning();
      } else {
        result = await db.update(recurringOverrides)
          .set({
            action: 'skip',
            overrideAmount: null,
            overrideNote: null,
          })
          .where(eq(recurringOverrides.id, existing[0]!.id))
          .returning();
      }

      return res.status(201).json(result[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error creating skip override:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
