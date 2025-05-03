import { useAuth } from '../context/AuthContext';
import { Button, Card } from '../components/ui';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">AiDuxCare</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user?.name} ({user?.role})
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
            >
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <Card.Header>
                <h2 className="text-lg font-medium">Bienvenido al Dashboard</h2>
              </Card.Header>
              <Card.Content>
                <p className="text-gray-600">
                  Este es un dashboard de ejemplo para AiDuxCare. Aquí podrías ver resúmenes de pacientes, citas pendientes, y más.
                </p>
              </Card.Content>
            </Card>

            <Card>
              <Card.Header>
                <h2 className="text-lg font-medium">Pacientes recientes</h2>
              </Card.Header>
              <Card.Content>
                <div className="space-y-3">
                  <p className="text-gray-600">
                    Esta sección mostraría una lista de los pacientes atendidos recientemente.
                  </p>
                  <div className="text-center pt-4">
                    <Button variant="secondary">Ver todos los pacientes</Button>
                  </div>
                </div>
              </Card.Content>
            </Card>

            <Card>
              <Card.Header>
                <h2 className="text-lg font-medium">Próximas citas</h2>
              </Card.Header>
              <Card.Content>
                <div className="space-y-3">
                  <p className="text-gray-600">
                    Aquí se mostrarían las próximas citas programadas.
                  </p>
                  <div className="text-center pt-4">
                    <Button variant="secondary">Ver todas las citas</Button>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-600 text-center">
            &copy; {new Date().getFullYear()} AiDuxCare. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
} 