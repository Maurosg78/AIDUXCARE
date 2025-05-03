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

export async function validateCredentials(email: string, password: string): Promise<User | null> {
  const user = users.find((u) => u.email === email);
  if (!user) return null;

  if (process.env.NODE_ENV === 'development' && password === 'Test1234!') {
    return user;
  }

  const isValid = await compare(password, user.password);
  if (!isValid) return null;

  return user;
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    process.env.JWT_SECRET || 'default-secret',
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
    const user = this.users.find(u => u.email === email);
    if (!user) return null;

    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) return null;

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

  static async initializeUsers() {
    const hashedPassword = await hash('password123', 10);
    this.users.forEach(user => {
      user.password = hashedPassword;
    });
  }
}

export default AuthService; 