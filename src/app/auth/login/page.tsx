"use client"

import { useState, Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock, AlertCircle, CheckCircle, Eye, EyeOff, Loader2, User, Building } from 'lucide-react'

type UserRole = 'researcher' | 'regulator' | 'consultant' | 'public' | 'admin'

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPage />
    </Suspense>
  )
}

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [organization, setOrganization] = useState('')
  const [role, setRole] = useState<UserRole>('public')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isResetMode, setIsResetMode] = useState(false)
  const [isSignUpMode, setIsSignUpMode] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Get redirect URL from query parameters
  const redirectTo = searchParams.get('redirectTo') || '/settings'

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string) => {
    return password.length >= 8
  }

  const validateName = (name: string) => {
    return name.trim().length >= 2
  }

  const validateOrganization = (org: string) => {
    return org.trim().length >= 2
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validation
    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters long')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again.')
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please check your email and click the confirmation link before signing in.')
        } else if (error.message.includes('User not found')) {
          setError('Account not found. Please check your email or create a new account.')
        } else {
          setError(error.message)
        }
      } else {
        setSuccess('Login successful! Redirecting...')
        setTimeout(() => {
          router.push(redirectTo)
        }, 1000)
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    // Validation
    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters long')
      setLoading(false)
      return
    }

    if (!validateName(fullName)) {
      setError('Please enter your full name')
      setLoading(false)
      return
    }

    if (!validateOrganization(organization)) {
      setError('Please enter your organization')
      setLoading(false)
      return
    }

    try {
      // First, create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`,
          data: {
            full_name: fullName,
            organization: organization,
            role: role,
            status: 'pending_approval' // Admin approval required
          }
        }
      })

      if (authError) {
        setError(authError.message)
      } else {
        // Create user profile in our custom table
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: authData.user?.id,
            email: email,
            full_name: fullName,
            organization: organization,
            role: role,
            status: 'pending_approval',
            created_at: new Date().toISOString()
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          // Don't show this error to user as account was created
        }

        setSuccess(
          'Account created successfully! Please check your email for verification. ' +
          'After email verification, your account will be reviewed by an administrator. ' +
          'You will receive an email when your account is approved.'
        )
        
        // Clear form
        setEmail('')
        setPassword('')
        setFullName('')
        setOrganization('')
        setRole('public')
        setIsSignUpMode(false)
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess('Password reset email sent! Please check your inbox.')
        setIsResetMode(false)
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case 'researcher':
        return 'Academic or research institution'
      case 'regulator':
        return 'Government regulatory agency'
      case 'consultant':
        return 'Environmental consulting firm'
      case 'public':
        return 'General public user'
      case 'admin':
        return 'System administrator'
      default:
        return ''
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <span className="w-6 h-6 bg-orange-400 rounded-full block"></span>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {isResetMode ? 'Reset Password' : isSignUpMode ? 'Create Account' : 'Partner Login'}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {isResetMode 
              ? 'Enter your email to receive a password reset link'
              : isSignUpMode
              ? 'Create your account to access partner features'
              : 'Sign in to access your account settings and preferences'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isResetMode ? (
            <form onSubmit={(e) => { e.preventDefault(); handlePasswordReset(); }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); clearMessages(); }}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <span className="text-sm text-red-600">{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-green-600">{success}</span>
                </div>
              )}

              <div className="space-y-2">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending reset email...
                    </>
                  ) : (
                    'Send Reset Email'
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setIsResetMode(false)}
                  disabled={loading}
                >
                  Back to Login
                </Button>
              </div>
            </form>
          ) : isSignUpMode ? (
            <form onSubmit={(e) => { e.preventDefault(); handleSignUp(); }} className="space-y-4">
              {/* Debug info */}
              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                Debug: isSignUpMode = {isSignUpMode.toString()}, role = {role}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); clearMessages(); }}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full-name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="full-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); clearMessages(); }}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="organization"
                    type="text"
                    placeholder="Enter your organization"
                    value={organization}
                    onChange={(e) => { setOrganization(e.target.value); clearMessages(); }}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <div className="border border-gray-300 rounded-md p-2 bg-white">
                  <Select 
                    value={role} 
                    onValueChange={(value: UserRole) => { 
                      console.log('Role changed to:', value); // Debug log
                      setRole(value); 
                      clearMessages(); 
                    }}
                  >
                    <SelectTrigger className="w-full border-0 bg-transparent">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="researcher">Researcher</SelectItem>
                      <SelectItem value="regulator">Regulator</SelectItem>
                      <SelectItem value="consultant">Consultant</SelectItem>
                      <SelectItem value="public">Public User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-gray-500">{getRoleDescription(role)}</p>
                <p className="text-xs text-blue-500">Debug: Current role is {role}</p>
              </div>

              {/* Simple test dropdown */}
              <div className="space-y-2">
                <Label>Test Dropdown</Label>
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="researcher">Researcher</option>
                  <option value="regulator">Regulator</option>
                  <option value="consultant">Consultant</option>
                  <option value="public">Public User</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password (min 8 characters)"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearMessages(); }}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <span className="text-sm text-red-600">{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-green-600">{success}</span>
                </div>
              )}

              <div className="space-y-2">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setIsSignUpMode(false)}
                  disabled={loading}
                >
                  Back to Login
                </Button>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  By creating an account, you agree to our terms of service and privacy policy.
                  Your account will be reviewed by an administrator after email verification.
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); clearMessages(); }}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearMessages(); }}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsResetMode(true)}
                  className="text-sm text-orange-600 hover:text-orange-700 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <span className="text-sm text-red-600">{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-green-600">{success}</span>
                </div>
              )}

              <div className="space-y-2">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setIsSignUpMode(true)}
                  disabled={loading}
                >
                  Create New Account
                </Button>
              </div>
            </form>
          )}

          {!isResetMode && !isSignUpMode && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account? Click &quot;Create New Account&quot; above to sign up.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
} 