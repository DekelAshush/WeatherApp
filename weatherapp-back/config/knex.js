import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

// Create knex instance
const db = knex({
  client: 'pg',
  connection: {
    host: process.env.PG_HOST || 'localhost',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE || 'weatherapp',
    port: process.env.PG_PORT || 5432,
  },
});

export default db;

