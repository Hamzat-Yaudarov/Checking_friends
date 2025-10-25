export interface Question {
  id?: string;
  text: string;
  options: string[];
}

export interface Quiz {
  id?: string;
  user_id: number;
  title?: string;
  questions: Question[];
  created_at?: Date;
  updated_at?: Date;
}

export interface UserSession {
  user_id: number;
  state: 'idle' | 'creating_test' | 'adding_questions' | 'adding_options';
  current_quiz?: {
    questions: Question[];
    current_question_index: number;
    current_question_text?: string;
    current_options: string[];
  };
  message_id?: number;
  chat_id?: number;
}

export interface StoredQuestion {
  text: string;
  options: string[];
}
