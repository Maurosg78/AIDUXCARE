import { NextApiRequest, NextApiResponse } from 'next';
import { Langfuse } from 'langfuse-node';
import type { LangfuseTrace, GetTracesOptions  } from '@/types/langfuse.events';
import Papa from 'papaparse';

// Extender la interfaz de Langfuse con métodos adicionales
interface ExtendedLangfuse extends Langfuse {
  getTraces(options: GetTracesOptions): Promise<{ data: LangfuseTrace[] }>;
}

// Extender Langfuse con los métodos necesarios
const langfuse = new Langfuse({
  publicKey: process.env.VITE_LANGFUSE_PUBLIC_KEY || '',
  secretKey: process.env.LANGFUSE_SECRET_KEY || '',
  baseUrl: process.env.VITE_LANGFUSE_BASE_URL || 'https://cloud.langfuse.com'
}) as ExtendedLangfuse;

interface WeeklyReport {
  startDate: string;
  endDate: string;
  totalPatients: number;
  newPatients: number;
  totalVisits: number;
  totalFormUpdates: number;
  totalFeedback: number;
  mostActivePatients: Array<{ patientId: string; eventCount: number }>;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Calcular rango de fechas para la semana pasada
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    const response = await langfuse.getTraces({
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString()
    });

    const traces = response.data || [];
    const patientTraces = new Map<string, LangfuseTrace[]>();
    const patientEvents = new Map<string, number>();
    
    // Agrupar trazas por paciente
    traces.forEach(trace => {
      const patientId = trace.metadata?.patientId;
      if (!patientId) return;
      
      if (!patientTraces.has(patientId)) {
        patientTraces.set(patientId, [trace]);
        patientEvents.set(patientId, 1);
      } else {
        const existingTraces = patientTraces.get(patientId)!;
        
        // Verificar si es una traza más reciente
        if (!existingTraces.some(t => t.id === trace.id)) {
          existingTraces.push(trace);
          patientEvents.set(patientId, (patientEvents.get(patientId) || 0) + 1);
        }
      }
    });

    // Encontrar nuevos pacientes (primera traza dentro del período)
    const allPatientsResponse = await langfuse.getTraces({
      endTime: startDate.toISOString()
    });
    
    const existingPatientIds = new Set<string>();
    allPatientsResponse.data?.forEach(trace => {
      const patientId = trace.metadata?.patientId;
      if (patientId) {
        existingPatientIds.add(patientId);
      }
    });

    // Contar nuevos pacientes
    const newPatients = Array.from(patientTraces.keys()).filter(
      patientId => !existingPatientIds.has(patientId)
    ).length;

    // Obtener pacientes más activos
    const mostActivePatients = Array.from(patientEvents.entries())
      .map(([patientId, eventCount]) => ({ patientId, eventCount }))
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, 5);

    // Contar eventos específicos por nombre
    const totalFormUpdates = traces.filter(t => {
      return typeof t.name === 'string' && t.name === 'form.update';
    }).length;
    
    const totalFeedback = traces.filter(t => {
      return typeof t.name === 'string' && t.name === 'copilot.feedback';
    }).length;

    const totalVisits = traces.filter(t => {
      return typeof t.name === 'string' && t.name.includes('visit');
    }).length;

    const report: WeeklyReport = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalPatients: patientTraces.size,
      newPatients,
      totalVisits,
      totalFormUpdates,
      totalFeedback,
      mostActivePatients
    };

    const format = req.query.format || 'json';

    if (format === 'csv') {
      // Preparar datos para CSV
      const csvData = [
        ['Período', 'Inicio', 'Fin'],
        ['', report.startDate, report.endDate],
        [],
        ['Métricas', 'Valor'],
        ['Total Actualizaciones de Formulario', report.totalFormUpdates],
        ['Total Feedbacks', report.totalFeedback],
        ['Total Visitas', report.totalVisits],
        [],
        ['Pacientes Activos', 'Cantidad'],
        ...report.mostActivePatients.map(({ patientId, eventCount }) => [patientId, eventCount]),
        [],
        ['Nuevos Pacientes', report.newPatients]
      ];

      const csv = Papa.unparse(csvData);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=weekly-report.csv');
      return res.status(200).send(csv);
    }

    res.status(200).json(report);
  } catch (error) {
    console.error('Error al generar reporte semanal:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
} 