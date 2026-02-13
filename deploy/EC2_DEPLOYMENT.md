# AWS EC2 Deployment Guide for HiveTalk

## 1. Launch EC2 Instance

### AWS Console Steps:
1. Go to EC2 Dashboard → Launch Instance
2. **Name:** hivetalk-server
3. **AMI:** Ubuntu Server 22.04 LTS (Free tier eligible)
4. **Instance Type:** t3.small (recommended) or t2.micro (free tier, limited)
5. **Key Pair:** Create new or use existing (.pem file)
6. **Security Group:** Create with these rules:
   - SSH (22) - Your IP
   - HTTP (80) - Anywhere
   - HTTPS (443) - Anywhere
   - Custom TCP (3000) - Anywhere (for testing)
7. **Storage:** 20GB gp3

## 2. Connect to EC2

```bash
# Make key readable
chmod 400 your-key.pem

# Connect
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

## 3. Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version  # Should be v20.x
npm --version

# Install PM2 globally (process manager)
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git
```

## 4. Clone and Setup Project

```bash
# Create app directory
sudo mkdir -p /var/www/hivetalk
sudo chown ubuntu:ubuntu /var/www/hivetalk
cd /var/www/hivetalk

# Clone your repository (replace with your repo URL)
git clone https://github.com/YOUR_USERNAME/discord-clone.git .

# Or upload files using SCP from your local machine:
# scp -i your-key.pem -r ./discord-main/* ubuntu@YOUR_EC2_IP:/var/www/hivetalk/

# Install dependencies
npm install
```

## 5. Environment Variables

```bash
# Create .env file
nano .env
```

Add your environment variables:
```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@your-neon-host/dbname?sslmode=require"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# UploadThing
UPLOADTHING_SECRET=sk_live_xxxxx
UPLOADTHING_APP_ID=xxxxx

# LiveKit
LIVEKIT_API_KEY=xxxxx
LIVEKIT_API_SECRET=xxxxx
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-url

# Redis (Optional - Upstash recommended for production)
REDIS_URL=redis://default:xxxxx@your-redis-host:6379

# App URL (your domain or EC2 IP)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## 6. Build the Application

```bash
# Generate Prisma client
npx prisma generate

# Build Next.js
npm run build
```

## 7. PM2 Process Manager Setup

```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

Add this content:
```javascript
module.exports = {
  apps: [{
    name: 'hivetalk',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/hivetalk',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

Start the application:
```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Run the command it outputs
```

## 8. Nginx Reverse Proxy

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/hivetalk
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    # Or use: server_name _;  for IP-based access

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # WebSocket support
        proxy_read_timeout 86400;
    }

    # Socket.io specific
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable the site:
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/hivetalk /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 9. SSL with Let's Encrypt (Requires Domain)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up automatically
# Test renewal
sudo certbot renew --dry-run
```

## 10. Firewall Setup

```bash
# Enable UFW firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

## 11. Useful Commands

```bash
# View app logs
pm2 logs hivetalk

# Restart app
pm2 restart hivetalk

# Stop app
pm2 stop hivetalk

# Monitor
pm2 monit

# Update code and redeploy
cd /var/www/hivetalk
git pull
npm install
npm run build
pm2 restart hivetalk
```

## 12. Troubleshooting

### Check if app is running:
```bash
pm2 status
curl http://localhost:3000
```

### Check Nginx logs:
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Check app logs:
```bash
pm2 logs hivetalk --lines 100
```

### Memory issues during build:
```bash
# Increase Node memory limit
export NODE_OPTIONS="--max-old-space-size=2048"
npm run build
```

### Prisma issues:
```bash
npx prisma generate
npx prisma db push  # If schema changed
```

## Cost Estimation (Monthly)

| Resource | Estimated Cost |
|----------|----------------|
| EC2 t3.small | ~$15-18 |
| Neon DB (Free tier) | $0 |
| Upstash Redis (Free tier) | $0 |
| Domain (.com) | ~$12/year |
| **Total** | **~$15-20/month** |

## Alternative: Elastic Beanstalk (Easier)

If you want managed deployment:
```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init

# Create environment
eb create hivetalk-prod

# Deploy
eb deploy
```

## Security Checklist

- [ ] SSH key-only access (no password)
- [ ] Security group properly configured
- [ ] SSL certificate installed
- [ ] Environment variables secured
- [ ] PM2 running with non-root user
- [ ] Regular security updates (`sudo apt update && sudo apt upgrade`)
- [ ] Database connection using SSL
