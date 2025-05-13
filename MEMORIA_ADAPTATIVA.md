# Sistema de Memoria Adaptativa por Rol - MCP v1.17

## Introducción

Este documento detalla la implementación del sistema de memoria contextual adaptativa en AiDuxCare v1.17, diseñado para optimizar el uso de tokens en consultas a modelos de IA mientras se mantiene un nivel alto de precisión clínica y trazabilidad.

## Objetivos

1. **Reducción de costos**: Minimizar tokens consumidos sin comprometer calidad
2. **Personalización por rol**: Adaptar el contexto según el tipo de usuario
3. **Relevancia clínica**: Priorizar información médicamente significativa
4. **Trazabilidad completa**: Mantener registro auditable de todas las interacciones
5. **Preparación para Langraph**: Facilitar la futura migración

## Arquitectura

### Componentes Principales

1. **Bloques de Conversación**

Unidades básicas de almacenamiento de la conversación:

```python
{
  "id": 123,  # Identificador único
  "timestamp": "2025-05-08T12:34:56.789Z",  # Momento de creación
  "actor": "patient",  # Origen del mensaje
  "priority": "high",  # Nivel de importancia
  "text": "Me duele mucho la pierna desde hace días",  # Contenido
  "visita_id": "V20250508-001",  # Referencia a la visita
  "tokens_estimados": 15  # Estimación de tokens consumidos
}
```

2. **Sistemas de Memoria**

- **Memoria a Corto Plazo** (`short_term_memory`): Conserva los bloques de la conversación actual
- **Memoria a Largo Plazo** (`long_term_memory`): Almacena bloques importantes para referencia futura

3. **Filtrado Inteligente**

Sistema que selecciona qué bloques se incluyen en el contexto del LLM según:
- Prioridad del bloque
- Rol de usuario
- Límite de tokens configurado
- Relevancia clínica

### Configuración por Rol

Cada rol de usuario tiene una configuración específica:

```python
memory_config = {
    "health_professional": {
        "use_long_term_memory": True,
        "max_short_term_blocks": 20,
        "max_long_term_blocks": 100,
        "priority_threshold": "low"  # Incluir todos los niveles de prioridad
    },
    "patient": {
        "use_long_term_memory": False,
        "max_short_term_blocks": 10,
        "max_long_term_blocks": 0,
        "priority_threshold": "medium"  # Solo incluir prioridad alta y media
    },
    "admin_staff": {
        "use_long_term_memory": True,
        "max_short_term_blocks": 15,
        "max_long_term_blocks": 50,
        "priority_threshold": "medium"  # Solo incluir prioridad alta y media
    }
}
```

## Flujo de Funcionamiento

1. **Ingreso de Mensaje**
   - El mensaje se clasifica según su actor, prioridad y contenido
   - Se estiman los tokens que consume
   - Se almacena en `short_term_memory` y posiblemente en `long_term_memory`

2. **Preparación del Contexto**
   - Se invocar `filter_relevant_blocks(max_tokens)` antes de consultar al LLM
   - El sistema selecciona bloques respetando configuración del rol
   - Se priorizan bloques de alta prioridad y actores relevantes

3. **Optimización Continua**
   - La memoria se limpia automáticamente para no exceder límites configurados
   - Se preservan siempre los bloques de alta prioridad o clínicamente relevantes

## Determinación de Prioridad

La prioridad de los mensajes se determina automáticamente mediante:

- **Palabras clave**: Detección de términos clínicamente relevantes
- **Patrones**: Expresiones regulares para identificar situaciones importantes
- **Heurísticas**: Longitud del mensaje, actor, contenido clínico

Ejemplos de alta prioridad:
- Síntomas graves o intensos
- Terminología médica específica
- Información sobre alergias o efectos adversos
- Mediciones numéricas críticas

## Integración con el Agente MCP

El agente MCP utiliza la memoria adaptativa:

1. Al recibir un mensaje:
   ```python
   def procesar_mensaje(self, mensaje: str) -> str:
       # Registrar mensaje entrante
       self.contexto.agregar_mensaje_usuario(mensaje)
       
       # Añadir a la memoria como bloque
       self.contexto.agregar_bloque_conversacion(
           actor="professional",
           texto=mensaje,
           prioridad=self._determinar_prioridad_mensaje(mensaje)
       )
       
       # Continuar procesamiento
       return self._ejecutar_ciclo_razonamiento(mensaje)
   ```

2. Al generar respuestas:
   ```python
   def _generar_respuesta_final(self, razonamiento, bloques_memoria):
       # Construir prompt con bloques de memoria relevantes
       contexto_memoria = "\n".join([
           f"{bloque['actor'].upper()}: {bloque['text']}"
           for bloque in bloques_memoria
       ])
       
       prompt = f"""
       Basado en el siguiente razonamiento y contexto de memoria...
       CONTEXTO DE MEMORIA:
       {contexto_memoria}
       """
       
       # Generar respuesta
       return self.simulacion_llm(prompt)
   ```

## Preparación para Langraph

La arquitectura está diseñada para facilitar la migración a Langraph:

1. **Nodos de Memoria**:
   - Cada bloque puede convertirse en un nodo
   - La memoria corta y larga serían colecciones de nodos

2. **Edges de Filtrado**:
   - El método `filter_relevant_blocks` se convertiría en un edge con transformación
   - La priorización sería una función de transformación en el edge

3. **State y Context**:
   - La configuración por rol se mantendría en el state del grafo
   - La selección de herramientas se adaptaría según el contexto filtrado

## Ejemplos de Uso

### Registro de Conversación Clínica

```python
# Iniciar contexto para profesional de salud
contexto = MCPContext(
    paciente_id="P001",
    paciente_nombre="Juan Pérez",
    visita_id="V20250508-001",
    profesional_email="fisio@aiduxcare.com",
    motivo_consulta="Dolor cervical persistente",
    user_role="health_professional"
)

# Registrar interacción paciente-profesional
contexto.agregar_bloque_conversacion(
    actor="patient",
    texto="Me duele mucho el cuello desde hace dos semanas, sobre todo al girar a la derecha.",
    prioridad="high"
)

contexto.agregar_bloque_conversacion(
    actor="professional", 
    texto="¿Siente hormigueo o pérdida de fuerza en los brazos?",
    prioridad="high"
)

contexto.agregar_bloque_conversacion(
    actor="patient",
    texto="Sí, a veces noto hormigueo en el brazo derecho y la mano.",
    prioridad="high"
)

# Obtener contexto filtrado para LLM
bloques_relevantes = contexto.filter_relevant_blocks(max_tokens=300)
```

### Análisis de Optimización

```python
# Verificar métricas de uso de tokens
print(f"Tokens utilizados: {contexto.metricas['tokens_utilizados']}")
print(f"Tokens en memoria: {contexto.metricas['tokens_memoria']}")
print(f"Ratio de optimización: {contexto.metricas['tokens_utilizados'] / contexto.metricas['tokens_memoria']:.2f}")

# Estadísticas de bloques filtrados
alta_prioridad = sum(1 for b in bloques_relevantes if b["priority"] == "high")
tokens_filtrados = sum(b["tokens_estimados"] for b in bloques_relevantes)

print(f"Bloques de alta prioridad: {alta_prioridad}/{len(bloques_relevantes)}")
print(f"Tokens incluidos en prompt: {tokens_filtrados}/300")
```

## Ventajas del Sistema

1. **Eficiencia económica**: Optimización de tokens con un ahorro estimado del 40-60%
2. **Personalización**: Experiencia adaptada a cada tipo de usuario
3. **Precisión**: Priorización de información médicamente relevante
4. **Seguridad**: Control de acceso a datos según rol
5. **Escalabilidad**: Diseño preparado para migrar a arquitecturas más complejas

## Limitaciones y Consideraciones

- La estimación de tokens es aproximada (4 caracteres ≈ 1 token)
- La priorización automática puede requerir ajustes según especialidad médica
- El sistema prioriza texto sobre imágenes o archivos adjuntos
- Se requiere una fase posterior para integración con bases de conocimiento vectoriales

## Pruebas y Validación

El sistema ha sido validado mediante el script `test_mcp_memory.py` que incluye:
- Simulación de conversaciones con diferentes roles
- Verificación de asignación correcta de prioridades
- Comprobación de límites de memoria según rol
- Tests de optimización de tokens en diferentes escenarios 