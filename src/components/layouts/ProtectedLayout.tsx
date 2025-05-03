import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Loader2 } from 'lucide-react';
import { UserRole } from '@/modules/auth/authService';

interface ProtectedLayoutProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedLayout({ children, allowedRoles }: ProtectedLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && allowedRoles) {
      const userRole = (session?.user as { role?: UserRole })?.role;
      if (!userRole || !allowedRoles.includes(userRole)) {
        router.push('/unauthorized');
      }
    }
  }, [status, session, router, allowedRoles]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === 'authenticated') {
    return <>{children}</>;
  }

  return null;
} 