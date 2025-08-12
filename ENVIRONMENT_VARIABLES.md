# Environment Variables Required

## Database Configuration
```
DATABASE_URL="postgresql://username:password@localhost:5432/your_database_name"
DIRECT_URL="postgresql://username:password@localhost:5432/your_database_name"
```

## Email Configuration (if using email services)
```
EMAIL_SERVICE_API_KEY="your_email_service_api_key"
EMAIL_FROM="noreply@yourdomain.com"
```

## SMS Configuration (if using SMS services)
```
TWILIO_ACCOUNT_SID="your_twilio_account_sid"
TWILIO_AUTH_TOKEN="your_twilio_auth_token"
TWILIO_PHONE_NUMBER="your_twilio_phone_number"
```

## NextAuth Configuration (if using authentication)
```
NEXTAUTH_SECRET="your_nextauth_secret_key"
NEXTAUTH_URL="http://localhost:3000"
```

## Other Configuration
```
NODE_ENV="development"
```

## How to Use

1. **For Local Development**: Create a `.env.local` file with these variables
2. **For Vercel**: Set these variables in your Vercel project settings
3. **Never commit `.env` files** to your repository

## Database Connection String Format

The `DATABASE_URL` should follow this format:
```
postgresql://username:password@host:port/database_name
```

Examples:
- Local: `postgresql://postgres:mypassword@localhost:5432/ocr_app`
- Supabase: `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres`
- Neon: `postgresql://username:password@ep-xxx-xxx-xxx.region.aws.neon.tech/neondb`
