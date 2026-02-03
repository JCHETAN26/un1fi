import { Pool } from 'pg';
import { config } from './env';

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
  ssl: {
    rejectUnauthorized: false, // Required for Supabase
  },
});

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
});

export async function initializeDatabase() {
  try {
    const client = await pool.connect();
    console.log('✓ Database connected');
    client.release();
  } catch (err) {
    console.error('✗ Database connection failed:', err);
    process.exit(1);
  }
}

export default pool;
