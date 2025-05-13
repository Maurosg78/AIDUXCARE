import { useEffect, useState } from 'react';
import { useAuth } from '@/core/context/AuthContext';
import { useNavigate } from 'react-router';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Activity,
  Users,
  Calendar,
  Clock,
  Download,
  AlertCircle,
  TrendingUp,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { StatCard, StatCardSkeleton } from '@/components/ui/stat-card';
import { ChartCard } from '@/components/ui/chart-card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { trackEvent } from '@/core/lib/langfuse.client';

interface StatsMetrics {
  totalPatients: number;
  activePatients: number;
  averageAge: number;
  genderDistribution: Array<{
    gender: string;
    count: number;
  }>;
  ageDistribution: Array<{
    range: string;
    count: number;
  }>;
  recentRegistrations: Array<{
    patientId: string;
    age: number;
    gender: string;
    registrationDate: string;
  }>;
  lastUpdated: string;
}

const COLORS = ['#3b82f6', '#ef4444', '#94a3b8'];

export default function StatsPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<StatsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated === false) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        if (!response.ok) {
          throw new Error('Error al obtener métricas');
        }
        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMetrics();
    }
  }, [user]);

  const handleExport = async () => {
    if (!metrics) return;
    
    const csvContent = [
      ['Métrica', 'Valor'],
      ['Total de Pacientes', metrics.totalPatients],
      ['Pacientes Activos', metrics.activePatients],
      ['Edad Promedio', `${metrics.averageAge} años`],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `stats-metrics-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    trackEvent({
      name: 'form.submit',
      payload: {
        timestamp: new Date().toISOString(),
        patientId: 'admin',
        value: 'stats_export',
        field: 'csv',
        fields: [
          { name: 'format', value: 'csv' },
          { name: 'dataSize', value: csvContent.length.toString() }
        ]
      }
    });
  };

  if (isAuthenticated === false || loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <span className="ml-2">{error}</span>
        </Alert>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">
          Estadísticas de Pacientes
        </h1>
        <Button onClick={handleExport} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Exportar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Pacientes"
          value={metrics.totalPatients}
          icon={Users}
          subtitle="Pacientes registrados"
        />
        <StatCard
          title="Pacientes Activos"
          value={metrics.activePatients}
          icon={Activity}
          subtitle={`${((metrics.activePatients / metrics.totalPatients) * 100).toFixed(1)}% del total`}
        />
        <StatCard
          title="Edad Promedio"
          value={`${metrics.averageAge} años`}
          icon={Calendar}
          subtitle="Promedio de edad"
        />
        <StatCard
          title="Nuevos Registros"
          value={metrics.recentRegistrations.length}
          icon={TrendingUp}
          subtitle="Últimos 30 días"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Distribución por Género">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={metrics.genderDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {metrics.genderDistribution.map((_, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  </div>
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Distribución por Edad">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.ageDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" name="Cantidad" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-slate-700 mb-4">
          Registros Recientes
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Edad
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Género
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Fecha de Registro
                </th>
              </tr>
            </thead>
            <tbody>
              {metrics.recentRegistrations.map((patient, index) => (
                <tr
                  key={index}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-900">
                        {patient.patientId}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">{patient.age} años</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {patient.gender === 'M' ? (
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-pink-500" />
                      )}
                      <span className="text-slate-600">
                        {patient.gender === 'M' ? 'Masculino' : 'Femenino'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600">
                    <div className="flex items-center justify-end gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {new Date(patient.registrationDate).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 