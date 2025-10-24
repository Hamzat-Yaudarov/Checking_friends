"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const telegraf_1 = require("telegraf");
const db_1 = require("../src/services/db");
const init_1 = require("../src/database/init");
const commands_1 = require("../src/handlers/commands");
const messages_1 = require("../src/handlers/messages");
const test_handlers_1 = require("../src/handlers/test-handlers");
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
    throw new Error('BOT_TOKEN is not defined in environment variables');
}
const bot = new telegraf_1.Telegraf(BOT_TOKEN);
// Commands
bot.command('start', commands_1.startCommand);
// Callback queries
bot.action('create_test', commands_1.createTestCallback);
bot.action('my_tests', commands_1.myTestsCallback);
bot.action('my_tests_view', test_handlers_1.viewMyTestsCallback);
bot.action('stop_creation', commands_1.stopCreationCallback);
bot.action('next_question', messages_1.nextQuestionCallback);
bot.action('save_test', messages_1.saveTestCallback);
// Test viewing callbacks
bot.action(/^view_test_\d+$/, test_handlers_1.viewTestCallback);
bot.action(/^delete_test_\d+$/, test_handlers_1.deleteTestCallback);
bot.action(/^share_test_\d+$/, test_handlers_1.shareTestCallback);
bot.action('back_to_tests', test_handlers_1.backToTestsCallback);
bot.action('back_to_menu', test_handlers_1.backToMenuCallback);
// Message handler
bot.on('message', messages_1.handleMessage);
// Error handler
bot.catch((err, ctx) => {
    console.error('Bot error:', err);
    ctx.reply('❌ Произошла неожиданная ошибка').catch(console.error);
});
let isInitialized = false;
async function initializeBot() {
    if (isInitialized)
        return;
    try {
        console.log('🚀 Initializing Friendship Check Bot...');
        await (0, db_1.initDatabase)();
        await (0, init_1.initializeSchema)();
        isInitialized = true;
        console.log('✅ Bot initialized');
    }
    catch (error) {
        console.error('Failed to initialize bot:', error);
        throw error;
    }
}
exports.default = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ ok: false, error: 'Internal server error' });
    }
};
//# sourceMappingURL=index.js.map