import { TestWithQuestions } from '../models/Test';
import { Markup } from 'telegraf';

export function formatTestForDisplay(test: TestWithQuestions, index: number): string {
  const questionCount = test.questions.length;
  const totalAnswers = test.questions.reduce((sum, q) => sum + q.answers.length, 0);

  return `
📝 Тест ${index}
━━━━━━━━━━━━━━━
📌 Вопросов: ${questionCount}
📋 Вариантов ответов: ${totalAnswers}
📅 Создан: ${new Date(test.created_at).toLocaleDateString('ru-RU')}

Нажмите на номер теста, чтобы посмотреть детали`;
}

export function formatTestDetails(test: TestWithQuestions): string {
  let message = `📋 Детали теста\n━━━━━━━━━━━━━━━\n\n`;

  test.questions.forEach((question, qIndex) => {
    message += `❓ Вопрос ${qIndex + 1}: ${question.question_text}\n\n`;

    question.answers.forEach((answer, aIndex) => {
      message += `  ${aIndex + 1}. ${answer.answer_text}\n`;
    });

    message += '\n';
  });

  return message;
}

export function testListKeyboard(tests: TestWithQuestions[]) {
  const buttons = tests.slice(0, 5).map((test, index) => [
    Markup.button.callback(
      `Тест ${index + 1}`,
      `view_test_${test.id}`
    ),
  ]);

  buttons.push([Markup.button.callback('⬅️ Назад', 'back_to_menu')]);

  return Markup.inlineKeyboard(buttons);
}

export function testDetailKeyboard(testId: number) {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🔗 Поделиться', `share_test_${testId}`)],
    [Markup.button.callback('🗑️ Удалить', `delete_test_${testId}`)],
    [Markup.button.callback('⬅️ Назад', 'back_to_tests')],
  ]);
}

export function generateTestShareLink(testId: number, userId: number): string {
  return `https://t.me/friendlyquizbot?start=test_${testId}_from_${userId}`;
}
