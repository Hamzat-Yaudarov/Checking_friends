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
