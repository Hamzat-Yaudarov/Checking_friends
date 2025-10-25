import pool from './db.js';

export async function ensureUserExists(userId, username, firstName) {
  try {
    await pool.query(
      `INSERT INTO users (id, username, first_name) 
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO NOTHING`,
      [userId, username, firstName]
    );
  } catch (error) {
    console.error('Error ensuring user exists:', error);
  }
}

export async function getOrCreateSession(userId) {
  try {
    const result = await pool.query(
      `SELECT id, session_data FROM user_sessions 
       WHERE user_id = $1`,
      [userId]
    );
    
    if (result.rows.length > 0) {
      return result.rows[0];
    }
    
    const newSession = await pool.query(
      `INSERT INTO user_sessions (user_id, session_data) 
       VALUES ($1, $2) 
       RETURNING id, session_data`,
      [userId, JSON.stringify({ state: 'idle', questions: [], currentQuestion: 0 })]
    );
    
    return newSession.rows[0];
  } catch (error) {
    console.error('Error getting or creating session:', error);
  }
}

export async function updateSessionData(userId, sessionData) {
  try {
    await pool.query(
      `UPDATE user_sessions 
       SET session_data = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE user_id = $2`,
      [JSON.stringify(sessionData), userId]
    );
  } catch (error) {
    console.error('Error updating session data:', error);
  }
}

export async function createTest(userId) {
  try {
    const result = await pool.query(
      `INSERT INTO tests (user_id, title) 
       VALUES ($1, $2) 
       RETURNING id`,
      [userId, `Test ${new Date().toISOString().split('T')[0]}`]
    );
    return result.rows[0].id;
  } catch (error) {
    console.error('Error creating test:', error);
  }
}

export async function addQuestion(testId, questionText, questionOrder) {
  try {
    const result = await pool.query(
      `INSERT INTO questions (test_id, question_text, question_order) 
       VALUES ($1, $2, $3) 
       RETURNING id`,
      [testId, questionText, questionOrder]
    );
    return result.rows[0].id;
  } catch (error) {
    console.error('Error adding question:', error);
  }
}

export async function addAnswer(questionId, answerText, answerOrder, isCorrect = false) {
  try {
    const result = await pool.query(
      `INSERT INTO answers (question_id, answer_text, answer_order, is_correct)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [questionId, answerText, answerOrder, isCorrect]
    );
    return result.rows[0].id;
  } catch (error) {
    console.error('Error adding answer:', error);
  }
}

export async function setCorrectAnswer(questionId, answerOrder) {
  try {
    await pool.query(
      `UPDATE answers
       SET is_correct = false
       WHERE question_id = $1`,
      [questionId]
    );

    await pool.query(
      `UPDATE answers
       SET is_correct = true
       WHERE question_id = $1 AND answer_order = $2`,
      [questionId, answerOrder]
    );
  } catch (error) {
    console.error('Error setting correct answer:', error);
  }
}

export async function getQuestionById(questionId) {
  try {
    const result = await pool.query(
      `SELECT * FROM questions WHERE id = $1`,
      [questionId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting question:', error);
  }
}

export async function getAnswersByQuestionId(questionId) {
  try {
    const result = await pool.query(
      `SELECT * FROM answers WHERE question_id = $1 
       ORDER BY answer_order ASC`,
      [questionId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting answers:', error);
  }
}

export async function getUserTests(userId) {
  try {
    const result = await pool.query(
      `SELECT t.id, t.title, t.created_at,
              COUNT(q.id)::INTEGER as question_count
       FROM tests t
       LEFT JOIN questions q ON t.id = q.test_id
       WHERE t.user_id = $1
       GROUP BY t.id, t.title, t.created_at
       ORDER BY t.created_at DESC`,
      [userId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting user tests:', error);
    return [];
  }
}

export async function getTestWithQuestions(testId) {
  try {
    const testResult = await pool.query(
      `SELECT * FROM tests WHERE id = $1`,
      [testId]
    );
    
    if (testResult.rows.length === 0) return null;
    
    const test = testResult.rows[0];
    
    const questionsResult = await pool.query(
      `SELECT * FROM questions WHERE test_id = $1 
       ORDER BY question_order ASC`,
      [testId]
    );
    
    const questionsWithAnswers = await Promise.all(
      questionsResult.rows.map(async (q) => {
        const answers = await getAnswersByQuestionId(q.id);
        return { ...q, answers };
      })
    );
    
    return { ...test, questions: questionsWithAnswers };
  } catch (error) {
    console.error('Error getting test with questions:', error);
  }
}

export async function deleteTest(testId) {
  try {
    await pool.query(
      `DELETE FROM tests WHERE id = $1`,
      [testId]
    );
  } catch (error) {
    console.error('Error deleting test:', error);
  }
}
