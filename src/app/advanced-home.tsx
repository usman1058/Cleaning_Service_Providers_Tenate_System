'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Navbar3D } from '@/components/shared/navbar-3d'
import { HeroSection, StatsSection, FeaturesSection, WhyChooseUsSection, CTASection } from '@/components/design-system/advanced-sections'
import { Footer3D } from '@/components/shared/footer-3d'

export default function AdvancedHomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar3D />
      
      <main className="pt-0">
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <WhyChooseUsSection />
        <CTASection />
      </main>

      <Footer3D />
    </div>
  )
}