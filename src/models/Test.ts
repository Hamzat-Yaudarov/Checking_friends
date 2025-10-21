import { getPool } from '../services/db';

export interface Question {
  id: number;
  test_id: number;
  question_text: string;
  question_order: number;
  created_at: Date;
}

export interface Answer {
  id: number;
  question_id: number;
  answer_text: string;
  answer_order: number;
  is_correct: boolean;
  created_at: Date;
}

export interface Test {
  id: number;
  user_id: number;
  title: string;
  created_at: Date;
  updated_at: Date;
}

export interface TestWithQuestions extends Test {
  questions: (Question & { answers: Answer[] })[];
}

export async function createTest(
  userId: number,
  title: string
): Promise<Test> {
  const pool = getPool();
  const result = await pool.query(
    `INSERT INTO tests (user_id, title)
     VALUES ($1, $2)
     RETURNING *`,
    [userId, title]
  );
  return result.rows[0];
}

export async function addQuestion(
  testId: number,
  questionText: string,
  questionOrder: number
): Promise<Question> {
  const pool = getPool();
  const result = await pool.query(
    `INSERT INTO questions (test_id, question_text, question_order)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [testId, questionText, questionOrder]
  );
  return result.rows[0];
}

export async function addAnswer(
  questionId: number,
  answerText: string,
  answerOrder: number
): Promise<Answer> {
  const pool = getPool();
  const result = await pool.query(
    `INSERT INTO answers (question_id, answer_text, answer_order)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [questionId, answerText, answerOrder]
  );
  return result.rows[0];
}

export async function getTestWithQuestions(testId: number): Promise<TestWithQuestions | null> {
  const pool = getPool();
  
  const testResult = await pool.query(
    'SELECT * FROM tests WHERE id = $1',
    [testId]
  );

  if (testResult.rows.length === 0) {
    return null;
  }

  const test = testResult.rows[0];

  const questionsResult = await pool.query(
    'SELECT * FROM questions WHERE test_id = $1 ORDER BY question_order ASC',
    [testId]
  );

  const questions = await Promise.all(
    questionsResult.rows.map(async (question) => {
      const answersResult = await pool.query(
        'SELECT * FROM answers WHERE question_id = $1 ORDER BY answer_order ASC',
        [question.id]
      );
      return {
        ...question,
        answers: answersResult.rows,
      };
    })
  );

  return {
    ...test,
    questions,
  };
}

export async function getUserTests(userId: number): Promise<Test[]> {
  const pool = getPool();
  const result = await pool.query(
    'SELECT * FROM tests WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}

export async function getLastQuestion(testId: number): Promise<Question | null> {
  const pool = getPool();
  const result = await pool.query(
    'SELECT * FROM questions WHERE test_id = $1 ORDER BY question_order DESC LIMIT 1',
    [testId]
  );
  return result.rows[0] || null;
}

export async function getLastAnswer(questionId: number): Promise<Answer | null> {
  const pool = getPool();
  const result = await pool.query(
    'SELECT * FROM answers WHERE question_id = $1 ORDER BY answer_order DESC LIMIT 1',
    [questionId]
  );
  return result.rows[0] || null;
}

export async function getAnswersForQuestion(questionId: number): Promise<Answer[]> {
  const pool = getPool();
  const result = await pool.query(
    'SELECT * FROM answers WHERE question_id = $1 ORDER BY answer_order ASC',
    [questionId]
  );
  return result.rows;
}

export async function deleteTest(testId: number): Promise<void> {
  const pool = getPool();
  await pool.query('DELETE FROM tests WHERE id = $1', [testId]);
}
