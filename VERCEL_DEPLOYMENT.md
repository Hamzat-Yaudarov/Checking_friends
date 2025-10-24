# Vercel Deployment Guide

This guide explains how to deploy the Friendship Check Bot to Vercel.

## Prerequisites

- Vercel account (https://vercel.com)
- Git repository with your code pushed to GitHub, GitLab, or Bitbucket
- Bot token from Telegram BotFather
- Neon database connection string

## Step 1: Prepare Your Repository

1. Ensure all changes are committed:
   ```bash
   git add .
   git commit -m "Configure for Vercel deployment"
   git push origin main
   ```

2. Verify the following files exist:
   - `vercel.json` - Vercel configuration
   - `api/index.ts` - Serverless function handler
   - `package.json` - Updated with correct build script
   - `tsconfig.json` - Updated to include api directory

3. Verify Railway files have been removed:
   - No `railway.json`
   - No `nixpacks.toml`
   - No `Procfile`

## Step 2: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy from your project directory:
   ```bash
   vercel
   ```

3. Follow the prompts:
   - Link to your existing Vercel project or create a new one
   - Confirm the project settings
   - Set environment variables when prompted

### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Select your Git repository
4. Configure the project:
   - **Framework Preset**: Node.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Click "Deploy"

## Step 3: Set Environment Variables

Set the following environment variables in your Vercel project:

1. Go to your Vercel project settings → Environment Variables
2. Add the following variables:
   - `BOT_TOKEN`: Your Telegram bot token (from BotFather)
   - `DATABASE_URL`: Your Neon database connection string
   - `NODE_ENV`: `production` (automatically set by Vercel)

**Important**: Mark `BOT_TOKEN` and `DATABASE_URL` as "Secrets" for security.

## Step 4: Configure Telegram Webhook

After successful deployment, set the Telegram webhook to point to your Vercel URL:

1. Get your Vercel deployment URL (e.g., `https://your-project-name.vercel.app`)

2. Set the webhook using Telegram Bot API:
   ```bash
   curl -X POST https://api.telegram.org/bot<BOT_TOKEN>/setWebhook \
     -d "url=https://<YOUR_VERCEL_URL>"
   ```

   Or use this in your browser (replace placeholders):
   ```
   https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<YOUR_VERCEL_URL>
   ```

3. Verify the webhook is set correctly:
   ```bash
   curl https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo
   ```

   You should see:
   ```json
   {
     "ok": true,
     "result": {
       "url": "https://your-project-name.vercel.app",
       "has_custom_certificate": false,
       "pending_update_count": 0
     }
   }
   ```

## Step 5: Test Your Bot

1. Open Telegram and find your bot (@friendlyquizbot)
2. Send `/start` command
3. Verify that the bot responds with the welcome message
4. Test creating a test and the full workflow

## Step 6: Monitor Your Bot

### Vercel Dashboard
- View logs: Project → Logs
- Check deployments: Project → Deployments
- Monitor errors: Project → Monitoring

### Database
- Check Neon database: https://console.neon.tech
- Verify database connections and query logs

## Troubleshooting

### Bot Not Responding

1. **Check webhook status**:
   ```bash
   curl https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo
   ```

2. **View Vercel logs**:
   - Go to Vercel Dashboard → Your Project → Logs
   - Check for any errors in the function logs

3. **Verify environment variables**:
   - Check that `BOT_TOKEN` and `DATABASE_URL` are set in Vercel
   - Restart the deployment after changing environment variables

### Database Connection Issues

1. **Check connection string**:
   - Ensure `DATABASE_URL` is correct
   - Verify Neon database is running

2. **Check IP allowlist**:
   - Vercel's IP addresses must be allowed in Neon
   - Go to Neon Console → Project Settings → IP Allow List
   - Add `0.0.0.0/0` or specific Vercel IPs

3. **View database logs**:
   - Check Neon console for connection errors

### Function Timeouts

If the function times out:

1. Vercel has a 10-second timeout for free tier, 60 seconds for Pro
2. Optimize database queries
3. Consider upgrading to Vercel Pro

## Important Notes

### Cold Starts
- Vercel serverless functions may experience cold starts
- The bot will still function correctly, just with a slight delay on the first request
- Subsequent requests will be faster

### Function Memory
- Current configuration uses 512MB of memory
- Adjust in `vercel.json` if needed for your use case

### Scaling
- Vercel automatically scales your bot
- No manual server management required
- Pay only for what you use

## Redeploying Your Bot

To redeploy after making changes:

1. Commit and push changes:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```

2. Vercel will automatically deploy (if auto-deploy is enabled)

Or manually redeploy:
- Using CLI: `vercel --prod`
- Using Dashboard: Click "Redeploy" on the Deployments tab

## Reverting to Previous Deployment

If you need to rollback to a previous version:

1. Go to Vercel Dashboard → Your Project → Deployments
2. Find the deployment you want to revert to
3. Click the three dots menu → "Promote to Production"

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegraf Documentation](https://telegraf.js.org/)
- [Neon Database](https://neon.tech)

## Support

If you encounter issues during deployment:

1. Check Vercel logs: Project → Logs
2. Verify all environment variables are set
3. Ensure database connection string is correct
4. Check Telegram webhook status
5. Review [Vercel Troubleshooting Guide](https://vercel.com/support)
