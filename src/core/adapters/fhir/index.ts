/**
 * Adaptadores FHIR para AiDuxCare
 * Facilitan la conversión entre los modelos locales y los recursos FHIR R4
 */

import { toFhirPatient, fromFhirPatient } from './patientAdapter';
import { toFhirEncounter, fromFhirEncounter } from './encounterAdapter';

export {
  // Adaptadores de paciente
  toFhirPatient,
  fromFhirPatient,
  
  // Adaptadores de visita/encuentro
  toFhirEncounter,
  fromFhirEncounter
};

export default {
  patient: {
    toFhir: toFhirPatient,
    fromFhir: fromFhirPatient
  },
  encounter: {
    toFhir: toFhirEncounter,
    fromFhir: fromFhirEncounter
  }
}; 