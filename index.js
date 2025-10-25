import express from 'express';
import bot from './bot.js';
import { initializeDatabase } from './db.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

let bot_loaded = false;

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

async function startServer() {
  try {
    await initializeDatabase();
    console.log('Database initialized');
    
    await bot.launch({
      polling: {
        interval: 300,
        timeout: 20
      }
    });
    
    console.log('Bot launched');
    
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Bot: @friendlyquizbot`);
      bot_loaded = true;
    });
    
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
    
  } catch (error) {
    console.error('Server start error:', error);
    process.exit(1);
  }
}

startServer();

export default app;
