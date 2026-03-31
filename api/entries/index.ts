import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { db } from '../../shared/db/client';
import { entries } from '../../shared/db/schema';

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
const createEntrySchema = z.discriminatedUnion('entryType', [
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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // GET /api/entries - List all entries
      const allEntries = await db.select().from(entries);
      return res.json(allEntries);
    }

    if (req.method === 'POST') {
      // POST /api/entries - Create new entry
      const validation = createEntrySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validation.error.issues
        });
      }

      const data = validation.data;

      // Prepare insert data
      const insertData = {
        amount: data.amount,
        type: data.type,
        note: data.note || null,
        date: 'date' in data ? data.date : null,
        recurringRule: 'recurringRule' in data ? data.recurringRule : null,
        recurringStartDate: 'recurringStartDate' in data ? data.recurringStartDate : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.insert(entries).values(insertData).returning();

      return res.status(201).json(result[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in entries API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
