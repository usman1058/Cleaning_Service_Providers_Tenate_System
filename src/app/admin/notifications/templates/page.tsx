'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Bell, Loader2, Save, CheckCircle2 } from 'lucide-react'

interface Template {
  id: string
  name: string
  subject: string
  body: string
}

export default function NotificationTemplatesPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [bookingSubject, setBookingSubject] = useState('')
  const [bookingBody, setBookingBody] = useState('')
  const [receiptSubject, setReceiptSubject] = useState('')
  const [receiptBody, setReceiptBody] = useState('')

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/notifications/templates')
      if (response.ok) {
        const data = await response.json()
        const booking = data.find((t: Template) => t.name === 'booking')
        const receipt = data.find((t: Template) => t.name === 'receipt')
        if (booking) {
          setBookingSubject(booking.subject)
          setBookingBody(booking.body)
        }
        if (receipt) {
          setReceiptSubject(receipt.subject)
          setReceiptBody(receipt.body)
        }
      }
    } catch (error) {
      setError('Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSuccess('')
    setError('')
    try {
      const response = await fetch('/api/admin/notifications/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templates: [
            { name: 'booking', subject: bookingSubject, body: bookingBody },
            { name: 'receipt', subject: receiptSubject, body: receiptBody },
          ],
        }),
      })
      if (!response.ok) throw new Error('Failed to save')
      setSuccess('Templates saved successfully')
    } catch (error) {
      setError('Failed to save templates')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="h-8 w-8 text-emerald-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Notification Templates
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Manage notification templates for emails and messages
        </p>
      </div>

      {success && (
        <Alert className="mb-6 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-emerald-800 dark:text-emerald-200 ml-2">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading templates...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Confirmation Template</CardTitle>
              <CardDescription>
                Template sent when a booking is confirmed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bookingSubject">Subject</Label>
                <Input
                  id="bookingSubject"
                  placeholder="Booking Confirmation - {Service Name}"
                  value={bookingSubject}
                  onChange={(e) => setBookingSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bookingBody">Body</Label>
                <Textarea
                  id="bookingBody"
                  rows={6}
                  placeholder="Dear {Customer Name}, your booking for {Service Name} has been confirmed..."
                  value={bookingBody}
                  onChange={(e) => setBookingBody(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Receipt Verification Template</CardTitle>
              <CardDescription>
                Template sent when a receipt is verified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="receiptSubject">Subject</Label>
                <Input
                  id="receiptSubject"
                  placeholder="Receipt Verified"
                  value={receiptSubject}
                  onChange={(e) => setReceiptSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receiptBody">Body</Label>
                <Textarea
                  id="receiptBody"
                  rows={6}
                  placeholder="Dear {Vendor Name}, the receipt for booking {Booking ID} has been verified..."
                  value={receiptBody}
                  onChange={(e) => setReceiptBody(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Templates
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
