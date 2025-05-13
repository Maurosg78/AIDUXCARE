/**
 * Roles de usuario disponibles en el sistema
 */
export enum UserRole {
  ADMIN = 'admin',
  PROFESSIONAL = 'professional',
  SECRETARY = 'secretary',
  DEVELOPER = 'developer'
}

/**
 * Tipo de usuario base del sistema
 */
export type User = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at?: string;
  last_login?: string;
  is_active?: boolean;
};

/**
 * Verifica si un rol es válido
 */
export const isValidRole = (role: string): role is UserRole => {
  return Object.values(UserRole).includes(role as UserRole);
};

/**
 * Verifica si un usuario tiene uno de los roles permitidos
 */
export const hasAllowedRole = (user: User | null, allowedRoles: UserRole[]): boolean => {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}; 