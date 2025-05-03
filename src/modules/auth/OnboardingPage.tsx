import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const OnboardingPage: React.FC = () => {
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
    </div>
  );
};

export default OnboardingPage; 