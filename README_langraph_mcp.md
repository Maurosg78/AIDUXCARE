# MCP con Langraph - AiDuxCare v1.19.0

## Descripción

Este módulo implementa el MCP (Model Context Protocol) de AiDuxCare utilizando el framework Langraph, proporcionando una arquitectura de agente basada en grafos con nodos modulares que gestionan el contexto, memoria y herramientas.

## Características principales

- **Arquitectura modular basada en grafos**: Flujo de trabajo definido como un grafo dirigido con nodos especializados.
- **Memoria contextual adaptativa por rol**: Filtrado y priorización de bloques según el rol del usuario.
- **Integración con el EMR**: Carga de datos de pacientes y visitas desde el sistema de historia clínica.
- **Herramientas clínicas por rol**: Ejecución de herramientas específicas según el rol del usuario.
- **Trazabilidad completa**: Seguimiento del estado en cada paso del proceso.

## Diagrama de flujo

```
[Entrada Usuario] → [Procesar Mensaje] → [Filtrar Memoria] → [Determinar Herramientas] 
                                                                      ↓
[Respuesta Final] ← [Generar Respuesta] ← [Ejecutar Herramientas] ← [Decisión]
```

## Componentes principales

- `MCPState`: Clase que mantiene el estado del agente durante la ejecución.
- `process_user_message`: Nodo para procesar mensajes del usuario.
- `filter_memory_blocks`: Nodo para filtrar bloques de memoria por rol y prioridad.
- `determine_tools_needed`: Nodo para determinar qué herramientas se necesitan.
- `execute_tools`: Nodo para ejecutar las herramientas requeridas.
- `generate_final_response`: Nodo para generar la respuesta final.

## Requisitos

- Python 3.9+
- LangChain 0.1.0+
- LangGraph 0.0.15+
- LangChain OpenAI 0.0.3+

## Uso básico

```python
from langchain_core.messages import HumanMessage
from langraph_mcp import build_mcp_graph, initialize_context, run_graph

# Crear grafo MCP
mcp_graph = build_mcp_graph(model_name="gpt-3.5-turbo")

# Inicializar contexto con visita
context = initialize_context(
    visit_id="VISITA123", 
    user_role="health_professional"
)

# Crear mensaje
message = HumanMessage(content="El paciente refiere dolor cervical")

# Ejecutar grafo
result = run_graph(mcp_graph, context, [message])

# Obtener respuesta
response = result.messages[-1].content
print(f"Respuesta: {response}")
```

## Pruebas

Para ejecutar las pruebas básicas:

```bash
python test_langraph_mcp.py
```

## Configuración por rol

El sistema se adapta automáticamente según el rol del usuario:

- **Profesional de salud**: Acceso completo a herramientas de diagnóstico, riesgo legal y visitas anteriores.
- **Paciente**: Acceso limitado a información de visitas anteriores.
- **Personal administrativo**: Acceso a herramientas de riesgo legal y visitas anteriores.

## Priorización de memoria

El sistema clasifica automáticamente los bloques de memoria en:

- **Alta prioridad**: Siempre incluidos, independientemente del límite de tokens.
- **Media prioridad**: Incluidos según el rol y el espacio disponible.
- **Baja prioridad**: Solo incluidos para profesionales de salud si hay espacio.

## Migración desde versiones anteriores

Esta implementación es parte de la migración desde la versión v1.18.0 a v1.19.0, reemplazando la arquitectura plana anterior por un sistema basado en grafos. Mantiene la compatibilidad con las interfaces existentes mientras aprovecha las ventajas de Langraph.

## Próximos pasos

- Integración con vectores de embeddings para búsqueda semántica en la memoria.
- Implementación de nodos paralelos para procesamiento simultáneo.
- Visualización en tiempo real del estado del grafo.
- Optimización del rendimiento para grandes volúmenes de datos clínicos. 