/**
 * Tipos relacionados con autenticación
 */

// Tipo básico para roles de usuario
export type UserRole = 'admin' | 'professional' | 'patient';

// Interfaz de usuario base
export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  profilePicture?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Interfaz para opciones de autenticación
export interface AuthOptions {
  adapter?: unknown;
  callbacks?: {
    session?: (params: {session: unknown; token: unknown}) => Promise<unknown>;
    jwt?: (params: {token: unknown; user?: unknown}) => Promise<unknown>;
    signIn?: (params: {user: unknown; account: unknown; profile?: unknown}) => Promise<boolean>;
    redirect?: (params: {url: string; baseUrl: string}) => Promise<string>;
  };
  cookies?: Record<string, unknown>;
  debug?: boolean;
  events?: Record<string, (...args: unknown[]) => Promise<void>>;
  jwt?: {
    secret?: string;
    maxAge?: number;
    encode?: (...args: unknown[]) => Promise<string>;
    decode?: (...args: unknown[]) => Promise<unknown>;
  };
  pages?: {
    signIn?: string;
    signOut?: string;
    error?: string;
    verifyRequest?: string;
    newUser?: string;
  };
  providers: unknown[];
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

// Opciones específicas para NextAuth
export interface NextAuthOptions extends AuthOptions {
  providers: unknown[];
}

// Tipo para contexto de autenticación
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
}

// Tipo para la sesión
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

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthService {
  login(credentials: LoginCredentials): Promise<{ user: User; token: string }>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  refreshToken(): Promise<string>;
  changePassword(oldPassword: string, newPassword: string): Promise<void>;
} 