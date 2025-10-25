import { Telegraf } from 'telegraf';
import 'dotenv/config';
import { initializeDatabase } from './db/connection.js';
import {
  handleStart,
  handleCreateTest,
  handleQuestionInput,
  handleAnswerInput,
  handleNextQuestion,
  handleSaveTest,
  handleStopCreation,
  handleMyTests,
  handleShareTest,
  handleDeleteTest,
  handleToggleCorrectAnswer,
  handleConfirmCorrectAnswers,
} from './bot/handlers.js';
import { getSession } from './db/queries.js';

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN is not set');
}

const bot = new Telegraf(token);

// Middleware to check user state
bot.use(async (ctx, next) => {
  const telegramId = ctx.from?.id;
  if (telegramId) {
    const session = await getSession(telegramId);
    (ctx as any).session = session;
  }
  return next();
});

// Commands
bot.start(handleStart);

// Action handlers for buttons
bot.action('create_test', handleCreateTest);
bot.action('my_tests', handleMyTests);
bot.action('next_question', handleNextQuestion);
bot.action('save_test', handleSaveTest);
bot.action('stop_test_creation', handleStopCreation);
bot.action(/^share_test_(\d+)$/, handleShareTest);
bot.action(/^delete_test_(\d+)$/, handleDeleteTest);
bot.action(/^toggle_answer_(.+)$/, handleToggleCorrectAnswer);
bot.action('confirm_correct_answers', handleConfirmCorrectAnswers);

// Message handlers
bot.on('message', async (ctx) => {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const session = await getSession(telegramId);

  if (session?.state === 'creating_test') {
    await handleQuestionInput(ctx);
  } else if (session?.state === 'collecting_answers') {
    await handleAnswerInput(ctx);
  } else {
    // Default message handler
    ctx.reply('Пожалуйста, используйте команду /start для начала.');
  }
});

// Error handler
bot.catch((err) => {
  console.error('Bot error:', err);
});

// Initialize and start
async function main() {
  try {
    console.log('Initializing database...');
    await initializeDatabase();
    console.log('Database initialized');

    console.log('Starting bot...');

    // Start bot launch in background (don't await as it's a long-running process)
    bot.launch().catch((error) => {
      console.error('Bot error:', error);
      process.exit(1);
    });

    // Give the bot a moment to start
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('✅ Bot started successfully! Listening for messages...');

    // Enable graceful shutdown
    process.once('SIGINT', () => {
      console.log('Shutting down...');
      bot.stop('SIGINT');
    });
    process.once('SIGTERM', () => {
      console.log('Shutting down...');
      bot.stop('SIGTERM');
    });
  } catch (error) {
    console.error('Failed to start bot:', error);
    process.exit(1);
  }
}

// Run main function
main().catch(console.error);
