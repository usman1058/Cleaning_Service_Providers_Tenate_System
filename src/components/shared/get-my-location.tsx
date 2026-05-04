'use client'

import { MapPin, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

interface GetMyLocationProps {
  onLocation: (address: string) => void
  buttonClassName?: string
  disabled?: boolean
}

export function GetMyLocation({ onLocation, buttonClassName = '', disabled = false }: GetMyLocationProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [permissionState, setPermissionState] = useState<'not-granted' | 'denied' | 'granted' | 'unknown'>('unknown')

  // Check current permission state on mount
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          setPermissionState('granted')
        } else if (result.state === 'denied') {
          setPermissionState('denied')
        } else if (result.state === 'prompt') {
          setPermissionState('not-granted')
        } else {
          setPermissionState('unknown')
        }
      }).catch(() => {
        setPermissionState('unknown')
      })
    }
  }, [])

  const handleGetLocation = () => {
    if (permissionState === 'denied') {
      setError('Location permission was denied. Please enable location access in your browser settings.')
      return
    }

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setLoading(true)
    setError('')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords

          // Use OpenStreetMap's Nominatim API for reverse geocoding (free, no API key needed)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          )

          if (response.ok) {
            const data = await response.json()
            if (data && data.address) {
              const { road, city, county, postcode, country } = data.address

              // Build formatted address
              const addressParts: string[] = []
              if (road) addressParts.push(road)
              if (city) addressParts.push(city)
              if (county) addressParts.push(county)
              if (postcode) addressParts.push(postcode)
              if (country) addressParts.push(country)

              const fullAddress = addressParts.filter(Boolean).join(', ')
              onLocation(fullAddress)
              setError('')
            } else {
              setError('Could not determine address from location')
            }
          } else {
            setError('Failed to get address from coordinates')
          }
        } catch (err) {
          console.error('Geocoding error:', err)
          setError('Failed to get address from location. Please enter it manually.')
        } finally {
          setLoading(false)
        }
      },
      (geoError) => {
        setLoading(false)
        
        // Only show error if it's not just waiting for permission
        if (geoError.code !== geoError.PERMISSION_DENIED) {
          switch (geoError.code) {
            case geoError.POSITION_UNAVAILABLE:
              setError('Location information unavailable.')
              break
            case geoError.TIMEOUT:
              setError('Location request timed out.')
              break
            default:
              setError('Unable to get your location. Please try again.')
          }
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleGetLocation}
        disabled={disabled || loading || permissionState === 'denied'}
        className={buttonClassName}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Getting Location...
          </>
        ) : (
          <>
            <MapPin className="h-4 w-4 mr-2" />
            Get My Location
          </>
        )}
      </Button>
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 mt-1">
          {error}
        </div>
      )}
    </div>
  )
}
