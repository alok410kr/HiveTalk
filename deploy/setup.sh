#!/bin/bash

# HiveTalk EC2 Setup Script
# Run this after connecting to a fresh Ubuntu 22.04 EC2 instance
# Usage: chmod +x setup.sh && ./setup.sh

set -e

echo "=========================================="
echo "  HiveTalk EC2 Setup Script"
echo "=========================================="

# Update system
echo ">>> Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
echo ">>> Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
echo ">>> Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo ">>> Installing Nginx..."
sudo apt install -y nginx

# Install Git
echo ">>> Installing Git..."
sudo apt install -y git

# Install Certbot for SSL
echo ">>> Installing Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# Create app directory
echo ">>> Creating app directory..."
sudo mkdir -p /var/www/hivetalk
sudo chown $USER:$USER /var/www/hivetalk

# Show versions
echo ""
echo "=========================================="
echo "  Installation Complete!"
echo "=========================================="
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "PM2 version: $(pm2 --version)"
echo "Nginx version: $(nginx -v 2>&1)"
echo ""
echo "Next steps:"
echo "1. cd /var/www/hivetalk"
echo "2. Clone or upload your project files"
echo "3. Create .env file with your environment variables"
echo "4. Run: npm install"
echo "5. Run: npx prisma generate"
echo "6. Run: npm run build"
echo "7. Run: pm2 start npm --name 'hivetalk' -- start"
echo "8. Configure Nginx (see EC2_DEPLOYMENT.md)"
echo ""
