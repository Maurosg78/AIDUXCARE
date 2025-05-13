import { useState, useEffect  } from 'react';
import { Langfuse } from 'langfuse';
import { supabase } from '@/core/lib/supabase';
import { User, FileText, Mic, File as FilePdf, Database, AlertCircle, Check, ChevronDown, ChevronUp } from 'lucide-react';

// Enumeración de roles de usuario
enum UserRole {
  ADMIN = 'admin',
  PROFESSIONAL = 'professional', 
  SECRETARY = 'secretary',
  DEVELOPER = 'developer'
}

/**
 * Tipos de eventos que pueden ser auditados
 */
type EventType = 'form.update' | 'audio.review' | 'pdf.export' | 'mcp.context.build';

// Tipo para los objetos de observación de Langfuse
interface Observation {
  id: string;
  type: string;
  startTime?: string;
  metadata?: Record<string, unknown>;
}

// Tipo para las trazas de Langfuse
interface Trace {
  id: string;
  metadata?: Record<string, unknown>;
}

// Tipo para logs locales
interface LogEntry {
  type: string;
  visitId?: string;
  timestamp?: string;
  details?: Record<string, unknown>;
}

/**
 * Información básica del profesional
 */
interface Professional {
  id: string;
  name: string;
  email: string;
  role?: UserRole;
  created_at?: string;
}

/**
 * Resumen de eventos por tipo
 */
interface EventSummary {
  count: number;
  lastActivity: Date | null;
  pendingAudit: number;
}

/**
 * Estadísticas completas de un profesional
 */
interface ProfessionalStats {
  totalVisits: number;
  events: Record<EventType, EventSummary>;
  incompleteVisits: number;
}

/**
 * Dashboard para auditar la actividad de profesionales en el sistema
 */
const ProfessionalAuditDashboard: React.FC = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedProId, setSelectedProId] = useState<string | null>(null);
  const [stats, setStats] = useState<ProfessionalStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Cargar lista de profesionales desde Supabase
  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, email, role, created_at')
          .order('name');

        if (error) {
          throw error;
        }

        setProfessionals(data || []);
        
        // Seleccionar el primer profesional por defecto si hay alguno
        if (data && data.length > 0 && !selectedProId) {
          setSelectedProId(data[0].id);
        }
      } catch (err: unknown) {
        console.error('Error fetching professionals:', err);
        setError('No se pudieron cargar los profesionales del sistema');
      } finally {
        setLoading(false);
      }
    };

    fetchProfessionals();
  }, []);

  // Cargar estadísticas cuando se selecciona un profesional
  useEffect(() => {
    if (!selectedProId) return;

    const fetchUserStats = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Inicializar Langfuse (advertencia: esta inicialización puede variar según la versión de Langfuse)
        const langfuse = new Langfuse({
          publicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
          secretKey: process.env.LANGFUSE_SECRET_KEY || '',
          // Nota: baseUrl está marcado como error de Typescript pero se requiere para la funcionalidad
          baseUrl: process.env.LANGFUSE_HOST || 'https://cloud.langfuse.com'
        } as any); // Usando any aquí como última opción para el tipo de opciones de Langfuse

        // Obtener trazas para este usuario (nota: método list puede variar según la versión de Langfuse)
        const { data: traces = [] } = await (langfuse.trace as any).list({
          metadata: { userId: selectedProId },
          limit: 500, // Un número razonable para analizar
        }) || { data: [] };

        // Si no hay trazas, intentar fallback local
        if (!traces || traces.length === 0) {
          await tryLoadLocalStats(selectedProId);
          return;
        }

        // Conjunto para seguir visitIds únicos
        const visitIds = new Set<string>();
        
        // Contadores por tipo de evento
        const eventStats: Record<EventType, EventSummary> = {
          'form.update': { count: 0, lastActivity: null, pendingAudit: 0 },
          'audio.review': { count: 0, lastActivity: null, pendingAudit: 0 },
          'pdf.export': { count: 0, lastActivity: null, pendingAudit: 0 },
          'mcp.context.build': { count: 0, lastActivity: null, pendingAudit: 0 }
        };
        
        // Visitas sin completar (sin PDF o sin audio validado)
        const incompleteVisits = new Set<string>();
        
        // Procesar cada traza
        for (const trace of traces as Trace[]) {
          // Extraer visitId de los metadatos
          const visitId = trace.metadata?.visitId;
          if (visitId) {
            visitIds.add(visitId.toString());
          }
          
          // Obtener observaciones para esta traza
          const { data: observations = [] } = await (langfuse.observation as any).list({
            traceId: trace.id,
            limit: 50
          }) || { data: [] };
          
          // Procesar cada observación
          if (observations && observations.length > 0) {
            for (const obs of observations as Observation[]) {
              const type = obs.type as EventType;
              
              // Solo contar tipos que nos interesan
              if (type && ['form.update', 'audio.review', 'pdf.export', 'mcp.context.build'].includes(type)) {
                // Incrementar contador
                eventStats[type].count++;
                
                // Actualizar última actividad
                const startTime = new Date(obs.startTime || Date.now());
                if (!eventStats[type].lastActivity || startTime > eventStats[type].lastActivity) {
                  eventStats[type].lastActivity = startTime;
                }
                
                // Marcar visita como incompleta si el audio no está aprobado
                if (type === 'audio.review' && visitId && !obs.metadata?.approved) {
                  incompleteVisits.add(visitId.toString());
                }
              }
            }
            
            // Verificar si la visita no tiene exportación PDF o review de audio
            if (visitId) {
              const hasPdfExport = (observations as Observation[]).some(obs => obs.type === 'pdf.export');
              const hasAudioReview = (observations as Observation[]).some(obs => obs.type === 'audio.review');
              
              if (!hasPdfExport || !hasAudioReview) {
                incompleteVisits.add(visitId.toString());
              }
            }
          }
        }
        
        // Actualizar estadísticas
        setStats({
          totalVisits: visitIds.size,
          events: eventStats,
          incompleteVisits: incompleteVisits.size
        });
      } catch (err: unknown) {
        console.error('Error fetching user stats:', err);
        setError('No se pudieron cargar las estadísticas del profesional');
        
        // Intentar fallback local
        await tryLoadLocalStats(selectedProId);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [selectedProId]);

  // Cargar estadísticas locales como fallback
  const tryLoadLocalStats = async (userId: string): Promise<void> => {
    try {
      const response = await fetch(`/logs/user-${userId}.json`);
      if (!response.ok) throw new Error('No local logs available');
      
      const localLogs = await response.json() as LogEntry[];
      
      // Transformar logs locales a estadísticas
      const visitIds = new Set<string>();
      const incompleteVisits = new Set<string>();
      
      const eventStats: Record<EventType, EventSummary> = {
        'form.update': { count: 0, lastActivity: null, pendingAudit: 0 },
        'audio.review': { count: 0, lastActivity: null, pendingAudit: 0 },
        'pdf.export': { count: 0, lastActivity: null, pendingAudit: 0 },
        'mcp.context.build': { count: 0, lastActivity: null, pendingAudit: 0 }
      };
      
      for (const log of localLogs) {
        const type = log.type as EventType;
        const visitId = log.visitId;
        
        if (visitId) {
          visitIds.add(visitId.toString());
        }
        
        if (type && ['form.update', 'audio.review', 'pdf.export', 'mcp.context.build'].includes(type)) {
          eventStats[type].count++;
          
          const timestamp = new Date(log.timestamp || Date.now());
          if (!eventStats[type].lastActivity || timestamp > eventStats[type].lastActivity) {
            eventStats[type].lastActivity = timestamp;
          }
          
          if (type === 'audio.review' && visitId && !log.details?.approved) {
            incompleteVisits.add(visitId.toString());
          }
        }
      }
      
      // Agregamos visitas sin PDF o sin audio
      for (const visitId of visitIds) {
        const hasAudio = localLogs.some(log => 
          log.visitId === visitId && log.type === 'audio.review');
        const hasPdf = localLogs.some(log => 
          log.visitId === visitId && log.type === 'pdf.export');
          
        if (!hasAudio || !hasPdf) {
          incompleteVisits.add(visitId);
        }
      }
      
      setStats({
        totalVisits: visitIds.size,
        events: eventStats,
        incompleteVisits: incompleteVisits.size
      });
    } catch (err: unknown) {
      console.error('Error loading local stats:', err);
      // Si también fallan los logs locales, mostramos datos vacíos
      setStats({
        totalVisits: 0,
        events: {
          'form.update': { count: 0, lastActivity: null, pendingAudit: 0 },
          'audio.review': { count: 0, lastActivity: null, pendingAudit: 0 },
          'pdf.export': { count: 0, lastActivity: null, pendingAudit: 0 },
          'mcp.context.build': { count: 0, lastActivity: null, pendingAudit: 0 }
        },
        incompleteVisits: 0
      });
    }
  };

  // Cambiar profesional seleccionado
  const handleProfessionalChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProId(event.target.value);
  };

  // Manejar expansión de secciones
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Renderizar selector de profesionales
  const renderProfessionalSelector = () => (
    <div className="mb-6">
      <label htmlFor="professional-select" className="block text-sm font-medium text-gray-700 mb-2">
        Seleccionar Profesional
      </label>
      <select
        id="professional-select"
        className="block w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        value={selectedProId || ''}
        onChange={handleProfessionalChange}
        disabled={loading || professionals.length === 0}
      >
        {professionals.length === 0 ? (
          <option value="">No hay profesionales disponibles</option>
        ) : (
          professionals.map(pro => (
            <option key={pro.id} value={pro.id}>
              {pro.name || pro.email}
            </option>
          ))
        )}
      </select>
    </div>
  );

  // Renderizar estadísticas de usuario
  const renderUserStats = () => {
    if (!stats) return null;

    const eventIcons: Record<EventType, React.ReactNode> = {
      'form.update': <FileText className="w-5 h-5 text-blue-500" />,
      'audio.review': <Mic className="w-5 h-5 text-green-500" />,
      'pdf.export': <FilePdf className="w-5 h-5 text-red-500" />,
      'mcp.context.build': <Database className="w-5 h-5 text-purple-500" />
    };

    const eventTitles: Record<EventType, string> = {
      'form.update': 'Actualización de formularios',
      'audio.review': 'Revisión de audio',
      'pdf.export': 'Exportación de PDF',
      'mcp.context.build': 'Creación de contexto MCP'
    };

    return (
      <div className="space-y-6">
        {/* Visitas totales y visitas incompletas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="rounded-md bg-blue-50 p-3 mr-4">
                <User className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Visitas</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalVisits}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className={`rounded-md p-3 mr-4 ${stats.incompleteVisits > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                {stats.incompleteVisits > 0 ? (
                  <AlertCircle className="h-6 w-6 text-red-500" />
                ) : (
                  <Check className="h-6 w-6 text-green-500" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Visitas Incompletas</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.incompleteVisits}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Estadísticas por tipo de evento */}
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">Actividades por Tipo de Evento</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Resumen de eventos clínicos registrados por este profesional
            </p>
          </div>
          
          <div className="border-t border-gray-200">
            <dl>
              {Object.entries(stats.events).map(([type, data], index) => {
                const eventType = type as EventType;
                return (
                  <div 
                    key={type}
                    className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}
                  >
                    <dt className="flex items-center text-sm font-medium text-gray-500">
                      {eventIcons[eventType]}
                      <span className="ml-2">{eventTitles[eventType]}</span>
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{data.count} eventos</span>
                        <span className="text-gray-500">
                          {data.lastActivity 
                            ? `Última actividad: ${new Date(data.lastActivity).toLocaleDateString('es-ES', {
                                day: '2-digit', month: 'short', year: 'numeric'
                              })}` 
                            : 'Sin actividad registrada'}
                        </span>
                      </div>
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>

        {/* Sección de visitas incompletas */}
        {stats.incompleteVisits > 0 && (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div 
              className="px-4 py-5 sm:px-6 flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection('incomplete')}
            >
              <h3 className="text-lg font-medium text-gray-900">Auditorías Incompletas</h3>
              {expandedSection === 'incomplete' ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </div>
            
            {expandedSection === 'incomplete' && (
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <div className="bg-yellow-50 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Atención requerida
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          Este profesional tiene {stats.incompleteVisits} visitas que requieren acciones adicionales:
                        </p>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>Visitas sin validación de audio</li>
                          <li>Visitas sin exportación a PDF</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-100 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Auditoría por Profesional</h2>
      
      {/* Selector de profesionales */}
      {renderProfessionalSelector()}
      
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
        renderUserStats()
      )}
    </div>
  );
};

export default ProfessionalAuditDashboard; 