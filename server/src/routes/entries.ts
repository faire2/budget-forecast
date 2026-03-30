import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/client.js';
import { entries } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

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

// Update schema (same validation as create)
const updateEntrySchema = createEntrySchema;

// GET /api/entries - List all entries
router.get('/', async (req, res) => {
  try {
    const allEntries = await db.select().from(entries);
    res.json(allEntries);
  } catch (error) {
    console.error('Error fetching entries:', error);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

// POST /api/entries - Create new entry
router.post('/', async (req, res) => {
  try {
    // Validate request body
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

    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creating entry:', error);
    res.status(500).json({ error: 'Failed to create entry' });
  }
});

// PUT /api/entries/:id - Update existing entry
router.put('/:id', async (req, res) => {
  try {
    const entryId = parseInt(req.params.id, 10);

    if (isNaN(entryId)) {
      return res.status(400).json({ error: 'Invalid entry ID' });
    }

    // Validate request body
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

    res.json(result[0]);
  } catch (error) {
    console.error('Error updating entry:', error);
    res.status(500).json({ error: 'Failed to update entry' });
  }
});

// DELETE /api/entries/:id - Delete entry
router.delete('/:id', async (req, res) => {
  try {
    const entryId = parseInt(req.params.id, 10);

    if (isNaN(entryId)) {
      return res.status(400).json({ error: 'Invalid entry ID' });
    }

    // Check if entry exists
    const existing = await db.select().from(entries).where(eq(entries.id, entryId)).limit(1);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    await db.delete(entries).where(eq(entries.id, entryId));

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting entry:', error);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

export default router;
