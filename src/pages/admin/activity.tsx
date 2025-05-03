import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  Activity,
  Users,
  Calendar,
  Clock,
  Download,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { StatCard, StatCardSkeleton } from '@/components/ui/StatCard';
import { ChartCard } from '@/components/ui/ChartCard';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/Alert';
import { trackEvent } from '@/core/services/langfuseClient';

interface ActivityMetrics {
  totalVisits: number;
  activePatients: number;
  averageVisitDuration: number;
  visitsByDay: Array<{
    date: string;
    count: number;
  }>;
  visitsByType: Array<{
    type: string;
    count: number;
  }>;
  recentVisits: Array<{
    patientId: string;
    type: string;
    date: string;
    duration: number;
  }>;
  lastUpdated: string;
}

export default function ActivityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [metrics, setMetrics] = useState<ActivityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/admin/activity');
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

    if (session?.user) {
      fetchMetrics();
    }
  }, [session]);

  const handleExport = async () => {
    if (!metrics) return;
    
    const csvContent = [
      ['Métrica', 'Valor'],
      ['Total de Visitas', metrics.totalVisits],
      ['Pacientes Activos', metrics.activePatients],
      ['Duración Promedio', `${metrics.averageVisitDuration} minutos`],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `activity-metrics-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    trackEvent({
      name: 'admin.export.activity',
      payload: {
        format: 'csv',
        dataSize: csvContent.length,
        timestamp: new Date().toISOString()
      },
      traceId: 'admin'
    });
  };

  if (status === 'loading' || loading) {
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
          Actividad de Pacientes
        </h1>
        <Button onClick={handleExport} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Exportar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Visitas"
          value={metrics.totalVisits}
          icon={Activity}
          subtitle="Últimos 30 días"
        />
        <StatCard
          title="Pacientes Activos"
          value={metrics.activePatients}
          icon={Users}
          subtitle="Pacientes con visitas recientes"
        />
        <StatCard
          title="Duración Promedio"
          value={`${metrics.averageVisitDuration} min`}
          icon={Clock}
          subtitle="Tiempo promedio por visita"
        />
        <StatCard
          title="Visitas por Día"
          value={Math.round(metrics.totalVisits / 30)}
          icon={Calendar}
          subtitle="Promedio diario"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Visitas por Día">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics.visitsByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Visitas por Tipo">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.visitsByType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" name="Cantidad" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-slate-700 mb-4">
          Visitas Recientes
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Duración
                </th>
              </tr>
            </thead>
            <tbody>
              {metrics.recentVisits.map((visit, index) => (
                <tr
                  key={index}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-900">
                        {visit.patientId}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">{visit.type}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600">
                    <div className="flex items-center justify-end gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {new Date(visit.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600">
                    <div className="flex items-center justify-end gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {visit.duration} min
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