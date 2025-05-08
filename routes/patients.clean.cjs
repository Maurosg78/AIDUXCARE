const express = require('express');
const router = express.Router();

console.log('⚠️ Usando datos mockeados para la API de pacientes (versión limpia)');

// Base de datos en memoria para pacientes
const mockPatients = [
  { id: 'pat-001', nombre: 'Juan Pérez', edad: 45, email: 'juan@example.com' },
  { id: 'pat-002', nombre: 'María López', edad: 38, email: 'maria@example.com' }
];

// GET /api/patients - Obtener todos los pacientes
router.get('/', (req, res) => {
  res.json({ success: true, data: mockPatients });
});

// GET /api/patients/:id - Obtener un paciente por ID
router.get('/:id', (req, res) => {
  const patient = mockPatients.find(p => p.id === req.params.id);
  if (!patient) {
    return res.status(404).json({ success: false, message: 'Paciente no encontrado' });
  }
  res.json({ success: true, data: patient });
});

// POST /api/patients - Crear un nuevo paciente
router.post('/', (req, res) => {
  const newPatient = {
    id: 'pat-' + Date.now(),
    ...req.body
  };
  mockPatients.push(newPatient);
  res.status(201).json({ success: true, data: newPatient });
});

module.exports = router; 