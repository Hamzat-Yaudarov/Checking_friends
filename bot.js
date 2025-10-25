import { Telegraf } from 'telegraf';
import {
  ensureUserExists,
  getOrCreateSession,
  updateSessionData,
  createTest,
  addQuestion,
  addAnswer,
  getQuestionById,
  getAnswersByQuestionId,
  getUserTests,
  getTestWithQuestions
} from './database-service.js';

const TOKEN = '8357920603:AAEcRZlAzCebZxQCIRLPQWRASZL-3upZOC8';
const bot = new Telegraf(TOKEN);

const WELCOME_KEYBOARD = {
  reply_markup: {
    inline_keyboard: [
      [{ text: '✨ Создать тест ✨', callback_data: 'create_test' }],
      [{ text: '📋 Мои тесты', callback_data: 'my_tests' }]
    ]
  }
};

const STOP_BUTTON = {
  reply_markup: {
    inline_keyboard: [
      [{ text: '🛑 Остановить создание теста', callback_data: 'stop_creation' }]
    ]
  }
};

bot.start(async (ctx) => {
  try {
    const user = ctx.from;
    await ensureUserExists(user.id, user.username, user.first_name);
    
    const message = `✨ Привет, ${user.first_name}! ✨\n\n` +
      `Добро пожаловать в "Проверка дружбы"! 👋\n\n` +
      `Здесь ты сможешь создать свой уникальный тест, чтобы узнать, ` +
      `насколько хорошо твои друзья тебя знают! 🎯\n\n` +
      `Создавай вопросы, добавляй ответы и получай невероятные ` +
      `ДОСТИЖЕНИЯ ДРУЖБЫ! 🏆\n\n` +
      `Начни прямо сейчас! ⤵️`;
    
    await ctx.reply(message, WELCOME_KEYBOARD);
  } catch (error) {
    console.error('Start command error:', error);
    await ctx.reply('Произошла ошибка при инициализации. Попробуй ещё раз.');
  }
});

bot.action('create_test', async (ctx) => {
  try {
    const userId = ctx.from.id;
    const testId = await createTest(userId);
    
    const session = {
      state: 'creating_test',
      testId: testId,
      questions: [],
      currentQuestionIndex: -1,
      currentQuestion: null,
      currentAnswers: [],
      lastMessageId: null,
      lastQuestionMessageId: null
    };
    
    await updateSessionData(userId, session);
    await ctx.answerCbQuery();
    
    try {
      await ctx.editMessageText(
        `📝 Создание теста\n\n` +
        `Инструкции:\n` +
        `1️⃣ Введи вопрос\n` +
        `2️⃣ Добавь минимум 2 варианта ответов\n` +
        `3️⃣ Нажми "Следующий вопрос" для добавления нового вопроса\n` +
        `4️⃣ После 5+ вопросов появится кнопка "Сохранить тест"\n\n` +
        `Приступим! Введи первый вопрос:`,
        { reply_markup: { inline_keyboard: [[{ text: '🛑 Остановить', callback_data: 'stop_creation' }]] } }
      );
    } catch (err) {
      await ctx.reply(
        `📝 Создание теста\n\n` +
        `Введи первый вопрос:`,
        STOP_BUTTON
      );
    }
  } catch (error) {
    console.error('Create test error:', error);
    await ctx.answerCbQuery('Ошибка при создании теста');
  }
});

bot.action('my_tests', async (ctx) => {
  try {
    const userId = ctx.from.id;
    const tests = await getUserTests(userId);
    
    await ctx.answerCbQuery();
    
    if (tests.length === 0) {
      return ctx.reply('У тебя пока нет тест��в. Создай свой первый тест! 🎯');
    }
    
    let message = '📋 Твои тесты:\n\n';
    const keyboard = [];
    
    tests.forEach((test, index) => {
      const date = new Date(test.created_at).toLocaleDateString('ru-RU');
      message += `${index + 1}. "${test.title}"\n   ${test.question_count} вопросов | ${date}\n\n`;
      
      keyboard.push([
        { text: `Просмотр #${index + 1}`, callback_data: `view_test_${test.id}` },
        { text: '📤 Поделиться', callback_data: `share_test_${test.id}` }
      ]);
    });
    
    keyboard.push([{ text: '← Назад', callback_data: 'back_to_menu' }]);
    
    try {
      await ctx.editMessageText(message, {
        reply_markup: { inline_keyboard: keyboard }
      });
    } catch (err) {
      await ctx.reply(message, {
        reply_markup: { inline_keyboard: keyboard }
      });
    }
  } catch (error) {
    console.error('My tests error:', error);
    await ctx.answerCbQuery('Ошибка при загрузке тестов');
  }
});

bot.action('back_to_menu', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    const message = `✨ Привет! ✨\n\n` +
      `Что ты хочешь сделать?`;
    
    try {
      await ctx.editMessageText(message, WELCOME_KEYBOARD);
    } catch (err) {
      await ctx.reply(message, WELCOME_KEYBOARD);
    }
  } catch (error) {
    console.error('Back to menu error:', error);
  }
});

bot.action('stop_creation', async (ctx) => {
  try {
    const userId = ctx.from.id;
    await updateSessionData(userId, { state: 'idle' });
    await ctx.answerCbQuery();
    
    try {
      await ctx.editMessageText(
        `Создание теста отменено. Давай создадим новый! 🎯`,
        WELCOME_KEYBOARD
      );
    } catch (err) {
      await ctx.reply(`Создание теста отменено.`, WELCOME_KEYBOARD);
    }
  } catch (error) {
    console.error('Stop creation error:', error);
  }
});

bot.on('text', async (ctx) => {
  try {
    const userId = ctx.from.id;
    
    const sessionResult = await getOrCreateSession(userId);
    const session = sessionResult.session_data || { state: 'idle' };
    
    if (session.state !== 'creating_test') {
      return;
    }
    
    const userMessage = ctx.message.text;
    
    if (!session.currentQuestion) {
      session.currentQuestion = userMessage;
      session.currentAnswers = [];
      
      await updateSessionData(userId, session);
      
      try {
        await ctx.deleteMessage();
      } catch (err) {
        console.log('Could not delete message');
      }
      
      const questionNum = (session.questions?.length || 0) + 1;
      const messageText = `❓ Вопрос ${questionNum}: ${userMessage}\n\n` +
        `Добавь варианты ответов.\n` +
        `Формат: Ответ: (текст) или несколько сразу:\n` +
        `Ответ: Вариант 1\n` +
        `Ответ: Вариант 2\n` +
        `Ответ: Вариант 3`;
      
      const replyMsg = await ctx.reply(messageText, STOP_BUTTON);
      session.lastQuestionMessageId = replyMsg.message_id;
      await updateSessionData(userId, session);
      
    } else {
      const answerLines = userMessage.split('\n')
        .map(line => line.replace(/^Ответ:\s*/i, '').trim())
        .filter(line => line.length > 0);
      
      session.currentAnswers.push(...answerLines);
      
      let messageText = `❓ Вопрос ${(session.questions?.length || 0) + 1}: ${session.currentQuestion}\n\n` +
        `Варианты ответов:\n`;
      
      session.currentAnswers.forEach((answer, index) => {
        messageText += `${index + 1}. ${answer}\n`;
      });
      
      const keyboard = [];
      if (session.currentAnswers.length >= 2) {
        keyboard.push([{ text: '➕ Следующий вопрос', callback_data: 'next_question' }]);
      }
      keyboard.push([{ text: '🛑 Остановить', callback_data: 'stop_creation' }]);
      
      await updateSessionData(userId, session);
      
      try {
        await ctx.deleteMessage();
      } catch (err) {
        console.log('Could not delete message');
      }
      
      if (session.lastQuestionMessageId) {
        try {
          await ctx.telegram.editMessageText(
            ctx.chat.id,
            session.lastQuestionMessageId,
            null,
            messageText,
            { reply_markup: { inline_keyboard: keyboard } }
          );
        } catch (err) {
          const msg = await ctx.reply(messageText, {
            reply_markup: { inline_keyboard: keyboard }
          });
          session.lastQuestionMessageId = msg.message_id;
          await updateSessionData(userId, session);
        }
      } else {
        const msg = await ctx.reply(messageText, {
          reply_markup: { inline_keyboard: keyboard }
        });
        session.lastQuestionMessageId = msg.message_id;
        await updateSessionData(userId, session);
      }
    }
  } catch (error) {
    console.error('Text handler error:', error);
  }
});

bot.action('next_question', async (ctx) => {
  try {
    const userId = ctx.from.id;
    
    const sessionResult = await getOrCreateSession(userId);
    let session = sessionResult.session_data || { state: 'idle' };
    
    if (session.state !== 'creating_test') return ctx.answerCbQuery();
    
    const questionText = session.currentQuestion;
    const answers = session.currentAnswers || [];
    
    if (!questionText || answers.length < 2) {
      return ctx.answerCbQuery('Добавь минимум 2 варианта ответов!');
    }
    
    const questionId = await addQuestion(session.testId, questionText, (session.questions?.length || 0) + 1);
    
    for (let i = 0; i < answers.length; i++) {
      await addAnswer(questionId, answers[i], i + 1);
    }
    
    if (!session.questions) session.questions = [];
    session.questions.push({
      id: questionId,
      text: questionText,
      answers: answers
    });
    
    session.currentQuestion = null;
    session.currentAnswers = [];
    
    const questionNum = session.questions.length + 1;
    
    const keyboard = [];
    if (session.questions.length >= 5) {
      keyboard.push([{ text: '✅ Сохранить тест', callback_data: 'save_test' }]);
    }
    keyboard.push([{ text: '🛑 Остановить', callback_data: 'stop_creation' }]);
    
    const messageText = `✅ Вопрос ${session.questions.length} сохранён!\n\n` +
      `Введи вопрос #${questionNum}:`;
    
    await updateSessionData(userId, session);
    
    try {
      await ctx.editMessageText(messageText, {
        reply_markup: { inline_keyboard: keyboard }
      });
    } catch (err) {
      await ctx.reply(messageText, {
        reply_markup: { inline_keyboard: keyboard }
      });
    }
    
    await ctx.answerCbQuery('✅ Вопрос сохранён!');
  } catch (error) {
    console.error('Next question error:', error);
    await ctx.answerCbQuery('Ошибка при сохранении вопроса');
  }
});

bot.action('save_test', async (ctx) => {
  try {
    const userId = ctx.from.id;
    
    const sessionResult = await getOrCreateSession(userId);
    const session = sessionResult.session_data || { state: 'idle' };
    
    if (session.state !== 'creating_test' || !session.questions || session.questions.length < 5) {
      return ctx.answerCbQuery('Добавь минимум 5 вопросов!');
    }
    
    if (session.currentQuestion && session.currentAnswers.length >= 2) {
      const questionId = await addQuestion(session.testId, session.currentQuestion, session.questions.length + 1);
      for (let i = 0; i < session.currentAnswers.length; i++) {
        await addAnswer(questionId, session.currentAnswers[i], i + 1);
      }
      session.questions.push({
        id: questionId,
        text: session.currentQuestion,
        answers: session.currentAnswers
      });
    }
    
    await updateSessionData(userId, { state: 'idle' });
    
    const message = `🎉 Отлично! Тест сохранён!\n\n` +
      `📊 Всего вопросов: ${session.questions.length}\n\n` +
      `Поделись тестом с друзьями! 👇`;
    
    try {
      await ctx.editMessageText(message, WELCOME_KEYBOARD);
    } catch (err) {
      await ctx.reply(message, WELCOME_KEYBOARD);
    }
    
    await ctx.answerCbQuery('✅ Тест сохранён!');
  } catch (error) {
    console.error('Save test error:', error);
    await ctx.answerCbQuery('Ошибка при сохранении теста');
  }
});

bot.action(/^view_test_(\d+)$/, async (ctx) => {
  try {
    const testId = parseInt(ctx.match[1]);
    const test = await getTestWithQuestions(testId);
    
    if (!test) {
      return ctx.answerCbQuery('Тест не найден');
    }
    
    let message = `📋 "${test.title}"\n\n`;
    message += `📊 Вопросов: ${test.questions.length}\n\n`;
    
    test.questions.forEach((q, idx) => {
      message += `${idx + 1}. ${q.question_text}\n`;
      q.answers.forEach((a, aidx) => {
        message += `   ${aidx + 1}) ${a.answer_text}\n`;
      });
      message += '\n';
    });
    
    const keyboard = [
      [{ text: '🗑️ Удалить', callback_data: `delete_test_${testId}` }],
      [{ text: '← Назад', callback_data: 'my_tests' }]
    ];
    
    await ctx.answerCbQuery();
    try {
      await ctx.editMessageText(message, {
        reply_markup: { inline_keyboard: keyboard }
      });
    } catch (err) {
      await ctx.reply(message, {
        reply_markup: { inline_keyboard: keyboard }
      });
    }
  } catch (error) {
    console.error('View test error:', error);
    await ctx.answerCbQuery('Ошибка при загрузке теста');
  }
});

bot.action(/^share_test_(\d+)$/, async (ctx) => {
  try {
    const testId = ctx.match[1];
    const shareLink = `https://t.me/friendlyquizbot?start=test_${testId}`;
    
    const message = `🔗 Ссылка на тест:\n${shareLink}\n\n` +
      `Отправь эту ссылку своим друзьям! 👇`;
    
    await ctx.answerCbQuery();
    try {
      await ctx.editMessageText(message, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '← Назад', callback_data: 'my_tests' }]
          ]
        }
      });
    } catch (err) {
      await ctx.reply(message, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '← Назад', callback_data: 'my_tests' }]
          ]
        }
      });
    }
  } catch (error) {
    console.error('Share test error:', error);
    await ctx.answerCbQuery('Ошибка при генерации ссылки');
  }
});

bot.action(/^delete_test_(\d+)$/, async (ctx) => {
  try {
    const testId = parseInt(ctx.match[1]);
    
    const message = `⚠️ Вы уверены? Это действие нельзя отменить.`;
    
    const keyboard = [
      [
        { text: '❌ Отменить', callback_data: `view_test_${testId}` },
        { text: '✅ Да, удалить', callback_data: `confirm_delete_${testId}` }
      ]
    ];
    
    await ctx.answerCbQuery();
    try {
      await ctx.editMessageText(message, {
        reply_markup: { inline_keyboard: keyboard }
      });
    } catch (err) {
      await ctx.reply(message, {
        reply_markup: { inline_keyboard: keyboard }
      });
    }
  } catch (error) {
    console.error('Delete test confirmation error:', error);
  }
});

bot.action(/^confirm_delete_(\d+)$/, async (ctx) => {
  try {
    const testId = parseInt(ctx.match[1]);
    
    console.log('Deleting test:', testId);
    
    await ctx.answerCbQuery('✅ Тест удалён');
    
    try {
      await ctx.editMessageText(
        `✅ Тест успешно удалён!`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '← К тестам', callback_data: 'my_tests' }]
            ]
          }
        }
      );
    } catch (err) {
      await ctx.reply(`✅ Тест успешно удалён!`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '← К тестам', callback_data: 'my_tests' }]
          ]
        }
      });
    }
  } catch (error) {
    console.error('Confirm delete error:', error);
    await ctx.answerCbQuery('Ошибка при удалении теста');
  }
});

export default bot;
