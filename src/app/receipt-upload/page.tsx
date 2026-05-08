'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Sparkles, Upload, CheckCircle2, AlertCircle, Loader2, Info } from 'lucide-react'
import { Navbar } from '@/components/shared/navbar'

function ReceiptUploadPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestId = searchParams.get('request')
  const { data: session, status } = useSession()

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pendingId = localStorage.getItem('pendingReceiptUploadRequestId')
      if (pendingId && pendingId !== requestId && session?.user) {
        // Clear the pending ID since we're now logged in
        localStorage.removeItem('pendingReceiptUploadRequestId')
        window.location.href = `/receipt-upload?request=${pendingId}`
      }
    }
  }, [requestId, session])

  useEffect(() => {
    if (!requestId) {
      router.push('/services')
    }
  }, [requestId, router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Check file type
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please select an image file (JPG, PNG, etc.)')
        return
      }

      // Check file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return
      }

      setFile(selectedFile)
      setError('')

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file || !requestId) {
      setError('Please select a file to upload')
      return
    }

    setUploading(true)
    setError('')

    try {
      // Create FormData
      const formData = new FormData()
      formData.append('file', file)
      formData.append('serviceRequestId', requestId)

      const response = await fetch('/api/receipts', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to upload receipt')
        return
      }

      setSuccess(true)
      // Store the request ID for after login
      if (typeof window !== 'undefined') {
        localStorage.setItem('pendingReceiptUploadRequestId', requestId || '')
      }

      setTimeout(async () => {
        if (session?.user) {
          router.push('/client/dashboard')
          return
        }

        const guestToken = typeof window !== 'undefined' && requestId
          ? localStorage.getItem(`guestAutoLogin:${requestId}`)
          : null

        if (guestToken) {
          const result = await signIn('credentials', {
            guestToken,
            redirect: false,
          })

          if (result?.ok) {
            if (typeof window !== 'undefined' && requestId) {
              localStorage.removeItem(`guestAutoLogin:${requestId}`)
            }
            router.push('/client/dashboard?completeProfile=1')
            return
          }
        }

        const callbackUrl = encodeURIComponent(`/receipt-upload?request=${requestId}`)
        router.push(`/auth/login?callbackUrl=${callbackUrl}`)
      }, 2000)
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  if (status === 'loading' || uploading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">
            {uploading ? 'Uploading receipt...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-md">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle2 className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Receipt Uploaded!
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Your payment receipt has been submitted for verification.
                </p>
                {session?.user ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Redirecting to your dashboard...
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Redirecting to login...
                  </p>
                )}
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600 mx-auto mt-4" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Info Alert */}
          {!session?.user && (
            <Alert className="mb-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                You'll be redirected to login after uploading your receipt to track your service.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Upload Payment Receipt</CardTitle>
              <CardDescription>
                Please upload your payment receipt to verify your service request
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpload} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* File Upload */}
                <div className="space-y-2">
                  <Label htmlFor="receipt">Payment Receipt *</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input
                        id="receipt"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="cursor-pointer"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Accepted formats: JPG, PNG, GIF. Max size: 5MB
                  </p>
                </div>

                {/* Preview */}
                {preview && (
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
                      <img
                        src={preview}
                        alt="Receipt preview"
                        className="max-w-full max-h-96 mx-auto"
                      />
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Upload Instructions:
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• Ensure the receipt is clear and readable</li>
                    <li>• Show the payment amount and date</li>
                    <li>• Include transaction reference if available</li>
                    <li>• Use a good quality image</li>
                  </ul>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 py-6"
                  disabled={!file || uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-5 w-5" />
                      Upload Receipt
                    </>
                  )}
                </Button>

                <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                  Your receipt will be verified by our team. You can check the status in your dashboard.
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Back Link */}
          <div className="mt-6 text-center">
            <Link href="/services" className="text-emerald-600 hover:underline">
              ← Back to Services
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>© {new Date().getFullYear()} Global Green Services. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    </div>}>
      <ReceiptUploadPage />
    </Suspense>
  )
}
