import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';

// Usuario de prueba (en memoria)
const users = [
  {
    id: '1',
    email: 'mauricio@aiduxcare.ai',
    name: 'Mauricio Sobarzo',
    password: 'test1234', // En producción usar hash
  },
];

// Determinar si estamos en producción
const isProduction = process.env.NODE_ENV === 'production';

// Tipos personalizados para la sesión
interface CustomUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

// Configuración de NextAuth
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credenciales',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = users.find(user => 
          user.email === credentials.email && 
          user.password === credentials.password
        );

        if (user) {
          // No enviar el password al cliente
          const { password: _password, ...userWithoutPassword } = user;
          return userWithoutPassword;
        }

        return null;
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        (session.user as CustomUser).id = token.sub!;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 horas en segundos
  },
  // Configuración mejorada de cookies
  cookies: {
    sessionToken: {
      name: isProduction ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'strict',
        secure: isProduction,
        path: '/',
        // Max-Age alineado con la sesión
        maxAge: 8 * 60 * 60, // 8 horas en segundos
      },
    },
    callbackUrl: {
      name: isProduction ? '__Secure-next-auth.callback-url' : 'next-auth.callback-url',
      options: {
        httpOnly: true,
        sameSite: 'strict',
        secure: isProduction,
        path: '/',
      },
    },
    csrfToken: {
      name: isProduction ? '__Secure-next-auth.csrf-token' : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'strict',
        secure: isProduction,
        path: '/',
      },
    },
  },
  // Habilitar debug solo en desarrollo
  debug: process.env.NODE_ENV === 'development',
  // Mejorar la seguridad del token JWT
  jwt: {
    maxAge: 8 * 60 * 60, // 8 horas en segundos (igual que la sesión)
  },
  // Prevenir accesos no autorizados
  secret: process.env.NEXTAUTH_SECRET || 'your-development-secret-do-not-use-in-production',
  // Páginas personalizadas
  pages: {
    signIn: '/auth/login',
  },
};

export default NextAuth(authOptions); 