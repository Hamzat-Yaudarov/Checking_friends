# ✅ Pre-Deployment Checklist

Complete this checklist before deploying to Railway.

## 🔍 Code Quality

- [ ] Run `npm run build` - No errors
- [ ] Run `npm run typecheck` - No type errors
- [ ] Code builds successfully
- [ ] No console warnings
- [ ] All imports resolve correctly

## 🗄️ Database

- [ ] Database schema created (`schema.sql`)
- [ ] All 7 tables present
- [ ] Indexes created
- [ ] Foreign keys configured
- [ ] Neon connection string obtained

## 🔐 Credentials

- [ ] Bot token obtained from @BotFather
- [ ] Database connection string from Neon
- [ ] `.env` file created locally
- [ ] `.env` is in `.gitignore` (never commit!)
- [ ] Credentials not hardcoded in any file
- [ ] No plaintext secrets in code

## 🤖 Bot Features

- [ ] `/start` command works
- [ ] Main menu displays correctly
- [ ] "✨ Создать тест ✨" button works
- [ ] Can enter questions
- [ ] Can enter answers
- [ ] Answer parsing works correctly
- [ ] Can proceed to next question
- [ ] Can save test
- [ ] "📋 Мои тесты" button works
- [ ] Can view test details
- [ ] Can delete tests
- [ ] Can share tests
- [ ] Navigation buttons work
- [ ] All error messages display

## 📦 Configuration

- [ ] `package.json` configured
- [ ] `tsconfig.json` configured
- [ ] `railway.json` created
- [ ] `.env` has all required variables:
  - [ ] `BOT_TOKEN`
  - [ ] `DATABASE_URL`
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=3001`

## 📝 Documentation

- [ ] README.md exists and is complete
- [ ] DEPLOYMENT.md exists
- [ ] START_HERE.md exists
- [ ] QUICKSTART.md exists
- [ ] All documentation is up-to-date
- [ ] No broken links in docs

## 🧪 Testing

- [ ] Tested locally with `npm run dev`
- [ ] Bot responds to `/start`
- [ ] Can create a complete test
- [ ] Can save test
- [ ] Can view saved test
- [ ] Database queries work
- [ ] No unexpected errors in logs

## 🚀 Railway Preparation

- [ ] GitHub account created
- [ ] Repository created on GitHub
- [ ] Code pushed to GitHub:
  ```bash
  git add .
  git commit -m "Initial bot implementation"
  git push origin main
  ```
- [ ] GitHub account authorized with Railway
- [ ] Ready to create Railway project

## 🔒 Security

- [ ] No secrets in code
- [ ] `.env` file not in repository
- [ ] Environment variables only in Railway
- [ ] Database uses SSL/TLS
- [ ] No logging of sensitive data
- [ ] Input validation in place
- [ ] Error messages don't leak information

## 📊 Performance

- [ ] Database connection pooling configured
- [ ] Indexes created for faster queries
- [ ] No N+1 queries
- [ ] Message editing implemented (no spam)
- [ ] Graceful error handling
- [ ] Resource cleanup on shutdown

## 🐛 Error Handling

- [ ] All try-catch blocks in place
- [ ] User-friendly error messages
- [ ] No unhandled promise rejections
- [ ] Database errors caught
- [ ] Network errors handled
- [ ] Input validation on all inputs

## ✨ Final Checks

- [ ] Code compiles successfully
- [ ] No TypeScript errors
- [ ] No missing dependencies
- [ ] Project structure correct
- [ ] All files created
- [ ] Git repository clean

---

## Deployment Steps

When all boxes are checked:

### 1. Final Build
```bash
npm run build
npm run typecheck
```

### 2. Create Railway Project
- Go to https://railway.app
- Click "New Project"
- Select "Deploy from GitHub"
- Choose your repository

### 3. Add Environment Variables
In Railway Variables tab:
```
BOT_TOKEN=8357920603:AAEcRZlAzCebZxQCIRLPQWRASZL-3upZOC8
DATABASE_URL=postgresql://neondb_owner:npg_5Q1JLwpTliPo@ep-sweet-firefly-agmtcj1n-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NODE_ENV=production
PORT=3001
```

### 4. Deploy
- Click "Deploy"
- Wait for build to complete
- Check logs for success

### 5. Verify
- Open Telegram
- Message @friendlyquizbot
- Send `/start`
- Verify it responds

---

## ✅ All Checks Complete?

If all boxes are checked above:

**🎉 You're ready to deploy!**

Follow the [DEPLOYMENT.md](./DEPLOYMENT.md) guide for detailed instructions.

---

## 🆘 If Something's Wrong

1. **Build fails?** → Check [FAQ.md](./FAQ.md#typescripterror)
2. **Bot doesn't work?** → Check [DEPLOYMENT.md](./DEPLOYMENT.md#troubleshooting)
3. **Database error?** → Check [ENV_CONFIG.md](./ENV_CONFIG.md#troubleshooting)
4. **Other issue?** → Check [FAQ.md](./FAQ.md)

---

**Ready? [→ See DEPLOYMENT.md](./DEPLOYMENT.md)**
