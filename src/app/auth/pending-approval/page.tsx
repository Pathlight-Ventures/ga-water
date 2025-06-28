"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/contexts/AuthContext'
import { Clock, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function PendingApprovalPage() {
  const { profile, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If user is approved, redirect to settings
    if (profile?.status === 'approved') {
      router.push('/settings')
    }
  }, [profile, router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Account Pending Approval
          </CardTitle>
          <CardDescription className="text-gray-600">
            Your account is currently being reviewed by our administrators
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Email Verification Complete</p>
                <p>Your email address has been successfully verified.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <Clock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Awaiting Admin Review</p>
                <p>Your account information is being reviewed by our team.</p>
              </div>
            </div>

            {profile && (
              <div className="space-y-3 p-4 bg-gray-50 border border-gray-200 rounded-md">
                <h4 className="font-medium text-gray-900">Account Details</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Name:</span>
                    <span className="font-medium">{profile.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="font-medium">{profile.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Organization:</span>
                    <span className="font-medium">{profile.organization}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Role:</span>
                    <span className="font-medium capitalize">{profile.role}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                You will receive an email notification once your account has been approved.
                This process typically takes 1-2 business days.
              </p>
            </div>

            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@example.com" className="text-orange-600 hover:underline">
                support@example.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  )
} 