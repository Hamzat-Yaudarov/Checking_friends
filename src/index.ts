import 'dotenv/config';
import bot from './bot';
import { startServer } from './server';

const main = async () => {
  try {
    // Start Express server
    await startServer();

    // Start bot in polling mode
    console.log('Starting Telegram bot...');
    await bot.launch();

    console.log('Bot is running!');

    // Handle graceful shutdown
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
  } catch (error) {
    console.error('Error starting application:', error);
    process.exit(1);
  }
};

main();
