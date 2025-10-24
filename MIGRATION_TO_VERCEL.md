# Migration from Railway to Vercel ✅

## Summary of Changes

Your Friendship Check Bot has been successfully configured for deployment on Vercel. Here's what was changed:

### New Files Created
- **`api/index.ts`** - Vercel serverless function handler that replaces the custom HTTP server
- **`vercel.json`** - Vercel-specific configuration file for deployment
- **`VERCEL_DEPLOYMENT.md`** - Comprehensive deployment guide

### Files Modified
- **`package.json`** - Updated build and start scripts
- **`tsconfig.json`** - Updated to include API directory in compilation
- **`README.md`** - Updated hosting information from Railway to Vercel
- **`.env.example`** - Updated for Vercel (removed PORT and RAILWAY_PUBLIC_DOMAIN)

### Files Removed
- **`railway.json`** - Railway-specific configuration ❌
- **`nixpacks.toml`** - Railway build configuration ❌
- **`Procfile`** - Railway process file ❌

## Key Improvements with Vercel

✅ **Serverless Architecture**: No need to manage servers, Vercel handles scaling automatically

✅ **Webhook-Based Bot**: Your bot now uses Telegram webhooks (no polling) which is more efficient

✅ **Cold Start Optimized**: Fast initialization and caching for subsequent requests

✅ **Better Monitoring**: Integrated logs and error tracking through Vercel dashboard

✅ **Zero Configuration Deployments**: Push to Git and Vercel automatically deploys

## Next Steps

### 1. **Update Your Git Repository**
```bash
git add .
git commit -m "Switch from Railway to Vercel deployment"
git push origin main
```

### 2. **Deploy to Vercel**

Choose one of these options:

**Option A: Vercel CLI (Recommended)**
```bash
npm install -g vercel
vercel
```

**Option B: Web Dashboard**
- Go to https://vercel.com/dashboard
- Click "Add New" → "Project"
- Select your GitHub repository
- Click "Deploy"

### 3. **Set Environment Variables**

In Vercel Dashboard → Your Project → Settings → Environment Variables, add:
- `BOT_TOKEN`: Your Telegram bot token
- `DATABASE_URL`: Your Neon database connection string

### 4. **Configure Telegram Webhook**

After deployment, update your bot's webhook URL to point to Vercel:

```bash
curl -X POST https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook \
  -d "url=https://<your-vercel-project>.vercel.app"
```

Replace:
- `<YOUR_BOT_TOKEN>` with your actual bot token
- `<your-vercel-project>` with your Vercel project name

### 5. **Test Your Bot**

1. Open Telegram
2. Search for `@friendlyquizbot`
3. Send `/start` command
4. Verify the bot responds correctly

## Architecture Changes

### Before (Railway)
```
User Input
    ↓
HTTP Server (Node.js)
    ↓
Bot Handler
    ↓
Database
```

### After (Vercel)
```
Telegram Webhook
    ↓
Vercel Serverless Function
    ↓
Bot Handler
    ↓
Database (Neon)
```

## Important Configuration

### Vercel Function Handler
- **Location**: `api/index.ts`
- **Runtime**: Node.js 20.x
- **Memory**: 512MB
- **Timeout**: 60 seconds (Pro plan) / 10 seconds (Free plan)

### Bot Features (Unchanged)
All bot features remain the same:
- ✨ Create Custom Tests
- 📋 Manage Your Tests
- 🔗 Share with Friends
- 📊 Track Test Results
- 💾 Secure Database Storage

## Troubleshooting

If your bot is not responding after deployment:

1. **Check Webhook Status**:
   ```bash
   curl https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo
   ```

2. **Review Vercel Logs**:
   - Vercel Dashboard → Your Project → Logs
   - Look for any error messages

3. **Verify Environment Variables**:
   - Ensure `BOT_TOKEN` and `DATABASE_URL` are correctly set
   - Restart the deployment after changes

4. **Check Database Connection**:
   - Verify Neon database is running
   - Check IP allow list includes Vercel's servers

## Building Locally

To test the build locally before deploying:

```bash
# Install dependencies
npm install

# Build the project
npm run build

# The compiled code will be in the dist/ folder
```

## Performance Notes

- **Cold Starts**: First request after deployment may take 3-5 seconds (normal for serverless)
- **Subsequent Requests**: Usually respond in <100ms
- **Database**: All queries go through Neon PostgreSQL
- **Caching**: Vercel caches your function for better performance

## Support

For detailed deployment instructions, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

## Rollback to Railway

If you need to revert to Railway:
1. Restore the original files (railway.json, nixpacks.toml, Procfile) from git history
2. Push to main branch
3. Redeploy on Railway

---

**Status**: ✅ Ready for Vercel Deployment

Your bot is now fully configured and ready to be deployed on Vercel. Good luck! 🚀
