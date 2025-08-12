import { NextRequest, NextResponse } from 'next/server'
import { sendSMS } from '@/lib/sms-service'

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message } = await request.json()

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      )
    }

    console.log(`Debug: Attempting to send SMS to ${phoneNumber}`)
    console.log(`Debug: Message: ${message}`)
    
    const result = await sendSMS(phoneNumber, message)
    
    console.log(`Debug: SMS send result: ${result}`)
    
    return NextResponse.json({ 
      success: result,
      message: result ? 'SMS sent successfully' : 'SMS failed to send'
    })

  } catch (error) {
    console.error('Debug SMS error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}