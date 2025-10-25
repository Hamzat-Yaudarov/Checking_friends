import express from 'express';
import bot from './bot.js';
import { initializeDatabase } from './db.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.post('/api/webhook', express.json(), (req, res) => {
  try {
    bot.handleUpdate(req.body, res);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(200);
  }
});

app.get('/', (req, res) => {
  res.json({ status: 'Telegram bot is running', bot: '@friendlyquizbot' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.get('/setup-webhook', async (req, res) => {
  try {
    const TOKEN = process.env.TELEGRAM_TOKEN || '8357920603:AAEcRZlAzCebZxQCIRLPQWRASZL-3upZOC8';
    const VERCEL_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3001';
    const WEBHOOK_URL = `${VERCEL_URL}/api/webhook`;

    const response = await fetch(`https://api.telegram.org/bot${TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: WEBHOOK_URL,
        allowed_updates: ['message', 'callback_query']
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  try {
    await initializeDatabase();
    console.log('Database initialized');
    
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Bot: @friendlyquizbot`);
      console.log(`For local development, remember: Only ONE polling instance at a time!`);
    });
    
  } catch (error) {
    console.error('Server start error:', error);
    process.exit(1);
  }
}

startServer();

export default app;
