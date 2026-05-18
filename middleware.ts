import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

const PUBLIC_FILE = /\.(.*)$/;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_FILE.test(pathname) || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  const supabase = createSupabaseServer();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isAuthPath = pathname === '/login';
  const isProtectedPath = pathname.startsWith('/dashboard') || pathname.startsWith('/trades');

  if (!session && isProtectedPath) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (session && isAuthPath) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/trades/:path*', '/login'],
};
