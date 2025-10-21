import { getPool } from '../services/db';

export interface User {
  id: number;
  telegram_id: bigint;
  username?: string;
  first_name?: string;
  last_name?: string;
  created_at: Date;
  updated_at: Date;
}

export async function findOrCreateUser(
  telegramId: bigint,
  username?: string,
  firstName?: string,
  lastName?: string
): Promise<User> {
  const pool = getPool();

  // Try to find user
  const findResult = await pool.query(
    'SELECT * FROM users WHERE telegram_id = $1',
    [telegramId]
  );

  if (findResult.rows.length > 0) {
    return findResult.rows[0];
  }

  // Create new user
  const createResult = await pool.query(
    `INSERT INTO users (telegram_id, username, first_name, last_name)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [telegramId, username || null, firstName || null, lastName || null]
  );

  return createResult.rows[0];
}

export async function getUserById(id: number): Promise<User | null> {
  const pool = getPool();
  const result = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

export async function getUserByTelegramId(telegramId: bigint): Promise<User | null> {
  const pool = getPool();
  const result = await pool.query(
    'SELECT * FROM users WHERE telegram_id = $1',
    [telegramId]
  );
  return result.rows[0] || null;
}
