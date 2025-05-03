import NextAuth, { NextAuthOptions, DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { validateCredentials } from '@/modules/auth/authService';
import { UserRole } from '@/modules/auth/authService';
import { NextApiRequest, NextApiResponse } from 'next';

declare module 'next-auth' {
  interface User {
    role?: UserRole;
  }
  
  interface Session {
    user: {
      role?: UserRole;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: UserRole;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Se requieren credenciales');
        }

        const user = await validateCredentials(
          credentials.email,
          credentials.password
        );

        if (!user) {
          throw new Error('Credenciales inválidas');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
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
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
    signOut: '/',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 horas
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

// Crear instancia del handler
const handler = NextAuth(authOptions);

// Middleware simplificado
export default async function wrappedHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Asegurar headers de respuesta JSON
  res.setHeader('Content-Type', 'application/json');

  // Verificar variables de entorno críticas
  if (!process.env.NEXTAUTH_URL || !process.env.NEXTAUTH_SECRET) {
    return res.status(500).json({
      error: true,
      message: 'Configuración incompleta del servidor'
    });
  }

  // Para endpoints de sesión
  if (req.url?.includes('/session')) {
    const hasSessionToken = req.headers.cookie?.includes('next-auth.session-token') ||
                          req.headers.cookie?.includes('__Secure-next-auth.session-token');
    
    if (!hasSessionToken) {
      return res.status(200).json({ user: null });
    }
  }

  // Manejar la solicitud con NextAuth
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