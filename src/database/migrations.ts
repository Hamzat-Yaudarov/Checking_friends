import pool from './connection';

let initialized = false;
const initTimeout = 10000; // 10 seconds timeout

export async function initializeDatabase() {
  if (initialized) {
    return;
  }

  try {
    // Set a timeout for database initialization
    const initPromise = (async () => {
      // Create users table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id BIGINT PRIMARY KEY,
          username VARCHAR(255),
          first_name VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create quizzes table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS quizzes (
          id SERIAL PRIMARY KEY,
          user_id BIGINT NOT NULL REFERENCES users(id),
          title VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create questions table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS questions (
          id SERIAL PRIMARY KEY,
          quiz_id INT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
          question_text TEXT NOT NULL,
          question_order INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create options table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS options (
          id SERIAL PRIMARY KEY,
          question_id INT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
          option_text TEXT NOT NULL,
          option_order INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create quiz responses table (for when friends take the quiz)
      await pool.query(`
        CREATE TABLE IF NOT EXISTS quiz_responses (
          id SERIAL PRIMARY KEY,
          quiz_id INT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
          respondent_id BIGINT NOT NULL REFERENCES users(id),
          question_id INT NOT NULL REFERENCES questions(id),
          selected_option_id INT NOT NULL REFERENCES options(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      console.log('Database initialized successfully');
      initialized = true;
    })();

    await Promise.race([
      initPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database initialization timeout')), initTimeout)
      ),
    ]);
  } catch (error) {
    console.error('Error initializing database:', error);
    // Don't throw - allow the bot to continue even if DB init fails
    // This helps with development and allows for graceful degradation
    initialized = true;
  }
}
