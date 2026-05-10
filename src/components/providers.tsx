'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { CurrencyProvider } from './providers/currency-provider'
import { ThemeProvider } from 'next-themes'

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <CurrencyProvider>
          {children}
        </CurrencyProvider>
      </ThemeProvider>
    </NextAuthSessionProvider>
  )
}
