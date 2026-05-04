'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Sparkles, Clock, MapPin, SlidersHorizontal, X, ChevronDown, Star, Tag, Loader2, ChevronUp } from 'lucide-react'
import { Navbar } from '@/components/shared/navbar'

interface Service {
  id: string
  name: string
  slug: string
  description: string
  startingPrice: number
  duration?: string
  coverage?: string
  locations?: string
  discountType?: string
  discountValue?: number
  featured?: boolean
}

const CITIES = ['All', 'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia']
const DURATION_OPTIONS = ['All', '1-2 hours', '2-3 hours', '3-4 hours', '4+ hours']
const SORT_OPTIONS = [
  { value: 'default', label: 'Recommended' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A-Z' },
]

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('All')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [selectedDuration, setSelectedDuration] = useState('All')
  const [sortBy, setSortBy] = useState('default')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setError('')
      const response = await fetch('/api/services')
      if (!response.ok) throw new Error('Failed to load services')
      const data = await response.json()
      setServices(data)
    } catch (err) {
      setError('Unable to load services. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getFinalPrice = (price: number, discountType?: string, discountValue?: number) => {
    if (!discountType || discountType === 'NONE' || !discountValue) return price
    if (discountType === 'PERCENTAGE') return price * (1 - discountValue / 100)
    if (discountType === 'FIXED_AMOUNT') return price - discountValue
    return price
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCity('All')
    setMinPrice('')
    setMaxPrice('')
    setSelectedDuration('All')
    setSortBy('default')
  }

  const filteredServices = services.filter(s =>
    (!searchQuery || (s.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) || (s.description ?? '').toLowerCase().includes(searchQuery.toLowerCase())) &&
    (selectedCity === 'All' || (s.locations ?? '').toLowerCase().includes(selectedCity.toLowerCase())) &&
    (!minPrice || s.startingPrice >= Number(minPrice)) &&
    (!maxPrice || s.startingPrice <= Number(maxPrice)) &&
    (selectedDuration === 'All' || (s.duration ?? '').toLowerCase().includes(selectedDuration.toLowerCase()))
  ).sort((a, b) => {
    if (sortBy === 'price-asc') return getFinalPrice(a.startingPrice, a.discountType, a.discountValue) - getFinalPrice(b.startingPrice, b.discountType, b.discountValue)
    if (sortBy === 'price-desc') return getFinalPrice(b.startingPrice, b.discountType, b.discountValue) - getFinalPrice(a.startingPrice, a.discountType, a.discountValue)
    if (sortBy === 'name-asc') return (a.name ?? '').localeCompare(b.name ?? '')
    return 0
  })

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="relative py-16 lg:py-24 bg-gradient-to-br from-primary/5 via-background to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
              Professional <span className="text-primary">Cleaning Services</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Premium cleaning solutions tailored to your needs. Book online in minutes.
            </p>
            
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg bg-card border-2 shadow-lg"
              />
            </div>
            
            <div className="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /><span>{services.length}+ Services</span></div>
              <div className="flex items-center gap-2"><Star className="h-4 w-4 text-primary" /><span>4.9 Rating</span></div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /><span>All Locations</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Bar */}
      <section className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">{filteredServices.length}</span> services</p>
            <div className="flex items-center gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[170px] bg-card"><SelectValue placeholder="Sort by" /></SelectTrigger>
                <SelectContent>{SORT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-2">
                <SlidersHorizontal className="h-4 w-4" /> Filters {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {showFilters && (
            <div className="mt-4 p-5 bg-card border rounded-xl shadow-lg animate-slide-down">
              <div className="grid md:grid-cols-4 gap-5">
                <div className="space-y-2"><Label className="text-sm font-medium">Location</Label>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger><SelectValue placeholder="Any location" /></SelectTrigger>
                    <SelectContent>{CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label className="text-sm font-medium">Min Price ($)</Label>
                  <Input type="number" placeholder="0" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="bg-background" />
                </div>
                <div className="space-y-2"><Label className="text-sm font-medium">Max Price ($)</Label>
                  <Input type="number" placeholder="999" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="bg-background" />
                </div>
                <div className="flex items-end"><Button variant="outline" onClick={clearFilters} className="w-full gap-2"><X className="h-4 w-4" /> Clear</Button></div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="container mx-auto px-4 py-8">
          <Card className="border-destructive/50"><CardContent className="pt-6 text-center"><p className="text-destructive mb-4">{error}</p><Button onClick={fetchServices}>Try Again</Button></CardContent></Card>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <Card key={i} className="animate-pulse"><CardHeader><div className="h-6 bg-muted rounded w-3/4" /><div className="h-4 bg-muted rounded w-1/2 mt-2" /></CardHeader><CardContent><div className="h-20 bg-muted rounded" /><div className="h-10 bg-muted rounded mt-4" /></CardContent></Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading && filteredServices.length === 0 && (
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto"><CardContent className="pt-12 pb-12 text-center"><Search className="h-14 w-14 text-muted-foreground mx-auto mb-4" /><h3 className="text-xl font-semibold mb-2">No Services Found</h3><p className="text-muted-foreground mb-6">Try adjusting your filters.</p><Button onClick={clearFilters}><X className="h-4 w-4 mr-2" />Clear Filters</Button></CardContent></Card>
        </div>
      )}

      {/* Services Grid */}
      {!loading && filteredServices.length > 0 && (
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map(s => {
              const finalPrice = getFinalPrice(s.startingPrice || 0, s.discountType, s.discountValue)
              const hasDiscount = s.discountType && s.discountType !== 'NONE' && (s.discountValue || 0) > 0
              const savings = (s.startingPrice || 0) - finalPrice
              
              return (
                <Card key={s.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
                  {s.featured && <div className="h-1 bg-gradient-to-r from-primary to-emerald-400 rounded-t-xl" />}
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg font-bold leading-tight">{s.name}</CardTitle>
                      {s.featured && <Badge className="shrink-0 bg-primary">Featured</Badge>}
                    </div>
                    <CardDescription className="line-clamp-2">{s.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {s.locations && <div className="flex items-center gap-1"><MapPin className="h-4 w-4" /><span className="truncate">{s.locations}</span></div>}
                    </div>
                    {s.duration && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="h-4 w-4" /><span>{s.duration}</span></div>}
                    <div className="pt-2 border-t">
                      {hasDiscount ? (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground line-through">${(s.startingPrice || 0).toFixed(2)}</p>
                          <p className="text-3xl font-bold text-primary">${finalPrice.toFixed(2)}<span className="text-sm font-normal text-muted-foreground ml-1">/visit</span></p>
                          <Badge variant="destructive" className="text-xs">Save ${savings.toFixed(2)}</Badge>
                        </div>
                      ) : (
                        <p className="text-3xl font-bold text-primary">${(s.startingPrice || 0).toFixed(2)}<span className="text-sm font-normal text-muted-foreground ml-1">/visit</span></p>
                      )}
                    </div>
                  </CardContent>
                  <div className="p-4 pt-0 space-y-2">
                    <Link href={`/services/${s.slug}`} className="block"><Button variant="outline" className="w-full">View Details</Button></Link>
                    <Link href={`/book-service?service=${s.slug}`} className="block"><Button className="w-full bg-primary hover:bg-primary/90">Book Now</Button></Link>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* CTA */}
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">Need a Custom Solution?</h2>
          <p className="text-primary/80 mb-8 max-w-xl mx-auto">Our team is ready to create a tailored cleaning solution for you.</p>
          <Link href="/custom-service"><Button size="lg" variant="secondary">Request Custom Service</Button></Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} Global Green Services. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}