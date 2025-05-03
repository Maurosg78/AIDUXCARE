import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export default function NotFound() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-blue-600">404</h1>
        <h2 className="mt-4 text-3xl font-bold text-gray-900">Página no encontrada</h2>
        <p className="mt-2 text-lg text-gray-600">
          Lo sentimos, la página que estás buscando no existe.
        </p>
        <div className="mt-6">
          <Button onClick={() => navigate('/')}>
            Volver al inicio
          </Button>
        </div>
      </div>
    </div>
  );
} 