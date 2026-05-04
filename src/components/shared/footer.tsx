'use client'

import Link from 'next/link'
import { Sparkles, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-950 text-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-white">Global Green Services</h4>
                <p className="text-xs text-emerald-400">Professional Cleaning Excellence</p>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed mb-6">
              Your trusted partner for professional cleaning services. Quality guaranteed, satisfaction assured, and spaces that sparkle.
            </p>
            <div className="flex gap-4">
              <Link href="https://facebook.com" className="text-gray-400 hover:text-emerald-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="https://twitter.com" className="text-gray-400 hover:text-emerald-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="https://instagram.com" className="text-gray-400 hover:text-emerald-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="https://linkedin.com" className="text-gray-400 hover:text-emerald-400 transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/services" className="text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  Services
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  Login
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className="text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-bold mb-6">Our Services</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/services" className="text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Residential Cleaning
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Commercial Cleaning
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Deep Cleaning
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Post-Construction Cleaning
                </Link>
              </li>
              <li>
                <Link href="/custom-service" className="text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Custom Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-6">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-emerald-400" />
                <Link href="tel:+15551234567" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  +1 (555) 123-4567
                </Link>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-emerald-400" />
                <Link href="mailto:support@greenservices.com" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  support@greenservices.com
                </Link>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-emerald-400" />
                <span className="text-gray-400">
                  123 Main Street, New York, NY 10001
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <p className="text-gray-500">
              © {new Date().getFullYear()} Global Green Services. All rights reserved.
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Made with love for clean spaces everywhere
            </p>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-gray-500">
            <span className="hover:text-emerald-400 transition-colors cursor-pointer" title="Coming soon">Privacy Policy</span>
            <span className="text-gray-700">•</span>
            <span className="hover:text-emerald-400 transition-colors cursor-pointer" title="Coming soon">Terms of Service</span>
            <span className="text-gray-700">•</span>
            <span className="hover:text-emerald-400 transition-colors cursor-pointer" title="Coming soon">Refund Policy</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
