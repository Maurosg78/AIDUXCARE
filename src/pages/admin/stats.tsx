import { useEffect, useState } from 'react';
import { useAuth } from '@/core/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DailyStats {
  date: string;
  formUpdates: number;
  feedbacks: number;
}

interface FieldStats {
  field: string;
  count: number;
}

interface EMRStats {
  dailyStats: DailyStats[];
  topFields: FieldStats[];
  averageEventsPerVisit: number;
  lastUpdated: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function EMRStatsDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<EMRStats | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/emr-stats');
        if (!response.ok) {
          throw new Error('Error al obtener estadísticas');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Estadísticas de uso del sistema clínico
        </h1>
        <p className="text-sm text-gray-500">
          Última actualización: {new Date(stats.lastUpdated).toLocaleString('es-ES')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Gráfico de eventos diarios */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Eventos por día (últimos 7 días)</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString('es-ES', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                />
                <Legend />
                <Bar dataKey="formUpdates" name="Actualizaciones de formulario" fill="#8884d8" />
                <Bar dataKey="feedbacks" name="Feedbacks" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de campos más modificados */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Campos más modificados</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.topFields}
                  dataKey="count"
                  nameKey="field"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ field, percent }) => `${field}: ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.topFields.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Promedio de eventos por visita */}
        <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Promedio de eventos por visita</h2>
          <div className="text-4xl font-bold text-blue-600">
            {stats.averageEventsPerVisit.toFixed(2)}
            <span className="text-lg font-normal text-gray-500 ml-2">eventos</span>
          </div>
        </div>
      </div>
    </div>
  );
} 