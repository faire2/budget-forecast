import { Router } from 'express';
import { db } from '../db/client.js';
import { balanceAnchor, entries, recurringOverrides } from '../db/schema.js';
import { calculateForecast } from '../services/forecastCalculator.js';
import { format, addDays } from 'date-fns';

const router = Router();

// GET /api/forecasts?start=YYYY-MM-DD&end=YYYY-MM-DD - Get forecast
router.get('/', async (req, res) => {
  try {
    // Parse query parameters
    let startDate: string;
    let endDate: string;

    if (req.query.start && req.query.end) {
      startDate = req.query.start as string;
      endDate = req.query.end as string;

      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
        return res.status(400).json({ error: 'Dates must be in YYYY-MM-DD format' });
      }
    } else {
      // Default to today + 29 days
      const today = new Date();
      startDate = format(today, 'yyyy-MM-dd');
      endDate = format(addDays(today, 29), 'yyyy-MM-dd');
    }

    // Fetch balance anchor
    const balanceResult = await db.select().from(balanceAnchor).limit(1);
    const balance = balanceResult.length === 0
      ? {
          id: 0,
          balance: '0.00',
          asOfDate: format(new Date(), 'yyyy-MM-dd'),
          updatedAt: new Date(),
        }
      : balanceResult[0]!;

    // Fetch all entries
    const entryList = await db.select().from(entries);

    // Fetch all overrides
    const overrideList = await db.select().from(recurringOverrides);

    // Calculate forecast
    const projections = calculateForecast({
      startDate,
      endDate,
      balanceAnchor: balance,
      entries: entryList,
      overrides: overrideList,
    });

    res.json(projections);
  } catch (error) {
    console.error('Error generating forecast:', error);
    res.status(500).json({ error: 'Failed to generate forecast' });
  }
});

export default router;