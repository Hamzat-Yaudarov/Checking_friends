import { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeDatabase } from '../src/database/migrations';
import { getBot } from '../src/bot/factory';

const token = process.env.TELEGRAM_BOT_TOKEN!;

let dbInitialized = false;

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === 'POST') {
    try {
      // Initialize database on first request
      if (!dbInitialized) {
        await initializeDatabase();
        dbInitialized = true;
      }

      // Get bot instance and process update
      const bot = getBot(token, false);
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
