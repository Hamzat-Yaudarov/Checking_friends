#!/bin/bash

# Friendship Check Bot - Setup Script
# This script helps set up the development environment

set -e

echo "🚀 Friendship Check Bot - Setup Script"
echo "======================================="
echo ""

# Check Node.js
echo "✓ Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "  Node.js version: $NODE_VERSION"

# Check npm
echo "✓ Checking npm..."
NPM_VERSION=$(npm --version)
echo "  npm version: $NPM_VERSION"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Build TypeScript
echo ""
echo "🔨 Building TypeScript..."
npm run build

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✓ .env file created. Please update it with your credentials:"
    echo "  - BOT_TOKEN"
    echo "  - DATABASE_URL"
    echo ""
    echo "Edit .env and run: npm run dev"
else
    echo "✓ .env file already exists"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your credentials"
echo "2. Run: npm run dev"
echo "3. Open Telegram and test the bot"
echo ""
