import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export default async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const isAuth = !!token

  const pathname = req.nextUrl.pathname

  const isAuthPage = pathname.startsWith('/auth')

  const isPublicPath = pathname === '/' ||
                       pathname.startsWith('/services') ||
                       pathname.startsWith('/about') ||
                       pathname.startsWith('/book-service') ||
                       pathname.startsWith('/receipt-upload') ||
                       pathname.startsWith('/custom-service') ||
                       pathname.startsWith('/contact') ||
                       pathname.startsWith('/booking-confirmation') ||
                       pathname.startsWith('/vendor/register') ||
                       pathname.startsWith('/api/auth') ||
                       pathname.startsWith('/api/contact') ||
                       pathname.startsWith('/api/services') ||
                       pathname.startsWith('/api/service-requests') ||
                       pathname.startsWith('/api/receipts') ||
                       pathname.startsWith('/api/booking-confirmation') ||
                       pathname.startsWith('/api/contract-templates') ||
                       pathname.startsWith('/uploads')

  if (isPublicPath || isAuthPage) {
    if (isAuth && isAuthPage) {
      const url = new URL('/client/dashboard', req.url)
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  if (!isAuth) {
    const url = new URL('/auth/login', req.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  // Role-based route protection
  const userRole = token.role as string

  const isAdminPath = pathname.startsWith('/admin')
  const isClientPath = pathname.startsWith('/client')
  const isVendorPath = pathname.startsWith('/vendor') && pathname !== '/vendor/register'

  if (isAdminPath && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/client/dashboard', req.url))
  }

  if (isClientPath && userRole !== 'CLIENT' && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/client/dashboard', req.url))
  }

  if (isVendorPath && userRole !== 'VENDOR' && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/client/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
