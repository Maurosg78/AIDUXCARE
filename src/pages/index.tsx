import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Loader2 } from 'lucide-react';
import { UserRole } from '@/modules/auth/authService';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      const userRole = (session?.user as { role?: UserRole })?.role;
      
      switch (userRole) {
        case 'ADMIN':
          router.push('/admin/dashboard');
          break;
        case 'DOCTOR':
          router.push('/visits');
          break;
        case 'PATIENT':
          router.push('/dashboard');
          break;
        default:
          router.push('/login');
      }
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return null;
} 