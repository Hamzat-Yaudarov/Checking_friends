import { Context } from 'telegraf';
import { getUserByTelegramId } from '../models/User';
import { getUserTests, getTestWithQuestions, deleteTest } from '../models/Test';
import { mainMenuKeyboard } from '../utils/keyboards';
import * as messages from '../utils/messages';
import * as testUtils from '../utils/test-utilities';

export async function viewMyTestsCallback(ctx: Context): Promise<void> {
  try {
    const from = ctx.from;
    if (!from) return;

    const user = await getUserByTelegramId(BigInt(from.id));
    if (!user) {
      await ctx.reply('❌ Пользователь не найден');
      return;
    }

    const tests = await getUserTests(user.id);
    if (tests.length === 0) {
      try {
        await ctx.editMessageText(
          messages.myTestsMessage(0),
          mainMenuKeyboard()
        );
      } catch {
        await ctx.reply(messages.myTestsMessage(0), mainMenuKeyboard());
      }
      return;
    }

    // Create a message with all tests
    let testsList = '📋 *Ваши тесты*\n━━━━━━━━━━━━━━━\n\n';
    tests.forEach((test, index) => {
      testsList += `${index + 1}. Test ID: ${test.id}\n`;
      testsList += `   Создан: ${new Date(test.created_at).toLocaleDateString('ru-RU')}\n\n`;
    });

    const keyboard = testUtils.testListKeyboard(
      await Promise.all(tests.map(t => getTestWithQuestions(t.id).then(qt => qt!)))
    );

    try {
      await ctx.editMessageText(testsList, keyboard);
    } catch {
      await ctx.reply(testsList, keyboard);
    }
  } catch (error) {
    console.error('Error in viewMyTestsCallback:', error);
    await ctx.reply('❌ Произошла ошибка');
  }
}

export async function viewTestCallback(ctx: Context): Promise<void> {
  try {
    // Extract test ID from callback data
    const query = ctx.callbackQuery as any;
    const callbackData = query?.data;
    if (!callbackData) return;

    const testIdStr = callbackData.replace('view_test_', '');
    const testId = parseInt(testIdStr, 10);

    if (isNaN(testId)) {
      await ctx.reply('❌ Неверный ID теста');
      return;
    }

    const test = await getTestWithQuestions(testId);
    if (!test) {
      await ctx.reply('❌ Тест не найден');
      return;
    }

    const testDetails = testUtils.formatTestDetails(test);
    const keyboard = testUtils.testDetailKeyboard(testId);

    try {
      await ctx.editMessageText(testDetails, keyboard);
    } catch {
      await ctx.reply(testDetails, keyboard);
    }
  } catch (error) {
    console.error('Error in viewTestCallback:', error);
    await ctx.reply('❌ Произошла ошибка при просмотре теста');
  }
}

export async function deleteTestCallback(ctx: Context): Promise<void> {
  try {
    const from = ctx.from;
    if (!from) return;

    // Extract test ID from callback data
    const query = ctx.callbackQuery as any;
    const callbackData = query?.data;
    if (!callbackData) return;

    const testIdStr = callbackData.replace('delete_test_', '');
    const testId = parseInt(testIdStr, 10);

    if (isNaN(testId)) {
      await ctx.reply('❌ Неверный ID теста');
      return;
    }

    // Verify user owns the test
    const test = await getTestWithQuestions(testId);
    if (!test) {
      await ctx.reply('❌ Тест не найден');
      return;
    }

    const user = await getUserByTelegramId(BigInt(from.id));
    if (!user || test.user_id !== user.id) {
      await ctx.reply('❌ У вас нет прав на удаление этого теста');
      return;
    }

    // Delete the test
    await deleteTest(testId);

    await ctx.reply('✅ Тест успешно удалё��', mainMenuKeyboard());
  } catch (error) {
    console.error('Error in deleteTestCallback:', error);
    await ctx.reply('❌ Произошла ошибка при удалении теста');
  }
}

export async function shareTestCallback(ctx: Context): Promise<void> {
  try {
    const from = ctx.from;
    if (!from) return;

    // Extract test ID from callback data
    const query = ctx.callbackQuery as any;
    const callbackData = query?.data;
    if (!callbackData) return;

    const testIdStr = callbackData.replace('share_test_', '');
    const testId = parseInt(testIdStr, 10);

    if (isNaN(testId)) {
      await ctx.reply('❌ Неверный ID теста');
      return;
    }

    const test = await getTestWithQuestions(testId);
    if (!test) {
      await ctx.reply('❌ Тест не найден');
      return;
    }

    const user = await getUserByTelegramId(BigInt(from.id));
    if (!user || test.user_id !== user.id) {
      await ctx.reply('❌ Вы не можете поделиться этим тестом');
      return;
    }

    // Generate share link
    const shareLink = testUtils.generateTestShareLink(testId, user.id);

    const message = `🔗 *Ссылка для поделения тестом*\n\n${shareLink}\n\nПошлите эту ссылку своему другу, чтобы он прошел ваш тест!`;

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📋 Вернуться к тестам',
              callback_data: 'back_to_tests',
            },
          ],
        ],
      },
    });
  } catch (error) {
    console.error('Error in shareTestCallback:', error);
    await ctx.reply('❌ Произошла ошибка при генерации ссылки');
  }
}

export async function backToTestsCallback(ctx: Context): Promise<void> {
  try {
    const from = ctx.from;
    if (!from) return;

    const user = await getUserByTelegramId(BigInt(from.id));
    if (!user) {
      await ctx.reply('❌ Пользователь не найден');
      return;
    }

    const tests = await getUserTests(user.id);
    if (tests.length === 0) {
      try {
        await ctx.editMessageText(
          messages.myTestsMessage(0),
          mainMenuKeyboard()
        );
      } catch {
        await ctx.reply(messages.myTestsMessage(0), mainMenuKeyboard());
      }
      return;
    }

    let testsList = '📋 *Ваши тесты*\n━━━━━━━━━━━━━━━\n\n';
    tests.forEach((test, index) => {
      testsList += `${index + 1}. Test ID: ${test.id}\n`;
      testsList += `   Создан: ${new Date(test.created_at).toLocaleDateString('ru-RU')}\n\n`;
    });

    const keyboard = testUtils.testListKeyboard(
      await Promise.all(tests.map(t => getTestWithQuestions(t.id).then(qt => qt!)))
    );

    try {
      await ctx.editMessageText(testsList, keyboard);
    } catch {
      await ctx.reply(testsList, keyboard);
    }
  } catch (error) {
    console.error('Error in backToTestsCallback:', error);
    await ctx.reply('❌ Произошла ошибка');
  }
}

export async function backToMenuCallback(ctx: Context): Promise<void> {
  try {
    await ctx.reply(
      messages.startMessage(),
      mainMenuKeyboard()
    );
  } catch (error) {
    console.error('Error in backToMenuCallback:', error);
    await ctx.reply('❌ Произошла ошибка');
  }
}
