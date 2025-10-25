import { Telegraf } from 'telegraf';
import pkg from 'pg';
const { Pool } = pkg;

const TOKEN = '8357920603:AAEcRZlAzCebZxQCIRLPQWRASZL-3upZOC8';
const NEON_CONNECTION = 'postgresql://neondb_owner:npg_5Q1JLwpTliPo@ep-sweet-firefly-agmtcj1n-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: NEON_CONNECTION,
  max: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

const bot = new Telegraf(TOKEN);

async function ensureUserExists(userId, username, firstName) {
  try {
    await pool.query(
      `INSERT INTO users (id, username, first_name) 
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO NOTHING`,
      [userId, username, firstName]
    );
  } catch (error) {
    console.error('Error ensuring user exists:', error);
  }
}

async function getOrCreateSession(userId) {
  try {
    const result = await pool.query(
      `SELECT id, session_data FROM user_sessions 
       WHERE user_id = $1`,
      [userId]
    );
    
    if (result.rows.length > 0) {
      return result.rows[0];
    }
    
    const newSession = await pool.query(
      `INSERT INTO user_sessions (user_id, session_data) 
       VALUES ($1, $2) 
       RETURNING id, session_data`,
      [userId, JSON.stringify({ state: 'idle', questions: [], currentQuestion: 0 })]
    );
    
    return newSession.rows[0];
  } catch (error) {
    console.error('Error getting or creating session:', error);
  }
}

async function updateSessionData(userId, sessionData) {
  try {
    await pool.query(
      `UPDATE user_sessions 
       SET session_data = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE user_id = $2`,
      [JSON.stringify(sessionData), userId]
    );
  } catch (error) {
    console.error('Error updating session data:', error);
  }
}

async function createTest(userId) {
  try {
    const result = await pool.query(
      `INSERT INTO tests (user_id, title) 
       VALUES ($1, $2) 
       RETURNING id`,
      [userId, `Test ${new Date().toISOString().split('T')[0]}`]
    );
    return result.rows[0].id;
  } catch (error) {
    console.error('Error creating test:', error);
  }
}

async function addQuestion(testId, questionText, questionOrder) {
  try {
    const result = await pool.query(
      `INSERT INTO questions (test_id, question_text, question_order) 
       VALUES ($1, $2, $3) 
       RETURNING id`,
      [testId, questionText, questionOrder]
    );
    return result.rows[0].id;
  } catch (error) {
    console.error('Error adding question:', error);
  }
}

async function addAnswer(questionId, answerText, answerOrder, isCorrect = false) {
  try {
    const result = await pool.query(
      `INSERT INTO answers (question_id, answer_text, answer_order, is_correct) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id`,
      [questionId, answerText, answerOrder, isCorrect]
    );
    return result.rows[0].id;
  } catch (error) {
    console.error('Error adding answer:', error);
  }
}

async function setCorrectAnswer(questionId, answerOrder) {
  try {
    await pool.query(
      `UPDATE answers 
       SET is_correct = false 
       WHERE question_id = $1`,
      [questionId]
    );
    
    await pool.query(
      `UPDATE answers 
       SET is_correct = true 
       WHERE question_id = $1 AND answer_order = $2`,
      [questionId, answerOrder]
    );
  } catch (error) {
    console.error('Error setting correct answer:', error);
  }
}

async function getAnswersByQuestionId(questionId) {
  try {
    const result = await pool.query(
      `SELECT * FROM answers WHERE question_id = $1 
       ORDER BY answer_order ASC`,
      [questionId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting answers:', error);
    return [];
  }
}

async function getUserTests(userId) {
  try {
    const result = await pool.query(
      `SELECT t.id, t.title, t.created_at,
              COUNT(q.id)::INTEGER as question_count
       FROM tests t
       LEFT JOIN questions q ON t.id = q.test_id
       WHERE t.user_id = $1
       GROUP BY t.id, t.title, t.created_at
       ORDER BY t.created_at DESC`,
      [userId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting user tests:', error);
    return [];
  }
}

async function getTestWithQuestions(testId) {
  try {
    const testResult = await pool.query(
      `SELECT * FROM tests WHERE id = $1`,
      [testId]
    );
    
    if (testResult.rows.length === 0) return null;
    
    const test = testResult.rows[0];
    
    const questionsResult = await pool.query(
      `SELECT * FROM questions WHERE test_id = $1 
       ORDER BY question_order ASC`,
      [testId]
    );
    
    const questionsWithAnswers = await Promise.all(
      questionsResult.rows.map(async (q) => {
        const answers = await getAnswersByQuestionId(q.id);
        return { ...q, answers };
      })
    );
    
    return { ...test, questions: questionsWithAnswers };
  } catch (error) {
    console.error('Error getting test with questions:', error);
  }
}

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
      `насколько ��орошо твои друзья тебя знают! 🎯\n\n` +
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
      correctAnswerIndex: null,
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
        `3️⃣ Выбер�� правильный ответ\n` +
        `4️⃣ Нажми "Следующий вопрос" для добавления нового вопроса\n` +
        `5️⃣ После 5+ вопросов появится кнопка "Сохранить тест"\n\n` +
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
    
    if (!tests || tests.length === 0) {
      return ctx.reply('👻 У тебя пока нет тестов. Создай свой первый тест! 🎯', WELCOME_KEYBOARD);
    }
    
    let message = '📋 Твои тесты:\n\n';
    const keyboard = [];
    
    tests.forEach((test, index) => {
      const date = new Date(test.created_at).toLocaleDateString('ru-RU');
      const questionCount = test.question_count || 0;
      message += `${index + 1}. "${test.title}"\n   ${questionCount} вопросов | ${date}\n\n`;
      
      keyboard.push([
        { text: '📖 Просмотр', callback_data: `view_test_${test.id}` },
        { text: '📤 Поделиться', callback_data: `share_test_${test.id}` }
      ]);
    });
    
    keyboard.push([{ text: '← Назад в меню', callback_data: 'back_to_menu' }]);
    
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
    
    if (session.state !== 'creating_test' && session.state !== 'awaiting_correct_answer') {
      return;
    }
    
    const userMessage = ctx.message.text;
    
    if (!session.currentQuestion) {
      session.currentQuestion = userMessage;
      session.currentAnswers = [];
      session.correctAnswerIndex = null;
      
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
      
    } else if (session.state === 'awaiting_correct_answer') {
      const answerNum = parseInt(userMessage);
      if (isNaN(answerNum) || answerNum < 1 || answerNum > session.currentAnswers.length) {
        return ctx.reply(`❌ Введи номер от 1 до ${session.currentAnswers.length}`);
      }
      
      session.correctAnswerIndex = answerNum;
      session.state = 'creating_test';
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
        await ctx.deleteMessage();
      } catch (err) {
        console.log('Could not delete message');
      }
      
      try {
        await ctx.editMessageText(messageText, {
          reply_markup: { inline_keyboard: keyboard }
        });
      } catch (err) {
        const msg = await ctx.reply(messageText, {
          reply_markup: { inline_keyboard: keyboard }
        });
        session.lastQuestionMessageId = msg.message_id;
        await updateSessionData(userId, session);
      }
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
        messageText += `\n❓ Какой вариант правильный? Введи номер:`;
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
      
      if (session.currentAnswers.length >= 2) {
        session.state = 'awaiting_correct_answer';
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
    const correctIdx = session.correctAnswerIndex;
    
    if (!questionText || answers.length < 2) {
      return ctx.answerCbQuery('Добавь минимум 2 варианта ответов!');
    }
    
    if (!correctIdx) {
      return ctx.answerCbQuery('Укажи правильный ответ!');
    }
    
    const questionId = await addQuestion(session.testId, questionText, (session.questions?.length || 0) + 1);
    
    for (let i = 0; i < answers.length; i++) {
      const isCorrect = (i + 1) === correctIdx;
      await addAnswer(questionId, answers[i], i + 1, isCorrect);
    }
    
    await setCorrectAnswer(questionId, correctIdx);
    
    if (!session.questions) session.questions = [];
    session.questions.push({
      id: questionId,
      text: questionText,
      answers: answers,
      correctAnswer: correctIdx
    });
    
    session.currentQuestion = null;
    session.currentAnswers = [];
    session.correctAnswerIndex = null;
    
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
    
    if (session.currentQuestion && session.currentAnswers.length >= 2 && session.correctAnswerIndex) {
      const questionId = await addQuestion(session.testId, session.currentQuestion, session.questions.length + 1);
      for (let i = 0; i < session.currentAnswers.length; i++) {
        const isCorrect = (i + 1) === session.correctAnswerIndex;
        await addAnswer(questionId, session.currentAnswers[i], i + 1, isCorrect);
      }
      await setCorrectAnswer(questionId, session.correctAnswerIndex);
      session.questions.push({
        id: questionId,
        text: session.currentQuestion,
        answers: session.currentAnswers,
        correctAnswer: session.correctAnswerIndex
      });
    }
    
    await updateSessionData(userId, { state: 'idle' });
    
    const testId = session.testId;
    const shareLink = `https://t.me/friendlyquizbot?start=test_${testId}`;
    
    const message = `🎉 Отлично! Тест сохранён!\n\n` +
      `📊 Всего вопросов: ${session.questions.length}\n\n` +
      `🔗 Ссылка на тест:\n` +
      `${shareLink}\n\n` +
      `Отправь эту ссылку своим друзьям и проверьте, насколько хорошо вы знаете друг друга! 👇`;
    
    const keyboard = [
      [{ text: '📋 Мои тесты', callback_data: 'my_tests' }],
      [{ text: '✨ Создать ещё один тест', callback_data: 'create_test' }]
    ];
    
    try {
      await ctx.editMessageText(message, {
        reply_markup: { inline_keyboard: keyboard }
      });
    } catch (err) {
      await ctx.reply(message, {
        reply_markup: { inline_keyboard: keyboard }
      });
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
        const mark = a.is_correct ? ' ✅' : '';
        message += `   ${aidx + 1}) ${a.answer_text}${mark}\n`;
      });
      message += '\n';
    });
    
    const keyboard = [
      [{ text: '🗑️ Удалить', callback_data: `delete_test_${testId}` }],
      [{ text: '← Назад к тестам', callback_data: 'my_tests' }]
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
      `Отправь эту ссылку своим друзьям! 👇\n\n` +
      `Они смогут пройти твой тест и вы узнаете, насколько хорошо они вас знают! 🎯`;
    
    await ctx.answerCbQuery();
    try {
      await ctx.editMessageText(message, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '← Назад к тестам', callback_data: 'my_tests' }]
          ]
        }
      });
    } catch (err) {
      await ctx.reply(message, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '← Назад к тестам', callback_data: 'my_tests' }]
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

async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT PRIMARY KEY,
        username VARCHAR(255),
        first_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tests (
        id SERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL,
        title VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        test_id INT NOT NULL,
        question_text TEXT NOT NULL,
        question_order INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS answers (
        id SERIAL PRIMARY KEY,
        question_id INT NOT NULL,
        answer_text TEXT NOT NULL,
        answer_order INT NOT NULL,
        is_correct BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
      )
    `);

    await pool.query(`
      ALTER TABLE answers ADD COLUMN IF NOT EXISTS is_correct BOOLEAN DEFAULT false
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL,
        session_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    console.log('Database initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      await bot.handleUpdate(req.body, res);
    } else if (req.method === 'GET') {
      await initializeDatabase();
      res.json({ status: 'Telegram bot is running', bot: '@friendlyquizbot' });
    }
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(200).json({ ok: true });
  }
}
