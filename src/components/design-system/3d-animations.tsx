'use client'

import { useRef, useState, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TiltCardProps {
  children: ReactNode
  className?: string
  tiltIntensity?: number
}

export function TiltCard({ children, className, tiltIntensity = 15 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [rotate, setRotate] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    const rotateX = ((y - centerY) / centerY) * tiltIntensity
    const rotateY = ((centerX - x) / centerX) * tiltIntensity
    
    setRotate({ x: rotateX, y: rotateY })
  }

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 })
  }

  return (
    <motion.div
      ref={ref}
      className={cn('relative transition-transform will-change-transform', className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX: rotate.x, rotateY: rotate.y }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
    >
      <div style={{ transform: 'translateZ(1px)' }}>{children}</div>
    </motion.div>
  )
}

interface FloatingElementProps {
  children: ReactNode
  className?: string
  floatSpeed?: number
  floatRange?: number
  rotateRange?: number
}

export function FloatingElement({
  children,
  className,
  floatSpeed = 6,
  floatRange = 20,
  rotateRange = 10,
}: FloatingElementProps) {
  return (
    <motion.div
      className={cn('', className)}
      animate={{
        y: [0, -floatRange, 0],
        rotate: [0, rotateRange, 0],
        x: [0, floatRange / 2, 0],
      }}
      transition={{
        duration: floatSpeed,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  )
}

interface PulsingOrbProps {
  className?: string
  color?: 'primary' | 'secondary' | 'accent'
  size?: number
  blur?: number
}

export function PulsingOrb({ className, color = 'primary', size = 300, blur = 100 }: PulsingOrbProps) {
  const colors = {
    primary: 'bg-emerald-500/30',
    secondary: 'bg-cyan-500/30',
    accent: 'bg-blue-500/30',
  }

  return (
    <motion.div
      className={cn('rounded-full', colors[color], className)}
      style={{ width: size, height: size, filter: `blur(${blur}px)` }}
      animate={{
        scale: [1, 1.3, 1],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}

interface RevealOnScrollProps {
  children: ReactNode
  className?: string
  threshold?: number
}

export function RevealOnScroll({ children, className, threshold = 0.1 }: RevealOnScrollProps) {
  return (
    <motion.div
      className={cn('', className)}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px', amount: threshold }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  )
}

interface AnimatedBorderProps {
  children: ReactNode
  className?: string
}

export function AnimatedBorder({ children, className }: AnimatedBorderProps) {
  return (
    <div className={cn('relative rounded-xl', className)}>
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(90deg, transparent, #10b981, transparent)`,
            backgroundSize: '200% 100%',
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>
      <div className="relative bg-slate-900 rounded-xl">{children}</div>
    </div>
  )
}

interface GlowingCardProps {
  children: ReactNode
  className?: string
  glowColor?: string
}

export function GlowingCard({ children, className, glowColor = '#10b981' }: GlowingCardProps) {
  return (
    <div className={cn('relative group', className)}>
      <div
        className="absolute -inset-0.5 rounded-xl opacity-30 blur transition-all duration-500 group-hover:opacity-70"
        style={{
          background: `linear-gradient(135deg, ${glowColor}, transparent 60%)`,
        }}
      />
      <div className="relative bg-slate-900 rounded-xl">{children}</div>
    </div>
  )
}

interface AnimatedGridProps {
  className?: string
  cellSize?: number
}

export function AnimatedGrid({ className, cellSize = 40 }: AnimatedGridProps) {
  const cells = Array.from({ length: 25 })

  return (
    <div
      className={cn('grid grid-cols-5 gap-1', className)}
      style={{ gridTemplateColumns: `repeat(5, ${cellSize}px)` }}
    >
      {cells.map((_, i) => (
        <motion.div
          key={i}
          className="bg-primary/10 rounded-sm"
          animate={{
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: 2,
            delay: i * 0.1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

interface ParallaxSectionProps {
  children: ReactNode
  className?: string
}

export function ParallaxSection({ children, className }: ParallaxSectionProps) {
  return (
    <motion.div
      className={cn('', className)}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      {children}
    </motion.div>
  )
}

interface StaggeredGridProps {
  children: ReactNode[]
  className?: string
  columns?: number
}

export function StaggeredGrid({ children, className, columns = 3 }: StaggeredGridProps) {
  const gridClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }

  return (
    <motion.div
      className={cn(`grid ${gridClass[columns as keyof typeof gridClass] || 'grid-cols-3'} gap-6`, className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.1 } },
      }}
    >
      {children.map((child, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

export const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 },
}

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}