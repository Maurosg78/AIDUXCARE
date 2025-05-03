export const DEMO_PATIENT = {
  id: 'demo-onboarding',
  name: 'Caso Simulado - Demo',
  age: 45,
  gender: 'F',
  medicalHistory: {
    conditions: [
      'Hipertensión arterial controlada',
      'Diabetes tipo 2'
    ],
    medications: [
      'Metformina 850mg 2 veces al día',
      'Enalapril 20mg 1 vez al día'
    ],
    allergies: ['Penicilina'],
    lastVisit: '2024-03-15'
  },
  currentSymptoms: {
    chiefComplaint: 'Dolor lumbar de 2 semanas de evolución',
    symptoms: [
      'Dolor en región lumbar baja',
      'Rigidez matutina',
      'Limitación para flexión de tronco'
    ],
    onset: '2024-03-01',
    severity: 'Moderado',
    aggravatingFactors: ['Sedentarismo', 'Mantener posturas prolongadas'],
    relievingFactors: ['Reposo', 'AINEs']
  }
}; 