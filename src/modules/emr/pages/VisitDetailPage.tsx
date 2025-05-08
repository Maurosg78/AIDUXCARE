import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Divider, Paper, Button, Alert, Typography } from "@mui/material";
import { Refresh } from "@mui/icons-material";
import AssessmentIcon from '@mui/icons-material/Assessment';
import VisitService, { Visit } from "@/core/services/visit/VisitService";
import { PatientService } from "@/core/services/patient/PatientService";
import EvalTimeline from "@/modules/emr/components/EvalTimeline";
import { StructuredVisitForm } from "@/modules/emr/components/StructuredVisitForm";
import AudioChecklist from "@/components/AudioChecklist";
import { PatientEval } from "@/modules/emr/types/Evaluation";
import { trackEvent } from '@/core/lib/langfuse.client';
import ClinicalCopilotPanel from "@/modules/emr/components/ClinicalCopilotPanel";

const VisitDetailPage: React.FC = () => {
  const { visitId } = useParams<{ visitId: string }>();
  const navigate = useNavigate();
  const [visit, setVisit] = useState<Visit | null>(null);
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<PatientEval>({
    patientId: "",
    traceId: visitId || "",
    motivo: "",
    diagnosticoFisioterapeutico: "",
    tratamientoPropuesto: ""
  });

  useEffect(() => {
    const loadVisitData = async () => {
      try {
        if (!visitId) {
          throw new Error('ID de visita no proporcionado');
        }

        const visitData = await VisitService.getVisitById(visitId);
        if (!visitData) {
          throw new Error('Visita no encontrada');
        }
        setVisit(visitData);

        const patientData = await PatientService.getPatientById(visitData.patientId);
        if (patientData) {
          setPatient(patientData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar la visita');
      } finally {
        setLoading(false);
      }
    };

    loadVisitData();
  }, [visitId]);

  const handleStartVisit = async () => {
    try {
      if (!visit) return;
      
      const updatedVisit = await VisitService.updateVisit(visit.id, {
        status: 'in_progress',
      });
      
      setVisit(updatedVisit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar la visita');
    }
  };

  const handleFormSubmit = async (data: PatientEval) => {
    try {
      // Registrar evento de submit
      await trackEvent({
        name: "form.submit",
        payload: {
          patientId: data.patientId,
          timestamp: new Date().toISOString()
        },
        traceId: data.traceId
      });

      // Actualizar visita
      if (visit) {
        await VisitService.update({
          ...visit,
          motivo: data.motivo,
          diagnosticoFisioterapeutico: data.diagnosticoFisioterapeutico,
          tratamientoPropuesto: data.tratamientoPropuesto
        });
        
        await loadVisitData(); // Recargar datos actualizados
      }
    } catch (error) {
      setError("Error al guardar la visita. Intenta de nuevo.");
      console.error('Error al guardar la visita:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  if (error || !visit || !patient) {
    return (
      <div className="p-4 text-red-600">
        Error: {error || 'No se pudo cargar la información de la visita'}
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold">Visita: {patient.nombre}</h1>
          <span className={`px-3 py-1 rounded-full text-sm ${
            visit.paymentStatus === 'paid' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {visit.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">Información del Paciente</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Nombre:</span> {patient.nombre}</p>
              <p><span className="font-medium">Edad:</span> {patient.edad} años</p>
              <p><span className="font-medium">Email:</span> {patient.email}</p>
              <p><span className="font-medium">Teléfono:</span> {patient.telefono}</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Detalles de la Visita</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Fecha:</span>{' '}
                {new Date(visit.scheduledDate).toLocaleString()}
              </p>
              <p><span className="font-medium">Motivo:</span> {visit.motivo}</p>
              <p><span className="font-medium">Duración:</span> {visit.duration} minutos</p>
              <p>
                <span className="font-medium">Modalidad:</span>{' '}
                {visit.modalidad || 'No especificada'}
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

        {/* Botón para acceder a los registros de auditoría */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => navigate(`/visits/${visitId}/audit-log`)}
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
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleFormSubmit}
        />
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <ClinicalCopilotPanel visit={visit} />
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <h2>🎙️ Validación por Voz</h2>
        <AudioChecklist
          patientId={visit.patientId}
          visitId={visit.id}
          onDataValidated={async (data) => {
            try {
              const updatedData = { ...formData };
              
              data.forEach(({ field, value }) => {
                switch (field) {
                  case 'motivoConsulta':
                    updatedData.motivo = `${updatedData.motivo || ''}\n🔊 ${value}`;
                    break;
                  case 'diagnosticoFisioterapeutico':
                    updatedData.diagnosticoFisioterapeutico = `${updatedData.diagnosticoFisioterapeutico || ''}\n🔊 ${value}`;
                    break;
                  case 'tratamientoPropuesto':
                    updatedData.tratamientoPropuesto = `${updatedData.tratamientoPropuesto || ''}\n🔊 ${value}`;
                    break;
                }
              });

              setFormData(updatedData);
              await handleFormSubmit(updatedData);
            } catch (error) {
              setError("Error al procesar datos de voz. Intenta de nuevo.");
              console.error('Error en validación de voz:', error);
            }
          }}
        />
      </Paper>

      <Divider sx={{ my: 3 }} />
      
      <EvalTimeline patientId={visit.patientId} />
    </div>
  );
};

export default VisitDetailPage;
