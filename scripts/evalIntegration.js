// Servicio de pacientes para pruebas
const PatientService = {
  patients: [],

  async getAll() {
    return this.patients;
  },

  async getById(id) {
    return this.patients.find(patient => patient.id === id);
  },

  async create(patient) {
    this.patients.push(patient);
    return patient;
  },

  async clearAll() {
    this.patients = [];
  }
};

// Servicio de visitas para pruebas
const VisitService = {
  visits: [],

  async getAll() {
    return this.visits;
  },

  async getByPatientId(patientId) {
    return this.visits.filter(visit => visit.patientId === patientId);
  },

  async create(visit) {
    this.visits.push(visit);
    return visit;
  },

  async clearAll() {
    this.visits = [];
  }
};

// Ejecutamos la evaluación de integración
const runIntegrationEval = async () => {
  try {
    // Limpiamos datos previos
    await PatientService.clearAll();
    await VisitService.clearAll();
    
    // 1. Crear varios pacientes
    const patients = [
      {
        id: "p-1001",
        firstName: "Juan",
        lastName: "Pérez",
        dateOfBirth: "1985-05-12",
        gender: "male",
        email: "juan@example.com",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "p-1002",
        firstName: "María",
        lastName: "González",
        dateOfBirth: "1990-10-08",
        gender: "female",
        email: "maria@example.com",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    for (const patient of patients) {
      await PatientService.create(patient);
    }
    
    // 2. Crear varias visitas para diferentes pacientes
    const visits = [
      {
        id: "v-2001",
        patientId: "p-1001",
        visitDate: "2025-03-15T10:00:00Z",
        visitType: "initial",
        status: "completed",
        notes: "Primera consulta"
      },
      {
        id: "v-2002",
        patientId: "p-1001",
        visitDate: "2025-03-22T11:30:00Z",
        visitType: "follow-up",
        status: "completed",
        notes: "Seguimiento"
      },
      {
        id: "v-2003",
        patientId: "p-1002",
        visitDate: "2025-03-18T09:00:00Z",
        visitType: "initial",
        status: "completed",
        notes: "Primera evaluación"
      }
    ];
    
    for (const visit of visits) {
      await VisitService.create(visit);
    }
    
    // 3. Verificar recuperación de visitas por paciente
    const juanVisits = await VisitService.getByPatientId("p-1001");
    if (!Array.isArray(juanVisits) || juanVisits.length !== 2) {
      console.error(`❌ ERROR: Juan debería tener 2 visitas, pero tiene ${juanVisits.length}`);
      process.exit(1);
    }
    
    const mariaVisits = await VisitService.getByPatientId("p-1002");
    if (!Array.isArray(mariaVisits) || mariaVisits.length !== 1) {
      console.error(`❌ ERROR: María debería tener 1 visita, pero tiene ${mariaVisits.length}`);
      process.exit(1);
    }
    
    // 4. Verificar que no hay visitas para pacientes inexistentes
    const noVisits = await VisitService.getByPatientId("non-existent");
    if (!Array.isArray(noVisits) || noVisits.length !== 0) {
      console.error(`❌ ERROR: Un paciente inexistente no debería tener visitas`);
      process.exit(1);
    }
    
    console.log("✅ Eval de integración PASÓ: Relación entre pacientes y visitas funciona correctamente");
    console.log(`Pacientes creados: ${patients.length}`);
    console.log(`Visitas creadas: ${visits.length}`);
    console.log(`Visitas de Juan: ${juanVisits.length}`);
    console.log(`Visitas de María: ${mariaVisits.length}`);
  } catch (error) {
    console.error("❌ ERROR en la evaluación de integración:", error);
    process.exit(1);
  }
};

runIntegrationEval(); 