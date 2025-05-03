import { compare, hash } from 'bcryptjs';
import jwt from 'jsonwebtoken';

export enum UserRole {
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT',
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

const users: User[] = [
  {
    id: '1',
    email: 'jose@valenciamed.com',
    password: '$2a$10$YourHashedPasswordHere',
    name: 'José Valencia',
    role: UserRole.DOCTOR,
  },
  {
    id: '2',
    email: 'laura@clinicatest.com',
    password: '$2a$10$YourHashedPasswordHere',
    name: 'Laura Test',
    role: UserRole.DOCTOR,
  },
  {
    id: '3',
    email: 'mauricio@axonvalencia.es',
    password: '$2a$10$YourHashedPasswordHere',
    name: 'Mauricio Sobarzo',
    role: UserRole.ADMIN,
  },
  {
    id: '4',
    email: 'patient@aiduxcare.com',
    password: '$2a$10$GQJ.q9rz6YJH3YuI3J3Z2OZwww/uQJ.q9rz6YJH3YuI3J3Z2O',
    name: 'Patient',
    role: UserRole.PATIENT,
  },
];

// Inicializar passwords hasheados
(async () => {
  const defaultPassword = 'Test1234!';
  const hashedPassword = await hash(defaultPassword, 10);
  users.forEach(user => {
    user.password = hashedPassword;
  });
})();

export async function validateCredentials(email: string, password: string): Promise<User | null> {
  const user = users.find((u) => u.email === email);
  if (!user) return null;

  // En desarrollo, permitir password de prueba
  if (process.env.NODE_ENV === 'development' && password === 'Test1234!') {
    return user;
  }

  try {
    const isValid = await compare(password, user.password);
    if (!isValid) return null;
    return user;
  } catch (error) {
    console.error('Error validando credenciales:', error);
    return null;
  }
}

export function generateToken(user: User): string {
  const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET o NEXTAUTH_SECRET no está configurado');
  }

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    secret,
    { expiresIn: '24h' }
  );
}

export function getUserByEmail(email: string): User | undefined {
  return users.find(u => u.email === email);
}

export function getUserById(id: string): User | undefined {
  return users.find(u => u.id === id);
}

class AuthService {
  private static SESSION_KEY = 'aiduxcare_user';
  private static users: User[] = users;

  static async login(email: string, password: string): Promise<User | null> {
    try {
      const user = await validateCredentials(email, password);
      if (user) {
        // Almacenar en sessionStorage solo información no sensible
        const sessionUser = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
        sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionUser));
      }
      return user;
    } catch (error) {
      console.error('Error en login:', error);
      return null;
    }
  }

  static logout(): void {
    try {
      sessionStorage.removeItem(this.SESSION_KEY);
    } catch (error) {
      console.error('Error en logout:', error);
    }
  }

  static getCurrentUser(): Omit<User, 'password'> | null {
    try {
      const userStr = sessionStorage.getItem(this.SESSION_KEY);
      if (!userStr) return null;
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      return null;
    }
  }

  static isAuthorized(requiredRoles: UserRole[]): boolean {
    try {
      const user = this.getCurrentUser();
      if (!user) return false;
      return requiredRoles.includes(user.role);
    } catch (error) {
      console.error('Error en autorización:', error);
      return false;
    }
  }
}

export default AuthService; 