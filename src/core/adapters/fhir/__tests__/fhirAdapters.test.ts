import { describe, it, expect } from 'vitest';
import { toFhirPatient, fromFhirPatient } from '../patientAdapter';
import { toFhirEncounter, fromFhirEncounter } from '../encounterAdapter';
import type { Patient, Visit  } from '@/core/types';
import type { FhirPatient, FhirEncounter  } from '@/core/types/fhir';

describe('FHIR Adaptadores', () => {
  describe('Adaptador de Paciente', () => {
    it('debe convertir un paciente local a formato FHIR', () => {
      // Paciente de prueba
      const localPatient: Patient = {
        id: '123456',
        firstName: 'Juan',
        lastName: 'Pérez',
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        phone: '+34600123456',
        birthDate: '1980-05-15',
        gender: 'male',
        sex: 'M',
        address: 'Calle Principal 123',
        city: 'Madrid',
        state: 'Madrid',
        postalCode: '28001',
        country: 'España',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-02T00:00:00Z'
      };

      // Convertir a formato FHIR
      const fhirPatient = toFhirPatient(localPatient);

      // Verificar la estructura y valores
      expect(fhirPatient.resourceType).toBe('Patient');
      expect(fhirPatient.id).toBe('123456');
      
      // Verificar nombre
      expect(fhirPatient.name).toHaveLength(1);
      expect(fhirPatient.name?.[0].family).toBe('Pérez');
      expect(fhirPatient.name?.[0].given).toContain('Juan');
      
      // Verificar contactos
      expect(fhirPatient.telecom).toHaveLength(2);
      const phone = fhirPatient.telecom?.find(t => t.system === 'phone');
      const email = fhirPatient.telecom?.find(t => t.system === 'email');
      expect(phone?.value).toBe('+34600123456');
      expect(email?.value).toBe('juan.perez@example.com');
      
      // Verificar género
      expect(fhirPatient.gender).toBe('male');
      
      // Verificar fecha de nacimiento
      expect(fhirPatient.birthDate).toBe('1980-05-15');
      
      // Verificar dirección
      expect(fhirPatient.address).toHaveLength(1);
      expect(fhirPatient.address?.[0].text).toBe('Calle Principal 123');
      expect(fhirPatient.address?.[0].city).toBe('Madrid');
      expect(fhirPatient.address?.[0].state).toBe('Madrid');
      expect(fhirPatient.address?.[0].postalCode).toBe('28001');
      expect(fhirPatient.address?.[0].country).toBe('España');
      
      // Verificar metadata
      expect(fhirPatient.meta?.lastUpdated).toBe('2023-01-02T00:00:00Z');
      expect(fhirPatient.active).toBe(true);
    });

    it('debe manejar datos faltantes en un paciente local', () => {
      // Paciente con datos mínimos
      const minimalPatient: Patient = {
        id: '123456',
        firstName: 'Juan',
        lastName: 'Pérez',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-02T00:00:00Z'
      };

      // Convertir a formato FHIR
      const fhirPatient = toFhirPatient(minimalPatient);

      // Verificaciones
      expect(fhirPatient.resourceType).toBe('Patient');
      expect(fhirPatient.id).toBe('123456');
      expect(fhirPatient.name?.[0].family).toBe('Pérez');
      expect(fhirPatient.name?.[0].given?.[0]).toBe('Juan');
      expect(fhirPatient.telecom).toBeUndefined();
      expect(fhirPatient.address).toBeUndefined();
      expect(fhirPatient.gender).toBe('unknown');
    });

    it('debe poder convertir de FHIR a formato local', () => {
      // Paciente FHIR de ejemplo
      const fhirPatient: FhirPatient = {
        resourceType: 'Patient',
        id: '123456',
        active: true,
        name: [
          {
            use: 'official',
            family: 'Pérez',
            given: ['Juan']
          }
        ],
        telecom: [
          {
            system: 'phone',
            value: '+34600123456',
            use: 'home'
          },
          {
            system: 'email',
            value: 'juan.perez@example.com',
            use: 'home'
          }
        ],
        gender: 'male',
        birthDate: '1980-05-15',
        address: [
          {
            use: 'home',
            text: 'Calle Principal 123',
            city: 'Madrid',
            state: 'Madrid',
            postalCode: '28001',
            country: 'España'
          }
        ],
        meta: {
          lastUpdated: '2023-01-02T00:00:00Z'
        }
      };

      // Convertir de FHIR a local
      const localPatient = fromFhirPatient(fhirPatient);

      // Verificaciones
      expect(localPatient.id).toBe('123456');
      expect(localPatient.firstName).toBe('Juan');
      expect(localPatient.lastName).toBe('Pérez');
      expect(localPatient.name).toBe('Juan Pérez');
      expect(localPatient.email).toBe('juan.perez@example.com');
      expect(localPatient.phone).toBe('+34600123456');
      expect(localPatient.gender).toBe('male');
      expect(localPatient.sex).toBe('M');
      expect(localPatient.birthDate).toBe('1980-05-15');
      expect(localPatient.address).toBe('Calle Principal 123');
      expect(localPatient.city).toBe('Madrid');
      expect(localPatient.state).toBe('Madrid');
      expect(localPatient.postalCode).toBe('28001');
      expect(localPatient.country).toBe('España');
      expect(localPatient.updatedAt).toBe('2023-01-02T00:00:00Z');
    });
  });

  describe('Adaptador de Visita', () => {
    it('debe convertir una visita local a formato FHIR Encounter', () => {
      // Visita de prueba
      const localVisit: Visit = {
        id: 'visit-123',
        patientId: 'patient-456',
        professionalId: 'professional-789',
        date: '2023-06-15T10:00:00Z',
        visitDate: '2023-06-15T10:00:00Z',
        status: 'completed',
        type: 'Fisioterapia',
        visitType: 'Fisioterapia',
        reason: 'Dolor lumbar',
        location: 'Consulta 3',
        notes: 'Paciente con mejora notable',
        updatedAt: '2023-06-15T11:30:00Z',
        createdAt: '2023-06-01T08:00:00Z'
      };

      // Convertir a formato FHIR
      const fhirEncounter = toFhirEncounter(localVisit);

      // Verificaciones
      expect(fhirEncounter.resourceType).toBe('Encounter');
      expect(fhirEncounter.id).toBe('visit-123');
      expect(fhirEncounter.status).toBe('finished');
      
      // Verificar referencia al paciente
      expect(fhirEncounter.subject.reference).toBe('Patient/patient-456');
      
      // Verificar período
      expect(fhirEncounter.period?.start).toBe('2023-06-15T10:00:00Z');
      
      // Verificar tipo
      expect(fhirEncounter.type).toHaveLength(1);
      expect(fhirEncounter.type?.[0].text).toBe('Fisioterapia');
      expect(fhirEncounter.type?.[0].coding?.[0].display).toBe('Fisioterapia');
      
      // Verificar razón
      expect(fhirEncounter.reasonCode).toHaveLength(1);
      expect(fhirEncounter.reasonCode?.[0].text).toBe('Dolor lumbar');
      
      // Verificar profesional
      expect(fhirEncounter.participant).toHaveLength(1);
      expect(fhirEncounter.participant?.[0].individual?.reference).toBe('Practitioner/professional-789');
      
      // Verificar ubicación
      expect(fhirEncounter.location).toHaveLength(1);
      expect(fhirEncounter.location?.[0].location.display).toBe('Consulta 3');
      
      // Verificar proveedor de servicio
      expect(fhirEncounter.serviceProvider?.reference).toBe('Organization/AiDuxCare');
      expect(fhirEncounter.meta?.lastUpdated).toBe('2023-06-15T11:30:00Z');
    });

    it('debe manejar datos faltantes en una visita local', () => {
      // Visita con datos mínimos
      const minimalVisit: Visit = {
        id: 'visit-123',
        patientId: 'patient-456',
        date: '2023-06-15T10:00:00Z',
        status: 'scheduled'
      };

      // Convertir a formato FHIR
      const fhirEncounter = toFhirEncounter(minimalVisit);

      // Verificaciones
      expect(fhirEncounter.resourceType).toBe('Encounter');
      expect(fhirEncounter.id).toBe('visit-123');
      expect(fhirEncounter.status).toBe('planned');
      expect(fhirEncounter.subject.reference).toBe('Patient/patient-456');
      expect(fhirEncounter.period?.start).toBe('2023-06-15T10:00:00Z');
      expect(fhirEncounter.participant).toBeUndefined();
      expect(fhirEncounter.reasonCode).toBeUndefined();
      expect(fhirEncounter.location).toBeUndefined();
    });

    it('debe poder convertir de FHIR Encounter a formato local', () => {
      // Encounter FHIR de ejemplo
      const fhirEncounter: FhirEncounter = {
        resourceType: 'Encounter',
        id: 'visit-123',
        status: 'finished',
        subject: {
          reference: 'Patient/patient-456'
        },
        participant: [
          {
            individual: {
              reference: 'Practitioner/professional-789'
            }
          }
        ],
        period: {
          start: '2023-06-15T10:00:00Z',
          end: '2023-06-15T11:00:00Z'
        },
        reasonCode: [
          {
            text: 'Dolor lumbar'
          }
        ],
        type: [
          {
            text: 'Fisioterapia',
            coding: [
              {
                system: 'http://aiduxcare.com/visit-types',
                code: 'fisioterapia',
                display: 'Fisioterapia'
              }
            ]
          }
        ],
        location: [
          {
            location: {
              reference: 'Location/location-123',
              display: 'Consulta 3'
            },
            status: 'completed'
          }
        ],
        serviceProvider: {
          reference: 'Organization/AiDuxCare',
          display: 'AiDuxCare'
        },
        meta: {
          lastUpdated: '2023-06-15T11:30:00Z'
        }
      };

      // Convertir de FHIR a local
      const localVisit = fromFhirEncounter(fhirEncounter);

      // Verificaciones
      expect(localVisit.id).toBe('visit-123');
      expect(localVisit.patientId).toBe('patient-456');
      expect(localVisit.professionalId).toBe('professional-789');
      expect(localVisit.date).toBe('2023-06-15T10:00:00Z');
      expect(localVisit.visitDate).toBe('2023-06-15T10:00:00Z');
      expect(localVisit.status).toBe('completed');
      expect(localVisit.type).toBe('Fisioterapia');
      expect(localVisit.visitType).toBe('Fisioterapia');
      expect(localVisit.reason).toBe('Dolor lumbar');
      expect(localVisit.location).toBe('Consulta 3');
      expect(localVisit.updatedAt).toBe('2023-06-15T11:30:00Z');
    });
  });
}); 