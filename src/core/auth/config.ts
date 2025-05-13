import type { UserRole  } from '@/core/types';

export interface AuthOptions {
  providers: Array<{
    id: string;
    name: string;
  }>;
  callbacks: {
    signIn: (params: { user: any, account: any }) => Promise<boolean>;
    session: (params: { session: any, user: any }) => Promise<any>;
    jwt: (params: { token: any, user: any }) => Promise<any>;
  };
  pages: {
    signIn: string;
    error: string;
  };
  session: {
    strategy: 'jwt';
    maxAge: number;
  };
}

export const authOptions: AuthOptions = {
  providers: [
    {
      id: 'credentials',
      name: 'Credentials'
    }
  ],
  callbacks: {
    signIn: async ({ user, account }) => {
      // Aquí iría lógica de validación de inicio de sesión
      return true;
    },
    session: async ({ session, user }) => {
      // Agregar datos del usuario a la sesión
      if (session?.user) {
        session.user.id = user.id;
        session.user.role = user.role as UserRole;
      }
      return session;
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 días
  }
}; 