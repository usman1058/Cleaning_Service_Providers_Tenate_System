'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Sparkles, CheckCircle2, Clock, Calendar, Home, Phone, Mail, MapPin, FileText, Loader2, ArrowLeft, AlertCircle, User, Link as LinkIcon, Receipt, X } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { AuthModal } from '@/components/auth/auth-modal'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Navbar } from '@/components/shared/navbar'

function BookingConfirmationContent() {
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const service = searchParams.get('service') || 'Your Service'
  const bookingId = searchParams.get('booking')

  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showLinkForm, setShowLinkForm] = useState(false)
  const [linkEmail, setLinkEmail] = useState('')
  const [linkPhone, setLinkPhone] = useState('')
  const [linking, setLinking] = useState(false)
  const [linkError, setLinkError] = useState('')
  const [linkSuccess, setLinkSuccess] = useState('')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showPendingReceiptsModal, setShowPendingReceiptsModal] = useState(false)
  const [pendingReceipts, setPendingReceipts] = useState<any[]>([])
  const [loadingPending, setLoadingPending] = useState(false)

  useEffect(() => {
    if (bookingId) {
      fetchBooking(bookingId)
    } else {
      setLoading(false)
    }
  }, [bookingId])

  const fetchBooking = async (id: string) => {
    try {
      const response = await fetch('/api/booking-confirmation?booking=' + id)
      if (response.ok) {
        const data = await response.json()
        setBooking(data)
      }
    } catch (error) {
      console.error('Failed to fetch booking:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLinkBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setLinking(true)
    setLinkError('')
    setLinkSuccess('')

    try {
      const response = await fetch('/api/client/link-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          email: linkEmail,
          phone: linkPhone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setLinkError(data.error || 'Failed to link booking')
        return
      }

      setLinkSuccess(data.message)
      setShowLinkForm(false)
      fetchBooking(booking.id)
    } catch (error) {
      setLinkError('An error occurred. Please try again.')
    } finally {
      setLinking(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; label: string }> = {
      PENDING_VERIFICATION: { variant: 'secondary', label: 'Pending Verification' },
      VERIFIED: { variant: 'default', label: 'Verified' },
      ASSIGNED: { variant: 'default', label: 'Assigned' },
      IN_PROGRESS: { variant: 'default', label: 'In Progress' },
      COMPLETED: { variant: 'default', label: 'Completed' },
      CANCELLED: { variant: 'destructive', label: 'Cancelled' },
    }

    const config = statusConfig[status] || statusConfig.PENDING_VERIFICATION
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const fetchPendingReceipts = async () => {
    setLoadingPending(true)
    try {
      const response = await fetch('/api/pending-receipts')
      if (response.ok) {
        const data = await response.json()
        setPendingReceipts(data)
        setShowPendingReceiptsModal(true)
      }
    } catch (error) {
      console.error('Failed to fetch pending receipts:', error)
    } finally {
      setLoadingPending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading booking details...</p>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />

        <section className="container mx-auto px-4 py-16">
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {bookingId ? 'Booking Not Found' : 'Service Selected'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {bookingId
                  ? 'The booking you are looking for does not exist or has been removed.'
                  : 'Please select a service from our services page to continue with your booking.'}
              </p>
              <Link href="/">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>

        <footer className="bg-gray-900 text-white py-8">
          <div className="container mx-auto px-4 text-center text-gray-400">
            <p>© {new Date().getFullYear()} Global Green Services. All rights reserved.</p>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center text-emerald-600 hover:underline mb-8">
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          {/* Link Booking Alert (Guest Mode) */}
          {!session?.user && booking && !booking.userId && !showLinkForm && (
            <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex-shrink-0">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">
                    Not Linked to Account Yet
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
                    You booked this service as a guest. To track it from your dashboard, link it to your account first.
                  </p>
                  <Button
                    onClick={() => setShowLinkForm(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Link Booking to Account
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Link Booking Form */}
          {showLinkForm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Link Booking to Your Account</CardTitle>
                <CardDescription>
                  Enter the email and phone from your booking to link it to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLinkBooking} className="space-y-4">
                  {linkError && (
                    <Alert variant="destructive">
                      <AlertDescription>{linkError}</AlertDescription>
                    </Alert>
                  )}
                  {linkSuccess && (
                    <Alert className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
                      <AlertDescription className="text-emerald-800 dark:text-emerald-200">
                        {linkSuccess}
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="linkEmail">Email Address *</Label>
                      <Input
                        id="linkEmail"
                        type="email"
                        placeholder="Enter email from booking"
                        value={linkEmail}
                        onChange={(e) => setLinkEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="linkPhone">Phone Number *</Label>
                      <Input
                        id="linkPhone"
                        type="tel"
                        placeholder="Enter phone from booking"
                        value={linkPhone}
                        onChange={(e) => setLinkPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={linking}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    >
                      {linking ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Linking...
                        </>
                      ) : (
                        'Link Booking'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowLinkForm(false)}
                      disabled={linking}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 dark:bg-emerald-900/20 rounded-full mb-4">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Booking Confirmed!
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Thank you for booking your cleaning service.
            </p>
          </div>

          {/* Booking Details */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
              <CardDescription>
                Booking ID: {bookingId}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Service</p>
                  <p className="font-semibold text-xl text-gray-900 dark:text-white">
                    {booking.service?.name || 'Custom Service'}
                  </p>
                  {booking.service?.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {booking.service.description}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Status</p>
                  <div className="mt-2">
                    {getStatusBadge(booking.status)}
                  </div>
                </div>
              </div>

              {booking.receipt && booking.receipt.status !== 'PENDING' && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Receipt Status: {booking.receipt.status}
                  </p>
                  {booking.receipt.adminRemarks && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Admin Remarks: {booking.receipt.adminRemarks}
                    </p>
                  )}
                </div>
              )}

              {booking.assignment && (
                <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-white mb-1">
                    Vendor: {booking.assignment.vendor.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {booking.assignment.vendor.companyName}
                  </p>
                </div>
              )}

              {booking.scheduledDate && booking.receipt && booking.receipt.status !== 'PENDING' && (
                <div className="mt-6">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Scheduled For</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {new Date(booking.scheduledDate).toLocaleString([], {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t">
                <div className="text-3xl font-bold text-emerald-600">
                  ${(booking.service?.startingPrice ?? 0).toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center mb-8">
            {!booking.receipt && (
              <Link href={`/receipt-upload?request=${booking.id}`}>
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                  <FileText className="h-5 w-5 mr-2" />
                  Upload Receipt
                </Button>
              </Link>
            )}

            {booking.receipt && session?.user && !booking.userId && (
              <Button
                onClick={() => setShowLinkForm(true)}
                size="lg"
                variant="outline"
              >
                <User className="h-5 w-5 mr-2" />
                Link to Account
              </Button>
            )}

            <Link href="/client/services">
              <Button size="lg" variant="outline">
                <FileText className="h-5 w-5 mr-2" />
                View My Services
              </Button>
            </Link>

            {session?.user && (
              <Button
                onClick={fetchPendingReceipts}
                size="lg"
                variant="secondary"
                disabled={loadingPending}
              >
                <Receipt className="h-5 w-5 mr-2" />
                {loadingPending ? 'Loading...' : 'View Pending Receipts'}
              </Button>
            )}
          </div>

          {/* Contact Info */}
          <div className="p-6 bg-white dark:bg-gray-950 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Phone className="h-5 w-5 text-emerald-600" />
              Need Help?
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Phone Support</p>
                <p className="text-gray-900 dark:text-white">+1 (555) 123-4567</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Email Support</p>
                <p className="text-gray-900 dark:text-white">support@greenservices.com</p>
              </div>
              <div>
                <Link href="/contact" className="text-sm font-medium text-emerald-600 hover:underline">
                  Contact Us &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>© {new Date().getFullYear()} Global Green Services. All rights reserved.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        redirectOnSuccess={false}
        onSuccess={() => {
          // Refresh booking data after login
          if (bookingId) {
            fetchBooking(bookingId)
          }
        }}
      />

      {/* Pending Receipts Modal */}
      <Dialog open={showPendingReceiptsModal} onOpenChange={setShowPendingReceiptsModal}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Bookings Awaiting Receipts
            </DialogTitle>
            <DialogDescription>
              These services have been completed but payment receipts have not been uploaded yet
            </DialogDescription>
            <button
              onClick={() => setShowPendingReceiptsModal(false)}
              className="ml-auto"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          <ScrollArea className="h-[60vh]">
            <div className="space-y-3 p-4">
              {pendingReceipts.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">
                    No bookings awaiting receipt uploads
                  </p>
                </div>
              ) : (
                pendingReceipts.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="py-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {booking.service?.name || 'Custom Service'}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {new Date(booking.createdAt).toLocaleString([], {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">{booking.status}</Badge>
                      </div>
                      <div className="text-2xl font-bold text-emerald-600 mb-2">
                        ${booking.service?.startingPrice?.toFixed(2) || '0.00'}
                      </div>
                      <div className="flex gap-3">
                        <Link
                          href={`/booking-confirmation?service=${booking.service?.slug || 'custom'}&booking=${booking.id}`}
                          className="flex-1"
                        >
                          <Button variant="outline" className="w-full">
                            View Booking
                          </Button>
                        </Link>
                        <Link
                          href={`/receipt-upload?request=${booking.id}`}
                          className="flex-1"
                        >
                          <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                            <Receipt className="h-4 w-4 mr-2" />
                            Upload Receipt
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function BookingConfirmation() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
      </div>
    }>
      <BookingConfirmationContent />
    </Suspense>
  )
}
