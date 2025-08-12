import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const WEBHOOK_URL = 'https://swaroop2204.app.n8n.cloud/webhook/86b1a19f-7d99-4a92-a6d4-1d3cbb6b630c'

export async function POST(request: NextRequest) {
  try {
    const { imageData, userId } = await request.json()

    if (!imageData || !userId) {
      return NextResponse.json(
        { error: 'Image data and user ID are required' },
        { status: 400 }
      )
    }

    // Verify that the user exists
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Convert base64 to binary buffer for sending to webhook
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '')
    const imageBuffer = Buffer.from(base64Data, 'base64')

    // Send image to webhook as binary file
    const webhookResponse = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'image/jpeg',
      },
      body: imageBuffer,
    })

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text()
      console.error('Webhook error response:', errorText)
      throw new Error(`Webhook request failed with status ${webhookResponse.status}: ${errorText}`)
    }

    let analysisData
    try {
      analysisData = await webhookResponse.json()
    } catch (parseError) {
      const responseText = await webhookResponse.text()
      console.error('Failed to parse webhook response as JSON:', responseText)
      throw new Error('Webhook response is not valid JSON')
    }

    // Validate the response format
    if (!Array.isArray(analysisData) || analysisData.length === 0) {
      throw new Error('Invalid analysis response format')
    }

    const result = analysisData[0]
    if (!result.output || typeof result.output.description !== 'string' || typeof result.output.rating !== 'number') {
      throw new Error('Invalid analysis data format')
    }

    // Save analysis to database
    const analysis = await db.analysis.create({
      data: {
        userId,
        imageUrl: imageData,
        description: result.output.description,
        rating: result.output.rating,
      },
    })

    return NextResponse.json({ 
      success: true, 
      analysis: {
        id: analysis.id,
        description: analysis.description,
        rating: analysis.rating,
        createdAt: analysis.createdAt,
      }
    })

  } catch (error) {
    console.error('Error analyzing image:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze image' },
      { status: 500 }
    )
  }
}