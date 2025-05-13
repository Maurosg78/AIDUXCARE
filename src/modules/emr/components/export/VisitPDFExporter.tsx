import { useState  } from 'react';
import { Box, Button, Snackbar, Alert, CircularProgress, Tooltip, Typography } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VerifiedIcon from '@mui/icons-material/Verified';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExportService from '@/core/services/export/ExportService';
import type { Visit, Patient, User, PatientEval  } from '@/core/types';
import { useSession } from '@/core/hooks/useSession';

// Tipo más flexible para permitir compatibilidad entre diferentes versiones de Visit
type VisitLike = {
  id: string;
  patientId: string;
  date: string;
  status: string;
  [key: string]: any;
};

// Tipo más flexible para evaluaciones
type EvaluationLike = {
  patientId: string;
  [key: string]: any;
};

interface VisitPDFExporterProps {
  visit: VisitLike;
  patient: Patient;
  evaluation?: EvaluationLike;
  onExportStart?: () => void;
  onExportComplete?: () => void;
  onExportError?: (error: Error) => void;
  buttonText?: string;
  className?: string;
}

/**
 * Componente para exportar una visita a PDF
 * 
 * @param props - Propiedades del componente
 * @returns Componente React
 */
const VisitPDFExporter: React.FC<VisitPDFExporterProps> = ({
  visit,
  patient,
  evaluation,
  onExportStart,
  onExportComplete,
  onExportError,
  buttonText = 'Exportar PDF',
  className
}) => {
  const { session } = useSession();
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [lastSignatureInfo, setLastSignatureInfo] = useState<{
    hash?: string;
    timestamp?: string;
    success?: boolean;
  } | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Verificar si el usuario actual tiene permisos para exportar
  const canExport = session?.user?.role === 'professional' || session?.user?.role === 'admin';

  /**
   * Gestiona la exportación a PDF
   */
  const handleExport = async () => {
    if (!canExport || !session?.user) {
      setSnackbar({
        open: true,
        message: 'No tienes permisos para exportar esta visita',
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      
      // Notificar inicio de exportación
      onExportStart?.();
      
      // Crear el profesional a partir de la sesión
      const professional: User = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role
      };
      
      // Normalizar la visita para cumplir con la interfaz Visit
      const normalizedVisit: Visit = {
        id: visit.id,
        patientId: visit.patientId,
        date: visit.date,
        status: visit.status as 'scheduled' | 'completed' | 'cancelled',
        professionalId: visit.professionalId || professional.id,
        updatedAt: visit.updatedAt || new Date().toISOString(),
        createdAt: visit.createdAt || new Date().toISOString(),
      };
      
      // Normalizar la evaluación (si existe)
      const normalizedEvaluation = evaluation ? {
        visitId: visit.id,
        ...evaluation
      } as PatientEval : undefined;
      
      // Generar el PDF con firma digital
      console.log(`Generando PDF para visita ${visit.id} (${patient.firstName} ${patient.lastName})`);
      const pdfBytes = await ExportService.generateVisitPDF(
        normalizedVisit, 
        patient, 
        professional, 
        normalizedEvaluation,
        true // Habilitar firma digital
      );
      
      // Crear un blob con los bytes del PDF
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      // Crear URL para el blob
      const url = URL.createObjectURL(blob);
      
      // Crear elemento <a> para la descarga
      const link = document.createElement('a');
      link.href = url;
      link.download = `Visita_${visit.id}.pdf`;
      
      // Simular clic en el enlace para iniciar la descarga
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Verificar la firma recién creada
      const verificationResult = await ExportService.verifyDocumentSignature(
        normalizedVisit.id,
        pdfBytes
      );
      
      if (verificationResult.valid && verificationResult.signature) {
        // Guardar información de la firma
        setLastSignatureInfo({
          hash: verificationResult.signature.hash,
          timestamp: verificationResult.signature.created_at,
          success: true
        });
        
        // Mostrar mensaje de éxito con información de firma
        setSnackbar({
          open: true,
          message: 'PDF generado, firmado digitalmente y descargado correctamente',
          severity: 'success'
        });
      } else {
        // Guardar información de error de firma
        setLastSignatureInfo({
          success: false
        });
        
        // Mostrar mensaje de éxito pero con advertencia sobre firma
        setSnackbar({
          open: true,
          message: 'PDF generado y descargado, pero no se pudo verificar la firma digital',
          severity: 'warning'
        });
      }
      
      console.log(`PDF generado y descargado: Visita_${visit.id}.pdf`);
      
      // Notificar finalización
      onExportComplete?.();
    } catch (error) {
      console.error('Error al exportar la visita a PDF:', error);
      
      // Mostrar mensaje de error
      setSnackbar({
        open: true,
        message: 'Error al generar el PDF. Inténtalo de nuevo.',
        severity: 'error'
      });
      
      // Notificar error
      if (error instanceof Error) {
        onExportError?.(error);
      } else {
        onExportError?.(new Error('Error desconocido al exportar PDF'));
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verificar una firma digital desde un archivo PDF subido por el usuario
   */
  const handleVerifySignature = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    try {
      setVerifyLoading(true);
      
      // Leer el archivo PDF
      const file = files[0];
      const fileData = await file.arrayBuffer();
      const fileBytes = new Uint8Array(fileData);
      
      // Verificar la firma
      const verificationResult = await ExportService.verifyDocumentSignature(
        visit.id,
        fileBytes
      );
      
      if (verificationResult.valid && verificationResult.signature) {
        // Guardar información de la firma verificada
        setLastSignatureInfo({
          hash: verificationResult.signature.hash,
          timestamp: verificationResult.signature.created_at,
          success: true
        });
        
        // Mostrar mensaje de éxito
        setSnackbar({
          open: true,
          message: 'El documento es auténtico y su firma digital es válida',
          severity: 'success'
        });
      } else {
        // Guardar información de error
        setLastSignatureInfo({
          success: false
        });
        
        // Mostrar mensaje de error
        setSnackbar({
          open: true,
          message: verificationResult.error || 'El documento no tiene una firma digital válida',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error al verificar firma digital:', error);
      
      // Mostrar mensaje de error
      setSnackbar({
        open: true,
        message: 'Error al verificar la firma digital. Inténtalo de nuevo.',
        severity: 'error'
      });
    } finally {
      setVerifyLoading(false);
      // Limpiar el input de archivo
      event.target.value = '';
    }
  };

  // Si el usuario no tiene permisos, no mostrar el botón
  if (!canExport) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PictureAsPdfIcon />}
          onClick={handleExport}
          disabled={loading || verifyLoading}
          className={className}
          sx={{
            backgroundColor: '#1976d2',
            '&:hover': {
              backgroundColor: '#1565c0',
            }
          }}
        >
          {loading ? 'Generando...' : buttonText}
        </Button>
        
        {/* Botón para verificar firma */}
        <Tooltip title="Verificar autenticidad de un documento PDF">
          <Button
            variant="outlined"
            color="secondary"
            component="label"
            startIcon={verifyLoading ? <CircularProgress size={20} color="inherit" /> : <VerifiedIcon />}
            disabled={loading || verifyLoading}
            sx={{ ml: 1 }}
          >
            {verifyLoading ? 'Verificando...' : 'Verificar PDF'}
            <input
              type="file"
              accept=".pdf"
              hidden
              onChange={handleVerifySignature}
              onClick={(e) => {
                // Permitir seleccionar el mismo archivo varias veces
                (e.target as HTMLInputElement).value = '';
              }}
            />
          </Button>
        </Tooltip>
        
        {lastSignatureInfo && (
          <Tooltip
            title={
              lastSignatureInfo.success
                ? `Documento firmado digitalmente el ${new Date(lastSignatureInfo.timestamp || '').toLocaleString()}. 
                   Hash: ${lastSignatureInfo.hash}`
                : 'No se ha podido verificar la firma digital del documento'
            }
          >
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
              <InfoOutlinedIcon
                color={lastSignatureInfo.success ? 'success' : 'warning'}
                fontSize="small"
              />
              <Typography variant="caption" sx={{ ml: 0.5 }}>
                {lastSignatureInfo.success ? 'Firmado digitalmente' : 'Sin firma verificada'}
              </Typography>
            </Box>
          </Tooltip>
        )}
      </Box>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VisitPDFExporter; 