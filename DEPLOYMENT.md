# Deployment Guide - Friendship Check Bot

This guide explains how to deploy the Friendship Check Bot to Railway.

## Prerequisites

- GitHub account with the bot repository
- Railway account (https://railway.app)
- Neon PostgreSQL account (database connection string)
- Telegram Bot Token

## Step 1: Prepare Your Credentials

Before deploying, ensure you have:

1. **Telegram Bot Token**: `8357920603:AAEcRZlAzCebZxQCIRLPQWRASZL-3upZOC8`
2. **Neon Connection String**: 
   ```
   postgresql://neondb_owner:npg_5Q1JLwpTliPo@ep-sweet-firefly-agmtcj1n-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```

## Step 2: Deploy to Railway

### Option A: Using Railway Dashboard

1. **Create a new project**:
   - Go to https://railway.app/dashboard
   - Click "New Project"
   - Select "Deploy from GitHub"
   - Connect your GitHub account and select the bot repository

2. **Configure environment variables**:
   - After selecting the repository, go to the Variables tab
   - Add the following environment variables:
     ```
     BOT_TOKEN=8357920603:AAEcRZlAzCebZxQCIRLPQWRASZL-3upZOC8
     DATABASE_URL=postgresql://neondb_owner:npg_5Q1JLwpTliPo@ep-sweet-firefly-agmtcj1n-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
     NODE_ENV=production
     PORT=3001
     ```

3. **Deploy**:
   - Railway will automatically detect the `railway.json` config
   - Click "Deploy" and wait for the build to complete
   - Once deployed, Railway will provide a public URL like `https://yourapp.railway.app`

4. **Configure the bot webhook**:
   - The bot automatically sets the webhook when it starts
   - It will use `https://<railway-domain>/webhook` as the webhook URL

### Option B: Using Railway CLI

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Create a new project**:
   ```bash
   railway init
   ```

4. **Add environment variables**:
   ```bash
   railway variables set BOT_TOKEN=your_token
   railway variables set DATABASE_URL=your_connection_string
   railway variables set NODE_ENV=production
   railway variables set PORT=3001
   ```

5. **Deploy**:
   ```bash
   railway up
   ```

## Step 3: Monitor Deployment

1. **Check logs**:
   - Go to Railway dashboard → Your Project → Deployments
   - Click on the latest deployment
   - View logs to ensure the bot started successfully

2. **Expected success message**:
   ```
   ✅ Database connected
   ✅ Database schema initialized
   ✅ Bot running in webhook mode on port 3001
   ✅ Webhook set: {...}
   ```

## Step 4: Test the Bot

1. **Start a conversation**:
   - Open Telegram and search for `@friendlyquizbot`
   - Send `/start` command
   - You should see the welcome message with buttons

2. **Create a test**:
   - Click "✨ Создать тест ✨"
   - Follow the prompts to create a test

3. **View tests**:
   - Click "📋 Мои тесты" to see your created tests

## Monitoring and Maintenance

### View Logs
```bash
railway logs --follow
```

### Redeploy
```bash
railway deploy
```

### Update Environment Variables
```bash
railway variables set KEY=value
```

## Troubleshooting

### Bot doesn't respond to commands
- Check logs for errors: `railway logs`
- Verify bot token in environment variables
- Ensure DATABASE_URL is correct and the database is accessible

### Database connection errors
- Test the Neon connection string manually
- Ensure SSL mode is set to `require`
- Check firewall rules in Neon dashboard

### Webhook errors
- Verify the bot's public domain is correct in Railway settings
- Check that `/webhook` endpoint is accessible
- Ensure PORT is set to 3001

## Updating the Bot

1. **Push changes to GitHub**:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **Railway will automatically deploy**:
   - Go to Railway dashboard and watch the deployment progress
   - The bot will restart automatically with new code

## Cost Estimation

- **Railway**: Free tier includes 5GB/month, $5/month per GB beyond that
- **Neon**: Free tier includes 3 projects, $15/month for production databases
- **Telegram Bot**: Free to use

For a small user base, both services should fit within free/low-cost tiers.

## Security Notes

⚠️ **Important**: 
- Never commit `.env` file with real credentials to Git
- Use Railway's environment variables interface instead
- Keep bot token and database credentials secure
- Regularly rotate credentials if compromised

## Additional Resources

- Railway Docs: https://docs.railway.app
- Telegraf Docs: https://telegraf.js.org
- Neon Docs: https://neon.tech/docs
- PostgreSQL Docs: https://www.postgresql.org/docs
