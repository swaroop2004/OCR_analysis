# Email Setup Guide

## Free Email Service with Resend

This application uses Resend for sending OTP verification emails. Resend offers a free tier with 100 emails per day.

### Step 1: Get Your Free Resend API Key

1. **Sign Up**: Go to [https://resend.com](https://resend.com) and create a free account
2. **Verify Email**: Check your email and verify your account
3. **Get API Key**: 
   - Go to [https://resend.com/api-keys](https://resend.com/api-keys)
   - Click "Create API Key"
   - Give it a name (e.g., "Ingredient Analyzer App")
   - Copy the API key

### Step 2: Update Environment Variables

Edit your `.env` file and replace the placeholder API key:

```env
# Replace this placeholder with your actual API key
RESEND_API_KEY=re_your_actual_api_key_here
```

### Step 3: Test the Email System

1. Restart your development server
2. Try registering with your email address
3. Check your email for the OTP verification code

### Features

- **Free Tier**: 100 emails per day
- **Professional Templates**: HTML emails with your app branding
- **Fallback System**: If Resend fails, OTP will be displayed in console
- **Domain Validation**: Prevents temporary email addresses
- **Security**: OTP expires after 10 minutes

### Troubleshooting

**Email not received?**
1. Check your spam folder
2. Verify the API key is correct
3. Check the console for fallback OTP display
4. Ensure your email domain is valid

**API Key Issues?**
1. Make sure you've verified your Resend account
2. Check that the API key has the correct permissions
3. Generate a new API key if needed

### Alternative: Console Logging

If you prefer to see OTP codes in the console during development, set:

```env
EMAIL_PROVIDER=console
```

This will display the OTP in the server console instead of sending emails.