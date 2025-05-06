# Model Context Protocol (MCP)

## 1. Introducción

El Model Context Protocol (MCP) es un sistema de enriquecimiento y validación de contexto clínico diseñado específicamente para AiDuxCare. Su función principal es transformar datos clínicos crudos en un contexto estructurado, validado y enriquecido que puede ser utilizado de manera segura por modelos de IA.

A diferencia de una API tradicional o un sistema de transcripción simple, el MCP:
- Valida y estructura datos según protocolos clínicos
- Enriquece el contexto con datos históricos y reglas clínicas
- Garantiza la trazabilidad y auditabilidad de las decisiones
- Mantiene un registro detallado de eventos en Langfuse

## 2. Arquitectura del MCP

```ascii
┌─────────────────┐
│  Frontend       │
│ /mcp/[visitId]  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐
│  MCP Endpoint   │───▶│   Langfuse      │
│ /api/mcp/invoke │    │   Monitoring    │
└────────┬────────┘    └─────────────────┘
         │
    ┌────┴─────┐
    ▼          ▼
┌─────────┐  ┌─────────────┐
│ Visit   │  │ Copilot     │
│ Service │  │ Context     │
└────┬────┘  │ Builder     │
     │       └──────┬──────┘
     │              │
     │        ┌────┴─────┐
     │        │ Context  │
     └───────▶│ Enricher │
              └────┬─────┘
                   │
         ┌────────┴───────┐
         ▼                ▼
┌─────────────┐  ┌─────────────┐
│    EMR      │  │  Global     │
│ Enrichment  │  │   Rules     │
└─────────────┘  └─────────────┘
```

### Componentes Principales

1. **CopilotContextBuilder**
   - Construye el contexto base
   - Aplica reglas predeterminadas
   - Valida estructura inicial

2. **ContextEnricher**
   - Coordina fuentes de enriquecimiento
   - Valida datos enriquecidos
   - Maneja errores de enriquecimiento

3. **EMREnrichmentSource**
   - Integra datos del historial clínico
   - Valida coherencia temporal
   - Enriquece con datos del paciente

4. **MCPContextSchema**
   - Define la estructura del contexto
   - Valida tipos y formatos
   - Garantiza integridad de datos

## 3. Estructura del Input/Output

### Input
```json
{
  "visit_id": "bc9e6679-7425-40de-944b-e07fc1f90ae7",
  "timestamp": "2024-03-21T10:00:00.000Z"
}
```

### Output
```json
{
  "user_input": "Consulta de seguimiento por migraña",
  "patient_state": {
    "age": 35,
    "sex": "F",
    "history": [
      "Migraña crónica desde 2023",
      "Respuesta parcial a topiramato"
    ]
  },
  "visit_metadata": {
    "visit_id": "bc9e6679-7425-40de-944b-e07fc1f90ae7",
    "date": "2024-03-15T09:30:00.000Z",
    "professional": "dra.garcia@axonvalencia.es"
  },
  "rules_and_constraints": [
    "Respetar confidencialidad del paciente",
    "No realizar diagnósticos sin evidencia",
    "Sugerir solo tratamientos basados en evidencia"
  ],
  "enrichment": {
    "emr": {
      "patient_data": {
        "allergies": ["AINEs"],
        "medications": ["Topiramato 25mg/día"]
      },
      "visit_history": [
        {
          "date": "2024-02-01T10:00:00.000Z",
          "summary": "Primera visita por cefalea"
        }
      ],
      "enriched_at": "2024-03-21T10:00:00.000Z"
    },
    "global_rules": {
      "global_rules": [
        "Mantener registro de decisiones clínicas",
        "Verificar alergias y contraindicaciones"
      ],
      "applied_at": "2024-03-21T10:00:00.000Z"
    }
  }
}
```

## 4. Validaciones y Seguridad

### Validación con Zod
```typescript
export const MCPContextSchema = z.object({
  user_input: z.string(),
  patient_state: PatientStateSchema,
  visit_metadata: VisitMetadataSchema,
  rules_and_constraints: z.array(z.string()),
  system_instructions: z.string(),
  enrichment: BaseEnrichmentSchema
});
```

### Validaciones Clave
- UUIDs válidos para `visit_id`
- Fechas en formato ISO 8601
- Emails válidos para profesionales
- Datos estructurados según schemas
- Coherencia temporal de visitas

## 5. Eventos en Langfuse

### Eventos Principales
1. **mcp_loaded**
   - Cuando se carga exitosamente un contexto
   - Incluye `visit_id` y timestamp
   - Registra tiempo de carga

2. **mcp_error**
   - Errores de validación o enriquecimiento
   - Incluye stack trace y contexto
   - Facilita debugging

3. **mcp_context_updated**
   - Cambios en el contexto
   - Registra diferencias
   - Mantiene historial de cambios

## 6. Casos de Uso del MCP

### Caso 1: Andreina - Migraña Crónica
- Contexto enriquecido con historial de cefaleas
- Validación de medicamentos previos
- Seguimiento de efectividad del tratamiento

### Caso 2: Juan - Temblor Esencial
- Integración de datos de evaluación neurológica
- Seguimiento de ajustes de propranolol
- Registro de factores agravantes

### Caso 3: María - Epilepsia Estable
- Control de niveles de levetiracetam
- Registro de últimas crisis
- Monitoreo de efectos secundarios

## 7. Errores Comunes y Respuestas

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation Error",
  "code": "VALIDATION_ERROR",
  "details": ["Invalid UUID format for visit_id"]
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Visita no encontrada",
  "code": "VISIT_NOT_FOUND"
}
```

### 500 Internal Error
```json
{
  "success": false,
  "error": "Error interno del servidor",
  "code": "INTERNAL_ERROR",
  "reference": "error_id_for_logs"
}
```

## 8. Extensibilidad

### Agregar Nueva Fuente de Datos
1. Implementar interfaz `EnrichmentSource`
2. Definir schema de validación
3. Registrar en `ContextEnricher`
4. Actualizar tests

```typescript
export interface EnrichmentSource {
  name: string;
  getEnrichmentData(context: MCPContext): Promise<Record<string, unknown>>;
}
```

### Adaptar a Nuevos Flujos
1. Extender `MCPContextSchema`
2. Agregar validaciones específicas
3. Implementar enriquecedor especializado
4. Actualizar frontend para nuevo flujo

## Referencias

- [Documentación de Zod](https://github.com/colinhacks/zod)
- [Langfuse Docs](https://langfuse.com/docs)
- [UUID v4 Spec](https://tools.ietf.org/html/rfc4122) 