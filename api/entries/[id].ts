import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { db } from '../../shared/db/client';
import { entries } from '../../shared/db/schema';
import { eq } from 'drizzle-orm';

// Base validation schema with common fields
const baseEntrySchema = z.object({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Amount must be a valid decimal'),
  type: z.enum(['income', 'expense']),
  note: z.string().optional().nullable(),
});

// One-time entry validation schema
const oneTimeEntrySchema = baseEntrySchema.extend({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  recurringRule: z.undefined().or(z.null()),
  recurringStartDate: z.undefined().or(z.null()),
});

// Recurring entry validation schema
const recurringEntrySchema = baseEntrySchema.extend({
  recurringRule: z.enum(['weekly', 'biweekly', 'monthly']),
  recurringStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Recurring start date must be in YYYY-MM-DD format'),
  date: z.undefined().or(z.null()),
});

// Combined schema that validates either one-time or recurring
const updateEntrySchema = z.discriminatedUnion('entryType', [
  z.object({
    entryType: z.literal('onetime'),
    ...oneTimeEntrySchema.shape,
  }),
  z.object({
    entryType: z.literal('recurring'),
    ...recurringEntrySchema.shape,
  }),
]).or(
  // Also accept entries without explicit entryType field
  oneTimeEntrySchema.refine(
    (data) => data.date !== undefined && data.date !== null,
    { message: 'One-time entry must have a date' }
  ).refine(
    (data) => data.recurringRule === undefined || data.recurringRule === null,
    { message: 'One-time entry must not have recurringRule' }
  ).refine(
    (data) => data.recurringStartDate === undefined || data.recurringStartDate === null,
    { message: 'One-time entry must not have recurringStartDate' }
  )
).or(
  recurringEntrySchema.refine(
    (data) => data.recurringRule !== undefined && data.recurringRule !== null,
    { message: 'Recurring entry must have recurringRule' }
  ).refine(
    (data) => data.recurringStartDate !== undefined && data.recurringStartDate !== null,
    { message: 'Recurring entry must have recurringStartDate' }
  ).refine(
    (data) => data.date === undefined || data.date === null,
    { message: 'Recurring entry must not have date' }
  )
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Extract entry ID from query
  const entryId = parseInt(req.query.id as string, 10);

  if (isNaN(entryId)) {
    return res.status(400).json({ error: 'Invalid entry ID' });
  }

  try {
    if (req.method === 'PUT') {
      // PUT /api/entries/:id - Update existing entry
      const validation = updateEntrySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validation.error.issues
        });
      }

      const data = validation.data;

      // Check if entry exists
      const existing = await db.select().from(entries).where(eq(entries.id, entryId)).limit(1);
      if (existing.length === 0) {
        return res.status(404).json({ error: 'Entry not found' });
      }

      // Prepare update data
      const updateData = {
        amount: data.amount,
        type: data.type,
        note: data.note || null,
        date: 'date' in data ? data.date : null,
        recurringRule: 'recurringRule' in data ? data.recurringRule : null,
        recurringStartDate: 'recurringStartDate' in data ? data.recurringStartDate : null,
        updatedAt: new Date(),
      };

      const result = await db.update(entries)
        .set(updateData)
        .where(eq(entries.id, entryId))
        .returning();

      return res.json(result[0]);
    }

    if (req.method === 'DELETE') {
      // DELETE /api/entries/:id - Delete entry
      const existing = await db.select().from(entries).where(eq(entries.id, entryId)).limit(1);
      if (existing.length === 0) {
        return res.status(404).json({ error: 'Entry not found' });
      }

      await db.delete(entries).where(eq(entries.id, entryId));

      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in entry API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
