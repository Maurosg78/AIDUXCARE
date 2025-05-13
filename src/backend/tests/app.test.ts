/**
 * Pruebas para el servidor backend de AiDuxCare
 */

import request from 'supertest';
import { app } from '../app';

describe('AiDuxCare Backend API', () => {
  // Pruebas para el endpoint raíz
  describe('GET /', () => {
    it('debería devolver la información básica del API', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'online');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body.endpoints).toHaveProperty('fhir');
      expect(response.body.endpoints).toHaveProperty('mcp');
      expect(response.body.endpoints).toHaveProperty('export');
    });
  });
  
  // Pruebas para las rutas FHIR
  describe('API FHIR', () => {
    it('debería obtener una lista de pacientes', async () => {
      const response = await request(app).get('/api/fhir/Patient');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('resourceType', 'Bundle');
      expect(response.body).toHaveProperty('entry');
      expect(Array.isArray(response.body.entry)).toBe(true);
    });
    
    it('debería devolver un error para un tipo de recurso inválido', async () => {
      const response = await request(app).get('/api/fhir/InvalidResource');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });
  
  // Pruebas para las rutas MCP
  describe('API MCP', () => {
    it('debería obtener una lista de pacientes', async () => {
      const response = await request(app).get('/api/mcp/patients');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
    
    it('debería obtener el historial de visitas de un paciente', async () => {
      const response = await request(app).get('/api/mcp/patients/pat-001/visits');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
    
    it('debería obtener la información de contexto del MCP', async () => {
      const response = await request(app).get('/api/mcp/context');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('instalacion');
      expect(response.body.data).toHaveProperty('modulos_activos');
      expect(response.body.data).toHaveProperty('configuracion');
    });
    
    it('debería actualizar la información de contexto del MCP', async () => {
      const contextData = {
        configuracion: {
          idioma_defecto: 'en',
          tema: 'dark'
        }
      };
      
      const response = await request(app)
        .post('/api/mcp/context')
        .send(contextData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('configuracion');
      expect(response.body.data.configuracion).toHaveProperty('idioma_defecto', 'en');
      expect(response.body.data.configuracion).toHaveProperty('tema', 'dark');
    });
  });
  
  // Pruebas para las rutas de exportación
  describe('API Export', () => {
    it('debería exportar datos de pacientes en formato JSON', async () => {
      const response = await request(app).get('/api/export/patients');
      
      expect(response.status).toBe(200);
      expect(response.header['content-type']).toContain('application/json');
      expect(response.header['content-disposition']).toContain('attachment');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('count');
    });
    
    it('debería exportar datos en formato CSV', async () => {
      const response = await request(app)
        .post('/api/export/csv')
        .send({ entity: 'patients' });
      
      expect(response.status).toBe(200);
      expect(response.header['content-type']).toContain('text/csv');
      expect(response.header['content-disposition']).toContain('attachment');
    });
    
    it('debería exportar un reporte en formato PDF', async () => {
      const response = await request(app)
        .get('/api/export/pdf')
        .query({ type: 'summary' });
      
      expect(response.status).toBe(200);
      expect(response.header['content-type']).toEqual('application/pdf');
      expect(response.header['content-disposition']).toContain('attachment');
      expect(response.header['content-length']).toBeDefined();
    });
    
    it('debería devolver un error cuando se solicita un PDF sin especificar el tipo', async () => {
      const response = await request(app).get('/api/export/pdf');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 