import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/core/context/AuthContext';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Download } from 'lucide-react';

interface WeeklyStats {
  period: {
    start: string;
    end: string;
  };
  metrics: {
    totalFormUpdates: number;
    totalFeedback: number;
    avgCompletenessScore: number;
    topMissingFields: Array<{ field: string; count: number }>;
    topWarnings: Array<{ warning: string; count: number }>;
  };
}

export default function ReportsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Verificar autenticación y rol de administrador
  if (!user || user?.role !== 'admin') {
    navigate('/login');
    return null;
  }

  const { data: report, isLoading, error } = useQuery<WeeklyStats>({
    queryKey: ['weeklyReport'],
    queryFn: async () => {
      const response = await fetch('/api/admin/weekly-report');
      if (!response.ok) {
        throw new Error('Error al cargar el reporte');
      }
      return response.json();
    }
  });

  const handleDownload = async (format: 'json' | 'csv') => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/weekly-report?format=${format}`);
      if (!response.ok) throw new Error('Error al descargar el reporte');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `weekly-report.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al descargar el reporte:', error);
      alert('Error al descargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error al cargar el reporte</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Reporte Semanal</h1>
        <div className="space-x-4">
          <Button
            onClick={() => handleDownload('json')}
            disabled={loading}
            className="flex items-center gap-2 border border-gray-300"
          >
            <Download className="w-4 h-4" />
            Descargar JSON
          </Button>
          <Button
            onClick={() => handleDownload('csv')}
            disabled={loading}
            className="flex items-center gap-2 border border-gray-300"
          >
            <Download className="w-4 h-4" />
            Descargar CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Inicio:</span>{' '}
                {new Date(report?.period.start || '').toLocaleDateString()}
              </p>
              <p>
                <span className="font-semibold">Fin:</span>{' '}
                {new Date(report?.period.end || '').toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Actualizaciones de Formulario:</span>{' '}
                {report?.metrics.totalFormUpdates}
              </p>
              <p>
                <span className="font-semibold">Feedbacks:</span>{' '}
                {report?.metrics.totalFeedback}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calidad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Score Promedio:</span>{' '}
                {report?.metrics.avgCompletenessScore}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Campos Faltantes más Comunes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report?.metrics.topMissingFields.map(({ field, count }) => (
                <div key={field} className="flex justify-between">
                  <span>{field}</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Advertencias más Frecuentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report?.metrics.topWarnings.map(({ warning, count }) => (
                <div key={warning} className="flex justify-between">
                  <span>{warning}</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 