import 'dotenv/config';
import express from 'express';
import { initializeDatabase } from './database/migrations';
import { getBot } from './bot/factory';

const token = process.env.TELEGRAM_BOT_TOKEN!;
const webhookUrl = process.env.WEBHOOK_URL || 'http://localhost:3000';
const port = parseInt(process.env.PORT || '3000', 10);
const nodeEnv = process.env.NODE_ENV || 'development';

const isProduction = nodeEnv === 'production';
const bot = getBot(token, !isProduction);
const app = express();

app.use(express.json());

async function setupBot() {
  try {
    // Initialize database asynchronously without blocking startup
    if (isProduction) {
      console.log('Initializing database...');
      await initializeDatabase();
      console.log('Database initialized');

      // Set webhook for production
      await bot.setWebHook(`${webhookUrl}/webhook`);
      console.log(`Webhook set to ${webhookUrl}/webhook`);
    } else {
      // Use polling for development - initialize database in background
      console.log('Using polling mode for development');
      initializeDatabase().catch((error) => {
        console.error('Background database init error:', error);
      });
    }
  } catch (error) {
    console.error('Setup error:', error);
    throw error;
  }
}

// Webhook endpoint
app.post('/webhook', async (req, res) => {
  try {
    await bot.processUpdate(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
async function start() {
  try {
    await setupBot();
    app.listen(port, () => {
      console.log(`Bot server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start bot:', error);
    process.exit(1);
  }
}

start();

export default app;
