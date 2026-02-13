#!/bin/bash

# HiveTalk Docker Setup for EC2 Free Tier (Amazon Linux 2023)
# Run this after connecting to a fresh EC2 instance
# Usage: chmod +x docker-setup.sh && ./docker-setup.sh

set -e

echo "=========================================="
echo "  HiveTalk Docker Setup (EC2 Free Tier)"
echo "=========================================="

# Update system
echo ">>> Updating system..."
sudo yum update -y

# Create swap space (needed for 1GB RAM instances)
echo ">>> Creating 2GB swap space..."
if [ ! -f /swapfile ]; then
    sudo dd if=/dev/zero of=/swapfile bs=128M count=16
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile swap swap defaults 0 0' | sudo tee -a /etc/fstab
    echo "Swap created successfully"
else
    echo "Swap already exists"
fi

# Show memory
echo ">>> Memory status:"
free -h

# Install Docker
echo ">>> Installing Docker..."
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Install Docker Compose
echo ">>> Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
echo ">>> Installing Git..."
sudo yum install -y git

# Show versions
echo ""
echo "=========================================="
echo "  Installation Complete!"
echo "=========================================="
echo "Docker version: $(docker --version)"
echo "Docker Compose version: $(docker-compose --version)"
echo "Git version: $(git --version)"
echo ""
echo "IMPORTANT: Log out and log back in for Docker group changes!"
echo ""
echo "After re-login, next steps:"
echo "1. Upload or clone your project"
echo "2. Create .env file with your environment variables"
echo "3. docker-compose -f docker-compose.simple.yml up -d"
echo ""
