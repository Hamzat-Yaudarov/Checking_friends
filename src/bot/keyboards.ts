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
  [
    Markup.button.callback('➕ Следующий вопрос', 'next_question'),
    Markup.button.callback('💾 Сохранить тест', 'save_test'),
  ],
  [Markup.button.callback('❌ Остановить создание теста', 'stop_test_creation')],
]);

export const saveTestKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('💾 Сохранить тест', 'save_test')],
  [Markup.button.callback('❌ Остановить создание теста', 'stop_test_creation')],
]);

export const cancelKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('❌ Остановить создание теста', 'stop_test_creation')],
]);
