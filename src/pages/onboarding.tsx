import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Laptop, User, AlertCircle } from 'lucide-react';

export default function OnboardingPage() {
  const navigate = useNavigate();

  const handleDemoClick = () => {
    navigate('/patients/demo-onboarding/visits/new');
  };

  const handleNext = () => {
    // Implementation of handleNext function
  };

  const handleSkip = () => {
    // Implementation of handleSkip function
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          Bienvenido a AiDuxCare
        </h1>
        
        <div className="grid gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Sobre el Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                AiDuxCare es un copiloto clínico que asiste a profesionales de salud durante las visitas médicas, 
                proporcionando sugerencias contextuales y evaluando la calidad de la documentación en tiempo real.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Evaluación automática de la calidad de las visitas</li>
                <li>Sugerencias basadas en evidencia clínica</li>
                <li>Detección temprana de omisiones o riesgos</li>
                <li>Interfaz adaptativa al flujo de trabajo clínico</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Laptop className="w-5 h-5 text-blue-500" />
                Requisitos del Navegador
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Chrome 90+ o Firefox 90+</li>
                <li>Pantalla con resolución mínima de 1280x720</li>
                <li>Conexión a internet estable</li>
                <li>JavaScript habilitado</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-purple-500" />
                Caso Simulado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Para familiarizarse con el sistema, puede utilizar nuestro caso simulado que incluye:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                <li>Historia clínica precargada</li>
                <li>Datos de ejemplo anonimizados</li>
                <li>Escenarios comunes de consulta</li>
              </ul>
              <Button 
                onClick={handleDemoClick}
                className="w-full md:w-auto"
              >
                Probar con Paciente Demo
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                Nota Importante
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Este entorno de prueba no almacena datos personales reales. 
                Todos los datos han sido anonimizados o generados artificialmente.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button
            onClick={handleNext}
            className="mr-4"
          >
            Siguiente
          </Button>
          <Button
            onClick={handleSkip}
            className="w-full md:w-auto"
          >
            Omitir
          </Button>
        </div>
      </div>
    </div>
  );
} 