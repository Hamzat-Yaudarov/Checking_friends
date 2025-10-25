import pool from './connection';
import { Quiz, Question } from '../types';

export async function createUser(userId: number, username?: string, firstName?: string) {
  const query = `
    INSERT INTO users (id, username, first_name)
    VALUES ($1, $2, $3)
    ON CONFLICT (id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;
  const result = await pool.query(query, [userId, username, firstName]);
  return result.rows[0];
}

export async function createQuiz(userId: number, title?: string): Promise<number> {
  const query = `
    INSERT INTO quizzes (user_id, title)
    VALUES ($1, $2)
    RETURNING id;
  `;
  const result = await pool.query(query, [userId, title]);
  return result.rows[0].id;
}

export async function addQuestion(quizId: number, questionText: string, questionOrder: number): Promise<number> {
  const query = `
    INSERT INTO questions (quiz_id, question_text, question_order)
    VALUES ($1, $2, $3)
    RETURNING id;
  `;
  const result = await pool.query(query, [quizId, questionText, questionOrder]);
  return result.rows[0].id;
}

export async function addOption(questionId: number, optionText: string, optionOrder: number): Promise<number> {
  const query = `
    INSERT INTO options (question_id, option_text, option_order)
    VALUES ($1, $2, $3)
    RETURNING id;
  `;
  const result = await pool.query(query, [questionId, optionText, optionOrder]);
  return result.rows[0].id;
}

export async function getQuiz(quizId: number): Promise<Quiz | null> {
  const query = `
    SELECT 
      q.id,
      q.user_id,
      q.title,
      q.created_at,
      q.updated_at,
      json_agg(
        json_build_object(
          'id', ques.id,
          'text', ques.question_text,
          'options', COALESCE(
            json_agg(json_build_object('id', opt.id, 'text', opt.option_text) ORDER BY opt.option_order),
            '[]'::json
          )
        ) ORDER BY ques.question_order
      ) as questions
    FROM quizzes q
    LEFT JOIN questions ques ON q.id = ques.quiz_id
    LEFT JOIN options opt ON ques.id = opt.question_id
    WHERE q.id = $1
    GROUP BY q.id;
  `;
  const result = await pool.query(query, [quizId]);
  if (result.rows.length === 0) return null;
  
  const row = result.rows[0];
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    questions: row.questions,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function getUserQuizzes(userId: number): Promise<Quiz[]> {
  const query = `
    SELECT 
      q.id,
      q.user_id,
      q.title,
      q.created_at,
      q.updated_at,
      json_agg(
        json_build_object(
          'id', ques.id,
          'text', ques.question_text,
          'options', COALESCE(
            json_agg(json_build_object('id', opt.id, 'text', opt.option_text) ORDER BY opt.option_order),
            '[]'::json
          )
        ) ORDER BY ques.question_order
      ) as questions
    FROM quizzes q
    LEFT JOIN questions ques ON q.id = ques.quiz_id
    LEFT JOIN options opt ON ques.id = opt.question_id
    WHERE q.user_id = $1
    GROUP BY q.id
    ORDER BY q.created_at DESC;
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
}

export async function deleteQuiz(quizId: number): Promise<boolean> {
  const query = `
    DELETE FROM quizzes WHERE id = $1;
  `;
  const result = await pool.query(query, [quizId]);
  return result.rowCount > 0;
}

export async function getQuestionCount(quizId: number): Promise<number> {
  const query = `
    SELECT COUNT(*) as count FROM questions WHERE quiz_id = $1;
  `;
  const result = await pool.query(query, [quizId]);
  return parseInt(result.rows[0].count, 10);
}

export async function getQuestion(questionId: number) {
  const query = `
    SELECT 
      id,
      quiz_id,
      question_text,
      question_order,
      (
        SELECT json_agg(json_build_object('id', id, 'text', option_text) ORDER BY option_order)
        FROM options WHERE question_id = $1
      ) as options
    FROM questions
    WHERE id = $1;
  `;
  const result = await pool.query(query, [questionId]);
  return result.rows[0] || null;
}
