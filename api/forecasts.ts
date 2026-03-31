import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../shared/db/client';
import { balanceAnchor, entries, recurringOverrides } from '../shared/db/schema';
import { calculateForecast } from '../shared/services/forecastCalculator';
import { format, addDays } from 'date-fns';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // GET /api/forecasts?start=YYYY-MM-DD&end=YYYY-MM-DD
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

      return res.json(projections);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error generating forecast:', error);
    return res.status(500).json({ error: 'Failed to generate forecast' });
  }
}
