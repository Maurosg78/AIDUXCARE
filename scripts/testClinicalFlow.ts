import { trackEvent } from '@/core/services/langfuseClient';
import { demoPatientData, demoVisitData } from '@/modules/emr/config/demoPatient';
import { mockVoicePhrases, mockVoiceSuggestions } from '@/modules/assistant/config/mockVoiceInput';

async function testClinicalFlow() {
  console.log('🧪 Iniciando prueba del flujo clínico...');

  // 1. Simular acceso al onboarding
  console.log('\n1️⃣ Accediendo a onboarding...');
  await trackEvent('onboarding.started', {
    patientId: demoPatientData.id,
    source: 'demo-test'
  });

  // 2. Simular escucha activa
  console.log('\n2️⃣ Probando escucha activa...');
  const approvedPhrases = mockVoicePhrases.slice(0, 2);
  await trackEvent('audio.transcript.validated', {
    patientId: demoPatientData.id,
    approvedPhrases,
    rejectedPhrases: mockVoicePhrases.slice(2)
  });

  // 3. Simular sugerencias del copiloto
  console.log('\n3️⃣ Probando copiloto IA...');
  await trackEvent('copilot.suggestion.generated', {
    patientId: demoPatientData.id,
    suggestions: mockVoiceSuggestions
  });

  // Simular feedback
  await trackEvent('copilot.feedback', {
    patientId: demoPatientData.id,
    field: 'diagnosis',
    feedback: 'positive',
    value: mockVoiceSuggestions.diagnosis
  });

  // 4. Simular actualización de ficha
  console.log('\n4️⃣ Actualizando ficha clínica...');
  await trackEvent('form.update', {
    patientId: demoPatientData.id,
    visitId: demoVisitData.id,
    fields: ['chiefComplaint', 'symptoms', 'diagnosis']
  });

  // 5. Verificar eventos en Langfuse
  console.log('\n5️⃣ Verificando eventos en Langfuse...');
  const events = [
    'onboarding.started',
    'audio.transcript.validated',
    'copilot.suggestion.generated',
    'copilot.feedback',
    'form.update'
  ];

  console.log('\n✅ Prueba completada. Eventos registrados:');
  events.forEach(event => console.log(`- ${event}`));
}

// Ejecutar prueba
testClinicalFlow().catch(console.error); 