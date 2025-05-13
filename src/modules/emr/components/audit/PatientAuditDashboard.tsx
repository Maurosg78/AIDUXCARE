import { useState, useEffect  } from 'react';
import { useParams } from 'react-router-dom';
import { Langfuse } from 'langfuse';
import { supabase } from '@/core/lib/supabase';
import { FileText, Mic, File as FilePdf, Database, Calendar, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Tipos
type EventType = 'form.update' | 'audio.review' | 'pdf.export' | 'mcp.context.build';

interface Patient {
  id: string;
  name: string;
  birthDate?: string;
  email?: string;
  gender?: string;
}

interface VisitSummary {
  id: string;
  date: Date;
  hasAudioReview: boolean;
  isAudioApproved: boolean;
  hasPdfExport: boolean;
  isPdfSigned: boolean;
  hasMcpContext: boolean;
  events: EventSummary[];
}

interface EventSummary {
  id: string;
  type: EventType;
  timestamp: Date;
  details?: Record<string, any>;
}

// Agrupar visitas por año
interface VisitsByYear {
  [year: string]: VisitSummary[];
}

const PatientAuditDashboard: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visitsByYear, setVisitsByYear] = useState<VisitsByYear>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedVisits, setExpandedVisits] = useState<Record<string, boolean>>({});
  const [expandedYears, setExpandedYears] = useState<Record<string, boolean>>({});

  // Cargar datos del paciente
  useEffect(() => {
    const fetchPatientData = async () => {
      if (!patientId) return;

      setLoading(true);
      setError(null);
      
      try {
        // Obtener datos básicos del paciente
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select('id, name, birthDate, email, gender')
          .eq('id', patientId)
          .single();

        if (patientError) throw patientError;
        
        if (!patientData) {
          setError('No se encontró el paciente solicitado');
          setLoading(false);
          return;
        }
        
        setPatient(patientData);
        
        // Inicializar Langfuse
        const langfuse = new Langfuse({
          publicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
          secretKey: process.env.LANGFUSE_SECRET_KEY || '',
          baseUrl: process.env.LANGFUSE_HOST || 'https://cloud.langfuse.com'
        });

        // Obtener trazas relacionadas con el paciente
        const { data: traces } = await langfuse.trace.list({
          metadata: { patientId },
          limit: 500, // Un número razonable para historial
        });

        // Si no hay trazas, intentar fallback local
        if (!traces || traces.length === 0) {
          await tryLoadLocalVisits(patientId);
          return;
        }

        // Procesar visitas desde las trazas
        const visitsMap = new Map<string, VisitSummary>();
        
        for (const trace of traces) {
          // Extraer visitId de los metadatos
          const visitId = trace.metadata?.visitId;
          if (!visitId) continue;
          
          // Obtener fecha de la visita (del metadato o de la traza)
          const visitDate = trace.metadata?.visitDate
            ? new Date(trace.metadata.visitDate)
            : new Date(trace.startTime || Date.now());
          
          // Inicializar visita si no existe
          if (!visitsMap.has(visitId.toString())) {
            visitsMap.set(visitId.toString(), {
              id: visitId.toString(),
              date: visitDate,
              hasAudioReview: false,
              isAudioApproved: false,
              hasPdfExport: false,
              isPdfSigned: false,
              hasMcpContext: false,
              events: []
            });
          }
          
          // Obtener observaciones para esta traza
          const { data: observations } = await langfuse.observation.list({
            traceId: trace.id,
            limit: 100
          });
          
          if (!observations) continue;
          
          // Procesar observaciones
          for (const obs of observations) {
            if (!obs.type) continue;
            
            const type = obs.type as EventType;
            const visitSummary = visitsMap.get(visitId.toString());
            
            if (!visitSummary) continue;
            
            // Guardar evento
            if (['form.update', 'audio.review', 'pdf.export', 'mcp.context.build'].includes(type)) {
              visitSummary.events.push({
                id: obs.id,
                type: type,
                timestamp: new Date(obs.startTime || Date.now()),
                details: obs.metadata
              });
              
              // Actualizar flags específicos
              switch (type) {
                case 'audio.review':
                  visitSummary.hasAudioReview = true;
                  visitSummary.isAudioApproved = !!obs.metadata?.approved;
                  break;
                case 'pdf.export':
                  visitSummary.hasPdfExport = true;
                  visitSummary.isPdfSigned = !!obs.metadata?.signed;
                  break;
                case 'mcp.context.build':
                  visitSummary.hasMcpContext = true;
                  break;
              }
            }
          }
        }
        
        // Agrupar visitas por año
        const groupedVisits: VisitsByYear = {};
        
        // Convertir el Map a Array, ordenarlo por fecha y agrupar
        Array.from(visitsMap.values())
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .forEach(visit => {
            const year = visit.date.getFullYear().toString();
            if (!groupedVisits[year]) {
              groupedVisits[year] = [];
              // Expandir el año actual por defecto
              setExpandedYears(prev => ({ ...prev, [year]: true }));
            }
            groupedVisits[year].push(visit);
          });
          
        setVisitsByYear(groupedVisits);
      } catch (err: any) {
        console.error('Error fetching patient data:', err);
        setError('Error al cargar el historial del paciente');
        
        // Intentar fallback local
        if (patientId) {
          await tryLoadLocalVisits(patientId);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId]);

  // Cargar visitas locales como fallback
  const tryLoadLocalVisits = async (patientId: string): Promise<void> => {
    try {
      // Primero intentamos cargar los datos del paciente
      const patientResponse = await fetch(`/logs/patient-${patientId}.json`);
      if (patientResponse.ok) {
        const patientData = await patientResponse.json();
        setPatient(patientData);
      }
      
      // Luego cargamos las visitas de logs locales
      const response = await fetch(`/logs/patient-visits-${patientId}.json`);
      if (!response.ok) throw new Error('No local logs available');
      
      const localVisits = await response.json();
      
      // Procesamiento similar al flujo principal
      const groupedVisits: VisitsByYear = {};
      
      for (const visit of localVisits) {
        const visitDate = new Date(visit.date);
        const year = visitDate.getFullYear().toString();
        
        if (!groupedVisits[year]) {
          groupedVisits[year] = [];
          // Expandir el año actual por defecto
          setExpandedYears(prev => ({ ...prev, [year]: true }));
        }
        
        groupedVisits[year].push({
          ...visit,
          date: visitDate,
          events: (visit.events || []).map((event: any) => ({
            ...event,
            timestamp: new Date(event.timestamp)
          }))
        });
      }
      
      // Ordenar visitas dentro de cada año (más recientes primero)
      Object.keys(groupedVisits).forEach(year => {
        groupedVisits[year].sort((a, b) => b.date.getTime() - a.date.getTime());
      });
      
      setVisitsByYear(groupedVisits);
    } catch (err) {
      console.error('Error loading local visits:', err);
      
      // Si no hay datos locales, mostrar estado vacío
      if (!patient) {
        setPatient({
          id: patientId || 'unknown',
          name: 'Paciente no encontrado',
          email: 'No disponible'
        });
      }
      
      setVisitsByYear({});
    }
  };

  // Manejar expansión de visitas
  const toggleVisit = (visitId: string) => {
    setExpandedVisits(prev => ({
      ...prev,
      [visitId]: !prev[visitId]
    }));
  };

  // Manejar expansión de años
  const toggleYear = (year: string) => {
    setExpandedYears(prev => ({
      ...prev,
      [year]: !prev[year]
    }));
  };

  // Renderizar cabecera del paciente
  const renderPatientHeader = () => {
    if (!patient) return null;
    
    return (
      <div className="bg-white shadow sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex justify-between">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {patient.name}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {patient.email || 'Email no disponible'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Fecha de nacimiento</p>
              <p className="text-sm font-medium text-gray-900">
                {patient.birthDate 
                  ? format(new Date(patient.birthDate), 'dd/MM/yyyy')
                  : 'No disponible'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar indicador de estado
  const renderStatusIndicator = (
    condition: boolean | undefined,
    isRequired: boolean = true,
    label: string
  ) => {
    if (condition === undefined) {
      return (
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-gray-400" />
          <span className="ml-2 text-gray-500">Dato no disponible</span>
        </div>
      );
    }
    
    if (condition) {
      return (
        <div className="flex items-center">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="ml-2 text-green-700">{label}</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center">
        <XCircle className="w-5 h-5 text-red-500" />
        <span className="ml-2 text-red-700">{isRequired ? `Falta ${label.toLowerCase()}` : `Sin ${label.toLowerCase()}`}</span>
      </div>
    );
  };

  // Renderizar lista de visitas por año
  const renderVisitsByYear = () => {
    if (Object.keys(visitsByYear).length === 0) {
      return (
        <div className="bg-gray-50 border border-gray-200 text-gray-800 px-4 py-6 rounded text-center">
          No hay visitas registradas para este paciente
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {Object.entries(visitsByYear)
          .sort(([yearA], [yearB]) => parseInt(yearB) - parseInt(yearA))
          .map(([year, visits]) => (
            <div key={year} className="border rounded-lg shadow-sm overflow-hidden">
              <div 
                className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer hover:bg-gray-100"
                onClick={() => toggleYear(year)}
              >
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <h3 className="font-medium text-gray-800">Año {year}</h3>
                  <span className="bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {visits.length} visita{visits.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {expandedYears[year] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
              
              {expandedYears[year] && (
                <div className="divide-y divide-gray-200">
                  {visits.map((visit) => (
                    <div key={visit.id} className="bg-white">
                      <div 
                        className="p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleVisit(visit.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">
                              Visita {format(visit.date, 'dd MMM yyyy', { locale: es })}
                            </p>
                            <p className="text-sm text-gray-500">
                              ID: {visit.id}
                            </p>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-500">
                            {expandedVisits[visit.id] ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </div>
                        
                        {/* Badges de estado (visible siempre) */}
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                          {renderStatusIndicator(visit.isAudioApproved, true, 'Audio validado')}
                          {renderStatusIndicator(visit.isPdfSigned, true, 'PDF firmado')}
                          {renderStatusIndicator(visit.hasMcpContext, false, 'Contexto MCP')}
                        </div>
                      </div>
                      
                      {/* Eventos detallados (expandibles) */}
                      {expandedVisits[visit.id] && (
                        <div className="px-4 pb-4 pt-1">
                          <div className="border-t border-gray-200 pt-3">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                              Detalles de eventos
                            </h4>
                            
                            {visit.events.length === 0 ? (
                              <p className="text-sm text-gray-500">No hay eventos detallados disponibles</p>
                            ) : (
                              <ul className="space-y-2">
                                {visit.events
                                  .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                                  .map(event => {
                                    const eventIcons: Record<EventType, React.ReactNode> = {
                                      'form.update': <FileText className="w-4 h-4 text-blue-500" />,
                                      'audio.review': <Mic className="w-4 h-4 text-green-500" />,
                                      'pdf.export': <FilePdf className="w-4 h-4 text-red-500" />,
                                      'mcp.context.build': <Database className="w-4 h-4 text-purple-500" />
                                    };
                                    
                                    const eventLabels: Record<EventType, string> = {
                                      'form.update': 'Actualización de formulario',
                                      'audio.review': 'Revisión de audio',
                                      'pdf.export': 'Exportación de PDF',
                                      'mcp.context.build': 'Creación de contexto MCP'
                                    };
                                    
                                    return (
                                      <li key={event.id} className="text-sm">
                                        <div className="flex items-center">
                                          {eventIcons[event.type]}
                                          <span className="ml-2 font-medium">{eventLabels[event.type]}</span>
                                          <span className="ml-2 text-gray-500">
                                            {format(event.timestamp, 'dd MMM yyyy, HH:mm', { locale: es })}
                                          </span>
                                        </div>
                                        
                                        {event.type === 'audio.review' && (
                                          <div className="ml-6 mt-1">
                                            {event.details?.approved 
                                              ? <span className="text-green-600">✓ Audio aprobado</span>
                                              : <span className="text-red-600">✗ Audio rechazado</span>
                                            }
                                          </div>
                                        )}
                                        
                                        {event.type === 'pdf.export' && (
                                          <div className="ml-6 mt-1">
                                            {event.details?.signed 
                                              ? <span className="text-green-600">✓ Documento firmado digitalmente</span>
                                              : <span className="text-yellow-600">⚠ Documento sin firma digital</span>
                                            }
                                          </div>
                                        )}
                                      </li>
                                    );
                                  })
                                }
                              </ul>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
      </div>
    );
  };

  return (
    <div className="bg-gray-100 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Historial de Visitas del Paciente</h2>
      
      {/* Datos del paciente */}
      {renderPatientHeader()}
      
      {/* Cargando o error */}
      {loading ? (
        <div className="flex justify-center items-center h-40" role="status">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      ) : (
        renderVisitsByYear()
      )}
    </div>
  );
};

export default PatientAuditDashboard; 