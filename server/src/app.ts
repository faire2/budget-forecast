import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import balanceRouter from './routes/balance.js';
import entriesRouter from './routes/entries.js';
import forecastsRouter from './routes/forecasts.js';
import overridesRouter from './routes/overrides.js';

const app = express();

// Middleware
app.use(cors()); // Allow all origins for development
app.use(express.json());

// Routes
app.use('/api/balance', balanceRouter);
app.use('/api/entries', overridesRouter);
app.use('/api/entries', entriesRouter);
app.use('/api/forecasts', forecastsRouter);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.message);
  console.error(err.stack);

  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

export default app;
