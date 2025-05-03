import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  XCircleIcon,
  DownloadIcon,
  InformationCircleIcon
} from '@heroicons/react/solid';
import { Tooltip } from '@/components/ui/Tooltip';

interface PatientActivity {
  patientId: string;
  traceId: string;
  lastUpdate: string;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
}

export default function PatientActivityDashboard() {
  const [selectedPatient, setSelectedPatient] = useState<PatientActivity | null>(null);

  const { data, isLoading, error } = useQuery<{ patients: PatientActivity[] }>({
    queryKey: ['patientActivity'],
    queryFn: async () => {
      const response = await fetch('/api/admin/patient-activity');
      if (!response.ok) {
        throw new Error('Error al cargar datos');
      }
      return response.json();
    }
  });

  const getScoreColor = (score: number) => {
    if (score > 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreIcon = (score: number) => {
    if (score > 80) return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
    if (score >= 60) return <ExclamationCircleIcon className="w-6 h-6 text-yellow-500" />;
    return <XCircleIcon className="w-6 h-6 text-red-500" />;
  };

  const downloadEvaluation = (patient: PatientActivity) => {
    const jsonStr = JSON.stringify(patient, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eval-${patient.patientId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <div className="p-4">Cargando actividad de pacientes...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error al cargar datos</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Actividad de Pacientes</h1>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-sm rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID Paciente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Última Actualización
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score de Completitud
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Advertencias
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.patients.map((patient) => (
              <tr key={patient.patientId}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {patient.patientId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(patient.lastUpdate).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getScoreIcon(patient.completenessScore)}
                    <span className={`ml-2 ${getScoreColor(patient.completenessScore)}`}>
                      {patient.completenessScore}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="mr-2">{patient.warnings.length}</span>
                    {patient.warnings.length > 0 && (
                      <Tooltip
                        content={
                          <ul className="list-disc pl-4">
                            {patient.warnings.map((warning, idx) => (
                              <li key={idx}>{warning}</li>
                            ))}
                          </ul>
                        }
                      >
                        <InformationCircleIcon className="w-5 h-5 text-blue-500 cursor-help" />
                      </Tooltip>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => downloadEvaluation(patient)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Descargar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 