# 📞 Support & Help Guide

Need help? This guide covers all common issues and solutions.

## 🔍 Finding Help

### Quick Links

| Issue | Solution |
|-------|----------|
| How do I use the bot? | [README.md](./README.md) or [QUICKSTART.md](./QUICKSTART.md) |
| Common questions? | [FAQ.md](./FAQ.md) |
| Setup issues? | [GETTING_STARTED.md](./GETTING_STARTED.md) |
| Deployment problems? | [DEPLOYMENT.md](./DEPLOYMENT.md) |
| Code questions? | [DEVELOPMENT.md](./DEVELOPMENT.md) |
| Configuration help? | [ENV_CONFIG.md](./ENV_CONFIG.md) |
| Monitoring help? | [POST_DEPLOYMENT.md](./POST_DEPLOYMENT.md) |

---

## 🚨 Common Issues & Solutions

### Bot Issues

#### Bot Doesn't Respond to /start

**Symptoms:**
- Send `/start` but no response
- Other bots work fine

**Solutions:**
1. Check bot username is `@friendlyquizbot`
2. Verify bot token in `.env` (local) or Railway
3. Check bot is running:
   ```bash
   railway logs --follow
   ```
4. Restart bot on Railway dashboard

**If still failing:**
- Check [DEPLOYMENT.md#troubleshooting](./DEPLOYMENT.md#troubleshooting)

#### Test Creation Doesn't Work

**Symptoms:**
- Click "✨ Создать тест ✨" but nothing happens
- Error messages appear

**Solutions:**
1. Check bot is running
2. Try creating a simpler test
3. Check database is connected
4. Check logs for errors

**Common causes:**
- Database connection failed
- Session state not saving
- Input validation error

#### Can't Save Test

**Symptoms:**
- Entered questions but save button doesn't work
- No error message shown

**Solutions:**
1. Ensure you have 1-5 questions
2. Ensure each question has 2+ answers
3. Check database connection
4. Try a simpler test

---

### Setup Issues

#### "npm install" Fails

**Symptoms:**
- `npm install` command errors
- Package versions conflict

**Solutions:**
1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```

2. Remove node_modules:
   ```bash
   rm -rf node_modules
   ```

3. Reinstall:
   ```bash
   npm install
   ```

4. If still fails, check Node version:
   ```bash
   node --version  # Should be 18+
   ```

#### TypeScript Compilation Errors

**Symptoms:**
- `npm run build` fails
- TS2305 or similar errors

**Solutions:**
1. Check Node version (18+)
2. Clean and rebuild:
   ```bash
   rm -rf dist
   npm install
   npm run build
   ```

3. Check for syntax errors in code

#### PORT Already in Use

**Symptoms:**
- Bot won't start with port error
- Another process using port 3001

**Solutions:**
1. Change PORT in `.env`:
   ```env
   PORT=3002
   ```

2. Or kill existing process:
   ```bash
   lsof -ti:3001 | xargs kill -9
   ```

---

### Database Issues

#### "Cannot Connect to Database"

**Symptoms:**
- Error: "Cannot connect to database"
- Bot won't start

**Solutions:**
1. Check DATABASE_URL in `.env`:
   ```bash
   echo $DATABASE_URL
   ```

2. Test connection manually:
   ```bash
   psql $DATABASE_URL -c "SELECT 1;"
   ```

3. Check Neon dashboard:
   - Database is running?
   - No connection limits reached?
   - Firewall rules allow your IP?

4. Verify connection string format:
   ```
   postgresql://user:password@host:port/db?sslmode=require
   ```

#### Database Connection Timeout

**Symptoms:**
- Long delay before "Cannot connect" error
- Works intermittently

**Solutions:**
1. Check network connection
2. Verify database is running
3. Check connection pool settings in `src/services/db.ts`
4. Try from different network

#### Queries Return No Data

**Symptoms:**
- Bot works but tests don't save
- Tests disappear

**Solutions:**
1. Check data was saved:
   ```bash
   psql $DATABASE_URL -c "SELECT * FROM tests;"
   ```

2. Verify session state:
   ```bash
   psql $DATABASE_URL -c "SELECT * FROM user_sessions;"
   ```

3. Check for SQL errors in logs

---

### Deployment Issues

#### Deployment Fails

**Symptoms:**
- Railway deployment fails
- "Deployment failed" message

**Solutions:**
1. Check build log for error
2. Verify all environment variables set
3. Check code compiles locally:
   ```bash
   npm run build
   ```

4. Check for missing dependencies

#### Bot Not Responding After Deploy

**Symptoms:**
- Deployment succeeded but bot doesn't work
- /start returns no response

**Solutions:**
1. Check Railway logs:
   ```bash
   railway logs --follow
   ```

2. Verify environment variables:
   - `BOT_TOKEN` set?
   - `DATABASE_URL` set?
   - `NODE_ENV=production`?

3. Restart deployment:
   - Go to Railway dashboard
   - Click "Restart"

#### Webhook Errors

**Symptoms:**
- Logs show "Webhook error"
- Bot responds slowly or not at all

**Solutions:**
1. Check public domain in Railway
2. Verify webhook URL is set correctly
3. Check Telegram can reach webhook
4. Restart bot

---

### Configuration Issues

#### Wrong Bot Token

**Symptoms:**
- "Invalid bot token" error
- Bot doesn't authenticate

**Solutions:**
1. Get new token from @BotFather
2. Update `.env` or Railway variables
3. Restart bot

#### Environment Variables Not Working

**Symptoms:**
- Variables set but not used
- "undefined" in logs

**Solutions:**
1. Check variable names are correct:
   - `BOT_TOKEN` (not `TOKEN`)
   - `DATABASE_URL` (not `DB_URL`)

2. Verify variable is set:
   ```bash
   echo $BOT_TOKEN
   ```

3. Restart app after changing variables

#### .env File Issues

**Symptoms:**
- Changes to .env don't take effect
- Variables still undefined

**Solutions:**
1. Ensure file exists:
   ```bash
   ls -la .env
   ```

2. Restart bot:
   ```bash
   npm run dev
   ```

3. For production, update Railway variables, not .env

---

## 🤔 How to Get Help

### Step 1: Check Documentation

1. Is it in [FAQ.md](./FAQ.md)? → Read it
2. Is it setup related? → Check [GETTING_STARTED.md](./GETTING_STARTED.md)
3. Is it deployment? → Check [DEPLOYMENT.md](./DEPLOYMENT.md)
4. Code/dev question? → Check [DEVELOPMENT.md](./DEVELOPMENT.md)

### Step 2: Check Logs

**Local:**
```bash
npm run dev  # Output in terminal
```

**Production:**
```bash
railway logs --follow
```

Look for error messages - they usually tell you what's wrong.

### Step 3: Check Examples

- Look at similar code in `src/`
- Check test cases
- Review documentation examples

### Step 4: Search Issues

- Check GitHub issues
- Search in documentation
- Look for similar problems

### Step 5: Create an Issue

If stuck, create a GitHub issue with:

```markdown
## Issue Title

### Description
What's happening?

### Steps to Reproduce
1. ...
2. ...
3. ...

### Expected Behavior
What should happen?

### Actual Behavior
What actually happened?

### Environment
- Node version: (from: `node --version`)
- npm version: (from: `npm --version`)
- OS: (Windows/Mac/Linux)

### Error Message
(If any)

### Screenshots
(If helpful)

### What I've Tried
1. ...
2. ...
```

---

## 💡 Debugging Tips

### Enable Debug Logging

Add this to `src/server.ts`:
```typescript
if (process.env.DEBUG === 'true') {
  console.log('DEBUG:', ...args);
}
```

Then run with:
```bash
DEBUG=true npm run dev
```

### Check Database Directly

```bash
# Connect to database
psql $DATABASE_URL

# See users
SELECT * FROM users;

# See tests
SELECT * FROM tests;

# See questions
SELECT * FROM questions;

# Exit
\q
```

### Monitor Bot Requests

Add logging to `src/handlers/commands.ts`:
```typescript
console.log('startCommand called by:', ctx.from);
```

### Check Network Traffic

For production, check if Telegram can reach webhook:
```bash
curl https://yourapp.railway.app/
```

Should return something (not connection refused).

---

## 📚 Documentation Structure

| Document | Covers |
|----------|--------|
| [README.md](./README.md) | Overview & features |
| [QUICKSTART.md](./QUICKSTART.md) | Quick commands |
| [GETTING_STARTED.md](./GETTING_STARTED.md) | Setup steps |
| [FAQ.md](./FAQ.md) | Common questions |
| [FEATURES.md](./FEATURES.md) | All features |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Code structure |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Deploy guide |
| [ENV_CONFIG.md](./ENV_CONFIG.md) | Configuration |
| [POST_DEPLOYMENT.md](./POST_DEPLOYMENT.md) | Monitoring |
| [SUPPORT.md](./SUPPORT.md) | This file |

---

## 🆘 Emergency Support

### Bot Is Down

1. Check Railway status
2. Check logs for errors
3. Restart bot on Railway
4. Check database connection
5. If still down, review logs

### Data Loss Concern

1. Check database still has data:
   ```bash
   psql $DATABASE_URL -c "SELECT COUNT(*) FROM tests;"
   ```

2. Neon auto-backs up data
3. Export important data regularly

### Security Breach Suspected

1. Immediately:
   - Revoke bot token (@BotFather)
   - Change database password (Neon)
   - Update Railway variables
   - Restart bot

2. Then:
   - Audit code for vulnerabilities
   - Review logs for unauthorized access
   - Document incident

---

## ⏰ Response Times

- **GitHub Issues**: Check regularly
- **Documentation**: Always available
- **Emergency (down)**: Check logs immediately

---

## 🎯 Quick Checklist When Stuck

- [ ] Checked relevant documentation?
- [ ] Checked logs?
- [ ] Restarted bot/service?
- [ ] Checked environment variables?
- [ ] Tested database connection?
- [ ] Cleared cache/rebuilt?
- [ ] Searched GitHub issues?
- [ ] Reviewed error message carefully?

If all above checked and still stuck → Create GitHub issue.

---

## 📞 Additional Resources

- **Telegraf Docs**: https://telegraf.js.org
- **PostgreSQL Docs**: https://www.postgresql.org/docs
- **Railway Docs**: https://docs.railway.app
- **Neon Docs**: https://neon.tech/docs
- **Node.js Docs**: https://nodejs.org/docs

---

## ✅ Still Need Help?

1. **Read this support guide** ← You are here
2. **Check [FAQ.md](./FAQ.md)** ← Most answers here
3. **Create GitHub issue** ← With detailed info
4. **Reach out to community** ← StackOverflow, Reddit, etc.

---

**Remember**: Most issues have solutions in the documentation!

Good luck! 🚀
