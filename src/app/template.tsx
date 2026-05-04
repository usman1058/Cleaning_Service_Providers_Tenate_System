'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    setAnimated(false)
    const timer = setTimeout(() => setAnimated(true), 10)
    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <div
      className={animated ? 'animate-fade-in' : 'opacity-0'}
      style={{ animationFillMode: 'forwards' }}
    >
      {children}
    </div>
  )
}