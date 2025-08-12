import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendEmail, createOTPEmailTemplate } from '@/lib/email-service'
import { validateEmail } from '@/lib/email-validation'

export async function POST(request: NextRequest) {
  try {
    const { username, email } = await request.json()

    if (!username || !email) {
      return NextResponse.json(
        { error: 'Username and email are required' },
        { status: 400 }
      )
    }

    // Validate email format and domain
    const emailValidation = await validateEmail(email)
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      )
    }

    // Generate a 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

    // Check if user exists, if not create one
    let user = await db.user.findUnique({
      where: { email }
    })

    if (user) {
      // Update existing user with new OTP
      await db.user.update({
        where: { email },
        data: {
          username,
          otpCode,
          otpExpires
        }
      })
    } else {
      // Create new user
      user = await db.user.create({
        data: {
          username,
          email,
          otpCode,
          otpExpires
        }
      })
    }

    // Send OTP via email using configured provider
    const subject = 'Your OTP for OCR Ingredient Analyzer'
    const htmlContent = createOTPEmailTemplate(otpCode)
    
    console.log(`Generated OTP for ${email}: ${otpCode}`)
    
    const emailSent = await sendEmail(email, subject, htmlContent)

    if (emailSent) {
      console.log(`OTP sent successfully to ${email}`)
      return NextResponse.json({ 
        success: true, 
        message: 'OTP sent successfully' 
      })
    } else {
      console.error(`Failed to send email to ${email}`)
      // Even if email fails, we still return success but log the OTP for development
      console.log(`Email failed. OTP for ${email}: ${otpCode}`)
      
      return NextResponse.json({ 
        success: true, 
        message: 'OTP generated but email failed. Check server logs for OTP code.',
        otpFallback: otpCode // Include OTP in response for development/testing
      })
    }

  } catch (error) {
    console.error('Error sending OTP:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}