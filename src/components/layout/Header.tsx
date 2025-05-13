import React from 'react';
import { useAuth } from '@/core/context/AuthContext';
import { Bell, Menu, X } from 'lucide-react';
import type { UserRole } from '@/core/types/UserRoles';

interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export function Header({ isSidebarOpen, setIsSidebarOpen }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-aidux-gray/30 shadow-sm z-10">
      <div className="h-16 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center">
          <button
            type="button"
            className="text-aidux-slate hover:text-aidux-coral transition-colors focus:outline-none"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label={isSidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {isSidebarOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
          
          <div className="ml-4 md:ml-6">
            <h1 className="text-lg font-semibold text-aidux-slate hidden md:block">
              AiDuxCare
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            type="button"
            className="text-aidux-slate hover:text-aidux-coral focus:outline-none relative"
            aria-label="Notificaciones"
          >
            <Bell className="h-6 w-6" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-aidux-coral"></span>
          </button>

          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <img
                className="h-9 w-9 rounded-full border border-aidux-gray/30 bg-aidux-bone"
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'Usuario'}&background=5DA5A3&color=fff`}
                alt={user?.name || 'Usuario'}
              />
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-sm font-medium text-aidux-slate">
                {user?.name || 'Usuario'}
              </span>
              <span className="text-xs text-aidux-gray">
                {getReadableRole(user?.role || '')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function getReadableRole(role: string): string {
  const roleMap: Record<string, string> = {
    [UserRole.PROFESSIONAL]: 'Profesional',
    [UserRole.ADMIN]: 'Administrador',
    [UserRole.SECRETARY]: 'Secretario/a',
    [UserRole.DEVELOPER]: 'Desarrollador'
  };

  return roleMap[role] || role;
} 