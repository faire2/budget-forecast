import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { db } from '../shared/db/client';
import { balanceAnchor } from '../shared/db/schema';
import { eq } from 'drizzle-orm';

// Validation schema for balance anchor
const balanceAnchorSchema = z.object({
  balance: z.string().regex(/^-?\d+(\.\d{1,2})?$/, 'Balance must be a valid decimal'),
  asOfDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // GET /api/balance - Get the single balance anchor record
      const result = await db.select().from(balanceAnchor).limit(1);

      if (result.length === 0) {
        return res.status(404).json({ error: 'Balance anchor not found' });
      }

      return res.status(200).json(result[0]);
    }

    if (req.method === 'PUT') {
      // PUT /api/balance - Update balance anchor
      const validation = balanceAnchorSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validation.error.issues,
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
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in balance API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
