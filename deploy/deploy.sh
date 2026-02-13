#!/bin/bash

# HiveTalk Deployment Script
# Run this to deploy updates after initial setup
# Usage: chmod +x deploy.sh && ./deploy.sh

set -e

APP_DIR="/var/www/hivetalk"
APP_NAME="hivetalk"

echo "=========================================="
echo "  Deploying HiveTalk"
echo "=========================================="

cd $APP_DIR

# Pull latest code (if using git)
if [ -d ".git" ]; then
    echo ">>> Pulling latest code..."
    git pull origin main
fi

# Install dependencies
echo ">>> Installing dependencies..."
npm install

# Generate Prisma client
echo ">>> Generating Prisma client..."
npx prisma generate

# Build application
echo ">>> Building application..."
export NODE_OPTIONS="--max-old-space-size=2048"
npm run build

# Restart PM2 process
echo ">>> Restarting application..."
pm2 restart $APP_NAME || pm2 start npm --name $APP_NAME -- start

echo ""
echo "=========================================="
echo "  Deployment Complete!"
echo "=========================================="
echo "Check status: pm2 status"
echo "View logs: pm2 logs $APP_NAME"
echo ""
