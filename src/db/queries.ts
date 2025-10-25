import { query } from './connection.js';

export async function getOrCreateUser(telegramId: number, username?: string) {
  const result = await query(
    `INSERT INTO users (telegram_id, username) 
     VALUES ($1, $2) 
     ON CONFLICT (telegram_id) DO UPDATE SET username = COALESCE($2, users.username)
     RETURNING *`,
    [telegramId, username]
  );
  return result.rows[0];
}

export async function getOrCreateSession(telegramId: number) {
  const result = await query(
    `INSERT INTO user_sessions (telegram_id) 
     VALUES ($1) 
     ON CONFLICT (telegram_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [telegramId]
  );
  return result.rows[0];
}

export async function updateSessionState(telegramId: number, state: string, data?: any) {
  const updates: string[] = ['state = $2', 'updated_at = CURRENT_TIMESTAMP'];
  const params: any[] = [telegramId, state];
  let paramIndex = 3;

  if (data?.currentTestId) {
    updates.push(`current_test_id = $${paramIndex}`);
    params.push(data.currentTestId);
    paramIndex++;
  }

  if (data?.questionCount !== undefined) {
    updates.push(`current_question_count = $${paramIndex}`);
    params.push(data.questionCount);
    paramIndex++;
  }

  if (data?.tempQuestion) {
    updates.push(`temp_question = $${paramIndex}`);
    params.push(data.tempQuestion);
    paramIndex++;
  }

  if (data?.tempAnswers) {
    updates.push(`temp_answers = $${paramIndex}`);
    params.push(data.tempAnswers);
    paramIndex++;
  }

  const result = await query(
    `UPDATE user_sessions SET ${updates.join(', ')} WHERE telegram_id = $1 RETURNING *`,
    params
  );
  return result.rows[0];
}

export async function getSession(telegramId: number) {
  const result = await query('SELECT * FROM user_sessions WHERE telegram_id = $1', [telegramId]);
  return result.rows[0];
}

export async function createTest(userId: number, title?: string) {
  const result = await query(
    'INSERT INTO tests (user_id, title) VALUES ($1, $2) RETURNING *',
    [userId, title || `Test ${new Date().toLocaleDateString()}`]
  );
  return result.rows[0];
}

export async function addQuestion(testId: number, questionText: string, order: number) {
  const result = await query(
    'INSERT INTO questions (test_id, question_text, question_order) VALUES ($1, $2, $3) RETURNING *',
    [testId, questionText, order]
  );
  return result.rows[0];
}

export async function addAnswer(questionId: number, answerText: string, order: number) {
  const result = await query(
    'INSERT INTO answers (question_id, answer_text, answer_order) VALUES ($1, $2, $3) RETURNING *',
    [questionId, answerText, order]
  );
  return result.rows[0];
}

export async function getTestsByUser(userId: number) {
  const result = await query(
    `SELECT t.*, COUNT(q.id) as question_count 
     FROM tests t 
     LEFT JOIN questions q ON t.id = q.test_id 
     WHERE t.user_id = $1 
     GROUP BY t.id 
     ORDER BY t.created_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function getTestWithQuestions(testId: number) {
  const result = await query(
    `SELECT t.*, json_agg(json_build_object('id', q.id, 'text', q.question_text, 'order', q.question_order) ORDER BY q.question_order) as questions
     FROM tests t
     LEFT JOIN questions q ON t.id = q.test_id
     WHERE t.id = $1
     GROUP BY t.id`,
    [testId]
  );
  return result.rows[0];
}

export async function getQuestionWithAnswers(questionId: number) {
  const result = await query(
    `SELECT q.*, json_agg(json_build_object('id', a.id, 'text', a.answer_text, 'order', a.answer_order) ORDER BY a.answer_order) as answers
     FROM questions q
     LEFT JOIN answers a ON q.id = a.question_id
     WHERE q.id = $1
     GROUP BY q.id`,
    [questionId]
  );
  return result.rows[0];
}

export async function getUserByTelegramId(telegramId: number) {
  const result = await query('SELECT * FROM users WHERE telegram_id = $1', [telegramId]);
  return result.rows[0];
}

export async function markAnswerAsCorrect(answerId: number) {
  const result = await query('UPDATE answers SET is_correct = TRUE WHERE id = $1 RETURNING *', [answerId]);
  return result.rows[0];
}

export async function deleteTest(testId: number) {
  const result = await query('DELETE FROM tests WHERE id = $1 RETURNING *', [testId]);
  return result.rows[0];
}
