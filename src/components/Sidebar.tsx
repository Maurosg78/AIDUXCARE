import React from 'react';
import { Link } from '@/core/utils/router';
import { useAuth } from '../core/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  UserGroupIcon, 
  CalendarIcon, 
  HomeIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

export function Sidebar() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const menuItems = [
    {
      name: t('sidebar.home'),
      href: getDashboardRoute(user?.role || ''),
      icon: HomeIcon,
      roles: ['professional', 'secretary', 'admin', 'fisioterapeuta'],
    },
    {
      name: t('sidebar.patients'),
      href: '/patients',
      icon: UserGroupIcon,
      roles: ['professional', 'secretary', 'admin', 'fisioterapeuta'],
    },
    {
      name: t('sidebar.visits'),
      href: '/visits',
      icon: CalendarIcon,
      roles: ['professional', 'fisioterapeuta'],
    },
    {
      name: t('sidebar.records'),
      href: '/records',
      icon: ClipboardDocumentListIcon,
      roles: ['professional', 'fisioterapeuta'],
    },
  ];

  const filteredItems = menuItems.filter(
    item => user?.role && item.roles.includes(user.role)
  );

  return (
    <nav className="w-64 bg-white shadow-lg">
      <div className="p-4">
        <div className="mb-8">
          <img 
            src="/logo.png" 
            alt="AiduxCare" 
            className="h-8"
          />
        </div>
        <ul className="space-y-2">
          {filteredItems.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className="flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <item.icon className="w-6 h-6 mr-3" />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

function getDashboardRoute(role: string): string {
  switch (role) {
    case 'professional':
    case 'fisioterapeuta':
      return '/professional/dashboard';
    case 'admin':
      return '/admin/dashboard';
    case 'secretary':
      return '/secretary/dashboard';
    default:
      return '/';
  }
} 