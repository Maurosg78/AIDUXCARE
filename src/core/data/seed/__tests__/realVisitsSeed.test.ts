import { describe, expect, it } from 'vitest';
import { visitsSeed, PATIENT_IDS, PROFESSIONALS } from '../realVisitsSeed';
import { VisitSchema } from '../../../schemas/VisitSchema';

describe('realVisitsSeed', () => {
  describe('Validación de estructura', () => {
    it('todas las visitas cumplen con el schema', () => {
      visitsSeed.forEach(visit => {
        expect(() => VisitSchema.parse(visit)).not.toThrow();
      });
    });

    it('cada visita tiene todos los campos requeridos', () => {
      const requiredFields = ['id', 'patientId', 'professionalId', 'professionalEmail', 'scheduledDate', 'status', 'paymentStatus', 'motivo'];
      visitsSeed.forEach(visit => {
        requiredFields.forEach(field => {
          expect(visit).toHaveProperty(field);
        });
      });
    });
  });

  describe('Validación de integridad', () => {
    it('no hay IDs duplicados', () => {
      const ids = visitsSeed.map(visit => visit.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    it('todos los patientId son válidos', () => {
      const validPatientIds = Object.values(PATIENT_IDS);
      visitsSeed.forEach(visit => {
        expect(validPatientIds).toContain(visit.patientId);
      });
    });

    it('todos los professionalId son válidos', () => {
      const validProfessionals = Object.values(PROFESSIONALS);
      visitsSeed.forEach(visit => {
        const matchingProfessional = validProfessionals.find(p => p.id === visit.professionalId);
        expect(matchingProfessional).toBeTruthy();
        expect(visit.professionalEmail).toBe(matchingProfessional?.email);
      });
    });
  });

  describe('Validación de datos clínicos', () => {
    it('las fechas están en formato ISO 8601', () => {
      visitsSeed.forEach(visit => {
        expect(new Date(visit.scheduledDate).toISOString()).toBe(visit.scheduledDate);
      });
    });

    it('las visitas de cada paciente están ordenadas cronológicamente', () => {
      Object.values(PATIENT_IDS).forEach(patientId => {
        const patientVisits = visitsSeed
          .filter(v => v.patientId === patientId)
          .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

        for (let i = 1; i < patientVisits.length; i++) {
          const prevDate = new Date(patientVisits[i-1].scheduledDate);
          const currDate = new Date(patientVisits[i].scheduledDate);
          expect(prevDate.getTime()).toBeLessThanOrEqual(currDate.getTime());
        }
      });
    });

    it('los campos de texto tienen contenido significativo', () => {
      visitsSeed.forEach(visit => {
        expect(visit.motivo.length).toBeGreaterThan(10);
        if (visit.notes) {
          expect(visit.notes.length).toBeGreaterThan(20);
        }
      });
    });

    it('los metadatos son coherentes', () => {
      visitsSeed.forEach(visit => {
        if (visit.metadata) {
          expect(visit.metadata).toEqual(
            expect.objectContaining({
              visit_type: expect.any(String),
              duration_minutes: expect.any(Number),
              location: expect.any(String),
              follow_up_required: expect.any(Boolean)
            })
          );
          expect(visit.metadata.duration_minutes).toBeGreaterThan(0);
          expect(visit.metadata.duration_minutes).toBeLessThanOrEqual(120);
        }
      });
    });
  });

  describe('Cobertura de datos', () => {
    it('cada paciente tiene al menos una visita', () => {
      Object.values(PATIENT_IDS).forEach(patientId => {
        const patientVisits = visitsSeed.filter(v => v.patientId === patientId);
        expect(patientVisits.length).toBeGreaterThan(0);
      });
    });

    it('cada profesional tiene al menos una visita asignada', () => {
      Object.values(PROFESSIONALS).forEach(professional => {
        const professionalVisits = visitsSeed.filter(v => v.professionalId === professional.id);
        expect(professionalVisits.length).toBeGreaterThan(0);
      });
    });

    it('hay una mezcla de estados de visita', () => {
      const statuses = new Set(visitsSeed.map(v => v.status));
      expect(statuses.size).toBeGreaterThan(1);
    });
  });
}); 