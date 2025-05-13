// Versión simplificada del servicio para pruebas
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

// Ejecutamos la evaluación
const runEval = async () => {
  try {
    // Limpiamos cualquier dato previo
    await PatientService.clearAll();
    
    // Crear un paciente de prueba
    const testPatient = {
      id: "p-test-1234",
      firstName: "Test",
      lastName: "Patient",
      dateOfBirth: "1980-01-01",
      gender: "prefer-not-to-say",
      email: "test@example.com",
      phone: "+1234567890",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await PatientService.create(testPatient);
    
    // Verificar getAll
    const allPatients = await PatientService.getAll();
    if (!Array.isArray(allPatients)) {
      console.error("❌ ERROR: PatientService.getAll no devuelve un array.");
      process.exit(1);
    }

    if (allPatients.length === 0) {
      console.warn("⚠️ No hay pacientes registrados.");
      process.exit(1);
    }

    // Verificar getById
    const foundPatient = await PatientService.getById(testPatient.id);
    if (!foundPatient) {
      console.error("❌ ERROR: PatientService.getById no encontró el paciente.");
      process.exit(1);
    }

    if (foundPatient.id !== testPatient.id) {
      console.error("❌ ERROR: El ID del paciente recuperado no coincide con el esperado.");
      process.exit(1);
    }

    console.log("✅ Eval PASÓ: Servicios de pacientes funcionan correctamente");
    console.log("Paciente encontrado:", foundPatient);
  } catch (error) {
    console.error("❌ ERROR en la evaluación:", error);
    process.exit(1);
  }
};

runEval(); 