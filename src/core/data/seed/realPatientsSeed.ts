import { v4 as uuidv4 } from 'uuid';
import type { Patient } from '../../schemas/PatientSchema';

/**
 * Datos de seed para pacientes
 * Contiene información realista para pruebas y desarrollo
 */
export const patientsSeed: Patient[] = [
  {
    id: uuidv4(),
    full_name: "Andreina Martínez López",
    birth_date: "1988-05-15T00:00:00Z",
    sex: "F",
    email: "andreina.martinez@gmail.com",
    clinical_history: [
      "Migraña crónica desde 2023",
      "Respuesta parcial a topiramato",
      "Sin alergias conocidas",
      "Antecedentes familiares de migraña"
    ],
    tags: ["migraña", "cefalea", "neurología"],
    status: "active",
    created_at: "2023-12-01T10:00:00Z",
    updated_at: "2024-03-15T15:30:00Z"
  },
  {
    id: uuidv4(),
    full_name: "Juan Carlos Pérez Ruiz",
    birth_date: "1965-08-23T00:00:00Z",
    sex: "M",
    email: "jcperez@outlook.com",
    clinical_history: [
      "Temblor esencial diagnosticado en 2022",
      "Buena respuesta a propranolol",
      "Hipertensión arterial controlada",
      "Antecedente de colecistectomía en 2018"
    ],
    tags: ["temblor esencial", "hipertensión", "neurología"],
    status: "active",
    created_at: "2024-01-10T09:15:00Z",
    updated_at: "2024-03-10T11:20:00Z"
  },
  {
    id: uuidv4(),
    full_name: "María Isabel Sánchez García",
    birth_date: "1992-11-30T00:00:00Z",
    sex: "F",
    clinical_history: [
      "Epilepsia focal desde 2015",
      "Control adecuado con levetiracetam",
      "Última crisis: agosto 2023",
      "Resonancia magnética normal (2023)"
    ],
    tags: ["epilepsia", "neurología"],
    status: "active",
    created_at: "2023-09-20T14:45:00Z",
    updated_at: "2024-02-28T16:00:00Z"
  }
]; 