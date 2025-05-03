import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { UserRole } from '@/modules/auth/authService';

const OnboardingPage: React.FC = () => {
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: UserRole })?.role;
  const showFeedback = userRole === UserRole.DOCTOR || userRole === UserRole.ADMIN;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Bienvenido a AiDuxCare</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Términos de Uso y Privacidad</h2>
            <p className="text-gray-600">
              Al utilizar AiDuxCare, aceptas los siguientes términos y condiciones:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Uso de micrófono para captura de voz durante las consultas</li>
              <li>Procesamiento de datos clínicos con IA</li>
              <li>Almacenamiento seguro de información médica</li>
              <li>Compartir datos anonimizados para mejora del sistema</li>
            </ul>
            <div className="mt-6">
              <button
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
                onClick={() => window.location.href = '/dashboard'}
              >
                Aceptar y Continuar
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {showFeedback && (
        <Card className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
          <h2 className="text-lg font-semibold mb-2">📩 ¿Nos das tu opinión?</h2>
          <p className="text-sm text-gray-700 mb-2">
            Tu experiencia es clave para que AiDuxCare sea realmente útil para ti.
          </p>
          <Link
            href="/feedback"
            className="inline-block px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium"
          >
            Rellenar formulario de feedback
          </Link>
        </Card>
      )}
    </div>
  );
};

export default OnboardingPage; 