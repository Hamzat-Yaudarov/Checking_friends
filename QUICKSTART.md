# Quick Start Guide - Friendship Check Bot

## 🎯 For End Users

### Using the Bot

1. **Open Telegram**
   - Search for `@friendlyquizbot` 
   - Or [click here](https://t.me/friendlyquizbot)

2. **Start the conversation**
   - Send `/start` or click Start
   - See the welcome message

3. **Create Your First Test**
   - Click "✨ Создать тест ✨"
   - Read the instructions

4. **Add Questions**
   - Type a question about yourself
   - Example: "What's my favorite color?"

5. **Add Answer Options**
   - Type answers in the format shown
   - Example:
     ```
     Ответ: Blue
     Ответ: Red
     Ответ: Green
     ```
   - Minimum 2 answers required

6. **Continue Adding Questions**
   - Click "➕ Следующий вопрос"
   - Repeat for up to 5 questions

7. **Save Your Test**
   - After 5 questions, click "💾 Сохранить тест"
   - Test is saved!

8. **Share with Friends**
   - Click "📋 Мои тесты"
   - Select your test
   - Click "🔗 Поделиться"
   - Share the link

## 🔧 For Developers

### Setup (Local Development)

```bash
# 1. Clone repo
git clone <repo-url>
cd friendship-check-bot

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env

# 4. Update .env with your credentials
# BOT_TOKEN=your_token
# DATABASE_URL=your_neon_connection_string
# NODE_ENV=development
# PORT=3001

# 5. Build
npm run build

# 6. Start dev server
npm run dev
```

### Deploy to Railway

1. **Create Railway Project**
   - Go to https://railway.app
   - Click "New Project" → "Deploy from GitHub"
   - Select your repository

2. **Add Environment Variables**
   - Go to Variables tab
   - Add:
     ```
     BOT_TOKEN=8357920603:AAEcRZlAzCebZxQCIRLPQWRASZL-3upZOC8
     DATABASE_URL=postgresql://neondb_owner:npg_5Q1JLwpTliPo@ep-sweet-firefly-agmtcj1n-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
     NODE_ENV=production
     PORT=3001
     ```

3. **Deploy**
   - Click Deploy
   - Wait for build to complete
   - Check logs to verify success

### Development Commands

```bash
# Build
npm run build

# Type check
npm run typecheck

# Start dev server (polling mode)
npm run dev

# Start production server
npm start
```

### Project Structure

```
src/
├── index.ts              # Entry point
├── server.ts             # HTTP server & bot setup
├── services/db.ts        # Database connection
├── models/               # Data models
├── handlers/             # Message & command handlers
├── utils/                # Utilities
└── database/             # Schema & initialization
```

### Adding New Features

1. **New Command?**
   - Add handler in `src/handlers/commands.ts`
   - Register in `src/server.ts` with `bot.command()`

2. **New Button?**
   - Add keyboard in `src/utils/keyboards.ts`
   - Add callback handler in appropriate handlers file
   - Register in `src/server.ts` with `bot.action()`

3. **Store New Data?**
   - Add table in `src/database/schema.sql`
   - Create model file in `src/models/`
   - Use `getPool()` from `src/services/db.ts`

### Common Issues

**Bot not responding?**
- Check logs: `railway logs --follow`
- Verify BOT_TOKEN is correct
- Make sure database is accessible

**Database connection error?**
- Test connection string directly
- Check Neon dashboard for firewall rules
- Ensure SSL mode is enabled

**Build fails?**
- Run `npm run typecheck` to see type errors
- Check Node.js version: `node --version`
- Clear node_modules: `rm -rf node_modules && npm install`

### Testing

To test locally:

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Open Telegram and message @friendlyquizbot
# or use local bot token for testing
```

## 📚 Documentation

- [Full README](./README.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Bot Commands](./README.md#-bot-commands)
- [API Schema](./src/database/schema.sql)

## 🎉 You're Ready!

- Bot is live at [@friendlyquizbot](https://t.me/friendlyquizbot)
- Share with friends
- Create awesome tests
- Have fun! 🚀
