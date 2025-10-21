import 'dotenv/config';
import * as http from 'http';
import { Telegraf } from 'telegraf';
import { initDatabase } from './services/db';
import { initializeSchema } from './database/init';
import { startCommand, createTestCallback, myTestsCallback, stopCreationCallback } from './handlers/commands';
import { handleMessage, nextQuestionCallback, saveTestCallback } from './handlers/messages';
import {
  viewMyTestsCallback,
  viewTestCallback,
  deleteTestCallback,
  shareTestCallback,
  backToTestsCallback,
  backToMenuCallback,
} from './handlers/test-handlers';

const BOT_TOKEN = process.env.BOT_TOKEN;
const PORT = parseInt(process.env.PORT || '3001', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

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

async function main() {
  try {
    console.log('🚀 Starting Friendship Check Bot...');

    // Initialize database
    await initDatabase();
    await initializeSchema();

    if (NODE_ENV === 'production') {
      // Webhook mode for production
      const server = http.createServer(async (req, res) => {
        // Handle webhook from Telegram
        if (req.method === 'POST' && req.url === '/webhook') {
          let body = '';

          req.on('data', (chunk) => {
            body += chunk.toString();
          });

          req.on('end', async () => {
            try {
              const update = JSON.parse(body);
              await bot.handleUpdate(update);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ ok: true }));
            } catch (error) {
              console.error('Error handling update:', error);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ ok: false }));
            }
          });
        } else if (req.url === '/' && req.method === 'GET') {
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('Friendship Check Bot is running');
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
        }
      });

      server.listen(PORT, '0.0.0.0', async () => {
        console.log(`✅ Bot running in webhook mode on port ${PORT}`);

        // Set webhook
        const domain = process.env.RAILWAY_PUBLIC_DOMAIN || `localhost:${PORT}`;
        const webhookUrl = `https://${domain}/webhook`;

        try {
          const webhookInfo = await bot.telegram.setWebhook(webhookUrl);
          console.log('✅ Webhook set:', webhookInfo);
        } catch (error) {
          console.error('Error setting webhook:', error);
        }
      });

      // Enable graceful stop
      process.once('SIGINT', () => {
        console.log('Closing server...');
        server.close(() => {
          console.log('Server closed');
          process.exit(0);
        });
      });
      process.once('SIGTERM', () => {
        console.log('Closing server...');
        server.close(() => {
          console.log('Server closed');
          process.exit(0);
        });
      });
    } else {
      // Polling mode for development
      await bot.launch();
      console.log('✅ Bot running in polling mode');

      // Enable graceful stop
      process.once('SIGINT', () => bot.stop('SIGINT'));
      process.once('SIGTERM', () => bot.stop('SIGTERM'));
    }
  } catch (error) {
    console.error('Failed to start bot:', error);
    process.exit(1);
  }
}

main();

export default bot;
