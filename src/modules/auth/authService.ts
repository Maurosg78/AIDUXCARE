import bcrypt from 'bcryptjs';
import { seedUsers, SeedUser } from './seedUsers';

export type UserRole = 'fisioterapeuta' | 'auditor' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  clinic: string;
}

class AuthService {
  private static SESSION_KEY = 'aiduxcare_user';
  private static users: SeedUser[] = seedUsers;

  static async login(email: string, password: string): Promise<User | null> {
    const user = this.users.find(u => u.email === email);
    if (!user) return null;

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return null;

    const sessionUser: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      clinic: user.clinic
    };

    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  }

  static logout(): void {
    sessionStorage.removeItem(this.SESSION_KEY);
  }

  static getCurrentUser(): User | null {
    const userStr = sessionStorage.getItem(this.SESSION_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  }

  static isAuthorized(requiredRoles: UserRole[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return requiredRoles.includes(user.role);
  }

  static async initializeUsers(): Promise<void> {
    this.users = await Promise.all(
      this.users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      }))
    );
  }
}

export default AuthService; 