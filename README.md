# Проверка дружбы - Telegram Bot 🎯

A Telegram bot that allows users to create friendship tests, add questions and answers, and share them with friends.

## Features ✨

- **Create Tests**: Users can create custom tests with multiple questions
- **Multiple Answers**: Add multiple answer options to each question (minimum 2)
- **Test Management**: View, edit, and delete created tests
- **Share Tests**: Generate shareable links to send tests to friends
- **Session Management**: Track user sessions and test creation progress
- **Neon Database**: Persistent storage with PostgreSQL

## Setup

### Prerequisites
- Node.js 18+
- Telegram Bot Token: `8357920603:AAEcRZlAzCebZxQCIRLPQWRASZL-3upZOC8`
- Neon Database Connection String: `postgresql://neondb_owner:npg_5Q1JLwpTliPo@ep-sweet-firefly-agmtcj1n-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Run the bot locally:
```bash
npm run dev
```

The bot will start with polling mode on port 3001.

### Deployment to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. The bot will be available at: `https://your-vercel-domain.com/api/webhook`

4. Update Telegram webhook:
```
POST /bot<TOKEN>/setWebhook?url=https://your-vercel-domain.com/api/webhook
```

## Project Structure

```
├── index.js                 # Local development server
├── bot.js                   # Bot logic and handlers
├── db.js                    # Database connection
├── database-service.js      # Database operations
├── api/webhook.js          # Vercel webhook handler
├── vercel.json             # Vercel configuration
└── package.json            # Dependencies
```

## Database Schema

### users
- `id` - Telegram user ID (Primary Key)
- `username` - Telegram username
- `first_name` - User's first name
- `created_at` - Account creation timestamp

### tests
- `id` - Test ID (Primary Key)
- `user_id` - Owner's user ID (Foreign Key)
- `title` - Test title
- `created_at` - Test creation timestamp

### questions
- `id` - Question ID (Primary Key)
- `test_id` - Associated test ID (Foreign Key)
- `question_text` - Question content
- `question_order` - Order in the test
- `created_at` - Creation timestamp

### answers
- `id` - Answer ID (Primary Key)
- `question_id` - Associated question ID (Foreign Key)
- `answer_text` - Answer content
- `answer_order` - Order in the question
- `created_at` - Creation timestamp

### user_sessions
- `id` - Session ID (Primary Key)
- `user_id` - Associated user ID (Foreign Key)
- `session_data` - JSON session data (current state, questions, etc.)
- `created_at` - Session creation timestamp
- `updated_at` - Last update timestamp

## Bot Commands

### /start
Displays welcome message with options to create a test or view existing tests

## Bot Workflow

1. **Welcome Screen**: User sees welcome message with two buttons
   - "✨ Создать тест ✨" - Create new test
   - "📋 Мои тесты" - View my tests

2. **Test Creation**:
   - User clicks "Create test"
   - Bot prompts for first question
   - User enters question text
   - Bot prompts for answer options
   - User adds answers (minimum 2)
   - After each answer addition, the message updates to show all answers
   - Once 2+ answers added, "Next question" button appears
   - Process repeats for more questions
   - After 5+ questions, "Save test" button appears

3. **Test Management**:
   - View all created tests
   - See question count and creation date
   - Delete tests with confirmation
   - Share tests with unique links

## Technologies

- **Telegraf**: Telegram bot framework
- **Express**: Web server (local development)
- **PostgreSQL/Neon**: Database
- **Node.js**: Runtime environment

## Dependencies

```json
{
  "express": "^4.18.2",
  "telegraf": "^4.14.1",
  "pg": "^8.11.3",
  "dotenv": "^16.3.1"
}
```

## Environment Variables

Required for Vercel deployment:
- `TELEGRAM_TOKEN` - Your Telegram bot token
- `NEON_CONNECTION_STRING` - Your Neon database connection string

These are already configured in the deployment.

## Error Handling

The bot includes comprehensive error handling:
- Database connection errors
- User session management errors
- Telegram API errors
- Graceful fallback messages

## Notes

- User messages are deleted after being processed to reduce clutter
- Previous bot messages are edited instead of sending new ones
- Session data is stored in JSONB for flexibility
- Proper database constraints ensure data integrity
