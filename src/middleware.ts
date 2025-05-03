import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { publicRoutes } from '@/core/config/routes';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Permitir acceso a rutas públicas
  if (publicRoutes.some(route => route.path === pathname)) {
    return NextResponse.next();
  }

  // Verificar sesión
  const session = request.cookies.get('next-auth.session-token');
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 