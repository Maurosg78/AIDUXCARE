import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Rutas que requieren autenticación
const protectedRoutes = ['/dashboard', '/admin'];
// Rutas que requieren roles específicos
const roleRoutes = {
  '/admin': ['admin'],
  '/dashboard': ['fisioterapeuta', 'admin']
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bypass para archivos estáticos y API routes que no son de auth
  if (
    pathname.includes('_next') || 
    pathname.includes('static') ||
    pathname.includes('favicon') ||
    (pathname.includes('/api') && !pathname.includes('/api/auth'))
  ) {
    return NextResponse.next();
  }

  // Manejo especial para /api/auth/session
  if (pathname === '/api/auth/session') {
    const response = NextResponse.next();
    response.headers.set('Content-Type', 'application/json; charset=utf-8');
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  }

  // Obtener token y verificar autenticación
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Verificar si la ruta requiere autenticación
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // Verificar roles para rutas específicas
  if (token?.role) {
    for (const [route, roles] of Object.entries(roleRoutes)) {
      if (pathname.startsWith(route) && !roles.includes(token.role as string)) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  // Redirigir /login si ya está autenticado
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api routes that are not auth related
     * 2. /_next (Next.js internals)
     * 3. /static (static files)
     * 4. /favicon.ico, /robots.txt (static files)
     */
    '/((?!api/(?!auth)|_next/|static/|favicon|robots).*)',
  ],
}; 