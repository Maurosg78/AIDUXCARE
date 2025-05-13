/**
 * Tipos personalizados para sesiones y autenticación
 */
import type { NextApiRequest } from 'next';
import type { UserRole } from '../utils/auth';

// Sesión personalizada
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

// Tipos de usuario
export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role?: UserRole;
}

// Tipos de cuenta
export interface Account {
  provider: string;
  type: string;
  id: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
}

// Tipos de perfil
export interface Profile {
  id: string;
  name?: string;
  email?: string;
  image?: string;
}

// Tipos de proveedor
export interface Provider {
  id: string;
  name: string;
  type: string;
  signinUrl: string;
  callbackUrl: string;
}

// Tipos de entrada de credenciales
export interface CredentialInput {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  required?: boolean;
}

// Configuración de credenciales
export interface CredentialsConfig {
  id?: string;
  name?: string;
  credentials?: Record<string, CredentialInput>;
  authorize: (credentials: Record<string, unknown>) => Promise<User | null>;
} 