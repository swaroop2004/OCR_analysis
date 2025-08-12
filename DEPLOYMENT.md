# Deploying Ingredient Analyzer on Vercel

This guide will walk you through deploying the Ingredient Analyzer application on Vercel.

## Prerequisites

1. **GitHub Repository**: Your code should be in a GitHub repository
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (free tier available)
3. **Resend Account**: For email verification (already configured)
4. **Database**: We'll need to set up a production database

## Step 1: Prepare Your Repository

### 1.1. Create a GitHub Repository
```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit - Ingredient Analyzer"

# Create a new repository on GitHub and add the remote
git remote add origin https://github.com/your-username/ingredient-analyzer.git

# Push to GitHub
git push -u origin main
```

### 1.2. Update Environment Variables for Production

Create a production `.env` file:

```env
# Database (we'll set this up in Step 2)
DATABASE_URL=""

# Email Provider Configuration
EMAIL_PROVIDER=resend

# Resend Configuration
RESEND_API_KEY=re_dVn1YNVq_5JEwrGkQpy723FeCNTYtK8Eb
RESEND_FROM_EMAIL=onboarding@resend.dev
```

## Step 2: Set Up Production Database

### 2.1. Choose a Database Option

**Option A: Vercel Postgres (Recommended)**
1. Go to your Vercel dashboard
2. Navigate to your project
3. Go to the "Storage" tab
4. Create a new Postgres database
5. Copy the connection string

**Option B: PlanetScale (Free Tier Available)**
1. Sign up at [PlanetScale](https://planetscale.com)
2. Create a new database
3. Get the connection string

**Option C: Railway (Free Tier Available)**
1. Sign up at [Railway](https://railway.app)
2. Create a new PostgreSQL database
3. Get the connection string

### 2.2. Update Database Schema

Once you have your production database URL, update your `.env` file:

```env
DATABASE_URL="your_production_database_url_here"
```

### 2.3. Run Database Migration

```bash
# Install Prisma CLI if not already installed
npm install -g prisma

# Push the schema to production database
npx prisma db push
```

## Step 3: Deploy to Vercel

### 3.1. Connect to GitHub

1. Log in to your [Vercel dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Select your GitHub repository
4. Click "Import"

### 3.2. Configure Environment Variables

In the Vercel project settings:

1. Go to "Settings" → "Environment Variables"
2. Add the following variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your production database URL |
| `EMAIL_PROVIDER` | `resend` |
| `RESEND_API_KEY` | `re_dVn1YNVq_5JEwrGkQpy723FeCNTYtK8Eb` |
| `RESEND_FROM_EMAIL` | `onboarding@resend.dev` |

### 3.3. Configure Build Settings

Vercel should automatically detect that this is a Next.js application. If not:

1. Go to "Settings" → "Build & Development"
2. Set:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### 3.4. Deploy

Click "Deploy" to start the deployment process.

## Step 4: Post-Deployment Setup

### 4.1. Run Database Migration on Vercel

Since Vercel uses a read-only filesystem, we need to handle database migrations differently:

**Option A: Use Vercel CLI (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Link to your project
vercel link

# Pull environment variables
vercel env pull .env.production

# Run migration
npx prisma db push
```

**Option B: Use a Database Seed Script**
Create a seed script that runs on first application start:

```javascript
// src/lib/seed.js
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Check if tables exist, if not create them
  try {
    await prisma.$executeRaw`SELECT 1 FROM User LIMIT 1`
    console.log('Database already initialized')
  } catch (error) {
    console.log('Initializing database...')
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT PRIMARY KEY DEFAULT (cuid()),
        "username" TEXT NOT NULL UNIQUE,
        "email" TEXT NOT NULL UNIQUE,
        "isVerified" BOOLEAN DEFAULT false,
        "otpCode" TEXT,
        "otpExpires" DATETIME,
        "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `
    // Add other tables...
  }
}

main()
```

### 4.2. Test the Deployment

1. Visit your deployed application URL
2. Test the complete flow:
   - User registration with email verification
   - Image upload and analysis
   - Results display
   - Review submission

## Step 5: Custom Domain (Optional)

### 5.1. Add Custom Domain

1. In Vercel project settings, go to "Domains"
2. Add your custom domain (e.g., `ingredient-analyzer.com`)
3. Follow the DNS configuration instructions

### 5.2. Configure SSL

Vercel automatically provisions SSL certificates for all custom domains.

## Step 6: Monitoring and Maintenance

### 6.1. Set Up Monitoring

1. **Vercel Analytics**: Enable in the "Analytics" tab
2. **Error Tracking**: Consider integrating with Sentry or similar
3. **Uptime Monitoring**: Use a service like UptimeRobot

### 6.2. Regular Maintenance

- Monitor database usage and upgrade if needed
- Keep dependencies updated
- Monitor email usage on Resend dashboard
- Regular backups of your database

## Troubleshooting

### Common Issues

**1. Database Connection Errors**
- Verify your DATABASE_URL is correct
- Ensure your database allows connections from Vercel's IP addresses
- Check if your database is running

**2. Build Failures**
- Check the build logs in Vercel dashboard
- Ensure all dependencies are properly listed in package.json
- Verify TypeScript configuration

**3. Email Verification Not Working**
- Verify RESEND_API_KEY is correct
- Check if your domain is verified on Resend
- Monitor email logs in Resend dashboard

**4. Image Analysis Failing**
- Verify the webhook URL is correct and accessible
- Check if the webhook is properly configured to receive binary data
- Monitor webhook logs

### Getting Help

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Support**: Support is available for Pro accounts
- **Community**: Vercel has an active community on Discord

## Cost Summary

| Service | Free Tier | Paid Plans |
|---------|-----------|------------|
| Vercel | 100GB bandwidth, 6 functions | $20/month Pro |
| Database | Vercel Postgres (512MB) | From $20/month |
| Resend | 100 emails/day | From $15/month |
| Total | $0/month | ~$55/month |

The free tier should be sufficient for development and light usage. For production, consider the paid plans for better performance and support.