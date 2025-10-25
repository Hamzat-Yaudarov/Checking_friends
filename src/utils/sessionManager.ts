import { UserSession } from '../types';

const sessions = new Map<number, UserSession>();

export function getOrCreateSession(userId: number, chatId: number): UserSession {
  if (!sessions.has(userId)) {
    sessions.set(userId, {
      user_id: userId,
      state: 'idle',
      chat_id: chatId,
      current_quiz: {
        questions: [],
        current_question_index: 0,
        current_options: [],
      },
    });
  }
  return sessions.get(userId)!;
}

export function getSession(userId: number): UserSession | undefined {
  return sessions.get(userId);
}

export function updateSession(userId: number, updates: Partial<UserSession>) {
  const session = getOrCreateSession(userId, updates.chat_id || 0);
  Object.assign(session, updates);
  sessions.set(userId, session);
}

export function deleteSession(userId: number) {
  sessions.delete(userId);
}

export function resetQuizCreation(userId: number) {
  const session = getOrCreateSession(userId, 0);
  session.state = 'idle';
  session.current_quiz = {
    questions: [],
    current_question_index: 0,
    current_options: [],
  };
  session.message_id = undefined;
}

export function startQuizCreation(userId: number, chatId: number) {
  resetQuizCreation(userId);
  const session = getSession(userId)!;
  session.state = 'creating_test';
  session.chat_id = chatId;
  updateSession(userId, session);
}

export function addQuestionToSession(userId: number, questionText: string) {
  const session = getOrCreateSession(userId, 0);
  if (session.current_quiz) {
    session.current_quiz.current_question_text = questionText;
    session.current_quiz.current_options = [];
    updateSession(userId, session);
  }
}

export function addOptionToSession(userId: number, optionText: string) {
  const session = getOrCreateSession(userId, 0);
  if (session.current_quiz) {
    session.current_quiz.current_options.push(optionText);
    updateSession(userId, session);
  }
}

export function saveCurrentQuestion(userId: number) {
  const session = getOrCreateSession(userId, 0);
  if (session.current_quiz && session.current_quiz.current_question_text) {
    session.current_quiz.questions.push({
      text: session.current_quiz.current_question_text,
      options: [...session.current_quiz.current_options],
    });
    session.current_quiz.current_question_text = undefined;
    session.current_quiz.current_options = [];
    session.current_quiz.current_question_index += 1;
    updateSession(userId, session);
  }
}

export function getCurrentQuestions(userId: number) {
  const session = getSession(userId);
  return session?.current_quiz?.questions || [];
}

export function getCurrentQuestionText(userId: number) {
  const session = getSession(userId);
  return session?.current_quiz?.current_question_text;
}

export function getCurrentOptions(userId: number) {
  const session = getSession(userId);
  return session?.current_quiz?.current_options || [];
}

export function setMessageId(userId: number, messageId: number) {
  const session = getOrCreateSession(userId, 0);
  session.message_id = messageId;
  updateSession(userId, session);
}

export function getMessageId(userId: number): number | undefined {
  return getSession(userId)?.message_id;
}
