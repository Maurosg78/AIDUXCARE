import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Acceso no autorizado
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            No tienes permisos para acceder a esta página
          </p>
        </div>
        <div className="flex justify-center">
          <Button
            onClick={() => router.back()}
            className="mx-2"
          >
            Volver
          </Button>
          <Button
            onClick={() => router.push('/login')}
            className="mx-2"
          >
            Ir al login
          </Button>
        </div>
      </div>
    </div>
  );
} 