# Sistema de Sugerencias Clínicas del Copiloto IA

## Descripción General

El sistema de sugerencias clínicas del copiloto IA es una característica que proporciona recomendaciones basadas en evidencia científica para apoyar la toma de decisiones clínicas. El sistema integra búsquedas en PubMed para respaldar las sugerencias con literatura médica relevante.

## Componentes Principales

### 1. API de Búsqueda PubMed (`/api/clinical-search/pubmed`)

Endpoint que permite buscar artículos científicos relevantes en PubMed:

- **Método**: GET
- **Parámetros**:
  - `q`: Término de búsqueda
- **Respuesta**:
  ```typescript
  {
    results: Array<{
      title: string;
      year: number;
      source: string;
      url: string;
      abstract?: string;
    }>
  }
  ```

### 2. Hook useCopilot

Hook de React que maneja la lógica de análisis y sugerencias:

```typescript
interface PubMedReference {
  title: string;
  year: number;
  source: string;
  url: string;
  abstract?: string;
}

interface StructuredSuggestion {
  field: string;
  value: string;
  source: "copilot";
  reference?: PubMedReference;
}

// Uso
const { analyzeVoiceNotes, isLoading, error } = useCopilot();
```

### 3. Componente FieldWithSuggestion

Componente UI que muestra campos con sugerencias y referencias:

```typescript
interface FieldWithSuggestionProps {
  field: string;
  value: string;
  suggestion?: StructuredSuggestion;
  onAcceptSuggestion: (suggestion: StructuredSuggestion) => void;
  onRejectSuggestion: (suggestion: StructuredSuggestion) => void;
}
```

## Flujo de Trabajo

1. **Análisis de Notas**:
   - El sistema analiza las notas de voz o texto
   - Identifica términos clínicos relevantes
   - Genera sugerencias estructuradas

2. **Búsqueda de Referencias**:
   - Para cada sugerencia relevante, se busca en PubMed
   - Se obtienen los artículos más relevantes
   - Se extraen metadatos (título, año, revista, etc.)

3. **Presentación al Usuario**:
   - Se muestran las sugerencias con sus referencias
   - El usuario puede aceptar o rechazar cada sugerencia
   - Se registran las interacciones para análisis

## Seguimiento y Métricas

El sistema registra eventos para análisis de impacto:

```typescript
{
  name: 'copilot.suggestions',
  payload: {
    suggestionsCount: number;
    hasReferences: boolean;
    referencesUrls: string;
  }
}
```

## Configuración

Para habilitar la funcionalidad, se requiere:

1. API Key de PubMed en variables de entorno:
   ```
   PUBMED_API_KEY=tu_api_key
   ```

2. Configuración de Langfuse para seguimiento:
   ```
   VITE_LANGFUSE_PUBLIC_KEY=tu_public_key
   VITE_LANGFUSE_SECRET_KEY=tu_secret_key
   VITE_LANGFUSE_HOST=tu_host
   ```

## Mejores Prácticas

1. **Búsquedas Eficientes**:
   - Limitar a 3 resultados por búsqueda
   - Usar términos específicos
   - Priorizar artículos recientes

2. **Presentación de Referencias**:
   - Mostrar título y año
   - Proporcionar enlace al artículo
   - Incluir resumen cuando sea relevante

3. **Manejo de Errores**:
   - Fallback a sugerencias sin referencias
   - Logging de errores de búsqueda
   - Feedback al usuario

## Limitaciones Actuales

1. Búsqueda limitada a 3 artículos por consulta
2. Parsing simple de XML de PubMed
3. Sin caché de resultados
4. Sin filtros avanzados de búsqueda

## Próximas Mejoras

1. Implementar caché de resultados
2. Añadir filtros por fecha y tipo de artículo
3. Mejorar el parsing de XML
4. Integrar más fuentes de evidencia 