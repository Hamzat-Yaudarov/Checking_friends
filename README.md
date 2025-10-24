# 🤝 Friendship Check Bot

Telegram bot for creating friendship tests to see how well your friends know you about your personal information and interests.

## 🌟 Features

- ✨ **Create Custom Tests**: Design tests with multiple questions about yourself
- 📋 **Manage Tests**: View and organize all your created tests
- 🎯 **Share Tests**: Send tests to friends via links or directly in Telegram
- 🏆 **Track Friendships**: See how well your friends know you based on their answers
- 💾 **Secure Storage**: All data stored in PostgreSQL (Neon)
- 🔒 **Privacy First**: Only you control who takes your tests

## 🚀 Bot Information

- **Bot Username**: [@friendlyquizbot](https://t.me/friendlyquizbot)
- **Bot Token**: `8357920603:AAEcRZlAzCebZxQCIRLPQWRASZL-3upZOC8`
- **Hosted on**: Vercel (Serverless)
- **Database**: Neon PostgreSQL

## 📥 Quick Start

### Using the Bot

1. **Open Telegram**:
   - Search for `@friendlyquizbot` or [click here](https://t.me/friendlyquizbot)

2. **Create a Test**:
   - Send `/start` command
   - Click "✨ Создать тест ✨"
   - Follow the instructions to add questions and answers
   - Save your test when done

3. **Share with Friends**:
   - Click "📋 Мои тесты"
   - Select a test and click "🔗 Поделиться"
   - Share the link with friends

4. **View Results**:
   - See how many questions your friends answered correctly
   - Get feedback on your test's difficulty

### Local Development

#### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL (for local testing)

#### Setup

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd friendship-check-bot
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create `.env` file**:
   ```bash
   cp .env.example .env
   ```

4. **Update `.env` with your credentials**:
   ```env
   BOT_TOKEN=8357920603:AAEcRZlAzCebZxQCIRLPQWRASZL-3upZOC8
   DATABASE_URL=your_neon_connection_string
   NODE_ENV=development
   PORT=3001
   ```

5. **Build the project**:
   ```bash
   npm run build
   ```

6. **Start development server**:
   ```bash
   npm run dev
   ```

The bot will start in polling mode and listen for updates.

## 🛠️ Project Structure

```
friendship-check-bot/
├── src/
│   ├── index.ts                 # Main entry point
│   ├── server.ts               # HTTP server with webhook support
│   ├── services/
│   │   └── db.ts              # Database connection pool
│   ├── models/
│   │   ├── User.ts            # User model and operations
│   │   ├── Test.ts            # Test/Quiz model and operations
│   │   └── Session.ts         # Session state management
│   ├── handlers/
│   │   ├── commands.ts        # Telegram command handlers
│   │   └── messages.ts        # Message and callback handlers
│   ├── utils/
│   │   ├── keyboards.ts       # Inline keyboard builders
│   │   ├── messages.ts        # Message formatting utilities
│   │   └── test-utilities.ts  # Test display utilities
│   └── database/
│       ├── schema.sql         # PostgreSQL schema
│       └── init.ts            # Schema initialization
├── dist/                        # Compiled JavaScript
├── package.json
├── tsconfig.json
├── railway.json                 # Railway deployment config
├── Procfile                     # Process file for Railway
├── .env                         # Environment variables (git-ignored)
├── .env.example                 # Example env file
└── README.md
```

## 📱 Bot Commands

- `/start` - Start the bot and see the main menu

## 🎯 Main Menu Buttons

- **✨ Создать тест ✨** - Create a new friendship test
- **📋 Мои тесты** - View all your created tests

## 📝 Test Creation Flow

### Step 1: Create Test
- Click "✨ Создать тест ✨"
- Bot shows instructions

### Step 2: Add Questions
- Enter your first question (e.g., "What's my favorite food?")
- Bot asks for answer options (minimum 2)

### Step 3: Add Answer Options
- Type answers in format:
  ```
  Ответ: Option 1
  Ответ: Option 2
  Ответ: Option 3
  ```

### Step 4: Multiple Questions
- After adding 2+ answers to a question, click "➕ Следующий вопрос"
- Repeat steps 2-3 for additional questions (up to 5)

### Step 5: Save Test
- After 5 questions are added, click "💾 Сохранить тест"
- Test is saved to your list

### Step 6: Share
- View your test in "📋 Мои тесты"
- Click "🔗 Поделиться" to get a share link
- Send to friends!

## 🗄️ Database Schema

### Tables

- **users**: Telegram user information
- **tests**: Quiz tests created by users
- **questions**: Questions within tests
- **answers**: Answer options for questions
- **quiz_attempts**: Friend attempts at taking tests
- **quiz_responses**: Individual responses to questions
- **user_sessions**: Conversation state tracking

See `src/database/schema.sql` for complete schema.

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions to Railway.

### Quick Deploy
1. Connect GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Railway automatically builds and deploys

## 📊 Technology Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Bot Framework**: Telegraf
- **Database**: PostgreSQL (Neon)
- **Hosting**: Railway
- **Package Manager**: npm

## 🔐 Security

- All data encrypted in transit (HTTPS/TLS)
- Database connections use SSL
- Credentials stored in environment variables
- No sensitive data logged
- Regular security updates

## 📈 Performance

- Webhook-based message handling (not polling in production)
- Connection pooling for database efficiency
- Optimized queries with proper indexing
- Horizontal scalability on Railway

## 🐛 Troubleshooting

### Bot doesn't respond
- Ensure `/start` command works
- Check Railway logs for errors
- Verify bot token is correct

### Database errors
- Verify Neon connection string
- Check network connectivity
- Ensure database is not at capacity

### Test creation issues
- Minimum 2 answer options required
- Maximum 5 questions per test
- Check that all fields are filled

## 🤝 Contributing

To add features or fix bugs:

1. Create a feature branch
2. Make your changes
3. Test locally with `npm run dev`
4. Push to GitHub
5. Create a pull request

## 📝 License

MIT

## 📞 Support

For issues or questions:
- Check logs: `railway logs --follow`
- Review error messages in Telegram
- Check database connectivity

## 🎉 Features in Development

- 🏆 Achievement system for friendship scores
- 📊 Statistics dashboard
- 🎨 Custom themes for tests
- 👥 Group testing mode
- 🔔 Notifications for test responses

---

**Made with ❤️ for friendship**
