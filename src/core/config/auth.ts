import type { Session } from 'next-auth';
import type { NextAuthOptions } from 'next-auth';

export interface CustomUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface CustomSession extends Session {
  user: CustomUser;
}

export const authOptions: NextAuthOptions = {
  providers: [],
  callbacks: {
    async session({ session, token }): Promise<CustomSession> {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub as string,
          role: token.role as string
        }
      } as CustomSession;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as CustomUser).role;
      }
      return token;
    }
  },
  pages: {
    signIn: '/login',
  },
}; 