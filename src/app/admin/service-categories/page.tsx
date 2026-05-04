'use client'

import { useState, useEffect } from 'react'
import { FolderTree, FolderPlus, Edit, Trash2, Plus, Search, Save, X, ChevronRight, ChevronDown, BadgeCheck, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from '@/hooks/use-toast'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  isActive: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
  subcategories?: Subcategory[]
  _count?: {
    services: number
  }
}

interface Subcategory {
  id: string
  name: string
  slug: string
  categoryId: string
  description: string | null
  isActive: boolean
  displayOrder: number
  category?: {
    id: string
    name: string
  }
  _count?: {
    services: number
  }
}

export default function ServiceCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Category dialog state
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    isActive: true,
    displayOrder: 0,
  })
  const [savingCategory, setSavingCategory] = useState(false)

  // Subcategory dialog state
  const [subcategoryDialogOpen, setSubcategoryDialogOpen] = useState(false)
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null)
  const [subcategoryForm, setSubcategoryForm] = useState({
    name: '',
    slug: '',
    categoryId: '',
    description: '',
    isActive: true,
    displayOrder: 0,
  })
  const [savingSubcategory, setSavingSubcategory] = useState(false)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')

  // Expanded categories for subcategory view
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchCategories()
    fetchSubcategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/categories?includeInactive=true')
      if (!response.ok) throw new Error('Failed to fetch categories')
      const data = await response.json()
      setCategories(data)
    } catch (err) {
      console.error('Error fetching categories:', err)
      setError('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const fetchSubcategories = async () => {
    try {
      const response = await fetch('/api/admin/subcategories?includeInactive=true')
      if (!response.ok) throw new Error('Failed to fetch subcategories')
      const data = await response.json()
      setSubcategories(data)
    } catch (err) {
      console.error('Error fetching subcategories:', err)
    }
  }

  const openCategoryDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setCategoryForm({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        icon: category.icon || '',
        isActive: category.isActive,
        displayOrder: category.displayOrder,
      })
    } else {
      setEditingCategory(null)
      setCategoryForm({
        name: '',
        slug: '',
        description: '',
        icon: '',
        isActive: true,
        displayOrder: 0,
      })
    }
    setCategoryDialogOpen(true)
  }

  const saveCategory = async () => {
    try {
      setSavingCategory(true)
      setError(null)

      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories'

      const response = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save category')
      }

      toast({
        title: 'Success',
        description: editingCategory ? 'Category updated successfully' : 'Category created successfully',
      })

      setCategoryDialogOpen(false)
      fetchCategories()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save category'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setSavingCategory(false)
    }
  }

  const deleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete category')
      }

      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      })

      fetchCategories()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete category'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  const openSubcategoryDialog = (subcategory?: Subcategory) => {
    if (subcategory) {
      setEditingSubcategory(subcategory)
      setSubcategoryForm({
        name: subcategory.name,
        slug: subcategory.slug,
        categoryId: subcategory.categoryId,
        description: subcategory.description || '',
        isActive: subcategory.isActive,
        displayOrder: subcategory.displayOrder,
      })
    } else {
      setEditingSubcategory(null)
      setSubcategoryForm({
        name: '',
        slug: '',
        categoryId: '',
        description: '',
        isActive: true,
        displayOrder: 0,
      })
    }
    setSubcategoryDialogOpen(true)
  }

  const saveSubcategory = async () => {
    try {
      setSavingSubcategory(true)
      setError(null)

      const url = editingSubcategory
        ? `/api/admin/subcategories/${editingSubcategory.id}`
        : '/api/admin/subcategories'

      const response = await fetch(url, {
        method: editingSubcategory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subcategoryForm),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save subcategory')
      }

      toast({
        title: 'Success',
        description: editingSubcategory ? 'Subcategory updated successfully' : 'Subcategory created successfully',
      })

      setSubcategoryDialogOpen(false)
      fetchSubcategories()
      fetchCategories()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save subcategory'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setSavingSubcategory(false)
    }
  }

  const deleteSubcategory = async (subcategoryId: string) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) return

    try {
      const response = await fetch(`/api/admin/subcategories/${subcategoryId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete subcategory')
      }

      toast({
        title: 'Success',
        description: 'Subcategory deleted successfully',
      })

      fetchSubcategories()
      fetchCategories()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete subcategory'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  const toggleCategoryExpanded = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const filteredCategories = categories.filter(cat =>
    (cat.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cat.slug ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredSubcategories = subcategories.filter(sub =>
    (sub.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (sub.slug ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FolderTree className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Service Categories
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Manage service categories and subcategories for your services
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="subcategories">Subcategories</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Categories</CardTitle>
                  <CardDescription>
                    Main service categories (e.g., Residential, Commercial, Industrial)
                  </CardDescription>
                </div>
                <Button
                  onClick={() => openCategoryDialog()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {category.name}
                        </h3>
                        <Badge variant={category.isActive ? 'default' : 'secondary'}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Slug: {category.slug} • {category._count?.services || 0} services
                      </p>
                      {category.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openCategoryDialog(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteCategory(category.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}

                {filteredCategories.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No categories found. Create your first category to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subcategories" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Subcategories</CardTitle>
                  <CardDescription>
                    Service subcategories within main categories
                  </CardDescription>
                </div>
                <Button
                  onClick={() => openSubcategoryDialog()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subcategory
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search subcategories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {filteredSubcategories.map((subcategory) => (
                  <div
                    key={subcategory.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {subcategory.name}
                        </h3>
                        <Badge variant={subcategory.isActive ? 'default' : 'secondary'}>
                          {subcategory.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Slug: {subcategory.slug} • {subcategory.category?.name} • {subcategory._count?.services || 0} services
                      </p>
                      {subcategory.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {subcategory.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openSubcategoryDialog(subcategory)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteSubcategory(subcategory.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}

                {filteredSubcategories.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No subcategories found. Add your first subcategory to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? 'Update the category details below'
                : 'Fill in the details to create a new category'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Name *</Label>
              <Input
                id="category-name"
                value={categoryForm.name}
                onChange={(e) => {
                  const name = e.target.value
                  setCategoryForm(prev => ({
                    ...prev,
                    name,
                    slug: editingCategory ? prev.slug : generateSlug(name),
                  }))
                }}
                placeholder="e.g., Residential Cleaning"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-slug">Slug *</Label>
              <Input
                id="category-slug"
                value={categoryForm.slug}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="e.g., residential-cleaning"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-description">Description</Label>
              <Textarea
                id="category-description"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this category"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-icon">Icon (optional)</Label>
              <Input
                id="category-icon"
                value={categoryForm.icon}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, icon: e.target.value }))}
                placeholder="e.g., home, building, factory"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="category-active"
                checked={categoryForm.isActive}
                onCheckedChange={(checked) => setCategoryForm(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="category-active">Active</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-order">Display Order</Label>
              <Input
                id="category-order"
                type="number"
                min="0"
                value={categoryForm.displayOrder}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={saveCategory}
              disabled={savingCategory || !categoryForm.name || !categoryForm.slug}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {savingCategory ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subcategory Dialog */}
      <Dialog open={subcategoryDialogOpen} onOpenChange={setSubcategoryDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}
            </DialogTitle>
            <DialogDescription>
              {editingSubcategory
                ? 'Update the subcategory details below'
                : 'Fill in the details to create a new subcategory'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subcategory-category">Category *</Label>
              <select
                id="subcategory-category"
                value={subcategoryForm.categoryId}
                onChange={(e) => setSubcategoryForm(prev => ({ ...prev, categoryId: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md bg-background"
                disabled={!!editingSubcategory}
              >
                <option value="">Select a category</option>
                {categories.filter(cat => cat.isActive).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subcategory-name">Name *</Label>
              <Input
                id="subcategory-name"
                value={subcategoryForm.name}
                onChange={(e) => {
                  const name = e.target.value
                  setSubcategoryForm(prev => ({
                    ...prev,
                    name,
                    slug: editingSubcategory ? prev.slug : generateSlug(name),
                  }))
                }}
                placeholder="e.g., Deep Cleaning"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subcategory-slug">Slug *</Label>
              <Input
                id="subcategory-slug"
                value={subcategoryForm.slug}
                onChange={(e) => setSubcategoryForm(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="e.g., deep-cleaning"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subcategory-description">Description</Label>
              <Textarea
                id="subcategory-description"
                value={subcategoryForm.description}
                onChange={(e) => setSubcategoryForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this subcategory"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="subcategory-active"
                checked={subcategoryForm.isActive}
                onCheckedChange={(checked) => setSubcategoryForm(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="subcategory-active">Active</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subcategory-order">Display Order</Label>
              <Input
                id="subcategory-order"
                type="number"
                min="0"
                value={subcategoryForm.displayOrder}
                onChange={(e) => setSubcategoryForm(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubcategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={saveSubcategory}
              disabled={savingSubcategory || !subcategoryForm.name || !subcategoryForm.slug || !subcategoryForm.categoryId}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {savingSubcategory ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
