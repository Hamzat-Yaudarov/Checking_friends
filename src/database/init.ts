import { getPool } from '../services/db';
import * as fs from 'fs';
import * as path from 'path';

export async function initializeSchema(): Promise<void> {
  const pool = getPool();
  
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    
    // Split by semicolons and execute each statement
    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      await pool.query(statement);
    }

    console.log('✅ Database schema initialized');
  } catch (error) {
    console.error('❌ Error initializing database schema:', error);
    throw error;
  }
}
