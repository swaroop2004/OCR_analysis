// Email service abstraction layer

export interface EmailProvider {
  sendEmail(to: string, subject: string, html: string): Promise<boolean>
}

class ConsoleEmailProvider implements EmailProvider {
  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    console.log(`[EMAIL CONSOLE LOG]`)
    console.log(`To: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(`HTML: ${html}`)
    return true
  }
}

class SMTPProvider implements EmailProvider {
  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    // This would use nodemailer or similar SMTP library
    // For now, we'll simulate it
    console.log(`[SMTP EMAIL]`)
    console.log(`To: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(`HTML: ${html}`)
    return true
  }
}

import { Resend } from 'resend'

class ResendProvider implements EmailProvider {
  private resend: Resend
  private fallbackProvider: ConsoleEmailProvider

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY)
    this.fallbackProvider = new ConsoleEmailProvider()
  }

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: [to],
        subject: subject,
        html: html,
      })

      if (error) {
        console.error('Resend email error:', error)
        console.log('Falling back to console logging...')
        return await this.fallbackProvider.sendEmail(to, subject, html)
      }

      console.log('Email sent successfully via Resend:', data)
      return true
    } catch (error) {
      console.error('Resend email error:', error)
      console.log('Falling back to console logging...')
      return await this.fallbackProvider.sendEmail(to, subject, html)
    }
  }
}

// Factory function to get the appropriate email provider
export function getEmailProvider(): EmailProvider {
  const provider = process.env.EMAIL_PROVIDER?.toLowerCase() || 'console'
  
  switch (provider) {
    case 'smtp':
      return new SMTPProvider()
    case 'resend':
      return new ResendProvider()
    case 'console':
    default:
      return new ConsoleEmailProvider()
  }
}

// Convenience function to send email
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const provider = getEmailProvider()
  return await provider.sendEmail(to, subject, html)
}

// HTML template for OTP email
export function createOTPEmailTemplate(otp: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>OTP Verification</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 30px;
          background-color: #f9f9f9;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #4F46E5;
        }
        .otp-container {
          background-color: #4F46E5;
          color: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          margin: 20px 0;
        }
        .otp-code {
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          margin: 10px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Ingredient Analyzer</div>
        </div>
        
        <h2>Verify Your Email Address</h2>
        <p>Thank you for registering with Ingredient Analyzer. Please use the following One-Time Password (OTP) to verify your email address:</p>
        
        <div class="otp-container">
          <div>Your OTP Code</div>
          <div class="otp-code">${otp}</div>
        </div>
        
        <p><strong>Important:</strong></p>
        <ul>
          <li>This OTP is valid for 10 minutes only</li>
          <li>Please do not share this OTP with anyone</li>
          <li>If you didn't request this OTP, please ignore this email</li>
        </ul>
        
        <p>If you have any questions or need assistance, please contact our support team.</p>
        
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; 2024 Ingredient Analyzer. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}