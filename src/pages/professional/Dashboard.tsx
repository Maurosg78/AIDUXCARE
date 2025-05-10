import React from 'react';
import { useAuth } from '@/core/context/AuthContext';
import { Link } from '@/core/utils/router';
import { 
  Users, 
  Calendar, 
  ClipboardCheck, 
  Brain, 
  ArrowRight 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';

export default function ProfessionalDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header y bienvenida */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, {user?.name || 'Dr. Profesional'}
        </h1>
        <p className="text-gray-600 mt-2">
          Este es el panel de control de AiDuxCare para profesionales de la salud
        </p>
      </div>
      
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total pacientes"
          value="42"
          icon={Users}
          trend={{ value: 8, isPositive: true }}
          subtitle="8% más que el mes pasado"
        />
        <StatCard
          title="Visitas activas"
          value="12"
          icon={Calendar}
          subtitle="4 pendientes para hoy"
        />
        <StatCard
          title="Actividad IA"
          value="75+"
          icon={Brain}
          trend={{ value: 12, isPositive: true }}
          subtitle="Interacciones este mes"
        />
      </div>

      {/* Secciones principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sección de visitas recientes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-medium">Visitas recientes</CardTitle>
            <Link 
              to="/visits" 
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              Ver todas <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {visitas.length > 0 ? (
                visitas.map((visita) => (
                  <div 
                    key={visita.id} 
                    className="flex items-center p-3 rounded-lg hover:bg-gray-50 border border-gray-100"
                  >
                    <Calendar className="h-9 w-9 text-blue-500 bg-blue-50 p-2 rounded-full mr-4" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {visita.paciente}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(visita.fecha)} - {visita.motivo}
                      </p>
                    </div>
                    <Link 
                      to={`/visits/${visita.id}`} 
                      className="ml-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      Ver
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Calendar className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay visitas recientes</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Aún no tienes visitas registradas en el sistema.
                  </p>
                  <div className="mt-6">
                    <Link
                      to="/visits"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Crear visita
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sección de pacientes recientes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-medium">Pacientes recientes</CardTitle>
            <Link 
              to="/patients" 
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              Ver todos <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pacientes.length > 0 ? (
                pacientes.map((paciente) => (
                  <div 
                    key={paciente.id} 
                    className="flex items-center p-3 rounded-lg hover:bg-gray-50 border border-gray-100"
                  >
                    <div className="h-9 w-9 rounded-full bg-gray-200 mr-4 flex items-center justify-center overflow-hidden">
                      {paciente.avatar ? (
                        <img src={paciente.avatar} alt={paciente.nombre} className="h-full w-full object-cover" />
                      ) : (
                        <Users className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {paciente.nombre}
                      </p>
                      <p className="text-xs text-gray-500">
                        {paciente.edad} años - {paciente.motivo}
                      </p>
                    </div>
                    <Link 
                      to={`/patients/${paciente.id}`} 
                      className="ml-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      Ver
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Users className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay pacientes</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Comienza agregando pacientes a tu lista.
                  </p>
                  <div className="mt-6">
                    <Link
                      to="/patients/new"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Añadir paciente
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sección asistencia IA */}
      <Card className="bg-blue-50 border-blue-100">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-blue-800">Asistencia IA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Brain className="h-12 w-12 text-blue-500 mr-4" />
            <div>
              <h3 className="text-base font-medium text-blue-800">Panel IA disponible para ayudarte</h3>
              <p className="text-sm text-blue-600 mt-1">
                Utiliza nuestra IA para diagnósticos, notas clínicas y recomendaciones de tratamiento.
              </p>
              <Link
                to="/mcp"
                className="inline-flex items-center mt-3 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Abrir Panel IA
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Datos de ejemplo para mostrar en el dashboard
const visitas = [
  {
    id: '1',
    paciente: 'María García',
    fecha: new Date('2023-05-15T10:30:00'),
    motivo: 'Revisión mensual',
  },
  {
    id: '2',
    paciente: 'Juan López',
    fecha: new Date('2023-05-14T16:00:00'),
    motivo: 'Dolor lumbar',
  },
  {
    id: '3',
    paciente: 'Ana Martínez',
    fecha: new Date('2023-05-12T09:00:00'),
    motivo: 'Rehabilitación',
  },
];

const pacientes = [
  {
    id: '1',
    nombre: 'María García',
    edad: 42,
    motivo: 'Dolor crónico',
    avatar: null,
  },
  {
    id: '2',
    nombre: 'Juan López',
    edad: 35,
    motivo: 'Rehabilitación deportiva',
    avatar: null,
  },
  {
    id: '3',
    nombre: 'Ana Martínez',
    edad: 68,
    motivo: 'Post-operatorio',
    avatar: null,
  },
];

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
} 