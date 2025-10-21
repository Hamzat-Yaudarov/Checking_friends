import { getPool } from '../services/db';

export type SessionState = 
  | 'idle' 
  | 'creating_test' 
  | 'entering_question' 
  | 'entering_answers';

export interface SessionData {
  testId?: number;
  currentQuestion?: number;
  currentQuestionText?: string;
  currentAnswers?: string[];
  lastMessageId?: number;
}

export async function getSession(telegramId: bigint): Promise<{ state: SessionState; data: SessionData } | null> {
  const pool = getPool();
  const result = await pool.query(
    'SELECT state, state_data FROM user_sessions WHERE telegram_id = $1',
    [telegramId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    state: row.state as SessionState,
    data: row.state_data as SessionData,
  };
}

export async function setSession(
  telegramId: bigint,
  state: SessionState,
  data: SessionData
): Promise<void> {
  const pool = getPool();
  
  const existing = await pool.query(
    'SELECT id FROM user_sessions WHERE telegram_id = $1',
    [telegramId]
  );

  if (existing.rows.length > 0) {
    await pool.query(
      `UPDATE user_sessions 
       SET state = $1, state_data = $2, updated_at = CURRENT_TIMESTAMP
       WHERE telegram_id = $3`,
      [state, JSON.stringify(data), telegramId]
    );
  } else {
    await pool.query(
      `INSERT INTO user_sessions (telegram_id, state, state_data)
       VALUES ($1, $2, $3)`,
      [telegramId, state, JSON.stringify(data)]
    );
  }
}

export async function clearSession(telegramId: bigint): Promise<void> {
  const pool = getPool();
  await pool.query(
    'UPDATE user_sessions SET state = $1, state_data = $2 WHERE telegram_id = $3',
    [telegramId, '{}', 'idle']
  );
}
