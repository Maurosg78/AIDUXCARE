import bcrypt from 'bcryptjs';
import { UserRole } from './authService';

export interface SeedUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  clinic: string;
  createdAt: string;
  updatedAt: string;
}

// Función para hashear contraseñas
const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Usuarios de prueba
export const seedUsers: SeedUser[] = [
  {
    id: '1',
    email: 'mauricio@axonvalencia.es',
    password: 'Test1234!', // Se hasheará al inicializar
    name: 'Mauricio Sobarzo',
    role: 'fisioterapeuta',
    clinic: 'Clínica AXON - Valencia',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    email: 'admin@aiduxcare.com',
    password: 'Admin1234!',
    name: 'Administrador',
    role: 'admin',
    clinic: 'AiDuxCare',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Función para inicializar usuarios con contraseñas hasheadas
export const initializeSeedUsers = async (): Promise<SeedUser[]> => {
  const hashedUsers = await Promise.all(
    seedUsers.map(async (user) => ({
      ...user,
      password: await hashPassword(user.password)
    }))
  );
  return hashedUsers;
}; 