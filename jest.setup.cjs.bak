// Configurar variables de entorno para pruebas
process.env.VITE_LANGFUSE_PUBLIC_KEY = 'pk-lf-1234567890';
process.env.VITE_LANGFUSE_SECRET_KEY = 'sk-lf-1234567890';
process.env.VITE_LANGFUSE_HOST = 'https://cloud.langfuse.com';

// Mock de Langfuse para pruebas
jest.mock('langfuse-node', () => {
  return {
    Langfuse: jest.fn().mockImplementation(() => ({
      getTrace: jest.fn().mockResolvedValue({
        id: 'test-trace-id',
        metadata: {
          patientId: 'test-patient-id'
        },
        observations: [
          {
            name: 'form.update',
            input: {
              field: 'chiefComplaint',
              value: 'Dolor lumbar'
            },
            startTime: new Date().toISOString()
          },
          {
            name: 'form.update',
            input: {
              field: 'symptoms',
              value: 'Dolor agudo en zona lumbar'
            },
            startTime: new Date().toISOString()
          },
          {
            name: 'form.update',
            input: {
              field: 'diagnosis',
              value: 'Lumbalgia aguda'
            },
            startTime: new Date().toISOString()
          }
        ]
      }),
      getTraces: jest.fn().mockResolvedValue({
        data: [{
          id: 'test-trace-id',
          metadata: {
            patientId: 'test-patient-id'
          }
        }]
      })
    }))
  };
}); 