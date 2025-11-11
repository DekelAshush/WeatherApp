import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

// Create knex instance
// Supports both connection string (for Neon) and individual parameters
const db = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL || {
    host: process.env.PG_HOST || 'localhost',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE || 'weatherapp',
    port: process.env.PG_PORT || 5432,
    ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
  },
});

export default db;

