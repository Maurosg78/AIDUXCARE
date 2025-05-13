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
  LogOut,
  AlertTriangle
} from 'lucide-react';
import type { UserRole } from '@/core/types/UserRoles';
import { isValidRole } from '@/core/types/UserRoles';

// Tipo del elemento de menú
interface MenuItem {
  name: string;
  href: string;
  icon: React.FC<{ className?: string }>;
  roles: UserRole[];
  hidden?: boolean;
}

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems: MenuItem[] = [
    {
      name: 'Pacientes',
      href: '/patients',
      icon: Users,
      roles: [UserRole.PROFESSIONAL, UserRole.SECRETARY, UserRole.ADMIN],
    },
    {
      name: 'Visitas',
      href: '/visits',
      icon: Calendar,
      roles: [UserRole.PROFESSIONAL],
    },
    {
      name: 'Registros médicos',
      href: '/records',
      icon: ClipboardCheck,
      roles: [UserRole.PROFESSIONAL],
    },
    {
      name: 'Panel IA',
      href: '/mcp',
      icon: Brain,
      roles: [UserRole.PROFESSIONAL, UserRole.ADMIN],
    },
    {
      name: 'Monitoreo de Riesgos',
      href: '/admin/risk-monitor',
      icon: AlertTriangle,
      roles: [UserRole.ADMIN],
    },
    {
      name: 'Configuración',
      href: '/settings',
      icon: Settings,
      roles: [UserRole.ADMIN],
      hidden: true,
    },
  ];

  // Verificar si el role del usuario es válido y filtrar elementos de menú
  const userRole = user?.role && isValidRole(user.role) ? user.role : undefined;
  const filteredItems = menuItems.filter(
    item => !item.hidden && userRole && item.roles.includes(userRole)
  );

  return (
    <>
      {/* Overlay para dispositivos móviles */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-aidux-slate/50 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 flex flex-col bg-aidux-slate text-white transition-transform duration-300 ease-in-out transform",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:static lg:z-auto"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <img 
            src="/logo.png" 
            alt="AiDuxCare" 
            className="h-8" 
          />
        </div>

        {/* Menu items */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1.5">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-lg group transition-colors",
                      isActive
                        ? "bg-aidux-coral text-white"
                        : "text-white/80 hover:bg-white/10"
                    )}
                  >
                    <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="flex-1">{item.name}</span>
                    {isActive && (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <img
                className="h-10 w-10 rounded-full border border-white/20"
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'Usuario'}&background=5DA5A3&color=fff`}
                alt={user?.name || 'Usuario'}
              />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">
                {user?.name || 'Usuario'}
              </p>
              <p className="text-xs text-white/70">
                {getReadableRole(user?.role || '')}
              </p>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-white/90 hover:bg-aidux-coral/90 rounded-lg group transition-colors"
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
    [UserRole.PROFESSIONAL]: 'Profesional',
    [UserRole.ADMIN]: 'Administrador',
    [UserRole.SECRETARY]: 'Secretario/a',
    [UserRole.DEVELOPER]: 'Desarrollador'
  };

  return roleMap[role] || role;
} 