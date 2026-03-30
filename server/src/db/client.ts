import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from './schema.js';

// Create Neon serverless connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Initialize Drizzle client with schema
export const db = drizzle(pool, { schema });
