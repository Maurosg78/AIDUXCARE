import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">AiDuxCare Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              {user?.name} ({user?.role})
            </span>
            <Button onClick={handleLogout} variant="outline">
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Bienvenido al panel de control</h2>
            <p className="text-gray-600 mb-6">
              Este es un panel de control de ejemplo para la aplicación AiDuxCare.
              Aquí podrás ver y gestionar información relevante para tu rol.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-700 mb-2">Pacientes</h3>
                <p className="text-gray-600 mb-4">Gestiona la información de tus pacientes.</p>
                <Button>Ver pacientes</Button>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-700 mb-2">Citas</h3>
                <p className="text-gray-600 mb-4">Consulta y programa citas con tus pacientes.</p>
                <Button>Ver citas</Button>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-purple-700 mb-2">Informes</h3>
                <p className="text-gray-600 mb-4">Genera y descarga informes sobre tu actividad.</p>
                <Button>Ver informes</Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 