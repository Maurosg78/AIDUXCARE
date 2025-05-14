import { withAuth } from "next-auth/middleware.js";
import { NextResponse } from "next/server.js";
import type { NextRequest } from "next/server.js";

export default withAuth(
  function middleware(req: NextRequest) {
    // Permitir acceso a rutas de autenticación
    if (req.nextUrl.pathname.startsWith('/auth/')) {
      return NextResponse.next();
    }

    // Verificar si la ruta está protegida
    const isProtectedRoute = req.nextUrl.pathname.match(/^\/(?:patients|visits|dashboard)(?:\/.*)?$/);
    
    if (isProtectedRoute) {
      return NextResponse.next();
    }

    // Para rutas no protegidas, permitir acceso
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
    pages: {
      signIn: '/auth/login',
      error: '/404'
    }
  }
);

// Configuración de rutas protegidas usando patrones glob
export const config = {
  matcher: [
    '/patients/:path*',
    '/visits/:path*',
    '/dashboard/:path*', // Proteger también subrutas de dashboard
    '/dashboard'
  ]
}; 