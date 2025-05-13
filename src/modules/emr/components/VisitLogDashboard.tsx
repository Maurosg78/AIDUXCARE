import { useState, useEffect  } from 'react';
import { useParams } from 'react-router-dom';
import { Langfuse } from 'langfuse';
import { supabase } from '@/core/lib/supabaseClient';
import { FileText, Mic, File as FilePdf, Database, Clock, ChevronDown, ChevronUp, User } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Tipos de eventos que manejamos
type EventType = 'form.update' | 'audio.review' | 'pdf.export' | 'mcp.context.build';

// Estructura para un evento de log
interface LogEvent {
  id: string;
  timestamp: Date;
  type: EventType;
  userId?: string;
  userName?: string;
  result: string;
  details?: Record<string, any>;
}

// Mapa de iconos por tipo de evento
const eventIcons: Record<EventType, React.ReactNode> = {
  'form.update': <FileText className="w-5 h-5 text-blue-500" />,
  'audio.review': <Mic className="w-5 h-5 text-green-500" />,
  'pdf.export': <FilePdf className="w-5 h-5 text-red-500" />,
  'mcp.context.build': <Database className="w-5 h-5 text-purple-500" />
};

// Títulos descriptivos por tipo de evento
const eventTitles: Record<EventType, string> = {
  'form.update': 'Actualización de formulario clínico',
  'audio.review': 'Revisión de audio',
  'pdf.export': 'Exportación de PDF',
  'mcp.context.build': 'Creación de contexto MCP'
};

// Componente para la chip de tipo de evento
const EventTypeChip: React.FC<{ type: EventType }> = ({ type }) => {
  const bgColors: Record<EventType, string> = {
    'form.update': 'bg-blue-100 text-blue-800',
    'audio.review': 'bg-green-100 text-green-800',
    'pdf.export': 'bg-red-100 text-red-800',
    'mcp.context.build': 'bg-purple-100 text-purple-800'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColors[type]}`}>
      {type}
    </span>
  );
};

const VisitLogDashboard: React.FC = () => {
  const { id: visitId } = useParams<{ id: string }>();
  const [events, setEvents] = useState<LogEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<EventType, boolean>>({
    'form.update': false,
    'audio.review': false,
    'pdf.export': false,
    'mcp.context.build': false
  });

  // Cargar los eventos de Langfuse
  useEffect(() => {
    const fetchEvents = async () => {
      if (!visitId) return;

      setLoading(true);
      try {
        // Inicializar cliente de Langfuse
        const langfuse = new Langfuse({
          publicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
          secretKey: process.env.LANGFUSE_SECRET_KEY || '',
          baseUrl: process.env.LANGFUSE_HOST || 'https://cloud.langfuse.com'
        });

        // Obtener trazas relacionadas con la visita
        const { data: traces } = await langfuse.trace.list({
          metadata: { visitId },
          limit: 100,
        });

        // Transformar trazas a nuestro formato de eventos
        let fetchedEvents: LogEvent[] = [];
        
        if (traces && traces.length > 0) {
          for (const trace of traces) {
            // Obtener observaciones para esta traza
            const { data: observations } = await langfuse.observation.list({
              traceId: trace.id,
              limit: 50
            });

            // Filtrar por tipos de eventos que nos interesan
            const filteredObservations = observations.filter(obs => 
              ['form.update', 'audio.review', 'pdf.export', 'mcp.context.build'].includes(obs.type ?? '')
            );
            
            // Mapear a nuestro formato
            const mappedEvents = await Promise.all(filteredObservations.map(async (event) => {
              let userName = undefined;
              
              // Si hay userId, buscar datos del usuario en Supabase
              if (event.metadata?.userId) {
                const { data } = await supabase
                  .from('users')
                  .select('name, email')
                  .eq('id', event.metadata.userId)
                  .single();
                
                if (data) {
                  userName = data.name || data.email;
                }
              }
              
              return {
                id: event.id,
                timestamp: new Date(event.startTime || Date.now()),
                type: event.type as EventType,
                userId: event.metadata?.userId,
                userName,
                result: getEventResultSummary(event),
                details: event.metadata
              };
            }));
            
            fetchedEvents = [...fetchedEvents, ...mappedEvents];
          }
        } else {
          // Fallback a logs locales
          await tryLoadLocalLogs(visitId);
        }
        
        // Ordenar por timestamp (más reciente primero)
        fetchedEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        
        setEvents(fetchedEvents);
      } catch (err) {
        console.error('Error fetching logs:', err);
        setError('No se pudieron cargar los logs de la visita');
        
        // Intentar cargar logs locales como fallback
        await tryLoadLocalLogs(visitId);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [visitId]);

  // Función para cargar logs locales si fallan los de Langfuse
  const tryLoadLocalLogs = async (visitId: string): Promise<void> => {
    try {
      const response = await fetch(`/logs/visit-${visitId}.json`);
      if (response.ok) {
        const localLogs = await response.json();
        
        // Transformar logs locales a nuestro formato
        const localEvents = localLogs.map((log: any) => ({
          id: log.id || `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(log.timestamp || Date.now()),
          type: log.type as EventType,
          userId: log.userId,
          userName: log.userName,
          result: log.message || 'Sin detalles disponibles',
          details: log.details || {}
        }));
        
        setEvents(localEvents);
      }
    } catch (err) {
      console.error('Error loading local logs:', err);
      // Si también fallan los logs locales, dejamos el error original
    }
  };

  // Función para obtener un resumen del resultado del evento
  const getEventResultSummary = (event: any): string => {
    switch (event.type) {
      case 'form.update':
        const fieldsCount = Object.keys(event.metadata?.fields || {}).length;
        return `${fieldsCount} campo${fieldsCount !== 1 ? 's' : ''} actualizado${fieldsCount !== 1 ? 's' : ''}`;
      
      case 'audio.review':
        return event.metadata?.approved 
          ? 'Audio revisado y aprobado' 
          : 'Audio revisado - requiere cambios';
      
      case 'pdf.export':
        return event.metadata?.signed 
          ? 'PDF exportado y firmado digitalmente' 
          : 'PDF exportado sin firma';
      
      case 'mcp.context.build':
        return `Contexto MCP creado: ${event.metadata?.contextSize || 0} elementos`;
      
      default:
        return event.metadata?.message || 'Evento registrado';
    }
  };

  // Obtener eventos agrupados por tipo
  const getEventsByType = (type: EventType): LogEvent[] => {
    return events.filter(event => event.type === type);
  };

  // Manejar colapso/expansión de grupos
  const toggleGroup = (type: EventType) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  // Renderizar cronología de eventos
  const renderEventTimeline = () => {
    const eventTypes: EventType[] = ['form.update', 'audio.review', 'pdf.export', 'mcp.context.build'];
    
    return (
      <div className="space-y-6">
        {eventTypes.map((type) => {
          const typeEvents = getEventsByType(type);
          const eventCount = typeEvents.length;
          
          if (eventCount === 0) return null;
          
          return (
            <div key={type} className="border rounded-lg shadow-sm overflow-hidden">
              <div 
                className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer hover:bg-gray-100"
                onClick={() => toggleGroup(type)}
              >
                <div className="flex items-center space-x-3">
                  {eventIcons[type]}
                  <h3 className="font-medium">{eventTitles[type]}</h3>
                  <span className="bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {eventCount}
                  </span>
                </div>
                {collapsedGroups[type] ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </div>
              
              {!collapsedGroups[type] && (
                <div className="divide-y divide-gray-200">
                  {typeEvents.map((event) => (
                    <div key={event.id} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-3">
                          <EventTypeChip type={event.type} />
                          <div>
                            <p className="font-medium text-gray-900">{event.result}</p>
                            
                            {event.userName && (
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <User className="w-4 h-4 mr-1" />
                                <span>{event.userName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          <span title={event.timestamp.toISOString()}>
                            {format(event.timestamp, 'dd MMM yyyy, HH:mm', { locale: es })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Registro de Actividad</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-40" role="status">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 text-gray-800 px-4 py-6 rounded text-center">
          No hay eventos registrados para esta visita
        </div>
      ) : (
        renderEventTimeline()
      )}
    </div>
  );
};

export default VisitLogDashboard; 