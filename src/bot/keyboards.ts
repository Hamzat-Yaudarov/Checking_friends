import { Markup } from 'telegraf';

export const mainMenuKeyboard = Markup.inlineKeyboard([
  [
    Markup.button.callback('✨ Создать тест ✨', 'create_test'),
    Markup.button.callback('Мои тесты', 'my_tests'),
  ],
]);

export const createTestStartKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('❌ Остановить создание теста', 'stop_test_creation')],
]);

export const nextQuestionKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('➕ Следующий вопрос', 'next_question')],
  [Markup.button.callback('❌ Остановить создание теста', 'stop_test_creation')],
]);

export const saveTestKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('➕ Следующий вопрос', 'next_question')],
  [Markup.button.callback('💾 Сохранить тест', 'save_test')],
  [Markup.button.callback('❌ Остановить создание теста', 'stop_test_creation')],
]);

export const cancelKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('❌ Остановить создание теста', 'stop_test_creation')],
]);

export function testActionKeyboard(testId: number) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('✏️ Редактировать', `edit_test_${testId}`),
      Markup.button.callback('🗑️ Удалить', `delete_test_${testId}`),
    ],
    [Markup.button.callback('📤 Поделиться ссылкой', `share_test_${testId}`)],
  ]);
}

export function correctAnswersKeyboard(answers: any[]) {
  const buttons = answers.map((answer, idx) => [
    Markup.button.callback(`${idx + 1}. ${answer.text || answer}`, `toggle_answer_${answer.id || idx}`),
  ]);
  buttons.push([
    Markup.button.callback('✅ Подтвердить', 'confirm_correct_answers'),
  ]);
  return Markup.inlineKeyboard(buttons);
}
