/**
 * Datos simulados para estadísticas de impacto clínico
 * Utilizado para visualizar métricas de rendimiento profesional y uso del copiloto IA
 */

export interface MonthlyMetric {
  month: string;
  value: number;
}

export interface ImpactStats {
  professionalId: string;
  totalVisits: number;
  totalSuggestions: number;
  acceptedSuggestions: number;
  modifiedSuggestions: number;
  rejectedSuggestions: number;
  estimatedTimeSaved: number; // en minutos
  preventedAlerts: number;
  suggestionsByType: {
    diagnostico: number;
    evaluacion: number;
    tratamiento: number;
    seguimiento: number;
  };
  monthlySuggestions: MonthlyMetric[];
  monthlyAcceptanceRate: MonthlyMetric[];
  recentActivity: {
    timestamp: string;
    action: string;
    field: string;
    visitId: string;
    patientId: string;
  }[];
}

const mockImpactStats: Record<string, ImpactStats> = {
  'prof-001': {
    professionalId: 'prof-001',
    totalVisits: 124,
    totalSuggestions: 342,
    acceptedSuggestions: 267,
    modifiedSuggestions: 48,
    rejectedSuggestions: 27,
    estimatedTimeSaved: 468, // minutos
    preventedAlerts: 12,
    suggestionsByType: {
      diagnostico: 98,
      evaluacion: 124,
      tratamiento: 87,
      seguimiento: 33
    },
    monthlySuggestions: [
      { month: 'Ene', value: 42 },
      { month: 'Feb', value: 56 },
      { month: 'Mar', value: 48 },
      { month: 'Abr', value: 62 },
      { month: 'May', value: 74 },
      { month: 'Jun', value: 60 }
    ],
    monthlyAcceptanceRate: [
      { month: 'Ene', value: 0.72 },
      { month: 'Feb', value: 0.75 },
      { month: 'Mar', value: 0.79 },
      { month: 'Abr', value: 0.81 },
      { month: 'May', value: 0.83 },
      { month: 'Jun', value: 0.85 }
    ],
    recentActivity: [
      {
        timestamp: new Date(2024, 4, 8, 15, 30).toISOString(),
        action: 'ai_suggestion_accepted',
        field: 'diagnostico',
        visitId: 'visit-101',
        patientId: 'pat-042'
      },
      {
        timestamp: new Date(2024, 4, 8, 14, 15).toISOString(),
        action: 'ai_suggestion_modified',
        field: 'tratamiento',
        visitId: 'visit-100',
        patientId: 'pat-033'
      },
      {
        timestamp: new Date(2024, 4, 8, 11, 45).toISOString(),
        action: 'ai_suggestion_accepted',
        field: 'evaluacion',
        visitId: 'visit-099',
        patientId: 'pat-027'
      },
      {
        timestamp: new Date(2024, 4, 7, 16, 20).toISOString(),
        action: 'ai_suggestion_rejected',
        field: 'tratamiento',
        visitId: 'visit-098',
        patientId: 'pat-018'
      },
      {
        timestamp: new Date(2024, 4, 7, 10, 5).toISOString(),
        action: 'ai_suggestion_accepted',
        field: 'seguimiento',
        visitId: 'visit-097',
        patientId: 'pat-042'
      }
    ]
  },
  'prof-002': {
    professionalId: 'prof-002',
    totalVisits: 86,
    totalSuggestions: 215,
    acceptedSuggestions: 156,
    modifiedSuggestions: 42,
    rejectedSuggestions: 17,
    estimatedTimeSaved: 312, // minutos
    preventedAlerts: 8,
    suggestionsByType: {
      diagnostico: 62,
      evaluacion: 87,
      tratamiento: 54,
      seguimiento: 12
    },
    monthlySuggestions: [
      { month: 'Ene', value: 28 },
      { month: 'Feb', value: 32 },
      { month: 'Mar', value: 36 },
      { month: 'Abr', value: 45 },
      { month: 'May', value: 54 },
      { month: 'Jun', value: 20 }
    ],
    monthlyAcceptanceRate: [
      { month: 'Ene', value: 0.68 },
      { month: 'Feb', value: 0.72 },
      { month: 'Mar', value: 0.75 },
      { month: 'Abr', value: 0.77 },
      { month: 'May', value: 0.78 },
      { month: 'Jun', value: 0.80 }
    ],
    recentActivity: [
      {
        timestamp: new Date(2024, 4, 8, 14, 50).toISOString(),
        action: 'ai_suggestion_accepted',
        field: 'diagnostico',
        visitId: 'visit-086',
        patientId: 'pat-015'
      },
      {
        timestamp: new Date(2024, 4, 8, 12, 30).toISOString(),
        action: 'ai_suggestion_modified',
        field: 'evaluacion',
        visitId: 'visit-085',
        patientId: 'pat-022'
      },
      {
        timestamp: new Date(2024, 4, 8, 10, 15).toISOString(),
        action: 'ai_suggestion_accepted',
        field: 'tratamiento',
        visitId: 'visit-084',
        patientId: 'pat-033'
      }
    ]
  }
};

export default mockImpactStats; 