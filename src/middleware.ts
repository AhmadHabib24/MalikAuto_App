import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value; // Match cookie name
  const role = request.cookies.get('userRole')?.value;
  const { pathname } = request.nextUrl;

  if (!token && (pathname.startsWith('/admin') || pathname.startsWith('/manager') || pathname.startsWith('/sales'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token) {
    if (pathname === '/') {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }

    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }

    if (pathname.startsWith('/manager') && role !== 'manager') {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }

    if (pathname.startsWith('/sales') && role !== 'sales') {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/manager/:path*', '/sales/:path*', '/login'],
};
