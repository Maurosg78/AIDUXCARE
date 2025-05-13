import { useEffect } from 'react';
import { useAuth } from '@/core/context/AuthContext';
import { useNavigate } from 'react-router';
import RiskMonitorDashboard from '@/modules/admin/components/RiskMonitorDashboard';
import { AlertTriangle } from 'lucide-react';

export default function RiskMonitorPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated === false) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated === false) {
    return null;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
          <h1 className="text-2xl font-bold text-slate-900">
            Monitoreo de Riesgos y Alertas Críticas
          </h1>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
        <p className="text-gray-700">
          Este panel muestra las sesiones clínicas con potenciales riesgos administrativos o de calidad.
          Se consideran visitas de riesgo aquellas que presentan omisiones en la validación de checklist, 
          firma digital, exportación de documentos o carga del contexto MCP.
        </p>
      </div>
      
      <RiskMonitorDashboard className="mb-6" />
    </div>
  );
} 