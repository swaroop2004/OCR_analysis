'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { Mail, AlertCircle } from 'lucide-react'

interface LoginFormProps {
  onLogin: (userData: { id: string; username: string; email: string }) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [showOtp, setShowOtp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [otpFallback, setOtpFallback] = useState('')
  const [isEmailValidating, setIsEmailValidating] = useState(false)
  const { toast } = useToast()

  const handleSendOtp = async () => {
    if (!username.trim() || !email.trim()) {
      setError('Please fill in all fields')
      return
    }

    setIsLoading(true)
    setError('')
    setOtpFallback('')
    setIsEmailValidating(true)

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP')
      }

      setShowOtp(true)
      
      // Check if email failed and we have a fallback OTP
      if (data.otpFallback) {
        setOtpFallback(data.otpFallback)
        toast({
          title: 'OTP Generated',
          description: 'Email failed to send, but OTP was generated. Check the fallback code below.',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'OTP Sent',
          description: 'Please check your email for the verification code',
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP')
    } finally {
      setIsLoading(false)
      setIsEmailValidating(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otpCode.trim()) {
      setError('Please enter the OTP code')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, otpCode }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify OTP')
      }

      toast({
        title: 'Login Successful',
        description: 'Welcome to the Ingredient Analyzer',
      })

      // Use the user data returned from the API (includes the id)
      onLogin(data.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify OTP')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="h-5 w-5 mr-2" />
          Login to Ingredient Analyzer
        </CardTitle>
        <CardDescription>
          Enter your details to analyze product ingredients
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showOtp ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || isEmailValidating}
              />
              <p className="text-xs text-gray-500">
                We'll validate your email domain to ensure it's active
              </p>
            </div>
            <Button 
              onClick={handleSendOtp} 
              className="w-full" 
              disabled={isLoading || isEmailValidating}
            >
              {isLoading || isEmailValidating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEmailValidating ? 'Validating Email...' : 'Sending...'}
                </>
              ) : (
                'Send OTP'
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                disabled={isLoading}
                maxLength={6}
              />
            </div>
            
            {otpFallback && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Email failed to send.</strong><br />
                  Use this fallback OTP code: <strong className="text-lg">{otpFallback}</strong><br />
                  <small>This code is also logged in the server console.</small>
                </AlertDescription>
              </Alert>
            )}
            
            <Button 
              onClick={handleVerifyOtp} 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowOtp(false)} 
              className="w-full"
              disabled={isLoading}
            >
              Back to Login
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