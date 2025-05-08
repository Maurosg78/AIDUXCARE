# Resumen de Cambios para Memoria Adaptativa MCP

## Objetivo
Implementar un sistema de memoria contextual adaptativa por rol en el MCP v1.17 para optimizar el uso de tokens en consultas a LLMs sin comprometer la calidad clínica.

## Archivos Modificados

### 1. `mcp/context.py`
- Añadidas nuevas estructuras para memoria a corto y largo plazo
- Implementado sistema de configuración por rol
- Añadido mecanismo de filtrado de bloques relevantes
- Nuevos métodos para gestionar bloques de conversación:
  - `agregar_bloque_conversacion(actor, texto, prioridad)`
  - `filter_relevant_blocks(max_tokens)`
  - `_limitar_memoria()`
  - `_estimar_tokens(texto)`
  - `obtener_memoria_formateada()`

### 2. `mcp/agent_mcp.py`
- Modificado `procesar_mensaje()` para trabajar con bloques de memoria
- Actualizado `_ejecutar_ciclo_razonamiento()` para incluir bloques relevantes
- Implementado método `_determinar_prioridad_mensaje()` para clasificación automática
- Modificado `_decidir_siguiente_paso()` para considerar memoria
- Adaptado `_generar_respuesta_final()` para usar bloques filtrados
- Añadidos métodos de respuestas predeterminadas por rol:
  - `_generar_respuesta_predeterminada_profesional()`
  - `_generar_respuesta_predeterminada_paciente()`
  - `_generar_respuesta_predeterminada_admin()`

### 3. Nuevos Archivos
- `test_mcp_memory.py`: Pruebas para el sistema de memoria adaptativa
- `ejemplo_memoria_adaptativa.py`: Demostración simple del funcionamiento
- `MEMORIA_ADAPTATIVA.md`: Documentación detallada de la memoria
- Actualización de `README.md` con sección de memoria adaptativa

## Características Principales

### Bloques de Conversación
```python
{
  "id": 123,
  "timestamp": "2025-05-08T12:34:56.789Z",
  "actor": "patient",  # o professional, companion, system
  "priority": "high",  # o medium, low
  "text": "Me duele mucho la pierna desde hace días",
  "visita_id": "V20250508-001",
  "tokens_estimados": 15
}
```

### Configuración por Rol
```python
memory_config = {
    "health_professional": {
        "use_long_term_memory": True,
        "max_short_term_blocks": 20,
        "max_long_term_blocks": 100,
        "priority_threshold": "low"  # Incluir todos los niveles
    },
    "patient": {
        "use_long_term_memory": False,
        "max_short_term_blocks": 10,
        "max_long_term_blocks": 0,
        "priority_threshold": "medium"  # Solo alta y media
    },
    "admin_staff": {
        "use_long_term_memory": True,
        "max_short_term_blocks": 15,
        "max_long_term_blocks": 50,
        "priority_threshold": "medium"  # Solo alta y media
    }
}
```

### Filtrado Inteligente
El sistema filtra bloques basándose en:
- Prioridad del bloque
- Rol del usuario
- Límite máximo de tokens
- Tipo de actor (emisor del mensaje)

### Priorización Automática
Determina automáticamente la importancia de un mensaje según:
- Palabras clave médicas
- Patrones de emergencia o urgencia
- Longitud y contenido del mensaje

## Uso Básico

```python
# Crear contexto con rol específico
contexto = MCPContext(
    paciente_id="P001",
    paciente_nombre="Juan Pérez",
    visita_id="V001",
    profesional_email="fisio@aiduxcare.com",
    motivo_consulta="Dolor cervical persistente",
    user_role="health_professional"
)

# Añadir un bloque de conversación
contexto.agregar_bloque_conversacion(
    actor="patient",
    texto="Me duele mucho el cuello desde hace dos semanas.",
    prioridad="high"
)

# Obtener bloques relevantes para el prompt
bloques_relevantes = contexto.filter_relevant_blocks(max_tokens=300)

# Ver bloques filtrados
for bloque in bloques_relevantes:
    print(f"{bloque['actor'].upper()}: {bloque['text']}")
```

## Integración con Langraph
La arquitectura está diseñada para facilitar la futura migración a Langraph:
- Bloques como nodos
- Filtrado como edge con transformación
- Configuración por rol en state

## Beneficios

1. **Eficiencia**: Optimiza tokens sin sacrificar calidad
2. **Personalización**: Adapta contexto según el tipo de usuario
3. **Relevancia**: Prioriza información médicamente significativa
4. **Trazabilidad**: Mantiene registro completo para auditoría
5. **Preparación**: Facilita la migración a arquitecturas más complejas 