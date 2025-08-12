import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { username, email, otpCode } = await request.json()

    if (!username || !email || !otpCode) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if OTP matches and is not expired
    if (user.otpCode !== otpCode) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      )
    }

    if (user.otpExpires && new Date() > user.otpExpires) {
      return NextResponse.json(
        { error: 'OTP has expired' },
        { status: 400 }
      )
    }

    // Mark user as verified and clear OTP
    await db.user.update({
      where: { email },
      data: {
        isVerified: true,
        otpCode: null,
        otpExpires: null
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'OTP verified successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    })

  } catch (error) {
    console.error('Error verifying OTP:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}