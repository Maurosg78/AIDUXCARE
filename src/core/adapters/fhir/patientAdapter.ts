import type { Patient  } from '@/core/types';
import type { FhirPatient, ContactPoint, Address, HumanName  } from '@/core/types/fhir';

/**
 * Convierte un paciente del modelo local al formato FHIR R4 Patient
 * @param localPatient Paciente en formato del sistema local
 * @returns Paciente en formato FHIR R4
 */
export function toFhirPatient(localPatient: Patient): FhirPatient {
  // Crear array de nombres (FHIR permite múltiples)
  const name: HumanName[] = [{
    use: 'official',
    family: localPatient.lastName,
    given: [localPatient.firstName]
  }];

  // Crear array de contactos
  const telecom: ContactPoint[] = [];
  
  if (localPatient.phone) {
    telecom.push({
      system: 'phone',
      value: localPatient.phone,
      use: 'home'
    });
  }
  
  if (localPatient.email) {
    telecom.push({
      system: 'email',
      value: localPatient.email,
      use: 'home'
    });
  }

  // Crear array de direcciones
  const address: Address[] = [];
  
  if (localPatient.address) {
    // Crear objeto de dirección con los campos disponibles
    const patientAddress: Address = {
      text: localPatient.address
    };
    
    // Añadir información adicional si está disponible
    if (localPatient.city) patientAddress.city = localPatient.city;
    if (localPatient.state) patientAddress.state = localPatient.state;
    if (localPatient.postalCode) patientAddress.postalCode = localPatient.postalCode;
    if (localPatient.country) patientAddress.country = localPatient.country;
    
    address.push(patientAddress);
  }

  // Mapear género al formato FHIR
  let gender: 'male' | 'female' | 'other' | 'unknown' = 'unknown';
  
  if (localPatient.gender) {
    if (localPatient.gender.toLowerCase() === 'male' || localPatient.gender.toLowerCase() === 'm') {
      gender = 'male';
    } else if (localPatient.gender.toLowerCase() === 'female' || localPatient.gender.toLowerCase() === 'f') {
      gender = 'female';
    } else if (localPatient.gender.toLowerCase() === 'other' || localPatient.gender.toLowerCase() === 'o') {
      gender = 'other';
    }
  } else if (localPatient.sex) {
    // Usar el campo 'sex' como fallback
    if (localPatient.sex === 'M') {
      gender = 'male';
    } else if (localPatient.sex === 'F') {
      gender = 'female';
    } else if (localPatient.sex === 'O') {
      gender = 'other';
    }
  }

  // Construir el paciente FHIR
  const fhirPatient: FhirPatient = {
    resourceType: 'Patient',
    id: localPatient.id,
    name,
    telecom: telecom.length > 0 ? telecom : undefined,
    gender,
    birthDate: localPatient.birthDate,
    address: address.length > 0 ? address : undefined,
    meta: {
      lastUpdated: localPatient.updatedAt
    },
    active: true
  };

  return fhirPatient;
}

/**
 * Convierte un paciente del formato FHIR R4 al modelo local
 * @param fhirPatient Paciente en formato FHIR R4
 * @returns Paciente en formato del sistema local
 */
export function fromFhirPatient(fhirPatient: FhirPatient): Patient {
  // Obtener el nombre del paciente
  const officialName = fhirPatient.name?.find(n => n.use === 'official') || fhirPatient.name?.[0];
  
  // Obtener información de contacto
  const phoneContact = fhirPatient.telecom?.find(t => t.system === 'phone');
  const emailContact = fhirPatient.telecom?.find(t => t.system === 'email');
  
  // Obtener dirección
  const homeAddress = fhirPatient.address?.find(a => a.use === 'home') || fhirPatient.address?.[0];
  
  // Mapear género a formato local
  let sex: 'M' | 'F' | 'O' | undefined;
  let gender: string | undefined;
  
  if (fhirPatient.gender) {
    gender = fhirPatient.gender;
    
    if (fhirPatient.gender === 'male') {
      sex = 'M';
    } else if (fhirPatient.gender === 'female') {
      sex = 'F';
    } else {
      sex = 'O';
    }
  }
  
  // Crear paciente local
  const patient: Patient = {
    id: fhirPatient.id || '',
    firstName: officialName?.given?.[0] || '',
    lastName: officialName?.family || '',
    name: `${officialName?.given?.[0] || ''} ${officialName?.family || ''}`.trim(),
    email: emailContact?.value,
    phone: phoneContact?.value,
    birthDate: fhirPatient.birthDate,
    gender,
    sex,
    address: homeAddress?.text || (homeAddress?.line && homeAddress.line.length > 0 ? homeAddress.line.join(', ') : undefined),
    city: homeAddress?.city,
    state: homeAddress?.state,
    postalCode: homeAddress?.postalCode,
    country: homeAddress?.country,
    createdAt: new Date().toISOString(), // No hay equivalente directo en FHIR
    updatedAt: fhirPatient.meta?.lastUpdated || new Date().toISOString()
  };
  
  return patient;
} 