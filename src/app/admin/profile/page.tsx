'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { User, Loader2, CheckCircle2, UserPlus, Shield, Trash2, Mail, Key } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'

interface AdminUser {
  id: string
  name: string
  email: string
  permissions: string | null
  createdAt: string
}

const ALL_PERMISSIONS = [
  { id: 'manage_admins', label: 'Manage Admins', description: 'Can add, edit, and remove other admin accounts' },
  { id: 'manage_vendors', label: 'Manage Vendors', description: 'Can approve vendors and manage vendor contracts' },
  { id: 'manage_clients', label: 'Manage Clients', description: 'Can view and manage client accounts' },
  { id: 'manage_services', label: 'Manage Services', description: 'Can manage categories and service offerings' },
  { id: 'view_reports', label: 'View Reports', description: 'Can access audit logs and system reports' },
]

export default function AdminProfilePage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('profile')
  
  // Profile Form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Admin Management State
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loadingAdmins, setLoadingAdmins] = useState(false)
  const [addAdminDialogOpen, setAddAdminDialogOpen] = useState(false)
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: '',
    permissions: [] as string[],
  })

  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || '',
      }))
      setLoading(false)
      
      // If admin has permission, fetch other admins
      fetchAdmins()
    }
  }, [session])

  const fetchAdmins = async () => {
    try {
      setLoadingAdmins(true)
      const response = await fetch('/api/admin/users/admins')
      if (response.ok) {
        const data = await response.json()
        setAdmins(data)
      }
    } catch (err) {
      console.error('Failed to fetch admins:', err)
    } finally {
      setLoadingAdmins(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          ...(formData.currentPassword && formData.newPassword
            ? { currentPassword: formData.currentPassword, newPassword: formData.newPassword }
            : {}),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update profile')
      }

      setSuccess('Profile updated successfully')
      setFormData((prev) => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleAddAdmin = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/users/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAdmin,
          permissions: newAdmin.permissions.join(','),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add admin')
      }

      toast({ title: 'Success', description: 'Admin account created successfully' })
      setAddAdminDialogOpen(false)
      setNewAdmin({ name: '', email: '', password: '', permissions: [] })
      fetchAdmins()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to add admin',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAdmin = async (id: string) => {
    if (!confirm('Are you sure you want to remove this admin?')) return

    try {
      const response = await fetch(`/api/admin/users/admins/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete admin')
      }

      toast({ title: 'Success', description: 'Admin removed successfully' })
      fetchAdmins()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete admin',
        variant: 'destructive'
      })
    }
  }

  const togglePermission = (permId: string) => {
    setNewAdmin(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(id => id !== permId)
        : [...prev.permissions, permId]
    }))
  }

  const canManageAdmins = admins.length > 0 || (session?.user as any)?.permissions?.includes('manage_admins')

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <User className="h-8 w-8 text-emerald-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Profile Settings
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Update your account information and manage your team
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="profile">My Profile</TabsTrigger>
          <TabsTrigger value="team">Team Management</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
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
              <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
            </div>
          ) : (
            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="bg-gray-50 dark:bg-gray-800"
                    />
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={formData.currentPassword}
                          onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                          placeholder="Leave blank to keep current password"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={formData.newPassword}
                          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                          placeholder="Minimum 6 characters"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          name: session?.user?.name || '',
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: '',
                        }))
                        setError('')
                        setSuccess('')
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Admin Users</CardTitle>
                  <CardDescription>
                    Manage administrative access and permissions
                  </CardDescription>
                </div>
                <Dialog open={addAdminDialogOpen} onOpenChange={setAddAdminDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Admin
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Admin</DialogTitle>
                      <DialogDescription>
                        Create a new administrative account with specific permissions.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-name">Full Name</Label>
                        <Input
                          id="new-name"
                          value={newAdmin.name}
                          onChange={e => setNewAdmin({...newAdmin, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-email">Email Address</Label>
                        <Input
                          id="new-email"
                          type="email"
                          value={newAdmin.email}
                          onChange={e => setNewAdmin({...newAdmin, email: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">Temporary Password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={newAdmin.password}
                          onChange={e => setNewAdmin({...newAdmin, password: e.target.value})}
                        />
                      </div>
                      <div className="space-y-3 pt-2">
                        <Label>Permissions</Label>
                        <div className="grid gap-4 pt-2">
                          {ALL_PERMISSIONS.map(perm => (
                            <div key={perm.id} className="flex items-start space-x-3">
                              <Checkbox
                                id={perm.id}
                                checked={newAdmin.permissions.includes(perm.id)}
                                onCheckedChange={() => togglePermission(perm.id)}
                              />
                              <div className="grid gap-1.5 leading-none">
                                <Label
                                  htmlFor={perm.id}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {perm.label}
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                  {perm.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setAddAdminDialogOpen(false)}>Cancel</Button>
                      <Button
                        onClick={handleAddAdmin}
                        disabled={saving || !newAdmin.name || !newAdmin.email || !newAdmin.password}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        {saving ? 'Creating...' : 'Create Account'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loadingAdmins ? (
                <div className="py-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-600 mb-2" />
                  <p className="text-sm text-gray-500">Loading administrators...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {admins.map(admin => (
                    <div key={admin.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex gap-4">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{admin.name}</h4>
                            {admin.id === session?.user?.id && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">You</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                            <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {admin.email}</span>
                            <span>•</span>
                            <span>Joined {new Date(admin.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {admin.permissions?.split(',').filter(Boolean).map(p => {
                              const label = ALL_PERMISSIONS.find(ap => ap.id === p)?.label || p
                              return (
                                <Badge key={p} variant="outline" className="text-[10px] bg-gray-50 dark:bg-gray-800 border-emerald-200 dark:border-emerald-800">
                                  <Shield className="h-2.5 w-2.5 mr-1 text-emerald-600" />
                                  {label}
                                </Badge>
                              )
                            })}
                            {!admin.permissions && (
                              <span className="text-xs text-gray-400">No specific permissions</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {admin.id !== session?.user?.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteAdmin(admin.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {admins.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                      <Shield className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500">No other administrators found.</p>
                      <p className="text-sm text-gray-400 mt-1">You can add team members using the button above.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
