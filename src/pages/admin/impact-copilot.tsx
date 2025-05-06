import { useEffect, useState } from 'react';
import { useAuth } from '@/core/context/AuthContext';
import { useNavigate } from 'react-router-dom';
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
  ThumbsUp,
  ThumbsDown,
  Clock,
  Download,
  AlertCircle,
} from 'lucide-react';
import { StatCard, StatCardSkeleton } from '@/components/ui/stat-card';
import { ChartCard } from '@/components/ui/chart-card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { trackEvent } from '@/core/lib/langfuse.client';

interface CopilotImpactMetrics {
  totalSuggestions: number;
  acceptedSuggestions: number;
  feedbackByType: {
    positive: number;
    negative: number;
    ignored: number;
  };
  suggestionsByField: {
    [key: string]: {
      total: number;
      accepted: number;
      feedback: {
        positive: number;
        negative: number;
        ignored: number;
      };
    };
  };
  topPatients: Array<{
    patientId: string;
    suggestions: number;
    accepted: number;
    lastInteraction: string;
  }>;
  lastUpdated: string;
}

const COLORS = ['#3b82f6', '#ef4444', '#94a3b8'];

export default function ImpactCopilotPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<CopilotImpactMetrics | null>(null);
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
        const response = await fetch('/api/admin/copilot-impact');
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
      ['Total de Sugerencias', metrics.totalSuggestions],
      ['Sugerencias Aceptadas', metrics.acceptedSuggestions],
      ['Feedback Positivo', metrics.feedbackByType.positive],
      ['Feedback Negativo', metrics.feedbackByType.negative],
      ['Feedback Ignorado', metrics.feedbackByType.ignored],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `copilot-impact-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    trackEvent({
      name: 'form.submit',
      payload: {
        timestamp: new Date().toISOString(),
        patientId: 'admin',
        value: 'copilot_impact_export',
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

  const feedbackData = [
    { name: 'Positivo', value: metrics.feedbackByType.positive },
    { name: 'Negativo', value: metrics.feedbackByType.negative },
    { name: 'Ignorado', value: metrics.feedbackByType.ignored },
  ];

  const suggestionsByFieldData = Object.entries(metrics.suggestionsByField)
    .map(([field, data]) => ({
      name: field,
      total: data.total,
      accepted: data.accepted,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">
          Impacto del Copiloto
        </h1>
        <Button onClick={handleExport} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Exportar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Sugerencias"
          value={metrics.totalSuggestions}
          icon={Activity}
          subtitle="Últimos 30 días"
        />
        <StatCard
          title="Sugerencias Aceptadas"
          value={metrics.acceptedSuggestions}
          icon={ThumbsUp}
          subtitle={`${((metrics.acceptedSuggestions / metrics.totalSuggestions) * 100).toFixed(1)}% de aceptación`}
        />
        <StatCard
          title="Feedback Positivo"
          value={metrics.feedbackByType.positive}
          icon={ThumbsUp}
          subtitle="Sugerencias con feedback positivo"
        />
        <StatCard
          title="Feedback Negativo"
          value={metrics.feedbackByType.negative}
          icon={ThumbsDown}
          subtitle="Sugerencias con feedback negativo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Distribución de Feedback">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={feedbackData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {feedbackData.map((_, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  </div>
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Sugerencias por Campo">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={suggestionsByFieldData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#3b82f6" name="Total" />
              <Bar dataKey="accepted" fill="#22c55e" name="Aceptadas" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-slate-700 mb-4">
          Top 10 Pacientes
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Sugerencias
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Aceptadas
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Última Interacción
                </th>
              </tr>
            </thead>
            <tbody>
              {metrics.topPatients.map((patient) => (
                <tr
                  key={patient.patientId}
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
                  <td className="py-3 px-4 text-right text-slate-600">
                    {patient.suggestions}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600">
                    {patient.accepted}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600">
                    <div className="flex items-center justify-end gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {new Date(patient.lastInteraction).toLocaleDateString()}
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