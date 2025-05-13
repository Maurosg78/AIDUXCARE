import { useState, useEffect  } from 'react';
import { Langfuse } from 'langfuse';
import { supabase } from '@/core/lib/supabase';
import { AlertCircle, Calendar, Filter, User, CheckCircle, XCircle, FileText, Mic, File as FilePdf, Database, ChevronDown, ChevronUp } from 'lucide-react';
import { format, subWeeks, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';

// Tipos de eventos
type EventType = 'form.update' | 'audio.review' | 'pdf.export' | 'mcp.context.build';

// Tipos de omisiones críticas
type OmissionType = 'checklist' | 'signature' | 'mcp' | 'export';

// Períodos de tiempo para agrupación
type TimePeriod = 'current-week' | 'last-week' | 'current-month' | 'all';

// Estado para cada validación
interface ValidationStatus {
  checked: boolean;
  passed: boolean;
}

// Importación de adaptadores
import type { AdaptedVisit, AdaptedPatient } from '@/types/component-adapters';

// Estructura para una visita con información de riesgo
interface RiskVisit {
  id: string;
  date: Date;
  patientId: string;
  patientName: string;
  professionalId: string;
  professionalName: string;
  validations: {
    checklist: ValidationStatus;  // audio.review + approved
    signature: ValidationStatus;  // pdf.export + signed
    mcp: ValidationStatus;        // mcp.context.build
    export: ValidationStatus;     // pdf.export exists
  };
  riskLevel: 'high' | 'medium' | 'low';
  omissionCount: number;
  visit?: AdaptedVisit;
  patient?: AdaptedPatient;
}

// Agrupación de visitas por profesional
interface GroupedVisits {
  [professionalId: string]: RiskVisit[];
}

// Props para el dashboard
interface RiskMonitorDashboardProps {
  className?: string;
}

const RiskMonitorDashboard: React.FC<RiskMonitorDashboardProps> = ({ className }) => {
  // Estado para almacenar las visitas con riesgos
  const [visits, setVisits] = useState<RiskVisit[]>([]);
  
  // Estados para filtros y agrupaciones
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('current-week');
  const [selectedOmissions, setSelectedOmissions] = useState<OmissionType[]>([]);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  
  // Estados para la UI
  const [professionals, setProfessionals] = useState<{ id: string; name: string }[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [groupedVisits, setGroupedVisits] = useState<GroupedVisits>({});

  // Función para calcular el rango de fechas basado en el período seleccionado
  useEffect(() => {
    const now = new Date();
    let start = null;
    let end = null;
    
    switch (selectedPeriod) {
      case 'current-week':
        start = startOfWeek(now, { locale: es });
        end = endOfWeek(now, { locale: es });
        break;
      case 'last-week':
        start = startOfWeek(subWeeks(now, 1), { locale: es });
        end = endOfWeek(subWeeks(now, 1), { locale: es });
        break;
      case 'current-month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'all':
        start = null;
        end = null;
        break;
    }
    
    setDateRange({ start, end });
  }, [selectedPeriod]);

  // Cargar profesionales desde Supabase
  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name')
          .order('name');
          
        if (error) throw error;
        
        setProfessionals(data || []);
      } catch (err) {
        console.error('Error fetching professionals:', err);
        setError('No se pudieron cargar los profesionales');
      }
    };
    
    fetchProfessionals();
  }, []);

  // Cargar visitas con riesgos
  useEffect(() => {
    const fetchRiskyVisits = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Inicializar cliente de Langfuse
        const langfuse = new Langfuse({
          publicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
          secretKey: process.env.LANGFUSE_SECRET_KEY || '',
          baseUrl: process.env.LANGFUSE_HOST || 'https://cloud.langfuse.com'
        });
        
        // Obtener trazas recientes (con un límite razonable)
        const { data: traces } = await langfuse.trace.list({
          limit: 500, // Un número razonable para analizar
        });
        
        if (!traces || traces.length === 0) {
          await tryLoadLocalVisits();
          return;
        }
        
        // Mapeo para guardar información sobre visitas
        const visitsMap = new Map<string, {
          visitId: string;
          patientId?: string;
          patientName?: string;
          professionalId?: string;
          professionalName?: string;
          date: Date;
          hasChecklist: boolean;
          checklistApproved: boolean;
          hasPdfExport: boolean;
          pdfSigned: boolean;
          hasMcpContext: boolean;
        }>();
        
        // Procesar cada traza para extraer información sobre visitas
        for (const trace of traces) {
          const visitId = trace.metadata?.visitId;
          const patientId = trace.metadata?.patientId;
          const userId = trace.metadata?.userId;
          
          if (!visitId) continue;
          
          // Determinar la fecha de la visita
          const visitDate = trace.metadata?.visitDate
            ? new Date(trace.metadata.visitDate)
            : new Date(trace.startTime || Date.now());
          
          // Inicializar visita si no existe
          if (!visitsMap.has(visitId.toString())) {
            visitsMap.set(visitId.toString(), {
              visitId: visitId.toString(),
              patientId: patientId?.toString(),
              professionalId: userId?.toString(),
              date: visitDate,
              hasChecklist: false,
              checklistApproved: false,
              hasPdfExport: false,
              pdfSigned: false,
              hasMcpContext: false,
            });
          }
          
          // Obtener observaciones para cada traza
          const { data: observations } = await langfuse.observation.list({
            traceId: trace.id,
            limit: 50
          });
          
          if (!observations || observations.length === 0) continue;
          
          // Procesar observaciones para actualizar estado de la visita
          const visit = visitsMap.get(visitId.toString());
          if (!visit) continue;
          
          for (const obs of observations) {
            switch (obs.type) {
              case 'audio.review':
                visit.hasChecklist = true;
                visit.checklistApproved = !!obs.metadata?.approved;
                break;
              case 'pdf.export':
                visit.hasPdfExport = true;
                visit.pdfSigned = !!obs.metadata?.signed;
                break;
              case 'mcp.context.build':
                visit.hasMcpContext = true;
                break;
            }
          }
        }
        
        // Convertir a formato RiskVisit y calcular nivel de riesgo
        const riskyVisits: RiskVisit[] = [];
        
        // Cargar nombres de pacientes y profesionales
        const patientIds = new Set<string>();
        const professionalIds = new Set<string>();
        
        visitsMap.forEach(visit => {
          if (visit.patientId) patientIds.add(visit.patientId);
          if (visit.professionalId) professionalIds.add(visit.professionalId);
        });
        
        // Obtener nombres de pacientes
        const patientNames = await fetchPatientNames(Array.from(patientIds));
        const professionalNames = await fetchProfessionalNames(Array.from(professionalIds));
        
        // Convertir visitas y calcular riesgos
        visitsMap.forEach(visit => {
          // Verificar si la visita está en el rango de fechas seleccionado
          if (dateRange.start && dateRange.end) {
            if (!isWithinInterval(visit.date, { start: dateRange.start, end: dateRange.end })) {
              return; // No incluir esta visita
            }
          }
          
          // Calcular validaciones
          const validations = {
            checklist: { checked: visit.hasChecklist, passed: visit.checklistApproved },
            export: { checked: true, passed: visit.hasPdfExport },
            signature: { checked: visit.hasPdfExport, passed: visit.pdfSigned },
            mcp: { checked: true, passed: visit.hasMcpContext }
          };
          
          // Contar omisiones
          const omissionCount = [
            !validations.checklist.passed,
            !validations.export.passed, 
            !validations.signature.passed,
            !validations.mcp.passed
          ].filter(Boolean).length;
          
          // Determinar nivel de riesgo
          let riskLevel: 'high' | 'medium' | 'low' = 'low';
          if (omissionCount >= 3) {
            riskLevel = 'high';
          } else if (omissionCount >= 1) {
            riskLevel = 'medium';
          }
          
          // Solo incluir visitas con alguna omisión
          if (omissionCount > 0) {
            riskyVisits.push({
              id: visit.visitId,
              date: visit.date,
              patientId: visit.patientId || 'unknown',
              patientName: patientNames[visit.patientId || ''] || 'Paciente desconocido',
              professionalId: visit.professionalId || 'unknown',
              professionalName: professionalNames[visit.professionalId || ''] || 'Profesional desconocido',
              validations,
              riskLevel,
              omissionCount
            });
          }
        });
        
        // Ordenar por fecha (más reciente primero) y nivel de riesgo
        riskyVisits.sort((a, b) => {
          // Primero por nivel de riesgo
          const riskOrder = { high: 0, medium: 1, low: 2 };
          const riskDiff = riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
          if (riskDiff !== 0) return riskDiff;
          
          // Luego por fecha
          return b.date.getTime() - a.date.getTime();
        });
        
        setVisits(riskyVisits);
        
        // Agrupar por profesional
        const grouped: GroupedVisits = {};
        riskyVisits.forEach(visit => {
          if (!grouped[visit.professionalId]) {
            grouped[visit.professionalId] = [];
          }
          grouped[visit.professionalId].push(visit);
        });
        
        setGroupedVisits(grouped);
      } catch (err) {
        console.error('Error fetching risky visits:', err);
        setError('Error al cargar las visitas de riesgo');
        
        // Intentar cargar desde logs locales
        await tryLoadLocalVisits();
      } finally {
        setLoading(false);
      }
    };
    
    fetchRiskyVisits();
  }, [dateRange]);

  // Función para obtener nombres de pacientes
  const fetchPatientNames = async (patientIds: string[]): Promise<Record<string, string>> => {
    if (patientIds.length === 0) return {};
    
    try {
      const { data } = await supabase
        .from('patients')
        .select('id, name')
        .in('id', patientIds);
      
      return (data || []).reduce((acc, patient) => {
        acc[patient.id] = patient.name;
        return acc;
      }, {} as Record<string, string>);
    } catch (err) {
      console.error('Error fetching patient names:', err);
      return {};
    }
  };

  // Función para obtener nombres de profesionales
  const fetchProfessionalNames = async (professionalIds: string[]): Promise<Record<string, string>> => {
    if (professionalIds.length === 0) return {};
    
    try {
      const { data } = await supabase
        .from('users')
        .select('id, name')
        .in('id', professionalIds);
      
      return (data || []).reduce((acc, user) => {
        acc[user.id] = user.name;
        return acc;
      }, {} as Record<string, string>);
    } catch (err) {
      console.error('Error fetching professional names:', err);
      return {};
    }
  };

  // Cargar visitas desde logs locales (fallback)
  const tryLoadLocalVisits = async (): Promise<void> => {
    try {
      // Intento cargar un archivo general de visitas de riesgo
      const response = await fetch('/logs/risky-visits.json');
      if (!response.ok) throw new Error('No local logs available');
      
      const localVisits = await response.json();
      
      // Transformar a formato RiskVisit
      const riskyVisits: RiskVisit[] = localVisits.map((visit: any) => ({
        ...visit,
        date: new Date(visit.date),
        validations: {
          checklist: { 
            checked: true, 
            passed: visit.validations?.checklist?.passed || false 
          },
          export: { 
            checked: true, 
            passed: visit.validations?.export?.passed || false 
          },
          signature: { 
            checked: true, 
            passed: visit.validations?.signature?.passed || false 
          },
          mcp: { 
            checked: true, 
            passed: visit.validations?.mcp?.passed || false 
          }
        }
      }));
      
      // Aplicar filtros de fecha
      const filteredVisits = dateRange.start && dateRange.end 
        ? riskyVisits.filter(visit => 
            isWithinInterval(visit.date, { start: dateRange.start!, end: dateRange.end! })
          )
        : riskyVisits;
      
      setVisits(filteredVisits);
      
      // Agrupar por profesional
      const grouped: GroupedVisits = {};
      filteredVisits.forEach(visit => {
        if (!grouped[visit.professionalId]) {
          grouped[visit.professionalId] = [];
        }
        grouped[visit.professionalId].push(visit);
      });
      
      setGroupedVisits(grouped);
    } catch (err) {
      console.error('Error loading local visits:', err);
      setVisits([]);
      setGroupedVisits({});
    }
  };

  // Cambiar filtro de período
  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
  };

  // Cambiar filtro de profesional
  const handleProfessionalChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProfessional(event.target.value);
  };

  // Manejar cambios en los filtros de omisiones
  const handleOmissionFilterChange = (omission: OmissionType) => {
    setSelectedOmissions(prev => 
      prev.includes(omission) 
        ? prev.filter(o => o !== omission)
        : [...prev, omission]
    );
  };

  // Alternar expansión de un grupo
  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Filtrar visitas según los criterios seleccionados
  const getFilteredVisits = (): RiskVisit[] => {
    let filtered = [...visits];
    
    // Filtrar por profesional
    if (selectedProfessional !== 'all') {
      filtered = filtered.filter(visit => visit.professionalId === selectedProfessional);
    }
    
    // Filtrar por omisiones
    if (selectedOmissions.length > 0) {
      filtered = filtered.filter(visit => 
        selectedOmissions.some(omission => !visit.validations[omission].passed)
      );
    }
    
    return filtered;
  };

  // Componente para mostrar una validación de riesgo
  const ValidationIndicator: React.FC<{ 
    type: OmissionType,
    status: ValidationStatus
  }> = ({ type, status }) => {
    // Iconos y texto por tipo
    const config = {
      checklist: {
        icon: <Mic className="w-5 h-5" />,
        label: 'Checklist',
        tooltip: status.passed ? 'Audio validado' : 'Checklist no validado'
      },
      export: {
        icon: <FilePdf className="w-5 h-5" />,
        label: 'Exportación',
        tooltip: status.passed ? 'PDF exportado' : 'Sin exportación PDF'
      },
      signature: {
        icon: <FileText className="w-5 h-5" />,
        label: 'Firma',
        tooltip: status.passed ? 'Documento firmado' : 'Sin firma digital'
      },
      mcp: {
        icon: <Database className="w-5 h-5" />,
        label: 'MCP',
        tooltip: status.passed ? 'Contexto MCP creado' : 'Sin contexto MCP'
      }
    };
    
    // Colores según el estado
    const colorClass = status.passed 
      ? 'text-green-500 bg-green-50'
      : 'text-red-500 bg-red-50';
      
    return (
      <div className={`flex items-center px-3 py-1 rounded-full ${colorClass}`} title={config[type].tooltip}>
        <div className="mr-1">
          {config[type].icon}
        </div>
        <span className="text-xs font-medium">{config[type].label}</span>
        {status.passed 
          ? <CheckCircle className="w-4 h-4 ml-1" /> 
          : <XCircle className="w-4 h-4 ml-1" />
        }
      </div>
    );
  };

  // Componente para indicador de nivel de riesgo
  const RiskLevelIndicator: React.FC<{ level: 'high' | 'medium' | 'low', count: number }> = ({ level, count }) => {
    const config = {
      high: {
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        label: 'Alto'
      },
      medium: {
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        label: 'Medio'
      },
      low: {
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        label: 'Bajo'
      }
    };
    
    return (
      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config[level].bgColor} ${config[level].textColor}`}>
        <AlertCircle className="w-3 h-3 mr-1" />
        <span>{config[level].label}</span>
        <span className="ml-1">({count})</span>
      </div>
    );
  };

  // Renderizar la sección de filtros
  const renderFilters = () => (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Filtros</h3>
          <div className="flex flex-wrap gap-2">
            {/* Filtro por período */}
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select 
                aria-label="Filtrar por período de tiempo"
                className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                value={selectedPeriod}
                onChange={(e) => handlePeriodChange(e.target.value as TimePeriod)}
              >
                <option value="current-week">Esta semana</option>
                <option value="last-week">Semana anterior</option>
                <option value="current-month">Este mes</option>
                <option value="all">Todo el historial</option>
              </select>
            </div>
            
            {/* Filtro por profesional */}
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-500" />
              <select 
                aria-label="Filtrar por profesional"
                className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                value={selectedProfessional}
                onChange={handleProfessionalChange}
              >
                <option value="all">Todos los profesionales</option>
                {professionals.map(pro => (
                  <option key={pro.id} value={pro.id}>{pro.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Filtros por omisión */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Tipo de omisión</h3>
          <div className="flex flex-wrap gap-2">
            <button
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedOmissions.includes('checklist') 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              onClick={() => handleOmissionFilterChange('checklist')}
            >
              <Mic className="w-3 h-3 mr-1" />
              Sin validación
            </button>
            
            <button
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedOmissions.includes('export') 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              onClick={() => handleOmissionFilterChange('export')}
            >
              <FilePdf className="w-3 h-3 mr-1" />
              Sin exportación
            </button>
            
            <button
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedOmissions.includes('signature') 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              onClick={() => handleOmissionFilterChange('signature')}
            >
              <FileText className="w-3 h-3 mr-1" />
              Sin firma
            </button>
            
            <button
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedOmissions.includes('mcp') 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              onClick={() => handleOmissionFilterChange('mcp')}
            >
              <Database className="w-3 h-3 mr-1" />
              Sin MCP
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Panel de Monitoreo de Riesgos</h2>
      
      {/* Filtros */}
      {renderFilters()}
      
      {/* Estado de carga o error */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      ) : getFilteredVisits().length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-8 rounded-md text-center">
          No hay visitas con omisiones que coincidan con los filtros seleccionados.
        </div>
      ) : (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Profesional / Paciente
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Fecha
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Estado
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Riesgo
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {selectedProfessional === 'all' ? (
                // Mostrar agrupado por profesional
                Object.entries(groupedVisits).map(([professionalId, proVisits]) => {
                  // Aplicar filtros de omisión al grupo
                  const filteredProVisits = selectedOmissions.length > 0
                    ? proVisits.filter(visit => 
                        selectedOmissions.some(omission => !visit.validations[omission].passed)
                      )
                    : proVisits;
                    
                  if (filteredProVisits.length === 0) return null;
                  
                  // Obtener nombre del profesional
                  const professional = professionals.find(p => p.id === professionalId);
                  const professionalName = professional?.name || 'Profesional desconocido';
                  
                  return (
                    <React.Fragment key={professionalId}>
                      {/* Fila de grupo de profesional */}
                      <tr 
                        className="bg-gray-50 cursor-pointer hover:bg-gray-100"
                        onClick={() => toggleGroupExpansion(professionalId)}
                      >
                        <td colSpan={4} className="whitespace-nowrap py-2 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <User className="mr-2 h-5 w-5 text-gray-500" />
                              <span>{professionalName}</span>
                              <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-800">
                                {filteredProVisits.length} {filteredProVisits.length === 1 ? 'visita' : 'visitas'}
                              </span>
                            </div>
                            {expandedGroups[professionalId] ? 
                              <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                              <ChevronDown className="h-5 w-5 text-gray-500" />
                            }
                          </div>
                        </td>
                      </tr>
                      
                      {/* Filas de visitas del profesional (expandibles) */}
                      {expandedGroups[professionalId] && filteredProVisits.map(visit => (
                        <tr key={visit.id} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {visit.patientName}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {format(visit.date, 'dd MMM yyyy', { locale: es })}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500">
                            <div className="flex flex-wrap gap-1">
                              {!visit.validations.checklist.passed && (
                                <ValidationIndicator type="checklist" status={visit.validations.checklist} />
                              )}
                              {!visit.validations.export.passed && (
                                <ValidationIndicator type="export" status={visit.validations.export} />
                              )}
                              {!visit.validations.signature.passed && (
                                <ValidationIndicator type="signature" status={visit.validations.signature} />
                              )}
                              {!visit.validations.mcp.passed && (
                                <ValidationIndicator type="mcp" status={visit.validations.mcp} />
                              )}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <RiskLevelIndicator level={visit.riskLevel} count={visit.omissionCount} />
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })
              ) : (
                // Mostrar solo visitas del profesional seleccionado
                getFilteredVisits().map(visit => (
                  <tr key={visit.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {visit.patientName}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {format(visit.date, 'dd MMM yyyy', { locale: es })}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      <div className="flex flex-wrap gap-1">
                        {!visit.validations.checklist.passed && (
                          <ValidationIndicator type="checklist" status={visit.validations.checklist} />
                        )}
                        {!visit.validations.export.passed && (
                          <ValidationIndicator type="export" status={visit.validations.export} />
                        )}
                        {!visit.validations.signature.passed && (
                          <ValidationIndicator type="signature" status={visit.validations.signature} />
                        )}
                        {!visit.validations.mcp.passed && (
                          <ValidationIndicator type="mcp" status={visit.validations.mcp} />
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <RiskLevelIndicator level={visit.riskLevel} count={visit.omissionCount} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RiskMonitorDashboard; 