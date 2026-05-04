'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { TiltCard, FloatingElement, PulsingOrb, RevealOnScroll, GlowingCard, AnimatedBorder } from '@/components/design-system/3d-animations'
import { useParallax } from '@/components/design-system/hooks'
import { 
  Sparkles, Shield, Star, Clock, CheckCircle2, ArrowRight, 
  Award, Users, Wrench, Leaf, DollarSign, Zap,
  ChevronDown, Play, Pause
} from 'lucide-react'

const features = [
  { icon: Shield, title: 'Verified Pros', desc: 'All partners vetted & insured', color: 'from-blue-500 to-cyan-500' },
  { icon: Star, title: 'Quality Assured', desc: 'Admin team ensures standards', color: 'from-yellow-500 to-orange-500' },
  { icon: Clock, title: 'Flexible Booking', desc: 'Schedule at your convenience', color: 'from-purple-500 to-pink-500' },
  { icon: CheckCircle2, title: 'Easy Process', desc: 'Simple booking & tracking', color: 'from-green-500 to-emerald-500' },
]

const stats = [
  { value: '10K+', label: 'Services Completed', icon: Wrench },
  { value: '500+', label: 'Verified Vendors', icon: Users },
  { value: '4.9', label: 'Average Rating', icon: Star },
  { value: '24/7', label: 'Customer Support', icon: Clock },
]

const whyChooseUs = [
  {
    title: 'Verified Professionals',
    desc: 'All our cleaning experts are thoroughly vetted, background-checked, and insured for your peace of mind.',
    icon: Shield,
  },
  {
    title: 'Quality Guaranteed',
    desc: 'Our admin team ensures every service meets our rigorous quality standards before completion.',
    icon: Award,
  },
  {
    title: 'Eco-Friendly',
    desc: 'We use environmentally safe products and sustainable cleaning methods.',
    icon: Leaf,
  },
  {
    title: 'Transparent Pricing',
    desc: 'No hidden fees. What you see is what you pay - upfront pricing always.',
    icon: DollarSign,
  },
  {
    title: 'Real-Time Tracking',
    desc: 'Track your service status from booking to completion through your dashboard.',
    icon: Clock,
  },
  {
    title: 'Instant Updates',
    desc: 'Get notified immediately when your service status changes.',
    icon: Zap,
  },
]

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 500], [0, 200])
  const y2 = useTransform(scrollY, [0, 500], [0, -150])
  
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e
    const { innerWidth, innerHeight } = window
    mouseX.set((clientX / innerWidth - 0.5) * 20)
    mouseY.set((clientY / innerHeight - 0.5) * 20)
  }

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[100vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950"
      onMouseMove={handleMouseMove}
    >
      {/* Animated Background */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ x: mouseX, y: mouseY }}
      >
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        {/* Floating Orbs */}
        <FloatingElement
          className="absolute top-20 left-[10%]"
          floatSpeed={8}
          floatRange={40}
        >
          <PulsingOrb color="primary" size={400} blur={150} />
        </FloatingElement>
        
        <FloatingElement
          className="absolute bottom-20 right-[10%]"
          floatSpeed={10}
          floatRange={30}
        >
          <PulsingOrb color="secondary" size={300} blur={100} />
        </FloatingElement>
        
        <FloatingElement
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          floatSpeed={12}
          floatRange={50}
          rotateRange={15}
        >
          <PulsingOrb color="accent" size={500} blur={200} />
        </FloatingElement>

        {/* Geometric Shapes */}
        <motion.div
          className="absolute top-32 right-[20%] w-20 h-20 border border-primary/20 rounded-2xl rotate-45"
          animate={{ rotate: [45, 405], scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute bottom-32 left-[15%] w-16 h-16 border border-emerald-500/20 rounded-full"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/4 left-1/3 w-12 h-12 bg-gradient-to-br from-primary/10 to-emerald-500/10 rounded-lg rotate-12"
          animate={{ rotate: [12, 372], y: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 backdrop-blur-xl rounded-full border border-white/10">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-white/80 text-sm font-medium">Professional Cleaning Services</span>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Professional Cleaning for Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-cyan-400">
              Home & Business
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            className="text-xl md:text-2xl text-white/70 mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Connect with verified cleaning professionals through our managed platform.
            Book in minutes, track in real-time.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-wrap gap-4 justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.div
              whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(16,185,129,0.4)' }}
              whileTap={{ scale: 0.98 }}
            >
              <Link href="/services">
                <Button size="lg" className="text-lg px-10 py-7 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 gap-3">
                  Explore Services <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link href="/book-service">
                <Button size="lg" variant="outline" className="text-lg px-10 py-7 border-2 border-white/20 text-white hover:bg-white/10 gap-3">
                  Book Now <Play className="h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-8 h-14 border-2 border-white/20 rounded-full flex justify-center pt-3">
            <motion.div 
              className="w-1.5 h-3 bg-white/50 rounded-full"
              animate={{ opacity: [0.3, 1, 0.3], y: [0, 4, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export function StatsSection() {
  return (
    <section className="relative py-24 bg-gradient-to-r from-primary to-emerald-600 overflow-hidden">
      <motion.div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className="text-center"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur mb-4"
              >
                <stat.icon className="h-8 w-8 text-white" />
              </motion.div>
              <p className="text-4xl md:text-5xl font-bold text-white">{stat.value}</p>
              <p className="text-white/80 text-sm mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export function FeaturesSection() {
  return (
    <section className="relative py-32 bg-slate-950 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <PulsingOrb className="absolute top-20 left-1/4" size={400} blur={150} />
        <PulsingOrb className="absolute bottom-20 right-1/4" size={300} blur={100} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <RevealOnScroll className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Why Choose Us
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            We make professional cleaning services simple, reliable, and affordable.
          </p>
        </RevealOnScroll>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <TiltCard key={index} tiltIntensity={20}>
              <AnimatedBorder>
                <motion.div
                  whileHover={{ y: -10 }}
                  className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-xl border border-white/10 h-full"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} mb-6`}
                  >
                    <feature.icon className="h-8 w-8 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/60">{feature.desc}</p>
                </motion.div>
              </AnimatedBorder>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  )
}

export function WhyChooseUsSection() {
  return (
    <section className="relative py-32 bg-slate-950 overflow-hidden">
      <div className="container mx-auto px-4">
        <RevealOnScroll className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Why Choose Global Green?
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Experience the difference with our professional cleaning services.
          </p>
        </RevealOnScroll>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {whyChooseUs.map((item, index) => (
            <RevealOnScroll key={index} threshold={0.2}>
              <GlowingCard glowColor="#10b981">
                <div className="bg-slate-900 p-8 rounded-xl relative overflow-hidden">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/20 mb-6"
                  >
                    <item.icon className="h-7 w-7 text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-white/60 leading-relaxed">{item.desc}</p>
                </div>
              </GlowingCard>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}

export function CTASection() {
  return (
    <section className="relative py-32 bg-gradient-to-br from-primary via-primary to-emerald-600 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], x: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        
        {/* Animated Grid */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V40h.1M20 .1v20.4M.1 20H40m-20 0v20m0-20h20' stroke='%23fff' fill='none' stroke-width='0.5'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready for a Cleaner Space?
          </h2>
          <p className="text-white/80 text-lg mb-10">
            Book your cleaning service today and experience the difference.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link href="/services">
              <Button size="lg" variant="secondary" className="text-lg px-12 py-7 gap-3">
                Get Started <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}