import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { analysisId, userId, rating, comment } = await request.json()

    if (!analysisId || !userId || !rating) {
      return NextResponse.json(
        { error: 'Analysis ID, user ID, and rating are required' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Verify that the analysis exists and belongs to the user
    const analysis = await db.analysis.findUnique({
      where: { id: analysisId }
    })

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      )
    }

    if (analysis.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to review this analysis' },
        { status: 403 }
      )
    }

    // Check if user already reviewed this analysis
    const existingReview = await db.review.findFirst({
      where: {
        analysisId,
        userId
      }
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 400 }
      )
    }

    // Create the review
    const review = await db.review.create({
      data: {
        analysisId,
        userId,
        rating,
        comment
      },
      include: {
        user: {
          select: {
            username: true
          }
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      review: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        username: review.user.username
      }
    })

  } catch (error) {
    console.error('Error submitting review:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const analysisId = searchParams.get('analysisId')

    if (!analysisId) {
      return NextResponse.json(
        { error: 'Analysis ID is required' },
        { status: 400 }
      )
    }

    const reviews = await db.review.findMany({
      where: { analysisId },
      include: {
        user: {
          select: {
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ 
      success: true, 
      reviews: reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        username: review.user.username
      }))
    })

  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}