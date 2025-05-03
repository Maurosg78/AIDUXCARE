import { User } from 'next-auth';

export type UserRole = 'fisioterapeuta' | 'admin';

export interface AuthUser extends User {
  role?: UserRole;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export { AuthUser, AuthContextType }; 