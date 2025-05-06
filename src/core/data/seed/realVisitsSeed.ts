import type { Visit } from '../../schemas/VisitSchema';
import { patientsSeed } from './realPatientsSeed';

/**
 * Datos de seed para visitas
 * Contiene información realista para pruebas y desarrollo
 */
export const visitsSeed: Visit[] = [
  {
    id: "d290f1ee-6c54-4b01-90e6-d701748f0851", // UUID fijo para pruebas
    patient_id: patientsSeed[0].id, // Andreina
    date: "2024-03-15T09:30:00Z",
    professional: {
      id: "550e8400-e29b-41d4-a716-446655440000",
      email: "dra.garcia@axonvalencia.es",
      name: "Dra. Ana García"
    },
    reason: "Control de migraña crónica",
    notes: "Paciente refiere mejoría parcial con topiramato. Se mantiene frecuencia de 2-3 episodios/semana pero menor intensidad. Sin efectos adversos significativos.",
    status: "completed",
    metadata: {
      visit_type: "seguimiento",
      duration_minutes: 30,
      follow_up_required: true
    }
  },
  {
    id: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    patient_id: patientsSeed[1].id, // Juan Carlos
    date: "2024-03-10T11:20:00Z",
    professional: {
      id: "550e8400-e29b-41d4-a716-446655440001",
      email: "dr.martinez@axonvalencia.es",
      name: "Dr. Luis Martínez"
    },
    reason: "Evaluación de temblor esencial",
    notes: "Buena respuesta a propranolol 40mg/12h. Temblor notablemente reducido en actividades cotidianas. TA 125/75.",
    status: "completed",
    metadata: {
      visit_type: "control",
      duration_minutes: 20,
      follow_up_required: true,
      location: "Consulta 3"
    }
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    patient_id: patientsSeed[2].id, // María Isabel
    date: "2024-02-28T16:00:00Z",
    professional: {
      id: "550e8400-e29b-41d4-a716-446655440003",
      email: "dra.lopez@axonvalencia.es",
      name: "Dra. Carmen López"
    },
    reason: "Control epilepsia focal",
    notes: "Sin crisis desde agosto 2023. Niveles de levetiracetam en rango. EEG control sin actividad epileptiforme.",
    status: "completed",
    metadata: {
      visit_type: "control",
      duration_minutes: 30,
      follow_up_required: true,
      location: "Consulta 1"
    }
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    patient_id: patientsSeed[0].id, // Andreina - próxima visita
    date: "2024-04-15T10:00:00Z",
    professional: {
      id: "550e8400-e29b-41d4-a716-446655440005",
      email: "dra.garcia@axonvalencia.es",
      name: "Dra. Ana García"
    },
    reason: "Seguimiento migraña",
    notes: "Pendiente evaluar respuesta a ajuste de dosis de topiramato.",
    status: "pending",
    metadata: {
      visit_type: "seguimiento",
      duration_minutes: 30,
      follow_up_required: true,
      location: "Consulta 2"
    }
  }
];

// Función para logging en desarrollo
if (process.env.NODE_ENV === 'development') {
  const uniquePatients = new Set(visitsSeed.map(visit => visit.patient_id));
  console.log('\n🏥 Seed de Visitas Clínicas:');
  console.log(`✅ Cargadas ${visitsSeed.length} visitas de ${uniquePatients.size} pacientes`);
  console.log('📊 Resumen de casos:');
  console.log('- Migraña crónica (seguimiento farmacológico)');
  console.log('- Temblor esencial (ajuste de tratamiento)');
  console.log('- Epilepsia (control evolutivo)');
  
  // Mostrar IDs de visitas
  console.log('\n🔑 IDs de visitas disponibles:');
  visitsSeed.forEach((visit, index) => {
    console.log(`${index + 1}. ${visit.id} (${visit.reason})`);
  });
  console.log('\n');
} 