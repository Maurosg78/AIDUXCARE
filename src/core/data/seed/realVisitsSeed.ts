import { v4 as uuidv4 } from 'uuid';
import type { Visit } from '../../schemas/VisitSchema';
import type { Professional } from '../../schemas/ProfessionalSchema';
import { patientsSeed } from './realPatientsSeed';

// IDs fijos para pruebas
export const PATIENT_IDS = {
  ANDREINA: "d290f1ee-6c54-4b01-90e6-d701748f0851",
  JUAN_CARLOS: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  MARIA_ISABEL: "550e8400-e29b-41d4-a716-446655440002"
};

export const PROFESSIONALS = {
  DRA_GARCIA: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    email: "dra.garcia@axonvalencia.es",
    name: "Dra. Ana García"
  },
  DR_MARTINEZ: {
    id: "550e8400-e29b-41d4-a716-446655440001",
    email: "dr.martinez@axonvalencia.es",
    name: "Dr. Luis Martínez"
  },
  DRA_LOPEZ: {
    id: "550e8400-e29b-41d4-a716-446655440003",
    email: "dra.lopez@axonvalencia.es",
    name: "Dra. Carmen López"
  }
};

/**
 * Datos de seed para visitas
 * Contiene información realista para pruebas y desarrollo
 */
export const visitsSeed: Visit[] = [
  {
    id: PATIENT_IDS.ANDREINA,
    patientId: PATIENT_IDS.ANDREINA,
    professionalId: PROFESSIONALS.DRA_GARCIA.id,
    professionalEmail: PROFESSIONALS.DRA_GARCIA.email,
    scheduledDate: "2024-03-15T09:30:00Z",
    duration: 30,
    status: "completed",
    paymentStatus: "paid",
    motivo: "Control de migraña crónica",
    modalidad: "presencial",
    precio: 35,
    previousHistory: true,
    createdAt: "2024-03-15T09:00:00Z",
    updatedAt: "2024-03-15T10:00:00Z",
    notes: "Paciente refiere mejoría parcial con topiramato. Se mantiene frecuencia de 2-3 episodios/semana pero menor intensidad. Sin efectos adversos significativos.",
    metadata: {
      visit_type: "seguimiento",
      duration_minutes: 30,
      location: "Consulta 2",
      follow_up_required: true
    }
  },
  {
    id: PATIENT_IDS.JUAN_CARLOS,
    patientId: PATIENT_IDS.JUAN_CARLOS,
    professionalId: PROFESSIONALS.DR_MARTINEZ.id,
    professionalEmail: PROFESSIONALS.DR_MARTINEZ.email,
    scheduledDate: "2024-03-10T11:20:00Z",
    duration: 20,
    status: "completed",
    paymentStatus: "paid",
    motivo: "Evaluación de temblor esencial",
    modalidad: "presencial",
    precio: 35,
    previousHistory: true,
    createdAt: "2024-03-10T11:00:00Z",
    updatedAt: "2024-03-10T11:40:00Z",
    notes: "Buena respuesta a propranolol 40mg/12h. Temblor notablemente reducido en actividades cotidianas. TA 125/75.",
    metadata: {
      visit_type: "control",
      duration_minutes: 20,
      location: "Consulta 3",
      follow_up_required: true
    }
  },
  {
    id: PATIENT_IDS.MARIA_ISABEL,
    patientId: PATIENT_IDS.MARIA_ISABEL,
    professionalId: PROFESSIONALS.DRA_LOPEZ.id,
    professionalEmail: PROFESSIONALS.DRA_LOPEZ.email,
    scheduledDate: "2024-02-28T16:00:00Z",
    duration: 30,
    status: "completed",
    paymentStatus: "paid",
    motivo: "Control epilepsia focal",
    modalidad: "presencial",
    precio: 35,
    previousHistory: true,
    createdAt: "2024-02-28T15:45:00Z",
    updatedAt: "2024-02-28T16:30:00Z",
    notes: "Sin crisis desde agosto 2023. Niveles de levetiracetam en rango. EEG control sin actividad epileptiforme.",
    metadata: {
      visit_type: "control",
      duration_minutes: 30,
      location: "Consulta 1",
      follow_up_required: true
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