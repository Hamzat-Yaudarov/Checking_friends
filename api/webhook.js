const TelegramBot = require('node-telegram-bot-api');
const { Pool } = require('pg');

const token = process.env.TELEGRAM_BOT_TOKEN;
let bot = null;
let handlers = null;
let sessionManager = null;
let quizService = null;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 20,
});

function getBot() {
  if (!bot) {
    bot = new TelegramBot(token);
    attachHandlers();
  }
  return bot;
}

function attachHandlers() {
  bot.on('message', async (msg) => {
    try {
      const text = msg.text;

      if (text === '/start') {
        await handleStart(msg);
      } else if (text === '✨ Создать тест ✨') {
        await handleCreateTestButton(msg);
      } else if (text === '📚 Мои тесты') {
        await handleMyTestsButton(msg);
      } else if (text === '🛑 Остановить создание теста') {
        await handleStopButton(msg);
      } else {
        await handleQuestionInput(msg);
      }
    } catch (error) {
      console.error('Message handler error:', error);
    }
  });

  bot.on('callback_query', async (query) => {
    try {
      const data = query.data;
      if (data === '➡️ Следующий вопрос') {
        await handleNextQuestion(query);
      } else if (data === '💾 Сохранить тест') {
        await handleSaveTest(query);
      } else if (data === '🛑 Остановить создание теста') {
        await handleStopButton({
          text: '🛑 Остановить создание теста',
          message_id: query.message.message_id,
          chat: query.message.chat,
          from: query.from,
        });
      }
    } catch (error) {
      console.error('Callback query handler error:', error);
    }
  });
}

// Simple in-memory session storage for this serverless function
const sessions = new Map();

function getOrCreateSession(userId, chatId) {
  if (!sessions.has(userId)) {
    sessions.set(userId, {
      user_id: userId,
      state: 'idle',
      chat_id: chatId,
      current_quiz: {
        questions: [],
        current_question_index: 0,
        current_options: [],
      },
    });
  }
  return sessions.get(userId);
}

async function handleStart(msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  try {
    await pool.query(
      `INSERT INTO users (id, username, first_name)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP`,
      [userId, msg.from.username, msg.from.first_name]
    );
  } catch (error) {
    console.error('Error saving user:', error);
  }

  getOrCreateSession(userId, chatId);

  const message = `😊 Привет! Добро пожаловать в Проверку Дружбы! 🎉

Здесь ты сможешь создать свой уникальный тест, чтобы узнать, насколько хорошо твои друзья тебя знают. Поделись тестом со своими друзьями и получай интересные ДОСТИЖЕНИЯ ДРУЖБЫ! 🏆

Создавай вопросы о себе, давай варианты ответов, и пусть твои друзья проверят свои знания о тебе. Это весело, интересно и укрепляет дружбу! 💪`;

  await bot.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    reply_markup: {
      keyboard: [
        [{ text: '✨ Создать тест ✨' }],
        [{ text: '📚 Мои тесты' }],
      ],
      resize_keyboard: true,
      one_time_keyboard: false,
    },
  });
}

async function handleCreateTestButton(msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  const session = getOrCreateSession(userId, chatId);
  session.state = 'creating_test';
  session.current_quiz = {
    questions: [],
    current_question_index: 0,
    current_options: [],
  };

  const instructions = `📝 Инструкции по созданию теста:

1️⃣ Напиши вопрос о себе
2️⃣ Добавь варианты ответов (минимум 2)
3️⃣ Продолжай добавлять вопросы
4️⃣ Сохрани тест, когда будет 5+ вопросов`;

  const response = await bot.sendMessage(chatId, instructions, {
    parse_mode: 'HTML',
    reply_markup: {
      keyboard: [[{ text: '🛑 Остановить создание теста' }]],
      resize_keyboard: true,
    },
  });

  session.message_id = response.message_id;
}

async function handleMyTestsButton(msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  try {
    const result = await pool.query(
      `SELECT id FROM quizzes WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10`,
      [userId]
    );

    const quizzes = result.rows;

    if (quizzes.length === 0) {
      await bot.sendMessage(
        chatId,
        '📚 У вас пока нет созданных тестов. Создайте свой первый тест!',
        {
          reply_markup: {
            keyboard: [[{ text: '✨ Создать тест ✨' }]],
            resize_keyboard: true,
          },
        }
      );
      return;
    }

    let message = '📚 <b>Ваши тесты:</b>\n\n';
    quizzes.forEach((quiz, idx) => {
      message += `${idx + 1}. Тест #${quiz.id}\n`;
      message += `🔗 https://t.me/${process.env.TELEGRAM_BOT_USERNAME}?start=quiz_${quiz.id}\n\n`;
    });

    await bot.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      reply_markup: {
        keyboard: [[{ text: '✨ Создать тест ✨' }]],
        resize_keyboard: true,
      },
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    await bot.sendMessage(chatId, '❌ Ошибка при загрузке тестов');
  }
}

async function handleStopButton(msg) {
  const userId = msg.from.id;
  const chatId = msg.chat.id;

  sessions.delete(userId);

  await bot.sendMessage(chatId, '❌ Создание теста отменено.', {
    reply_markup: {
      keyboard: [
        [{ text: '✨ Создать тест ✨' }],
        [{ text: '📚 Мои тесты' }],
      ],
      resize_keyboard: true,
    },
  });
}

async function handleQuestionInput(msg) {
  const userId = msg.from.id;
  const chatId = msg.chat.id;
  const text = msg.text?.trim();

  if (!text) return;

  const session = getOrCreateSession(userId, chatId);
  if (!session || session.state !== 'creating_test') return;

  if (session.current_quiz?.current_question_text) {
    // Adding options
    const optionTexts = [];
    if (text.includes('Ответ:')) {
      const lines = text.split('\n');
      lines.forEach((line) => {
        if (line.includes('Ответ:')) {
          const option = line.replace('Ответ:', '').trim();
          if (option) optionTexts.push(option);
        }
      });
    } else {
      optionTexts.push(text);
    }

    optionTexts.forEach((opt) => {
      session.current_quiz.current_options.push(opt);
    });

    // Update display
    const questions = session.current_quiz.questions || [];
    const currentOptions = session.current_quiz.current_options || [];
    const questionIndex = questions.length;
    const questionText = session.current_quiz.current_question_text;

    let messageText = `📋 Вопрос ${questionIndex + 1}: ${questionText}\n\nВарианты ответов:\n`;
    currentOptions.forEach((opt, idx) => {
      messageText += `${idx + 1} - ${opt}\n`;
    });

    const buttons = [];
    if (currentOptions.length >= 2) {
      buttons.push([{ text: '➡️ Следующий вопрос', callback_data: '➡️ Следующий вопрос' }]);
    }
    if (questions.length + 1 >= 5) {
      buttons.push([{ text: '💾 Сохранить тест', callback_data: '💾 Сохранить тест' }]);
    }
    buttons.push([{ text: '🛑 Остановить создание теста', callback_data: '🛑 Остановить создание теста' }]);

    if (session.message_id) {
      try {
        await bot.editMessageText(messageText, {
          chat_id: chatId,
          message_id: session.message_id,
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: buttons },
        });
      } catch (error) {
        console.log('Could not edit message');
      }
    }
  } else {
    // Adding new question
    session.current_quiz.current_question_text = text;

    const questionIndex = session.current_quiz.questions.length;

    const response = await bot.sendMessage(
      chatId,
      `📋 Вопрос ${questionIndex + 1}: ${text}\n\n➕ Добавьте варианты ответов (минимум 2):`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [[{ text: '🛑 Остановить создание теста' }]],
          resize_keyboard: true,
        },
      }
    );
    session.message_id = response.message_id;
  }
}

async function handleNextQuestion(query) {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const messageId = query.message.message_id;

  const session = getOrCreateSession(userId, chatId);

  // Save current question
  if (
    session.current_quiz.current_question_text &&
    session.current_quiz.current_options.length >= 2
  ) {
    session.current_quiz.questions.push({
      text: session.current_quiz.current_question_text,
      options: [...session.current_quiz.current_options],
    });
    session.current_quiz.current_question_text = undefined;
    session.current_quiz.current_options = [];
    session.current_quiz.current_question_index += 1;
  }

  const nextQuestionIndex = session.current_quiz.questions.length;

  await bot.editMessageText(
    `📌 Введите вопрос #${nextQuestionIndex + 1}:`,
    {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [[{ text: '🛑 Остановить создание теста', callback_data: '🛑 Остановить создание теста' }]],
      },
    }
  );

  await bot.answerCallbackQuery(query.id);
}

async function handleSaveTest(query) {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const messageId = query.message.message_id;

  const session = getOrCreateSession(userId, chatId);

  // Save current question if valid
  if (
    session.current_quiz.current_question_text &&
    session.current_quiz.current_options.length >= 2
  ) {
    session.current_quiz.questions.push({
      text: session.current_quiz.current_question_text,
      options: [...session.current_quiz.current_options],
    });
  }

  const questions = session.current_quiz.questions;

  if (questions.length < 5) {
    await bot.answerCallbackQuery(query.id, { text: '❌ Нужно минимум 5 вопросов' });
    return;
  }

  try {
    const quizResult = await pool.query(
      `INSERT INTO quizzes (user_id) VALUES ($1) RETURNING id`,
      [userId]
    );
    const quizId = quizResult.rows[0].id;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const questionResult = await pool.query(
        `INSERT INTO questions (quiz_id, question_text, question_order) VALUES ($1, $2, $3) RETURNING id`,
        [quizId, q.text, i]
      );
      const questionId = questionResult.rows[0].id;

      for (let j = 0; j < q.options.length; j++) {
        await pool.query(
          `INSERT INTO options (question_id, option_text, option_order) VALUES ($1, $2, $3)`,
          [questionId, q.options[j], j]
        );
      }
    }

    sessions.delete(userId);

    const successMsg = `✨ Тест успешно сохранён! ✨

ID вашего теста: ${quizId}

Ссылка для друзей: https://t.me/${process.env.TELEGRAM_BOT_USERNAME}?start=quiz_${quizId}`;

    await bot.editMessageText(successMsg, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✨ Создать тест ✨', callback_data: '✨ Создать тест ✨' },
            { text: '📚 Мои тесты', callback_data: '📚 Мои тесты' },
          ],
        ],
      },
    });

    await bot.answerCallbackQuery(query.id, { text: '✅ Тест сохранён!' });
  } catch (error) {
    console.error('Error saving quiz:', error);
    await bot.answerCallbackQuery(query.id, { text: '❌ Ошибка при сохранении теста' });
  }
}

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const bot = getBot();
      await bot.processUpdate(req.body);
      res.status(200).json({ ok: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'GET') {
    res.status(200).json({ status: 'ok' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
