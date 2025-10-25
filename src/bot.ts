import { Telegraf, Context } from 'telegraf';
import * as userService from './services/userService';

const bot = new Telegraf(process.env.BOT_TOKEN!);

interface MyContext extends Context {
  session?: any;
}

bot.start(async (ctx: MyContext) => {
  try {
    const telegramUser = ctx.from;
    if (!telegramUser) return;

    // Sync user data
    await userService.createOrUpdateUser(
      telegramUser.id,
      telegramUser.username || null,
      telegramUser.first_name || null,
      telegramUser.last_name || null
    );

    const webAppUrl = `${process.env.WEBHOOK_URL}/miniapp?user_id=${telegramUser.id}`;

    await ctx.reply(
      '🌟 **Привет! Добро пожаловать в "Проверка дружбы"!** 🌟\n\n' +
      'Тут ты сможешь:\n' +
      '✨ Создать интересный тест о себе\n' +
      '🎯 Узнать, насколько хорошо тебя знают друзья\n' +
      '🏆 Получить достижения за лучшие результаты\n' +
      '👥 Проверить знания своих друзей\n\n' +
      'Просто нажми на кнопку ниже, чтобы начать создавать свой первый тест! 👇',
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '✨ Создать тест ✨',
                web_app: {
                  url: webAppUrl,
                },
              },
            ],
          ],
        },
      }
    );
  } catch (error) {
    console.error('Error in /start command:', error);
    await ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
  }
});

bot.help(async (ctx) => {
  await ctx.reply(
    'Это бот для проверки дружбы! 🤝\n\n' +
    'Команды:\n' +
    '/start - Начать работу\n' +
    '/help - Справка'
  );
});

bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('Произошла техническая ошибка. Пожалуйста, попробуйте позже.');
});

export default bot;
