'use client'

import { useState, useEffect } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'
import { ImageUpload } from '@/components/ocr/ImageUpload'
import { ResultsDisplay } from '@/components/ocr/ResultsDisplay'
import { ReviewForm } from '@/components/ocr/ReviewForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, LogOut, Camera, Star, Mail } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface User {
  id: string
  username: string
  email: string
}

interface AnalysisResult {
  id: string
  description: string
  rating: number
  imageUrl?: string
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Check for saved user on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('ocr-app-user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        toast({
          title: 'Welcome back!',
          description: `Logged in as ${userData.username}`,
        })
      } catch (error) {
        console.error('Error parsing saved user data:', error)
        localStorage.removeItem('ocr-app-user')
      }
    }
    setIsLoading(false)
  }, [toast])

  const handleLogin = (userData: User) => {
    setUser(userData)
    // Save user to localStorage for persistence
    localStorage.setItem('ocr-app-user', JSON.stringify(userData))
    toast({
      title: 'Welcome back!',
      description: `Logged in as ${userData.username}`,
    })
  }

  const handleLogout = () => {
    setUser(null)
    setSelectedImage('')
    setAnalysisResult(null)
    setShowReviewForm(false)
    setError('')
    // Remove user from localStorage
    localStorage.removeItem('ocr-app-user')
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out',
    })
  }

  const handleImageSelect = (imageData: string) => {
    setSelectedImage(imageData)
    setAnalysisResult(null)
    setShowReviewForm(false)
    setError('')
  }

  const handleAnalyze = async () => {
    if (!selectedImage || !user) return

    setIsAnalyzing(true)
    setError('')

    try {
      // For demo purposes, we'll simulate the API call
      // In a real app, you would need to get the actual user ID from your auth system
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: selectedImage,
          userId: user?.id, // Use the actual logged-in user's ID
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze image')
      }

      setAnalysisResult(data.analysis)
      toast({
        title: 'Analysis Complete',
        description: 'Product ingredients have been analyzed',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze image')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReviewSubmit = () => {
    setShowReviewForm(false)
    toast({
      title: 'Thank you!',
      description: 'Your review has been submitted successfully',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Loading...
            </h2>
            <p className="text-gray-600">
              Please wait while we restore your session
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Ingredient Analyzer
            </h1>
            <p className="text-gray-600">
              Analyze product ingredients and get health insights
            </p>
          </div>
          <LoginForm onLogin={handleLogin} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Camera className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                Ingredient Analyzer
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">
                  {user.email}
                </span>
              </div>
              <span className="text-sm text-gray-600">
                Welcome, {user.username}
              </span>
              <Button variant="outline" onClick={handleLogout} size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Upload and Actions */}
          <div className="space-y-6">
            <ImageUpload 
              onImageSelect={handleImageSelect}
              disabled={isAnalyzing}
            />

            {selectedImage && !analysisResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Analyze Image</CardTitle>
                  <CardDescription>
                    Ready to analyze the product ingredients
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleAnalyze} 
                    className="w-full" 
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Analyze Ingredients'
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Right Column - Results and Reviews */}
          <div className="space-y-6">
            {analysisResult && (
              <>
                <ResultsDisplay
                  description={analysisResult.description}
                  rating={analysisResult.rating}
                  imageUrl={analysisResult.imageUrl}
                />

                {!showReviewForm && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Star className="h-5 w-5 mr-2" />
                        Share Your Experience
                      </CardTitle>
                      <CardDescription>
                        Help others by rating this product
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={() => setShowReviewForm(true)}
                        className="w-full"
                      >
                        Write a Review
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {showReviewForm && (
                  <ReviewForm
                    analysisId={analysisResult.id}
                    userId={user?.id} // Use the actual logged-in user's ID
                    onReviewSubmit={handleReviewSubmit}
                  />
                )}
              </>
            )}

            {!selectedImage && !analysisResult && (
              <Card>
                <CardHeader>
                  <CardTitle>How It Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">1</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Upload Image</h3>
                      <p className="text-sm text-gray-600">
                        Take a photo or upload an image of the product ingredients
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">2</span>
                    </div>
                    <div>
                      <h3 className="font-medium">AI Analysis</h3>
                      <p className="text-sm text-gray-600">
                        Our AI analyzes the ingredients and provides health insights
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">3</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Get Results</h3>
                      <p className="text-sm text-gray-600">
                        View detailed analysis and health rating for the product
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}