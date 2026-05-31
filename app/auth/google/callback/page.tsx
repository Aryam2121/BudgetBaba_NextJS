"use client"

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { api } from '@/lib/api'

export default function GoogleCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loginWithToken } = useAuth()
  const handledRef = useRef(false)

  useEffect(() => {
    if (handledRef.current) return
    handledRef.current = true

    const handleCallback = async () => {
      const code = searchParams.get('code')
      const error = searchParams.get('error')

      if (error) {
        console.error('Google OAuth error:', error)
        toast.error('Google login was cancelled or failed')
        router.push('/auth/login')
        return
      }

      if (!code) {
        toast.error('No authorization code received')
        router.push('/auth/login')
        return
      }

      try {
        // Send code to backend via API client
        const response = await api.googleCallback(code)

        if (response.error || !response.data) {
          throw new Error(response.error || 'Google login failed')
        }

        // Store token and user data
        loginWithToken(response.data.user, response.data.token)

        toast.success(`Welcome back, ${response.data.user.name}! 🎉`)
        
        // Check if Gmail is connected
        if (response.data.user.emailConnections?.gmail?.connected) {
          toast.success('Gmail connected for personalized emails! 📧')
        }

        router.push('/dashboard')
      } catch (error) {
        console.error('Google callback error:', error)
        toast.error(error instanceof Error ? error.message : 'Google login failed')
        router.push('/auth/login')
      }
    }

    handleCallback()
  }, [searchParams, router, loginWithToken])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-blue-600">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Completing Google Sign-in...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we verify your account
          </p>
        </div>
      </div>
    </div>
  )
}