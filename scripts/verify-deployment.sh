#!/bin/bash

# Friendship Check Bot - Deployment Verification Script
# This script verifies the deployment is working correctly

set -e

echo "🔍 Friendship Check Bot - Deployment Verification"
echo "=================================================="
echo ""

# Check environment variables
echo "✓ Checking environment variables..."

if [ -z "$BOT_TOKEN" ]; then
    echo "❌ BOT_TOKEN is not set"
    exit 1
fi
echo "  ✓ BOT_TOKEN is set"

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL is not set"
    exit 1
fi
echo "  ✓ DATABASE_URL is set"

if [ -z "$NODE_ENV" ]; then
    echo "❌ NODE_ENV is not set"
    exit 1
fi
echo "  ✓ NODE_ENV is set to: $NODE_ENV"

# Check Node.js version
echo ""
echo "✓ Checking Node.js..."
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ is required"
    exit 1
fi
echo "  ✓ Node.js version: $(node --version)"

# Check dist folder
echo ""
echo "✓ Checking build..."
if [ ! -d "dist" ]; then
    echo "⚠️  dist folder not found. Building..."
    npm run build
fi
echo "  ✓ Build files exist"

# Check main entry point
if [ ! -f "dist/index.js" ]; then
    echo "❌ dist/index.js not found"
    exit 1
fi
echo "  ✓ Main entry point exists"

# Check critical modules
echo ""
echo "✓ Checking dependencies..."
if ! npm list telegraf &> /dev/null; then
    echo "❌ telegraf module not found"
    exit 1
fi
echo "  ✓ telegraf is installed"

if ! npm list pg &> /dev/null; then
    echo "❌ pg module not found"
    exit 1
fi
echo "  ✓ pg is installed"

# Summary
echo ""
echo "✅ All checks passed!"
echo ""
echo "Deployment is ready. The bot should be running."
echo ""
echo "To verify the bot is working:"
echo "1. Open Telegram"
echo "2. Search for @friendlyquizbot"
echo "3. Send /start"
echo "4. You should see the welcome message"
echo ""
