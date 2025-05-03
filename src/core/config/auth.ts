import { NextAuthOptions } from 'next-auth';
import { UserRole } from '@/modules/auth/authService';
import { DefaultUser, Session } from 'next-auth';

interface ExtendedUser extends DefaultUser {
  role?: UserRole;
}

interface ExtendedSession extends Session {
  user: ExtendedUser;
}

export const authOptions: NextAuthOptions = {
  providers: [],
  callbacks: {
    async session({ session, token }) {
      const extendedSession = session as ExtendedSession;
      extendedSession.user.role = token.role as UserRole;
      return extendedSession;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as ExtendedUser).role;
      }
      return token;
    }
  },
  pages: {
    signIn: '/login',
  },
}; 