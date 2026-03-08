# Campus-for-Hire — Full Deployment Guide

> **Stack:** FastAPI (Python) backend · Next.js 16 frontend · PostgreSQL database  
> **Target:** AWS EC2 (backend) · AWS RDS or Neon (database) · Vercel (frontend)  
> **Region:** `ap-south-1` (Mumbai)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites](#2-prerequisites)
3. [Part A: Database Setup on AWS (RDS PostgreSQL)](#3-part-a-database-setup-on-aws-rds-postgresql)
4. [Part B: Backend Deployment on EC2](#4-part-b-backend-deployment-on-ec2)
5. [Part C: Frontend Deployment on Vercel](#5-part-c-frontend-deployment-on-vercel)
6. [Part D: Domain & SSL Setup](#6-part-d-domain--ssl-setup)
7. [Part E: CI/CD Pipeline (GitHub Actions)](#7-part-e-cicd-pipeline-github-actions)
8. [Part F: Monitoring & Maintenance](#8-part-f-monitoring--maintenance)
9. [Environment Variables Reference](#9-environment-variables-reference)
10. [Troubleshooting](#10-troubleshooting)
11. [Cost Summary](#11-cost-summary)

---

## 1. Architecture Overview

```
┌─────────────┐       HTTPS        ┌──────────────────────┐
│   Browser   │ ◄──────────────►   │  Vercel (Frontend)   │
│  (End User) │                    │  Next.js 16 + React  │
└─────┬───────┘                    └──────────┬───────────┘
      │                                       │
      │  API calls (HTTPS)                    │ NEXT_PUBLIC_API_URL
      │                                       │
      ▼                                       ▼
┌─────────────────────────────────────────────────────┐
│              AWS EC2 (ap-south-1)                    │
│  ┌───────────┐       ┌───────────────────────────┐  │
│  │   Nginx   │──────►│  FastAPI (Uvicorn, 4 wkrs)│  │
│  │  :80/:443 │       │       :8000                │  │
│  └───────────┘       └─────────────┬─────────────┘  │
│                                    │                 │
│              Docker Compose        │                 │
└────────────────────────────────────┼─────────────────┘
                                     │
                          ┌──────────▼──────────┐
                          │  PostgreSQL (RDS)    │
                          │  or Neon Free Tier   │
                          │  Port 5432           │
                          └─────────────────────┘
                                     │
                          ┌──────────▼──────────┐
                          │  AWS Bedrock (AI)    │
                          │  AWS Translate       │
                          └─────────────────────┘
```

---

## 2. Prerequisites

Before starting, ensure you have:

- [ ] **AWS Account** with credits or payment method
- [ ] **AWS CLI** installed and configured locally (`aws configure`)
- [ ] **Docker** and **Docker Compose** installed locally (for testing)
- [ ] **Git** repository with your code pushed
- [ ] **Vercel Account** (free tier works)
- [ ] **Google OAuth credentials** (see `GOOGLE_OAUTH_SETUP.md`)
- [ ] **Domain name** (optional but recommended)
- [ ] **AWS IAM user** with Bedrock + Translate permissions (see `AWS_SETUP.md`)

### Local Tools Required

```bash
# Verify these are available on your local machine
aws --version          # AWS CLI v2
docker --version       # Docker 20+
docker compose version # Docker Compose v2+
git --version          # Git 2.x
ssh                    # SSH client
```

---

## 3. Part A: Database Setup on AWS (RDS PostgreSQL)

You have two options: **AWS RDS** (paid, production-grade) or **Neon** (free tier, easy).

### Option 1: AWS RDS PostgreSQL (Recommended for Production)

#### Before You Click Create

If the RDS console is showing an estimate around `$600` to `$1700` per month, stop and go back. That means you selected a **Multi-AZ DB cluster** with large instances and provisioned IOPS. This project does **not** need that.

For this repo, create a **regular PostgreSQL DB instance**, not an RDS cluster.

#### A. Create the RDS Instance

1. Go to **AWS Console** → **RDS** → **Create database**
2. Choose **Full configuration**
3. Configure:

| Setting | Value |
|---|---|
| Database creation method | **Full configuration** |
| Engine | PostgreSQL 16 |
| Engine version | Latest PostgreSQL 16 minor version |
| Extended Support | **Disabled** |
| Template | **Dev/Test** |
| Availability and durability | **Single-AZ DB instance deployment (1 instance)** |
| DB instance identifier | `campus-for-hire-db` |
| Master username | `postgres` |
| Credentials management | **Self managed** |
| Master password | *(generate a strong password — save it)* |
| Database authentication | **Password authentication** |
| Instance class | `db.t3.micro` or `db.t4g.micro` |
| Storage type | **General Purpose SSD (gp3)** |
| Storage | 20 GB |
| Provisioned IOPS | **Do not enable** |
| Storage autoscaling | Disable (to control costs) |
| Compute resource | **Don't connect to an EC2 compute resource** |
| VPC | Default VPC |
| DB subnet group | `default` |
| Public access | **No** |
| VPC Security Group | Create new: `campus-db-sg` |
| RDS Proxy | **Off** |
| Performance Insights / Database Insights | **Off** |
| Enhanced monitoring | **Off** |
| Log exports | **Off** |
| DevOps Guru | **Off** |
| Database name | `campus_to_hire` |
| Backup retention | 1 to 7 days |
| Deletion protection | Off for dev/test, On for real production |

4. Click **Create database** — takes 5–10 minutes.

> **Do not choose:** `Multi-AZ DB cluster deployment (3 instances)`, `db.m5d.large`, `Provisioned IOPS (io2)`, or `400 GiB` storage. Those are the settings causing the huge monthly estimate.

#### B. Configure Security Group for RDS

1. Go to **EC2** → **Security Groups** → find `campus-db-sg`
2. Edit **Inbound rules**:

| Type | Port | Source | Purpose |
|---|---|---|---|
| PostgreSQL | 5432 | EC2 Security Group ID | Backend access |
| PostgreSQL | 5432 | Your IP/32 | Local dev access |

> **Security:** Remove "Your IP" rule once initial setup is done. Only EC2 should access the DB.

#### C. Get the Connection Endpoint

1. Go to **RDS** → **Databases** → `campus-for-hire-db`
2. Copy the **Endpoint** (e.g., `campus-for-hire-db.xxxx.ap-south-1.rds.amazonaws.com`)
3. Construct your `DATABASE_URL`:

```
postgresql://postgres:YOUR_PASSWORD@campus-for-hire-db.xxxx.ap-south-1.rds.amazonaws.com:5432/campus_to_hire
```

#### D. Test Connection Locally

```bash
# Install psql if not available
# On Mac: brew install libpq
# On Linux: sudo apt install postgresql-client

psql "postgresql://postgres:YOUR_PASSWORD@campus-for-hire-db.xxxx.ap-south-1.rds.amazonaws.com:5432/campus_to_hire"

# If connected, run:
\dt   -- should show no tables yet (migrations not run)
\q    -- exit
```

### Option 2: Neon Free Tier (Budget-Friendly)

Neon provides a free PostgreSQL database with generous limits.

1. Go to [neon.tech](https://neon.tech) → **Sign up** (GitHub login works)
2. Create a **New Project**:
   - Name: `campus-for-hire`
   - Region: **Asia Pacific (Singapore)** — closest to India
   - PostgreSQL version: 16
3. Copy the connection string from the dashboard:
   ```
   postgresql://neondb_owner:xxxx@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Use this as your `DATABASE_URL`

> **Neon Free Tier Limits:** 0.5 GB storage, 1 project, auto-suspend after 5 min idle. Great for dev/demo but consider RDS for production.

### Run Initial Migrations

After setting up the database (either option):

```bash
cd backend

# Set the DATABASE_URL in your .env file first
# Then run:
alembic upgrade head
```

Expected output:
```
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade  -> 0001, initial schema
INFO  [alembic.runtime.migration] Running upgrade 0001 -> 02eae7fc3b7f, add google_id to users
INFO  [alembic.runtime.migration] Running upgrade 02eae7fc3b7f -> 6f2b9c3d4e5f, add resources table
INFO  [alembic.runtime.migration] Running upgrade 6f2b9c3d4e5f -> 8b9c0d1e2f3a, add target_role and focus_area
```

---

## 4. Part B: Backend Deployment on EC2

### Step 1: Launch EC2 Instance

1. Go to **AWS Console** → **EC2** → **Launch instance**
2. Configure:

| Setting | Value |
|---|---|
| Name | `campus-for-hire-backend` |
| AMI | **Amazon Linux 2023** (free tier eligible) |
| Instance type | `t2.micro` (free tier) or `t3.micro` ($0.0052/hr) |
| Key pair | Create new → `campus-for-hire-key` → download `.pem` |
| Network | Default VPC, public subnet |
| Auto-assign public IP | **Enable** |
| Security group | Create new: `campus-backend-sg` |
| Storage | 20 GB gp3 |

3. Security group inbound rules:

| Type | Port | Source | Purpose |
|---|---|---|---|
| SSH | 22 | Your IP/32 | SSH access |
| HTTP | 80 | 0.0.0.0/0 | Nginx HTTP |
| HTTPS | 443 | 0.0.0.0/0 | Nginx HTTPS |
| Custom TCP | 8000 | 0.0.0.0/0 | FastAPI direct (remove after Nginx setup) |

4. Click **Launch instance**

### Step 2: Allocate Elastic IP (Optional but Recommended)

An Elastic IP gives your instance a static public IP that doesn't change on reboot.

1. Go to **EC2** → **Elastic IPs** → **Allocate Elastic IP address**
2. Click **Allocate**
3. Select the new IP → **Actions** → **Associate Elastic IP address**
4. Select your EC2 instance → **Associate**

> **Note:** Since Feb 2024, AWS charges **$0.005/hr (~$3.60/month)** for all public IPv4 addresses, including Elastic IPs — even when attached to a running instance. This is a small but real cost. You can skip this step and use the instance's auto-assigned public IP if you're okay with it changing on reboot.

### Step 3: SSH into EC2 & Install Dependencies

```bash
# Fix key permissions (run locally)
# Linux/Mac:
chmod 400 ~/.ssh/campus-for-hire-key.pem
# Windows (PowerShell):
icacls "$HOME\.ssh\campus-for-hire-key.pem" /reset
icacls "$HOME\.ssh\campus-for-hire-key.pem" /grant:r "$($env:USERNAME):(R)"
icacls "$HOME\.ssh\campus-for-hire-key.pem" /inheritance:r

# SSH into the instance
ssh -i ~/.ssh/campus-for-hire-key.pem ec2-user@<YOUR_EC2_PUBLIC_IP>
```

#### Install Docker & Docker Compose

```bash
# Update system packages
sudo yum update -y

# Install Docker
sudo yum install -y docker git

# Start Docker and enable on boot
sudo systemctl start docker
sudo systemctl enable docker

# Add ec2-user to docker group (avoids needing sudo)
sudo usermod -aG docker ec2-user

# Apply group change without logging out:
newgrp docker

# Verify Docker works without sudo
docker --version
docker ps

# Install Docker Compose v2 plugin
# AL2023 uses /usr/libexec/docker/cli-plugins/ for Docker plugins
sudo mkdir -p /usr/libexec/docker/cli-plugins
sudo curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m)" \
  -o /usr/libexec/docker/cli-plugins/docker-compose
sudo chmod +x /usr/libexec/docker/cli-plugins/docker-compose

# Verify (note: "docker compose" with a SPACE, not "docker-compose" with a hyphen)
docker compose version
```

### Step 4: Clone Your Repository

```bash
# Clone the repo
git clone <YOUR_REPO_URL> campus-for-hire
cd campus-for-hire/backend
```

If your repo is private, set up a **deploy key** or use a **personal access token**:

```bash
# Option A: GitHub Personal Access Token
git clone https://<YOUR_GITHUB_TOKEN>@github.com/<username>/campus-for-hire.git

# Option B: SSH Deploy Key
ssh-keygen -t ed25519 -C "ec2-deploy" -f ~/.ssh/deploy_key -N ""
cat ~/.ssh/deploy_key.pub
# Add this public key to GitHub → Repo Settings → Deploy Keys
```

### Step 5: Create the Production `.env` File

```bash
cd ~/campus-for-hire/backend

# Create the .env file
cat > .env << 'ENVEOF'
# =============================================
# DATABASE
# =============================================
DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@YOUR_RDS_ENDPOINT:5432/campus_to_hire

# =============================================
# JWT Authentication
# =============================================
JWT_SECRET=GENERATE_A_STRONG_RANDOM_SECRET_HERE
JWT_ALGORITHM=HS256

# =============================================
# AWS Services
# =============================================
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=AKIA...YOUR_KEY
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY

# =============================================
# Amazon Bedrock
# =============================================
BEDROCK_MODEL_ID=amazon.nova-lite-v1:0
NOVA_SONIC_MODEL_ID=amazon.nova-sonic-v1:0

# =============================================
# CORS — Your frontend URLs
# =============================================
CORS_ORIGINS=["https://your-app.vercel.app","https://yourdomain.com"]

# =============================================
# API Settings
# =============================================
API_PREFIX=/api
LOG_LEVEL=INFO
ENVIRONMENT=production

# =============================================
# Rate Limiting
# =============================================
RATE_LIMIT_REQUESTS_PER_MINUTE=300
RATE_LIMIT_BURST_SIZE=100

# =============================================
# Google OAuth
# =============================================
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://your-app.vercel.app/auth/callback/google

# =============================================
# Database Pool (production tuning)
# =============================================
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20
DB_POOL_TIMEOUT=30
DB_POOL_RECYCLE=1800
AUTO_CREATE_TABLES=false
ENVEOF
```

**Generate a secure JWT secret:**

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(64))"
# Copy the output and paste it as JWT_SECRET in .env
```

### Step 6: Verify the Nginx Dockerfile Exists

The production compose file builds Nginx from `backend/nginx/Dockerfile`. This repo should contain:

```Dockerfile
FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY proxy_params /etc/nginx/proxy_params
```

### Step 7: Build & Run with Docker Compose

```bash
cd ~/campus-for-hire/backend

# Build and start in detached mode (production compose)
docker compose -f docker-compose.prod.yml up -d --build

# Check the containers are running
docker compose -f docker-compose.prod.yml ps

# Expected output:
# NAME                      STATUS    PORTS
# campus-for-hire-api       Up        0.0.0.0:8000->8000/tcp
# campus-for-hire-nginx     Up        0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp

# Check logs
docker compose -f docker-compose.prod.yml logs -f api
# Press Ctrl+C to stop following logs
```

### Step 8: Run Database Migrations on EC2

```bash
# Run migrations inside the running API container
docker compose -f docker-compose.prod.yml exec api alembic upgrade head

# Verify migrations ran
docker compose -f docker-compose.prod.yml exec api alembic current
```

### Step 9: Verify the Backend is Running

```bash
# Test from inside EC2
curl http://localhost:8000/health
# Expected: {"status":"healthy"}

curl http://localhost:8000/
# Expected: {"status":"ok","message":"Campus-for-Hire API is running"}

# Test from Nginx
curl http://localhost:80/health
# Expected: {"status":"healthy"}
```

**Test from your local machine:**

```bash
curl http://<YOUR_EC2_PUBLIC_IP>/health
# Expected: {"status":"healthy"}

curl http://<YOUR_EC2_PUBLIC_IP>/api/auth/test
```

### Step 10: Useful Docker Commands

```bash
# View running containers
docker compose -f docker-compose.prod.yml ps

# View real-time logs
docker compose -f docker-compose.prod.yml logs -f

# View only API logs
docker compose -f docker-compose.prod.yml logs -f api

# Restart a specific service
docker compose -f docker-compose.prod.yml restart api

# Stop everything
docker compose -f docker-compose.prod.yml down

# Rebuild and restart (after code changes)
docker compose -f docker-compose.prod.yml up -d --build

# Shell into the API container
docker compose -f docker-compose.prod.yml exec api /bin/bash

# Check resource usage
docker stats
```

---

## 5. Part C: Frontend Deployment on Vercel

### Step 1: Push Code to GitHub

Ensure your frontend code is pushed to a GitHub repository.

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) → **Sign up / Log in** with GitHub
2. Click **Add New Project**
3. Select your `campus-for-hire` repository
4. Configure:

| Setting | Value |
|---|---|
| Framework Preset | **Next.js** |
| Root Directory | `frontend` |
| Build Command | `next build` (auto-detected) |
| Output Directory | `.next` (auto-detected) |
| Install Command | `npm install` |

### Step 3: Set Environment Variables in Vercel

Go to **Project Settings** → **Environment Variables** and add:

| Variable | Value | Environment |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.yourdomain.com` (or `http://<EC2_IP>`) | Production, Preview |
| `GOOGLE_CLIENT_ID` | `your-client-id.apps.googleusercontent.com` | All |
| `GOOGLE_CLIENT_SECRET` | `your-google-secret` | All |
| `NEXTAUTH_SECRET` | *(generate with `openssl rand -base64 32`)* | All |
| `NEXTAUTH_URL` | `https://yourdomain.com` | Production |
| `NEXTAUTH_URL` | `https://your-branch.vercel.app` | Preview |

> **Important:** `NEXT_PUBLIC_API_URL` must point to your running EC2 backend. Use the Elastic IP or domain name.

### Step 4: Deploy

1. Click **Deploy** — Vercel builds and deploys automatically
2. After deployment, you get a URL like `https://campus-for-hire.vercel.app`

### Step 5: Update CORS on Backend

After getting your Vercel URL, update the backend `.env` on EC2:

```bash
ssh -i ~/.ssh/campus-for-hire-key.pem ec2-user@<YOUR_EC2_IP>
cd ~/campus-for-hire/backend

# Edit .env
nano .env
# Update CORS_ORIGINS to include your Vercel URL:
# CORS_ORIGINS=["https://campus-for-hire.vercel.app","https://yourdomain.com","http://localhost:3000"]

# Restart to apply
docker compose -f docker-compose.prod.yml restart api
```

### Step 6: Update Google OAuth Redirect URIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**
2. Edit your OAuth 2.0 Client ID
3. Add to **Authorized JavaScript origins:**
   - `https://campus-for-hire.vercel.app`
   - `https://yourdomain.com` (if using custom domain)
4. Add to **Authorized redirect URIs:**
   - `https://campus-for-hire.vercel.app/auth/callback/google`
   - `https://yourdomain.com/auth/callback/google`
5. Save

### Step 7: Vercel Custom Domain (Optional)

1. Go to **Vercel** → your project → **Settings** → **Domains**
2. Add your custom domain (e.g., `yourdomain.com`)
3. Follow Vercel's instructions to update DNS records:
   - **A Record:** `76.76.21.21`
   - **CNAME:** `cname.vercel-dns.com`

### Automatic Deployments

Vercel automatically re-deploys when you push to your main branch:

```bash
git add .
git commit -m "update feature"
git push origin main
# Vercel auto-deploys within ~60 seconds
```

---

## 6. Part D: Domain & SSL Setup

### For Backend (EC2 with Nginx + Let's Encrypt)

#### A. Point Domain to EC2

Add a DNS **A record** for your API subdomain:

| Type | Name | Value | TTL |
|---|---|---|---|
| A | `api` | `<EC2_ELASTIC_IP>` | 300 |

This creates `api.yourdomain.com` → your EC2 instance.

#### B. Install Certbot on EC2

```bash
ssh -i ~/.ssh/campus-for-hire-key.pem ec2-user@<YOUR_EC2_IP>

# Install certbot from the Amazon Linux 2023 repositories
sudo dnf install -y certbot

# Stop Nginx temporarily (certbot needs port 80)
docker compose -f docker-compose.prod.yml stop nginx

# Get SSL certificate
sudo certbot certonly --standalone \
  -d api.yourdomain.com \
  --non-interactive \
  --agree-tos \
  --email your@email.com

# Certificates are saved to:
#   /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem
#   /etc/letsencrypt/live/api.yourdomain.com/privkey.pem
```

#### C. Copy Certs for Nginx

```bash
# Create SSL directory for Docker
mkdir -p ~/campus-for-hire/backend/nginx/ssl

# Copy certificates
sudo cp /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem \
  ~/campus-for-hire/backend/nginx/ssl/
sudo cp /etc/letsencrypt/live/api.yourdomain.com/privkey.pem \
  ~/campus-for-hire/backend/nginx/ssl/
sudo chown ec2-user:ec2-user ~/campus-for-hire/backend/nginx/ssl/*
```

#### D. Enable SSL in Nginx Config

Edit `nginx/nginx.conf` — uncomment the HTTPS server block and update:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    # Redirect HTTP to HTTPS
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # ... rest of your server config (location blocks, etc.)
    location / {
        proxy_pass http://api_backend;
        include /etc/nginx/proxy_params;
    }
}
```

Rebuild:
```bash
docker compose -f docker-compose.prod.yml up -d --build nginx
```

#### E. Auto-Renew SSL Certificates

```bash
# Set up a cron job for auto-renewal
sudo crontab -e

# Add this line (runs at 2:30 AM on the 1st and 15th of each month):
30 2 1,15 * * certbot renew --quiet --pre-hook "docker compose -f /home/ec2-user/campus-for-hire/backend/docker-compose.prod.yml stop nginx" --post-hook "cp /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem /home/ec2-user/campus-for-hire/backend/nginx/ssl/ && cp /etc/letsencrypt/live/api.yourdomain.com/privkey.pem /home/ec2-user/campus-for-hire/backend/nginx/ssl/ && docker compose -f /home/ec2-user/campus-for-hire/backend/docker-compose.prod.yml up -d nginx"
```

---

## 7. Part E: CI/CD Pipeline (GitHub Actions)

### Backend – Auto Deploy on Push

Create `.github/workflows/deploy-backend.yml`:

```yaml
name: Deploy Backend to EC2

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to EC2 via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ec2-user
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd ~/campus-for-hire
            git pull origin main
            cd backend
            docker compose -f docker-compose.prod.yml up -d --build
            docker compose -f docker-compose.prod.yml exec -T api alembic upgrade head
            echo "✅ Backend deployed successfully"
```

### Required GitHub Secrets

Go to **GitHub Repo** → **Settings** → **Secrets and variables** → **Actions** → add:

| Secret Name | Value |
|---|---|
| `EC2_HOST` | Your EC2 Elastic IP address |
| `EC2_SSH_KEY` | Contents of your `.pem` file |

### Frontend – Auto Deployed by Vercel

Vercel automatically deploys when you push to `main`. No additional CI/CD setup needed.

---

## 8. Part F: Monitoring & Maintenance

### Log Management

```bash
# View API logs
docker compose -f docker-compose.prod.yml logs -f api --tail=100

# View Nginx access logs
docker compose -f docker-compose.prod.yml logs -f nginx --tail=100

# Logs are also saved to disk
ls -la ~/campus-for-hire/backend/logs/
```

### Health Checks

```bash
# Quick health check
curl -s https://api.yourdomain.com/health | python3 -m json.tool

# Create a simple monitoring script
cat > ~/monitor.sh << 'EOF'
#!/bin/bash
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" https://api.yourdomain.com/health)
if [ "$HEALTH" != "200" ]; then
  echo "[$(date)] ❌ API is DOWN (status: $HEALTH)" >> ~/monitor.log
  # Restart containers
  cd ~/campus-for-hire/backend
  docker compose -f docker-compose.prod.yml restart
else
  echo "[$(date)] ✅ API is healthy" >> ~/monitor.log
fi
EOF
chmod +x ~/monitor.sh

# Run every 5 minutes via cron
crontab -e
# Add: */5 * * * * /home/ec2-user/monitor.sh
```

### Backup Database (RDS)

RDS automated backups are enabled by default (7-day retention). For manual snapshots:

```bash
aws rds create-db-snapshot \
  --db-instance-identifier campus-for-hire-db \
  --db-snapshot-identifier campus-backup-$(date +%Y%m%d) \
  --region ap-south-1
```

### Updating the Application

```bash
ssh -i ~/.ssh/campus-for-hire-key.pem ec2-user@<YOUR_EC2_IP>

cd ~/campus-for-hire

# Pull latest code
git pull origin main

# Rebuild and restart backend
cd backend
docker compose -f docker-compose.prod.yml up -d --build

# Run any new migrations
docker compose -f docker-compose.prod.yml exec api alembic upgrade head

# Verify
curl http://localhost:8000/health
```

### Scaling Up (When Needed)

| Bottleneck | Solution |
|---|---|
| CPU hitting 100% | Upgrade EC2: `t3.micro` → `t3.small` → `t3.medium` |
| Database slow | Upgrade RDS: `db.t3.micro` → `db.t3.small` |
| More concurrent users | Increase Uvicorn workers in `docker-compose.prod.yml` |
| Global latency | Add CloudFront in front of EC2 |

---

## 9. Environment Variables Reference

### Backend `.env` (on EC2)

| Variable | Required | Example | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ | `postgresql://user:pass@host:5432/db` | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | `<64-char random string>` | JWT signing secret |
| `JWT_ALGORITHM` | ❌ | `HS256` | JWT algorithm (default: HS256) |
| `AWS_REGION` | ✅ | `ap-south-1` | AWS region for Bedrock/Translate |
| `AWS_ACCESS_KEY_ID` | ✅ | `AKIA...` | IAM user access key |
| `AWS_SECRET_ACCESS_KEY` | ✅ | `...` | IAM user secret key |
| `BEDROCK_MODEL_ID` | ❌ | `amazon.nova-lite-v1:0` | Bedrock model ID |
| `NOVA_SONIC_MODEL_ID` | ❌ | `amazon.nova-sonic-v1:0` | Voice model ID |
| `CORS_ORIGINS` | ✅ | `["https://app.vercel.app"]` | Allowed frontend origins |
| `API_PREFIX` | ❌ | `/api` | API route prefix |
| `LOG_LEVEL` | ❌ | `INFO` | Logging level |
| `GOOGLE_CLIENT_ID` | ✅ | `...apps.googleusercontent.com` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | ✅ | `...` | Google OAuth secret |
| `GOOGLE_REDIRECT_URI` | ✅ | `https://app.vercel.app/auth/callback/google` | OAuth redirect URL |
| `DB_POOL_SIZE` | ❌ | `10` | SQLAlchemy connection pool size |
| `DB_MAX_OVERFLOW` | ❌ | `20` | Max overflow connections |
| `DB_POOL_TIMEOUT` | ❌ | `30` | Pool checkout timeout in seconds |
| `DB_POOL_RECYCLE` | ❌ | `1800` | Pool recycle interval in seconds |
| `RATE_LIMIT_REQUESTS_PER_MINUTE` | ❌ | `300` | Requests allowed per minute |
| `RATE_LIMIT_BURST_SIZE` | ❌ | `100` | Temporary burst allowance |
| `AUTO_CREATE_TABLES` | ❌ | `false` | Keep disabled; use Alembic migrations |

### Frontend `.env.local` / Vercel Environment Variables

| Variable | Required | Example | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | `https://api.yourdomain.com` | Backend API URL |
| `GOOGLE_CLIENT_ID` | ✅ | `...apps.googleusercontent.com` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | ✅ | `...` | Google OAuth secret |
| `NEXTAUTH_SECRET` | ✅ | `<32-char base64 string>` | NextAuth.js session secret |
| `NEXTAUTH_URL` | ✅ | `https://yourdomain.com` | Canonical frontend URL |

---

## 10. Troubleshooting

### Backend won't start

```bash
# Check container logs
docker compose -f docker-compose.prod.yml logs api

# Common issues:
# 1. "ModuleNotFoundError" → rebuild: docker compose -f docker-compose.prod.yml build --no-cache api
# 2. "Connection refused to database" → check DATABASE_URL and security groups
# 3. "Invalid JWT_SECRET" → ensure it's set in .env
```

### Can't connect to RDS from EC2

```bash
# Test connectivity from inside the API container
docker compose -f docker-compose.prod.yml exec api python -c "
from app.database import engine
with engine.connect() as conn:
    print('✅ Connected to database')
"

# If it fails, check:
# 1. RDS security group allows EC2's security group on port 5432
# 2. RDS is in the same VPC as EC2
# 3. DATABASE_URL is correct (check endpoint, port, password, db name)
```

### CORS errors in browser

```
Access-Control-Allow-Origin header missing
```

Fix:
1. Verify `CORS_ORIGINS` in backend `.env` includes your exact frontend URL (including `https://`)
2. Restart the API: `docker compose -f docker-compose.prod.yml restart api`
3. Check Nginx isn't stripping CORS headers

### Frontend can't reach backend API

```bash
# Test from your local machine
curl -v https://api.yourdomain.com/health

# Check:
# 1. EC2 security group allows HTTP/HTTPS from 0.0.0.0/0
# 2. Nginx is running: docker compose -f docker-compose.prod.yml ps nginx
# 3. NEXT_PUBLIC_API_URL is correct in Vercel env vars
# 4. No trailing slash in the API URL
```

### Google OAuth not working in production

1. Verify redirect URIs in Google Cloud Console match **exactly**:
   - `https://yourdomain.com/auth/callback/google` ← include full path
2. Verify `GOOGLE_REDIRECT_URI` in backend `.env` matches
3. Verify `NEXTAUTH_URL` in Vercel matches your production URL
4. Google OAuth consent screen must be set to **"In production"** (not "Testing") for external users

### Bedrock returns "Access Denied"

```bash
# Test Bedrock access from EC2
docker compose -f docker-compose.prod.yml exec api python -c "
import boto3, json, os
client = boto3.client('bedrock-runtime', region_name=os.environ.get('AWS_REGION', 'ap-south-1'))
body = json.dumps({
    'anthropic_version': 'bedrock-2023-05-31',
    'max_tokens': 50,
    'messages': [{'role': 'user', 'content': 'Hi'}]
})
response = client.invoke_model(
    modelId=os.environ.get('BEDROCK_MODEL_ID'),
    contentType='application/json',
    accept='application/json',
    body=body
)
print('✅ Bedrock working:', json.loads(response['body'].read())['content'][0]['text'])
"

# If it fails:
# 1. Verify AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env
# 2. Check IAM policy includes the correct model ARN and region
# 3. Ensure the Bedrock model is available in your region
```

### Container runs out of memory

```bash
# Check resource usage
docker stats

# Increase memory limits in docker-compose.prod.yml:
# deploy:
#   resources:
#     limits:
#       memory: 2G  # increase from 1G
```

### How to view Alembic migration status

```bash
docker compose -f docker-compose.prod.yml exec api alembic current
docker compose -f docker-compose.prod.yml exec api alembic history
```

---

## 11. Cost Summary

### Monthly Cost Breakdown (ap-south-1)

| Service | Configuration | Monthly Cost |
|---|---|---|
| **EC2** | t2.micro (free tier) / t3.micro | $0 – $3.80 |
| **RDS** | Single-AZ `db.t3.micro` or `db.t4g.micro` / 20GB gp3 | $0 – $15 |
| **Elastic IP** | 1 public IPv4 | ~$3.60 |
| **EBS Storage** | 20 GB gp3 | ~$1.60 |
| **Bedrock** | Claude 3 Haiku (light use) | $1 – $20 |
| **Translate** | Light use | $0.10 – $2 |
| **Vercel** | Free tier (hobby) | $0 |
| **Neon** (alt DB) | Free tier | $0 |
| **TOTAL (free tier)** | | **~$5 – $10/month** |
| **TOTAL (light prod)** | | **~$20 – $45/month** |

### Free Tier Reminders

| Service | Free Tier | Expiry |
|---|---|---|
| EC2 t2.micro | 750 hrs/month | 12 months |
| RDS db.t3.micro | 750 hrs/month | 12 months |
| EBS | 30 GB | 12 months |
| Data transfer | 15 GB/month outbound | 12 months |

> ⚠️ **Set up AWS Budgets & billing alerts immediately.** See `AWS_SETUP.md` Section 10 for detailed instructions.

---

## Quick Reference — Deploy from Scratch Checklist

```
□ 1. Create RDS PostgreSQL as a Single-AZ DB instance (or use Neon)
□ 2. Launch EC2 instance (Amazon Linux 2023, t2.micro)
□ 3. Allocate Elastic IP and associate with EC2
□ 4. SSH into EC2
□ 5. Install Docker + Docker Compose
□ 6. Clone repository
□ 7. Create backend/.env with all variables
□ 8. docker compose -f docker-compose.prod.yml up -d --build
□ 9. Run migrations: docker compose exec api alembic upgrade head
□ 10. Verify: curl http://<EC2_IP>/health
□ 11. Deploy frontend on Vercel (set Root Directory = frontend)
□ 12. Set Vercel environment variables (NEXT_PUBLIC_API_URL, etc.)
□ 13. Update backend CORS_ORIGINS with Vercel URL
□ 14. Update Google OAuth redirect URIs
□ 15. (Optional) Set up domain + SSL with Let's Encrypt
□ 16. (Optional) Set up GitHub Actions CI/CD
□ 17. Set up AWS billing alerts ← DON'T SKIP THIS
```
