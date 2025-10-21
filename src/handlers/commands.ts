import { Context } from 'telegraf';
import { findOrCreateUser, getUserByTelegramId } from '../models/User';
import { getUserTests, createTest } from '../models/Test';
import { getSession, setSession, clearSession } from '../models/Session';
import { mainMenuKeyboard, stopCreationKeyboard } from '../utils/keyboards';
import * as messages from '../utils/messages';

export async function startCommand(ctx: Context): Promise<void> {
  try {
    const from = ctx.from;
    if (!from) return;

    // Create or find user
    await findOrCreateUser(
      BigInt(from.id),
      from.username,
      from.first_name,
      from.last_name
    );

    // Clear any previous session
    await clearSession(BigInt(from.id));

    await ctx.reply(messages.startMessage(), mainMenuKeyboard());
  } catch (error) {
    console.error('Error in startCommand:', error);
    await ctx.reply('❌ Произошла ошибка. Попробуйте позже.');
  }
}

export async function createTestCallback(ctx: Context): Promise<void> {
  try {
    const from = ctx.from;
    if (!from) return;

    const telegramId = BigInt(from.id);
    const user = await getUserByTelegramId(telegramId);
    if (!user) {
      await ctx.reply('❌ Пользователь не найден');
      return;
    }

    // Create new test
    const test = await createTest(user.id, 'Новый тест');

    // Set session state
    await setSession(telegramId, 'creating_test', {
      testId: test.id,
      currentQuestion: 0,
      currentAnswers: [],
    });

    // Edit the original message with instructions
    const instructionsText = messages.createTestInstructions();
    try {
      await ctx.editMessageText(instructionsText);
    } catch {
      await ctx.reply(instructionsText);
    }

    // Send the first question prompt
    await ctx.reply(
      messages.firstQuestionPrompt(),
      stopCreationKeyboard()
    );
  } catch (error) {
    console.error('Error in createTestCallback:', error);
    await ctx.reply('❌ Произошла ошибка при создании теста');
  }
}

export async function myTestsCallback(ctx: Context): Promise<void> {
  try {
    const from = ctx.from;
    if (!from) return;

    const user = await getUserByTelegramId(BigInt(from.id));
    if (!user) {
      await ctx.reply('❌ Пользователь не найден');
      return;
    }

    const tests = await getUserTests(user.id);
    const message = messages.myTestsMessage(tests.length);

    try {
      await ctx.editMessageText(message, mainMenuKeyboard());
    } catch {
      await ctx.reply(message, mainMenuKeyboard());
    }
  } catch (error) {
    console.error('Error in myTestsCallback:', error);
    await ctx.reply('❌ Произошла ошибка');
  }
}

export async function stopCreationCallback(ctx: Context): Promise<void> {
  try {
    const from = ctx.from;
    if (!from) return;

    await clearSession(BigInt(from.id));
    await ctx.reply(
      messages.startMessage(),
      mainMenuKeyboard()
    );
  } catch (error) {
    console.error('Error in stopCreationCallback:', error);
    await ctx.reply('❌ Произошла ошибка');
  }
}
