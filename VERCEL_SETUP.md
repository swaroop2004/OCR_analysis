# Vercel Environment Variables Setup

## Required Environment Variables

To fix the Prisma connection issues on Vercel, you need to set the following environment variables in your Vercel project:

### 1. Database Connection Variables

**DATABASE_URL** (Required)
- This should be your direct PostgreSQL connection string
- Format: `postgresql://username:password@host:port/database`
- Example: `postgresql://myuser:mypassword@localhost:5432/myapp`

**DIRECT_URL** (Required for Vercel)
- This should be the same as your DATABASE_URL
- Used for direct database connections during migrations and seeding
- Format: `postgresql://username:password@host:port/database`

### 2. How to Set Environment Variables on Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add the following variables:

```
Name: DATABASE_URL
Value: postgresql://username:password@host:port/database
Environment: Production, Preview, Development

Name: DIRECT_URL
Value: postgresql://username:password@host:port/database
Environment: Production, Preview, Development
```

### 3. Database Hosting Options

#### Option A: Local Database (Development Only)
- Use `localhost` or your local IP
- **Note**: This won't work for production Vercel deployments

#### Option B: Cloud Database (Recommended for Production)
- **Supabase** (Free tier available)
- **Neon** (Free tier available)
- **PlanetScale** (Free tier available)
- **Railway** (Free tier available)

### 4. Example with Supabase

If using Supabase:
1. Create a new project
2. Go to Settings → Database
3. Copy the connection string
4. Set both `DATABASE_URL` and `DIRECT_URL` to this value

### 5. After Setting Environment Variables

1. Redeploy your application on Vercel
2. The build should now succeed
3. Prisma should connect to your database properly

### 6. Troubleshooting

If you still get connection errors:
1. Verify your database is accessible from the internet
2. Check if your database requires SSL connections
3. Ensure your database user has proper permissions
4. Test the connection string locally first

### 7. Local Development

For local development, create a `.env.local` file:
```
DATABASE_URL=postgresql://username:password@localhost:5432/database
DIRECT_URL=postgresql://username:password@localhost:5432/database
```

### 8. Security Notes

- Never commit `.env` files to your repository
- Use strong passwords for your database
- Consider using connection pooling for production
- Regularly rotate database credentials
