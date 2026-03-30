import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/client.js';
import { balanceAnchor } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

// Validation schema for balance anchor
const balanceAnchorSchema = z.object({
  balance: z.string().regex(/^-?\d+(\.\d{1,2})?$/, 'Balance must be a valid decimal'),
  asOfDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

// GET /api/balance - Get the single balance anchor record
router.get('/', async (req, res) => {
  try {
    const result = await db.select().from(balanceAnchor).limit(1);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Balance anchor not found' });
    }

    res.status(200).json(result[0]);
  } catch (error) {
    console.error('Error fetching balance anchor:', error);
    res.status(500).json({ error: 'Failed to fetch balance anchor' });
  }
});

// PUT /api/balance - Update balance anchor
router.put('/', async (req, res) => {
  try {
    // Validate request body
    const validation = balanceAnchorSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.issues
      });
    }

    const { balance, asOfDate } = validation.data;

    // Check if balance anchor exists
    const existing = await db.select().from(balanceAnchor).limit(1);

    let result;
    if (existing.length === 0) {
      // Create new balance anchor
      result = await db.insert(balanceAnchor).values({
        balance,
        asOfDate,
        updatedAt: new Date(),
      }).returning();

      return res.status(201).json(result[0]);
    } else {
      // Update existing balance anchor
      result = await db.update(balanceAnchor)
        .set({
          balance,
          asOfDate,
          updatedAt: new Date(),
        })
        .where(eq(balanceAnchor.id, existing[0]!.id))
        .returning();

      return res.status(200).json(result[0]);
    }
  } catch (error) {
    console.error('Error updating balance anchor:', error);
    res.status(500).json({ error: 'Failed to update balance anchor' });
  }
});

export default router;
