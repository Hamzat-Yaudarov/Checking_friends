import TelegramBot from 'node-telegram-bot-api';
import * as sessionManager from '../utils/sessionManager';
import * as quizService from '../database/quizService';
import * as formatters from '../utils/formatters';

const STOP_BUTTON = '🛑 Остановить создание теста';
const CREATE_TEST_BUTTON = '✨ Создать тест ✨';
const MY_TESTS_BUTTON = '📚 Мои тесты';
const NEXT_QUESTION_BUTTON = '➡️ Следующий вопрос';
const SAVE_TEST_BUTTON = '💾 Сохранить тест';

export async function handleStart(bot: TelegramBot, msg: TelegramBot.Message) {
  const chatId = msg.chat.id;
  const userId = msg.from!.id;

  // Save user to database
  await quizService.createUser(userId, msg.from!.username, msg.from!.first_name);

  // Reset session to idle
  sessionManager.updateSession(userId, {
    user_id: userId,
    state: 'idle',
    chat_id: chatId,
  });

  const message = formatters.formatStartMessage();

  const opts: TelegramBot.SendMessageOptions = {
    parse_mode: 'HTML',
    reply_markup: {
      keyboard: [
        [{ text: CREATE_TEST_BUTTON }],
        [{ text: MY_TESTS_BUTTON }],
      ],
      resize_keyboard: true,
      one_time_keyboard: false,
    },
  };

  await bot.sendMessage(chatId, message, opts);
}

export async function handleCreateTestButton(bot: TelegramBot, msg: TelegramBot.Message) {
  const chatId = msg.chat.id;
  const userId = msg.from!.id;

  sessionManager.startQuizCreation(userId, chatId);

  // Edit previous message if it exists
  if (msg.message_id) {
    try {
      await bot.editMessageText(formatters.formatCreateTestInstructions(), {
        chat_id: chatId,
        message_id: msg.message_id,
        parse_mode: 'HTML',
      });
    } catch (error) {
      console.log('Could not edit message, sending new one');
    }
  }

  const opts: TelegramBot.SendMessageOptions = {
    parse_mode: 'HTML',
    reply_markup: {
      keyboard: [[{ text: STOP_BUTTON }]],
      resize_keyboard: true,
      one_time_keyboard: false,
    },
  };

  const response = await bot.sendMessage(chatId, formatters.formatQuestionPrompt(0), opts);
  sessionManager.setMessageId(userId, response.message_id);
}

export async function handleStopButton(bot: TelegramBot, msg: TelegramBot.Message) {
  const chatId = msg.chat.id;
  const userId = msg.from!.id;

  sessionManager.deleteSession(userId);

  const opts: TelegramBot.SendMessageOptions = {
    parse_mode: 'HTML',
    reply_markup: {
      keyboard: [
        [{ text: CREATE_TEST_BUTTON }],
        [{ text: MY_TESTS_BUTTON }],
      ],
      resize_keyboard: true,
      one_time_keyboard: false,
    },
  };

  await bot.sendMessage(chatId, '❌ Создание теста отменено. Возвращаемся в главное меню...', opts);
}

export async function handleMyTestsButton(bot: TelegramBot, msg: TelegramBot.Message) {
  const chatId = msg.chat.id;
  const userId = msg.from!.id;

  const quizzes = await quizService.getUserQuizzes(userId);

  if (quizzes.length === 0) {
    const opts: TelegramBot.SendMessageOptions = {
      parse_mode: 'HTML',
      reply_markup: {
        keyboard: [[{ text: CREATE_TEST_BUTTON }]],
        resize_keyboard: true,
        one_time_keyboard: false,
      },
    };
    await bot.sendMessage(chatId, '📚 У вас пока нет созданных тестов. Создайте свой первый тест!', opts);
    return;
  }

  let message = '📚 <b>Ваши тесты:</b>\n\n';
  quizzes.forEach((quiz, idx) => {
    const questionCount = quiz.questions.length;
    message += `${idx + 1}. ${quiz.title || `Тест #${quiz.id}`} (${questionCount} вопросов)\n`;
    message += `   ���� https://t.me/${process.env.TELEGRAM_BOT_USERNAME}?start=quiz_${quiz.id}\n\n`;
  });

  const opts: TelegramBot.SendMessageOptions = {
    parse_mode: 'HTML',
    reply_markup: {
      keyboard: [[{ text: CREATE_TEST_BUTTON }]],
      resize_keyboard: true,
      one_time_keyboard: false,
    },
  };

  await bot.sendMessage(chatId, message, opts);
}

export async function handleQuestionInput(bot: TelegramBot, msg: TelegramBot.Message) {
  const chatId = msg.chat.id;
  const userId = msg.from!.id;
  const text = msg.text?.trim();

  if (!text) return;

  const session = sessionManager.getSession(userId);
  if (!session || session.state !== 'creating_test') return;

  // Check if user is adding options (has current question text)
  if (session.current_quiz?.current_question_text) {
    // User is adding options
    handleOptionInput(bot, msg, text);
  } else {
    // User is adding a new question
    handleNewQuestion(bot, msg, text);
  }
}

async function handleNewQuestion(bot: TelegramBot, msg: TelegramBot.Message, questionText: string) {
  const chatId = msg.chat.id;
  const userId = msg.from!.id;

  // Save the question
  sessionManager.addQuestionToSession(userId, questionText);

  // Delete user message
  try {
    await bot.deleteMessage(chatId, msg.message_id);
  } catch (error) {
    console.log('Could not delete user message');
  }

  // Update the prompt message
  const messageId = sessionManager.getMessageId(userId);
  if (messageId) {
    const questionIndex = sessionManager.getCurrentQuestions(userId).length;
    try {
      await bot.editMessageText(
        `📋 Вопрос ${questionIndex + 1}: ${questionText}\n\n➕ Добавьте варианты ответов (минимум 2):`,
        {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: 'HTML',
        }
      );
    } catch (error) {
      console.log('Could not edit message');
    }
  }
}

async function handleOptionInput(bot: TelegramBot, msg: TelegramBot.Message, text: string) {
  const chatId = msg.chat.id;
  const userId = msg.from!.id;

  // Parse options (support both "Ответ: text" format and plain text)
  const optionTexts: string[] = [];

  if (text.includes('Ответ:')) {
    // Multiple options format
    const lines = text.split('\n');
    lines.forEach((line) => {
      if (line.includes('Ответ:')) {
        const option = line.replace('Ответ:', '').trim();
        if (option) optionTexts.push(option);
      }
    });
  } else {
    // Single option
    optionTexts.push(text);
  }

  // Add options to session
  optionTexts.forEach((opt) => {
    sessionManager.addOptionToSession(userId, opt);
  });

  // Delete user message
  try {
    await bot.deleteMessage(chatId, msg.message_id);
  } catch (error) {
    console.log('Could not delete user message');
  }

  // Update the display
  const session = sessionManager.getSession(userId)!;
  const questions = session.current_quiz?.questions || [];
  const currentOptions = session.current_quiz?.current_options || [];
  const questionIndex = questions.length;
  const questionText = session.current_quiz?.current_question_text;

  const messageId = sessionManager.getMessageId(userId);
  if (messageId) {
    let messageText = `📋 Вопрос ${questionIndex + 1}: ${questionText}\n\nВарианты ответов:\n`;
    currentOptions.forEach((opt, idx) => {
      messageText += `${idx + 1} - ${opt}\n`;
    });

    const buttons: string[][] = [];
    if (currentOptions.length >= 2) {
      buttons.push([NEXT_QUESTION_BUTTON]);
    }
    if (questions.length + 1 >= 5) {
      buttons.push([SAVE_TEST_BUTTON]);
    }
    buttons.push([STOP_BUTTON]);

    const opts: TelegramBot.EditMessageTextOptions = {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: buttons.map((row) => row.map((btn) => ({ text: btn, callback_data: btn }))),
      },
    };

    try {
      await bot.editMessageText(messageText, opts);
    } catch (error) {
      console.log('Could not edit message');
    }
  }
}

export async function handleNextQuestion(bot: TelegramBot, query: TelegramBot.CallbackQuery) {
  const chatId = query.message!.chat.id;
  const userId = query.from!.id;
  const messageId = query.message!.message_id;

  // Save current question
  sessionManager.saveCurrentQuestion(userId);

  // Update to next question prompt
  const questions = sessionManager.getCurrentQuestions(userId);
  const nextQuestionIndex = questions.length;

  try {
    await bot.editMessageText(formatters.formatQuestionPrompt(nextQuestionIndex), {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [[{ text: STOP_BUTTON, callback_data: STOP_BUTTON }]],
      },
    });
  } catch (error) {
    console.log('Could not edit message');
  }

  await bot.answerCallbackQuery(query.id);
}

export async function handleSaveTest(bot: TelegramBot, query: TelegramBot.CallbackQuery) {
  const chatId = query.message!.chat.id;
  const userId = query.from!.id;
  const messageId = query.message!.message_id;

  const session = sessionManager.getSession(userId);
  if (!session || !session.current_quiz) {
    await bot.answerCallbackQuery(query.id, { text: 'О��ибка: сессия не найдена' });
    return;
  }

  // Save current question if it has options
  if (session.current_quiz.current_question_text && session.current_quiz.current_options.length >= 2) {
    sessionManager.saveCurrentQuestion(userId);
  }

  const questions = sessionManager.getCurrentQuestions(userId);

  if (questions.length < 5) {
    await bot.answerCallbackQuery(query.id, { text: '❌ Нужно минимум 5 вопросов' });
    return;
  }

  try {
    // Create quiz in database
    const quizId = await quizService.createQuiz(userId);

    // Save questions and options
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const questionId = await quizService.addQuestion(quizId, q.text, i);

      for (let j = 0; j < q.options.length; j++) {
        await quizService.addOption(questionId, q.options[j], j);
      }
    }

    // Clear session
    sessionManager.deleteSession(userId);

    // Send success message
    try {
      await bot.editMessageText(formatters.formatTestSaved(quizId), {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: CREATE_TEST_BUTTON, callback_data: CREATE_TEST_BUTTON },
              { text: MY_TESTS_BUTTON, callback_data: MY_TESTS_BUTTON },
            ],
          ],
        },
      });
    } catch (error) {
      console.log('Could not edit message');
    }

    await bot.answerCallbackQuery(query.id, { text: '✅ Тест сохранён!' });
  } catch (error) {
    console.error('Error saving quiz:', error);
    await bot.answerCallbackQuery(query.id, { text: '❌ Ошибка при сохранении теста' });
  }
}
