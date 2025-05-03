import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { trackEvent } from '@/core/services/langfuseClient';

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

const COLORS = ['#10B981', '#EF4444', '#6B7280'];

export default function CopilotImpactDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [metrics, setMetrics] = useState<CopilotImpactMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.isAdmin) {
      router.push('/');
      return;
    }

    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/admin/copilot-impact');
        if (!response.ok) throw new Error('Error al obtener métricas');
        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        setError('Error al cargar las métricas del copiloto');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [session, router]);

  const handleExport = async (format: 'csv' | 'json') => {
    if (!metrics) return;

    try {
      const data = format === 'csv' 
        ? convertToCSV(metrics)
        : JSON.stringify(metrics, null, 2);

      const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `copilot-impact-${new Date().toISOString()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      trackEvent('admin.export.copilot-impact', {
        format,
        dataSize: data.length,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error al exportar:', err);
    }
  };

  const convertToCSV = (metrics: CopilotImpactMetrics): string => {
    const headers = [
      'Métrica',
      'Valor',
      'Detalles',
    ];

    const rows = [
      ['Total Sugerencias', metrics.totalSuggestions.toString(), ''],
      ['Sugerencias Aceptadas', metrics.acceptedSuggestions.toString(), ''],
      ['Tasa de Adopción', `${((metrics.acceptedSuggestions / metrics.totalSuggestions) * 100).toFixed(1)}%`, ''],
      ['Feedback Positivo', metrics.feedbackByType.positive.toString(), ''],
      ['Feedback Negativo', metrics.feedbackByType.negative.toString(), ''],
      ['Feedback Ignorado', metrics.feedbackByType.ignored.toString(), ''],
    ];

    // Agregar campos por sugerencia
    Object.entries(metrics.suggestionsByField).forEach(([field, data]) => {
      rows.push([
        `Campo: ${field}`,
        data.total.toString(),
        `Aceptadas: ${data.accepted}, Positivas: ${data.feedback.positive}, Negativas: ${data.feedback.negative}, Ignoradas: ${data.feedback.ignored}`,
      ]);
    });

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard de Impacto del Copiloto IA</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard de Impacto del Copiloto IA</h1>
        <Alert type="error">{error}</Alert>
      </div>
    );
  }

  if (!metrics) return null;

  const feedbackData = [
    { name: 'Útil', value: metrics.feedbackByType.positive },
    { name: 'Incorrecta', value: metrics.feedbackByType.negative },
    { name: 'Ignorada', value: metrics.feedbackByType.ignored },
  ];

  const fieldData = Object.entries(metrics.suggestionsByField).map(([field, data]) => ({
    name: field,
    sugeridas: data.total,
    aceptadas: data.accepted,
  }));

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard de Impacto del Copiloto IA</h1>
        <div className="flex gap-2">
          <Button onClick={() => handleExport('csv')}>Exportar CSV</Button>
          <Button onClick={() => handleExport('json')}>Exportar JSON</Button>
        </div>
      </div>

      <div className="text-sm text-gray-500 mb-6">
        Última actualización: {new Date(metrics.lastUpdated).toLocaleString()}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Total de Sugerencias</h3>
          <p className="text-3xl font-bold">{metrics.totalSuggestions}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Sugerencias Aceptadas</h3>
          <p className="text-3xl font-bold">{metrics.acceptedSuggestions}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Tasa de Adopción</h3>
          <p className="text-3xl font-bold">
            {((metrics.acceptedSuggestions / metrics.totalSuggestions) * 100).toFixed(1)}%
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Feedback por Tipo</h3>
          <div className="h-64">
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
                  {feedbackData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Sugerencias por Campo</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fieldData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sugeridas" name="Sugeridas" fill="#3B82F6" />
                <Bar dataKey="aceptadas" name="Aceptadas" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Top 10 Pacientes con Intervención IA</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sugerencias
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aceptadas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Interacción
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metrics.topPatients.map((patient) => (
                <tr key={patient.patientId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {patient.patientId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {patient.suggestions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {patient.accepted}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(patient.lastInteraction).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
} 