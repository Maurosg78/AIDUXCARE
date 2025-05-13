/**
 * Usuarios de prueba para desarrollo local
 * No usar en producción
 */

export interface SeedUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
}

export const seedUsers: SeedUser[] = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'password123',
    name: 'Administrador',
    role: 'admin'
  },
  {
    id: '2',
    email: 'fisio@example.com',
    password: 'password123',
    name: 'Fisioterapeuta Demo',
    role: 'fisioterapeuta'
  },
  {
    id: '3',
    email: 'secretary@example.com',
    password: 'password123',
    name: 'Secretaria Demo',
    role: 'secretary'
  },
  {
    id: '4',
    email: 'dev@example.com',
    password: 'password123',
    name: 'Desarrollador',
    role: 'developer'
  }
]; 