'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, Sparkles, Shield, Clock, Users, Star, MapPin, ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/shared/navbar'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <Navbar />

      <section className="bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white">
              Professional Cleaning Services for Your Home & Business
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Connect with verified cleaning professionals through our managed platform
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/services">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 py-6">
                  View Services
                </Button>
              </Link>
              <Link href="/book-service">
                <Button size="lg" variant="outline" className="border-emerald-600 text-emerald-600 text-lg px-8 py-6">
                  Book a Cleaning
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="py-6">
                <Shield className="h-12 w-12 text-emerald-600 mb-4 mx-auto" />
                <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white mb-2">
                  Verified Professionals
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                  All our cleaning partners are thoroughly vetted and insured
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6">
                <Star className="h-12 w-12 text-emerald-600 mb-4 mx-auto" />
                <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white mb-2">
                  Quality Assured
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                  Our admin team ensures every service meets quality standards
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6">
                <Clock className="h-12 w-12 text-emerald-600 mb-4 mx-auto" />
                <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white mb-2">
                  Flexible Scheduling
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                  Book services at your convenience
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6">
                <CheckCircle2 className="h-12 w-12 text-emerald-600 mb-4 mx-auto" />
                <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white mb-2">
                  Easy Process
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                  Simple booking with real-time tracking
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-emerald-600">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h3 className="text-4xl font-bold text-white">
              Ready for a Cleaner Space?
            </h3>
            <p className="text-xl text-emerald-100">
              Book your cleaning service today and experience the difference
            </p>
            <Link href="/services">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-emerald-600 text-lg px-12 py-6">
                Get Started
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">Global Green Services</h4>
              <p className="text-gray-400">
                Your trusted partner for professional cleaning services
              </p>
            </div>

            <div>
              <h5 className="font-semibold mb-4">Quick Links</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/services" className="hover:text-white">Services</Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white">About Us</Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">Contact</Link>
                </li>
                <li>
                  <Link href="/auth/login" className="hover:text-white">Login</Link>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold mb-4">Services</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/services" className="hover:text-white">Residential Cleaning</Link>
                </li>
                <li>
                  <Link href="/services" className="hover:text-white">Commercial Cleaning</Link>
                </li>
                <li>
                  <Link href="/services" className="hover:text-white">Deep Cleaning</Link>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold mb-4">Partner</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/vendor/register" className="hover:text-white">Become a Vendor</Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white">Vendor Guidelines</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500">
              {new Date().getFullYear()} Global Green Services. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm text-gray-400">
              <Link href="/services" className="hover:text-white">Services</Link>
              <span>•</span>
              <Link href="/about" className="hover:text-white">About</Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-white">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
