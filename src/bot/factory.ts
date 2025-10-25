import TelegramBot from 'node-telegram-bot-api';
import * as handlers from './handlers';

let botInstance: TelegramBot | null = null;

export function getBot(token: string, polling: boolean = false): TelegramBot {
  if (!botInstance) {
    botInstance = new TelegramBot(token, { polling });
    attachHandlers(botInstance);
  }
  return botInstance;
}

function attachHandlers(bot: TelegramBot) {
  // Handle messages
  bot.on('message', async (msg) => {
    try {
      const text = msg.text;

      if (text === '/start') {
        await handlers.handleStart(bot, msg);
      } else if (text === '✨ Создать тест ✨') {
        await handlers.handleCreateTestButton(bot, msg);
      } else if (text === '📚 Мои тесты') {
        await handlers.handleMyTestsButton(bot, msg);
      } else if (text === '🛑 Остановить создание теста') {
        await handlers.handleStopButton(bot, msg);
      } else {
        // Regular text input during quiz creation
        await handlers.handleQuestionInput(bot, msg);
      }
    } catch (error) {
      console.error('Message handler error:', error);
    }
  });

  // Handle callback queries (button clicks)
  bot.on('callback_query', async (query) => {
    try {
      const data = query.data;

      if (data === '➡️ Следующий вопрос') {
        await handlers.handleNextQuestion(bot, query);
      } else if (data === '💾 Сохранить тест') {
        await handlers.handleSaveTest(bot, query);
      } else if (data === '🛑 Остановить создание теста') {
        await handlers.handleStopButton(bot, {
          ...query,
          text: '🛑 Остановить создание теста',
        } as any);
      }
    } catch (error) {
      console.error('Callback query handler error:', error);
    }
  });
}
