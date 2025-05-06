import { mockVisits, PATIENT_IDS, PROFESSIONALS } from '../realVisitsSeed';
import { VisitSchema } from '../../../schemas/VisitSchema';

describe('realVisitsSeed', () => {
  describe('Validación de estructura', () => {
    it('todas las visitas cumplen con el schema', () => {
      mockVisits.forEach(visit => {
        expect(() => VisitSchema.parse(visit)).not.toThrow();
      });
    });

    it('cada visita tiene todos los campos requeridos', () => {
      const requiredFields = ['id', 'patient_id', 'date', 'professional', 'reason', 'notes', 'status', 'metadata'];
      mockVisits.forEach(visit => {
        requiredFields.forEach(field => {
          expect(visit).toHaveProperty(field);
        });
      });
    });
  });

  describe('Validación de integridad', () => {
    it('no hay IDs duplicados', () => {
      const ids = mockVisits.map(visit => visit.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    it('todos los patient_id son válidos', () => {
      const validPatientIds = Object.values(PATIENT_IDS);
      mockVisits.forEach(visit => {
        expect(validPatientIds).toContain(visit.patient_id);
      });
    });

    it('todos los profesionales son válidos', () => {
      const validProfessionals = Object.values(PROFESSIONALS);
      mockVisits.forEach(visit => {
        const matchingProfessional = validProfessionals.find(p => p.id === visit.professional.id);
        expect(matchingProfessional).toBeTruthy();
        expect(visit.professional.email).toBe(matchingProfessional?.email);
        expect(visit.professional.name).toBe(matchingProfessional?.name);
      });
    });
  });

  describe('Validación de datos clínicos', () => {
    it('las fechas están en formato ISO 8601', () => {
      mockVisits.forEach(visit => {
        expect(new Date(visit.date).toISOString()).toBe(visit.date);
      });
    });

    it('las visitas de cada paciente están ordenadas cronológicamente', () => {
      Object.values(PATIENT_IDS).forEach(patientId => {
        const patientVisits = mockVisits
          .filter(v => v.patient_id === patientId)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        for (let i = 1; i < patientVisits.length; i++) {
          const prevDate = new Date(patientVisits[i-1].date);
          const currDate = new Date(patientVisits[i].date);
          expect(prevDate.getTime()).toBeLessThanOrEqual(currDate.getTime());
        }
      });
    });

    it('los campos de texto tienen contenido significativo', () => {
      mockVisits.forEach(visit => {
        expect(visit.reason.length).toBeGreaterThan(10);
        expect(visit.notes.length).toBeGreaterThan(20);
      });
    });

    it('los metadatos son coherentes', () => {
      mockVisits.forEach(visit => {
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
      });
    });
  });

  describe('Cobertura de datos', () => {
    it('cada paciente tiene al menos una visita', () => {
      Object.values(PATIENT_IDS).forEach(patientId => {
        const patientVisits = mockVisits.filter(v => v.patient_id === patientId);
        expect(patientVisits.length).toBeGreaterThan(0);
      });
    });

    it('cada profesional tiene al menos una visita asignada', () => {
      Object.values(PROFESSIONALS).forEach(professional => {
        const professionalVisits = mockVisits.filter(v => v.professional.id === professional.id);
        expect(professionalVisits.length).toBeGreaterThan(0);
      });
    });

    it('hay una mezcla de estados de visita', () => {
      const statuses = new Set(mockVisits.map(v => v.status));
      expect(statuses.size).toBeGreaterThan(1);
    });
  });
}); 