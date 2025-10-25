# Friendship Quiz Bot 🎉

A Telegram bot that lets users create quizzes about themselves and share them with friends to see how well they know each other.

## Features

- ✨ **Create Custom Quizzes**: Users can easily create tests with their own questions and answer options
- 📚 **Manage Tests**: View all created quizzes in one place
- 🎯 **Question Builder**: Add questions one by one with multiple answer options
- 💾 **Save & Share**: Save completed quizzes and share them with friends via unique links
- 🏆 **Track Friendship**: See how well friends know you based on their quiz results

## Technology Stack

- **Bot Framework**: Node.js with Telegram Bot API
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon)
- **Hosting**: Vercel (Serverless)

## Local Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Neon PostgreSQL account

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set environment variables:**
   The bot uses polling in development mode and automatically uses the provided credentials. Ensure these are set:
   - `TELEGRAM_BOT_TOKEN`: Your bot token (already configured)
   - `DATABASE_URL`: Your Neon database URL (already configured)
   - `TELEGRAM_BOT_USERNAME`: Your bot username (already configured)

3. **Start development server:**
   ```bash
   npm run dev
   ```

The bot will:
- Connect to Telegram using polling (for local testing)
- Initialize the database automatically
- Listen for messages from users

## Deployment to Vercel

### Setup

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel:**
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel project settings:
     - `TELEGRAM_BOT_TOKEN`
     - `TELEGRAM_BOT_USERNAME`
     - `DATABASE_URL`
     - `WEBHOOK_URL`: Your Vercel deployment URL (e.g., `https://your-project.vercel.app`)
     - `NODE_ENV`: Set to `production`

3. **Configure Telegram Webhook:**
   After deploying, the bot will automatically set its webhook to receive updates from Telegram

## API Routes

- `POST /webhook` - Receives updates from Telegram (production only)
- `GET /health` - Health check endpoint

## Database Schema

### Tables

- **users** - Stores user information
- **quizzes** - Stores quiz metadata
- **questions** - Stores individual questions
- **options** - Stores answer options for each question
- **quiz_responses** - Stores responses when friends take quizzes

## Bot Commands & Usage

### /start
Displays welcome message with options to create a new quiz or view existing ones

### Create Test Flow
1. User clicks "✨ Создать тест ✨"
2. Enter questions one by one
3. Add answer options (minimum 2 required)
4. Can add up to 5+ questions
5. Save quiz when ready (5+ questions required)
6. Get shareable link for friends

### View Tests
Click "📚 Мои тесты" to see all created quizzes with share links

## Development Notes

- **Polling Mode**: Used in development for easier local testing
- **Webhook Mode**: Used in production on Vercel for real-time updates
- **Database**: Lazy initialization to prevent blocking startup
- **Error Handling**: Graceful error handling with timeouts to prevent hanging

## Project Structure

```
src/
├── bot/
│   ├── handlers.ts      # Command and message handlers
│   └── factory.ts       # Bot initialization and handler setup
├── database/
│   ├── connection.ts    # Database connection pool
│   ├── migrations.ts    # Database schema initialization
│   └── quizService.ts   # Database operations
├── types/
│   ├── index.ts         # TypeScript type definitions
│   └── pg.d.ts          # PostgreSQL types
├── utils/
│   ├── sessionManager.ts # User session management
│   └── formatters.ts    # Message formatting
└── index.ts             # Main application entry point

api/
├── webhook.ts           # Vercel webhook handler
└── health.ts            # Health check handler
```

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| TELEGRAM_BOT_TOKEN | Bot token from BotFather | ✓ |
| TELEGRAM_BOT_USERNAME | Bot username (without @) | ✓ |
| DATABASE_URL | Neon PostgreSQL connection string | ✓ |
| WEBHOOK_URL | Production webhook URL (Vercel) | ✓ (prod only) |
| NODE_ENV | Environment (development/production) | ✗ |
| PORT | Server port (default: 3000) | ✗ |

## Troubleshooting

### Bot not responding
- Check if polling is working in development mode
- Verify bot token is correct
- Check database connection

### Database connection timeout
- Verify DATABASE_URL is correct
- Check network connectivity to Neon
- Ensure database tables exist

### Message not being deleted
- This is normal in some Telegram clients
- The bot will still function correctly

## Future Enhancements

- Friend quiz tracking and scoring
- Achievement system for high scores
- Quiz statistics and analytics
- Friend comparison features
- Public quiz gallery
- User profiles with quiz history

## License

ISC
