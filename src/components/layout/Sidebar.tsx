import React from 'react';
import { Link, useLocation } from '@/core/utils/router';
import { useAuth } from '@/core/context/AuthContext';
import { cn } from '@/lib/utils';
import {
  Users,
  Calendar,
  ClipboardCheck,
  Brain,
  Settings,
  ChevronRight,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      name: 'Pacientes',
      href: '/patients',
      icon: Users,
      roles: ['professional', 'secretary', 'admin', 'fisioterapeuta'],
    },
    {
      name: 'Visitas',
      href: '/visits',
      icon: Calendar,
      roles: ['professional', 'fisioterapeuta'],
    },
    {
      name: 'Registros médicos',
      href: '/records',
      icon: ClipboardCheck,
      roles: ['professional', 'fisioterapeuta'],
    },
    {
      name: 'Panel IA',
      href: '/mcp',
      icon: Brain,
      roles: ['professional', 'fisioterapeuta', 'admin'],
    },
    {
      name: 'Configuración',
      href: '/settings',
      icon: Settings,
      roles: ['admin'],
      hidden: true,
    },
  ];

  const filteredItems = menuItems.filter(
    item => !item.hidden && user?.role && item.roles.includes(user.role)
  );

  return (
    <>
      {/* Overlay para dispositivos móviles */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 flex flex-col bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out transform",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:static lg:z-auto"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <img 
            src="/logo.png" 
            alt="AiDuxCare" 
            className="h-8" 
          />
        </div>

        {/* Menu items */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-lg group",
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="flex-1">{item.name}</span>
                    {isActive && (
                      <ChevronRight className="w-5 h-5 text-blue-700" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <img
                className="h-10 w-10 rounded-full bg-gray-300"
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'Usuario'}&background=0D8ABC&color=fff`}
                alt={user?.name || 'Usuario'}
              />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {user?.name || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500">
                {getReadableRole(user?.role || '')}
              </p>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg group"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
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