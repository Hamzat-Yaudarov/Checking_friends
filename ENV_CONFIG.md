# Environment Configuration Guide

## Overview

The Friendship Check Bot uses environment variables to configure sensitive information and deployment settings. This guide explains all available variables.

## Required Variables

### BOT_TOKEN
- **What**: Telegram Bot API Token
- **Where to get**: From [@BotFather](https://t.me/BotFather) on Telegram
- **Value**: `8357920603:AAEcRZlAzCebZxQCIRLPQWRASZL-3upZOC8`
- **Example**: `BOT_TOKEN=8357920603:AAEcRZlAzCebZxQCIRLPQWRASZL-3upZOC8`

### DATABASE_URL
- **What**: PostgreSQL connection string (Neon)
- **Format**: `postgresql://user:password@host:port/database?sslmode=require&channel_binding=require`
- **Value**: `postgresql://neondb_owner:npg_5Q1JLwpTliPo@ep-sweet-firefly-agmtcj1n-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
- **Example**:
  ```
  DATABASE_URL=postgresql://neondb_owner:npg_5Q1JLwpTliPo@ep-sweet-firefly-agmtcj1n-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
  ```

### NODE_ENV
- **What**: Environment type (development or production)
- **Values**:
  - `development` - Uses polling mode, more logs
  - `production` - Uses webhook mode, optimized
- **Default**: `development`
- **Examples**:
  ```
  NODE_ENV=development
  NODE_ENV=production
  ```

### PORT
- **What**: HTTP port for the bot server
- **Default**: `3001`
- **Railway**: Automatically set by Railway
- **Example**: `PORT=3001`

## Optional Variables

### RAILWAY_PUBLIC_DOMAIN
- **What**: Public domain for Railway deployment
- **Where**: Automatically set by Railway
- **Format**: `yourapp.railway.app`
- **Note**: Don't set manually, Railway handles this

### LOG_LEVEL
- **What**: Logging verbosity
- **Values**:
  - `debug` - Very detailed
  - `info` - Standard
  - `warn` - Warnings and errors only
  - `error` - Errors only
- **Default**: `info`

## Setup Instructions

### Local Development

1. **Copy the example file**:
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your credentials**:
   ```env
   BOT_TOKEN=8357920603:AAEcRZlAzCebZxQCIRLPQWRASZL-3upZOC8
   DATABASE_URL=postgresql://neondb_owner:npg_5Q1JLwpTliPo@ep-sweet-firefly-agmtcj1n-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   NODE_ENV=development
   PORT=3001
   ```

3. **Start the bot**:
   ```bash
   npm run dev
   ```

### Railway Deployment

1. **Go to Railway Dashboard**:
   - https://railway.app/dashboard

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub"
   - Select your repository

3. **Add Environment Variables**:
   - Go to Variables tab
   - Click "Add Variable"
   - Add each variable:

   ```
   BOT_TOKEN
   8357920603:AAEcRZlAzCebZxQCIRLPQWRASZL-3upZOC8
   
   DATABASE_URL
   postgresql://neondb_owner:npg_5Q1JLwpTliPo@ep-sweet-firefly-agmtcj1n-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   
   NODE_ENV
   production
   
   PORT
   3001
   ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Check logs for success message

## Common Mistakes

### ❌ Don't Do This

1. **Hardcode credentials in code**:
   ```typescript
   // WRONG!
   const token = '8357920603:AAEcRZlAzCebZxQCIRLPQWRASZL-3upZOC8';
   ```

2. **Commit `.env` file to Git**:
   ```bash
   # .env is in .gitignore for a reason!
   ```

3. **Use different credentials for local vs production**:
   ```env
   # WRONG!
   # Local development
   BOT_TOKEN=local_token
   # Production
   BOT_TOKEN=prod_token
   ```

4. **Leave placeholder values**:
   ```env
   # WRONG!
   BOT_TOKEN=your_token_here
   DATABASE_URL=your_connection_string
   ```

### ✅ Do This Instead

1. **Keep credentials in environment**:
   ```bash
   # Create .env locally
   # Set variables in Railway dashboard
   # Never commit .env
   ```

2. **Use same credentials everywhere** (or at least valid ones):
   ```bash
   # .env (development and production use real credentials)
   BOT_TOKEN=<real_token>
   DATABASE_URL=<real_connection_string>
   ```

3. **Add to .gitignore**:
   ```bash
   # Already in .gitignore
   .env
   .env.local
   .env.*.local
   ```

4. **Verify before deploying**:
   ```bash
   # Check that all required variables are set
   echo $BOT_TOKEN
   echo $DATABASE_URL
   ```

## Verifying Configuration

### Check Local Configuration

```bash
# See current environment
env | grep -E "BOT_TOKEN|DATABASE_URL|NODE_ENV|PORT"

# Or check .env file
cat .env
```

### Check Railway Configuration

1. Go to Railway dashboard
2. Select your project
3. Go to "Variables" tab
4. See all configured variables

## Troubleshooting

### "BOT_TOKEN is not defined" Error

**Solution**: 
- Add `BOT_TOKEN` to your `.env` file
- Or set in Railway Variables
- Ensure no typos

### "Cannot connect to database" Error

**Solution**:
- Verify `DATABASE_URL` is correct
- Test connection manually:
  ```bash
  psql $DATABASE_URL -c "SELECT 1"
  ```
- Check Neon dashboard for firewall rules
- Ensure SSL mode is enabled

### "Invalid PORT" Error

**Solution**:
- PORT should be a number (default: 3001)
- Railway automatically sets PORT
- Don't change in production

### Bot Doesn't Respond

**Solution**:
- Verify `BOT_TOKEN` is correct
- Check bot username (@friendlyquizbot)
- Check logs for errors
- Ensure `NODE_ENV` is set

## Security Best Practices

1. **Rotate credentials regularly**
   - Change bot token if compromised
   - Update database password monthly

2. **Never share credentials**
   - Don't send via email
   - Don't commit to Git
   - Don't share in screenshots

3. **Use different credentials for environments**
   - Consider separate Railway/Neon projects for staging
   - Keep production credentials secure

4. **Monitor usage**
   - Check bot activity regularly
   - Monitor database connections
   - Review Railway logs

## Environment Variable Types

### String Variables
```env
BOT_TOKEN=8357920603:AAEcRZlAzCebZxQCIRLPQWRASZL-3upZOC8
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
```

### Number Variables
```env
PORT=3001
```

### Boolean Variables
```env
NODE_ENV=production
```

## Reference

| Variable | Type | Required | Default | Example |
|----------|------|----------|---------|---------|
| BOT_TOKEN | string | ✓ | - | 8357920603:AAE... |
| DATABASE_URL | string | ✓ | - | postgresql://... |
| NODE_ENV | string | ✓ | development | production |
| PORT | number | ✗ | 3001 | 3001 |
| RAILWAY_PUBLIC_DOMAIN | string | ✗ | - | app.railway.app |

## Support

If you're having issues with environment configuration:

1. Check this guide
2. Review your `.env` file
3. Check Railway Variables tab
4. Review logs: `railway logs --follow`
5. Check [Troubleshooting](#troubleshooting) section
