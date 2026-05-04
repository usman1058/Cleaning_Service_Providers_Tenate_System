'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, X } from 'lucide-react'

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  redirectOnSuccess?: boolean
}

export function AuthModal({ open, onOpenChange, onSuccess, redirectOnSuccess = true }: AuthModalProps) {
  const router = useRouter()

  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Signup state
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupPhone, setSignupPhone] = useState('')
  const [signupError, setSignupError] = useState('')
  const [signupLoading, setSignupLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)

    try {
      const result = await signIn('credentials', {
        email: loginEmail,
        password: loginPassword,
        redirect: false,
      })

      if (result?.error) {
        setLoginError('Invalid email or password')
      } else if (result?.ok) {
        // Fetch user session to get role information
        const sessionResponse = await fetch('/api/auth/session')
        const sessionData = await sessionResponse.json()

        if (redirectOnSuccess) {
          // Determine correct dashboard based on user role
          let targetUrl = '/'

          if (sessionData?.user?.role) {
            switch (sessionData.user.role) {
              case 'ADMIN':
                targetUrl = '/admin/dashboard'
                break
              case 'VENDOR':
                targetUrl = '/vendor/dashboard'
                break
              case 'CLIENT':
                targetUrl = '/client/dashboard'
                break
              default:
                targetUrl = '/'
            }
          }

          router.push(targetUrl)
          router.refresh()
        } else {
          onOpenChange(false)
          onSuccess?.()
        }
      }
    } catch (error) {
      setLoginError('An error occurred. Please try again.')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignupError('')
    setSignupLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupName,
          email: signupEmail,
          password: signupPassword,
          phone: signupPhone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setSignupError(data.error || 'Registration failed')
        return
      }

      // Auto-login after signup
      const loginResult = await signIn('credentials', {
        email: signupEmail,
        password: signupPassword,
        redirect: false,
      })

      if (loginResult?.ok) {
        if (redirectOnSuccess) {
          router.push('/client/dashboard')
          router.refresh()
        } else {
          onOpenChange(false)
          onSuccess?.()
        }
      }
    } catch (error) {
      setSignupError('An error occurred. Please try again.')
    } finally {
      setSignupLoading(false)
    }
  }

  const handleClose = () => {
    setLoginEmail('')
    setLoginPassword('')
    setLoginError('')
    setSignupName('')
    setSignupEmail('')
    setSignupPassword('')
    setSignupPhone('')
    setSignupError('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login" className="space-y-4 mt-4">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Welcome Back</DialogTitle>
              <DialogDescription>
                Sign in to your Global Green Services account
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <Alert variant="destructive">
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="your@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  disabled={loginLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="•••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  disabled={loginLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={loginLoading}
              >
                {loginLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="text-sm text-center">
              <p className="text-muted-foreground">
                Want to become a vendor?{' '}
                <a
                  href="/vendor/register"
                  onClick={() => onOpenChange(false)}
                  className="text-emerald-600 hover:underline font-medium"
                >
                  Apply here
                </a>
              </p>
            </div>
          </TabsContent>

          {/* Signup Tab */}
          <TabsContent value="signup" className="space-y-4 mt-4">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Create Account</DialogTitle>
              <DialogDescription>
                Join Global Green Services as a client
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSignup} className="space-y-4">
              {signupError && (
                <Alert variant="destructive">
                  <AlertDescription>{signupError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="John Doe"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  required
                  disabled={signupLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your@email.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                  disabled={signupLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-phone">Phone</Label>
                <Input
                  id="signup-phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  disabled={signupLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="•••••••"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={signupLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={signupLoading}
              >
                {signupLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <div className="text-sm text-center">
              <p className="text-muted-foreground">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    // Switch to login tab
                    const loginTab = document.querySelector('[data-state="active"][value="signup"]')
                    if (loginTab) {
                      loginTab.setAttribute('value', 'login')
                    }
                  }}
                  className="text-emerald-600 hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
