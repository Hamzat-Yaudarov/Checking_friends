import { query } from '../db/database';
import { v4 as uuidv4 } from 'uuid';

export interface Answer {
  id: string;
  question_id: string;
  text: string;
  is_correct: boolean;
  order_index: number;
}

export interface Question {
  id: string;
  test_id: string;
  text: string;
  order_index: number;
  answers: Answer[];
}

export interface Test {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
  questions?: Question[];
}

export interface TestAttempt {
  id: string;
  user_id: string;
  test_id: string;
  display_name: string | null;
  score: number;
  total_questions: number;
  percentage: number;
  completed_at: Date;
}

// Test CRUD operations
export const createTest = async (
  creatorId: string,
  title: string,
  description: string | null = null
): Promise<Test> => {
  const result = await query(
    `INSERT INTO tests (creator_id, title, description)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [creatorId, title, description]
  );
  return result.rows[0];
};

export const getTestById = async (testId: string): Promise<Test | null> => {
  const result = await query('SELECT * FROM tests WHERE id = $1', [testId]);
  return result.rows[0] || null;
};

export const getTestWithQuestions = async (testId: string): Promise<Test | null> => {
  const testResult = await query('SELECT * FROM tests WHERE id = $1', [testId]);
  if (!testResult.rows[0]) return null;

  const test = testResult.rows[0];

  const questionsResult = await query(
    `SELECT * FROM questions WHERE test_id = $1 ORDER BY order_index ASC`,
    [testId]
  );

  const questions = await Promise.all(
    questionsResult.rows.map(async (question) => {
      const answersResult = await query(
        `SELECT * FROM answers WHERE question_id = $1 ORDER BY order_index ASC`,
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
};

export const getTestsByCreator = async (creatorId: string): Promise<Test[]> => {
  const result = await query(
    `SELECT * FROM tests WHERE creator_id = $1 ORDER BY created_at DESC`,
    [creatorId]
  );
  return result.rows;
};

export const updateTest = async (
  testId: string,
  title: string,
  description: string | null = null
): Promise<Test> => {
  const result = await query(
    `UPDATE tests SET title = $1, description = $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = $3
     RETURNING *`,
    [title, description, testId]
  );
  return result.rows[0];
};

export const deleteTest = async (testId: string): Promise<void> => {
  await query('DELETE FROM tests WHERE id = $1', [testId]);
};

// Question operations
export const createQuestion = async (
  testId: string,
  text: string,
  orderIndex: number
): Promise<Question> => {
  const result = await query(
    `INSERT INTO questions (test_id, text, order_index)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [testId, text, orderIndex]
  );

  return {
    ...result.rows[0],
    answers: [],
  };
};

export const deleteQuestion = async (questionId: string): Promise<void> => {
  await query('DELETE FROM questions WHERE id = $1', [questionId]);
};

export const updateQuestion = async (
  questionId: string,
  text: string
): Promise<Question> => {
  const result = await query(
    `UPDATE questions SET text = $1 WHERE id = $2 RETURNING *`,
    [text, questionId]
  );

  const answersResult = await query(
    `SELECT * FROM answers WHERE question_id = $1 ORDER BY order_index ASC`,
    [questionId]
  );

  return {
    ...result.rows[0],
    answers: answersResult.rows,
  };
};

// Answer operations
export const createAnswer = async (
  questionId: string,
  text: string,
  isCorrect: boolean,
  orderIndex: number
): Promise<Answer> => {
  const result = await query(
    `INSERT INTO answers (question_id, text, is_correct, order_index)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [questionId, text, isCorrect, orderIndex]
  );
  return result.rows[0];
};

export const deleteAnswer = async (answerId: string): Promise<void> => {
  await query('DELETE FROM answers WHERE id = $1', [answerId]);
};

export const updateAnswer = async (
  answerId: string,
  text: string,
  isCorrect: boolean
): Promise<Answer> => {
  const result = await query(
    `UPDATE answers SET text = $1, is_correct = $2 WHERE id = $3 RETURNING *`,
    [text, isCorrect, answerId]
  );
  return result.rows[0];
};

// Test attempts
export const checkAttemptExists = async (
  userId: string,
  testId: string
): Promise<boolean> => {
  const result = await query(
    'SELECT id FROM test_attempts WHERE user_id = $1 AND test_id = $2',
    [userId, testId]
  );
  return result.rows.length > 0;
};

export const createTestAttempt = async (
  userId: string,
  testId: string,
  displayName: string | null,
  score: number,
  totalQuestions: number
): Promise<TestAttempt> => {
  const percentage = Math.round((score / totalQuestions) * 100);
  const result = await query(
    `INSERT INTO test_attempts (user_id, test_id, display_name, score, total_questions, percentage)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId, testId, displayName, score, totalQuestions, percentage]
  );
  return result.rows[0];
};

export const getTestAttempts = async (testId: string): Promise<TestAttempt[]> => {
  const result = await query(
    `SELECT * FROM test_attempts WHERE test_id = $1 ORDER BY completed_at DESC`,
    [testId]
  );
  return result.rows;
};

export const getTestAttemptById = async (attemptId: string): Promise<TestAttempt | null> => {
  const result = await query('SELECT * FROM test_attempts WHERE id = $1', [attemptId]);
  return result.rows[0] || null;
};

// Test results
export const createTestResult = async (
  attemptId: string,
  questionId: string,
  selectedAnswerId: string | null,
  isCorrect: boolean
): Promise<void> => {
  await query(
    `INSERT INTO test_results (attempt_id, question_id, selected_answer_id, is_correct)
     VALUES ($1, $2, $3, $4)`,
    [attemptId, questionId, selectedAnswerId, isCorrect]
  );
};
