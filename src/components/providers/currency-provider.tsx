'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface CurrencyContextType {
  currency: string
  rate: number
  symbol: string
  setCurrency: (currency: string) => void
  convert: (amount: number) => string
  isLoading: boolean
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  PKR: 'Rs',
  INR: '₹',
  EUR: '€',
  GBP: '£',
  AED: 'DH',
  SAR: 'SR',
}

const DEFAULT_CURRENCY = 'USD'

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY)
  const [rate, setRate] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initCurrency = async () => {
      try {
        // 1. Try to get from localStorage
        const savedCurrency = localStorage.getItem('user-currency')
        if (savedCurrency) {
          setCurrency(savedCurrency)
          await fetchRate(savedCurrency)
          setIsLoading(false)
          return
        }

        // 2. Detect by IP Geolocation
        const geoRes = await fetch('https://ipapi.co/json/')
        const geoData = await geoRes.json()
        
        let detectedCurrency = DEFAULT_CURRENCY
        if (geoData.country === 'PK') detectedCurrency = 'PKR'
        else if (geoData.country === 'IN') detectedCurrency = 'INR'
        else if (geoData.country_code === 'EU') detectedCurrency = 'EUR'
        else if (geoData.country === 'AE') detectedCurrency = 'AED'
        else if (geoData.country === 'SA') detectedCurrency = 'SAR'
        else if (geoData.currency) detectedCurrency = geoData.currency

        setCurrency(detectedCurrency)
        localStorage.setItem('user-currency', detectedCurrency)
        await fetchRate(detectedCurrency)
      } catch (error) {
        console.error('Currency detection failed:', error)
        await fetchRate(DEFAULT_CURRENCY)
      } finally {
        setIsLoading(false)
      }
    }

    initCurrency()
  }, [])

  const fetchRate = async (targetCurrency: string) => {
    if (targetCurrency === 'USD') {
      setRate(1)
      return
    }

    try {
      // Using Frankfurter API (Free, no key required)
      const res = await fetch(`https://api.frankfurter.app/latest?from=USD&to=${targetCurrency}`)
      const data = await res.json()
      if (data.rates && data.rates[targetCurrency]) {
        setRate(data.rates[targetCurrency])
      }
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error)
      // Fallback rates if API fails
      const fallbacks: Record<string, number> = {
        PKR: 278.5,
        INR: 83.3,
        EUR: 0.92,
        AED: 3.67,
      }
      setRate(fallbacks[targetCurrency] || 1)
    }
  }

  const handleSetCurrency = async (newCurrency: string) => {
    setCurrency(newCurrency)
    localStorage.setItem('user-currency', newCurrency)
    setIsLoading(true)
    await fetchRate(newCurrency)
    setIsLoading(false)
  }

  const convert = (amount: number) => {
    const converted = amount * rate
    const symbol = CURRENCY_SYMBOLS[currency] || currency
    
    if (currency === 'PKR' || currency === 'INR') {
      return `${symbol} ${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    }
    
    return `${symbol}${converted.toLocaleString(undefined, { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    })}`
  }

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      rate, 
      symbol: CURRENCY_SYMBOLS[currency] || currency,
      setCurrency: handleSetCurrency, 
      convert,
      isLoading 
    }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
