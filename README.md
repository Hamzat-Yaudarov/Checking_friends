# Проверка дружбы - Friendship Quiz Bot 🎮

A Telegram bot for creating and sharing friendship quizzes with a beautiful MiniApp interface.

## Features ✨

- **Create Tests**: Users can create custom quizzes about themselves
- **Share with Friends**: Generate shareable links to send to friends
- **Test Taking**: Friends can take the tests and see their results
- **View Results**: Test creators can see who took their tests and their scores
- **Edit Tests**: Modify existing tests - add/remove questions and answers
- **Beautiful UI**: Modern, responsive design with smooth animations

## Tech Stack 🛠️

- **Backend**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon)
- **Telegram Bot**: Telegraf
- **Frontend**: Vanilla HTML/CSS/JavaScript

## Prerequisites 📋

- Node.js 18+ and npm
- PostgreSQL database (Neon)
- Telegram Bot Token
- Railway account (for deployment)

## Environment Setup 🔧

1. Clone the repository:
```bash
git clone <repository-url>
cd friendship-quiz-bot
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with your credentials:
```env
BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
DATABASE_URL=postgresql://user:password@host/database?sslmode=require&channel_binding=require
WEBHOOK_URL=https://your-domain.up.railway.app
PORT=3000
NODE_ENV=production
```

## Development 👨‍💻

### Start the dev server:
```bash
npm run dev
```

The bot will start in polling mode on localhost:3000

### Build for production:
```bash
npm run build
```

### Run tests (if available):
```bash
npm test
```

## Deployment on Railway 🚀

### 1. Connect your Railway project
- Sign up on [Railway.app](https://railway.app)
- Create a new project
- Connect your GitHub repository

### 2. Add Database
- In your Railway project, add a PostgreSQL plugin
- Copy the connection string to `DATABASE_URL` environment variable

### 3. Set Environment Variables
In your Railway project settings, add:
- `BOT_TOKEN`: Your Telegram bot token
- `DATABASE_URL`: PostgreSQL connection string
- `WEBHOOK_URL`: Your Railway domain (e.g., `https://projectname-production.up.railway.app`)
- `PORT`: 3000
- `NODE_ENV`: production

### 4. Deploy
- Push to your main branch
- Railway will automatically build and deploy
- Check the deployment logs to ensure everything is running

## Project Structure 📁

```
├── src/
│   ├── bot.ts              # Telegram bot command handlers
│   ├── server.ts           # Express server & API routes
│   ├── index.ts            # Application entry point
│   ├── db/
│   │   └── database.ts     # Database connection & initialization
│   └── services/
│       ├── userService.ts  # User management
│       └── testService.ts  # Test & question management
├── public/miniapp/
│   ├── index.html          # Main profile page
│   ├── create-test.html    # Test creation page
│   ├── my-tests.html       # User's tests page
│   ├── edit-test.html      # Test editing page
│   └── take-test.html      # Test taking page
├── package.json
├── tsconfig.json
├── Procfile                # Railway deployment
└── README.md
```

## API Endpoints 🔌

### User Management
- `POST /api/users/sync` - Sync user data
- `GET /api/users/me` - Get current user

### Tests
- `POST /api/tests` - Create test
- `GET /api/tests/:testId` - Get test with questions
- `GET /api/users/:userId/tests` - Get user's tests
- `PUT /api/tests/:testId` - Update test
- `DELETE /api/tests/:testId` - Delete test

### Questions
- `POST /api/questions` - Create question
- `PUT /api/questions/:questionId` - Update question
- `DELETE /api/questions/:questionId` - Delete question

### Answers
- `POST /api/answers` - Create answer
- `PUT /api/answers/:answerId` - Update answer
- `DELETE /api/answers/:answerId` - Delete answer

### Test Attempts
- `POST /api/test-attempts` - Submit test answers
- `GET /api/tests/:testId/attempts` - Get test results

## Database Schema 🗄️

The application automatically initializes the database with the following tables:

- **users**: Telegram user profiles
- **tests**: Quiz tests created by users
- **questions**: Questions within tests
- **answers**: Possible answers for questions
- **test_attempts**: Records of users taking tests
- **test_results**: Individual answer results

## Important Rules ⚠️

- Users cannot take their own tests
- Users can only take each test once
- Test creators can view all attempts and user scores
- Users can choose to display their name or remain anonymous when taking tests

## Troubleshooting 🐛

### Bot not responding
- Check if the bot token is correct in `.env`
- Verify the bot is running: `npm run dev`
- Check logs for any error messages

### Database connection errors
- Verify DATABASE_URL is correct
- Ensure Neon database is active
- Check network connectivity

### MiniApp not loading
- Verify WEBHOOK_URL matches your deployment domain
- Check if static files are being served
- Inspect browser console for JavaScript errors

## Security Notes 🔒

- Never commit `.env` file with real secrets
- Use strong, random bot tokens
- Validate all user inputs on the backend
- Implement rate limiting for production
- Use HTTPS for all communications

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License 📄

This project is licensed under the MIT License.

## Support 💬

For issues and questions:
- Check the Telegram Bot API documentation
- Review Railway.app deployment guides
- Consult PostgreSQL documentation for database issues

---

Made with ❤️ for friendship quizzes
