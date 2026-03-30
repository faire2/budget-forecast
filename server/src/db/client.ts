import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema.js';

// Create Neon HTTP client (better for serverless)
const sql = neon(process.env.DATABASE_URL!);

// Initialize Drizzle client with schema
export const db = drizzle(sql, { schema });
