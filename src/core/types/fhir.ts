/**
 * Definiciones de tipos para recursos FHIR R4
 * Basado en las especificaciones oficiales: https://www.hl7.org/fhir/
 */

// Tipo genérico para referencias a recursos
export interface Reference {
  reference: string;
  display?: string;
}

// Tipo para nombres
export interface HumanName {
  use?: 'usual' | 'official' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden';
  text?: string;
  family?: string;
  given?: string[];
  prefix?: string[];
  suffix?: string[];
  period?: Period;
}

// Tipo para información de contacto
export interface ContactPoint {
  system?: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';
  value?: string;
  use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
  rank?: number;
  period?: Period;
}

// Tipo para direcciones
export interface Address {
  use?: 'home' | 'work' | 'temp' | 'old' | 'billing';
  type?: 'postal' | 'physical' | 'both';
  text?: string;
  line?: string[];
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  period?: Period;
}

// Tipo para períodos de tiempo
export interface Period {
  start?: string;
  end?: string;
}

// Tipo para codificación
export interface CodeableConcept {
  coding?: Coding[];
  text?: string;
}

// Tipo para códigos
export interface Coding {
  system?: string;
  version?: string;
  code?: string;
  display?: string;
  userSelected?: boolean;
}

/**
 * Recurso FHIR Patient (R4)
 * Basado en: https://www.hl7.org/fhir/patient.html
 */
export interface FhirPatient {
  resourceType: 'Patient';
  id?: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
  };
  identifier?: {
    system?: string;
    value?: string;
  }[];
  active?: boolean;
  name?: HumanName[];
  telecom?: ContactPoint[];
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  address?: Address[];
  maritalStatus?: CodeableConcept;
  photo?: {
    contentType?: string;
    url?: string;
  }[];
  contact?: {
    relationship?: CodeableConcept[];
    name?: HumanName;
    telecom?: ContactPoint[];
    address?: Address;
    gender?: 'male' | 'female' | 'other' | 'unknown';
  }[];
  communication?: {
    language?: CodeableConcept;
    preferred?: boolean;
  }[];
  generalPractitioner?: Reference[];
  managingOrganization?: Reference;
}

/**
 * Recurso FHIR Encounter (R4)
 * Basado en: https://www.hl7.org/fhir/encounter.html
 */
export interface FhirEncounter {
  resourceType: 'Encounter';
  id?: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
  };
  identifier?: {
    system?: string;
    value?: string;
  }[];
  status: 'planned' | 'arrived' | 'triaged' | 'in-progress' | 'onleave' | 'finished' | 'cancelled' | 'entered-in-error' | 'unknown';
  class?: Coding;
  type?: CodeableConcept[];
  subject: Reference;
  participant?: {
    type?: CodeableConcept[];
    period?: Period;
    individual?: Reference;
  }[];
  period?: Period;
  reasonCode?: CodeableConcept[];
  diagnosis?: {
    condition: Reference;
    use?: CodeableConcept;
    rank?: number;
  }[];
  location?: {
    location: Reference;
    status?: 'planned' | 'active' | 'reserved' | 'completed';
    period?: Period;
  }[];
  serviceProvider?: Reference;
} 