import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/client.js';
import { entries, recurringOverrides } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

const router = Router();

// Validation schema for skip override
const skipOverrideSchema = z.object({
  // No additional fields needed for skip
});

// Validation schema for edit override
const editOverrideSchema = z.object({
  overrideAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Amount must be a valid decimal').optional().nullable(),
  overrideNote: z.string().optional().nullable(),
}).refine(
  (data) => data.overrideAmount !== undefined || data.overrideNote !== undefined,
  { message: 'Edit override must include at least overrideAmount or overrideNote' }
);

// POST /api/entries/:id/occurrences/:date/skip - Create skip override
router.post('/:id/occurrences/:date/skip', async (req, res) => {
  try {
    const entryId = parseInt(req.params.id, 10);
    const occurrenceDate = req.params.date;

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

    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creating skip override:', error);
    res.status(500).json({ error: 'Failed to create skip override' });
  }
});

// POST /api/entries/:id/occurrences/:date/edit - Create edit override
router.post('/:id/occurrences/:date/edit', async (req, res) => {
  try {
    const entryId = parseInt(req.params.id, 10);
    const occurrenceDate = req.params.date;

    if (isNaN(entryId)) {
      return res.status(400).json({ error: 'Invalid entry ID' });
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(occurrenceDate)) {
      return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
    }

    // Validate request body
    const validation = editOverrideSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.issues
      });
    }

    const { overrideAmount, overrideNote } = validation.data;

    // Check if entry exists and is recurring
    const entry = await db.select().from(entries).where(eq(entries.id, entryId)).limit(1);
    if (entry.length === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    const foundEntry = entry[0];
    if (!foundEntry || !foundEntry.recurringRule || !foundEntry.recurringStartDate) {
      return res.status(400).json({ error: 'Entry is not recurring' });
    }

    // Create or update edit override
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
        action: 'edit',
        overrideAmount: overrideAmount || null,
        overrideNote: overrideNote || null,
        createdAt: new Date(),
      }).returning();
    } else {
      result = await db.update(recurringOverrides)
        .set({
          action: 'edit',
          overrideAmount: overrideAmount || null,
          overrideNote: overrideNote || null,
        })
        .where(eq(recurringOverrides.id, existing[0]!.id))
        .returning();
    }

    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creating edit override:', error);
    res.status(500).json({ error: 'Failed to create edit override' });
  }
});

// DELETE /api/entries/:id/occurrences/:date - Remove override
router.delete('/:id/occurrences/:date', async (req, res) => {
  try {
    const entryId = parseInt(req.params.id, 10);
    const occurrenceDate = req.params.date;

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

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting override:', error);
    res.status(500).json({ error: 'Failed to delete override' });
  }
});

export default router;
