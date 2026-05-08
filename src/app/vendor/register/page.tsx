'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Sparkles, Upload, CheckCircle2, Loader2, ArrowLeft, ArrowRight, Download, FileText, AlertCircle } from 'lucide-react'
import { GetMyLocation } from '@/components/shared/get-my-location'

type Step = 1 | 2 | 3 | 4

export default function VendorRegisterPage() {
  const router = useRouter()

  const [step, setStep] = useState<Step>(1)

  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    companyName: '',
    ownerName: '',
    email: '',
    phone: '',
    serviceLocations: '',

    // Step 2: Service Capabilities
    servicesOffered: {
      residential: false,
      commercial: false,
      deepCleaning: false,
      moveInOut: false,
      carpetCleaning: false,
      postConstruction: false,
    },
    teamSize: '',
    dailyCapacity: '',
    availabilitySchedule: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },
    availabilityHours: {
      weekdayStart: '',
      weekdayEnd: '',
      weekendStart: '',
      weekendEnd: '',
    },

    // Step 3: Legal & Compliance
    licenseFile: null as File | null,
    licensePreview: '',
    identityDocFile: null as File | null,
    identityDocPreview: '',

    // Step 4: Contract Agreement
    contractSigned: false,
    contractFile: null as File | null,
    contractPreview: '',
  })

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Contract download state
  const [vendorContracts, setVendorContracts] = useState<any[]>([])
  const [loadingContracts, setLoadingContracts] = useState(false)

  // Fetch vendor contracts on mount
  useEffect(() => {
    fetchVendorContracts()
  }, [])

  const fetchVendorContracts = async () => {
    try {
      setLoadingContracts(true)
      const response = await fetch('/api/contract-templates')
      if (response.ok) {
        const data = await response.json()
        setVendorContracts(data)
      }
    } catch (err) {
      console.error('Failed to fetch vendor contracts:', err)
    } finally {
      setLoadingContracts(false)
    }
  }

  const handleFileChange = (field: 'license' | 'identityDoc' | 'contract', file: File | null) => {
    if (file) {
      const isImage = file.type.startsWith('image/')
      const isPdfMime = file.type === 'application/pdf'
      const isPdfName = file.name.toLowerCase().endsWith('.pdf')
      if (!isImage && !isPdfMime && !isPdfName) {
        setError('Please select an image or PDF file')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return
      }

      setError('')

      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          if (field === 'license') {
            setFormData({ ...formData, licenseFile: file, licensePreview: reader.result as string })
          } else if (field === 'identityDoc') {
            setFormData({ ...formData, identityDocFile: file, identityDocPreview: reader.result as string })
          } else {
            setFormData({ ...formData, contractFile: file, contractPreview: reader.result as string })
          }
        }
        reader.readAsDataURL(file)
      } else {
        if (field === 'license') {
          setFormData({ ...formData, licenseFile: file, licensePreview: '' })
        } else if (field === 'identityDoc') {
          setFormData({ ...formData, identityDocFile: file, identityDocPreview: '' })
        } else {
          setFormData({ ...formData, contractFile: file, contractPreview: '' })
        }
      }
    }
  }

  const validateStep = (): boolean => {
    setError('')

    switch (step) {
      case 1:
        if (!formData.companyName || !formData.ownerName || !formData.email || !formData.phone || !formData.serviceLocations) {
          setError('Please fill in all required fields')
          return false
        }
        break

      case 2:
        if (!Object.values(formData.servicesOffered).some(v => v)) {
          setError('Please select at least one service type')
          return false
        }
        if (!formData.teamSize || !formData.dailyCapacity) {
          setError('Please fill in team size and daily capacity')
          return false
        }
        if (!Object.values(formData.availabilitySchedule).some(v => v)) {
          setError('Please select at least one available day')
          return false
        }
        break

      case 3:
        if (!formData.licenseFile || !formData.identityDocFile) {
          setError('Please upload all required documents')
          return false
        }
        break

      case 4:
        if (!formData.contractSigned || !formData.contractFile) {
          setError('Please sign the contract and upload the signed copy')
          return false
        }
        break
    }

    return true
  }

  const handleNext = () => {
    if (validateStep()) {
      setStep((step + 1) as Step)
    }
  }

  const handlePrevious = () => {
    setError('')
    setStep((step - 1) as Step)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep()) {
      return
    }

    setSubmitting(true)
    setError('')

    try {
      // Create FormData for file uploads
      const submitData = new FormData()
      submitData.append('companyName', formData.companyName)
      submitData.append('ownerName', formData.ownerName)
      submitData.append('email', formData.email)
      submitData.append('phone', formData.phone)
      submitData.append('serviceLocations', formData.serviceLocations)
      submitData.append('servicesOffered', JSON.stringify(formData.servicesOffered))
      submitData.append('teamSize', formData.teamSize)
      submitData.append('dailyCapacity', formData.dailyCapacity)
      submitData.append('availabilitySchedule', JSON.stringify(formData.availabilitySchedule))
      submitData.append('availabilityHours', JSON.stringify({
        weekdayStart: formData.availabilityHours.weekdayStart,
        weekdayEnd: formData.availabilityHours.weekdayEnd,
        weekendStart: formData.availabilityHours.weekendStart,
        weekendEnd: formData.availabilityHours.weekendEnd,
      }))
      submitData.append('contractSigned', formData.contractSigned.toString())

      if (formData.licenseFile) {
        submitData.append('licenseFile', formData.licenseFile)
      }
      if (formData.identityDocFile) {
        submitData.append('identityDocFile', formData.identityDocFile)
      }
      if (formData.contractFile) {
        submitData.append('contractFile', formData.contractFile)
      }

      const response = await fetch('/api/vendor/register', {
        method: 'POST',
        body: submitData,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Registration failed')
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/')
      }, 5000)
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
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
                  Application Submitted!
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Your vendor application has been submitted. Our team will review it and contact you within 5-7 business days.
                </p>
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600 mx-auto" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Redirecting to home page...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-950/95">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-emerald-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Global Green Services
              </h1>
            </div>
          </Link>
          <Link href="/auth/login">
            <Button variant="ghost">Vendor Login</Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <Link href="/" className="inline-flex items-center text-emerald-600 hover:underline mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          <div className="mb-8">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Become a Vendor Partner
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Join our network of professional cleaning service providers
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                    s === step ? 'bg-emerald-600' : s < step ? 'bg-emerald-600' : 'bg-gray-300'
                  }`}
                >
                  {s < step ? '✓' : s}
                </div>
                {s < 4 && <div className={`w-20 h-1 ${s < step ? 'bg-emerald-600' : 'bg-gray-300'}`} />}
              </div>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                {step === 1 && 'Basic Information'}
                {step === 2 && 'Service Capabilities'}
                {step === 3 && 'Legal & Compliance'}
                {step === 4 && 'Contract Agreement'}
              </CardTitle>
              <CardDescription>
                Step {step} of 4
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="ABC Cleaning Services LLC"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Owner/Manager Name *</Label>
                    <Input
                      id="ownerName"
                      value={formData.ownerName}
                      onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      placeholder="John Smith"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contact@abccleaning.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="serviceLocations">Service Locations (comma-separated) *</Label>
                    <div className="flex gap-2">
                      <Textarea
                        id="serviceLocations"
                        value={formData.serviceLocations}
                        onChange={(e) => setFormData({ ...formData, serviceLocations: e.target.value })}
                        placeholder="New York, Brooklyn, Queens"
                        rows={3}
                        required
                        className="flex-1"
                      />
                      <GetMyLocation
                        onLocation={(address) => {
                          setFormData({ ...formData, serviceLocations: formData.serviceLocations ? `${formData.serviceLocations}, ${address}` : address })
                        }}
                        buttonClassName="flex-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Service Capabilities */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold mb-3 block">Types of Services Offered (select all that apply) *</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: 'residential', label: 'Residential Cleaning' },
                        { key: 'commercial', label: 'Commercial Cleaning' },
                        { key: 'deepCleaning', label: 'Deep Cleaning' },
                        { key: 'moveInOut', label: 'Move-In/Move-Out' },
                        { key: 'carpetCleaning', label: 'Carpet & Upholstery' },
                        { key: 'postConstruction', label: 'Post-Construction' },
                      ].map((service) => (
                        <div key={service.key} className="flex items-center space-x-2">
                          <Checkbox
                            id={service.key}
                            checked={formData.servicesOffered[service.key as keyof typeof formData.servicesOffered]}
                            onCheckedChange={(checked) =>
                              setFormData({
                                ...formData,
                                servicesOffered: {
                                  ...formData.servicesOffered,
                                  [service.key]: checked as boolean,
                                },
                              })
                            }
                          />
                          <Label htmlFor={service.key} className="text-sm font-normal cursor-pointer">
                            {service.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="teamSize">Team Size *</Label>
                      <Input
                        id="teamSize"
                        type="number"
                        value={formData.teamSize}
                        onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                        placeholder="5"
                        min="1"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dailyCapacity">Daily Capacity (jobs) *</Label>
                      <Input
                        id="dailyCapacity"
                        type="number"
                        value={formData.dailyCapacity}
                        onChange={(e) => setFormData({ ...formData, dailyCapacity: e.target.value })}
                        placeholder="3"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-semibold mb-3 block">Availability Schedule (days) *</Label>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        'monday',
                        'tuesday',
                        'wednesday',
                        'thursday',
                        'friday',
                        'saturday',
                        'sunday',
                      ].map((day) => (
                        <div key={day} className="flex items-center space-x-2">
                          <Checkbox
                            id={day}
                            checked={formData.availabilitySchedule[day as keyof typeof formData.availabilitySchedule]}
                            onCheckedChange={(checked) =>
                              setFormData({
                                ...formData,
                                availabilitySchedule: {
                                  ...formData.availabilitySchedule,
                                  [day]: checked as boolean,
                                },
                              })
                            }
                          />
                          <Label htmlFor={day} className="text-sm font-normal cursor-pointer capitalize">
                            {day}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-semibold mb-3 block">Availability Hours</Label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="weekdayStart">Weekday Hours</Label>
                        <div className="flex gap-2">
                          <Input
                            id="weekdayStart"
                            type="time"
                            placeholder="9:00"
                            value={formData.availabilityHours.weekdayStart || ''}
                            onChange={(e) => setFormData({ ...formData, availabilityHours: { ...formData.availabilityHours, weekdayStart: e.target.value } })}
                            className="flex-1"
                          />
                          <Input
                            id="weekdayEnd"
                            type="time"
                            placeholder="5:00"
                            value={formData.availabilityHours.weekdayEnd || ''}
                            onChange={(e) => setFormData({ ...formData, availabilityHours: { ...formData.availabilityHours, weekdayEnd: e.target.value } })}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weekendStart">Weekend Hours</Label>
                        <div className="flex gap-2">
                          <Input
                            id="weekendStart"
                            type="time"
                            placeholder="9:00"
                            value={formData.availabilityHours.weekendStart || ''}
                            onChange={(e) => setFormData({ ...formData, availabilityHours: { ...formData.availabilityHours, weekendStart: e.target.value } })}
                            className="flex-1"
                          />
                          <Input
                            id="weekendEnd"
                            type="time"
                            placeholder="6:00"
                            value={formData.availabilityHours.weekendEnd || ''}
                            onChange={(e) => setFormData({ ...formData, availabilityHours: { ...formData.availabilityHours, weekendEnd: e.target.value } })}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Example: Weekday 9:00 - 17:00, Weekend 10:00 - 18:00
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Legal & Compliance */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="licenseFile">Business License / Certificate *</Label>
                    <Input
                      id="licenseFile"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange('license', e.target.files?.[0] || null)}
                      required
                    />
                    {formData.licensePreview && (
                      <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
                        <img
                          src={formData.licensePreview}
                          alt="License preview"
                          className="max-w-full max-h-96 mx-auto"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="identityDocFile">Identity Verification Document *</Label>
                    <Input
                      id="identityDocFile"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange('identityDoc', e.target.files?.[0] || null)}
                      required
                    />
                    {formData.identityDocPreview && (
                      <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
                        <img
                          src={formData.identityDocPreview}
                          alt="Identity document preview"
                          className="max-w-full max-h-96 mx-auto"
                        />
                      </div>
                    )}
                  </div>

                  <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                    <AlertDescription className="text-blue-800 dark:text-blue-200">
                      All documents are securely stored and used only for verification purposes.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Step 4: Contract Agreement */}
              {step === 4 && (
                <div className="space-y-6">
                  <Alert className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                    <AlertDescription className="text-amber-800 dark:text-amber-200">
                      Please review and sign the vendor service agreement before submitting your application.
                    </AlertDescription>
                  </Alert>

                  {/* Contract Download Section */}
                  {/* Contract Download Section */}
                  <div className="space-y-4">
                    <Label className="text-base font-bold text-gray-900 dark:text-white">1. Download Agreement</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Download the vendor service agreement, review the terms, sign it, and upload it back.
                    </p>
                    
                    {loadingContracts ? (
                      <div className="flex items-center gap-3 p-6 border rounded-xl bg-gray-50 dark:bg-gray-800/50">
                        <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                        <span className="text-sm font-medium">Fetching the latest agreement...</span>
                      </div>
                    ) : vendorContracts.length > 0 ? (
                      <div className="space-y-3">
                        {vendorContracts.filter(c => c.isActive).slice(0, 1).map((contract) => (
                          <div
                            key={contract.id}
                            className="flex flex-col md:flex-row items-center justify-between p-6 border-2 border-emerald-100 dark:border-emerald-900/30 rounded-2xl bg-emerald-50/30 dark:bg-emerald-950/10 gap-4"
                          >
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                                <FileText className="h-8 w-8 text-emerald-600" />
                              </div>
                              <div>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                  {contract.title || 'Vendor Service Agreement'}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Version {contract.version} • PDF Document
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="default"
                              size="lg"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 rounded-xl w-full md:w-auto"
                              onClick={() => window.open(contract.fileUrl || contract.contractUrl, '_blank')}
                            >
                              <Download className="h-5 w-5 mr-2" />
                              Download PDF
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-center">
                        <AlertCircle className="h-10 w-10 text-orange-400 mx-auto mb-3" />
                        <h4 className="font-bold text-gray-900 dark:text-white mb-1">Contract Temporarily Unavailable</h4>
                        <p className="text-sm text-gray-500 max-w-xs mx-auto">
                          The service agreement is currently being updated by the administration. You can still upload your signed copy if you have it.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Label htmlFor="contractFile" className="text-base font-bold text-gray-900 dark:text-white">2. Upload Signed Copy</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Upload the signed and scanned PDF or image of the agreement.
                    </p>
                    <div className="relative">
                      <Input
                        id="contractFile"
                        type="file"
                        accept="image/*,.pdf"
                        className="h-14 pt-4 cursor-pointer"
                        onChange={(e) => handleFileChange('contract', e.target.files?.[0] || null)}
                        required
                      />
                      <Upload className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                    {formData.contractPreview && (
                      <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
                        <img
                          src={formData.contractPreview}
                          alt="Contract preview"
                          className="max-w-full max-h-96 mx-auto"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="contractSigned"
                      checked={formData.contractSigned}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, contractSigned: checked as boolean })
                      }
                      required
                    />
                    <Label htmlFor="contractSigned" className="text-sm leading-6 cursor-pointer">
                      I have read, understood, and agree to the terms and conditions of the vendor service agreement.
                    </Label>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={step === 1 || submitting}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                {step < 4 ? (
                  <Button onClick={handleNext} className="bg-emerald-600 hover:bg-emerald-700">
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
