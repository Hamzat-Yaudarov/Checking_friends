import { Markup } from 'telegraf';

export function mainMenuKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('✨ Создать тест ✨', 'create_test')],
    [Markup.button.callback('📋 Мои тесты', 'my_tests')],
  ]);
}

export function stopCreationKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('⏹️ Остановить создание теста', 'stop_creation')],
  ]);
}

export function nextQuestionKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('➕ Следующий вопрос', 'next_question')],
  ]);
}

export function finishTestKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('➕ Следующий вопрос', 'next_question')],
    [Markup.button.callback('💾 Сохранить тест', 'save_test')],
  ]);
}

export function removeKeyboard() {
  return Markup.removeKeyboard();
}
