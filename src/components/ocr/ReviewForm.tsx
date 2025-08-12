'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Star } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ReviewFormProps {
  analysisId: string
  userId: string
  onReviewSubmit: () => void
}

export function ReviewForm({ analysisId, userId, onReviewSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisId,
          userId,
          rating,
          comment: comment.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review')
      }

      toast({
        title: 'Review Submitted',
        description: 'Thank you for your feedback!',
      })

      // Reset form
      setRating(0)
      setHoverRating(0)
      setComment('')
      onReviewSubmit()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStars = (currentRating: number, interactive = true) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        className={`p-1 rounded-full transition-colors ${
          interactive ? 'hover:bg-gray-100' : ''
        }`}
        onClick={() => interactive && setRating(star)}
        onMouseEnter={() => interactive && setHoverRating(star)}
        onMouseLeave={() => interactive && setHoverRating(0)}
        disabled={!interactive || isLoading}
      >
        <Star
          className={`w-6 h-6 transition-colors ${
            star <= (hoverRating || currentRating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          } ${
            interactive && star <= (hoverRating || currentRating)
              ? 'hover:text-yellow-500'
              : ''
          }`}
        />
      </button>
    ))
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Rate This Product</CardTitle>
        <CardDescription>
          Share your experience and help others make informed choices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Your Rating</label>
          <div className="flex items-center space-x-1">
            {renderStars(rating)}
            <span className="ml-2 text-sm text-gray-600">
              {rating > 0 ? `${rating} out of 5` : 'Select a rating'}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="comment" className="text-sm font-medium">
            Your Review (Optional)
          </label>
          <Textarea
            id="comment"
            placeholder="Share your thoughts about this product..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={isLoading}
            rows={4}
          />
        </div>

        <Button 
          onClick={handleSubmit} 
          className="w-full" 
          disabled={isLoading || rating === 0}
        >
          {isLoading ? 'Submitting...' : 'Submit Review'}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}