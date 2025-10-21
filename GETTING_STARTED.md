# 🚀 Getting Started - Friendship Check Bot

Welcome! This guide will help you get the Friendship Check Bot up and running in minutes.

## ⏱️ Estimated Time

- **Use the bot**: 1 minute
- **Set up locally**: 5 minutes  
- **Deploy to production**: 10 minutes

---

## 🎯 Choose Your Path

### Path 1: Just Use the Bot (1 minute)
Want to try the bot without any setup?

**[→ Open the Bot](https://t.me/friendlyquizbot)**

Steps:
1. Click the link above
2. Send `/start`
3. Create a test
4. Share with friends

---

### Path 2: Development Setup (5 minutes)

Set up the bot on your computer for development.

#### Requirements
- **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)
- **Git** - Download from [git-scm.com](https://git-scm.com/)
- **Code Editor** - VS Code, Sublime, etc.

#### Step 1: Clone the Repository
```bash
git clone <your-repo-url>
cd friendship-check-bot
```

#### Step 2: Install Dependencies
```bash
npm install
```

#### Step 3: Configure Environment
```bash
# Copy example to .env
cp .env.example .env

# Edit .env with your credentials
# Add your BOT_TOKEN and DATABASE_URL
```

See [ENV_CONFIG.md](./ENV_CONFIG.md) for detailed configuration.

#### Step 4: Build and Run
```bash
# Build TypeScript
npm run build

# Start development bot
npm run dev
```

#### Step 5: Test
- Open Telegram
- Search `@friendlyquizbot`
- Send `/start`
- Create a test to verify it works

**Congrats! The bot is running locally! 🎉**

---

### Path 3: Deploy to Production (10 minutes)

Deploy the bot to Railway for production use.

#### Requirements
- **GitHub Account** - Create at [github.com](https://github.com/)
- **Railway Account** - Create at [railway.app](https://railway.app/)
- **Push permission** - Access to the code repository

#### Step 1: Prepare Code
```bash
# Build everything locally first
npm run build

# Verify no errors
npm run typecheck
```

#### Step 2: Push to GitHub
```bash
# Add all files
git add .

# Commit changes
git commit -m "Initial bot implementation"

# Push to GitHub
git push origin main
```

#### Step 3: Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Authorize GitHub
5. Select your repository
6. Click "Deploy"

#### Step 4: Configure Environment Variables

Railway will show you the Variables tab:

Click "Add Variable" and add each one:

```
Variable Name: BOT_TOKEN
Value: 8357920603:AAEcRZlAzCebZxQCIRLPQWRASZL-3upZOC8
[Save]

Variable Name: DATABASE_URL
Value: postgresql://neondb_owner:npg_5Q1JLwpTliPo@ep-sweet-firefly-agmtcj1n-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
[Save]

Variable Name: NODE_ENV
Value: production
[Save]

Variable Name: PORT
Value: 3001
[Save]
```

#### Step 5: Wait for Deployment
- Railway will build and deploy automatically
- Check the Deployments tab for progress
- Wait for "Deployment Complete" message

#### Step 6: Verify
- Open Telegram
- Message `@friendlyquizbot`
- Send `/start`
- Verify it responds

**Congrats! Your bot is live in production! 🎉**

---

## 📋 What Each Path Gets You

| Feature | Use Bot | Local Dev | Production |
|---------|---------|-----------|------------|
| Use the bot | ✅ Yes | ✅ Yes | ✅ Yes |
| Read documentation | ✅ Yes | ✅ Yes | ✅ Yes |
| Modify code | ❌ No | ✅ Yes | ✅ Yes |
| Test locally | ❌ No | ✅ Yes | ❌ No |
| 24/7 availability | ✅ Yes | ❌ No | ✅ Yes |
| Cost | Free | Free | Free* |

*Railway includes $5/month free credit

---

## 🔧 Configuration

### Environment Variables

Your `.env` file needs:

```env
# Telegram Bot Token
BOT_TOKEN=8357920603:AAEcRZlAzCebZxQCIRLPQWRASZL-3upZOC8

# Database Connection
DATABASE_URL=postgresql://neondb_owner:npg_5Q1JLwpTliPo@ep-sweet-firefly-agmtcj1n-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Environment Type
NODE_ENV=development

# HTTP Port
PORT=3001
```

See [ENV_CONFIG.md](./ENV_CONFIG.md) for detailed help.

---

## 🐛 Troubleshooting

### "Bot doesn't respond to /start"
- Check `BOT_TOKEN` is correct in `.env`
- Verify bot is running (check logs)
- Make sure you're using the correct bot username

### "Cannot connect to database"
- Check `DATABASE_URL` is correct
- Verify database credentials
- Test connection with: `psql $DATABASE_URL -c "SELECT 1"`
- Check Neon dashboard for firewall rules

### "Build fails with TypeScript errors"
- Clean and rebuild:
  ```bash
  rm -rf dist
  npm run build
  ```
- Check Node.js version: `node --version` (needs 18+)

### "npm install fails"
- Clear cache:
  ```bash
  npm cache clean --force
  rm -rf node_modules
  npm install
  ```

### "Port already in use"
- Change PORT in `.env`
- Or kill the process: `lsof -ti:3001 | xargs kill -9`

For more help, see [FAQ.md](./FAQ.md) or [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## 📚 Documentation

After setup, read these for more info:

### Quick Reference
- [QUICKSTART.md](./QUICKSTART.md) - Commands and features

### User Documentation
- [README.md](./README.md) - Main features
- [FEATURES.md](./FEATURES.md) - All capabilities
- [FAQ.md](./FAQ.md) - Common questions

### Developer Documentation
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Code structure
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Architecture

### Deployment Documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed deployment guide
- [ENV_CONFIG.md](./ENV_CONFIG.md) - Environment variables

### Navigation
- [INDEX.md](./INDEX.md) - Complete documentation index
- [START_HERE.md](./START_HERE.md) - Universal starting point

---

## 🚀 Next Steps

### After Using the Bot
1. Create a test
2. Share with friends
3. See how well they know you
4. Check [FEATURES.md](./FEATURES.md) for more features

### After Local Setup
1. Read [DEVELOPMENT.md](./DEVELOPMENT.md)
2. Explore the code in `src/`
3. Try modifying something
4. Deploy to production

### After Production Deployment
1. Test everything works
2. Share bot link with friends
3. Monitor with `railway logs --follow`
4. Check [DEPLOYMENT.md](./DEPLOYMENT.md) for monitoring tips

---

## 💡 Pro Tips

### Development Tips
- Use `npm run dev` for development (hot reload friendly)
- Check logs for debugging
- Use `console.log()` for debugging
- Read error messages carefully

### Deployment Tips
- Set variables in Railway, not in code
- Check logs regularly: `railway logs --follow`
- Keep credentials secure
- Monitor database usage

### General Tips
- Keep credentials in `.env` (git-ignored)
- Read documentation before asking questions
- Check FAQ first for common issues
- Use meaningful commit messages

---

## ✅ Verification Checklist

After setup, verify everything works:

### For Local Setup
- [ ] `npm install` completed
- [ ] `.env` file created and filled
- [ ] `npm run build` succeeds
- [ ] `npm run dev` starts without errors
- [ ] Bot responds to `/start` in Telegram
- [ ] Can create a test successfully

### For Production Setup
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Railway project created
- [ ] Environment variables set
- [ ] Deployment completed
- [ ] Bot responds to `/start` in Telegram

---

## 🎉 You're All Set!

Choose your path above and get started. Everything is ready:

✅ **Code is complete**
✅ **Documentation is comprehensive**
✅ **Configuration is prepared**
✅ **Build succeeds with no errors**

Pick your path and enjoy! 🚀

---

## 📞 Get Help

**Still stuck?**

1. Check [FAQ.md](./FAQ.md) - Most questions answered
2. Check [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment issues
3. Read [DEVELOPMENT.md](./DEVELOPMENT.md) - Code questions
4. Check logs - Most issues show in logs
5. Create a GitHub issue with:
   - What you tried
   - What happened
   - The error message

---

**Ready? Pick a path above! 👆**
