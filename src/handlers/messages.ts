import { Context } from 'telegraf';
import { getSession, setSession } from '../models/Session';
import {
  addQuestion,
  addAnswer,
  getLastQuestion,
  getAnswersForQuestion,
  getTestWithQuestions,
  getUserTests,
} from '../models/Test';
import { getUserByTelegramId } from '../models/User';
import {
  nextQuestionKeyboard,
  finishTestKeyboard,
  stopCreationKeyboard,
  mainMenuKeyboard,
} from '../utils/keyboards';
import * as messages from '../utils/messages';

export async function handleMessage(ctx: Context): Promise<void> {
  try {
    const from = ctx.from;
    if (!from || !ctx.message || !('text' in ctx.message)) {
      return;
    }

    const telegramId = BigInt(from.id);
    const text = ctx.message.text.trim();

    // Delete user's message
    try {
      await ctx.deleteMessage(ctx.message.message_id);
    } catch {
      // Ignore if message deletion fails
    }

    const session = await getSession(telegramId);
    if (!session || session.state !== 'creating_test') {
      return;
    }

    const { testId, currentQuestion } = session.data;
    if (!testId) {
      return;
    }

    const questionNumber = (currentQuestion || 0) + 1;

    // If no question entered yet, this is the question input
    if (!session.data.currentQuestionText) {
      // Save the question
      await addQuestion(testId, text, questionNumber);

      // Send message about entering answers
      const messageText = messages.answersPrompt(questionNumber, text);
      const sentMessage = await ctx.reply(messageText, stopCreationKeyboard());

      // Update session with the message ID for future edits
      await setSession(telegramId, 'creating_test', {
        testId,
        currentQuestion: questionNumber,
        currentQuestionText: text,
        currentAnswers: [],
        lastMessageId: sentMessage.message_id,
      });

      return;
    }

    // User is entering answers
    const parsedAnswers = messages.formatAnswersFromText(text);
    const existingAnswers = session.data.currentAnswers || [];
    const allAnswers = [...existingAnswers, ...parsedAnswers];

    // Save answers to database
    const lastQuestion = await getLastQuestion(testId);
    if (lastQuestion) {
      for (const answer of parsedAnswers) {
        const currentAnswers = await getAnswersForQuestion(lastQuestion.id);
        await addAnswer(lastQuestion.id, answer, currentAnswers.length + 1);
      }
    }

    // Get the current question for display
    const test = await getTestWithQuestions(testId);
    const currentQ = test?.questions.find(q => q.id === lastQuestion?.id);
    if (!currentQ) return;

    const answerTexts = currentQ.answers.map(a => a.answer_text);
    const statusMessage = messages.questionStatusMessage(
      questionNumber,
      session.data.currentQuestionText!,
      answerTexts
    );

    // Build keyboard based on answer count
    let keyboardMarkup: any = null;
    if (answerTexts.length >= 2) {
      if (questionNumber >= 5) {
        keyboardMarkup = finishTestKeyboard().reply_markup;
      } else {
        const nextKeyboard = nextQuestionKeyboard();
        keyboardMarkup = {
          inline_keyboard: [
            ...nextKeyboard.reply_markup.inline_keyboard,
            [
              {
                text: '⏹️ Остановить создание теста',
                callback_data: 'stop_creation',
              },
            ],
          ],
        };
      }
    } else {
      keyboardMarkup = stopCreationKeyboard().reply_markup;
    }

    // Edit the previous message
    if (session.data.lastMessageId) {
      try {
        await ctx.telegram.editMessageText(
          ctx.chat?.id,
          session.data.lastMessageId,
          undefined,
          statusMessage,
          { reply_markup: keyboardMarkup }
        );
      } catch (error) {
        console.error('Error editing message:', error);
      }
    }

    // Update session with new answers
    await setSession(telegramId, 'creating_test', {
      testId,
      currentQuestion: questionNumber,
      currentQuestionText: session.data.currentQuestionText,
      currentAnswers: allAnswers,
      lastMessageId: session.data.lastMessageId,
    });
  } catch (error) {
    console.error('Error in handleMessage:', error);
    await ctx.reply('❌ Произошла ошибка при обработке сообщения');
  }
}

export async function nextQuestionCallback(ctx: Context): Promise<void> {
  try {
    const from = ctx.from;
    if (!from) return;

    const telegramId = BigInt(from.id);
    const session = await getSession(telegramId);

    if (!session || !session.data.testId) {
      await ctx.reply('❌ Сессия истекла');
      return;
    }

    const currentQuestion = session.data.currentQuestion || 0;

    // Update session for next question
    await setSession(telegramId, 'creating_test', {
      testId: session.data.testId,
      currentQuestion: currentQuestion + 1,
      currentQuestionText: undefined,
      currentAnswers: [],
      lastMessageId: undefined,
    });

    const questionNumber = currentQuestion + 2;
    const prompt = `❓ Введите вопрос ${questionNumber} о себе:`;

    await ctx.reply(prompt, stopCreationKeyboard());
  } catch (error) {
    console.error('Error in nextQuestionCallback:', error);
    await ctx.reply('❌ Произошла ошибка');
  }
}

export async function saveTestCallback(ctx: Context): Promise<void> {
  try {
    const from = ctx.from;
    if (!from) return;

    const telegramId = BigInt(from.id);
    const session = await getSession(telegramId);

    if (!session || !session.data.testId) {
      await ctx.reply('❌ Сессия истекла');
      return;
    }

    // Get user info
    const user = await getUserByTelegramId(telegramId);
    if (!user) {
      await ctx.reply('❌ Пользователь не найден');
      return;
    }

    // Get user's tests
    const tests = await getUserTests(user.id);

    // Clear session
    await setSession(telegramId, 'idle', {});

    const message = messages.testSavedMessage(tests.length);

    await ctx.reply(message, mainMenuKeyboard());
  } catch (error) {
    console.error('Error in saveTestCallback:', error);
    await ctx.reply('❌ Произошла ошибка при сохранении теста');
  }
}
