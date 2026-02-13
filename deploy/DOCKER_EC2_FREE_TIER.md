# AWS EC2 Free Tier Docker Deployment Guide

Deploy HiveTalk on AWS Free Tier using Docker for easy management.

## Free Tier Limitations

| Resource | Free Tier Limit |
|----------|-----------------|
| EC2 | t2.micro (1 vCPU, 1GB RAM) - 750 hrs/month |
| Storage | 30GB EBS |
| Data Transfer | 15GB/month outbound |

**Important:** 1GB RAM is tight for building Next.js. We'll build the Docker image locally or use swap space.

---

## Option A: Build Locally, Deploy Image (Recommended)

### Step 1: Build Docker Image Locally

On your local machine (Windows/Mac/Linux):

```bash
# Navigate to project
cd discord-main

# Build the image
docker build -t hivetalk:latest .

# Save image to file
docker save hivetalk:latest | gzip > hivetalk.tar.gz
```

### Step 2: Launch EC2 Instance

1. Go to AWS Console → EC2 → Launch Instance
2. **Name:** hivetalk
3. **AMI:** Amazon Linux 2023 (free tier eligible)
4. **Instance Type:** t2.micro (free tier)
5. **Key Pair:** Create or select existing
6. **Security Group Rules:**
   - SSH (22) - Your IP
   - HTTP (80) - Anywhere (0.0.0.0/0)
   - HTTPS (443) - Anywhere
7. **Storage:** 20GB gp3
8. **Launch!**

### Step 3: Connect and Setup EC2

```bash
# Connect to EC2
ssh -i your-key.pem ec2-user@YOUR_EC2_PUBLIC_IP

# Install Docker
sudo yum update -y
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for group changes
exit
```

### Step 4: Upload Image and Files

From your local machine:

```bash
# Upload Docker image
scp -i your-key.pem hivetalk.tar.gz ec2-user@YOUR_EC2_IP:~/

# Upload docker-compose and env files
scp -i your-key.pem docker-compose.simple.yml ec2-user@YOUR_EC2_IP:~/docker-compose.yml
scp -i your-key.pem .env ec2-user@YOUR_EC2_IP:~/.env
```

### Step 5: Load and Run

SSH back into EC2:

```bash
ssh -i your-key.pem ec2-user@YOUR_EC2_PUBLIC_IP

# Load the Docker image
gunzip -c hivetalk.tar.gz | docker load

# Run the container
docker-compose up -d

# Check logs
docker logs -f hivetalk
```

### Step 6: Access Your App

Visit: `http://YOUR_EC2_PUBLIC_IP:3000`

---

## Option B: Build on EC2 with Swap (Free but Slower)

If you want to build directly on EC2:

### Step 1: Launch EC2 (same as above)

### Step 2: Setup with Swap Space

```bash
# Connect
ssh -i your-key.pem ec2-user@YOUR_EC2_PUBLIC_IP

# Create 2GB swap file (needed for build)
sudo dd if=/dev/zero of=/swapfile bs=128M count=16
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make swap permanent
echo '/swapfile swap swap defaults 0 0' | sudo tee -a /etc/fstab

# Verify swap
free -h

# Install Docker
sudo yum update -y
sudo yum install -y docker git
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again
exit
```

### Step 3: Clone and Build

```bash
ssh -i your-key.pem ec2-user@YOUR_EC2_PUBLIC_IP

# Clone your repo
git clone https://github.com/YOUR_USERNAME/discord-clone.git
cd discord-clone

# Create .env file
nano .env
# Add your environment variables (see .env.production.example)

# Build (this will take 10-15 minutes with swap)
docker-compose -f docker-compose.simple.yml build

# Run
docker-compose -f docker-compose.simple.yml up -d
```

---

## Environment Variables (.env)

Create `.env` file with:

```env
# Database (Neon - Free tier available)
DATABASE_URL="postgresql://user:pass@host.neon.tech/db?sslmode=require"

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# UploadThing
UPLOADTHING_SECRET=sk_live_xxx
UPLOADTHING_APP_ID=xxx

# LiveKit
LIVEKIT_API_KEY=xxx
LIVEKIT_API_SECRET=xxx
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud

# Redis (Optional - Upstash free tier)
REDIS_URL=

# App URL
NEXT_PUBLIC_SITE_URL=http://YOUR_EC2_PUBLIC_IP:3000
```

---

## Adding Nginx + SSL (Optional)

For production with a domain:

```bash
# Create directories
mkdir -p certbot/conf certbot/www

# Copy nginx config
# Upload deploy/nginx-docker.conf to ~/nginx-docker.conf

# Get SSL certificate first (replace yourdomain.com)
docker run -it --rm \
  -v $(pwd)/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/certbot/www:/var/www/certbot \
  -p 80:80 \
  certbot/certbot certonly --standalone \
  -d yourdomain.com -d www.yourdomain.com

# Now use full docker-compose.yml
docker-compose down
docker-compose up -d
```

---

## Useful Commands

```bash
# View logs
docker logs -f hivetalk

# Restart container
docker-compose restart

# Stop
docker-compose down

# Update to new version
docker-compose down
docker load < hivetalk-new.tar.gz
docker-compose up -d

# Check resource usage
docker stats

# Shell into container
docker exec -it hivetalk sh
```

---

## Monitoring & Maintenance

### Check Container Health
```bash
docker ps
curl http://localhost:3000/api/test-v2
```

### Auto-restart on Reboot
Docker Compose with `restart: unless-stopped` handles this automatically.

### View Logs
```bash
# Last 100 lines
docker logs --tail 100 hivetalk

# Follow logs
docker logs -f hivetalk
```

---

## Cost Summary (Free Tier)

| Service | Cost |
|---------|------|
| EC2 t2.micro | $0 (750 hrs/month free) |
| EBS 20GB | $0 (30GB free) |
| Neon PostgreSQL | $0 (free tier) |
| Upstash Redis | $0 (free tier) |
| LiveKit Cloud | $0 (free tier available) |
| UploadThing | $0 (free tier) |
| Clerk | $0 (10k MAU free) |
| **Total** | **$0/month** |

**Note:** After 12 months, EC2 free tier expires. Consider:
- AWS Lightsail ($3.50/month)
- DigitalOcean ($4/month)
- Railway/Render (free tiers available)

---

## Troubleshooting

### Out of Memory During Build
```bash
# Add more swap
sudo dd if=/dev/zero of=/swapfile2 bs=128M count=16
sudo mkswap /swapfile2
sudo swapon /swapfile2
```

### Container Keeps Restarting
```bash
# Check logs
docker logs hivetalk

# Common issues:
# - Missing environment variables
# - Database connection failed
# - Port already in use
```

### Cannot Connect to App
```bash
# Check if container is running
docker ps

# Check if port is listening
netstat -tlnp | grep 3000

# Check security group in AWS Console
# Make sure port 3000 (or 80) is open
```
