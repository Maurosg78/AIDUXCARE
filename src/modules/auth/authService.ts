export type UserRole = 'fisioterapeuta' | 'auditor' | 'admin';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
}

class AuthService {
  private static SESSION_KEY = 'aiduxcare_user';

  static login(username: string, role: UserRole): User {
    // Simular un usuario con datos básicos
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      role,
      name: `${username} (${role})`
    };

    // Guardar en sessionStorage
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
    return user;
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
}

export default AuthService; 