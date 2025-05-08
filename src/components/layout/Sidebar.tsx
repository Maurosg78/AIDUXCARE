import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/core/context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Calendar,
  CreditCard,
  Activity,
  FileText,
  Settings,
  Terminal,
  Bug,
  Brain,
  LogOut,
  User
} from 'lucide-react';

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const menuItemsByRole: Record<string, MenuItem[]> = {
  professional: [
    { label: 'sidebar.my_visits', path: '/dashboard/professional', icon: <FileText size={20} /> },
    { label: 'sidebar.mcp', path: '/mcp', icon: <Brain size={20} /> },
    { label: 'sidebar.patients', path: '/patients', icon: <Users size={20} /> }
  ],
  secretary: [
    { label: 'sidebar.schedule', path: '/dashboard/secretary', icon: <Calendar size={20} /> },
    { label: 'sidebar.payments', path: '/pagos', icon: <CreditCard size={20} /> },
    { label: 'sidebar.patients', path: '/patients', icon: <Users size={20} /> }
  ],
  admin: [
    { label: 'sidebar.users', path: '/dashboard/admin', icon: <Users size={20} /> },
    { label: 'sidebar.metrics', path: '/metrics', icon: <Activity size={20} /> },
    { label: 'sidebar.patients', path: '/patients', icon: <Users size={20} /> }
  ],
  developer: [
    { label: 'sidebar.logs', path: '/langfuse', icon: <Terminal size={20} /> },
    { label: 'sidebar.tests', path: '/tests', icon: <Bug size={20} /> }
  ]
};

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  if (!user || !user.role) {
    return null;
  }

  const menuItems = menuItemsByRole[user.role] || [];

  // Función para obtener las iniciales del nombre
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-gray-50 border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">
          {user.name || user.email}
        </h2>
        <p className="text-sm text-gray-600">
          {t(`roles.${user.role}`)}
        </p>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors
                  ${location.pathname === item.path
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                {item.icon}
                <span>{t(item.label)}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile and Logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full" />
            ) : (
              <span className="text-sm font-medium">
                {user.name ? getInitials(user.name) : <User size={20} />}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.name || t('common.user')}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user.email}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>{t('auth.logout')}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar; 