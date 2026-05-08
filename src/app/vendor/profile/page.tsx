'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Home, Calendar, Users, LogOut, Loader2, Save, Clock, Key, Shield, User, MapPin } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface VendorProfile {
  id: string
  companyName: string
  serviceLocations: string | null
  teamSize: number | null
  dailyCapacity: number | null
  availability: string | null
  isActive: boolean
  updatedAt: string
  user: {
    name: string
    email: string
  }
}

export default function VendorProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<VendorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Forms
  const [profileData, setProfileData] = useState({
    name: '',
    teamSize: '',
    dailyCapacity: '',
    availability: '',
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (session?.user) {
      fetchProfile()
    }
  }, [session])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/vendor/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setProfileData({
          name: data.user.name || '',
          teamSize: (data.teamSize || '').toString(),
          dailyCapacity: (data.dailyCapacity || '').toString(),
          availability: data.availability || '',
        })
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/vendor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update profile')
      }

      toast({ title: 'Success', description: 'Profile updated successfully' })
      fetchProfile()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' })
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/vendor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to change password')
      }

      toast({ title: 'Success', description: 'Password changed successfully' })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to change password',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-gray-950 border-b overflow-x-auto sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex gap-4">
            <Link href="/vendor/dashboard" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap">
              <Home className="h-4 w-4" />
              Overview
            </Link>
            <Link href="/vendor/assignments" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap">
              <Calendar className="h-4 w-4" />
              Assigned
            </Link>
            <Link href="/vendor/history" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap">
              <Clock className="h-4 w-4" />
              History
            </Link>
            <Link href="/vendor/profile" className="flex items-center gap-2 py-4 px-4 border-b-2 border-emerald-600 text-emerald-600 font-medium whitespace-nowrap">
              <Users className="h-4 w-4" />
              Profile
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Management</h1>
              <p className="text-gray-500 mt-1">Manage your company details and account security</p>
            </div>
            <Badge variant={profile.isActive ? 'default' : 'secondary'} className="w-fit px-3 py-1">
              {profile.isActive ? 'Account Active' : 'Account Inactive'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar info */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-emerald-600" />
                    Company Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Company Name</Label>
                    <p className="font-medium">{profile.companyName}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Email</Label>
                    <p className="font-medium">{profile.user.email}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500 uppercase tracking-wider font-semibold flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Locations
                    </Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{profile.serviceLocations || 'Not specified'}</p>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-[10px] text-gray-400">Member since {new Date(profile.updatedAt).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-red-600">
                    <LogOut className="h-5 w-5" />
                    Session
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                    onClick={() => signOut()}
                  >
                    Logout from Dashboard
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main forms */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-emerald-600" />
                    Edit Details
                  </CardTitle>
                  <CardDescription>Update your personal and capacity information</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileSave} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="v-name">Full Name (Contact Person)</Label>
                      <Input 
                        id="v-name" 
                        value={profileData.name} 
                        onChange={e => setProfileData({...profileData, name: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="team-size">Team Size</Label>
                        <Input 
                          id="team-size" 
                          type="number"
                          value={profileData.teamSize} 
                          onChange={e => setProfileData({...profileData, teamSize: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="capacity">Daily Capacity (Jobs)</Label>
                        <Input 
                          id="capacity" 
                          type="number"
                          value={profileData.dailyCapacity} 
                          onChange={e => setProfileData({...profileData, dailyCapacity: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="availability">Availability Schedule</Label>
                      <Textarea 
                        id="availability" 
                        placeholder="e.g. Mon-Fri 9AM-6PM, Sat 10AM-2PM"
                        value={profileData.availability}
                        onChange={e => setProfileData({...profileData, availability: e.target.value})}
                      />
                    </div>

                    <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                      {saving ? 'Saving...' : 'Update Profile'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Password Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-emerald-600" />
                    Change Password
                  </CardTitle>
                  <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="cur-pass">Current Password</Label>
                      <Input 
                        id="cur-pass" 
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-pass">New Password</Label>
                        <Input 
                          id="new-pass" 
                          type="password"
                          value={passwordData.newPassword}
                          onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="conf-pass">Confirm Password</Label>
                        <Input 
                          id="conf-pass" 
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        />
                      </div>
                    </div>
                    <Button type="submit" disabled={saving} variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                      Update Password
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
