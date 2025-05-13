import { describe, it, expect, beforeAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import mcpRouter from '../mcp';

describe('MCP API Endpoints', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/mcp', mcpRouter);

  const validContext = {
    user_input: 'Paciente refiere dolor lumbar intenso',
    patient_state: {
      age: 42,
      sex: 'F',
      history: ['Dolor lumbar crónico', 'HTA controlada']
    },
    visit_metadata: {
      visit_id: 'c7d6f3e1-7a9b-4c1d-8a9e-3c6d7f3e1a9b',
      date: new Date().toISOString(),
      professional: 'mauricio@axonvalencia.es'
    },
    rules_and_constraints: [
      'Respetar confidencialidad del paciente',
      'No realizar diagnósticos sin evidencia'
    ],
    system_instructions: 'Actúa como un asistente clínico profesional.'
  };

  it('POST /api/mcp/invoke debe validar un contexto correcto', async () => {
    const response = await request(app)
      .post('/api/mcp/invoke')
      .send(validContext);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('POST /api/mcp/invoke debe rechazar un contexto inválido', async () => {
    const invalidContext = {
      ...validContext,
      patient_state: {
        ...validContext.patient_state,
        age: -1 // Edad inválida
      }
    };

    const response = await request(app)
      .post('/api/mcp/invoke')
      .send(invalidContext);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
}); 