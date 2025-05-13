import { useEffect, useState  } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Divider, Paper, Button, Typography, CircularProgress } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EvalTimeline from '@/modules/emr/components/EvalTimeline';
import StructuredVisitForm from '@/modules/emr/components/StructuredVisitForm';
import AudioChecklist from '@/modules/emr/components/AudioChecklist';
import ClinicalCopilotPanel from '@/modules/emr/components/ClinicalCopilotPanel';
import VisitPDFExporter from '@/modules/emr/components/export/VisitPDFExporter';

// Tipos locales para compatibilidad
interface Visit {
  id: string;
  patientId: string;
  scheduledDate: string;
  date?: string;
  duration: number;
  status: string;
  paymentStatus: string;
  motivo?: string;
  modalidad?: string;
  diagnosticoFisioterapeutico?: string;
  tratamientoPropuesto?: string;
}

interface Patient {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  dateOfBirth?: string | Date;
  birthDate?: string | Date;
  contactInfo?: {
    email?: string;
    phone?: string;
  };
}

interface ClinicalEvaluation {
  id: string;
  patientId: string;
  visitId: string;
  date?: string;
  status?: string;
  sections?: Record<string, unknown>;
}

interface PatientEval {
  patientId: string;
  traceId: string;
  motivo?: string;
  diagnosticoFisioterapeutico?: string;
  tratamientoPropuesto?: string;
}

interface VisitDetailPageProps {
  visitService: {
    getVisit(id: string): Promise<Visit>;
    updateVisit(id: string, data: Partial<Visit>): Promise<Visit>;
  };
  evaluationService: {
    getEvaluation(visitId: string): Promise<ClinicalEvaluation>;
    updateEvaluation(visitId: string, data: Partial<ClinicalEvaluation>): Promise<ClinicalEvaluation>;
  };
}

const VisitDetailPage: React.FC<VisitDetailPageProps> = ({ visitService, evaluationService }) => {
  const { visitId } = useParams<{ visitId: string }>();
  const navigate = useNavigate();

  // Función auxiliar para navegación
  const goBack = () => {
    // Usar type assertion para compatibilidad
    navigate(-1 as unknown as string);
  };

  const [visit, setVisit] = useState<Visit | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [evaluation, setEvaluation] = useState<ClinicalEvaluation | null>(null);
  const [formData, setFormData] = useState<PatientEval>({
    patientId: '',
    traceId: visitId ?? '',
    motivo: '',
    diagnosticoFisioterapeutico: '',
    tratamientoPropuesto: '',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadVisitData = async (): Promise<void> => {
    try {
      if (!visitId) throw new Error('ID de visita no proporcionado');

      const [visitData, evalData] = await Promise.all([
        visitService.getVisit(visitId),
        evaluationService.getEvaluation(visitId),
      ]);
      setVisit(visitData);
      setEvaluation(evalData);

      const patientData = await import('@/core/services/patient/PatientService')
        .then(mod => mod.PatientService.getPatientById(visitData.patientId));
      if (patientData) setPatient(patientData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la visita');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisitData();
  }, [visitId, visitService, evaluationService]);

  const handleStartVisit = async (): Promise<void> => {
    if (!visit) return;
    try {
      const updated = await visitService.updateVisit(visit.id, { status: 'in_progress' });
      setVisit(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar la visita');
    }
  };

  const handleFormSubmit = async (data: PatientEval): Promise<void> => {
    if (!visit) return;
    try {
      const updateData: Partial<Visit> = {
        motivo: data.motivo,
        diagnosticoFisioterapeutico: data.diagnosticoFisioterapeutico,
        tratamientoPropuesto: data.tratamientoPropuesto,
      };
      await visitService.updateVisit(visit.id, updateData);
      await loadVisitData();
    } catch {
      setError('Error al guardar la visita. Intenta de nuevo.');
    }
  };

  const handleSaveEvaluation = async (data: Partial<ClinicalEvaluation>): Promise<void> => {
    if (!visitId) return;
    try {
      setLoading(true);
      const updatedEval = await evaluationService.updateEvaluation(visitId, data);
      setEvaluation(updatedEval);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la evaluación');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !visit || !patient || !evaluation) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error" gutterBottom>
          {error ?? 'No se pudo cargar la información de la visita'}
        </Typography>
        <Button variant="contained" onClick={goBack}>
          Volver
        </Button>
      </Box>
    );
  }

  // Tratar visitId como string para evitar errores de tipo
  const visitIdString = visitId ? String(visitId) : '';

  const evaluationData: PatientEval = {
    patientId: patient.id,
    traceId: visitIdString,
    motivo: formData.motivo,
    diagnosticoFisioterapeutico: formData.diagnosticoFisioterapeutico,
    tratamientoPropuesto: formData.tratamientoPropuesto,
  };

  // Adaptación para manejar diferentes estructuras de datos de Patient
  const adaptedPatient = {
    ...patient,
    // Asegurarnos de tener nombre completo aunque venga de diferentes fuentes
    name: patient.name || 
      ((patient.firstName || '') + ' ' + (patient.lastName || '')).trim(),
    // Asegurarnos de tener fecha de nacimiento
    dateOfBirth: patient.dateOfBirth || patient.birthDate,
    // Asegurarnos de tener datos de contacto
    email: patient.email || (patient.contactInfo?.email) || 'No disponible',
    phone: patient.phone || patient.phoneNumber || (patient.contactInfo?.phone) || 'No disponible'
  };

  // Calcular edad con manejo seguro de tipos
  const calculateAge = (): number => {
    if (!adaptedPatient.dateOfBirth) return 0;
    
    const birthYear = typeof adaptedPatient.dateOfBirth === 'string' 
      ? new Date(adaptedPatient.dateOfBirth).getFullYear() 
      : adaptedPatient.dateOfBirth.getFullYear();
      
    return new Date().getFullYear() - birthYear;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <button
          onClick={() => navigate('/professional/dashboard')}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Volver al dashboard
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold">Visita: {adaptedPatient.name}</h1>
          <span
            className={`px-3 py-1 rounded-full text-sm ${
              visit.paymentStatus === 'paid'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {visit.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">Información del Paciente</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Nombre:</span> {adaptedPatient.name}
              </p>
              <p>
                <span className="font-medium">Edad:</span> {calculateAge()} años
              </p>
              <p>
                <span className="font-medium">Email:</span> {adaptedPatient.email}
              </p>
              <p>
                <span className="font-medium">Teléfono:</span> {adaptedPatient.phone}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Detalles de la Visita</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Fecha:</span>{' '}
                {new Date(visit.scheduledDate).toLocaleString()}
              </p>
              <p>
                <span className="font-medium">Motivo:</span> {visit.motivo}
              </p>
              <p>
                <span className="font-medium">Duración:</span> {visit.duration} minutos
              </p>
              <p>
                <span className="font-medium">Modalidad:</span>{' '}
                {visit.modalidad ?? 'No especificada'}
              </p>
            </div>
          </div>
        </div>

        {visit.status === 'scheduled' && (
          <div className="mt-6">
            <button
              onClick={handleStartVisit}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Iniciar Visita
            </button>
          </div>
        )}

        {visit.status === 'in_progress' && (
          <div className="mt-6 p-4 bg-yellow-50 rounded">
            <p className="text-yellow-800">
              Visita en progreso. Use el formulario de evaluación para registrar la consulta.
            </p>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <VisitPDFExporter
            visit={{ ...visit, date: visit.scheduledDate }}
            patient={adaptedPatient}
            evaluation={evaluationData}
            buttonText="Exportar PDF"
          />

          <button
            onClick={() => navigate(`/visits/${visitIdString}/audit-log`)}
            className="flex items-center bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
          >
            <AssessmentIcon className="mr-2" fontSize="small" />
            Ver Registros de Auditoría
          </button>
        </div>
      </div>

      <Divider sx={{ my: 3 }} />

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <h2>📝 Formulario Estructurado</h2>
        <StructuredVisitForm
          visitId={visitIdString}
          onSave={handleSaveEvaluation}
          onCancel={goBack}
          initialData={evaluation}
        />
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <ClinicalCopilotPanel
          visit={{
            ...visit,
            visitDate: visit.scheduledDate,
            visitType: visit.modalidad ?? 'Consulta',
            date: visit.scheduledDate,
          }}
        />
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <h2>🎙️ Validación por Voz</h2>
        <AudioChecklist
          patientId={visit.patientId}
          visitId={visit.id}
          onDataValidated={async (
            data: Array<{ field: string; value: string }>
          ): Promise<void> => {
            const updated = { ...formData };
            data.forEach(({ field, value }) => {
              if (field === 'motivoConsulta') {
                updated.motivo = `${updated.motivo}\n🔊 ${value}`;
              } else if (field === 'diagnosticoFisioterapeutico') {
                updated.diagnosticoFisioterapeutico = `${updated.diagnosticoFisioterapeutico}\n🔊 ${value}`;
              } else if (field === 'tratamientoPropuesto') {
                updated.tratamientoPropuesto = `${updated.tratamientoPropuesto}\n🔊 ${value}`;
              }
            });
            setFormData(updated);
            await handleFormSubmit(updated);
          }}
        />
      </Paper>

      <Divider sx={{ my: 3 }} />

      <Paper elevation={2} sx={{ p: 3 }}>
        <h2>📋 Historial de Evaluaciones</h2>
        <EvalTimeline patientId={visit.patientId} />
      </Paper>
    </div>
  );
};

export default VisitDetailPage;
