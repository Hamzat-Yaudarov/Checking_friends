import 'dotenv/config';
import { IncomingMessage, ServerResponse } from 'http';
import { Telegraf } from 'telegraf';
import { initDatabase } from '../src/services/db';
import { initializeSchema } from '../src/database/init';
import { startCommand, createTestCallback, myTestsCallback, stopCreationCallback } from '../src/handlers/commands';
import { handleMessage, nextQuestionCallback, saveTestCallback } from '../src/handlers/messages';
import {
  viewMyTestsCallback,
  viewTestCallback,
  deleteTestCallback,
  shareTestCallback,
  backToTestsCallback,
  backToMenuCallback,
} from '../src/handlers/test-handlers';

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  throw new Error('BOT_TOKEN is not defined in environment variables');
}

const bot = new Telegraf(BOT_TOKEN);

// Commands
bot.command('start', startCommand);

// Callback queries
bot.action('create_test', createTestCallback);
bot.action('my_tests', myTestsCallback);
bot.action('my_tests_view', viewMyTestsCallback);
bot.action('stop_creation', stopCreationCallback);
bot.action('next_question', nextQuestionCallback);
bot.action('save_test', saveTestCallback);

// Test viewing callbacks
bot.action(/^view_test_\d+$/, viewTestCallback);
bot.action(/^delete_test_\d+$/, deleteTestCallback);
bot.action(/^share_test_\d+$/, shareTestCallback);
bot.action('back_to_tests', backToTestsCallback);
bot.action('back_to_menu', backToMenuCallback);

// Message handler
bot.on('message', handleMessage);

// Error handler
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('❌ Произошла неожиданная ошибка').catch(console.error);
});

let isInitialized = false;

async function initializeBot() {
  if (isInitialized) return;
  
  try {
    console.log('🚀 Initializing Friendship Check Bot...');
    await initDatabase();
    await initializeSchema();
    isInitialized = true;
    console.log('✅ Bot initialized');
  } catch (error) {
    console.error('Failed to initialize bot:', error);
    throw error;
  }
}

export default async (req: IncomingMessage & any, res: ServerResponse & any) => {
  try {
    // Initialize bot on first request
    await initializeBot();

    // Handle webhook from Telegram
    if (req.method === 'POST') {
      const update = req.body;
      
      if (update && update.update_id) {
        await bot.handleUpdate(update);
        return res.status(200).json({ ok: true });
      }
    }

    // Health check endpoint
    if (req.method === 'GET') {
      return res.status(200).json({ 
        status: 'ok',
        message: 'Friendship Check Bot is running'
      });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
};
