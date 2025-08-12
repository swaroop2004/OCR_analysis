'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Camera, Upload, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ImageUploadProps {
  onImageSelect: (imageData: string) => void
  disabled?: boolean
}

export function ImageUpload({ onImageSelect, disabled = false }: ImageUploadProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const { toast } = useToast()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = e.target?.result as string
        setSelectedImage(imageData)
        onImageSelect(imageData)
        toast({
          title: 'Image Selected',
          description: 'Image ready for analysis',
        })
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError('Failed to read image file')
    } finally {
      setIsLoading(false)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraOpen(true)
      }
    } catch (err) {
      setError('Failed to access camera. Please ensure camera permissions are granted.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsCameraOpen(false)
  }

  const captureImage = () => {
    if (!videoRef.current) return

    const canvas = document.createElement('canvas')
    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(video, 0, 0)
      const imageData = canvas.toDataURL('image/jpeg')
      setSelectedImage(imageData)
      onImageSelect(imageData)
      stopCamera()
      toast({
        title: 'Image Captured',
        description: 'Image ready for analysis',
      })
    }
  }

  const clearImage = () => {
    setSelectedImage(null)
    onImageSelect('')
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Upload Product Image</CardTitle>
        <CardDescription>
          Upload an image or capture from camera to analyze ingredients
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedImage ? (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={selectedImage}
                alt="Selected product"
                className="w-full h-64 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={clearImage}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : isCameraOpen ? (
          <div className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 object-cover rounded-lg bg-black"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={captureImage} 
                className="flex-1"
                disabled={disabled}
              >
                <Camera className="h-4 w-4 mr-2" />
                Capture
              </Button>
              <Button 
                variant="outline" 
                onClick={stopCamera}
                disabled={disabled}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">
                Drag and drop an image here or click to select
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="image-upload"
                disabled={disabled || isLoading}
              />
              <Button 
                onClick={() => document.getElementById('image-upload')?.click()}
                disabled={disabled || isLoading}
              >
                {isLoading ? 'Loading...' : 'Select Image'}
              </Button>
            </div>
            
            <div className="text-center">
              <span className="text-gray-500">or</span>
            </div>
            
            <Button 
              variant="outline" 
              onClick={startCamera}
              disabled={disabled}
              className="w-full"
            >
              <Camera className="h-4 w-4 mr-2" />
              Use Camera
            </Button>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}