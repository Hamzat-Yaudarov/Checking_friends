import { Context } from 'telegraf';
import {
  getOrCreateUser,
  getOrCreateSession,
  updateSessionState,
  getSession,
  createTest,
  addQuestion,
  addAnswer,
  getUserByTelegramId,
  getTestsByUser,
  getTestWithQuestions,
  getQuestionWithAnswers,
  markAnswerAsCorrect,
  deleteTest,
} from '../db/queries.js';
import {
  mainMenuKeyboard,
  createTestStartKeyboard,
  nextQuestionKeyboard,
  saveTestKeyboard,
  cancelKeyboard,
  testActionKeyboard,
  correctAnswersKeyboard,
} from './keyboards.js';

export async function handleStart(ctx: Context) {
  try {
    const telegramId = ctx.from?.id;
    if (!telegramId) return ctx.reply('Error: Could not identify user');

    await getOrCreateUser(telegramId, ctx.from?.username);
    await getOrCreateSession(telegramId);

    // Check if there's a test_id in the start parameter
    const contextAny = ctx as any;
    const startParam = contextAny.startPayload;
    if (startParam && startParam.startsWith('test_')) {
      const testId = parseInt(startParam.replace('test_', ''));
      if (testId) {
        return ctx.reply(`🎯 Тест загружен! Скоро будет возможность проходить тесты. Пока вы можете создавать свои тесты.`, {
          ...mainMenuKeyboard,
        });
      }
    }

    const welcomeMessage = `🎉 *Добро пожаловать в Проверку Дружбы!* 🎉

Здесь ты сможешь создать увлекательный тест, чтобы узнать, насколько хорошо твои друзья тебя знают!

Развлекайся, создавай интересные вопросы и получай уникальные *ДОСТИЖЕНИЯ ДРУЖБЫ!*

Чтобы начать, просто выбери одну из кнопок ниже ⬇️`;

    return ctx.reply(welcomeMessage, {
      parse_mode: 'Markdown',
      ...mainMenuKeyboard,
    });
  } catch (error) {
    console.error('Error in handleStart:', error);
    return ctx.reply('Произошла ошибка. Пожалуйста, попробуйте снова.');
  }
}

export async function handleCreateTest(ctx: Context) {
  try {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    const user = await getUserByTelegramId(telegramId);
    const test = await createTest(user.id);

    await updateSessionState(telegramId, 'creating_test', {
      currentTestId: test.id,
      questionCount: 0,
    });

    const instructionMessage = `📝 *Как создавать тест:*

1️⃣ Отправьте первый вопрос
2️⃣ Добавьте варианты ответов (минимум 2)
3️⃣ Повторите для каждого вопроса
4️⃣ Когда будет 5+ вопросов, сохраните тест

Вперёд! 🚀`;

    // Edit the previous message
    await ctx.editMessageText(instructionMessage, {
      parse_mode: 'Markdown',
    });

    // Send message for first question
    return ctx.reply('📌 Введите ваш первый вопрос:', {
      ...createTestStartKeyboard,
    });
  } catch (error) {
    console.error('Error in handleCreateTest:', error);
    return ctx.reply('Произошла ошибка при создании теста.');
  }
}

export async function handleQuestionInput(ctx: Context) {
  try {
    const telegramId = ctx.from?.id;
    if (!telegramId || !ctx.message || !('text' in ctx.message)) return;

    const session = await getSession(telegramId);
    if (!session || session.state !== 'creating_test') return;

    const questionText = ctx.message.text;
    // Use current_question_count as the order (0-indexed becomes 1-indexed)
    const questionOrder = session.current_question_count + 1;

    // Add question to database
    const question = await addQuestion(session.current_test_id, questionText, questionOrder);

    // Update session with temp question (don't increment count yet - that happens on next_question)
    await updateSessionState(telegramId, 'collecting_answers', {
      tempQuestion: JSON.stringify({
        id: question.id,
        text: questionText,
        order: questionOrder,
      }),
      tempAnswers: JSON.stringify([]),
    });

    // Delete user's message
    try {
      await ctx.deleteMessage();
    } catch (e) {
      // Message might already be deleted
    }

    // Send prompt for answers
    const answerPrompt = `📌 *${questionOrder} вопрос:* "${questionText}"

✍️ Введите варианты ответов:
(Можно отправить по одному или сразу несколько в формате:
Ответ: Вариант 1
Ответ: Вариант 2
Ответ: Вариант 3)`;

    return ctx.reply(answerPrompt, {
      parse_mode: 'Markdown',
      ...createTestStartKeyboard,
    });
  } catch (error) {
    console.error('Error in handleQuestionInput:', error);
  }
}

export async function handleAnswerInput(ctx: Context) {
  try {
    const telegramId = ctx.from?.id;
    if (!telegramId || !ctx.message || !('text' in ctx.message)) return;

    const session = await getSession(telegramId);
    if (!session || session.state !== 'collecting_answers') return;

    const inputText = ctx.message.text;
    const tempQuestion = JSON.parse(session.temp_question || '{}');
    const tempAnswers = JSON.parse(session.temp_answers || '[]');

    // Parse answers from input
    const answerLines = inputText.split('\n').filter((line) => line.trim());
    const newAnswers: string[] = [];

    for (const line of answerLines) {
      if (line.toLowerCase().startsWith('ответ:')) {
        const answerText = line.substring('ответ:'.length).trim();
        if (answerText) {
          newAnswers.push(answerText);
        }
      } else if (tempAnswers.length === 0) {
        // If no answers yet and line doesn't start with "Ответ:", treat as single answer
        newAnswers.push(line.trim());
      }
    }

    // Combine with existing answers
    const allAnswers = [...tempAnswers, ...newAnswers];

    // Validate minimum 2 answers
    if (allAnswers.length < 2) {
      return ctx.reply(`⚠️ Нужно минимум 2 варианта ответов! Сейчас добавлено: ${allAnswers.length}`);
    }

    // Save new answers to database
    for (let i = tempAnswers.length; i < allAnswers.length; i++) {
      await addAnswer(tempQuestion.id, allAnswers[i], i + 1);
    }

    // Update session
    await updateSessionState(telegramId, 'collecting_answers', {
      tempAnswers: JSON.stringify(allAnswers),
    });

    // Delete user's message
    try {
      await ctx.deleteMessage();
    } catch (e) {
      // Message might already be deleted
    }

    // Build answer display
    const answerDisplay = allAnswers.map((ans: string, idx: number) => `${idx + 1} - ${ans}`).join('\n');

    const updateMessage = `📌 *${tempQuestion.order} вопрос:* "${tempQuestion.text}"

📋 Варианты ответов:
${answerDisplay}`;

    // Determine keyboard based on answer count and question count
    const questionCount = session.current_question_count || tempQuestion.order || 0;
    let keyboard = createTestStartKeyboard;

    if (allAnswers.length >= 2) {
      if (questionCount >= 5) {
        keyboard = saveTestKeyboard;
      } else {
        keyboard = nextQuestionKeyboard;
      }
    }

    // Prepare correct answers prompt
    const correctAnswerMessage = `\n\n🎯 *Отметьт�� правильные ответы:*`;

    return ctx.reply(updateMessage + correctAnswerMessage, {
      parse_mode: 'Markdown',
      ...correctAnswersKeyboard(
        allAnswers.map((ans, idx) => ({
          id: `${tempQuestion.id}_${idx}`,
          text: ans,
        }))
      ),
    });
  } catch (error) {
    console.error('Error in handleAnswerInput:', error);
  }
}

export async function handleNextQuestion(ctx: Context) {
  try {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    const session = await getSession(telegramId);
    if (!session) return;

    // Increment the question count for the next question
    const nextQuestionNumber = (session.current_question_count || 0) + 1;

    await updateSessionState(telegramId, 'creating_test', {
      questionCount: nextQuestionNumber,
    });

    const nextQuestionMessage = `📌 Введите вопрос №${nextQuestionNumber + 1}:`;

    return ctx.reply(nextQuestionMessage, {
      ...createTestStartKeyboard,
    });
  } catch (error) {
    console.error('Error in handleNextQuestion:', error);
  }
}

export async function handleSaveTest(ctx: Context) {
  try {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    const session = await getSession(telegramId);
    if (!session) return;

    const questionCount = session.current_question_count || 0;
    if (questionCount < 5) {
      return ctx.reply(`❌ Тест должен содержать минимум 5 вопросов! Сейчас: ${questionCount}`, {
        ...nextQuestionKeyboard,
      });
    }

    // Test is automatically saved in database as questions/answers are added
    // Just clear the session and update test's updated_at timestamp
    await updateSessionState(telegramId, 'idle', {
      currentTestId: null,
      questionCount: 0,
      tempQuestion: undefined,
      tempAnswers: undefined,
    });

    const successMessage = `✅ *Тест успешно сохранён!*

Твой тест ��отов к публикации. Ты можешь поделиться ссылкой с друзьями и узнать, насколько они тебя знают! 🎉

Создать ещё один тест? 👇`;

    return ctx.reply(successMessage, {
      parse_mode: 'Markdown',
      ...mainMenuKeyboard,
    });
  } catch (error) {
    console.error('Error in handleSaveTest:', error);
  }
}

export async function handleStopCreation(ctx: Context) {
  try {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    await updateSessionState(telegramId, 'idle', {
      currentTestId: null,
      questionCount: 0,
    });

    return ctx.reply('❌ Создание теста отменено.', {
      ...mainMenuKeyboard,
    });
  } catch (error) {
    console.error('Error in handleStopCreation:', error);
  }
}

export async function handleMyTests(ctx: Context) {
  try {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    const user = await getUserByTelegramId(telegramId);
    if (!user) return ctx.reply('Пользователь не найден.');

    const tests = await getTestsByUser(user.id);

    if (tests.length === 0) {
      return ctx.reply('📭 У вас нет тестов. Создайте свой первый тест!', {
        ...mainMenuKeyboard,
      });
    }

    for (const test of tests) {
      const testInfo = `📝 *${test.title}*\n🔢 Вопросов: ${test.question_count}`;
      await ctx.reply(testInfo, {
        parse_mode: 'Markdown',
        ...testActionKeyboard(test.id),
      });
    }

    return ctx.reply('Выберите действие для теста:', {
      ...mainMenuKeyboard,
    });
  } catch (error) {
    console.error('Error in handleMyTests:', error);
    return ctx.reply('Прои��ошла ошибка при загрузке тестов.');
  }
}

export async function handleShareTest(ctx: any) {
  try {
    const matches = ctx.match || [];
    const testId = parseInt(matches[1] || '0');
    if (!testId) return ctx.reply('Ошибка: тест не найден');

    const shareLink = `t.me/friendlyquizbot?start=test_${testId}`;
    const message = `🔗 *Ссылка на тест:*\n\n\`${shareLink}\`\n\nОтправьте эту ссылку друзьям, и они смогут пройти ваш тест!`;

    return ctx.reply(message, {
      parse_mode: 'Markdown',
      ...mainMenuKeyboard,
    });
  } catch (error) {
    console.error('Error in handleShareTest:', error);
    return ctx.reply('Произошла ошибка при генерации ссылки.');
  }
}

export async function handleDeleteTest(ctx: any) {
  try {
    const matches = ctx.match || [];
    const testId = parseInt(matches[1] || '0');
    if (!testId) return ctx.reply('Ошибка: тест не найден');

    await deleteTest(testId);

    return ctx.reply('🗑️ Тест удален.', {
      ...mainMenuKeyboard,
    });
  } catch (error) {
    console.error('Error in handleDeleteTest:', error);
    return ctx.reply('Произошла ошибка при удалении теста.');
  }
}

export async function handleToggleCorrectAnswer(ctx: any) {
  try {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    const matches = ctx.match || [];
    const answerId = matches[1];
    const session = await getSession(telegramId);

    if (!session) return ctx.reply('Сессия не найдена');

    // Track selected correct answers
    let correctAnswers = session.temp_answers ? JSON.parse(session.temp_answers) : [];

    if (correctAnswers.includes(answerId)) {
      correctAnswers = correctAnswers.filter((id: string) => id !== answerId);
    } else {
      correctAnswers.push(answerId);
    }

    await updateSessionState(telegramId, 'collecting_answers', {
      tempAnswers: JSON.stringify(correctAnswers),
    });

    const isSelected = correctAnswers.includes(answerId);
    const mark = isSelected ? '✅' : '☐';

    return ctx.answerCbQuery(`${mark} ${isSelected ? 'Отмечено' : 'Отметка отменена'}`);
  } catch (error) {
    console.error('Error in handleToggleCorrectAnswer:', error);
  }
}

export async function handleConfirmCorrectAnswers(ctx: Context) {
  try {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    const session = await getSession(telegramId);
    if (!session) return;

    const correctAnswerIds = JSON.parse(session.temp_answers || '[]');
    const tempQuestion = JSON.parse(session.temp_question || '{}');

    // Mark answers as correct in database
    for (const answerId of correctAnswerIds) {
      const [questionId, answerIdx] = answerId.split('_');
      if (parseInt(questionId) === tempQuestion.id) {
        // Get all answers for this question and mark the correct ones
        const questionData = await getQuestionWithAnswers(tempQuestion.id);
        const answer = questionData.answers[parseInt(answerIdx)];
        if (answer) {
          await markAnswerAsCorrect(answer.id);
        }
      }
    }

    const questionCount = session.current_question_count || 0;

    if (questionCount >= 5) {
      // Show save button
      return ctx.reply('✅ Правильные ответы отмечены!', {
        ...saveTestKeyboard,
      });
    } else {
      // Show next question button
      return ctx.reply('✅ Правильные ответы отмечены!', {
        ...nextQuestionKeyboard,
      });
    }
  } catch (error) {
    console.error('Error in handleConfirmCorrectAnswers:', error);
  }
}
