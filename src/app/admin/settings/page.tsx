'use client'

import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Save, Upload, Shield, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from '@/hooks/use-toast'

interface SystemSettings {
  maxUploadFileSize?: number
  maxContractFileSize?: number
  id?: string
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    maxUploadFileSize: 5.0,
    maxContractFileSize: 10.0,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Fetch current settings on mount
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/system-settings')

      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }

      const data = await response.json()

      if (data && typeof data.maxUploadFileSize === 'number') {
        setSettings(data)
      }
    } catch (err) {
      console.error('Error fetching settings:', err)
      setError('Failed to load settings. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      const response = await fetch('/api/admin/system-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxUploadFileSize: settings.maxUploadFileSize,
          maxContractFileSize: settings.maxContractFileSize,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save settings')
      }

      setSuccess(true)
      toast({
        title: 'Settings Saved',
        description: 'System settings have been updated successfully.',
        variant: 'default',
      })

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save settings'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof SystemSettings, value: string) => {
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue > 0) {
      setSettings(prev => ({ ...prev, [field]: numValue }))
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            System Settings
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Configure system-wide settings and preferences
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-emerald-800 dark:text-emerald-200">
            Settings saved successfully!
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6 max-w-3xl">
        {/* Upload Settings Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-emerald-600" />
              <CardTitle>Upload File Size Limits</CardTitle>
            </div>
            <CardDescription>
              Configure the maximum file size allowed for different types of uploads.
              These limits will be enforced across the platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="maxUploadFileSize">
                Max Receipt Upload Size (MB)
              </Label>
              <Input
                id="maxUploadFileSize"
                type="number"
                step="0.1"
                min="0.1"
                max="100"
                value={settings.maxUploadFileSize || ''}
                onChange={(e) => handleInputChange('maxUploadFileSize', e.target.value)}
                placeholder="e.g., 5.0"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Maximum file size for receipt uploads. Default: 5.0 MB
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxContractFileSize">
                Max Contract File Size (MB)
              </Label>
              <Input
                id="maxContractFileSize"
                type="number"
                step="0.1"
                min="0.1"
                max="100"
                value={settings.maxContractFileSize || ''}
                onChange={(e) => handleInputChange('maxContractFileSize', e.target.value)}
                placeholder="e.g., 10.0"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Maximum file size for vendor contract uploads. Default: 10.0 MB
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              <CardTitle>Security Settings</CardTitle>
            </div>
            <CardDescription>
              Manage security-related system configurations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>Additional security settings will be available in future updates.</p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={fetchSettings}
            disabled={saving}
          >
            Reset
          </Button>
          <Button
            onClick={handleSaveSettings}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  )
}
