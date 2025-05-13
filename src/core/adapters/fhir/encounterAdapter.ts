import type { Visit  } from '@/core/types';
import type { FhirEncounter, CodeableConcept, Reference, Period, Coding  } from '@/core/types/fhir';

/**
 * Convierte una visita del modelo local al formato FHIR R4 Encounter
 * @param visit Visita en formato del sistema local
 * @returns Encuentro en formato FHIR R4
 */
export function toFhirEncounter(visit: Visit): FhirEncounter {
  // Crear referencia al paciente
  const subject: Reference = {
    reference: `Patient/${visit.patientId}`
  };

  // Crear período de tiempo
  const period: Period = {
    start: visit.visitDate || visit.date
  };

  // Crear código de razón de la visita (si existe)
  let reasonCode: CodeableConcept[] | undefined;
  if (visit.reason) {
    reasonCode = [
      {
        text: visit.reason
      }
    ];
  }

  // Crear tipos de visita
  let type: CodeableConcept[] | undefined;
  if (visit.type || visit.visitType) {
    type = [
      {
        text: visit.type || visit.visitType || 'Physiotherapy',
        coding: [
          {
            system: 'http://aiduxcare.com/visit-types',
            code: visit.type || visit.visitType || 'physiotherapy',
            display: visit.type || visit.visitType || 'Physiotherapy'
          }
        ]
      }
    ];
  } else {
    // Tipo por defecto si no se proporciona
    type = [
      {
        text: 'Physiotherapy',
        coding: [
          {
            system: 'http://aiduxcare.com/visit-types',
            code: 'physiotherapy',
            display: 'Physiotherapy'
          }
        ]
      }
    ];
  }

  // Crear participante (profesional)
  const participant = visit.professionalId ? [
    {
      individual: {
        reference: `Practitioner/${visit.professionalId}`
      }
    }
  ] : undefined;

  // Mapear estado local a FHIR
  let status: FhirEncounter['status'] = 'unknown';
  switch (visit.status) {
    case 'scheduled':
      status = 'planned';
      break;
    case 'completed':
      status = 'finished';
      break;
    case 'cancelled':
      status = 'cancelled';
      break;
    default:
      status = 'unknown';
  }

  // Crear ubicación (si existe)
  const location = visit.location ? [
    {
      location: {
        reference: `Location/${visit.location}`,
        display: visit.location
      },
      status: 'completed' as 'planned' | 'active' | 'reserved' | 'completed'
    }
  ] : undefined;

  // Crear clase de encuentro
  const encounterClass: Coding = {
    system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
    code: 'AMB',
    display: 'ambulatory'
  };

  // Construir el encuentro FHIR
  const fhirEncounter: FhirEncounter = {
    resourceType: 'Encounter',
    id: visit.id,
    status,
    class: encounterClass,
    type,
    subject,
    participant,
    period,
    reasonCode,
    location,
    serviceProvider: {
      reference: 'Organization/AiDuxCare',
      display: 'AiDuxCare'
    },
    meta: {
      lastUpdated: visit.updatedAt
    }
  };

  return fhirEncounter;
}

/**
 * Convierte un encuentro del formato FHIR R4 al modelo local
 * @param fhirEncounter Encounter en formato FHIR R4
 * @returns Visita en formato del sistema local
 */
export function fromFhirEncounter(fhirEncounter: FhirEncounter): Visit {
  // Extraer el ID del paciente de la referencia
  let patientId = '';
  if (fhirEncounter.subject.reference) {
    const match = fhirEncounter.subject.reference.match(/Patient\/(.+)/);
    if (match && match[1]) {
      patientId = match[1];
    }
  }

  // Extraer el ID del profesional de la referencia (si existe)
  let professionalId: string | undefined;
  if (fhirEncounter.participant && fhirEncounter.participant.length > 0) {
    const practitioner = fhirEncounter.participant[0].individual;
    if (practitioner && practitioner.reference) {
      const match = practitioner.reference.match(/Practitioner\/(.+)/);
      if (match && match[1]) {
        professionalId = match[1];
      }
    }
  }

  // Extraer la razón de la visita (si existe)
  const reason = fhirEncounter.reasonCode && fhirEncounter.reasonCode.length > 0
    ? fhirEncounter.reasonCode[0].text
    : undefined;

  // Extraer el tipo de visita (si existe)
  const visitType = fhirEncounter.type && fhirEncounter.type.length > 0
    ? fhirEncounter.type[0].text
    : undefined;

  // Extraer la ubicación (si existe)
  const location = fhirEncounter.location && fhirEncounter.location.length > 0
    ? fhirEncounter.location[0].location.display
    : undefined;

  // Mapear estado FHIR a local
  let status: 'scheduled' | 'completed' | 'cancelled' = 'scheduled';
  switch (fhirEncounter.status) {
    case 'planned':
    case 'arrived':
    case 'triaged':
    case 'in-progress':
    case 'onleave':
      status = 'scheduled';
      break;
    case 'finished':
      status = 'completed';
      break;
    case 'cancelled':
    case 'entered-in-error':
      status = 'cancelled';
      break;
    default:
      status = 'scheduled';
  }

  // Crear visita local
  const visit: Visit = {
    id: fhirEncounter.id || '',
    patientId,
    professionalId,
    date: fhirEncounter.period?.start || new Date().toISOString(),
    visitDate: fhirEncounter.period?.start,
    status,
    reason,
    type: visitType,
    visitType,
    location,
    notes: fhirEncounter.reasonCode && fhirEncounter.reasonCode.length > 0
      ? fhirEncounter.reasonCode.map(rc => rc.text).join('. ')
      : undefined,
    createdAt: new Date().toISOString(), // No hay equivalente directo en FHIR
    updatedAt: fhirEncounter.meta?.lastUpdated || new Date().toISOString()
  };

  return visit;
} 