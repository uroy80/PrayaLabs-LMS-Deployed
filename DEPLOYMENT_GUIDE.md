# Library Management System - Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Library Management System to various hosting platforms and environments.

## Prerequisites

### System Requirements
- Node.js 18 or higher
- npm or yarn package manager
- Git for version control
- Access to the library API endpoint
- SSL certificate (for production)

### Environment Preparation
- Domain name (for production)
- Hosting platform account
- Environment variables configured
- API endpoint accessible

## Environment Configuration

### Environment Variables

Create environment files for different deployment stages:

#### `.env.local` (Development)
```env
# Development API URL
NEXT_PUBLIC_LIBRARY_API_URL=https://dev-api.yourdomain.com

# Application Configuration
NEXT_PUBLIC_APP_NAME=Library Management System (Dev)
NEXT_PUBLIC_APP_VERSION=1.0.0-dev

# Debug Settings
NODE_ENV=development
```

#### `.env.production` (Production)
```env
# Production API URL
NEXT_PUBLIC_LIBRARY_API_URL=https://api.yourdomain.com

# Application Configuration
NEXT_PUBLIC_APP_NAME=Library Management System
NEXT_PUBLIC_APP_VERSION=1.0.0

# Production Settings
NODE_ENV=production
```

#### `.env.staging` (Staging)
```env
# Staging API URL
NEXT_PUBLIC_LIBRARY_API_URL=https://staging-api.yourdomain.com

# Application Configuration
NEXT_PUBLIC_APP_NAME=Library Management System (Staging)
NEXT_PUBLIC_APP_VERSION=1.0.0-staging

# Staging Settings
NODE_ENV=production
```

## Build Process

### Local Build
```bash
# Install dependencies
npm install --legacy-peer-deps

# Build the application
npm run build

# Test the build locally
npm start
```

### Build Optimization
```bash
# Analyze bundle size
npm install --save-dev @next/bundle-analyzer

# Add to next.config.mjs
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // existing config
})

# Run analysis
ANALYZE=true npm run build
```

## Deployment Platforms

### 1. Vercel Deployment (Recommended)

#### Automatic Deployment
1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your Git repository

2. **Configure Build Settings**
   ```
   Framework Preset: Next.js
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

3. **Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add production environment variables:
   ```
   NEXT_PUBLIC_LIBRARY_API_URL=https://api.yourdomain.com
   NEXT_PUBLIC_APP_NAME=Library Management System
   NEXT_PUBLIC_APP_VERSION=1.0.0
   ```

4. **Domain Configuration**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Configure DNS records as instructed

#### Manual Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

#### Vercel Configuration File
Create `vercel.json`:
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

### 2. Netlify Deployment

#### Automatic Deployment
1. **Connect Repository**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "New site from Git"
   - Connect your repository

2. **Build Settings**
   ```
   Build command: npm run build
   Publish directory: out
   ```

3. **Environment Variables**
   - Go to Site Settings → Environment Variables
   - Add your environment variables

#### Manual Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Build and deploy
npm run build
netlify deploy --prod --dir=out
```

#### Netlify Configuration
Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "out"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### 3. AWS Amplify Deployment

#### Setup
1. **Install Amplify CLI**
   ```bash
   npm install -g @aws-amplify/cli
   amplify configure
   ```

2. **Initialize Project**
   ```bash
   amplify init
   ```

3. **Add Hosting**
   ```bash
   amplify add hosting
   # Choose "Amazon CloudFront and S3"
   ```

4. **Deploy**
   ```bash
   amplify publish
   ```

#### Amplify Configuration
Create `amplify.yml`:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: out
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### 4. Docker Deployment

#### Dockerfile
```dockerfile
# Multi-stage build for optimization
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  library-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_LIBRARY_API_URL=https://api.yourdomain.com
      - NEXT_PUBLIC_APP_NAME=Library Management System
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - library-app
    restart: unless-stopped
```

#### Build and Deploy
```bash
# Build Docker image
docker build -t library-app .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_LIBRARY_API_URL=https://api.yourdomain.com \
  library-app

# Using Docker Compose
docker-compose up -d
```

### 5. Self-Hosted Deployment

#### Server Setup (Ubuntu/Debian)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx
```

#### Application Deployment
```bash
# Clone repository
git clone <your-repo-url> /var/www/library-app
cd /var/www/library-app

# Install dependencies
npm install

# Create environment file
sudo nano .env.production

# Build application
npm run build

# Start with PM2
pm2 start npm --name "library-app" -- start
pm2 save
pm2 startup
```

#### Nginx Configuration
Create `/etc/nginx/sites-available/library-app`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

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
    }

    # Static files caching
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # PWA files
    location /manifest.json {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=86400";
    }
}
```

#### Enable Site and SSL
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/library-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test SSL renewal
sudo certbot renew --dry-run
```

## Environment-Specific Configurations

### Development Environment
```bash
# Start development server
npm run dev

# Enable debug mode
NODE_ENV=development npm run dev
```

### Staging Environment
```bash
# Build for staging
NODE_ENV=production npm run build

# Start staging server
NODE_ENV=production npm start
```

### Production Environment
```bash
# Build for production
NODE_ENV=production npm run build

# Start production server with PM2
pm2 start ecosystem.config.js --env production
```

#### PM2 Ecosystem Configuration
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'library-app',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/library-app',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      NEXT_PUBLIC_LIBRARY_API_URL: 'https://api.yourdomain.com'
    },
    error_file: '/var/log/pm2/library-app-error.log',
    out_file: '/var/log/pm2/library-app-out.log',
    log_file: '/var/log/pm2/library-app.log',
    time: true
  }]
}
```

## Performance Optimization

### Build Optimization
```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static optimization
  output: 'standalone',
  
  // Image optimization
  images: {
    domains: ['your-api-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Compression
  compress: true,
  
  // PWA optimization
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
  },
  
  // Headers for security and caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

export default nextConfig
```

### CDN Configuration
```bash
# For static assets, configure CDN
# Example with CloudFlare
# 1. Add domain to CloudFlare
# 2. Configure caching rules
# 3. Enable compression
# 4. Set up page rules for static assets
```

## Monitoring and Logging

### Application Monitoring
```javascript
// Add to your app for monitoring
if (typeof window !== 'undefined') {
  // Error tracking
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error)
    // Send to monitoring service
  })

  // Performance monitoring
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0]
    console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart)
  })
}
```

### Server Monitoring
```bash
# Install monitoring tools
npm install -g pm2-logrotate

# Configure log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30

# Monitor application
pm2 monit
```

## Security Configuration

### Security Headers
```nginx
# Add to Nginx configuration
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

### Environment Security
```bash
# Secure environment files
chmod 600 .env.production
chown www-data:www-data .env.production

# Firewall configuration
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## Backup and Recovery

### Automated Backups
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/library-app"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/library-app

# Backup environment files
cp /var/www/library-app/.env.production $BACKUP_DIR/env_$DATE

# Clean old backups (keep 30 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

### Recovery Process
```bash
# Stop application
pm2 stop library-app

# Restore from backup
cd /var/www
tar -xzf /backups/library-app/app_YYYYMMDD_HHMMSS.tar.gz

# Restore environment
cp /backups/library-app/env_YYYYMMDD /var/www/library-app/.env.production

# Restart application
cd /var/www/library-app
npm install
npm run build
pm2 start library-app
```

## Troubleshooting

### Common Deployment Issues

#### Build Failures
```bash
# Clear cache and rebuild
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

#### Environment Variable Issues
```bash
# Check environment variables
printenv | grep NEXT_PUBLIC

# Verify in application
console.log('API URL:', process.env.NEXT_PUBLIC_LIBRARY_API_URL)
```

#### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Test SSL configuration
openssl s_client -connect yourdomain.com:443
```

#### Performance Issues
```bash
# Check application performance
pm2 monit

# Check server resources
htop
df -h
free -m

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] API endpoints accessible
- [ ] SSL certificates ready
- [ ] Domain DNS configured
- [ ] Backup procedures tested

### Deployment
- [ ] Code built successfully
- [ ] Tests passing
- [ ] Environment variables set
- [ ] Application deployed
- [ ] SSL configured
- [ ] Monitoring enabled

### Post-Deployment
- [ ] Application accessible
- [ ] All features working
- [ ] Performance acceptable
- [ ] Monitoring active
- [ ] Backups scheduled
- [ ] Documentation updated

### Production Readiness
- [ ] Security headers configured
- [ ] Error monitoring setup
- [ ] Performance monitoring active
- [ ] Backup and recovery tested
- [ ] Scaling plan documented
- [ ] Maintenance procedures documented

---

This deployment guide provides comprehensive instructions for deploying the Library Management System to various platforms. Choose the deployment method that best fits your infrastructure and requirements.
