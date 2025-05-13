import { UserRole } from '@/modules/auth/authService';

declare module '@auth/core/types' {
  export interface Session {
    user?: {
      id: string;
      name?: string;
      email?: string;
      image?: string;
      role?: UserRole;
    };
    expires: string;
  }
}

declare module '@auth/core' {
  export interface AuthOptions {
    adapter?: any;
    callbacks?: {
      session?: (params: {session: any; token: any}) => Promise<any>;
      jwt?: (params: {token: any; user?: any}) => Promise<any>;
      signIn?: (params: {user: any; account: any; profile?: any}) => Promise<boolean>;
      redirect?: (params: {url: string; baseUrl: string}) => Promise<string>;
    };
    cookies?: Record<string, any>;
    debug?: boolean;
    events?: Record<string, (...args: any[]) => Promise<void>>;
    jwt?: {
      secret?: string;
      maxAge?: number;
      encode?: (...args: any[]) => Promise<string>;
      decode?: (...args: any[]) => Promise<any>;
    };
    pages?: {
      signIn?: string;
      signOut?: string;
      error?: string;
      verifyRequest?: string;
      newUser?: string;
    };
    providers: any[];
    secret?: string;
    session?: {
      strategy?: 'jwt' | 'database';
      maxAge?: number;
      updateAge?: number;
    };
    theme?: {
      colorScheme?: 'auto' | 'dark' | 'light';
      logo?: string;
      brandColor?: string;
    };
    trustHost?: boolean;
    useSecureCookies?: boolean;
  }
}

// Exportar authOptions como un tipo utilizable
export interface NextAuthOptions extends AuthOptions {
  providers: any[];
}

export const authOptions: NextAuthOptions = {
  providers: [],
  // Valores predeterminados que pueden ser sobreescritos
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub!;
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
};

export type UserRole = 'admin' | 'professional' | 'patient';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  profilePicture?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
} 