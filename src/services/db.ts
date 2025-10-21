import { Pool, PoolClient } from 'pg';

let pool: Pool;

export async function initDatabase(): Promise<void> {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });

  // Test the connection
  const client = await pool.connect();
  try {
    console.log('✅ Database connected');
  } finally {
    client.release();
  }
}

export function getPool(): Pool {
  if (!pool) {
    throw new Error('Database not initialized');
  }
  return pool;
}

export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
  }
}

export async function getClient(): Promise<PoolClient> {
  return getPool().connect();
}
