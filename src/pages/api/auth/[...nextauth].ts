import NextAuth, { NextAuthOptions, DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Extender los tipos de NextAuth
declare module 'next-auth' {
  interface Session {
    user: {
      role?: string;
    } & DefaultSession['user'];
  }
  interface User {
    role?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
  }
}

// Configuración de autenticación
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' }
      },
      async authorize(credentials) {
        const validEmail = 'mauro@clinicaaxonvalencia.com';
        const validPassword = 'Tester1234!';

        if (
          credentials?.email === validEmail &&
          credentials?.password === validPassword
        ) {
          return {
            id: '1',
            name: 'Mauricio',
            email: validEmail,
            role: 'fisioterapeuta'
          };
        }
        
        console.error('Intento de login fallido:', {
          providedEmail: credentials?.email,
          timestamp: new Date().toISOString()
        });
        
        return null;
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 horas
  },
  pages: {
    signIn: '/login',
    error: '/login',
    signOut: '/'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
      }
      return session;
    }
  },
  debug: process.env.NODE_ENV === 'development',
};

// Handler de NextAuth
const handler = NextAuth(authOptions);

// Middleware para manejar las respuestas
export default async function wrappedHandler(req: any, res: any) {
  // Asegurar headers de respuesta JSON
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  // Para endpoints de sesión sin token
  if (req.url?.includes('/session')) {
    const hasSessionToken = 
      req.headers.cookie?.includes('next-auth.session-token') ||
      req.headers.cookie?.includes('__Secure-next-auth.session-token');
    
    if (!hasSessionToken) {
      return res.status(200).json({
        user: null,
        expires: null
      });
    }
  }

  try {
    await handler(req, res);
  } catch (error) {
    console.error('Error en autenticación:', error);
    return res.status(500).json({
      error: true,
      message: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  }
} 