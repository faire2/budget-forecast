import type { DailyProjection } from '../shared/types/forecast-output';
import { fetchForecasts } from './src/lib/api';
import { useForecasts } from './src/hooks/useForecasts';

// This file tests that our new files compile correctly
const projection: DailyProjection = {
  date: '2024-01-01',
  income: 100,
  expenses: 50,
  balance: 50,
  entries: []
};

console.log(projection);
