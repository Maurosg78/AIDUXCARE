/**
 * Utilidades para manejo de autenticación
 */

import { useState, useEffect } from 'react';

// Interfaz para usuario autenticado
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: string;
}

// Función para obtener el usuario actual desde el almacenamiento local
export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const userStr = localStorage.getItem('aiduxcare_user');
    if (!userStr) return null;
    
    return JSON.parse(userStr) as AuthUser;
  } catch (error) {
    console.error('Error al obtener usuario actual:', error);
    return null;
  }
}

// Función para obtener el ID del usuario actual
export function getCurrentUserId(): string | null {
  const user = getCurrentUser();
  return user?.id || null;
}

// Hook personalizado para obtener y actualizar el usuario actual
export function useCurrentUser() {
  const [user, setUser] = useState<AuthUser | null>(getCurrentUser());
  
  useEffect(() => {
    // Establecer el usuario al cargar la página
    setUser(getCurrentUser());
    
    // Listener para cambios en el almacenamiento local (cambio de sesión)
    const handleStorageChange = () => {
      setUser(getCurrentUser());
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  return user;
} 