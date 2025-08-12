'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Star } from 'lucide-react'

interface ResultsDisplayProps {
  description: string
  rating: number
  imageUrl?: string
}

export function ResultsDisplay({ description, rating, imageUrl }: ResultsDisplayProps) {
  const formatDescription = (text: string) => {
    // Replace "*   " with proper bullet points
    return text.replace(/\*\s+/g, '• ');
  };

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    const emptyStars = 5 - Math.ceil(rating)

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
      )
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="w-5 h-5 fill-yellow-400/50 text-yellow-400" />
      )
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-5 h-5 text-gray-300" />
      )
    }

    return stars
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Analysis Results</CardTitle>
        <CardDescription>
          Product ingredients analysis and health rating
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="rating">Rating</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="mt-4">
            <div className="space-y-4">
              {imageUrl && (
                <div className="flex justify-center">
                  <img
                    src={imageUrl}
                    alt="Analyzed product"
                    className="max-w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {formatDescription(description)}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="rating" className="mt-4">
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <div className="flex justify-center items-center space-x-1">
                  {renderStars(rating)}
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {rating.toFixed(1)} out of 5
                </div>
                <div className="text-sm text-gray-600">
                  Health Rating
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Rating Scale:</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-green-500 text-green-500" />
                      ))}
                    </div>
                    <span>5.0 - Excellent (Very Healthy)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {[...Array(4)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-green-500 text-green-500" />
                      ))}
                      <Star className="w-4 h-4 text-gray-300" />
                    </div>
                    <span>4.0 - Good (Healthy)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {[...Array(3)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      ))}
                      {[...Array(2)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-gray-300" />
                      ))}
                    </div>
                    <span>3.0 - Average (Moderately Healthy)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {[...Array(2)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-orange-500 text-orange-500" />
                      ))}
                      {[...Array(3)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-gray-300" />
                      ))}
                    </div>
                    <span>2.0 - Poor (Less Healthy)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      <Star className="w-4 h-4 fill-red-500 text-red-500" />
                      {[...Array(4)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-gray-300" />
                      ))}
                    </div>
                    <span>1.0 - Very Poor (Unhealthy)</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}