import React from 'react';
import { useAuth } from '@/core/context/AuthContext';
import { Bars3Icon, XMarkIcon, BellIcon } from '@heroicons/react/24/outline';

interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export function Header({ isSidebarOpen, setIsSidebarOpen }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="h-16 px-4 flex items-center justify-between">
        <div className="flex items-center">
          <button
            type="button"
            className="text-gray-500 hover:text-gray-600 focus:outline-none"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
            <span className="sr-only">
              {isSidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
            </span>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <button
            type="button"
            className="text-gray-500 hover:text-gray-600 focus:outline-none relative"
          >
            <BellIcon className="h-6 w-6" />
            <span className="sr-only">Notificaciones</span>
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0">
              <img
                className="h-8 w-8 rounded-full bg-gray-300"
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'Usuario'}&background=0D8ABC&color=fff`}
                alt={user?.name || 'Usuario'}
              />
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-sm font-medium text-gray-700">
                {user?.name || 'Usuario'}
              </span>
              <span className="text-xs text-gray-500">
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
    professional: 'Profesional',
    fisioterapeuta: 'Fisioterapeuta',
    admin: 'Administrador',
    secretary: 'Secretario/a',
    developer: 'Desarrollador'
  };

  return roleMap[role] || role;
} 