'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FloatingElement, PulsingOrb, RevealOnScroll } from '@/components/design-system/3d-animations'

const footerLinks = {
  quickLinks: [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
  services: [
    { label: 'Residential', href: '/services' },
    { label: 'Commercial', href: '/services' },
    { label: 'Deep Cleaning', href: '/services' },
    { label: 'Custom Service', href: '/custom-service' },
  ],
  partner: [
    { label: 'Become a Vendor', href: '/vendor/register' },
    { label: 'Vendor Login', href: '/auth/login' },
  ],
}

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
]

export function Footer3D() {
  return (
    <footer className="relative bg-slate-950 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <FloatingElement
          className="absolute top-20 left-[10%]"
          floatSpeed={8}
          floatRange={30}
        >
          <PulsingOrb size={200} blur={80} />
        </FloatingElement>
        <FloatingElement
          className="absolute bottom-20 right-[10%]"
          floatSpeed={10}
          floatRange={20}
        >
          <PulsingOrb size={150} blur={60} />
        </FloatingElement>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Column */}
          <RevealOnScroll className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <motion.div
                whileHover={{ rotate: 5, scale: 1.05 }}
                className="bg-gradient-to-br from-primary to-emerald-500 rounded-xl p-2"
              >
                <Sparkles className="h-6 w-6 text-white" />
              </motion.div>
              <h4 className="font-bold text-2xl text-white">Global Green</h4>
            </div>
            <p className="text-white/60 mb-6 max-w-md">
              Your trusted partner for professional cleaning services. 
              We connect clients with verified cleaning professionals through our managed platform.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3 mb-8">
              {socialLinks.map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -3 }}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-primary/20 text-white/60 hover:text-primary transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>

            {/* Newsletter */}
            <div>
              <p className="text-white font-medium mb-3">Stay updated</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-all"
                />
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button className="px-4 py-3 bg-primary">
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </RevealOnScroll>

          {/* Quick Links */}
          <RevealOnScroll threshold={0.2}>
            <h5 className="font-semibold text-white mb-4">Quick Links</h5>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map((link, i) => (
                <li key={i}>
                  <Link 
                    href={link.href} 
                    className="text-white/60 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </RevealOnScroll>

          {/* Services */}
          <RevealOnScroll threshold={0.2}>
            <h5 className="font-semibold text-white mb-4">Services</h5>
            <ul className="space-y-3">
              {footerLinks.services.map((link, i) => (
                <li key={i}>
                  <Link 
                    href={link.href} 
                    className="text-white/60 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </RevealOnScroll>

          {/* Contact */}
          <RevealOnScroll threshold={0.2}>
            <h5 className="font-semibold text-white mb-4">Contact</h5>
            <ul className="space-y-3 text-white/60">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" /> +1 (555) 123-4567
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" /> support@greenservices.com
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Mon-Fri: 8AM - 6PM EST
              </li>
            </ul>
          </RevealOnScroll>
        </div>

        {/* Bottom Bar */}
        <motion.div
          className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} Global Green Services. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-white/40">
            <Link href="#" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white/60 transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white/60 transition-colors">Cookies</Link>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}