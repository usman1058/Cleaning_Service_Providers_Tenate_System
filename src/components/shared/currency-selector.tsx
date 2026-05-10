'use client'

import React from 'react'
import { useCurrency } from '@/components/providers/currency-provider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'

const CURRENCIES = [
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'PKR', label: 'Pakistani Rupee', symbol: 'Rs' },
  { code: 'INR', label: 'Indian Rupee', symbol: '₹' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'AED', label: 'UAE Dirham', symbol: 'DH' },
  { code: 'SAR', label: 'Saudi Riyal', symbol: 'SR' },
]

export function CurrencySelector() {
  const { currency, setCurrency, symbol } = useCurrency()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span className="font-medium">{currency}</span>
          <span className="text-muted-foreground text-xs">{symbol}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {CURRENCIES.map((c) => (
          <DropdownMenuItem
            key={c.code}
            onClick={() => setCurrency(c.code)}
            className="flex items-center justify-between"
          >
            <span>{c.label}</span>
            <span className="text-muted-foreground">{c.code}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
