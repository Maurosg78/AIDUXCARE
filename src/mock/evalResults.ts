/**
 * Datos simulados para resultados de evaluación clínica
 * Utilizado para mostrar la visualización de resultados procesados por IA
 */

export interface EvalSource {
  name: string;
  year: string;
  url: string;
}

export interface EvalResult {
  id: string;
  patientId: string;
  visitId: string;
  evaluationType: 'diagnostico' | 'evaluacion' | 'tratamiento' | 'seguimiento';
  content: string;
  timestamp: string;
  suggestedByAI: boolean;
  acceptedByProfessional?: boolean;
  confidence?: number;
  sources?: EvalSource[];
}

const mockEvalResults: Record<string, EvalResult[]> = {
  'pat-001': [
    {
      id: 'eval-001',
      patientId: 'pat-001',
      visitId: 'visit-001',
      timestamp: new Date(2024, 4, 1, 10, 30).toISOString(),
      evaluationType: 'diagnostico',
      content: 'Diagnóstico de hipertensión arterial (HTA) esencial. Estadio 1.',
      suggestedByAI: true,
      acceptedByProfessional: true,
      confidence: 0.92,
      sources: [
        {
          name: 'Guía ESC/ESH 2018',
          url: 'https://academic.oup.com/eurheartj/article/39/33/3021/5079119',
          year: '2018'
        }
      ]
    },
    {
      id: 'eval-002',
      patientId: 'pat-001',
      visitId: 'visit-001',
      timestamp: new Date(2024, 4, 1, 10, 35).toISOString(),
      evaluationType: 'tratamiento',
      content: 'Iniciar con Enalapril 5mg cada 12 horas vía oral. Control en 2 semanas.',
      suggestedByAI: true,
      acceptedByProfessional: false,
      confidence: 0.85,
      sources: [
        {
          name: 'Guía ESC/ESH 2018',
          url: 'https://academic.oup.com/eurheartj/article/39/33/3021/5079119',
          year: '2018'
        }
      ]
    },
    {
      id: 'eval-003',
      patientId: 'pat-001',
      visitId: 'visit-001',
      timestamp: new Date(2024, 4, 1, 10, 40).toISOString(),
      evaluationType: 'tratamiento',
      content: 'Iniciar con Losartán 50mg/día vía oral. Control en 2 semanas.',
      suggestedByAI: false,
      acceptedByProfessional: true,
      confidence: 1.0
    }
  ],
  'pat-002': [
    {
      id: 'eval-004',
      patientId: 'pat-002',
      visitId: 'visit-002',
      timestamp: new Date(2024, 4, 2, 9, 15).toISOString(),
      evaluationType: 'evaluacion',
      content: 'Cuadro compatible con migraña sin aura, episódica, de intensidad moderada a severa.',
      suggestedByAI: true,
      acceptedByProfessional: true,
      confidence: 0.89,
      sources: [
        {
          name: 'International Headache Society',
          url: 'https://ichd-3.org/',
          year: '2018'
        }
      ]
    },
    {
      id: 'eval-005',
      patientId: 'pat-002',
      visitId: 'visit-002',
      timestamp: new Date(2024, 4, 2, 9, 25).toISOString(),
      evaluationType: 'diagnostico',
      content: 'Migraña sin aura (G43.0)',
      suggestedByAI: true,
      acceptedByProfessional: true,
      confidence: 0.94
    },
    {
      id: 'eval-006',
      patientId: 'pat-002',
      visitId: 'visit-002',
      timestamp: new Date(2024, 4, 2, 9, 30).toISOString(),
      evaluationType: 'tratamiento',
      content: 'Sumatriptán 50mg para crisis. Amitriptilina 25mg/noche como preventivo.',
      suggestedByAI: true,
      acceptedByProfessional: true,
      confidence: 0.87
    }
  ],
  'pat-003': [
    {
      id: 'eval-007',
      patientId: 'pat-003',
      visitId: 'visit-003',
      timestamp: new Date(2024, 4, 3, 16, 0).toISOString(),
      evaluationType: 'evaluacion',
      content: 'Limitación de movilidad lumbar, dolor que se irradia a extremidad inferior derecha, maniobra de Lasègue positiva.',
      suggestedByAI: false,
      acceptedByProfessional: true,
      confidence: 1.0
    },
    {
      id: 'eval-008',
      patientId: 'pat-003',
      visitId: 'visit-003',
      timestamp: new Date(2024, 4, 3, 16, 10).toISOString(),
      evaluationType: 'diagnostico',
      content: 'Lumbociatalgia derecha por hernia discal L4-L5',
      suggestedByAI: true,
      acceptedByProfessional: true,
      confidence: 0.91,
      sources: [
        {
          name: 'European Spine Journal',
          url: 'https://link.springer.com/article/10.1007/s00586-018-5673-2',
          year: '2018'
        }
      ]
    }
  ]
};

export default mockEvalResults; 