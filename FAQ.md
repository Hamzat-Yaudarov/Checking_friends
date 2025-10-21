# ❓ Frequently Asked Questions (FAQ)

## General Questions

### Q: What is Friendship Check Bot?
**A:** It's a Telegram bot that lets you create tests about yourself and share them with friends. Your friends answer the questions to show how well they know you.

### Q: How do I use it?
**A:** 
1. Open Telegram and search for `@friendlyquizbot`
2. Send `/start`
3. Click "✨ Создать тест ✨" to create a test
4. Follow the prompts

### Q: Does it cost anything?
**A:** No! The bot is completely free to use.

### Q: Is my data safe?
**A:** Yes! Your data is stored securely in a PostgreSQL database with SSL/TLS encryption.

---

## Test Creation Questions

### Q: How many questions can I add?
**A:** You can add up to 5 questions per test.

### Q: How many answer options can I add?
**A:** Minimum 2, maximum unlimited per question.

### Q: What format should answers be in?
**A:** Type each answer as: `Ответ: Your answer here`

You can add multiple at once:
```
Ответ: Option 1
Ответ: Option 2
Ответ: Option 3
```

### Q: Can I edit a test after creating it?
**A:** Currently no, but you can delete it and create a new one.

### Q: Can I have a test with only 1 or 2 questions?
**A:** Yes! You can have 1-5 questions. Minimum 2 answers per question.

### Q: Do I have to write all questions at once?
**A:** No, but once you start creating, you need to finish in one session. If you leave and come back, you'll need to start over.

---

## Sharing & Friends

### Q: How do I share my test with friends?
**A:**
1. Click "📋 Мои тесты"
2. Select your test
3. Click "🔗 Поделиться"
4. Share the link with your friends

### Q: Can I see the results when friends take my test?
**A:** This feature is coming soon!

### Q: Can friends see the correct answers?
**A:** No, only you know the correct answers. Friends can see their score but not the answers.

### Q: Can I delete a test after sharing it?
**A:** Yes, you can delete any of your tests at any time.

---

## Technical Questions

### Q: What is Telegraf?
**A:** It's a Node.js framework for building Telegram bots. It handles all the bot logic and communication with Telegram.

### Q: What is Neon?
**A:** It's a PostgreSQL database provider. We use it to store all test data.

### Q: What is Railway?
**A:** It's a hosting platform that runs the bot 24/7. When you push code to GitHub, Railway automatically deploys it.

### Q: What's PostgreSQL?
**A:** It's a powerful, open-source database system. Your tests and data are stored there.

### Q: Do I need to pay for hosting?
**A:** Railway has a free tier that includes $5/month credit. For small usage, it should be free.

---

## Deployment Questions

### Q: How do I deploy the bot?
**A:** See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step instructions.

### Q: What are environment variables?
**A:** They're settings stored outside your code (in Railway or .env file). They contain sensitive info like:
- Bot token
- Database connection string
- Environment type

See [ENV_CONFIG.md](./ENV_CONFIG.md) for details.

### Q: Where do I get the bot token?
**A:** Create a new bot with [@BotFather](https://t.me/BotFather) on Telegram.

### Q: Where do I get the database connection string?
**A:** Create a new project on [Neon](https://neon.tech) and copy the connection string.

### Q: How do I know if deployment worked?
**A:** 
1. Check Railway logs
2. Open Telegram and message your bot
3. Send `/start` - you should see a response

### Q: Can I deploy without GitHub?
**A:** Not with the current setup. You need GitHub to use Railway's automatic deployments.

---

## Troubleshooting

### Q: Bot doesn't respond to /start
**A:** 
- Check bot token is correct
- Verify database is accessible
- Check Railway logs for errors

### Q: "Cannot connect to database" error
**A:**
- Verify DATABASE_URL is correct
- Check Neon dashboard
- Ensure connection string hasn't expired

### Q: TypeScript compilation errors
**A:**
```bash
rm -rf node_modules dist
npm install
npm run build
```

### Q: Bot token is wrong/invalid
**A:**
- Go to [@BotFather](https://t.me/BotFather)
- Use `/token` to get your bot token
- Make sure to copy the entire token

### Q: Can't find my test
**A:**
- Click "📋 Мои тесты"
- Look for your test in the list
- If not there, you need to create it first

### Q: Deleted a test by accident
**A:** Unfortunately, there's no undo. You'll need to create a new test.

---

## Development Questions

### Q: How do I set up development locally?
**A:** See [QUICKSTART.md](./QUICKSTART.md) for detailed setup instructions.

### Q: How do I add new features?
**A:** See [DEVELOPMENT.md](./DEVELOPMENT.md) for architecture and how to add features.

### Q: Where is the database schema?
**A:** See [src/database/schema.sql](./src/database/schema.sql)

### Q: How do I run the bot locally?
**A:**
```bash
npm install
npm run build
npm run dev
```

Then open Telegram and test.

### Q: What databases does it support?
**A:** Currently PostgreSQL (Neon). Other databases would require code changes.

### Q: Can I use SQLite instead?
**A:** The code uses PostgreSQL-specific features. SQLite would require modifications.

### Q: How do I debug issues?
**A:**
- Check logs in terminal
- Use `console.log()` to add debugging
- Check database directly with `psql`

### Q: What's the file structure?
**A:** See [src/](./src/) folder and [DEVELOPMENT.md](./DEVELOPMENT.md)

---

## Security Questions

### Q: Is my bot token secure?
**A:** Yes, if:
- You never commit `.env` to Git
- You don't share it
- You store it only in environment variables

### Q: Can others steal my bot?
**A:** If you expose your bot token, yes. Keep it secret!

### Q: Is my data encrypted?
**A:** Database connections use SSL/TLS encryption.

### Q: Can I rotate credentials?
**A:** Yes:
- Bot token: Create new bot with BotFather
- Database password: Change in Neon dashboard

### Q: What if my credentials are compromised?
**A:** 
1. Immediately rotate them
2. Create a new bot token
3. Change database password
4. Update environment variables

---

## Costs

### Q: Will I be charged?
**A:** Depends on usage:
- **Telegram**: Free
- **Railway**: Free tier includes $5/month credit
- **Neon**: Free tier up to certain limits

### Q: What's the breakdown?
**A:**
- For small usage (< 100 friends taking tests): Free
- For larger usage, Railway charges $0.50/hour beyond free tier

### Q: How do I monitor costs?
**A:** Check Railway dashboard → Billing tab

### Q: Can I switch providers later?
**A:** Yes, but you'd need to export/import data.

---

## Limitations

### Q: Can I have unlimited tests?
**A:** Yes, unlimited tests and unlimited questions across all tests.

### Q: Can I have unlimited friends?
**A:** Yes, you can share with unlimited friends.

### Q: Can I have tests with 100 questions?
**A:** Each test is limited to 5 questions to keep it simple.

### Q: Can I change answer text color?
**A:** No, the bot uses standard Telegram formatting.

### Q: Can I add images/videos?
**A:** Currently no, only text-based tests.

---

## Support

### Q: Where do I report bugs?
**A:** Create an issue on GitHub with:
- Description of the problem
- Steps to reproduce
- Error message (if any)

### Q: Where do I request features?
**A:** Create a GitHub issue with:
- Feature description
- Why it would be useful
- Example use case

### Q: Who can I contact for help?
**A:** Check documentation:
- General questions → [README.md](./README.md)
- Setup help → [QUICKSTART.md](./QUICKSTART.md)
- Development → [DEVELOPMENT.md](./DEVELOPMENT.md)
- Deployment → [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## Still Have Questions?

1. **Check documentation**:
   - [README.md](./README.md) - Overview
   - [QUICKSTART.md](./QUICKSTART.md) - Quick reference
   - [DEVELOPMENT.md](./DEVELOPMENT.md) - For developers

2. **Check logs**:
   - Local: Terminal output
   - Railway: Dashboard → Logs

3. **Create an issue** on GitHub with:
   - Clear description
   - Steps to reproduce
   - What you tried already

---

**Last Updated**: December 2024
**Version**: 1.0.0
