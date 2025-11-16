import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/protected-route'];
const publicRoutes = ['/', '/pricing', '/auth/signin', '/api/auth'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow access to dashboard without authentication
  if (pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  // Check authentication
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });
  
  if (!token) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // For protected routes, check subscription status
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const response = await fetch(new URL('/api/user/subscription', request.url), {
      headers: { 
        cookie: request.headers.get('cookie') || '',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (response.ok) {
      const { hasActiveSubscription } = await response.json();
      
      if (!hasActiveSubscription) {
        const pricingUrl = new URL('/pricing', request.url);
        pricingUrl.searchParams.set('upgrade', 'true');
        return NextResponse.redirect(pricingUrl);
      }
    } else {
      console.error('Failed to check subscription status:', response.statusText);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};
