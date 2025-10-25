import { query } from '../db/database';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  telegram_id: number;
  telegram_username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export const getUserByTelegramId = async (telegramId: number): Promise<User | null> => {
  const result = await query('SELECT * FROM users WHERE telegram_id = $1', [telegramId]);
  return result.rows[0] || null;
};

export const createOrUpdateUser = async (
  telegramId: number,
  telegramUsername: string | null,
  firstName: string | null,
  lastName: string | null,
  avatarUrl: string | null = null
): Promise<User> => {
  const existingUser = await getUserByTelegramId(telegramId);

  if (existingUser) {
    const result = await query(
      `UPDATE users 
       SET telegram_username = $1, first_name = $2, last_name = $3, avatar_url = COALESCE($4, avatar_url), updated_at = CURRENT_TIMESTAMP
       WHERE telegram_id = $5
       RETURNING *`,
      [telegramUsername, firstName, lastName, avatarUrl, telegramId]
    );
    return result.rows[0];
  }

  const result = await query(
    `INSERT INTO users (telegram_id, telegram_username, first_name, last_name, avatar_url)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [telegramId, telegramUsername, firstName, lastName, avatarUrl]
  );
  return result.rows[0];
};

export const getUserById = async (userId: string): Promise<User | null> => {
  const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
  return result.rows[0] || null;
};
